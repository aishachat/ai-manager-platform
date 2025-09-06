import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jppujbttlrsobfwuzalw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcHVqYnR0bHJzb2Jmd3V6YWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mjc3MDMsImV4cCI6MjA3MTIwMzcwM30.W-NgL1PIaAIUQfi5BtvFukSqLLG0ZPQDCKcs70sUaHY'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Тестовая функция для проверки подключения
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...')
    const { data, error } = await supabase
      .from('bot_corrections')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Connection test failed:', error)
      return false
    }
    
    console.log('Connection test successful:', data)
    return true
  } catch (error) {
    console.error('Connection test error:', error)
    return false
  }
}

// Функции для работы с пользователями
export const users = {
  // Создать или получить пользователя
  async createOrGetUser(userId, userData = {}) {
    try {
      console.log('Creating/getting user:', userId, userData);
      
      // Сначала проверяем, существует ли пользователь
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (existingUser) {
        console.log('User already exists:', existingUser);
        return existingUser;
      }
      
      // Если пользователя нет, создаем его
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: userData.email || `user${userId}@example.com`,
          name: userData.name || `User ${userId}`,
          company_name: userData.company_name || '',
          phone: userData.phone || '',
          company_field: userData.company_field || '',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating user:', insertError);
        return null;
      }
      
      console.log('User created successfully:', newUser);
      return newUser;
    } catch (error) {
      console.error('Error in createOrGetUser:', error);
      return null;
    }
  }
};

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
      console.log('Adding knowledge item for user:', userId, 'item:', item)
      
      // Сначала создаем пользователя, если его нет
      const user = await users.createOrGetUser(userId);
      if (!user) {
        console.error('Failed to create/get user');
        return false;
      }
      
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert({
          user_id: userId,
          assistant_id: userId,
          type: item.type,
          content: item.content,
          status: 'Обработка', // Всегда начинаем с "Обработка"
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error adding knowledge item:', error)
        console.error('Error details:', error.message, error.details, error.hint)
        return false
      }
      
      console.log('Knowledge item added successfully:', data)
      return data // Возвращаем созданный элемент с ID
    } catch (error) {
      console.error('Supabase connection error:', error)
      return false
    }
  },

  // Обновить статус элемента базы знаний
  async updateKnowledgeItemStatus(itemId, status) {
    try {
      console.log('Updating knowledge item status:', itemId, 'to:', status)
      
      const { data, error } = await supabase
        .from('knowledge_base')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating knowledge item status:', error)
        return false
      }
      
      console.log('Knowledge item status updated successfully:', data)
      return data
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
      console.log('Adding correction for user:', userId, 'correction:', correction)
      
      // Сначала создаем пользователя, если его нет
      const user = await users.createOrGetUser(userId);
      if (!user) {
        console.error('Failed to create/get user');
        return false;
      }
      
      const { data, error } = await supabase
        .from('bot_corrections')
        .insert({
          user_id: userId,
          assistant_id: userId,
          correction: correction,
          created_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('Error adding bot correction:', error)
        console.error('Error details:', error.message, error.details, error.hint)
        return false
      }
      
      console.log('Correction added successfully:', data)
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

// Функции для работы с историей чата
export const chatHistory = {
  // Получить историю чата пользователя
  async getChatHistory(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit)
      
      if (error) {
        console.error('Error fetching chat history:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Supabase connection error:', error)
      return []
    }
  },

  // Сохранить сообщение в историю
  async saveMessage(userId, messageType, messageContent) {
    try {
      console.log('Saving chat message:', { userId, messageType, messageContent: messageContent.substring(0, 100) + '...' })
      
      const { data, error } = await supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          assistant_id: userId, // Используем userId как assistant_id
          message_type: messageType,
          message_content: messageContent,
          created_at: new Date().toISOString()
        })
        .select()
      
      if (error) {
        console.error('Error saving chat message:', error)
        console.error('Error details:', error.message, error.details, error.hint)
        return null
      }
      
      console.log('Chat message saved successfully:', data)
      return data[0]
    } catch (error) {
      console.error('Supabase connection error:', error)
      return null
    }
  },

  // Очистить историю чата пользователя
  async clearChatHistory(userId) {
    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', userId)
      
      if (error) {
        console.error('Error clearing chat history:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Supabase connection error:', error)
      return false
    }
  }
}

// Функции для работы с настройками агента
export const agentSettings = {
  // Получить настройки агента пользователя
  async getAgentSettings(userId) {
    try {
      const { data, error } = await supabase
        .from('ai_agent_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        console.error('Error fetching agent settings:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Supabase connection error:', error)
      return null
    }
  },

  // Сохранить настройки агента
  async saveAgentSettings(userId, settings) {
    try {
      console.log('Saving agent settings for user:', userId, settings)
      
      const { data, error } = await supabase
        .from('ai_agent_settings')
        .upsert({
          user_id: userId,
          settings: settings,
          updated_at: new Date().toISOString()
        })
        .select()
      
      if (error) {
        console.error('Error saving agent settings:', error)
        return null
      }
      
      console.log('Agent settings saved successfully:', data)
      return data[0]
    } catch (error) {
      console.error('Supabase connection error:', error)
      return null
    }
  }
}
