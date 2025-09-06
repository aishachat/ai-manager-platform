-- Добавление полей настроек виджета в таблицу assistant_settings
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Добавление полей настроек виджета в таблицу assistant_settings
ALTER TABLE public.assistant_settings 
ADD COLUMN IF NOT EXISTS widget_accent_color VARCHAR(7) DEFAULT '#1354FC',
ADD COLUMN IF NOT EXISTS widget_button_color VARCHAR(20) DEFAULT 'light',
ADD COLUMN IF NOT EXISTS widget_button_text VARCHAR(100) DEFAULT 'Спросить ИИ',
ADD COLUMN IF NOT EXISTS widget_button_subtext VARCHAR(100) DEFAULT 'Задать вопрос',
ADD COLUMN IF NOT EXISTS widget_avatar VARCHAR(50) DEFAULT 'default',
ADD COLUMN IF NOT EXISTS widget_custom_button_color VARCHAR(7) DEFAULT '#1354FC',
ADD COLUMN IF NOT EXISTS widget_location VARCHAR(50) DEFAULT 'default',
ADD COLUMN IF NOT EXISTS widget_desktop_bottom_offset INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS widget_desktop_right_offset INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS widget_mobile_bottom_offset INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS widget_mobile_right_offset INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS widget_z_index INTEGER DEFAULT 9999,
ADD COLUMN IF NOT EXISTS widget_welcome_messages JSONB DEFAULT '["Привет! Меня зовут Adapto, я ИИ ассистент."]',
ADD COLUMN IF NOT EXISTS widget_trigger_question VARCHAR(100) DEFAULT 'Задать вопрос',
ADD COLUMN IF NOT EXISTS widget_trigger_question_enabled VARCHAR(3) DEFAULT 'no',
ADD COLUMN IF NOT EXISTS widget_trigger_question_delay INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS widget_trigger_question_text TEXT DEFAULT 'Здравствуйте! Если появится вопрос, можете задать его в чате, я оперативно отвечу',
ADD COLUMN IF NOT EXISTS widget_trigger_quick_reply VARCHAR(100) DEFAULT 'Задать вопрос',
ADD COLUMN IF NOT EXISTS widget_follow_up_message VARCHAR(3) DEFAULT 'no',
ADD COLUMN IF NOT EXISTS widget_follow_up_delay INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS widget_follow_up_question VARCHAR(200) DEFAULT 'Продолжим диалог?',
ADD COLUMN IF NOT EXISTS widget_follow_up_quick_reply VARCHAR(100) DEFAULT 'Расскажи подробнее',
ADD COLUMN IF NOT EXISTS widget_quick_replies JSONB DEFAULT '["Расскажи подробнее"]',
ADD COLUMN IF NOT EXISTS widget_privacy_policy_url TEXT DEFAULT 'https://',
ADD COLUMN IF NOT EXISTS widget_data_tags JSONB DEFAULT '["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "roistat_visit", "gclid", "fbclid"]',
ADD COLUMN IF NOT EXISTS widget_excluded_pages JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS widget_mode VARCHAR(20) DEFAULT 'chat',
ADD COLUMN IF NOT EXISTS widget_quick_questions JSONB DEFAULT '[
    {"question": "Как работает ваш сервис?", "answer": "Наш сервис использует ИИ для автоматизации общения с клиентами."},
    {"question": "Сколько стоит?", "answer": "У нас есть несколько тарифных планов. Базовый план стоит 2990₽ в месяц."},
    {"question": "Есть ли демо?", "answer": "Да, вы можете попробовать демо-версию бесплатно в течение 14 дней."}
]',
ADD COLUMN IF NOT EXISTS widget_lead_form_enabled VARCHAR(3) DEFAULT 'yes',
ADD COLUMN IF NOT EXISTS widget_lead_form_title VARCHAR(200) DEFAULT 'Оставьте заявку',
ADD COLUMN IF NOT EXISTS widget_lead_form_description VARCHAR(500) DEFAULT 'Мы свяжемся с вами в ближайшее время',
ADD COLUMN IF NOT EXISTS widget_lead_form_fields JSONB DEFAULT '[
    {"name": "name", "label": "Имя", "type": "text", "required": true},
    {"name": "phone", "label": "Телефон", "type": "tel", "required": true},
    {"name": "email", "label": "Email", "type": "email", "required": false}
]',
ADD COLUMN IF NOT EXISTS widget_theme VARCHAR(10) DEFAULT 'light',
ADD COLUMN IF NOT EXISTS widget_size VARCHAR(10) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS widget_show_avatar BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS widget_show_typing_indicator BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS widget_auto_open_on_scroll BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS widget_auto_open_delay INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS widget_show_on_mobile BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS widget_notification_sound BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS widget_notification_title VARCHAR(100) DEFAULT 'Новое сообщение',
ADD COLUMN IF NOT EXISTS widget_track_events BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS widget_track_conversions BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS widget_logo_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS widget_logo_name VARCHAR(100) DEFAULT '',
ADD COLUMN IF NOT EXISTS widget_button_style VARCHAR(20) DEFAULT 'rectangle',
ADD COLUMN IF NOT EXISTS widget_suggestions JSONB DEFAULT '[]';

-- 2. Создание индекса для полей виджета (опционально)
CREATE INDEX IF NOT EXISTS idx_assistant_settings_widget_mode ON public.assistant_settings(widget_mode);

-- 3. Обновление существующих записей значениями по умолчанию
UPDATE public.assistant_settings 
SET 
    widget_accent_color = '#1354FC',
    widget_button_color = 'light',
    widget_button_text = 'Спросить ИИ',
    widget_button_subtext = 'Задать вопрос',
    widget_avatar = 'default',
    widget_custom_button_color = '#1354FC',
    widget_location = 'default',
    widget_desktop_bottom_offset = 20,
    widget_desktop_right_offset = 20,
    widget_mobile_bottom_offset = 20,
    widget_mobile_right_offset = 20,
    widget_z_index = 9999,
    widget_welcome_messages = '["Привет! Меня зовут Adapto, я ИИ ассистент."]',
    widget_trigger_question = 'Задать вопрос',
    widget_trigger_question_enabled = 'no',
    widget_trigger_question_delay = 5,
    widget_trigger_question_text = 'Здравствуйте! Если появится вопрос, можете задать его в чате, я оперативно отвечу',
    widget_trigger_quick_reply = 'Задать вопрос',
    widget_follow_up_message = 'no',
    widget_follow_up_delay = 10,
    widget_follow_up_question = 'Продолжим диалог?',
    widget_follow_up_quick_reply = 'Расскажи подробнее',
    widget_quick_replies = '["Расскажи подробнее"]',
    widget_privacy_policy_url = 'https://',
    widget_data_tags = '["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "roistat_visit", "gclid", "fbclid"]',
    widget_excluded_pages = '[]',
    widget_mode = 'chat',
    widget_quick_questions = '[
        {"question": "Как работает ваш сервис?", "answer": "Наш сервис использует ИИ для автоматизации общения с клиентами."},
        {"question": "Сколько стоит?", "answer": "У нас есть несколько тарифных планов. Базовый план стоит 2990₽ в месяц."},
        {"question": "Есть ли демо?", "answer": "Да, вы можете попробовать демо-версию бесплатно в течение 14 дней."}
    ]',
    widget_lead_form_enabled = 'yes',
    widget_lead_form_title = 'Оставьте заявку',
    widget_lead_form_description = 'Мы свяжемся с вами в ближайшее время',
    widget_lead_form_fields = '[
        {"name": "name", "label": "Имя", "type": "text", "required": true},
        {"name": "phone", "label": "Телефон", "type": "tel", "required": true},
        {"name": "email", "label": "Email", "type": "email", "required": false}
    ]',
    widget_theme = 'light',
    widget_size = 'medium',
    widget_show_avatar = true,
    widget_show_typing_indicator = true,
    widget_auto_open_on_scroll = false,
    widget_auto_open_delay = 0,
    widget_show_on_mobile = true,
    widget_notification_sound = true,
    widget_notification_title = 'Новое сообщение',
    widget_track_events = true,
    widget_track_conversions = true,
    widget_logo_url = '',
    widget_logo_name = '',
    widget_button_style = 'rectangle',
    widget_suggestions = '[]'
WHERE widget_accent_color IS NULL;

-- 4. Проверка результата
SELECT 
    'assistant_settings' as table_name,
    COUNT(*) as total_records,
    COUNT(widget_accent_color) as records_with_widget_settings
FROM public.assistant_settings;

-- 5. Показать структуру обновленной таблицы
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'assistant_settings'
AND column_name LIKE 'widget_%'
ORDER BY column_name;

