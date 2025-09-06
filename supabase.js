import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Загружаем переменные окружения
dotenv.config({ path: '.env.local' })

// Настройки Supabase
const supabaseUrl = 'https://jppujbttlrsobfwuzalw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcHVqYnR0bHJzb2Jmd3V6YWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mjc3MDMsImV4cCI6MjA3MTIwMzcwM30.W-NgL1PIaAIUQfi5BtvFukSqLLG0ZPQDCKcs70sUaHY'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Функции для работы с настройками агентов
export const agentSettings = {
  // Получить настройки агента по ID
  async getAgentSettings(agentId) {
    try {
      const { data, error } = await supabase
        .from('agent_settings')
        .select('*')
        .eq('id', agentId)
        .single()
      
      if (error) {
        console.error('Error fetching agent settings:', error)
        // Возвращаем заглушку для тестирования
        return {
          id: agentId,
          settings: {
            task: "продаж и консультаций",
            mainGoal: "помощь клиентам",
            targetAudience: "Общие клиенты",
            salesCycle: "Стандартный процесс продаж",
            communicationStyle: "профессиональный, но дружелюбный",
            addressing: "вы",
            emojiUsage: "редко"
          }
        }
      }
      
      return data
    } catch (error) {
      console.error('Supabase connection error:', error)
      // Возвращаем заглушку для тестирования
      return {
        id: agentId,
        settings: {
          task: "продаж и консультаций",
          mainGoal: "помощь клиентам",
          targetAudience: "Общие клиенты",
          salesCycle: "Стандартный процесс продаж",
          communicationStyle: "профессиональный, но дружелюбный",
          addressing: "вы",
          emojiUsage: "редко"
        }
      }
    }
  },

  // Сохранить настройки агента
  async saveAgentSettings(agentId, settings) {
    const { data, error } = await supabase
      .from('agent_settings')
      .upsert({
        id: agentId,
        settings: settings,
        updated_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error saving agent settings:', error)
      return false
    }
    
    return true
  },

  // Получить все агенты пользователя
  async getUserAgents(userId) {
    const { data, error } = await supabase
      .from('agent_settings')
      .select('*')
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching user agents:', error)
      return []
    }
    
    return data || []
  }
}

// Функции для работы с чатом
export const chatHistory = {
  // Сохранить сообщение
  async saveMessage(agentId, message, response, userId = null) {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .insert({
          agent_id: agentId,
          user_message: message,
          ai_response: response,
          user_id: userId,
          created_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('Error saving chat message:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Supabase connection error:', error)
      // Для тестирования возвращаем true
      return true
    }
  },

  // Получить историю чата
  async getChatHistory(agentId, limit = 10) {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching chat history:', error)
      return []
    }
    
    return data || []
  }
}

// Функции для работы с базой знаний
export const knowledgeBase = {
  // Получить элементы базы знаний пользователя
  async getKnowledgeItems(userId) {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching knowledge items:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Supabase connection error:', error)
      return []
    }
  },

  // Добавить элемент в базу знаний
  async addKnowledgeItem(userId, item) {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert({
          user_id: userId,
          type: item.type,
          content: item.content,
          status: item.status || 'processing',
          created_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('Error adding knowledge item:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Supabase connection error:', error)
      return false
    }
  },

  // Удалить элемент из базы знаний
  async deleteKnowledgeItem(itemId) {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', itemId)
      
      if (error) {
        console.error('Error deleting knowledge item:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Supabase connection error:', error)
      return false
    }
  }
}

// Функции для работы с корректировками бота
export const botCorrections = {
  // Получить корректировки пользователя
  async getCorrections(userId) {
    try {
      const { data, error } = await supabase
        .from('bot_corrections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching bot corrections:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Supabase connection error:', error)
      return []
    }
  },

  // Добавить корректировку
  async addCorrection(userId, correction) {
    try {
      const { data, error } = await supabase
        .from('bot_corrections')
        .insert({
          user_id: userId,
          correction: correction,
          created_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('Error adding bot correction:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Supabase connection error:', error)
      return false
    }
  },

  // Удалить корректировку
  async deleteCorrection(correctionId) {
    try {
      const { error } = await supabase
        .from('bot_corrections')
        .delete()
        .eq('id', correctionId)
      
      if (error) {
        console.error('Error deleting bot correction:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Supabase connection error:', error)
      return false
    }
  }
}
