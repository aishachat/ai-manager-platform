-- Обновление структуры базы данных для мастера настройки ИИ-агента
-- Выполните эти команды в Supabase SQL Editor

-- 1. Создание таблицы для настроек ИИ-агента
CREATE TABLE IF NOT EXISTS ai_agent_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE,
    
    -- Шаг 1: Цели Adapto
    task VARCHAR(50) CHECK (task IN ('Продавать', 'Консультировать')),
    main_goal VARCHAR(100),
    main_goal_custom TEXT,
    sales_cycle TEXT,
    target_audience TEXT,
    
    -- Шаг 2: Правила общения
    addressing VARCHAR(10) CHECK (addressing IN ('Ты', 'Вы')) DEFAULT 'Вы',
    communication_style VARCHAR(50) CHECK (communication_style IN ('Дружелюбный', 'Нейтральный', 'Профессиональный', 'Юмористический')) DEFAULT 'Профессиональный',
    restrictions JSONB DEFAULT '[]',
    restrictions_custom TEXT,
    additional_settings JSONB DEFAULT '[]',
    additional_settings_custom TEXT,
    data_collection JSONB DEFAULT '[]',
    data_collection_custom TEXT,
    clarification_rules JSONB DEFAULT '[]',
    clarification_rules_custom TEXT,
    emoji_usage VARCHAR(20) CHECK (emoji_usage IN ('Никогда', 'Редко', 'Часто')) DEFAULT 'Редко',
    
    -- Шаг 3: Этапы диалога
    dialog_stages JSONB DEFAULT '[]',
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, assistant_id)
);

-- 2. Создание индексов для производительности
CREATE INDEX IF NOT EXISTS idx_ai_agent_settings_user_id ON ai_agent_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_settings_assistant_id ON ai_agent_settings(assistant_id);

-- 3. Обновление таблицы assistants (добавление новых полей)
ALTER TABLE assistants 
ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS setup_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS setup_data JSONB DEFAULT '{}';

-- 4. Создание таблицы для ограничений (если нужна отдельная таблица)
CREATE TABLE IF NOT EXISTS agent_restrictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_setting_id UUID REFERENCES ai_agent_settings(id) ON DELETE CASCADE,
    restriction_type VARCHAR(100),
    restriction_text TEXT,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Создание таблицы для дополнительных настроек
CREATE TABLE IF NOT EXISTS agent_additional_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_setting_id UUID REFERENCES ai_agent_settings(id) ON DELETE CASCADE,
    setting_type VARCHAR(100),
    setting_text TEXT,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Создание таблицы для правил уточнения
CREATE TABLE IF NOT EXISTS agent_clarification_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_setting_id UUID REFERENCES ai_agent_settings(id) ON DELETE CASCADE,
    rule_type VARCHAR(100),
    rule_text TEXT,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Создание таблицы для сбора данных
CREATE TABLE IF NOT EXISTS agent_data_collection (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_setting_id UUID REFERENCES ai_agent_settings(id) ON DELETE CASCADE,
    data_type VARCHAR(100),
    data_name VARCHAR(100),
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Создание RLS политик
ALTER TABLE ai_agent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_additional_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_clarification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_data_collection ENABLE ROW LEVEL SECURITY;

-- Политики для ai_agent_settings
CREATE POLICY "Users can view their own agent settings" ON ai_agent_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent settings" ON ai_agent_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent settings" ON ai_agent_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent settings" ON ai_agent_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Политики для связанных таблиц
CREATE POLICY "Users can view their agent restrictions" ON agent_restrictions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ai_agent_settings 
            WHERE ai_agent_settings.id = agent_restrictions.agent_setting_id 
            AND ai_agent_settings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their agent restrictions" ON agent_restrictions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_agent_settings 
            WHERE ai_agent_settings.id = agent_restrictions.agent_setting_id 
            AND ai_agent_settings.user_id = auth.uid()
        )
    );

-- Аналогичные политики для других таблиц
CREATE POLICY "Users can view their agent additional settings" ON agent_additional_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ai_agent_settings 
            WHERE ai_agent_settings.id = agent_additional_settings.agent_setting_id 
            AND ai_agent_settings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their agent additional settings" ON agent_additional_settings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_agent_settings 
            WHERE ai_agent_settings.id = agent_additional_settings.agent_setting_id 
            AND ai_agent_settings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their agent clarification rules" ON agent_clarification_rules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ai_agent_settings 
            WHERE ai_agent_settings.id = agent_clarification_rules.agent_setting_id 
            AND ai_agent_settings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their agent clarification rules" ON agent_clarification_rules
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_agent_settings 
            WHERE ai_agent_settings.id = agent_clarification_rules.agent_setting_id 
            AND ai_agent_settings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their agent data collection" ON agent_data_collection
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ai_agent_settings 
            WHERE ai_agent_settings.id = agent_data_collection.agent_setting_id 
            AND ai_agent_settings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their agent data collection" ON agent_data_collection
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_agent_settings 
            WHERE ai_agent_settings.id = agent_data_collection.agent_setting_id 
            AND ai_agent_settings.user_id = auth.uid()
        )
    );

-- 9. Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Создание триггера для автоматического обновления updated_at
CREATE TRIGGER update_ai_agent_settings_updated_at 
    BEFORE UPDATE ON ai_agent_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 11. Создание представления для удобного получения всех настроек
CREATE OR REPLACE VIEW agent_settings_view AS
SELECT 
    aas.*,
    u.email as user_email,
    ass.name as assistant_name
FROM ai_agent_settings aas
JOIN auth.users u ON aas.user_id = u.id
LEFT JOIN assistants ass ON aas.assistant_id = ass.id;

-- 12. Создание функции для инициализации настроек по умолчанию
CREATE OR REPLACE FUNCTION initialize_agent_settings(
    p_user_id UUID,
    p_assistant_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_setting_id UUID;
BEGIN
    INSERT INTO ai_agent_settings (
        user_id,
        assistant_id,
        task,
        main_goal,
        addressing,
        communication_style,
        emoji_usage,
        dialog_stages
    ) VALUES (
        p_user_id,
        p_assistant_id,
        'Продавать',
        'Продать продукт',
        'Вы',
        'Профессиональный',
        'Редко',
        '[
            "Поздоровайся и спроси имя клиента. Уточни его проблему и пойми текущую ситуацию пользователя",
            "Опиши коротко как решишь его задачу/назови наши преимущества, предложи товары по запросу",
            "Веди клиента к оформлению заказа/заявки",
            "Когда клиент готов оформить заказ, сделай итог заказа и пришли ссылку на оплату из базы знаний.",
            "Переведи клиента на менеджера для проверки оплаты и дальнейшей работы"
        ]'::jsonb
    ) RETURNING id INTO v_setting_id;
    
    RETURN v_setting_id;
END;
$$ LANGUAGE plpgsql;

-- Комментарии к таблицам
COMMENT ON TABLE ai_agent_settings IS 'Основные настройки ИИ-агента';
COMMENT ON TABLE agent_restrictions IS 'Ограничения для ИИ-агента';
COMMENT ON TABLE agent_additional_settings IS 'Дополнительные настройки стиля общения';
COMMENT ON TABLE agent_clarification_rules IS 'Правила уточнения и вопросов';
COMMENT ON TABLE agent_data_collection IS 'Настройки сбора данных';

-- Проверка создания таблиц
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('ai_agent_settings', 'agent_restrictions', 'agent_additional_settings', 'agent_clarification_rules', 'agent_data_collection')
ORDER BY table_name, ordinal_position;


