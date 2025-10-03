# 📋 ОБНОВЛЕННЫЙ ПЛАН ДЕЙСТВИЙ RLS

## ✅ ВЫПОЛНЕНО

### Основные таблицы (ШАГ 1-4):
1. **users** - ✅ `id = auth.uid()`
2. **projects** - ✅ `owner_id = auth.uid()`
3. **project_members** - ✅ `project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())`
4. **assistants** - ✅ `owner_id = auth.uid()`

### Критичные таблицы (ШАГ 6-18):
5. **autoswitch_settings** - ✅ `user_id = auth.uid()` (личные настройки)
6. **conversations** - ✅ `owner_id = auth.uid()` (разговоры владельца)
7. **user_niches** - ✅ `user_id = auth.uid() AND project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())` (комбинированная)
8. **niche_synonyms** - ✅ Справочник: чтение для всех, запись для владельцев
9. **ai_agent_settings** - ✅ `project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())` (командная работа)
10. **dialogs** - ✅ `project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())` (командная работа)
11. **chat_messages** - ✅ `project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())` (командная работа)
12. **widget_development_settings** - ✅ `project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())` (командная работа)

## 🎯 СЛЕДУЮЩИЕ ШАГИ

### Критичные таблицы (требуют исправления):
1. **telegram_settings** - настройки Telegram проекта
2. **knowledge_sources** - источники знаний проекта
3. **knowledge_chunks** - чанки знаний проекта
4. **crm_clients** - клиенты CRM проекта
5. **crm_deals** - сделки CRM проекта
6. **crm_operators** - операторы CRM проекта

### Возможные справочники:
7. **niches** - возможно тоже справочник
8. **chunk_synonyms** - возможно тоже справочник

## 🚀 ГОТОВЫЕ СКРИПТЫ

### НЕМЕДЛЕННО ВЫПОЛНИТЬ:
1. **`ШАГ_16_ИСПРАВЛЕНИЕ_TELEGRAM_SETTINGS_ПРОЕКТ.sql`** - для таблицы `telegram_settings`
2. **`ШАГ_18_ИСПРАВЛЕНИЕ_KNOWLEDGE_SOURCES_ПРОЕКТ.sql`** - для таблицы `knowledge_sources`

### ПОСЛЕ УСПЕХА СОЗДАТЬ:
3. **`ШАГ_19_ИСПРАВЛЕНИЕ_KNOWLEDGE_CHUNKS_ПРОЕКТ.sql`** - для таблицы `knowledge_chunks`
4. **`ШАГ_20_ИСПРАВЛЕНИЕ_CRM_CLIENTS_ПРОЕКТ.sql`** - для таблицы `crm_clients`
5. **`ШАГ_21_ИСПРАВЛЕНИЕ_CRM_DEALS_ПРОЕКТ.sql`** - для таблицы `crm_deals`
6. **`ШАГ_22_ИСПРАВЛЕНИЕ_CRM_OPERATORS_ПРОЕКТ.sql`** - для таблицы `crm_operators`

## 🔍 ЛОГИКА RLS

### 1. PROJECT_ID логика (командная работа):
- `telegram_settings` - настройки Telegram проекта
- `knowledge_sources` - источники знаний проекта
- `knowledge_chunks` - чанки знаний проекта
- `crm_clients` - клиенты CRM проекта
- `crm_deals` - сделки CRM проекта
- `crm_operators` - операторы CRM проекта

### 2. Справочная логика (общие данные):
- `niches` - возможно тоже справочник
- `chunk_synonyms` - возможно тоже справочник

## 📞 ТРЕБУЕТСЯ ДЕЙСТВИЕ

### СЕЙЧАС:
1. Выполнить `ШАГ_16_ИСПРАВЛЕНИЕ_TELEGRAM_SETTINGS_ПРОЕКТ.sql`
2. Выполнить `ШАГ_18_ИСПРАВЛЕНИЕ_KNOWLEDGE_SOURCES_ПРОЕКТ.sql`
3. Проверить результаты

### ПОСЛЕ УСПЕХА:
Создам скрипты для остальных критичных таблиц

## 💡 ВАЖНО

**Таблица `bot_corrections` не существует** - убрана из плана.

Все остальные таблицы существуют и требуют исправления RLS.
