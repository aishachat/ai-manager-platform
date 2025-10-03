// Полноценная система ИИ-агента с правильной архитектурой
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import axios from 'axios';
import https from 'https';
import KnowledgeDatabase from './knowledge-db.js';
import UnifiedRAGSystem from './unified-rag-system.js';
import ChunkingSystem from './chunking.js';
import ImprovedContentParser from './improved-content-parser.js';
import UnifiedAIAgentFlow from './unified-ai-agent-flow.js';
import AIResponseValidator from './ai-response-validator.js';
import monitoring from './monitoring-system.js';
import { smartTokenManager } from './smart-token-manager.js';

// Импортируем функцию парсинга сайтов
// Кэш для результатов парсинга
const parseCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа
const MAX_CACHE_SIZE = 100; // Максимум 100 URL в кэше

// Пул браузеров для параллельной обработки
const browserPool = [];
const MAX_BROWSERS = 3;
let poolInitialized = false;

async function initializeBrowserPool() {
  if (poolInitialized) return;
  
  console.log('🚀 Инициализация пула браузеров...');
  const playwright = await import('playwright');
  const { chromium } = playwright;
  
  for (let i = 0; i < MAX_BROWSERS; i++) {
    const browser = await chromium.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    });
    browserPool.push({ browser, inUse: false });
  }
  
  poolInitialized = true;
  console.log(`✅ Пул из ${MAX_BROWSERS} браузеров готов`);
}

async function getBrowser() {
  await initializeBrowserPool();
  
  // Ищем свободный браузер
  let freeBrowser = browserPool.find(b => !b.inUse);
  
  // Если все заняты, ждем
  while (!freeBrowser) {
    await new Promise(resolve => setTimeout(resolve, 100));
    freeBrowser = browserPool.find(b => !b.inUse);
  }
  
  freeBrowser.inUse = true;
  return freeBrowser;
}

function releaseBrowser(browserWrapper) {
  browserWrapper.inUse = false;
}

function getCachedResult(url) {
  const cached = parseCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('💾 Кэш попадание для:', url);
    return cached.result;
  }
  
  // Очищаем устаревший кэш
  if (cached) {
    parseCache.delete(url);
  }
  
  return null;
}

function setCachedResult(url, result) {
  // Ограничиваем размер кэша
  if (parseCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = parseCache.keys().next().value;
    parseCache.delete(oldestKey);
  }
  
  parseCache.set(url, {
    result,
    timestamp: Date.now()
  });
  
  console.log('💾 Результат закэширован для:', url);
}

async function parseWebsiteWithRetry(url, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🌐 Парсинг (попытка ${attempt}/${maxRetries}):`, url);
      
      // Проверяем кэш
      const cached = getCachedResult(url);
      if (cached) {
        return cached;
      }
      
      // Получаем браузер из пула
      const browserWrapper = await getBrowser();
      
      try {
        const result = await parseWebsiteInternal(url, browserWrapper.browser);
        
        // Кэшируем результат
        setCachedResult(url, result);
        
        return result;
        
      } finally {
        // Освобождаем браузер
        releaseBrowser(browserWrapper);
      }
      
    } catch (error) {
      lastError = error;
      console.log(`⚠️ Попытка ${attempt} неудачна:`, error.message);
      
      if (attempt < maxRetries) {
        // Экспоненциальная задержка: 1с, 2с, 4с
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`⏳ Ожидание ${delay}ms перед следующей попыткой...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

async function parseWebsiteInternal(url, browser) {
  let page = null;
  try {
    page = await browser.newPage();
    
    // Настройки страницы для Playwright
    try {
      // Playwright использует setViewportSize вместо setViewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Playwright использует setExtraHTTPHeaders для User-Agent
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      console.log('✅ Настройки страницы применены (Playwright)');
    } catch (e) {
      console.log('⚠️ Настройки страницы пропущены:', e.message);
    }
    
    // Настройка таймаутов
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);
    
    // Переходим на страницу с улучшенными настройками
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', // Более быстрая загрузка
      timeout: 30000 
    });
    
      // Увеличенное ожидание для интернет-магазинов и динамического контента
      await page.waitForTimeout(5000);
      
      // Ждем загрузки основного контента
      try {
        await page.waitForSelector('body', { timeout: 10000 });
        console.log('📄 Основной контент загружен');
      } catch (e) {
        console.log('⚠️ Основной контент не найден, продолжаем...');
      }
      
      // Ждем загрузки цен и товаров (необязательно)
      try {
        await page.waitForSelector('.price, .cost, .product-price, [class*="price"], [class*="cost"], .product, .item, .card', { timeout: 5000 });
        console.log('💰 Цены/товары загружены');
      } catch (e) {
        console.log('⚠️ Цены/товары не найдены, продолжаем...');
      }
      
      // Дополнительное ожидание для динамического контента
      await page.waitForTimeout(2000);
    
    // Специальные селекторы для интернет-магазинов и бизнес-сайтов
    const ecommerceSelectors = [
      // Основной контент
      'main', 'article', 'section',
      '.content', '.post-content', '.entry-content',
      '.product', '.catalog', '.shop', '.store',
      
      // Заголовки
      'h1, h2, h3, h4, h5, h6',
      
      // Текстовый контент
      'p', 'div', 'span', 'li', 'td', 'th',
      
      // Специфичные для ИМ и услуг
      '.product-title', '.product-description', '.product-price',
      '.product-name', '.product-info', '.product-details',
      '.category', '.brand', '.collection', '.service',
      '.price', '.cost', '.amount', '.value', '.tariff', '.plan',
      '.item', '.card', '.product', '.goods', '.offer',
      
      // Тарифы и планы
      '.tariff', '.plan', '.package', '.subscription', '.pricing',
      '.rate', '.fee', '.charge', '.cost', '.price-list',
      '[class*="tariff"]', '[class*="plan"]', '[class*="price"]',
      '[class*="cost"]', '[class*="rate"]', '[class*="fee"]',
      
      // Детальные описания товаров и услуг
      '.description', '.specs', '.characteristics',
      '.features', '.benefits', '.details', '.info',
      '.service-description', '.service-info',
      
      // Контактная информация
      '.contact', '.footer', '.header', '.contacts',
      'a[href^="tel:"]', 'a[href^="mailto:"]',
      '.phone', '.email', '.address',
      
      // Навигация
      '.menu', '.navigation', '.breadcrumb', '.nav',
      
      // Специальные блоки
      '.pricing-table', '.price-card', '.service-card',
      '.product-card', '.offer-card', '.plan-card'
    ];
    
      const text = await page.evaluate((selectors) => {
        let fullText = '';
        
        // Удаляем все стили и скрипты
        const styleElements = document.querySelectorAll('style, script, link[rel="stylesheet"], noscript');
        styleElements.forEach(el => el.remove());
        
        // Удаляем все элементы с CSS-подобными классами
        const cssElements = document.querySelectorAll('[class*="rec"], [id*="rec"], [class*="tn-"], [class*="t-"]');
        cssElements.forEach(el => el.remove());
        
        selectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              // Проверяем, что элемент не содержит CSS код
              const textContent = el.textContent?.trim();
              if (textContent && 
                  !textContent.includes('#rec') && 
                  !textContent.includes('tn-elem') && 
                  !textContent.includes('@media') &&
                  !textContent.includes('display:') &&
                  !textContent.includes('height:') &&
                  !textContent.includes('width:') &&
                  !textContent.includes('left:') &&
                  !textContent.includes('top:') &&
                  !textContent.includes('position:') &&
                  !textContent.includes('z-index:') &&
                  !textContent.includes('background:') &&
                  !textContent.includes('color:') &&
                  !textContent.includes('font-') &&
                  !textContent.includes('margin:') &&
                  !textContent.includes('padding:') &&
                  !textContent.includes('border:') &&
                  !textContent.includes('calc(') &&
                  !textContent.includes('px') &&
                  !textContent.includes('%') &&
                  !textContent.includes('vh') &&
                  !textContent.includes('vw') &&
                  !textContent.includes('em') &&
                  !textContent.includes('rem') &&
                  textContent.length > 10) {
                fullText += textContent + '\n';
              }
            });
          } catch (e) {
            // Игнорируем ошибки селекторов
          }
        });
        
        // Дополнительно извлекаем цены, тарифы и товары
        const priceElements = document.querySelectorAll('[class*="price"], [class*="cost"], [class*="value"], [class*="amount"], [class*="руб"], [class*="₽"], [class*="tariff"], [class*="plan"], [class*="rate"], [class*="fee"], .price, .cost, .amount, .tariff, .plan, .rate, .fee');
        priceElements.forEach(el => {
          if (el.textContent && el.textContent.trim()) {
            const priceText = el.textContent.trim();
            // Проверяем, что это действительно цена/тариф
            if (priceText.match(/\d+/) && (priceText.includes('₽') || priceText.includes('руб') || priceText.includes('$') || priceText.includes('€') || priceText.includes('от') || priceText.includes('до'))) {
              fullText += 'ЦЕНА/ТАРИФ: ' + priceText + '\n';
            }
          }
        });
        
        // Извлекаем тарифные планы и пакеты услуг
        const tariffElements = document.querySelectorAll('[class*="tariff"], [class*="plan"], [class*="package"], [class*="subscription"], [class*="pricing"], .tariff, .plan, .package, .subscription, .pricing');
        tariffElements.forEach(el => {
          if (el.textContent && el.textContent.trim()) {
            fullText += 'ТАРИФНЫЙ ПЛАН: ' + el.textContent.trim() + '\n';
          }
        });
        
        const productElements = document.querySelectorAll('[class*="product"], [class*="item"], [class*="card"], [class*="design"], [class*="style"], [class*="альбом"], [class*="дизайн"], [class*="услуга"], [class*="service"], [class*="товар"], .product, .item, .card, .service');
        productElements.forEach(el => {
          if (el.textContent && el.textContent.trim()) {
            fullText += 'ТОВАР/УСЛУГА: ' + el.textContent.trim() + '\n';
          }
        });
        
        // Извлекаем характеристики и описания
        const descriptionElements = document.querySelectorAll('[class*="description"], [class*="spec"], [class*="feature"], [class*="characteristic"], [class*="detail"], [class*="info"]');
        descriptionElements.forEach(el => {
          if (el.textContent && el.textContent.trim()) {
            fullText += 'ОПИСАНИЕ: ' + el.textContent.trim() + '\n';
          }
        });
        
        // Извлекаем услуги и комплектации
        const serviceElements = document.querySelectorAll('[class*="service"], [class*="package"], [class*="complect"], [class*="option"], [class*="услуга"], [class*="комплект"]');
        serviceElements.forEach(el => {
          if (el.textContent && el.textContent.trim()) {
            fullText += 'УСЛУГА: ' + el.textContent.trim() + '\n';
          }
        });
        
        // Извлекаем FAQ контент
        const faqElements = document.querySelectorAll('[class*="faq"], [class*="question"], [class*="answer"], [id*="faq"], [id*="question"], .faq, .question, .answer, .faq-item, .faq-question, .faq-answer');
        faqElements.forEach(el => {
          if (el.textContent && el.textContent.trim()) {
            const faqText = el.textContent.trim();
            // Проверяем, что это действительно FAQ
            if (faqText.length > 10 && faqText.length < 500 && 
                (faqText.includes('?') || faqText.includes('вопрос') || faqText.includes('ответ'))) {
              fullText += 'FAQ: ' + faqText + '\n';
            }
          }
        });

        // Извлекаем отзывы и рейтинги
        const reviewElements = document.querySelectorAll('[class*="review"], [class*="rating"], [class*="comment"], [class*="отзыв"], [class*="рейтинг"], .review, .rating, .comment, .testimonial, .feedback');
        reviewElements.forEach(el => {
          if (el.textContent && el.textContent.trim()) {
            const reviewText = el.textContent.trim();
            if (reviewText.length > 20 && reviewText.length < 1000) {
              fullText += 'ОТЗЫВ: ' + reviewText + '\n';
            }
          }
        });

        // Извлекаем акции и скидки
        const promoElements = document.querySelectorAll('[class*="sale"], [class*="discount"], [class*="promo"], [class*="акция"], [class*="скидка"], [class*="специальная"], .sale, .discount, .promo, .offer, .special');
        promoElements.forEach(el => {
          if (el.textContent && el.textContent.trim()) {
            const promoText = el.textContent.trim();
            if (promoText.length > 5 && promoText.length < 200) {
              fullText += 'АКЦИЯ: ' + promoText + '\n';
            }
          }
        });

        // Извлекаем товары по нишам
        const nicheKeywords = {
          'САНТЕХНИКА': ['радиатор', 'труба', 'кран', 'смеситель', 'унитаз', 'ванна', 'душ', 'отопление', 'водоснабжение', 'канализация', 'фитинг', 'арматура', 'бойлер', 'насос', 'фильтр'],
          'МЕБЕЛЬ': ['диван', 'кровать', 'стол', 'стул', 'шкаф', 'комод', 'полка', 'кресло', 'тумба', 'столешница', 'фасад', 'дверца', 'ящик', 'матрас', 'подушка'],
          'ОДЕЖДА': ['платье', 'блузка', 'рубашка', 'брюки', 'джинсы', 'юбка', 'пиджак', 'куртка', 'пальто', 'свитер', 'футболка', 'белье', 'нижнее', 'lingerie', 'трусы', 'бюстгальтер', 'белье', 'бельё', 'нижнее белье', 'кутюрное белье'],
          'ОБУВЬ': ['туфли', 'ботинки', 'кроссовки', 'сапоги', 'сандалии', 'босоножки', 'кеды', 'мокасины', 'лоферы', 'сапожки', 'угги', 'шлепанцы'],
          'ЭЛЕКТРОНИКА': ['телефон', 'смартфон', 'ноутбук', 'компьютер', 'планшет', 'наушники', 'колонка', 'камера', 'телевизор', 'холодильник', 'стиральная', 'микроволновка'],
          'КРАСОТА': ['крем', 'шампунь', 'маска', 'сыворотка', 'тональный', 'помада', 'тушь', 'тени', 'лак', 'духи', 'дезодорант', 'гель', 'скраб', 'пилинг'],
          'СПОРТ': ['кроссовки', 'спортивный', 'тренировка', 'фитнес', 'йога', 'бег', 'велосипед', 'лыжи', 'коньки', 'мяч', 'гантели', 'тренажер', 'форма', 'костюм'],
          'ДОМ': ['посуда', 'тарелка', 'чашка', 'кастрюля', 'сковорода', 'полотенце', 'постельное', 'покрывало', 'ковер', 'шторы', 'лампа', 'светильник', 'ваза', 'декор'],
          'АВТО': ['масло', 'фильтр', 'тормозная', 'колодка', 'диск', 'шина', 'аккумулятор', 'свеча', 'ремень', 'подвеска', 'амортизатор', 'стойка', 'пружина'],
          'САД': ['семена', 'рассада', 'удобрение', 'грунт', 'горшок', 'лопата', 'грабли', 'лейка', 'секатор', 'перчатки', 'саженец', 'куст', 'дерево', 'цветок'],
          'ПОЛИГРАФИЯ': ['альбом', 'фотоальбом', 'выпускной', 'альбом выпускника', 'фотокнига', 'книга', 'брошюра', 'каталог', 'буклет', 'листовка', 'визитка', 'открытка', 'календарь', 'плакат', 'баннер'],
          'ДИЗАЙН': ['дизайн', 'стиль', 'скандинавский', 'классический', 'современный', 'минимализм', 'лофт', 'прованс', 'кантри', 'хай-тек', 'эко', 'винтаж', 'ретро', 'модерн', 'арт-деко'],
          'УСЛУГИ': ['услуга', 'сервис', 'массаж', 'консультация', 'обучение', 'курс', 'тренинг', 'поддержка', 'сопровождение', 'менторство', 'коучинг', 'терапия', 'лечение', 'диагностика'],
          'ТАРИФЫ': ['тариф', 'план', 'пакет', 'подписка', 'абонемент', 'стоимость', 'цена', 'прайс', 'rate', 'fee', 'charge', 'subscription', 'plan', 'package'],
          'ЦЕНЫ': ['цена', 'стоимость', 'рублей', '₽', '$', '€', 'от', 'до', 'за', 'цена за', 'стоимость за', 'минимальный заказ', 'максимальный', 'скидка', 'акция', 'специальная цена']
        };
        
        // Ищем товары по нишам
        Object.entries(nicheKeywords).forEach(([niche, keywords]) => {
          keywords.forEach(keyword => {
            // Ищем по всем элементам
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
              if (el.textContent && el.textContent.toLowerCase().includes(keyword.toLowerCase())) {
                // Проверяем, что это не вложенный элемент
                const hasParentWithKeyword = Array.from(el.parentElement?.querySelectorAll('*') || [])
                  .some(parent => parent !== el && parent.textContent && parent.textContent.toLowerCase().includes(keyword.toLowerCase()));
                
                if (!hasParentWithKeyword) {
                  fullText += `${niche}: ${el.textContent.trim()}\n`;
                }
              }
            });
          });
        });
        
        return fullText;
      }, ecommerceSelectors);
    
    await page.close();
    
             // Улучшенная очистка для интернет-магазинов
             const cleanedText = text
               .replace(/\s+/g, ' ')
               // Удаляем cookie и GDPR уведомления
               .replace(/cookie|Cookie|COOKIE/gi, '')
               .replace(/Accept|Принять|Customise|Consent|Preferences|Согласие|Настройки/gi, '')
               .replace(/Show more|Show less|Показать больше|Показать меньше/gi, '')
               .replace(/Always Active|Necessary|Functional|Analytics|Performance|Advertisement/gi, '')
               .replace(/No cookies to display|Куки не отображаются/gi, '')
               // Удаляем JavaScript код
               .replace(/t_onFuncLoad|t_onReady|t396_|t650_|t1093_|t807_|t367_|t994_|t-records|t-popup/gi, '')
               .replace(/function\(\)|setTimeout|addEventListener|querySelector|getElementById/gi, '')
               .replace(/console\.log|console\.error|console\.warn/gi, '')
               .replace(/[\{\}\(\)\[\];]/g, ' ')
               .replace(/var\s+\w+\s*=|const\s+\w+\s*=|let\s+\w+\s*=/gi, '')
               // Удаляем CSS код - расширенная версия
               .replace(/#rec\d+/gi, '')
               .replace(/tn-elem/gi, '')
               .replace(/@media[^}]+}/gi, '')
               .replace(/display:\s*[^;]+;/gi, '')
               .replace(/height:\s*[^;]+;/gi, '')
               .replace(/width:\s*[^;]+;/gi, '')
               .replace(/left:\s*[^;]+;/gi, '')
               .replace(/top:\s*[^;]+;/gi, '')
               .replace(/position:\s*[^;]+;/gi, '')
               .replace(/z-index:\s*[^;]+;/gi, '')
               .replace(/background[^;]*;/gi, '')
               .replace(/color:\s*[^;]+;/gi, '')
               .replace(/font-[^:]*:\s*[^;]+;/gi, '')
               .replace(/margin[^:]*:\s*[^;]+;/gi, '')
               .replace(/padding[^:]*:\s*[^;]+;/gi, '')
               .replace(/border[^:]*:\s*[^;]+;/gi, '')
               .replace(/calc\([^)]+\)/gi, '')
               .replace(/\d+px/gi, '')
               .replace(/\d+%/gi, '')
               .replace(/\d+vh/gi, '')
               .replace(/\d+vw/gi, '')
               .replace(/\d+em/gi, '')
               .replace(/\d+rem/gi, '')
               // Удаляем HTML теги и атрибуты
               .replace(/<[^>]*>/g, ' ')
               .replace(/&nbsp;/g, ' ')
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               // Удаляем технические строки
               .replace(/undefined|null|NaN/gi, '')
               .replace(/true|false/gi, '')
               .replace(/window\.|document\.|this\./gi, '')
               // Улучшаем извлечение цен и характеристик
               .replace(/(\d+)\s*руб/gi, 'ЦЕНА: $1 рублей')
               .replace(/(\d+)\s*₽/gi, 'ЦЕНА: $1 рублей')
               .replace(/(\d+)\s*долл/gi, 'ЦЕНА: $1 долларов')
               .replace(/(\d+)\s*евро/gi, 'ЦЕНА: $1 евро')
               .replace(/от\s*(\d+)/gi, 'ЦЕНА ОТ: $1')
               .replace(/до\s*(\d+)/gi, 'ЦЕНА ДО: $1')
               .replace(/минимальный\s*заказ/gi, 'МИНИМАЛЬНЫЙ ЗАКАЗ')
               .replace(/скандинавский\s*стиль/gi, 'ДИЗАЙН: скандинавский стиль')
               .replace(/классический\s*стиль/gi, 'ДИЗАЙН: классический стиль')
               .replace(/современный\s*стиль/gi, 'ДИЗАЙН: современный стиль')
               .replace(/альбом\s*выпускника/gi, 'ТОВАР: альбом выпускника')
               .replace(/фотоальбом/gi, 'ТОВАР: фотоальбом')
               .replace(/индивидуализация/gi, 'УСЛУГА: индивидуализация')
               .replace(/комплектация/gi, 'УСЛУГА: комплектация')
               // Улучшаем извлечение FAQ
               .replace(/(вопрос|question)[\s\S]*?(ответ|answer)/gi, 'FAQ: $&')
               .replace(/(как|что|где|когда|почему|зачем)[\s\S]{10,200}\?/gi, 'FAQ: $&')
               // Улучшаем извлечение отзывов
               .replace(/(отзыв|review|рекомендую|рекомендация)[\s\S]{20,500}/gi, 'ОТЗЫВ: $&')
               // Улучшаем извлечение акций
               .replace(/(скидка|акция|специальная цена|распродажа)[\s\S]{5,200}/gi, 'АКЦИЯ: $&')
               .replace(/\s+/g, ' ')
               .trim();
    
    // Ограничиваем размер
    let finalContent = cleanedText;
    if (cleanedText.length > 25000) { // Увеличили лимит для ИМ
      const sentences = cleanedText.split(/[.!?]+/).filter(s => s.trim().length > 10);
      let result = '';
      let currentLength = 0;
      
      for (const sentence of sentences) {
        if (currentLength + sentence.length > 25000) break;
        result += sentence.trim() + '. ';
        currentLength = result.length;
      }
      
      finalContent = result.trim();
    }
    
    console.log('✅ Website parsed successfully, content length:', finalContent.length);
    
    // Извлекаем структурированные метаданные
    const metadata = await page.evaluate(() => {
      const meta = {};
      
      // Извлекаем мета-теги
      meta.title = document.title || '';
      meta.description = document.querySelector('meta[name="description"]')?.content || '';
      meta.keywords = document.querySelector('meta[name="keywords"]')?.content || '';
      meta.ogTitle = document.querySelector('meta[property="og:title"]')?.content || '';
      meta.ogDescription = document.querySelector('meta[property="og:description"]')?.content || '';
      meta.ogImage = document.querySelector('meta[property="og:image"]')?.content || '';
      
      // Извлекаем структурированные данные (JSON-LD)
      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
      meta.structuredData = [];
      jsonLdScripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent);
          meta.structuredData.push(data);
        } catch (e) {
          // Игнорируем ошибки парсинга
        }
      });
      
      // Извлекаем контактную информацию
      meta.contacts = {
        phones: [],
        emails: [],
        addresses: []
      };
      
      // Телефоны
      const phoneRegex = /(\+?[7-8]?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2})/g;
      const phoneMatches = document.body.textContent.match(phoneRegex);
      if (phoneMatches) {
        meta.contacts.phones = [...new Set(phoneMatches)];
      }
      
      // Email
      const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
      const emailMatches = document.body.textContent.match(emailRegex);
      if (emailMatches) {
        meta.contacts.emails = [...new Set(emailMatches)];
      }
      
      // Адреса (простой поиск)
      const addressElements = document.querySelectorAll('[class*="address"], [class*="адрес"], .address, .contact-address');
      addressElements.forEach(el => {
        if (el.textContent && el.textContent.trim().length > 10) {
          meta.contacts.addresses.push(el.textContent.trim());
        }
      });
      
      return meta;
    });

    return {
      success: true,
      content: finalContent,
      length: finalContent.length,
      metadata: metadata,
      extractedData: {
        faqCount: (finalContent.match(/FAQ:/g) || []).length,
        priceCount: (finalContent.match(/ЦЕНА:/g) || []).length,
        productCount: (finalContent.match(/ТОВАР:/g) || []).length,
        serviceCount: (finalContent.match(/УСЛУГА:/g) || []).length,
        reviewCount: (finalContent.match(/ОТЗЫВ:/g) || []).length,
        promoCount: (finalContent.match(/АКЦИЯ:/g) || []).length
      }
    };
    
  } catch (error) {
    console.error('❌ Error parsing website:', error);
    throw error;
  } finally {
    // Закрываем страницу, но НЕ браузер
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        console.log('⚠️ Error closing page:', closeError.message);
      }
    }
  }
}

async function parseWebsite(url) {
  const startTime = Date.now();
  try {
    console.log('🔍 [ImprovedParser] Parsing website:', url);
    
    // Проверяем кэш
    const cacheKey = `parse_${url}`;
    const cached = parseCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('✅ [ImprovedParser] Using cached parsing result');
      return cached.result;
    }
    
    // Используем улучшенный парсер
    const parser = new ImprovedContentParser();
    const result = await parser.parseContent(url, {
      preserveImportantContent: true,
      extractMetadata: true,
      cleanAggressively: false
    });
    
    // Кэшируем результат
    parseCache.set(cacheKey, {
      result: result,
      timestamp: Date.now()
    });
    
    // Мониторинг успешного парсинга
    const parseTime = Date.now() - startTime;
    monitoring.recordParsingAttempt(url, result.success, parseTime);
    
    console.log('✅ [ImprovedParser] Website parsed successfully, content length:', result.content.length);
    
    return result;
    
  } catch (error) {
    console.log('⚠️ All retry attempts failed, trying simple fetch:', error.message);
    
    // Fallback: простой fetch
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const html = await response.text();
      
      // Простая очистка HTML
      const cleanedText = html
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<style[^>]*>.*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      const parseTime = Date.now() - startTime;
      monitoring.recordParsingAttempt(url, true, parseTime);
      
      return {
        success: true,
        content: cleanedText,
        length: cleanedText.length
      };
      
    } catch (fetchError) {
      const parseTime = Date.now() - startTime;
      monitoring.recordParsingAttempt(url, false, parseTime, fetchError);
      console.error('❌ Fallback fetch also failed:', fetchError.message);
      throw fetchError;
    }
  }
}

class AIAgentSystem {
  constructor(config = {}) {
    this.config = {
      supabaseUrl: config.supabaseUrl || process.env.SUPABASE_URL,
      supabaseKey: config.supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
      tokenBudget: config.tokenBudget || 800,
      maxChunks: config.maxChunks || 3,
      cacheTTL: config.cacheTTL || 3600000,
      ...config
    };

    // Инициализация компонентов
    this.supabase = createClient(this.config.supabaseUrl, this.config.supabaseKey);
    this.knowledgeDB = new KnowledgeDatabase();
    this.ragSystem = new UnifiedRAGSystem(this.knowledgeDB);
    this.chunkingSystem = new ChunkingSystem();
    this.contentParser = new ImprovedContentParser();
    
    // Инициализация унифицированного флоу и валидатора
    this.unifiedFlow = new UnifiedAIAgentFlow({
      supabaseUrl: this.config.supabaseUrl,
      supabaseKey: this.config.supabaseKey,
      tokenBudget: this.config.tokenBudget,
      maxChunks: this.config.maxChunks,
      enableValidation: true,
      enableMonitoring: true
    });
    
    this.responseValidator = new AIResponseValidator({
      supabaseUrl: this.config.supabaseUrl,
      supabaseKey: this.config.supabaseKey,
      validationLevel: 'strict',
      enableFactCheck: true,
      enableHallucinationDetection: true,
      enableRelevanceCheck: true,
      enableQualityCheck: true
    });
    
    // Кеш для FAQ и системных промптов
    this.faqCache = new Map();
    this.promptCache = new Map();
    this.searchCache = new Map();
    this.settingsCache = new Map();
    
    console.log('🤖 AI Agent System initialized');
    
    // Подключаемся к Redis кэшу
    this.initializeCache();
  }
  
  // Инициализация кэша
  async initializeCache() {
    try {
      await this.ragSystem.connectCache();
      console.log('✅ [AIAgent] Cache system initialized');
    } catch (error) {
      console.log('⚠️ [AIAgent] Cache initialization failed:', error.message);
    }
  }
  
  // Основной метод обработки запроса пользователя (через унифицированный флоу)
  async processUserRequest(request) {
    try {
      console.log('🚀 [AIAgent] Processing user request through unified flow...');
      
      // Обрабатываем запрос через унифицированный флоу
      const result = await this.unifiedFlow.processUserRequest(request);
      
      // Дополнительная валидация ответа (если нужно)
      if (result.success && this.responseValidator) {
        const validationResult = await this.responseValidator.validateResponse(
          result.response,
          { searchResults: result.searchResults },
          request
        );
        
        if (!validationResult.isValid) {
          console.log('⚠️ [AIAgent] Additional validation failed, using fallback response');
          result.response = await this.generateFallbackResponse(request);
          result.validationWarnings = validationResult.warnings;
        }
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ [AIAgent] Error processing user request:', error);
      
      // Fallback к старому методу при ошибке
      return await this.processUserRequestLegacy(request);
    }
  }
  
  // Генерация fallback ответа
  async generateFallbackResponse(request) {
    return {
      content: 'Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз или обратитесь к менеджеру.',
      tokens_used: 50,
      model: 'fallback',
      processed_at: new Date().toISOString()
    };
  }

  // Ищем последний активный диалог в окне по времени
  async getRecentConversationId(userId, assistantId, channel = 'admin', windowMinutes = 45) {
    try {
      const { data, error } = await this.supabase
        .from('conversations')
        .select('id, last_message_at, status')
        .eq('user_id', userId)
        .eq('assistant_id', assistantId)
        .eq('channel', channel)
        .gte('last_message_at', new Date(Date.now() - windowMinutes * 60 * 1000).toISOString())
        .order('last_message_at', { ascending: false })
        .limit(1);
      if (error) return null;
      return (data && data.length > 0) ? data[0].id : null;
    } catch (e) {
      return null;
    }
  }

  // Создаем запись разговора при необходимости (безопасно)
  async ensureConversation(conversationId, userId, assistantId, channel = 'admin') {
    try {
      if (!conversationId) return null;
      const { data, error } = await this.supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .single();
      if (error || !data) {
        const { data: created, error: insertErr } = await this.supabase
          .from('conversations')
          .insert({ id: conversationId, user_id: userId, assistant_id: assistantId, channel, status: 'active', started_at: new Date().toISOString(), last_message_at: new Date().toISOString() })
          .select('id')
          .single();
        if (insertErr) return null;
        return created.id;
      }
      return data.id;
    } catch (e) {
      return null;
    }
  }

  // Инициализация UnifiedRAG системы
  async initializeRAG(userId = null, nicheId = null) {
    try {
      console.log('🚀 Инициализация UnifiedRAG системы...');
      await this.ragSystem.initialize(userId, nicheId);
      console.log('✅ UnifiedRAG система инициализирована');
    } catch (error) {
      console.error('❌ Ошибка инициализации UnifiedRAG системы:', error);
    }
  }

  // 1. СЛОЙ ХРАНЕНИЯ ЗНАНИЙ
  async processKnowledgeSource(userId, assistantId, sourceType, content, options = {}) {
    try {
      console.log(`📚 [ImprovedParser] Processing knowledge source for user ${userId}, assistant ${assistantId}`);
      
      // Обрабатываем контент через улучшенный парсер
      let processedContent = content;
      let metadata = {};
      
      if (sourceType === 'site' && content.startsWith('http')) {
        console.log('🌐 [ImprovedParser] Parsing website content...');
        const parseResult = await this.contentParser.parseContent(content, {
          preserveImportantContent: true,
          extractMetadata: true,
          cleanAggressively: false
        });
        
        if (parseResult.success && parseResult.content && parseResult.content.length > 100) {
          processedContent = parseResult.content;
          metadata = parseResult.metadata || {};
          console.log(`✅ [ImprovedParser] Website parsed: ${parseResult.content.length} characters`);
          console.log(`📊 [ImprovedParser] Metadata:`, metadata);
          
          // Логируем извлеченные данные для анализа
          if (parseResult.extractedData) {
            console.log('📊 Extracted data:', parseResult.extractedData);
          }
          
          // УЛУЧШЕННОЕ ДОБАВЛЕНИЕ МЕТАДАННЫХ ДЛЯ ЛУЧШЕГО ПОИСКА
          if (parseResult.metadata) {
            let metadataText = '';
            
            // Заголовок и описание
            if (parseResult.metadata.title) {
              metadataText += `ЗАГОЛОВОК САЙТА: ${parseResult.metadata.title}\n`;
            }
            if (parseResult.metadata.description) {
              metadataText += `ОПИСАНИЕ САЙТА: ${parseResult.metadata.description}\n`;
            }
            
            // Контактная информация
            if (parseResult.metadata.contacts) {
              if (parseResult.metadata.contacts.phones.length > 0) {
                metadataText += `ТЕЛЕФОНЫ: ${parseResult.metadata.contacts.phones.join(', ')}\n`;
              }
              if (parseResult.metadata.contacts.emails.length > 0) {
                metadataText += `EMAIL: ${parseResult.metadata.contacts.emails.join(', ')}\n`;
              }
              if (parseResult.metadata.contacts.addresses.length > 0) {
                metadataText += `АДРЕСА: ${parseResult.metadata.contacts.addresses.join(', ')}\n`;
              }
            }
            
            // Структурированные данные
            if (parseResult.metadata.structuredData && parseResult.metadata.structuredData.length > 0) {
              metadataText += `СТРУКТУРИРОВАННЫЕ ДАННЫЕ: ${JSON.stringify(parseResult.metadata.structuredData)}\n`;
            }
            
            // Статистика контента
            if (parseResult.metadata.stats) {
              const stats = parseResult.metadata.stats;
              if (stats.productCount > 0) metadataText += `ТОВАРОВ НА САЙТЕ: ${stats.productCount}\n`;
              if (stats.serviceCount > 0) metadataText += `УСЛУГ НА САЙТЕ: ${stats.serviceCount}\n`;
              if (stats.reviewCount > 0) metadataText += `ОТЗЫВОВ: ${stats.reviewCount}\n`;
              if (stats.promoCount > 0) metadataText += `АКЦИЙ: ${stats.promoCount}\n`;
            }
            
            processedContent = metadataText + '\n\nОСНОВНОЙ КОНТЕНТ:\n' + processedContent;
            console.log('📊 Metadata added to content:', metadataText.length, 'characters');
          }
        } else {
          console.log('⚠️ Website parsing failed, using URL as content');
          processedContent = content;
        }
      } else if (sourceType === 'feed') {
        console.log('📊 Parsing feed content...');
        const feedResult = await this.parseFeed(content);
        
        if (feedResult.success && feedResult.content) {
          processedContent = feedResult.content;
          console.log(`✅ Feed parsed: ${feedResult.content.length} characters`);
        } else {
          console.log('⚠️ Feed parsing failed, using raw content');
          processedContent = content;
        }
      } else if (sourceType === 'file') {
        console.log('📁 Parsing file content...');
        const fileResult = await this.parseFile(content);
        
        if (fileResult.success && fileResult.content) {
          processedContent = fileResult.content;
          console.log(`✅ File parsed: ${fileResult.content.length} characters`);
        } else {
          console.log('⚠️ File parsing failed, using raw content');
          processedContent = content;
        }
      }
      
      // Создаем источник знаний
      const sourceOptions = {
        ...options,
        sourceUrl: sourceType === 'site' && content.startsWith('http') ? content : null,
        metadata: metadata
      };
      const source = await this.createKnowledgeSource(userId, assistantId, sourceType, processedContent, sourceOptions);
      
      // Создаем чанки
      const chunks = await this.createChunksFromContent(source.id, userId, assistantId, processedContent, {
        ...options,
        createEmbeddings: true // Включаем создание эмбеддингов
      });
      
      // Создаем векторные представления (если доступно)
      if (options.createEmbeddings !== false) {
        await this.createEmbeddingsForChunks(chunks);
      }
      
      return {
        success: true,
        source,
        chunks,
        totalChunks: chunks.length,
        totalTokens: chunks.reduce((sum, chunk) => sum + chunk.tokens_estimate, 0)
      };
      
    } catch (error) {
      console.error('❌ Error processing knowledge source:', error);
      throw error;
    }
  }

  async createKnowledgeSource(userId, assistantId, sourceType, content, options = {}) {
    try {
      console.log(`💾 Creating knowledge source for user ${userId}, assistant ${assistantId}`);
      console.log(`💾 Source type: ${sourceType}, content length: ${content.length}`);
      
      const sourceData = {
        user_id: userId,
        assistant_id: assistantId,
        source_type: sourceType,
        source_url: options.sourceUrl || null,
        title: options.title || `Source ${Date.now()}`,
        original_content: content,
        processed_content: this.preprocessContent(content, sourceType),
        status: 'Загружено',
        niche_id: options.nicheId || null,
        structured_data: (
          sourceType === 'feed' ? this.normalizeFeedContent(content, options.sourceUrl) :
          this.buildStructuredDataForSource(options.sourceUrl, sourceType)
        ) || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('💾 Source data prepared:', {
        user_id: sourceData.user_id,
        assistant_id: sourceData.assistant_id,
        source_type: sourceData.source_type,
        title: sourceData.title,
        content_length: sourceData.original_content.length
      });
      
      const { data, error } = await this.supabase
        .from('knowledge_sources')
        .insert(sourceData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating knowledge source:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log('✅ Knowledge source created successfully:', data.id);
      // Автокраулинг ссылок для сайта (в фоне)
      try {
        if ((sourceType === 'site' || sourceType === 'website') && (options.autoCrawl || true)) {
          this.crawlSiteLinks(data.id, { maxPages: 40 }).then(() => {
            console.log('🔗 Auto-crawl finished for source', data.id);
          }).catch((e) => console.warn('Auto-crawl error', e?.message || e));
        }
      } catch (_) {}

      // Автогенерация чанков из товарного фида
      try {
        if (sourceType === 'feed' && sourceData.structured_data && Array.isArray(sourceData.structured_data.products)) {
          const productChunks = sourceData.structured_data.products.slice(0, 500).map((p, idx) => {
            const text = `Товар: ${p.title || p.name || '—'}${p.category ? `\nКатегория: ${p.category}` : ''}${p.price ? `\nЦена: ${p.price}` : ''}${p.availability ? `\nНаличие: ${p.availability}` : ''}${p.url ? `\nURL: ${p.url}` : ''}${p.sku ? `\nSKU: ${p.sku}` : ''}`;
            const metadata = this.extractChunkMetadata(text);
            const chunkType = this.computeChunkType(metadata);
            return {
              source_id: data.id,
              user_id: userId,
              assistant_id: assistantId,
              niche_id: options.nicheId || null,
              chunk_text: text,
              chunk_summary: `Товар ${p.title || p.name || ''}`.trim(),
              tokens_estimate: text.length / 4,
              words_count: (text.match(/\S+/g) || []).length,
              full_text_hash: (text.length + '_' + idx).toString(),
              chunk_index: idx,
              metadata,
              chunk_type: chunkType,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          });
          if (productChunks.length) {
            await this.supabase.from('knowledge_chunks').insert(productChunks);
            console.log(`🧩 Inserted ${productChunks.length} chunks from feed products`);
          }
        }
      } catch (e) {
        console.warn('Feed chunk generation error:', e?.message || e);
      }

      return data;
      
    } catch (error) {
      console.error('❌ Failed to create knowledge source:', error);
      throw error;
    }
  }

  // Формируем структурированные ссылки по правилу для сайтов (services/portfolio/contacts/about/price)
  buildStructuredDataForSource(sourceUrl, sourceType) {
    try {
      if (!sourceUrl || !/^https?:\/\//i.test(sourceUrl)) return null;
      if (!sourceType || (sourceType !== 'site' && sourceType !== 'website')) return null;
      const url = new URL(sourceUrl);
      const base = `${url.protocol}//${url.host}`;
      const uniq = new Map();
      const add = (label, path) => {
        const full = path.startsWith('http') ? path : base + (path.startsWith('/') ? path : `/${path}`);
        if (!uniq.has(label)) uniq.set(label, full);
      };
      // Канонические и русские варианты
      add('services', '/services');
      add('services', '/uslugi');
      add('portfolio', '/portfolio');
      add('portfolio', '/works');
      add('contacts', '/contacts');
      add('contacts', '/kontakty');
      add('about', '/about');
      add('about', '/o-nas');
      add('prices', '/prices');
      add('prices', '/ceny');
      const links = Array.from(uniq.entries()).map(([label, url]) => ({ label, url }));
      return links.length ? { links } : null;
    } catch {
      return null;
    }
  }

  // ================= CRAWLER (SITEMAP/ANCHORS) =================
  normalizeUrl(baseUrl, href) {
    try {
      if (!href) return null;
      const base = new URL(baseUrl);
      let url;
      if (href.startsWith('http')) {
        url = new URL(href);
      } else if (href.startsWith('//')) {
        url = new URL(base.protocol + href);
      } else if (href.startsWith('/')) {
        url = new URL(base.origin + href);
      } else if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return null;
      } else {
        url = new URL(base.origin + (base.pathname.endsWith('/') ? base.pathname : base.pathname + '/') + href);
      }
      // только тот же хост
      if (url.host !== base.host) return null;
      // убираем hash
      url.hash = '';
      // нормализуем слеши
      const normalized = url.toString().replace(/\/$/, '');
      return normalized;
    } catch {
      return null;
    }
  }

  labelForPath(pathname) {
    const p = pathname.toLowerCase();
    if (/uslugi|services/.test(p)) return 'services';
    if (/portfolio|works|cases/.test(p)) return 'portfolio';
    if (/kontakt|contacts/.test(p)) return 'contacts';
    if (/about|o-nas/.test(p)) return 'about';
    if (/price|ceny|prajs/.test(p)) return 'prices';
    return 'page';
  }

  async crawlSiteLinks(sourceId, options = {}) {
    const maxPages = Math.min(Math.max(options.maxPages || 30, 1), 200);
    try {
      // загружаем источник
      const { data: src, error: selErr } = await this.supabase
        .from('knowledge_sources')
        .select('id, user_id, niche_id, source_type, source_url, structured_data')
        .eq('id', sourceId)
        .single();
      if (selErr || !src) throw new Error('Источник не найден');
      if (!src.source_url || (src.source_type !== 'site' && src.source_type !== 'website')) {
        throw new Error('Краулинг доступен только для источников типа site/website');
      }

      const baseUrl = src.source_url;
      const found = new Map();

      // 1) sitemap.xml
      try {
        const sitemapUrl = baseUrl.replace(/\/$/, '') + '/sitemap.xml';
        const resp = await fetch(sitemapUrl, { method: 'GET' });
        if (resp.ok) {
          const xml = await resp.text();
          const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/gi)).map(m => m[1]).slice(0, maxPages);
          locs.forEach(href => {
            const normalized = this.normalizeUrl(baseUrl, href);
            if (normalized) {
              const label = this.labelForPath(new URL(normalized).pathname);
              if (!found.has(normalized)) found.set(normalized, { label, url: normalized });
            }
          });
        }
      } catch {}

      // 2) главная страница – якорные ссылки
      try {
        const resp = await fetch(baseUrl, { method: 'GET' });
        if (resp.ok) {
          const html = await resp.text();
          const anchors = Array.from(html.matchAll(/href=\"([^\"]+)\"/gi)).map(m => m[1]).slice(0, maxPages);
          anchors.forEach(href => {
            const normalized = this.normalizeUrl(baseUrl, href);
            if (normalized && !found.has(normalized)) {
              const label = this.labelForPath(new URL(normalized).pathname);
              found.set(normalized, { label, url: normalized });
            }
          });
        }
      } catch {}

      const links = Array.from(found.values());
      if (links.length === 0) {
        return { success: true, links: [] };
      }

      // мержим со stuctured_data.links
      const sd = src.structured_data || {};
      const oldLinks = Array.isArray(sd.links) ? sd.links : [];
      const uniq = new Map(oldLinks.map(l => [l.url, l]));
      links.forEach(l => { if (!uniq.has(l.url)) uniq.set(l.url, l); });
      const merged = Array.from(uniq.values()).slice(0, 500);

      const { error: updErr } = await this.supabase
        .from('knowledge_sources')
        .update({ structured_data: { ...(sd || {}), links: merged }, updated_at: new Date().toISOString() })
        .eq('id', sourceId);
      if (updErr) throw updErr;

      return { success: true, links: merged };
    } catch (e) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  // УЛУЧШЕННОЕ извлечение метаданных из чанка для лучшего поиска
  extractChunkMetadata(text) {
    const metadata = {
      hasPrice: false,
      hasProduct: false,
      hasDesign: false,
      hasService: false,
      hasContact: false,
      hasAddress: false,
      hasEmail: false,
      hasPhone: false,
      priceValues: [],
      productTypes: [],
      designTypes: [],
      serviceTypes: [],
      contactInfo: [],
      addresses: [],
      emails: [],
      phones: [],
      hasFormula: false
    };

    const lowerText = text.toLowerCase();

    // УЛУЧШЕННАЯ проверка цен
    const pricePatterns = [
      /(\d+[\s,]*\d*)\s*(руб|₽|рублей|рубля)/gi,
      /(\d+[\s,]*\d*)\s*(долл|долларов|$)/gi,
      /(\d+[\s,]*\d*)\s*(евро|€)/gi,
      /от\s*(\d+[\s,]*\d*)\s*(руб|₽|долл|евро)/gi,
      /цена[:\s]*(\d+[\s,]*\d*)\s*(руб|₽|долл|евро)/gi
    ];
    
    pricePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        metadata.hasPrice = true;
        metadata.priceValues.push(...matches);
      }
    });

    // Проверяем контактную информацию
    const phonePattern = /(\+?[7-8]?\s?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2})/g;
    const phoneMatches = text.match(phonePattern);
    if (phoneMatches) {
      metadata.hasContact = true;
      metadata.hasPhone = true;
      metadata.phones = phoneMatches;
    }

    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const emailMatches = text.match(emailPattern);
    if (emailMatches) {
      metadata.hasContact = true;
      metadata.hasEmail = true;
      metadata.emails = emailMatches;
    }

    const addressPattern = /(г\.|город|ул\.|улица|пр\.|проспект|д\.|дом|кв\.|квартира|оф\.|офис)[\s\w\.,-]+/gi;
    const addressMatches = text.match(addressPattern);
    if (addressMatches) {
      metadata.hasAddress = true;
      metadata.addresses = addressMatches;
    }

    // Проверяем наличие товаров
    const productKeywords = ['альбом', 'фотоальбом', 'выпускной', 'фотокнига', 'книга', 'брошюра', 'каталог', 'буклет', 'листовка', 'визитка', 'открытка', 'календарь', 'плакат', 'баннер'];
    productKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        metadata.hasProduct = true;
        metadata.productTypes.push(keyword);
      }
    });

    // Проверяем наличие дизайнов
    const designKeywords = ['дизайн', 'стиль', 'скандинавский', 'классический', 'современный', 'минимализм', 'лофт', 'прованс', 'кантри', 'хай-тек', 'эко', 'винтаж', 'ретро', 'модерн', 'арт-деко'];
    designKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        metadata.hasDesign = true;
        metadata.designTypes.push(keyword);
      }
    });

    // Проверяем наличие услуг
    const serviceKeywords = ['услуга', 'сервис', 'индивидуализация', 'комплектация', 'печать', 'изготовление', 'производство', 'оформление'];
    serviceKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        metadata.hasService = true;
        metadata.serviceTypes.push(keyword);
      }
    });

    // Проверяем формулы/расчёты
    const formulaKeywords = ['формула', 'расчёт', 'расчет', 'итоговая_цена', 'базовая_ставка', 'коэффициент'];
    formulaKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        metadata.hasFormula = true;
      }
    });

    return metadata;
  }

  // Вычисляем тип чанка на основе извлеченных метаданных
  computeChunkType(metadata) {
    if (!metadata) return 'other';
    if (metadata.hasContact) return 'contact';
    if (metadata.hasAddress) return 'address';
    if (metadata.hasFormula) return 'formula';
    if (metadata.hasPrice) return 'price';
    if (metadata.hasService) return 'service';
    return 'other';
  }

  // Улучшенный генератор синонимов для чанка с поддержкой ниш
  generateSynonymsForChunk(text, nicheId = null) {
    if (!text) return [];
    const lower = text.toLowerCase();
    
    // Базовые синонимы (универсальные)
    const baseSynonymsDict = {
      'ателье': ['детейлинг', 'детейлинг центр', 'lab', 'gn lab', 'центр', 'студия', 'мастерская'],
      'детейлинг': ['ателье', 'детейлинг центр', 'lab', 'gn lab', 'центр', 'студия', 'мастерская'],
      'центр': ['ателье', 'детейлинг', 'детейлинг центр', 'lab', 'gn lab', 'студия', 'мастерская'],
      'где': ['местоположение', 'адрес', 'находится', 'расположен', 'локация'],
      'тарифы': ['прайс', 'стоимость', 'цены', 'пакеты', 'планы', 'подписки'],
      'цены': ['стоимость', 'прайс', 'тарифы'],
      'стоимость': ['цена', 'прайс', 'тарифы', 'пакеты'],
      'услуги': ['работы', 'процедуры', 'манипуляции', 'операции'],
      'запись': ['записаться', 'записаться на', 'забронировать', 'забронировать время'],
      'время': ['часы работы', 'режим работы', 'график', 'расписание'],
      'контакты': ['связь', 'телефон', 'email', 'адрес', 'локация']
    };
    
    // Нишевые синонимы
    const nicheSynonymsDict = {
      'детейлинг': {
        'PPF': ['пленка', 'антискол', 'защитная пленка', 'полиуретановая пленка'],
        'керамика': ['керамическое покрытие', 'гидрофобное покрытие', 'нанопокрытие'],
        'полировка': ['шлифовка', 'восстановление ЛКП', 'коррекция ЛКП'],
        'оклейка': ['поклейка', 'установка пленки', 'монтаж пленки']
      },
      'ecommerce': {
        'доставка': ['отправка', 'пересылка', 'курьер', 'почта'],
        'размер': ['размерная сетка', 'размеры', 'обмеры'],
        'товар': ['продукт', 'изделие', 'вещь', 'покупка']
      },
      'красота': {
        'массаж': ['массажное воздействие', 'мануальная терапия'],
        'стрижка': ['стрижка волос', 'прическа', 'укладка'],
        'маникюр': ['маникюрный сервис', 'уход за ногтями'],
        'барбер': ['барбершоп', 'мужская стрижка', 'бородка']
      },
      'образование': {
        'курс': ['программа', 'модуль', 'блок', 'сессия'],
        'обучение': ['изучение', 'освоение', 'прохождение'],
        'преподаватель': ['инструктор', 'тренер', 'наставник', 'ментор']
      }
    };
    
    const result = new Set();
    
    // Добавляем базовые синонимы
    Object.keys(baseSynonymsDict).forEach(key => {
      if (lower.includes(key)) {
        baseSynonymsDict[key].forEach(s => result.add(s));
      }
    });
    
    // Добавляем нишевые синонимы, если nicheId указан
    if (nicheId && nicheSynonymsDict[nicheId]) {
      Object.keys(nicheSynonymsDict[nicheId]).forEach(key => {
        if (lower.includes(key)) {
          nicheSynonymsDict[nicheId][key].forEach(s => result.add(s));
        }
      });
    }
    
    // Извлекаем ключевые слова из текста для дополнительных синонимов
    const keywords = this.extractKeywordsFromText(text);
    keywords.forEach(keyword => {
      if (keyword.length > 3) {
        // Добавляем варианты написания
        result.add(keyword + 'ы'); // множественное число
        result.add(keyword + 'а'); // женский род
        result.add(keyword + 'о'); // средний род
      }
    });
    
    return Array.from(result).slice(0, 50);
  }
  
  // Извлечение ключевых слов из текста
  extractKeywordsFromText(text) {
    if (!text) return [];
    
    // Убираем знаки препинания и приводим к нижнему регистру
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
    
    // Разбиваем на слова и фильтруем
    const words = cleanText.split(/\s+/)
      .filter(word => word.length > 3) // только слова длиннее 3 символов
      .filter(word => !this.isStopWord(word)); // убираем стоп-слова
    
    // Возвращаем уникальные слова
    return [...new Set(words)].slice(0, 20);
  }
  
  // Проверка на стоп-слова
  isStopWord(word) {
    const stopWords = [
      'это', 'что', 'как', 'где', 'когда', 'почему', 'который', 'которая', 'которое',
      'они', 'она', 'оно', 'мы', 'вы', 'ты', 'я', 'он', 'мой', 'моя', 'мое',
      'наш', 'наша', 'наше', 'ваш', 'ваша', 'ваше', 'их', 'его', 'её',
      'для', 'при', 'над', 'под', 'без', 'через', 'между', 'среди', 'вокруг',
      'очень', 'более', 'менее', 'самый', 'самая', 'самое', 'самые'
    ];
    return stopWords.includes(word);
  }
  
  // Авто-экстракция синонимов для ниши на основе загруженного контента
  async extractNicheSynonyms(nicheId, userId) {
    if (!nicheId) return;
    
    try {
      console.log(`🧩 Extracting niche synonyms for niche ${nicheId} and user ${userId}`);
      
      // Получаем все чанки для данной ниши и пользователя
      const { data: chunks, error } = await this.supabase
        .from('knowledge_chunks')
        .select('chunk_text, chunk_summary')
        .eq('user_id', userId)
        .eq('niche_id', nicheId)
        .not('chunk_text', 'is', null);
      
      if (error) {
        console.error('❌ Error fetching chunks for niche synonyms:', error);
        return;
      }
      
      if (!chunks || chunks.length === 0) {
        console.log('⚠️ No chunks found for niche synonym extraction');
        return;
      }
      
      console.log(`📚 Found ${chunks.length} chunks for synonym extraction`);
      
      // Объединяем весь текст
      const allText = chunks.map(c => `${c.chunk_text} ${c.chunk_summary || ''}`).join(' ');
      
      // Извлекаем ключевые слова
      const keywords = this.extractKeywordsFromText(allText);
      
      // Фильтруем ключевые слова (убираем слишком короткие и общие)
      const filteredKeywords = keywords.filter(word => 
        word.length > 4 && 
        !this.isGeneralWord(word) &&
        !this.isStopWord(word)
      );
      
      console.log(`🔍 Extracted ${filteredKeywords.length} potential synonyms`);
      
      // Генерируем синонимы на основе ключевых слов
      const synonyms = new Set();
      filteredKeywords.forEach(keyword => {
        // Добавляем само ключевое слово
        synonyms.add(keyword);
        
        // Добавляем варианты написания
        synonyms.add(keyword + 'ы'); // множественное число
        synonyms.add(keyword + 'а'); // женский род
        synonyms.add(keyword + 'о'); // средний род
        
        // Добавляем связанные термины
        const relatedTerms = this.getRelatedTerms(keyword, nicheId);
        relatedTerms.forEach(term => synonyms.add(term));
      });
      
      // Преобразуем в массив и ограничиваем количество
      const finalSynonyms = Array.from(synonyms).slice(0, 100);
      
      console.log(`✅ Generated ${finalSynonyms.length} niche synonyms`);
      
      // Сохраняем синонимы в базу данных
      if (finalSynonyms.length > 0) {
        const synonymRows = finalSynonyms.map(synonym => ({
          niche_id: nicheId,
          synonym: synonym
        }));
        
        const { error: insertError } = await this.supabase
          .from('niche_synonyms')
          .upsert(synonymRows, { 
            onConflict: 'niche_id,synonym',
            ignoreDuplicates: true 
          });
        
        if (insertError) {
          console.error('❌ Error inserting niche synonyms:', insertError);
        } else {
          console.log(`✅ Successfully saved ${finalSynonyms.length} niche synonyms`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error in extractNicheSynonyms:', error);
    }
  }
  
  // Проверка на общие слова
  isGeneralWord(word) {
    const generalWords = [
      'компания', 'организация', 'фирма', 'предприятие', 'бизнес',
      'клиент', 'покупатель', 'заказчик', 'потребитель',
      'услуга', 'продукт', 'товар', 'изделие', 'предложение',
      'качество', 'уровень', 'стандарт', 'критерий',
      'время', 'период', 'срок', 'момент', 'день', 'час',
      'место', 'площадь', 'территория', 'зона', 'участок'
    ];
    return generalWords.includes(word);
  }
  
  // Получение связанных терминов для ключевого слова
  getRelatedTerms(keyword, nicheId) {
    const relatedTermsDict = {
      'детейлинг': {
        'пленка': ['защита', 'покрытие', 'материал'],
        'полировка': ['шлифовка', 'восстановление', 'коррекция'],
        'керамика': ['покрытие', 'гидрофоб', 'нанопокрытие']
      },
      'ecommerce': {
        'доставка': ['отправка', 'курьер', 'почта', 'транспорт'],
        'размер': ['обмер', 'параметр', 'габарит'],
        'товар': ['продукт', 'изделие', 'покупка']
      },
      'красота': {
        'массаж': ['воздействие', 'терапия', 'релакс'],
        'стрижка': ['прическа', 'укладка', 'парикмахер'],
        'маникюр': ['ногти', 'уход', 'дизайн']
      },
      'образование': {
        'курс': ['программа', 'модуль', 'блок'],
        'обучение': ['изучение', 'освоение', 'развитие'],
        'преподаватель': ['инструктор', 'тренер', 'наставник']
      }
    };
    
    // Определяем тип ниши по nicheId (упрощенно)
    let nicheType = null;
    if (nicheId) {
      // Здесь можно добавить логику определения типа ниши по ID
      // Пока используем базовые типы
      nicheType = 'детейлинг'; // по умолчанию
    }
    
    if (nicheType && relatedTermsDict[nicheType] && relatedTermsDict[nicheType][keyword]) {
      return relatedTermsDict[nicheType][keyword];
    }
    
    return [];
  }

  async createChunksFromContent(sourceId, userId, assistantId, content, options = {}) {
    try {
      console.log(`📝 Creating chunks from content for source ${sourceId}`);
      console.log(`📝 Content length: ${content.length} characters`);
      
      // Улучшенные параметры чанкинга для лучшего поиска
      const chunks = this.chunkingSystem.createChunks(content, {
        maxTokens: options.maxTokens || 600, // Увеличиваем размер чанка
        summaryMethod: options.summaryMethod || 'keyword',
        overlap: options.overlap || 100, // Увеличиваем перекрытие
        enableDeduplication: options.enableDeduplication !== false, // Включаем дедупликацию по умолчанию
        enableNER: options.enableNER !== false, // Включаем NER по умолчанию
        useAdvancedTokenization: options.useAdvancedTokenization !== false // Используем улучшенную токенизацию
      });

      console.log(`📝 Created ${chunks.length} chunks`);

      const chunkData = chunks.map((chunk, index) => {
        // Добавляем метаданные для лучшего поиска
        const metadata = this.extractChunkMetadata(chunk.text);
        const chunkType = this.computeChunkType(metadata);

        // Объединяем метаданные с извлеченными сущностями
        const enhancedMetadata = {
          ...metadata,
          // Добавляем извлеченные сущности если они есть
          ...(chunk.prices && { extracted_prices: chunk.prices }),
          ...(chunk.addresses && { extracted_addresses: chunk.addresses }),
          ...(chunk.phones && { extracted_phones: chunk.phones })
        };

        return {
          source_id: sourceId,
          user_id: userId,
          assistant_id: assistantId,
          niche_id: options.nicheId || null,
          chunk_text: chunk.text,
          chunk_summary: chunk.summary,
          tokens_estimate: chunk.tokens_estimate,
          words_count: chunk.words_count,
          full_text_hash: chunk.full_text_hash,
          chunk_index: chunk.chunk_index,
          // Добавляем метаданные с сущностями
          metadata: enhancedMetadata,
          chunk_type: chunkType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });

      console.log(`💾 Inserting ${chunkData.length} chunks into database (with dedup)`);

      const data = await this.insertChunksDedup(sourceId, chunkData);
      const error = null;

      if (error) {
        console.error('❌ Error creating chunks:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log(`✅ Successfully created ${data.length} chunks`);

      // Вставляем синонимы для каждого чанка (если есть)
      try {
        const synonymRows = [];
        for (const row of data) {
          const syns = this.generateSynonymsForChunk(row.chunk_text, options.nicheId);
          syns.forEach(s => {
            synonymRows.push({ chunk_id: row.id, synonym: s });
          });
        }
        if (synonymRows.length > 0) {
          await this.supabase.from('chunk_synonyms').insert(synonymRows);
          console.log(`🧩 Inserted ${synonymRows.length} chunk synonyms for niche ${options.nicheId || 'all'}`);
        }
      } catch (synErr) {
        console.log('⚠️ Error inserting chunk synonyms (non-fatal):', synErr.message);
      }

      // Авто-экстракция синонимов для ниши (если есть nicheId)
      if (options.nicheId && data.length > 0) {
        try {
          await this.extractNicheSynonyms(options.nicheId, userId);
        } catch (nicheSynErr) {
          console.log('⚠️ Error extracting niche synonyms (non-fatal):', nicheSynErr.message);
        }
      }

      return data;
      
    } catch (error) {
      console.error('❌ Failed to create chunks:', error);
      throw error;
    }
  }

  // Вставка чанков с дедупликацией по full_text_hash в рамках source_id
  async insertChunksDedup(sourceId, chunks) {
    try {
      const hashes = chunks.map(c => c.full_text_hash).filter(Boolean);
      const { data: existing } = await this.supabase
        .from('knowledge_chunks')
        .select('full_text_hash')
        .eq('source_id', sourceId)
        .in('full_text_hash', hashes);
      const existingSet = new Set((existing || []).map(r => r.full_text_hash));
      const toInsert = chunks.filter(c => !existingSet.has(c.full_text_hash));
      if (!toInsert.length) return [];
      const { data } = await this.supabase
        .from('knowledge_chunks')
        .insert(toInsert)
        .select();
      return data || [];
    } catch (e) {
      console.warn('insertChunksDedup error:', e?.message || e);
      // Фоллбек: пробуем вставить как есть
      const { data } = await this.supabase
        .from('knowledge_chunks')
        .insert(chunks)
        .select();
      return data || [];
    }
  }

  async createEmbeddingsForChunks(chunks) {
    console.log(`🔮 [VectorSearch] Creating embeddings for ${chunks.length} chunks`);
    
    for (const chunk of chunks) {
      try {
        // Используем UnifiedRAGSystem для создания эмбеддингов
        const embedding = await this.ragSystem.createEmbedding(chunk.chunk_text || chunk.chunk_summary);
        
        // Сохраняем эмбеддинг в базу данных
        await this.ragSystem.vectorSearch.saveEmbedding(chunk.id, embedding);
        
        console.log(`✅ [VectorSearch] Embedding created for chunk ${chunk.id}`);
      } catch (error) {
        console.error(`❌ [VectorSearch] Error creating embedding for chunk ${chunk.id}:`, error.message);
      }
    }
  }
  
  // Старый метод для совместимости (deprecated)
  async createEmbedding(text) {
    console.log('⚠️ [VectorSearch] Using deprecated createEmbedding method, please use ragSystem.createEmbedding instead');
    return await this.ragSystem.createEmbedding(text);
  }
  
  // Создание эмбеддингов для всех чанков пользователя
  async createEmbeddingsForUser(userId, options = {}) {
    try {
      console.log(`🔮 [VectorSearch] Creating embeddings for all chunks of user ${userId}`);
      return await this.ragSystem.createEmbeddingsForUser(userId, options);
    } catch (error) {
      console.error('❌ [VectorSearch] Error creating embeddings for user:', error);
      throw error;
    }
  }
  
  // Инвалидация кэша для пользователя
  async invalidateUserCache(userId) {
    try {
      await this.ragSystem.cacheAdapter.invalidateUserCache(userId);
      console.log(`🗑️ [AIAgent] Cache invalidated for user ${userId}`);
    } catch (error) {
      console.error('❌ [AIAgent] Error invalidating user cache:', error);
    }
  }
  
  // Инвалидация кэша для ниши
  async invalidateNicheCache(nicheId) {
    try {
      await this.ragSystem.cacheAdapter.invalidateNicheCache(nicheId);
      console.log(`🗑️ [AIAgent] Cache invalidated for niche ${nicheId}`);
    } catch (error) {
      console.error('❌ [AIAgent] Error invalidating niche cache:', error);
    }
  }
  
  // Получение статистики кэша
  getCacheStats() {
    try {
      return this.ragSystem.cacheAdapter.getStats();
    } catch (error) {
      console.error('❌ [AIAgent] Error getting cache stats:', error);
      return null;
    }
  }
  
  // Проверка здоровья кэша
  async checkCacheHealth() {
    try {
      return await this.ragSystem.cacheAdapter.healthCheck();
    } catch (error) {
      console.error('❌ [AIAgent] Error checking cache health:', error);
      return { status: 'error', error: error.message };
    }
  }
  
  // Получение статистики унифицированного флоу
  getUnifiedFlowStats() {
    try {
      return {
        unifiedFlow: this.unifiedFlow.getStats(),
        validator: this.responseValidator.getStats(),
        cache: this.getCacheStats()
      };
    } catch (error) {
      console.error('❌ [AIAgent] Error getting unified flow stats:', error);
      return null;
    }
  }
  
  // Очистка кэшей унифицированного флоу
  clearUnifiedFlowCaches() {
    try {
      this.unifiedFlow.clearCaches();
      this.responseValidator.clearCaches();
      console.log('🧹 [AIAgent] Unified flow caches cleared');
    } catch (error) {
      console.error('❌ [AIAgent] Error clearing unified flow caches:', error);
    }
  }
  
  // Сброс статистики унифицированного флоу
  resetUnifiedFlowStats() {
    try {
      this.unifiedFlow.resetStats();
      this.responseValidator.resetStats();
      console.log('📊 [AIAgent] Unified flow statistics reset');
    } catch (error) {
      console.error('❌ [AIAgent] Error resetting unified flow stats:', error);
    }
  }
  
  // Валидация ответа (отдельный метод)
  async validateResponse(response, searchResults, request) {
    try {
      return await this.responseValidator.validateResponse(response, { searchResults }, request);
    } catch (error) {
      console.error('❌ [AIAgent] Error validating response:', error);
      return {
        isValid: false,
        score: 0.0,
        errors: ['Validation system error'],
        warnings: []
      };
    }
  }

  // Парсинг товарных фидов (CSV, XML)
  async parseFeed(content) {
    try {
      console.log('📊 Parsing feed content...');
      
      // Определяем тип фида по содержимому
      if (content.includes('<') && content.includes('>')) {
        // XML фид
        return await this.parseXMLFeed(content);
      } else if (content.includes(',') || content.includes(';')) {
        // CSV фид
        return await this.parseCSVFeed(content);
      } else {
        // Текстовый фид
        return {
          success: true,
          content: content,
          type: 'text'
        };
      }
    } catch (error) {
      console.error('❌ Feed parsing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Парсинг XML фидов
  async parseXMLFeed(xmlContent) {
    try {
      console.log('📄 Parsing XML feed...');
      
      // Простой парсинг XML для товарных фидов
      const products = [];
      
      // Ищем товары в XML
      const productMatches = xmlContent.match(/<product[^>]*>[\s\S]*?<\/product>/gi) || 
                           xmlContent.match(/<item[^>]*>[\s\S]*?<\/item>/gi) ||
                           xmlContent.match(/<offer[^>]*>[\s\S]*?<\/offer>/gi);
      
      if (productMatches) {
        productMatches.forEach((productXml, index) => {
          const product = this.extractProductFromXML(productXml);
          if (product) {
            products.push(product);
          }
        });
      }
      
      // Формируем текстовое представление
      let textContent = 'ТОВАРНЫЙ ФИД (XML):\n\n';
      products.forEach((product, index) => {
        textContent += `ТОВАР ${index + 1}:\n`;
        Object.entries(product).forEach(([key, value]) => {
          textContent += `${key}: ${value}\n`;
        });
        textContent += '\n';
      });
      
      return {
        success: true,
        content: textContent,
        type: 'xml',
        products: products
      };
    } catch (error) {
      console.error('❌ XML feed parsing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Парсинг CSV фидов
  async parseCSVFeed(csvContent) {
    try {
      console.log('📊 Parsing CSV feed...');
      
      const lines = csvContent.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        return {
          success: false,
          error: 'CSV файл должен содержать заголовки и данные'
        };
      }
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const products = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const product = {};
        
        headers.forEach((header, index) => {
          product[header] = values[index] || '';
        });
        
        products.push(product);
      }
      
      // Формируем текстовое представление
      let textContent = 'ТОВАРНЫЙ ФИД (CSV):\n\n';
      products.forEach((product, index) => {
        textContent += `ТОВАР ${index + 1}:\n`;
        Object.entries(product).forEach(([key, value]) => {
          if (value) {
            textContent += `${key}: ${value}\n`;
          }
        });
        textContent += '\n';
      });
      
      return {
        success: true,
        content: textContent,
        type: 'csv',
        products: products
      };
    } catch (error) {
      console.error('❌ CSV feed parsing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Извлечение данных товара из XML
  extractProductFromXML(productXml) {
    try {
      const product = {};
      
      // Извлекаем основные поля
      const fields = [
        'name', 'title', 'product_name',
        'price', 'cost', 'value',
        'description', 'desc',
        'category', 'cat',
        'brand', 'manufacturer',
        'sku', 'id', 'article',
        'url', 'link',
        'image', 'img', 'photo',
        'availability', 'stock', 'in_stock'
      ];
      
      fields.forEach(field => {
        const regex = new RegExp(`<${field}[^>]*>([^<]*)</${field}>`, 'i');
        const match = productXml.match(regex);
        if (match && match[1]) {
          product[field] = match[1].trim();
        }
      });
      
      return Object.keys(product).length > 0 ? product : null;
    } catch (error) {
      console.error('❌ Error extracting product from XML:', error);
      return null;
    }
  }

  // Парсинг файлов (PDF, Word, Excel, Text)
  async parseFile(filePath) {
    try {
      console.log('📁 Parsing file:', filePath);
      
      // Импортируем функции парсинга из server.js
      const { parseFile: serverParseFile } = await import('./server.js');
      
      const result = await serverParseFile(filePath, this.getMimeType(filePath));
      
      if (result.success) {
        return {
          success: true,
          content: result.text,
          type: this.getFileType(filePath)
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error('❌ File parsing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Определение MIME типа файла
  getMimeType(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    const mimeTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'csv': 'text/csv',
      'txt': 'text/plain',
      'xml': 'application/xml'
    };
    return mimeTypes[ext] || 'text/plain';
  }

  // Определение типа файла
  getFileType(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    return ext;
  }

  async createEmbedding(text) {
    // Заглушка для создания embedding через GigaChat
    // В реальности здесь должен быть вызов API GigaChat
    const embedding = new Array(1536).fill(0);
    for (let i = 0; i < text.length && i < 1536; i++) {
      embedding[i] = Math.sin(text.charCodeAt(i) / 1000);
    }
    return embedding;
  }

  // Получить корректировки пользователя
  async getBotCorrections(userId, channel = 'admin') {
    try {
      console.log(`🔧 Getting bot corrections for user: ${userId}, channel: ${channel}`);
      
      let query = this.supabase
        .from('bot_corrections')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('created_at', { ascending: false });
      
      if (channel) {
        query = query.eq('channel', channel);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching bot corrections:', error);
        return [];
      }
      
      console.log(`🔧 Found ${data?.length || 0} corrections`);
      return data || [];
      
    } catch (error) {
      console.error('❌ Bot corrections error:', error);
      return [];
    }
  }

  preprocessContent(content, sourceType) {
    switch (sourceType) {
      case 'website':
        return this.cleanWebsiteContent(content);
      case 'pdf':
        return this.cleanPDFContent(content);
      case 'text':
        return this.cleanTextContent(content);
      default:
        return content;
    }
  }

  cleanWebsiteContent(content) {
    // Удаляем boilerplate-блоки и служебные элементы
    let html = String(content || '');
    html = html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<noscript[^>]*>.*?<\/noscript>/gis, '')
      .replace(/<(header|footer|nav|aside|form|iframe)[^>]*>.*?<\/\1>/gis, ' ');
    const text = html
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&amp;|&quot;|&lt;|&gt;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text;
  }

  cleanPDFContent(content) {
    let text = String(content || '');
    // Убираем переносы со словами, склеенными дефисом на конце строки
    text = text.replace(/([А-Яа-яA-Za-z0-9])\-\n([А-Яа-яA-Za-z0-9])/g, '$1$2');
    // Нормализуем многострочные таблицы: заменяем большие блоки пробелов на разделители
    text = text.replace(/[ \t]{3,}/g, ' \u2502 '); // вертикальная черта как разделитель
    // Приводим маркеры списков
    text = text.replace(/\n[•·\-]\s*/g, '\n• ');
    // Сохраняем разрывы между логическими строками
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+\n/g, '\n');
    // Выносим цены в отдельные строки, если слиплись
    text = text.replace(/(\S)(\s*)(\d+[\s,]*\d*\s*(?:руб\.?|₽|eur|€|usd|\$))/gi, '$1\n$3');
    // Убираем лишние пробелы
    text = text.replace(/[ \t]{2,}/g, ' ').trim();
    return text;
  }

  cleanTextContent(content) {
    return content
      .replace(/\r\n/g, '\n')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  // Извлекаем ценовые строки/таблицы для создания отдельных прайсовых чанков
  extractPriceTableChunks(rawContent, ctx) {
    try {
      const content = String(rawContent || '');
      const lines = content.split(/\n+/).map(l => l.trim()).filter(Boolean);
      const priceRe = /(от\s*)?\d+[\s,]*\d*\s*(руб\.?|₽|eur|€|usd|\$)/i;
      const headerHints = /(услуга|позиция|наименование|цена|стоимость|тариф|комплект)/i;
      const chunks = [];
      let buffer = [];
      let tableMode = false;
      for (const line of lines) {
        const isHeader = headerHints.test(line);
        const hasPrice = priceRe.test(line);
        // Простая эвристика таблицы: линия с разделителем │ или несколькими колонками
        const looksLikeRow = /\u2502|\s\|\s/.test(line) || (hasPrice && line.split(/\s{2,}|\s\|\s|\u2502/).length >= 2);
        if (isHeader) {
          // сбрасываем предыдущий буфер
          if (buffer.length >= 2) {
            const text = buffer.join('\n');
            const metadata = this.extractChunkMetadata(text);
            chunks.push(this._buildPriceChunk(text, ctx, metadata, chunks.length));
          }
          buffer = [line];
          tableMode = true;
          continue;
        }
        if (tableMode && looksLikeRow) {
          buffer.push(line);
          continue;
        }
        if (hasPrice && !tableMode) {
          const text = line;
          const metadata = this.extractChunkMetadata(text);
          chunks.push(this._buildPriceChunk(text, ctx, metadata, chunks.length));
          continue;
        }
        // если таблица закончилась
        if (tableMode && !looksLikeRow) {
          if (buffer.length >= 2) {
            const text = buffer.join('\n');
            const metadata = this.extractChunkMetadata(text);
            chunks.push(this._buildPriceChunk(text, ctx, metadata, chunks.length));
          }
          buffer = [];
          tableMode = false;
        }
      }
      if (tableMode && buffer.length >= 2) {
        const text = buffer.join('\n');
        const metadata = this.extractChunkMetadata(text);
        chunks.push(this._buildPriceChunk(text, ctx, metadata, chunks.length));
      }
      return chunks.slice(0, 200);
    } catch (e) {
      console.warn('extractPriceTableChunks error:', e?.message || e);
      return [];
    }
  }

  _buildPriceChunk(text, ctx, metadata, idx) {
    const chunkType = this.computeChunkType({ ...metadata, hasPrice: true });
    return {
      source_id: ctx.sourceId,
      user_id: ctx.userId,
      assistant_id: ctx.assistantId,
      niche_id: ctx.nicheId || null,
      chunk_text: text,
      chunk_summary: 'Прайс/таблица цен',
      tokens_estimate: Math.ceil(text.length / 4),
      words_count: (text.match(/\S+/g) || []).length,
      full_text_hash: `price_${idx}_${text.length}`,
      chunk_index: 10000 + idx,
      metadata,
      chunk_type: chunkType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  detectLanguage(text) {
    try {
      const s = String(text || '');
      const cyr = (s.match(/[\u0400-\u04FF]/g) || []).length;
      const lat = (s.match(/[A-Za-z]/g) || []).length;
      if (cyr > lat * 1.5) return 'ru';
      if (lat > cyr * 1.5) return 'en';
      return cyr >= lat ? 'ru' : 'en';
    } catch { return 'ru'; }
  }

  // Нормализация товарного фида (CSV/XML/JSON простая эвристика)
  normalizeFeedContent(content, sourceUrl = '') {
    try {
      let products = [];
      const text = typeof content === 'string' ? content : String(content || '');
      // JSON
      try {
        const obj = JSON.parse(text);
        if (Array.isArray(obj)) {
          products = obj;
        } else if (obj && Array.isArray(obj.items)) {
          products = obj.items;
        }
      } catch {}
      // CSV (простая)
      if (!products.length && /,/.test(text) && /\n/.test(text)) {
        const [header, ...rows] = text.split(/\n+/).filter(Boolean);
        const cols = header.split(',').map(c => c.trim().toLowerCase());
        const idx = (name) => cols.findIndex(c => c.includes(name));
        const iTitle = idx('title') >= 0 ? idx('title') : idx('name');
        const iPrice = idx('price');
        const iUrl = idx('url');
        const iSku = idx('sku');
        const iCat = idx('category');
        products = rows.slice(0, 1000).map(r => {
          const parts = r.split(',');
          return {
            title: iTitle >= 0 ? parts[iTitle] : undefined,
            price: iPrice >= 0 ? parts[iPrice] : undefined,
            url: iUrl >= 0 ? parts[iUrl] : (sourceUrl || undefined),
            sku: iSku >= 0 ? parts[iSku] : undefined,
            category: iCat >= 0 ? parts[iCat] : undefined
          };
        });
      }
      // XML (очень простая)
      if (!products.length && /<item>|<offer>|<product>/i.test(text)) {
        const take = (tag) => Array.from(text.matchAll(new RegExp(`<${tag}>([\s\S]*?)<\/${tag}>`, 'gi'))).map(m => m[1]);
        const titles = take('title');
        const prices = take('price');
        const urls = take('url');
        const skus = take('sku');
        const cats = take('category');
        const len = Math.max(titles.length, prices.length, urls.length);
        for (let i=0;i<len && i<1000;i++) {
          products.push({
            title: titles[i],
            price: prices[i],
            url: urls[i] || sourceUrl,
            sku: skus[i],
            category: cats[i]
          });
        }
      }
      if (!products.length) return null;
      return { products: products.slice(0, 1000) };
    } catch {
      return null;
    }
  }

  // 2. RAG-СЛОЙ (RETRIEVAL-AUGMENTED GENERATION)
  async searchRelevantKnowledge(query, userId, assistantId, options = {}) {
    const startTime = Date.now();
    try {
      console.log(`🔍 LangChain RAG search for query: "${query}"`);
      console.log(`👤 User ID: ${userId}, Assistant ID: ${assistantId}`);
      
      // СНАЧАЛА ПРОВЕРЯЕМ КОРРЕКТИРОВКИ - ОНИ ИМЕЮТ ПРИОРИТЕТ!
      const corrections = await this.getBotCorrections(userId, options.channel || 'admin');
      if (corrections && corrections.length > 0) {
        console.log(`🔧 Found ${corrections.length} corrections for user`);
        console.log(`🔧 Corrections data:`, corrections.map(c => ({ id: c.id, correction: c.correction?.substring(0, 100) })));
        
        // Ищем релевантные корректировки - более гибкий поиск
        const relevantCorrections = corrections.filter(correction => 
          correction.correction && 
          (correction.correction.toLowerCase().includes(query.toLowerCase()) ||
           query.toLowerCase().includes(correction.correction.toLowerCase()) ||
           correction.correction.toLowerCase().includes('ручка') && query.toLowerCase().includes('ручка') ||
           correction.correction.toLowerCase().includes('замена') && query.toLowerCase().includes('замена') ||
           correction.correction.toLowerCase().includes('стоит') && query.toLowerCase().includes('стоит'))
        );
        
        if (relevantCorrections.length > 0) {
          console.log(`✅ Found ${relevantCorrections.length} relevant corrections - USING THEM!`);
          const searchTime = Date.now() - startTime;
          monitoring.recordRAGSearch(searchTime, true, null);
          return {
            type: 'corrections',
            results: relevantCorrections.map(c => ({
              id: c.id,
              chunk_text: c.correction,
              similarity: 1.0,
              source: 'correction'
            })),
            totalResults: relevantCorrections.length,
            source: 'corrections'
          };
        }
      }
      
      // Используем UnifiedRAGSystem для поиска с поддержкой ниш
      const ragResults = await this.ragSystem.searchRelevantKnowledge(query, userId, { 
        ...options, 
        assistantId,
        nicheId: options.nicheId 
      });
      
      if (ragResults && ragResults.chunks && ragResults.chunks.length > 0) {
        const searchTime = Date.now() - startTime;
        monitoring.recordRAGSearch(searchTime, true, null);
        console.log(`✅ UnifiedRAG found ${ragResults.chunks.length} results from ${ragResults.searchSource}`);
        console.log(`📝 First result: ${ragResults.chunks[0].chunk_text.substring(0, 100)}...`);
        return {
          type: 'rag',
          results: ragResults.chunks,
          totalResults: ragResults.chunks.length,
          source: ragResults.searchSource,
          totalTokens: ragResults.totalTokens || 0,
          searchTime: ragResults.searchTime || 0
        };
      }
      
      // Fallback: используем старый поиск
      console.log('🔄 LangChain no results, trying fallback search...');
      const textResults = await this.textSearch(query, userId, assistantId, options);
      
      if (textResults && textResults.length > 0) {
        const searchTime = Date.now() - startTime;
        monitoring.recordRAGSearch(searchTime, false, null);
        console.log(`✅ Fallback found ${textResults.length} results`);
        return {
          type: 'rag',
          results: textResults,
          totalResults: textResults.length,
          source: 'fallback'
        };
      }
      
      console.log('⚠️ No results found in any search method');
      const searchTime = Date.now() - startTime;
      monitoring.recordRAGSearch(searchTime, false, null);
      
      return {
        type: 'rag',
        results: [],
        totalResults: 0,
        source: 'none'
      };
      
    } catch (error) {
      const searchTime = Date.now() - startTime;
      monitoring.recordRAGSearch(searchTime, false, error);
      console.error('❌ RAG search error:', error);
      return { type: 'error', error: error.message };
    }
  }

  async checkFAQCache(query, userId, assistantId) {
    const queryHash = this.createQueryHash(query);
    
    const { data, error } = await this.supabase
      .from('faq_cache')
      .select('*')
      .eq('user_id', userId)
      .eq('assistant_id', assistantId)
      .eq('question_hash', queryHash)
      .single();

    if (error || !data) return null;

    // Обновляем статистику использования
    await this.supabase
      .from('faq_cache')
      .update({ 
        usage_count: data.usage_count + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', data.id);

    return data;
  }

  async vectorSearch(query, userId, assistantId, options = {}) {
    try {
      const queryEmbedding = await this.createEmbedding(query);
      
      const { data, error } = await this.supabase
        .rpc('vector_search_knowledge', {
          query_embedding: queryEmbedding,
          user_uuid: userId,
          match_threshold: options.matchThreshold || 0.7,
          match_count: options.matchCount || 5
        });

      if (error) throw error;
      return data || [];
      
    } catch (error) {
      console.error('❌ Vector search error:', error);
      return [];
    }
  }

  async textSearch(query, userId, assistantId, options = {}) {
    try {
      console.log(`🔍 Text search: query="${query}", userId="${userId}", assistantId="${assistantId}", maxResults=${options.maxResults || 10}`);
      
      // Словарь синонимов
      const synonyms = {
        'пакеты': 'тарифы',
        'планы': 'тарифы', 
        'цены': 'тарифы',
        'стоимость': 'тарифы',
        'подписки': 'тарифы',
        'варианты': 'тарифы',
        'прайс': 'тарифы',
        'rate': 'тарифы',
        'fee': 'тарифы',
        'charge': 'тарифы',
        'subscription': 'тарифы',
        'plan': 'тарифы',
        'package': 'тарифы',
        'абонемент': 'тарифы',
        'тарифный план': 'тарифы',
        'тарифный пакет': 'тарифы'
      };
      
      // Пробуем поиск с оригинальным запросом
      console.log(`🔧 Calling RPC with params:`, {
        search_query: query,
        user_uuid: userId,
        max_results: options.maxResults || 10
      });
      
      const baseParams = {
        search_query: query,
        user_uuid: userId,
        max_results: options.maxResults || 10,
        assistant_uuid: assistantId || null,
        niche_uuid: options.nicheId || null,
        chunk_types: options.chunkTypes || null
      };

      // Контактный запрос? тогда сужаем типы
      const contactKeywords = ['контакт', 'телефон', 'email', 'почта', 'связь', 'номер', 'звонить', 'позвонить', 'связаться', 'адрес', 'где находится', 'ателье', 'детейлинг', 'центр', 'локация'];
      const isContactQuery = contactKeywords.some(k => query.toLowerCase().includes(k));
      if (isContactQuery && !baseParams.chunk_types) {
        baseParams.chunk_types = ['contact','address'];
      }

      const { data, error } = await this.supabase.rpc('search_knowledge_chunks', baseParams);

      if (error) {
        console.error('❌ Text search RPC error:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        return [];
      }
      
      // Если не нашли результатов, пробуем синонимы
      if (!data || data.length === 0) {
        const synonym = synonyms[query.toLowerCase()];
        if (synonym) {
          console.log(`🔄 No results for "${query}", trying synonym "${synonym}"`);
          const { data: synonymData, error: synonymError } = await this.supabase.rpc('search_knowledge_chunks', {
            ...baseParams,
            search_query: synonym
          });
          
          if (!synonymError && synonymData && synonymData.length > 0) {
            console.log(`✅ Found ${synonymData.length} results using synonym "${synonym}"`);
            return synonymData;
          }
        }
      }

      // Если указана ниша, дополнительно подтянем результаты без фильтра ниши (company_RAG) и объединим
      if ((data && data.length > 0) && baseParams.niche_uuid) {
        const { data: companyData, error: companyError } = await this.supabase.rpc('search_knowledge_chunks', {
          ...baseParams,
          niche_uuid: null
        });
        if (!companyError && companyData && companyData.length > 0) {
          const map = new Map();
          data.forEach(r => map.set(r.id, { ...r, rank: (r.rank || 0) + 0.2 })); // легкий буст нишевым
          companyData.forEach(r => {
            if (!map.has(r.id)) map.set(r.id, r);
          });
          return Array.from(map.values());
        }
      }
      
      console.log(`📊 Text search results: ${data ? data.length : 0} chunks found`);
      if (data && data.length > 0) {
        console.log(`📝 First result: ${data[0].chunk_text.substring(0, 100)}...`);
      }
      return data || [];
      
    } catch (error) {
      console.error('❌ Text search error:', error);
      return [];
    }
  }

  extractKeywords(query) {
    // Извлекаем ключевые слова из запроса, убирая стоп-слова
    const stopWords = ['расскажи', 'про', 'о', 'что', 'как', 'где', 'когда', 'почему', 'зачем', 'и', 'или', 'но', 'а', 'в', 'на', 'с', 'по', 'для', 'от', 'до', 'из', 'к', 'у', 'при', 'без', 'через', 'над', 'под', 'между', 'среди', 'около', 'возле', 'вокруг', 'внутри', 'снаружи', 'перед', 'после', 'во', 'со', 'об', 'обо', 'не', 'ни', 'же', 'ли', 'бы', 'был', 'была', 'было', 'были', 'есть', 'быть', 'это', 'эта', 'этот', 'эти', 'мой', 'моя', 'мое', 'мои', 'твой', 'твоя', 'твое', 'твои', 'наш', 'наша', 'наше', 'наши', 'ваш', 'ваша', 'ваше', 'ваши'];
    
    // Словарь синонимов и связанных терминов
    const synonyms = {
      'тарифы': ['тариф', 'пакеты', 'планы', 'подписки', 'варианты', 'цены', 'стоимость', 'прайс'],
      'пакеты': ['тарифы', 'тариф', 'планы', 'подписки', 'варианты', 'цены', 'стоимость', 'прайс'],
      'планы': ['тарифы', 'тариф', 'пакеты', 'подписки', 'варианты', 'цены', 'стоимость', 'прайс'],
      'цены': ['тарифы', 'тариф', 'пакеты', 'планы', 'подписки', 'варианты', 'стоимость', 'прайс'],
      'стоимость': ['тарифы', 'тариф', 'пакеты', 'планы', 'подписки', 'варианты', 'цены', 'прайс'],
      'курс': ['обучение', 'программа', 'тренинг', 'курсы'],
      'обучение': ['курс', 'программа', 'тренинг', 'курсы'],
      'программа': ['курс', 'обучение', 'тренинг', 'курсы'],
      'бот': ['чатбот', 'чат-бот', 'автоматизация', 'автоворонка'],
      'чатбот': ['бот', 'чат-бот', 'автоматизация', 'автоворонка'],
      'автоматизация': ['бот', 'чатбот', 'чат-бот', 'автоворонка'],
      'поддержка': ['помощь', 'сопровождение', 'менторство'],
      'помощь': ['поддержка', 'сопровождение', 'менторство'],
      'базовый': ['начальный', 'стандартный', 'основной'],
      'расширенный': ['продвинутый', 'улучшенный', 'премиум'],
      'максимум': ['максимальный', 'полный', 'топовый', 'премиум'],
      'no-code': ['без кода', 'визуальное программирование', 'низкокод'],
      'разработка': ['создание', 'разработка', 'программирование']
    };
    
    const words = query.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Убираем пунктуацию
      .split(/\s+/)
      .filter(word => word.trim().length > 0) // Убираем пустые строки
      .filter(word => {
        const isLongEnough = word.length > 2;
        const isNotStopWord = !stopWords.includes(word);
        console.log(`🔍 Word "${word}": length=${word.length}, isLongEnough=${isLongEnough}, isNotStopWord=${isNotStopWord}`);
        return isLongEnough && isNotStopWord;
      }); // Фильтруем короткие слова и стоп-слова
    
    console.log(`🔍 All words from query: ${query.toLowerCase().split(/\s+/).join(', ')}`);
    console.log(`🔍 Filtered words: ${words.join(', ')}`);
    
    // Расширяем ключевые слова синонимами
    const expandedKeywords = new Set();
    
    words.forEach(word => {
      expandedKeywords.add(word);
      
      // Добавляем синонимы
      if (synonyms[word]) {
        synonyms[word].forEach(synonym => {
          expandedKeywords.add(synonym);
        });
      }
      
      // Проверяем, является ли слово синонимом другого
      Object.keys(synonyms).forEach(key => {
        if (synonyms[key].includes(word)) {
          expandedKeywords.add(key);
          synonyms[key].forEach(synonym => {
            expandedKeywords.add(synonym);
          });
        }
      });
    });
    
    const result = Array.from(expandedKeywords);
    console.log(`🔑 Original words: ${words.join(', ')}`);
    console.log(`🔑 Expanded keywords: ${result.join(', ')}`);
    
    // Если не нашли ключевых слов, возвращаем весь запрос
    return result.length > 0 ? result : [query.toLowerCase()];
  }

  combineAndRankResults(vectorResults, textResults, query) {
    const combined = new Map();
    
    // Добавляем векторные результаты
    vectorResults.forEach(result => {
      combined.set(result.id, {
        ...result,
        vectorScore: result.similarity,
        textScore: 0,
        finalScore: result.similarity * 0.7
      });
    });
    
    // Добавляем текстовые результаты
    textResults.forEach(result => {
      const existing = combined.get(result.id);
      if (existing) {
        existing.textScore = result.rank;
        existing.finalScore = (existing.vectorScore * 0.7) + (result.rank * 0.3);
      } else {
        combined.set(result.id, {
          ...result,
          vectorScore: 0,
          textScore: result.rank,
          finalScore: result.rank * 0.3
        });
      }
    });
    
    return Array.from(combined.values())
      .sort((a, b) => b.finalScore - a.finalScore);
  }

  selectResultsByTokenBudget(results, options = {}) {
    const tokenBudget = options.tokenBudget || this.config.tokenBudget;
    const maxChunks = options.maxChunks || this.config.maxChunks;
    
    const selected = [];
    let usedTokens = 0;
    
    for (const result of results) {
      if (selected.length >= maxChunks) break;
      
      const tokens = this.estimateTokens(result.chunk_text);
      if (usedTokens + tokens <= tokenBudget) {
        selected.push({
          ...result,
          tokens,
          type: 'full'
        });
        usedTokens += tokens;
      } else if (usedTokens + 100 <= tokenBudget) {
        // Добавляем урезанную версию
        const truncated = this.truncateByTokens(result.chunk_text, tokenBudget - usedTokens);
        selected.push({
          ...result,
          chunk_text: truncated,
          tokens: this.estimateTokens(truncated),
          type: 'truncated'
        });
        break;
      }
    }
    
    return selected;
  }

  // 3. СЛОЙ ОРКЕСТРАЦИИ ДИАЛОГА
  async processMessage(userId, assistantId, message, conversationId = null, options = {}) {
    try {
      console.log(`💬 Processing message for user ${userId}, assistant ${assistantId}`);
      console.log(`💬 Message content:`, message);
      console.log(`💬 Message type:`, typeof message);
      console.log(`💬 Conversation history:`, options.conversationHistory?.length || 0, 'messages');
      console.log(`💬 Conversation history data:`, JSON.stringify(options.conversationHistory || []));
      
      const channel = options.channel || 'admin';

      // ИСПРАВЛЕНИЕ 1: Используем новую функцию для управления сессиями диалогов
      if (!conversationId) {
        try {
          const { data: sessionId, error: sessionError } = await this.supabase
            .rpc('get_or_create_conversation_session', {
              p_user_id: userId,
              p_assistant_id: assistantId,
              p_channel: channel,
              p_session_timeout_minutes: 30
            });
          
          if (sessionError) {
            console.error('❌ Ошибка создания сессии:', sessionError);
            // Fallback к старому методу
            const recentId = await this.getRecentConversationId(userId, assistantId, channel, 45);
            conversationId = recentId;
          } else {
            conversationId = sessionId;
            console.log(`✅ Используем сессию диалога: ${conversationId}`);
          }
        } catch (error) {
          console.error('❌ Исключение при создании сессии:', error);
          // Fallback к старому методу
          const recentId = await this.getRecentConversationId(userId, assistantId, channel, 45);
          conversationId = recentId;
        }
      }

      // ПРОСТАЯ И ПОНЯТНАЯ ЛОГИКА: Новый диалог = нет conversationId ИЛИ нет истории
      const hasValidConversationId = conversationId && typeof conversationId === 'string' && conversationId.length > 0;
      const hasConversationHistory = options.conversationHistory && options.conversationHistory.length > 0;
      
      // Проверяем, есть ли уже сообщения в этом диалоге в БД
      let hasExistingMessages = false;
      if (hasValidConversationId) {
        try {
          const { data: existingMessages } = await this.supabase
            .from('chat_messages')
            .select('id')
            .eq('conversation_id', conversationId)
            .limit(1);
          hasExistingMessages = existingMessages && existingMessages.length > 0;
        } catch (error) {
          console.log('⚠️ Error checking existing messages:', error.message);
        }
      }
      
      // Если истории не передали, загрузим последние сообщения из БД для контекста
      let dbHistory = [];
      if (hasValidConversationId && !hasConversationHistory) {
        try {
          const { data: historyData } = await this.supabase
            .from('chat_messages')
            .select('role, content, created_at')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(20);
          dbHistory = (historyData || []).map(m => ({ role: m.role, content: m.content }));
        } catch (e) {
          // no-op
        }
      }

      // Новый диалог только если нет истории ни в UI, ни в БД, и нет валидного conversationId
      let isNewConversation = false;
      if (hasConversationHistory) {
        isNewConversation = false;
      } else if (hasValidConversationId && hasExistingMessages) {
        isNewConversation = false;
      } else if (!hasValidConversationId && dbHistory.length === 0) {
        isNewConversation = true;
      }
      
      console.log(`🆕 Новый диалог:`, isNewConversation);
      console.log(`🆔 Валидный conversationId:`, hasValidConversationId);
      console.log(`📚 Есть история диалога:`, hasConversationHistory);
      console.log(`💾 Есть сообщения в БД:`, hasExistingMessages);
      
      // Получаем настройки агента
      const agentSettings = await this.getAgentSettings(userId, assistantId);
      
      // Рабочее время и интенты
      const intents = this.detectIntents(String(message || ''));
      const workingHours = await this.getWorkingHours(userId, assistantId);
      const withinWorking = this.isWithinWorkingHours(workingHours);
      let showFormWanted = false;
      let handoverWanted = false;

      // Кол-во сообщений в текущем диалоге (для триггера длительного диалога)
      const messagesCount = (hasConversationHistory ? (options.conversationHistory?.length || 0) : dbHistory.length) + 1;

      // Немедленная эскалация: запрос «позвать менеджера»
      if (intents.managerHelp) {
        let content;
        if (withinWorking) {
          handoverWanted = true;
          content = 'Сейчас пригласим менеджера.';
        } else {
          showFormWanted = true;
          content = 'К сожалению, сейчас мы не онлайн. Хотите оставить заявку? Мы перезвоним в рабочее время.';
        }
        
        const saved = await this.saveConversationMessages(
          conversationId, userId, assistantId, message,
          { content, tokensUsed: 0 },
          { type: 'none', results: [] },
          { ...options, channel }
        );
        
        // Отмечаем показ формы один раз на диалог
        if (showFormWanted && saved?.conversationId) {
          try { await this.supabase.from('conversations').update({ form_shown: true }).eq('id', saved.conversationId); } catch (_) {}
        }
        
        return {
          success: true,
          response: content,
          conversationId: saved.conversationId,
          ragContext: { type: 'none', results: [] },
          tokensUsed: 0,
          showForm: showFormWanted,
          handover: handoverWanted
        };
      }

      // Завершение диалога: «это помогло», «спасибо»
      if (intents.helped) {
        const content = 'Спасибо за обращение!';
        const saved = await this.saveConversationMessages(
          conversationId, userId, assistantId, message,
          { content, tokensUsed: 0 },
          { type: 'none', results: [] },
          { ...options, channel }
        );
        return {
          success: true,
          response: content,
          conversationId: saved.conversationId,
          ragContext: { type: 'none', results: [] },
          tokensUsed: 0,
          showForm: false,
          handover: false
        };
      }
      
      // Получаем системный промпт (без настроек клиента)
      const systemPrompt = await this.getSystemPrompt(userId, assistantId);
      
      // Получаем пользовательский промпт (настройки клиента)
      const userPrompt = await this.getUserPrompt(agentSettings, isNewConversation);
      
      // Прокидываем nicheId из настроек в RAG-поиск
      const nicheIdFromSettings = (agentSettings && (agentSettings.niche_id || (agentSettings.settings && agentSettings.settings.nicheId))) || null;
      const searchOptions = { ...options, nicheId: options.nicheId || nicheIdFromSettings || null };
      
      // Ищем релевантные знания (используем userId для поиска)
      const ragContext = await this.searchRelevantKnowledge(message, userId, assistantId, searchOptions);
      
      // Создаем контекст для LLM с историей диалога
      const history = hasConversationHistory ? options.conversationHistory : dbHistory;
      const llmContext = await this.createLLMContext(systemPrompt, userPrompt, ragContext, message, options, history);
      
      // Отправляем в GigaChat
      const response = await this.sendToGigaChat(llmContext, { ...options, userMessage: message, agentSettings: agentSettings });
      console.log('🤖 GigaChat response:', response);
      
      // Сохраняем сообщения
      const savedMessages = await this.saveConversationMessages(
        conversationId, userId, assistantId, message, response, ragContext, { ...options, channel }
      );
      
      // Обновляем FAQ кеш если нужно
      if (ragContext.type === 'rag' && ragContext.results.length > 0) {
        await this.updateFAQCache(message, response.content, userId, assistantId);
      }
      
      // Постобработка ответа - убираем звездочки и исправляем обращение
      let cleanResponse = response.content;
      cleanResponse = cleanResponse.replace(/\*\*([^*]+)\*\*/g, '$1');
      cleanResponse = cleanResponse.replace(/\*([^*]+)\*/g, '$1');
      
      // Исправляем обращение если нужно (шире: склонения и формы)
      if (agentSettings && agentSettings.addressing) {
        cleanResponse = this.enforceAddressing(cleanResponse, agentSettings.addressing);
      }

      // Жёсткое правило приветствий: только в первом ответе
      const greetingRegex = /^\s*(Здравствуйте|Привет|Добрый день|Добрый вечер|Доброе утро)[!,.\s-]*/i;
      const hasGreeting = greetingRegex.test(cleanResponse);
      if (isNewConversation) {
        // Добавляем приветствие, если модель его пропустила
        if (!hasGreeting) {
          cleanResponse = `Здравствуйте! ${cleanResponse}`.trim();
        }
      } else {
        // Удаляем приветствие, если модель повторно поздоровалась
        cleanResponse = cleanResponse
          .replace(greetingRegex, '')
          .replace(/^\s*Здравствуйте![!,\.\s-]*/i, '')
          .replace(/^\s*Привет[!,\.\s-]*/i, '')
          .replace(/^\s*Добрый\s*(день|вечер|утро)[!,\.\s-]*/i, '')
          .trimStart();
      }

      // Удаляем эмодзи, если в настройках указано "Никогда"
      try {
        const settingsRaw = agentSettings && (agentSettings.settings || agentSettings);
        const emojiPref = settingsRaw && (settingsRaw.emoji_usage || settingsRaw.emojiUsage);
        if (emojiPref && /никогда/i.test(emojiPref)) {
          // Удаляем большинство unicode-эмодзи
          const emojiRegex = /[\u2190-\u21FF\u2300-\u27BF\u2B00-\u2BFF\u1F000-\u1FAFF\u2600-\u26FF\u2700-\u27BF]|[\u{1F600}-\u{1F64F}]/gu;
          cleanResponse = cleanResponse.replace(emojiRegex, '').replace(/\s{2,}/g, ' ').trim();
        }
      } catch (_) {}

      // Если пользователь просит ссылку на сайт – подставляем URL из базы знаний
      try {
        const linkIntent = /\b(ссылка|ссылку|сайт|страницу|web|url)\b/i.test(String(message || ''));
        const responseHasUrl = /(https?:\/\/|www\.)/i.test(cleanResponse);
        if (linkIntent && !responseHasUrl) {
          const nicheId = searchOptions.nicheId || null;
          let query = this.supabase
            .from('knowledge_sources')
            .select('source_url, source_type, niche_id')
            .eq('user_id', userId)
            .not('source_url', 'is', null)
            .order('created_at', { ascending: false })
            .limit(5);
          if (nicheId) query = query.eq('niche_id', nicheId);
          const { data: sources } = await query;
          const preferred = (sources || []).find(s => s.source_type === 'site' || s.source_type === 'website') || (sources || [])[0];
          if (preferred && preferred.source_url) {
            cleanResponse = `${cleanResponse}\n\nСсылка: ${preferred.source_url}`.trim();
          }
        }
      } catch (_) {}

      // Контекстные триггеры показа формы (после ответа)
      const priceOrBooking = intents.priceOrBooking; // Запрос на запись/цену/консультацию
      const longDialogFallback = messagesCount > 5 && (!ragContext || ragContext.type !== 'rag' || !ragContext.results || ragContext.results.length === 0);

      // Проверяем, показывалась ли форма ранее в этом диалоге
      let alreadyShown = false;
      if (conversationId) {
        try {
          const { data } = await this.supabase.from('conversations').select('form_shown').eq('id', conversationId).single();
          alreadyShown = !!(data && data.form_shown);
        } catch (_) {}
      }

      if (!alreadyShown && (priceOrBooking || longDialogFallback)) {
        showFormWanted = true;
        cleanResponse = `${cleanResponse}\n\nХотите, оформлю заявку, и менеджер свяжется с вами?`;
      }

      // Отмечаем показ формы один раз на диалог
      if (showFormWanted) {
        const convId = conversationId || (savedMessages && savedMessages.conversationId);
        if (convId) {
          try { await this.supabase.from('conversations').update({ form_shown: true }).eq('id', convId); } catch (_) {}
        }
      }

      return {
        success: true,
        response: cleanResponse,
        conversationId: (savedMessages && savedMessages.conversationId) || conversationId || null,
        ragContext,
        tokensUsed: response.tokensUsed || 0,
        showForm: showFormWanted,
        handover: handoverWanted
      };
      
    } catch (error) {
      console.error('❌ Error processing message:', error);
      throw error;
    }
  }

  async getAgentSettings(userId, assistantId) {
    const cacheKey = `settings-${userId}-${assistantId}`;
    
    if (this.settingsCache.has(cacheKey)) {
      console.log('💾 Settings from cache');
      return this.settingsCache.get(cacheKey);
    }
    
    const { data, error } = await this.supabase
      .from('ai_agent_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('assistant_id', assistantId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    let settings = null;
    
    // Если есть настройки в поле settings, используем их (это НОВЫЕ настройки)
    if (data && data.settings) {
      console.log('🔄 Используем НОВЫЕ настройки из поля settings');
      const parsedSettings = data.settings;
      settings = {
        communication_style: parsedSettings.communication_style || parsedSettings.communicationStyle,
        addressing: parsedSettings.addressing,
        emoji_usage: parsedSettings.emoji_usage || parsedSettings.emojiUsage,
        restrictions: parsedSettings.restrictions,
        additional_settings: parsedSettings.additional_settings || parsedSettings.communicationSettings,
        dialog_stages: parsedSettings.dialog_stages || parsedSettings.dialogStages,
        target_audience: parsedSettings.target_audience || parsedSettings.targetAudience,
        main_goal: parsedSettings.main_goal || parsedSettings.mainGoal
      };
    } else {
      settings = data;
    }
    
    // Кэшируем настройки на 5 минут
    this.settingsCache.set(cacheKey, settings);
    setTimeout(() => {
      this.settingsCache.delete(cacheKey);
    }, 5 * 60 * 1000);
    
    return settings;
  }

  async getSystemPrompt(userId, assistantId) {
    const cacheKey = `system-${userId}-${assistantId}`;
    
    if (this.promptCache.has(cacheKey)) {
      return this.promptCache.get(cacheKey);
    }
    
    // Получаем настройки агента для персонализации системного промта
    const agentSettings = await this.getAgentSettings(userId, assistantId);
    
    // Генерируем системный промпт с учетом настроек клиента
    const systemPrompt = await this.generateSystemPrompt(agentSettings);
    
    this.promptCache.set(cacheKey, systemPrompt);
    return systemPrompt;
  }

  async generateSystemPrompt(agentSettings = null, options = {}) {
    console.log('🔍 generateSystemPrompt called with agentSettings:', agentSettings);
    
    // Импортируем унифицированный генератор
    const { promptGenerator } = await import('./unified-prompt-generator.js');
    
    // Используем унифицированный генератор
    const prompt = await promptGenerator.generateSystemPrompt(agentSettings, options);
    
    console.log('✅ Системный промпт сгенерирован через унифицированный генератор');
    return prompt;
  }

  async getUserPrompt(agentSettings, isNewConversation = false) {
    if (!agentSettings) {
      return '';
    }

    let userPrompt = '';

    // РОЛЬ И НАЗНАЧЕНИЕ
    if (agentSettings.task) {
      userPrompt += `\n🎭 РОЛЬ: ${agentSettings.task === 'Продавать' ? 'Продавец-консультант' : 'Консультант'}\n`;
    }

    // Главная цель
    if (agentSettings.main_goal) {
      userPrompt += `🎪 ГЛАВНАЯ ЦЕЛЬ: ${agentSettings.main_goal}\n`;
    } else if (agentSettings.main_goal_custom) {
      userPrompt += `🎪 ГЛАВНАЯ ЦЕЛЬ: ${agentSettings.main_goal_custom}\n`;
    }

    // Целевая аудитория
    if (agentSettings.target_audience) {
      userPrompt += `🎯 ЦЕЛЕВАЯ АУДИТОРИЯ: ${agentSettings.target_audience}\n`;
    }

    // Стиль общения
    if (agentSettings.communication_style) {
      userPrompt += `\n🎭 СТИЛЬ ОБЩЕНИЯ: ${agentSettings.communication_style}\n`;
    }

    // Обращение - КРИТИЧЕСКИ ВАЖНО
    if (agentSettings.addressing) {
      userPrompt += `👤 ОБРАЩЕНИЕ: ${agentSettings.addressing}\n`;
      userPrompt += `🚨 КРИТИЧЕСКИ ВАЖНО: ОБЯЗАТЕЛЬНО начинай каждый ответ с обращения "${agentSettings.addressing}"! НИКОГДА не используй другие обращения!\n`;
    }

    // Эмодзи
    if (agentSettings.emoji_usage) {
      userPrompt += `😊 ЭМОДЗИ: ${agentSettings.emoji_usage}\n`;
      if (agentSettings.emoji_usage === 'Никогда') {
        userPrompt += `🚨 СТРОГО ЗАПРЕЩЕНО: НЕ используй эмодзи в ответах!\n`;
      } else if (agentSettings.emoji_usage === 'Часто') {
        userPrompt += `🚨 ОБЯЗАТЕЛЬНО: Используй эмодзи в каждом ответе!\n`;
      }
    }

    // ОГРАНИЧЕНИЯ
    if (agentSettings.restrictions && agentSettings.restrictions.length > 0) {
      userPrompt += `\n🚫 ОГРАНИЧЕНИЯ:\n`;
      agentSettings.restrictions.forEach(restriction => {
        userPrompt += `- ${restriction}\n`;
      });
    }
    
    // Кастомные ограничения
    if (agentSettings.restrictions_custom) {
      userPrompt += `\n🚫 ДОПОЛНИТЕЛЬНЫЕ ОГРАНИЧЕНИЯ:\n`;
      userPrompt += `- ${agentSettings.restrictions_custom}\n`;
    }

    // ДОПОЛНИТЕЛЬНЫЕ НАСТРОЙКИ
    if (agentSettings.additional_settings && agentSettings.additional_settings.length > 0) {
      userPrompt += `\n⚙️ ДОПОЛНИТЕЛЬНЫЕ НАСТРОЙКИ:\n`;
      agentSettings.additional_settings.forEach(setting => {
        userPrompt += `- ${setting}\n`;
      });
    }
    
    // Кастомные дополнительные настройки
    if (agentSettings.additional_settings_custom) {
      userPrompt += `\n⚙️ ДОПОЛНИТЕЛЬНЫЕ НАСТРОЙКИ:\n`;
      userPrompt += `- ${agentSettings.additional_settings_custom}\n`;
    }

    // ПРАВИЛА СБОРА ДАННЫХ
    if (agentSettings.data_collection && agentSettings.data_collection.length > 0) {
      userPrompt += `\n📊 ПРАВИЛА СБОРА ДАННЫХ:\n`;
      agentSettings.data_collection.forEach(rule => {
        userPrompt += `- ${rule}\n`;
      });
    }
    
    if (agentSettings.data_collection_custom) {
      userPrompt += `\n📊 ДОПОЛНИТЕЛЬНЫЕ ПРАВИЛА СБОРА:\n`;
      userPrompt += `- ${agentSettings.data_collection_custom}\n`;
    }

    // ПРАВИЛА УТОЧНЕНИЯ
    if (agentSettings.clarification_rules && agentSettings.clarification_rules.length > 0) {
      userPrompt += `\n❓ ПРАВИЛА УТОЧНЕНИЯ:\n`;
      agentSettings.clarification_rules.forEach(rule => {
        userPrompt += `- ${rule}\n`;
      });
    }
    
    if (agentSettings.clarification_rules_custom) {
      userPrompt += `\n❓ ДОПОЛНИТЕЛЬНЫЕ ПРАВИЛА УТОЧНЕНИЯ:\n`;
      userPrompt += `- ${agentSettings.clarification_rules_custom}\n`;
    }

    // ЭТАПЫ ДИАЛОГА
    if (agentSettings.dialog_stages && agentSettings.dialog_stages.length > 0) {
      userPrompt += `\n📋 ЭТАПЫ ДИАЛОГА:\n`;
      agentSettings.dialog_stages.forEach((stage, index) => {
        userPrompt += `${index + 1}. ${stage}\n`;
      });
    }

    // СТАТУС ДИАЛОГА
    if (isNewConversation) {
      userPrompt += `\n👋 ПРИВЕТСТВИЕ: Это НОВЫЙ диалог! ОБЯЗАТЕЛЬНО поприветствуй пользователя в начале ответа.\n`;
      userPrompt += `🎯 ПРИМЕР ПРИВЕТСТВИЯ: "Привет! Рад вас видеть! Чем могу помочь?"\n`;
    } else {
      userPrompt += `\n💬 ПРОДОЛЖЕНИЕ: Это продолжение диалога. НЕ здоровайся повторно.\n`;
    }

    return userPrompt;
  }

  async createLLMContext(systemPrompt, userPrompt, ragContext, userMessage, options = {}, conversationHistory = []) {
    console.log('🔍 RAG Context:', ragContext);
    
    // Используем унифицированный генератор для создания контекста
    const { promptGenerator } = await import('./unified-prompt-generator.js');
    
    // Подготавливаем опции для генератора
    const generatorOptions = {
      ragContext: ragContext,
      conversationHistory: conversationHistory
    };
    
    // Генерируем полный контекст через унифицированный генератор
    const fullContext = await promptGenerator.generateSystemPrompt(options.agentSettings, generatorOptions);
    
    // Добавляем пользовательский промпт если есть
    let finalContext = fullContext;
    if (userPrompt) {
      finalContext += `\n\n🎛️ НАСТРОЙКИ КЛИЕНТА:${userPrompt}`;
    }
    
    return finalContext;
  }

  postProcessResponse(response, agentSettings) {
    if (!agentSettings) return response;
    
    const settings = agentSettings.settings || agentSettings;
    let processedResponse = response;
    
    // Принудительно добавляем обращение если его нет
    if (settings.addressing) {
      const hasAddressing = processedResponse.includes(settings.addressing);
      if (!hasAddressing) {
        // Добавляем обращение в начало
        processedResponse = `${settings.addressing}, ${processedResponse.toLowerCase()}`;
      }
    }
    
    // Принудительно добавляем эмодзи если нужно
    if (settings.emoji_usage === 'Часто') {
      const hasEmoji = /[\u{1F600}-\u{1F64F}]/u.test(processedResponse);
      if (!hasEmoji) {
        // Добавляем эмодзи в конец
        processedResponse += ' 😊';
      }
    }
    
    // Убираем эмодзи если запрещено
    if (settings.emoji_usage === 'Никогда') {
      processedResponse = processedResponse.replace(/[\u{1F600}-\u{1F64F}]/gu, '');
    }
    
    // ИНТЕГРАЦИЯ УМНОГО МЕНЕДЖЕРА ТОКЕНОВ
    try {
      console.log('🧠 Применяем умное управление токенами...');
      
      // Настраиваем менеджер токенов на основе настроек агента
      const maxTokens = settings.maxTokens || 300;
      const tokenStrategy = settings.tokenStrategy || 'reserve'; // 'reserve' или 'split'
      
      smartTokenManager.configure({
        maxTokens: maxTokens,
        reserveTokens: 50
      });
      
      // Обрабатываем ответ с умным управлением токенами
      const tokenResult = smartTokenManager.processResponse(processedResponse, {
        strategy: tokenStrategy
      });
      
      console.log(`📊 Результат обработки токенов: ${tokenResult.type}`);
      console.log(`📏 Токены в ответе: ${tokenResult.tokens}`);
      console.log(`🔄 Нужно продолжение: ${tokenResult.needsContinuation}`);
      
      // Возвращаем обработанный ответ
      processedResponse = tokenResult.content;
      
    } catch (error) {
      console.error('❌ Ошибка умного менеджера токенов:', error);
      // Fallback к исходному ответу
    }
    
    console.log('🔧 Пост-обработка ответа:', processedResponse);
    return processedResponse;
  }

  async sendToGigaChat(context, options = {}) {
    try {
      const systemPrompt = typeof context === 'string' ? context : context.systemPrompt;
      const userMessage = options.userMessage || 'Привет!';
      const ragContext = context.ragContext || null;
      
      // ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ ПРОМПТА
      console.log('=== PROMPT FOR GIGACHAT MODEL ===');
      console.log('SYSTEM PROMPT:', systemPrompt);
      if (ragContext) {
        console.log('RAG CONTEXT:', ragContext.context || ragContext);
        console.log('RAG TOKENS USED:', ragContext.tokensUsed || 'N/A');
        console.log('RAG ITEMS COUNT:', ragContext.itemsCount || 'N/A');
      } else {
        console.log('RAG CONTEXT: НЕТ (система работает без RAG)');
      }
      console.log('USER MESSAGE:', userMessage);
      console.log('=====================================');
      
      const GIGACHAT_API_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';
      const GIGACHAT_AUTH_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
      
      // Настройка HTTPS агента для игнорирования сертификатов
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false
      });
      
      // Получаем токен
      const tokenResponse = await axios.post(GIGACHAT_AUTH_URL, 
        'scope=GIGACHAT_API_PERS',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'RqUID': '6f0b1291-c7f3-43c0-bb47-8790703601da',
            'Authorization': 'Bearer ' + process.env.GIGACHAT_API_KEY
          },
          httpsAgent
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // Отправляем запрос к GigaChat с правильной структурой
      const chatResponse = await axios.post(GIGACHAT_API_URL, {
        model: 'GigaChat:latest',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        },
        httpsAgent
      });

      // Пост-обработка ответа для принудительной персонализации
      let responseContent = chatResponse.data.choices[0].message.content;
      
      if (options.agentSettings) {
        responseContent = this.postProcessResponse(responseContent, options.agentSettings);
      }

      console.log('✅ GigaChat ответ получен');
      
      return {
        content: responseContent,
        tokensUsed: chatResponse.data.usage?.total_tokens || 0
      };
      
    } catch (error) {
      console.error('❌ Error calling GigaChat:', error);
      console.log('⚠️ Status:', error.response?.status);
      console.log('⚠️ Data:', error.response?.data);
      
      // Fallback на контекстуальные ответы
      const message = context.toLowerCase();
      
      let fallbackResponse = 'Привет! Я ваш ИИ-ассистент. Чем могу помочь?';
      
      if (message.includes('привет') || message.includes('здравствуй')) {
        fallbackResponse = 'Привет! Рад вас видеть! Как дела?';
      } else if (message.includes('как дела') || message.includes('как поживаешь')) {
        fallbackResponse = 'У меня все отлично! А у вас как дела?';
      } else if (message.includes('спасибо')) {
        fallbackResponse = 'Пожалуйста! Всегда рад помочь!';
      } else if (message.includes('помощь') || message.includes('помоги')) {
        fallbackResponse = 'Конечно, чем могу помочь? Опишите ваш вопрос подробнее.';
      } else if (message.includes('вопрос')) {
        fallbackResponse = 'Задавайте ваш вопрос, я постараюсь помочь!';
      } else if (message.includes('что') || message.includes('как')) {
        fallbackResponse = 'Интересный вопрос! Расскажите подробнее, что именно вас интересует?';
      }
      
      return {
        content: fallbackResponse,
        tokensUsed: 0
      };
    }
  }

  async saveConversationMessages(conversationId, userId, assistantId, userMessage, aiResponse, ragContext, options = {}) {
    console.log(`💾 saveConversationMessages called with userId: ${userId}, assistantId: ${assistantId}`);
    console.log(`💾 conversationId: ${conversationId}`);
    
    // Если нет conversationId — пробуем найти или создать разговор
    const channel = options.channel || 'admin';
    if (!conversationId || !conversationId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const recentId = await this.getRecentConversationId(userId, assistantId, channel, 45);
      conversationId = recentId || randomUUID();
      await this.ensureConversation(conversationId, userId, assistantId, channel);
      console.log(`🆔 Используем conversation: ${conversationId}`);
    }
    
    // Проверяем, что userMessage не пустой
    if (!userMessage || typeof userMessage !== 'string') {
      console.error('❌ Invalid userMessage:', userMessage);
      throw new Error('Invalid user message');
    }
    
    // Получаем или создаем ассистента для пользователя
    console.log(`🔧 Getting or creating assistant for user: ${userId}`);
    let finalAssistantId = await this.getOrCreateAssistant(userId);
    console.log(`✅ Final assistant ID: ${finalAssistantId}`);
    
    // ИСПРАВЛЕНИЕ 2: Сохраняем сообщение пользователя с правильными ролями
    const userMessageData = {
      user_id: userId,
      role: 'user',
      content: userMessage,
      message_content: userMessage,
      conversation_id: conversationId,
      assistant_id: finalAssistantId,
      channel: options.channel || 'admin',
      sender_type: 'user',           // ИСПРАВЛЕНИЕ: явно указываем роль отправителя
      is_operator_message: false     // ИСПРАВЛЕНИЕ: это сообщение от пользователя
    };
    
    console.log('💾 Saving user message with data:', userMessageData);
    
    const { data: userMsg, error: userError } = await this.supabase
      .from('chat_messages')
      .insert(userMessageData)
      .select()
      .single();
      
    if (userError) {
      console.error('Error saving user message:', userError);
      throw userError;
    }
    
    // Проверяем, что aiResponse.content не пустой
    if (!aiResponse || !aiResponse.content || typeof aiResponse.content !== 'string') {
      console.error('❌ Invalid aiResponse:', aiResponse);
      throw new Error('Invalid AI response');
    }
    
    // ИСПРАВЛЕНИЕ 3: Сохраняем ответ агента с правильными ролями
    const aiMessageData = {
      user_id: userId,
      role: 'assistant',
      content: aiResponse.content,
      message_content: aiResponse.content,
      conversation_id: conversationId,
      assistant_id: finalAssistantId,
      channel: options.channel || 'admin',
      tokens_in: this.estimateTokens(userMessage),
      tokens_out: aiResponse.tokensUsed || 0,
      sender_type: 'ai',              // ИСПРАВЛЕНИЕ: явно указываем роль отправителя
      is_operator_message: false      // ИСПРАВЛЕНИЕ: это сообщение от ИИ
    };
    
    console.log('💾 Saving AI message with data:', aiMessageData);
    
    const { data: aiMsg, error: aiError } = await this.supabase
      .from('chat_messages')
      .insert(aiMessageData)
      .select()
      .single();
      
    if (aiError) throw aiError;
    
    // Обновляем last_message_at у диалога
    try {
      await this.supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
    } catch (e) {}

    return {
      conversationId,
      userMessage: userMsg,
      aiMessage: aiMsg
    };
  }

  // Get or create assistant for user
  async getOrCreateAssistant(userId) {
    try {
      console.log(`Looking for existing assistant for user ${userId}`);
      
      // Try to find existing assistant
      const { data: existingAssistant, error: searchError } = await this.supabase
        .from('assistants')
        .select('id')
        .eq('owner_id', userId)
        .single();
      
      if (existingAssistant && !searchError) {
        console.log(`Found existing assistant: ${existingAssistant.id}`);
        return existingAssistant.id;
      }
      
      // If error is not about missing record, throw it
      if (searchError && searchError.code !== 'PGRST116') {
        console.error('Error searching for assistant:', searchError);
        throw searchError;
      }
      
      console.log(`Creating new assistant for user ${userId}`);
      
      // SIMPLE SOLUTION: Create assistant with NULL owner_id
      const { data: newAssistant, error: createError } = await this.supabase
        .from('assistants')
        .insert({
          owner_id: null,
          name: `AI Agent for ${userId}`,
          language: 'ru',
          prompt: 'You are a helpful AI assistant that helps users with their questions.',
          active: true
        })
        .select('id')
        .single();
      
      if (createError) {
        console.error('Error creating assistant:', createError);
        const randomId = randomUUID();
        console.log(`Using random assistant ID: ${randomId}`);
        return randomId;
      }
      
      console.log(`Created new assistant: ${newAssistant.id}`);
      return newAssistant.id;
      
    } catch (error) {
      console.error('Error in getOrCreateAssistant:', error);
      const randomId = randomUUID();
      console.log(`Using random assistant ID: ${randomId}`);
      return randomId;
    }
  }

  // 4. СЛОЙ КАСТОМИЗАЦИИ ПОД КЛИЕНТА
  async updateAgentSettings(userId, assistantId, settings) {
    try {
      const { data, error } = await this.supabase
        .from('ai_agent_settings')
        .upsert({
          user_id: userId,
          assistant_id: assistantId,
          niche_id: settings.nicheId || settings.niche_id || null,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      // Очищаем кеш промптов
      this.promptCache.delete(`${userId}-${assistantId}`);
      
      return data;
      
    } catch (error) {
      console.error('❌ Error updating agent settings:', error);
      throw error;
    }
  }

  // 5. СЛОЙ ИНТЕГРАЦИЙ
  async processWidgetMessage(message, userId, assistantId, options = {}) {
    return this.processMessage(userId, assistantId, message, null, {
      ...options,
      channel: 'widget'
    });
  }

  async processTelegramMessage(message, userId, assistantId, chatId, options = {}) {
    return this.processMessage(userId, assistantId, message, null, {
      ...options,
      channel: 'telegram',
      chatId
    });
  }

  async processWhatsAppMessage(message, userId, assistantId, phoneNumber, options = {}) {
    return this.processMessage(userId, assistantId, message, null, {
      ...options,
      channel: 'whatsapp',
      phoneNumber
    });
  }

  // 6. СЛОЙ ОПТИМИЗАЦИИ ЗАТРАТ
  async updateFAQCache(question, answer, userId, assistantId, confidence = 0.8) {
    const questionHash = this.createQueryHash(question);
    
    const { data, error } = await this.supabase
      .from('faq_cache')
      .upsert({
        user_id: userId,
        assistant_id: assistantId,
        question_hash: questionHash,
        question: question,
        answer: answer,
        confidence_score: confidence,
        usage_count: 1,
        last_used_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 7. АНАЛИТИКА И КОНТРОЛЬ КАЧЕСТВА
  async recordMetric(userId, assistantId, metricType, metricValue, metricData = {}) {
    const { data, error } = await this.supabase
      .from('analytics_metrics')
      .insert({
        user_id: userId,
        assistant_id: assistantId,
        metric_type: metricType,
        metric_value: metricValue,
        metric_data: metricData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAnalytics(userId, assistantId, dateFrom, dateTo) {
    const { data, error } = await this.supabase
      .from('analytics_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('assistant_id', assistantId)
      .gte('recorded_at', dateFrom)
      .lte('recorded_at', dateTo)
      .order('recorded_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Вспомогательные методы
  createQueryHash(query) {
    // Простая хеш-функция без crypto
    let hash = 0;
    const str = query.toLowerCase().trim();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  truncateByTokens(text, maxTokens) {
    const maxChars = maxTokens * 4;
    if (text.length <= maxChars) return text;
    
    let truncated = text.slice(0, maxChars);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxChars * 0.8) {
      truncated = truncated.slice(0, lastSpace);
    }
    
    return truncated + '...';
  }

  // Очистка кешей
  clearCaches() {
    this.faqCache.clear();
    this.promptCache.clear();
    this.searchCache.clear();
    this.settingsCache.clear();
    console.log('🧹 All caches cleared');
  }

  // Получение статистики
  async getSystemStats(userId, assistantId) {
    try {
      const [sources, chunks, conversations, messages] = await Promise.all([
        this.supabase.from('knowledge_sources').select('id').eq('user_id', userId).eq('assistant_id', assistantId),
        this.supabase.from('knowledge_chunks').select('tokens_estimate').eq('user_id', userId).eq('assistant_id', assistantId),
        this.supabase.from('conversations').select('id').eq('user_id', userId).eq('assistant_id', assistantId),
        this.supabase.from('chat_messages').select('tokens_in, tokens_out').eq('user_id', userId).eq('assistant_id', assistantId)
      ]);

      const totalTokens = chunks.data?.reduce((sum, chunk) => sum + chunk.tokens_estimate, 0) || 0;
      const totalInputTokens = messages.data?.reduce((sum, msg) => sum + msg.tokens_in, 0) || 0;
      const totalOutputTokens = messages.data?.reduce((sum, msg) => sum + msg.tokens_out, 0) || 0;

      return {
        sourcesCount: sources.data?.length || 0,
        chunksCount: chunks.data?.length || 0,
        conversationsCount: conversations.data?.length || 0,
        messagesCount: messages.data?.length || 0,
        totalKnowledgeTokens: totalTokens,
        totalInputTokens,
        totalOutputTokens,
        totalTokensUsed: totalInputTokens + totalOutputTokens
      };
      
    } catch (error) {
      console.error('❌ Error getting system stats:', error);
      throw error;
    }
  }

  // Простая детекция интентов (менеджер / цены/запись)
  detectIntents(text) {
    const t = text.toLowerCase();
    const managerHelp = /(позвать|позови|подключ(и|ить)|приглас(и|ить)|нужна|нужен|свяж(итесь|ись)|связаться|живой\s*оператор).*(менеджер|оператор|человек)|помощь\s*(менеджера|оператора)/.test(t);
    const priceOrBooking = /(сколько\s*стоит|цена|стоимость|записаться|оформить|консультац|прайс|купить|заказать|заявк|оставить\s*заявку|остав(ить)?\s*(номер|телефон)|заполн(ить)?\s*форму|перезвонить|связаться)/.test(t);
    const helped = /(это помогло|спасибо|всё понятно|все понятно|понял|поняла)/.test(t);
    return { managerHelp, priceOrBooking, helped };
  }

  enforceAddressing(text, addressing) {
    try {
      let out = String(text || '');
      if (addressing === 'Вы') {
        // Заменяем формы «ты/тебе/твой» -> «Вы/Вам/Ваш» (простая эвристика)
        out = out.replace(/\bты\b/gi, 'Вы')
                 .replace(/\bтебе\b/gi, 'Вам')
                 .replace(/\bтебя\b/gi, 'Вас')
                 .replace(/\bтвой\b/gi, 'Ваш')
                 .replace(/\bтвоя\b/gi, 'Ваша')
                 .replace(/\bтвои\b/gi, 'Ваши')
                 .replace(/\bтвою\b/gi, 'Вашу');
      } else if (addressing === 'ты') {
        out = out.replace(/\bВы\b/g, 'ты')
                 .replace(/\bВам\b/g, 'тебе')
                 .replace(/\bВас\b/g, 'тебя')
                 .replace(/\bВаш\b/g, 'твой')
                 .replace(/\bВаша\b/g, 'твоя')
                 .replace(/\bВаши\b/g, 'твои')
                 .replace(/\bВашу\b/g, 'твою');
      }
      return out;
    } catch (_) { return text; }
  }

  // Хелперы рабочих часов
  async getWorkingHours(userId, assistantId) {
    try {
      const { data, error } = await this.supabase
        .from('working_hours')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) return null;
      return (data && data[0]) || null;
    } catch (_) { return null; }
  }
  
  isWithinWorkingHours(working) {
    try {
      if (!working) return true; // по умолчанию считаем рабочим
      const tz = working.timezone || 'Europe/Moscow';
      const now = new Date();
      // Без внешних библиотек: используем локальное время сервера как approximation
      const day = ((now.getDay() + 6) % 7) + 1; // Пн=1...Вс=7
      const days = Array.isArray(working.days_of_week) ? working.days_of_week : [1,2,3,4,5];
      if (!days.includes(day)) return false;
      const [hs, ms] = String(working.start_time || '10:00').split(':').map(Number);
      const [he, me] = String(working.end_time || '19:00').split(':').map(Number);
      const minutesNow = now.getHours() * 60 + now.getMinutes();
      const minutesStart = hs * 60 + (ms || 0);
      const minutesEnd = he * 60 + (me || 0);
      return minutesNow >= minutesStart && minutesNow <= minutesEnd;
    } catch (_) { return true; }
  }

  // ИСПРАВЛЕНИЕ 4: Новые функции для работы с операторами
  async saveOperatorMessage(conversationId, userId, assistantId, message, operatorId, channel = 'admin') {
    console.log(`👨‍💼 Сохранение сообщения оператора в диалог ${conversationId}`);
    
    try {
      const { data: messageId, error } = await this.supabase
        .rpc('save_operator_message', {
          p_conversation_id: conversationId,
          p_user_id: userId,
          p_assistant_id: assistantId,
          p_message_text: message,
          p_operator_id: operatorId,
          p_channel: channel
        });
      
      if (error) {
        console.error('❌ Ошибка сохранения сообщения оператора:', error);
        throw error;
      }
      
      console.log(`✅ Сообщение оператора сохранено с ID: ${messageId}`);
      return messageId;
    } catch (error) {
      console.error('❌ Исключение при сохранении сообщения оператора:', error);
      throw error;
    }
  }

  async handoverToOperator(conversationId, operatorId, reason = 'Manual takeover') {
    console.log(`🔄 Передача диалога ${conversationId} оператору ${operatorId}`);
    
    try {
      const { error } = await this.supabase
        .rpc('handover_to_operator', {
          p_conversation_id: conversationId,
          p_operator_id: operatorId,
          p_reason: reason
        });
      
      if (error) {
        console.error('❌ Ошибка передачи диалога оператору:', error);
        throw error;
      }
      
      console.log(`✅ Диалог успешно передан оператору`);
      return true;
    } catch (error) {
      console.error('❌ Исключение при передаче диалога оператору:', error);
      throw error;
    }
  }

  // Функция для получения диалогов с операторами
  async getDialogsWithOperators(limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from('dialog_with_operators')
        .select('*')
        .order('last_message_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('❌ Ошибка получения диалогов:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Исключение при получении диалогов:', error);
      return [];
    }
  }

  // Функция для очистки старых сессий
  async cleanupOldSessions(hoursOld = 24) {
    try {
      const { data: deletedCount, error } = await this.supabase
        .rpc('cleanup_old_sessions', {
          p_hours_old: hoursOld
        });
      
      if (error) {
        console.error('❌ Ошибка очистки сессий:', error);
        throw error;
      }
      
      console.log(`✅ Очищено ${deletedCount} старых сессий`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Исключение при очистке сессий:', error);
      return 0;
    }
  }
}

export default AIAgentSystem;
export { parseWebsite };

