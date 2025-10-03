-- =====================================================
-- ШАГ 9: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ CHAT_MESSAGES
-- =====================================================
-- Критичная таблица: сообщения в чатах проекта
-- Логика: 1 проект = множество сообщений в чатах
-- Принцип: project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "chat_messages_project_access" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_owner_access" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_user_access" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_operator_access" ON public.chat_messages;

-- 3. СОЗДАЕМ НОВУЮ ПОЛИТИКУ
CREATE POLICY "chat_messages_project_access" ON public.chat_messages
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
GRANT ALL ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;

-- 5. ПРОВЕРЯЕМ СТАТУС RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'chat_messages') as policies_count
FROM pg_tables 
WHERE tablename = 'chat_messages';

-- 6. ПРОВЕРЯЕМ ПОЛИТИКИ
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'chat_messages';

-- 7. ПРОВЕРЯЕМ ДАННЫЕ
SELECT 
    'Всего сообщений' as metric,
    count(*) as value
FROM public.chat_messages
UNION ALL
SELECT 
    'Уникальных проектов' as metric,
    count(DISTINCT project_id) as value
FROM public.chat_messages
UNION ALL
SELECT 
    'Сообщений с project_id = null' as metric,
    count(*) as value
FROM public.chat_messages
WHERE project_id IS NULL
UNION ALL
SELECT 
    'Сообщений от пользователей' as metric,
    count(*) as value
FROM public.chat_messages
WHERE sender_type = 'user'
UNION ALL
SELECT 
    'Сообщений от бота' as metric,
    count(*) as value
FROM public.chat_messages
WHERE sender_type = 'bot';

-- 8. ПРОВЕРЯЕМ СВЯЗИ С ПРОЕКТАМИ
SELECT 
    'Проектов с сообщениями' as metric,
    count(DISTINCT p.id) as value
FROM public.projects p
INNER JOIN public.chat_messages cm ON p.id = cm.project_id
UNION ALL
SELECT 
    'Проектов без сообщений' as metric,
    count(*) as value
FROM public.projects p
LEFT JOIN public.chat_messages cm ON p.id = cm.project_id
WHERE cm.project_id IS NULL;

-- 9. ПРОВЕРЯЕМ СТАТИСТИКУ СООБЩЕНИЙ
SELECT 
    'Среднее сообщений на проект' as metric,
    ROUND(count(*)::numeric / count(DISTINCT project_id), 2) as value
FROM public.chat_messages
WHERE project_id IS NOT NULL;

-- 10. ПРОВЕРЯЕМ СВЯЗИ С ДИАЛОГАМИ И РАЗГОВОРАМИ (если есть колонки)
-- SELECT 
--     'Сообщений с dialog_id' as metric,
--     count(*) as value
-- FROM public.chat_messages
-- WHERE dialog_id IS NOT NULL
-- UNION ALL
-- SELECT 
--     'Сообщений с conversation_id' as metric,
--     count(*) as value
-- FROM public.chat_messages
-- WHERE conversation_id IS NOT NULL
-- UNION ALL
-- SELECT 
--     'Сообщений без dialog_id' as metric,
--     count(*) as value
-- FROM public.chat_messages
-- WHERE dialog_id IS NULL;

-- 11. ПРОВЕРЯЕМ ПОСЛЕДНИЕ СООБЩЕНИЯ
SELECT 
    'Последнее сообщение' as metric,
    MAX(created_at)::text as value
FROM public.chat_messages
UNION ALL
SELECT 
    'Первое сообщение' as metric,
    MIN(created_at)::text as value
FROM public.chat_messages;

-- 12. ТЕСТ ИЗОЛЯЦИИ (должен показать только записи текущего пользователя)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ' as test_name,
    count(*) as visible_records,
    'Пользователь должен видеть только сообщения своих проектов' as expected
FROM public.chat_messages;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политика создана, права предоставлены
-- СЛЕДУЮЩИЙ ШАГ: widget_development_settings (ФАЗА 2)
-- =====================================================
