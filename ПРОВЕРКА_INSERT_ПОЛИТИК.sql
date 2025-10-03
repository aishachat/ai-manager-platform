-- 🔍 ПРОВЕРКА INSERT ПОЛИТИК
-- Выясняем, какие именно политики остались без условий

-- ============================================
-- 1. ВСЕ INSERT ПОЛИТИКИ
-- ============================================

SELECT 
    '📋 ВСЕ INSERT ПОЛИТИКИ' as section,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND cmd = 'INSERT'
ORDER BY tablename, policyname;

-- ============================================
-- 2. INSERT ПОЛИТИКИ БЕЗ УСЛОВИЙ
-- ============================================

SELECT 
    '🚨 INSERT ПОЛИТИКИ БЕЗ УСЛОВИЙ' as section,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND cmd = 'INSERT'
AND qual IS NULL
ORDER BY tablename, policyname;

-- ============================================
-- 3. СЧЕТЧИК ПО ТАБЛИЦАМ
-- ============================================

SELECT 
    '📊 СЧЕТЧИК ПО ТАБЛИЦАМ' as section,
    tablename,
    COUNT(*) as total_insert_policies,
    COUNT(*) FILTER (WHERE qual IS NULL) as null_condition_policies,
    COUNT(*) FILTER (WHERE with_check IS NOT NULL) as with_check_policies
FROM pg_policies 
WHERE schemaname = 'public'
AND cmd = 'INSERT'
GROUP BY tablename
ORDER BY tablename;
