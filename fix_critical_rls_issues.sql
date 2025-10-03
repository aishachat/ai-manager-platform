-- 🚨 Исправление критических RLS уязвимостей
-- Этот скрипт исправляет все найденные проблемы безопасности

-- ============================================
-- 1. ИСПРАВЛЯЕМ INSERT ПОЛИТИКИ БЕЗ УСЛОВИЙ
-- ============================================

-- assistants
DROP POLICY IF EXISTS "Users can insert their own assistants" ON assistants;
CREATE POLICY "Users can insert their own assistants" ON assistants
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- autoswitch_settings
DROP POLICY IF EXISTS "Users can insert their own autoswitch settings" ON autoswitch_settings;
CREATE POLICY "Users can insert their own autoswitch settings" ON autoswitch_settings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- chat_messages
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON chat_messages;
CREATE POLICY "Users can insert their own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- conversations
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
CREATE POLICY "Users can insert their own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- dialogs
DROP POLICY IF EXISTS "Users can insert their own dialogs" ON dialogs;
CREATE POLICY "Users can insert their own dialogs" ON dialogs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- knowledge_chunks
DROP POLICY IF EXISTS "Users can insert their own knowledge chunks" ON knowledge_chunks;
CREATE POLICY "Users can insert their own knowledge chunks" ON knowledge_chunks
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- knowledge_sources
DROP POLICY IF EXISTS "Users can insert their own knowledge sources" ON knowledge_sources;
CREATE POLICY "Users can insert their own knowledge sources" ON knowledge_sources
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- niches
DROP POLICY IF EXISTS "Only authenticated users can insert niches" ON niches;
CREATE POLICY "Only authenticated users can insert niches" ON niches
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- project_members
DROP POLICY IF EXISTS "project_members_insert" ON project_members;
CREATE POLICY "project_members_insert" ON project_members
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- projects
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "projects_insert" ON projects;
CREATE POLICY "projects_insert" ON projects
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- telegram_settings
DROP POLICY IF EXISTS "Users can insert their own telegram settings" ON telegram_settings;
CREATE POLICY "Users can insert their own telegram settings" ON telegram_settings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- user_niches
DROP POLICY IF EXISTS "Users can insert their own user niches" ON user_niches;
CREATE POLICY "Users can insert their own user niches" ON user_niches
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- users (исправляем все INSERT политики)
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "users_insert" ON users;
CREATE POLICY "users_insert" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- widget_development_settings
DROP POLICY IF EXISTS "Users can insert their own widget settings" ON widget_development_settings;
CREATE POLICY "Users can insert their own widget settings" ON widget_development_settings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- ============================================
-- 2. ИСПРАВЛЯЕМ SELECT ПОЛИТИКИ С qual="true"
-- ============================================

-- niche_synonyms - делаем доступными только аутентифицированным пользователям
DROP POLICY IF EXISTS "niche_synonyms_select_all" ON niche_synonyms;
CREATE POLICY "niche_synonyms_select_all" ON niche_synonyms
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- niches - исправляем обе политики
DROP POLICY IF EXISTS "Anyone can view niches" ON niches;
CREATE POLICY "Anyone can view niches" ON niches
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "niches_select_all" ON niches;
CREATE POLICY "niches_select_all" ON niches
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- stories - исправляем политику
DROP POLICY IF EXISTS "stories_select_all" ON stories;
CREATE POLICY "stories_select_all" ON stories
    FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

-- ============================================
-- 3. ПРОВЕРЯЕМ РЕЗУЛЬТАТ
-- ============================================

-- Проверяем, сколько политик осталось без условий
SELECT 
    '✅ РЕЗУЛЬТАТ ИСПРАВЛЕНИЙ' as section,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE qual IS NULL) as null_condition_policies,
    COUNT(*) FILTER (WHERE qual = 'true') as true_condition_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%') as auth_uid_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%user_id%') as user_id_policies,
    ROUND(
        COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%' OR qual LIKE '%user_id%' OR qual LIKE '%id%') * 100.0 / COUNT(*), 
        2
    ) as secure_policies_percent
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================
-- 4. ФИНАЛЬНАЯ ПРОВЕРКА БЕЗОПАСНОСТИ
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
        WHEN qual NOT LIKE '%auth.uid()%' AND qual NOT LIKE '%user_id%' AND qual NOT LIKE '%id%' THEN 'Политика без фильтрации по пользователю'
        ELSE 'Другая потенциальная проблема'
    END as vulnerability_type
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    qual IS NULL 
    OR qual = 'true'
    OR (qual NOT LIKE '%auth.uid()%' AND qual NOT LIKE '%user_id%' AND qual NOT LIKE '%id%' AND qual NOT LIKE '%auth.role()%')
)
ORDER BY tablename, policyname;

-- ============================================
-- 5. СТАТИСТИКА ПО ТИПАМ ПОЛИТИК
-- ============================================

SELECT 
    '📊 ОБНОВЛЕННАЯ СТАТИСТИКА' as section,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE cmd = 'SELECT') as select_policies,
    COUNT(*) FILTER (WHERE cmd = 'INSERT') as insert_policies,
    COUNT(*) FILTER (WHERE cmd = 'UPDATE') as update_policies,
    COUNT(*) FILTER (WHERE cmd = 'DELETE') as delete_policies,
    COUNT(*) FILTER (WHERE cmd = 'ALL') as all_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%') as auth_uid_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%user_id%') as user_id_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%id%') as id_policies,
    COUNT(*) FILTER (WHERE qual IS NULL) as null_condition_policies,
    COUNT(*) FILTER (WHERE qual = 'true') as true_condition_policies
FROM pg_policies 
WHERE schemaname = 'public';
