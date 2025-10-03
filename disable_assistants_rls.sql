-- ОТКЛЮЧЕНИЕ RLS для таблицы assistants
-- Выполнить в Supabase SQL Editor

-- 1. Отключаем RLS для таблицы assistants
ALTER TABLE public.assistants DISABLE ROW LEVEL SECURITY;

-- 2. Удаляем все политики
DROP POLICY IF EXISTS "assistants_all" ON public.assistants;
DROP POLICY IF EXISTS "Users can view their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can insert their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can update their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can delete their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "assistants_policy" ON public.assistants;

-- 3. Предоставляем права
GRANT ALL ON public.assistants TO authenticated;
GRANT ALL ON public.assistants TO service_role;
GRANT ALL ON public.assistants TO anon;

-- 4. Проверяем результат
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'assistants';
