# 🎯 ИТОГОВЫЙ ПЛАН ДЕЙСТВИЙ ПО RLS

## ✅ УЖЕ ВЫПОЛНЕНО

### Исправленные таблицы:
1. **users** - ✅ `id = auth.uid()`
2. **projects** - ✅ `owner_id = auth.uid()`
3. **project_members** - ✅ `project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())`
4. **assistants** - ✅ `owner_id = auth.uid()`
5. **autoswitch_settings** - ✅ `user_id = auth.uid()`

### Готовые скрипты:
6. **conversations** - ✅ `owner_id = auth.uid()` (скрипт готов)
7. **user_niches** - ✅ `user_id = auth.uid() AND project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())` (скрипт готов)
8. **niche_synonyms** - ✅ Справочник: чтение для всех, запись для владельцев (скрипт готов)
9. **ai_agent_settings** - ✅ `project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())` (скрипт готов)
10. **dialogs** - ✅ `project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())` (скрипт готов)
11. **chat_messages** - ✅ `project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())` (скрипт готов)

## 🔍 ТРЕБУЕТСЯ ПРОВЕРКА СТРУКТУРЫ

### Критичные таблицы:
1. **ai_agent_settings** - проверить есть ли `project_id` или `user_id`
2. **dialogs** - проверить есть ли `project_id` или `owner_id`
3. **chat_messages** - проверить есть ли `project_id` или `user_id`

### Таблицы интеграций:
4. **widget_development_settings** - проверить структуру
5. **telegram_settings** - проверить структуру
6. **bot_corrections** - проверить структуру

### Таблицы базы знаний:
7. **knowledge_sources** - проверить структуру
8. **knowledge_chunks** - проверить структуру

### Таблицы ниш:
9. **niches** - проверить структуру
10. **niche_synonyms** - проверить структуру
11. **user_niches** - проверить структуру

## 🚀 ПЛАН ДЕЙСТВИЙ

### 1. СЕЙЧАС - Выполнить готовые скрипты:
- ✅ `ШАГ_8_ИСПРАВЛЕНИЕ_CONVERSATIONS_ПРАВИЛЬНЫЙ.sql`

### 2. СЛЕДУЮЩИЙ ШАГ - Проверить структуру:
- Выполнить `ПРОВЕРКА_ВСЕХ_ОСТАВШИХСЯ_ТАБЛИЦ.sql`
- Получить структуру всех оставшихся таблиц

### 3. ПОСЛЕ ПРОВЕРКИ - Создать скрипты:
- Создать правильные RLS политики для каждой таблицы
- Учесть реальную структуру и связи

### 4. ПОШАГОВОЕ ИСПРАВЛЕНИЕ:
- Исправлять RLS по одной таблице
- Проверять качество после каждого исправления

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
- Найти связь с проектами через другие колонки
- Возможно, через `assistant_id`, `dialog_id`, `conversation_id` и т.д.

## 📋 СОЗДАННЫЕ ФАЙЛЫ

### Готовые скрипты:
1. ✅ `ШАГ_8_ИСПРАВЛЕНИЕ_CONVERSATIONS_ПРАВИЛЬНЫЙ.sql`
2. ✅ `ИНСТРУКЦИЯ_ВЫПОЛНЕНИЯ_ШАГ_8_ПРАВИЛЬНЫЙ.md`

### Скрипты проверки:
3. ✅ `ПРОВЕРКА_ВСЕХ_ОСТАВШИХСЯ_ТАБЛИЦ.sql`
4. ✅ `ПЛАН_RLS_ПОЛИТИК_ДЛЯ_ВСЕХ_ТАБЛИЦ.md`

## 📞 ТРЕБУЕТСЯ ДЕЙСТВИЕ

### НЕМЕДЛЕННО:
1. Выполните `ШАГ_8_ИСПРАВЛЕНИЕ_CONVERSATIONS_ПРАВИЛЬНЫЙ.sql`
2. Проверьте результаты

### ПОСЛЕ ВЫПОЛНЕНИЯ:
1. Выполните `ПРОВЕРКА_ВСЕХ_ОСТАВШИХСЯ_ТАБЛИЦ.sql`
2. Предоставьте результаты для создания остальных скриптов

## 💡 ВАЖНО
- Каждая таблица имеет свою логику RLS
- Нужно проверять структуру каждой таблицы
- RLS должен обеспечивать изоляцию данных без блокировки API
- Принцип: 1 проект = изолированные данные
