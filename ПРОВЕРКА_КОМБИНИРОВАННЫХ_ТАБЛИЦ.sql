-- =====================================================
-- ПРОВЕРКА ТАБЛИЦ С КОМБИНИРОВАННЫМИ ПОЛЯМИ (USER_ID + PROJECT_ID)
-- =====================================================

-- 1. НАХОДИМ ТАБЛИЦЫ С ОБЕИМИ КОЛОНКАМИ
SELECT 
    'TABLES_WITH_BOTH_USER_AND_PROJECT_ID' as category,
    table_name,
    'user_id: ' || user_id_type || ', project_id: ' || project_id_type as columns_info
FROM (
    SELECT 
        u.table_name,
        u.data_type as user_id_type,
        p.data_type as project_id_type
    FROM (
        SELECT table_name, data_type
        FROM information_schema.columns 
        WHERE column_name = 'user_id' AND table_schema = 'public'
    ) u
    INNER JOIN (
        SELECT table_name, data_type
        FROM information_schema.columns 
        WHERE column_name = 'project_id' AND table_schema = 'public'
    ) p ON u.table_name = p.table_name
) combined
ORDER BY table_name;

-- 2. НАХОДИМ ТАБЛИЦЫ ТОЛЬКО С USER_ID
SELECT 
    'TABLES_WITH_ONLY_USER_ID' as category,
    table_name,
    data_type as user_id_type
FROM information_schema.columns 
WHERE column_name = 'user_id' 
AND table_schema = 'public'
AND table_name NOT IN (
    SELECT table_name
    FROM information_schema.columns 
    WHERE column_name = 'project_id' AND table_schema = 'public'
)
ORDER BY table_name;

-- 3. НАХОДИМ ТАБЛИЦЫ ТОЛЬКО С PROJECT_ID
SELECT 
    'TABLES_WITH_ONLY_PROJECT_ID' as category,
    table_name,
    data_type as project_id_type
FROM information_schema.columns 
WHERE column_name = 'project_id' 
AND table_schema = 'public'
AND table_name NOT IN (
    SELECT table_name
    FROM information_schema.columns 
    WHERE column_name = 'user_id' AND table_schema = 'public'
)
ORDER BY table_name;

-- 4. НАХОДИМ ТАБЛИЦЫ ТОЛЬКО С OWNER_ID
SELECT 
    'TABLES_WITH_ONLY_OWNER_ID' as category,
    table_name,
    data_type as owner_id_type
FROM information_schema.columns 
WHERE column_name = 'owner_id' 
AND table_schema = 'public'
ORDER BY table_name;

-- 5. ПРОВЕРЯЕМ СТРУКТУРУ КОМБИНИРОВАННЫХ ТАБЛИЦ
SELECT 'ai_agent_settings' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'ai_agent_settings' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'dialogs' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'dialogs' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'chat_messages' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'chat_messages' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'widget_development_settings' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'widget_development_settings' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'telegram_settings' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'telegram_settings' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'bot_corrections' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'bot_corrections' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'knowledge_sources' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'knowledge_sources' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'knowledge_chunks' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'knowledge_chunks' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'niches' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'niches' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'niche_synonyms' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'niche_synonyms' AND table_schema = 'public'
ORDER BY ordinal_position;
