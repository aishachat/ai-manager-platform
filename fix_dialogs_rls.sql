-- ИСПРАВЛЕНИЕ RLS для таблицы dialogs
-- Выполнить в Supabase SQL Editor

-- 1. Отключаем RLS для таблицы dialogs
ALTER TABLE public.dialogs DISABLE ROW LEVEL SECURITY;

-- 2. Удаляем все политики
DROP POLICY IF EXISTS "dialogs_all" ON public.dialogs;
DROP POLICY IF EXISTS "Users can view their own dialogs" ON public.dialogs;
DROP POLICY IF EXISTS "Users can insert their own dialogs" ON public.dialogs;
DROP POLICY IF EXISTS "Users can update their own dialogs" ON public.dialogs;
DROP POLICY IF EXISTS "Users can delete their own dialogs" ON public.dialogs;
DROP POLICY IF EXISTS "dialogs_policy" ON public.dialogs;

-- 3. Предоставляем права
GRANT ALL ON public.dialogs TO authenticated;
GRANT ALL ON public.dialogs TO service_role;
GRANT ALL ON public.dialogs TO anon;

-- 4. Проверяем результат
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'dialogs';
