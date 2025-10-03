-- 🔍 ДИАГНОСТИКА ПРОБЛЕМЫ
-- Проверяем, почему исправления не применились

-- ============================================
-- 1. ПРОВЕРЯЕМ ПОЛИТИКИ БЕЗ УСЛОВИЙ
-- ============================================

SELECT 
    '🚨 ПОЛИТИКИ БЕЗ УСЛОВИЙ' as section,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND qual IS NULL
ORDER BY tablename, cmd, policyname;

-- ============================================
-- 2. ПРОВЕРЯЕМ КОНКРЕТНО ASSISTANTS
-- ============================================

SELECT 
    '🔍 ASSISTANTS ПОЛИТИКИ' as section,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'assistants'
ORDER BY cmd, policyname;

-- ============================================
-- 3. ПРОВЕРЯЕМ ФУНКЦИЮ
-- ============================================

SELECT 
    '🔧 ПРОВЕРКА ФУНКЦИИ' as section,
    get_user_project_id() as function_result,
    CASE 
        WHEN get_user_project_id() IS NULL THEN '❌ ФУНКЦИЯ НЕ РАБОТАЕТ'
        ELSE '✅ ФУНКЦИЯ РАБОТАЕТ'
    END as function_status;

-- ============================================
-- 4. СЧИТАЕМ ПО ТИПАМ ПОЛИТИК
-- ============================================

SELECT 
    '📊 СТАТИСТИКА ПО ТИПАМ' as section,
    cmd,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE qual IS NULL) as null_condition_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%get_user_project_id()%') as project_based_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%') as user_based_policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY cmd
ORDER BY cmd;
