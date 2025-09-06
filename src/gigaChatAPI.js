// API для работы с GigaChat
const GIGACHAT_API_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';
const GIGACHAT_AUTH_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';

// Получение токена доступа к GigaChat
async function getGigaChatToken() {
  try {
    console.log('Getting GigaChat token...');
    console.log('API Key:', import.meta.env.VITE_GIGACHAT_API_KEY ? 'Present' : 'Missing');
    
    const response = await fetch(GIGACHAT_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'RqUID': '6f0b1291-c7f3-43c0-bb47-8790703601da',
        'Authorization': 'Bearer ' + import.meta.env.VITE_GIGACHAT_API_KEY
      },
      body: 'scope=GIGACHAT_API_PERS'
    });

    console.log('Auth response status:', response.status);
    console.log('Auth response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Auth error response:', errorText);
      throw new Error(`Auth failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Auth success, token received');
    return data.access_token;
  } catch (error) {
    console.error('Error getting GigaChat token:', error);
    throw error;
  }
}

// Отправка запроса к GigaChat
async function sendToGigaChat(content, contentType, userId) {
  try {
    console.log('Sending to GigaChat:', { contentType, userId, contentLength: content.length });
    
    const token = await getGigaChatToken();
    console.log('Token received, length:', token ? token.length : 0);
    
    // Формируем промпт в зависимости от типа контента
    let prompt = '';
    switch (contentType) {
      case 'site':
        prompt = `Проанализируй содержимое сайта: ${content}. 
        Извлеки ключевую информацию о компании, услугах, продуктах, контактах.
        Запомни эту информацию для пользователя с ID: ${userId}.
        Ответь: "Информация с сайта успешно обработана и сохранена для пользователя ${userId}."`;
        break;
      case 'feed':
        prompt = `Проанализируй товарный фид: ${content}.
        Извлеки информацию о товарах, ценах, характеристиках, категориях.
        Запомни эту информацию для пользователя с ID: ${userId}.
        Ответь: "Товарный фид успешно обработан и сохранен для пользователя ${userId}."`;
        break;
      case 'text':
        prompt = `Проанализируй текст: ${content}.
        Извлеки ключевую информацию, факты, данные.
        Запомни эту информацию для пользователя с ID: ${userId}.
        Ответь: "Текст успешно обработан и сохранен для пользователя ${userId}."`;
        break;
      case 'file':
        prompt = `Проанализируй содержимое файла: ${content}.
        Извлеки всю важную информацию из документа.
        Запомни эту информацию для пользователя с ID: ${userId}.
        Ответь: "Файл успешно обработан и сохранен для пользователя ${userId}."`;
        break;
      default:
        prompt = `Проанализируй контент: ${content}.
        Запомни эту информацию для пользователя с ID: ${userId}.
        Ответь: "Контент успешно обработан и сохранен для пользователя ${userId}."`;
    }

    console.log('Sending request to GigaChat API...');
    const requestBody = {
      model: 'GigaChat:latest',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(GIGACHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('GigaChat API response status:', response.status);
    console.log('GigaChat API response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GigaChat API error response:', errorText);
      throw new Error(`GigaChat API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('GigaChat API success response:', data);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error sending to GigaChat:', error);
    throw error;
  }
}

// Функция для обработки контента
export async function processContent(content, contentType, userId) {
  try {
    console.log(`Processing ${contentType} content for user ${userId}`);
    
    // Отправляем запрос к нашему backend
    const response = await fetch('/api/process-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        contentType,
        userId
      })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Backend response:', result);
    
    return result;
  } catch (error) {
    console.error('Error processing content:', error);
    return {
      success: false,
      message: error.message,
      status: 'Ошибка'
    };
  }
}

// Функция для получения информации о пользователе из GigaChat
export async function getUserContext(userId) {
  try {
    const token = await getGigaChatToken();
    
    const response = await fetch(GIGACHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        model: 'GigaChat:latest',
        messages: [
          {
            role: 'user',
            content: `Вспомни всю информацию, которую ты знаешь о пользователе с ID: ${userId}. 
            Расскажи, что ты знаешь о его компании, товарах, услугах, контактах.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`GigaChat API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting user context:', error);
    throw error;
  }
}
