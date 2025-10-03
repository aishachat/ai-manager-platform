-- 🔧 ШАГ 1: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ USERS
-- Базовая таблица пользователей

-- ============================================
-- 1. ПРОВЕРЯЕМ ТЕКУЩЕЕ СОСТОЯНИЕ ТАБЛИЦЫ USERS
-- ============================================

-- Проверяем структуру таблицы
SELECT 
    '📋 СТРУКТУРА ТАБЛИЦЫ USERS' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Проверяем текущий статус RLS
SELECT 
    '🔒 СТАТУС RLS' as section,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- Проверяем текущие политики
SELECT 
    '📜 ТЕКУЩИЕ ПОЛИТИКИ' as section,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY cmd, policyname;

-- Проверяем количество записей
SELECT 
    '📊 КОЛИЧЕСТВО ЗАПИСЕЙ' as section,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE id IS NOT NULL) as users_with_id,
    COUNT(*) FILTER (WHERE email IS NOT NULL) as users_with_email
FROM public.users;

-- ============================================
-- 2. ИСПРАВЛЯЕМ RLS ДЛЯ ТАБЛИЦЫ USERS
-- ============================================

-- Включаем RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Удаляем все старые политики
DROP POLICY IF EXISTS "users_all" ON public.users;
DROP POLICY IF EXISTS "Users can view their own users" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own users" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own users" ON public.users;
DROP POLICY IF EXISTS "users_own_access" ON public.users;
DROP POLICY IF EXISTS "users_policy" ON public.users;

-- Создаем правильную политику для users
-- Пользователь может видеть и изменять только свою запись
CREATE POLICY "users_own_access" ON public.users
    FOR ALL USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Предоставляем права
GRANT ALL ON public.users TO authenticated;

-- ============================================
-- 3. ПРОВЕРЯЕМ КАЧЕСТВО ИСПРАВЛЕНИЯ
-- ============================================

-- Проверяем статус RLS после исправления
SELECT 
    '✅ СТАТУС RLS ПОСЛЕ ИСПРАВЛЕНИЯ' as section,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- Проверяем новые политики
SELECT 
    '✅ НОВЫЕ ПОЛИТИКИ' as section,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY cmd, policyname;

-- Проверяем права доступа
SELECT 
    '🔑 ПРАВА ДОСТУПА' as section,
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY grantee, privilege_type;

-- ============================================
-- 4. ТЕСТИРУЕМ ИЗОЛЯЦИЮ ДАННЫХ
-- ============================================

-- Проверяем, что политика работает корректно
-- (Этот запрос должен выполняться от имени аутентифицированного пользователя)
SELECT 
    '🧪 ТЕСТ ИЗОЛЯЦИИ' as section,
    'Пользователь видит только свою запись' as test_description,
    COUNT(*) as visible_records
FROM public.users;

-- ============================================
-- 5. ИТОГОВЫЙ ОТЧЕТ ПО ТАБЛИЦЕ USERS
-- ============================================

SELECT 
    '📋 ИТОГОВЫЙ ОТЧЕТ ПО USERS' as section,
    'RLS включен' as rls_status,
    'Политика users_own_access создана' as policy_status,
    'Права предоставлены' as permissions_status,
    'Готово к следующему шагу' as next_step
UNION ALL
SELECT 
    '📊 СТАТИСТИКА' as section,
    'Всего пользователей: ' || COUNT(*)::text as rls_status,
    'С RLS политиками: ' || (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users')::text as policy_status,
    'Права для authenticated: ' || (SELECT COUNT(*) FROM information_schema.table_privileges WHERE table_schema = 'public' AND table_name = 'users' AND grantee = 'authenticated')::text as permissions_status,
    'Следующий шаг: projects' as next_step
FROM public.users;
