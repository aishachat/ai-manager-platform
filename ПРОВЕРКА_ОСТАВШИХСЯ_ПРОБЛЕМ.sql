-- 🔍 ПРОВЕРКА ОСТАВШИХСЯ ПРОБЛЕМНЫХ ПОЛИТИК

-- ============================================
-- 1. ИЩЕМ ПОЛИТИКИ БЕЗ УСЛОВИЙ
-- ============================================

SELECT 
    '🚨 ПОЛИТИКИ БЕЗ УСЛОВИЙ' as section,
    tablename,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL AND cmd = 'INSERT' THEN '❌ INSERT без WHERE условий'
        WHEN qual IS NULL AND cmd = 'SELECT' THEN '❌ SELECT без WHERE условий'
        WHEN qual IS NULL AND cmd = 'UPDATE' THEN '❌ UPDATE без WHERE условий'
        WHEN qual IS NULL AND cmd = 'DELETE' THEN '❌ DELETE без WHERE условий'
        WHEN qual IS NULL AND cmd = 'ALL' THEN '❌ ALL без WHERE условий'
        ELSE '⚠️ Другая проблема'
    END as problem_type
FROM pg_policies 
WHERE schemaname = 'public'
AND qual IS NULL
ORDER BY tablename, cmd, policyname;

-- ============================================
-- 2. ПРОВЕРЯЕМ ФУНКЦИЮ
-- ============================================

SELECT 
    '🔧 ПРОВЕРКА ФУНКЦИИ' as section,
    get_user_project_id() as function_result,
    CASE 
        WHEN get_user_project_id() IS NULL THEN '❌ ФУНКЦИЯ НЕ РАБОТАЕТ'
        ELSE '✅ ФУНКЦИЯ РАБОТАЕТ'
    END as function_status;

-- ============================================
-- 3. ПРОВЕРЯЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
-- ============================================

SELECT 
    '👤 ДАННЫЕ ПОЛЬЗОВАТЕЛЯ' as section,
    id,
    email,
    project_id,
    created_at
FROM users
WHERE id = auth.uid();

-- ============================================
-- 4. ПРОВЕРЯЕМ ПРОЕКТЫ ПОЛЬЗОВАТЕЛЯ
-- ============================================

SELECT 
    '📁 ПРОЕКТЫ ПОЛЬЗОВАТЕЛЯ' as section,
    id,
    owner_id,
    name,
    created_at
FROM projects
WHERE owner_id = auth.uid();

-- ============================================
-- 5. СТАТИСТИКА ПО ТИПАМ ПОЛИТИК
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
