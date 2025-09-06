-- Настройка Row Level Security (RLS) для всех таблиц
-- Этот скрипт уберет метки "Unrestricted" и обеспечит безопасность данных

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

-- 1. ai_agent_settings
DO $$
DECLARE
    user_id_type text;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ai_agent_settings') THEN
        user_id_type := get_user_id_column_type('ai_agent_settings');
        ALTER TABLE ai_agent_settings ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own ai_agent_settings" ON ai_agent_settings;
        DROP POLICY IF EXISTS "Users can insert own ai_agent_settings" ON ai_agent_settings;
        DROP POLICY IF EXISTS "Users can update own ai_agent_settings" ON ai_agent_settings;
        DROP POLICY IF EXISTS "Users can delete own ai_agent_settings" ON ai_agent_settings;
        
        IF user_id_type = 'uuid' THEN
            CREATE POLICY "Users can view own ai_agent_settings" ON ai_agent_settings
                FOR SELECT USING (auth.uid() = user_id);
            CREATE POLICY "Users can insert own ai_agent_settings" ON ai_agent_settings
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            CREATE POLICY "Users can update own ai_agent_settings" ON ai_agent_settings
                FOR UPDATE USING (auth.uid() = user_id);
            CREATE POLICY "Users can delete own ai_agent_settings" ON ai_agent_settings
                FOR DELETE USING (auth.uid() = user_id);
        ELSE
            CREATE POLICY "Users can view own ai_agent_settings" ON ai_agent_settings
                FOR SELECT USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can insert own ai_agent_settings" ON ai_agent_settings
                FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can update own ai_agent_settings" ON ai_agent_settings
                FOR UPDATE USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can delete own ai_agent_settings" ON ai_agent_settings
                FOR DELETE USING (auth.uid()::bigint = user_id);
        END IF;
    END IF;
END $$;

-- 2. bot_corrections
DO $$
DECLARE
    user_id_type text;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bot_corrections') THEN
        user_id_type := get_user_id_column_type('bot_corrections');
        ALTER TABLE bot_corrections ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own bot_corrections" ON bot_corrections;
        DROP POLICY IF EXISTS "Users can insert own bot_corrections" ON bot_corrections;
        DROP POLICY IF EXISTS "Users can update own bot_corrections" ON bot_corrections;
        DROP POLICY IF EXISTS "Users can delete own bot_corrections" ON bot_corrections;
        
        IF user_id_type = 'uuid' THEN
            CREATE POLICY "Users can view own bot_corrections" ON bot_corrections
                FOR SELECT USING (auth.uid() = user_id);
            CREATE POLICY "Users can insert own bot_corrections" ON bot_corrections
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            CREATE POLICY "Users can update own bot_corrections" ON bot_corrections
                FOR UPDATE USING (auth.uid() = user_id);
            CREATE POLICY "Users can delete own bot_corrections" ON bot_corrections
                FOR DELETE USING (auth.uid() = user_id);
        ELSE
            CREATE POLICY "Users can view own bot_corrections" ON bot_corrections
                FOR SELECT USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can insert own bot_corrections" ON bot_corrections
                FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can update own bot_corrections" ON bot_corrections
                FOR UPDATE USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can delete own bot_corrections" ON bot_corrections
                FOR DELETE USING (auth.uid()::bigint = user_id);
        END IF;
    END IF;
END $$;

-- 3. chat_history
DO $$
DECLARE
    user_id_type text;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chat_history') THEN
        user_id_type := get_user_id_column_type('chat_history');
        ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own chat_history" ON chat_history;
        DROP POLICY IF EXISTS "Users can insert own chat_history" ON chat_history;
        DROP POLICY IF EXISTS "Users can update own chat_history" ON chat_history;
        DROP POLICY IF EXISTS "Users can delete own chat_history" ON chat_history;
        
        IF user_id_type = 'uuid' THEN
            CREATE POLICY "Users can view own chat_history" ON chat_history
                FOR SELECT USING (auth.uid() = user_id);
            CREATE POLICY "Users can insert own chat_history" ON chat_history
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            CREATE POLICY "Users can update own chat_history" ON chat_history
                FOR UPDATE USING (auth.uid() = user_id);
            CREATE POLICY "Users can delete own chat_history" ON chat_history
                FOR DELETE USING (auth.uid() = user_id);
        ELSE
            CREATE POLICY "Users can view own chat_history" ON chat_history
                FOR SELECT USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can insert own chat_history" ON chat_history
                FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can update own chat_history" ON chat_history
                FOR UPDATE USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can delete own chat_history" ON chat_history
                FOR DELETE USING (auth.uid()::bigint = user_id);
        END IF;
    END IF;
END $$;

-- 4. knowledge_base
DO $$
DECLARE
    user_id_type text;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'knowledge_base') THEN
        user_id_type := get_user_id_column_type('knowledge_base');
        ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own knowledge_base" ON knowledge_base;
        DROP POLICY IF EXISTS "Users can insert own knowledge_base" ON knowledge_base;
        DROP POLICY IF EXISTS "Users can update own knowledge_base" ON knowledge_base;
        DROP POLICY IF EXISTS "Users can delete own knowledge_base" ON knowledge_base;
        
        IF user_id_type = 'uuid' THEN
            CREATE POLICY "Users can view own knowledge_base" ON knowledge_base
                FOR SELECT USING (auth.uid() = user_id);
            CREATE POLICY "Users can insert own knowledge_base" ON knowledge_base
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            CREATE POLICY "Users can update own knowledge_base" ON knowledge_base
                FOR UPDATE USING (auth.uid() = user_id);
            CREATE POLICY "Users can delete own knowledge_base" ON knowledge_base
                FOR DELETE USING (auth.uid() = user_id);
        ELSE
            CREATE POLICY "Users can view own knowledge_base" ON knowledge_base
                FOR SELECT USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can insert own knowledge_base" ON knowledge_base
                FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can update own knowledge_base" ON knowledge_base
                FOR UPDATE USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can delete own knowledge_base" ON knowledge_base
                FOR DELETE USING (auth.uid()::bigint = user_id);
        END IF;
    END IF;
END $$;

-- 5. users (если это не системная таблица auth.users)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own profile" ON users;
        DROP POLICY IF EXISTS "Users can update own profile" ON users;
        
        -- Проверяем, есть ли колонка id или user_id
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id') THEN
            CREATE POLICY "Users can view own profile" ON users
                FOR SELECT USING (auth.uid() = id);
            CREATE POLICY "Users can update own profile" ON users
                FOR UPDATE USING (auth.uid() = id);
        ELSIF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'user_id') THEN
            CREATE POLICY "Users can view own profile" ON users
                FOR SELECT USING (auth.uid() = user_id);
            CREATE POLICY "Users can update own profile" ON users
                FOR UPDATE USING (auth.uid() = user_id);
        END IF;
    END IF;
END $$;

-- 6. Дополнительные таблицы с проверкой типов
-- agent_additional_settings
DO $$
DECLARE
    user_id_type text;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'agent_additional_settings') THEN
        user_id_type := get_user_id_column_type('agent_additional_settings');
        ALTER TABLE agent_additional_settings ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own agent_additional_settings" ON agent_additional_settings;
        DROP POLICY IF EXISTS "Users can insert own agent_additional_settings" ON agent_additional_settings;
        DROP POLICY IF EXISTS "Users can update own agent_additional_settings" ON agent_additional_settings;
        DROP POLICY IF EXISTS "Users can delete own agent_additional_settings" ON agent_additional_settings;
        
        IF user_id_type = 'uuid' THEN
            CREATE POLICY "Users can view own agent_additional_settings" ON agent_additional_settings
                FOR SELECT USING (auth.uid() = user_id);
            CREATE POLICY "Users can insert own agent_additional_settings" ON agent_additional_settings
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            CREATE POLICY "Users can update own agent_additional_settings" ON agent_additional_settings
                FOR UPDATE USING (auth.uid() = user_id);
            CREATE POLICY "Users can delete own agent_additional_settings" ON agent_additional_settings
                FOR DELETE USING (auth.uid() = user_id);
        ELSE
            CREATE POLICY "Users can view own agent_additional_settings" ON agent_additional_settings
                FOR SELECT USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can insert own agent_additional_settings" ON agent_additional_settings
                FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can update own agent_additional_settings" ON agent_additional_settings
                FOR UPDATE USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can delete own agent_additional_settings" ON agent_additional_settings
                FOR DELETE USING (auth.uid()::bigint = user_id);
        END IF;
    END IF;
END $$;

-- agent_clarification_rules
DO $$
DECLARE
    user_id_type text;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'agent_clarification_rules') THEN
        user_id_type := get_user_id_column_type('agent_clarification_rules');
        ALTER TABLE agent_clarification_rules ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own agent_clarification_rules" ON agent_clarification_rules;
        DROP POLICY IF EXISTS "Users can insert own agent_clarification_rules" ON agent_clarification_rules;
        DROP POLICY IF EXISTS "Users can update own agent_clarification_rules" ON agent_clarification_rules;
        DROP POLICY IF EXISTS "Users can delete own agent_clarification_rules" ON agent_clarification_rules;
        
        IF user_id_type = 'uuid' THEN
            CREATE POLICY "Users can view own agent_clarification_rules" ON agent_clarification_rules
                FOR SELECT USING (auth.uid() = user_id);
            CREATE POLICY "Users can insert own agent_clarification_rules" ON agent_clarification_rules
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            CREATE POLICY "Users can update own agent_clarification_rules" ON agent_clarification_rules
                FOR UPDATE USING (auth.uid() = user_id);
            CREATE POLICY "Users can delete own agent_clarification_rules" ON agent_clarification_rules
                FOR DELETE USING (auth.uid() = user_id);
        ELSE
            CREATE POLICY "Users can view own agent_clarification_rules" ON agent_clarification_rules
                FOR SELECT USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can insert own agent_clarification_rules" ON agent_clarification_rules
                FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can update own agent_clarification_rules" ON agent_clarification_rules
                FOR UPDATE USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can delete own agent_clarification_rules" ON agent_clarification_rules
                FOR DELETE USING (auth.uid()::bigint = user_id);
        END IF;
    END IF;
END $$;

-- agent_data_collection
DO $$
DECLARE
    user_id_type text;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'agent_data_collection') THEN
        user_id_type := get_user_id_column_type('agent_data_collection');
        ALTER TABLE agent_data_collection ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own agent_data_collection" ON agent_data_collection;
        DROP POLICY IF EXISTS "Users can insert own agent_data_collection" ON agent_data_collection;
        DROP POLICY IF EXISTS "Users can update own agent_data_collection" ON agent_data_collection;
        DROP POLICY IF EXISTS "Users can delete own agent_data_collection" ON agent_data_collection;
        
        IF user_id_type = 'uuid' THEN
            CREATE POLICY "Users can view own agent_data_collection" ON agent_data_collection
                FOR SELECT USING (auth.uid() = user_id);
            CREATE POLICY "Users can insert own agent_data_collection" ON agent_data_collection
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            CREATE POLICY "Users can update own agent_data_collection" ON agent_data_collection
                FOR UPDATE USING (auth.uid() = user_id);
            CREATE POLICY "Users can delete own agent_data_collection" ON agent_data_collection
                FOR DELETE USING (auth.uid() = user_id);
        ELSE
            CREATE POLICY "Users can view own agent_data_collection" ON agent_data_collection
                FOR SELECT USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can insert own agent_data_collection" ON agent_data_collection
                FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can update own agent_data_collection" ON agent_data_collection
                FOR UPDATE USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can delete own agent_data_collection" ON agent_data_collection
                FOR DELETE USING (auth.uid()::bigint = user_id);
        END IF;
    END IF;
END $$;

-- agent_restrictions
DO $$
DECLARE
    user_id_type text;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'agent_restrictions') THEN
        user_id_type := get_user_id_column_type('agent_restrictions');
        ALTER TABLE agent_restrictions ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own agent_restrictions" ON agent_restrictions;
        DROP POLICY IF EXISTS "Users can insert own agent_restrictions" ON agent_restrictions;
        DROP POLICY IF EXISTS "Users can update own agent_restrictions" ON agent_restrictions;
        DROP POLICY IF EXISTS "Users can delete own agent_restrictions" ON agent_restrictions;
        
        IF user_id_type = 'uuid' THEN
            CREATE POLICY "Users can view own agent_restrictions" ON agent_restrictions
                FOR SELECT USING (auth.uid() = user_id);
            CREATE POLICY "Users can insert own agent_restrictions" ON agent_restrictions
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            CREATE POLICY "Users can update own agent_restrictions" ON agent_restrictions
                FOR UPDATE USING (auth.uid() = user_id);
            CREATE POLICY "Users can delete own agent_restrictions" ON agent_restrictions
                FOR DELETE USING (auth.uid() = user_id);
        ELSE
            CREATE POLICY "Users can view own agent_restrictions" ON agent_restrictions
                FOR SELECT USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can insert own agent_restrictions" ON agent_restrictions
                FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can update own agent_restrictions" ON agent_restrictions
                FOR UPDATE USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can delete own agent_restrictions" ON agent_restrictions
                FOR DELETE USING (auth.uid()::bigint = user_id);
        END IF;
    END IF;
END $$;

-- conversations
DO $$
DECLARE
    user_id_type text;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
        user_id_type := get_user_id_column_type('conversations');
        ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
        DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
        DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
        DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
        
        IF user_id_type = 'uuid' THEN
            CREATE POLICY "Users can view own conversations" ON conversations
                FOR SELECT USING (auth.uid() = user_id);
            CREATE POLICY "Users can insert own conversations" ON conversations
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            CREATE POLICY "Users can update own conversations" ON conversations
                FOR UPDATE USING (auth.uid() = user_id);
            CREATE POLICY "Users can delete own conversations" ON conversations
                FOR DELETE USING (auth.uid() = user_id);
        ELSE
            CREATE POLICY "Users can view own conversations" ON conversations
                FOR SELECT USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can insert own conversations" ON conversations
                FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can update own conversations" ON conversations
                FOR UPDATE USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can delete own conversations" ON conversations
                FOR DELETE USING (auth.uid()::bigint = user_id);
        END IF;
    END IF;
END $$;

-- messages
DO $$
DECLARE
    user_id_type text;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        user_id_type := get_user_id_column_type('messages');
        ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own messages" ON messages;
        DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
        DROP POLICY IF EXISTS "Users can update own messages" ON messages;
        DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
        
        IF user_id_type = 'uuid' THEN
            CREATE POLICY "Users can view own messages" ON messages
                FOR SELECT USING (auth.uid() = user_id);
            CREATE POLICY "Users can insert own messages" ON messages
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            CREATE POLICY "Users can update own messages" ON messages
                FOR UPDATE USING (auth.uid() = user_id);
            CREATE POLICY "Users can delete own messages" ON messages
                FOR DELETE USING (auth.uid() = user_id);
        ELSE
            CREATE POLICY "Users can view own messages" ON messages
                FOR SELECT USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can insert own messages" ON messages
                FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can update own messages" ON messages
                FOR UPDATE USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can delete own messages" ON messages
                FOR DELETE USING (auth.uid()::bigint = user_id);
        END IF;
    END IF;
END $$;

-- knowledge_items
DO $$
DECLARE
    user_id_type text;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'knowledge_items') THEN
        user_id_type := get_user_id_column_type('knowledge_items');
        ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own knowledge_items" ON knowledge_items;
        DROP POLICY IF EXISTS "Users can insert own knowledge_items" ON knowledge_items;
        DROP POLICY IF EXISTS "Users can update own knowledge_items" ON knowledge_items;
        DROP POLICY IF EXISTS "Users can delete own knowledge_items" ON knowledge_items;
        
        IF user_id_type = 'uuid' THEN
            CREATE POLICY "Users can view own knowledge_items" ON knowledge_items
                FOR SELECT USING (auth.uid() = user_id);
            CREATE POLICY "Users can insert own knowledge_items" ON knowledge_items
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            CREATE POLICY "Users can update own knowledge_items" ON knowledge_items
                FOR UPDATE USING (auth.uid() = user_id);
            CREATE POLICY "Users can delete own knowledge_items" ON knowledge_items
                FOR DELETE USING (auth.uid() = user_id);
        ELSE
            CREATE POLICY "Users can view own knowledge_items" ON knowledge_items
                FOR SELECT USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can insert own knowledge_items" ON knowledge_items
                FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can update own knowledge_items" ON knowledge_items
                FOR UPDATE USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can delete own knowledge_items" ON knowledge_items
                FOR DELETE USING (auth.uid()::bigint = user_id);
        END IF;
    END IF;
END $$;

-- profiles
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
        
        CREATE POLICY "Users can view own profile" ON profiles
            FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "Users can update own profile" ON profiles
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- assistants
DO $$
DECLARE
    user_id_type text;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assistants') THEN
        user_id_type := get_user_id_column_type('assistants');
        ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own assistants" ON assistants;
        DROP POLICY IF EXISTS "Users can insert own assistants" ON assistants;
        DROP POLICY IF EXISTS "Users can update own assistants" ON assistants;
        DROP POLICY IF EXISTS "Users can delete own assistants" ON assistants;
        
        IF user_id_type = 'uuid' THEN
            CREATE POLICY "Users can view own assistants" ON assistants
                FOR SELECT USING (auth.uid() = user_id);
            CREATE POLICY "Users can insert own assistants" ON assistants
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            CREATE POLICY "Users can update own assistants" ON assistants
                FOR UPDATE USING (auth.uid() = user_id);
            CREATE POLICY "Users can delete own assistants" ON assistants
                FOR DELETE USING (auth.uid() = user_id);
        ELSE
            CREATE POLICY "Users can view own assistants" ON assistants
                FOR SELECT USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can insert own assistants" ON assistants
                FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can update own assistants" ON assistants
                FOR UPDATE USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can delete own assistants" ON assistants
                FOR DELETE USING (auth.uid()::bigint = user_id);
        END IF;
    END IF;
END $$;

-- integrations
DO $$
DECLARE
    user_id_type text;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'integrations') THEN
        user_id_type := get_user_id_column_type('integrations');
        ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own integrations" ON integrations;
        DROP POLICY IF EXISTS "Users can insert own integrations" ON integrations;
        DROP POLICY IF EXISTS "Users can update own integrations" ON integrations;
        DROP POLICY IF EXISTS "Users can delete own integrations" ON integrations;
        
        IF user_id_type = 'uuid' THEN
            CREATE POLICY "Users can view own integrations" ON integrations
                FOR SELECT USING (auth.uid() = user_id);
            CREATE POLICY "Users can insert own integrations" ON integrations
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            CREATE POLICY "Users can update own integrations" ON integrations
                FOR UPDATE USING (auth.uid() = user_id);
            CREATE POLICY "Users can delete own integrations" ON integrations
                FOR DELETE USING (auth.uid() = user_id);
        ELSE
            CREATE POLICY "Users can view own integrations" ON integrations
                FOR SELECT USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can insert own integrations" ON integrations
                FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can update own integrations" ON integrations
                FOR UPDATE USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can delete own integrations" ON integrations
                FOR DELETE USING (auth.uid()::bigint = user_id);
        END IF;
    END IF;
END $$;

-- assistant_settings
DO $$
DECLARE
    user_id_type text;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assistant_settings') THEN
        user_id_type := get_user_id_column_type('assistant_settings');
        ALTER TABLE assistant_settings ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own assistant_settings" ON assistant_settings;
        DROP POLICY IF EXISTS "Users can insert own assistant_settings" ON assistant_settings;
        DROP POLICY IF EXISTS "Users can update own assistant_settings" ON assistant_settings;
        DROP POLICY IF EXISTS "Users can delete own assistant_settings" ON assistant_settings;
        
        IF user_id_type = 'uuid' THEN
            CREATE POLICY "Users can view own assistant_settings" ON assistant_settings
                FOR SELECT USING (auth.uid() = user_id);
            CREATE POLICY "Users can insert own assistant_settings" ON assistant_settings
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            CREATE POLICY "Users can update own assistant_settings" ON assistant_settings
                FOR UPDATE USING (auth.uid() = user_id);
            CREATE POLICY "Users can delete own assistant_settings" ON assistant_settings
                FOR DELETE USING (auth.uid() = user_id);
        ELSE
            CREATE POLICY "Users can view own assistant_settings" ON assistant_settings
                FOR SELECT USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can insert own assistant_settings" ON assistant_settings
                FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can update own assistant_settings" ON assistant_settings
                FOR UPDATE USING (auth.uid()::bigint = user_id);
            CREATE POLICY "Users can delete own assistant_settings" ON assistant_settings
                FOR DELETE USING (auth.uid()::bigint = user_id);
        END IF;
    END IF;
END $$;

-- Проверка результата
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
