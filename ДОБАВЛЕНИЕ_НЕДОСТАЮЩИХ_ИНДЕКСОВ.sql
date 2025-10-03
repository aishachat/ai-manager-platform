-- ========================================
-- ДОБАВЛЕНИЕ НЕДОСТАЮЩИХ ИНДЕКСОВ ДЛЯ ОПТИМИЗАЦИИ
-- ========================================

-- Анализ показал, что 23 таблицы не имеют индексов по project_id
-- Добавляем индексы для улучшения производительности RLS политик

-- 1. ИНДЕКСЫ ДЛЯ ТАБЛИЦ С PROJECT_ID
-- Эти индексы критически важны для быстрой работы RLS политик

-- AI Agent Settings
CREATE INDEX IF NOT EXISTS idx_ai_agent_settings_project_id_optimized 
ON public.ai_agent_settings (project_id) 
WHERE project_id IS NOT NULL;

-- Dialogs
CREATE INDEX IF NOT EXISTS idx_dialogs_project_id_optimized 
ON public.dialogs (project_id) 
WHERE project_id IS NOT NULL;

-- Chat Messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id_optimized 
ON public.chat_messages (project_id) 
WHERE project_id IS NOT NULL;

-- Knowledge Sources
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_project_id_optimized 
ON public.knowledge_sources (project_id) 
WHERE project_id IS NOT NULL;

-- Knowledge Chunks
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_project_id_optimized 
ON public.knowledge_chunks (project_id) 
WHERE project_id IS NOT NULL;

-- Widget Development Settings
CREATE INDEX IF NOT EXISTS idx_widget_development_settings_project_id_optimized 
ON public.widget_development_settings (project_id) 
WHERE project_id IS NOT NULL;

-- Telegram Settings
CREATE INDEX IF NOT EXISTS idx_telegram_settings_project_id_optimized 
ON public.telegram_settings (project_id) 
WHERE project_id IS NOT NULL;

-- CRM Tables
CREATE INDEX IF NOT EXISTS idx_crm_clients_project_id_optimized 
ON public.crm_clients (project_id) 
WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_deals_project_id_optimized 
ON public.crm_deals (project_id) 
WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_operators_project_id_optimized 
ON public.crm_operators (project_id) 
WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_tasks_project_id_optimized 
ON public.crm_tasks (project_id) 
WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_deal_notes_project_id_optimized 
ON public.crm_deal_notes (project_id) 
WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dialog_crm_connections_project_id_optimized 
ON public.dialog_crm_connections (project_id) 
WHERE project_id IS NOT NULL;

-- FAQ Cache
CREATE INDEX IF NOT EXISTS idx_faq_cache_project_id_optimized 
ON public.faq_cache (project_id) 
WHERE project_id IS NOT NULL;

-- Help Requests
CREATE INDEX IF NOT EXISTS idx_help_requests_project_id_optimized 
ON public.help_requests (project_id) 
WHERE project_id IS NOT NULL;

-- User Niches
CREATE INDEX IF NOT EXISTS idx_user_niches_project_id_optimized 
ON public.user_niches (project_id) 
WHERE project_id IS NOT NULL;

-- Chunk Synonyms
CREATE INDEX IF NOT EXISTS idx_chunk_synonyms_project_id_optimized 
ON public.chunk_synonyms (project_id) 
WHERE project_id IS NOT NULL;

-- 2. КОМПОЗИТНЫЕ ИНДЕКСЫ ДЛЯ ЧАСТО ИСПОЛЬЗУЕМЫХ ЗАПРОСОВ

-- Для RLS политик с проверкой project_id
CREATE INDEX IF NOT EXISTS idx_projects_owner_id_project_id 
ON public.projects (owner_id, id) 
WHERE owner_id IS NOT NULL;

-- Для быстрого поиска по user_id и project_id
CREATE INDEX IF NOT EXISTS idx_user_niches_user_project 
ON public.user_niches (user_id, project_id) 
WHERE user_id IS NOT NULL AND project_id IS NOT NULL;

-- 3. ИНДЕКСЫ ДЛЯ ЧАСТО ИСПОЛЬЗУЕМЫХ ПОЛЕЙ

-- Chat Messages - для быстрого поиска по времени
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
ON public.chat_messages (created_at DESC) 
WHERE created_at IS NOT NULL;

-- Knowledge Chunks - для поиска по тексту (проверяем наличие колонки)
-- CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_text_gin 
-- ON public.knowledge_chunks USING gin (to_tsvector('russian', content)) 
-- WHERE content IS NOT NULL;

-- 4. СТАТИСТИКА ПОСЛЕ СОЗДАНИЯ ИНДЕКСОВ
SELECT 
    'ИНДЕКСЫ СОЗДАНЫ' as status,
    'Проверьте производительность' as recommendation;

-- 5. ПРОВЕРКА СОЗДАННЫХ ИНДЕКСОВ
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE '%_optimized'
ORDER BY tablename, indexname;
