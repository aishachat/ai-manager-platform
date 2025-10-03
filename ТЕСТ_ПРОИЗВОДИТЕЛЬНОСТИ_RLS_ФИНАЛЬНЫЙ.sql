-- ========================================
-- ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ RLS (ФИНАЛЬНЫЙ)
-- ========================================

-- 1. ПРОВЕРКА ИНДЕКСОВ
SELECT 
    'ПРОВЕРКА ИНДЕКСОВ' as test_section,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE '%project_id%' OR indexname LIKE '%user_id%' OR indexname LIKE '%owner_id%'
ORDER BY tablename, indexname;

-- 2. СТАТИСТИКА ИСПОЛЬЗОВАНИЯ ИНДЕКСОВ
SELECT 
    'СТАТИСТИКА ИНДЕКСОВ' as test_section,
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
AND (indexrelname LIKE '%project_id%' OR indexrelname LIKE '%user_id%' OR indexrelname LIKE '%owner_id%')
ORDER BY idx_scan DESC;

-- 3. ПЛАНЫ ВЫПОЛНЕНИЯ ЗАПРОСОВ
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.projects WHERE owner_id = auth.uid();

EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.assistants WHERE owner_id = auth.uid();

EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.ai_agent_settings WHERE project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid());

-- 4. ПРОВЕРКА БЛОКИРОВОК
SELECT 
    'ПРОВЕРКА БЛОКИРОВОК' as test_section,
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- 5. МОНИТОРИНГ ПРОИЗВОДИТЕЛЬНОСТИ
SELECT 
    'МОНИТОРИНГ ПРОИЗВОДИТЕЛЬНОСТИ' as test_section,
    'Среднее время выполнения запросов' as metric,
    ROUND(AVG(mean_exec_time)::numeric, 2)::text as value
FROM pg_stat_statements
UNION ALL
SELECT 
    'МОНИТОРИНГ ПРОИЗВОДИТЕЛЬНОСТИ' as test_section,
    'Общее количество выполненных запросов' as metric,
    SUM(calls)::text as value
FROM pg_stat_statements
UNION ALL
SELECT 
    'МОНИТОРИНГ ПРОИЗВОДИТЕЛЬНОСТИ' as test_section,
    'Самый медленный запрос (мс)' as metric,
    ROUND(MAX(mean_exec_time)::numeric, 2)::text as value
FROM pg_stat_statements;

-- 6. РЕКОМЕНДАЦИИ ПО ОПТИМИЗАЦИИ
SELECT 
    'РЕКОМЕНДАЦИИ ПО ОПТИМИЗАЦИИ' as test_section,
    'Таблицы без индексов по project_id' as metric,
    COUNT(*)::text as value
FROM pg_tables t
LEFT JOIN pg_indexes i ON t.tablename = i.tablename 
    AND i.indexdef LIKE '%project_id%'
WHERE t.schemaname = 'public'
AND i.indexname IS NULL
AND EXISTS (
    SELECT 1 FROM information_schema.columns c 
    WHERE c.table_name = t.tablename 
    AND c.column_name = 'project_id'
);
