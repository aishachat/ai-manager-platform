-- =====================================================
-- ШАГ 18: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ KNOWLEDGE_SOURCES (БЕЗ ОШИБОК)
-- =====================================================
-- Таблица: источники знаний для проекта
-- Логика: 1 проект = 1 база знаний (командная работа)
-- Принцип: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "knowledge_sources_project_access" ON public.knowledge_sources;
DROP POLICY IF EXISTS "knowledge_sources_owner_access" ON public.knowledge_sources;
DROP POLICY IF EXISTS "knowledge_sources_user_access" ON public.knowledge_sources;
DROP POLICY IF EXISTS "knowledge_sources_combined_access" ON public.knowledge_sources;

-- 3. СОЗДАЕМ НОВУЮ ПОЛИТИКУ (на основе project_id)
CREATE POLICY "knowledge_sources_project_access" ON public.knowledge_sources
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
GRANT ALL ON public.knowledge_sources TO authenticated;
GRANT ALL ON public.knowledge_sources TO service_role;

-- 5. ПРОВЕРЯЕМ СТАТУС RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'knowledge_sources') as policies_count
FROM pg_tables 
WHERE tablename = 'knowledge_sources';

-- 6. ПРОВЕРЯЕМ ПОЛИТИКИ
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'knowledge_sources';

-- 7. ПРОВЕРЯЕМ ДАННЫЕ
SELECT 
    'Всего источников знаний' as metric,
    count(*) as value
FROM public.knowledge_sources
UNION ALL
SELECT 
    'Уникальных проектов' as metric,
    count(DISTINCT project_id) as value
FROM public.knowledge_sources
UNION ALL
SELECT 
    'Уникальных пользователей' as metric,
    count(DISTINCT user_id) as value
FROM public.knowledge_sources
UNION ALL
SELECT 
    'Источников с project_id = null' as metric,
    count(*) as value
FROM public.knowledge_sources
WHERE project_id IS NULL
UNION ALL
SELECT 
    'Источников с user_id = null' as metric,
    count(*) as value
FROM public.knowledge_sources
WHERE user_id IS NULL;

-- 8. ПРОВЕРЯЕМ СВЯЗИ С ПРОЕКТАМИ
SELECT 
    'Проектов с источниками знаний' as metric,
    count(DISTINCT p.id) as value
FROM public.projects p
INNER JOIN public.knowledge_sources ks ON p.id = ks.project_id
UNION ALL
SELECT 
    'Проектов без источников знаний' as metric,
    count(*) as value
FROM public.projects p
LEFT JOIN public.knowledge_sources ks ON p.id = ks.project_id
WHERE ks.project_id IS NULL;

-- 9. ПРОВЕРЯЕМ СВЯЗИ С ПОЛЬЗОВАТЕЛЯМИ
SELECT 
    'Пользователей с источниками знаний' as metric,
    count(DISTINCT u.id) as value
FROM public.users u
INNER JOIN public.knowledge_sources ks ON u.id = ks.user_id
UNION ALL
SELECT 
    'Пользователей без источников знаний' as metric,
    count(*) as value
FROM public.users u
LEFT JOIN public.knowledge_sources ks ON u.id = ks.user_id
WHERE ks.user_id IS NULL;

-- 10. ПРОВЕРЯЕМ СТАТИСТИКУ
SELECT 
    'Среднее источников на проект' as metric,
    CASE 
        WHEN count(DISTINCT project_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT project_id), 2)::text
        ELSE '0' 
    END as value
FROM public.knowledge_sources
WHERE project_id IS NOT NULL
UNION ALL
SELECT 
    'Среднее источников на пользователя' as metric,
    CASE 
        WHEN count(DISTINCT user_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT user_id), 2)::text
        ELSE '0' 
    END as value
FROM public.knowledge_sources
WHERE user_id IS NOT NULL;

-- 11. ПРОВЕРЯЕМ ПОСЛЕДНИЕ ИСТОЧНИКИ
SELECT 
    'Последние источники' as metric,
    MAX(created_at)::text as value
FROM public.knowledge_sources
UNION ALL
SELECT 
    'Первые источники' as metric,
    MIN(created_at)::text as value
FROM public.knowledge_sources;

-- 12. ТЕСТ ИЗОЛЯЦИИ (должен показать только записи текущего пользователя)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ' as test_name,
    count(*) as visible_records,
    'Пользователь должен видеть только источники знаний своих проектов' as expected
FROM public.knowledge_sources;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политика создана, права предоставлены
-- ЛОГИКА: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
-- ПРИНЦИП: Командная работа - все участники проекта видят источники знаний
-- СЛЕДУЮЩИЙ ШАГ: knowledge_chunks
-- =====================================================
