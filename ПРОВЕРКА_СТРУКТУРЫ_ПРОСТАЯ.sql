-- =====================================================
-- ПРОСТАЯ ПРОВЕРКА СТРУКТУРЫ КРИТИЧНЫХ ТАБЛИЦ
-- =====================================================

-- 1. ПРОВЕРЯЕМ СТРУКТУРУ AI_AGENT_SETTINGS
SELECT 'ai_agent_settings' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'ai_agent_settings' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. ПРОВЕРЯЕМ СТРУКТУРУ AUTOSWITCH_SETTINGS
SELECT 'autoswitch_settings' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'autoswitch_settings' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. ПРОВЕРЯЕМ СТРУКТУРУ DIALOGS
SELECT 'dialogs' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'dialogs' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. ПРОВЕРЯЕМ СТРУКТУРУ CONVERSATIONS
SELECT 'conversations' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'conversations' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. ПРОВЕРЯЕМ СТРУКТУРУ CHAT_MESSAGES
SELECT 'chat_messages' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'chat_messages' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. ПРОВЕРЯЕМ КАКИЕ ТАБЛИЦЫ ИМЕЮТ PROJECT_ID
SELECT table_name, column_name, data_type
FROM information_schema.columns 
WHERE column_name = 'project_id' AND table_schema = 'public'
ORDER BY table_name;

-- 7. ПРОВЕРЯЕМ КАКИЕ ТАБЛИЦЫ ИМЕЮТ USER_ID
SELECT table_name, column_name, data_type
FROM information_schema.columns 
WHERE column_name = 'user_id' AND table_schema = 'public'
ORDER BY table_name;

-- 8. ПРОВЕРЯЕМ КАКИЕ ТАБЛИЦЫ ИМЕЮТ OWNER_ID
SELECT table_name, column_name, data_type
FROM information_schema.columns 
WHERE column_name = 'owner_id' AND table_schema = 'public'
ORDER BY table_name;
