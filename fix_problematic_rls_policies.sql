-- 🔒 Исправление проблемных RLS политик
-- Этот скрипт исправляет политики без условий и улучшает безопасность

-- ============================================
-- 1. НАХОДИМ И ИСПРАВЛЯЕМ ПОЛИТИКИ БЕЗ УСЛОВИЙ
-- ============================================

-- Сначала посмотрим, какие политики проблемные
SELECT 
    '🚨 ПРОБЛЕМНЫЕ ПОЛИТИКИ' as section,
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    qual IS NULL 
    OR qual = 'true'
    OR (qual NOT LIKE '%auth.uid()%' AND qual NOT LIKE '%user_id%' AND qual NOT LIKE '%id%')
)
ORDER BY tablename, policyname;

-- ============================================
-- 2. ИСПРАВЛЯЕМ ПОЛИТИКИ ДЛЯ КРИТИЧЕСКИХ ТАБЛИЦ
-- ============================================

-- Исправляем политики для users
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON users;

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can delete their own profile" ON users
    FOR DELETE USING (auth.uid()::text = id::text);

-- Исправляем политики для dialogs
DROP POLICY IF EXISTS "Users can view their own dialogs" ON dialogs;
DROP POLICY IF EXISTS "Users can insert their own dialogs" ON dialogs;
DROP POLICY IF EXISTS "Users can update their own dialogs" ON dialogs;
DROP POLICY IF EXISTS "Users can delete their own dialogs" ON dialogs;

CREATE POLICY "Users can view their own dialogs" ON dialogs
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own dialogs" ON dialogs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own dialogs" ON dialogs
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own dialogs" ON dialogs
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Исправляем политики для chat_messages
DROP POLICY IF EXISTS "Users can view their own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their own chat messages" ON chat_messages;

CREATE POLICY "Users can view their own chat messages" ON chat_messages
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own chat messages" ON chat_messages
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own chat messages" ON chat_messages
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Исправляем политики для knowledge_sources
DROP POLICY IF EXISTS "Users can view their own knowledge sources" ON knowledge_sources;
DROP POLICY IF EXISTS "Users can insert their own knowledge sources" ON knowledge_sources;
DROP POLICY IF EXISTS "Users can update their own knowledge sources" ON knowledge_sources;
DROP POLICY IF EXISTS "Users can delete their own knowledge sources" ON knowledge_sources;

CREATE POLICY "Users can view their own knowledge sources" ON knowledge_sources
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own knowledge sources" ON knowledge_sources
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own knowledge sources" ON knowledge_sources
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own knowledge sources" ON knowledge_sources
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Исправляем политики для knowledge_chunks
DROP POLICY IF EXISTS "Users can view their own knowledge chunks" ON knowledge_chunks;
DROP POLICY IF EXISTS "Users can insert their own knowledge chunks" ON knowledge_chunks;
DROP POLICY IF EXISTS "Users can update their own knowledge chunks" ON knowledge_chunks;
DROP POLICY IF EXISTS "Users can delete their own knowledge chunks" ON knowledge_chunks;

CREATE POLICY "Users can view their own knowledge chunks" ON knowledge_chunks
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own knowledge chunks" ON knowledge_chunks
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own knowledge chunks" ON knowledge_chunks
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own knowledge chunks" ON knowledge_chunks
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Исправляем политики для assistants
DROP POLICY IF EXISTS "Users can view their own assistants" ON assistants;
DROP POLICY IF EXISTS "Users can insert their own assistants" ON assistants;
DROP POLICY IF EXISTS "Users can update their own assistants" ON assistants;
DROP POLICY IF EXISTS "Users can delete their own assistants" ON assistants;

CREATE POLICY "Users can view their own assistants" ON assistants
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own assistants" ON assistants
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own assistants" ON assistants
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own assistants" ON assistants
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Исправляем политики для conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;

CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own conversations" ON conversations
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own conversations" ON conversations
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- ============================================
-- 3. ПРОВЕРЯЕМ РЕЗУЛЬТАТ
-- ============================================

-- Проверяем, сколько политик осталось без условий
SELECT 
    '✅ РЕЗУЛЬТАТ ИСПРАВЛЕНИЙ' as section,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE qual IS NULL) as null_condition_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%') as auth_uid_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%user_id%') as user_id_policies,
    ROUND(
        COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%' OR qual LIKE '%user_id%') * 100.0 / COUNT(*), 
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
    'Требует внимания' as status
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    qual IS NULL 
    OR qual = 'true'
    OR (qual NOT LIKE '%auth.uid()%' AND qual NOT LIKE '%user_id%' AND qual NOT LIKE '%id%')
)
ORDER BY tablename, policyname;
