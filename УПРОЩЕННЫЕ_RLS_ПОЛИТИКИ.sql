-- 🔧 УПРОЩЕННЫЕ RLS ПОЛИТИКИ ДЛЯ БЫСТРОЙ РАБОТЫ API
-- Заменяем сложные подзапросы на простые проверки

-- ============================================
-- 1. УПРОЩАЕМ ПОЛИТИКУ ДЛЯ ASSISTANTS
-- ============================================

-- Удаляем сложную политику
DROP POLICY IF EXISTS "assistants_project_access" ON public.assistants;

-- Создаем упрощенную политику (только для владельцев проектов)
CREATE POLICY "assistants_simple_access" ON public.assistants
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

-- ============================================
-- 2. УПРОЩАЕМ ПОЛИТИКУ ДЛЯ PROJECT_MEMBERS
-- ============================================

-- Удаляем сложную политику
DROP POLICY IF EXISTS "project_members_project_access" ON public.project_members;

-- Создаем упрощенную политику (только для владельцев проектов)
CREATE POLICY "project_members_simple_access" ON public.project_members
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

-- ============================================
-- 3. СОЗДАЕМ ИНДЕКСЫ ДЛЯ БЫСТРОЙ РАБОТЫ
-- ============================================

-- Индекс для быстрого поиска проектов по владельцу
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);

-- Индекс для быстрого поиска агентов по проекту
CREATE INDEX IF NOT EXISTS idx_assistants_project_id ON public.assistants(project_id);

-- Индекс для быстрого поиска участников по проекту
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);

-- Индекс для быстрого поиска участников по пользователю
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);

-- ============================================
-- 4. ПРОВЕРЯЕМ ПРОИЗВОДИТЕЛЬНОСТЬ
-- ============================================

-- Проверяем, что индексы созданы
SELECT 
    '📊 ИНДЕКСЫ СОЗДАНЫ' as section,
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('projects', 'assistants', 'project_members')
ORDER BY tablename, indexname;

-- ============================================
-- 5. ТЕСТИРУЕМ УПРОЩЕННЫЕ ПОЛИТИКИ
-- ============================================

-- Проверяем новые политики
SELECT 
    '✅ УПРОЩЕННЫЕ ПОЛИТИКИ' as section,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%SELECT id FROM public.projects WHERE owner_id = auth.uid()%' 
        THEN '✅ ПРОСТАЯ: Только владельцы проектов'
        WHEN qual LIKE '%UNION%' 
        THEN '❌ СЛОЖНАЯ: С подзапросами'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as complexity_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('assistants', 'project_members')
ORDER BY tablename, policyname;

-- ============================================
-- 6. ИТОГОВЫЙ ОТЧЕТ
-- ============================================

SELECT 
    '📋 ИТОГОВЫЙ ОТЧЕТ' as section,
    'Политики упрощены' as status,
    'Индексы созданы' as performance,
    'API должен работать быстрее' as result
UNION ALL
SELECT 
    '📊 СТАТИСТИКА' as section,
    'Политик assistants: ' || COUNT(*)::text as status,
    'Политик project_members: ' || (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'project_members')::text as performance,
    'Индексов создано: ' || (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('projects', 'assistants', 'project_members'))::text as result
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'assistants';
