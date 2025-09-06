-- Отключаем RLS на всех таблицах для тестирования
ALTER TABLE public.chat_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_corrections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Удаляем все политики
DROP POLICY IF EXISTS "Users can view their own chat history" ON public.chat_history;
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON public.chat_history;
DROP POLICY IF EXISTS "Users can update their own chat messages" ON public.chat_history;

DROP POLICY IF EXISTS "Users can view their own agent settings" ON public.ai_agent_settings;
DROP POLICY IF EXISTS "Users can insert their own agent settings" ON public.ai_agent_settings;
DROP POLICY IF EXISTS "Users can update their own agent settings" ON public.ai_agent_settings;

-- Проверяем, что таблицы существуют
SELECT 'chat_history' as table_name, COUNT(*) as row_count FROM public.chat_history
UNION ALL
SELECT 'ai_agent_settings' as table_name, COUNT(*) as row_count FROM public.ai_agent_settings
UNION ALL
SELECT 'knowledge_base' as table_name, COUNT(*) as row_count FROM public.knowledge_base
UNION ALL
SELECT 'bot_corrections' as table_name, COUNT(*) as row_count FROM public.bot_corrections
UNION ALL
SELECT 'users' as table_name, COUNT(*) as row_count FROM public.users;
