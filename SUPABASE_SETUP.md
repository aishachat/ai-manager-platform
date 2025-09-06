# 🗄️ Настройка Supabase для платформы Adapto

## 📋 Что нужно настроить

### 1. Создание проекта Supabase

1. Зайдите на https://supabase.com/
2. Создайте новый проект
3. Запишите URL и API ключи

### 2. Создание таблиц в базе данных

Выполните следующие SQL запросы в SQL Editor Supabase:

```sql
-- Таблица настроек агентов
CREATE TABLE agent_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица истории чата
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agent_settings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX idx_agent_settings_user_id ON agent_settings(user_id);
CREATE INDEX idx_chat_history_agent_id ON chat_history(agent_id);
CREATE INDEX idx_chat_history_created_at ON chat_history(created_at DESC);

-- RLS (Row Level Security) политики
ALTER TABLE agent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Политики для agent_settings
CREATE POLICY "Users can view their own agents" ON agent_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agents" ON agent_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents" ON agent_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents" ON agent_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Политики для chat_history
CREATE POLICY "Users can view their own chat history" ON chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat history" ON chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Публичный доступ для виджета (без аутентификации)
CREATE POLICY "Public access for widget" ON agent_settings
  FOR SELECT USING (true);

CREATE POLICY "Public access for widget chat" ON chat_history
  FOR SELECT USING (true);

CREATE POLICY "Public access for widget chat insert" ON chat_history
  FOR INSERT WITH CHECK (true);
```

### 3. Настройка переменных окружения

Добавьте в файл `.env.local`:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GigaChat
GIGACHAT_API_KEY=MzIzZWMzY2EtNGUxNC00ZjQ1LTk0MTAtYWE3YTc4Y2NiYjE1OjZjZTBiZmNhLWNkZjEtNDNhYy05ODE2LWU3NDUzNTdmOWNjMA==

# OpenAI (fallback)
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-3.5-turbo

# Общие настройки
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Создание тестового агента

После настройки базы данных создайте тестового агента:

```sql
INSERT INTO agent_settings (id, name, settings) VALUES (
  'test-agent-1',
  'Тестовый агент',
  '{
    "task": "продаж и консультаций",
    "mainGoal": "помощь клиентам",
    "targetAudience": "Общие клиенты",
    "salesCycle": "Стандартный процесс продаж",
    "communicationStyle": "профессиональный, но дружелюбный",
    "addressing": "вы",
    "emojiUsage": "редко",
    "restrictions": [],
    "additionalSettings": [],
    "dataCollection": [],
    "dialogStages": [],
    "knowledgeItems": []
  }'
);
```

## 🚀 Тестирование

### 1. Тест API

```bash
# Проверка статуса
curl http://localhost:3001/api/status

# Тест чата с агентом
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Привет",
    "agentId": "test-agent-1"
  }'

# Получение настроек агента
curl http://localhost:3001/api/agent/test-agent-1

# Получение истории чата
curl http://localhost:3001/api/agent/test-agent-1/chat
```

### 2. Тест виджета

1. Откройте http://localhost:3000/widget-test.html
2. Виджет должен автоматически загрузиться
3. Попробуйте отправить сообщение

### 3. Тест платформы

1. Откройте http://localhost:3000
2. Настройте параметры агента
3. Протестируйте чат

## 📱 Использование виджета на других сайтах

Добавьте этот код на любой сайт:

```html
<script src="http://localhost:3000/widget.js" 
        data-agent-id="test-agent-1" 
        data-position="bottom-right" 
        data-theme="light"></script>
```

Или программно:

```javascript
const widget = new AdaptoWidget({
  agentId: 'test-agent-1',
  position: 'bottom-right',
  theme: 'light'
});
```

## 🔧 Структура данных

### agent_settings
- `id`: Уникальный идентификатор агента
- `user_id`: ID пользователя (опционально)
- `name`: Название агента
- `settings`: JSON с настройками агента
- `created_at`: Дата создания
- `updated_at`: Дата обновления

### chat_history
- `id`: Уникальный идентификатор сообщения
- `agent_id`: ID агента
- `user_id`: ID пользователя (опционально)
- `user_message`: Сообщение пользователя
- `ai_response`: Ответ ИИ
- `created_at`: Дата создания

## 🎯 Готово!

После выполнения всех шагов у вас будет:

✅ **Полнофункциональная платформа** с GigaChat API  
✅ **Интеграция с Supabase** для хранения данных  
✅ **Рабочий виджет** для вставки на сайты  
✅ **Тестовый агент** для проверки функционала  

Теперь можете создавать агентов, настраивать их поведение и использовать виджет на любых сайтах! 🚀


