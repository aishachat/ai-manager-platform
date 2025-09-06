// API для получения настроек виджета
// Этот файл будет генерироваться динамически на основе настроек пользователя

(function() {
  // Получаем ID пользователя из URL
  const scriptSrc = document.currentScript.src;
  const userId = scriptSrc.split('/').pop().replace('.js', '');
  
  // Загружаем настройки виджета
  // В реальном проекте это будет fetch к серверу
  // Для демонстрации используем локальные настройки
  
  // Имитируем загрузку настроек
  setTimeout(() => {
    const config = {
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
    };
    
    createWidget(config);
  }, 100);

  function createWidget(config) {
    // Создание виджета
    const widget = document.createElement('div');
    widget.id = 'adapto-widget';
    widget.innerHTML = `
      <div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
        <!-- Кнопка виджета -->
        <div id="widget-toggle" style="width: 50px; height: 50px; background: ${config.buttonColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.2s;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: brightness(0) saturate(100%) invert(100%);">
            <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.9706 16.9706 21 12 21C10.6829 21 9.43051 20.7252 8.30709 20.2362L3 21L3.7638 15.6929C3.27477 14.5695 3 13.3171 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <!-- Контент виджета -->
        <div id="widget-content" style="position: absolute; bottom: 60px; right: 0; width: 350px; height: 500px; background: white; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); display: none; flex-direction: column; overflow: hidden;">
          <!-- Заголовок -->
          <div style="padding: 20px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 10px;">
            <div style="width: 40px; height: 40px; background: ${config.accentColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: brightness(0) saturate(100%) invert(100%);">
                <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.9706 16.9706 21 12 21C10.6829 21 9.43051 20.7252 8.30709 20.2362L3 21L3.7638 15.6929C3.27477 14.5695 3 13.3171 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 500; color: #333;">${config.aiAgentName}</h3>
              <p style="margin: 0; font-size: 12px; color: #666;">${config.statusText}</p>
            </div>
            <button id="widget-close" style="margin-left: auto; background: none; border: none; cursor: pointer; padding: 5px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          
          <!-- Контент -->
          <div style="flex: 1; padding: 20px; overflow-y: auto;">
            <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 500; color: #333;">${config.title}</h2>
            <p style="margin: 0 0 20px 0; font-size: 14px; color: #666;">${config.description}</p>
            
            <!-- Быстрые вопросы -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${config.questions.filter(q => q.enabled).map(q => `
                <button class="quick-question" style="padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 8px; background: white; text-align: left; cursor: pointer; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor='white'">
                  ${q.text}
                </button>
              `).join('')}
            </div>
          </div>
          
          <!-- Кнопка отправки сообщения -->
          <div style="padding: 20px; border-top: 1px solid #f0f0f0;">
            <button style="width: 100%; padding: 12px; background: ${config.accentColor}; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
              ${config.buttonTitle}
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(widget);
    
    // Логика виджета
    let isOpen = false;
    const toggle = document.getElementById('widget-toggle');
    const content = document.getElementById('widget-content');
    const closeBtn = document.getElementById('widget-close');
    
    function toggleWidget() {
      isOpen = !isOpen;
      if (isOpen) {
        content.style.display = 'flex';
        toggle.style.transform = 'rotate(45deg)';
      } else {
        content.style.display = 'none';
        toggle.style.transform = 'rotate(0deg)';
      }
    }
    
    toggle.addEventListener('click', toggleWidget);
    closeBtn.addEventListener('click', toggleWidget);
    
    // Обработчики для быстрых вопросов
    document.querySelectorAll('.quick-question').forEach(btn => {
      btn.addEventListener('click', function() {
        alert('Вопрос: ' + this.textContent);
      });
    });
  }
})();
