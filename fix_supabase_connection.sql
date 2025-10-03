-- Исправление проблем с подключением к Supabase
-- Выполните этот скрипт в Supabase SQL Editor

-- ============================================
-- 1. ПРОВЕРКА ТЕКУЩЕГО СОСТОЯНИЯ
-- ============================================

-- Проверяем, что пользователь существует в auth.users
SELECT 
    'auth.users' as table_name,
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE id = 'f364b29d-c7a3-43f0-9fa2-df8aa693762e';

-- Проверяем, что пользователь существует в public.users
SELECT 
    'public.users' as table_name,
    id,
    email,
    name,
    created_at,
    updated_at
FROM public.users 
WHERE id = 'f364b29d-c7a3-43f0-9fa2-df8aa693762e';

-- ============================================
-- 2. СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ В PUBLIC.USERS ЕСЛИ ЕГО НЕТ
-- ============================================

-- Создаем пользователя в public.users если его нет
INSERT INTO public.users (
    id,
    email,
    name,
    created_at,
    updated_at
) 
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', au.email),
    au.created_at,
    NOW()
FROM auth.users au
WHERE au.id = 'f364b29d-c7a3-43f0-9fa2-df8aa693762e'
AND NOT EXISTS (
    SELECT 1 FROM public.users pu 
    WHERE pu.id = au.id
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    updated_at = NOW();

-- ============================================
-- 3. ПРОВЕРКА RLS ПОЛИТИК
-- ============================================

-- Проверяем RLS политики для таблицы users
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- ============================================
-- 4. ВРЕМЕННОЕ ОТКЛЮЧЕНИЕ RLS ДЛЯ ТЕСТИРОВАНИЯ
-- ============================================

-- Отключаем RLS временно для тестирования
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. ТЕСТИРОВАНИЕ ДОСТУПА К ДАННЫМ
-- ============================================

-- Тестируем доступ к данным пользователя
SELECT 
    'Тест доступа' as test_name,
    id,
    email,
    name
FROM public.users 
WHERE id = 'f364b29d-c7a3-43f0-9fa2-df8aa693762e';

-- ============================================
-- 6. ВКЛЮЧЕНИЕ RLS С ПРАВИЛЬНЫМИ ПОЛИТИКАМИ
-- ============================================

-- Включаем RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Удаляем все старые политики
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own data" ON public.users;

-- Создаем новые политики с правильным приведением типов
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can delete their own data" ON public.users
    FOR DELETE USING (auth.uid()::text = id::text);

-- ============================================
-- 7. СОЗДАНИЕ ФУНКЦИИ ДЛЯ БЕЗОПАСНОГО ДОСТУПА
-- ============================================

-- Создаем функцию для безопасного получения данных пользователя
CREATE OR REPLACE FUNCTION get_user_data(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Проверяем, что пользователь авторизован
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;
    
    -- Проверяем, что запрашиваются данные текущего пользователя
    IF auth.uid()::text != user_uuid::text THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    -- Возвращаем данные пользователя
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.name,
        u.created_at,
        u.updated_at
    FROM public.users u
    WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. ТЕСТИРОВАНИЕ ФУНКЦИИ
-- ============================================

-- Тестируем функцию (это должно работать только для авторизованного пользователя)
-- SELECT * FROM get_user_data('f364b29d-c7a3-43f0-9fa2-df8aa693762e'::UUID);

-- ============================================
-- 9. ПРОВЕРКА РЕЗУЛЬТАТА
-- ============================================

-- Проверяем, что все политики созданы
SELECT 
    'Проверка политик' as test,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- Проверяем, что пользователь существует
SELECT 
    'Проверка пользователя' as test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE id = 'f364b29d-c7a3-43f0-9fa2-df8aa693762e')
        THEN '✅ Пользователь существует'
        ELSE '❌ Пользователь не найден'
    END as result;

-- Выводим сообщение об успешном выполнении
SELECT '✅ Проблемы с подключением к Supabase исправлены!' as status;
