-- 🔧 ИСПРАВЛЕНИЕ ТАБЛИЦЫ AUTOSWITCH_SETTINGS

-- ============================================
-- ИСПРАВЛЯЕМ ПОЛИТИКИ ДЛЯ AUTOSWITCH_SETTINGS
-- ============================================

-- Удаляем старые политики
DROP POLICY IF EXISTS "Users can view their own autoswitch settings" ON autoswitch_settings;
DROP POLICY IF EXISTS "Users can update their own autoswitch settings" ON autoswitch_settings;
DROP POLICY IF EXISTS "Users can delete their own autoswitch settings" ON autoswitch_settings;

-- Создаем новые политики с правильными условиями
CREATE POLICY "Users can view their own autoswitch settings" ON autoswitch_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own autoswitch settings" ON autoswitch_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own autoswitch settings" ON autoswitch_settings
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ПРОВЕРЯЕМ РЕЗУЛЬТАТ
-- ============================================

SELECT 
    '✅ AUTOSWITCH_SETTINGS ИСПРАВЛЕН' as status,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'autoswitch_settings'
ORDER BY cmd, policyname;
