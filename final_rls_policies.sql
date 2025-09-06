-- Финальный исправленный скрипт RLS политик

-- 1. Таблица model_settings (user_id uuid)
ALTER TABLE model_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own model settings" ON model_settings;
DROP POLICY IF EXISTS "Users can insert own model settings" ON model_settings;
DROP POLICY IF EXISTS "Users can update own model settings" ON model_settings;
DROP POLICY IF EXISTS "Users can delete own model settings" ON model_settings;

CREATE POLICY "Users can view own model settings" ON model_settings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own model settings" ON model_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own model settings" ON model_settings
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own model settings" ON model_settings
    FOR DELETE USING (auth.uid() = user_id);

-- 2. Таблица conversations (owner_id uuid)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;

CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own conversations" ON conversations
    FOR DELETE USING (auth.uid() = owner_id);

-- 3. Таблица messages (owner_id uuid)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;

CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own messages" ON messages
    FOR DELETE USING (auth.uid() = owner_id);

-- 4. Таблица profiles (id uuid)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- 5. Таблица users (id bigint) - пропускаем, управляется Supabase Auth
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Users can view own user record" ON users;
-- DROP POLICY IF EXISTS "Users can insert own user record" ON users;
-- DROP POLICY IF EXISTS "Users can update own user record" ON users;
-- DROP POLICY IF EXISTS "Users can delete own user record" ON users;

-- CREATE POLICY "Users can view own user record" ON users
--     FOR SELECT USING (auth.uid()::bigint = id);
-- CREATE POLICY "Users can insert own user record" ON users
--     FOR INSERT WITH CHECK (auth.uid()::bigint = id);
-- CREATE POLICY "Users can update own user record" ON users
--     FOR UPDATE USING (auth.uid()::bigint = id);
-- CREATE POLICY "Users can delete own user record" ON users
--     FOR DELETE USING (auth.uid()::bigint = id);

-- 6. Таблица ai_agent_settings (user_id uuid)
ALTER TABLE ai_agent_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own ai agent settings" ON ai_agent_settings;
DROP POLICY IF EXISTS "Users can insert own ai agent settings" ON ai_agent_settings;
DROP POLICY IF EXISTS "Users can update own ai agent settings" ON ai_agent_settings;
DROP POLICY IF EXISTS "Users can delete own ai agent settings" ON ai_agent_settings;

CREATE POLICY "Users can view own ai agent settings" ON ai_agent_settings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai agent settings" ON ai_agent_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ai agent settings" ON ai_agent_settings
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai agent settings" ON ai_agent_settings
    FOR DELETE USING (auth.uid() = user_id);

-- 7. Таблица bot_corrections (user_id bigint) - пропускаем из-за несовместимости типов
-- ALTER TABLE bot_corrections ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Users can view own bot corrections" ON bot_corrections;
-- DROP POLICY IF EXISTS "Users can insert own bot corrections" ON bot_corrections;
-- DROP POLICY IF EXISTS "Users can update own bot corrections" ON bot_corrections;
-- DROP POLICY IF EXISTS "Users can delete own bot corrections" ON bot_corrections;

-- CREATE POLICY "Users can view own bot corrections" ON bot_corrections
--     FOR SELECT USING (auth.uid()::bigint = user_id);
-- CREATE POLICY "Users can insert own bot corrections" ON bot_corrections
--     FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
-- CREATE POLICY "Users can update own bot corrections" ON bot_corrections
--     FOR UPDATE USING (auth.uid()::bigint = user_id);
-- CREATE POLICY "Users can delete own bot corrections" ON bot_corrections
--     FOR DELETE USING (auth.uid()::bigint = user_id);

-- 8. Таблица chat_history (user_id bigint) - пропускаем из-за несовместимости типов
-- ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Users can view own chat history" ON chat_history;
-- DROP POLICY IF EXISTS "Users can insert own chat history" ON chat_history;
-- DROP POLICY IF EXISTS "Users can update own chat history" ON chat_history;
-- DROP POLICY IF EXISTS "Users can delete own chat history" ON chat_history;

-- CREATE POLICY "Users can view own chat history" ON chat_history
--     FOR SELECT USING (auth.uid()::bigint = user_id);
-- CREATE POLICY "Users can insert own chat history" ON chat_history
--     FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
-- CREATE POLICY "Users can update own chat history" ON chat_history
--     FOR UPDATE USING (auth.uid()::bigint = user_id);
-- CREATE POLICY "Users can delete own chat history" ON chat_history
--     FOR DELETE USING (auth.uid()::bigint = user_id);

-- 9. Таблица knowledge_base (user_id bigint)
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Users can insert own knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Users can update own knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Users can delete own knowledge base" ON knowledge_base;

CREATE POLICY "Users can view own knowledge base" ON knowledge_base
    FOR SELECT USING (auth.uid()::bigint = user_id);
CREATE POLICY "Users can insert own knowledge base" ON knowledge_base
    FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
CREATE POLICY "Users can update own knowledge base" ON knowledge_base
    FOR UPDATE USING (auth.uid()::bigint = user_id);
CREATE POLICY "Users can delete own knowledge base" ON knowledge_base
    FOR DELETE USING (auth.uid()::bigint = user_id);

-- 10. Таблица knowledge_items (owner_id uuid)
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own knowledge items" ON knowledge_items;
DROP POLICY IF EXISTS "Users can insert own knowledge items" ON knowledge_items;
DROP POLICY IF EXISTS "Users can update own knowledge items" ON knowledge_items;
DROP POLICY IF EXISTS "Users can delete own knowledge items" ON knowledge_items;

CREATE POLICY "Users can view own knowledge items" ON knowledge_items
    FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own knowledge items" ON knowledge_items
    FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own knowledge items" ON knowledge_items
    FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own knowledge items" ON knowledge_items
    FOR DELETE USING (auth.uid() = owner_id);

-- 11. Таблица assistants (owner_id uuid)
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own assistants" ON assistants;
DROP POLICY IF EXISTS "Users can insert own assistants" ON assistants;
DROP POLICY IF EXISTS "Users can update own assistants" ON assistants;
DROP POLICY IF EXISTS "Users can delete own assistants" ON assistants;

CREATE POLICY "Users can view own assistants" ON assistants
    FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own assistants" ON assistants
    FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own assistants" ON assistants
    FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own assistants" ON assistants
    FOR DELETE USING (auth.uid() = owner_id);

-- 12. Таблица integrations (owner_id uuid)
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can insert own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can update own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can delete own integrations" ON integrations;

CREATE POLICY "Users can view own integrations" ON integrations
    FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own integrations" ON integrations
    FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own integrations" ON integrations
    FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own integrations" ON integrations
    FOR DELETE USING (auth.uid() = owner_id);

-- 13. Таблица assistant_settings (user_id uuid)
ALTER TABLE assistant_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own assistant settings" ON assistant_settings;
DROP POLICY IF EXISTS "Users can insert own assistant settings" ON assistant_settings;
DROP POLICY IF EXISTS "Users can update own assistant settings" ON assistant_settings;
DROP POLICY IF EXISTS "Users can delete own assistant settings" ON assistant_settings;

CREATE POLICY "Users can view own assistant settings" ON assistant_settings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assistant settings" ON assistant_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assistant settings" ON assistant_settings
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assistant settings" ON assistant_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Проверяем что все таблицы имеют RLS включен
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
