-- 🔍 ПРОВЕРКА ИСПРАВЛЕНИЙ 17 ПОЛИТИК

-- ============================================
-- 1. ПРОВЕРЯЕМ INSERT ПОЛИТИКИ
-- ============================================

SELECT 
    '🔍 INSERT ПОЛИТИКИ' as section,
    tablename,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет WHERE условий'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND cmd = 'INSERT'
ORDER BY tablename, policyname;

-- ============================================
-- 2. СЧИТАЕМ ПРОБЛЕМНЫЕ INSERT ПОЛИТИКИ
-- ============================================

SELECT 
    '📊 СТАТИСТИКА INSERT ПОЛИТИК' as section,
    COUNT(*) as total_insert_policies,
    COUNT(*) FILTER (WHERE qual IS NULL) as null_condition_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%get_user_project_id()%') as project_based_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%') as user_based_policies,
    CASE 
        WHEN COUNT(*) FILTER (WHERE qual IS NULL) = 0 THEN '✅ ВСЕ ИСПРАВЛЕНО!'
        ELSE '❌ ОСТАЛИСЬ ПРОБЛЕМЫ'
    END as insert_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND cmd = 'INSERT';

-- ============================================
-- 3. ОБЩАЯ СТАТИСТИКА
-- ============================================

SELECT 
    '🎉 ОБЩАЯ СТАТИСТИКА' as section,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE qual IS NULL) as null_condition_policies,
    COUNT(*) FILTER (WHERE qual = 'true') as true_condition_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%get_user_project_id()%') as project_based_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%') as user_based_policies,
    CASE 
        WHEN COUNT(*) FILTER (WHERE qual IS NULL) = 0 THEN '✅ ВСЕ ИСПРАВЛЕНО!'
        ELSE '❌ ОСТАЛИСЬ ПРОБЛЕМЫ'
    END as final_status
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================
-- 4. ПРОВЕРЯЕМ ФУНКЦИЮ
-- ============================================

SELECT 
    '🔧 ПРОВЕРКА ФУНКЦИИ' as section,
    get_user_project_id() as function_result,
    CASE 
        WHEN get_user_project_id() IS NULL THEN '❌ ФУНКЦИЯ НЕ РАБОТАЕТ'
        ELSE '✅ ФУНКЦИЯ РАБОТАЕТ'
    END as function_status;
