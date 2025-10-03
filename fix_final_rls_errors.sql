-- Исправление финальных RLS ошибок
-- Этот скрипт исправляет все проблемы с permission denied

-- 1. Исправляем политики для таблицы dialogs
DROP POLICY IF EXISTS "Users can view their own dialogs" ON dialogs;
DROP POLICY IF EXISTS "Users can insert their own dialogs" ON dialogs;
DROP POLICY IF EXISTS "Users can update their own dialogs" ON dialogs;
DROP POLICY IF EXISTS "Users can delete their own dialogs" ON dialogs;

-- Создаем правильные политики для dialogs
CREATE POLICY "Users can view their own dialogs" ON dialogs
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own dialogs" ON dialogs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own dialogs" ON dialogs
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own dialogs" ON dialogs
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- 2. Исправляем политики для таблицы chat_messages
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

-- 3. Исправляем политики для таблицы knowledge_sources
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

-- 4. Исправляем политики для таблицы knowledge_chunks
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

-- 5. Исправляем политики для таблицы assistants
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

-- 6. Исправляем политики для таблицы conversations
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

-- 7. Исправляем политики для таблицы users (для лимитов)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- 8. Включаем RLS для всех таблиц
ALTER TABLE dialogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 9. Проверяем статус RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('dialogs', 'chat_messages', 'knowledge_sources', 'knowledge_chunks', 'assistants', 'conversations', 'users');

-- 10. Проверяем политики
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('dialogs', 'chat_messages', 'knowledge_sources', 'knowledge_chunks', 'assistants', 'conversations', 'users')
ORDER BY tablename, policyname;
