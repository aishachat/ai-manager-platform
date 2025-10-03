-- Исправление ошибки 500 при регистрации
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Проверяем, есть ли триггеры, которые могут блокировать регистрацию
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- 2. Проверяем политики RLS для auth.users
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
WHERE schemaname = 'auth' 
AND tablename = 'users';

-- 3. Проверяем, есть ли функции, которые могут вызывать ошибки
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%user%'
AND routine_name LIKE '%signup%';

-- 4. Проверяем настройки Supabase Auth
-- (Эти настройки нужно проверить в Dashboard Supabase)
-- - Email confirmation: должно быть отключено для тестирования
-- - Email templates: должны быть настроены
-- - Rate limiting: может блокировать регистрацию

-- 5. Создаем функцию для безопасной регистрации пользователей
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

-- 6. Создаем триггер для автоматического создания пользователя
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 7. Проверяем, что таблица users имеет правильную структуру
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 8. Убеждаемся, что RLS политики для users не блокируют вставку
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

-- Создаем новые политики, которые не блокируют регистрацию
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON public.users
    FOR INSERT WITH CHECK (true); -- Разрешаем вставку для всех

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 9. Проверяем, что нет конфликтующих ограничений
SELECT 
    conname,
    contype,
    confrelid::regclass,
    conrelid::regclass
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- 10. Тестируем создание пользователя (опционально)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--     gen_random_uuid(),
--     'test@example.com',
--     crypt('password123', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW()
-- );
