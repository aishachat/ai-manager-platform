-- =====================================================
-- ШАГ 11: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ NICHE_SYNONYMS (СПРАВОЧНИК)
-- =====================================================
-- Таблица: справочник синонимов ниш
-- Логика: справочные данные, доступные всем авторизованным пользователям
-- Принцип: authenticated пользователи могут читать, только владельцы проектов могут изменять

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.niche_synonyms ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "niche_synonyms_project_access" ON public.niche_synonyms;
DROP POLICY IF EXISTS "niche_synonyms_owner_access" ON public.niche_synonyms;
DROP POLICY IF EXISTS "niche_synonyms_user_access" ON public.niche_synonyms;
DROP POLICY IF EXISTS "niche_synonyms_public_read" ON public.niche_synonyms;
DROP POLICY IF EXISTS "niche_synonyms_owner_write" ON public.niche_synonyms;

-- 3. СОЗДАЕМ ПОЛИТИКУ ДЛЯ ЧТЕНИЯ (все авторизованные пользователи)
CREATE POLICY "niche_synonyms_public_read" ON public.niche_synonyms
    FOR SELECT USING (true);

-- 4. СОЗДАЕМ ПОЛИТИКУ ДЛЯ ЗАПИСИ (только владельцы проектов)
CREATE POLICY "niche_synonyms_owner_write" ON public.niche_synonyms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE owner_id = auth.uid()
        )
    );

-- 5. ПРЕДОСТАВЛЯЕМ ПРАВА
GRANT ALL ON public.niche_synonyms TO authenticated;
GRANT ALL ON public.niche_synonyms TO service_role;

-- 6. ПРОВЕРЯЕМ СТАТУС RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'niche_synonyms') as policies_count
FROM pg_tables 
WHERE tablename = 'niche_synonyms';

-- 7. ПРОВЕРЯЕМ ПОЛИТИКИ
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'niche_synonyms';

-- 8. ПРОВЕРЯЕМ ДАННЫЕ
SELECT 
    'Всего синонимов' as metric,
    count(*) as value
FROM public.niche_synonyms
UNION ALL
SELECT 
    'Уникальных ниш' as metric,
    count(DISTINCT niche_id) as value
FROM public.niche_synonyms
UNION ALL
SELECT 
    'Синонимов с niche_id = null' as metric,
    count(*) as value
FROM public.niche_synonyms
WHERE niche_id IS NULL
UNION ALL
SELECT 
    'Синонимов с пустым текстом' as metric,
    count(*) as value
FROM public.niche_synonyms
WHERE synonym IS NULL OR synonym = '';

-- 9. ПРОВЕРЯЕМ СВЯЗИ С НИШАМИ
SELECT 
    'Ниш с синонимами' as metric,
    count(DISTINCT n.id) as value
FROM public.niches n
INNER JOIN public.niche_synonyms ns ON n.id = ns.niche_id
UNION ALL
SELECT 
    'Ниш без синонимов' as metric,
    count(*) as value
FROM public.niches n
LEFT JOIN public.niche_synonyms ns ON n.id = ns.niche_id
WHERE ns.niche_id IS NULL;

-- 10. ПРОВЕРЯЕМ СТАТИСТИКУ СИНОНИМОВ
SELECT 
    'Среднее синонимов на нишу' as metric,
    CASE 
        WHEN count(DISTINCT niche_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT niche_id), 2)::text
        ELSE '0' 
    END as value
FROM public.niche_synonyms
WHERE niche_id IS NOT NULL;

-- 11. ПРОВЕРЯЕМ ПОСЛЕДНИЕ СИНОНИМЫ
SELECT 
    'Последний синоним' as metric,
    MAX(created_at)::text as value
FROM public.niche_synonyms
UNION ALL
SELECT 
    'Первый синоним' as metric,
    MIN(created_at)::text as value
FROM public.niche_synonyms;

-- 12. ТЕСТ ИЗОЛЯЦИИ (должен показать все записи для чтения)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ (ЧТЕНИЕ)' as test_name,
    count(*) as visible_records,
    'Все авторизованные пользователи должны видеть все синонимы' as expected
FROM public.niche_synonyms;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политики созданы, права предоставлены
-- ЛОГИКА: 
-- - Чтение: все авторизованные пользователи (true)
-- - Запись: только владельцы проектов (EXISTS projects WHERE owner_id = auth.uid())
-- СЛЕДУЮЩИЙ ШАГ: проверить структуру других таблиц
-- =====================================================
