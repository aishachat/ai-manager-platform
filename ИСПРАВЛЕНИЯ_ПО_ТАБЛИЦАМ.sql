-- 🔧 ИСПРАВЛЕНИЯ RLS ПО КАЖДОЙ ТАБЛИЦЕ
-- Применяйте по одной таблице для точного контроля

-- ============================================
-- 1. ASSISTANTS - 1 проблемная политика
-- ============================================

-- Проблема: INSERT политика без условий
DROP POLICY IF EXISTS "Users can insert their own assistants" ON assistants;
CREATE POLICY "Users can insert their own assistants" ON assistants
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- Проверяем результат
SELECT 
    '✅ ASSISTANTS ИСПРАВЛЕН' as status,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'assistants'
ORDER BY cmd, policyname;

-- ============================================
-- 2. AUTOSWITCH_SETTINGS - 1 проблемная политика
-- ============================================

-- Проблема: INSERT политика без условий
DROP POLICY IF EXISTS "Users can insert their own autoswitch settings" ON autoswitch_settings;
CREATE POLICY "Users can insert their own autoswitch settings" ON autoswitch_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Проверяем результат
SELECT 
    '✅ AUTOSWITCH_SETTINGS ИСПРАВЛЕН' as status,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'autoswitch_settings'
ORDER BY cmd, policyname;

-- ============================================
-- 3. CHAT_MESSAGES - 1 проблемная политика
-- ============================================

-- Проблема: INSERT политика без условий
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON chat_messages;
CREATE POLICY "Users can insert their own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- Проверяем результат
SELECT 
    '✅ CHAT_MESSAGES ИСПРАВЛЕН' as status,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'chat_messages'
ORDER BY cmd, policyname;

-- ============================================
-- 4. CONVERSATIONS - 1 проблемная политика
-- ============================================

-- Проблема: INSERT политика без условий
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
CREATE POLICY "Users can insert their own conversations" ON conversations
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- Проверяем результат
SELECT 
    '✅ CONVERSATIONS ИСПРАВЛЕН' as status,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'conversations'
ORDER BY cmd, policyname;

-- ============================================
-- 5. DIALOGS - 1 проблемная политика
-- ============================================

-- Проблема: INSERT политика без условий
DROP POLICY IF EXISTS "Users can insert their own dialogs" ON dialogs;
CREATE POLICY "Users can insert their own dialogs" ON dialogs
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- Проверяем результат
SELECT 
    '✅ DIALOGS ИСПРАВЛЕН' as status,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'dialogs'
ORDER BY cmd, policyname;

-- ============================================
-- 6. KNOWLEDGE_CHUNKS - 1 проблемная политика
-- ============================================

-- Проблема: INSERT политика без условий
DROP POLICY IF EXISTS "Users can insert their own knowledge chunks" ON knowledge_chunks;
CREATE POLICY "Users can insert their own knowledge chunks" ON knowledge_chunks
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- Проверяем результат
SELECT 
    '✅ KNOWLEDGE_CHUNKS ИСПРАВЛЕН' as status,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'knowledge_chunks'
ORDER BY cmd, policyname;

-- ============================================
-- 7. KNOWLEDGE_SOURCES - 1 проблемная политика
-- ============================================

-- Проблема: INSERT политика без условий
DROP POLICY IF EXISTS "Users can insert their own knowledge sources" ON knowledge_sources;
CREATE POLICY "Users can insert their own knowledge sources" ON knowledge_sources
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- Проверяем результат
SELECT 
    '✅ KNOWLEDGE_SOURCES ИСПРАВЛЕН' as status,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'knowledge_sources'
ORDER BY cmd, policyname;

-- ============================================
-- 8. NICHES - 1 проблемная политика
-- ============================================

-- Проблема: INSERT политика без условий
DROP POLICY IF EXISTS "Only authenticated users can insert niches" ON niches;
CREATE POLICY "Only authenticated users can insert niches" ON niches
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Проверяем результат
SELECT 
    '✅ NICHES ИСПРАВЛЕН' as status,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'niches'
ORDER BY cmd, policyname;

-- ============================================
-- 9. PROJECTS - 2 проблемные политики
-- ============================================

-- Проблема 1: INSERT политика без условий
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Проблема 2: INSERT политика без условий
DROP POLICY IF EXISTS "projects_insert" ON projects;
CREATE POLICY "projects_insert" ON projects
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Проверяем результат
SELECT 
    '✅ PROJECTS ИСПРАВЛЕН' as status,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'projects'
ORDER BY cmd, policyname;

-- ============================================
-- 10. TELEGRAM_SETTINGS - 1 проблемная политика
-- ============================================

-- Проблема: INSERT политика без условий
DROP POLICY IF EXISTS "Users can insert their own telegram settings" ON telegram_settings;
CREATE POLICY "Users can insert their own telegram settings" ON telegram_settings
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- Проверяем результат
SELECT 
    '✅ TELEGRAM_SETTINGS ИСПРАВЛЕН' as status,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'telegram_settings'
ORDER BY cmd, policyname;

-- ============================================
-- 11. USER_NICHES - 1 проблемная политика
-- ============================================

-- Проблема: INSERT политика без условий
DROP POLICY IF EXISTS "Users can insert their own user niches" ON user_niches;
CREATE POLICY "Users can insert their own user niches" ON user_niches
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- Проверяем результат
SELECT 
    '✅ USER_NICHES ИСПРАВЛЕН' as status,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'user_niches'
ORDER BY cmd, policyname;

-- ============================================
-- 12. USERS - 3 проблемные политики
-- ============================================

-- Проблема 1: INSERT политика без условий
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Проблема 2: INSERT политика без условий
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Проблема 3: INSERT политика без условий
DROP POLICY IF EXISTS "users_insert" ON users;
CREATE POLICY "users_insert" ON users
    FOR INSERT WITH CHECK (id = auth.uid());

-- Проверяем результат
SELECT 
    '✅ USERS ИСПРАВЛЕН' as status,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY cmd, policyname;

-- ============================================
-- 13. WIDGET_DEVELOPMENT_SETTINGS - 1 проблемная политика
-- ============================================

-- Проблема: INSERT политика без условий
DROP POLICY IF EXISTS "Users can insert their own widget settings" ON widget_development_settings;
CREATE POLICY "Users can insert their own widget settings" ON widget_development_settings
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- Проверяем результат
SELECT 
    '✅ WIDGET_DEVELOPMENT_SETTINGS ИСПРАВЛЕН' as status,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'widget_development_settings'
ORDER BY cmd, policyname;

-- ============================================
-- ФИНАЛЬНАЯ ПРОВЕРКА
-- ============================================

SELECT 
    '🎉 ФИНАЛЬНАЯ ПРОВЕРКА' as section,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE qual IS NULL) as null_condition_policies,
    COUNT(*) FILTER (WHERE qual = 'true') as true_condition_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%get_user_project_id()%') as project_based_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%') as user_based_policies,
    CASE 
        WHEN COUNT(*) FILTER (WHERE qual IS NULL) = 0 THEN '✅ ВСЕ ИСПРАВЛЕНО!'
        ELSE '❌ ОСТАЛИСЬ ПРОБЛЕМЫ'
    END as final_status
FROM pg_policies 
WHERE schemaname = 'public';
