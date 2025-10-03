-- 🔧 ИСПРАВЛЕНИЕ ВСЕХ INSERT ПОЛИТИК
-- Добавляем правильные with_check условия

-- ============================================
-- 1. ASSISTANTS
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own assistants" ON assistants;
CREATE POLICY "Users can insert their own assistants" ON assistants
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- ============================================
-- 2. AUTOSWITCH_SETTINGS
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own autoswitch settings" ON autoswitch_settings;
CREATE POLICY "Users can insert their own autoswitch settings" ON autoswitch_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. CHAT_MESSAGES
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own chat messages" ON chat_messages;
CREATE POLICY "Users can insert their own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- ============================================
-- 4. CONVERSATIONS
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
CREATE POLICY "Users can insert their own conversations" ON conversations
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- ============================================
-- 5. DIALOGS
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own dialogs" ON dialogs;
CREATE POLICY "Users can insert their own dialogs" ON dialogs
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- ============================================
-- 6. KNOWLEDGE_CHUNKS
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own knowledge chunks" ON knowledge_chunks;
CREATE POLICY "Users can insert their own knowledge chunks" ON knowledge_chunks
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- ============================================
-- 7. KNOWLEDGE_SOURCES
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own knowledge sources" ON knowledge_sources;
CREATE POLICY "Users can insert their own knowledge sources" ON knowledge_sources
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- ============================================
-- 8. PROJECT_MEMBERS
-- ============================================

DROP POLICY IF EXISTS "project_members_insert" ON project_members;
CREATE POLICY "project_members_insert" ON project_members
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = project_members.project_id 
        AND projects.owner_id = auth.uid()
    ));

-- ============================================
-- 9. PROJECTS
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "projects_insert" ON projects;
CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- ============================================
-- 10. TELEGRAM_SETTINGS
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own telegram settings" ON telegram_settings;
CREATE POLICY "Users can insert their own telegram settings" ON telegram_settings
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- ============================================
-- 11. USER_NICHES
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own user niches" ON user_niches;
CREATE POLICY "Users can insert their own user niches" ON user_niches
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- ============================================
-- 12. USERS
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "users_insert" ON users;
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 13. WIDGET_DEVELOPMENT_SETTINGS
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own widget settings" ON widget_development_settings;
CREATE POLICY "Users can insert their own widget settings" ON widget_development_settings
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- ============================================
-- ПРОВЕРКА РЕЗУЛЬТАТА
-- ============================================

SELECT 
    '🎉 INSERT ПОЛИТИКИ ИСПРАВЛЕНЫ' as status,
    cmd,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE qual IS NULL) as null_condition_policies,
    COUNT(*) FILTER (WHERE with_check IS NOT NULL) as with_check_policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY cmd
ORDER BY cmd;
