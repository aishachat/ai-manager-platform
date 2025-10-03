// Заглушка для gigaChatModelManager
export default {
  async getToken() {
    return 'temp-token';
  },
  
  async sendMessage(message, options = {}) {
    return {
      success: true,
      response: 'Это тестовый ответ от GigaChat'
    };
  },
  
  async isTokenValid() {
    return true;
  }
};


