-- Создание таблиц projects и niches
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Создание таблицы projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Создание таблицы niches
CREATE TABLE IF NOT EXISTS public.niches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    system_context TEXT,
    specialization TEXT,
    context_tags TEXT[],
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Создание индексов для projects
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- 4. Создание индексов для niches
CREATE INDEX IF NOT EXISTS idx_niches_name ON public.niches(name);
CREATE INDEX IF NOT EXISTS idx_niches_created_at ON public.niches(created_at DESC);

-- 5. Включение RLS для projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 6. Включение RLS для niches
ALTER TABLE public.niches ENABLE ROW LEVEL SECURITY;

-- 7. Политики безопасности для projects
CREATE POLICY "Users can view their own projects" ON public.projects
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (auth.uid() = owner_id);

-- 8. Политики безопасности для niches (публичный доступ для чтения)
CREATE POLICY "Anyone can view niches" ON public.niches
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert niches" ON public.niches
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can update niches" ON public.niches
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can delete niches" ON public.niches
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- 9. Создание функций для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_niches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Создание триггеров для автоматического обновления updated_at
CREATE TRIGGER trigger_update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_projects_updated_at();

CREATE TRIGGER trigger_update_niches_updated_at
    BEFORE UPDATE ON public.niches
    FOR EACH ROW
    EXECUTE FUNCTION update_niches_updated_at();

-- 11. Вставка базовых ниш
INSERT INTO public.niches (name, description, system_context, specialization, context_tags) VALUES
('Общие вопросы', 'Общие вопросы и поддержка', 'Вы помогаете пользователям с общими вопросами и предоставляете базовую поддержку.', 'Общая поддержка', ARRAY['поддержка', 'помощь', 'вопросы']),
('E-commerce', 'Интернет-магазины и продажи', 'Вы помогаете с вопросами о товарах, заказах, доставке и оплате в интернет-магазине.', 'Продажи и маркетинг', ARRAY['товары', 'заказы', 'доставка', 'оплата']),
('Техническая поддержка', 'Техническая помощь и решение проблем', 'Вы помогаете решать технические проблемы и отвечаете на вопросы о продуктах и услугах.', 'Техническая поддержка', ARRAY['техподдержка', 'проблемы', 'решение']),
('Образование', 'Образовательные услуги и курсы', 'Вы помогаете с вопросами об образовательных программах, курсах и обучении.', 'Образование', ARRAY['курсы', 'обучение', 'образование']),
('Недвижимость', 'Продажа и аренда недвижимости', 'Вы помогаете с вопросами о недвижимости, ценах, условиях сделок.', 'Недвижимость', ARRAY['квартиры', 'дома', 'аренда', 'продажа'])
ON CONFLICT DO NOTHING;
