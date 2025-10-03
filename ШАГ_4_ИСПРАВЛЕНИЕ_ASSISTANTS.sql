-- 🔧 ШАГ 4: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ ASSISTANTS
-- Таблица AI агентов

-- ============================================
-- 1. ПРОВЕРЯЕМ ТЕКУЩЕЕ СОСТОЯНИЕ ТАБЛИЦЫ ASSISTANTS
-- ============================================

-- Проверяем структуру таблицы
SELECT 
    '📋 СТРУКТУРА ТАБЛИЦЫ ASSISTANTS' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'assistants'
ORDER BY ordinal_position;

-- Проверяем текущий статус RLS
SELECT 
    '🔒 СТАТУС RLS' as section,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'assistants';

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
AND tablename = 'assistants'
ORDER BY cmd, policyname;

-- Проверяем количество записей
SELECT 
    '📊 КОЛИЧЕСТВО ЗАПИСЕЙ' as section,
    COUNT(*) as total_assistants,
    COUNT(*) FILTER (WHERE id IS NOT NULL) as assistants_with_id,
    COUNT(*) FILTER (WHERE user_id IS NOT NULL) as assistants_with_user,
    COUNT(*) FILTER (WHERE project_id IS NOT NULL) as assistants_with_project,
    COUNT(*) FILTER (WHERE name IS NOT NULL) as assistants_with_name,
    COUNT(*) FILTER (WHERE active = true) as active_assistants
FROM public.assistants;

-- Проверяем связь с проектами
SELECT 
    '🔗 СВЯЗЬ С ПРОЕКТАМИ' as section,
    COUNT(DISTINCT project_id) as unique_projects,
    COUNT(*) as total_assistants,
    ROUND(COUNT(*)::numeric / COUNT(DISTINCT project_id), 2) as avg_assistants_per_project
FROM public.assistants
WHERE project_id IS NOT NULL;

-- Проверяем связь с пользователями
SELECT 
    '👥 СВЯЗЬ С ПОЛЬЗОВАТЕЛЯМИ' as section,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) as total_assistants,
    ROUND(COUNT(*)::numeric / COUNT(DISTINCT user_id), 2) as avg_assistants_per_user
FROM public.assistants
WHERE user_id IS NOT NULL;

-- Проверяем статусы агентов
SELECT 
    '🤖 СТАТУСЫ АГЕНТОВ' as section,
    status,
    COUNT(*) as count,
    ROUND(COUNT(*)::numeric * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM public.assistants
WHERE status IS NOT NULL
GROUP BY status
ORDER BY count DESC;

-- Проверяем языки агентов
SELECT 
    '🌐 ЯЗЫКИ АГЕНТОВ' as section,
    language,
    COUNT(*) as count,
    ROUND(COUNT(*)::numeric * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM public.assistants
WHERE language IS NOT NULL
GROUP BY language
ORDER BY count DESC;

-- ============================================
-- 2. ИСПРАВЛЯЕМ RLS ДЛЯ ТАБЛИЦЫ ASSISTANTS
-- ============================================

-- Включаем RLS
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;

-- Удаляем все старые политики
DROP POLICY IF EXISTS "assistants_all" ON public.assistants;
DROP POLICY IF EXISTS "Users can view their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can insert their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can update their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can delete their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "assistants_policy" ON public.assistants;
DROP POLICY IF EXISTS "assistants_project_access" ON public.assistants;

-- Создаем правильную политику для assistants
-- Пользователь может видеть агентов только тех проектов, к которым у него есть доступ
CREATE POLICY "assistants_project_access" ON public.assistants
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
GRANT ALL ON public.assistants TO authenticated;

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
AND tablename = 'assistants';

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
AND tablename = 'assistants'
ORDER BY cmd, policyname;

-- Проверяем права доступа
SELECT 
    '🔑 ПРАВА ДОСТУПА' as section,
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
AND table_name = 'assistants'
ORDER BY grantee, privilege_type;

-- ============================================
-- 4. ТЕСТИРУЕМ ИЗОЛЯЦИЮ ДАННЫХ
-- ============================================

-- Проверяем, что политика работает корректно
-- (Этот запрос должен выполняться от имени аутентифицированного пользователя)
SELECT 
    '🧪 ТЕСТ ИЗОЛЯЦИИ' as section,
    'Пользователь видит только агентов доступных проектов' as test_description,
    COUNT(*) as visible_assistants
FROM public.assistants;

-- Проверяем целостность данных
SELECT 
    '🔍 ПРОВЕРКА ЦЕЛОСТНОСТИ' as section,
    'Агенты без проекта' as check_type,
    COUNT(*) as count
FROM public.assistants
WHERE project_id IS NULL;

SELECT 
    '🔍 ПРОВЕРКА ЦЕЛОСТНОСТИ' as section,
    'Агенты без пользователя' as check_type,
    COUNT(*) as count
FROM public.assistants
WHERE user_id IS NULL;

-- Проверяем, что все project_id существуют в таблице projects
SELECT 
    '🔍 ПРОВЕРКА ЦЕЛОСТНОСТИ' as section,
    'Агенты с несуществующими проектами' as check_type,
    COUNT(*) as count
FROM public.assistants a
LEFT JOIN public.projects p ON a.project_id = p.id
WHERE a.project_id IS NOT NULL AND p.id IS NULL;

-- ============================================
-- 5. АНАЛИЗ АГЕНТОВ ПО ПРОЕКТАМ
-- ============================================

-- Проверяем, сколько агентов у каждого проекта
SELECT 
    '📊 АНАЛИЗ АГЕНТОВ' as section,
    'Проекты с агентами' as analysis_type,
    COUNT(DISTINCT project_id) as projects_with_assistants,
    COUNT(*) as total_assistants
FROM public.assistants
WHERE project_id IS NOT NULL;

-- Проверяем проекты без агентов
SELECT 
    '📊 АНАЛИЗ АГЕНТОВ' as section,
    'Проекты без агентов' as analysis_type,
    COUNT(*) as count
FROM public.projects p
LEFT JOIN public.assistants a ON p.id = a.project_id
WHERE a.project_id IS NULL;

-- Проверяем распределение агентов по проектам
SELECT 
    '📊 РАСПРЕДЕЛЕНИЕ АГЕНТОВ' as section,
    'Проекты с 1 агентом' as analysis_type,
    COUNT(*) as count
FROM (
    SELECT project_id, COUNT(*) as agent_count
    FROM public.assistants
    WHERE project_id IS NOT NULL
    GROUP BY project_id
    HAVING COUNT(*) = 1
) subq;

-- ============================================
-- 6. ИТОГОВЫЙ ОТЧЕТ ПО ТАБЛИЦЕ ASSISTANTS
-- ============================================

SELECT 
    '📋 ИТОГОВЫЙ ОТЧЕТ ПО ASSISTANTS' as section,
    'RLS включен' as rls_status,
    'Политика assistants_project_access создана' as policy_status,
    'Права предоставлены' as permissions_status,
    'Готово к следующему шагу' as next_step
UNION ALL
SELECT 
    '📊 СТАТИСТИКА' as section,
    'Всего агентов: ' || COUNT(*)::text as rls_status,
    'С RLS политиками: ' || (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'assistants')::text as policy_status,
    'Права для authenticated: ' || (SELECT COUNT(*) FROM information_schema.table_privileges WHERE table_schema = 'public' AND table_name = 'assistants' AND grantee = 'authenticated')::text as permissions_status,
    'Следующий шаг: autoswitch_settings' as next_step
FROM public.assistants
UNION ALL
SELECT 
    '🔗 СВЯЗИ' as section,
    'Уникальных проектов: ' || COUNT(DISTINCT project_id)::text as rls_status,
    'Уникальных пользователей: ' || COUNT(DISTINCT user_id)::text as policy_status,
    'Активных агентов: ' || COUNT(*) FILTER (WHERE active = true)::text as permissions_status,
    'Целостность данных: ' || CASE 
        WHEN COUNT(*) FILTER (WHERE project_id IS NULL) = 0 AND COUNT(*) FILTER (WHERE user_id IS NULL) = 0 
        THEN '✅ Отлично' 
        ELSE '⚠️ Есть проблемы' 
    END as next_step
FROM public.assistants;
