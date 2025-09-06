-- Исправление проблемы с UUID в Supabase
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Сначала удаляем старые таблицы с неправильными типами
DROP TABLE IF EXISTS bot_corrections CASCADE;
DROP TABLE IF EXISTS knowledge_base CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Создаем таблицу users с правильными типами
CREATE TABLE users (
    id BIGINT PRIMARY KEY, -- Изменяем на BIGINT для числовых ID
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    company_name VARCHAR(255),
    phone VARCHAR(50),
    company_field VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Создаем таблицу knowledge_base с BIGINT
CREATE TABLE knowledge_base (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    assistant_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('site', 'feed', 'text', 'file')),
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Обработка',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Создаем таблицу bot_corrections с BIGINT
CREATE TABLE bot_corrections (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    assistant_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    correction TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Создаем индексы для производительности
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_knowledge_base_user_id ON knowledge_base(user_id);
CREATE INDEX idx_bot_corrections_user_id ON bot_corrections(user_id);

-- 6. Включаем RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_corrections ENABLE ROW LEVEL SECURITY;

-- 7. Создаем политики для анонимного доступа
CREATE POLICY "Allow all operations for users" ON users
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for knowledge_base" ON knowledge_base
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for bot_corrections" ON bot_corrections
    FOR ALL USING (true);

