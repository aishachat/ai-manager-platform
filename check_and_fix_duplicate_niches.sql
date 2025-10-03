-- Скрипт для проверки и удаления дубликатов ниш в таблице niches
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Сначала проверим, есть ли дубликаты
SELECT name, COUNT(*) as count
FROM public.niches
GROUP BY name
HAVING COUNT(*) > 1;

-- 2. Оставляем только самую раннюю запись для каждой ниши, удаляем дубликаты
WITH duplicates AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC) as rn
  FROM public.niches
)
DELETE FROM public.niches
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 3. Добавляем UNIQUE constraint, чтобы дубликаты больше не появлялись
ALTER TABLE public.niches 
DROP CONSTRAINT IF EXISTS niches_name_key;

ALTER TABLE public.niches 
ADD CONSTRAINT niches_name_key UNIQUE (name);

-- 4. Проверяем результат
SELECT name, COUNT(*) as count
FROM public.niches
GROUP BY name
ORDER BY name;

SELECT 'Дубликаты ниш удалены ✅' AS status;

