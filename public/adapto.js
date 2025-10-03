(function(){
  try {
    var current = document.currentScript;
    var apiKey = (current && (current.getAttribute('data-key') || current.dataset.key)) || null;
    if (!apiKey) { console.warn('[Adapto] data-key не указан'); return; }

    // Определяем API URL по origin скрипта (корректно для встраивания на сторонние сайты)
    var scriptSrc = current && current.src ? current.src : '';
    var apiUrl;
    try {
      var scriptUrl = new URL(scriptSrc || window.location.href);
      apiUrl = scriptUrl.origin;
    } catch(_) {
      var isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      // Для продакшена используем ваш домен, для разработки - localhost
      apiUrl = isLocalhost ? 'http://localhost:3000' : 'https://adaptoai.ru';
    }

    function px(n){ return (typeof n === 'number' ? n : parseInt(n||0,10)) || 0; }

    function createLauncher(cfg){
      var btn = document.createElement('button');
      btn.setAttribute('aria-label','Открыть виджет');
      btn.style.position = 'fixed';
      btn.style.width = '50px';
      btn.style.height = '50px';
      btn.style.borderRadius = '990px 990px 0 990px';
      btn.style.border = 'none';
      btn.style.cursor = 'pointer';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.boxShadow = '0 8px 24px rgba(7,15,26,.18)';
      btn.style.zIndex = (cfg.zIndex || 9999).toString();
      var color = (cfg.accentColor || '#0084FF');
      btn.style.background = color;
      var right = px(cfg.desktopRightOffset) + 40; // выравнивание по правому краю, как в UI
      btn.style.right = right + 'px';
      btn.style.bottom = px(cfg.desktopBottomOffset) + 'px';
      btn.innerHTML = '<img src="' + apiUrl + '/Vectorlogovidget.svg" alt="Open" style="width:28px;height:28px;filter:brightness(0) invert(1);transition:transform .15s ease;margin-left:4px;margin-bottom:2px" />';
      btn.style.transition = 'transform .15s ease, box-shadow .2s ease';
      btn.onmouseenter = function(){ btn.style.transform = 'scale(1.1)'; };
      btn.onmouseleave = function(){ btn.style.transform = 'scale(1)'; };
      return btn;
    }

    function openWidget(cfg){
      var iframe = document.getElementById('adapto-iframe');
      if (!iframe){
        // если по какой-то причине не предзагрузили — создаем сейчас
        iframe = document.createElement('iframe');
        iframe.id = 'adapto-iframe';
        iframe.width = '371';
        iframe.height = '601';
        iframe.style.position = 'fixed';
        iframe.style.border = 'none';
        iframe.style.zIndex = ((cfg.zIndex || 9999) + 1).toString();
        var right = px(cfg.desktopRightOffset) + 40;
        iframe.style.right = right + 'px';
        iframe.style.bottom = (px(cfg.desktopBottomOffset) + 60) + 'px';
        var href = (typeof window !== 'undefined' && window.location && window.location.href) ? window.location.href : '';
        var isPreview = href.indexOf('widget-preview.html') !== -1 || href.indexOf('view-widget.html') !== -1;
        iframe.src = apiUrl + '/api/widget/render?key=' + encodeURIComponent(apiKey) + (isPreview ? '&noCache=1&ts=' + Date.now() : '');
        iframe.style.transformOrigin = '100% 100%';
        iframe.style.transition = 'transform .18s ease-out, opacity .18s ease-out';
        iframe.style.opacity = '0';
        iframe.style.transform = 'translateY(8px) scale(0.92)';
        iframe.style.display = 'block';
        document.body.appendChild(iframe);
        requestAnimationFrame(function(){
          iframe.style.opacity = '1';
          iframe.style.transform = 'translateY(0) scale(1)';
        });
      } else {
        // если iframe предзагружен — убедимся, что у него есть стили анимации
        iframe.style.transformOrigin = '100% 100%';
        iframe.style.transition = 'transform .18s ease-out, opacity .18s ease-out';
        iframe.style.display = 'block';
        requestAnimationFrame(function(){
          iframe.style.opacity = '1';
          iframe.style.transform = 'translateY(0) scale(1)';
        });
      }
    }

    function closeWidget(){
      var iframe = document.getElementById('adapto-iframe');
      if (iframe){
        iframe.style.transform = 'translateY(8px) scale(0.92)';
        iframe.style.opacity = '0';
        setTimeout(function(){ iframe.style.display = 'none'; }, 160);
      }
    }

    // Загружаем конфиг (для позиций/цвета кнопки), сам виджет будет в iframe
    // Предзагрузим iframe максимально рано (до запроса конфига)
    try {
      var earlyIframe = document.getElementById('adapto-iframe');
      if (!earlyIframe){
        earlyIframe = document.createElement('iframe');
        earlyIframe.id = 'adapto-iframe';
        earlyIframe.width = '371';
        earlyIframe.height = '601';
        earlyIframe.style.position = 'fixed';
        earlyIframe.style.border = 'none';
        earlyIframe.style.zIndex = '10000';
        earlyIframe.style.right = '60px';
        earlyIframe.style.bottom = '80px';
        var href2 = (typeof window !== 'undefined' && window.location && window.location.href) ? window.location.href : '';
        var isPreview2 = href2.indexOf('widget-preview.html') !== -1 || href2.indexOf('view-widget.html') !== -1;
        earlyIframe.src = apiUrl + '/api/widget/render?key=' + encodeURIComponent(apiKey) + (isPreview2 ? '&noCache=1&ts=' + Date.now() : '');
        earlyIframe.style.transformOrigin = '100% 100%';
        earlyIframe.style.transition = 'transform .18s ease-out, opacity .18s ease-out';
        earlyIframe.style.opacity = '0';
        earlyIframe.style.transform = 'translateY(8px) scale(0.92)';
        earlyIframe.style.display = 'none';
        document.body.appendChild(earlyIframe);
      }
    } catch(_){}

    fetch(apiUrl + '/api/widget/config?key=' + encodeURIComponent(apiKey))
      .then(function(r){ return r.ok ? r.json() : {}; })
      .then(function(cfg){
        cfg = cfg || {};
        console.log('Widget config loaded:', cfg);
        // Предзагружаем iframe (ускоряет открытие)
        try {
          var iframe = document.getElementById('adapto-iframe');
          if (!iframe){
            iframe = document.createElement('iframe');
            iframe.id = 'adapto-iframe';
            iframe.width = '371';
            iframe.height = '601';
            iframe.style.position = 'fixed';
            iframe.style.border = 'none';
            iframe.style.zIndex = ((cfg.zIndex || 9999) + 1).toString();
            var right = px(cfg.desktopRightOffset) + 40;
            iframe.style.right = right + 'px';
            iframe.style.bottom = (px(cfg.desktopBottomOffset) + 60) + 'px';
            var href3 = (typeof window !== 'undefined' && window.location && window.location.href) ? window.location.href : '';
            var isPreview3 = href3.indexOf('widget-preview.html') !== -1 || href3.indexOf('view-widget.html') !== -1;
            iframe.src = apiUrl + '/api/widget/render?key=' + encodeURIComponent(apiKey) + (isPreview3 ? '&noCache=1&ts=' + Date.now() : '');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
          }
        } catch(_){}

        // Лаунчер
        var launcher = createLauncher(cfg);
        launcher.id = 'adapto-launcher';
        launcher.className = 'adapto-widget-launcher';
        var defaultShadow = '0 8px 24px rgba(0,0,0,.15)';
        launcher.onclick = function(){
          var iframe = document.getElementById('adapto-iframe');
          var isOpen = iframe && iframe.style.display !== 'none';
          if (isOpen){
            closeWidget();
            launcher.innerHTML = '<img src="' + apiUrl + '/Vectorlogovidget.svg" alt="Open" style="width:28px;height:28px;filter:brightness(0) invert(1);margin-left:4px;margin-bottom:2px" />';
            launcher.style.boxShadow = defaultShadow; // вернуть тень кнопки
          } else {
            // Скрываем все триггерные сообщения при открытии виджета
            var triggerMessages = document.querySelectorAll('.adapto-trigger-message');
            triggerMessages.forEach(function(msg) {
              msg.remove();
            });
            
            openWidget(cfg);
            launcher.innerHTML = '<img src="' + apiUrl + '/Icon2.svg" alt="Close" style="width:16px;height:16px;filter:brightness(0) invert(1)" />';
            launcher.style.boxShadow = 'none'; // убрать тень под раскрытым виджетом
          }
        };
        document.body.appendChild(launcher);

        // Обработчик сообщений от iframe
        window.addEventListener('message', function(event) {
            console.log('Received message from iframe:', event.data); // Добавим лог для отладки
            if (event.data && event.data.type === 'closeWidget') {
                console.log('Closing widget...'); // Добавим лог для отладки
                closeWidget();
                var launcher = document.getElementById('adapto-launcher');
                if (launcher) {
                    launcher.innerHTML = '<img src="' + apiUrl + '/Vectorlogovidget.svg" alt="Open" style="width:28px;height:28px;filter:brightness(0) invert(1);margin-left:4px;margin-bottom:2px" />';
                    launcher.style.boxShadow = defaultShadow;
                }
            }
        });

        // Загружаем полные настройки виджета для триггеров
        fetch(apiUrl + '/api/widget/render?key=' + encodeURIComponent(apiKey))
          .then(function(r){ return r.ok ? r.text() : ''; })
          .then(function(html){
            // Извлекаем настройки триггеров из HTML
            var triggerMatch = html.match(/var triggerMessagesEnabled = (true|false);/);
            var triggerMessagesMatch = html.match(/var triggerMessages = (\[.*?\]);/);
            var followUpMatch = html.match(/var followUpMessagesEnabled = (true|false);/);
            var followUpMessagesMatch = html.match(/var followUpMessages = (\[.*?\]);/);
            var logoMatch = html.match(/var logoUrl = "([^"]*)";/);
            
            var triggerMessagesEnabled = triggerMatch ? triggerMatch[1] === 'true' : false;
            var triggerMessages = triggerMessagesMatch ? JSON.parse(triggerMessagesMatch[1]) : [];
            var followUpMessagesEnabled = followUpMatch ? followUpMatch[1] === 'true' : false;
            var followUpMessages = followUpMessagesMatch ? JSON.parse(followUpMessagesMatch[1]) : [];
            var logoUrl = logoMatch ? logoMatch[1] : '';

            console.log('Trigger settings:', { triggerMessagesEnabled, triggerMessages, followUpMessagesEnabled, followUpMessages });

            // Триггерные сообщения
            if (triggerMessagesEnabled && triggerMessages.length > 0) {
              var message = triggerMessages[0];
              var messageText = typeof message === 'string' ? message : (message.message || message.text || '');
              var buttonText = message.buttonText || 'Расскажи подробнее';
              var timeDelay = message.timeDelay || message.delaySeconds || 5;
              
              if (messageText) {
                setTimeout(function(){ 
                  // Проверяем, открыт ли виджет
                  var iframe = document.getElementById('adapto-iframe');
                  var isWidgetOpen = iframe && iframe.style.display !== 'none';
                  
                  // Показываем триггер только если виджет закрыт
                  if (!isWidgetOpen) {
                    // Создаем плашку триггерного сообщения
                    var triggerDiv = document.createElement('div');
                    triggerDiv.className = 'adapto-trigger-message';
                    triggerDiv.style.cssText = 
                      'position: fixed;' +
                      'bottom: ' + (px(cfg.desktopBottomOffset) + 62) + 'px;' +
                      'right: ' + (px(cfg.desktopRightOffset) + 40) + 'px;' +
                      'z-index: ' + ((cfg.zIndex || 9999) + 1) + ';' +
                      'background: transparent;' +
                      'border-radius: 10px 10px 0px 10px;' +
                      'padding: 0;' +
                      'max-width: 300px;' +
                      'box-shadow: none;' +
                      'transition: all 0.3s ease;';
                    
                    // Используем правильный логотип
                    var logoHtml = logoUrl ? 
                      '<img src="' + logoUrl + '" alt="Logo" style="width: 32px; height: 32px; border-radius: 6px; flex-shrink: 0;">' : 
                      '<img src="' + apiUrl + '/Group 1234.svg" alt="Logo" style="width: 32px; height: 32px; border-radius: 6px; flex-shrink: 0; background: white; padding: 4px;">';
                    
                    triggerDiv.innerHTML = 
                      '<div style="position: relative; max-width: 300px; background: none;">' +
                        '<div style="height: 40px; padding: 0 13px; display: flex; align-items: center; border-radius: 10px 10px 0px 10px; background: white; width: fit-content; max-width: 300px; margin-right: 23px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">' +
                          '<p style="margin: 0; font-size: 14px; font-weight: 500; color: #070F1A; line-height: 1.4; white-space: pre-line; letter-spacing: -0.02em; width: fit-content;">' +
                            messageText +
                          '</p>' +
                        '</div>' +
                        '<button onclick="this.parentElement.parentElement.remove();" style="position: absolute; top: -12px; right: 8px; width: 16px; height: 16px; border-radius: 50%; background: rgba(0,0,0,0.1); border: none; color: #8E8E93; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;">×</button>' +
                        '<div style="padding-top: 5px; display: flex; justify-content: flex-end; margin-right: 23px; background: none;">' +
                          '<button onclick="' +
                            'this.parentElement.parentElement.remove();' +
                            'document.querySelector(\'.adapto-widget-launcher\').click();' +
                            'setTimeout(function(){' +
                              'var iframe = document.getElementById(\'adapto-iframe\');' +
                              'if (iframe && iframe.contentWindow) {' +
                                'iframe.contentWindow.postMessage({type: \'switchToChat\'}, \'*\');' +
                                'setTimeout(function(){' +
                                  'iframe.contentWindow.postMessage({type: \'sendMessage\', message: \'' + buttonText.replace(/'/g, "\\'") + '\'}, \'*\');' +
                                '}, 200);' +
                              '}' +
                            '}, 100);' +
                          '" style="' +
                            'height: 34px;' +
                            'padding: 0 16px;' +
                            'border-radius: 90px;' +
                            'font-size: 12px;' +
                            'font-weight: 500;' +
                            'border: none;' +
                            'background: ' + (cfg.accentColor || '#0084FF') + ';' +
                            'color: white;' +
                            'cursor: pointer;' +
                            'transition: all 0.2s ease;' +
                            'letter-spacing: -0.02em;' +
                          '" onmouseover="this.style.opacity=\'0.9\'" onmouseout="this.style.opacity=\'1\'">' +
                            buttonText +
                          '</button>' +
                        '</div>' +
                      '</div>';
                    
                    document.body.appendChild(triggerDiv);
                  }
                  
                }, timeDelay * 1000);
              }
            }

            // Догоняющие сообщения
            if (followUpMessagesEnabled && followUpMessages.length > 0) {
              setTimeout(function(){
                var message = followUpMessages[0];
                var messageText = typeof message === 'string' ? message : (message.message || message.text || '');
                if (messageText) {
                  var iframe = document.getElementById('adapto-iframe');
                  if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({type: 'addMessage', message: messageText, isUser: false}, '*');
                  }
                }
              }, 20000);
            }
          })
          .catch(function(e){
            console.warn('[Adapto] Не удалось загрузить настройки триггеров:', e);
          });
      })
      .catch(function(error){
        console.warn('[Adapto] Не удалось загрузить конфиг виджета:', error);
        // Создаем лаунчер с настройками по умолчанию
        var defaultCfg = {
          accentColor: '#0084FF',
          buttonColor: '#0084FF',
          desktopRightOffset: 20,
          desktopBottomOffset: 20,
          zIndex: 9999
        };
        var launcher = createLauncher(defaultCfg);
        launcher.id = 'adapto-launcher';
        launcher.className = 'adapto-widget-launcher';
        launcher.onclick = function(){
          var iframe = document.getElementById('adapto-iframe');
          var isOpen = iframe && iframe.style.display !== 'none';
          if (isOpen){
            closeWidget();
            launcher.innerHTML = '<img src="' + apiUrl + '/Vectorlogovidget.svg" alt="Open" style="width:28px;height:28px;filter:brightness(0) invert(1);margin-left:4px;margin-bottom:2px" />';
          } else {
            openWidget(defaultCfg);
            launcher.innerHTML = '<img src="' + apiUrl + '/Icon2.svg" alt="Close" style="width:16px;height:16px;filter:brightness(0) invert(1)" />';
          }
        };
        document.body.appendChild(launcher);
      });
  } catch (e) {
    console.error('[Adapto] Ошибка инициализации:', e);
  }
})();