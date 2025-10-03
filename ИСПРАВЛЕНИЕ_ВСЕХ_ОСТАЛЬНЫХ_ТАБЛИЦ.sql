-- 🚀 ИСПРАВЛЕНИЕ ВСЕХ ОСТАЛЬНЫХ ТАБЛИЦ
-- Добавляем SELECT/UPDATE/DELETE политики с WHERE условиями

-- ============================================
-- 1. AUTOSWITCH_SETTINGS
-- ============================================

DROP POLICY IF EXISTS "Users can view their own autoswitch settings" ON autoswitch_settings;
DROP POLICY IF EXISTS "Users can update their own autoswitch settings" ON autoswitch_settings;
DROP POLICY IF EXISTS "Users can delete their own autoswitch settings" ON autoswitch_settings;

CREATE POLICY "Users can view their own autoswitch settings" ON autoswitch_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own autoswitch settings" ON autoswitch_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own autoswitch settings" ON autoswitch_settings
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 2. CHAT_MESSAGES
-- ============================================

DROP POLICY IF EXISTS "Users can view their own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their own chat messages" ON chat_messages;

CREATE POLICY "Users can view their own chat messages" ON chat_messages
    FOR SELECT USING (project_id = get_user_project_id());

CREATE POLICY "Users can update their own chat messages" ON chat_messages
    FOR UPDATE USING (project_id = get_user_project_id());

CREATE POLICY "Users can delete their own chat messages" ON chat_messages
    FOR DELETE USING (project_id = get_user_project_id());

-- ============================================
-- 3. CONVERSATIONS
-- ============================================

DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;

CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (project_id = get_user_project_id());

CREATE POLICY "Users can update their own conversations" ON conversations
    FOR UPDATE USING (project_id = get_user_project_id());

CREATE POLICY "Users can delete their own conversations" ON conversations
    FOR DELETE USING (project_id = get_user_project_id());

-- ============================================
-- 4. DIALOGS
-- ============================================

DROP POLICY IF EXISTS "Users can view their own dialogs" ON dialogs;
DROP POLICY IF EXISTS "Users can update their own dialogs" ON dialogs;
DROP POLICY IF EXISTS "Users can delete their own dialogs" ON dialogs;

CREATE POLICY "Users can view their own dialogs" ON dialogs
    FOR SELECT USING (project_id = get_user_project_id());

CREATE POLICY "Users can update their own dialogs" ON dialogs
    FOR UPDATE USING (project_id = get_user_project_id());

CREATE POLICY "Users can delete their own dialogs" ON dialogs
    FOR DELETE USING (project_id = get_user_project_id());

-- ============================================
-- 5. KNOWLEDGE_CHUNKS
-- ============================================

DROP POLICY IF EXISTS "Users can view their own knowledge chunks" ON knowledge_chunks;
DROP POLICY IF EXISTS "Users can update their own knowledge chunks" ON knowledge_chunks;
DROP POLICY IF EXISTS "Users can delete their own knowledge chunks" ON knowledge_chunks;

CREATE POLICY "Users can view their own knowledge chunks" ON knowledge_chunks
    FOR SELECT USING (project_id = get_user_project_id());

CREATE POLICY "Users can update their own knowledge chunks" ON knowledge_chunks
    FOR UPDATE USING (project_id = get_user_project_id());

CREATE POLICY "Users can delete their own knowledge chunks" ON knowledge_chunks
    FOR DELETE USING (project_id = get_user_project_id());

-- ============================================
-- 6. KNOWLEDGE_SOURCES
-- ============================================

DROP POLICY IF EXISTS "Users can view their own knowledge sources" ON knowledge_sources;
DROP POLICY IF EXISTS "Users can update their own knowledge sources" ON knowledge_sources;
DROP POLICY IF EXISTS "Users can delete their own knowledge sources" ON knowledge_sources;

CREATE POLICY "Users can view their own knowledge sources" ON knowledge_sources
    FOR SELECT USING (project_id = get_user_project_id());

CREATE POLICY "Users can update their own knowledge sources" ON knowledge_sources
    FOR UPDATE USING (project_id = get_user_project_id());

CREATE POLICY "Users can delete their own knowledge sources" ON knowledge_sources
    FOR DELETE USING (project_id = get_user_project_id());

-- ============================================
-- 7. PROJECTS
-- ============================================

DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "projects_select_owner" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "projects_update" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "projects_select_owner" ON projects
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "projects_update" ON projects
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = owner_id);

-- ============================================
-- 8. TELEGRAM_SETTINGS
-- ============================================

DROP POLICY IF EXISTS "Users can view their own telegram settings" ON telegram_settings;
DROP POLICY IF EXISTS "Users can update their own telegram settings" ON telegram_settings;
DROP POLICY IF EXISTS "Users can delete their own telegram settings" ON telegram_settings;

CREATE POLICY "Users can view their own telegram settings" ON telegram_settings
    FOR SELECT USING (project_id = get_user_project_id());

CREATE POLICY "Users can update their own telegram settings" ON telegram_settings
    FOR UPDATE USING (project_id = get_user_project_id());

CREATE POLICY "Users can delete their own telegram settings" ON telegram_settings
    FOR DELETE USING (project_id = get_user_project_id());

-- ============================================
-- 9. USER_NICHES
-- ============================================

DROP POLICY IF EXISTS "Users can view their own user niches" ON user_niches;
DROP POLICY IF EXISTS "Users can update their own user niches" ON user_niches;
DROP POLICY IF EXISTS "Users can delete their own user niches" ON user_niches;

CREATE POLICY "Users can view their own user niches" ON user_niches
    FOR SELECT USING (project_id = get_user_project_id());

CREATE POLICY "Users can update their own user niches" ON user_niches
    FOR UPDATE USING (project_id = get_user_project_id());

CREATE POLICY "Users can delete their own user niches" ON user_niches
    FOR DELETE USING (project_id = get_user_project_id());

-- ============================================
-- 10. USERS
-- ============================================

DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "users_select" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "users_update" ON users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON users;

CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_select" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_update" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can delete their own profile" ON users
    FOR DELETE USING (auth.uid() = id);

-- ============================================
-- 11. WIDGET_DEVELOPMENT_SETTINGS
-- ============================================

DROP POLICY IF EXISTS "Users can view their own widget settings" ON widget_development_settings;
DROP POLICY IF EXISTS "Users can update their own widget settings" ON widget_development_settings;
DROP POLICY IF EXISTS "Users can delete their own widget settings" ON widget_development_settings;

CREATE POLICY "Users can view their own widget settings" ON widget_development_settings
    FOR SELECT USING (project_id = get_user_project_id());

CREATE POLICY "Users can update their own widget settings" ON widget_development_settings
    FOR UPDATE USING (project_id = get_user_project_id());

CREATE POLICY "Users can delete their own widget settings" ON widget_development_settings
    FOR DELETE USING (project_id = get_user_project_id());

-- ============================================
-- ПРОВЕРЯЕМ РЕЗУЛЬТАТ
-- ============================================

SELECT 
    '🎉 ФИНАЛЬНЫЙ РЕЗУЛЬТАТ' as section,
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
