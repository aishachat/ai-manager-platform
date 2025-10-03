-- 🔧 ИСПРАВЛЕНИЕ ТАБЛИЦЫ ASSISTANTS

-- ============================================
-- ИСПРАВЛЯЕМ ПОЛИТИКИ ДЛЯ ASSISTANTS
-- ============================================

-- Удаляем старые политики
DROP POLICY IF EXISTS "Users can view their own assistants" ON assistants;
DROP POLICY IF EXISTS "Users can update their own assistants" ON assistants;
DROP POLICY IF EXISTS "Users can delete their own assistants" ON assistants;

-- Создаем новые политики с правильными условиями
CREATE POLICY "Users can view their own assistants" ON assistants
    FOR SELECT USING (project_id = get_user_project_id());

CREATE POLICY "Users can update their own assistants" ON assistants
    FOR UPDATE USING (project_id = get_user_project_id());

CREATE POLICY "Users can delete their own assistants" ON assistants
    FOR DELETE USING (project_id = get_user_project_id());

-- ============================================
-- ПРОВЕРЯЕМ РЕЗУЛЬТАТ
-- ============================================

SELECT 
    '✅ ASSISTANTS ИСПРАВЛЕН' as status,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'assistants'
ORDER BY cmd, policyname;
