-- 🔍 Анализ текущей RLS архитектуры
-- У вас уже есть отличная система с get_user_project_id()!

-- ============================================
-- 1. ПРОВЕРЯЕМ, КАКИЕ ТАБЛИЦЫ ИМЕЮТ project_id
-- ============================================

SELECT 
    '📊 ТАБЛИЦЫ С project_id' as section,
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = t.table_name 
            AND column_name = 'project_id'
        ) THEN '✅ Есть project_id'
        ELSE '❌ Нет project_id'
    END as has_project_id,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = t.table_name 
            AND column_name = 'user_id'
        ) THEN '✅ Есть user_id'
        ELSE '❌ Нет user_id'
    END as has_user_id
FROM (
    SELECT DISTINCT table_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'assistants', 'autoswitch_settings', 'chat_messages', 'conversations',
        'dialogs', 'knowledge_chunks', 'knowledge_sources', 'telegram_settings',
        'user_niches', 'widget_development_settings', 'projects', 'users',
        'project_members', 'crm_clients', 'crm_deal_notes', 'crm_deals',
        'crm_operators', 'crm_tasks', 'dialog_crm_connections', 'dialog_with_operators',
        'faq_cache', 'help_requests', 'integration_dialogs', 'integration_messages',
        'messages', 'messenger_contacts', 'niche_synonyms', 'niches',
        'notification_logs', 'notifications', 'prompt_logs', 'stories',
        'telegram_bots', 'telegram_notifications', 'user_integrations',
        'widget_api_keys', 'working_hours'
    )
) t
ORDER BY 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = t.table_name 
        AND column_name = 'project_id'
    ) THEN 1 ELSE 0 END DESC,
    table_name;

-- ============================================
-- 2. АНАЛИЗ ТЕКУЩИХ RLS ПОЛИТИК
-- ============================================

SELECT 
    '🔒 АНАЛИЗ RLS ПОЛИТИК' as section,
    tablename,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE cmd = 'ALL') as all_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%get_user_project_id()%') as project_based_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%') as user_based_policies,
    COUNT(*) FILTER (WHERE qual IS NULL) as null_condition_policies,
    CASE 
        WHEN COUNT(*) FILTER (WHERE qual LIKE '%get_user_project_id()%') > 0 THEN '✅ Использует project_id'
        WHEN COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%') > 0 THEN '✅ Использует user_id'
        ELSE '❌ Нет правильной фильтрации'
    END as security_status
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'assistants', 'autoswitch_settings', 'chat_messages', 'conversations',
    'dialogs', 'knowledge_chunks', 'knowledge_sources', 'telegram_settings',
    'user_niches', 'widget_development_settings', 'projects', 'users',
    'project_members'
)
GROUP BY tablename
ORDER BY 
    CASE WHEN COUNT(*) FILTER (WHERE qual LIKE '%get_user_project_id()%') > 0 THEN 1 ELSE 0 END DESC,
    tablename;

-- ============================================
-- 3. ПРОВЕРЯЕМ ФУНКЦИЮ get_user_project_id()
-- ============================================

SELECT 
    '🔧 ПРОВЕРКА ФУНКЦИИ get_user_project_id()' as section,
    routine_name,
    routine_type,
    data_type as return_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_user_project_id';

-- ============================================
-- 4. ИЩЕМ ПРОБЛЕМНЫЕ ПОЛИТИКИ
-- ============================================

SELECT 
    '🚨 ПРОБЛЕМНЫЕ ПОЛИТИКИ' as section,
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN 'Политика без условий WHERE'
        WHEN qual = 'true' THEN 'Политика разрешает все (true)'
        WHEN qual LIKE '%get_user_project_id()%' AND tablename NOT IN (
            SELECT table_name FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND column_name = 'project_id'
            AND table_name = pg_policies.tablename
        ) THEN 'Использует get_user_project_id() но нет project_id в таблице'
        ELSE 'Другая потенциальная проблема'
    END as problem_type
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    qual IS NULL 
    OR qual = 'true'
    OR (qual LIKE '%get_user_project_id()%' AND tablename NOT IN (
        SELECT table_name FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name = 'project_id'
        AND table_name = pg_policies.tablename
    ))
)
ORDER BY tablename, policyname;

-- ============================================
-- 5. РЕКОМЕНДАЦИИ ПО ИСПРАВЛЕНИЮ
-- ============================================

SELECT 
    '📋 РЕКОМЕНДАЦИИ' as section,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name = 'get_user_project_id'
        ) THEN '✅ Функция get_user_project_id() существует'
        ELSE '❌ Нужно создать функцию get_user_project_id()'
    END as function_status
UNION ALL
SELECT 
    '📋 РЕКОМЕНДАЦИИ',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND qual IS NULL
        ) THEN '❌ Есть политики без условий - нужно исправить'
        ELSE '✅ Все политики имеют условия'
    END
UNION ALL
SELECT 
    '📋 РЕКОМЕНДАЦИИ',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies p
            WHERE p.schemaname = 'public' 
            AND p.qual LIKE '%get_user_project_id()%'
            AND p.tablename NOT IN (
                SELECT table_name FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND column_name = 'project_id'
                AND table_name = p.tablename
            )
        ) THEN '❌ Есть политики с get_user_project_id() для таблиц без project_id'
        ELSE '✅ Все политики с get_user_project_id() корректны'
    END;
