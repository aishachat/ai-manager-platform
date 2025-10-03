// Недостающие API endpoints для server.js

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// Dialogs endpoint
app.get('/api/dialogs', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Получаем диалоги из базы данных
    const { data: dialogs, error } = await supabase
      .from('dialogs')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching dialogs:', error);
      return res.status(500).json({ error: 'Failed to fetch dialogs' });
    }

    res.json({ dialogs: dialogs || [] });
  } catch (error) {
    console.error('Error in /api/dialogs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User limits endpoint
app.get('/api/user-limits', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Получаем лимиты пользователя
    const { data: user, error } = await supabase
      .from('users')
      .select('daily_messages_limit, daily_requests_limit, monthly_messages_limit, monthly_requests_limit')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user limits:', error);
      return res.status(500).json({ error: 'Failed to fetch user limits' });
    }

    res.json({
      daily_messages_limit: user?.daily_messages_limit || 100,
      daily_requests_limit: user?.daily_requests_limit || 50,
      monthly_messages_limit: user?.monthly_messages_limit || 3000,
      monthly_requests_limit: user?.monthly_requests_limit || 1500
    });
  } catch (error) {
    console.error('Error in /api/user-limits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User limits by ID endpoint
app.get('/api/user-limits/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Получаем лимиты пользователя
    const { data: user, error } = await supabase
      .from('users')
      .select('daily_messages_limit, daily_requests_limit, monthly_messages_limit, monthly_requests_limit')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user limits:', error);
      return res.status(500).json({ error: 'Failed to fetch user limits' });
    }

    res.json({
      daily_messages_limit: user?.daily_messages_limit || 100,
      daily_requests_limit: user?.daily_requests_limit || 50,
      monthly_messages_limit: user?.monthly_messages_limit || 3000,
      monthly_requests_limit: user?.monthly_requests_limit || 1500
    });
  } catch (error) {
    console.error('Error in /api/user-limits/:userId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Active corrections endpoint
app.get('/api/corrections/active/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Получаем активные исправления
    const { data: corrections, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .eq('is_correction', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching corrections:', error);
      return res.status(500).json({ error: 'Failed to fetch corrections' });
    }

    res.json({ corrections: corrections || [] });
  } catch (error) {
    console.error('Error in /api/corrections/active/:userId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload file endpoint
app.post('/api/upload-file', async (req, res) => {
  try {
    const { fileName, content, userId } = req.body;

    if (!fileName || !content || !userId) {
      return res.status(400).json({ error: 'fileName, content, and userId are required' });
    }

    // Сохраняем файл в базу знаний
    const { data, error } = await supabase
      .from('knowledge_sources')
      .insert({
        name: fileName,
        content: content,
        user_id: userId,
        type: 'file',
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving file:', error);
      return res.status(500).json({ error: 'Failed to save file' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in /api/upload-file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Agent settings endpoint
app.get('/api/agent/settings/:assistantId', async (req, res) => {
  try {
    const { assistantId } = req.params;

    // Получаем настройки агента
    const { data: settings, error } = await supabase
      .from('assistants')
      .select('*')
      .eq('id', assistantId)
      .single();

    if (error) {
      console.error('Error fetching agent settings:', error);
      return res.status(500).json({ error: 'Failed to fetch agent settings' });
    }

    res.json({ success: true, settings: settings || {} });
  } catch (error) {
    console.error('Error in /api/agent/settings/:assistantId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chat message endpoint
app.post('/api/chat/message', async (req, res) => {
  try {
    const { message, userId, conversationId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: 'message and userId are required' });
    }

    // Получаем настройки агента
    const { data: settings, error: settingsError } = await supabase
      .from('assistants')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settingsError) {
      console.error('Error fetching agent settings:', settingsError);
    }

    // Получаем базу знаний
    const { data: knowledge, error: knowledgeError } = await supabase
      .from('knowledge_sources')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (knowledgeError) {
      console.error('Error fetching knowledge:', knowledgeError);
    }

    // Сохраняем сообщение
    const { data: messageData, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        content: message,
        user_id: userId,
        conversation_id: conversationId,
        role: 'user',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error saving message:', messageError);
      return res.status(500).json({ error: 'Failed to save message' });
    }

    // Генерируем ответ (здесь должна быть логика AI)
    const response = {
      content: "Спасибо за ваше сообщение! Я обработаю его и отвечу в ближайшее время.",
      role: 'assistant',
      conversation_id: conversationId
    };

    // Сохраняем ответ
    const { data: responseData, error: responseError } = await supabase
      .from('chat_messages')
      .insert({
        content: response.content,
        user_id: userId,
        conversation_id: conversationId,
        role: 'assistant',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (responseError) {
      console.error('Error saving response:', responseError);
    }

    res.json({
      success: true,
      message: messageData,
      response: responseData || response
    });
  } catch (error) {
    console.error('Error in /api/chat/message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Widget settings endpoint
app.get('/api/widget-settings', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Получаем настройки виджета
    const { data: settings, error } = await supabase
      .from('widget_development_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching widget settings:', error);
      return res.status(500).json({ error: 'Failed to fetch widget settings' });
    }

    res.json({ success: true, settings: settings || {} });
  } catch (error) {
    console.error('Error in /api/widget-settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Widget render endpoint
app.get('/api/widget/render', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Получаем настройки виджета
    const { data: settings, error } = await supabase
      .from('widget_development_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching widget settings:', error);
      return res.status(500).json({ error: 'Failed to fetch widget settings' });
    }

    // Генерируем HTML виджета
    const widgetHtml = `
      <div id="adapto-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
        <div style="background: #007bff; color: white; padding: 10px; border-radius: 5px; cursor: pointer;">
          💬 Чат
        </div>
      </div>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(widgetHtml);
  } catch (error) {
    console.error('Error in /api/widget/render:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

console.log('✅ Missing API endpoints added to server.js');
