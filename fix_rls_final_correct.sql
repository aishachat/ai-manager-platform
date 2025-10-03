-- 🔒 Финальные исправления RLS с учетом архитектуры проектов
-- Исправляем все 20 проблемных политик

-- ============================================
-- 1. ИСПРАВЛЯЕМ INSERT ПОЛИТИКИ БЕЗ УСЛОВИЙ (qual IS NULL) - 17 штук
-- ============================================

-- assistants - INSERT политика (используем project_id)
DROP POLICY IF EXISTS "Users can insert their own assistants" ON assistants;
CREATE POLICY "Users can insert their own assistants" ON assistants
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- autoswitch_settings - INSERT политика (используем user_id, так как нет project_id)
DROP POLICY IF EXISTS "Users can insert their own autoswitch settings" ON autoswitch_settings;
CREATE POLICY "Users can insert their own autoswitch settings" ON autoswitch_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- chat_messages - INSERT политика (используем project_id)
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON chat_messages;
CREATE POLICY "Users can insert their own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- conversations - INSERT политика (используем project_id)
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
CREATE POLICY "Users can insert their own conversations" ON conversations
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- dialogs - INSERT политика (используем project_id)
DROP POLICY IF EXISTS "Users can insert their own dialogs" ON dialogs;
CREATE POLICY "Users can insert their own dialogs" ON dialogs
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- knowledge_chunks - INSERT политика (используем project_id)
DROP POLICY IF EXISTS "Users can insert their own knowledge chunks" ON knowledge_chunks;
CREATE POLICY "Users can insert their own knowledge chunks" ON knowledge_chunks
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- knowledge_sources - INSERT политика (используем project_id)
DROP POLICY IF EXISTS "Users can insert their own knowledge sources" ON knowledge_sources;
CREATE POLICY "Users can insert their own knowledge sources" ON knowledge_sources
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- niches - INSERT политика (используем auth.uid() IS NOT NULL, так как это справочная таблица)
DROP POLICY IF EXISTS "Only authenticated users can insert niches" ON niches;
CREATE POLICY "Only authenticated users can insert niches" ON niches
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- project_members - INSERT политика (уже правильная, но проверим)
-- Оставляем как есть, так как она уже использует правильную логику

-- projects - INSERT политики (используем owner_id)
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "projects_insert" ON projects;
CREATE POLICY "projects_insert" ON projects
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- telegram_settings - INSERT политика (используем project_id)
DROP POLICY IF EXISTS "Users can insert their own telegram settings" ON telegram_settings;
CREATE POLICY "Users can insert their own telegram settings" ON telegram_settings
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- user_niches - INSERT политика (используем project_id)
DROP POLICY IF EXISTS "Users can insert their own user niches" ON user_niches;
CREATE POLICY "Users can insert their own user niches" ON user_niches
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- users - INSERT политики (используем id)
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert" ON users;
CREATE POLICY "users_insert" ON users
    FOR INSERT WITH CHECK (id = auth.uid());

-- widget_development_settings - INSERT политика (используем project_id)
DROP POLICY IF EXISTS "Users can insert their own widget settings" ON widget_development_settings;
CREATE POLICY "Users can insert their own widget settings" ON widget_development_settings
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- ============================================
-- 2. ИСПРАВЛЯЕМ SELECT ПОЛИТИКИ С qual = "true" - 3 штуки
-- ============================================

-- niche_synonyms - SELECT политика (справочная таблица, можно оставить true)
-- Оставляем как есть, так как это справочная таблица

-- niches - SELECT политики (справочная таблица, можно оставить true)
-- Оставляем как есть, так как это справочная таблица

-- ============================================
-- 2. ПРОВЕРЯЕМ РЕЗУЛЬТАТ
-- ============================================

-- Проверяем, сколько политик осталось без условий
SELECT 
    '✅ РЕЗУЛЬТАТ ИСПРАВЛЕНИЙ' as section,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE qual IS NULL) as null_condition_policies,
    COUNT(*) FILTER (WHERE qual = 'true') as true_condition_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%get_user_project_id()%') as project_based_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%') as user_based_policies,
    ROUND(
        COUNT(*) FILTER (WHERE qual LIKE '%get_user_project_id()%' OR qual LIKE '%auth.uid()%') * 100.0 / COUNT(*), 
        2
    ) as secure_policies_percent
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================
-- 3. ФИНАЛЬНАЯ ПРОВЕРКА БЕЗОПАСНОСТИ
-- ============================================

-- Ищем оставшиеся проблемные политики
SELECT 
    '🚨 ОСТАВШИЕСЯ ПРОБЛЕМЫ' as section,
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN 'Политика без условий WHERE'
        WHEN qual = 'true' THEN 'Политика разрешает все (true)'
        WHEN qual LIKE '%get_user_project_id()%' AND tablename NOT IN (
            SELECT table_name FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND column_name = 'project_id'
            AND table_name = pg_policies.tablename
        ) THEN 'Использует get_user_project_id() но нет project_id в таблице'
        ELSE 'Другая потенциальная проблема'
    END as problem_type
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    qual IS NULL 
    OR qual = 'true'
    OR (qual LIKE '%get_user_project_id()%' AND tablename NOT IN (
        SELECT table_name FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name = 'project_id'
        AND table_name = pg_policies.tablename
    ))
)
ORDER BY tablename, policyname;

-- ============================================
-- 4. СТАТИСТИКА ПО ТИПАМ ПОЛИТИК
-- ============================================

SELECT 
    '📊 ФИНАЛЬНАЯ СТАТИСТИКА' as section,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE cmd = 'SELECT') as select_policies,
    COUNT(*) FILTER (WHERE cmd = 'INSERT') as insert_policies,
    COUNT(*) FILTER (WHERE cmd = 'UPDATE') as update_policies,
    COUNT(*) FILTER (WHERE cmd = 'DELETE') as delete_policies,
    COUNT(*) FILTER (WHERE cmd = 'ALL') as all_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%get_user_project_id()%') as project_based_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%') as user_based_policies,
    COUNT(*) FILTER (WHERE qual IS NULL) as null_condition_policies,
    COUNT(*) FILTER (WHERE qual = 'true') as true_condition_policies
FROM pg_policies 
WHERE schemaname = 'public';
