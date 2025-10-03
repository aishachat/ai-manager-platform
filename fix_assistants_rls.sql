-- Исправление RLS политик для таблицы assistants
-- Выполнить в Supabase SQL Editor

-- 1. Включаем RLS для таблицы assistants
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;

-- 2. Удаляем существующие политики (если есть)
DROP POLICY IF EXISTS "assistants_all" ON public.assistants;
DROP POLICY IF EXISTS "Users can view their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can insert their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can update their own assistants" ON public.assistants;
DROP POLICY IF EXISTS "Users can delete their own assistants" ON public.assistants;

-- 3. Создаем политику для SELECT (чтение)
CREATE POLICY "Users can view their own assistants" ON public.assistants
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- 4. Создаем политику для INSERT (вставка)
CREATE POLICY "Users can insert their own assistants" ON public.assistants
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 5. Создаем политику для UPDATE (обновление)
CREATE POLICY "Users can update their own assistants" ON public.assistants
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 6. Создаем политику для DELETE (удаление)
CREATE POLICY "Users can delete their own assistants" ON public.assistants
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- 7. Предоставляем права на таблицу
GRANT ALL ON public.assistants TO authenticated;
GRANT ALL ON public.assistants TO service_role;

-- 8. Проверяем созданные политики
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'assistants';
