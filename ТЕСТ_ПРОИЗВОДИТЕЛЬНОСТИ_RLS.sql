-- =====================================================
-- ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ RLS ПОЛИТИК
-- =====================================================
-- Цель: проверить, что RLS политики не блокируют API
-- Принцип: тестируем основные сценарии использования

-- 1. ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ ПРОЕКТОВ
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id FROM public.projects WHERE owner_id = auth.uid();

-- 2. ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ AI_AGENT_SETTINGS
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.ai_agent_settings 
WHERE project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid());

-- 3. ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ DIALOGS
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.dialogs 
WHERE project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid());

-- 4. ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ CHAT_MESSAGES
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.chat_messages 
WHERE project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid());

-- 5. ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ AUTOSWITCH_SETTINGS
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.autoswitch_settings WHERE user_id = auth.uid();

-- 6. ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ CONVERSATIONS
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.conversations WHERE owner_id = auth.uid();

-- 7. ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ USER_NICHES
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.user_niches 
WHERE user_id = auth.uid() 
AND project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid());

-- 8. ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ NICHE_SYNONYMS
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.niche_synonyms;

-- 9. ПРОВЕРЯЕМ СТАТИСТИКУ ИСПОЛЬЗОВАНИЯ ИНДЕКСОВ
SELECT 
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
AND indexrelname LIKE 'idx_%'
ORDER BY idx_scan DESC;

-- 10. ПРОВЕРЯЕМ СТАТИСТИКУ ТАБЛИЦ
SELECT 
    schemaname,
    relname as tablename,
    seq_scan as sequential_scans,
    seq_tup_read as sequential_tuples_read,
    idx_scan as index_scans,
    idx_tup_fetch as index_tuples_fetched
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY seq_scan DESC;

-- =====================================================
-- РЕЗУЛЬТАТ: тест производительности RLS политик
-- АНАЛИЗ: проверить планы выполнения и статистику
-- =====================================================
