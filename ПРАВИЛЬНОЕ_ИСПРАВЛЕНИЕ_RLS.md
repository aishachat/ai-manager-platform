# ПРАВИЛЬНОЕ ИСПРАВЛЕНИЕ RLS ПОЛИТИК

## 🚨 ПРОБЛЕМЫ:
1. **Отключил RLS** вместо правильной настройки
2. **Данные могут перемешиваться** между пользователями  
3. **Код работает на `user_id`** вместо `project_id`
4. **Архитектура нарушена** - project_id должен управлять доступом

## 🎯 ПРАВИЛЬНАЯ АРХИТЕКТУРА:
- **project_id** - основной идентификатор для группировки данных
- **user_id** - связь с пользователем через таблицу `projects`
- **RLS политики** должны проверять `project_id = get_user_project_id()`

## 📋 ПЛАН ИСПРАВЛЕНИЯ:

### 1. ВОССТАНОВИТЬ RLS ДЛЯ ВСЕХ ТАБЛИЦ
```sql
-- Включить RLS для всех таблиц
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dialogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
-- и т.д.
```

### 2. ИСПРАВИТЬ ФУНКЦИЮ get_user_project_id()
```sql
-- Убедиться, что функция работает правильно
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

### 3. СОЗДАТЬ ПРАВИЛЬНЫЕ RLS ПОЛИТИКИ
```sql
-- Для таблицы assistants
CREATE POLICY "assistants_project_access" ON public.assistants
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- Для таблицы dialogs  
CREATE POLICY "dialogs_project_access" ON public.dialogs
    FOR ALL USING (project_id = public.get_user_project_id())
    WITH CHECK (project_id = public.get_user_project_id());

-- Для таблицы projects
CREATE POLICY "projects_owner_access" ON public.projects
    FOR ALL USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());
```

### 4. ИСПРАВИТЬ API КОД
- Заменить `user_id` на `project_id` в запросах
- Использовать `get_user_project_id()` для получения project_id
- Обновлять `project_id` при создании записей

### 5. МИГРАЦИЯ ДАННЫХ
- Назначить `project_id` для существующих записей
- Создать проекты для пользователей без проектов
- Обновить связи между таблицами

## ⚠️ РИСКИ ТЕКУЩЕГО СОСТОЯНИЯ:
- **Данные доступны всем** - любой пользователь может видеть чужие данные
- **Нарушение изоляции** - project_id не работает
- **Безопасность скомпрометирована** - RLS отключен

## 🔧 СЛЕДУЮЩИЕ ШАГИ:
1. Восстановить RLS для всех таблиц
2. Создать правильные политики
3. Исправить API код
4. Протестировать изоляцию данных
