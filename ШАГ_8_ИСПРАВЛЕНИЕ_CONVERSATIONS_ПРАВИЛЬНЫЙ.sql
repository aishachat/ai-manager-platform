-- =====================================================
-- ШАГ 8: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ CONVERSATIONS (ПРАВИЛЬНЫЙ)
-- =====================================================
-- Таблица: разговоры в диалогах проекта
-- Логика: 1 владелец = множество разговоров в диалогах
-- Принцип: owner_id = auth.uid() (владелец видит только свои разговоры)

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "conversations_project_access" ON public.conversations;
DROP POLICY IF EXISTS "conversations_owner_access" ON public.conversations;
DROP POLICY IF EXISTS "conversations_user_access" ON public.conversations;
DROP POLICY IF EXISTS "conversations_operator_access" ON public.conversations;

-- 3. СОЗДАЕМ НОВУЮ ПОЛИТИКУ (на основе owner_id)
CREATE POLICY "conversations_owner_access" ON public.conversations
    FOR ALL USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

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
    'Уникальных владельцев' as metric,
    count(DISTINCT owner_id) as value
FROM public.conversations
UNION ALL
SELECT 
    'Разговоров с owner_id = null' as metric,
    count(*) as value
FROM public.conversations
WHERE owner_id IS NULL
UNION ALL
SELECT 
    'Активных разговоров' as metric,
    count(*) as value
FROM public.conversations
WHERE status = 'active';

-- 8. ПРОВЕРЯЕМ СВЯЗИ С ВЛАДЕЛЬЦАМИ
SELECT 
    'Владельцев с разговорами' as metric,
    count(DISTINCT u.id) as value
FROM public.users u
INNER JOIN public.conversations c ON u.id = c.owner_id
UNION ALL
SELECT 
    'Владельцев без разговоров' as metric,
    count(*) as value
FROM public.users u
LEFT JOIN public.conversations c ON u.id = c.owner_id
WHERE c.owner_id IS NULL;

-- 9. ПРОВЕРЯЕМ СТАТИСТИКУ РАЗГОВОРОВ
SELECT 
    'Среднее разговоров на владельца' as metric,
    ROUND(count(*)::numeric / count(DISTINCT owner_id), 2) as value
FROM public.conversations
WHERE owner_id IS NOT NULL;

-- 10. ТЕСТ ИЗОЛЯЦИИ (должен показать только записи текущего пользователя)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ' as test_name,
    count(*) as visible_records,
    'Пользователь должен видеть только свои разговоры' as expected
FROM public.conversations;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политика создана, права предоставлены
-- ЛОГИКА: owner_id = auth.uid() (владелец видит только свои разговоры)
-- СЛЕДУЮЩИЙ ШАГ: проверить структуру других таблиц
-- =====================================================
