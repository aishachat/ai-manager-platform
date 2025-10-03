-- =====================================================
-- ПРОВЕРКА СТРУКТУРЫ ТАБЛИЦЫ AUTOSWITCH_SETTINGS
-- =====================================================

-- 1. ПРОВЕРЯЕМ СТРУКТУРУ ТАБЛИЦЫ
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'autoswitch_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. ПРОВЕРЯЕМ СУЩЕСТВОВАНИЕ ТАБЛИЦЫ
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'autoswitch_settings';

-- 3. ПРОВЕРЯЕМ ДАННЫЕ В ТАБЛИЦЕ (если есть)
SELECT 
    'Всего записей' as metric,
    count(*)::text as value
FROM public.autoswitch_settings;

-- 4. ПОКАЗЫВАЕМ ПЕРВЫЕ 5 ЗАПИСЕЙ
SELECT * FROM public.autoswitch_settings LIMIT 5;

-- 5. ПРОВЕРЯЕМ СВЯЗИ С ДРУГИМИ ТАБЛИЦАМИ
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'autoswitch_settings';
