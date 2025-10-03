-- 🔧 ИСПРАВЛЕНИЕ ФУНКЦИИ get_user_project_id()
-- Функция возвращает null - нужно исправить

-- ============================================
-- 1. ПРОВЕРЯЕМ ТЕКУЩУЮ ФУНКЦИЮ
-- ============================================

SELECT 
    '🔍 ТЕКУЩАЯ ФУНКЦИЯ' as section,
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_user_project_id';

-- ============================================
-- 2. УДАЛЯЕМ СТАРУЮ ФУНКЦИЮ
-- ============================================

DROP FUNCTION IF EXISTS get_user_project_id();

-- ============================================
-- 3. СОЗДАЕМ НОВУЮ ФУНКЦИЮ
-- ============================================

CREATE OR REPLACE FUNCTION get_user_project_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_project_id UUID;
BEGIN
    -- Получаем project_id пользователя из таблицы users
    SELECT project_id INTO user_project_id
    FROM users
    WHERE id = auth.uid();
    
    -- Если project_id не найден, создаем новый проект
    IF user_project_id IS NULL THEN
        -- Создаем новый проект для пользователя
        INSERT INTO projects (id, owner_id, name, created_at, updated_at)
        VALUES (gen_random_uuid(), auth.uid(), 'Default Project', now(), now())
        RETURNING id INTO user_project_id;
        
        -- Обновляем пользователя с новым project_id
        UPDATE users 
        SET project_id = user_project_id, updated_at = now()
        WHERE id = auth.uid();
    END IF;
    
    RETURN user_project_id;
END;
$$;

-- ============================================
-- 4. ПРОВЕРЯЕМ НОВУЮ ФУНКЦИЮ
-- ============================================

SELECT 
    '✅ НОВАЯ ФУНКЦИЯ' as section,
    get_user_project_id() as function_result,
    CASE 
        WHEN get_user_project_id() IS NULL THEN '❌ ФУНКЦИЯ НЕ РАБОТАЕТ'
        ELSE '✅ ФУНКЦИЯ РАБОТАЕТ'
    END as function_status;

-- ============================================
-- 5. ПРОВЕРЯЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
-- ============================================

SELECT 
    '👤 ДАННЫЕ ПОЛЬЗОВАТЕЛЯ' as section,
    id,
    email,
    project_id,
    created_at
FROM users
WHERE id = auth.uid();

-- ============================================
-- 6. ПРОВЕРЯЕМ ПРОЕКТЫ ПОЛЬЗОВАТЕЛЯ
-- ============================================

SELECT 
    '📁 ПРОЕКТЫ ПОЛЬЗОВАТЕЛЯ' as section,
    id,
    owner_id,
    name,
    created_at
FROM projects
WHERE owner_id = auth.uid();
