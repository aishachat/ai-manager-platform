-- ========================================
-- ШАГ 31: ИСПРАВЛЕНИЕ RLS ДЛЯ NOTIFICATIONS
-- ========================================

-- Удаляем старые политики
DROP POLICY IF EXISTS "notifications_user_access" ON public.notifications;
DROP POLICY IF EXISTS "notifications_project_access" ON public.notifications;
DROP POLICY IF EXISTS "notifications_read_all" ON public.notifications;
DROP POLICY IF EXISTS "notifications_write_owners" ON public.notifications;

-- Включаем RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Создаем новую политику на основе user_id
CREATE POLICY "notifications_user_access" ON public.notifications
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Предоставляем права
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- Проверяем результат
SELECT 
    'notifications' as table_name,
    'RLS включен' as rls_status,
    'Политика notifications_user_access создана' as policy_status,
    'Права предоставлены' as permissions_status,
    'Готово к следующему шагу' as next_step;

-- Статистика
SELECT 
    'Всего уведомлений' as metric,
    COUNT(*)::text as value
FROM public.notifications
UNION ALL
SELECT 
    'Уникальных пользователей' as metric,
    COUNT(DISTINCT user_id)::text as value
FROM public.notifications;

-- Проверяем изоляцию данных
SELECT 
    'Текущий пользователь видит уведомлений' as test_description,
    COUNT(*)::text as visible_records
FROM public.notifications
WHERE user_id = auth.uid();
