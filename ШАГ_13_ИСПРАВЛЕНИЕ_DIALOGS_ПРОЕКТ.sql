-- =====================================================
-- ШАГ 13: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ DIALOGS (ПРОЕКТ)
-- =====================================================
-- Таблица: диалоги проекта с операторами
-- Логика: 1 проект = множество диалогов (командная работа)
-- Принцип: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.dialogs ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "dialogs_project_access" ON public.dialogs;
DROP POLICY IF EXISTS "dialogs_owner_access" ON public.dialogs;
DROP POLICY IF EXISTS "dialogs_user_access" ON public.dialogs;
DROP POLICY IF EXISTS "dialogs_operator_access" ON public.dialogs;
DROP POLICY IF EXISTS "dialogs_combined_access" ON public.dialogs;

-- 3. СОЗДАЕМ НОВУЮ ПОЛИТИКУ (на основе project_id)
CREATE POLICY "dialogs_project_access" ON public.dialogs
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
GRANT ALL ON public.dialogs TO authenticated;
GRANT ALL ON public.dialogs TO service_role;

-- 5. ПРОВЕРЯЕМ СТАТУС RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'dialogs') as policies_count
FROM pg_tables 
WHERE tablename = 'dialogs';

-- 6. ПРОВЕРЯЕМ ПОЛИТИКИ
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'dialogs';

-- 7. ПРОВЕРЯЕМ ДАННЫЕ
SELECT 
    'Всего диалогов' as metric,
    count(*) as value
FROM public.dialogs
UNION ALL
SELECT 
    'Уникальных проектов' as metric,
    count(DISTINCT project_id) as value
FROM public.dialogs
UNION ALL
SELECT 
    'Уникальных пользователей' as metric,
    count(DISTINCT user_id) as value
FROM public.dialogs
UNION ALL
SELECT 
    'Диалогов с project_id = null' as metric,
    count(*) as value
FROM public.dialogs
WHERE project_id IS NULL
UNION ALL
SELECT 
    'Диалогов с user_id = null' as metric,
    count(*) as value
FROM public.dialogs
WHERE user_id IS NULL
UNION ALL
SELECT 
    'Активных диалогов' as metric,
    count(*) as value
FROM public.dialogs
WHERE status = 'active';

-- 8. ПРОВЕРЯЕМ СВЯЗИ С ПРОЕКТАМИ
SELECT 
    'Проектов с диалогами' as metric,
    count(DISTINCT p.id) as value
FROM public.projects p
INNER JOIN public.dialogs d ON p.id = d.project_id
UNION ALL
SELECT 
    'Проектов без диалогов' as metric,
    count(*) as value
FROM public.projects p
LEFT JOIN public.dialogs d ON p.id = d.project_id
WHERE d.project_id IS NULL;

-- 9. ПРОВЕРЯЕМ СВЯЗИ С ПОЛЬЗОВАТЕЛЯМИ
SELECT 
    'Пользователей с диалогами' as metric,
    count(DISTINCT u.id) as value
FROM public.users u
INNER JOIN public.dialogs d ON u.id = d.user_id
UNION ALL
SELECT 
    'Пользователей без диалогов' as metric,
    count(*) as value
FROM public.users u
LEFT JOIN public.dialogs d ON u.id = d.user_id
WHERE d.user_id IS NULL;

-- 10. ПРОВЕРЯЕМ СТАТИСТИКУ
SELECT 
    'Среднее диалогов на проект' as metric,
    CASE 
        WHEN count(DISTINCT project_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT project_id), 2)::text
        ELSE '0' 
    END as value
FROM public.dialogs
WHERE project_id IS NOT NULL
UNION ALL
SELECT 
    'Среднее диалогов на пользователя' as metric,
    CASE 
        WHEN count(DISTINCT user_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT user_id), 2)::text
        ELSE '0' 
    END as value
FROM public.dialogs
WHERE user_id IS NOT NULL;

-- 11. ПРОВЕРЯЕМ ПОСЛЕДНИЕ ДИАЛОГИ
SELECT 
    'Последний диалог' as metric,
    MAX(created_at)::text as value
FROM public.dialogs
UNION ALL
SELECT 
    'Первый диалог' as metric,
    MIN(created_at)::text as value
FROM public.dialogs;

-- 12. ТЕСТ ИЗОЛЯЦИИ (должен показать только записи текущего пользователя)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ' as test_name,
    count(*) as visible_records,
    'Пользователь должен видеть только диалоги своих проектов' as expected
FROM public.dialogs;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политика создана, права предоставлены
-- ЛОГИКА: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
-- ПРИНЦИП: Командная работа - все участники проекта видят диалоги проекта
-- СЛЕДУЮЩИЙ ШАГ: chat_messages
-- =====================================================
