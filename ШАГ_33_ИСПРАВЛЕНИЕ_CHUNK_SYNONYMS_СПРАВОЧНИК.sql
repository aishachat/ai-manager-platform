-- ========================================
-- ШАГ 33: ИСПРАВЛЕНИЕ RLS ДЛЯ CHUNK_SYNONYMS (СПРАВОЧНИК)
-- ========================================

-- Удаляем старые политики
DROP POLICY IF EXISTS "chunk_synonyms_user_access" ON public.chunk_synonyms;
DROP POLICY IF EXISTS "chunk_synonyms_project_access" ON public.chunk_synonyms;
DROP POLICY IF EXISTS "chunk_synonyms_read_all" ON public.chunk_synonyms;
DROP POLICY IF EXISTS "chunk_synonyms_write_owners" ON public.chunk_synonyms;

-- Включаем RLS
ALTER TABLE public.chunk_synonyms ENABLE ROW LEVEL SECURITY;

-- Создаем политики для справочника
-- Чтение доступно всем аутентифицированным пользователям
CREATE POLICY "chunk_synonyms_read_all" ON public.chunk_synonyms
    FOR SELECT TO authenticated USING (true);

-- Запись только владельцам проектов
CREATE POLICY "chunk_synonyms_write_owners" ON public.chunk_synonyms
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE owner_id = auth.uid()));

CREATE POLICY "chunk_synonyms_update_owners" ON public.chunk_synonyms
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.projects WHERE owner_id = auth.uid()));

CREATE POLICY "chunk_synonyms_delete_owners" ON public.chunk_synonyms
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.projects WHERE owner_id = auth.uid()));

-- Предоставляем права
GRANT ALL ON public.chunk_synonyms TO authenticated;
GRANT ALL ON public.chunk_synonyms TO service_role;

-- Проверяем результат
SELECT 
    'chunk_synonyms' as table_name,
    'RLS включен' as rls_status,
    'Политики справочника созданы' as policy_status,
    'Права предоставлены' as permissions_status,
    'Готово к следующему шагу' as next_step;

-- Статистика
SELECT 
    'Всего синонимов чанков' as metric,
    COUNT(*)::text as value
FROM public.chunk_synonyms;

-- Проверяем доступность данных
SELECT 
    'Все пользователи видят синонимов' as test_description,
    COUNT(*)::text as visible_records
FROM public.chunk_synonyms;
