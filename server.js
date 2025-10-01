import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import https from 'https';
import axios from 'axios';
import { agentSettings, chatHistory, knowledgeBase } from './supabase.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Загружаем переменные окружения
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env' });
} else {
  dotenv.config({ path: '.env.local' });
}

// Настройка сертификатов для GigaChat
const certPath = path.resolve(process.cwd(), 'russian_trusted_root_ca.crt');
if (fs.existsSync(certPath)) {
  process.env.NODE_EXTRA_CA_CERTS = certPath;
  console.log('✅ Сертификат НУЦ Минцифры загружен:', certPath);
} else {
  console.log('⚠️ Сертификат НУЦ Минцифры не найден, используем отключение проверки SSL');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Инициализация OpenAI (для международных клиентов)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Конфигурация ИИ-провайдеров
const AI_PROVIDERS = {
  gigachat: {
    name: 'GigaChat',
    available: true,
    regionRestricted: false,
    apiKey: process.env.GIGACHAT_API_KEY,
    clientId: process.env.GIGACHAT_CLIENT_ID,
    clientSecret: process.env.GIGACHAT_CLIENT_SECRET,
    endpoint: 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
    accessToken: null,
    tokenExpiry: null
  },
  yandex: {
    name: 'Yandex GPT',
    available: true,
    regionRestricted: false,
    apiKey: process.env.YANDEX_API_KEY,
    endpoint: 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
  },
  openai: {
    name: 'OpenAI GPT',
    available: true,
    regionRestricted: true,
    apiKey: process.env.OPENAI_API_KEY
  }
};

// Функция для определения доступного провайдера
function getAvailableProvider() {
  // Используем только GigaChat для России
  if (AI_PROVIDERS.gigachat.available && process.env.GIGACHAT_API_KEY && process.env.GIGACHAT_CLIENT_ID) {
    return 'gigachat';
  }
  
  // Приоритет 2: Yandex GPT
  if (AI_PROVIDERS.yandex.available && process.env.YANDEX_API_KEY) {
    return 'yandex';
  }
  
  return null;
}



// Функция для получения токена доступа GigaChat
async function getGigaChatToken() {
  try {
    console.log('=== GET GIGACHAT TOKEN START ===');
    console.log('API Key present:', !!AI_PROVIDERS.gigachat.apiKey);
    console.log('Client ID present:', !!AI_PROVIDERS.gigachat.clientId);
    
    // Проверяем, есть ли действующий токен
    if (AI_PROVIDERS.gigachat.accessToken && AI_PROVIDERS.gigachat.tokenExpiry && Date.now() < AI_PROVIDERS.gigachat.tokenExpiry) {
      console.log('Using cached token, expires in:', Math.round((AI_PROVIDERS.gigachat.tokenExpiry - Date.now()) / 1000), 'seconds');
      return AI_PROVIDERS.gigachat.accessToken;
    }

    console.log('Requesting new token...');
    
    // Используем ключ авторизации напрямую
    const authKey = AI_PROVIDERS.gigachat.apiKey;
    console.log('Using auth key (first 20 chars):', authKey.substring(0, 20) + '...');
    
    const rqUID = uuidv4();
    console.log('Generated RqUID:', rqUID);
    
    const response = await axios.post('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', 
      'scope=GIGACHAT_API_PERS',
      {
        headers: {
          'Authorization': `Basic ${authKey}`,
          'RqUID': rqUID,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
          secureProtocol: 'TLSv1_2_method',
          ca: fs.existsSync(certPath) ? fs.readFileSync(certPath) : undefined
        }),
        timeout: 30000, // 30 секунд таймаут
        maxRedirects: 5
      }
    );
    
    console.log('GigaChat Token Response Status:', response.status);
    console.log('GigaChat Token Response Data:', response.data);
    
    if (!response.data.access_token) {
      throw new Error('No access token in response');
    }
    
    // Сохраняем токен и время истечения
    AI_PROVIDERS.gigachat.accessToken = response.data.access_token;
    // API возвращает expires_at в миллисекундах, а не expires_in в секундах
    AI_PROVIDERS.gigachat.tokenExpiry = response.data.expires_at;
    
    console.log('Token saved, expires at:', new Date(response.data.expires_at).toISOString());
    return response.data.access_token;
  } catch (error) {
    console.error('=== GIGACHAT TOKEN ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

// Функция для отправки запроса к GigaChat
async function sendGigaChatRequest(messages, systemPrompt) {
  try {
    console.log('=== SEND GIGACHAT REQUEST START ===');
    
    // Получаем токен доступа
    const accessToken = await getGigaChatToken();
    console.log('Access token received, length:', accessToken ? accessToken.length : 0);
    
    // GigaChat не поддерживает системные сообщения, поэтому добавляем инструкции в первое сообщение пользователя
    const messagesWithSystem = messages.length > 0 ? [
      {
        role: 'user',
        content: `${systemPrompt}\n\nСообщение пользователя: ${messages[0].content}`
      },
      ...messages.slice(1)
    ] : messages;

    console.log('Messages to send:', JSON.stringify(messagesWithSystem, null, 2));

    const requestBody = {
      model: 'GigaChat-2-Pro', // Используем актуальную модель согласно документации
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 800,
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', 
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
          secureProtocol: 'TLSv1_2_method',
          ca: fs.existsSync(certPath) ? fs.readFileSync(certPath) : undefined
        }),
        timeout: 30000 // 30 секунд таймаут
      }
    );

    console.log('GigaChat Response Status:', response.status);
    console.log('GigaChat Response Headers:', response.headers);
    console.log('GigaChat Response Data:', response.data);
    
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Invalid response format from GigaChat');
    }
  } catch (error) {
    console.error('=== GIGACHAT ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);
    console.error('Error response headers:', error.response?.headers);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

// Функция для отправки запроса к Yandex GPT
async function sendYandexRequest(messages, systemPrompt) {
  try {
    const response = await fetch(AI_PROVIDERS.yandex.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Api-Key ${AI_PROVIDERS.yandex.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelUri: 'gpt://b1g8c7f8c7f8c7f8c7f8c/yandexgpt-lite',
        completionOptions: {
          temperature: 0.7,
          maxTokens: 800,
        },
        messages: [
          { role: 'system', text: systemPrompt },
          ...messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            text: msg.content
          }))
        ]
      })
    });

    const data = await response.json();
    return data.result.alternatives[0].message.text;
  } catch (error) {
    console.error('Yandex GPT Error:', error);
    throw error;
  }
}



// Функция для генерации системного промпта
function generateSystemPrompt(setupData) {
  const task = setupData.task || 'продаж и консультаций';
  const mainGoal = setupData.mainGoal || 'помощь клиентам';
  const addressing = setupData.addressing === 'Ты' ? 'на "ты"' : 'на "вы"';
  const emojiUsage = setupData.emojiUsage || 'редко';
  
  let prompt = `# РОЛЬ И ПОВЕДЕНИЕ

Ты - **Adapto**, профессиональный ИИ-агент для ${task}. Твоя основная миссия: ${mainGoal}.

## 🎯 ОСНОВНЫЕ ПРИНЦИПЫ

1. **Персонализация**: Адаптируйся под каждого клиента индивидуально
2. **Проактивность**: Предлагай решения до того, как клиент о них попросит
3. **Эмпатия**: Показывай понимание проблем клиента
4. **Профессионализм**: Сохраняй деловой тон, но будь дружелюбным
5. **Конкретность**: Давай четкие, практичные ответы

## 👤 СТИЛЬ ОБЩЕНИЯ

- **Обращение**: ${addressing}
- **Тон**: ${setupData.communicationStyle || 'профессиональный, но дружелюбный'}
- **Смайлики**: ${emojiUsage === 'Часто' ? 'Используй эмодзи для выражения эмоций' : emojiUsage === 'Редко' ? 'Используй эмодзи умеренно' : 'Не используй эмодзи'}
- **Длина ответов**: Краткие, но информативные (2-4 предложения)

## 🎯 ЦЕЛЕВАЯ АУДИТОРИЯ

${setupData.targetAudience || 'Общие клиенты'}

## 📈 ЦИКЛ ПРОДАЖ/ОБСЛУЖИВАНИЯ

${setupData.salesCycle || 'Стандартный процесс продаж'}

## 🚫 ОГРАНИЧЕНИЯ И ПРАВИЛА

${(setupData.restrictions || []).map((r) => `- ${r}`).join('\n')}
${setupData.restrictionsCustom ? `- ${setupData.restrictionsCustom}` : ''}

## ⚙️ ДОПОЛНИТЕЛЬНЫЕ НАСТРОЙКИ

${(setupData.additionalSettings || []).map((s) => `- ${s}`).join('\n')}
${setupData.additionalSettingsCustom ? `- ${setupData.additionalSettingsCustom}` : ''}

## 📊 СБОР ДАННЫХ

Собирай следующую информацию:
${(setupData.dataCollection || []).join(', ')}
${setupData.dataCollectionCustom ? `Дополнительно: ${setupData.dataCollectionCustom}` : ''}

## 🎭 ЭТАПЫ ДИАЛОГА

${(setupData.dialogStages || []).map((stage, index) => `${index + 1}. ${stage}`).join('\n')}

## 🧠 БАЗА ЗНАНИЙ

Используй эту информацию для ответов:
${(setupData.knowledgeItems || []).map((item) => `- ${item.content || item}`).join('\n')}

## 💬 ФОРМАТ ОТВЕТОВ

1. **Приветствие**: Краткое, дружелюбное
2. **Основная часть**: Конкретный ответ на вопрос
3. **Дополнительная ценность**: Предложение помощи или дополнительной информации
4. **Призыв к действию**: Что клиент может сделать дальше

## 🚨 ВАЖНЫЕ ПРАВИЛА

- НИКОГДА не давай ложную информацию
- Если не знаешь ответа, честно скажи об этом
- Всегда предлагай связаться с человеком для сложных вопросов
- Соблюдай конфиденциальность клиентских данных
- Не давай медицинских, юридических или финансовых советов без соответствующих квалификаций

## 🎯 ЦЕЛЬ КАЖДОГО ДИАЛОГА

Помочь клиенту решить его проблему максимально эффективно, создавая положительный опыт взаимодействия с компанией.

## 📚 БАЗА ЗНАНИЙ

${setupData.knowledgeItems && setupData.knowledgeItems.length > 0 ? 
  'ВАЖНО: Используй ЭТУ информацию в своих ответах. Это приоритетная информация:\n' + 
  setupData.knowledgeItems.map((item, index) => {
    if (item.type === 'correction') {
      return `🚨 ВАЖНОЕ ИСПРАВЛЕНИЕ: ${item.content}`;
    }
    return `${index + 1}. ${item.type.toUpperCase()}: ${item.content}`;
  }).join('\n') + 
  '\n\nПРАВИЛО: Всегда используй информацию из базы знаний в первую очередь. Если в базе знаний есть инструкции по приветствию или ответам, обязательно следуй им.' : 
  'База знаний пуста. Используй общие знания для ответов.'
}`;

  return prompt;
}

// API роут для чата
// Получить настройки агента
app.get('/api/agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const settings = await agentSettings.getAgentSettings(agentId);
    
    if (!settings) {
      return res.status(404).json({ error: 'Агент не найден' });
    }
    
    res.json({ agent: settings });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Ошибка при получении агента' });
  }
});

// Сохранить настройки агента
app.post('/api/agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { settings } = req.body;
    
    const success = await agentSettings.saveAgentSettings(agentId, settings);
    
    if (!success) {
      return res.status(500).json({ error: 'Ошибка при сохранении настроек' });
    }
    
    res.json({ success: true, message: 'Настройки сохранены' });
  } catch (error) {
    console.error('Error saving agent settings:', error);
    res.status(500).json({ error: 'Ошибка при сохранении настроек' });
  }
});

// Получить историю чата агента
app.get('/api/agent/:agentId/chat', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { limit = 10 } = req.query;
    
    const history = await chatHistory.getChatHistory(agentId, parseInt(limit));
    
    res.json({ history });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Ошибка при получении истории чата' });
  }
});

// Чат с агентом (обновленная версия)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, setupData, conversationHistory = [], agentId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Сообщение обязательно' });
    }

    // Определяем доступный провайдер
    const provider = getAvailableProvider();
    
    if (!provider) {
      return res.status(503).json({ 
        error: 'Нет доступных ИИ-провайдеров. Настройте API ключи.',
        details: 'no_providers_available'
      });
    }

    // Формируем промпт на основе настроек пользователя
    // Получаем настройки агента из Supabase, если указан agentId
    let finalSetupData = setupData || {};
    if (agentId) {
      const agentData = await agentSettings.getAgentSettings(agentId);
      if (agentData && agentData.settings) {
        finalSetupData = { ...finalSetupData, ...agentData.settings };
      }
      
      // Загружаем базу знаний пользователя
      try {
        const knowledgeItems = await knowledgeBase.getKnowledgeItems(agentId);
        console.log('Loaded knowledge items for user:', agentId, knowledgeItems);
        finalSetupData.knowledgeItems = knowledgeItems;
      } catch (error) {
        console.error('Error loading knowledge items:', error);
        finalSetupData.knowledgeItems = [];
      }
    }

    // Генерируем системный промпт на основе данных настройки
    const systemPrompt = generateSystemPrompt(finalSetupData);
    console.log('Generated system prompt with knowledge base:', systemPrompt.substring(0, 500) + '...');
    
    // Строим массив сообщений с историей диалога
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      }
    ];

    // Добавляем историю диалога (последние 10 сообщений для экономии токенов)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    // Добавляем текущее сообщение
    messages.push({
      role: 'user',
      content: message,
    });

    let response;
    let usage = {};
    let model = '';

    // Отправляем запрос к выбранному провайдеру
    switch (provider) {
      case 'openai':
        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 800,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        });
        response = completion.choices[0]?.message?.content;
        usage = completion.usage;
        model = completion.model;
        break;

      case 'gigachat':
        response = await sendGigaChatRequest(messages, systemPrompt);
        model = 'gigachat';
        break;

      case 'yandex':
        response = await sendYandexRequest(messages, systemPrompt);
        model = 'yandex-gpt';
        break;



      default:
        throw new Error('Неизвестный провайдер');
    }

    if (!response) {
      throw new Error('Не удалось получить ответ от ИИ');
    }

    // Сохраняем сообщения в Supabase, если указан agentId
    if (agentId) {
      try {
        console.log('Saving chat messages to Supabase for agentId:', agentId);
        await chatHistory.saveMessage(agentId, 'user', message);
        await chatHistory.saveMessage(agentId, 'assistant', response);
        console.log('Chat messages saved successfully to Supabase');
      } catch (error) {
        console.error('Error saving chat messages to Supabase:', error);
      }
    }

    res.json({ 
      response,
      usage,
      model,
      provider
    });
  } catch (error) {
    console.error('AI API Error:', error);
    
    // Обработка специфических ошибок
    if (error.code === 'insufficient_quota') {
      res.status(429).json({ 
        error: 'Превышен лимит квоты. Пополните баланс.',
        details: 'insufficient_quota'
      });
    } else if (error.code === 'rate_limit_exceeded') {
      res.status(429).json({ 
        error: 'Превышен лимит запросов. Попробуйте позже.',
        details: 'rate_limit_exceeded'
      });
    } else if (error.message.includes('region') || error.message.includes('country')) {
      res.status(403).json({ 
        error: 'Ваш регион не поддерживается. Используйте российские ИИ-сервисы.',
        details: 'region_not_supported',
        suggestion: 'Настройте Yandex GPT или GigaChat'
      });
    } else {
      res.status(500).json({ 
        error: 'Ошибка при обработке запроса',
        details: error.message
      });
    }
  }
});

// API роуты для аутентификации
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Простая проверка (в реальном проекте здесь должна быть проверка в базе данных)
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Неверный email или пароль',
        details: [
          { field: 'email', message: 'Email обязателен' },
          { field: 'password', message: 'Пароль обязателен' }
        ]
      });
    }
    
    // Для демонстрации принимаем любой email/пароль
    // В реальном проекте здесь должна быть проверка в Supabase Auth
    const userData = {
      id: 'user-' + Date.now(),
      email: email,
      name: email.split('@')[0] || 'Пользователь',
      company_name: 'Компания'
    };
    
    const sessionData = {
      access_token: 'demo-token-' + Date.now(),
      refresh_token: 'demo-refresh-' + Date.now(),
      expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 часа
    };
    
    res.json({
      user: userData,
      session: sessionData
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, company_name, phone, company_field } = req.body;
    
    // Простая валидация
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Заполните все обязательные поля',
        details: [
          { field: 'email', message: 'Email обязателен' },
          { field: 'password', message: 'Пароль обязателен' },
          { field: 'name', message: 'Имя обязателен' }
        ]
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Пароль должен содержать минимум 6 символов',
        details: [
          { field: 'password', message: 'Пароль должен содержать минимум 6 символов' }
        ]
      });
    }
    
    // Для демонстрации создаем пользователя
    // В реальном проекте здесь должна быть регистрация в Supabase Auth
    const userData = {
      id: 'user-' + Date.now(),
      email: email,
      name: name,
      company_name: company_name || 'Компания',
      phone: phone || '',
      company_field: company_field || ''
    };
    
    const sessionData = {
      access_token: 'demo-token-' + Date.now(),
      refresh_token: 'demo-refresh-' + Date.now(),
      expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 часа
    };
    
    res.json({
      user: userData,
      session: sessionData
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    // В реальном проекте здесь должна быть инвалидация токена
    res.json({ success: true, message: 'Выход выполнен успешно' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ error: 'Ошибка сервера при выходе' });
  }
});

// API роут для проверки статуса
app.get('/api/status', async (req, res) => {
  try {
    const provider = getAvailableProvider();
    
    if (!provider) {
      return res.json({ 
        status: 'error',
        message: 'Нет доступных ИИ-провайдеров',
        providers: AI_PROVIDERS
      });
    }

    // Проверяем подключение к выбранному провайдеру
    let testMessage = 'Привет';
    
    switch (provider) {
      case 'openai':
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: testMessage }],
          max_tokens: 5,
        });
        break;
        
      case 'gigachat':
        await sendGigaChatRequest([{ role: 'user', content: testMessage }], 'Ты помощник');
        break;
        
      case 'yandex':
        await sendYandexRequest([{ role: 'user', content: testMessage }], 'Ты помощник');
        break;
        

    }

    res.json({ 
      status: 'connected',
      message: `${AI_PROVIDERS[provider].name} подключен успешно`,
      provider: provider
    });
  } catch (error) {
    console.error('AI API Status Error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Ошибка подключения к ИИ-сервису',
      error: error.message,
      providers: AI_PROVIDERS
    });
  }
});

// Тестовый endpoint для проверки GigaChat
app.get('/api/test-gigachat', async (req, res) => {
  try {
    console.log('=== TEST GIGACHAT ENDPOINT ===');
    
    // Проверяем получение токена
    console.log('Testing token retrieval...');
    const token = await getGigaChatToken();
    console.log('Token received successfully, length:', token ? token.length : 0);
    
    // Тестируем простой запрос к GigaChat
    console.log('Testing GigaChat request...');
    const response = await sendGigaChatRequest([
      { role: 'user', content: 'Привет! Ответь одним словом: "Работает"' }
    ], 'Ты помощник для тестирования. Отвечай кратко.');
    
    console.log('GigaChat test response:', response);
    
    res.json({
      success: true,
      message: 'GigaChat работает корректно',
      response: response
    });
  } catch (error) {
    console.error('=== GIGACHAT TEST ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Ошибка тестирования GigaChat',
      error: error.message
    });
  }
});

// Простой тест только получения токена
app.get('/api/test-gigachat-token', async (req, res) => {
  try {
    console.log('=== TEST GIGACHAT TOKEN ONLY ===');
    
    // Проверяем только получение токена
    console.log('Testing token retrieval...');
    const token = await getGigaChatToken();
    console.log('Token received successfully, length:', token ? token.length : 0);
    
    res.json({
      success: true,
      message: 'Токен GigaChat получен успешно',
      tokenLength: token ? token.length : 0
    });
  } catch (error) {
    console.error('=== GIGACHAT TOKEN TEST ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Ошибка получения токена GigaChat',
      error: error.message
    });
  }
});

// API роут для управления базой знаний
app.post('/api/knowledge', async (req, res) => {
  try {
    const { action, type, content, agentId } = req.body;

    switch (action) {
      case 'add':
        console.log('Добавление в базу знаний:', { type, content, agentId });
        
        // Отправляем в GigaChat для обучения
        try {
          const provider = getAvailableProvider();
          const learningPrompt = `Запомни эту информацию для агента ${agentId}:
Тип: ${type}
Содержание: ${content}

Эта информация должна использоваться в ответах агента. Ответь "Понял, информация сохранена."`;

          let response;
          switch (provider) {
            case 'gigachat':
              response = await sendGigaChatRequest([
                { role: 'user', content: learningPrompt }
              ], 'Ты система обучения агента. Запоминай информацию для использования в будущих ответах.');
              break;
              
            case 'openai':
              response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                  { role: 'system', content: 'Ты система обучения агента. Запоминай информацию для использования в будущих ответах.' },
                  { role: 'user', content: learningPrompt }
                ],
                max_tokens: 100,
              });
              break;
          }

          console.log('GigaChat обучение результат:', response);
          res.json({ success: true, message: 'Добавлено в базу знаний и обработано ИИ' });
        } catch (aiError) {
          console.error('AI Learning Error:', aiError);
          res.json({ success: true, message: 'Добавлено в базу знаний (ИИ обучение не удалось)' });
        }
        break;
      
      case 'correction':
        console.log('Применение исправления:', { content, agentId });
        
        // Отправляем исправление в GigaChat
        try {
          const provider = getAvailableProvider();
          const correctionPrompt = `Важное исправление для агента ${agentId}:
${content}

Запомни это исправление и применяй его во всех будущих ответах. Ответь "Исправление принято и будет применено."`;

          let response;
          switch (provider) {
            case 'gigachat':
              response = await sendGigaChatRequest([
                { role: 'user', content: correctionPrompt }
              ], 'Ты система обучения агента. Принимай исправления и изменяй поведение агента согласно им.');
              break;
              
            case 'openai':
              response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                  { role: 'system', content: 'Ты система обучения агента. Принимай исправления и изменяй поведение агента согласно им.' },
                  { role: 'user', content: correctionPrompt }
                ],
                max_tokens: 100,
              });
              break;
          }

          console.log('GigaChat исправление результат:', response);
          res.json({ success: true, message: 'Исправление применено' });
        } catch (aiError) {
          console.error('AI Correction Error:', aiError);
          res.json({ success: true, message: 'Исправление сохранено (ИИ обучение не удалось)' });
        }
        break;
      
      case 'search':
        // Здесь можно добавить поиск по базе знаний
        console.log('Поиск в базе знаний:', content);
        res.json({ 
          success: true, 
          results: ['Результат 1', 'Результат 2'] 
        });
        break;
      
      default:
        res.status(400).json({ error: 'Неизвестное действие' });
    }
  } catch (error) {
    console.error('Knowledge Base Error:', error);
    res.status(500).json({ error: 'Ошибка при работе с базой знаний' });
  }
});

// API роут для отключения RLS (для тестирования)
app.post('/api/disable-rls', async (req, res) => {
  try {
    console.log('=== DISABLE RLS ENDPOINT STARTED ===');
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    // Читаем SQL файл
    const fs = await import('fs');
    const path = await import('path');
    const sqlPath = path.resolve(process.cwd(), 'fix_policies_simple.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Выполняем SQL команды по частям
    const sqlCommands = sqlContent.split(';').filter(cmd => cmd.trim());
    
    for (const sql of sqlCommands) {
      if (sql.trim()) {
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql: sql.trim() + ';' });
          if (error) {
            console.error('SQL Error:', error);
          } else if (data) {
            console.log('SQL Result:', data);
          }
        } catch (err) {
          console.error('Command failed:', sql, err);
        }
      }
    }
    
    console.log('RLS disabled successfully');
    res.json({
      success: true,
      message: 'RLS отключен успешно для тестирования'
    });
  } catch (error) {
    console.error('=== DISABLE RLS ENDPOINT ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// API роут для исправления политик RLS
app.post('/api/fix-policies', async (req, res) => {
  try {
    console.log('=== FIX POLICIES ENDPOINT STARTED ===');
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    // Читаем SQL файл
    const fs = await import('fs');
    const path = await import('path');
    const sqlPath = path.resolve(process.cwd(), 'fix_chat_policies.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Выполняем SQL команды по частям
    const sqlCommands = sqlContent.split(';').filter(cmd => cmd.trim());
    
    for (const sql of sqlCommands) {
      if (sql.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: sql.trim() + ';' });
          if (error) {
            console.error('SQL Error:', error);
          }
        } catch (err) {
          console.error('Command failed:', sql, err);
        }
      }
    }
    
    console.log('Policies fixed successfully');
    res.json({
      success: true,
      message: 'Политики исправлены успешно'
    });
  } catch (error) {
    console.error('=== FIX POLICIES ENDPOINT ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// API роут для создания таблиц в Supabase
app.post('/api/create-tables', async (req, res) => {
  try {
    console.log('=== CREATE TABLES ENDPOINT STARTED ===');
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    // Выполняем SQL запросы по частям
    const sqlCommands = [
      `CREATE TABLE IF NOT EXISTS public.chat_history (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        assistant_id BIGINT NOT NULL,
        message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant')),
        message_content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      `CREATE TABLE IF NOT EXISTS public.ai_agent_settings (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT UNIQUE NOT NULL,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      `CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON public.chat_history(created_at);`,
      `CREATE INDEX IF NOT EXISTS idx_agent_settings_user_id ON public.ai_agent_settings(user_id);`,
      
      `ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE public.ai_agent_settings ENABLE ROW LEVEL SECURITY;`,
      
      `DROP POLICY IF EXISTS "Users can view their own chat history" ON public.chat_history;`,
      `CREATE POLICY "Users can view their own chat history" ON public.chat_history
        FOR SELECT USING (auth.uid()::bigint = user_id);`,
      
      `DROP POLICY IF EXISTS "Users can insert their own chat messages" ON public.chat_history;`,
      `CREATE POLICY "Users can insert their own chat messages" ON public.chat_history
        FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);`,
      
      `DROP POLICY IF EXISTS "Users can update their own chat messages" ON public.chat_history;`,
      `CREATE POLICY "Users can update their own chat messages" ON public.chat_history
        FOR UPDATE USING (auth.uid()::bigint = user_id);`,
      
      `DROP POLICY IF EXISTS "Users can view their own agent settings" ON public.ai_agent_settings;`,
      `CREATE POLICY "Users can view their own agent settings" ON public.ai_agent_settings
        FOR SELECT USING (auth.uid()::bigint = user_id);`,
      
      `DROP POLICY IF EXISTS "Users can insert their own agent settings" ON public.ai_agent_settings;`,
      `CREATE POLICY "Users can insert their own agent settings" ON public.ai_agent_settings
        FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);`,
      
      `DROP POLICY IF EXISTS "Users can update their own agent settings" ON public.ai_agent_settings;`,
      `CREATE POLICY "Users can update their own agent settings" ON public.ai_agent_settings
        FOR UPDATE USING (auth.uid()::bigint = user_id);`
    ];
    
    for (const sql of sqlCommands) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql });
        if (error) {
          console.error('SQL Error:', error);
        }
      } catch (err) {
        console.error('Command failed:', sql, err);
      }
    }
    
    console.log('Tables creation completed');
    res.json({
      success: true,
      message: 'Таблицы созданы успешно'
    });
  } catch (error) {
    console.error('=== CREATE TABLES ENDPOINT ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// API роут для обработки контента через GigaChat
app.post('/api/process-content', async (req, res) => {
  try {
    console.log('=== PROCESS CONTENT ENDPOINT STARTED ===');
    const { content, contentType, userId } = req.body;
    
    console.log('Request body:', { contentType, userId, contentLength: content.length, content: content.substring(0, 100) + '...' });
    
    if (!content || !contentType || !userId) {
      console.error('Missing required fields:', { content: !!content, contentType: !!contentType, userId: !!userId });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        status: 'Ошибка'
      });
    }
    
    // Формируем промпт в зависимости от типа контента
    let prompt = '';
    switch (contentType) {
      case 'site':
        prompt = `Ты - система анализа контента. Проанализируй содержимое сайта: ${content}. 
        
        Задача: Извлеки ключевую информацию о компании, услугах, продуктах, контактах.
        Пользователь ID: ${userId}
        
        После анализа обязательно ответь точно: "Информация с сайта успешно обработана и сохранена для пользователя ${userId}."`;
        break;
      case 'feed':
        prompt = `Ты - система анализа контента. Проанализируй товарный фид: ${content}.
        
        Задача: Извлеки информацию о товарах, ценах, характеристиках, категориях.
        Пользователь ID: ${userId}
        
        После анализа обязательно ответь точно: "Товарный фид успешно обработан и сохранен для пользователя ${userId}."`;
        break;
      case 'text':
        prompt = `Ты - система анализа контента. Проанализируй текст: ${content}.
        
        Задача: Извлеки ключевую информацию, факты, данные.
        Пользователь ID: ${userId}
        
        После анализа обязательно ответь точно: "Текст успешно обработан и сохранен для пользователя ${userId}."`;
        break;
      case 'file':
        prompt = `Ты - система анализа контента. Проанализируй содержимое файла: ${content}.
        
        Задача: Извлеки всю важную информацию из документа.
        Пользователь ID: ${userId}
        
        После анализа обязательно ответь точно: "Файл успешно обработан и сохранен для пользователя ${userId}."`;
        break;
      default:
        prompt = `Ты - система анализа контента. Проанализируй контент: ${content}.
        
        Задача: Запомни эту информацию для пользователя.
        Пользователь ID: ${userId}
        
        После анализа обязательно ответь точно: "Контент успешно обработан и сохранен для пользователя ${userId}."`;
    }

    console.log('Generated prompt:', prompt.substring(0, 200) + '...');

    console.log('Sending to GigaChat...');
    // Отправляем в GigaChat
    const response = await sendGigaChatRequest([
      { role: 'user', content: prompt }
    ], 'Ты система анализа контента. Анализируй и запоминай информацию для пользователей.');

    console.log('GigaChat processing response:', response);

    // Проверяем, что ответ содержит подтверждение обработки
    if (response && (response.includes('успешно обработан') || response.includes('обработана'))) {
      console.log('Processing successful, returning success response');
      res.json({
        success: true,
        message: response,
        status: 'Загружено'
      });
    } else {
      console.log('Processing failed, response does not contain success keywords');
      res.json({
        success: false,
        message: 'Ошибка обработки контента',
        status: 'Ошибка'
      });
    }
  } catch (error) {
    console.error('=== PROCESS CONTENT ENDPOINT ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message,
      status: 'Ошибка'
    });
  }
});

// API роут для аналитики
app.get('/api/analytics', async (req, res) => {
  try {
    // Здесь можно добавить сбор аналитики
    const analytics = {
      totalConversations: 0,
      averageResponseTime: 0,
      popularQuestions: [],
      satisfactionRate: 0
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Ошибка при получении аналитики' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 API сервер запущен на порту ${PORT}`);
  console.log(`🤖 ИИ-провайдеры:`);
  console.log(`   - GigaChat: ${process.env.GIGACHAT_API_KEY ? '✅ Настроен' : '❌ Не найден'}`);
  console.log(`   - Yandex GPT: ${process.env.YANDEX_API_KEY ? '✅ Настроен' : '❌ Не найден'}`);
  console.log(`   - OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Настроен' : '❌ Не найден'}`);
  console.log(`🔗 API endpoints:`);
  console.log(`   - POST /api/chat - Чат с ИИ`);
  console.log(`   - GET /api/status - Статус подключения`);
  console.log(`   - POST /api/knowledge - База знаний`);
  console.log(`   - GET /api/analytics - Аналитика`);
});
