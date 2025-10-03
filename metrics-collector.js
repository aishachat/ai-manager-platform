// Заглушка для MetricsCollector
export default class MetricsCollector {
  constructor() {
    console.log('MetricsCollector initialized');
  }
  
  async collect(data) {
    return { success: true };
  }
  
  async getMetrics() {
    return {};
  }
}


