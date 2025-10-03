-- =====================================================
-- ШАГ 19: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ KNOWLEDGE_CHUNKS (ПРОЕКТ)
-- =====================================================
-- Таблица: чанки знаний для проекта
-- Логика: 1 проект = множество чанков знаний (командная работа)
-- Принцип: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "knowledge_chunks_project_access" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "knowledge_chunks_owner_access" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "knowledge_chunks_user_access" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "knowledge_chunks_combined_access" ON public.knowledge_chunks;

-- 3. СОЗДАЕМ НОВУЮ ПОЛИТИКУ (на основе project_id)
CREATE POLICY "knowledge_chunks_project_access" ON public.knowledge_chunks
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
GRANT ALL ON public.knowledge_chunks TO authenticated;
GRANT ALL ON public.knowledge_chunks TO service_role;

-- 5. ПРОВЕРЯЕМ СТАТУС RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'knowledge_chunks') as policies_count
FROM pg_tables 
WHERE tablename = 'knowledge_chunks';

-- 6. ПРОВЕРЯЕМ ПОЛИТИКИ
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'knowledge_chunks';

-- 7. ПРОВЕРЯЕМ ДАННЫЕ
SELECT 
    'Всего чанков знаний' as metric,
    count(*) as value
FROM public.knowledge_chunks
UNION ALL
SELECT 
    'Уникальных проектов' as metric,
    count(DISTINCT project_id) as value
FROM public.knowledge_chunks
UNION ALL
SELECT 
    'Уникальных пользователей' as metric,
    count(DISTINCT user_id) as value
FROM public.knowledge_chunks
UNION ALL
SELECT 
    'Чанков с project_id = null' as metric,
    count(*) as value
FROM public.knowledge_chunks
WHERE project_id IS NULL
UNION ALL
SELECT 
    'Чанков с user_id = null' as metric,
    count(*) as value
FROM public.knowledge_chunks
WHERE user_id IS NULL;

-- 8. ПРОВЕРЯЕМ СВЯЗИ С ПРОЕКТАМИ
SELECT 
    'Проектов с чанками знаний' as metric,
    count(DISTINCT p.id) as value
FROM public.projects p
INNER JOIN public.knowledge_chunks kc ON p.id = kc.project_id
UNION ALL
SELECT 
    'Проектов без чанков знаний' as metric,
    count(*) as value
FROM public.projects p
LEFT JOIN public.knowledge_chunks kc ON p.id = kc.project_id
WHERE kc.project_id IS NULL;

-- 9. ПРОВЕРЯЕМ СВЯЗИ С ПОЛЬЗОВАТЕЛЯМИ
SELECT 
    'Пользователей с чанками знаний' as metric,
    count(DISTINCT u.id) as value
FROM public.users u
INNER JOIN public.knowledge_chunks kc ON u.id = kc.user_id
UNION ALL
SELECT 
    'Пользователей без чанков знаний' as metric,
    count(*) as value
FROM public.users u
LEFT JOIN public.knowledge_chunks kc ON u.id = kc.user_id
WHERE kc.user_id IS NULL;

-- 10. ПРОВЕРЯЕМ СТАТИСТИКУ
SELECT 
    'Среднее чанков на проект' as metric,
    CASE 
        WHEN count(DISTINCT project_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT project_id), 2)::text
        ELSE '0' 
    END as value
FROM public.knowledge_chunks
WHERE project_id IS NOT NULL
UNION ALL
SELECT 
    'Среднее чанков на пользователя' as metric,
    CASE 
        WHEN count(DISTINCT user_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT user_id), 2)::text
        ELSE '0' 
    END as value
FROM public.knowledge_chunks
WHERE user_id IS NOT NULL;

-- 11. ПРОВЕРЯЕМ ПОСЛЕДНИЕ ЧАНКИ
SELECT 
    'Последние чанки' as metric,
    MAX(created_at)::text as value
FROM public.knowledge_chunks
UNION ALL
SELECT 
    'Первые чанки' as metric,
    MIN(created_at)::text as value
FROM public.knowledge_chunks;

-- 12. ТЕСТ ИЗОЛЯЦИИ (должен показать только записи текущего пользователя)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ' as test_name,
    count(*) as visible_records,
    'Пользователь должен видеть только чанки знаний своих проектов' as expected
FROM public.knowledge_chunks;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политика создана, права предоставлены
-- ЛОГИКА: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
-- ПРИНЦИП: Командная работа - все участники проекта видят чанки знаний
-- СЛЕДУЮЩИЙ ШАГ: crm_clients
-- =====================================================