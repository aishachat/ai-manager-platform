-- =====================================================
-- ОЧИСТКА НЕКОРРЕКТНЫХ ДАННЫХ
-- =====================================================
-- Цель: очистить некорректные данные перед изменением типа
-- Принцип: удалить или исправить данные, которые не являются валидными UUID

-- 1. ОЧИЩАЕМ MESSENGER_CONTACTS
-- Удаляем записи с некорректными user_id
DELETE FROM public.messenger_contacts
WHERE user_id IS NOT NULL
AND user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Удаляем записи с user_id, которые не соответствуют существующим пользователям
DELETE FROM public.messenger_contacts
WHERE user_id IS NOT NULL
AND user_id NOT IN (SELECT id::text FROM public.users);

-- 2. ОЧИЩАЕМ NOTIFICATIONS
-- Удаляем записи с некорректными user_id
DELETE FROM public.notifications
WHERE user_id IS NOT NULL
AND user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Удаляем записи с user_id, которые не соответствуют существующим пользователям
DELETE FROM public.notifications
WHERE user_id IS NOT NULL
AND user_id NOT IN (SELECT id::text FROM public.users);

-- 3. ОЧИЩАЕМ WIDGET_DEVELOPMENT_SETTINGS
-- Удаляем записи с некорректными user_id
DELETE FROM public.widget_development_settings
WHERE user_id IS NOT NULL
AND user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Удаляем записи с user_id, которые не соответствуют существующим пользователям
DELETE FROM public.widget_development_settings
WHERE user_id IS NOT NULL
AND user_id NOT IN (SELECT id::text FROM public.users);

-- 4. ПРОВЕРЯЕМ РЕЗУЛЬТАТЫ ОЧИСТКИ
SELECT 
    'messenger_contacts' as table_name,
    count(*) as total_records,
    count(CASE WHEN user_id IS NULL THEN 1 END) as null_records,
    count(CASE WHEN user_id IS NOT NULL THEN 1 END) as non_null_records
FROM public.messenger_contacts;

SELECT 
    'notifications' as table_name,
    count(*) as total_records,
    count(CASE WHEN user_id IS NULL THEN 1 END) as null_records,
    count(CASE WHEN user_id IS NOT NULL THEN 1 END) as non_null_records
FROM public.notifications;

SELECT 
    'widget_development_settings' as table_name,
    count(*) as total_records,
    count(CASE WHEN user_id IS NULL THEN 1 END) as null_records,
    count(CASE WHEN user_id IS NOT NULL THEN 1 END) as non_null_records
FROM public.widget_development_settings;

-- 5. ПРОВЕРЯЕМ ВАЛИДНОСТЬ UUID
-- Проверяем, что все оставшиеся user_id являются валидными UUID
SELECT 
    'messenger_contacts' as table_name,
    count(*) as total_records,
    count(CASE WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as valid_uuid,
    count(CASE WHEN user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND user_id IS NOT NULL THEN 1 END) as invalid_uuid
FROM public.messenger_contacts;

SELECT 
    'notifications' as table_name,
    count(*) as total_records,
    count(CASE WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as valid_uuid,
    count(CASE WHEN user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND user_id IS NOT NULL THEN 1 END) as invalid_uuid
FROM public.notifications;

SELECT 
    'widget_development_settings' as table_name,
    count(*) as total_records,
    count(CASE WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as valid_uuid,
    count(CASE WHEN user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND user_id IS NOT NULL THEN 1 END) as invalid_uuid
FROM public.widget_development_settings;

-- =====================================================
-- РЕЗУЛЬТАТ: некорректные данные очищены
-- СЛЕДУЮЩИЙ ШАГ: изменить типы данных
-- =====================================================
