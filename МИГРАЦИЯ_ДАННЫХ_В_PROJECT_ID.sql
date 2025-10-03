-- МИГРАЦИЯ ДАННЫХ В PROJECT_ID АРХИТЕКТУРУ
-- Выполнить в Supabase SQL Editor

-- 1. СОЗДАТЬ ПРОЕКТЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ БЕЗ ПРОЕКТОВ
-- Только для пользователей, которые есть в public.users
INSERT INTO public.projects (owner_id, name, created_at, updated_at)
SELECT DISTINCT 
    pu.id as owner_id,
    'Default Project for ' || pu.email as name,
    NOW() as created_at,
    NOW() as updated_at
FROM public.users pu
LEFT JOIN public.projects p ON p.owner_id = pu.id
WHERE p.id IS NULL;

-- 2. ОБНОВИТЬ ASSISTANTS С NULL PROJECT_ID
UPDATE public.assistants 
SET project_id = p.id
FROM public.projects p
WHERE public.assistants.project_id IS NULL 
AND public.assistants.user_id = p.owner_id
AND public.assistants.user_id IN (SELECT id FROM public.users);

-- 3. ОБНОВИТЬ DIALOGS С NULL PROJECT_ID
UPDATE public.dialogs 
SET project_id = p.id
FROM public.projects p
WHERE public.dialogs.project_id IS NULL 
AND public.dialogs.user_id = p.owner_id
AND public.dialogs.user_id IN (SELECT id FROM public.users);

-- 4. ОБНОВИТЬ KNOWLEDGE_SOURCES С NULL PROJECT_ID
UPDATE public.knowledge_sources 
SET project_id = p.id
FROM public.projects p
WHERE public.knowledge_sources.project_id IS NULL 
AND public.knowledge_sources.user_id = p.owner_id
AND public.knowledge_sources.user_id IN (SELECT id FROM public.users);

-- 5. ОБНОВИТЬ KNOWLEDGE_CHUNKS С NULL PROJECT_ID
UPDATE public.knowledge_chunks 
SET project_id = p.id
FROM public.projects p
WHERE public.knowledge_chunks.project_id IS NULL 
AND public.knowledge_chunks.user_id = p.owner_id
AND public.knowledge_chunks.user_id IN (SELECT id FROM public.users);

-- 6. ОБНОВИТЬ CHAT_MESSAGES С NULL PROJECT_ID
UPDATE public.chat_messages 
SET project_id = p.id
FROM public.projects p
WHERE public.chat_messages.project_id IS NULL 
AND public.chat_messages.user_id = p.owner_id
AND public.chat_messages.user_id IN (SELECT id FROM public.users);

-- 7. ОБНОВИТЬ CONVERSATIONS С NULL PROJECT_ID
UPDATE public.conversations 
SET project_id = p.id
FROM public.projects p
WHERE public.conversations.project_id IS NULL 
AND public.conversations.user_id = p.owner_id
AND public.conversations.user_id IN (SELECT id FROM public.users);

-- 8. ПРОВЕРИТЬ РЕЗУЛЬТАТ МИГРАЦИИ
SELECT 
    'assistants' as table_name,
    COUNT(*) as total_records,
    COUNT(project_id) as with_project_id,
    COUNT(*) - COUNT(project_id) as null_project_id
FROM public.assistants
UNION ALL
SELECT 
    'dialogs' as table_name,
    COUNT(*) as total_records,
    COUNT(project_id) as with_project_id,
    COUNT(*) - COUNT(project_id) as null_project_id
FROM public.dialogs
UNION ALL
SELECT 
    'knowledge_sources' as table_name,
    COUNT(*) as total_records,
    COUNT(project_id) as with_project_id,
    COUNT(*) - COUNT(project_id) as null_project_id
FROM public.knowledge_sources
UNION ALL
SELECT 
    'knowledge_chunks' as table_name,
    COUNT(*) as total_records,
    COUNT(project_id) as with_project_id,
    COUNT(*) - COUNT(project_id) as null_project_id
FROM public.knowledge_chunks
UNION ALL
SELECT 
    'chat_messages' as table_name,
    COUNT(*) as total_records,
    COUNT(project_id) as with_project_id,
    COUNT(*) - COUNT(project_id) as null_project_id
FROM public.chat_messages
UNION ALL
SELECT 
    'conversations' as table_name,
    COUNT(*) as total_records,
    COUNT(project_id) as with_project_id,
    COUNT(*) - COUNT(project_id) as null_project_id
FROM public.conversations;
