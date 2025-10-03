# 📋 ПЛАН RLS ПОЛИТИК ДЛЯ ВСЕХ ТАБЛИЦ

## ✅ УЖЕ ИСПРАВЛЕННЫЕ ТАБЛИЦЫ

### 1. **users** - ✅ ГОТОВО
- **Логика**: `id = auth.uid()`
- **Политика**: `users_own_access`

### 2. **projects** - ✅ ГОТОВО  
- **Логика**: `owner_id = auth.uid()`
- **Политика**: `projects_owner_access`

### 3. **project_members** - ✅ ГОТОВО
- **Логика**: `project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())`
- **Политика**: `project_members_project_access`

### 4. **assistants** - ✅ ГОТОВО
- **Логика**: `owner_id = auth.uid()` (из ваших данных)
- **Политика**: `assistants_owner_access`

### 5. **autoswitch_settings** - ✅ ГОТОВО
- **Логика**: `user_id = auth.uid()`
- **Политика**: `autoswitch_settings_user_access`

## 🔍 ТАБЛИЦЫ С OWNER_ID (из ваших данных)

### 6. **conversations** - ТРЕБУЕТ ИСПРАВЛЕНИЯ
- **Структура**: `owner_id` (uuid)
- **Логика**: `owner_id = auth.uid()`
- **Политика**: `conversations_owner_access`

## ❓ ТАБЛИЦЫ ТРЕБУЮЩИЕ ПРОВЕРКИ СТРУКТУРЫ

### Критичные таблицы:
1. **ai_agent_settings** - нужно проверить есть ли `project_id` или `user_id`
2. **dialogs** - нужно проверить есть ли `project_id` или `owner_id`
3. **chat_messages** - нужно проверить есть ли `project_id` или `user_id`

### Таблицы интеграций:
4. **widget_development_settings** - нужно проверить структуру
5. **telegram_settings** - нужно проверить структуру
6. **bot_corrections** - нужно проверить структуру

### Таблицы базы знаний:
7. **knowledge_sources** - нужно проверить структуру
8. **knowledge_chunks** - нужно проверить структуру

### Таблицы ниш:
9. **niches** - нужно проверить структуру
10. **niche_synonyms** - нужно проверить структуру
11. **user_niches** - нужно проверить структуру

## 🎯 ПРИНЦИПЫ RLS ПОЛИТИК

### Для таблиц с `project_id`:
```sql
project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
```

### Для таблиц с `user_id`:
```sql
user_id = auth.uid()
```

### Для таблиц с `owner_id`:
```sql
owner_id = auth.uid()
```

### Для таблиц без этих колонок:
- Нужно найти связь с проектами через другие колонки
- Возможно, через `assistant_id`, `dialog_id`, `conversation_id` и т.д.

## 🚀 ПЛАН ДЕЙСТВИЙ

### 1. СЕЙЧАС - Проверка структуры:
- Выполнить `ПРОВЕРКА_ВСЕХ_ОСТАВШИХСЯ_ТАБЛИЦ.sql`
- Получить структуру всех таблиц

### 2. ПОСЛЕ ПРОВЕРКИ - Создание скриптов:
- Создать правильные RLS политики для каждой таблицы
- Учесть реальную структуру и связи

### 3. ПОШАГОВОЕ ИСПРАВЛЕНИЕ:
- Исправлять RLS по одной таблице
- Проверять качество после каждого исправления

## 📞 ТРЕБУЕТСЯ ДЕЙСТВИЕ
Выполните скрипт `ПРОВЕРКА_ВСЕХ_ОСТАВШИХСЯ_ТАБЛИЦ.sql` и предоставьте результаты для создания правильных RLS политик.
