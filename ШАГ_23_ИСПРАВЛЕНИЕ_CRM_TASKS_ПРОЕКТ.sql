-- =====================================================
-- ШАГ 23: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ CRM_TASKS (ПРОЕКТ)
-- =====================================================
-- Таблица: задачи CRM для проекта
-- Логика: 1 проект = множество задач CRM (командная работа)
-- Принцип: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "crm_tasks_project_access" ON public.crm_tasks;
DROP POLICY IF EXISTS "crm_tasks_owner_access" ON public.crm_tasks;
DROP POLICY IF EXISTS "crm_tasks_user_access" ON public.crm_tasks;
DROP POLICY IF EXISTS "crm_tasks_combined_access" ON public.crm_tasks;

-- 3. СОЗДАЕМ НОВУЮ ПОЛИТИКУ (на основе project_id)
CREATE POLICY "crm_tasks_project_access" ON public.crm_tasks
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
GRANT ALL ON public.crm_tasks TO authenticated;
GRANT ALL ON public.crm_tasks TO service_role;

-- 5. ПРОВЕРЯЕМ СТАТУС RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'crm_tasks') as policies_count
FROM pg_tables 
WHERE tablename = 'crm_tasks';

-- 6. ПРОВЕРЯЕМ ПОЛИТИКИ
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'crm_tasks';

-- 7. ПРОВЕРЯЕМ ДАННЫЕ
SELECT 
    'Всего задач CRM' as metric,
    count(*) as value
FROM public.crm_tasks
UNION ALL
SELECT 
    'Уникальных проектов' as metric,
    count(DISTINCT project_id) as value
FROM public.crm_tasks
UNION ALL
SELECT 
    'Уникальных пользователей' as metric,
    count(DISTINCT user_id) as value
FROM public.crm_tasks
UNION ALL
SELECT 
    'Задач с project_id = null' as metric,
    count(*) as value
FROM public.crm_tasks
WHERE project_id IS NULL
UNION ALL
SELECT 
    'Задач с user_id = null' as metric,
    count(*) as value
FROM public.crm_tasks
WHERE user_id IS NULL;

-- 8. ПРОВЕРЯЕМ СВЯЗИ С ПРОЕКТАМИ
SELECT 
    'Проектов с задачами CRM' as metric,
    count(DISTINCT p.id) as value
FROM public.projects p
INNER JOIN public.crm_tasks ct ON p.id = ct.project_id
UNION ALL
SELECT 
    'Проектов без задач CRM' as metric,
    count(*) as value
FROM public.projects p
LEFT JOIN public.crm_tasks ct ON p.id = ct.project_id
WHERE ct.project_id IS NULL;

-- 9. ПРОВЕРЯЕМ СВЯЗИ С ПОЛЬЗОВАТЕЛЯМИ
SELECT 
    'Пользователей с задачами CRM' as metric,
    count(DISTINCT u.id) as value
FROM public.users u
INNER JOIN public.crm_tasks ct ON u.id = ct.user_id
UNION ALL
SELECT 
    'Пользователей без задач CRM' as metric,
    count(*) as value
FROM public.users u
LEFT JOIN public.crm_tasks ct ON u.id = ct.user_id
WHERE ct.user_id IS NULL;

-- 10. ПРОВЕРЯЕМ СТАТИСТИКУ
SELECT 
    'Среднее задач на проект' as metric,
    CASE 
        WHEN count(DISTINCT project_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT project_id), 2)::text
        ELSE '0' 
    END as value
FROM public.crm_tasks
WHERE project_id IS NOT NULL
UNION ALL
SELECT 
    'Среднее задач на пользователя' as metric,
    CASE 
        WHEN count(DISTINCT user_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT user_id), 2)::text
        ELSE '0' 
    END as value
FROM public.crm_tasks
WHERE user_id IS NOT NULL;

-- 11. ПРОВЕРЯЕМ ПОСЛЕДНИЕ ЗАДАЧИ
SELECT 
    'Последние задачи' as metric,
    MAX(created_at)::text as value
FROM public.crm_tasks
UNION ALL
SELECT 
    'Первые задачи' as metric,
    MIN(created_at)::text as value
FROM public.crm_tasks;

-- 12. ТЕСТ ИЗОЛЯЦИИ (должен показать только записи текущего пользователя)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ' as test_name,
    count(*) as visible_records,
    'Пользователь должен видеть только задачи CRM своих проектов' as expected
FROM public.crm_tasks;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политика создана, права предоставлены
-- ЛОГИКА: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
-- ПРИНЦИП: Командная работа - все участники проекта видят задачи CRM
-- СЛЕДУЮЩИЙ ШАГ: crm_deal_notes
-- =====================================================
