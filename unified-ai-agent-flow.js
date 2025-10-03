// Унифицированный флоу обработки ИИ-агентов
import { createClient } from '@supabase/supabase-js';
import UnifiedRAGSystem from './unified-rag-system.js';
import ChunkingSystem from './chunking.js';
import ImprovedContentParser from './improved-content-parser.js';
import EnhancedResponseValidator from './enhanced-response-validator.js';
import ResponseCorrector from './response-corrector.js';
import monitoring from './monitoring-system.js';
import KnowledgeDatabase from './knowledge-db.js';

class UnifiedAIAgentFlow {
  constructor(config = {}) {
    this.config = {
      supabaseUrl: config.supabaseUrl || process.env.SUPABASE_URL,
      supabaseKey: config.supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
      tokenBudget: config.tokenBudget || 800,
      maxChunks: config.maxChunks || 3,
      cacheTTL: config.cacheTTL || 3600000,
      enableValidation: config.enableValidation || true,
      enableMonitoring: config.enableMonitoring || true,
      ...config
    };
    
    // Инициализация компонентов
    this.supabase = createClient(this.config.supabaseUrl, this.config.supabaseKey);
    this.knowledgeDB = new KnowledgeDatabase();
    this.ragSystem = new UnifiedRAGSystem(this.knowledgeDB);
    this.chunkingSystem = new ChunkingSystem();
    this.contentParser = new ImprovedContentParser();
    
    // Инициализация расширенной валидации и коррекции
    this.enhancedValidator = new EnhancedResponseValidator({
      supabaseUrl: this.config.supabaseUrl,
      supabaseKey: this.config.supabaseKey,
      enableAdvancedValidation: this.config.enableAdvancedValidation || true,
      enableSentimentAnalysis: this.config.enableSentimentAnalysis || true,
      enableToxicityDetection: this.config.enableToxicityDetection || true,
      enableBiasDetection: this.config.enableBiasDetection || true,
      enableConsistencyCheck: this.config.enableConsistencyCheck || true,
      enableComplianceCheck: this.config.enableComplianceCheck || true
    });
    
    this.responseCorrector = new ResponseCorrector({
      supabaseUrl: this.config.supabaseUrl,
      supabaseKey: this.config.supabaseKey,
      enableAutoCorrection: this.config.enableAutoCorrection || true,
      enableStyleCorrection: this.config.enableStyleCorrection || true,
      enableFactCorrection: this.config.enableFactCorrection || true,
      enableToneCorrection: this.config.enableToneCorrection || true
    });
    
    // Кэши
    this.responseCache = new Map();
    this.promptCache = new Map();
    this.validationCache = new Map();
    
    // Статистика
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      validationPassed: 0,
      validationFailed: 0
    };
    
    console.log('🤖 Unified AI Agent Flow initialized');
  }
  
  // Основной метод обработки запроса пользователя
  async processUserRequest(request) {
    const startTime = Date.now();
    this.stats.totalRequests++;
    
    try {
      console.log('🚀 [UnifiedFlow] Processing user request:', {
        userId: request.userId,
        assistantId: request.assistantId,
        message: request.message?.substring(0, 100),
        timestamp: new Date().toISOString()
      });
      
      // 1. Валидация входных данных
      const validationResult = await this.validateRequest(request);
      if (!validationResult.isValid) {
        throw new Error(`Invalid request: ${validationResult.errors.join(', ')}`);
      }
      
      // 2. Получение настроек агента
      const agentSettings = await this.getAgentSettings(request.userId, request.assistantId);
      
      // 3. Проверка кэша ответов
      const cachedResponse = await this.getCachedResponse(request, agentSettings);
      if (cachedResponse) {
        this.stats.cacheHits++;
        console.log('✅ [UnifiedFlow] Cache HIT for request');
        return cachedResponse;
      }
      
      this.stats.cacheMisses++;
      
      // 4. Поиск релевантной информации
      const searchResults = await this.searchRelevantInformation(request, agentSettings);
      
      // 5. Генерация системного промпта
      const systemPrompt = await this.generateSystemPrompt(request, agentSettings, searchResults);
      
      // 6. Генерация ответа ИИ
      const aiResponse = await this.generateAIResponse(request, systemPrompt, agentSettings);
      
      // 7. Расширенная валидация ответа (если включена)
      if (this.config.enableValidation) {
        const validationResult = await this.enhancedValidator.validateResponse(aiResponse, {
          searchResults: searchResults,
          conversationHistory: request.conversationHistory || []
        }, request);
        
        if (!validationResult.isValid) {
          console.log('⚠️ [UnifiedFlow] Response validation failed, attempting correction...');
          
          // Попытка исправления ответа
          const correctionResult = await this.responseCorrector.correctResponse(
            aiResponse, 
            validationResult, 
            { searchResults: searchResults },
            request
          );
          
          if (correctionResult.success && correctionResult.correctedResponse.content !== aiResponse.content) {
            console.log('✅ [UnifiedFlow] Response corrected successfully');
            aiResponse = correctionResult.correctedResponse;
            this.stats.validationPassed++;
          } else {
            console.log('⚠️ [UnifiedFlow] Correction failed, regenerating response...');
            // Повторная генерация с улучшенным промптом
            const improvedPrompt = await this.generateImprovedPrompt(systemPrompt, validationResult.errors);
            const improvedResponse = await this.generateAIResponse(request, improvedPrompt, agentSettings);
            
            // Вторая попытка валидации
            const secondValidation = await this.enhancedValidator.validateResponse(improvedResponse, {
              searchResults: searchResults,
              conversationHistory: request.conversationHistory || []
            }, request);
            
            if (secondValidation.isValid) {
              aiResponse = improvedResponse;
              this.stats.validationPassed++;
            } else {
              this.stats.validationFailed++;
              // Используем fallback ответ
              aiResponse = await this.generateFallbackResponse(request, agentSettings);
            }
          }
        } else {
          this.stats.validationPassed++;
        }
      }
      
      // 8. Постобработка ответа
      const processedResponse = await this.postProcessResponse(aiResponse, request, agentSettings);
      
      // 9. Сохранение в кэш
      await this.cacheResponse(request, processedResponse, agentSettings);
      
      // 10. Сохранение в историю
      await this.saveToHistory(request, processedResponse);
      
      // 11. Мониторинг и метрики
      if (this.config.enableMonitoring) {
        await this.recordMetrics(request, processedResponse, startTime);
      }
      
      this.stats.successfulRequests++;
      
      console.log(`✅ [UnifiedFlow] Request processed successfully in ${Date.now() - startTime}ms`);
      
      return {
        success: true,
        response: processedResponse,
        searchResults: searchResults,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      this.stats.failedRequests++;
      console.error('❌ [UnifiedFlow] Request processing failed:', error);
      
      // Fallback ответ при ошибке
      const fallbackResponse = await this.generateFallbackResponse(request, {});
      
      return {
        success: false,
        response: fallbackResponse,
        error: error.message,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Валидация входящего запроса
  async validateRequest(request) {
    const errors = [];
    
    if (!request.userId) {
      errors.push('userId is required');
    }
    
    if (!request.message || typeof request.message !== 'string' || request.message.trim().length === 0) {
      errors.push('message is required and must be non-empty');
    }
    
    if (request.message && request.message.length > 4000) {
      errors.push('message is too long (max 4000 characters)');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  // Получение настроек агента
  async getAgentSettings(userId, assistantId) {
    const cacheKey = `settings_${userId}_${assistantId}`;
    
    if (this.promptCache.has(cacheKey)) {
      return this.promptCache.get(cacheKey);
    }
    
    try {
      const { data, error } = await this.supabase
        .from('ai_agent_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('assistant_id', assistantId)
        .single();
      
      if (error) {
        console.log('⚠️ [UnifiedFlow] No agent settings found, using defaults');
        return this.getDefaultAgentSettings();
      }
      
      this.promptCache.set(cacheKey, data);
      return data;
      
    } catch (error) {
      console.error('❌ [UnifiedFlow] Error getting agent settings:', error);
      return this.getDefaultAgentSettings();
    }
  }
  
  // Получение настроек по умолчанию
  getDefaultAgentSettings() {
    return {
      role: 'assistant',
      style: 'professional',
      emoji_usage: 'rare',
      max_response_length: 500,
      enable_rag: true,
      niche_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  
  // Поиск релевантной информации
  async searchRelevantInformation(request, agentSettings) {
    try {
      console.log('🔍 [UnifiedFlow] Searching relevant information...');
      
      const searchResults = await this.ragSystem.searchRelevantKnowledge(request.message, request.userId, {
        assistantId: request.assistantId,
        nicheId: agentSettings.niche_id,
        tokenBudget: this.config.tokenBudget,
        maxChunks: this.config.maxChunks
      });
      
      console.log(`✅ [UnifiedFlow] Found ${searchResults.chunks.length} relevant chunks`);
      return searchResults;
      
    } catch (error) {
      console.error('❌ [UnifiedFlow] Error searching information:', error);
      return { chunks: [], totalTokens: 0, searchSource: 'error' };
    }
  }
  
  // Генерация системного промпта
  async generateSystemPrompt(request, agentSettings, searchResults) {
    const cacheKey = `prompt_${request.userId}_${agentSettings.niche_id || 'default'}`;
    
    if (this.promptCache.has(cacheKey)) {
      const cachedPrompt = this.promptCache.get(cacheKey);
      return this.injectSearchResults(cachedPrompt, searchResults);
    }
    
    const basePrompt = this.buildBasePrompt(agentSettings);
    const contextPrompt = this.buildContextPrompt(searchResults);
    const fullPrompt = `${basePrompt}\n\n${contextPrompt}`;
    
    this.promptCache.set(cacheKey, basePrompt);
    return fullPrompt;
  }
  
  // Построение базового промпта
  buildBasePrompt(agentSettings) {
    const role = agentSettings.role || 'assistant';
    const style = agentSettings.style || 'professional';
    const emojiUsage = agentSettings.emoji_usage || 'rare';
    
    let prompt = `Ты ${role} с ${style} стилем общения.`;
    
    if (emojiUsage === 'never') {
      prompt += ' Не используй эмодзи.';
    } else if (emojiUsage === 'rare') {
      prompt += ' Используй эмодзи редко и только для выражения эмоций.';
    } else if (emojiUsage === 'often') {
      prompt += ' Используй эмодзи часто для дружелюбного общения.';
    }
    
    prompt += `\n\nПравила:
1. Отвечай только на основе предоставленной информации
2. Если информации нет, честно скажи об этом
3. Не выдумывай факты
4. Будь вежливым и полезным
5. Ограничь ответ ${agentSettings.max_response_length || 500} символами`;
    
    return prompt;
  }
  
  // Построение контекстного промпта
  buildContextPrompt(searchResults) {
    if (!searchResults.chunks || searchResults.chunks.length === 0) {
      return 'Контекст: Информация не найдена. Отвечай честно, что не знаешь ответа.';
    }
    
    let context = 'Контекст для ответа:\n';
    searchResults.chunks.forEach((chunk, index) => {
      context += `${index + 1}. ${chunk.chunk_text}\n`;
    });
    
    context += '\nИспользуй эту информацию для ответа на вопрос пользователя.';
    return context;
  }
  
  // Внедрение результатов поиска в кэшированный промпт
  injectSearchResults(basePrompt, searchResults) {
    const contextPrompt = this.buildContextPrompt(searchResults);
    return `${basePrompt}\n\n${contextPrompt}`;
  }
  
  // Генерация ответа ИИ
  async generateAIResponse(request, systemPrompt, agentSettings) {
    try {
      console.log('🤖 [UnifiedFlow] Generating AI response...');
      
      // Здесь должна быть интеграция с GigaChat или другой LLM
      // Пока используем заглушку
      const response = await this.callLLMAPI({
        system: systemPrompt,
        user: request.message,
        max_tokens: agentSettings.max_response_length || 500
      });
      
      console.log('✅ [UnifiedFlow] AI response generated');
      return response;
      
    } catch (error) {
      console.error('❌ [UnifiedFlow] Error generating AI response:', error);
      throw error;
    }
  }
  
  // Вызов LLM API (заглушка)
  async callLLMAPI(params) {
    // Здесь должна быть реальная интеграция с GigaChat
    // Пока возвращаем заглушку
    return {
      content: `Я получил ваш вопрос: "${params.user}". К сожалению, интеграция с LLM еще не настроена.`,
      tokens_used: 50,
      model: 'gigachat-pro'
    };
  }
  
  // Валидация ответа
  async validateResponse(response, searchResults, request) {
    const cacheKey = `validation_${JSON.stringify(response)}`;
    
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey);
    }
    
    const validation = {
      isValid: true,
      errors: [],
      score: 0
    };
    
    // 1. Проверка длины ответа
    if (response.content && response.content.length > 1000) {
      validation.errors.push('Response too long');
      validation.isValid = false;
    }
    
    // 2. Проверка наличия информации
    if (!response.content || response.content.trim().length === 0) {
      validation.errors.push('Empty response');
      validation.isValid = false;
    }
    
    // 3. Проверка на основе поисковых результатов
    if (searchResults.chunks.length > 0 && response.content) {
      const hasRelevantInfo = this.checkRelevance(response.content, searchResults.chunks);
      if (!hasRelevantInfo) {
        validation.errors.push('Response not based on search results');
        validation.score -= 0.3;
      }
    }
    
    // 4. Проверка на галлюцинации (простая)
    const hallucinationScore = this.detectHallucinations(response.content);
    if (hallucinationScore > 0.7) {
      validation.errors.push('Potential hallucination detected');
      validation.score -= 0.5;
    }
    
    // 5. Общая оценка
    if (validation.score < 0.5) {
      validation.isValid = false;
    }
    
    this.validationCache.set(cacheKey, validation);
    return validation;
  }
  
  // Проверка релевантности
  checkRelevance(response, chunks) {
    const responseWords = response.toLowerCase().split(/\s+/);
    const chunkWords = chunks.flatMap(chunk => chunk.chunk_text.toLowerCase().split(/\s+/));
    
    const commonWords = responseWords.filter(word => chunkWords.includes(word));
    const relevanceScore = commonWords.length / responseWords.length;
    
    return relevanceScore > 0.1; // Минимум 10% общих слов
  }
  
  // Детекция галлюцинаций (простая)
  detectHallucinations(content) {
    const hallucinationIndicators = [
      'точно знаю',
      'уверен что',
      'гарантирую',
      'определенно',
      'конечно'
    ];
    
    const contentLower = content.toLowerCase();
    let hallucinationScore = 0;
    
    hallucinationIndicators.forEach(indicator => {
      if (contentLower.includes(indicator)) {
        hallucinationScore += 0.2;
      }
    });
    
    return Math.min(hallucinationScore, 1.0);
  }
  
  // Генерация улучшенного промпта
  async generateImprovedPrompt(originalPrompt, validationErrors) {
    let improvedPrompt = originalPrompt;
    
    if (validationErrors.includes('Response not based on search results')) {
      improvedPrompt += '\n\nВАЖНО: Используй только информацию из предоставленного контекста.';
    }
    
    if (validationErrors.includes('Potential hallucination detected')) {
      improvedPrompt += '\n\nВАЖНО: Не выдумывай факты. Если не знаешь, скажи честно.';
    }
    
    return improvedPrompt;
  }
  
  // Генерация fallback ответа
  async generateFallbackResponse(request, agentSettings) {
    return {
      content: 'Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз или обратитесь к менеджеру.',
      tokens_used: 50,
      model: 'fallback'
    };
  }
  
  // Постобработка ответа
  async postProcessResponse(response, request, agentSettings) {
    let processedContent = response.content;
    
    // 1. Обрезка по длине
    const maxLength = agentSettings.max_response_length || 500;
    if (processedContent.length > maxLength) {
      processedContent = processedContent.substring(0, maxLength - 3) + '...';
    }
    
    // 2. Добавление метаданных
    return {
      ...response,
      content: processedContent,
      processed_at: new Date().toISOString(),
      user_id: request.userId,
      assistant_id: request.assistantId,
      validation_passed: true
    };
  }
  
  // Кэширование ответа
  async cacheResponse(request, response, agentSettings) {
    const cacheKey = this.createResponseCacheKey(request, agentSettings);
    this.responseCache.set(cacheKey, response);
    
    // Ограничиваем размер кэша
    if (this.responseCache.size > 1000) {
      const firstKey = this.responseCache.keys().next().value;
      this.responseCache.delete(firstKey);
    }
  }
  
  // Получение кэшированного ответа
  async getCachedResponse(request, agentSettings) {
    const cacheKey = this.createResponseCacheKey(request, agentSettings);
    return this.responseCache.get(cacheKey) || null;
  }
  
  // Создание ключа кэша ответа
  createResponseCacheKey(request, agentSettings) {
    return `${request.userId}_${agentSettings.niche_id || 'default'}_${request.message.substring(0, 50)}`;
  }
  
  // Сохранение в историю
  async saveToHistory(request, response) {
    try {
      // Сохранение сообщения пользователя
      await this.supabase
        .from('chat_messages')
        .insert({
          user_id: request.userId,
          assistant_id: request.assistantId,
          role: 'user',
          content: request.message,
          session_id: request.sessionId,
          created_at: new Date().toISOString()
        });
      
      // Сохранение ответа ассистента
      await this.supabase
        .from('chat_messages')
        .insert({
          user_id: request.userId,
          assistant_id: request.assistantId,
          role: 'assistant',
          content: response.content,
          session_id: request.sessionId,
          tokens_in: response.tokens_used || 0,
          created_at: new Date().toISOString()
        });
      
    } catch (error) {
      console.error('❌ [UnifiedFlow] Error saving to history:', error);
    }
  }
  
  // Запись метрик
  async recordMetrics(request, response, startTime) {
    try {
      const processingTime = Date.now() - startTime;
      
      await monitoring.recordMetric('ai_agent_request', {
        userId: request.userId,
        assistantId: request.assistantId,
        processingTime: processingTime,
        responseLength: response.content.length,
        tokensUsed: response.tokens_used || 0,
        success: true
      });
      
    } catch (error) {
      console.error('❌ [UnifiedFlow] Error recording metrics:', error);
    }
  }
  
  // Получение статистики
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.responseCache.size,
      promptCacheSize: this.promptCache.size,
      validationCacheSize: this.validationCache.size,
      hitRate: this.stats.totalRequests > 0 ? 
        (this.stats.cacheHits / this.stats.totalRequests) : 0,
      successRate: this.stats.totalRequests > 0 ? 
        (this.stats.successfulRequests / this.stats.totalRequests) : 0,
      enhancedValidator: this.enhancedValidator.getStats(),
      responseCorrector: this.responseCorrector.getStats()
    };
  }
  
  // Очистка кэшей
  clearCaches() {
    this.responseCache.clear();
    this.promptCache.clear();
    this.validationCache.clear();
    this.enhancedValidator.clearCaches();
    this.responseCorrector.clearCache();
    console.log('🧹 [UnifiedFlow] All caches cleared');
  }
  
  // Сброс статистики
  resetStats() {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      validationPassed: 0,
      validationFailed: 0
    };
    this.enhancedValidator.resetStats();
    this.responseCorrector.resetStats();
    console.log('📊 [UnifiedFlow] Statistics reset');
  }
}

export default UnifiedAIAgentFlow;
