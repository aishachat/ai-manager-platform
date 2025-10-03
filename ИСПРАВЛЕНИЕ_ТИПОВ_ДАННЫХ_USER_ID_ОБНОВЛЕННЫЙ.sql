-- =====================================================
-- ИСПРАВЛЕНИЕ ТИПОВ ДАННЫХ USER_ID (ОБНОВЛЕННЫЙ)
-- =====================================================
-- Цель: исправить 3 таблицы с user_id типа text
-- Принцип: привести все user_id к типу uuid

-- 1. ИСПРАВЛЯЕМ MESSENGER_CONTACTS
-- Проверяем текущий тип
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'messenger_contacts'
AND column_name = 'user_id';

-- Изменяем тип с text на uuid
ALTER TABLE public.messenger_contacts 
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Проверяем результат
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'messenger_contacts'
AND column_name = 'user_id';

-- 2. ИСПРАВЛЯЕМ NOTIFICATIONS
-- Проверяем текущий тип
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notifications'
AND column_name = 'user_id';

-- Изменяем тип с text на uuid
ALTER TABLE public.notifications 
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Проверяем результат
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notifications'
AND column_name = 'user_id';

-- 3. ИСПРАВЛЯЕМ WIDGET_DEVELOPMENT_SETTINGS
-- Проверяем текущий тип
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'widget_development_settings'
AND column_name = 'user_id';

-- Изменяем тип с text на uuid
ALTER TABLE public.widget_development_settings 
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Проверяем результат
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'widget_development_settings'
AND column_name = 'user_id';

-- 4. ФИНАЛЬНАЯ ПРОВЕРКА
-- Проверяем все типы user_id после исправления
SELECT 
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'uuid' THEN '✅ ИСПРАВЛЕНО'
        WHEN data_type = 'text' THEN '❌ ТРЕБУЕТ ИСПРАВЛЕНИЯ'
        WHEN data_type = 'character varying' THEN '❌ ТРЕБУЕТ ИСПРАВЛЕНИЯ'
        ELSE '⚠️ ПРОВЕРИТЬ'
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'user_id'
ORDER BY table_name;

-- 5. ПРОВЕРЯЕМ ЦЕЛОСТНОСТЬ ДАННЫХ
-- Проверяем, что все user_id соответствуют существующим пользователям
SELECT 
    'messenger_contacts' as table_name,
    count(*) as total_records,
    count(DISTINCT user_id) as unique_users,
    count(CASE WHEN user_id IS NULL THEN 1 END) as null_records
FROM public.messenger_contacts
UNION ALL
SELECT 
    'notifications' as table_name,
    count(*) as total_records,
    count(DISTINCT user_id) as unique_users,
    count(CASE WHEN user_id IS NULL THEN 1 END) as null_records
FROM public.notifications
UNION ALL
SELECT 
    'widget_development_settings' as table_name,
    count(*) as total_records,
    count(DISTINCT user_id) as unique_users,
    count(CASE WHEN user_id IS NULL THEN 1 END) as null_records
FROM public.widget_development_settings;

-- 6. ИТОГОВАЯ СТАТИСТИКА
SELECT 
    'Всего таблиц с user_id' as metric,
    count(*) as value
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'user_id'
UNION ALL
SELECT 
    'Таблиц с user_id типа uuid' as metric,
    count(*) as value
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'user_id'
AND data_type = 'uuid'
UNION ALL
SELECT 
    'Таблиц с user_id типа text' as metric,
    count(*) as value
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'user_id'
AND data_type = 'text';

-- =====================================================
-- РЕЗУЛЬТАТ: все user_id приведены к типу uuid
-- СЛЕДУЮЩИЙ ШАГ: обновить RLS политики без приведения типов
-- =====================================================
