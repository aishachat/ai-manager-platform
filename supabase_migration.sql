-- Создание таблицы для хранения настроек модели
CREATE TABLE IF NOT EXISTS model_settings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL,
    system_prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Создание индекса для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_model_settings_user_id ON model_settings(user_id);

-- Включение Row Level Security (RLS)
ALTER TABLE model_settings ENABLE ROW LEVEL SECURITY;

-- Удаление существующих политик (если они есть)
DROP POLICY IF EXISTS "Users can view own model settings" ON model_settings;
DROP POLICY IF EXISTS "Users can insert own model settings" ON model_settings;
DROP POLICY IF EXISTS "Users can update own model settings" ON model_settings;
DROP POLICY IF EXISTS "Users can delete own model settings" ON model_settings;

-- Создание новых политик
CREATE POLICY "Users can view own model settings" ON model_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own model settings" ON model_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own model settings" ON model_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own model settings" ON model_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Удаление существующего триггера (если есть)
DROP TRIGGER IF EXISTS update_model_settings_updated_at ON model_settings;

-- Создание триггера для автоматического обновления updated_at
CREATE TRIGGER update_model_settings_updated_at 
    BEFORE UPDATE ON model_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблице
COMMENT ON TABLE model_settings IS 'Таблица для хранения настроек модели ИИ-оператора для каждого пользователя';
COMMENT ON COLUMN model_settings.user_id IS 'ID пользователя (ссылка на auth.users)';
COMMENT ON COLUMN model_settings.settings IS 'JSON объект с настройками модели (цели, ограничения, этапы диалога и т.д.)';
COMMENT ON COLUMN model_settings.system_prompt IS 'Сгенерированный системный промпт для GigaChat на основе настроек';
COMMENT ON COLUMN model_settings.created_at IS 'Дата создания записи';
COMMENT ON COLUMN model_settings.updated_at IS 'Дата последнего обновления записи';
