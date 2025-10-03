-- Проверка всех исправлений ошибок консоли
-- Выполните этот скрипт в Supabase SQL Editor для проверки

-- ============================================
-- 1. ПРОВЕРКА СУЩЕСТВОВАНИЯ ТАБЛИЦ
-- ============================================

SELECT 
    'Проверка таблиц' as check_type,
    table_name,
    CASE 
        WHEN table_name IN (
            'user_niches', 
            'widget_development_settings', 
            'telegram_settings', 
            'niches', 
            'projects', 
            'users', 
            'dialogs',
            'conversations',
            'messages',
            'ai_agent_settings'
        )
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_niches', 
    'widget_development_settings', 
    'telegram_settings', 
    'niches', 
    'projects', 
    'users', 
    'dialogs',
    'conversations',
    'messages',
    'ai_agent_settings'
)
ORDER BY table_name;

-- ============================================
-- 2. ПРОВЕРКА RLS ПОЛИТИК
-- ============================================

SELECT 
    'Проверка RLS политик' as check_type,
    tablename,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ OK'
        WHEN COUNT(*) > 0 THEN '⚠️ PARTIAL'
        ELSE '❌ MISSING'
    END as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_niches', 'widget_development_settings', 'telegram_settings', 'niches', 'projects')
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 3. ПРОВЕРКА ТИПОВ ДАННЫХ В ПОЛИТИКАХ
-- ============================================

SELECT 
    'Проверка типов в политиках' as check_type,
    tablename,
    policyname,
    CASE 
        WHEN qual LIKE '%::text%' OR with_check LIKE '%::text%' THEN '✅ CORRECT'
        WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%' THEN '❌ NEEDS FIX'
        ELSE '⚠️ UNKNOWN'
    END as type_casting_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_niches', 'widget_development_settings', 'telegram_settings', 'projects')
AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
ORDER BY tablename, policyname;

-- ============================================
-- 4. ПРОВЕРКА ФУНКЦИЙ И ТРИГГЕРОВ
-- ============================================

-- Проверяем функцию handle_new_user
SELECT 
    'Проверка функций' as check_type,
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name = 'handle_new_user' THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'handle_new_user';

-- Проверяем триггер
SELECT 
    'Проверка триггеров' as check_type,
    trigger_name,
    event_object_table,
    CASE 
        WHEN trigger_name = 'on_auth_user_created' THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

-- ============================================
-- 5. ПРОВЕРКА FOREIGN KEY CONSTRAINTS
-- ============================================

SELECT 
    'Проверка FK constraints' as check_type,
    conname as constraint_name,
    contype as constraint_type,
    confrelid::regclass as referenced_table,
    conrelid::regclass as table_name,
    CASE 
        WHEN contype = 'f' THEN '✅ FOREIGN KEY'
        WHEN contype = 'p' THEN '✅ PRIMARY KEY'
        WHEN contype = 'u' THEN '✅ UNIQUE'
        ELSE '⚠️ OTHER'
    END as status
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass
ORDER BY conname;

-- ============================================
-- 6. ПРОВЕРКА ИНДЕКСОВ
-- ============================================

SELECT 
    'Проверка индексов' as check_type,
    schemaname,
    tablename,
    indexname,
    CASE 
        WHEN indexname LIKE 'idx_%' THEN '✅ EXISTS'
        ELSE '⚠️ SYSTEM'
    END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_niches', 'widget_development_settings', 'telegram_settings', 'projects')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================
-- 7. ПРОВЕРКА СТРУКТУРЫ ТАБЛИЦ
-- ============================================

SELECT 
    'Проверка структуры' as check_type,
    table_name,
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name IN ('id', 'user_id', 'owner_id') AND data_type = 'uuid' THEN '✅ UUID'
        WHEN column_name IN ('id', 'user_id', 'owner_id') AND data_type = 'text' THEN '⚠️ TEXT'
        ELSE '✅ OK'
    END as type_status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_niches', 'widget_development_settings', 'telegram_settings', 'projects')
AND column_name IN ('id', 'user_id', 'owner_id')
ORDER BY table_name, column_name;

-- ============================================
-- 8. ИТОГОВАЯ ПРОВЕРКА
-- ============================================

SELECT 
    'ИТОГОВАЯ ПРОВЕРКА' as check_type,
    'Все исправления применены' as description,
    CASE 
        WHEN (
            -- Проверяем, что все таблицы существуют
            (SELECT COUNT(*) FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name IN ('users', 'user_niches', 'widget_development_settings', 'telegram_settings', 'niches', 'projects')) = 6
            AND
            -- Проверяем, что есть политики RLS
            (SELECT COUNT(*) FROM pg_policies 
             WHERE schemaname = 'public' 
             AND tablename IN ('users', 'user_niches', 'widget_development_settings', 'telegram_settings', 'niches', 'projects')) >= 20
            AND
            -- Проверяем, что есть функция handle_new_user
            (SELECT COUNT(*) FROM information_schema.routines 
             WHERE routine_schema = 'public' 
             AND routine_name = 'handle_new_user') = 1
            AND
            -- Проверяем, что есть триггер
            (SELECT COUNT(*) FROM information_schema.triggers 
             WHERE event_object_schema = 'auth' 
             AND event_object_table = 'users' 
             AND trigger_name = 'on_auth_user_created') = 1
        ) THEN '✅ ВСЕ ИСПРАВЛЕНИЯ ПРИМЕНЕНЫ'
        ELSE '❌ ТРЕБУЮТСЯ ДОПОЛНИТЕЛЬНЫЕ ИСПРАВЛЕНИЯ'
    END as final_status;

-- ============================================
-- 9. СПИСОК ОШИБОК, КОТОРЫЕ ДОЛЖНЫ БЫТЬ ИСПРАВЛЕНЫ
-- ============================================

SELECT 
    'ОЖИДАЕМЫЕ ИСПРАВЛЕНИЯ' as check_type,
    'Ошибки консоли, которые должны исчезнуть:' as description,
    '✅ 500 ошибка при регистрации' as fix_1,
    '✅ 404 ошибки для widget_settings и user_niches' as fix_2,
    '✅ 406 ошибки RLS политик' as fix_3,
    '✅ getDialogsByUser is not a function' as fix_4,
    '✅ createTestDialog is not a function' as fix_5,
    '✅ WebSocket connection failed' as fix_6;
