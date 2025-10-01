#!/bin/bash

# Скрипт деплоя AI Manager Platform на сервер
# Использование: ./deploy.sh

SERVER_IP="89.23.97.45"
SERVER_USER="root"
SERVER_PASSWORD="ry,ypR5ZuJo_ux"
DOMAIN="adaptoai.ru"

echo "🚀 Деплой AI Manager Platform на сервер..."

# Проверяем наличие sshpass
if ! command -v sshpass &> /dev/null; then
    echo "❌ sshpass не установлен. Установите: brew install hudochenkov/sshpass/sshpass"
    exit 1
fi

# Создаем архив проекта (исключая секреты)
echo "📦 Создаем архив проекта..."
tar --exclude='.env*' \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='cache' \
    --exclude='logs' \
    --exclude='uploads' \
    -czf ai-platform.tar.gz .

# Загружаем на сервер
echo "📤 Загружаем на сервер..."
sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no ai-platform.tar.gz "$SERVER_USER@$SERVER_IP:/tmp/"

# Разворачиваем на сервере
echo "🔧 Разворачиваем на сервере..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << EOF

# Создаем директорию если не существует
mkdir -p /var/www/ai-platform

# Переходим в директорию
cd /var/www/ai-platform

# Останавливаем приложение
pm2 stop ai-platform 2>/dev/null || true

# Удаляем старые файлы (кроме node_modules и .env)
find . -maxdepth 1 -type f -delete
find . -maxdepth 1 -type d ! -name 'node_modules' ! -name '.' ! -name '.env*' -exec rm -rf {} + 2>/dev/null || true

# Распаковываем новый код
tar -xzf /tmp/ai-platform.tar.gz

# Устанавливаем зависимости
echo "⚙️ Устанавливаем зависимости..."
npm install --legacy-peer-deps

# Создаем .env файл если не существует
if [ ! -f .env ]; then
    echo "📝 Создаем .env файл..."
    cat > .env << 'ENVEOF'
PORT=3001
VITE_API_URL=https://$DOMAIN
NODE_ENV=production
# Добавьте здесь ваши секреты:
# SUPABASE_URL=your-supabase-url
# SUPABASE_ANON_KEY=your-supabase-key
# GIGACHAT_CLIENT_ID=your-gigachat-id
# GIGACHAT_CLIENT_SECRET=your-gigachat-secret
ENVEOF
    echo "⚠️  ВАЖНО: Отредактируйте файл .env на сервере с вашими секретами!"
fi

# Запускаем приложение
echo "🚀 Запускаем приложение..."
pm2 start server.js --name ai-platform --env production
pm2 save

# Очищаем временные файлы
rm -f /tmp/ai-platform.tar.gz

echo "✅ Деплой завершен!"
echo "📱 Ваша платформа доступна по адресу: https://$DOMAIN"
echo "🔧 Для просмотра логов: ssh $SERVER_USER@$SERVER_IP 'pm2 logs ai-platform'"
echo "🔄 Для перезапуска: ssh $SERVER_USER@$SERVER_IP 'pm2 restart ai-platform'"

EOF

# Очищаем локальный архив
rm -f ai-platform.tar.gz

echo "🎉 Деплой завершен!"
echo "📝 Не забудьте настроить секреты в файле .env на сервере!"