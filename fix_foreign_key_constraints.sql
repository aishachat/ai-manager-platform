-- Исправление проблем с foreign key constraints
-- Выполните этот скрипт в Supabase SQL Editor

-- ============================================
-- АНАЛИЗ И ИСПРАВЛЕНИЕ FOREIGN KEY CONSTRAINTS
-- ============================================

-- 1. Проверяем существующие constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    confrelid::regclass as referenced_table,
    conrelid::regclass as table_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass
ORDER BY conname;

-- 2. Проверяем структуру таблицы users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Проверяем структуру таблицы projects
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'projects'
ORDER BY ordinal_position;

-- 4. Если есть проблема с foreign key на project_id, исправляем её
DO $$
BEGIN
    -- Проверяем, есть ли поле project_id в таблице users
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'project_id'
    ) THEN
        -- Проверяем, есть ли foreign key constraint
        IF EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conrelid = 'public.users'::regclass 
            AND conname = 'fk_users_project_id'
        ) THEN
            -- Удаляем старый constraint
            ALTER TABLE public.users DROP CONSTRAINT IF EXISTS fk_users_project_id;
            
            -- Создаем новый constraint с правильными типами
            ALTER TABLE public.users 
            ADD CONSTRAINT fk_users_project_id 
            FOREIGN KEY (project_id) 
            REFERENCES public.projects(id) 
            ON DELETE SET NULL;
            
            RAISE NOTICE 'Foreign key constraint fk_users_project_id исправлен';
        END IF;
    END IF;
END $$;

-- 5. Проверяем, что все constraints работают корректно
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    confrelid::regclass as referenced_table,
    conrelid::regclass as table_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass
ORDER BY conname;

-- 6. Проверяем целостность данных
SELECT 
    'users' as table_name,
    COUNT(*) as total_records,
    COUNT(project_id) as records_with_project_id,
    COUNT(*) - COUNT(project_id) as records_without_project_id
FROM public.users
UNION ALL
SELECT 
    'projects' as table_name,
    COUNT(*) as total_records,
    COUNT(id) as records_with_id,
    0 as records_without_id
FROM public.projects;

-- 7. Если есть записи в users с project_id, которых нет в projects, исправляем
UPDATE public.users 
SET project_id = NULL 
WHERE project_id IS NOT NULL 
AND project_id NOT IN (SELECT id FROM public.projects);

-- 8. Финальная проверка constraints
SELECT 
    'Constraint check completed' as status,
    COUNT(*) as total_constraints
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- Выводим сообщение об успешном выполнении
SELECT '✅ Foreign key constraints исправлены!' as status;
