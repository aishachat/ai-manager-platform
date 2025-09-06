-- Миграция всех таблиц с bigint на uuid типы

-- 1. Создаем новые колонки с uuid типом
ALTER TABLE bot_corrections ADD COLUMN user_uuid UUID;
ALTER TABLE chat_history ADD COLUMN user_uuid UUID;
ALTER TABLE knowledge_base ADD COLUMN user_uuid UUID;
ALTER TABLE users ADD COLUMN user_uuid UUID;

-- 2. Создаем индексы для новых колонок
CREATE INDEX idx_bot_corrections_user_uuid ON bot_corrections(user_uuid);
CREATE INDEX idx_chat_history_user_uuid ON chat_history(user_uuid);
CREATE INDEX idx_knowledge_base_user_uuid ON knowledge_base(user_uuid);
CREATE INDEX idx_users_user_uuid ON users(user_uuid);

-- 3. Включаем RLS для всех таблиц
ALTER TABLE bot_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Создаем RLS политики для новых колонок
-- bot_corrections
DROP POLICY IF EXISTS "Users can view own bot corrections" ON bot_corrections;
DROP POLICY IF EXISTS "Users can insert own bot corrections" ON bot_corrections;
DROP POLICY IF EXISTS "Users can update own bot corrections" ON bot_corrections;
DROP POLICY IF EXISTS "Users can delete own bot corrections" ON bot_corrections;

CREATE POLICY "Users can view own bot corrections" ON bot_corrections
    FOR SELECT USING (auth.uid() = user_uuid);
CREATE POLICY "Users can insert own bot corrections" ON bot_corrections
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);
CREATE POLICY "Users can update own bot corrections" ON bot_corrections
    FOR UPDATE USING (auth.uid() = user_uuid);
CREATE POLICY "Users can delete own bot corrections" ON bot_corrections
    FOR DELETE USING (auth.uid() = user_uuid);

-- chat_history
DROP POLICY IF EXISTS "Users can view own chat history" ON chat_history;
DROP POLICY IF EXISTS "Users can insert own chat history" ON chat_history;
DROP POLICY IF EXISTS "Users can update own chat history" ON chat_history;
DROP POLICY IF EXISTS "Users can delete own chat history" ON chat_history;

CREATE POLICY "Users can view own chat history" ON chat_history
    FOR SELECT USING (auth.uid() = user_uuid);
CREATE POLICY "Users can insert own chat history" ON chat_history
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);
CREATE POLICY "Users can update own chat history" ON chat_history
    FOR UPDATE USING (auth.uid() = user_uuid);
CREATE POLICY "Users can delete own chat history" ON chat_history
    FOR DELETE USING (auth.uid() = user_uuid);

-- knowledge_base
DROP POLICY IF EXISTS "Users can view own knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Users can insert own knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Users can update own knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Users can delete own knowledge base" ON knowledge_base;

CREATE POLICY "Users can view own knowledge base" ON knowledge_base
    FOR SELECT USING (auth.uid() = user_uuid);
CREATE POLICY "Users can insert own knowledge base" ON knowledge_base
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);
CREATE POLICY "Users can update own knowledge base" ON knowledge_base
    FOR UPDATE USING (auth.uid() = user_uuid);
CREATE POLICY "Users can delete own knowledge base" ON knowledge_base
    FOR DELETE USING (auth.uid() = user_uuid);

-- users
DROP POLICY IF EXISTS "Users can view own user record" ON users;
DROP POLICY IF EXISTS "Users can insert own user record" ON users;
DROP POLICY IF EXISTS "Users can update own user record" ON users;
DROP POLICY IF EXISTS "Users can delete own user record" ON users;

CREATE POLICY "Users can view own user record" ON users
    FOR SELECT USING (auth.uid() = user_uuid);
CREATE POLICY "Users can insert own user record" ON users
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);
CREATE POLICY "Users can update own user record" ON users
    FOR UPDATE USING (auth.uid() = user_uuid);
CREATE POLICY "Users can delete own user record" ON users
    FOR DELETE USING (auth.uid() = user_uuid);


