-- ========================================
-- ШАГ 26: ПРОВЕРКА DIALOG_WITH_OPERATORS
-- ========================================

-- Проверяем, является ли dialog_with_operators таблицей или представлением
SELECT 
    schemaname,
    viewname as object_name,
    viewowner as object_owner,
    'VIEW' as object_type
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'dialog_with_operators'
UNION ALL
SELECT 
    schemaname,
    tablename as object_name,
    tableowner as object_owner,
    'TABLE' as object_type
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'dialog_with_operators';

-- Если это представление, проверяем его структуру
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'dialog_with_operators'
ORDER BY ordinal_position;

-- Проверяем текущие RLS политики
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
AND tablename = 'dialog_with_operators';

-- Проверяем, включен ли RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'dialog_with_operators';

-- Статистика по таблице
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT project_id) as unique_projects,
    COUNT(DISTINCT user_id) as unique_users
FROM public.dialog_with_operators;