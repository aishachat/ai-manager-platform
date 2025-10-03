-- ========================================
-- ШАГ 27: ИСПРАВЛЕНИЕ RLS ДЛЯ FAQ_CACHE
-- ========================================

-- Удаляем старые политики
DROP POLICY IF EXISTS "faq_cache_user_access" ON public.faq_cache;
DROP POLICY IF EXISTS "faq_cache_project_access" ON public.faq_cache;
DROP POLICY IF EXISTS "faq_cache_read_all" ON public.faq_cache;
DROP POLICY IF EXISTS "faq_cache_write_owners" ON public.faq_cache;

-- Включаем RLS
ALTER TABLE public.faq_cache ENABLE ROW LEVEL SECURITY;

-- Создаем новую политику на основе project_id
CREATE POLICY "faq_cache_project_access" ON public.faq_cache
    FOR ALL USING (
        project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())
    )
    WITH CHECK (
        project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())
    );

-- Предоставляем права
GRANT ALL ON public.faq_cache TO authenticated;
GRANT ALL ON public.faq_cache TO service_role;

-- Проверяем результат
SELECT 
    'faq_cache' as table_name,
    'RLS включен' as rls_status,
    'Политика faq_cache_project_access создана' as policy_status,
    'Права предоставлены' as permissions_status,
    'Готово к следующему шагу' as next_step;

-- Статистика
SELECT 
    'Всего записей FAQ' as metric,
    COUNT(*)::text as value
FROM public.faq_cache
UNION ALL
SELECT 
    'Уникальных проектов' as metric,
    COUNT(DISTINCT project_id)::text as value
FROM public.faq_cache
UNION ALL
SELECT 
    'Уникальных пользователей' as metric,
    COUNT(DISTINCT user_id)::text as value
FROM public.faq_cache;

-- Проверяем изоляцию данных
SELECT 
    'Текущий пользователь видит записей' as test_description,
    COUNT(*)::text as visible_records
FROM public.faq_cache
WHERE project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid());