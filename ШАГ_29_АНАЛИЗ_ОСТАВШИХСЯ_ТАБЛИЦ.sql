-- ========================================
-- ШАГ 29: АНАЛИЗ ОСТАВШИХСЯ ТАБЛИЦ
-- ========================================

-- Получаем список всех таблиц в схеме public
SELECT 
    table_name,
    'TABLE' as object_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Проверяем, какие таблицы имеют project_id
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    'HAS_PROJECT_ID' as status
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
AND c.column_name = 'project_id'
ORDER BY t.table_name;

-- Проверяем, какие таблицы имеют user_id
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    'HAS_USER_ID' as status
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
AND c.column_name = 'user_id'
ORDER BY t.table_name;

-- Проверяем, какие таблицы НЕ имеют ни project_id, ни user_id (справочники)
SELECT 
    t.table_name,
    'REFERENCE_TABLE' as status
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
AND t.table_name NOT IN (
    SELECT DISTINCT table_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND column_name IN ('project_id', 'user_id')
)
ORDER BY t.table_name;

-- Проверяем текущие RLS политики для всех таблиц
SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'HAS_POLICIES'
        ELSE 'NO_POLICIES'
    END as rls_status
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
