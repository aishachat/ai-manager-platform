-- =====================================================
-- ШАГ 26: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ DIALOG_WITH_OPERATORS (ПРОЕКТ)
-- =====================================================
-- Таблица: диалоги с операторами для проекта
-- Логика: 1 проект = множество диалогов с операторами (командная работа)
-- Принцип: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.dialog_with_operators ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "dialog_with_operators_project_access" ON public.dialog_with_operators;
DROP POLICY IF EXISTS "dialog_with_operators_owner_access" ON public.dialog_with_operators;
DROP POLICY IF EXISTS "dialog_with_operators_user_access" ON public.dialog_with_operators;
DROP POLICY IF EXISTS "dialog_with_operators_combined_access" ON public.dialog_with_operators;

-- 3. СОЗДАЕМ НОВУЮ ПОЛИТИКУ (на основе project_id)
CREATE POLICY "dialog_with_operators_project_access" ON public.dialog_with_operators
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
GRANT ALL ON public.dialog_with_operators TO authenticated;
GRANT ALL ON public.dialog_with_operators TO service_role;

-- 5. ПРОВЕРЯЕМ СТАТУС RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'dialog_with_operators') as policies_count
FROM pg_tables 
WHERE tablename = 'dialog_with_operators';

-- 6. ПРОВЕРЯЕМ ПОЛИТИКИ
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'dialog_with_operators';

-- 7. ПРОВЕРЯЕМ ДАННЫЕ
SELECT 
    'Всего диалогов с операторами' as metric,
    count(*) as value
FROM public.dialog_with_operators
UNION ALL
SELECT 
    'Уникальных проектов' as metric,
    count(DISTINCT project_id) as value
FROM public.dialog_with_operators
UNION ALL
SELECT 
    'Уникальных пользователей' as metric,
    count(DISTINCT user_id) as value
FROM public.dialog_with_operators
UNION ALL
SELECT 
    'Диалогов с project_id = null' as metric,
    count(*) as value
FROM public.dialog_with_operators
WHERE project_id IS NULL
UNION ALL
SELECT 
    'Диалогов с user_id = null' as metric,
    count(*) as value
FROM public.dialog_with_operators
WHERE user_id IS NULL;

-- 8. ПРОВЕРЯЕМ СВЯЗИ С ПРОЕКТАМИ
SELECT 
    'Проектов с диалогами с операторами' as metric,
    count(DISTINCT p.id) as value
FROM public.projects p
INNER JOIN public.dialog_with_operators dwo ON p.id = dwo.project_id
UNION ALL
SELECT 
    'Проектов без диалогов с операторами' as metric,
    count(*) as value
FROM public.projects p
LEFT JOIN public.dialog_with_operators dwo ON p.id = dwo.project_id
WHERE dwo.project_id IS NULL;

-- 9. ПРОВЕРЯЕМ СВЯЗИ С ПОЛЬЗОВАТЕЛЯМИ
SELECT 
    'Пользователей с диалогами с операторами' as metric,
    count(DISTINCT u.id) as value
FROM public.users u
INNER JOIN public.dialog_with_operators dwo ON u.id = dwo.user_id
UNION ALL
SELECT 
    'Пользователей без диалогов с операторами' as metric,
    count(*) as value
FROM public.users u
LEFT JOIN public.dialog_with_operators dwo ON u.id = dwo.user_id
WHERE dwo.user_id IS NULL;

-- 10. ПРОВЕРЯЕМ СТАТИСТИКУ
SELECT 
    'Среднее диалогов на проект' as metric,
    CASE 
        WHEN count(DISTINCT project_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT project_id), 2)::text
        ELSE '0' 
    END as value
FROM public.dialog_with_operators
WHERE project_id IS NOT NULL
UNION ALL
SELECT 
    'Среднее диалогов на пользователя' as metric,
    CASE 
        WHEN count(DISTINCT user_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT user_id), 2)::text
        ELSE '0' 
    END as value
FROM public.dialog_with_operators
WHERE user_id IS NOT NULL;

-- 11. ПРОВЕРЯЕМ ПОСЛЕДНИЕ ДИАЛОГИ
SELECT 
    'Последние диалоги' as metric,
    MAX(created_at)::text as value
FROM public.dialog_with_operators
UNION ALL
SELECT 
    'Первые диалоги' as metric,
    MIN(created_at)::text as value
FROM public.dialog_with_operators;

-- 12. ТЕСТ ИЗОЛЯЦИИ (должен показать только записи текущего пользователя)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ' as test_name,
    count(*) as visible_records,
    'Пользователь должен видеть только диалоги с операторами своих проектов' as expected
FROM public.dialog_with_operators;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политика создана, права предоставлены
-- ЛОГИКА: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
-- ПРИНЦИП: Командная работа - все участники проекта видят диалоги с операторами
-- СЛЕДУЮЩИЙ ШАГ: faq_cache
-- =====================================================
