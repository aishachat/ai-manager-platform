-- Проверяем названия колонок в каждой таблице
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN (
    'agent_additional_settings',
    'agent_clarification_rules',
    'agent_data_collection',
    'agent_restrictions',
    'ai_agent_settings',
    'assistant_settings',
    'assistants',
    'bot_corrections',
    'chat_history',
    'conversations',
    'integrations',
    'knowledge_base',
    'knowledge_items',
    'messages',
    'model_settings',
    'profiles',
    'users'
)
AND (column_name LIKE '%user%' OR column_name LIKE '%owner%' OR column_name = 'id')
ORDER BY table_name, column_name;


