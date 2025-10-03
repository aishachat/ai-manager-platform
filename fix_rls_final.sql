-- Финальное исправление RLS политик
-- Выполните этот скрипт в Supabase SQL Editor

-- ============================================
-- 1. ВРЕМЕННО ОТКЛЮЧАЕМ RLS ДЛЯ ТЕСТИРОВАНИЯ
-- ============================================

-- Отключаем RLS для всех таблиц временно
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_niches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_development_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dialogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_sources DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. СОЗДАЕМ ПОЛЬЗОВАТЕЛЯ В PUBLIC.USERS
-- ============================================

-- Создаем пользователя в public.users если его нет
INSERT INTO public.users (
    id,
    email,
    name,
    created_at,
    updated_at
) VALUES (
    'f364b29d-c7a3-43f0-9fa2-df8aa693762e',
    'te99999st3@example.com',
    'Тестовый Пользователь',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();

-- ============================================
-- 3. ВКЛЮЧАЕМ RLS С ПРОСТЫМИ ПОЛИТИКАМИ
-- ============================================

-- Включаем RLS для таблицы users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Удаляем все старые политики
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own data" ON public.users;

-- Создаем простые политики
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own data" ON public.users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- ============================================
-- 4. ПОЛИТИКИ ДЛЯ ДРУГИХ ТАБЛИЦ
-- ============================================

-- user_niches
ALTER TABLE user_niches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own user niches" ON user_niches;
DROP POLICY IF EXISTS "Users can insert their own user niches" ON user_niches;
DROP POLICY IF EXISTS "Users can update their own user niches" ON user_niches;
DROP POLICY IF EXISTS "Users can delete their own user niches" ON user_niches;

CREATE POLICY "Users can view their own user niches" ON user_niches
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own user niches" ON user_niches
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own user niches" ON user_niches
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own user niches" ON user_niches
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- widget_development_settings
ALTER TABLE widget_development_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own widget settings" ON widget_development_settings;
DROP POLICY IF EXISTS "Users can insert their own widget settings" ON widget_development_settings;
DROP POLICY IF EXISTS "Users can update their own widget settings" ON widget_development_settings;
DROP POLICY IF EXISTS "Users can delete their own widget settings" ON widget_development_settings;

CREATE POLICY "Users can view their own widget settings" ON widget_development_settings
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own widget settings" ON widget_development_settings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own widget settings" ON widget_development_settings
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own widget settings" ON widget_development_settings
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- telegram_settings
ALTER TABLE telegram_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own telegram settings" ON telegram_settings;
DROP POLICY IF EXISTS "Users can insert their own telegram settings" ON telegram_settings;
DROP POLICY IF EXISTS "Users can update their own telegram settings" ON telegram_settings;
DROP POLICY IF EXISTS "Users can delete their own telegram settings" ON telegram_settings;

CREATE POLICY "Users can view their own telegram settings" ON telegram_settings
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own telegram settings" ON telegram_settings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own telegram settings" ON telegram_settings
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own telegram settings" ON telegram_settings
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- dialogs
ALTER TABLE dialogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own dialogs" ON dialogs;
DROP POLICY IF EXISTS "Users can insert their own dialogs" ON dialogs;
DROP POLICY IF EXISTS "Users can update their own dialogs" ON dialogs;
DROP POLICY IF EXISTS "Users can delete their own dialogs" ON dialogs;

CREATE POLICY "Users can view their own dialogs" ON dialogs
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own dialogs" ON dialogs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own dialogs" ON dialogs
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own dialogs" ON dialogs
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- knowledge_sources
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own knowledge sources" ON knowledge_sources;
DROP POLICY IF EXISTS "Users can insert their own knowledge sources" ON knowledge_sources;
DROP POLICY IF EXISTS "Users can update their own knowledge sources" ON knowledge_sources;
DROP POLICY IF EXISTS "Users can delete their own knowledge sources" ON knowledge_sources;

CREATE POLICY "Users can view their own knowledge sources" ON knowledge_sources
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own knowledge sources" ON knowledge_sources
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own knowledge sources" ON knowledge_sources
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own knowledge sources" ON knowledge_sources
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- knowledge_chunks
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own knowledge chunks" ON knowledge_chunks;
DROP POLICY IF EXISTS "Users can insert their own knowledge chunks" ON knowledge_chunks;
DROP POLICY IF EXISTS "Users can update their own knowledge chunks" ON knowledge_chunks;
DROP POLICY IF EXISTS "Users can delete their own knowledge chunks" ON knowledge_chunks;

CREATE POLICY "Users can view their own knowledge chunks" ON knowledge_chunks
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own knowledge chunks" ON knowledge_chunks
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own knowledge chunks" ON knowledge_chunks
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own knowledge chunks" ON knowledge_chunks
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- assistants
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own assistants" ON assistants;
DROP POLICY IF EXISTS "Users can insert their own assistants" ON assistants;
DROP POLICY IF EXISTS "Users can update their own assistants" ON assistants;
DROP POLICY IF EXISTS "Users can delete their own assistants" ON assistants;

CREATE POLICY "Users can view their own assistants" ON assistants
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own assistants" ON assistants
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own assistants" ON assistants
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own assistants" ON assistants
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their own chat messages" ON chat_messages;

CREATE POLICY "Users can view their own chat messages" ON chat_messages
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own chat messages" ON chat_messages
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own chat messages" ON chat_messages
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;

CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own conversations" ON conversations
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own conversations" ON conversations
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- ============================================
-- 5. ПРОВЕРКА РЕЗУЛЬТАТА
-- ============================================

-- Проверяем, что пользователь существует
SELECT 
    'Проверка пользователя' as test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE id = 'f364b29d-c7a3-43f0-9fa2-df8aa693762e')
        THEN '✅ Пользователь существует'
        ELSE '❌ Пользователь не найден'
    END as result;

-- Выводим сообщение об успешном выполнении
SELECT '✅ RLS политики исправлены!' as status;
