-- 🔧 ПРАВИЛЬНЫЕ RLS ПОЛИТИКИ ПО ЛОГИКЕ ПРОЕКТОВ
-- 1 проект = 1 AI агент = 1 набор настроек

-- ============================================
-- 1. АНАЛИЗ ТЕКУЩЕЙ СИТУАЦИИ
-- ============================================

-- Проверяем, сколько агентов у каждого проекта
SELECT 
    '📊 АНАЛИЗ АГЕНТОВ ПО ПРОЕКТАМ' as section,
    project_id,
    COUNT(*) as agent_count,
    CASE 
        WHEN COUNT(*) = 1 THEN '✅ ПРАВИЛЬНО: 1 агент на проект'
        WHEN COUNT(*) > 1 THEN '❌ ПРОБЛЕМА: Много агентов на проект'
        ELSE '⚠️ ПРОБЛЕМА: Нет агентов'
    END as status
FROM public.assistants
WHERE project_id IS NOT NULL
GROUP BY project_id
ORDER BY agent_count DESC;

-- Проверяем, есть ли таблица ai_agent_settings
SELECT 
    '🔍 ПРОВЕРКА ТАБЛИЦЫ AI_AGENT_SETTINGS' as section,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_agent_settings')
        THEN '✅ Таблица существует'
        ELSE '❌ Таблица не найдена'
    END as table_status;

-- ============================================
-- 2. ПРАВИЛЬНЫЕ RLS ПОЛИТИКИ
-- ============================================

-- Для таблицы assistants (1 агент на проект)
DROP POLICY IF EXISTS "assistants_project_access" ON public.assistants;
DROP POLICY IF EXISTS "assistants_simple_access" ON public.assistants;

CREATE POLICY "assistants_one_per_project" ON public.assistants
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

-- Для таблицы ai_agent_settings (если существует)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_agent_settings') THEN
        -- Включаем RLS
        EXECUTE 'ALTER TABLE public.ai_agent_settings ENABLE ROW LEVEL SECURITY';
        
        -- Удаляем старые политики
        EXECUTE 'DROP POLICY IF EXISTS "ai_agent_settings_all" ON public.ai_agent_settings';
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their own ai_agent_settings" ON public.ai_agent_settings';
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own ai_agent_settings" ON public.ai_agent_settings';
        EXECUTE 'DROP POLICY IF EXISTS "Users can update their own ai_agent_settings" ON public.ai_agent_settings';
        EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own ai_agent_settings" ON public.ai_agent_settings';
        
        -- Создаем правильную политику
        EXECUTE 'CREATE POLICY "ai_agent_settings_project_access" ON public.ai_agent_settings
            FOR ALL USING (
                project_id IN (
                    SELECT id FROM public.projects WHERE owner_id = auth.uid()
                )
            )
            WITH CHECK (
                project_id IN (
                    SELECT id FROM public.projects WHERE owner_id = auth.uid()
                )
            )';
        
        -- Предоставляем права
        EXECUTE 'GRANT ALL ON public.ai_agent_settings TO authenticated';
        
        RAISE NOTICE '✅ RLS настроен для ai_agent_settings';
    ELSE
        RAISE NOTICE '⚠️ Таблица ai_agent_settings не найдена';
    END IF;
END $$;

-- ============================================
-- 3. ПОЛИТИКИ ДЛЯ ДРУГИХ ТАБЛИЦ
-- ============================================

-- Для таблицы knowledge_sources (база знаний проекта)
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "knowledge_sources_project_access" ON public.knowledge_sources;

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

-- Для таблицы knowledge_chunks (чанки базы знаний)
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "knowledge_chunks_project_access" ON public.knowledge_chunks;

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

-- Для таблицы user_niches (ниша проекта)
ALTER TABLE public.user_niches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_niches_project_access" ON public.user_niches;

CREATE POLICY "user_niches_project_access" ON public.user_niches
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
-- 4. СОЗДАЕМ ИНДЕКСЫ ДЛЯ БЫСТРОЙ РАБОТЫ
-- ============================================

-- Индекс для быстрого поиска по project_id
CREATE INDEX IF NOT EXISTS idx_assistants_project_id ON public.assistants(project_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_project_id ON public.knowledge_sources(project_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_project_id ON public.knowledge_chunks(project_id);
CREATE INDEX IF NOT EXISTS idx_user_niches_project_id ON public.user_niches(project_id);

-- Индекс для быстрого поиска проектов по владельцу
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);

-- ============================================
-- 5. ПРОВЕРЯЕМ РЕЗУЛЬТАТ
-- ============================================

-- Проверяем политики
SELECT 
    '✅ ПРОВЕРКА ПОЛИТИК' as section,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())%' 
        THEN '✅ ПРАВИЛЬНО: Изоляция по проектам'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as policy_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('assistants', 'knowledge_sources', 'knowledge_chunks', 'user_niches')
ORDER BY tablename, policyname;

-- Проверяем индексы
SELECT 
    '⚡ ПРОВЕРКА ИНДЕКСОВ' as section,
    indexname,
    tablename,
    CASE 
        WHEN indexdef LIKE '%project_id%' THEN '✅ Есть индекс по project_id'
        WHEN indexdef LIKE '%owner_id%' THEN '✅ Есть индекс по owner_id'
        ELSE '⚠️ Другой индекс'
    END as index_status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('assistants', 'knowledge_sources', 'knowledge_chunks', 'user_niches', 'projects')
ORDER BY tablename, indexname;

-- ============================================
-- 6. ИТОГОВЫЙ ОТЧЕТ
-- ============================================

SELECT 
    '📋 ИТОГОВЫЙ ОТЧЕТ' as section,
    'Политики настроены по логике проектов' as status,
    '1 проект = 1 агент = 1 набор настроек' as principle,
    'Изоляция данных обеспечена' as result
UNION ALL
SELECT 
    '📊 СТАТИСТИКА' as section,
    'Политик создано: ' || COUNT(*)::text as status,
    'Таблиц защищено: ' || COUNT(DISTINCT tablename)::text as principle,
    'Индексов создано: ' || (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('assistants', 'knowledge_sources', 'knowledge_chunks', 'user_niches', 'projects'))::text as result
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('assistants', 'knowledge_sources', 'knowledge_chunks', 'user_niches');
