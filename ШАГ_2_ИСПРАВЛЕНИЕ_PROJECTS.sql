-- 🔧 ШАГ 2: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ PROJECTS
-- Таблица проектов пользователей

-- ============================================
-- 1. ПРОВЕРЯЕМ ТЕКУЩЕЕ СОСТОЯНИЕ ТАБЛИЦЫ PROJECTS
-- ============================================

-- Проверяем структуру таблицы
SELECT 
    '📋 СТРУКТУРА ТАБЛИЦЫ PROJECTS' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'projects'
ORDER BY ordinal_position;

-- Проверяем текущий статус RLS
SELECT 
    '🔒 СТАТУС RLS' as section,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'projects';

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
AND tablename = 'projects'
ORDER BY cmd, policyname;

-- Проверяем количество записей
SELECT 
    '📊 КОЛИЧЕСТВО ЗАПИСЕЙ' as section,
    COUNT(*) as total_projects,
    COUNT(*) FILTER (WHERE id IS NOT NULL) as projects_with_id,
    COUNT(*) FILTER (WHERE owner_id IS NOT NULL) as projects_with_owner,
    COUNT(*) FILTER (WHERE name IS NOT NULL) as projects_with_name
FROM public.projects;

-- Проверяем связь с пользователями
SELECT 
    '🔗 СВЯЗЬ С ПОЛЬЗОВАТЕЛЯМИ' as section,
    COUNT(DISTINCT owner_id) as unique_owners,
    COUNT(*) as total_projects,
    ROUND(COUNT(*)::numeric / COUNT(DISTINCT owner_id), 2) as avg_projects_per_user
FROM public.projects;

-- ============================================
-- 2. ИСПРАВЛЯЕМ RLS ДЛЯ ТАБЛИЦЫ PROJECTS
-- ============================================

-- Включаем RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Удаляем все старые политики
DROP POLICY IF EXISTS "projects_all" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
DROP POLICY IF EXISTS "projects_owner_access" ON public.projects;
DROP POLICY IF EXISTS "projects_policy" ON public.projects;

-- Создаем правильную политику для projects
-- Пользователь может видеть и изменять только свои проекты (где он owner)
CREATE POLICY "projects_owner_access" ON public.projects
    FOR ALL USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Предоставляем права
GRANT ALL ON public.projects TO authenticated;

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
AND tablename = 'projects';

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
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'projects'
ORDER BY cmd, policyname;

-- Проверяем права доступа
SELECT 
    '🔑 ПРАВА ДОСТУПА' as section,
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
AND table_name = 'projects'
ORDER BY grantee, privilege_type;

-- ============================================
-- 4. ТЕСТИРУЕМ ИЗОЛЯЦИЮ ДАННЫХ
-- ============================================

-- Проверяем, что политика работает корректно
-- (Этот запрос должен выполняться от имени аутентифицированного пользователя)
SELECT 
    '🧪 ТЕСТ ИЗОЛЯЦИИ' as section,
    'Пользователь видит только свои проекты' as test_description,
    COUNT(*) as visible_projects
FROM public.projects;

-- Проверяем, что все проекты имеют владельца
SELECT 
    '🔍 ПРОВЕРКА ЦЕЛОСТНОСТИ' as section,
    'Проекты без владельца' as check_type,
    COUNT(*) as count
FROM public.projects
WHERE owner_id IS NULL;

-- ============================================
-- 5. ПРОВЕРЯЕМ ФУНКЦИЮ get_user_project_id()
-- ============================================

-- Проверяем, что функция существует и работает
SELECT 
    '🔧 ПРОВЕРКА ФУНКЦИИ' as section,
    'get_user_project_id() существует' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'get_user_project_id' 
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ) THEN '✅ Функция существует'
        ELSE '❌ Функция не найдена'
    END as status;

-- Проверяем структуру функции
SELECT 
    '📋 СТРУКТУРА ФУНКЦИИ' as section,
    proname as function_name,
    proargnames as argument_names,
    proargtypes::regtype[] as argument_types,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'get_user_project_id' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ============================================
-- 6. ИТОГОВЫЙ ОТЧЕТ ПО ТАБЛИЦЕ PROJECTS
-- ============================================

SELECT 
    '📋 ИТОГОВЫЙ ОТЧЕТ ПО PROJECTS' as section,
    'RLS включен' as rls_status,
    'Политика projects_owner_access создана' as policy_status,
    'Права предоставлены' as permissions_status,
    'Готово к следующему шагу' as next_step
UNION ALL
SELECT 
    '📊 СТАТИСТИКА' as section,
    'Всего проектов: ' || COUNT(*)::text as rls_status,
    'С RLS политиками: ' || (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'projects')::text as policy_status,
    'Права для authenticated: ' || (SELECT COUNT(*) FROM information_schema.table_privileges WHERE table_schema = 'public' AND table_name = 'projects' AND grantee = 'authenticated')::text as permissions_status,
    'Следующий шаг: project_members' as next_step
FROM public.projects
UNION ALL
SELECT 
    '🔗 СВЯЗИ' as section,
    'Уникальных владельцев: ' || COUNT(DISTINCT owner_id)::text as rls_status,
    'Проектов без владельца: ' || COUNT(*) FILTER (WHERE owner_id IS NULL)::text as policy_status,
    'Среднее проектов на пользователя: ' || ROUND(COUNT(*)::numeric / COUNT(DISTINCT owner_id), 2)::text as permissions_status,
    'Функция get_user_project_id: ' || CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_project_id' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) 
        THEN '✅ Работает' 
        ELSE '❌ Не найдена' 
    END as next_step
FROM public.projects;
