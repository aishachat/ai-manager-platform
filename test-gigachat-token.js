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

async function testGigaChatToken() {
  try {
    console.log('=== ТЕСТ ПОЛУЧЕНИЯ ТОКЕНА GIGACHAT ===');
    
    const authKey = process.env.GIGACHAT_API_KEY;
    const clientId = process.env.GIGACHAT_CLIENT_ID;
    
    console.log('Auth Key present:', !!authKey);
    console.log('Client ID present:', !!clientId);
    console.log('Auth Key (first 20 chars):', authKey ? authKey.substring(0, 20) + '...' : 'NOT FOUND');
    
    if (!authKey) {
      throw new Error('GIGACHAT_API_KEY не найден в переменных окружения');
    }
    
    const rqUID = uuidv4();
    console.log('Generated RqUID:', rqUID);
    
    console.log('Отправляем запрос к GigaChat OAuth...');
    console.log('URL: https://ngw.devices.sberbank.ru:9443/api/v2/oauth');
    
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
    
    console.log('✅ УСПЕХ! Токен получен');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', response.data);
    
    if (response.data.access_token) {
      console.log('Access Token (first 50 chars):', response.data.access_token.substring(0, 50) + '...');
      console.log('Expires at:', new Date(response.data.expires_at).toISOString());
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ ОШИБКА при получении токена:');
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
testGigaChatToken()
  .then(result => {
    console.log('🎉 Тест завершен успешно!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Тест завершен с ошибкой!');
    process.exit(1);
  });

