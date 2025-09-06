-- ДЕТАЛЬНЫЙ АНАЛИЗ СУЩЕСТВУЮЩЕЙ СТРУКТУРЫ БАЗЫ ДАННЫХ
-- Выполните этот скрипт в Supabase SQL Editor для полного понимания структуры

-- ========================================
-- 1. АНАЛИЗ СТРУКТУРЫ ТАБЛИЦ
-- ========================================

-- Показать все таблицы и их типы
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ========================================
-- 2. ДЕТАЛЬНАЯ СТРУКТУРА КЛЮЧЕВЫХ ТАБЛИЦ
-- ========================================

-- Структура таблицы assistants
SELECT 
    'assistants' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'assistants'
ORDER BY ordinal_position;

-- Структура таблицы ai_agent_settings
SELECT 
    'ai_agent_settings' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'ai_agent_settings'
ORDER BY ordinal_position;

-- Структура таблицы assistant_settings
SELECT 
    'assistant_settings' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'assistant_settings'
ORDER BY ordinal_position;

-- Структура таблицы model_settings
SELECT 
    'model_settings' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'model_settings'
ORDER BY ordinal_position;

-- ========================================
-- 3. АНАЛИЗ СВЯЗЕЙ МЕЖДУ ТАБЛИЦАМИ
-- ========================================

-- Внешние ключи для assistants
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
AND tc.table_name = 'assistants'
AND tc.table_schema = 'public';

-- Внешние ключи для ai_agent_settings
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
AND tc.table_name = 'ai_agent_settings'
AND tc.table_schema = 'public';

-- ========================================
-- 4. АНАЛИЗ ДАННЫХ В ТАБЛИЦАХ
-- ========================================

-- Количество записей в каждой таблице
SELECT 
    'assistants' as table_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT owner_id) as unique_owners,
    COUNT(DISTINCT id) as unique_assistants
FROM public.assistants
UNION ALL
SELECT 
    'ai_agent_settings' as table_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT assistant_id) as unique_assistants
FROM public.ai_agent_settings
UNION ALL
SELECT 
    'assistant_settings' as table_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT assistant_id) as unique_assistants,
    0 as unique_users
FROM public.assistant_settings
UNION ALL
SELECT 
    'model_settings' as table_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT user_id) as unique_users,
    0 as unique_assistants
FROM public.model_settings;

-- ========================================
-- 5. ПРОВЕРКА СУЩЕСТВОВАНИЯ ПОЛЕЙ ВИДЖЕТА
-- ========================================

-- Проверить, есть ли уже поля виджета в ai_agent_settings
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'ai_agent_settings'
AND column_name LIKE '%widget%'
ORDER BY column_name;

-- Проверить, есть ли уже поля виджета в assistant_settings
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'assistant_settings'
AND column_name LIKE '%widget%'
ORDER BY column_name;

-- ========================================
-- 6. АНАЛИЗ RLS ПОЛИТИК
-- ========================================

-- Показать все RLS политики
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ========================================
-- 7. ПРОВЕРКА ИНДЕКСОВ
-- ========================================

-- Показать все индексы
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ========================================
-- 8. ПРИМЕРЫ ДАННЫХ (первые 3 записи)
-- ========================================

-- Примеры данных из assistants
SELECT 
    'assistants' as table_name,
    id,
    owner_id,
    name,
    language,
    active,
    created_at
FROM public.assistants 
LIMIT 3;

-- Примеры данных из ai_agent_settings
SELECT 
    'ai_agent_settings' as table_name,
    id,
    user_id,
    assistant_id,
    task,
    main_goal,
    communication_style,
    created_at
FROM public.ai_agent_settings 
LIMIT 3;

-- Примеры данных из assistant_settings
SELECT 
    'assistant_settings' as table_name,
    assistant_id,
    role,
    tone,
    emoji_frequency,
    address_form
FROM public.assistant_settings 
LIMIT 3;

