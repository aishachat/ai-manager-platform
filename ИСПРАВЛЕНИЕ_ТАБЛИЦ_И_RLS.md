# 🔧 ИСПРАВЛЕНИЕ: Неправильные названия таблиц и RLS политики

## ❌ **ПРОБЛЕМА:**
В коде использовались несуществующие таблицы:
- `knowledge_base` → должно быть `knowledge_sources` и `knowledge_chunks`
- `ai_agent_settings` → должно быть `assistants`
- `bot_corrections` → должно быть `chat_messages`
- `user_limits` → должно быть `users`
- `chat_history` → должно быть `chat_messages`

## ✅ **ИСПРАВЛЕНО:**

### **1. В коде (`src/supabaseClient.js`):**
- ✅ `knowledge_base` → `knowledge_sources`
- ✅ Все функции для работы с базой знаний исправлены

### **2. В API endpoints:**
- ✅ `adapto-backend/src/app/api/upload-file/route.ts` - `knowledge_base` → `knowledge_sources`
- ✅ `adapto-backend/src/app/api/chat/message/route.ts` - `knowledge_base` → `knowledge_sources`, `ai_agent_settings` → `assistants`, `chat_history` → `chat_messages`
- ✅ `adapto-backend/src/app/api/corrections/active/[userId]/route.ts` - `bot_corrections` → `chat_messages`
- ✅ `adapto-backend/src/app/api/agent/settings/[assistantId]/route.ts` - `ai_agent_settings` → `assistants`
- ✅ `adapto-backend/src/app/api/user-limits/route.ts` - `user_limits` → `users`
- ✅ `adapto-backend/src/app/api/user-limits/[userId]/route.ts` - `user_limits` → `users`

### **3. В RLS скрипте (`fix_rls_final.sql`):**
- ✅ Убраны несуществующие таблицы: `ai_agent_settings`, `bot_corrections`, `user_limits`
- ✅ Добавлены существующие таблицы: `assistants`, `chat_messages`, `conversations`
- ✅ Исправлены таблицы знаний: `knowledge_sources`, `knowledge_chunks`

## 📋 **СПИСОК СУЩЕСТВУЮЩИХ ТАБЛИЦ (запомнить!):**

```
ai_agent_settings ❌ (НЕТ)
assistants ✅
autoswitch_settings ✅
chat_messages ✅
chunk_synonyms ✅
conversations ✅
crm_clients ✅
crm_deal_notes ✅
crm_deals ✅
crm_operators ✅
crm_tasks ✅
dialog_crm_connections ✅
dialog_with_operators ✅
dialogs ✅
faq_cache ✅
help_requests ✅
integration_dialogs ✅
integration_messages ✅
knowledge_chunks ✅
knowledge_sources ✅
messages ✅
messenger_contacts ✅
niche_synonyms ✅
niches ✅
notification_logs ✅
notifications ✅
project_members ✅
projects ✅
prompt_logs ✅
stories ✅
telegram_bots ✅
telegram_notifications ✅
telegram_settings ✅
user_integrations ✅
user_niches ✅
users ✅
widget_api_keys ✅
widget_development_settings ✅
working_hours ✅
```

## 🎯 **СЛЕДУЮЩИЕ ШАГИ:**

1. **Выполнить исправленный RLS скрипт** `fix_rls_final.sql` в Supabase SQL Editor
2. **Задеплоить исправленные файлы** на сервер
3. **Проверить подключение к Supabase** - должно исчезнуть "Supabase connection failed"

## 📁 **ИСПРАВЛЕННЫЕ ФАЙЛЫ:**

1. `src/supabaseClient.js` - исправлены названия таблиц
2. `adapto-backend/src/app/api/upload-file/route.ts` - исправлена таблица
3. `adapto-backend/src/app/api/chat/message/route.ts` - исправлены таблицы
4. `adapto-backend/src/app/api/corrections/active/[userId]/route.ts` - исправлена таблица
5. `adapto-backend/src/app/api/agent/settings/[assistantId]/route.ts` - исправлена таблица
6. `adapto-backend/src/app/api/user-limits/route.ts` - исправлена таблица
7. `adapto-backend/src/app/api/user-limits/[userId]/route.ts` - исправлена таблица
8. `fix_rls_final.sql` - исправлены RLS политики для существующих таблиц

## 🚀 **РЕЗУЛЬТАТ:**

После применения исправлений:
- ✅ Все API endpoints будут работать с правильными таблицами
- ✅ RLS политики будут применены только к существующим таблицам
- ✅ "Supabase connection failed" должна исчезнуть
- ✅ Платформа будет полностью функциональна

---

**Дата**: 2 октября 2024  
**Статус**: ✅ Все названия таблиц исправлены  
**Следующий шаг**: Применить `fix_rls_final.sql` в Supabase SQL Editor
