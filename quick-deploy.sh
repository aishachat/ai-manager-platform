#!/bin/bash

# Быстрый скрипт для первоначальной настройки сервера
# Запускайте НА СЕРВЕРЕ после подключения через SSH

echo "🚀 Автоматическая настройка AI Manager Platform"
echo "================================================"

# Проверка что скрипт запущен от root
if [ "$EUID" -ne 0 ]; then 
  echo "❌ Запустите скрипт от root: sudo bash quick-deploy.sh"
  exit 1
fi

# Обновление системы
echo "📦 Обновление системы..."
apt update && apt upgrade -y

# Установка Node.js
echo "📦 Установка Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Установка PM2
echo "📦 Установка PM2..."
npm install -g pm2

# Установка Nginx
echo "📦 Установка Nginx..."
apt install -y nginx

# Установка Certbot для SSL
echo "📦 Установка Certbot..."
apt install -y certbot python3-certbot-nginx

# Создание директории для приложения
echo "📁 Создание директории приложения..."
mkdir -p /var/www/ai-platform
cd /var/www/ai-platform

# Запрос данных для .env
echo ""
echo "📝 Настройка переменных окружения"
echo "=================================="
read -p "Введите SUPABASE_URL: " SUPABASE_URL
read -p "Введите SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
read -p "Введите GIGACHAT_API_KEY: " GIGACHAT_API_KEY
read -p "Введите GIGACHAT_CLIENT_ID: " GIGACHAT_CLIENT_ID
read -p "Введите GIGACHAT_CLIENT_SECRET: " GIGACHAT_CLIENT_SECRET

# Создание .env файла
cat > .env << EOF
# Сервер
PORT=3001
NODE_ENV=production
VITE_API_URL=https://adaptoai.ru

# Supabase
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# GigaChat
GIGACHAT_API_KEY=$GIGACHAT_API_KEY
GIGACHAT_CLIENT_ID=$GIGACHAT_CLIENT_ID
GIGACHAT_CLIENT_SECRET=$GIGACHAT_CLIENT_SECRET
EOF

echo "✅ Файл .env создан"

# Создание конфигурации Nginx
echo "📝 Создание конфигурации Nginx..."
cat > /etc/nginx/sites-available/adaptoai.ru << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adaptoai.ru www.adaptoai.ru;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
}
EOF

# Активация конфигурации
ln -sf /etc/nginx/sites-available/adaptoai.ru /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации Nginx
nginx -t

# Перезапуск Nginx
systemctl restart nginx
systemctl enable nginx

echo "✅ Nginx настроен и запущен"

# Получение SSL сертификата
echo "🔐 Получение SSL сертификата..."
certbot --nginx -d adaptoai.ru -d www.adaptoai.ru --non-interactive --agree-tos --email admin@adaptoai.ru

echo ""
echo "✅ Первоначальная настройка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Загрузите код приложения в /var/www/ai-platform"
echo "2. Выполните: cd /var/www/ai-platform && npm install --legacy-peer-deps"
echo "3. Запустите: pm2 start server.js --name ai-platform --env production"
echo "4. Сохраните: pm2 save && pm2 startup"
echo ""
echo "🌐 Ваш сайт будет доступен по адресу: https://adaptoai.ru"
echo ""

