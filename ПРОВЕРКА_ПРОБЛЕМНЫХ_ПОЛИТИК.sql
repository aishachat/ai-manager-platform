-- 🔍 ПРОВЕРКА ПРОБЛЕМНЫХ ПОЛИТИК

-- ============================================
-- ИЩЕМ ПОЛИТИКИ БЕЗ УСЛОВИЙ
-- ============================================

SELECT 
    '🚨 ПРОБЛЕМНЫЕ ПОЛИТИКИ' as section,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND qual IS NULL
ORDER BY tablename, cmd, policyname;
