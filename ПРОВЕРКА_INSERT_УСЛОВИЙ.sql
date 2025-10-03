-- 🔍 ПРОВЕРКА INSERT УСЛОВИЙ
-- Проверяем, что все INSERT политики имеют правильные with_check условия

-- ============================================
-- 1. ДЕТАЛЬНАЯ ПРОВЕРКА INSERT ПОЛИТИК
-- ============================================

SELECT 
    '📋 ДЕТАЛЬНАЯ ПРОВЕРКА INSERT' as section,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual IS NULL THEN '✅ NULL (правильно для INSERT)'
        ELSE '❌ НЕ NULL: ' || qual
    END as qual_status,
    CASE 
        WHEN with_check IS NOT NULL THEN '✅ ЕСТЬ: ' || with_check
        ELSE '❌ НЕТ with_check'
    END as with_check_status
FROM pg_policies 
WHERE schemaname = 'public'
AND cmd = 'INSERT'
ORDER BY tablename, policyname;

-- ============================================
-- 2. ПРОВЕРКА ФУНКЦИИ get_user_project_id
-- ============================================

SELECT 
    '🔧 ПРОВЕРКА ФУНКЦИИ' as section,
    get_user_project_id() as function_result,
    CASE 
        WHEN get_user_project_id() IS NULL THEN '❌ ФУНКЦИЯ НЕ РАБОТАЕТ'
        ELSE '✅ ФУНКЦИЯ РАБОТАЕТ: ' || get_user_project_id()
    END as function_status;

-- ============================================
-- 3. ФИНАЛЬНАЯ СТАТИСТИКА
-- ============================================

SELECT 
    '🎉 ФИНАЛЬНАЯ СТАТИСТИКА' as section,
    cmd,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE qual IS NULL) as null_qual_policies,
    COUNT(*) FILTER (WHERE with_check IS NOT NULL) as with_check_policies,
    CASE 
        WHEN cmd = 'INSERT' AND COUNT(*) FILTER (WHERE qual IS NULL) = COUNT(*) AND COUNT(*) FILTER (WHERE with_check IS NOT NULL) = COUNT(*) THEN '✅ ИСПРАВЛЕНО'
        WHEN cmd != 'INSERT' AND COUNT(*) FILTER (WHERE qual IS NULL) = 0 THEN '✅ ИСПРАВЛЕНО'
        ELSE '❌ ТРЕБУЕТ ВНИМАНИЯ'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY cmd
ORDER BY cmd;
