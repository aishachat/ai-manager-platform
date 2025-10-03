#!/bin/bash

# 🔒 Улучшенный тест RLS после исправлений
# Этот скрипт проверяет качество RLS политик после исправлений

echo "🔒 Запуск улучшенного RLS теста..."

# Конфигурация
SUPABASE_URL="https://jppujbttlrsobfwuzalw.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcHVqYnR0bHJzb2Jmd3V6YWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mjc3MDMsImV4cCI6MjA3MTIwMzcwM30.W-NgL1PIaAIUQfi5BtvFukSqLLG0ZPQDCKcs70sUaHY"

# Таблицы для тестирования
TABLES=("users" "dialogs" "chat_messages" "knowledge_sources" "knowledge_chunks" "assistants" "conversations" "niches")

# Результаты тестирования
PASSED=0
FAILED=0
WARNINGS=0

echo "📊 Тестирование RLS для ${#TABLES[@]} критических таблиц..."

# Функция для тестирования таблицы
test_table_security() {
    local table=$1
    echo "🔍 Тестирование безопасности таблицы: $table"
    
    # Тест 1: Анонимный SELECT
    echo "  📋 Тест 1: Анонимный SELECT..."
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        "$SUPABASE_URL/rest/v1/$table?select=*&limit=1")
    
    if [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo "    ✅ RLS блокирует анонимный SELECT (код: $response)"
        ((PASSED++))
    elif [ "$response" = "200" ]; then
        echo "    ❌ УЯЗВИМОСТЬ: Анонимный SELECT разрешен!"
        ((FAILED++))
    else
        echo "    ⚠️ Неожиданный ответ (код: $response)"
        ((WARNINGS++))
    fi
    
    # Тест 2: Анонимный INSERT
    echo "  📋 Тест 2: Анонимный INSERT..."
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -X POST \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json" \
        -d '{"test_field": "RLS Security Test"}' \
        "$SUPABASE_URL/rest/v1/$table")
    
    if [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo "    ✅ RLS блокирует анонимный INSERT (код: $response)"
        ((PASSED++))
    elif [ "$response" = "201" ]; then
        echo "    ❌ УЯЗВИМОСТЬ: Анонимный INSERT разрешен!"
        ((FAILED++))
    else
        echo "    ⚠️ Неожиданный ответ (код: $response)"
        ((WARNINGS++))
    fi
    
    # Тест 3: Анонимный UPDATE
    echo "  📋 Тест 3: Анонимный UPDATE..."
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -X PATCH \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json" \
        -d '{"test_field": "RLS Update Test"}' \
        "$SUPABASE_URL/rest/v1/$table?id=eq.00000000-0000-0000-0000-000000000000")
    
    if [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo "    ✅ RLS блокирует анонимный UPDATE (код: $response)"
        ((PASSED++))
    elif [ "$response" = "200" ]; then
        echo "    ❌ УЯЗВИМОСТЬ: Анонимный UPDATE разрешен!"
        ((FAILED++))
    else
        echo "    ⚠️ Неожиданный ответ (код: $response)"
        ((WARNINGS++))
    fi
    
    # Тест 4: Анонимный DELETE
    echo "  📋 Тест 4: Анонимный DELETE..."
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -X DELETE \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        "$SUPABASE_URL/rest/v1/$table?id=eq.00000000-0000-0000-0000-000000000000")
    
    if [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo "    ✅ RLS блокирует анонимный DELETE (код: $response)"
        ((PASSED++))
    elif [ "$response" = "204" ]; then
        echo "    ❌ УЯЗВИМОСТЬ: Анонимный DELETE разрешен!"
        ((FAILED++))
    else
        echo "    ⚠️ Неожиданный ответ (код: $response)"
        ((WARNINGS++))
    fi
    
    echo ""
}

# Запускаем тесты для всех таблиц
for table in "${TABLES[@]}"; do
    test_table_security "$table"
done

# Вычисляем общий результат
TOTAL=$((PASSED + FAILED + WARNINGS))
SUCCESS_RATE=$((PASSED * 100 / TOTAL))

echo "=========================================="
echo "📊 ИТОГОВЫЙ ОТЧЕТ RLS ТЕСТА"
echo "=========================================="
echo "✅ Пройдено: $PASSED"
echo "❌ Провалено: $FAILED"
echo "⚠️  Предупреждения: $WARNINGS"
echo "📈 Общий результат: $PASSED/$TOTAL"
echo "🎯 Процент успеха: $SUCCESS_RATE%"

# Определяем статус
if [ $SUCCESS_RATE -ge 95 ]; then
    echo "🎉 ОТЛИЧНО! RLS политики работают идеально"
    STATUS="EXCELLENT"
elif [ $SUCCESS_RATE -ge 85 ]; then
    echo "✅ ХОРОШО! RLS политики работают корректно"
    STATUS="GOOD"
elif [ $SUCCESS_RATE -ge 70 ]; then
    echo "⚠️  УДОВЛЕТВОРИТЕЛЬНО, но есть проблемы"
    STATUS="FAIR"
else
    echo "🚨 КРИТИЧНО! RLS политики требуют исправления"
    STATUS="CRITICAL"
fi

# Сохраняем результат
echo "📄 Статус: $STATUS"
echo "📄 Процент успеха: $SUCCESS_RATE%"
echo "📄 Время теста: $(date)"

# Возвращаем код выхода в зависимости от результата
case $STATUS in
    "EXCELLENT"|"GOOD")
        exit 0
        ;;
    "FAIR")
        exit 1
        ;;
    "CRITICAL")
        exit 2
        ;;
esac
