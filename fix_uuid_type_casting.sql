-- Исправление ошибок типов данных UUID vs TEXT
-- Выполните этот скрипт в Supabase SQL Editor

-- ============================================
-- ИСПРАВЛЕНИЕ ПОЛИТИК С ПРАВИЛЬНЫМ ПРИВЕДЕНИЕМ ТИПОВ
-- ============================================

-- 1. Исправление политик для users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

-- Создаем новые политики с правильным приведением типов
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own data" ON public.users
    FOR INSERT WITH CHECK (true); -- Разрешаем вставку для всех

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- 2. Исправление политик для user_niches
ALTER TABLE user_niches ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "Users can view their own user niches" ON user_niches;
DROP POLICY IF EXISTS "Users can insert their own user niches" ON user_niches;
DROP POLICY IF EXISTS "Users can update their own user niches" ON user_niches;
DROP POLICY IF EXISTS "Users can delete their own user niches" ON user_niches;

-- Создаем новые политики с правильным приведением типов
CREATE POLICY "Users can view their own user niches" ON user_niches
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own user niches" ON user_niches
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own user niches" ON user_niches
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own user niches" ON user_niches
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- 3. Исправление политик для widget_development_settings
ALTER TABLE widget_development_settings ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "Users can view their own widget settings" ON widget_development_settings;
DROP POLICY IF EXISTS "Users can insert their own widget settings" ON widget_development_settings;
DROP POLICY IF EXISTS "Users can update their own widget settings" ON widget_development_settings;
DROP POLICY IF EXISTS "Users can delete their own widget settings" ON widget_development_settings;

-- Создаем новые политики с правильным приведением типов
CREATE POLICY "Users can view their own widget settings" ON widget_development_settings
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own widget settings" ON widget_development_settings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own widget settings" ON widget_development_settings
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own widget settings" ON widget_development_settings
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- 4. Исправление политик для telegram_settings
ALTER TABLE telegram_settings ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "Users can view their own telegram settings" ON telegram_settings;
DROP POLICY IF EXISTS "Users can insert their own telegram settings" ON telegram_settings;
DROP POLICY IF EXISTS "Users can update their own telegram settings" ON telegram_settings;
DROP POLICY IF EXISTS "Users can delete their own telegram settings" ON telegram_settings;

-- Создаем новые политики с правильным приведением типов
CREATE POLICY "Users can view their own telegram settings" ON telegram_settings
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own telegram settings" ON telegram_settings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own telegram settings" ON telegram_settings
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own telegram settings" ON telegram_settings
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- 5. Исправление политик для projects (если есть поле owner_id)
DO $$
BEGIN
    -- Проверяем, есть ли таблица projects и поле owner_id
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'projects'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'owner_id'
    ) THEN
        ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
        
        -- Удаляем старые политики
        DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
        DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
        DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
        DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
        
        -- Создаем новые политики с правильным приведением типов
        CREATE POLICY "Users can view their own projects" ON projects
            FOR SELECT USING (auth.uid()::text = owner_id::text);
        
        CREATE POLICY "Users can insert their own projects" ON projects
            FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);
        
        CREATE POLICY "Users can update their own projects" ON projects
            FOR UPDATE USING (auth.uid()::text = owner_id::text);
        
        CREATE POLICY "Users can delete their own projects" ON projects
            FOR DELETE USING (auth.uid()::text = owner_id::text);
    END IF;
END $$;

-- 6. Проверяем результат
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_niches', 'widget_development_settings', 'telegram_settings', 'projects')
ORDER BY tablename, policyname;

-- 7. Проверяем типы данных в таблицах
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_niches', 'widget_development_settings', 'telegram_settings', 'projects')
AND column_name IN ('id', 'user_id', 'owner_id')
ORDER BY table_name, column_name;

-- Выводим сообщение об успешном выполнении
SELECT '✅ Проблемы с типами данных UUID исправлены!' as status;
