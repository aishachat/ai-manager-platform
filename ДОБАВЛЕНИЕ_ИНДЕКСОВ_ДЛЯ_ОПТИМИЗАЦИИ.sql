-- =====================================================
-- ДОБАВЛЕНИЕ ИНДЕКСОВ ДЛЯ ОПТИМИЗАЦИИ RLS ПОЛИТИК
-- =====================================================
-- Цель: ускорить выполнение RLS политик
-- Принцип: индексы на поля, используемые в политиках

-- 1. ИНДЕКСЫ ДЛЯ ПРОЕКТОВ
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);

-- 2. ИНДЕКСЫ ДЛЯ ТАБЛИЦ С PROJECT_ID
CREATE INDEX IF NOT EXISTS idx_ai_agent_settings_project_id ON public.ai_agent_settings(project_id);
CREATE INDEX IF NOT EXISTS idx_dialogs_project_id ON public.dialogs(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON public.chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_user_niches_project_id ON public.user_niches(project_id);

-- 3. ИНДЕКСЫ ДЛЯ ТАБЛИЦ С USER_ID
CREATE INDEX IF NOT EXISTS idx_autoswitch_settings_user_id ON public.autoswitch_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_niches_user_id ON public.user_niches(user_id);

-- 4. ИНДЕКСЫ ДЛЯ ТАБЛИЦ С OWNER_ID
CREATE INDEX IF NOT EXISTS idx_conversations_owner_id ON public.conversations(owner_id);

-- 5. ПРОВЕРЯЕМ СОЗДАННЫЕ ИНДЕКСЫ
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 6. ПРОВЕРЯЕМ РАЗМЕР ИНДЕКСОВ
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY pg_relation_size(indexname::regclass) DESC;

-- =====================================================
-- РЕЗУЛЬТАТ: индексы созданы для оптимизации RLS политик
-- СЛЕДУЮЩИЙ ШАГ: протестировать производительность
-- =====================================================
