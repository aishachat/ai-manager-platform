-- Создание таблицы для настроек виджета
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Создание таблицы widget_settings
CREATE TABLE IF NOT EXISTS public.widget_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assistant_id UUID REFERENCES public.assistants(id) ON DELETE CASCADE,
    
    -- Основные настройки виджета
    accent_color VARCHAR(7) DEFAULT '#1354FC',
    button_color VARCHAR(20) DEFAULT 'light',
    button_text VARCHAR(100) DEFAULT 'Спросить ИИ',
    button_subtext VARCHAR(100) DEFAULT 'Задать вопрос',
    avatar VARCHAR(50) DEFAULT 'default',
    custom_button_color VARCHAR(7) DEFAULT '#1354FC',
    widget_location VARCHAR(50) DEFAULT 'default',
    
    -- Позиционирование
    desktop_bottom_offset INTEGER DEFAULT 20,
    desktop_right_offset INTEGER DEFAULT 20,
    mobile_bottom_offset INTEGER DEFAULT 20,
    mobile_right_offset INTEGER DEFAULT 20,
    z_index INTEGER DEFAULT 9999,
    
    -- Приветственные сообщения
    welcome_messages JSONB DEFAULT '["Привет! Меня зовут Adapto, я ИИ ассистент."]',
    
    -- Триггерные вопросы
    trigger_question VARCHAR(100) DEFAULT 'Задать вопрос',
    trigger_question_enabled VARCHAR(3) DEFAULT 'no',
    trigger_question_delay INTEGER DEFAULT 5,
    trigger_question_text TEXT DEFAULT 'Здравствуйте! Если появится вопрос, можете задать его в чате, я оперативно отвечу',
    trigger_quick_reply VARCHAR(100) DEFAULT 'Задать вопрос',
    
    -- Догоняющие сообщения
    follow_up_message VARCHAR(3) DEFAULT 'no',
    follow_up_delay INTEGER DEFAULT 10,
    follow_up_question VARCHAR(200) DEFAULT 'Продолжим диалог?',
    follow_up_quick_reply VARCHAR(100) DEFAULT 'Расскажи подробнее',
    
    -- Быстрые ответы
    quick_replies JSONB DEFAULT '["Расскажи подробнее"]',
    
    -- Политика конфиденциальности
    privacy_policy_url TEXT DEFAULT 'https://',
    
    -- Теги данных
    data_tags JSONB DEFAULT '["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "roistat_visit", "gclid", "fbclid"]',
    
    -- Исключенные страницы
    excluded_pages JSONB DEFAULT '[]',
    
    -- Режим работы виджета
    widget_mode VARCHAR(20) DEFAULT 'chat', -- 'chat' или 'questions'
    
    -- Быстрые вопросы
    quick_questions JSONB DEFAULT '[
        {"question": "Как работает ваш сервис?", "answer": "Наш сервис использует ИИ для автоматизации общения с клиентами."},
        {"question": "Сколько стоит?", "answer": "У нас есть несколько тарифных планов. Базовый план стоит 2990₽ в месяц."},
        {"question": "Есть ли демо?", "answer": "Да, вы можете попробовать демо-версию бесплатно в течение 14 дней."}
    ]',
    
    -- Настройки формы заявки
    lead_form_enabled VARCHAR(3) DEFAULT 'yes',
    lead_form_title VARCHAR(200) DEFAULT 'Оставьте заявку',
    lead_form_description VARCHAR(500) DEFAULT 'Мы свяжемся с вами в ближайшее время',
    lead_form_fields JSONB DEFAULT '[
        {"name": "name", "label": "Имя", "type": "text", "required": true},
        {"name": "phone", "label": "Телефон", "type": "tel", "required": true},
        {"name": "email", "label": "Email", "type": "email", "required": false}
    ]',
    
    -- Настройки внешнего вида
    widget_theme VARCHAR(10) DEFAULT 'light', -- 'light' или 'dark'
    widget_size VARCHAR(10) DEFAULT 'medium', -- 'small', 'medium', 'large'
    show_avatar BOOLEAN DEFAULT true,
    show_typing_indicator BOOLEAN DEFAULT true,
    
    -- Настройки поведения
    auto_open_on_scroll BOOLEAN DEFAULT false,
    auto_open_delay INTEGER DEFAULT 0,
    show_on_mobile BOOLEAN DEFAULT true,
    
    -- Настройки уведомлений
    notification_sound BOOLEAN DEFAULT true,
    notification_title VARCHAR(100) DEFAULT 'Новое сообщение',
    
    -- Настройки аналитики
    track_events BOOLEAN DEFAULT true,
    track_conversions BOOLEAN DEFAULT true,
    
    -- Логотип
    logo_url TEXT DEFAULT '',
    logo_name VARCHAR(100) DEFAULT '',
    
    -- Дополнительные поля из кода
    button_style VARCHAR(20) DEFAULT 'rectangle', -- 'rectangle' или 'ellipse'
    suggestions JSONB DEFAULT '[]', -- массив предложений
    trigger_question_enabled VARCHAR(3) DEFAULT 'no', -- 'yes' или 'no'
    trigger_question_delay INTEGER DEFAULT 5,
    trigger_question_text TEXT DEFAULT 'Здравствуйте! Если появится вопрос, можете задать его в чате, я оперативно отвечу',
    trigger_quick_reply VARCHAR(100) DEFAULT 'Задать вопрос',
    follow_up_message VARCHAR(3) DEFAULT 'no', -- 'yes' или 'no'
    follow_up_delay INTEGER DEFAULT 10,
    follow_up_question VARCHAR(200) DEFAULT 'Продолжим диалог?',
    follow_up_quick_reply VARCHAR(100) DEFAULT 'Расскажи подробнее',
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, assistant_id)
);

-- 2. Создание индексов для производительности
CREATE INDEX IF NOT EXISTS idx_widget_settings_user_id ON public.widget_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_settings_assistant_id ON public.widget_settings(assistant_id);
CREATE INDEX IF NOT EXISTS idx_widget_settings_created_at ON public.widget_settings(created_at DESC);

-- 3. Включение RLS (Row Level Security)
ALTER TABLE public.widget_settings ENABLE ROW LEVEL SECURITY;

-- 4. Создание политик безопасности
CREATE POLICY "Users can view their own widget settings" ON public.widget_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own widget settings" ON public.widget_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widget settings" ON public.widget_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widget settings" ON public.widget_settings
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_widget_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Создание триггера для автоматического обновления updated_at
CREATE TRIGGER trigger_update_widget_settings_updated_at
    BEFORE UPDATE ON public.widget_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_widget_settings_updated_at();

-- 7. Вставка тестовых данных (опционально)
INSERT INTO public.widget_settings (user_id, assistant_id, button_text, button_subtext)
SELECT 
    auth.uid(),
    (SELECT id FROM public.assistants LIMIT 1),
    'Тестовый виджет',
    'Нажмите для начала диалога'
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, assistant_id) DO NOTHING;
