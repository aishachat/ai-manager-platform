-- ПРАВИЛЬНОЕ ИСПРАВЛЕНИЕ RLS ПОЛИТИК
-- Выполнить в Supabase SQL Editor

-- 1. ВОССТАНОВИТЬ RLS ДЛЯ ВСЕХ ТАБЛИЦ
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dialogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛИТЬ ВСЕ СТАРЫЕ ПОЛИТИКИ
-- Assistants
DROP POLICY IF EXISTS "assistants_all" ON public.assistants;
DROP POLICY IF EXISTS "Users can view their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can insert their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can update their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can delete their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "assistants_policy" ON public.assistants;
DROP POLICY IF EXISTS "assistants_project_access" ON public.assistants;

-- Dialogs
DROP POLICY IF EXISTS "dialogs_all" ON public.dialogs;
DROP POLICY IF EXISTS "Users can view their own dialogs" ON public.dialogs;
DROP POLICY IF EXISTS "Users can insert their own dialogs" ON public.dialogs;
DROP POLICY IF EXISTS "Users can update their own dialogs" ON public.dialogs;
DROP POLICY IF EXISTS "Users can delete their own dialogs" ON public.dialogs;
DROP POLICY IF EXISTS "dialogs_policy" ON public.dialogs;
DROP POLICY IF EXISTS "dialogs_project_access" ON public.dialogs;

-- Projects
DROP POLICY IF EXISTS "projects_all" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
DROP POLICY IF EXISTS "projects_owner_access" ON public.projects;

-- Knowledge Sources
DROP POLICY IF EXISTS "knowledge_sources_all" ON public.knowledge_sources;
DROP POLICY IF EXISTS "Users can view their own knowledge_sources" ON public.knowledge_sources;
DROP POLICY IF EXISTS "Users can insert their own knowledge_sources" ON public.knowledge_sources;
DROP POLICY IF EXISTS "Users can update their own knowledge_sources" ON public.knowledge_sources;
DROP POLICY IF EXISTS "Users can delete their own knowledge_sources" ON public.knowledge_sources;
DROP POLICY IF EXISTS "knowledge_sources_policy" ON public.knowledge_sources;
DROP POLICY IF EXISTS "knowledge_sources_project_access" ON public.knowledge_sources;

-- Knowledge Chunks
DROP POLICY IF EXISTS "knowledge_chunks_all" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "Users can view their own knowledge_chunks" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "Users can insert their own knowledge_chunks" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "Users can update their own knowledge_chunks" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "Users can delete their own knowledge_chunks" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "knowledge_chunks_policy" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "knowledge_chunks_project_access" ON public.knowledge_chunks;

-- Chat Messages
DROP POLICY IF EXISTS "chat_messages_all" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view their own chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert their own chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_policy" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_project_access" ON public.chat_messages;

-- Conversations
DROP POLICY IF EXISTS "conversations_all" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "conversations_policy" ON public.conversations;
DROP POLICY IF EXISTS "conversations_project_access" ON public.conversations;

-- 3. СОЗДАТЬ ПРАВИЛЬНЫЕ RLS ПОЛИТИКИ

-- Для таблицы projects (владелец проекта)
CREATE POLICY "projects_owner_access" ON public.projects
    FOR ALL USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Для таблицы assistants (доступ по project_id)
CREATE POLICY "assistants_project_access" ON public.assistants
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- Для таблицы dialogs (доступ по project_id)
CREATE POLICY "dialogs_project_access" ON public.dialogs
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- Для таблицы knowledge_sources (доступ по project_id)
CREATE POLICY "knowledge_sources_project_access" ON public.knowledge_sources
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- Для таблицы knowledge_chunks (доступ по project_id)
CREATE POLICY "knowledge_chunks_project_access" ON public.knowledge_chunks
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- Для таблицы chat_messages (доступ по project_id)
CREATE POLICY "chat_messages_project_access" ON public.chat_messages
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- Для таблицы conversations (доступ по project_id)
CREATE POLICY "conversations_project_access" ON public.conversations
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- 4. ПРЕДОСТАВИТЬ ПРАВА
GRANT ALL ON public.assistants TO authenticated;
GRANT ALL ON public.dialogs TO authenticated;
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.knowledge_sources TO authenticated;
GRANT ALL ON public.knowledge_chunks TO authenticated;
GRANT ALL ON public.chat_messages TO authenticated;
GRANT ALL ON public.conversations TO authenticated;

-- 5. ПРОВЕРИТЬ РЕЗУЛЬТАТ
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('assistants', 'dialogs', 'projects', 'knowledge_sources', 'knowledge_chunks', 'chat_messages', 'conversations')
ORDER BY tablename;
