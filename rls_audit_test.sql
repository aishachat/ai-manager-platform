-- 🔒 RLS Аудит и Тестирование
-- Комплексная проверка качества Row Level Security политик

-- ============================================
-- 1. ПРОВЕРКА ПОКРЫТИЯ RLS
-- ============================================

-- Проверяем, какие таблицы имеют RLS включенный
SELECT 
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

-- Детальный анализ всех RLS политик
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as condition,
    with_check as insert_condition,
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
        ELSE '⚠️ Проверить логику'
    END as security_level
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- ============================================
-- 3. ПРОВЕРКА УЯЗВИМОСТЕЙ
-- ============================================

-- Ищем потенциально опасные политики
SELECT 
    '🚨 ПОТЕНЦИАЛЬНАЯ УЯЗВИМОСТЬ' as alert_type,
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    'Политика без условий или с подозрительной логикой' as description
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    qual IS NULL 
    OR qual = 'true'
    OR qual NOT LIKE '%auth.uid()%'
    OR qual NOT LIKE '%user_id%'
    OR qual LIKE '%OR%' -- Может быть слишком широким
)
ORDER BY tablename, policyname;

-- ============================================
-- 4. ТЕСТИРОВАНИЕ ПОЛИТИК
-- ============================================

-- Создаем тестового пользователя для проверки
DO $$
DECLARE
    test_user_id UUID;
    test_user_email TEXT := 'test-rls-audit@example.com';
BEGIN
    -- Создаем тестового пользователя (проверяем существование сначала)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = test_user_email) THEN
        INSERT INTO auth.users (
            id, 
            email, 
            encrypted_password, 
            email_confirmed_at, 
            created_at, 
            updated_at,
            aud,
            role
        ) VALUES (
            gen_random_uuid(),
            test_user_email,
            crypt('testpassword', gen_salt('bf')),
            now(),
            now(),
            now(),
            'authenticated',
            'authenticated'
        );
    END IF;
    
    -- Получаем ID тестового пользователя
    SELECT id INTO test_user_id FROM auth.users WHERE email = test_user_email;
    
    -- Создаем запись в таблице users (проверяем существование сначала)
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = test_user_id) THEN
        INSERT INTO public.users (
            id,
            email,
            name,
            company_name,
            phone,
            created_at,
            updated_at
        ) VALUES (
            test_user_id,
            test_user_email,
            'Test RLS User',
            'Test Company',
            '+7 (999) 999-99-99',
            now(),
            now()
        );
    END IF;
    
    RAISE NOTICE 'Тестовый пользователь создан: %', test_user_id;
END $$;

-- ============================================
-- 5. ТЕСТИРОВАНИЕ ДОСТУПА
-- ============================================

-- Тестируем доступ к данным (это нужно выполнять под разными пользователями)
-- Создаем функцию для тестирования RLS
CREATE OR REPLACE FUNCTION test_rls_policies()
RETURNS TABLE (
    table_name TEXT,
    test_result TEXT,
    details TEXT
) AS $$
DECLARE
    test_user_id UUID;
    test_user_email TEXT := 'test-rls-audit@example.com';
    rec RECORD;
    table_names TEXT[] := ARRAY[
        'users', 'dialogs', 'chat_messages', 'knowledge_sources', 
        'assistants', 'conversations'
    ];
    table_name TEXT;
BEGIN
    -- Получаем ID тестового пользователя
    SELECT id INTO test_user_id FROM auth.users WHERE email = test_user_email;
    
    IF test_user_id IS NULL THEN
        RETURN QUERY SELECT 'ERROR'::TEXT, 'FAIL'::TEXT, 'Test user not found'::TEXT;
        RETURN;
    END IF;
    
    -- Тестируем каждую таблицу
    FOREACH table_name IN ARRAY table_names
    LOOP
        BEGIN
            -- Пытаемся получить данные
            EXECUTE format('SELECT COUNT(*) FROM %I WHERE user_id = $1 OR id = $1', table_name) 
            INTO rec USING test_user_id;
            
            RETURN QUERY SELECT 
                table_name,
                'PASS'::TEXT,
                format('Can access own data: %s records', rec.count);
                
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 
                table_name,
                'FAIL'::TEXT,
                format('Error: %s', SQLERRM);
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. ПРОВЕРКА ПРОИЗВОДИТЕЛЬНОСТИ
-- ============================================

-- Анализируем влияние RLS на производительность
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%auth.uid()%' THEN 'Использует auth.uid() - может быть медленно'
        WHEN qual LIKE '%user_id%' THEN 'Фильтрует по user_id - оптимально'
        ELSE 'Неизвестная логика'
    END as performance_impact
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 7. РЕКОМЕНДАЦИИ ПО УЛУЧШЕНИЮ
-- ============================================

-- Генерируем рекомендации
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
        ) THEN '⚠️ Проверить политики без user_id фильтрации'
        ELSE '✅ Все политики фильтруют по пользователю'
    END;

-- ============================================
-- 8. ФИНАЛЬНЫЙ ОТЧЕТ
-- ============================================

-- Создаем итоговый отчет
SELECT 
    '🎯 ИТОГОВЫЙ ОТЧЕТ RLS' as report_section,
    COUNT(*) as total_tables,
    COUNT(*) FILTER (WHERE rowsecurity = true) as tables_with_rls,
    COUNT(*) FILTER (WHERE rowsecurity = false) as tables_without_rls,
    ROUND(
        COUNT(*) FILTER (WHERE rowsecurity = true) * 100.0 / COUNT(*), 
        2
    ) as rls_coverage_percent
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
-- 9. ОЧИСТКА ТЕСТОВЫХ ДАННЫХ
-- ============================================

-- Функция для очистки тестовых данных
CREATE OR REPLACE FUNCTION cleanup_rls_test_data()
RETURNS TEXT AS $$
DECLARE
    test_user_id UUID;
    test_user_email TEXT := 'test-rls-audit@example.com';
BEGIN
    -- Получаем ID тестового пользователя
    SELECT id INTO test_user_id FROM auth.users WHERE email = test_user_email;
    
    IF test_user_id IS NOT NULL THEN
        -- Удаляем тестовые данные
        DELETE FROM public.users WHERE id = test_user_id;
        DELETE FROM auth.users WHERE id = test_user_id;
        
        RETURN 'Тестовые данные очищены';
    ELSE
        RETURN 'Тестовые данные не найдены';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
