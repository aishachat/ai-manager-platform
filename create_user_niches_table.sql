-- Создание таблицы для связи пользователей с нишами
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Создание таблицы user_niches
CREATE TABLE IF NOT EXISTS public.user_niches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    niche_id UUID REFERENCES public.niches(id) ON DELETE CASCADE,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, project_id),
    UNIQUE(project_id, niche_id)
);

-- 2. Создание индексов для производительности
CREATE INDEX IF NOT EXISTS idx_user_niches_user_id ON public.user_niches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_niches_project_id ON public.user_niches(project_id);
CREATE INDEX IF NOT EXISTS idx_user_niches_niche_id ON public.user_niches(niche_id);
CREATE INDEX IF NOT EXISTS idx_user_niches_created_at ON public.user_niches(created_at DESC);

-- 3. Включение RLS (Row Level Security)
ALTER TABLE public.user_niches ENABLE ROW LEVEL SECURITY;

-- 4. Создание политик безопасности
CREATE POLICY "Users can view their own user niches" ON public.user_niches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user niches" ON public.user_niches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user niches" ON public.user_niches
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user niches" ON public.user_niches
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_user_niches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Создание триггера для автоматического обновления updated_at
CREATE TRIGGER trigger_update_user_niches_updated_at
    BEFORE UPDATE ON public.user_niches
    FOR EACH ROW
    EXECUTE FUNCTION update_user_niches_updated_at();
