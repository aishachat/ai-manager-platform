-- 🔍 АНАЛИЗ RLS ПОЛИТИК ДЛЯ PROJECT_MEMBERS И ASSISTANTS
-- Определяем правильные политики исходя из функциональности

-- ============================================
-- 1. АНАЛИЗ ТАБЛИЦЫ PROJECT_MEMBERS
-- ============================================

-- Проверяем текущие политики для project_members
SELECT 
    '👥 АНАЛИЗ ТАБЛИЦЫ PROJECT_MEMBERS' as section,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual LIKE '%UNION%' THEN '❌ СЛОЖНО: Использует UNION подзапросы'
        WHEN qual LIKE '%project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())%' 
        THEN '✅ ПРОСТО: Только владельцы проектов'
        WHEN qual = 'true' THEN '❌ ОПАСНО: Разрешает все'
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as analysis
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'project_members'
ORDER BY cmd, policyname;

-- Анализируем функциональность project_members
SELECT 
    '📊 ФУНКЦИОНАЛЬНОСТЬ PROJECT_MEMBERS' as section,
    'Участники проектов' as purpose,
    'Доступ к участникам проектов' as access_rule,
    'Только владельцы проектов' as recommended_policy,
    'project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())' as simple_policy;

-- ============================================
-- 2. АНАЛИЗ ТАБЛИЦЫ ASSISTANTS
-- ============================================

-- Проверяем текущие политики для assistants
SELECT 
    '🤖 АНАЛИЗ ТАБЛИЦЫ ASSISTANTS' as section,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual LIKE '%UNION%' THEN '❌ СЛОЖНО: Использует UNION подзапросы'
        WHEN qual LIKE '%project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())%' 
        THEN '✅ ПРОСТО: Только владельцы проектов'
        WHEN qual = 'true' THEN '❌ ОПАСНО: Разрешает все'
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as analysis
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'assistants'
ORDER BY cmd, policyname;

-- Анализируем функциональность assistants
SELECT 
    '📊 ФУНКЦИОНАЛЬНОСТЬ ASSISTANTS' as section,
    'AI агенты проектов' as purpose,
    'Доступ к агентам проектов' as access_rule,
    'Только владельцы проектов' as recommended_policy,
    'project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())' as simple_policy;

-- ============================================
-- 3. СРАВНЕНИЕ ПОДХОДОВ
-- ============================================

-- Сложный подход (текущий)
SELECT 
    '❌ СЛОЖНЫЙ ПОДХОД (ТЕКУЩИЙ)' as approach,
    'UNION подзапросы' as complexity,
    'Медленно' as performance,
    'Блокирует API' as problems,
    'Рекурсивные зависимости' as issues;

-- Простой подход (рекомендуемый)
SELECT 
    '✅ ПРОСТОЙ ПОДХОД (РЕКОМЕНДУЕМЫЙ)' as approach,
    'Только владельцы проектов' as complexity,
    'Быстро' as performance,
    'API работает' as problems,
    'Нет зависимостей' as issues;

-- ============================================
-- 4. АНАЛИЗ ДАННЫХ
-- ============================================

-- Проверяем, сколько проектов имеют участников
SELECT 
    '📊 АНАЛИЗ ДАННЫХ' as section,
    'Проекты с участниками' as analysis_type,
    COUNT(DISTINCT project_id) as projects_with_members,
    COUNT(*) as total_memberships
FROM public.project_members;

-- Проверяем, сколько проектов имеют агентов
SELECT 
    '📊 АНАЛИЗ ДАННЫХ' as section,
    'Проекты с агентами' as analysis_type,
    COUNT(DISTINCT project_id) as projects_with_assistants,
    COUNT(*) as total_assistants
FROM public.assistants;

-- Проверяем, есть ли проекты где владелец не является участником
SELECT 
    '📊 АНАЛИЗ ДАННЫХ' as section,
    'Проекты где владелец не участник' as analysis_type,
    COUNT(*) as count
FROM public.projects p
LEFT JOIN public.project_members pm ON p.id = pm.project_id AND p.owner_id = pm.user_id
WHERE pm.user_id IS NULL;

-- ============================================
-- 5. РЕКОМЕНДАЦИИ
-- ============================================

-- Рекомендация для project_members
SELECT 
    '💡 РЕКОМЕНДАЦИЯ ДЛЯ PROJECT_MEMBERS' as section,
    'Упростить политику' as action,
    'Только владельцы проектов' as access_rule,
    'Быстрая работа API' as benefit,
    'Меньше ошибок' as result;

-- Рекомендация для assistants
SELECT 
    '💡 РЕКОМЕНДАЦИЯ ДЛЯ ASSISTANTS' as section,
    'Упростить политику' as action,
    'Только владельцы проектов' as access_rule,
    'Быстрая работа API' as benefit,
    'Меньше ошибок' as result;

-- ============================================
-- 6. ПЛАН ИСПРАВЛЕНИЯ
-- ============================================

SELECT 
    '🔧 ПЛАН ИСПРАВЛЕНИЯ' as section,
    '1. Упростить project_members' as step1,
    '2. Упростить assistants' as step2,
    '3. Создать индексы' as step3,
    '4. Протестировать API' as step4;

-- ============================================
-- 7. ИТОГОВЫЙ ОТЧЕТ
-- ============================================

SELECT 
    '📋 ИТОГОВЫЙ ОТЧЕТ' as section,
    'PROJECT_MEMBERS: Нужно упростить' as project_members_status,
    'ASSISTANTS: Нужно упростить' as assistants_status,
    'Рекомендация: Использовать простые политики' as recommendation
UNION ALL
SELECT 
    '📊 СТАТИСТИКА' as section,
    'Участников: ' || (SELECT COUNT(*) FROM public.project_members)::text as project_members_status,
    'Агентов: ' || (SELECT COUNT(*) FROM public.assistants)::text as assistants_status,
    'Проектов с участниками: ' || (SELECT COUNT(DISTINCT project_id) FROM public.project_members)::text as recommendation
UNION ALL
SELECT 
    '⚡ ПРОИЗВОДИТЕЛЬНОСТЬ' as section,
    'Текущие политики: Медленные' as project_members_status,
    'Рекомендуемые: Быстрые' as assistants_status,
    'Результат: API будет работать без блокировок' as recommendation;
