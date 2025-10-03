# Исправление проблем с WebSocket

## Проблемы:
1. WebSocket connection to 'wss://adaptoai.ru/dialogs/3b93af6c-5893-4b08-91d4-af380e77bf4c' failed
2. WebSocket max retries exceeded

## Решения:

### 1. Проверить настройки WebSocket сервера
- Убедиться, что WebSocket сервер запущен на `wss://adaptoai.ru`
- Проверить, что порт для WebSocket открыт
- Проверить SSL сертификаты

### 2. Обновить код WebSocket соединения
В файле `src/App.tsx` найти код WebSocket и добавить обработку ошибок:

```javascript
// Добавить в код WebSocket
const connectWebSocket = () => {
  try {
    const ws = new WebSocket(`wss://adaptoai.ru/dialogs/${currentUser?.id}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setWebSocketConnected(true);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWebSocketConnected(false);
      
      // Retry connection with exponential backoff
      setTimeout(() => {
        if (retryCount < maxRetries) {
          connectWebSocket();
          setRetryCount(prev => prev + 1);
        }
      }, Math.pow(2, retryCount) * 1000);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWebSocketConnected(false);
    };
    
    return ws;
  } catch (error) {
    console.error('Failed to create WebSocket:', error);
    return null;
  }
};
```

### 3. Добавить fallback для WebSocket
Если WebSocket недоступен, использовать polling:

```javascript
const usePolling = !webSocketConnected;
const pollingInterval = 5000; // 5 seconds

useEffect(() => {
  if (usePolling) {
    const interval = setInterval(() => {
      // Poll for new messages
      fetchNewMessages();
    }, pollingInterval);
    
    return () => clearInterval(interval);
  }
}, [usePolling]);
```

### 4. Проверить CORS настройки
Убедиться, что WebSocket сервер разрешает соединения с вашего домена.

### 5. Проверить файрвол и сетевые настройки
- Убедиться, что порт WebSocket не заблокирован
- Проверить настройки прокси (если используется)

## Временное решение:
Добавить в код проверку доступности WebSocket и fallback на HTTP polling:

```javascript
const checkWebSocketAvailability = async () => {
  try {
    const ws = new WebSocket('wss://adaptoai.ru/health');
    return new Promise((resolve) => {
      ws.onopen = () => {
        ws.close();
        resolve(true);
      };
      ws.onerror = () => resolve(false);
      setTimeout(() => resolve(false), 3000);
    });
  } catch {
    return false;
  }
};
```
