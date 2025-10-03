// API endpoint для получения настроек виджета
// В реальном проекте это будет серверный endpoint

// Имитируем настройки виджета (в реальности будут загружаться из базы данных)
const widgetSettings = {
  "demo": {
    title: "Здравствуйте! 👋 Чем мы можем помочь?",
    description: "Выберите вопрос или задайте в чате свой",
    buttonTitle: "Отправить сообщение",
    buttonDescription: "Задавайте вопросы, мы всегда поможем",
    backgroundColor: "linear-gradient(30deg, #52AEFF 0%, #096EFD 100%)",
    accentColor: "#0084FF",
    buttonColor: "#0084FF",
    aiAgentName: "Адапто",
    statusText: "Отвечаем до 3-х минут",
    showStatus: true,
    questions: [
      { id: 1, text: "Как оформить заказ?", enabled: true },
      { id: 2, text: "Есть ли скидки?", enabled: true },
      { id: 3, text: "Как связаться с поддержкой?", enabled: true }
    ]
  }
};

// Функция для получения настроек по ID пользователя
function getWidgetSettings(userId) {
  return widgetSettings[userId] || widgetSettings["demo"];
}

// Экспортируем для использования в widget-api.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getWidgetSettings };
} else {
  window.getWidgetSettings = getWidgetSettings;
}
