-- БЫСТРОЕ ИСПРАВЛЕНИЕ RLS для таблицы assistants
-- Выполнить в Supabase SQL Editor

-- 1. Включаем RLS
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;

-- 2. Удаляем все существующие политики
DROP POLICY IF EXISTS "assistants_all" ON public.assistants;
DROP POLICY IF EXISTS "Users can view their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can insert their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can update their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can delete their own assistants" ON public.assistants;

-- 3. Создаем простую политику для всех операций
CREATE POLICY "assistants_policy" ON public.assistants
    FOR ALL USING (true) WITH CHECK (true);

-- 4. Предоставляем права
GRANT ALL ON public.assistants TO authenticated;
GRANT ALL ON public.assistants TO service_role;

-- 5. Проверяем результат
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'assistants';
