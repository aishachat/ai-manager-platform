-- ДИАГНОСТИКА ПРОБЛЕМЫ С ПОЛЬЗОВАТЕЛЯМИ
-- Выполнить в Supabase SQL Editor

-- 1. ПРОВЕРИТЬ ПОЛЬЗОВАТЕЛЕЙ В AUTH.USERS
SELECT 
    'auth.users' as table_name,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as with_email
FROM auth.users;

-- 2. ПРОВЕРИТЬ ПОЛЬЗОВАТЕЛЕЙ В PUBLIC.USERS
SELECT 
    'public.users' as table_name,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as with_email
FROM public.users;

-- 3. НАЙТИ ПОЛЬЗОВАТЕЛЕЙ В AUTH.USERS, КОТОРЫХ НЕТ В PUBLIC.USERS
SELECT 
    au.id,
    au.email,
    au.created_at,
    'Missing in public.users' as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
LIMIT 10;

-- 4. НАЙТИ ПОЛЬЗОВАТЕЛЕЙ В PUBLIC.USERS, КОТОРЫХ НЕТ В AUTH.USERS
SELECT 
    pu.id,
    pu.email,
    pu.created_at,
    'Missing in auth.users' as status
FROM public.users pu
LEFT JOIN auth.users au ON pu.id = au.id
WHERE au.id IS NULL
LIMIT 10;

-- 5. ПРОВЕРИТЬ ЗАПИСИ С NULL USER_ID
SELECT 
    'assistants' as table_name,
    COUNT(*) as total_records,
    COUNT(user_id) as with_user_id,
    COUNT(*) - COUNT(user_id) as null_user_id
FROM public.assistants
UNION ALL
SELECT 
    'dialogs' as table_name,
    COUNT(*) as total_records,
    COUNT(user_id) as with_user_id,
    COUNT(*) - COUNT(user_id) as null_user_id
FROM public.dialogs
UNION ALL
SELECT 
    'knowledge_sources' as table_name,
    COUNT(*) as total_records,
    COUNT(user_id) as with_user_id,
    COUNT(*) - COUNT(user_id) as null_user_id
FROM public.knowledge_sources;
