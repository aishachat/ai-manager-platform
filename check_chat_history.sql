-- Проверяем структуру таблицы chat_history
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'chat_history'
AND (column_name LIKE '%user%' OR column_name LIKE '%owner%' OR column_name = 'id')
ORDER BY column_name;


