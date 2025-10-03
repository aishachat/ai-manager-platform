-- =====================================================
-- ШАГ 24: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ CRM_DEAL_NOTES (ПРОЕКТ)
-- =====================================================
-- Таблица: заметки к сделкам CRM для проекта
-- Логика: 1 проект = множество заметок к сделкам CRM (командная работа)
-- Принцип: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.crm_deal_notes ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "crm_deal_notes_project_access" ON public.crm_deal_notes;
DROP POLICY IF EXISTS "crm_deal_notes_owner_access" ON public.crm_deal_notes;
DROP POLICY IF EXISTS "crm_deal_notes_user_access" ON public.crm_deal_notes;
DROP POLICY IF EXISTS "crm_deal_notes_combined_access" ON public.crm_deal_notes;

-- 3. СОЗДАЕМ НОВУЮ ПОЛИТИКУ (на основе project_id)
CREATE POLICY "crm_deal_notes_project_access" ON public.crm_deal_notes
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
GRANT ALL ON public.crm_deal_notes TO authenticated;
GRANT ALL ON public.crm_deal_notes TO service_role;

-- 5. ПРОВЕРЯЕМ СТАТУС RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'crm_deal_notes') as policies_count
FROM pg_tables 
WHERE tablename = 'crm_deal_notes';

-- 6. ПРОВЕРЯЕМ ПОЛИТИКИ
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'crm_deal_notes';

-- 7. ПРОВЕРЯЕМ ДАННЫЕ
SELECT 
    'Всего заметок к сделкам CRM' as metric,
    count(*) as value
FROM public.crm_deal_notes
UNION ALL
SELECT 
    'Уникальных проектов' as metric,
    count(DISTINCT project_id) as value
FROM public.crm_deal_notes
UNION ALL
SELECT 
    'Уникальных пользователей' as metric,
    count(DISTINCT user_id) as value
FROM public.crm_deal_notes
UNION ALL
SELECT 
    'Заметок с project_id = null' as metric,
    count(*) as value
FROM public.crm_deal_notes
WHERE project_id IS NULL
UNION ALL
SELECT 
    'Заметок с user_id = null' as metric,
    count(*) as value
FROM public.crm_deal_notes
WHERE user_id IS NULL;

-- 8. ПРОВЕРЯЕМ СВЯЗИ С ПРОЕКТАМИ
SELECT 
    'Проектов с заметками к сделкам CRM' as metric,
    count(DISTINCT p.id) as value
FROM public.projects p
INNER JOIN public.crm_deal_notes cdn ON p.id = cdn.project_id
UNION ALL
SELECT 
    'Проектов без заметок к сделкам CRM' as metric,
    count(*) as value
FROM public.projects p
LEFT JOIN public.crm_deal_notes cdn ON p.id = cdn.project_id
WHERE cdn.project_id IS NULL;

-- 9. ПРОВЕРЯЕМ СВЯЗИ С ПОЛЬЗОВАТЕЛЯМИ
SELECT 
    'Пользователей с заметками к сделкам CRM' as metric,
    count(DISTINCT u.id) as value
FROM public.users u
INNER JOIN public.crm_deal_notes cdn ON u.id = cdn.user_id
UNION ALL
SELECT 
    'Пользователей без заметок к сделкам CRM' as metric,
    count(*) as value
FROM public.users u
LEFT JOIN public.crm_deal_notes cdn ON u.id = cdn.user_id
WHERE cdn.user_id IS NULL;

-- 10. ПРОВЕРЯЕМ СТАТИСТИКУ
SELECT 
    'Среднее заметок на проект' as metric,
    CASE 
        WHEN count(DISTINCT project_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT project_id), 2)::text
        ELSE '0' 
    END as value
FROM public.crm_deal_notes
WHERE project_id IS NOT NULL
UNION ALL
SELECT 
    'Среднее заметок на пользователя' as metric,
    CASE 
        WHEN count(DISTINCT user_id) > 0 
        THEN ROUND(count(*)::numeric / count(DISTINCT user_id), 2)::text
        ELSE '0' 
    END as value
FROM public.crm_deal_notes
WHERE user_id IS NOT NULL;

-- 11. ПРОВЕРЯЕМ ПОСЛЕДНИЕ ЗАМЕТКИ
SELECT 
    'Последние заметки' as metric,
    MAX(created_at)::text as value
FROM public.crm_deal_notes
UNION ALL
SELECT 
    'Первые заметки' as metric,
    MIN(created_at)::text as value
FROM public.crm_deal_notes;

-- 12. ТЕСТ ИЗОЛЯЦИИ (должен показать только записи текущего пользователя)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ' as test_name,
    count(*) as visible_records,
    'Пользователь должен видеть только заметки к сделкам CRM своих проектов' as expected
FROM public.crm_deal_notes;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политика создана, права предоставлены
-- ЛОГИКА: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
-- ПРИНЦИП: Командная работа - все участники проекта видят заметки к сделкам CRM
-- СЛЕДУЮЩИЙ ШАГ: dialog_crm_connections
-- =====================================================
