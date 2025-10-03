-- Проверка RLS политик для таблицы assistants
-- Выполнить в Supabase SQL Editor

-- 1. Проверяем существование таблицы
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'assistants';

-- 2. Проверяем RLS политики
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'assistants';

-- 3. Проверяем права доступа
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'assistants' AND table_schema = 'public';

-- 4. Проверяем функцию get_user_project_id
SELECT 
    proname, 
    prosrc 
FROM pg_proc 
WHERE proname = 'get_user_project_id';

-- 5. Тестируем доступ к таблице
SELECT COUNT(*) FROM public.assistants;
