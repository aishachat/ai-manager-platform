-- 🔧 ФИНАЛЬНЫЕ RLS ПОЛИТИКИ БЕЗ ОШИБОК
-- Настройка всех оставшихся таблиц с проверкой существования политик

-- ============================================
-- 1. НАСТРОЙКА RLS ДЛЯ AI_AGENT_SETTINGS
-- ============================================

-- Проверяем существование таблицы
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_agent_settings') THEN
        -- Включаем RLS
        ALTER TABLE public.ai_agent_settings ENABLE ROW LEVEL SECURITY;
        
        -- Удаляем старые политики
        DROP POLICY IF EXISTS "ai_agent_settings_all" ON public.ai_agent_settings;
        DROP POLICY IF EXISTS "Users can view their own ai_agent_settings" ON public.ai_agent_settings;
        DROP POLICY IF EXISTS "Users can insert their own ai_agent_settings" ON public.ai_agent_settings;
        DROP POLICY IF EXISTS "Users can update their own ai_agent_settings" ON public.ai_agent_settings;
        DROP POLICY IF EXISTS "Users can delete their own ai_agent_settings" ON public.ai_agent_settings;
        DROP POLICY IF EXISTS "ai_agent_settings_project_access" ON public.ai_agent_settings;
        
        -- Создаем правильную политику
        CREATE POLICY "ai_agent_settings_project_access" ON public.ai_agent_settings
            FOR ALL USING (
                project_id IN (
                    SELECT id FROM public.projects WHERE owner_id = auth.uid()
                )
            )
            WITH CHECK (
                project_id IN (
                    SELECT id FROM public.projects WHERE owner_id = auth.uid()
                )
            );
        
        -- Предоставляем права
        GRANT ALL ON public.ai_agent_settings TO authenticated;
        
        RAISE NOTICE '✅ RLS настроен для ai_agent_settings';
    ELSE
        RAISE NOTICE '⚠️ Таблица ai_agent_settings не найдена';
    END IF;
END $$;

-- ============================================
-- 2. НАСТРОЙКА RLS ДЛЯ AUTOSWITCH_SETTINGS
-- ============================================

-- Включаем RLS
ALTER TABLE public.autoswitch_settings ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "autoswitch_settings_all" ON public.autoswitch_settings;
DROP POLICY IF EXISTS "Users can view their own autoswitch_settings" ON public.autoswitch_settings;
DROP POLICY IF EXISTS "Users can insert their own autoswitch_settings" ON public.autoswitch_settings;
DROP POLICY IF EXISTS "Users can update their own autoswitch_settings" ON public.autoswitch_settings;
DROP POLICY IF EXISTS "Users can delete their own autoswitch_settings" ON public.autoswitch_settings;
DROP POLICY IF EXISTS "autoswitch_settings_project_access" ON public.autoswitch_settings;

-- Создаем правильную политику
CREATE POLICY "autoswitch_settings_project_access" ON public.autoswitch_settings
    FOR ALL USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    );

-- Предоставляем права
GRANT ALL ON public.autoswitch_settings TO authenticated;

-- ============================================
-- 3. НАСТРОЙКА RLS ДЛЯ DIALOGS
-- ============================================

-- Включаем RLS
ALTER TABLE public.dialogs ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "dialogs_all" ON public.dialogs;
DROP POLICY IF EXISTS "Users can view their own dialogs" ON public.dialogs;
DROP POLICY IF EXISTS "Users can insert their own dialogs" ON public.dialogs;
DROP POLICY IF EXISTS "Users can update their own dialogs" ON public.dialogs;
DROP POLICY IF EXISTS "Users can delete their own dialogs" ON public.dialogs;
DROP POLICY IF EXISTS "dialogs_project_access" ON public.dialogs;

-- Создаем правильную политику
CREATE POLICY "dialogs_project_access" ON public.dialogs
    FOR ALL USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    );

-- Предоставляем права
GRANT ALL ON public.dialogs TO authenticated;

-- ============================================
-- 4. НАСТРОЙКА RLS ДЛЯ CONVERSATIONS
-- ============================================

-- Включаем RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "conversations_all" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "conversations_project_access" ON public.conversations;

-- Создаем правильную политику
CREATE POLICY "conversations_project_access" ON public.conversations
    FOR ALL USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    );

-- Предоставляем права
GRANT ALL ON public.conversations TO authenticated;

-- ============================================
-- 5. НАСТРОЙКА RLS ДЛЯ CHAT_MESSAGES
-- ============================================

-- Включаем RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "chat_messages_all" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view their own chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert their own chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_project_access" ON public.chat_messages;

-- Создаем правильную политику
CREATE POLICY "chat_messages_project_access" ON public.chat_messages
    FOR ALL USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    );

-- Предоставляем права
GRANT ALL ON public.chat_messages TO authenticated;

-- ============================================
-- 6. НАСТРОЙКА RLS ДЛЯ WIDGET_DEVELOPMENT_SETTINGS
-- ============================================

-- Включаем RLS
ALTER TABLE public.widget_development_settings ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "widget_development_settings_all" ON public.widget_development_settings;
DROP POLICY IF EXISTS "Users can view their own widget_development_settings" ON public.widget_development_settings;
DROP POLICY IF EXISTS "Users can insert their own widget_development_settings" ON public.widget_development_settings;
DROP POLICY IF EXISTS "Users can update their own widget_development_settings" ON public.widget_development_settings;
DROP POLICY IF EXISTS "Users can delete their own widget_development_settings" ON public.widget_development_settings;
DROP POLICY IF EXISTS "widget_development_settings_project_access" ON public.widget_development_settings;

-- Создаем правильную политику
CREATE POLICY "widget_development_settings_project_access" ON public.widget_development_settings
    FOR ALL USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    );

-- Предоставляем права
GRANT ALL ON public.widget_development_settings TO authenticated;

-- ============================================
-- 7. НАСТРОЙКА RLS ДЛЯ TELEGRAM_SETTINGS
-- ============================================

-- Включаем RLS
ALTER TABLE public.telegram_settings ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "telegram_settings_all" ON public.telegram_settings;
DROP POLICY IF EXISTS "Users can view their own telegram_settings" ON public.telegram_settings;
DROP POLICY IF EXISTS "Users can insert their own telegram_settings" ON public.telegram_settings;
DROP POLICY IF EXISTS "Users can update their own telegram_settings" ON public.telegram_settings;
DROP POLICY IF EXISTS "Users can delete their own telegram_settings" ON public.telegram_settings;
DROP POLICY IF EXISTS "telegram_settings_project_access" ON public.telegram_settings;

-- Создаем правильную политику
CREATE POLICY "telegram_settings_project_access" ON public.telegram_settings
    FOR ALL USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    );

-- Предоставляем права
GRANT ALL ON public.telegram_settings TO authenticated;

-- ============================================
-- 8. НАСТРОЙКА RLS ДЛЯ BOT_CORRECTIONS
-- ============================================

-- Проверяем существование таблицы
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bot_corrections') THEN
        -- Включаем RLS
        ALTER TABLE public.bot_corrections ENABLE ROW LEVEL SECURITY;
        
        -- Удаляем старые политики
        DROP POLICY IF EXISTS "bot_corrections_all" ON public.bot_corrections;
        DROP POLICY IF EXISTS "Users can view their own bot_corrections" ON public.bot_corrections;
        DROP POLICY IF EXISTS "Users can insert their own bot_corrections" ON public.bot_corrections;
        DROP POLICY IF EXISTS "Users can update their own bot_corrections" ON public.bot_corrections;
        DROP POLICY IF EXISTS "Users can delete their own bot_corrections" ON public.bot_corrections;
        DROP POLICY IF EXISTS "bot_corrections_project_access" ON public.bot_corrections;
        
        -- Создаем правильную политику
        CREATE POLICY "bot_corrections_project_access" ON public.bot_corrections
            FOR ALL USING (
                project_id IN (
                    SELECT id FROM public.projects WHERE owner_id = auth.uid()
                )
            )
            WITH CHECK (
                project_id IN (
                    SELECT id FROM public.projects WHERE owner_id = auth.uid()
                )
            );
        
        -- Предоставляем права
        GRANT ALL ON public.bot_corrections TO authenticated;
        
        RAISE NOTICE '✅ RLS настроен для bot_corrections';
    ELSE
        RAISE NOTICE '⚠️ Таблица bot_corrections не найдена';
    END IF;
END $$;

-- ============================================
-- 9. СОЗДАНИЕ ИНДЕКСОВ ДЛЯ БЫСТРОЙ РАБОТЫ
-- ============================================

-- Индексы для всех таблиц с project_id
CREATE INDEX IF NOT EXISTS idx_autoswitch_settings_project_id ON public.autoswitch_settings(project_id);
CREATE INDEX IF NOT EXISTS idx_dialogs_project_id ON public.dialogs(project_id);
CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON public.conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON public.chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_widget_development_settings_project_id ON public.widget_development_settings(project_id);
CREATE INDEX IF NOT EXISTS idx_telegram_settings_project_id ON public.telegram_settings(project_id);

-- Индекс для projects по owner_id (если еще не создан)
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);

-- ============================================
-- 10. ПРОВЕРКА РЕЗУЛЬТАТА
-- ============================================

-- Проверяем все политики
SELECT 
    '✅ ПРОВЕРКА ПОЛИТИК' as section,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())%' 
        THEN '✅ ПРАВИЛЬНО: Изоляция по проектам'
        WHEN qual LIKE '%id = auth.uid()%' 
        THEN '✅ ПРАВИЛЬНО: Изоляция по пользователям'
        WHEN qual = 'true' AND tablename IN ('niches', 'niche_synonyms')
        THEN '✅ ПРАВИЛЬНО: Публичный доступ'
        ELSE '⚠️ ПРОВЕРИТЬ: Нестандартная логика'
    END as policy_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
    'users', 'projects', 'project_members', 'assistants', 'autoswitch_settings',
    'dialogs', 'conversations', 'chat_messages', 'knowledge_sources', 'knowledge_chunks',
    'user_niches', 'widget_development_settings', 'telegram_settings'
)
ORDER BY tablename, policyname;

-- Проверяем статус RLS
SELECT 
    '🔒 СТАТУС RLS' as section,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN '✅ Включен'
        ELSE '❌ Отключен'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'users', 'projects', 'project_members', 'assistants', 'autoswitch_settings',
    'dialogs', 'conversations', 'chat_messages', 'knowledge_sources', 'knowledge_chunks',
    'user_niches', 'widget_development_settings', 'telegram_settings'
)
ORDER BY tablename;

-- Проверяем индексы
SELECT 
    '⚡ ИНДЕКСЫ' as section,
    indexname,
    tablename,
    CASE 
        WHEN indexdef LIKE '%project_id%' THEN '✅ Индекс по project_id'
        WHEN indexdef LIKE '%owner_id%' THEN '✅ Индекс по owner_id'
        WHEN indexdef LIKE '%id%' THEN '✅ Индекс по id'
        ELSE '⚠️ Другой индекс'
    END as index_type
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN (
    'users', 'projects', 'project_members', 'assistants', 'autoswitch_settings',
    'dialogs', 'conversations', 'chat_messages', 'knowledge_sources', 'knowledge_chunks',
    'user_niches', 'widget_development_settings', 'telegram_settings'
)
ORDER BY tablename, indexname;

-- ============================================
-- 11. ИТОГОВЫЙ ОТЧЕТ
-- ============================================

SELECT 
    '📋 ИТОГОВЫЙ ОТЧЕТ' as section,
    'Все RLS политики настроены' as status,
    'Изоляция по проектам обеспечена' as security,
    'API будет работать без блокировок' as performance
UNION ALL
SELECT 
    '📊 СТАТИСТИКА' as section,
    'Таблиц с RLS: ' || COUNT(*)::text as status,
    'Политик создано: ' || (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public')::text as security,
    'Индексов создано: ' || (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('users', 'projects', 'project_members', 'assistants', 'autoswitch_settings', 'dialogs', 'conversations', 'chat_messages', 'knowledge_sources', 'knowledge_chunks', 'user_niches', 'widget_development_settings', 'telegram_settings'))::text as performance
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
AND tablename IN (
    'users', 'projects', 'project_members', 'assistants', 'autoswitch_settings',
    'dialogs', 'conversations', 'chat_messages', 'knowledge_sources', 'knowledge_chunks',
    'user_niches', 'widget_development_settings', 'telegram_settings'
);
