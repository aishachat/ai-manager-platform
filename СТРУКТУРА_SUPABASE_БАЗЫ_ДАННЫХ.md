# 🗄️ СТРУКТУРА SUPABASE БАЗЫ ДАННЫХ

## 📋 ОБЗОР АРХИТЕКТУРЫ

Платформа использует **project-based архитектуру**, где данные группируются по проектам, а не по пользователям напрямую.

### 🎯 КЛЮЧЕВЫЕ ПРИНЦИПЫ:
- **project_id** - основной идентификатор для группировки данных
- **user_id** - связь с пользователем через таблицу `projects`
- **RLS политики** проверяют `project_id = get_user_project_id()`

## 📊 ТАБЛИЦЫ БАЗЫ ДАННЫХ

### 1. **ПОЛЬЗОВАТЕЛИ И ПРОЕКТЫ**

#### `auth.users` (Supabase Auth)
- `id` - UUID пользователя
- `email` - Email пользователя
- `created_at` - Дата создания
- `email_confirmed_at` - Дата подтверждения email

#### `public.users`
- `id` - UUID (ссылка на auth.users.id)
- `email` - Email пользователя
- `name` - Имя пользователя
- `company_name` - Название компании
- `phone` - Телефон
- `company_field` - Сфера деятельности
- `created_at` - Дата создания
- `updated_at` - Дата обновления

#### `public.projects`
- `id` - UUID проекта
- `name` - Название проекта
- `description` - Описание проекта
- `owner_id` - UUID владельца (ссылка на auth.users.id)
- `created_at` - Дата создания
- `updated_at` - Дата обновления

#### `public.project_members`
- `id` - UUID записи
- `project_id` - UUID проекта
- `user_id` - UUID пользователя
- `role` - Роль в проекте
- `created_at` - Дата создания

### 2. **AI АГЕНТЫ И НАСТРОЙКИ**

#### `public.assistants`
- `id` - UUID ассистента
- `user_id` - UUID пользователя
- `project_id` - UUID проекта
- `name` - Название ассистента
- `language` - Язык (ru/en)
- `prompt` - Системный промпт
- `active` - Активен ли ассистент
- `setup_completed` - Завершена ли настройка
- `setup_step` - Текущий шаг настройки
- `setup_data` - JSON с данными настройки
- `description` - Описание ассистента
- `avatar` - Аватар ассистента
- `status` - Статус (active/inactive)
- `created_at` - Дата создания
- `updated_at` - Дата обновления

#### `public.autoswitch_settings`
- `id` - UUID настройки
- `project_id` - UUID проекта
- `settings` - JSON с настройками автопереключения
- `created_at` - Дата создания
- `updated_at` - Дата обновления

### 3. **ЧАТ И ДИАЛОГИ**

#### `public.dialogs`
- `id` - UUID диалога
- `user_id` - UUID пользователя
- `project_id` - UUID проекта
- `type` - Тип диалога (widget/telegram/whatsapp/vk/instagram)
- `status` - Статус диалога
- `last_message` - Последнее сообщение
- `last_message_at` - Время последнего сообщения
- `created_at` - Дата создания
- `updated_at` - Дата обновления

#### `public.conversations`
- `id` - UUID разговора
- `project_id` - UUID проекта
- `dialog_id` - UUID диалога
- `title` - Название разговора
- `status` - Статус разговора
- `created_at` - Дата создания
- `updated_at` - Дата обновления

#### `public.chat_messages`
- `id` - UUID сообщения
- `project_id` - UUID проекта
- `conversation_id` - UUID разговора
- `user_id` - UUID пользователя
- `message` - Текст сообщения
- `role` - Роль (user/assistant/system)
- `metadata` - JSON с метаданными
- `created_at` - Дата создания

### 4. **БАЗА ЗНАНИЙ**

#### `public.knowledge_sources`
- `id` - UUID источника
- `project_id` - UUID проекта
- `user_id` - UUID пользователя
- `type` - Тип источника (site/feed/text/file)
- `name` - Название источника
- `content` - Содержимое
- `status` - Статус обработки
- `metadata` - JSON с метаданными
- `created_at` - Дата создания
- `updated_at` - Дата обновления

#### `public.knowledge_chunks`
- `id` - UUID чанка
- `project_id` - UUID проекта
- `source_id` - UUID источника
- `content` - Содержимое чанка
- `embedding` - Векторное представление
- `metadata` - JSON с метаданными
- `created_at` - Дата создания

### 5. **НИШИ И СПЕЦИАЛИЗАЦИЯ**

#### `public.niches`
- `id` - UUID ниши
- `name` - Название ниши
- `description` - Описание ниши
- `system_context` - Системный контекст
- `specialization` - Специализация
- `context_tags` - Массив тегов
- `created_at` - Дата создания
- `updated_at` - Дата обновления

#### `public.niche_synonyms`
- `id` - UUID синонима
- `niche_id` - UUID ниши
- `synonym` - Синоним
- `created_at` - Дата создания

#### `public.user_niches`
- `id` - UUID записи
- `user_id` - UUID пользователя
- `project_id` - UUID проекта
- `niche_id` - UUID ниши
- `created_at` - Дата создания

### 6. **НАСТРОЙКИ ИНТЕГРАЦИЙ**

#### `public.widget_development_settings`
- `id` - UUID настройки
- `user_id` - UUID пользователя
- `project_id` - UUID проекта
- `settings` - JSON с настройками виджета
- `created_at` - Дата создания
- `updated_at` - Дата обновления

#### `public.telegram_settings`
- `id` - UUID настройки
- `user_id` - UUID пользователя
- `project_id` - UUID проекта
- `bot_token` - Токен бота
- `webhook_url` - URL webhook
- `settings` - JSON с настройками
- `created_at` - Дата создания
- `updated_at` - Дата обновления

## 🔐 RLS ПОЛИТИКИ

### **ПРИНЦИПЫ БЕЗОПАСНОСТИ:**
- Все таблицы защищены Row Level Security (RLS)
- Пользователи видят только данные своего проекта
- Проекты доступны только владельцу

### **ТИПЫ ПОЛИТИК:**

#### 1. **Project-based политики** (основные)
```sql
-- Доступ по project_id
CREATE POLICY "table_project_access" ON public.table_name
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());
```

#### 2. **Owner-based политики** (для projects)
```sql
-- Доступ по owner_id
CREATE POLICY "projects_owner_access" ON public.projects
    FOR ALL USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());
```

#### 3. **Public политики** (для справочников)
```sql
-- Публичный доступ для чтения
CREATE POLICY "public_read_access" ON public.niches
    FOR SELECT USING (true);
```

## 🔧 ФУНКЦИИ

### `public.get_user_project_id()`
```sql
CREATE OR REPLACE FUNCTION public.get_user_project_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id_uuid UUID := auth.uid();
    project_id_val UUID;
BEGIN
    IF user_id_uuid IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT id INTO project_id_val
    FROM public.projects
    WHERE owner_id = user_id_uuid;

    IF project_id_val IS NULL THEN
        INSERT INTO public.projects (owner_id, name)
        VALUES (user_id_uuid, 'Default Project for ' || user_id_uuid::text)
        RETURNING id INTO project_id_val;
    END IF;

    RETURN project_id_val;
END;
$$;
```

## 📈 СВЯЗИ МЕЖДУ ТАБЛИЦАМИ

```
auth.users (1) ←→ (1) public.users
     ↓
public.projects (1) ←→ (N) public.assistants
     ↓
public.assistants (1) ←→ (N) public.conversations
     ↓
public.conversations (1) ←→ (N) public.chat_messages

public.projects (1) ←→ (N) public.knowledge_sources
     ↓
public.knowledge_sources (1) ←→ (N) public.knowledge_chunks

public.projects (1) ←→ (N) public.dialogs
public.projects (1) ←→ (N) public.widget_development_settings
public.projects (1) ←→ (N) public.telegram_settings
```

## ⚠️ ТЕКУЩИЕ ПРОБЛЕМЫ

### 1. **RLS отключен**
- Данные доступны всем пользователям
- Нет изоляции между проектами
- Критическая проблема безопасности

### 2. **Старые данные**
- Многие записи имеют `project_id = null`
- Нужна миграция данных
- Функция `get_user_project_id()` не работает

### 3. **API код**
- Использует `user_id` вместо `project_id`
- Не соответствует архитектуре
- Нужно исправить все API endpoints

## 🔧 ПЛАН ИСПРАВЛЕНИЯ

1. **Миграция данных** - назначить `project_id` для всех записей
2. **Восстановить RLS** - включить RLS с правильными политиками
3. **Исправить API** - заменить `user_id` на `project_id`
4. **Протестировать** - убедиться в изоляции данных

## 📝 ФАЙЛЫ ДЛЯ ИСПРАВЛЕНИЯ

- `МИГРАЦИЯ_ДАННЫХ_В_PROJECT_ID.sql` - миграция данных
- `ПРАВИЛЬНОЕ_ИСПРАВЛЕНИЕ_RLS.sql` - восстановление RLS
- `ДИАГНОСТИКА_ПОЛЬЗОВАТЕЛЕЙ.sql` - диагностика проблем
- `ДЕТАЛЬНЫЙ_АНАЛИЗ_ПО_ТАБЛИЦАМ.sql` - анализ RLS политик
