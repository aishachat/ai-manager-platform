-- =====================================================
-- ШАГ 7: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ DIALOGS
-- =====================================================
-- Критичная таблица: диалоги проекта с операторами
-- Логика: 1 проект = множество диалогов с операторами
-- Принцип: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.dialogs ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "dialogs_project_access" ON public.dialogs;
DROP POLICY IF EXISTS "dialogs_owner_access" ON public.dialogs;
DROP POLICY IF EXISTS "dialogs_user_access" ON public.dialogs;
DROP POLICY IF EXISTS "dialogs_operator_access" ON public.dialogs;

-- 3. СОЗДАЕМ НОВУЮ ПОЛИТИКУ
CREATE POLICY "dialogs_project_access" ON public.dialogs
    FOR ALL USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    );

-- 4. ПРЕДОСТАВЛЯЕМ ПРАВА
GRANT ALL ON public.dialogs TO authenticated;
GRANT ALL ON public.dialogs TO service_role;

-- 5. ПРОВЕРЯЕМ СТАТУС RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'dialogs') as policies_count
FROM pg_tables 
WHERE tablename = 'dialogs';

-- 6. ПРОВЕРЯЕМ ПОЛИТИКИ
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'dialogs';

-- 7. ПРОВЕРЯЕМ ДАННЫЕ
SELECT 
    'Всего диалогов' as metric,
    count(*) as value
FROM public.dialogs
UNION ALL
SELECT 
    'Уникальных проектов' as metric,
    count(DISTINCT project_id) as value
FROM public.dialogs
UNION ALL
SELECT 
    'Диалогов с project_id = null' as metric,
    count(*) as value
FROM public.dialogs
WHERE project_id IS NULL
UNION ALL
SELECT 
    'Активных диалогов' as metric,
    count(*) as value
FROM public.dialogs
WHERE status = 'active';

-- 8. ПРОВЕРЯЕМ СВЯЗИ С ПРОЕКТАМИ
SELECT 
    'Проектов с диалогами' as metric,
    count(DISTINCT p.id) as value
FROM public.projects p
INNER JOIN public.dialogs d ON p.id = d.project_id
UNION ALL
SELECT 
    'Проектов без диалогов' as metric,
    count(*) as value
FROM public.projects p
LEFT JOIN public.dialogs d ON p.id = d.project_id
WHERE d.project_id IS NULL;

-- 9. ПРОВЕРЯЕМ СТАТИСТИКУ ДИАЛОГОВ
SELECT 
    'Среднее диалогов на проект' as metric,
    ROUND(count(*)::numeric / count(DISTINCT project_id), 2) as value
FROM public.dialogs
WHERE project_id IS NOT NULL;

-- 10. ТЕСТ ИЗОЛЯЦИИ (должен показать только записи текущего пользователя)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ' as test_name,
    count(*) as visible_records,
    'Пользователь должен видеть только диалоги своих проектов' as expected
FROM public.dialogs;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политика создана, права предоставлены
-- СЛЕДУЮЩИЙ ШАГ: conversations
-- =====================================================
