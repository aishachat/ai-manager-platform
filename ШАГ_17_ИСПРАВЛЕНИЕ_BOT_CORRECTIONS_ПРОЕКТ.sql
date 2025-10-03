-- =====================================================
-- ШАГ 17: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ BOT_CORRECTIONS (ПРОЕКТ)
-- =====================================================
-- Таблица: корректировки бота для проекта
-- Логика: 1 проект = 1 набор корректировок бота (командная работа)
-- Принцип: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.bot_corrections ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "bot_corrections_project_access" ON public.bot_corrections;
DROP POLICY IF EXISTS "bot_corrections_owner_access" ON public.bot_corrections;
DROP POLICY IF EXISTS "bot_corrections_user_access" ON public.bot_corrections;
DROP POLICY IF EXISTS "bot_corrections_combined_access" ON public.bot_corrections;

-- 3. СОЗДАЕМ НОВУЮ ПОЛИТИКУ (на основе project_id)
CREATE POLICY "bot_corrections_project_access" ON public.bot_corrections
    FOR ALL USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    );

-- 4. ПРЕДОСТАВЛЯЕМ ПРАВА
GRANT ALL ON public.bot_corrections TO authenticated;
GRANT ALL ON public.bot_corrections TO service_role;

-- 5. ПРОВЕРЯЕМ СТАТУС RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'bot_corrections') as policies_count
FROM pg_tables 
WHERE tablename = 'bot_corrections';

-- 6. ПРОВЕРЯЕМ ПОЛИТИКИ
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'bot_corrections';

-- 7. ПРОВЕРЯЕМ ДАННЫЕ
SELECT 
    'Всего корректировок бота' as metric,
    count(*) as value
FROM public.bot_corrections
UNION ALL
SELECT 
    'Уникальных проектов' as metric,
    count(DISTINCT project_id) as value
FROM public.bot_corrections
UNION ALL
SELECT 
    'Уникальных пользователей' as metric,
    count(DISTINCT user_id) as value
FROM public.bot_corrections
UNION ALL
SELECT 
    'Корректировок с project_id = null' as metric,
    count(*) as value
FROM public.bot_corrections
WHERE project_id IS NULL
UNION ALL
SELECT 
    'Корректировок с user_id = null' as metric,
    count(*) as value
FROM public.bot_corrections
WHERE user_id IS NULL;

-- 8. ПРОВЕРЯЕМ СВЯЗИ С ПРОЕКТАМИ
SELECT 
    'Проектов с корректировками бота' as metric,
    count(DISTINCT p.id) as value
FROM public.projects p
INNER JOIN public.bot_corrections bc ON p.id = bc.project_id
UNION ALL
SELECT 
    'Проектов без корректировок бота' as metric,
    count(*) as value
FROM public.projects p
LEFT JOIN public.bot_corrections bc ON p.id = bc.project_id
WHERE bc.project_id IS NULL;

-- 9. ПРОВЕРЯЕМ СВЯЗИ С ПОЛЬЗОВАТЕЛЯМИ (с приведением типов)
SELECT 
    'Пользователей с корректировками бота' as metric,
    count(DISTINCT u.id) as value
FROM public.users u
INNER JOIN public.bot_corrections bc ON u.id::text = bc.user_id
UNION ALL
SELECT 
    'Пользователей без корректировок бота' as metric,
    count(*) as value
FROM public.users u
LEFT JOIN public.bot_corrections bc ON u.id::text = bc.user_id
WHERE bc.user_id IS NULL;

-- 10. ПРОВЕРЯЕМ СТАТИСТИКУ
SELECT 
    'Среднее корректировок на проект' as metric,
    CASE 
        WHEN count(DISTINCT project_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT project_id), 2)::text
        ELSE '0' 
    END as value
FROM public.bot_corrections
WHERE project_id IS NOT NULL
UNION ALL
SELECT 
    'Среднее корректировок на пользователя' as metric,
    CASE 
        WHEN count(DISTINCT user_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT user_id), 2)::text
        ELSE '0' 
    END as value
FROM public.bot_corrections
WHERE user_id IS NOT NULL;

-- 11. ПРОВЕРЯЕМ ПОСЛЕДНИЕ КОРРЕКТИРОВКИ
SELECT 
    'Последние корректировки' as metric,
    MAX(created_at)::text as value
FROM public.bot_corrections
UNION ALL
SELECT 
    'Первые корректировки' as metric,
    MIN(created_at)::text as value
FROM public.bot_corrections;

-- 12. ТЕСТ ИЗОЛЯЦИИ (должен показать только записи текущего пользователя)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ' as test_name,
    count(*) as visible_records,
    'Пользователь должен видеть только корректировки бота своих проектов' as expected
FROM public.bot_corrections;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политика создана, права предоставлены
-- ЛОГИКА: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
-- ПРИНЦИП: Командная работа - все участники проекта видят корректировки бота
-- СЛЕДУЮЩИЙ ШАГ: knowledge_sources
-- =====================================================
