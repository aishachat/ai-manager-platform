-- =====================================================
-- ПРОВЕРКА СТРУКТУРЫ ВСЕХ ОСТАВШИХСЯ ТАБЛИЦ
-- =====================================================

-- 1. ПРОВЕРЯЕМ КАКИЕ ТАБЛИЦЫ ИМЕЮТ PROJECT_ID
SELECT 'TABLES_WITH_PROJECT_ID' as category, table_name, column_name, data_type
FROM information_schema.columns 
WHERE column_name = 'project_id' AND table_schema = 'public'
ORDER BY table_name;

-- 2. ПРОВЕРЯЕМ КАКИЕ ТАБЛИЦЫ ИМЕЮТ USER_ID
SELECT 'TABLES_WITH_USER_ID' as category, table_name, column_name, data_type
FROM information_schema.columns 
WHERE column_name = 'user_id' AND table_schema = 'public'
ORDER BY table_name;

-- 3. ПРОВЕРЯЕМ КАКИЕ ТАБЛИЦЫ ИМЕЮТ OWNER_ID
SELECT 'TABLES_WITH_OWNER_ID' as category, table_name, column_name, data_type
FROM information_schema.columns 
WHERE column_name = 'owner_id' AND table_schema = 'public'
ORDER BY table_name;

-- 4. ПРОВЕРЯЕМ СТРУКТУРУ КРИТИЧНЫХ ТАБЛИЦ
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

-- 5. ПРОВЕРЯЕМ СТРУКТУРУ ТАБЛИЦ ИНТЕГРАЦИЙ
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

-- 6. ПРОВЕРЯЕМ СТРУКТУРУ ТАБЛИЦ БАЗЫ ЗНАНИЙ
SELECT 'knowledge_sources' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'knowledge_sources' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'knowledge_chunks' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'knowledge_chunks' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. ПРОВЕРЯЕМ СТРУКТУРУ ТАБЛИЦ НИШ
SELECT 'niches' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'niches' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'niche_synonyms' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'niche_synonyms' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'user_niches' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_niches' AND table_schema = 'public'
ORDER BY ordinal_position;
