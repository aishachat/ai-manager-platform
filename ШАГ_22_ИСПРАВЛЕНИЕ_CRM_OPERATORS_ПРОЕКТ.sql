-- =====================================================
-- ШАГ 22: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ CRM_OPERATORS (ПРОЕКТ)
-- =====================================================
-- Таблица: операторы CRM для проекта
-- Логика: 1 проект = множество операторов CRM (командная работа)
-- Принцип: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.crm_operators ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "crm_operators_project_access" ON public.crm_operators;
DROP POLICY IF EXISTS "crm_operators_owner_access" ON public.crm_operators;
DROP POLICY IF EXISTS "crm_operators_user_access" ON public.crm_operators;
DROP POLICY IF EXISTS "crm_operators_combined_access" ON public.crm_operators;

-- 3. СОЗДАЕМ НОВУЮ ПОЛИТИКУ (на основе project_id)
CREATE POLICY "crm_operators_project_access" ON public.crm_operators
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
GRANT ALL ON public.crm_operators TO authenticated;
GRANT ALL ON public.crm_operators TO service_role;

-- 5. ПРОВЕРЯЕМ СТАТУС RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'crm_operators') as policies_count
FROM pg_tables 
WHERE tablename = 'crm_operators';

-- 6. ПРОВЕРЯЕМ ПОЛИТИКИ
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'crm_operators';

-- 7. ПРОВЕРЯЕМ ДАННЫЕ
SELECT 
    'Всего операторов CRM' as metric,
    count(*) as value
FROM public.crm_operators
UNION ALL
SELECT 
    'Уникальных проектов' as metric,
    count(DISTINCT project_id) as value
FROM public.crm_operators
UNION ALL
SELECT 
    'Уникальных пользователей' as metric,
    count(DISTINCT user_id) as value
FROM public.crm_operators
UNION ALL
SELECT 
    'Операторов с project_id = null' as metric,
    count(*) as value
FROM public.crm_operators
WHERE project_id IS NULL
UNION ALL
SELECT 
    'Операторов с user_id = null' as metric,
    count(*) as value
FROM public.crm_operators
WHERE user_id IS NULL;

-- 8. ПРОВЕРЯЕМ СВЯЗИ С ПРОЕКТАМИ
SELECT 
    'Проектов с операторами CRM' as metric,
    count(DISTINCT p.id) as value
FROM public.projects p
INNER JOIN public.crm_operators co ON p.id = co.project_id
UNION ALL
SELECT 
    'Проектов без операторов CRM' as metric,
    count(*) as value
FROM public.projects p
LEFT JOIN public.crm_operators co ON p.id = co.project_id
WHERE co.project_id IS NULL;

-- 9. ПРОВЕРЯЕМ СВЯЗИ С ПОЛЬЗОВАТЕЛЯМИ
SELECT 
    'Пользователей с операторами CRM' as metric,
    count(DISTINCT u.id) as value
FROM public.users u
INNER JOIN public.crm_operators co ON u.id = co.user_id
UNION ALL
SELECT 
    'Пользователей без операторов CRM' as metric,
    count(*) as value
FROM public.users u
LEFT JOIN public.crm_operators co ON u.id = co.user_id
WHERE co.user_id IS NULL;

-- 10. ПРОВЕРЯЕМ СТАТИСТИКУ
SELECT 
    'Среднее операторов на проект' as metric,
    CASE 
        WHEN count(DISTINCT project_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT project_id), 2)::text
        ELSE '0' 
    END as value
FROM public.crm_operators
WHERE project_id IS NOT NULL
UNION ALL
SELECT 
    'Среднее операторов на пользователя' as metric,
    CASE 
        WHEN count(DISTINCT user_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT user_id), 2)::text
        ELSE '0' 
    END as value
FROM public.crm_operators
WHERE user_id IS NOT NULL;

-- 11. ПРОВЕРЯЕМ ПОСЛЕДНИХ ОПЕРАТОРОВ
SELECT 
    'Последние операторы' as metric,
    MAX(created_at)::text as value
FROM public.crm_operators
UNION ALL
SELECT 
    'Первые операторы' as metric,
    MIN(created_at)::text as value
FROM public.crm_operators;

-- 12. ТЕСТ ИЗОЛЯЦИИ (должен показать только записи текущего пользователя)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ' as test_name,
    count(*) as visible_records,
    'Пользователь должен видеть только операторов CRM своих проектов' as expected
FROM public.crm_operators;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политика создана, права предоставлены
-- ЛОГИКА: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
-- ПРИНЦИП: Командная работа - все участники проекта видят операторов CRM
-- СЛЕДУЮЩИЙ ШАГ: crm_tasks
-- =====================================================
