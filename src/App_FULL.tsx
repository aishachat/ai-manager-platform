import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  MessageSquare, 
  Database, 
  Settings, 
  Zap, 
  Plus, 
  Send, 
  AlertTriangle,
  Globe,
  Link as LinkIcon,
  Edit as EditIcon,
  File as FileIcon,
  Trash2,
  Info,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
  User,
  Building,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Upload,
  Download,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';

// UI Components
const Button = ({ children, className = '', onClick, disabled = false, variant = 'default', size = 'default', type = 'button', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'underline-offset-4 hover:underline text-primary'
  };

  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
    icon: 'h-10 w-10'
  };

  const variantClass = variants[variant] || variants.default;
  const sizeClass = sizes[size] || sizes.default;

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className = '', type = 'text', ...props }) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Textarea = ({ className = '', ...props }) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Card = ({ className = '', ...props }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props} />
);

const CardHeader = ({ className = '', ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
);

const CardTitle = ({ className = '', ...props }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props} />
);

const CardContent = ({ className = '', ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
);

const Select = ({ children, value, onValueChange, ...props }) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {children}
    </select>
  );
};

export default function App() {
  // State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });
  
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('currentSection') || 'my-solo';
  });
  
  const [currentStep, setCurrentStep] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showWidgetConstructor, setShowWidgetConstructor] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
    phone: '',
    companyField: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  // Setup data
  const [setupData, setSetupData] = useState({
    task: '',
    targetAudience: '',
    tone: '',
    knowledgeItems: [],
    modelProvider: 'gigachat',
    modelName: 'GigaChat:latest',
    systemPrompt: '',
    temperature: 0.7,
    maxTokens: 1000
  });

  // Chat and knowledge data
  const [chatHistory, setChatHistory] = useState([
    { type: 'assistant', text: 'Привет! Я ваш ИИ-ассистент Adapto. Как дела?' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [botCorrection, setBotCorrection] = useState('');
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [newKnowledgeItem, setNewKnowledgeItem] = useState({ type: 'text', content: '' });

  // Widget settings
  const [widgetSettings, setWidgetSettings] = useState({
    position: 'bottom-right',
    color: '#3B82F6',
    welcomeMessage: 'Здравствуйте! Чем могу помочь?',
    placeholder: 'Введите ваш вопрос...',
    dataTags: [],
    excludedPages: []
  });

  // Menu items
  const menuItems = [
    { id: 'my-solo', label: 'Мой Adapto', icon: BarChart3 },
    { id: 'dashboard', label: 'Сводка', icon: BarChart3 },
    { id: 'dialogs', label: 'Диалоги', icon: MessageSquare },
    { id: 'knowledge', label: 'База знаний', icon: Database },
    { id: 'model-settings', label: 'Настройки модели', icon: Settings },
    { id: 'integrations', label: 'Интеграции', icon: Zap }
  ];

  // Notification function
  const showNotificationMessage = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Auth functions
  const handleLogin = async (userData) => {
    try {
      const userWithId = { ...userData, id: Date.now() };
      setCurrentUser(userWithId);
      setIsLoggedIn(true);
      setActiveSection('my-solo');
      localStorage.setItem('currentUser', JSON.stringify(userWithId));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentSection', 'my-solo');
      showNotificationMessage('Успешный вход в систему!');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (!formData.email || !formData.password) {
      setFormErrors({ general: 'Пожалуйста, заполните все поля' });
      return;
    }

    await handleLogin(formData);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const userData = {
      name: formData.name,
      company_name: formData.company,
      email: formData.email,
      id: 'user-' + Date.now()
    };

    setCurrentUser(userData);
    setIsLoggedIn(true);
    setCurrentStep('dashboard');
    setShowProgressBar(true);
    showNotificationMessage('Регистрация успешна! Добро пожаловать в Adapto!');
    setFormData({ email: '', password: '', name: '', company: '', phone: '', companyField: '' });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveSection('my-solo');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentSection');
    showNotificationMessage('Вы вышли из системы');
  };

  // Chat functions
  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    
    const newMessage = { type: 'user', text: currentMessage };
    setChatHistory(prev => [...prev, newMessage]);
    setCurrentMessage('');
    
    setTimeout(() => {
      const botResponse = { type: 'assistant', text: 'Спасибо за ваше сообщение! Я обрабатываю ваш запрос.' };
      setChatHistory(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleBotCorrection = () => {
    if (!botCorrection.trim()) return;
    
    const correctionItem = {
      id: Date.now(),
      type: 'correction',
      content: botCorrection,
      status: 'completed'
    };
    
    setSetupData(prev => ({
      ...prev,
      knowledgeItems: [...prev.knowledgeItems, correctionItem]
    }));
    
    setBotCorrection('');
    showNotificationMessage('Исправление применено!');
  };

  // Knowledge base functions
  const handleAddKnowledgeItem = () => {
    if (!newKnowledgeItem.content.trim()) return;

    const item = {
      id: Date.now(),
      ...newKnowledgeItem,
      status: 'processing'
    };

    setKnowledgeItems(prev => [...prev, item]);
    setNewKnowledgeItem({ type: 'text', content: '' });
    showNotificationMessage('Элемент добавлен в базу знаний!');
  };

  const handleDeleteKnowledgeItem = (id) => {
    setKnowledgeItems(prev => prev.filter(item => item.id !== id));
    showNotificationMessage('Элемент удален из базы знаний');
  };

  // Integration functions
  const handleIntegrationClick = (integration) => {
    setSelectedIntegration(integration);
    setShowIntegrationModal(true);
  };

  // Widget functions
  const handleShowWidgetConstructor = () => {
    setShowWidgetConstructor(true);
  };

  // Render functions
  const renderContent = () => {
    switch (activeSection) {
      case 'my-solo':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Мой Adapto</h1>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Настройте Adapto под себя</CardTitle>
                  <p className="text-gray-600">
                    Если заметите ошибку или захотите подправить ответ — нажмите кнопку «Исправить ошибку», 
                    и Adapto станет отвечать корректно
                  </p>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Левая панель */}
                <div className="space-y-4">
                  {/* Поле для исправлений */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Внесите исправления в бота</CardTitle>
                      <p className="text-gray-600 text-sm">
                        Если вы увидели ошибку в ответах Adapto – напишите правильный ответ здесь, 
                        и бот будет отвечать корректно
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Textarea
                          value={botCorrection}
                          onChange={(e) => setBotCorrection(e.target.value)}
                          placeholder="Опишите, как должен отвечать бот в подобных ситуациях..."
                          className="min-h-[120px]"
                        />
                        <Button 
                          className="w-full"
                          onClick={handleBotCorrection}
                          disabled={!botCorrection.trim()}
                        >
                          Применить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Правая панель - Чат */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Протестируйте Adapto в действии</CardTitle>
                      <p className="text-gray-600">
                        Напишите любое сообщение и посмотрите, как отвечает ваш ИИ
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Чат */}
                        <div className="border rounded-lg p-4 min-h-[400px] bg-gray-50 flex flex-col">
                          {/* Сообщения */}
                          <div className="flex-1 space-y-3 overflow-y-auto mb-4">
                            {chatHistory.map((message, index) => (
                              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg ${
                                  message.type === 'user' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-white border border-gray-200'
                                }`}>
                                  {message.text}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Поле ввода */}
                          <div className="flex gap-2">
                            <Input
                              value={currentMessage}
                              onChange={(e) => setCurrentMessage(e.target.value)}
                              placeholder="Введите сообщение..."
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <Button onClick={handleSendMessage} disabled={!currentMessage.trim()}>
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        );

      case 'knowledge':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">База знаний</h1>
              <Button onClick={() => setShowSetupWizard(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить элемент
              </Button>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Всего элементов</p>
                      <p className="text-2xl font-bold">{knowledgeItems.length + setupData.knowledgeItems.length}</p>
                    </div>
                    <Database className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Обработано</p>
                      <p className="text-2xl font-bold text-green-600">{knowledgeItems.filter(item => item.status === 'completed').length}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">В обработке</p>
                      <p className="text-2xl font-bold text-yellow-600">{knowledgeItems.filter(item => item.status === 'processing').length}</p>
                    </div>
                    <Upload className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Размер базы</p>
                      <p className="text-2xl font-bold">2.4 МБ</p>
                    </div>
                    <Settings className="w-8 h-8 text-gray-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Добавление нового элемента */}
            <Card>
              <CardHeader>
                <CardTitle>Добавить новый элемент</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Select value={newKnowledgeItem.type} onValueChange={(value) => setNewKnowledgeItem(prev => ({ ...prev, type: value }))}>
                      <option value="text">Текст</option>
                      <option value="url">URL</option>
                      <option value="file">Файл</option>
                    </Select>
                    
                    <div className="flex-1">
                      {newKnowledgeItem.type === 'text' && (
                        <Textarea
                          value={newKnowledgeItem.content}
                          onChange={(e) => setNewKnowledgeItem(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Введите текст для добавления в базу знаний..."
                        />
                      )}
                      {newKnowledgeItem.type === 'url' && (
                        <Input
                          value={newKnowledgeItem.content}
                          onChange={(e) => setNewKnowledgeItem(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="https://example.com"
                        />
                      )}
                      {newKnowledgeItem.type === 'file' && (
                        <Input
                          type="file"
                          onChange={(e) => setNewKnowledgeItem(prev => ({ ...prev, content: e.target.files[0]?.name || '' }))}
                        />
                      )}
                    </div>
                    
                    <Button onClick={handleAddKnowledgeItem} disabled={!newKnowledgeItem.content.trim()}>
                      Добавить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Список элементов */}
            <Card>
              <CardHeader>
                <CardTitle>Элементы базы знаний</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...setupData.knowledgeItems, ...knowledgeItems].map((item, index) => (
                    <div key={item.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          {item.type === 'site' && <Globe className="w-4 h-4 text-blue-600" />}
                          {item.type === 'url' && <LinkIcon className="w-4 h-4 text-blue-600" />}
                          {item.type === 'text' && <EditIcon className="w-4 h-4 text-blue-600" />}
                          {item.type === 'file' && <FileIcon className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {item.type === 'site' && 'Сайт'}
                            {item.type === 'url' && 'URL'}
                            {item.type === 'text' && 'Текст'}
                            {item.type === 'file' && 'Файл'}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {item.content}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          item.status === 'completed' ? 'text-green-600 bg-green-100' :
                          item.status === 'processing' ? 'text-yellow-600 bg-yellow-100' :
                          'text-blue-600 bg-blue-100'
                        }`}>
                          {item.status === 'completed' ? 'Обработано' :
                           item.status === 'processing' ? 'Обработка' : 'Ожидание'}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteKnowledgeItem(item.id || index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {[...setupData.knowledgeItems, ...knowledgeItems].length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>База знаний пока пуста</p>
                      <p className="text-sm">Добавьте первый элемент, чтобы начать</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Сводка</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Сообщений сегодня</p>
                      <p className="text-3xl font-bold text-blue-600">{chatHistory.length}</p>
                      <p className="text-xs text-green-600">+12% за неделю</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Активных диалогов</p>
                      <p className="text-3xl font-bold text-green-600">24</p>
                      <p className="text-xs text-green-600">+5% за неделю</p>
                    </div>
                    <User className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Конверсия</p>
                      <p className="text-3xl font-bold text-purple-600">8.2%</p>
                      <p className="text-xs text-red-600">-2% за неделю</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Открытий виджета</p>
                      <p className="text-3xl font-bold text-orange-600">156</p>
                      <p className="text-xs text-green-600">+18% за неделю</p>
                    </div>
                    <Eye className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Графики и аналитика */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Активность по часам</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {Array.from({length: 24}, (_, i) => (
                      <div key={i} className="flex-1 bg-blue-200 rounded-t" style={{height: `${Math.random() * 100}%`}}></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Последние диалоги</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { user: 'Анна М.', message: 'Какие у вас есть тарифы?', time: '2 мин назад' },
                      { user: 'Михаил К.', message: 'Как подключить интеграцию?', time: '5 мин назад' },
                      { user: 'Екатерина С.', message: 'Спасибо за помощь!', time: '12 мин назад' },
                      { user: 'Дмитрий П.', message: 'Не работает виджет', time: '15 мин назад' }
                    ].map((dialog, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{dialog.user}</p>
                          <p className="text-xs text-gray-600">{dialog.message}</p>
                        </div>
                        <span className="text-xs text-gray-500">{dialog.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'model-settings':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Настройки модели</h1>
              <Button onClick={() => showNotificationMessage('Настройки сохранены!')}>
                Сохранить изменения
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Основные настройки */}
              <Card>
                <CardHeader>
                  <CardTitle>Основные настройки</CardTitle>
                  <p className="text-gray-600">Настройте основные параметры ИИ-модели</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Провайдер ИИ</label>
                    <Select value={setupData.modelProvider} onValueChange={(value) => setSetupData(prev => ({...prev, modelProvider: value}))}>
                      <option value="gigachat">GigaChat (Сбер)</option>
                      <option value="yandexgpt">YandexGPT</option>
                      <option value="openai">OpenAI GPT</option>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Модель</label>
                    <Select value={setupData.modelName} onValueChange={(value) => setSetupData(prev => ({...prev, modelName: value}))}>
                      {setupData.modelProvider === 'gigachat' && (
                        <>
                          <option value="GigaChat:latest">GigaChat Pro</option>
                          <option value="GigaChat:lite">GigaChat Lite</option>
                        </>
                      )}
                      {setupData.modelProvider === 'yandexgpt' && (
                        <>
                          <option value="yandexgpt">YandexGPT Pro</option>
                          <option value="yandexgpt-lite">YandexGPT Lite</option>
                        </>
                      )}
                      {setupData.modelProvider === 'openai' && (
                        <>
                          <option value="gpt-4">GPT-4</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </>
                      )}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Температура ({setupData.temperature})</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={setupData.temperature}
                      onChange={(e) => setSetupData(prev => ({...prev, temperature: parseFloat(e.target.value)}))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Точный</span>
                      <span>Креативный</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Максимум токенов</label>
                    <Input
                      type="number"
                      value={setupData.maxTokens}
                      onChange={(e) => setSetupData(prev => ({...prev, maxTokens: parseInt(e.target.value)}))}
                      min="100"
                      max="4000"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Системный промпт */}
              <Card>
                <CardHeader>
                  <CardTitle>Системный промпт</CardTitle>
                  <p className="text-gray-600">Инструкции для поведения ИИ-ассистента</p>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={setupData.systemPrompt}
                    onChange={(e) => setSetupData(prev => ({...prev, systemPrompt: e.target.value}))}
                    placeholder="Вы - полезный ИИ-ассистент. Отвечайте вежливо и информативно..."
                    className="min-h-[200px]"
                  />
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Совет:</strong> Четко опишите роль, стиль общения и ограничения для вашего ИИ-ассистента.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Тестирование */}
            <Card>
              <CardHeader>
                <CardTitle>Тестирование модели</CardTitle>
                <p className="text-gray-600">Проверьте как работает модель с текущими настройками</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="Введите тестовый вопрос..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                  />
                  <Button onClick={handleSendMessage} disabled={!currentMessage.trim()}>
                    Протестировать
                  </Button>
                  
                  {chatHistory.length > 1 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Последний ответ:</h4>
                      <p className="text-sm">{chatHistory[chatHistory.length - 1].text}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'dialogs':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Диалоги</h1>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Фильтры
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Экспорт
                </Button>
              </div>
            </div>

            {/* Поиск */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Поиск по диалогам..."
                      className="w-full"
                    />
                  </div>
                  <Button>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Список диалогов */}
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  id: 1,
                  user: 'Анна Морозова',
                  email: 'anna@example.com',
                  status: 'active',
                  lastMessage: 'Какие у вас есть тарифы?',
                  time: '2 минуты назад',
                  messages: 5
                },
                {
                  id: 2,
                  user: 'Михаил Козлов',
                  email: 'mikhail@example.com',
                  status: 'waiting',
                  lastMessage: 'Как подключить интеграцию с CRM?',
                  time: '15 минут назад',
                  messages: 3
                },
                {
                  id: 3,
                  user: 'Екатерина Смирнова',
                  email: 'kate@example.com',
                  status: 'closed',
                  lastMessage: 'Спасибо за помощь!',
                  time: '1 час назад',
                  messages: 12
                }
              ].map((dialog) => (
                <Card key={dialog.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{dialog.user}</h3>
                          <p className="text-sm text-gray-600">{dialog.email}</p>
                          <p className="text-sm text-gray-800 mt-1">{dialog.lastMessage}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-block px-2 py-1 rounded-full text-xs ${
                          dialog.status === 'active' ? 'bg-green-100 text-green-800' :
                          dialog.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {dialog.status === 'active' ? 'Активный' :
                           dialog.status === 'waiting' ? 'Ожидает' : 'Закрыт'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{dialog.time}</p>
                        <p className="text-xs text-gray-500">{dialog.messages} сообщений</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Интеграции</h1>
              <Button onClick={handleShowWidgetConstructor}>
                <Plus className="w-4 h-4 mr-2" />
                Настроить виджет
              </Button>
            </div>

            {/* Популярные интеграции */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Мессенджеры</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'telegram', name: 'Telegram', description: 'Чат-бот в Telegram', color: 'bg-blue-500' },
                    { id: 'whatsapp', name: 'WhatsApp', description: 'Интеграция с WhatsApp Business', color: 'bg-green-500' },
                    { id: 'vk', name: 'ВКонтакте', description: 'Сообщества ВК', color: 'bg-blue-600' }
                  ].map((integration) => (
                    <Card key={integration.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleIntegrationClick(integration.id)}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${integration.color} rounded-lg flex items-center justify-center`}>
                            <MessageSquare className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium">{integration.name}</h3>
                            <p className="text-sm text-gray-600">{integration.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">CRM и продажи</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'amocrm', name: 'amoCRM', description: 'Синхронизация лидов', color: 'bg-purple-500' },
                    { id: 'bitrix24', name: 'Битрикс24', description: 'Интеграция с CRM', color: 'bg-orange-500' },
                    { id: 'salesforce', name: 'Salesforce', description: 'Управление клиентами', color: 'bg-blue-700' }
                  ].map((integration) => (
                    <Card key={integration.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleIntegrationClick(integration.id)}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${integration.color} rounded-lg flex items-center justify-center`}>
                            <Building className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium">{integration.name}</h3>
                            <p className="text-sm text-gray-600">{integration.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Веб-интеграции</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'widget', name: 'Виджет на сайт', description: 'HTML код для вставки', color: 'bg-green-600' },
                    { id: 'api', name: 'REST API', description: 'Программный интерфейс', color: 'bg-gray-700' },
                    { id: 'webhook', name: 'Webhook', description: 'Уведомления в реальном времени', color: 'bg-red-500' }
                  ].map((integration) => (
                    <Card key={integration.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleIntegrationClick(integration.id)}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${integration.color} rounded-lg flex items-center justify-center`}>
                            <Globe className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium">{integration.name}</h3>
                            <p className="text-sm text-gray-600">{integration.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-center py-8 text-gray-500">Раздел в разработке</div>;
    }
  };

  // Auth screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-xl font-semibold">Adapto</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {currentStep === 'register' ? 'Регистрация' : 'Вход в систему'}
            </h2>
            <p className="mt-2 text-gray-600">
              {currentStep === 'register' ? 'Создайте аккаунт для начала работы' : 'Войдите в свой аккаунт'}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-sm">
            {currentStep === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Пароль</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Введите пароль"
                    required
                  />
                </div>
                
                {formErrors.general && (
                  <div className="text-red-600 text-sm">{formErrors.general}</div>
                )}
                
                <Button type="submit" className="w-full">
                  Войти
                </Button>
                
                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('register')}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Нет аккаунта? Зарегистрироваться
                  </button>
                </div>
              </form>
            )}

            {currentStep === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Имя</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ваше имя"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Компания</label>
                  <Input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Название компании"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Пароль</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Создайте пароль"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Создать аккаунт
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('login')}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Уже есть аккаунт? Войти
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300">
          {notificationMessage}
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed md:relative z-50 md:z-auto transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 w-64 h-full bg-white border-r border-gray-200 flex flex-col`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <div className="flex items-center justify-center w-5 h-5">
                <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="font-medium">{currentUser?.name || 'Пользователь'}</div>
              <div className="text-xs text-gray-500">{currentUser?.company_name || 'Компания'}</div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  localStorage.setItem('currentSection', item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === item.id 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <div className="space-y-1">
            <button 
              onClick={() => {
                setActiveSection('model-settings');
                localStorage.setItem('currentSection', 'model-settings');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">Настройка Adapto</span>
            </button>
            <button 
              onClick={() => window.open('/privacy-policy', '_blank')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Правила и соглашения</span>
            </button>
            <button 
              onClick={() => window.open('/support', '_blank')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Чат с поддержкой</span>
            </button>
            <button 
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors" 
              onClick={handleLogout}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">Выйти</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-4 p-4 border-b border-gray-200 bg-white">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </Button>
          <h1 className="font-medium">Adapto AI Platform</h1>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-white">
          {renderContent()}
        </main>
      </div>

      {/* Widget Constructor Modal */}
      {showWidgetConstructor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Конструктор виджета</h2>
              <Button variant="ghost" onClick={() => setShowWidgetConstructor(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Позиция виджета</label>
                <Select value={widgetSettings.position} onValueChange={(value) => setWidgetSettings({...widgetSettings, position: value})}>
                  <option value="bottom-right">Правый нижний угол</option>
                  <option value="bottom-left">Левый нижний угол</option>
                  <option value="top-right">Правый верхний угол</option>
                  <option value="top-left">Левый верхний угол</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Цвет виджета</label>
                <Input
                  type="color"
                  value={widgetSettings.color}
                  onChange={(e) => setWidgetSettings({...widgetSettings, color: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Приветственное сообщение</label>
                <Input
                  value={widgetSettings.welcomeMessage}
                  onChange={(e) => setWidgetSettings({...widgetSettings, welcomeMessage: e.target.value})}
                  placeholder="Здравствуйте! Чем могу помочь?"
                />
              </div>
              
              <div className="flex gap-3">
                <Button onClick={() => setShowWidgetConstructor(false)}>
                  Сохранить
                </Button>
                <Button variant="outline" onClick={() => showNotificationMessage('Код виджета скопирован!')}>
                  Получить код
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integration Modal */}
      {showIntegrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Настройка интеграции</h2>
              <Button variant="ghost" onClick={() => setShowIntegrationModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Интеграция с {selectedIntegration} будет настроена в ближайшее время.
              </p>
              
              <div className="flex gap-3">
                <Button onClick={() => {
                  setShowIntegrationModal(false);
                  showNotificationMessage('Заявка на интеграцию отправлена!');
                }}>
                  Запросить интеграцию
                </Button>
                <Button variant="outline" onClick={() => setShowIntegrationModal(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


