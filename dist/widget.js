(function() {
  'use strict';

  // Конфигурация виджета
  let widgetConfig = {
    accentColor: '#1354FC',
    buttonColor: 'light',
    buttonText: 'Спросить ИИ',
    buttonSubtext: 'Задать вопрос',
    widgetMode: 'chat',
    quickQuestions: [
      { question: 'Как работает ваш сервис?', answer: 'Наш сервис использует ИИ для автоматизации общения с клиентами.' },
      { question: 'Сколько стоит?', answer: 'У нас есть несколько тарифных планов. Базовый план стоит 2990₽ в месяц.' },
      { question: 'Есть ли демо?', answer: 'Да, вы можете попробовать демо-версию бесплатно в течение 14 дней.' }
    ],
    leadFormEnabled: 'yes',
    leadFormTitle: 'Оставьте заявку',
    leadFormDescription: 'Мы свяжемся с вами в ближайшее время',
    leadFormFields: [
      { name: 'name', label: 'Имя', type: 'text', required: true },
      { name: 'phone', label: 'Телефон', type: 'tel', required: true },
      { name: 'email', label: 'Email', type: 'email', required: false }
    ],
    widgetTheme: 'light',
    widgetSize: 'medium',
    showAvatar: true,
    showTypingIndicator: true,
    autoOpenOnScroll: false,
    autoOpenDelay: 0,
    showOnMobile: true,
    notificationSound: true,
    notificationTitle: 'Новое сообщение',
    trackEvents: true,
    trackConversions: true
  };

  // Состояние виджета
  let widgetState = {
    isOpen: false,
    isMinimized: false,
    currentMode: 'chat', // 'chat', 'questions', 'lead-form'
    messages: [],
    currentQuestion: null,
    leadFormData: {}
  };

  // Создание стилей виджета
  function createStyles() {
    const style = document.createElement('style');
    style.textContent = `
    .adapto-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .adapto-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
        background: ${widgetConfig.accentColor};
        color: white;
      border: none;
      cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .adapto-widget-button:hover {
      transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

      .adapto-widget-container {
      position: fixed;
        bottom: 90px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }

    .adapto-widget-header {
        background: ${widgetConfig.accentColor};
      color: white;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .adapto-widget-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .adapto-widget-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 20px;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

      .adapto-widget-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

    .adapto-widget-messages {
      flex: 1;
        overflow-y: auto;
      padding: 16px;
        display: none;
    }

    .adapto-widget-message {
      margin-bottom: 12px;
      display: flex;
      align-items: flex-start;
        gap: 8px;
    }

    .adapto-widget-message.user {
        flex-direction: row-reverse;
      }

      .adapto-widget-message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: ${widgetConfig.accentColor};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        font-weight: 600;
        flex-shrink: 0;
    }

    .adapto-widget-message-content {
        background: #f3f4f6;
        padding: 12px;
        border-radius: 12px;
      max-width: 80%;
      word-wrap: break-word;
    }

    .adapto-widget-message.user .adapto-widget-message-content {
        background: ${widgetConfig.accentColor};
      color: white;
      }

      .adapto-widget-questions {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: none;
      }

      .adapto-widget-question {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .adapto-widget-question:hover {
        background: #f3f4f6;
        border-color: ${widgetConfig.accentColor};
      }

      .adapto-widget-question h4 {
        margin: 0 0 4px 0;
        font-size: 14px;
        font-weight: 600;
        color: #374151;
      }

      .adapto-widget-question p {
        margin: 0;
        font-size: 12px;
        color: #6b7280;
      }

      .adapto-widget-lead-form {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: none;
      }

      .adapto-widget-lead-form h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: #374151;
      }

      .adapto-widget-lead-form p {
        margin: 0 0 16px 0;
        font-size: 14px;
        color: #6b7280;
      }

      .adapto-widget-form-field {
        margin-bottom: 12px;
      }

      .adapto-widget-form-field label {
        display: block;
        margin-bottom: 4px;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }

      .adapto-widget-form-field input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        box-sizing: border-box;
      }

      .adapto-widget-form-field input:focus {
        outline: none;
        border-color: ${widgetConfig.accentColor};
        box-shadow: 0 0 0 3px rgba(19, 84, 252, 0.1);
    }

    .adapto-widget-input {
      padding: 16px;
        border-top: 1px solid #e5e7eb;
        display: none;
    }

      .adapto-widget-input-container {
      display: flex;
      gap: 8px;
        align-items: flex-end;
    }

      .adapto-widget-input textarea {
      flex: 1;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
      font-size: 14px;
        resize: none;
        min-height: 40px;
        max-height: 100px;
        font-family: inherit;
    }

      .adapto-widget-input textarea:focus {
        outline: none;
        border-color: ${widgetConfig.accentColor};
    }

    .adapto-widget-send {
        background: ${widgetConfig.accentColor};
        color: white;
      border: none;
        border-radius: 6px;
        padding: 8px 12px;
      cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background-color 0.2s ease;
    }

    .adapto-widget-send:hover {
        background: #1d4ed8;
    }

    .adapto-widget-send:disabled {
        background: #9ca3af;
      cursor: not-allowed;
    }

      .adapto-widget-submit {
        background: ${widgetConfig.accentColor};
        color: white;
        border: none;
        border-radius: 6px;
        padding: 12px 24px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        width: 100%;
        transition: background-color 0.2s ease;
      }

      .adapto-widget-submit:hover {
        background: #1d4ed8;
      }

      .adapto-widget-back {
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        font-size: 14px;
        padding: 8px 0;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .adapto-widget-back:hover {
        color: #374151;
      }

      @media (max-width: 768px) {
        .adapto-widget-container {
          width: calc(100vw - 40px);
          height: calc(100vh - 120px);
          bottom: 20px;
          right: 20px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Создание HTML виджета
  function createWidget() {
    const widget = document.createElement('div');
    widget.className = 'adapto-widget';
    widget.innerHTML = `
      <button class="adapto-widget-button" onclick="window.adaptoWidget.toggle()">
        💬
      </button>
      <div class="adapto-widget-container">
        <div class="adapto-widget-header">
          <h3>${widgetConfig.buttonText}</h3>
          <button class="adapto-widget-close" onclick="window.adaptoWidget.close()">×</button>
        </div>
        <div class="adapto-widget-content">
          <div class="adapto-widget-messages">
            <div class="adapto-widget-message">
              <div class="adapto-widget-message-avatar">A</div>
              <div class="adapto-widget-message-content">
                Привет! Меня зовут Adapto, я ИИ ассистент. Как я могу вам помочь?
              </div>
            </div>
          </div>
          <div class="adapto-widget-questions">
            <h3>Выберите вопрос:</h3>
            ${widgetConfig.quickQuestions.map(q => `
              <div class="adapto-widget-question" onclick="window.adaptoWidget.selectQuestion('${q.question}')">
                <h4>${q.question}</h4>
                <p>Нажмите, чтобы получить ответ</p>
              </div>
            `).join('')}
          </div>
          <div class="adapto-widget-lead-form">
            <h3>${widgetConfig.leadFormTitle}</h3>
            <p>${widgetConfig.leadFormDescription}</p>
            <form onsubmit="window.adaptoWidget.submitLeadForm(event)">
              ${widgetConfig.leadFormFields.map(field => `
                <div class="adapto-widget-form-field">
                  <label>${field.label}${field.required ? ' *' : ''}</label>
                  <input 
                    type="${field.type}" 
                    name="${field.name}" 
                    ${field.required ? 'required' : ''}
                    placeholder="Введите ${field.label.toLowerCase()}"
                  >
                </div>
              `).join('')}
              <button type="submit" class="adapto-widget-submit">Отправить заявку</button>
        </form>
          </div>
          <div class="adapto-widget-input">
            <div class="adapto-widget-input-container">
              <textarea 
                placeholder="Введите сообщение..." 
                onkeypress="window.adaptoWidget.handleKeyPress(event)"
              ></textarea>
              <button class="adapto-widget-send" onclick="window.adaptoWidget.sendMessage()">→</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(widget);
    return widget;
  }

  // API виджета
  const widgetAPI = {
    init(config = {}) {
      widgetConfig = { ...widgetConfig, ...config };
      createStyles();
      const widget = createWidget();
      
      // Инициализация состояния
      if (widgetConfig.widgetMode === 'questions') {
        this.showQuestions();
      } else {
        this.showChat();
      }

      // Автооткрытие
      if (widgetConfig.autoOpenOnScroll) {
        window.addEventListener('scroll', () => {
          if (!widgetState.isOpen) {
            setTimeout(() => this.open(), widgetConfig.autoOpenDelay * 1000);
        }
      });
    }

      return this;
    },

    open() {
      const container = document.querySelector('.adapto-widget-container');
      if (container) {
        container.style.display = 'flex';
        widgetState.isOpen = true;
        this.trackEvent('widget_opened');
      }
    },

    close() {
      const container = document.querySelector('.adapto-widget-container');
      if (container) {
        container.style.display = 'none';
        widgetState.isOpen = false;
        this.trackEvent('widget_closed');
      }
    },

    toggle() {
      if (widgetState.isOpen) {
        this.close();
      } else {
        this.open();
      }
    },

    showChat() {
      this.hideAllContent();
      document.querySelector('.adapto-widget-messages').style.display = 'block';
      document.querySelector('.adapto-widget-input').style.display = 'block';
      widgetState.currentMode = 'chat';
    },

    showQuestions() {
      this.hideAllContent();
      document.querySelector('.adapto-widget-questions').style.display = 'block';
      widgetState.currentMode = 'questions';
    },

    showLeadForm() {
      this.hideAllContent();
      document.querySelector('.adapto-widget-lead-form').style.display = 'block';
      widgetState.currentMode = 'lead-form';
    },

    hideAllContent() {
      document.querySelector('.adapto-widget-messages').style.display = 'none';
      document.querySelector('.adapto-widget-questions').style.display = 'none';
      document.querySelector('.adapto-widget-lead-form').style.display = 'none';
      document.querySelector('.adapto-widget-input').style.display = 'none';
    },

    selectQuestion(question) {
      const questionData = widgetConfig.quickQuestions.find(q => q.question === question);
      if (questionData) {
        this.addMessage('user', question);
        this.addMessage('bot', questionData.answer);
        
        // Показать форму заявки после ответа
        if (widgetConfig.leadFormEnabled === 'yes') {
          setTimeout(() => {
            this.showLeadForm();
          }, 1000);
        }
      }
    },

    addMessage(sender, text) {
      const messagesContainer = document.querySelector('.adapto-widget-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `adapto-widget-message ${sender}`;
      
      const avatar = document.createElement('div');
      avatar.className = 'adapto-widget-message-avatar';
      avatar.textContent = sender === 'user' ? 'U' : 'A';
      
      const content = document.createElement('div');
      content.className = 'adapto-widget-message-content';
      content.textContent = text;
      
      messageDiv.appendChild(avatar);
      messageDiv.appendChild(content);
      messagesContainer.appendChild(messageDiv);
      
      // Прокрутка к последнему сообщению
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      widgetState.messages.push({ sender, text, timestamp: new Date() });
    },

    sendMessage() {
      const textarea = document.querySelector('.adapto-widget-input textarea');
      const message = textarea.value.trim();
      
      if (message) {
      this.addMessage('user', message);
        textarea.value = '';
        
        // Имитация ответа бота
        setTimeout(() => {
          this.addMessage('bot', 'Спасибо за ваше сообщение! Я обработаю его и отвечу в ближайшее время.');
        }, 1000);
        
        this.trackEvent('message_sent');
      }
    },

    handleKeyPress(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.sendMessage();
      }
    },

    submitLeadForm(event) {
      event.preventDefault();
      const formData = new FormData(event.target);
      const data = {};
      
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }
      
      // Здесь можно отправить данные на сервер
      console.log('Lead form data:', data);
      
      // Показать сообщение об успехе
      this.addMessage('bot', 'Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
      
      this.trackEvent('lead_form_submitted', data);
      this.showChat();
    },

    trackEvent(eventName, data = {}) {
      if (widgetConfig.trackEvents) {
        // Здесь можно отправить данные в аналитику
        console.log('Widget event:', eventName, data);
      }
    },

    updateConfig(newConfig) {
      widgetConfig = { ...widgetConfig, ...newConfig };
      // Обновить виджет с новыми настройками
      this.refresh();
    },

    refresh() {
      // Пересоздать виджет с новыми настройками
      const oldWidget = document.querySelector('.adapto-widget');
      if (oldWidget) {
        oldWidget.remove();
      }
      this.init(widgetConfig);
    }
  };

  // Экспорт API в глобальную область
  window.adaptoWidget = widgetAPI;

  // Автоматическая инициализация
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => widgetAPI.init());
  } else {
    widgetAPI.init();
  }

})();


