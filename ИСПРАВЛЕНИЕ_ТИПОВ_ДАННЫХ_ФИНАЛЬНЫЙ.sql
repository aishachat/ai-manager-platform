-- =====================================================
-- ИСПРАВЛЕНИЕ ТИПОВ ДАННЫХ (ФИНАЛЬНЫЙ)
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

-- 5. ИТОГОВАЯ СТАТИСТИКА
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

-- 6. ПРОВЕРЯЕМ ГОТОВНОСТЬ К RLS
SELECT 
    CASE 
        WHEN (
            SELECT count(*) 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND column_name = 'user_id'
            AND data_type = 'text'
        ) = 0 
        THEN '✅ ВСЕ ГОТОВО - можно применять RLS политики'
        ELSE '❌ ЕСТЬ ПРОБЛЕМЫ - нужно исправить типы данных'
    END as readiness_status;

-- =====================================================
-- РЕЗУЛЬТАТ: все user_id приведены к типу uuid
-- СЛЕДУЮЩИЙ ШАГ: применить RLS политики
-- =====================================================
