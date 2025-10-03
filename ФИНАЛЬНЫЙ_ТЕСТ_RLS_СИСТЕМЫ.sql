-- ========================================
-- ФИНАЛЬНЫЙ ТЕСТ RLS СИСТЕМЫ
-- ========================================

-- 1. ПРОВЕРКА ВСЕХ RLS ПОЛИТИК
SELECT 
    'ПРОВЕРКА RLS ПОЛИТИК' as test_section,
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN qual IS NOT NULL THEN 'HAS_USING_CLAUSE'
        ELSE 'NO_USING_CLAUSE'
    END as using_status,
    CASE 
        WHEN with_check IS NOT NULL THEN 'HAS_WITH_CHECK'
        ELSE 'NO_WITH_CHECK'
    END as check_status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 2. ПРОВЕРКА ВКЛЮЧЕННОГО RLS
SELECT 
    'ПРОВЕРКА ВКЛЮЧЕННОГО RLS' as test_section,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ВКЛЮЧЕН'
        ELSE '❌ RLS ОТКЛЮЧЕН'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. СТАТИСТИКА ПО ТАБЛИЦАМ
SELECT 
    'СТАТИСТИКА ПО ТАБЛИЦАМ' as test_section,
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 4. ПРОВЕРКА ПРАВ ДОСТУПА
SELECT 
    'ПРОВЕРКА ПРАВ ДОСТУПА' as test_section,
    table_name,
    privilege_type,
    grantee,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
AND grantee IN ('authenticated', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- 5. ТЕСТ ИЗОЛЯЦИИ ДАННЫХ ПО ПРОЕКТАМ
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ ПО ПРОЕКТАМ' as test_section,
    'projects' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT owner_id) as unique_owners
FROM public.projects
UNION ALL
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ ПО ПРОЕКТАМ' as test_section,
    'assistants' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT owner_id) as unique_owners
FROM public.assistants
UNION ALL
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ ПО ПРОЕКТАМ' as test_section,
    'ai_agent_settings' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT project_id) as unique_projects
FROM public.ai_agent_settings;

-- 6. ТЕСТ ИЗОЛЯЦИИ ДАННЫХ ПО ПОЛЬЗОВАТЕЛЯМ
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ ПО ПОЛЬЗОВАТЕЛЯМ' as test_section,
    'users' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT id) as unique_users
FROM public.users
UNION ALL
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ ПО ПОЛЬЗОВАТЕЛЯМ' as test_section,
    'autoswitch_settings' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users
FROM public.autoswitch_settings
UNION ALL
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ ПО ПОЛЬЗОВАТЕЛЯМ' as test_section,
    'messenger_contacts' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users
FROM public.messenger_contacts;

-- 7. ПРОВЕРКА СПРАВОЧНИКОВ
SELECT 
    'ПРОВЕРКА СПРАВОЧНИКОВ' as test_section,
    'niches' as table_name,
    COUNT(*) as total_records
FROM public.niches
UNION ALL
SELECT 
    'ПРОВЕРКА СПРАВОЧНИКОВ' as test_section,
    'niche_synonyms' as table_name,
    COUNT(*) as total_records
FROM public.niche_synonyms
UNION ALL
SELECT 
    'ПРОВЕРКА СПРАВОЧНИКОВ' as test_section,
    'chunk_synonyms' as table_name,
    COUNT(*) as total_records
FROM public.chunk_synonyms;

-- 8. ИТОГОВАЯ СТАТИСТИКА
SELECT 
    'ИТОГОВАЯ СТАТИСТИКА' as test_section,
    'Всего таблиц с RLS' as metric,
    COUNT(*)::text as value
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
UNION ALL
SELECT 
    'ИТОГОВАЯ СТАТИСТИКА' as test_section,
    'Всего RLS политик' as metric,
    COUNT(*)::text as value
FROM pg_policies 
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'ИТОГОВАЯ СТАТИСТИКА' as test_section,
    'Всего записей в БД' as metric,
    SUM(n_live_tup)::text as value
FROM pg_stat_user_tables 
WHERE schemaname = 'public';
