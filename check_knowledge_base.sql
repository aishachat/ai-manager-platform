-- Проверяем структуру таблицы knowledge_base
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'knowledge_base'
AND (column_name LIKE '%user%' OR column_name LIKE '%owner%' OR column_name = 'id')
ORDER BY column_name;


