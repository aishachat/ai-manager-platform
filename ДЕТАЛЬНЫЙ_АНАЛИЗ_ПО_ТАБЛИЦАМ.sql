-- 🔍 ДЕТАЛЬНЫЙ АНАЛИЗ RLS ПО КАЖДОЙ ТАБЛИЦЕ
-- Проверяем качество политик для каждой таблицы отдельно

-- ============================================
-- 1. АНАЛИЗ ПО ТАБЛИЦАМ С ПРОБЛЕМАМИ
-- ============================================

-- assistants
SELECT 
    '🔍 ASSISTANTS' as table_name,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'assistants'
ORDER BY cmd, policyname;

-- autoswitch_settings
SELECT 
    '🔍 AUTOSWITCH_SETTINGS' as table_name,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'autoswitch_settings'
ORDER BY cmd, policyname;

-- chat_messages
SELECT 
    '🔍 CHAT_MESSAGES' as table_name,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'chat_messages'
ORDER BY cmd, policyname;

-- conversations
SELECT 
    '🔍 CONVERSATIONS' as table_name,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'conversations'
ORDER BY cmd, policyname;

-- dialogs
SELECT 
    '🔍 DIALOGS' as table_name,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'dialogs'
ORDER BY cmd, policyname;

-- knowledge_chunks
SELECT 
    '🔍 KNOWLEDGE_CHUNKS' as table_name,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'knowledge_chunks'
ORDER BY cmd, policyname;

-- knowledge_sources
SELECT 
    '🔍 KNOWLEDGE_SOURCES' as table_name,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'knowledge_sources'
ORDER BY cmd, policyname;

-- niches
SELECT 
    '🔍 NICHES' as table_name,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '⚠️ СПРАВОЧНАЯ: Можно оставить true'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'niches'
ORDER BY cmd, policyname;

-- niche_synonyms
SELECT 
    '🔍 NICHE_SYNONYMS' as table_name,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '⚠️ СПРАВОЧНАЯ: Можно оставить true'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'niche_synonyms'
ORDER BY cmd, policyname;

-- project_members
SELECT 
    '🔍 PROJECT_MEMBERS' as table_name,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'project_members'
ORDER BY cmd, policyname;

-- projects
SELECT 
    '🔍 PROJECTS' as table_name,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'projects'
ORDER BY cmd, policyname;

-- telegram_settings
SELECT 
    '🔍 TELEGRAM_SETTINGS' as table_name,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'telegram_settings'
ORDER BY cmd, policyname;

-- user_niches
SELECT 
    '🔍 USER_NICHES' as table_name,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'user_niches'
ORDER BY cmd, policyname;

-- users
SELECT 
    '🔍 USERS' as table_name,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY cmd, policyname;

-- widget_development_settings
SELECT 
    '🔍 WIDGET_DEVELOPMENT_SETTINGS' as table_name,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'widget_development_settings'
ORDER BY cmd, policyname;

-- ============================================
-- 2. ИТОГОВАЯ СТАТИСТИКА ПО ТАБЛИЦАМ
-- ============================================

SELECT 
    '📊 ИТОГОВАЯ СТАТИСТИКА ПО ТАБЛИЦАМ' as section,
    tablename,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE cmd = 'SELECT') as select_policies,
    COUNT(*) FILTER (WHERE cmd = 'INSERT') as insert_policies,
    COUNT(*) FILTER (WHERE cmd = 'UPDATE') as update_policies,
    COUNT(*) FILTER (WHERE cmd = 'DELETE') as delete_policies,
    COUNT(*) FILTER (WHERE cmd = 'ALL') as all_policies,
    COUNT(*) FILTER (WHERE qual IS NULL) as null_condition_policies,
    COUNT(*) FILTER (WHERE qual = 'true') as true_condition_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%get_user_project_id()%') as project_based_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%') as user_based_policies,
    CASE 
        WHEN COUNT(*) FILTER (WHERE qual IS NULL) > 0 THEN '❌ ЕСТЬ ПРОБЛЕМЫ'
        WHEN COUNT(*) FILTER (WHERE qual = 'true') > 0 AND tablename NOT IN ('niches', 'niche_synonyms') THEN '❌ ЕСТЬ ПРОБЛЕМЫ'
        ELSE '✅ ОТЛИЧНО'
    END as overall_status
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'assistants', 'autoswitch_settings', 'chat_messages', 'conversations',
    'dialogs', 'knowledge_chunks', 'knowledge_sources', 'niches',
    'niche_synonyms', 'project_members', 'projects', 'telegram_settings',
    'user_niches', 'users', 'widget_development_settings'
)
GROUP BY tablename
ORDER BY 
    CASE 
        WHEN COUNT(*) FILTER (WHERE qual IS NULL) > 0 THEN 1
        WHEN COUNT(*) FILTER (WHERE qual = 'true') > 0 AND tablename NOT IN ('niches', 'niche_synonyms') THEN 2
        ELSE 3
    END,
    tablename;
