-- Исправления для базы данных Adapto
-- Выполните эти команды в Supabase SQL Editor

-- 1. Проверяем существующие таблицы
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'assistants', 'ai_agent_settings', 'knowledge_base');

-- 2. Создаем таблицу users если её нет
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    company_name VARCHAR(255),
    phone VARCHAR(50),
    company_field VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Обновляем таблицу assistants если нужно
ALTER TABLE assistants 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS setup_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS setup_data JSONB DEFAULT '{}';

-- 4. Создаем таблицу ai_agent_settings если её нет
CREATE TABLE IF NOT EXISTS ai_agent_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE,
    
    -- Шаг 1: Цели Adapto
    task VARCHAR(50) CHECK (task IN ('Продавать', 'Консультировать')),
    main_goal VARCHAR(100),
    main_goal_custom TEXT,
    sales_cycle TEXT,
    target_audience TEXT,
    
    -- Шаг 2: Правила общения
    addressing VARCHAR(10) CHECK (addressing IN ('Ты', 'Вы')) DEFAULT 'Вы',
    communication_style VARCHAR(50) CHECK (communication_style IN ('Дружелюбный', 'Нейтральный', 'Профессиональный', 'Юмористический')) DEFAULT 'Профессиональный',
    restrictions JSONB DEFAULT '[]',
    restrictions_custom TEXT,
    additional_settings JSONB DEFAULT '[]',
    additional_settings_custom TEXT,
    data_collection JSONB DEFAULT '[]',
    data_collection_custom TEXT,
    clarification_rules JSONB DEFAULT '[]',
    clarification_rules_custom TEXT,
    emoji_usage VARCHAR(20) CHECK (emoji_usage IN ('Никогда', 'Редко', 'Часто')) DEFAULT 'Редко',
    
    -- Шаг 3: Этапы диалога
    dialog_stages JSONB DEFAULT '[]',
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, assistant_id)
);

-- 5. Создаем таблицу knowledge_base если её нет
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('site', 'feed', 'text', 'file')),
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Обработка',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Создаем таблицу bot_corrections если её нет
CREATE TABLE IF NOT EXISTS bot_corrections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE,
    correction TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_assistants_user_id ON assistants(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_settings_user_id ON ai_agent_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_user_id ON knowledge_base(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_corrections_user_id ON bot_corrections(user_id);

-- 8. Включаем RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_corrections ENABLE ROW LEVEL SECURITY;

-- 8. Создаем политики для users (с проверкой существования)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view their own data') THEN
        CREATE POLICY "Users can view their own data" ON users
            FOR SELECT USING (auth.uid()::text = id::text);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can insert their own data') THEN
        CREATE POLICY "Users can insert their own data" ON users
            FOR INSERT WITH CHECK (auth.uid()::text = id::text);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update their own data') THEN
        CREATE POLICY "Users can update their own data" ON users
            FOR UPDATE USING (auth.uid()::text = id::text);
    END IF;
END $$;

-- 9. Создаем политики для assistants (с проверкой существования)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assistants' AND policyname = 'Users can view their own assistants') THEN
        CREATE POLICY "Users can view their own assistants" ON assistants
            FOR SELECT USING (auth.uid()::text = user_id::text);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assistants' AND policyname = 'Users can insert their own assistants') THEN
        CREATE POLICY "Users can insert their own assistants" ON assistants
            FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assistants' AND policyname = 'Users can update their own assistants') THEN
        CREATE POLICY "Users can update their own assistants" ON assistants
            FOR UPDATE USING (auth.uid()::text = user_id::text);
    END IF;
END $$;

-- 10. Создаем политики для ai_agent_settings (с проверкой существования)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_agent_settings' AND policyname = 'Users can view their own agent settings') THEN
        CREATE POLICY "Users can view their own agent settings" ON ai_agent_settings
            FOR SELECT USING (auth.uid()::text = user_id::text);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_agent_settings' AND policyname = 'Users can insert their own agent settings') THEN
        CREATE POLICY "Users can insert their own agent settings" ON ai_agent_settings
            FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_agent_settings' AND policyname = 'Users can update their own agent settings') THEN
        CREATE POLICY "Users can update their own agent settings" ON ai_agent_settings
            FOR UPDATE USING (auth.uid()::text = user_id::text);
    END IF;
END $$;

-- 11. Создаем политики для knowledge_base (с проверкой существования)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'knowledge_base' AND policyname = 'Users can view their own knowledge items') THEN
        CREATE POLICY "Users can view their own knowledge items" ON knowledge_base
            FOR SELECT USING (auth.uid()::text = user_id::text);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'knowledge_base' AND policyname = 'Users can insert their own knowledge items') THEN
        CREATE POLICY "Users can insert their own knowledge items" ON knowledge_base
            FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'knowledge_base' AND policyname = 'Users can update their own knowledge items') THEN
        CREATE POLICY "Users can update their own knowledge items" ON knowledge_base
            FOR UPDATE USING (auth.uid()::text = user_id::text);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'knowledge_base' AND policyname = 'Users can delete their own knowledge items') THEN
        CREATE POLICY "Users can delete their own knowledge items" ON knowledge_base
            FOR DELETE USING (auth.uid()::text = user_id::text);
    END IF;
END $$;

-- 12. Создаем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. Создаем триггеры для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assistants_updated_at ON assistants;
CREATE TRIGGER update_assistants_updated_at 
    BEFORE UPDATE ON assistants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_agent_settings_updated_at ON ai_agent_settings;
CREATE TRIGGER update_ai_agent_settings_updated_at 
    BEFORE UPDATE ON ai_agent_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON knowledge_base;
CREATE TRIGGER update_knowledge_base_updated_at 
    BEFORE UPDATE ON knowledge_base 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 14. Создаем представление для удобного получения данных пользователя
CREATE OR REPLACE VIEW user_profile_view AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.company_name,
    u.phone,
    u.company_field,
    u.created_at,
    COUNT(DISTINCT a.id) as assistants_count,
    COUNT(DISTINCT kb.id) as knowledge_items_count
FROM users u
LEFT JOIN assistants a ON u.id = a.user_id
LEFT JOIN knowledge_base kb ON u.id = kb.user_id
GROUP BY u.id, u.email, u.name, u.company_name, u.phone, u.company_field, u.created_at;

-- 15. Включаем RLS для представления и создаем политику
ALTER VIEW user_profile_view SET (security_invoker = true);

-- 16. Создаем политику для представления (если поддерживается)
-- Примечание: Некоторые версии PostgreSQL могут не поддерживать RLS для представлений
-- В этом случае представление будет использовать RLS базовых таблиц

-- 17. Проверяем структуру таблиц
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'assistants', 'ai_agent_settings', 'knowledge_base')
ORDER BY table_name, ordinal_position;

-- 18. Проверяем политики
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'assistants', 'ai_agent_settings', 'knowledge_base');

-- 19. Проверяем статус RLS для всех объектов
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'assistants', 'ai_agent_settings', 'knowledge_base');
