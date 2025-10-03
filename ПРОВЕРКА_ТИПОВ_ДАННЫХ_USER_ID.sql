-- =====================================================
-- ПРОВЕРКА ТИПОВ ДАННЫХ USER_ID ВО ВСЕХ ТАБЛИЦАХ
-- =====================================================
-- Цель: найти все таблицы с user_id и проверить их типы
-- Принцип: обеспечить консистентность типов данных

-- 1. ПРОВЕРЯЕМ ТИПЫ USER_ID ВО ВСЕХ ТАБЛИЦАХ
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name IN ('user_id', 'owner_id')
ORDER BY table_name, column_name;

-- 2. ПРОВЕРЯЕМ ТАБЛИЦЫ С USER_ID
SELECT 
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'uuid' THEN '✅ ПРАВИЛЬНО'
        WHEN data_type = 'text' THEN '❌ НЕПРАВИЛЬНО - должен быть uuid'
        WHEN data_type = 'character varying' THEN '❌ НЕПРАВИЛЬНО - должен быть uuid'
        ELSE '⚠️ ПРОВЕРИТЬ'
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'user_id'
ORDER BY table_name;

-- 3. ПРОВЕРЯЕМ ТАБЛИЦЫ С OWNER_ID
SELECT 
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'uuid' THEN '✅ ПРАВИЛЬНО'
        WHEN data_type = 'text' THEN '❌ НЕПРАВИЛЬНО - должен быть uuid'
        WHEN data_type = 'character varying' THEN '❌ НЕПРАВИЛЬНО - должен быть uuid'
        ELSE '⚠️ ПРОВЕРИТЬ'
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'owner_id'
ORDER BY table_name;

-- 4. ПРОВЕРЯЕМ ТАБЛИЦЫ С PROJECT_ID
SELECT 
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'uuid' THEN '✅ ПРАВИЛЬНО'
        WHEN data_type = 'text' THEN '❌ НЕПРАВИЛЬНО - должен быть uuid'
        WHEN data_type = 'character varying' THEN '❌ НЕПРАВИЛЬНО - должен быть uuid'
        ELSE '⚠️ ПРОВЕРИТЬ'
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'project_id'
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
AND data_type = 'text'
UNION ALL
SELECT 
    'Таблиц с user_id типа character varying' as metric,
    count(*) as value
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'user_id'
AND data_type = 'character varying';

-- =====================================================
-- РЕЗУЛЬТАТ: проверка типов данных user_id во всех таблицах
-- АНАЛИЗ: найти несоответствия и исправить их
-- =====================================================
