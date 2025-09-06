-- Полный скрипт RLS политик для всех таблиц

-- Функция для определения типа user_id в таблице
CREATE OR REPLACE FUNCTION get_user_id_column_type(input_table_name text)
RETURNS text AS $$
DECLARE
    column_type text;
BEGIN
    SELECT data_type INTO column_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = input_table_name
    AND column_name = 'user_id';
    
    RETURN column_type;
END;
$$ LANGUAGE plpgsql;

-- 1. Таблица model_settings
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

-- 2. Таблица conversations
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

-- 3. Таблица messages
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

-- 4. Таблица profiles
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

-- 5. Таблица users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own user record" ON users;
DROP POLICY IF EXISTS "Users can insert own user record" ON users;
DROP POLICY IF EXISTS "Users can update own user record" ON users;
DROP POLICY IF EXISTS "Users can delete own user record" ON users;

CREATE POLICY "Users can view own user record" ON users
    FOR SELECT USING (auth.uid()::bigint = id);
CREATE POLICY "Users can insert own user record" ON users
    FOR INSERT WITH CHECK (auth.uid()::bigint = id);
CREATE POLICY "Users can update own user record" ON users
    FOR UPDATE USING (auth.uid()::bigint = id);
CREATE POLICY "Users can delete own user record" ON users
    FOR DELETE USING (auth.uid()::bigint = id);

-- 6. Таблица ai_agent_settings
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

-- 7. Таблица bot_corrections
ALTER TABLE bot_corrections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own bot corrections" ON bot_corrections;
DROP POLICY IF EXISTS "Users can insert own bot corrections" ON bot_corrections;
DROP POLICY IF EXISTS "Users can update own bot corrections" ON bot_corrections;
DROP POLICY IF EXISTS "Users can delete own bot corrections" ON bot_corrections;

CREATE POLICY "Users can view own bot corrections" ON bot_corrections
    FOR SELECT USING (auth.uid()::bigint = user_id);
CREATE POLICY "Users can insert own bot corrections" ON bot_corrections
    FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
CREATE POLICY "Users can update own bot corrections" ON bot_corrections
    FOR UPDATE USING (auth.uid()::bigint = user_id);
CREATE POLICY "Users can delete own bot corrections" ON bot_corrections
    FOR DELETE USING (auth.uid()::bigint = user_id);

-- 8. Таблица chat_history
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own chat history" ON chat_history;
DROP POLICY IF EXISTS "Users can insert own chat history" ON chat_history;
DROP POLICY IF EXISTS "Users can update own chat history" ON chat_history;
DROP POLICY IF EXISTS "Users can delete own chat history" ON chat_history;

CREATE POLICY "Users can view own chat history" ON chat_history
    FOR SELECT USING (auth.uid()::bigint = user_id);
CREATE POLICY "Users can insert own chat history" ON chat_history
    FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
CREATE POLICY "Users can update own chat history" ON chat_history
    FOR UPDATE USING (auth.uid()::bigint = user_id);
CREATE POLICY "Users can delete own chat history" ON chat_history
    FOR DELETE USING (auth.uid()::bigint = user_id);

-- 9. Таблица knowledge_base
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

-- 10. Таблица knowledge_items
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own knowledge items" ON knowledge_items;
DROP POLICY IF EXISTS "Users can insert own knowledge items" ON knowledge_items;
DROP POLICY IF EXISTS "Users can update own knowledge items" ON knowledge_items;
DROP POLICY IF EXISTS "Users can delete own knowledge items" ON knowledge_items;

CREATE POLICY "Users can view own knowledge items" ON knowledge_items
    FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own knowledge items" ON knowledge_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own knowledge items" ON knowledge_items
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own knowledge items" ON knowledge_items
    FOR DELETE USING (auth.uid() = user_id);

-- 11. Таблица assistants
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

-- 12. Таблица integrations
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

-- 13. Таблица assistant_settings
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

-- 14. Таблица agent_additional_settings
ALTER TABLE agent_additional_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own agent additional settings" ON agent_additional_settings;
DROP POLICY IF EXISTS "Users can insert own agent additional settings" ON agent_additional_settings;
DROP POLICY IF EXISTS "Users can update own agent additional settings" ON agent_additional_settings;
DROP POLICY IF EXISTS "Users can delete own agent additional settings" ON agent_additional_settings;

CREATE POLICY "Users can view own agent additional settings" ON agent_additional_settings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own agent additional settings" ON agent_additional_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agent additional settings" ON agent_additional_settings
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own agent additional settings" ON agent_additional_settings
    FOR DELETE USING (auth.uid() = user_id);

-- 15. Таблица agent_clarification_rules
ALTER TABLE agent_clarification_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own agent clarification rules" ON agent_clarification_rules;
DROP POLICY IF EXISTS "Users can insert own agent clarification rules" ON agent_clarification_rules;
DROP POLICY IF EXISTS "Users can update own agent clarification rules" ON agent_clarification_rules;
DROP POLICY IF EXISTS "Users can delete own agent clarification rules" ON agent_clarification_rules;

CREATE POLICY "Users can view own agent clarification rules" ON agent_clarification_rules
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own agent clarification rules" ON agent_clarification_rules
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agent clarification rules" ON agent_clarification_rules
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own agent clarification rules" ON agent_clarification_rules
    FOR DELETE USING (auth.uid() = user_id);

-- 16. Таблица agent_data_collection
ALTER TABLE agent_data_collection ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own agent data collection" ON agent_data_collection;
DROP POLICY IF EXISTS "Users can insert own agent data collection" ON agent_data_collection;
DROP POLICY IF EXISTS "Users can update own agent data collection" ON agent_data_collection;
DROP POLICY IF EXISTS "Users can delete own agent data collection" ON agent_data_collection;

CREATE POLICY "Users can view own agent data collection" ON agent_data_collection
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own agent data collection" ON agent_data_collection
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agent data collection" ON agent_data_collection
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own agent data collection" ON agent_data_collection
    FOR DELETE USING (auth.uid() = user_id);

-- 17. Таблица agent_restrictions
ALTER TABLE agent_restrictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own agent restrictions" ON agent_restrictions;
DROP POLICY IF EXISTS "Users can insert own agent restrictions" ON agent_restrictions;
DROP POLICY IF EXISTS "Users can update own agent restrictions" ON agent_restrictions;
DROP POLICY IF EXISTS "Users can delete own agent restrictions" ON agent_restrictions;

CREATE POLICY "Users can view own agent restrictions" ON agent_restrictions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own agent restrictions" ON agent_restrictions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agent restrictions" ON agent_restrictions
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own agent restrictions" ON agent_restrictions
    FOR DELETE USING (auth.uid() = user_id);

-- Проверяем что все таблицы имеют RLS включен
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
