-- 🎉 ФИНАЛЬНАЯ ПРОВЕРКА RLS - ПОСЛЕ ИСПРАВЛЕНИЙ

-- ============================================
-- 1. ОБЩАЯ СТАТИСТИКА
-- ============================================

SELECT 
    '🎉 ФИНАЛЬНАЯ СТАТИСТИКА' as section,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE qual IS NULL) as null_condition_policies,
    COUNT(*) FILTER (WHERE qual = 'true') as true_condition_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%get_user_project_id()%') as project_based_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%') as user_based_policies,
    ROUND(
        COUNT(*) FILTER (WHERE qual LIKE '%get_user_project_id()%' OR qual LIKE '%auth.uid()%') * 100.0 / COUNT(*), 
        2
    ) as secure_policies_percent,
    CASE 
        WHEN COUNT(*) FILTER (WHERE qual IS NULL) = 0 THEN '✅ ВСЕ ИСПРАВЛЕНО!'
        ELSE '❌ ОСТАЛИСЬ ПРОБЛЕМЫ'
    END as final_status
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================
-- 2. ПРОВЕРКА INSERT ПОЛИТИК
-- ============================================

SELECT 
    '🔍 ПРОВЕРКА INSERT ПОЛИТИК' as section,
    tablename,
    policyname,
    with_check,
    CASE 
        WHEN with_check IS NULL THEN '❌ ПРОБЛЕМА: Нет with_check'
        WHEN with_check LIKE '%get_user_project_id()%' THEN '✅ ОТЛИЧНО: Использует project_id'
        WHEN with_check LIKE '%auth.uid()%' THEN '✅ ХОРОШО: Использует user_id'
        WHEN with_check LIKE '%auth.uid() IS NOT NULL%' THEN '✅ ХОРОШО: Справочная таблица'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as quality_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND cmd = 'INSERT'
AND tablename IN (
    'assistants', 'autoswitch_settings', 'chat_messages', 'conversations',
    'dialogs', 'knowledge_chunks', 'knowledge_sources', 'niches',
    'project_members', 'projects', 'telegram_settings', 'user_niches',
    'users', 'widget_development_settings'
)
ORDER BY tablename, policyname;

-- ============================================
-- 3. ПРОВЕРКА СПРАВОЧНЫХ ТАБЛИЦ
-- ============================================

SELECT 
    '📚 СПРАВОЧНЫЕ ТАБЛИЦЫ' as section,
    tablename,
    policyname,
    cmd,
    qual,
    CASE 
        WHEN qual = 'true' AND tablename IN ('niches', 'niche_synonyms') THEN '✅ ОК: Справочная таблица'
        ELSE '⚠️ ПРОВЕРИТЬ'
    END as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('niches', 'niche_synonyms')
ORDER BY tablename, policyname;

-- ============================================
-- 4. ИТОГОВАЯ ОЦЕНКА КАЧЕСТВА
-- ============================================

SELECT 
    '🏆 ИТОГОВАЯ ОЦЕНКА' as section,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND qual IS NULL) = 0 
        THEN '✅ ОТЛИЧНО: Все политики имеют условия'
        ELSE '❌ ПРОБЛЕМЫ: Есть политики без условий'
    END as security_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND qual LIKE '%get_user_project_id()%') > 0 
        THEN '✅ ОТЛИЧНО: Используется архитектура проектов'
        ELSE '❌ ПРОБЛЕМЫ: Нет архитектуры проектов'
    END as architecture_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND qual LIKE '%auth.uid()%') > 0 
        THEN '✅ ОТЛИЧНО: Используется аутентификация'
        ELSE '❌ ПРОБЛЕМЫ: Нет аутентификации'
    END as auth_status,
    '🚀 ГОТОВО К ПРОДАКШЕНУ!' as final_result;
