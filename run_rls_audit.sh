#!/bin/bash

# 🔒 Запуск RLS аудита через Supabase API
# Этот скрипт выполняет RLS аудит без прямого доступа к PostgreSQL

echo "🔒 Запуск RLS аудита..."

# Конфигурация
SUPABASE_URL="https://jppujbttlrsobfwuzalw.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcHVqYnR0bHJzb2Jmd3V6YWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mjc3MDMsImV4cCI6MjA3MTIwMzcwM30.W-NgL1PIaAIUQfi5BtvFukSqLLG0ZPQDCKcs70sUaHY"

# Таблицы для тестирования
TABLES=("users" "dialogs" "chat_messages" "knowledge_sources" "knowledge_chunks" "assistants" "conversations")

echo "📊 Тестирование RLS для ${#TABLES[@]} таблиц..."

# Счетчики
PASSED=0
FAILED=0
WARNINGS=0

# Функция для тестирования таблицы
test_table_rls() {
    local table=$1
    echo "🔍 Тестирование таблицы: $table"
    
    # Тест 1: Попытка получить данные без аутентификации
    echo "  📋 Тест 1: Анонимный доступ..."
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        "$SUPABASE_URL/rest/v1/$table?select=*&limit=1")
    
    if [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo "    ✅ RLS блокирует анонимный доступ (код: $response)"
        ((PASSED++))
    elif [ "$response" = "200" ]; then
        echo "    ❌ УЯЗВИМОСТЬ: Анонимный доступ разрешен!"
        ((FAILED++))
    else
        echo "    ⚠️ Неожиданный ответ (код: $response)"
        ((WARNINGS++))
    fi
    
    # Тест 2: Попытка вставить данные без аутентификации
    echo "  📋 Тест 2: Анонимная вставка..."
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -X POST \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json" \
        -d '{"test_field": "RLS Test"}' \
        "$SUPABASE_URL/rest/v1/$table")
    
    if [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo "    ✅ RLS блокирует анонимную вставку (код: $response)"
        ((PASSED++))
    elif [ "$response" = "201" ]; then
        echo "    ❌ УЯЗВИМОСТЬ: Анонимная вставка разрешена!"
        ((FAILED++))
    else
        echo "    ⚠️ Неожиданный ответ (код: $response)"
        ((WARNINGS++))
    fi
    
    # Тест 3: Попытка обновить данные без аутентификации
    echo "  📋 Тест 3: Анонимное обновление..."
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -X PATCH \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json" \
        -d '{"test_field": "RLS Update Test"}' \
        "$SUPABASE_URL/rest/v1/$table?id=eq.00000000-0000-0000-0000-000000000000")
    
    if [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo "    ✅ RLS блокирует анонимное обновление (код: $response)"
        ((PASSED++))
    elif [ "$response" = "200" ]; then
        echo "    ❌ УЯЗВИМОСТЬ: Анонимное обновление разрешено!"
        ((FAILED++))
    else
        echo "    ⚠️ Неожиданный ответ (код: $response)"
        ((WARNINGS++))
    fi
    
    # Тест 4: Попытка удалить данные без аутентификации
    echo "  📋 Тест 4: Анонимное удаление..."
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -X DELETE \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        "$SUPABASE_URL/rest/v1/$table?id=eq.00000000-0000-0000-0000-000000000000")
    
    if [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo "    ✅ RLS блокирует анонимное удаление (код: $response)"
        ((PASSED++))
    elif [ "$response" = "204" ]; then
        echo "    ❌ УЯЗВИМОСТЬ: Анонимное удаление разрешено!"
        ((FAILED++))
    else
        echo "    ⚠️ Неожиданный ответ (код: $response)"
        ((WARNINGS++))
    fi
    
    echo ""
}

# Запускаем тесты для всех таблиц
for table in "${TABLES[@]}"; do
    test_table_rls "$table"
done

# Вычисляем общий результат
TOTAL=$((PASSED + FAILED + WARNINGS))
SUCCESS_RATE=$((PASSED * 100 / TOTAL))

echo "=========================================="
echo "📊 ИТОГОВЫЙ ОТЧЕТ RLS АУДИТА"
echo "=========================================="
echo "✅ Пройдено: $PASSED"
echo "❌ Провалено: $FAILED"
echo "⚠️  Предупреждения: $WARNINGS"
echo "📈 Общий результат: $PASSED/$TOTAL"
echo "🎯 Процент успеха: $SUCCESS_RATE%"

if [ $SUCCESS_RATE -ge 90 ]; then
    echo "🎉 ОТЛИЧНО! RLS политики работают корректно"
    exit 0
elif [ $SUCCESS_RATE -ge 70 ]; then
    echo "⚠️  ХОРОШО, но есть проблемы для исправления"
    exit 1
else
    echo "🚨 КРИТИЧНО! RLS политики требуют серьезного исправления"
    exit 2
fi
