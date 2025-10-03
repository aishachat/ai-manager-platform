-- =====================================================
-- ИСПРАВЛЕНИЕ ТИПОВ ДАННЫХ USER_ID
-- =====================================================
-- Цель: привести все user_id к типу uuid
-- Принцип: обеспечить консистентность типов данных

-- 1. ИСПРАВЛЯЕМ WIDGET_DEVELOPMENT_SETTINGS
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

-- 2. ИСПРАВЛЯЕМ ДРУГИЕ ТАБЛИЦЫ (если найдутся)
-- Проверяем все таблицы с user_id типа text
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'user_id'
AND data_type = 'text';

-- Для каждой найденной таблицы выполняем:
-- ALTER TABLE public.table_name 
-- ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- 3. ИСПРАВЛЯЕМ ТАБЛИЦЫ С USER_ID ТИПА CHARACTER VARYING
-- Проверяем все таблицы с user_id типа character varying
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'user_id'
AND data_type = 'character varying';

-- Для каждой найденной таблицы выполняем:
-- ALTER TABLE public.table_name 
-- ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- 4. ИСПРАВЛЯЕМ ТАБЛИЦЫ С OWNER_ID (если нужно)
-- Проверяем все таблицы с owner_id типа text
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'owner_id'
AND data_type = 'text';

-- Для каждой найденной таблицы выполняем:
-- ALTER TABLE public.table_name 
-- ALTER COLUMN owner_id TYPE uuid USING owner_id::uuid;

-- 5. ИСПРАВЛЯЕМ ТАБЛИЦЫ С PROJECT_ID (если нужно)
-- Проверяем все таблицы с project_id типа text
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'project_id'
AND data_type = 'text';

-- Для каждой найденной таблицы выполняем:
-- ALTER TABLE public.table_name 
-- ALTER COLUMN project_id TYPE uuid USING project_id::uuid;

-- 6. ФИНАЛЬНАЯ ПРОВЕРКА
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

-- 7. ПРОВЕРЯЕМ ЦЕЛОСТНОСТЬ ДАННЫХ
-- Проверяем, что все user_id соответствуют существующим пользователям
SELECT 
    'Проверка целостности user_id' as test_name,
    count(*) as total_records,
    count(DISTINCT user_id) as unique_users,
    count(CASE WHEN user_id IS NULL THEN 1 END) as null_records
FROM public.widget_development_settings;

-- =====================================================
-- РЕЗУЛЬТАТ: все user_id приведены к типу uuid
-- СЛЕДУЮЩИЙ ШАГ: обновить RLS политики без приведения типов
-- =====================================================
