# Настройка Adapto AI Platform

## 🚀 Быстрый старт (Демо режим)

### 1. Запуск фронтенда
```bash
npm run dev
```
Фронтенд запустится на http://localhost:3004

### 2. Тестирование функций
- **Регистрация**: Заполните все поля с валидацией
- **Вход**: Используйте любой email и пароль от 6 символов
- **Все функции работают в демо режиме**

## 🔧 Полная настройка с бэкендом

### 1. Supabase настройка

#### Получение Service Role Key:
1. Зайдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в Settings → API
4. Скопируйте "service_role" key (НЕ anon key!)

#### Обновление .env файла:
```bash
cd adapto-backend
```

Добавьте в `.env`:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. Создание базы данных

Выполните SQL скрипт в Supabase SQL Editor:

```sql
-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  if not exists (select 1 from pg_type where typname = 'channel') then
    create type channel as enum ('telegram','whatsapp','widget','test');
  end if;
  if not exists (select 1 from pg_type where typname = 'knowledge_type') then
    create type knowledge_type as enum ('site','feed','text','file');
  end if;
  if not exists (select 1 from pg_type where typname = 'sentiment') then
    create type sentiment as enum ('positive','neutral','negative');
  end if;
end $$;

-- Profiles (1:1 к auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  email text not null,
  name text,
  plan text not null default 'free',
  company_name text,
  phone text,
  company_field text
);

-- Assistants (боты пользователя)
create table if not exists public.assistants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  name text not null,
  language text not null default 'ru',
  prompt text,
  active boolean not null default true
);

-- Assistant settings (1:1)
create table if not exists public.assistant_settings (
  assistant_id uuid primary key references public.assistants(id) on delete cascade,
  role text,
  tone text,
  emoji_frequency text,
  address_form text,
  data_fields jsonb,
  constraints_list text[]
);

-- Knowledge base items
create table if not exists public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  assistant_id uuid not null references public.assistants(id) on delete cascade,
  created_at timestamp with time zone default now(),
  type knowledge_type not null,
  source_url text,
  text_content text,
  file_path text,
  status text not null default 'uploaded'
);

-- Conversations (диалоги)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  assistant_id uuid not null references public.assistants(id) on delete cascade,
  channel channel not null default 'test',
  client_external_id text,
  started_at timestamp with time zone default now(),
  last_message_at timestamp with time zone default now(),
  last_sentiment sentiment
);

-- Messages (сообщения в диалоге)
create table if not exists public.messages (
  id bigserial primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  sender text not null check (sender in ('user','assistant','system')),
  content text not null,
  sentiment sentiment,
  metadata jsonb
);

-- Integrations (токены/настройки каналов)
create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  assistant_id uuid not null references public.assistants(id) on delete cascade,
  type text not null check (type in ('telegram','whatsapp','widget')),
  config jsonb,
  active boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Индексы
create index if not exists idx_profiles_email on public.profiles (email);
create index if not exists idx_assistants_owner on public.assistants(owner_id);
create index if not exists idx_kb_assistant on public.knowledge_items(assistant_id);
create index if not exists idx_conv_owner on public.conversations(owner_id);
create index if not exists idx_conv_assistant on public.conversations(assistant_id);
create index if not exists idx_messages_conv on public.messages(conversation_id);
```

### 3. Включение реального режима

В файле `src/App.tsx` раскомментируйте код в функциях:
- `handleLoginSubmit`
- `handleRegisterSubmit`

### 4. Запуск бэкенда

```bash
cd adapto-backend
npm run dev
```

Бэкенд запустится на http://localhost:3000

## ✅ Что исправлено

### Регистрация:
- ✅ Добавлено поле пароля
- ✅ Валидация email (формат @domain.com)
- ✅ Валидация пароля (минимум 6 символов)
- ✅ Валидация телефона (формат +7 (999) 123-45-67)
- ✅ Подсветка ошибок в полях
- ✅ Правильный переход после регистрации

### Вход:
- ✅ Проверка email и пароля
- ✅ Подсветка ошибок
- ✅ Переход в дашборд

### Общие улучшения:
- ✅ Демо режим для тестирования
- ✅ Уведомления об успешных операциях
- ✅ Валидация всех форм

## 🎯 Тестирование

1. **Регистрация**: Заполните все поля с валидацией
2. **Вход**: Используйте любой email и пароль от 6 символов
3. **База знаний**: Добавьте элементы с анимацией
4. **Настройки**: Измените этапы диалога
5. **Интеграции**: Кликните на карточки

Все функции работают в демо режиме! 🎉
