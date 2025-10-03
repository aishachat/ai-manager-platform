-- 🚀 ФИНАЛЬНЫЕ ИСПРАВЛЕНИЯ RLS - ВСЕ 17 ПРОБЛЕМНЫХ ПОЛИТИК
-- Копируйте и вставляйте в Supabase Dashboard

-- ============================================
-- ИСПРАВЛЯЕМ ВСЕ 17 ПРОБЛЕМНЫХ INSERT ПОЛИТИК
-- ============================================

-- 1. assistants
DROP POLICY IF EXISTS "Users can insert their own assistants" ON assistants;
CREATE POLICY "Users can insert their own assistants" ON assistants
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- 2. autoswitch_settings  
DROP POLICY IF EXISTS "Users can insert their own autoswitch settings" ON autoswitch_settings;
CREATE POLICY "Users can insert their own autoswitch settings" ON autoswitch_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. chat_messages
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON chat_messages;
CREATE POLICY "Users can insert their own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- 4. conversations
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
CREATE POLICY "Users can insert their own conversations" ON conversations
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- 5. dialogs
DROP POLICY IF EXISTS "Users can insert their own dialogs" ON dialogs;
CREATE POLICY "Users can insert their own dialogs" ON dialogs
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- 6. knowledge_chunks
DROP POLICY IF EXISTS "Users can insert their own knowledge chunks" ON knowledge_chunks;
CREATE POLICY "Users can insert their own knowledge chunks" ON knowledge_chunks
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- 7. knowledge_sources
DROP POLICY IF EXISTS "Users can insert their own knowledge sources" ON knowledge_sources;
CREATE POLICY "Users can insert their own knowledge sources" ON knowledge_sources
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- 8. niches
DROP POLICY IF EXISTS "Only authenticated users can insert niches" ON niches;
CREATE POLICY "Only authenticated users can insert niches" ON niches
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 9. projects (первая)
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- 10. projects (вторая)
DROP POLICY IF EXISTS "projects_insert" ON projects;
CREATE POLICY "projects_insert" ON projects
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- 11. telegram_settings
DROP POLICY IF EXISTS "Users can insert their own telegram settings" ON telegram_settings;
CREATE POLICY "Users can insert their own telegram settings" ON telegram_settings
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- 12. user_niches
DROP POLICY IF EXISTS "Users can insert their own user niches" ON user_niches;
CREATE POLICY "Users can insert their own user niches" ON user_niches
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- 13. users (первая)
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 14. users (вторая)
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 15. users (третья)
DROP POLICY IF EXISTS "users_insert" ON users;
CREATE POLICY "users_insert" ON users
    FOR INSERT WITH CHECK (id = auth.uid());

-- 16. widget_development_settings
DROP POLICY IF EXISTS "Users can insert their own widget settings" ON widget_development_settings;
CREATE POLICY "Users can insert their own widget settings" ON widget_development_settings
    FOR INSERT WITH CHECK (project_id = get_user_project_id());

-- ============================================
-- ПРОВЕРЯЕМ РЕЗУЛЬТАТ
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

-- ============================================
-- ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА
-- ============================================

-- Ищем оставшиеся проблемные политики
SELECT 
    '🔍 ОСТАВШИЕСЯ ПРОБЛЕМЫ' as section,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual IS NULL OR qual = 'true')
ORDER BY tablename, policyname;
