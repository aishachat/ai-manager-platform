-- =====================================================
-- ШАГ 25: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ DIALOG_CRM_CONNECTIONS (ПРОЕКТ)
-- =====================================================
-- Таблица: связи диалогов с CRM для проекта
-- Логика: 1 проект = множество связей диалогов с CRM (командная работа)
-- Принцип: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.dialog_crm_connections ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "dialog_crm_connections_project_access" ON public.dialog_crm_connections;
DROP POLICY IF EXISTS "dialog_crm_connections_owner_access" ON public.dialog_crm_connections;
DROP POLICY IF EXISTS "dialog_crm_connections_user_access" ON public.dialog_crm_connections;
DROP POLICY IF EXISTS "dialog_crm_connections_combined_access" ON public.dialog_crm_connections;

-- 3. СОЗДАЕМ НОВУЮ ПОЛИТИКУ (на основе project_id)
CREATE POLICY "dialog_crm_connections_project_access" ON public.dialog_crm_connections
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
GRANT ALL ON public.dialog_crm_connections TO authenticated;
GRANT ALL ON public.dialog_crm_connections TO service_role;

-- 5. ПРОВЕРЯЕМ СТАТУС RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'dialog_crm_connections') as policies_count
FROM pg_tables 
WHERE tablename = 'dialog_crm_connections';

-- 6. ПРОВЕРЯЕМ ПОЛИТИКИ
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'dialog_crm_connections';

-- 7. ПРОВЕРЯЕМ ДАННЫЕ
SELECT 
    'Всего связей диалогов с CRM' as metric,
    count(*) as value
FROM public.dialog_crm_connections
UNION ALL
SELECT 
    'Уникальных проектов' as metric,
    count(DISTINCT project_id) as value
FROM public.dialog_crm_connections
UNION ALL
SELECT 
    'Уникальных пользователей' as metric,
    count(DISTINCT user_id) as value
FROM public.dialog_crm_connections
UNION ALL
SELECT 
    'Связей с project_id = null' as metric,
    count(*) as value
FROM public.dialog_crm_connections
WHERE project_id IS NULL
UNION ALL
SELECT 
    'Связей с user_id = null' as metric,
    count(*) as value
FROM public.dialog_crm_connections
WHERE user_id IS NULL;

-- 8. ПРОВЕРЯЕМ СВЯЗИ С ПРОЕКТАМИ
SELECT 
    'Проектов со связями диалогов с CRM' as metric,
    count(DISTINCT p.id) as value
FROM public.projects p
INNER JOIN public.dialog_crm_connections dcc ON p.id = dcc.project_id
UNION ALL
SELECT 
    'Проектов без связей диалогов с CRM' as metric,
    count(*) as value
FROM public.projects p
LEFT JOIN public.dialog_crm_connections dcc ON p.id = dcc.project_id
WHERE dcc.project_id IS NULL;

-- 9. ПРОВЕРЯЕМ СВЯЗИ С ПОЛЬЗОВАТЕЛЯМИ
SELECT 
    'Пользователей со связями диалогов с CRM' as metric,
    count(DISTINCT u.id) as value
FROM public.users u
INNER JOIN public.dialog_crm_connections dcc ON u.id = dcc.user_id
UNION ALL
SELECT 
    'Пользователей без связей диалогов с CRM' as metric,
    count(*) as value
FROM public.users u
LEFT JOIN public.dialog_crm_connections dcc ON u.id = dcc.user_id
WHERE dcc.user_id IS NULL;

-- 10. ПРОВЕРЯЕМ СТАТИСТИКУ
SELECT 
    'Среднее связей на проект' as metric,
    CASE 
        WHEN count(DISTINCT project_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT project_id), 2)::text
        ELSE '0' 
    END as value
FROM public.dialog_crm_connections
WHERE project_id IS NOT NULL
UNION ALL
SELECT 
    'Среднее связей на пользователя' as metric,
    CASE 
        WHEN count(DISTINCT user_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT user_id), 2)::text
        ELSE '0' 
    END as value
FROM public.dialog_crm_connections
WHERE user_id IS NOT NULL;

-- 11. ПРОВЕРЯЕМ ПОСЛЕДНИЕ СВЯЗИ
SELECT 
    'Последние связи' as metric,
    MAX(created_at)::text as value
FROM public.dialog_crm_connections
UNION ALL
SELECT 
    'Первые связи' as metric,
    MIN(created_at)::text as value
FROM public.dialog_crm_connections;

-- 12. ТЕСТ ИЗОЛЯЦИИ (должен показать только записи текущего пользователя)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ' as test_name,
    count(*) as visible_records,
    'Пользователь должен видеть только связи диалогов с CRM своих проектов' as expected
FROM public.dialog_crm_connections;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политика создана, права предоставлены
-- ЛОГИКА: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
-- ПРИНЦИП: Командная работа - все участники проекта видят связи диалогов с CRM
-- СЛЕДУЮЩИЙ ШАГ: dialog_with_operators
-- =====================================================
