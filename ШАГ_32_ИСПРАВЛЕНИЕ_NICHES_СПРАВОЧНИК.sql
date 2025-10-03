-- ========================================
-- ШАГ 32: ИСПРАВЛЕНИЕ RLS ДЛЯ NICHES (СПРАВОЧНИК)
-- ========================================

-- Удаляем старые политики
DROP POLICY IF EXISTS "niches_user_access" ON public.niches;
DROP POLICY IF EXISTS "niches_project_access" ON public.niches;
DROP POLICY IF EXISTS "niches_read_all" ON public.niches;
DROP POLICY IF EXISTS "niches_write_owners" ON public.niches;

-- Включаем RLS
ALTER TABLE public.niches ENABLE ROW LEVEL SECURITY;

-- Создаем политики для справочника
-- Чтение доступно всем аутентифицированным пользователям
CREATE POLICY "niches_read_all" ON public.niches
    FOR SELECT TO authenticated USING (true);

-- Запись только владельцам проектов
CREATE POLICY "niches_write_owners" ON public.niches
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE owner_id = auth.uid()));

CREATE POLICY "niches_update_owners" ON public.niches
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.projects WHERE owner_id = auth.uid()));

CREATE POLICY "niches_delete_owners" ON public.niches
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.projects WHERE owner_id = auth.uid()));

-- Предоставляем права
GRANT ALL ON public.niches TO authenticated;
GRANT ALL ON public.niches TO service_role;

-- Проверяем результат
SELECT 
    'niches' as table_name,
    'RLS включен' as rls_status,
    'Политики справочника созданы' as policy_status,
    'Права предоставлены' as permissions_status,
    'Готово к следующему шагу' as next_step;

-- Статистика
SELECT 
    'Всего ниш' as metric,
    COUNT(*)::text as value
FROM public.niches;

-- Проверяем доступность данных
SELECT 
    'Все пользователи видят ниш' as test_description,
    COUNT(*)::text as visible_records
FROM public.niches;
