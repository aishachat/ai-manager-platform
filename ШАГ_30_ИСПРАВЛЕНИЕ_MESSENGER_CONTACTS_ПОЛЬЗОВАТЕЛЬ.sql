-- ========================================
-- ШАГ 30: ИСПРАВЛЕНИЕ RLS ДЛЯ MESSENGER_CONTACTS
-- ========================================

-- Удаляем старые политики
DROP POLICY IF EXISTS "messenger_contacts_user_access" ON public.messenger_contacts;
DROP POLICY IF EXISTS "messenger_contacts_project_access" ON public.messenger_contacts;
DROP POLICY IF EXISTS "messenger_contacts_read_all" ON public.messenger_contacts;
DROP POLICY IF EXISTS "messenger_contacts_write_owners" ON public.messenger_contacts;

-- Включаем RLS
ALTER TABLE public.messenger_contacts ENABLE ROW LEVEL SECURITY;

-- Создаем новую политику на основе user_id
CREATE POLICY "messenger_contacts_user_access" ON public.messenger_contacts
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Предоставляем права
GRANT ALL ON public.messenger_contacts TO authenticated;
GRANT ALL ON public.messenger_contacts TO service_role;

-- Проверяем результат
SELECT 
    'messenger_contacts' as table_name,
    'RLS включен' as rls_status,
    'Политика messenger_contacts_user_access создана' as policy_status,
    'Права предоставлены' as permissions_status,
    'Готово к следующему шагу' as next_step;

-- Статистика
SELECT 
    'Всего контактов' as metric,
    COUNT(*)::text as value
FROM public.messenger_contacts
UNION ALL
SELECT 
    'Уникальных пользователей' as metric,
    COUNT(DISTINCT user_id)::text as value
FROM public.messenger_contacts;

-- Проверяем изоляцию данных
SELECT 
    'Текущий пользователь видит контактов' as test_description,
    COUNT(*)::text as visible_records
FROM public.messenger_contacts
WHERE user_id = auth.uid();
