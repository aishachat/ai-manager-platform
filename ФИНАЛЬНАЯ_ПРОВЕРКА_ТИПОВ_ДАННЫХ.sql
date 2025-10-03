-- =====================================================
-- ФИНАЛЬНАЯ ПРОВЕРКА ТИПОВ ДАННЫХ
-- =====================================================
-- Цель: проверить все таблицы после очистки данных
-- Принцип: убедиться, что все user_id являются валидными UUID

-- 1. ПРОВЕРЯЕМ ВСЕ 3 ТАБЛИЦЫ НА ВАЛИДНОСТЬ UUID
SELECT 
    'messenger_contacts' as table_name,
    count(*) as total_records,
    count(CASE WHEN user_id IS NULL THEN 1 END) as null_records,
    count(CASE WHEN user_id IS NOT NULL THEN 1 END) as non_null_records,
    count(CASE WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as valid_uuid,
    count(CASE WHEN user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND user_id IS NOT NULL THEN 1 END) as invalid_uuid
FROM public.messenger_contacts
UNION ALL
SELECT 
    'notifications' as table_name,
    count(*) as total_records,
    count(CASE WHEN user_id IS NULL THEN 1 END) as null_records,
    count(CASE WHEN user_id IS NOT NULL THEN 1 END) as non_null_records,
    count(CASE WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as valid_uuid,
    count(CASE WHEN user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND user_id IS NOT NULL THEN 1 END) as invalid_uuid
FROM public.notifications
UNION ALL
SELECT 
    'widget_development_settings' as table_name,
    count(*) as total_records,
    count(CASE WHEN user_id IS NULL THEN 1 END) as null_records,
    count(CASE WHEN user_id IS NOT NULL THEN 1 END) as non_null_records,
    count(CASE WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as valid_uuid,
    count(CASE WHEN user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND user_id IS NOT NULL THEN 1 END) as invalid_uuid
FROM public.widget_development_settings;

-- 2. ПРОВЕРЯЕМ ТИПЫ ДАННЫХ ВО ВСЕХ ТАБЛИЦАХ
SELECT 
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'uuid' THEN '✅ ПРАВИЛЬНО'
        WHEN data_type = 'text' THEN '❌ ТРЕБУЕТ ИСПРАВЛЕНИЯ'
        WHEN data_type = 'character varying' THEN '❌ ТРЕБУЕТ ИСПРАВЛЕНИЯ'
        ELSE '⚠️ ПРОВЕРИТЬ'
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'user_id'
ORDER BY table_name;

-- 3. ИТОГОВАЯ СТАТИСТИКА
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

-- 4. ПРОВЕРЯЕМ ГОТОВНОСТЬ К ИЗМЕНЕНИЮ ТИПОВ
SELECT 
    CASE 
        WHEN (
            SELECT count(*) 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND column_name = 'user_id'
            AND data_type = 'text'
        ) = 0 
        THEN '✅ ВСЕ ГОТОВО - можно изменять типы данных'
        ELSE '❌ ЕСТЬ ПРОБЛЕМЫ - нужно исправить типы данных'
    END as readiness_status;

-- =====================================================
-- РЕЗУЛЬТАТ: финальная проверка готовности к изменению типов
-- АНАЛИЗ: убедиться, что все данные валидны
-- =====================================================
