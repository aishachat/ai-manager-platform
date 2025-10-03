-- Исправление RLS политик для существующих таблиц
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Исправление политик для user_niches
ALTER TABLE user_niches ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если есть
DROP POLICY IF EXISTS "Users can view their own user niches" ON user_niches;
DROP POLICY IF EXISTS "Users can insert their own user niches" ON user_niches;
DROP POLICY IF EXISTS "Users can update their own user niches" ON user_niches;
DROP POLICY IF EXISTS "Users can delete their own user niches" ON user_niches;

-- Создаем новые политики
CREATE POLICY "Users can view their own user niches" ON user_niches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user niches" ON user_niches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user niches" ON user_niches
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user niches" ON user_niches
    FOR DELETE USING (auth.uid() = user_id);

-- 2. Исправление политик для widget_development_settings
ALTER TABLE widget_development_settings ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если есть
DROP POLICY IF EXISTS "Users can view their own widget settings" ON widget_development_settings;
DROP POLICY IF EXISTS "Users can insert their own widget settings" ON widget_development_settings;
DROP POLICY IF EXISTS "Users can update their own widget settings" ON widget_development_settings;
DROP POLICY IF EXISTS "Users can delete their own widget settings" ON widget_development_settings;

-- Создаем новые политики
CREATE POLICY "Users can view their own widget settings" ON widget_development_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own widget settings" ON widget_development_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widget settings" ON widget_development_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widget settings" ON widget_development_settings
    FOR DELETE USING (auth.uid() = user_id);

-- 3. Исправление политик для telegram_settings
ALTER TABLE telegram_settings ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если есть
DROP POLICY IF EXISTS "Users can view their own telegram settings" ON telegram_settings;
DROP POLICY IF EXISTS "Users can insert their own telegram settings" ON telegram_settings;
DROP POLICY IF EXISTS "Users can update their own telegram settings" ON telegram_settings;
DROP POLICY IF EXISTS "Users can delete their own telegram settings" ON telegram_settings;

-- Создаем новые политики
CREATE POLICY "Users can view their own telegram settings" ON telegram_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own telegram settings" ON telegram_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own telegram settings" ON telegram_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own telegram settings" ON telegram_settings
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Исправление политик для niches (публичный доступ для чтения)
ALTER TABLE niches ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если есть
DROP POLICY IF EXISTS "Anyone can view niches" ON niches;
DROP POLICY IF EXISTS "Only authenticated users can insert niches" ON niches;
DROP POLICY IF EXISTS "Only authenticated users can update niches" ON niches;
DROP POLICY IF EXISTS "Only authenticated users can delete niches" ON niches;

-- Создаем новые политики
CREATE POLICY "Anyone can view niches" ON niches
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert niches" ON niches
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can update niches" ON niches
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can delete niches" ON niches
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- 5. Исправление политик для projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если есть
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- Создаем новые политики
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = owner_id);

-- 6. Проверяем, что все таблицы имеют правильные политики
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('user_niches', 'widget_development_settings', 'telegram_settings', 'niches', 'projects')
ORDER BY tablename, policyname;
