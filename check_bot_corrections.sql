-- Проверяем структуру таблицы bot_corrections
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'bot_corrections'
AND (column_name LIKE '%user%' OR column_name LIKE '%owner%' OR column_name = 'id')
ORDER BY column_name;


