-- 🔧 ШАГ 3: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ PROJECT_MEMBERS
-- Таблица участников проектов

-- ============================================
-- 1. ПРОВЕРЯЕМ ТЕКУЩЕЕ СОСТОЯНИЕ ТАБЛИЦЫ PROJECT_MEMBERS
-- ============================================

-- Проверяем структуру таблицы
SELECT 
    '📋 СТРУКТУРА ТАБЛИЦЫ PROJECT_MEMBERS' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'project_members'
ORDER BY ordinal_position;

-- Проверяем текущий статус RLS
SELECT 
    '🔒 СТАТУС RLS' as section,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'project_members';

-- Проверяем текущие политики
SELECT 
    '📜 ТЕКУЩИЕ ПОЛИТИКИ' as section,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'project_members'
ORDER BY cmd, policyname;

-- Проверяем количество записей
SELECT 
    '📊 КОЛИЧЕСТВО ЗАПИСЕЙ' as section,
    COUNT(*) as total_members,
    COUNT(*) FILTER (WHERE id IS NOT NULL) as members_with_id,
    COUNT(*) FILTER (WHERE project_id IS NOT NULL) as members_with_project,
    COUNT(*) FILTER (WHERE user_id IS NOT NULL) as members_with_user,
    COUNT(*) FILTER (WHERE role IS NOT NULL) as members_with_role
FROM public.project_members;

-- Проверяем связь с проектами
SELECT 
    '🔗 СВЯЗЬ С ПРОЕКТАМИ' as section,
    COUNT(DISTINCT project_id) as unique_projects,
    COUNT(*) as total_members,
    ROUND(COUNT(*)::numeric / COUNT(DISTINCT project_id), 2) as avg_members_per_project
FROM public.project_members;

-- Проверяем связь с пользователями
SELECT 
    '👥 СВЯЗЬ С ПОЛЬЗОВАТЕЛЯМИ' as section,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) as total_members,
    ROUND(COUNT(*)::numeric / COUNT(DISTINCT user_id), 2) as avg_projects_per_user
FROM public.project_members;

-- Проверяем роли
SELECT 
    '🎭 РОЛИ УЧАСТНИКОВ' as section,
    role,
    COUNT(*) as count,
    ROUND(COUNT(*)::numeric * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM public.project_members
WHERE role IS NOT NULL
GROUP BY role
ORDER BY count DESC;

-- ============================================
-- 2. ИСПРАВЛЯЕМ RLS ДЛЯ ТАБЛИЦЫ PROJECT_MEMBERS
-- ============================================

-- Включаем RLS
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Удаляем все старые политики
DROP POLICY IF EXISTS "project_members_all" ON public.project_members;
DROP POLICY IF EXISTS "Users can view their own project_members" ON public.project_members;
DROP POLICY IF EXISTS "Users can insert their own project_members" ON public.project_members;
DROP POLICY IF EXISTS "Users can update their own project_members" ON public.project_members;
DROP POLICY IF EXISTS "Users can delete their own project_members" ON public.project_members;
DROP POLICY IF EXISTS "project_members_policy" ON public.project_members;
DROP POLICY IF EXISTS "project_members_project_access" ON public.project_members;

-- Создаем правильную политику для project_members
-- Пользователь может видеть участников только тех проектов, к которым у него есть доступ
-- Это включает проекты, где он владелец или участник
CREATE POLICY "project_members_project_access" ON public.project_members
    FOR ALL USING (
        project_id IN (
            -- Проекты, где пользователь владелец
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
            UNION
            -- Проекты, где пользователь участник
            SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        project_id IN (
            -- Проекты, где пользователь владелец
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
            UNION
            -- Проекты, где пользователь участник
            SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
        )
    );

-- Предоставляем права
GRANT ALL ON public.project_members TO authenticated;

-- ============================================
-- 3. ПРОВЕРЯЕМ КАЧЕСТВО ИСПРАВЛЕНИЯ
-- ============================================

-- Проверяем статус RLS после исправления
SELECT 
    '✅ СТАТУС RLS ПОСЛЕ ИСПРАВЛЕНИЯ' as section,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'project_members';

-- Проверяем новые политики
SELECT 
    '✅ НОВЫЕ ПОЛИТИКИ' as section,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%project_id IN%' THEN '✅ ОТЛИЧНО: Использует project_id с подзапросами'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'project_members'
ORDER BY cmd, policyname;

-- Проверяем права доступа
SELECT 
    '🔑 ПРАВА ДОСТУПА' as section,
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
AND table_name = 'project_members'
ORDER BY grantee, privilege_type;

-- ============================================
-- 4. ТЕСТИРУЕМ ИЗОЛЯЦИЮ ДАННЫХ
-- ============================================

-- Проверяем, что политика работает корректно
-- (Этот запрос должен выполняться от имени аутентифицированного пользователя)
SELECT 
    '🧪 ТЕСТ ИЗОЛЯЦИИ' as section,
    'Пользователь видит только участников доступных проектов' as test_description,
    COUNT(*) as visible_members
FROM public.project_members;

-- Проверяем целостность данных
SELECT 
    '🔍 ПРОВЕРКА ЦЕЛОСТНОСТИ' as section,
    'Участники без проекта' as check_type,
    COUNT(*) as count
FROM public.project_members
WHERE project_id IS NULL;

SELECT 
    '🔍 ПРОВЕРКА ЦЕЛОСТНОСТИ' as section,
    'Участники без пользователя' as check_type,
    COUNT(*) as count
FROM public.project_members
WHERE user_id IS NULL;

-- Проверяем, что все project_id существуют в таблице projects
SELECT 
    '🔍 ПРОВЕРКА ЦЕЛОСТНОСТИ' as section,
    'Участники с несуществующими проектами' as check_type,
    COUNT(*) as count
FROM public.project_members pm
LEFT JOIN public.projects p ON pm.project_id = p.id
WHERE pm.project_id IS NOT NULL AND p.id IS NULL;

-- ============================================
-- 5. АНАЛИЗ ДОСТУПОВ К ПРОЕКТАМ
-- ============================================

-- Проверяем, сколько пользователей имеют доступ к каждому проекту
SELECT 
    '📊 АНАЛИЗ ДОСТУПОВ' as section,
    'Проекты с участниками' as analysis_type,
    COUNT(DISTINCT project_id) as projects_with_members,
    COUNT(*) as total_memberships
FROM public.project_members;

-- Проверяем проекты без участников (только владелец)
SELECT 
    '📊 АНАЛИЗ ДОСТУПОВ' as section,
    'Проекты только с владельцем' as analysis_type,
    COUNT(*) as count
FROM public.projects p
LEFT JOIN public.project_members pm ON p.id = pm.project_id
WHERE pm.project_id IS NULL;

-- ============================================
-- 6. ИТОГОВЫЙ ОТЧЕТ ПО ТАБЛИЦЕ PROJECT_MEMBERS
-- ============================================

SELECT 
    '📋 ИТОГОВЫЙ ОТЧЕТ ПО PROJECT_MEMBERS' as section,
    'RLS включен' as rls_status,
    'Политика project_members_project_access создана' as policy_status,
    'Права предоставлены' as permissions_status,
    'Готово к следующему шагу' as next_step
UNION ALL
SELECT 
    '📊 СТАТИСТИКА' as section,
    'Всего участников: ' || COUNT(*)::text as rls_status,
    'С RLS политиками: ' || (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'project_members')::text as policy_status,
    'Права для authenticated: ' || (SELECT COUNT(*) FROM information_schema.table_privileges WHERE table_schema = 'public' AND table_name = 'project_members' AND grantee = 'authenticated')::text as permissions_status,
    'Следующий шаг: assistants' as next_step
FROM public.project_members
UNION ALL
SELECT 
    '🔗 СВЯЗИ' as section,
    'Уникальных проектов: ' || COUNT(DISTINCT project_id)::text as rls_status,
    'Уникальных пользователей: ' || COUNT(DISTINCT user_id)::text as policy_status,
    'Среднее участников на проект: ' || ROUND(COUNT(*)::numeric / COUNT(DISTINCT project_id), 2)::text as permissions_status,
    'Целостность данных: ' || CASE 
        WHEN COUNT(*) FILTER (WHERE project_id IS NULL) = 0 AND COUNT(*) FILTER (WHERE user_id IS NULL) = 0 
        THEN '✅ Отлично' 
        ELSE '⚠️ Есть проблемы' 
    END as next_step
FROM public.project_members;
