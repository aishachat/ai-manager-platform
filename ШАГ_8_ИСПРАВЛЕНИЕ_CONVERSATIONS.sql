-- =====================================================
-- ШАГ 8: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ CONVERSATIONS
-- =====================================================
-- Критичная таблица: разговоры в диалогах проекта
-- Логика: 1 проект = множество разговоров в диалогах
-- Принцип: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "conversations_project_access" ON public.conversations;
DROP POLICY IF EXISTS "conversations_owner_access" ON public.conversations;
DROP POLICY IF EXISTS "conversations_user_access" ON public.conversations;
DROP POLICY IF EXISTS "conversations_operator_access" ON public.conversations;

-- 3. СОЗДАЕМ НОВУЮ ПОЛИТИКУ
CREATE POLICY "conversations_project_access" ON public.conversations
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
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;

-- 5. ПРОВЕРЯЕМ СТАТУС RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'conversations') as policies_count
FROM pg_tables 
WHERE tablename = 'conversations';

-- 6. ПРОВЕРЯЕМ ПОЛИТИКИ
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'conversations';

-- 7. ПРОВЕРЯЕМ ДАННЫЕ
SELECT 
    'Всего разговоров' as metric,
    count(*) as value
FROM public.conversations
UNION ALL
SELECT 
    'Уникальных проектов' as metric,
    count(DISTINCT project_id) as value
FROM public.conversations
UNION ALL
SELECT 
    'Разговоров с project_id = null' as metric,
    count(*) as value
FROM public.conversations
WHERE project_id IS NULL
UNION ALL
SELECT 
    'Активных разговоров' as metric,
    count(*) as value
FROM public.conversations
WHERE status = 'active';

-- 8. ПРОВЕРЯЕМ СВЯЗИ С ПРОЕКТАМИ
SELECT 
    'Проектов с разговорами' as metric,
    count(DISTINCT p.id) as value
FROM public.projects p
INNER JOIN public.conversations c ON p.id = c.project_id
UNION ALL
SELECT 
    'Проектов без разговоров' as metric,
    count(*) as value
FROM public.projects p
LEFT JOIN public.conversations c ON p.id = c.project_id
WHERE c.project_id IS NULL;

-- 9. ПРОВЕРЯЕМ СТАТИСТИКУ РАЗГОВОРОВ
SELECT 
    'Среднее разговоров на проект' as metric,
    ROUND(count(*)::numeric / count(DISTINCT project_id), 2) as value
FROM public.conversations
WHERE project_id IS NOT NULL;

-- 10. ПРОВЕРЯЕМ СВЯЗИ С ДИАЛОГАМИ (если есть колонка dialog_id)
-- SELECT 
--     'Разговоров с dialog_id' as metric,
--     count(*) as value
-- FROM public.conversations
-- WHERE dialog_id IS NOT NULL
-- UNION ALL
-- SELECT 
--     'Разговоров без dialog_id' as metric,
--     count(*) as value
-- FROM public.conversations
-- WHERE dialog_id IS NULL;

-- 11. ТЕСТ ИЗОЛЯЦИИ (должен показать только записи текущего пользователя)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ' as test_name,
    count(*) as visible_records,
    'Пользователь должен видеть только разговоры своих проектов' as expected
FROM public.conversations;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политика создана, права предоставлены
-- СЛЕДУЮЩИЙ ШАГ: chat_messages
-- =====================================================
