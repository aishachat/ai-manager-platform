-- Создание таблиц для платформы Adapto
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Создаем таблицу users если её нет
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

-- 2. Создаем таблицу knowledge_base
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assistant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('site', 'feed', 'text', 'file')),
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Обработка',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Создаем таблицу bot_corrections
CREATE TABLE IF NOT EXISTS bot_corrections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assistant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    correction TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_user_id ON knowledge_base(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_corrections_user_id ON bot_corrections(user_id);

-- 5. Включаем RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_corrections ENABLE ROW LEVEL SECURITY;

-- 6. Создаем политики для users
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- 7. Создаем политики для knowledge_base
CREATE POLICY "Users can view their own knowledge items" ON knowledge_base
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own knowledge items" ON knowledge_base
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own knowledge items" ON knowledge_base
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own knowledge items" ON knowledge_base
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- 8. Создаем политики для bot_corrections
CREATE POLICY "Users can view their own bot corrections" ON bot_corrections
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own bot corrections" ON bot_corrections
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own bot corrections" ON bot_corrections
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own bot corrections" ON bot_corrections
    FOR DELETE USING (auth.uid()::text = user_id::text);

