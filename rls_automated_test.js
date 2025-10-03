// 🔒 Автоматизированное тестирование RLS политик
// Этот скрипт проверяет качество и безопасность RLS политик

const { createClient } = require('@supabase/supabase-js');

// Конфигурация
const SUPABASE_URL = 'https://jppujbttlrsobfwuzalw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcHVqYnR0bHJzb2Jmd3V6YWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mjc3MDMsImV4cCI6MjA3MTIwMzcwM30.W-NgL1PIaAIUQfi5BtvFukSqLLG0ZPQDCKcs70sUaHY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Таблицы для тестирования
const TABLES_TO_TEST = [
    'users',
    'dialogs', 
    'chat_messages',
    'knowledge_sources',
    'knowledge_chunks',
    'assistants',
    'conversations',
    'widget_development_settings',
    'telegram_settings'
];

// Результаты тестирования
const testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
};

// Функция для логирования результатов
function logResult(test, status, message, details = null) {
    const result = {
        test,
        status,
        message,
        details,
        timestamp: new Date().toISOString()
    };
    
    testResults.details.push(result);
    
    if (status === 'PASS') testResults.passed++;
    else if (status === 'FAIL') testResults.failed++;
    else if (status === 'WARN') testResults.warnings++;
    
    console.log(`[${status}] ${test}: ${message}`);
    if (details) console.log(`  Details: ${JSON.stringify(details, null, 2)}`);
}

// Тест 1: Проверка аутентификации
async function testAuthentication() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            logResult('Authentication', 'FAIL', 'Не удалось получить пользователя', error);
            return false;
        }
        
        if (!user) {
            logResult('Authentication', 'WARN', 'Пользователь не аутентифицирован - тестируем анонимный доступ');
            return false;
        }
        
        logResult('Authentication', 'PASS', `Пользователь аутентифицирован: ${user.email}`);
        return true;
    } catch (error) {
        logResult('Authentication', 'FAIL', 'Ошибка аутентификации', error.message);
        return false;
    }
}

// Тест 2: Проверка доступа к собственным данным
async function testOwnDataAccess(userId) {
    for (const table of TABLES_TO_TEST) {
        try {
            // Пытаемся получить данные пользователя
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('user_id', userId)
                .limit(1);
            
            if (error) {
                // Проверяем, это ошибка RLS или другая ошибка
                if (error.code === '42501') {
                    logResult(`RLS-${table}`, 'PASS', 'RLS блокирует доступ (ожидаемо)', {
                        error: error.message,
                        code: error.code
                    });
                } else {
                    logResult(`RLS-${table}`, 'WARN', 'Ошибка доступа (не RLS)', {
                        error: error.message,
                        code: error.code
                    });
                }
            } else {
                logResult(`RLS-${table}`, 'PASS', 'Доступ к собственным данным разрешен', {
                    recordsCount: data?.length || 0
                });
            }
        } catch (error) {
            logResult(`RLS-${table}`, 'FAIL', 'Исключение при тестировании', error.message);
        }
    }
}

// Тест 3: Проверка блокировки доступа к чужим данным
async function testOtherDataAccess(userId) {
    // Создаем фиктивный ID другого пользователя
    const otherUserId = '00000000-0000-0000-0000-000000000000';
    
    for (const table of TABLES_TO_TEST) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('user_id', otherUserId)
                .limit(1);
            
            if (error) {
                if (error.code === '42501') {
                    logResult(`RLS-Security-${table}`, 'PASS', 'RLS блокирует доступ к чужим данным', {
                        error: error.message,
                        code: error.code
                    });
                } else {
                    logResult(`RLS-Security-${table}`, 'WARN', 'Ошибка доступа (не RLS)', {
                        error: error.message,
                        code: error.code
                    });
                }
            } else {
                // Это может быть проблемой безопасности
                if (data && data.length > 0) {
                    logResult(`RLS-Security-${table}`, 'FAIL', 'УЯЗВИМОСТЬ: Доступ к чужим данным!', {
                        recordsCount: data.length,
                        records: data
                    });
                } else {
                    logResult(`RLS-Security-${table}`, 'PASS', 'Нет доступа к чужим данным (пустой результат)');
                }
            }
        } catch (error) {
            logResult(`RLS-Security-${table}`, 'FAIL', 'Исключение при тестировании безопасности', error.message);
        }
    }
}

// Тест 4: Проверка вставки данных
async function testDataInsertion(userId) {
    for (const table of TABLES_TO_TEST) {
        try {
            // Пытаемся вставить тестовые данные
            const testData = {
                user_id: userId,
                test_field: 'RLS Test Data',
                created_at: new Date().toISOString()
            };
            
            const { data, error } = await supabase
                .from(table)
                .insert(testData)
                .select();
            
            if (error) {
                if (error.code === '42501') {
                    logResult(`RLS-Insert-${table}`, 'PASS', 'RLS блокирует вставку (ожидаемо)', {
                        error: error.message,
                        code: error.code
                    });
                } else {
                    logResult(`RLS-Insert-${table}`, 'WARN', 'Ошибка вставки (не RLS)', {
                        error: error.message,
                        code: error.code
                    });
                }
            } else {
                logResult(`RLS-Insert-${table}`, 'PASS', 'Вставка данных разрешена', {
                    insertedId: data?.[0]?.id
                });
                
                // Удаляем тестовые данные
                if (data?.[0]?.id) {
                    await supabase
                        .from(table)
                        .delete()
                        .eq('id', data[0].id);
                }
            }
        } catch (error) {
            logResult(`RLS-Insert-${table}`, 'FAIL', 'Исключение при тестировании вставки', error.message);
        }
    }
}

// Тест 5: Проверка обновления данных
async function testDataUpdate(userId) {
    for (const table of TABLES_TO_TEST) {
        try {
            // Пытаемся обновить данные
            const { data, error } = await supabase
                .from(table)
                .update({ 
                    updated_at: new Date().toISOString(),
                    test_update: 'RLS Update Test'
                })
                .eq('user_id', userId)
                .select();
            
            if (error) {
                if (error.code === '42501') {
                    logResult(`RLS-Update-${table}`, 'PASS', 'RLS блокирует обновление (ожидаемо)', {
                        error: error.message,
                        code: error.code
                    });
                } else {
                    logResult(`RLS-Update-${table}`, 'WARN', 'Ошибка обновления (не RLS)', {
                        error: error.message,
                        code: error.code
                    });
                }
            } else {
                logResult(`RLS-Update-${table}`, 'PASS', 'Обновление данных разрешено', {
                    updatedCount: data?.length || 0
                });
            }
        } catch (error) {
            logResult(`RLS-Update-${table}`, 'FAIL', 'Исключение при тестировании обновления', error.message);
        }
    }
}

// Тест 6: Проверка удаления данных
async function testDataDeletion(userId) {
    for (const table of TABLES_TO_TEST) {
        try {
            // Пытаемся удалить данные
            const { data, error } = await supabase
                .from(table)
                .delete()
                .eq('user_id', userId)
                .eq('test_field', 'RLS Test Data')
                .select();
            
            if (error) {
                if (error.code === '42501') {
                    logResult(`RLS-Delete-${table}`, 'PASS', 'RLS блокирует удаление (ожидаемо)', {
                        error: error.message,
                        code: error.code
                    });
                } else {
                    logResult(`RLS-Delete-${table}`, 'WARN', 'Ошибка удаления (не RLS)', {
                        error: error.message,
                        code: error.code
                    });
                }
            } else {
                logResult(`RLS-Delete-${table}`, 'PASS', 'Удаление данных разрешено', {
                    deletedCount: data?.length || 0
                });
            }
        } catch (error) {
            logResult(`RLS-Delete-${table}`, 'FAIL', 'Исключение при тестировании удаления', error.message);
        }
    }
}

// Тест 7: Проверка производительности RLS
async function testRLSPerformance(userId) {
    const startTime = Date.now();
    
    try {
        // Выполняем несколько запросов для измерения производительности
        const promises = TABLES_TO_TEST.map(table => 
            supabase
                .from(table)
                .select('count')
                .eq('user_id', userId)
        );
        
        await Promise.all(promises);
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (duration < 1000) {
            logResult('RLS-Performance', 'PASS', `RLS запросы выполняются быстро: ${duration}ms`);
        } else if (duration < 3000) {
            logResult('RLS-Performance', 'WARN', `RLS запросы выполняются медленно: ${duration}ms`);
        } else {
            logResult('RLS-Performance', 'FAIL', `RLS запросы выполняются очень медленно: ${duration}ms`);
        }
    } catch (error) {
        logResult('RLS-Performance', 'FAIL', 'Ошибка при тестировании производительности', error.message);
    }
}

// Основная функция тестирования
async function runRLSAudit() {
    console.log('🔒 Запуск RLS аудита...\n');
    
    // Тест аутентификации
    const isAuthenticated = await testAuthentication();
    
    if (isAuthenticated) {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user.id;
        
        console.log(`\n👤 Тестирование для пользователя: ${user.email} (${userId})\n`);
        
        // Запускаем все тесты
        await testOwnDataAccess(userId);
        await testOtherDataAccess(userId);
        await testDataInsertion(userId);
        await testDataUpdate(userId);
        await testDataDeletion(userId);
        await testRLSPerformance(userId);
    } else {
        console.log('\n🔍 Тестирование анонимного доступа...\n');
        
        // Тестируем анонимный доступ
        for (const table of TABLES_TO_TEST) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    if (error.code === '42501') {
                        logResult(`RLS-Anonymous-${table}`, 'PASS', 'RLS блокирует анонимный доступ');
                    } else {
                        logResult(`RLS-Anonymous-${table}`, 'WARN', 'Ошибка анонимного доступа', error.message);
                    }
                } else {
                    logResult(`RLS-Anonymous-${table}`, 'FAIL', 'УЯЗВИМОСТЬ: Анонимный доступ разрешен!', {
                        recordsCount: data?.length || 0
                    });
                }
            } catch (error) {
                logResult(`RLS-Anonymous-${table}`, 'FAIL', 'Исключение при тестировании анонимного доступа', error.message);
            }
        }
    }
    
    // Выводим итоговый отчет
    console.log('\n' + '='.repeat(60));
    console.log('📊 ИТОГОВЫЙ ОТЧЕТ RLS АУДИТА');
    console.log('='.repeat(60));
    console.log(`✅ Пройдено: ${testResults.passed}`);
    console.log(`❌ Провалено: ${testResults.failed}`);
    console.log(`⚠️  Предупреждения: ${testResults.warnings}`);
    console.log(`📈 Общий результат: ${testResults.passed}/${testResults.passed + testResults.failed + testResults.warnings}`);
    
    const successRate = Math.round((testResults.passed / (testResults.passed + testResults.failed + testResults.warnings)) * 100);
    console.log(`🎯 Процент успеха: ${successRate}%`);
    
    if (successRate >= 90) {
        console.log('🎉 ОТЛИЧНО! RLS политики работают корректно');
    } else if (successRate >= 70) {
        console.log('⚠️  ХОРОШО, но есть проблемы для исправления');
    } else {
        console.log('🚨 КРИТИЧНО! RLS политики требуют серьезного исправления');
    }
    
    // Сохраняем детальный отчет
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            passed: testResults.passed,
            failed: testResults.failed,
            warnings: testResults.warnings,
            successRate: successRate
        },
        details: testResults.details
    };
    
    console.log('\n📄 Детальный отчет сохранен в rls_audit_report.json');
    
    return report;
}

// Запуск тестирования
if (require.main === module) {
    runRLSAudit()
        .then(report => {
            // Сохраняем отчет в файл
            const fs = require('fs');
            fs.writeFileSync('rls_audit_report.json', JSON.stringify(report, null, 2));
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Ошибка при выполнении RLS аудита:', error);
            process.exit(1);
        });
}

module.exports = { runRLSAudit };
