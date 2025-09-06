-- Проверка существующих таблиц в Supabase
-- Выполните этот скрипт в Supabase SQL Editor для проверки

-- 1. Показать все таблицы в схеме public
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Проверить, есть ли таблица widget_settings
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'widget_settings'
        ) 
        THEN 'Таблица widget_settings СУЩЕСТВУЕТ' 
        ELSE 'Таблица widget_settings НЕ СУЩЕСТВУЕТ' 
    END as widget_settings_status;

-- 3. Показать структуру таблицы assistants (если существует)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'assistants'
ORDER BY ordinal_position;

-- 4. Показать структуру таблицы ai_agent_settings (если существует)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'ai_agent_settings'
ORDER BY ordinal_position;

-- 5. Показать количество записей в основных таблицах
SELECT 
    'assistants' as table_name,
    COUNT(*) as record_count
FROM public.assistants
UNION ALL
SELECT 
    'ai_agent_settings' as table_name,
    COUNT(*) as record_count
FROM public.ai_agent_settings
UNION ALL
SELECT 
    'model_settings' as table_name,
    COUNT(*) as record_count
FROM public.model_settings
UNION ALL
SELECT 
    'chat_history' as table_name,
    COUNT(*) as record_count
FROM public.chat_history;

