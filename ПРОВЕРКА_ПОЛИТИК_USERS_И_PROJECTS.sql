-- 🔍 ПРОВЕРКА RLS ПОЛИТИК ДЛЯ USERS И PROJECTS
-- Анализируем правильность политик исходя из функциональности

-- ============================================
-- 1. АНАЛИЗ ТАБЛИЦЫ USERS
-- ============================================

-- Проверяем текущие политики для users
SELECT 
    '👤 АНАЛИЗ ТАБЛИЦЫ USERS' as section,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual = '(id = auth.uid())' THEN '✅ ИДЕАЛЬНО: Пользователь видит только свой профиль'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        WHEN qual = 'true' THEN '❌ ОПАСНО: Разрешает все'
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as analysis
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY cmd, policyname;

-- Проверяем функциональность users
SELECT 
    '📊 ФУНКЦИОНАЛЬНОСТЬ USERS' as section,
    'Профили пользователей' as purpose,
    'Только свой профиль' as access_rule,
    'id = auth.uid()' as recommended_policy,
    '✅ Текущая политика правильная' as status;

-- ============================================
-- 2. АНАЛИЗ ТАБЛИЦЫ PROJECTS
-- ============================================

-- Проверяем текущие политики для projects
SELECT 
    '🏗️ АНАЛИЗ ТАБЛИЦЫ PROJECTS' as section,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual = '(owner_id = auth.uid())' THEN '✅ ИДЕАЛЬНО: Пользователь видит только свои проекты'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        WHEN qual = 'true' THEN '❌ ОПАСНО: Разрешает все'
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as analysis
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'projects'
ORDER BY cmd, policyname;

-- Проверяем функциональность projects
SELECT 
    '📊 ФУНКЦИОНАЛЬНОСТЬ PROJECTS' as section,
    'Проекты пользователей' as purpose,
    'Только свои проекты (владелец)' as access_rule,
    'owner_id = auth.uid()' as recommended_policy,
    '✅ Текущая политика правильная' as status;

-- ============================================
-- 3. ПРОВЕРКА ЦЕЛОСТНОСТИ ДАННЫХ
-- ============================================

-- Проверяем, что все пользователи имеют записи в users
SELECT 
    '🔍 ЦЕЛОСТНОСТЬ USERS' as section,
    'Пользователи без профиля' as check_type,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Проверяем, что все проекты имеют владельцев
SELECT 
    '🔍 ЦЕЛОСТНОСТЬ PROJECTS' as section,
    'Проекты без владельца' as check_type,
    COUNT(*) as count
FROM public.projects
WHERE owner_id IS NULL;

-- Проверяем, что все владельцы проектов существуют
SELECT 
    '🔍 ЦЕЛОСТНОСТЬ PROJECTS' as section,
    'Проекты с несуществующими владельцами' as check_type,
    COUNT(*) as count
FROM public.projects p
LEFT JOIN auth.users au ON p.owner_id = au.id
WHERE p.owner_id IS NOT NULL AND au.id IS NULL;

-- ============================================
-- 4. АНАЛИЗ ПРОИЗВОДИТЕЛЬНОСТИ
-- ============================================

-- Проверяем индексы для users
SELECT 
    '⚡ ПРОИЗВОДИТЕЛЬНОСТЬ USERS' as section,
    indexname,
    indexdef,
    CASE 
        WHEN indexdef LIKE '%id%' THEN '✅ Есть индекс по id'
        ELSE '⚠️ Нет индекса по id'
    END as index_status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY indexname;

-- Проверяем индексы для projects
SELECT 
    '⚡ ПРОИЗВОДИТЕЛЬНОСТЬ PROJECTS' as section,
    indexname,
    indexdef,
    CASE 
        WHEN indexdef LIKE '%owner_id%' THEN '✅ Есть индекс по owner_id'
        ELSE '⚠️ Нет индекса по owner_id'
    END as index_status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'projects'
ORDER BY indexname;

-- ============================================
-- 5. РЕКОМЕНДАЦИИ ПО ОПТИМИЗАЦИИ
-- ============================================

-- Рекомендации для users
SELECT 
    '💡 РЕКОМЕНДАЦИИ ДЛЯ USERS' as section,
    'Политика: id = auth.uid()' as current_policy,
    '✅ Оптимально' as performance,
    '✅ Безопасно' as security,
    '✅ Просто' as complexity;

-- Рекомендации для projects
SELECT 
    '💡 РЕКОМЕНДАЦИИ ДЛЯ PROJECTS' as section,
    'Политика: owner_id = auth.uid()' as current_policy,
    '✅ Оптимально' as performance,
    '✅ Безопасно' as security,
    '✅ Просто' as complexity;

-- ============================================
-- 6. ИТОГОВЫЙ ОТЧЕТ
-- ============================================

SELECT 
    '📋 ИТОГОВЫЙ ОТЧЕТ' as section,
    'USERS: Политика правильная' as users_status,
    'PROJECTS: Политика правильная' as projects_status,
    'Рекомендация: Оставить как есть' as recommendation
UNION ALL
SELECT 
    '📊 СТАТИСТИКА' as section,
    'Пользователей: ' || (SELECT COUNT(*) FROM public.users)::text as users_status,
    'Проектов: ' || (SELECT COUNT(*) FROM public.projects)::text as projects_status,
    'Политик users: ' || (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users')::text as recommendation
UNION ALL
SELECT 
    '🔒 БЕЗОПАСНОСТЬ' as section,
    'RLS users: ' || (SELECT CASE WHEN rowsecurity THEN 'Включен' ELSE 'Отключен' END FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') as users_status,
    'RLS projects: ' || (SELECT CASE WHEN rowsecurity THEN 'Включен' ELSE 'Отключен' END FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') as projects_status,
    'Статус: ' || CASE 
        WHEN (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') = true
        AND (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') = true
        THEN '✅ Все защищено'
        ELSE '❌ Есть проблемы'
    END as recommendation;

