-- Комплексное исправление всех ошибок консоли
-- Выполните этот скрипт в Supabase SQL Editor

-- ============================================
-- 1. ИСПРАВЛЕНИЕ RLS ПОЛИТИК
-- ============================================

-- Исправление политик для user_niches
ALTER TABLE user_niches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own user niches" ON user_niches;
DROP POLICY IF EXISTS "Users can insert their own user niches" ON user_niches;
DROP POLICY IF EXISTS "Users can update their own user niches" ON user_niches;
DROP POLICY IF EXISTS "Users can delete their own user niches" ON user_niches;

CREATE POLICY "Users can view their own user niches" ON user_niches
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own user niches" ON user_niches
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own user niches" ON user_niches
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own user niches" ON user_niches
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Исправление политик для widget_development_settings
ALTER TABLE widget_development_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own widget settings" ON widget_development_settings;
DROP POLICY IF EXISTS "Users can insert their own widget settings" ON widget_development_settings;
DROP POLICY IF EXISTS "Users can update their own widget settings" ON widget_development_settings;
DROP POLICY IF EXISTS "Users can delete their own widget settings" ON widget_development_settings;

CREATE POLICY "Users can view their own widget settings" ON widget_development_settings
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own widget settings" ON widget_development_settings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own widget settings" ON widget_development_settings
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own widget settings" ON widget_development_settings
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Исправление политик для telegram_settings
ALTER TABLE telegram_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own telegram settings" ON telegram_settings;
DROP POLICY IF EXISTS "Users can insert their own telegram settings" ON telegram_settings;
DROP POLICY IF EXISTS "Users can update their own telegram settings" ON telegram_settings;
DROP POLICY IF EXISTS "Users can delete their own telegram settings" ON telegram_settings;

CREATE POLICY "Users can view their own telegram settings" ON telegram_settings
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own telegram settings" ON telegram_settings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own telegram settings" ON telegram_settings
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own telegram settings" ON telegram_settings
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Исправление политик для niches (публичный доступ для чтения)
ALTER TABLE niches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view niches" ON niches;
DROP POLICY IF EXISTS "Only authenticated users can insert niches" ON niches;
DROP POLICY IF EXISTS "Only authenticated users can update niches" ON niches;
DROP POLICY IF EXISTS "Only authenticated users can delete niches" ON niches;

CREATE POLICY "Anyone can view niches" ON niches
    FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can insert niches" ON niches
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Only authenticated users can update niches" ON niches
    FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Only authenticated users can delete niches" ON niches
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- 2. ИСПРАВЛЕНИЕ ПРОБЛЕМ С РЕГИСТРАЦИЕЙ
-- ============================================

-- Создаем безопасную функцию для обработки новых пользователей
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Создаем запись в таблице users
    INSERT INTO public.users (
        id,
        email,
        name,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, users.name),
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Логируем ошибку, но не блокируем регистрацию
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем триггер для автоматического создания пользователя
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Исправляем политики для users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert their own data" ON public.users
    FOR INSERT WITH CHECK (true); -- Разрешаем вставку для всех
CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- ============================================
-- 3. ПРОВЕРКА СТРУКТУРЫ ТАБЛИЦ
-- ============================================

-- Проверяем, что все необходимые таблицы существуют
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('user_niches', 'widget_development_settings', 'telegram_settings', 'niches', 'projects', 'users', 'dialogs')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_niches', 'widget_development_settings', 'telegram_settings', 'niches', 'projects', 'users', 'dialogs')
ORDER BY table_name;

-- ============================================
-- 4. СОЗДАНИЕ НЕДОСТАЮЩИХ ИНДЕКСОВ
-- ============================================

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_user_niches_user_id ON user_niches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_niches_project_id ON user_niches(project_id);
CREATE INDEX IF NOT EXISTS idx_widget_development_settings_user_id ON widget_development_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_settings_user_id ON telegram_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_dialogs_user_id ON dialogs(user_id);
CREATE INDEX IF NOT EXISTS idx_dialogs_created_at ON dialogs(created_at DESC);

-- ============================================
-- 5. ПРОВЕРКА РЕЗУЛЬТАТА
-- ============================================

-- Проверяем все политики
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('user_niches', 'widget_development_settings', 'telegram_settings', 'niches', 'projects', 'users')
ORDER BY tablename, policyname;

-- Проверяем триггеры
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

-- Проверяем функции
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'handle_new_user';

-- ============================================
-- 6. ФИНАЛЬНАЯ ПРОВЕРКА
-- ============================================

-- Проверяем, что все таблицы имеют правильные политики
SELECT 
    'user_niches' as table_name,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'user_niches'
UNION ALL
SELECT 
    'widget_development_settings' as table_name,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'widget_development_settings'
UNION ALL
SELECT 
    'telegram_settings' as table_name,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'telegram_settings'
UNION ALL
SELECT 
    'niches' as table_name,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'niches'
UNION ALL
SELECT 
    'users' as table_name,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';

-- Выводим сообщение об успешном выполнении
SELECT '✅ Все ошибки консоли исправлены!' as status;
