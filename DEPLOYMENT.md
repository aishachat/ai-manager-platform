# 🚀 Инструкции по деплою AI Manager Platform

## 📋 Информация о сервере
- **IP:** 89.23.97.45
- **Домен:** adaptoai.ru
- **SSL:** Настроен через сертификат от Регру
- **Порт:** 3001 (внутренний)

## 🔐 Управление секретами

### ❌ НЕ ДЕЛАЙТЕ ТАК:
- Не добавляйте .env файлы в Git
- Не коммитьте секреты в код
- Не храните пароли в репозитории

### ✅ ПРАВИЛЬНО:
- Секреты хранятся на сервере в .env файлах
- Используйте .env.example как шаблон
- Настройте GitHub Secrets для CI/CD

## 🛠️ Первоначальная настройка

### 1. Настройка секретов на сервере
```bash
# Подключитесь к серверу
ssh root@89.23.97.45

# Перейдите в директорию проекта
cd /var/www/ai-platform

# Создайте .env файл с вашими секретами
nano .env
```

Пример .env файла:
```bash
PORT=3001
VITE_API_URL=https://adaptoai.ru
NODE_ENV=production

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-real-anon-key

# GigaChat
GIGACHAT_CLIENT_ID=your-real-client-id
GIGACHAT_CLIENT_SECRET=your-real-client-secret

# OpenAI (если используется)
OPENAI_API_KEY=your-real-openai-key
```

### 2. Настройка GitHub Secrets
В настройках репозитория GitHub добавьте:
- `SERVER_HOST` = 89.23.97.45
- `SERVER_USER` = root
- `SERVER_PASSWORD` = ry,ypR5ZuJo_ux

## 🔄 Способы деплоя

### Способ 1: Автоматический деплой (GitHub Actions)
```bash
# Просто запушите изменения в main ветку
git add .
git commit -m "Обновление платформы"
git push origin main
```

### Способ 2: Ручной деплой
```bash
# Запустите скрипт деплоя
./deploy.sh
```

### Способ 3: Быстрый деплой изменений
```bash
# Для быстрых изменений без полного деплоя
ssh root@89.23.97.45 "cd /var/www/ai-platform && pm2 restart ai-platform"
```

## 📱 Доступ к платформе
- **Основной сайт:** https://adaptoai.ru
- **API:** https://adaptoai.ru/api/
- **WebSocket:** wss://adaptoai.ru/socket.io/

## 🔧 Управление сервисом

### Подключение к серверу
```bash
ssh root@89.23.97.45
```

### Команды PM2
```bash
# Просмотр статуса
pm2 status

# Просмотр логов
pm2 logs ai-platform

# Перезапуск
pm2 restart ai-platform

# Остановка
pm2 stop ai-platform
```

### Команды Nginx
```bash
# Проверка конфигурации
nginx -t

# Перезапуск
systemctl restart nginx
```

## 🆘 Решение проблем

### Если приложение не запускается
1. Проверить логи: `pm2 logs ai-platform`
2. Проверить .env файл: `cat /var/www/ai-platform/.env`
3. Проверить зависимости: `npm install --legacy-peer-deps`

### Если сайт недоступен
1. Проверить Nginx: `systemctl status nginx`
2. Проверить SSL: `curl -I https://adaptoai.ru`

### Если секреты не работают
1. Проверить .env файл на сервере
2. Убедиться что переменные окружения загружены
3. Перезапустить приложение: `pm2 restart ai-platform`

## 📞 Поддержка
При возникновении проблем проверьте:
1. Логи приложения
2. Статус сервисов
3. Сетевое подключение
4. SSL сертификаты
5. Переменные окружения