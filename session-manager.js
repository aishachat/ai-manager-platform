// Заглушка для SessionManager
export default class SessionManager {
  constructor() {
    console.log('SessionManager initialized');
  }
  
  async createSession(userId) {
    return { sessionId: 'temp-session', userId };
  }
  
  async getSession(sessionId) {
    return null;
  }
  
  async destroySession(sessionId) {
    return { success: true };
  }
}


