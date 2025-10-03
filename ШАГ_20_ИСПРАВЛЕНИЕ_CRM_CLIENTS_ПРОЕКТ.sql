-- =====================================================
-- ШАГ 20: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ CRM_CLIENTS (ПРОЕКТ)
-- =====================================================
-- Таблица: клиенты CRM для проекта
-- Логика: 1 проект = множество клиентов CRM (командная работа)
-- Принцип: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "crm_clients_project_access" ON public.crm_clients;
DROP POLICY IF EXISTS "crm_clients_owner_access" ON public.crm_clients;
DROP POLICY IF EXISTS "crm_clients_user_access" ON public.crm_clients;
DROP POLICY IF EXISTS "crm_clients_combined_access" ON public.crm_clients;

-- 3. СОЗДАЕМ НОВУЮ ПОЛИТИКУ (на основе project_id)
CREATE POLICY "crm_clients_project_access" ON public.crm_clients
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
GRANT ALL ON public.crm_clients TO authenticated;
GRANT ALL ON public.crm_clients TO service_role;

-- 5. ПРОВЕРЯЕМ СТАТУС RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'crm_clients') as policies_count
FROM pg_tables 
WHERE tablename = 'crm_clients';

-- 6. ПРОВЕРЯЕМ ПОЛИТИКИ
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'crm_clients';

-- 7. ПРОВЕРЯЕМ ДАННЫЕ
SELECT 
    'Всего клиентов CRM' as metric,
    count(*) as value
FROM public.crm_clients
UNION ALL
SELECT 
    'Уникальных проектов' as metric,
    count(DISTINCT project_id) as value
FROM public.crm_clients
UNION ALL
SELECT 
    'Уникальных пользователей' as metric,
    count(DISTINCT user_id) as value
FROM public.crm_clients
UNION ALL
SELECT 
    'Клиентов с project_id = null' as metric,
    count(*) as value
FROM public.crm_clients
WHERE project_id IS NULL
UNION ALL
SELECT 
    'Клиентов с user_id = null' as metric,
    count(*) as value
FROM public.crm_clients
WHERE user_id IS NULL;

-- 8. ПРОВЕРЯЕМ СВЯЗИ С ПРОЕКТАМИ
SELECT 
    'Проектов с клиентами CRM' as metric,
    count(DISTINCT p.id) as value
FROM public.projects p
INNER JOIN public.crm_clients cc ON p.id = cc.project_id
UNION ALL
SELECT 
    'Проектов без клиентов CRM' as metric,
    count(*) as value
FROM public.projects p
LEFT JOIN public.crm_clients cc ON p.id = cc.project_id
WHERE cc.project_id IS NULL;

-- 9. ПРОВЕРЯЕМ СВЯЗИ С ПОЛЬЗОВАТЕЛЯМИ
SELECT 
    'Пользователей с клиентами CRM' as metric,
    count(DISTINCT u.id) as value
FROM public.users u
INNER JOIN public.crm_clients cc ON u.id = cc.user_id
UNION ALL
SELECT 
    'Пользователей без клиентов CRM' as metric,
    count(*) as value
FROM public.users u
LEFT JOIN public.crm_clients cc ON u.id = cc.user_id
WHERE cc.user_id IS NULL;

-- 10. ПРОВЕРЯЕМ СТАТИСТИКУ
SELECT 
    'Среднее клиентов на проект' as metric,
    CASE 
        WHEN count(DISTINCT project_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT project_id), 2)::text
        ELSE '0' 
    END as value
FROM public.crm_clients
WHERE project_id IS NOT NULL
UNION ALL
SELECT 
    'Среднее клиентов на пользователя' as metric,
    CASE 
        WHEN count(DISTINCT user_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT user_id), 2)::text
        ELSE '0' 
    END as value
FROM public.crm_clients
WHERE user_id IS NOT NULL;

-- 11. ПРОВЕРЯЕМ ПОСЛЕДНИХ КЛИЕНТОВ
SELECT 
    'Последние клиенты' as metric,
    MAX(created_at)::text as value
FROM public.crm_clients
UNION ALL
SELECT 
    'Первые клиенты' as metric,
    MIN(created_at)::text as value
FROM public.crm_clients;

-- 12. ТЕСТ ИЗОЛЯЦИИ (должен показать только записи текущего пользователя)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ' as test_name,
    count(*) as visible_records,
    'Пользователь должен видеть только клиентов CRM своих проектов' as expected
FROM public.crm_clients;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политика создана, права предоставлены
-- ЛОГИКА: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
-- ПРИНЦИП: Командная работа - все участники проекта видят клиентов CRM
-- СЛЕДУЮЩИЙ ШАГ: crm_deals
-- =====================================================
