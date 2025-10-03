-- 🔍 Проверка структуры таблиц для правильной настройки RLS
-- Этот скрипт покажет, какие поля есть в каждой таблице

-- ============================================
-- 1. ПРОВЕРЯЕМ СТРУКТУРУ КРИТИЧЕСКИХ ТАБЛИЦ
-- ============================================

SELECT 
    '📊 СТРУКТУРА ТАБЛИЦ' as section,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'projects', 'dialogs', 'chat_messages', 
    'knowledge_sources', 'knowledge_chunks', 'assistants', 
    'conversations', 'telegram_settings', 'widget_development_settings',
    'user_niches', 'project_members', 'autoswitch_settings'
)
ORDER BY table_name, ordinal_position;

-- ============================================
-- 2. ПРОВЕРЯЕМ СВЯЗИ МЕЖДУ ТАБЛИЦАМИ
-- ============================================

SELECT 
    '🔗 СВЯЗИ МЕЖДУ ТАБЛИЦАМИ' as section,
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
AND tc.table_schema = 'public'
AND tc.table_name IN (
    'users', 'projects', 'dialogs', 'chat_messages', 
    'knowledge_sources', 'knowledge_chunks', 'assistants', 
    'conversations', 'telegram_settings', 'widget_development_settings',
    'user_niches', 'project_members', 'autoswitch_settings'
)
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 3. ПРОВЕРЯЕМ, ЕСТЬ ЛИ project_id В ТАБЛИЦАХ
-- ============================================

SELECT 
    '🎯 ПРОВЕРКА project_id' as section,
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = t.table_name 
            AND column_name = 'project_id'
        ) THEN '✅ Есть project_id'
        ELSE '❌ Нет project_id'
    END as has_project_id,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = t.table_name 
            AND column_name = 'user_id'
        ) THEN '✅ Есть user_id'
        ELSE '❌ Нет user_id'
    END as has_user_id,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = t.table_name 
            AND column_name = 'id'
        ) THEN '✅ Есть id'
        ELSE '❌ Нет id'
    END as has_id
FROM (
    SELECT DISTINCT table_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'users', 'projects', 'dialogs', 'chat_messages', 
        'knowledge_sources', 'knowledge_chunks', 'assistants', 
        'conversations', 'telegram_settings', 'widget_development_settings',
        'user_niches', 'project_members', 'autoswitch_settings'
    )
) t
ORDER BY table_name;

-- ============================================
-- 4. ПРОВЕРЯЕМ ТЕКУЩИЕ RLS ПОЛИТИКИ
-- ============================================

SELECT 
    '🔒 ТЕКУЩИЕ RLS ПОЛИТИКИ' as section,
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'users', 'projects', 'dialogs', 'chat_messages', 
    'knowledge_sources', 'knowledge_chunks', 'assistants', 
    'conversations', 'telegram_settings', 'widget_development_settings',
    'user_niches', 'project_members', 'autoswitch_settings'
)
ORDER BY tablename, cmd, policyname;
