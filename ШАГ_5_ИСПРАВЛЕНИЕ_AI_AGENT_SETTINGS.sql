-- =====================================================
-- ШАГ 5: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ AI_AGENT_SETTINGS
-- =====================================================
-- Критичная таблица: настройки AI агента для проекта
-- Логика: 1 проект = 1 AI агент с настройками
-- Принцип: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.ai_agent_settings ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "ai_agent_settings_project_access" ON public.ai_agent_settings;
DROP POLICY IF EXISTS "ai_agent_settings_owner_access" ON public.ai_agent_settings;
DROP POLICY IF EXISTS "ai_agent_settings_user_access" ON public.ai_agent_settings;

-- 3. СОЗДАЕМ НОВУЮ ПОЛИТИКУ
CREATE POLICY "ai_agent_settings_project_access" ON public.ai_agent_settings
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
GRANT ALL ON public.ai_agent_settings TO authenticated;
GRANT ALL ON public.ai_agent_settings TO service_role;

-- 5. ПРОВЕРЯЕМ СТАТУС RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'ai_agent_settings') as policies_count
FROM pg_tables 
WHERE tablename = 'ai_agent_settings';

-- 6. ПРОВЕРЯЕМ ПОЛИТИКИ
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'ai_agent_settings';

-- 7. ПРОВЕРЯЕМ ДАННЫЕ
SELECT 
    'Всего записей' as metric,
    count(*) as value
FROM public.ai_agent_settings
UNION ALL
SELECT 
    'Уникальных проектов' as metric,
    count(DISTINCT project_id) as value
FROM public.ai_agent_settings
UNION ALL
SELECT 
    'Записей с project_id = null' as metric,
    count(*) as value
FROM public.ai_agent_settings
WHERE project_id IS NULL;

-- 8. ПРОВЕРЯЕМ СВЯЗИ С ПРОЕКТАМИ
SELECT 
    'Проектов с настройками агента' as metric,
    count(DISTINCT p.id) as value
FROM public.projects p
INNER JOIN public.ai_agent_settings aas ON p.id = aas.project_id
UNION ALL
SELECT 
    'Проектов без настроек агента' as metric,
    count(*) as value
FROM public.projects p
LEFT JOIN public.ai_agent_settings aas ON p.id = aas.project_id
WHERE aas.project_id IS NULL;

-- 9. ТЕСТ ИЗОЛЯЦИИ (должен показать только записи текущего пользователя)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ' as test_name,
    count(*) as visible_records,
    'Пользователь должен видеть только записи своих проектов' as expected
FROM public.ai_agent_settings;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политика создана, права предоставлены
-- СЛЕДУЮЩИЙ ШАГ: autoswitch_settings
-- =====================================================
