-- 🔒 Исправление RLS с учетом архитектуры проектов
-- У нас user -> project -> все остальные таблицы

-- ============================================
-- 1. ИСПРАВЛЯЕМ INSERT ПОЛИТИКИ С ПРАВИЛЬНОЙ АРХИТЕКТУРОЙ
-- ============================================

-- assistants - используем project_id через связь с пользователем
DROP POLICY IF EXISTS "Users can insert their own assistants" ON assistants;
CREATE POLICY "Users can insert their own assistants" ON assistants
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = assistants.project_id
        )
    );

-- autoswitch_settings - используем project_id
DROP POLICY IF EXISTS "Users can insert their own autoswitch settings" ON autoswitch_settings;
CREATE POLICY "Users can insert their own autoswitch settings" ON autoswitch_settings
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = autoswitch_settings.project_id
        )
    );

-- chat_messages - используем project_id
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON chat_messages;
CREATE POLICY "Users can insert their own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = chat_messages.project_id
        )
    );

-- conversations - используем project_id
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
CREATE POLICY "Users can insert their own conversations" ON conversations
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = conversations.project_id
        )
    );

-- dialogs - используем project_id
DROP POLICY IF EXISTS "Users can insert their own dialogs" ON dialogs;
CREATE POLICY "Users can insert their own dialogs" ON dialogs
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = dialogs.project_id
        )
    );

-- knowledge_chunks - используем project_id
DROP POLICY IF EXISTS "Users can insert their own knowledge chunks" ON knowledge_chunks;
CREATE POLICY "Users can insert their own knowledge chunks" ON knowledge_chunks
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = knowledge_chunks.project_id
        )
    );

-- knowledge_sources - используем project_id
DROP POLICY IF EXISTS "Users can insert their own knowledge sources" ON knowledge_sources;
CREATE POLICY "Users can insert their own knowledge sources" ON knowledge_sources
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = knowledge_sources.project_id
        )
    );

-- niches - публичная таблица, только аутентифицированные пользователи
DROP POLICY IF EXISTS "Only authenticated users can insert niches" ON niches;
CREATE POLICY "Only authenticated users can insert niches" ON niches
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- project_members - используем project_id
DROP POLICY IF EXISTS "project_members_insert" ON project_members;
CREATE POLICY "project_members_insert" ON project_members
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = project_members.project_id
        )
    );

-- projects - пользователь может создавать проекты только для себя
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = projects.id
        )
    );

DROP POLICY IF EXISTS "projects_insert" ON projects;
CREATE POLICY "projects_insert" ON projects
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = projects.id
        )
    );

-- telegram_settings - используем project_id
DROP POLICY IF EXISTS "Users can insert their own telegram settings" ON telegram_settings;
CREATE POLICY "Users can insert their own telegram settings" ON telegram_settings
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = telegram_settings.project_id
        )
    );

-- user_niches - используем project_id
DROP POLICY IF EXISTS "Users can insert their own user niches" ON user_niches;
CREATE POLICY "Users can insert their own user niches" ON user_niches
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = user_niches.project_id
        )
    );

-- users - пользователь может создавать записи только для себя
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "users_insert" ON users;
CREATE POLICY "users_insert" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- widget_development_settings - используем project_id
DROP POLICY IF EXISTS "Users can insert their own widget settings" ON widget_development_settings;
CREATE POLICY "Users can insert their own widget settings" ON widget_development_settings
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = widget_development_settings.project_id
        )
    );

-- ============================================
-- 2. ИСПРАВЛЯЕМ SELECT ПОЛИТИКИ
-- ============================================

-- niche_synonyms - публичные данные, только аутентифицированные
DROP POLICY IF EXISTS "niche_synonyms_select_all" ON niche_synonyms;
CREATE POLICY "niche_synonyms_select_all" ON niche_synonyms
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- niches - публичные данные, только аутентифицированные
DROP POLICY IF EXISTS "Anyone can view niches" ON niches;
CREATE POLICY "Anyone can view niches" ON niches
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "niches_select_all" ON niches;
CREATE POLICY "niches_select_all" ON niches
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- stories - публичные данные с фильтром активности
DROP POLICY IF EXISTS "stories_select_all" ON stories;
CREATE POLICY "stories_select_all" ON stories
    FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

-- ============================================
-- 3. ИСПРАВЛЯЕМ SELECT ПОЛИТИКИ ДЛЯ ПРОЕКТНЫХ ТАБЛИЦ
-- ============================================

-- assistants - доступ только к своим проектам
DROP POLICY IF EXISTS "Users can view their own assistants" ON assistants;
CREATE POLICY "Users can view their own assistants" ON assistants
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = assistants.project_id
        )
    );

-- dialogs - доступ только к своим проектам
DROP POLICY IF EXISTS "Users can view their own dialogs" ON dialogs;
CREATE POLICY "Users can view their own dialogs" ON dialogs
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = dialogs.project_id
        )
    );

-- chat_messages - доступ только к своим проектам
DROP POLICY IF EXISTS "Users can view their own chat messages" ON chat_messages;
CREATE POLICY "Users can view their own chat messages" ON chat_messages
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = chat_messages.project_id
        )
    );

-- knowledge_sources - доступ только к своим проектам
DROP POLICY IF EXISTS "Users can view their own knowledge sources" ON knowledge_sources;
CREATE POLICY "Users can view their own knowledge sources" ON knowledge_sources
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = knowledge_sources.project_id
        )
    );

-- knowledge_chunks - доступ только к своим проектам
DROP POLICY IF EXISTS "Users can view their own knowledge chunks" ON knowledge_chunks;
CREATE POLICY "Users can view their own knowledge chunks" ON knowledge_chunks
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = knowledge_chunks.project_id
        )
    );

-- conversations - доступ только к своим проектам
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT u.id::text 
            FROM users u 
            WHERE u.project_id = conversations.project_id
        )
    );

-- users - доступ только к своему профилю
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- ============================================
-- 4. ПРОВЕРЯЕМ РЕЗУЛЬТАТ
-- ============================================

-- Проверяем, сколько политик осталось без условий
SELECT 
    '✅ РЕЗУЛЬТАТ ИСПРАВЛЕНИЙ С ПРОЕКТНОЙ АРХИТЕКТУРОЙ' as section,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE qual IS NULL) as null_condition_policies,
    COUNT(*) FILTER (WHERE qual = 'true') as true_condition_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%') as auth_uid_policies,
    COUNT(*) FILTER (WHERE qual LIKE '%project_id%') as project_id_policies,
    ROUND(
        COUNT(*) FILTER (WHERE qual LIKE '%auth.uid()%' OR qual LIKE '%project_id%') * 100.0 / COUNT(*), 
        2
    ) as secure_policies_percent
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================
-- 5. ФИНАЛЬНАЯ ПРОВЕРКА БЕЗОПАСНОСТИ
-- ============================================

-- Ищем оставшиеся проблемные политики
SELECT 
    '🚨 ОСТАВШИЕСЯ ПРОБЛЕМЫ' as section,
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NULL THEN 'Политика без условий WHERE'
        WHEN qual = 'true' THEN 'Политика разрешает все (true)'
        WHEN qual NOT LIKE '%auth.uid()%' AND qual NOT LIKE '%project_id%' THEN 'Политика без фильтрации по проекту/пользователю'
        ELSE 'Другая потенциальная проблема'
    END as vulnerability_type
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    qual IS NULL 
    OR qual = 'true'
    OR (qual NOT LIKE '%auth.uid()%' AND qual NOT LIKE '%project_id%' AND qual NOT LIKE '%auth.role()%')
)
ORDER BY tablename, policyname;
