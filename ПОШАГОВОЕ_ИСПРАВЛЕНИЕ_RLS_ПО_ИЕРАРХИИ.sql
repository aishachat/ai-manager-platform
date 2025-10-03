-- 🔧 ПОШАГОВОЕ ИСПРАВЛЕНИЕ RLS ПОЛИТИК ПО ИЕРАРХИИ ТАБЛИЦ
-- Выполнять пошагово, проверяя каждый шаг

-- ============================================
-- ШАГ 1: ОСНОВНЫЕ ТАБЛИЦЫ (ПОЛЬЗОВАТЕЛИ И ПРОЕКТЫ)
-- ============================================

-- 1.1. Таблица users (базовая таблица пользователей)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "users_all" ON public.users;
DROP POLICY IF EXISTS "Users can view their own users" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own users" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own users" ON public.users;

-- Создаем правильную политику для users (доступ только к своей записи)
CREATE POLICY "users_own_access" ON public.users
    FOR ALL USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 1.2. Таблица projects (проекты пользователей)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "projects_all" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
DROP POLICY IF EXISTS "projects_owner_access" ON public.projects;

-- Создаем правильную политику для projects (доступ только к своим проектам)
CREATE POLICY "projects_owner_access" ON public.projects
    FOR ALL USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- 1.3. Таблица project_members (участники проектов)
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "project_members_all" ON public.project_members;
DROP POLICY IF EXISTS "Users can view their own project_members" ON public.project_members;
DROP POLICY IF EXISTS "Users can insert their own project_members" ON public.project_members;
DROP POLICY IF EXISTS "Users can update their own project_members" ON public.project_members;
DROP POLICY IF EXISTS "Users can delete their own project_members" ON public.project_members;

-- Создаем правильную политику для project_members (доступ через project_id)
CREATE POLICY "project_members_project_access" ON public.project_members
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- Предоставляем права
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.project_members TO authenticated;

-- Проверяем результат для основных таблиц
SELECT 
    'ШАГ 1: ОСНОВНЫЕ ТАБЛИЦЫ' as step,
    tablename,
    rowsecurity,
    COUNT(*) as policy_count
FROM pg_tables 
LEFT JOIN pg_policies ON pg_tables.tablename = pg_policies.tablename
WHERE pg_tables.schemaname = 'public' 
AND pg_tables.tablename IN ('users', 'projects', 'project_members')
GROUP BY pg_tables.tablename, pg_tables.rowsecurity
ORDER BY pg_tables.tablename;

-- ============================================
-- ШАГ 2: AI АГЕНТЫ И НАСТРОЙКИ
-- ============================================

-- 2.1. Таблица assistants (AI агенты)
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "assistants_all" ON public.assistants;
DROP POLICY IF EXISTS "Users can view their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can insert their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can update their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can delete their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "assistants_policy" ON public.assistants;
DROP POLICY IF EXISTS "assistants_project_access" ON public.assistants;

-- Создаем правильную политику для assistants (доступ по project_id)
CREATE POLICY "assistants_project_access" ON public.assistants
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- 2.2. Таблица autoswitch_settings (настройки автопереключения)
ALTER TABLE public.autoswitch_settings ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "autoswitch_settings_all" ON public.autoswitch_settings;
DROP POLICY IF EXISTS "Users can view their own autoswitch_settings" ON public.autoswitch_settings;
DROP POLICY IF EXISTS "Users can insert their own autoswitch_settings" ON public.autoswitch_settings;
DROP POLICY IF EXISTS "Users can update their own autoswitch_settings" ON public.autoswitch_settings;
DROP POLICY IF EXISTS "Users can delete their own autoswitch_settings" ON public.autoswitch_settings;

-- Создаем правильную политику для autoswitch_settings (доступ по project_id)
CREATE POLICY "autoswitch_settings_project_access" ON public.autoswitch_settings
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- Предоставляем права
GRANT ALL ON public.assistants TO authenticated;
GRANT ALL ON public.autoswitch_settings TO authenticated;

-- Проверяем результат для AI таблиц
SELECT 
    'ШАГ 2: AI АГЕНТЫ' as step,
    tablename,
    rowsecurity,
    COUNT(*) as policy_count
FROM pg_tables 
LEFT JOIN pg_policies ON pg_tables.tablename = pg_policies.tablename
WHERE pg_tables.schemaname = 'public' 
AND pg_tables.tablename IN ('assistants', 'autoswitch_settings')
GROUP BY pg_tables.tablename, pg_tables.rowsecurity
ORDER BY pg_tables.tablename;

-- ============================================
-- ШАГ 3: ЧАТ И ДИАЛОГИ
-- ============================================

-- 3.1. Таблица dialogs (диалоги)
ALTER TABLE public.dialogs ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "dialogs_all" ON public.dialogs;
DROP POLICY IF EXISTS "Users can view their own dialogs" ON public.dialogs;
DROP POLICY IF EXISTS "Users can insert their own dialogs" ON public.dialogs;
DROP POLICY IF EXISTS "Users can update their own dialogs" ON public.dialogs;
DROP POLICY IF EXISTS "Users can delete their own dialogs" ON public.dialogs;
DROP POLICY IF EXISTS "dialogs_policy" ON public.dialogs;
DROP POLICY IF EXISTS "dialogs_project_access" ON public.dialogs;

-- Создаем правильную политику для dialogs (доступ по project_id)
CREATE POLICY "dialogs_project_access" ON public.dialogs
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- 3.2. Таблица conversations (разговоры)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "conversations_all" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "conversations_policy" ON public.conversations;
DROP POLICY IF EXISTS "conversations_project_access" ON public.conversations;

-- Создаем правильную политику для conversations (доступ по project_id)
CREATE POLICY "conversations_project_access" ON public.conversations
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- 3.3. Таблица chat_messages (сообщения)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "chat_messages_all" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view their own chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert their own chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_policy" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_project_access" ON public.chat_messages;

-- Создаем правильную политику для chat_messages (доступ по project_id)
CREATE POLICY "chat_messages_project_access" ON public.chat_messages
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- Предоставляем права
GRANT ALL ON public.dialogs TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.chat_messages TO authenticated;

-- Проверяем результат для чат таблиц
SELECT 
    'ШАГ 3: ЧАТ И ДИАЛОГИ' as step,
    tablename,
    rowsecurity,
    COUNT(*) as policy_count
FROM pg_tables 
LEFT JOIN pg_policies ON pg_tables.tablename = pg_policies.tablename
WHERE pg_tables.schemaname = 'public' 
AND pg_tables.tablename IN ('dialogs', 'conversations', 'chat_messages')
GROUP BY pg_tables.tablename, pg_tables.rowsecurity
ORDER BY pg_tables.tablename;

-- ============================================
-- ШАГ 4: БАЗА ЗНАНИЙ
-- ============================================

-- 4.1. Таблица knowledge_sources (источники знаний)
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "knowledge_sources_all" ON public.knowledge_sources;
DROP POLICY IF EXISTS "Users can view their own knowledge_sources" ON public.knowledge_sources;
DROP POLICY IF EXISTS "Users can insert their own knowledge_sources" ON public.knowledge_sources;
DROP POLICY IF EXISTS "Users can update their own knowledge_sources" ON public.knowledge_sources;
DROP POLICY IF EXISTS "Users can delete their own knowledge_sources" ON public.knowledge_sources;
DROP POLICY IF EXISTS "knowledge_sources_policy" ON public.knowledge_sources;
DROP POLICY IF EXISTS "knowledge_sources_project_access" ON public.knowledge_sources;

-- Создаем правильную политику для knowledge_sources (доступ по project_id)
CREATE POLICY "knowledge_sources_project_access" ON public.knowledge_sources
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- 4.2. Таблица knowledge_chunks (чанки знаний)
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "knowledge_chunks_all" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "Users can view their own knowledge_chunks" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "Users can insert their own knowledge_chunks" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "Users can update their own knowledge_chunks" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "Users can delete their own knowledge_chunks" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "knowledge_chunks_policy" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "knowledge_chunks_project_access" ON public.knowledge_chunks;

-- Создаем правильную политику для knowledge_chunks (доступ по project_id)
CREATE POLICY "knowledge_chunks_project_access" ON public.knowledge_chunks
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- Предоставляем права
GRANT ALL ON public.knowledge_sources TO authenticated;
GRANT ALL ON public.knowledge_chunks TO authenticated;

-- Проверяем результат для базы знаний
SELECT 
    'ШАГ 4: БАЗА ЗНАНИЙ' as step,
    tablename,
    rowsecurity,
    COUNT(*) as policy_count
FROM pg_tables 
LEFT JOIN pg_policies ON pg_tables.tablename = pg_policies.tablename
WHERE pg_tables.schemaname = 'public' 
AND pg_tables.tablename IN ('knowledge_sources', 'knowledge_chunks')
GROUP BY pg_tables.tablename, pg_tables.rowsecurity
ORDER BY pg_tables.tablename;

-- ============================================
-- ШАГ 5: НИШИ И СПЕЦИАЛИЗАЦИЯ
-- ============================================

-- 5.1. Таблица niches (ниши) - справочная таблица
ALTER TABLE public.niches ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "niches_all" ON public.niches;
DROP POLICY IF EXISTS "Users can view their own niches" ON public.niches;
DROP POLICY IF EXISTS "Users can insert their own niches" ON public.niches;
DROP POLICY IF EXISTS "Users can update their own niches" ON public.niches;
DROP POLICY IF EXISTS "Users can delete their own niches" ON public.niches;

-- Создаем правильную политику для niches (публичный доступ для чтения)
CREATE POLICY "niches_public_read" ON public.niches
    FOR SELECT USING (true);

-- 5.2. Таблица niche_synonyms (синонимы ниш) - справочная таблица
ALTER TABLE public.niche_synonyms ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "niche_synonyms_all" ON public.niche_synonyms;
DROP POLICY IF EXISTS "Users can view their own niche_synonyms" ON public.niche_synonyms;
DROP POLICY IF EXISTS "Users can insert their own niche_synonyms" ON public.niche_synonyms;
DROP POLICY IF EXISTS "Users can update their own niche_synonyms" ON public.niche_synonyms;
DROP POLICY IF EXISTS "Users can delete their own niche_synonyms" ON public.niche_synonyms;

-- Создаем правильную политику для niche_synonyms (публичный доступ для чтения)
CREATE POLICY "niche_synonyms_public_read" ON public.niche_synonyms
    FOR SELECT USING (true);

-- 5.3. Таблица user_niches (связь пользователей с нишами)
ALTER TABLE public.user_niches ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "user_niches_all" ON public.user_niches;
DROP POLICY IF EXISTS "Users can view their own user_niches" ON public.user_niches;
DROP POLICY IF EXISTS "Users can insert their own user_niches" ON public.user_niches;
DROP POLICY IF EXISTS "Users can update their own user_niches" ON public.user_niches;
DROP POLICY IF EXISTS "Users can delete their own user_niches" ON public.user_niches;

-- Создаем правильную политику для user_niches (доступ по project_id)
CREATE POLICY "user_niches_project_access" ON public.user_niches
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- Предоставляем права
GRANT ALL ON public.niches TO authenticated;
GRANT ALL ON public.niche_synonyms TO authenticated;
GRANT ALL ON public.user_niches TO authenticated;

-- Проверяем результат для ниш
SELECT 
    'ШАГ 5: НИШИ' as step,
    tablename,
    rowsecurity,
    COUNT(*) as policy_count
FROM pg_tables 
LEFT JOIN pg_policies ON pg_tables.tablename = pg_policies.tablename
WHERE pg_tables.schemaname = 'public' 
AND pg_tables.tablename IN ('niches', 'niche_synonyms', 'user_niches')
GROUP BY pg_tables.tablename, pg_tables.rowsecurity
ORDER BY pg_tables.tablename;

-- ============================================
-- ШАГ 6: НАСТРОЙКИ ИНТЕГРАЦИЙ
-- ============================================

-- 6.1. Таблица widget_development_settings (настройки виджета)
ALTER TABLE public.widget_development_settings ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "widget_development_settings_all" ON public.widget_development_settings;
DROP POLICY IF EXISTS "Users can view their own widget_development_settings" ON public.widget_development_settings;
DROP POLICY IF EXISTS "Users can insert their own widget_development_settings" ON public.widget_development_settings;
DROP POLICY IF EXISTS "Users can update their own widget_development_settings" ON public.widget_development_settings;
DROP POLICY IF EXISTS "Users can delete their own widget_development_settings" ON public.widget_development_settings;

-- Создаем правильную политику для widget_development_settings (доступ по project_id)
CREATE POLICY "widget_development_settings_project_access" ON public.widget_development_settings
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- 6.2. Таблица telegram_settings (настройки Telegram)
ALTER TABLE public.telegram_settings ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "telegram_settings_all" ON public.telegram_settings;
DROP POLICY IF EXISTS "Users can view their own telegram_settings" ON public.telegram_settings;
DROP POLICY IF EXISTS "Users can insert their own telegram_settings" ON public.telegram_settings;
DROP POLICY IF EXISTS "Users can update their own telegram_settings" ON public.telegram_settings;
DROP POLICY IF EXISTS "Users can delete their own telegram_settings" ON public.telegram_settings;

-- Создаем правильную политику для telegram_settings (доступ по project_id)
CREATE POLICY "telegram_settings_project_access" ON public.telegram_settings
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- Предоставляем права
GRANT ALL ON public.widget_development_settings TO authenticated;
GRANT ALL ON public.telegram_settings TO authenticated;

-- Проверяем результат для интеграций
SELECT 
    'ШАГ 6: ИНТЕГРАЦИИ' as step,
    tablename,
    rowsecurity,
    COUNT(*) as policy_count
FROM pg_tables 
LEFT JOIN pg_policies ON pg_tables.tablename = pg_policies.tablename
WHERE pg_tables.schemaname = 'public' 
AND pg_tables.tablename IN ('widget_development_settings', 'telegram_settings')
GROUP BY pg_tables.tablename, pg_tables.rowsecurity
ORDER BY pg_tables.tablename;

-- ============================================
-- ИТОГОВАЯ ПРОВЕРКА ВСЕХ ТАБЛИЦ
-- ============================================

SELECT 
    '📊 ИТОГОВАЯ ПРОВЕРКА' as section,
    tablename,
    rowsecurity,
    COUNT(*) as policy_count,
    STRING_AGG(policyname, ', ') as policy_names
FROM pg_tables 
LEFT JOIN pg_policies ON pg_tables.tablename = pg_policies.tablename
WHERE pg_tables.schemaname = 'public' 
AND pg_tables.tablename IN (
    'users', 'projects', 'project_members',
    'assistants', 'autoswitch_settings',
    'dialogs', 'conversations', 'chat_messages',
    'knowledge_sources', 'knowledge_chunks',
    'niches', 'niche_synonyms', 'user_niches',
    'widget_development_settings', 'telegram_settings'
)
GROUP BY pg_tables.tablename, pg_tables.rowsecurity
ORDER BY pg_tables.tablename;

-- ============================================
-- ПРОВЕРКА КАЧЕСТВА ПОЛИТИК
-- ============================================

SELECT 
    '🔍 КАЧЕСТВО ПОЛИТИК' as section,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' AND tablename NOT IN ('niches', 'niche_synonyms') THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        WHEN qual = 'true' AND tablename IN ('niches', 'niche_synonyms') THEN '✅ СПРАВОЧНАЯ: Публичный доступ'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'users', 'projects', 'project_members',
    'assistants', 'autoswitch_settings',
    'dialogs', 'conversations', 'chat_messages',
    'knowledge_sources', 'knowledge_chunks',
    'niches', 'niche_synonyms', 'user_niches',
    'widget_development_settings', 'telegram_settings'
)
ORDER BY tablename, cmd, policyname;
