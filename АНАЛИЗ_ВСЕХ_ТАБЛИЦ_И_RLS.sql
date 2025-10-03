-- 🔍 АНАЛИЗ ВСЕХ ТАБЛИЦ И ИХ RLS ПОЛИТИК
-- Проверяем какие таблицы существуют, какие RLS политики у них есть

-- ============================================
-- 1. ПРОВЕРЯЕМ СУЩЕСТВОВАНИЕ ВСЕХ ТАБЛИЦ
-- ============================================

SELECT 
    '📋 СУЩЕСТВУЮЩИЕ ТАБЛИЦЫ' as section,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS включен'
        WHEN rowsecurity = false THEN '❌ RLS отключен'
        ELSE '⚠️ Неизвестно'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'ai_agent_settings', 'assistants', 'autoswitch_settings', 'chat_messages',
    'chunk_synonyms', 'conversations', 'crm_clients', 'crm_deal_notes',
    'crm_deals', 'crm_operators', 'crm_tasks', 'dialog_crm_connections',
    'dialog_with_operators', 'dialogs', 'faq_cache', 'help_requests',
    'integration_dialogs', 'integration_messages', 'knowledge_chunks',
    'knowledge_sources', 'messages', 'messenger_contacts', 'niche_synonyms',
    'niches', 'notification_logs', 'notifications', 'project_members',
    'projects', 'prompt_logs', 'stories', 'telegram_bots',
    'telegram_notifications', 'telegram_settings', 'user_integrations',
    'user_niches', 'users', 'widget_api_keys', 'widget_development_settings',
    'working_hours'
)
ORDER BY tablename;

-- ============================================
-- 2. ПРОВЕРЯЕМ СТРУКТУРУ КАЖДОЙ ТАБЛИЦЫ
-- ============================================

-- Проверяем какие колонки есть у каждой таблицы
SELECT 
    '📊 СТРУКТУРА ТАБЛИЦ' as section,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN (
    'ai_agent_settings', 'assistants', 'autoswitch_settings', 'chat_messages',
    'chunk_synonyms', 'conversations', 'crm_clients', 'crm_deal_notes',
    'crm_deals', 'crm_operators', 'crm_tasks', 'dialog_crm_connections',
    'dialog_with_operators', 'dialogs', 'faq_cache', 'help_requests',
    'integration_dialogs', 'integration_messages', 'knowledge_chunks',
    'knowledge_sources', 'messages', 'messenger_contacts', 'niche_synonyms',
    'niches', 'notification_logs', 'notifications', 'project_members',
    'projects', 'prompt_logs', 'stories', 'telegram_bots',
    'telegram_notifications', 'telegram_settings', 'user_integrations',
    'user_niches', 'users', 'widget_api_keys', 'widget_development_settings',
    'working_hours'
)
ORDER BY table_name, ordinal_position;

-- ============================================
-- 3. ПРОВЕРЯЕМ ТЕКУЩИЕ RLS ПОЛИТИКИ
-- ============================================

SELECT 
    '🔒 ТЕКУЩИЕ RLS ПОЛИТИКИ' as section,
    tablename,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN '❌ ПРОБЛЕМА: Нет условий WHERE'
        WHEN qual = 'true' THEN '❌ ПРОБЛЕМА: Разрешает все'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        WHEN qual LIKE '%project_id%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN qual LIKE '%owner_id%' THEN '✅ ОТЛИЧНО: Использует owner_id'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
    'ai_agent_settings', 'assistants', 'autoswitch_settings', 'chat_messages',
    'chunk_synonyms', 'conversations', 'crm_clients', 'crm_deal_notes',
    'crm_deals', 'crm_operators', 'crm_tasks', 'dialog_crm_connections',
    'dialog_with_operators', 'dialogs', 'faq_cache', 'help_requests',
    'integration_dialogs', 'integration_messages', 'knowledge_chunks',
    'knowledge_sources', 'messages', 'messenger_contacts', 'niche_synonyms',
    'niches', 'notification_logs', 'notifications', 'project_members',
    'projects', 'prompt_logs', 'stories', 'telegram_bots',
    'telegram_notifications', 'telegram_settings', 'user_integrations',
    'user_niches', 'users', 'widget_api_keys', 'widget_development_settings',
    'working_hours'
)
ORDER BY tablename, policyname;

-- ============================================
-- 4. АНАЛИЗ ПО ТИПАМ ТАБЛИЦ
-- ============================================

-- Таблицы с project_id (должны быть изолированы по проектам)
SELECT 
    '🎯 ТАБЛИЦЫ С PROJECT_ID' as section,
    table_name,
    'project_id' as key_column,
    'Изоляция по проектам' as recommended_policy
FROM information_schema.columns
WHERE table_schema = 'public' 
AND column_name = 'project_id'
AND table_name IN (
    'ai_agent_settings', 'assistants', 'autoswitch_settings', 'chat_messages',
    'chunk_synonyms', 'conversations', 'crm_clients', 'crm_deal_notes',
    'crm_deals', 'crm_operators', 'crm_tasks', 'dialog_crm_connections',
    'dialog_with_operators', 'dialogs', 'faq_cache', 'help_requests',
    'integration_dialogs', 'integration_messages', 'knowledge_chunks',
    'knowledge_sources', 'messages', 'messenger_contacts', 'niche_synonyms',
    'niches', 'notification_logs', 'notifications', 'project_members',
    'projects', 'prompt_logs', 'stories', 'telegram_bots',
    'telegram_notifications', 'telegram_settings', 'user_integrations',
    'user_niches', 'users', 'widget_api_keys', 'widget_development_settings',
    'working_hours'
)
ORDER BY table_name;

-- Таблицы с user_id (должны быть изолированы по пользователям)
SELECT 
    '👤 ТАБЛИЦЫ С USER_ID' as section,
    table_name,
    'user_id' as key_column,
    'Изоляция по пользователям' as recommended_policy
FROM information_schema.columns
WHERE table_schema = 'public' 
AND column_name = 'user_id'
AND table_name IN (
    'ai_agent_settings', 'assistants', 'autoswitch_settings', 'chat_messages',
    'chunk_synonyms', 'conversations', 'crm_clients', 'crm_deal_notes',
    'crm_deals', 'crm_operators', 'crm_tasks', 'dialog_crm_connections',
    'dialog_with_operators', 'dialogs', 'faq_cache', 'help_requests',
    'integration_dialogs', 'integration_messages', 'knowledge_chunks',
    'knowledge_sources', 'messages', 'messenger_contacts', 'niche_synonyms',
    'niches', 'notification_logs', 'notifications', 'project_members',
    'projects', 'prompt_logs', 'stories', 'telegram_bots',
    'telegram_notifications', 'telegram_settings', 'user_integrations',
    'user_niches', 'users', 'widget_api_keys', 'widget_development_settings',
    'working_hours'
)
ORDER BY table_name;

-- Таблицы с owner_id (должны быть изолированы по владельцам)
SELECT 
    '👑 ТАБЛИЦЫ С OWNER_ID' as section,
    table_name,
    'owner_id' as key_column,
    'Изоляция по владельцам' as recommended_policy
FROM information_schema.columns
WHERE table_schema = 'public' 
AND column_name = 'owner_id'
AND table_name IN (
    'ai_agent_settings', 'assistants', 'autoswitch_settings', 'chat_messages',
    'chunk_synonyms', 'conversations', 'crm_clients', 'crm_deal_notes',
    'crm_deals', 'crm_operators', 'crm_tasks', 'dialog_crm_connections',
    'dialog_with_operators', 'dialogs', 'faq_cache', 'help_requests',
    'integration_dialogs', 'integration_messages', 'knowledge_chunks',
    'knowledge_sources', 'messages', 'messenger_contacts', 'niche_synonyms',
    'niches', 'notification_logs', 'notifications', 'project_members',
    'projects', 'prompt_logs', 'stories', 'telegram_bots',
    'telegram_notifications', 'telegram_settings', 'user_integrations',
    'user_niches', 'users', 'widget_api_keys', 'widget_development_settings',
    'working_hours'
)
ORDER BY table_name;

-- Справочные таблицы (должны быть публичными)
SELECT 
    '📚 СПРАВОЧНЫЕ ТАБЛИЦЫ' as section,
    table_name,
    'Публичный доступ' as recommended_policy,
    'SELECT USING (true)' as policy_type
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name IN ('niches', 'niche_synonyms', 'chunk_synonyms')
ORDER BY table_name;

-- ============================================
-- 5. ИТОГОВЫЙ ОТЧЕТ ПО ТАБЛИЦАМ
-- ============================================

SELECT 
    '📋 ИТОГОВЫЙ ОТЧЕТ' as section,
    'Всего таблиц проверено: ' || COUNT(*)::text as total_tables,
    'С RLS включенным: ' || COUNT(*) FILTER (WHERE rowsecurity = true)::text as with_rls,
    'Без RLS: ' || COUNT(*) FILTER (WHERE rowsecurity = false)::text as without_rls
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'ai_agent_settings', 'assistants', 'autoswitch_settings', 'chat_messages',
    'chunk_synonyms', 'conversations', 'crm_clients', 'crm_deal_notes',
    'crm_deals', 'crm_operators', 'crm_tasks', 'dialog_crm_connections',
    'dialog_with_operators', 'dialogs', 'faq_cache', 'help_requests',
    'integration_dialogs', 'integration_messages', 'knowledge_chunks',
    'knowledge_sources', 'messages', 'messenger_contacts', 'niche_synonyms',
    'niches', 'notification_logs', 'notifications', 'project_members',
    'projects', 'prompt_logs', 'stories', 'telegram_bots',
    'telegram_notifications', 'telegram_settings', 'user_integrations',
    'user_niches', 'users', 'widget_api_keys', 'widget_development_settings',
    'working_hours'
);
