#!/bin/bash

# Скрипт для обновления конфигурации Nginx на сервере

SERVER_IP="89.23.97.45"
SERVER_USER="root"
SERVER_PASSWORD="ry,ypR5ZuJo_ux"

echo "🔧 Обновляем конфигурацию Nginx на сервере..."

# Проверяем наличие sshpass
if ! command -v sshpass &> /dev/null; then
    echo "❌ sshpass не установлен. Установите: brew install hudochenkov/sshpass/sshpass"
    exit 1
fi

# Копируем новую конфигурацию Nginx
sshpass -p "$SERVER_PASSWORD" scp nginx-config.conf $SERVER_USER@$SERVER_IP:/tmp/nginx-config.conf

# Подключаемся к серверу и обновляем конфигурацию
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
    # Копируем конфигурацию в правильное место
    cp /tmp/nginx-config.conf /etc/nginx/sites-available/adaptoai.ru
    
    # Проверяем конфигурацию
    nginx -t
    
    if [ $? -eq 0 ]; then
        echo "✅ Конфигурация Nginx корректна"
        
        # Перезагружаем Nginx
        systemctl reload nginx
        echo "✅ Nginx перезагружен"
    else
        echo "❌ Ошибка в конфигурации Nginx"
        exit 1
    fi
    
    # Очищаем временные файлы
    rm -f /tmp/nginx-config.conf
EOF

echo "🎉 Конфигурация Nginx обновлена!"