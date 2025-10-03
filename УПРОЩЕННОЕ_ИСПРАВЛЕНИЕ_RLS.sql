-- УПРОЩЕННОЕ ИСПРАВЛЕНИЕ RLS ПОЛИТИК
-- Выполнить в Supabase SQL Editor

-- 1. ВОССТАНОВИТЬ RLS ДЛЯ ВСЕХ ТАБЛИЦ
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dialogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛИТЬ ВСЕ ПОЛИТИКИ (универсальный способ)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Удаляем все политики для всех таблиц
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('assistants', 'dialogs', 'projects', 'knowledge_sources', 'knowledge_chunks', 'chat_messages', 'conversations')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

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
