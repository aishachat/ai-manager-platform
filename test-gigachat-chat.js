import axios from 'axios';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config({ path: '.env.local' });

// Настройка сертификатов
const certPath = path.resolve(process.cwd(), 'russian_trusted_root_ca.crt');
if (fs.existsSync(certPath)) {
  process.env.NODE_EXTRA_CA_CERTS = certPath;
  console.log('✅ Сертификат НУЦ Минцифры загружен:', certPath);
} else {
  console.log('⚠️ Сертификат НУЦ Минцифры не найден, используем отключение проверки SSL');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function getGigaChatToken() {
  try {
    const authKey = process.env.GIGACHAT_API_KEY;
    const rqUID = uuidv4();
    
    console.log('Получаем токен доступа...');
    
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
        timeout: 30000,
        maxRedirects: 5
      }
    );
    
    console.log('✅ Токен получен успешно');
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Ошибка получения токена:', error.message);
    throw error;
  }
}

async function testGigaChatChat() {
  try {
    console.log('=== ТЕСТ ЧАТА С GIGACHAT ===');
    
    // Получаем токен
    const accessToken = await getGigaChatToken();
    console.log('Access Token (first 50 chars):', accessToken.substring(0, 50) + '...');
    
    // Отправляем запрос к чату
    console.log('Отправляем запрос к GigaChat API...');
    console.log('URL: https://gigachat.devices.sberbank.ru/api/v1/chat/completions');
    
    const requestBody = {
      model: 'GigaChat-2-Pro',
      messages: [
        {
          role: 'user',
          content: 'Привет! Ответь одним словом: "Работает"'
        }
      ],
      temperature: 0.7,
      max_tokens: 100,
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
          ca: fs.existsSync(certPath) ? fs.readFileSync(certPath) : undefined
        }),
        timeout: 30000
      }
    );
    
    console.log('✅ УСПЕХ! Ответ получен');
    console.log('Status:', response.status);
    console.log('Response data:', response.data);
    
    if (response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      console.log('Ответ GigaChat:', response.data.choices[0].message.content);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ ОШИБКА при отправке запроса к чату:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('Request was made but no response received');
      console.error('Request details:', error.request);
    }
    
    console.error('Full error:', error);
    throw error;
  }
}

// Запускаем тест
testGigaChatChat()
  .then(result => {
    console.log('🎉 Тест чата завершен успешно!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Тест чата завершен с ошибкой!');
    process.exit(1);
  });

