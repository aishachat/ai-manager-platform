-- Улучшенные RLS политики для исправления проблем с авторизацией
-- Выполните этот скрипт в Supabase SQL Editor

-- ============================================
-- 1. ОТКЛЮЧАЕМ RLS ВРЕМЕННО ДЛЯ ДИАГНОСТИКИ
-- ============================================

-- Отключаем RLS для таблицы users временно
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. ПРОВЕРЯЕМ СТРУКТУРУ ТАБЛИЦЫ USERS
-- ============================================

-- Проверяем структуру таблицы users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- ============================================
-- 3. ПРОВЕРЯЕМ ДАННЫЕ В ТАБЛИЦЕ USERS
-- ============================================

-- Проверяем, есть ли пользователь в таблице users
SELECT 
    id,
    email,
    name,
    created_at,
    updated_at
FROM public.users 
WHERE id = 'f364b29d-c7a3-43f0-9fa2-df8aa693762e'
LIMIT 1;

-- ============================================
-- 4. СОЗДАЕМ ПОЛЬЗОВАТЕЛЯ ЕСЛИ ЕГО НЕТ
-- ============================================

-- Создаем пользователя в таблице users если его нет
INSERT INTO public.users (
    id,
    email,
    name,
    created_at,
    updated_at
) VALUES (
    'f364b29d-c7a3-43f0-9fa2-df8aa693762e',
    'te99999st3@example.com',
    'Тестовый Пользователь',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();

-- ============================================
-- 5. ВКЛЮЧАЕМ RLS С ПРАВИЛЬНЫМИ ПОЛИТИКАМИ
-- ============================================

-- Включаем RLS для таблицы users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Удаляем все старые политики
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own data" ON public.users;

-- Создаем новые улучшенные политики
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can delete their own data" ON public.users
    FOR DELETE USING (auth.uid()::text = id::text);

-- ============================================
-- 6. ИСПРАВЛЯЕМ ПОЛИТИКИ ДЛЯ ДРУГИХ ТАБЛИЦ
-- ============================================

-- Исправляем политики для user_niches
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

-- Исправляем политики для widget_development_settings
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

-- Исправляем политики для telegram_settings
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

-- Исправляем политики для dialogs
ALTER TABLE dialogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own dialogs" ON dialogs;
DROP POLICY IF EXISTS "Users can insert their own dialogs" ON dialogs;
DROP POLICY IF EXISTS "Users can update their own dialogs" ON dialogs;
DROP POLICY IF EXISTS "Users can delete their own dialogs" ON dialogs;

CREATE POLICY "Users can view their own dialogs" ON dialogs
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own dialogs" ON dialogs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own dialogs" ON dialogs
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own dialogs" ON dialogs
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- ============================================
-- 7. СОЗДАЕМ УЛУЧШЕННУЮ ФУНКЦИЮ ДЛЯ ОБРАБОТКИ НОВЫХ ПОЛЬЗОВАТЕЛЕЙ
-- ============================================

-- Создаем улучшенную функцию для обработки новых пользователей
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

-- ============================================
-- 8. СОЗДАЕМ ФУНКЦИЮ ДЛЯ ПРОВЕРКИ ПОДКЛЮЧЕНИЯ
-- ============================================

-- Создаем функцию для проверки подключения к БД
CREATE OR REPLACE FUNCTION test_connection()
RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        'status', 'success',
        'timestamp', NOW(),
        'user_count', (SELECT COUNT(*) FROM public.users),
        'auth_user_count', (SELECT COUNT(*) FROM auth.users)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. ПРОВЕРЯЕМ РЕЗУЛЬТАТ
-- ============================================

-- Проверяем, что все политики созданы
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_niches', 'widget_development_settings', 'telegram_settings', 'dialogs')
ORDER BY tablename, policyname;

-- Проверяем подключение
SELECT test_connection();

-- Проверяем, что пользователь существует
SELECT 
    'Проверка пользователя' as test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE id = 'f364b29d-c7a3-43f0-9fa2-df8aa693762e')
        THEN '✅ Пользователь существует'
        ELSE '❌ Пользователь не найден'
    END as result;

-- Выводим сообщение об успешном выполнении
SELECT '✅ Улучшенные RLS политики применены!' as status;
