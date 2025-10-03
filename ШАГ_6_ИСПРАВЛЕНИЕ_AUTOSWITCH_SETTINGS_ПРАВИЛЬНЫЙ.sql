-- =====================================================
-- ШАГ 6: ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ AUTOSWITCH_SETTINGS (ПРАВИЛЬНЫЙ)
-- =====================================================
-- Таблица: настройки автопереключения моделей для пользователя
-- Логика: 1 пользователь = 1 набор настроек автопереключения
-- Принцип: user_id = auth.uid() (пользователь видит только свои настройки)

-- 1. ВКЛЮЧАЕМ RLS
ALTER TABLE public.autoswitch_settings ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "autoswitch_settings_project_access" ON public.autoswitch_settings;
DROP POLICY IF EXISTS "autoswitch_settings_owner_access" ON public.autoswitch_settings;
DROP POLICY IF EXISTS "autoswitch_settings_user_access" ON public.autoswitch_settings;

-- 3. СОЗДАЕМ НОВУЮ ПОЛИТИКУ (на основе user_id)
CREATE POLICY "autoswitch_settings_user_access" ON public.autoswitch_settings
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 4. ПРЕДОСТАВЛЯЕМ ПРАВА
GRANT ALL ON public.autoswitch_settings TO authenticated;
GRANT ALL ON public.autoswitch_settings TO service_role;

-- 5. ПРОВЕРЯЕМ СТАТУС RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'autoswitch_settings') as policies_count
FROM pg_tables 
WHERE tablename = 'autoswitch_settings';

-- 6. ПРОВЕРЯЕМ ПОЛИТИКИ
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'autoswitch_settings';

-- 7. ПРОВЕРЯЕМ ДАННЫЕ
SELECT 
    'Всего записей' as metric,
    count(*) as value
FROM public.autoswitch_settings
UNION ALL
SELECT 
    'Уникальных пользователей' as metric,
    count(DISTINCT user_id) as value
FROM public.autoswitch_settings
UNION ALL
SELECT 
    'Записей с user_id = null' as metric,
    count(*) as value
FROM public.autoswitch_settings
WHERE user_id IS NULL;

-- 8. ПРОВЕРЯЕМ СВЯЗИ С ПОЛЬЗОВАТЕЛЯМИ
SELECT 
    'Пользователей с настройками автопереключения' as metric,
    count(DISTINCT u.id) as value
FROM public.users u
INNER JOIN public.autoswitch_settings aus ON u.id = aus.user_id
UNION ALL
SELECT 
    'Пользователей без настроек автопереключения' as metric,
    count(*) as value
FROM public.users u
LEFT JOIN public.autoswitch_settings aus ON u.id = aus.user_id
WHERE aus.user_id IS NULL;

-- 9. ПРОВЕРЯЕМ СТАТИСТИКУ
SELECT 
    'Среднее настроек на пользователя' as metric,
    ROUND(count(*)::numeric / count(DISTINCT user_id), 2) as value
FROM public.autoswitch_settings
WHERE user_id IS NOT NULL;

-- 10. ТЕСТ ИЗОЛЯЦИИ (должен показать только записи текущего пользователя)
SELECT 
    'ТЕСТ ИЗОЛЯЦИИ' as test_name,
    count(*) as visible_records,
    'Пользователь должен видеть только свои настройки' as expected
FROM public.autoswitch_settings;

-- =====================================================
-- РЕЗУЛЬТАТ: RLS включен, политика создана, права предоставлены
-- ЛОГИКА: user_id = auth.uid() (пользователь видит только свои настройки)
-- СЛЕДУЮЩИЙ ШАГ: проверить структуру других таблиц
-- =====================================================
