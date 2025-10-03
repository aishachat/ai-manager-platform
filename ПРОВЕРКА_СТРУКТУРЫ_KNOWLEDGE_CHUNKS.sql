-- ========================================
-- ПРОВЕРКА СТРУКТУРЫ KNOWLEDGE_CHUNKS
-- ========================================

-- Проверяем структуру таблицы knowledge_chunks
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'knowledge_chunks'
ORDER BY ordinal_position;

-- Проверяем существующие индексы
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename = 'knowledge_chunks'
ORDER BY indexname;
