-- =====================================================
-- ПРОВЕРКА ДАННЫХ ПЕРЕД ИСПРАВЛЕНИЕМ ТИПОВ
-- =====================================================
-- Цель: проверить данные в таблицах с user_id типа text
-- Принцип: найти некорректные данные перед изменением типа

-- 1. ПРОВЕРЯЕМ MESSENGER_CONTACTS
SELECT 
    'messenger_contacts' as table_name,
    user_id,
    count(*) as count
FROM public.messenger_contacts
WHERE user_id IS NOT NULL
GROUP BY user_id
ORDER BY count DESC;

-- 2. ПРОВЕРЯЕМ NOTIFICATIONS
SELECT 
    'notifications' as table_name,
    user_id,
    count(*) as count
FROM public.notifications
WHERE user_id IS NOT NULL
GROUP BY user_id
ORDER BY count DESC;

-- 3. ПРОВЕРЯЕМ WIDGET_DEVELOPMENT_SETTINGS
SELECT 
    'widget_development_settings' as table_name,
    user_id,
    count(*) as count
FROM public.widget_development_settings
WHERE user_id IS NOT NULL
GROUP BY user_id
ORDER BY count DESC;

-- 4. ПРОВЕРЯЕМ НЕКОРРЕКТНЫЕ ДАННЫЕ
-- Ищем данные, которые не являются валидными UUID
SELECT 
    'messenger_contacts' as table_name,
    user_id,
    count(*) as count
FROM public.messenger_contacts
WHERE user_id IS NOT NULL
AND user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
GROUP BY user_id
ORDER BY count DESC;

SELECT 
    'notifications' as table_name,
    user_id,
    count(*) as count
FROM public.notifications
WHERE user_id IS NOT NULL
AND user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
GROUP BY user_id
ORDER BY count DESC;

SELECT 
    'widget_development_settings' as table_name,
    user_id,
    count(*) as count
FROM public.widget_development_settings
WHERE user_id IS NOT NULL
AND user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
GROUP BY user_id
ORDER BY count DESC;

-- 5. ПРОВЕРЯЕМ СВЯЗИ С ПОЛЬЗОВАТЕЛЯМИ
-- Проверяем, какие user_id не соответствуют существующим пользователям
SELECT 
    'messenger_contacts' as table_name,
    count(*) as total_records,
    count(CASE WHEN user_id IN (SELECT id FROM public.users) THEN 1 END) as valid_users,
    count(CASE WHEN user_id NOT IN (SELECT id FROM public.users) AND user_id IS NOT NULL THEN 1 END) as invalid_users
FROM public.messenger_contacts;

SELECT 
    'notifications' as table_name,
    count(*) as total_records,
    count(CASE WHEN user_id IN (SELECT id FROM public.users) THEN 1 END) as valid_users,
    count(CASE WHEN user_id NOT IN (SELECT id FROM public.users) AND user_id IS NOT NULL THEN 1 END) as invalid_users
FROM public.notifications;

SELECT 
    'widget_development_settings' as table_name,
    count(*) as total_records,
    count(CASE WHEN user_id IN (SELECT id FROM public.users) THEN 1 END) as valid_users,
    count(CASE WHEN user_id NOT IN (SELECT id FROM public.users) AND user_id IS NOT NULL THEN 1 END) as invalid_users
FROM public.widget_development_settings;

-- =====================================================
-- РЕЗУЛЬТАТ: проверка данных перед исправлением типов
-- АНАЛИЗ: найти некорректные данные и исправить их
-- =====================================================
