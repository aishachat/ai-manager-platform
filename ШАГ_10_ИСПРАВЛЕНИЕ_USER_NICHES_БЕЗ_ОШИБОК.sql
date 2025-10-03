-- =====================================================
-- ШАГ 10: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ USER_NICHES (БЕЗ ОШИБОК)
-- =====================================================
-- Таблица: связь пользователей с нишами в проектах
-- Логика: пользователь видит только свои ниши в своих проектах
-- Принцип: user_id = auth.uid() AND project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.user_niches ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "user_niches_project_access" ON public.user_niches;
DROP POLICY IF EXISTS "user_niches_owner_access" ON public.user_niches;
DROP POLICY IF EXISTS "user_niches_user_access" ON public.user_niches;
DROP POLICY IF EXISTS "user_niches_combined_access" ON public.user_niches;

-- 3. СОЗДАЕМ НОВУЮ ПОЛИТИКУ (комбинированная: user_id + project_id)
CREATE POLICY "user_niches_combined_access" ON public.user_niches
    FOR ALL USING (
        user_id = auth.uid() 
        AND project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    )
    WITH CHECK (
        user_id = auth.uid() 
        AND project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    );

-- 4. ПРЕДОСТАВЛЯЕМ ПРАВА
GRANT ALL ON public.user_niches TO authenticated;
GRANT ALL ON public.user_niches TO service_role;

-- 5. ПРОВЕРЯЕМ СТАТУС RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'user_niches') as policies_count
FROM pg_tables 
WHERE tablename = 'user_niches';

-- 6. ПРОВЕРЯЕМ ПОЛИТИКИ
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_niches';

-- 7. ПРОВЕРЯЕМ ДАННЫЕ
SELECT 
    'Всего связей пользователь-ниша' as metric,
    count(*) as value
FROM public.user_niches
UNION ALL
SELECT 
    'Уникальных пользователей' as metric,
    count(DISTINCT user_id) as value
FROM public.user_niches
UNION ALL
SELECT 
    'Уникальных проектов' as metric,
    count(DISTINCT project_id) as value
FROM public.user_niches
UNION ALL
SELECT 
    'Уникальных ниш' as metric,
    count(DISTINCT niche_id) as value
FROM public.user_niches
UNION ALL
SELECT 
    'Записей с user_id = null' as metric,
    count(*) as value
FROM public.user_niches
WHERE user_id IS NULL
UNION ALL
SELECT 
    'Записей с project_id = null' as metric,
    count(*) as value
FROM public.user_niches
WHERE project_id IS NULL;

-- 8. ПРОВЕРЯЕМ СВЯЗИ С ПОЛЬЗОВАТЕЛЯМИ
SELECT 
    'Пользователей с нишами' as metric,
    count(DISTINCT u.id) as value
FROM public.users u
INNER JOIN public.user_niches un ON u.id = un.user_id
UNION ALL
SELECT 
    'Пользователей без ниш' as metric,
    count(*) as value
FROM public.users u
LEFT JOIN public.user_niches un ON u.id = un.user_id
WHERE un.user_id IS NULL;

-- 9. ПРОВЕРЯЕМ СВЯЗИ С ПРОЕКТАМИ
SELECT 
    'Проектов с нишами пользователей' as metric,
    count(DISTINCT p.id) as value
FROM public.projects p
INNER JOIN public.user_niches un ON p.id = un.project_id
UNION ALL
SELECT 
    'Проектов без ниш пользователей' as metric,
    count(*) as value
FROM public.projects p
LEFT JOIN public.user_niches un ON p.id = un.project_id
WHERE un.project_id IS NULL;

-- 10. ПРОВЕРЯЕМ СТАТИСТИКУ (с защитой от деления на ноль)
SELECT 
    'Среднее ниш на пользователя' as metric,
    CASE 
        WHEN count(DISTINCT user_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT user_id), 2)::text
        ELSE '0' 
    END as value
FROM public.user_niches
WHERE user_id IS NOT NULL
UNION ALL
SELECT 
    'Среднее пользователей на проект' as metric,
    CASE 
        WHEN count(DISTINCT project_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT project_id), 2)::text
        ELSE '0' 
    END as value
FROM public.user_niches
WHERE project_id IS NOT NULL;

-- 11. ПРОВЕРЯЕМ ПЕРВИЧНЫЕ НИШИ
SELECT 
    'Первичных ниш' as metric,
    count(*) as value
FROM public.user_niches
WHERE is_primary = true
UNION ALL
SELECT 
    'Вторичных ниш' as metric,
    count(*) as value
FROM public.user_niches
WHERE is_primary = false OR is_primary IS NULL;

-- 12. ТЕСТ ИЗОЛЯЦИИ (должен показать только записи текущего пользователя)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ' as test_name,
    count(*) as visible_records,
    'Пользователь должен видеть только свои ниши в своих проектах' as expected
FROM public.user_niches;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политика создана, права предоставлены
-- ЛОГИКА: user_id = auth.uid() AND project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
-- СЛЕДУЮЩИЙ ШАГ: проверить структуру других таблиц
-- =====================================================
