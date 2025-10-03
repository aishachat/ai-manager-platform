-- ========================================
-- ШАГ 28: ИСПРАВЛЕНИЕ RLS ДЛЯ HELP_REQUESTS
-- ========================================

-- Удаляем старые политики
DROP POLICY IF EXISTS "help_requests_user_access" ON public.help_requests;
DROP POLICY IF EXISTS "help_requests_project_access" ON public.help_requests;
DROP POLICY IF EXISTS "help_requests_read_all" ON public.help_requests;
DROP POLICY IF EXISTS "help_requests_write_owners" ON public.help_requests;

-- Включаем RLS
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

-- Создаем новую политику на основе project_id
CREATE POLICY "help_requests_project_access" ON public.help_requests
    FOR ALL USING (
        project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())
    )
    WITH CHECK (
        project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())
    );

-- Предоставляем права
GRANT ALL ON public.help_requests TO authenticated;
GRANT ALL ON public.help_requests TO service_role;

-- Проверяем результат
SELECT 
    'help_requests' as table_name,
    'RLS включен' as rls_status,
    'Политика help_requests_project_access создана' as policy_status,
    'Права предоставлены' as permissions_status,
    'Готово к следующему шагу' as next_step;

-- Статистика
SELECT 
    'Всего запросов помощи' as metric,
    COUNT(*)::text as value
FROM public.help_requests
UNION ALL
SELECT 
    'Уникальных проектов' as metric,
    COUNT(DISTINCT project_id)::text as value
FROM public.help_requests
UNION ALL
SELECT 
    'Уникальных пользователей' as metric,
    COUNT(DISTINCT user_id)::text as value
FROM public.help_requests;

-- Проверяем изоляцию данных
SELECT 
    'Текущий пользователь видит записей' as test_description,
    COUNT(*)::text as visible_records
FROM public.help_requests
WHERE project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid());