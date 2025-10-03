// Заглушка для userLimits
export const userLimits = {
  async getUserLimits(userId) {
    return {
      dailyMessages: 100,
      monthlyMessages: 3000,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ['pdf', 'doc', 'docx', 'txt']
    };
  },
  
  async getAllUserLimits() {
    return [];
  },
  
  async updateUserLimits(userId, limits) {
    return { success: true };
  }
};


