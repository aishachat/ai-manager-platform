-- Простые RLS политики для основных таблиц

-- 1. Таблица model_settings (если еще не создана)
CREATE TABLE IF NOT EXISTS model_settings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL,
    system_prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Включаем RLS для model_settings
ALTER TABLE model_settings ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики если есть
DROP POLICY IF EXISTS "Users can view own model settings" ON model_settings;
DROP POLICY IF EXISTS "Users can insert own model settings" ON model_settings;
DROP POLICY IF EXISTS "Users can update own model settings" ON model_settings;
DROP POLICY IF EXISTS "Users can delete own model settings" ON model_settings;

-- Создаем политики для model_settings
CREATE POLICY "Users can view own model settings" ON model_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own model settings" ON model_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own model settings" ON model_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own model settings" ON model_settings
    FOR DELETE USING (auth.uid() = user_id);

-- 2. Таблица conversations (если есть)
-- Проверяем существует ли таблица
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
        ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
        DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
        DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
        DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
        
        CREATE POLICY "Users can view own conversations" ON conversations
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert own conversations" ON conversations
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update own conversations" ON conversations
            FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete own conversations" ON conversations
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Таблица messages (если есть)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own messages" ON messages;
        DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
        DROP POLICY IF EXISTS "Users can update own messages" ON messages;
        DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
        
        CREATE POLICY "Users can view own messages" ON messages
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert own messages" ON messages
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update own messages" ON messages
            FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete own messages" ON messages
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. Таблица profiles (если есть)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
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
    END IF;
END $$;


