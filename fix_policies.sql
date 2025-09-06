-- Исправление политик безопасности для анонимного доступа
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Удаляем старые политики (если они есть)
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

DROP POLICY IF EXISTS "Users can view their own knowledge items" ON knowledge_base;
DROP POLICY IF EXISTS "Users can insert their own knowledge items" ON knowledge_base;
DROP POLICY IF EXISTS "Users can update their own knowledge items" ON knowledge_base;
DROP POLICY IF EXISTS "Users can delete their own knowledge items" ON knowledge_base;

DROP POLICY IF EXISTS "Users can view their own bot corrections" ON bot_corrections;
DROP POLICY IF EXISTS "Users can insert their own bot corrections" ON bot_corrections;
DROP POLICY IF EXISTS "Users can update their own bot corrections" ON bot_corrections;
DROP POLICY IF EXISTS "Users can delete their own bot corrections" ON bot_corrections;

-- 2. Создаем новые политики для анонимного доступа

-- Политики для users (разрешаем все операции для анонимных пользователей)
CREATE POLICY "Allow all operations for users" ON users
    FOR ALL USING (true);

-- Политики для knowledge_base (разрешаем все операции для анонимных пользователей)
CREATE POLICY "Allow all operations for knowledge_base" ON knowledge_base
    FOR ALL USING (true);

-- Политики для bot_corrections (разрешаем все операции для анонимных пользователей)
CREATE POLICY "Allow all operations for bot_corrections" ON bot_corrections
    FOR ALL USING (true);

-- 3. Проверяем, что RLS включен
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_corrections ENABLE ROW LEVEL SECURITY;

