-- 🔒 Упрощенный RLS Аудит
-- Проверка качества Row Level Security без создания тестовых данных

-- ============================================
-- 1. ПРОВЕРКА ПОКРЫТИЯ RLS
-- ============================================

SELECT 
    '📊 ПОКРЫТИЕ RLS' as section,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS включен'
        ELSE '❌ RLS ОТКЛЮЧЕН - УЯЗВИМОСТЬ!'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'users', 'projects', 'niches', 'user_niches', 'widget_settings', 
    'widget_development_settings', 'telegram_settings', 'dialogs', 
    'chat_history', 'chat_messages', 'knowledge_sources', 'knowledge_chunks', 
    'assistants', 'conversations', 'crm_clients', 'crm_deal_notes', 
    'crm_deals', 'crm_operators', 'crm_tasks', 'dialog_crm_connections', 
    'dialog_with_operators', 'faq_cache', 'help_requests', 
    'integration_dialogs', 'integration_messages', 'messages', 
    'messenger_contacts', 'niche_synonyms', 'notifications', 
    'notification_logs', 'project_members', 'prompt_logs', 'stories', 
    'telegram_bots', 'telegram_notifications', 'user_integrations', 
    'widget_api_keys', 'working_hours'
)
ORDER BY 
    CASE WHEN rowsecurity THEN 1 ELSE 0 END,
    tablename;

-- ============================================
-- 2. АНАЛИЗ ПОЛИТИК
-- ============================================

SELECT 
    '🔍 АНАЛИЗ ПОЛИТИК' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    CASE 
        WHEN cmd = 'SELECT' THEN '🔍 Чтение'
        WHEN cmd = 'INSERT' THEN '➕ Вставка'
        WHEN cmd = 'UPDATE' THEN '✏️ Обновление'
        WHEN cmd = 'DELETE' THEN '🗑️ Удаление'
        WHEN cmd = 'ALL' THEN '🔄 Все операции'
        ELSE '❓ Неизвестно'
    END as operation_type,
    CASE 
        WHEN qual IS NULL AND with_check IS NULL THEN '⚠️ НЕТ УСЛОВИЙ - ОПАСНО!'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ Использует auth.uid()'
        WHEN qual LIKE '%user_id%' THEN '✅ Фильтрует по user_id'
        WHEN qual LIKE '%id%' THEN '✅ Фильтрует по id'
        ELSE '⚠️ Проверить логику'
    END as security_level,
    qual as condition,
    with_check as insert_condition
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- ============================================
-- 3. ПРОВЕРКА УЯЗВИМОСТЕЙ
-- ============================================

SELECT 
    '🚨 ПОТЕНЦИАЛЬНЫЕ УЯЗВИМОСТИ' as section,
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN 'Политика без условий WHERE'
        WHEN qual = 'true' THEN 'Политика разрешает все (true)'
        WHEN qual NOT LIKE '%auth.uid()%' AND qual NOT LIKE '%user_id%' AND qual NOT LIKE '%id%' THEN 'Политика без фильтрации по пользователю'
        WHEN qual LIKE '%OR%' THEN 'Политика с OR - может быть слишком широкой'
        WHEN with_check IS NULL AND cmd = 'INSERT' THEN 'INSERT политика без with_check'
        ELSE 'Другая потенциальная проблема'
    END as vulnerability_type
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    qual IS NULL 
    OR qual = 'true'
    OR (qual NOT LIKE '%auth.uid()%' AND qual NOT LIKE '%user_id%' AND qual NOT LIKE '%id%')
    OR qual LIKE '%OR%'
    OR (with_check IS NULL AND cmd = 'INSERT')
)
ORDER BY tablename, policyname;

-- ============================================
-- 4. ПРОВЕРКА ПОЛНОТЫ ПОКРЫТИЯ
-- ============================================

-- Проверяем, есть ли политики для всех операций
SELECT 
    '📋 ПОЛНОТА ПОКРЫТИЯ' as section,
    t.tablename,
    t.rowsecurity as rls_enabled,
    COUNT(p.policyname) as policies_count,
    STRING_AGG(DISTINCT p.cmd, ', ') as covered_operations,
    CASE 
        WHEN t.rowsecurity = false THEN '❌ RLS отключен'
        WHEN COUNT(p.policyname) = 0 THEN '❌ Нет политик'
        WHEN COUNT(p.policyname) < 4 THEN '⚠️ Неполное покрытие'
        ELSE '✅ Полное покрытие'
    END as coverage_status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public' 
AND t.tablename IN (
    'users', 'dialogs', 'chat_messages', 'knowledge_sources', 
    'knowledge_chunks', 'assistants', 'conversations'
)
GROUP BY t.tablename, t.rowsecurity
ORDER BY 
    CASE WHEN t.rowsecurity THEN 1 ELSE 0 END,
    COUNT(p.policyname) DESC;

-- ============================================
-- 5. ПРОВЕРКА ПРОИЗВОДИТЕЛЬНОСТИ
-- ============================================

SELECT 
    '⚡ ПРОИЗВОДИТЕЛЬНОСТЬ' as section,
    schemaname,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%auth.uid()%' THEN '⚠️ Использует auth.uid() - может быть медленно'
        WHEN qual LIKE '%user_id%' THEN '✅ Фильтрует по user_id - оптимально'
        WHEN qual LIKE '%id%' THEN '✅ Фильтрует по id - оптимально'
        ELSE '❓ Неизвестная логика'
    END as performance_impact,
    qual as condition
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ============================================
-- 6. РЕКОМЕНДАЦИИ
-- ============================================

SELECT 
    '📋 РЕКОМЕНДАЦИИ' as section,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'users' 
            AND rowsecurity = true
        ) THEN '❌ Включить RLS для таблицы users'
        ELSE '✅ RLS включен для users'
    END as recommendation
UNION ALL
SELECT 
    '📋 РЕКОМЕНДАЦИИ',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND qual IS NULL
        ) THEN '❌ Найти и исправить политики без условий'
        ELSE '✅ Все политики имеют условия'
    END
UNION ALL
SELECT 
    '📋 РЕКОМЕНДАЦИИ',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND qual NOT LIKE '%auth.uid()%'
            AND qual NOT LIKE '%user_id%'
            AND qual NOT LIKE '%id%'
        ) THEN '⚠️ Проверить политики без user_id фильтрации'
        ELSE '✅ Все политики фильтруют по пользователю'
    END
UNION ALL
SELECT 
    '📋 РЕКОМЕНДАЦИИ',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND rowsecurity = false
            AND tablename IN ('users', 'dialogs', 'chat_messages', 'knowledge_sources')
        ) THEN '❌ Включить RLS для критических таблиц'
        ELSE '✅ RLS включен для критических таблиц'
    END;

-- ============================================
-- 7. ИТОГОВЫЙ ОТЧЕТ
-- ============================================

SELECT 
    '🎯 ИТОГОВЫЙ ОТЧЕТ RLS' as report_section,
    COUNT(*) as total_tables,
    COUNT(*) FILTER (WHERE rowsecurity = true) as tables_with_rls,
    COUNT(*) FILTER (WHERE rowsecurity = false) as tables_without_rls,
    ROUND(
        COUNT(*) FILTER (WHERE rowsecurity = true) * 100.0 / COUNT(*), 
        2
    ) as rls_coverage_percent,
    CASE 
        WHEN COUNT(*) FILTER (WHERE rowsecurity = true) * 100.0 / COUNT(*) >= 90 THEN '🎉 ОТЛИЧНО'
        WHEN COUNT(*) FILTER (WHERE rowsecurity = true) * 100.0 / COUNT(*) >= 70 THEN '⚠️ ХОРОШО'
        ELSE '🚨 КРИТИЧНО'
    END as overall_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'users', 'projects', 'niches', 'user_niches', 'widget_settings', 
    'widget_development_settings', 'telegram_settings', 'dialogs', 
    'chat_history', 'chat_messages', 'knowledge_sources', 'knowledge_chunks', 
    'assistants', 'conversations', 'crm_clients', 'crm_deal_notes', 
    'crm_deals', 'crm_operators', 'crm_tasks', 'dialog_crm_connections', 
    'dialog_with_operators', 'faq_cache', 'help_requests', 
    'integration_dialogs', 'integration_messages', 'messages', 
    'messenger_contacts', 'niche_synonyms', 'notifications', 
    'notification_logs', 'project_members', 'prompt_logs', 'stories', 
    'telegram_bots', 'telegram_notifications', 'user_integrations', 
    'widget_api_keys', 'working_hours'
);

-- ============================================
-- 8. ДЕТАЛЬНАЯ СТАТИСТИКА ПОЛИТИК
-- ============================================

SELECT 
    '📊 СТАТИСТИКА ПОЛИТИК' as section,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE cmd = 'SELECT') as select_policies,
    COUNT(*) FILTER (WHERE cmd = 'INSERT') as insert_policies,
    COUNT(*) FILTER (WHERE cmd = 'UPDATE') as update_policies,
    COUNT(*) FILTER (WHERE cmd = 'DELETE') as delete_policies,
    COUNT(*) FILTER (WHERE cmd = 'ALL') as all_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%') as auth_uid_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%user_id%') as user_id_policies,
    COUNT(*) FILTER (WHERE qual IS NULL) as null_condition_policies
FROM pg_policies 
WHERE schemaname = 'public';
