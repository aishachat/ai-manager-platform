-- Создание таблицы истории чата
CREATE TABLE IF NOT EXISTS public.chat_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    assistant_id UUID NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant')),
    message_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы настроек агента
CREATE TABLE IF NOT EXISTS public.ai_agent_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON public.chat_history(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_settings_user_id ON public.ai_agent_settings(user_id);

-- RLS политики для chat_history
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own chat history" ON public.chat_history;
CREATE POLICY "Users can view their own chat history" ON public.chat_history
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own chat messages" ON public.chat_history;
CREATE POLICY "Users can insert their own chat messages" ON public.chat_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own chat messages" ON public.chat_history;
CREATE POLICY "Users can update their own chat messages" ON public.chat_history
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS политики для ai_agent_settings
ALTER TABLE public.ai_agent_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own agent settings" ON public.ai_agent_settings;
CREATE POLICY "Users can view their own agent settings" ON public.ai_agent_settings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own agent settings" ON public.ai_agent_settings;
CREATE POLICY "Users can insert their own agent settings" ON public.ai_agent_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own agent settings" ON public.ai_agent_settings;
CREATE POLICY "Users can update their own agent settings" ON public.ai_agent_settings
    FOR UPDATE USING (auth.uid() = user_id);
