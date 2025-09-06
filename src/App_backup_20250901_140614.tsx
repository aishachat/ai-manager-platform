import React, { useState, useEffect } from 'react';

// CSS для мигающего курсора
const cursorStyle = `
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

// Добавляем стили в head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = cursorStyle;
  document.head.appendChild(style);
}
import { knowledgeBase, botCorrections as botCorrectionsAPI, testConnection, users } from './supabaseClient.js';
import * as supabaseClient from './supabaseClient.js';

// Отладочный код для проверки импорта
console.log('supabaseClient:', supabaseClient);
console.log('chatHistory from supabaseClient:', supabaseClient.chatHistory);
import { processContent } from './gigaChatAPI.js';
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
  MoreHorizontal,
  MoreVertical,
  Home,
  HelpCircle,
  Link,
  File,
  Calendar,
  FileText,
  FileSpreadsheet,
  Clock,
  Phone,
  Hash,
  CreditCard,
  Bell
} from 'lucide-react';

// UI Components
const Button = ({ children, className = '', onClick, disabled = false, variant = 'default', size = 'default', type = 'button' as const, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
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
    sm: 'h-9 px-3 rounded-[10px]',
    lg: 'h-11 px-8 rounded-[10px]',
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
    className={`flex h-10 w-full rounded-[10px] border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Textarea = ({ className = '', ...props }) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-[10px] border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Card = ({ className = '', ...props }) => (
  <div className={`rounded-[15px] border bg-card text-card-foreground shadow-sm ${className}`} {...props} />
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

const Select = ({ children, value, onValueChange, ...props }: { children: React.ReactNode, value: string, onValueChange?: (value: string) => void, [key: string]: any }) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      className="flex h-10 w-full items-center justify-between rounded-[10px] border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
    return localStorage.getItem('currentSection') || 'main';
  });
  
  const [currentStep, setCurrentStep] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab] = useState('personal');
  const [theme, setTheme] = useState('dark');
  const [expandedMenus, setExpandedMenus] = useState([]);
  const [activeStatisticsTab, setActiveStatisticsTab] = useState('general');
  const [showMetricInfoModal, setShowMetricInfoModal] = useState(false);
  const [currentMetricInfo, setCurrentMetricInfo] = useState(null);
  
  // Состояния для интеграций
  const [integrations, setIntegrations] = useState([
    { id: 'widget', name: 'Виджет на сайт', description: 'Настройте виджет и вставьте скрипт на сайт', icon: 'group-36.svg', installed: false },
    { id: 'whatsapp', name: 'WhatsApp', description: 'Подключите ИИ-бота к WhatsApp Business', icon: 'group-37.svg', installed: false },
    { id: 'telegram', name: 'Telegram', description: 'Подключите ИИ-бота к Telegram', icon: 'group-38.svg', installed: false },
    { id: 'vk', name: 'Вконтакте', description: 'Установите в своем сообществе ИИ-агента', icon: 'group-39.svg', installed: false },
    { id: 'bitrix', name: 'Битрикс24', description: 'Подключите CRM для передачи лидов', icon: 'group-41.svg', installed: false },
    { id: 'amo', name: 'amoCRM', description: 'Подключите CRM для передачи лидов', icon: 'group-42.svg', installed: false },
    { id: 'instagram', name: 'Instagram*', description: 'Внедрите ИИ-бота прямиком в Директ', icon: 'group-43.svg', installed: false },
    { id: 'yclients', name: 'Yclients', description: 'Интегрируйте Adapto в Yclients', icon: 'group-40.svg', installed: false }
  ]);

  const [showUninstallModal, setShowUninstallModal] = useState(false);
  const [integrationToUninstall, setIntegrationToUninstall] = useState(null);
  
  // Состояния для попапа первого входа
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [showModelSetupProgress, setShowModelSetupProgress] = useState(false);
  const [modelSetupTimer, setModelSetupTimer] = useState(300); // 5 минут = 300 секунд

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

  // Функция форматирования номера телефона
  const formatPhoneNumber = (value) => {
    const phoneNumbers = value.replace(/\D/g, '');
    if (phoneNumbers.length === 0) return '';
    if (phoneNumbers.length <= 3) return `+7 (${phoneNumbers}`;
    if (phoneNumbers.length <= 6) return `+7 (${phoneNumbers.slice(0, 3)}) ${phoneNumbers.slice(3)}`;
    if (phoneNumbers.length <= 8) return `+7 (${phoneNumbers.slice(0, 3)}) ${phoneNumbers.slice(3, 6)}-${phoneNumbers.slice(6)}`;
    return `+7 (${phoneNumbers.slice(0, 3)}) ${phoneNumbers.slice(3, 6)}-${phoneNumbers.slice(6, 8)}-${phoneNumbers.slice(8, 10)}`;
  };

  // Функция валидации номера телефона
  const validatePhone = (phone) => {
    const phoneNumbers = phone.replace(/\D/g, '');
    if (!phone) return 'Номер телефона обязателен';
    if (phoneNumbers.length !== 11) return 'Номер телефона должен содержать 11 цифр';
    if (!phoneNumbers.startsWith('7')) return 'Номер должен начинаться с 7';
    return null;
  };

  // Функция для генерации аватара
  const generateAvatar = (name) => {
    if (!name) return { color: '#3B82F6', letter: 'П' };
    
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];
    
    const letter = name.charAt(0).toUpperCase();
    const colorIndex = name.charCodeAt(0) % colors.length;
    
    return { color: colors[colorIndex], letter };
  };

  // Setup data
  const [setupData, setSetupData] = useState({
    // Шаг 1: Цели Adapto
    task: '',
    mainGoal: '',
    customGoal: '',
    dealCycle: '',
    targetAudience: '',
    
    // Шаг 2: Правила общения
    addressing: 'Вы',
    communicationStyle: 'Профессиональный',
    restrictions: [],
    showCustomRestriction: false,
    customRestriction: '',
    communicationSettings: [],
    showCustomCommunicationSetting: false,
    customCommunicationSetting: '',
    dataCollection: [],
    showCustomData: false,
    customData: '',
    clarificationQuestions: [],
    showCustomClarificationQuestion: false,
    customClarificationQuestion: '',
    emojiUsage: 'Редко',
    editingStage: null,
    
    // Шаг 3: Этапы диалога
    dialogStages: [
      'Поздоровайся и спроси имя клиента. Уточни его проблему и пойми текущую ситуацию пользователя',
      'Опиши коротко как решишь его задачу/назови наши преимущества, предложи товары по запросу',
      'Веди клиента к оформлению заказа/заявки',
      'Когда клиент готов оформить заказ, сделай итог заказа и пришли ссылку на оплату из базы знаний.',
      'Переведи клиента на менеджера для проверки оплаты и дальнейшей работы'
    ],
    dialogStagesModified: null, // null = не проверяли, true = изменено, false = не изменено
    
    // Для попапа первого входа - Шаг 4: База знаний
    knowledgeItems: [],
    selectedKnowledgeType: null,
    knowledgeInput: '',
    
    // Технические настройки модели
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
  const [botCorrections, setBotCorrections] = useState([]);
  const [hiddenCorrections, setHiddenCorrections] = useState(new Set());
  const [showAddCorrectionForm, setShowAddCorrectionForm] = useState(false);
  const [newCorrectionText, setNewCorrectionText] = useState('');
  const [hasKnowledgeBase, setHasKnowledgeBase] = useState(false);
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [newKnowledgeItem, setNewKnowledgeItem] = useState({ type: 'text', content: '' });
  const [selectedKnowledgeItem, setSelectedKnowledgeItem] = useState(null);
  const [showSitePopup, setShowSitePopup] = useState(false);
  const [showFeedPopup, setShowFeedPopup] = useState(false);
  const [showFilePopup, setShowFilePopup] = useState(false);
  const [showTextPopup, setShowTextPopup] = useState(false);
  
  // Обработчик клика вне области для закрытия выпадающего меню
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedKnowledgeItem && !event.target.closest('.dropdown-menu')) {
        setSelectedKnowledgeItem(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedKnowledgeItem]);
  const [sitePopupTab, setSitePopupTab] = useState('full'); // 'full' или 'selective'
  const [siteUrl, setSiteUrl] = useState('');
  const [selectedPages, setSelectedPages] = useState(['']);
  const [siteUrlError, setSiteUrlError] = useState('');
  const [selectedPagesErrors, setSelectedPagesErrors] = useState(['']);
  
  // Feed popup states
  const [feedUrl, setFeedUrl] = useState('');
  const [feedUrlError, setFeedUrlError] = useState('');
  
  // File popup states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  // Text popup states
  const [textContent, setTextContent] = useState('');
  const [textContentError, setTextContentError] = useState('');

  // Dashboard states
  const [showCalendar, setShowCalendar] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [activeQuickSelect, setActiveQuickSelect] = useState(null);

  // Dialogs states
  const [selectedDialog, setSelectedDialog] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [dialogsData] = useState([
    {
      id: 1,
      user: '+7 (991) 221-11-22',
      name: 'Александр Петров',
      email: 'client1@example.com',
      phone: '+7 (991) 221-11-22',
      browser: null,
      status: 'active',
      source: 'whatsapp',
      lastMessage: 'Спасибо за ответ!',
      time: '11:43',
      messageCount: 5,
      startTime: '28.08.2024 10:30',
      lastActivity: '28.08.2024 11:43',
      messages: [
        { text: 'Привет! Расскажи об айфоне 12, в чем отличие от 13?', time: '10:30', isUser: true },
        { text: 'Привет, меня зовут Иван! Чем могу помочь?', time: '10:32', isUser: false },
        { text: 'Хочу узнать про iPhone 12', time: '10:35', isUser: true },
        { text: 'Конечно! iPhone 12 отличается от 13 следующими характеристиками...', time: '10:37', isUser: false },
        { text: 'Спасибо за ответ!', time: '11:43', isUser: true }
      ]
    },
    {
      id: 2,
      user: '#8912',
      name: '—',
      email: 'client2@example.com',
      phone: '—',
      browser: 'Chrome 120.0.0',
      status: 'waiting',
      source: 'widget',
      lastMessage: 'Спасибо за ответ!',
      time: '11:43',
      messageCount: 3,
      startTime: '28.08.2024 11:20',
      lastActivity: '28.08.2024 11:43',
      messages: [
        { text: 'Как подключить интеграцию с CRM?', time: '11:20', isUser: true },
        { text: 'Для подключения интеграции с CRM вам нужно выполнить несколько шагов.', time: '11:22', isUser: false },
        { text: 'Спасибо за ответ!', time: '11:43', isUser: true }
      ]
    },
    {
      id: 3,
      user: '+7 (991) 221-11-22',
      name: 'Мария Сидорова',
      email: 'client3@example.com',
      phone: '+7 (991) 221-11-22',
      browser: null,
      status: 'closed',
      source: 'telegram',
      lastMessage: 'Спасибо за ответ!',
      time: '11:43',
      messageCount: 8,
      startTime: '28.08.2024 09:15',
      lastActivity: '28.08.2024 11:30',
      messages: [
        { text: 'Здравствуйте! Нужна помощь с настройкой', time: '09:15', isUser: true },
        { text: 'Конечно! Расскажите, что именно нужно настроить?', time: '09:17', isUser: false },
        { text: 'Виджет на сайте не отображается', time: '09:20', isUser: true },
        { text: 'Давайте проверим настройки. Откройте панель администратора.', time: '09:22', isUser: false },
        { text: 'Открыл, что дальше?', time: '09:25', isUser: true },
        { text: 'Перейдите в раздел "Интеграции" и проверьте статус виджета.', time: '09:27', isUser: false },
        { text: 'Нашел проблему! Код был вставлен неправильно', time: '11:25', isUser: true },
        { text: 'Отлично! Теперь виджет должен работать корректно.', time: '11:27', isUser: false },
        { text: 'Спасибо за ответ!', time: '11:30', isUser: true }
      ]
    },
    {
      id: 4,
      user: '+7 (991) 221-11-22',
      name: '—',
      email: 'client4@example.com',
      phone: '+7 (991) 221-11-22',
      browser: null,
      status: 'active',
      source: 'vk',
      lastMessage: 'Спасибо за ответ!',
      time: '11:43',
      messageCount: 4,
      startTime: '28.08.2024 11:00',
      lastActivity: '28.08.2024 11:43',
      messages: [
        { text: 'Виджет не работает на моем сайте', time: '11:00', isUser: true },
        { text: 'Давайте разберемся с проблемой. На каком сайте установлен виджет?', time: '11:02', isUser: false },
        { text: 'На сайте example.com', time: '11:05', isUser: true },
        { text: 'Проверяю настройки для вашего сайта...', time: '11:30', isUser: false },
        { text: 'Спасибо за ответ!', time: '11:43', isUser: true }
      ]
    }
  ]);

  // Widget settings
  const [widgetSettings, setWidgetSettings] = useState({
    accentColor: '#1354FC',
    buttonColor: 'light',
    buttonText: 'Спросить ИИ',
    buttonSubtext: 'Задать вопрос',
    avatar: 'default',
    customButtonColor: '#1354FC',
    showCustomColorPicker: false,
    widgetLocation: 'default',
    // Widget positioning
    desktopBottomOffset: 20,
    desktopRightOffset: 20,
    mobileBottomOffset: 20,
    mobileRightOffset: 20,
    zIndex: 9999,
    // Welcome message
    welcomeMessages: ['Привет! Меня зовут Adapto, я ИИ ассистент.'],
    // Trigger question
    triggerQuestion: 'Задать вопрос',
    triggerQuestionEnabled: 'no',
    triggerQuestionDelay: 5,
    triggerQuestionText: 'Здравствуйте! Если появится вопрос, можете задать его в чате, я оперативно отвечу',
    triggerQuickReply: 'Задать вопрос',
    // Follow up message
    followUpMessage: 'no',
    followUpDelay: 10,
    followUpQuestion: 'Продолжим диалог?',
    followUpQuickReply: 'Расскажи подробнее',
    // Quick replies
    quickReplies: ['Расскажи подробнее'],
    privacyPolicyUrl: 'https://',
    dataTags: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'roistat_visit', 'gclid', 'fbclid'],
    excludedPages: [],
    // Новые настройки для виджета
    // Режим работы виджета
    widgetMode: 'chat', // 'chat' или 'questions'
    // Быстрые вопросы
    quickQuestions: [
      { question: 'Как работает ваш сервис?', answer: 'Наш сервис использует ИИ для автоматизации общения с клиентами.' },
      { question: 'Сколько стоит?', answer: 'У нас есть несколько тарифных планов. Базовый план стоит 2990₽ в месяц.' },
      { question: 'Есть ли демо?', answer: 'Да, вы можете попробовать демо-версию бесплатно в течение 14 дней.' }
    ],
    // Настройки формы заявки
    leadFormEnabled: 'yes',
    leadFormTitle: 'Оставьте заявку',
    leadFormDescription: 'Мы свяжемся с вами в ближайшее время',
    leadFormFields: [
      { name: 'name', label: 'Имя', type: 'text', required: true },
      { name: 'phone', label: 'Телефон', type: 'tel', required: true },
      { name: 'email', label: 'Email', type: 'email', required: false }
    ],
    // Настройки внешнего вида
    widgetTheme: 'light', // 'light' или 'dark'
    widgetSize: 'medium', // 'small', 'medium', 'large'
    showAvatar: true,
    showTypingIndicator: true,
    // Настройки поведения
    autoOpenOnScroll: false,
    autoOpenDelay: 0,
    showOnMobile: true,
    // Настройки уведомлений
    notificationSound: true,
    notificationTitle: 'Новое сообщение',
    // Настройки аналитики
    trackEvents: true,
    trackConversions: true,
    // Логотип
    logoUrl: ''
  });

  // Menu items with nested structure
  const menuItems = [
    { id: 'statistics', label: 'Статистика', icon: BarChart3 },
    { id: 'dialogs', label: 'Диалоги', icon: MessageSquare },
    { 
      id: 'adapto-ai', 
      label: 'Adapto ИИ-Агент', 
      icon: () => <img src="/mouse-square-menu.svg?v=3" alt="Adapto ИИ-Агент" className="w-5 h-5" />,
      hasSubmenu: true,
      submenu: [
        { id: 'my-adapto', label: 'Тестирование', icon: () => <img src="/glass.svg" alt="Тестирование" className="w-4 h-4" /> },
        { id: 'model-settings', label: 'Настройка модели', icon: Settings },
        { id: 'model-extensions', label: 'Расширения', icon: () => <img src="/layer.svg" alt="Расширения" className="w-4 h-4" /> }
      ]
    },
    { id: 'knowledge', label: 'База знаний', icon: Database },
    { 
      id: 'integrations', 
      label: 'Интеграции', 
      icon: Zap,
      hasSubmenu: true,
      submenu: [
        { id: 'widget-settings', label: 'Виджет на сайт', icon: () => <img src="/message-programming.svg" alt="Виджет" className="w-4 h-4" /> },
        { id: 'messengers', label: 'Мессенджеры', icon: () => <img src="/messages-2.svg" alt="Мессенджеры" className="w-4 h-4" /> },
        { id: 'crm-systems', label: 'CRM-системы', icon: () => <img src="/filter.svg" alt="CRM" className="w-4 h-4" /> },
        { id: 'other-integrations', label: 'Другое', icon: () => <img src="/element-plus.svg" alt="Другое" className="w-4 h-4" /> }
      ]
    },

  ];

  // Notification function
  const showNotificationMessage = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Function to open metric info modal
  const openMetricInfo = (metricInfo) => {
    setCurrentMetricInfo(metricInfo);
    setShowMetricInfoModal(true);
  };

    // Function to generate trend indicator
  const generateTrendIndicator = (trend, value, inverted = false) => {
    const isPositive = inverted ? trend === 'down' : trend === 'up';
    return (
      <div className="flex items-end gap-1 ml-2">
        <svg 
          className={`w-3 h-3 ${isPositive ? 'text-green-600' : 'text-red-600'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          style={{ paddingBottom: '0px !important', borderBottomWidth: '0px !important', height: '31px !important' }}
        >
          {isPositive ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" style={{ paddingBottom: '0px !important' }} />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" style={{ paddingBottom: '0px !important' }} />
          )}
        </svg>
        <div className={`text-[11px] font-[500] ${isPositive ? 'text-green-600' : 'text-red-600'}`} style={{ height: '13px !important' }}>
          {value}
        </div>
      </div>
    );
  };

  // Function to generate progress bar with 50 sticks
  const generateProgressBar = (value, maxValue = 100, isRating = false, color = 'blue') => {
    const totalSticks = 50;
    let filledSticks;
    
    if (isRating) {
      // For rating: 10 points = 50 sticks, so 1 point = 5 sticks
      filledSticks = Math.round((value / 10) * totalSticks);
    } else {
      // For percentage: 100% = 50 sticks, so 1% = 0.5 sticks
      filledSticks = Math.round((value / maxValue) * totalSticks);
    }
    
    const colorMap = {
      blue: '#0084FF',
      purple: '#8B5CF6',
      green: '#10B981',
      orange: '#F59E0B',
      red: '#EF4444',
      indigo: '#6366F1'
    };
    
    const sticks = [];
    for (let i = 0; i < totalSticks; i++) {
      const isFilled = i < filledSticks;
      sticks.push(
        <div
          key={i}
          className={`w-[2px] h-[16px] rounded-[1px] ${
            isFilled ? '' : 'bg-[#D3D3D3]'
          }`}
          style={{
            position: 'absolute',
            left: `${i * 4}px`,
            top: '0px',
            backgroundColor: isFilled ? colorMap[color] : '#D3D3D3'
          }}
        />
      );
    }
    
    return (
      <div className="relative w-[200px] h-[16px] mt-2">
        {sticks}
      </div>
    );
  };

  // Generate widget code
  const generateWidgetCode = () => {
    const settings = {
      accentColor: widgetSettings.accentColor,
      buttonText: widgetSettings.buttonText,
      buttonStyle: widgetSettings.buttonStyle || 'rectangle',
      buttonColor: widgetSettings.buttonColor || 'light',
      customButtonColor: widgetSettings.customButtonColor,
      widgetMode: widgetSettings.widgetMode,
      quickQuestions: widgetSettings.quickQuestions,
      leadFormEnabled: widgetSettings.leadFormEnabled,
      leadFormTitle: widgetSettings.leadFormTitle,
      leadFormDescription: widgetSettings.leadFormDescription,
      leadFormFields: widgetSettings.leadFormFields,
      welcomeMessages: widgetSettings.welcomeMessages,
      quickReplies: widgetSettings.quickReplies,
      logoUrl: widgetSettings.logoUrl,
      logoName: widgetSettings.logoName,
      suggestions: widgetSettings.suggestions,
      triggerQuestionEnabled: widgetSettings.triggerQuestionEnabled,
      triggerQuestionDelay: widgetSettings.triggerQuestionDelay,
      triggerQuestionText: widgetSettings.triggerQuestionText,
      followUpMessage: widgetSettings.followUpMessage,
      followUpDelay: widgetSettings.followUpDelay,
      followUpQuestion: widgetSettings.followUpQuestion,
      followUpQuickReply: widgetSettings.followUpQuickReply,
      privacyPolicyUrl: widgetSettings.privacyPolicyUrl,
      dataTags: widgetSettings.dataTags,
      widgetLocation: widgetSettings.widgetLocation,
      desktopBottomOffset: widgetSettings.desktopBottomOffset,
      desktopRightOffset: widgetSettings.desktopRightOffset,
      mobileBottomOffset: widgetSettings.mobileBottomOffset,
      mobileRightOffset: widgetSettings.mobileRightOffset,
      zIndex: widgetSettings.zIndex,
      avatar: widgetSettings.avatar
    };

    const encodedSettings = encodeURIComponent(JSON.stringify(settings));
    
    return `<script src="http://localhost:3002/widget.js"></script>
<script>
  window.adaptoWidget.init(${JSON.stringify(settings, null, 2)});
</script>`;
  };

  // Export functions
  const exportToCSV = () => {
    const data = [
      ['Метрика', 'Значение', 'Изменение'],
      ['Сообщений сегодня', chatHistory.length, '+12% за неделю'],
      ['Активных диалогов', '24', '+5% за неделю'],
      ['Конверсия', '8.2%', '-2% за неделю'],
      ['Открытий виджета', '156', '+18% за неделю']
    ];
    
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToXLS = () => {
    const data = [
      ['Метрика', 'Значение', 'Изменение'],
      ['Сообщений сегодня', chatHistory.length, '+12% за неделю'],
      ['Активных диалогов', '24', '+5% за неделю'],
      ['Конверсия', '8.2%', '-2% за неделю'],
      ['Открытий виджета', '156', '+18% за неделю']
    ];
    
    let xlsContent = '<table>';
    data.forEach(row => {
      xlsContent += '<tr>';
      row.forEach(cell => {
        xlsContent += `<td>${cell}</td>`;
      });
      xlsContent += '</tr>';
    });
    xlsContent += '</table>';
    
    const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDialogsToCSV = () => {
    const data = [
      ['Пользователь', 'Email', 'Источник', 'Статус', 'Последнее сообщение', 'Время', 'Количество сообщений']
    ];
    
    dialogsData.forEach(dialog => {
      data.push([
        dialog.user,
        dialog.email,
        dialog.source,
        dialog.status === 'active' ? 'Активный' : dialog.status === 'waiting' ? 'Ожидает' : 'Закрыт',
        dialog.lastMessage,
        dialog.time,
        dialog.messages.length.toString()
      ]);
    });
    
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dialogs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      console.log('Selected files:', files);
      // Здесь можно добавить логику для обработки файлов
    };
    input.click();
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    // Здесь можно добавить логику для отправки сообщения
    console.log('Sending message:', messageText);
    
    // Очищаем поле ввода
    setMessageText('');
  };

  const handleLikeMessage = (index) => {
    console.log('Liked message at index:', index);
    // Здесь можно добавить логику для отправки лайка в GigaChat
    showNotificationMessage('Ответ оценен положительно');
  };

  const handleDislikeMessage = (index) => {
    console.log('Disliked message at index:', index);
    // Здесь можно добавить логику для отправки дизлайка в GigaChat
    showNotificationMessage('Ответ оценен отрицательно');
  };

  const exportDialogsToXLS = () => {
    const headers = ['Пользователь', 'Email', 'Источник', 'Статус', 'Последнее сообщение', 'Время', 'Количество сообщений'];
    const data = dialogsData.map(dialog => [
      dialog.user,
      dialog.email,
      dialog.source,
      dialog.status === 'active' ? 'Активный' : dialog.status === 'waiting' ? 'Ожидает' : 'Закрыт',
      dialog.lastMessage,
      dialog.time,
      dialog.messages.length.toString()
    ]);
    
    // Создаем простой HTML файл с таблицей для экспорта в Excel
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Диалоги</title>

  // Calendar functions
  const handleQuickDateSelect = (type) => {
    try {
    console.log('handleQuickDateSelect called with type:', type);
    const today = new Date();
    let start, end;
    
    switch(type) {
      case 'today':
        start = new Date(today);
        end = new Date(today);
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        start = yesterday;
        end = yesterday;
        break;
      case 'last7days':
        start = new Date(today);
        start.setDate(start.getDate() - 6);
        end = new Date(today);
        break;
      case 'last30days':
        start = new Date(today);
        start.setDate(start.getDate() - 29);
        end = new Date(today);
        break;
      case 'last90days':
        start = new Date(today);
        start.setDate(start.getDate() - 89);
        end = new Date(today);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      default:
          return;
      }
      
      // Проверяем валидность дат
      if (!start || !(start instanceof Date) || isNaN(start.getTime()) ||
          !end || !(end instanceof Date) || isNaN(end.getTime())) {
        console.error('Invalid dates generated:', { start, end });
        return;
    }
    
    console.log('Setting dateRange:', { start, end });
    setDateRange({ start, end });
    setSelectedDates([]);
    setActiveQuickSelect(type);
    console.log('activeQuickSelect set to:', type);
    } catch (error) {
      console.error('Error in handleQuickDateSelect:', error);
    }
  };

  const handleDateClick = (date) => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.warn('Invalid date in handleDateClick:', date);
        return;
    }
    
    // Сбрасываем активную быструю кнопку
    setActiveQuickSelect(null);
    
      // Если у нас уже есть начальная дата, устанавливаем конечную
      if (dateRange.start && !dateRange.end) {
        if (date >= dateRange.start) {
          setDateRange(prev => ({ ...prev, end: date }));
      } else {
          // Если выбранная дата раньше начальной, меняем местами
          setDateRange({ start: date, end: dateRange.start });
        }
      } else {
        // Начинаем новый диапазон
        setDateRange({ start: date, end: null });
        setSelectedDates([]);
      }
    } catch (error) {
      console.error('Error in handleDateClick:', error);
    }
  };

  const isDateSelected = (date) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return selectedDates.includes(dateStr);
  };

  const isDateInRange = (date) => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return false;
      }
      
      if (!dateRange.start || !(dateRange.start instanceof Date) || isNaN(dateRange.start.getTime())) {
        return false;
      }
      
    const dateStr = date.toISOString().split('T')[0];
    const startStr = dateRange.start.toISOString().split('T')[0];
      
      if (!dateRange.end || !(dateRange.end instanceof Date) || isNaN(dateRange.end.getTime())) {
        // Если конечная дата не выбрана, подсвечиваем только начальную
        return dateStr === startStr;
      }
      
    const endStr = dateRange.end.toISOString().split('T')[0];
    return dateStr >= startStr && dateStr <= endStr;
    } catch (error) {
      console.error('Error in isDateInRange:', error);
      return false;
    }
  };

  const nextMonth = () => {
    setCurrentMonth(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const prevMonth = () => {
    setCurrentMonth(prev => {
      const prevMonth = new Date(prev);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      return prevMonth;
    });
  };

  // Функция для генерации календарной сетки
  const generateCalendarDays = (month) => {
    try {
      if (!month || !(month instanceof Date) || isNaN(month.getTime())) {
        console.warn('Invalid month parameter:', month);
        return [];
      }
    
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
      
      // Начинаем с понедельника (1) вместо воскресенья (0)
      const firstDayOfWeek = firstDay.getDay();
    const startDate = new Date(firstDay);
      const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
      startDate.setDate(startDate.getDate() - daysToSubtract);
    
    const days = [];
    const currentDate = new Date(startDate);
    
      // Генерируем 42 дня (6 недель)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
    } catch (error) {
      console.error('Error in generateCalendarDays:', error);
      return [];
    }
  };

  const getDayClass = (date) => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return "w-8 h-8 rounded hover:bg-gray-100 text-center text-xs cursor-pointer";
      }
      
      if (!currentMonth || !(currentMonth instanceof Date) || isNaN(currentMonth.getTime())) {
        return "w-8 h-8 rounded hover:bg-gray-100 text-center text-xs cursor-pointer";
      }
    
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const isInRange = isDateInRange(date);
    
      let classes = "w-8 h-8 rounded hover:bg-gray-100 text-center text-xs cursor-pointer transition-colors";
    
    if (!isCurrentMonth) {
      classes += " text-gray-300";
    } else if (isInRange) {
        if (date.toDateString() === dateRange.start?.toDateString() || 
            (dateRange.end && date.toDateString() === dateRange.end.toDateString())) {
          // Начальная или конечная дата диапазона
          classes += " bg-[#0084FF] text-white hover:bg-[#0073E6]";
        } else {
          // Даты в диапазоне
          classes += " bg-[#0084FF]/20 text-[#0084FF] hover:bg-[#0084FF]/30";
        }
    } else if (isToday) {
      classes += " bg-gray-200 text-gray-800";
    }
    
    return classes;
    } catch (error) {
      console.error('Error in getDayClass:', error);
      return "w-8 h-8 rounded hover:bg-gray-100 text-center text-xs cursor-pointer";
    }
  };
        </head>
        <body>
          <table border="1">
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${data.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dialogs_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
  };

  // Проверка первого входа пользователя - только при регистрации
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const hasShownSetupWizard = localStorage.getItem('hasShownSetupWizard');
      const isNewUser = localStorage.getItem('isNewUser');
      
      // Показываем попап только если это новый пользователь и попап еще не показывался
      if (isNewUser === 'true' && !hasShownSetupWizard) {
        setIsFirstTimeUser(true);
        setShowSetupWizard(true);
        localStorage.removeItem('isNewUser'); // Убираем флаг нового пользователя
      }
    }
  }, [isLoggedIn, currentUser]);

  // Таймер для настройки модели
  useEffect(() => {
    let interval;
    if (showModelSetupProgress && modelSetupTimer > 0) {
      interval = setInterval(() => {
        setModelSetupTimer(prev => {
          if (prev <= 1) {
            setShowModelSetupProgress(false);
            setModelSetupTimer(300);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showModelSetupProgress, modelSetupTimer]);

  // Функция для получения или создания пользователя
  const getOrCreateUser = async () => {
    if (!isLoggedIn || !currentUser) return null;
    
    try {
      // Создаем пользователя на основе данных из формы
      const userData = {
        email: currentUser.email || `user${currentUser.id}@example.com`,
        name: currentUser.name || `User ${currentUser.id}`,
        company_name: currentUser.company_name || '',
        phone: currentUser.phone || '',
        company_field: currentUser.company_field || ''
      };
      
      const user = await users.createOrGetUser(currentUser.id, userData);
      return user;
    } catch (error) {
      console.error('Error getting/creating user:', error);
      return null;
    }
  };

  // Загрузка данных из Supabase при инициализации
  useEffect(() => {
    const loadUserData = async () => {
      if (isLoggedIn && currentUser) {
        try {
          // Сначала тестируем подключение
          const connectionTest = await testConnection();
          console.log('Supabase connection test result:', connectionTest);
          
          if (!connectionTest) {
            console.warn('Supabase connection failed, using localStorage fallback');
            throw new Error('Connection failed');
          }

          // Получаем или создаем пользователя
          const user = await getOrCreateUser();
          if (!user) {
            console.warn('Failed to get/create user, using localStorage fallback');
            throw new Error('User creation failed');
          }

          // Загружаем корректировки из Supabase
          const corrections = await botCorrectionsAPI.getCorrections(currentUser.id);
          setBotCorrections(corrections.map(item => ({
            id: item.id,
            correction: item.correction,
            created_at: item.created_at
          })));

          // Загружаем элементы базы знаний из Supabase
          const knowledgeItems = await knowledgeBase.getKnowledgeItems(currentUser.id);
          setKnowledgeItems(knowledgeItems);
          setHasKnowledgeBase(knowledgeItems.length > 0);

          // Загружаем историю чата из Supabase
          try {
            console.log('Loading chat history for user:', currentUser.id);
            const chatHistoryData = await supabaseClient.chatHistory.getChatHistory(currentUser.id);
            console.log('Loaded chat history:', chatHistoryData);
            if (chatHistoryData && chatHistoryData.length > 0) {
              const formattedHistory = chatHistoryData.map(item => ({
                type: item.message_type,
                text: item.message_content
              }));
              console.log('Formatted chat history:', formattedHistory);
              setChatHistory(formattedHistory);
            } else {
              console.log('No chat history found, using default welcome message');
              // Если истории нет, используем приветственное сообщение
              setChatHistory([
                { type: 'assistant', text: 'Привет! Я ваш ИИ-ассистент Adapto. Как дела?' }
              ]);
            }
          } catch (error) {
            console.error('Error loading chat history:', error);
            // Fallback к приветственному сообщению
            setChatHistory([
              { type: 'assistant', text: 'Привет! Я ваш ИИ-ассистент Adapto. Как дела?' }
            ]);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          // Fallback к localStorage если Supabase недоступен
          const savedCorrections = localStorage.getItem(`botCorrections_${currentUser.id}`);
          if (savedCorrections) {
            setBotCorrections(JSON.parse(savedCorrections));
          }

          const savedKnowledgeItems = localStorage.getItem(`knowledgeItems_${currentUser.id}`);
          if (savedKnowledgeItems) {
            const items = JSON.parse(savedKnowledgeItems);
            setKnowledgeItems(items);
            setHasKnowledgeBase(items.length > 0);
          }

          // Fallback: загружаем историю чата из localStorage
          const savedChatHistory = localStorage.getItem(`chatHistory_${currentUser.id}`);
          if (savedChatHistory) {
            setChatHistory(JSON.parse(savedChatHistory));
          } else {
            setChatHistory([
              { type: 'assistant', text: 'Привет! Я ваш ИИ-ассистент Adapto. Как дела?' }
            ]);
          }
        }
      }
    };

    loadUserData();
  }, [isLoggedIn, currentUser]);

  // Сохранение данных при изменении
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      localStorage.setItem(`botCorrections_${currentUser.id}`, JSON.stringify(botCorrections));
    }
  }, [botCorrections, isLoggedIn, currentUser]);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      localStorage.setItem(`knowledgeItems_${currentUser.id}`, JSON.stringify(knowledgeItems));
      setHasKnowledgeBase(knowledgeItems.length > 0);
    }
  }, [knowledgeItems, isLoggedIn, currentUser]);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      localStorage.setItem(`chatHistory_${currentUser.id}`, JSON.stringify(chatHistory));
    }
  }, [chatHistory, isLoggedIn, currentUser]);

  // Auth functions
  const handleLogin = async (userData) => {
    try {
      const userWithId = { ...userData, id: Date.now() };
      setCurrentUser(userWithId);
      setIsLoggedIn(true);
      setActiveSection('main');
      localStorage.setItem('currentUser', JSON.stringify(userWithId));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentSection', 'main');
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

    // Валидация телефона
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      setValidationErrors({ ...validationErrors, phone: phoneError });
      return;
    }

    const userData = {
      name: formData.name,
      company_name: formData.company,
      email: formData.email,
      phone: formData.phone,
      id: 'user-' + Date.now()
    };

    setCurrentUser(userData);
    setIsLoggedIn(true);
    setActiveSection('main');
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentSection', 'main');
    localStorage.setItem('isNewUser', 'true'); // Флаг нового пользователя
    showNotificationMessage('Регистрация успешна! Добро пожаловать в Adapto!');
    setFormData({ email: '', password: '', name: '', company: '', phone: '', companyField: '' });
    setValidationErrors({});
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



  const handleBotCorrection = async () => {
    if (!botCorrection.trim()) return;
    
    try {
      // Убеждаемся, что пользователь существует
      const user = await getOrCreateUser();
      if (!user) {
        showNotificationMessage('Ошибка: не удалось создать пользователя');
        return;
      }
      
      const success = await botCorrectionsAPI.addCorrection(currentUser.id, botCorrection);
      if (success) {
        const newCorrection = {
          id: Date.now(),
          correction: botCorrection,
          created_at: new Date().toISOString()
        };
        setBotCorrections(prev => [...prev, newCorrection]);
        setBotCorrection('');
        showNotificationMessage('Корректировка добавлена!');
      } else {
        showNotificationMessage('Ошибка при добавлении корректировки');
      }
    } catch (error) {
      console.error('Error adding correction:', error);
      showNotificationMessage('Ошибка при добавлении корректировки');
    }
  };

  const removeCorrection = async (index) => {
    try {
      console.log('Removing correction at index:', index);
      const correctionToRemove = botCorrections[index];
      console.log('Correction to remove:', correctionToRemove);
      
      if (correctionToRemove && correctionToRemove.id) {
        console.log('Deleting correction with ID:', correctionToRemove.id);
        const success = await botCorrectionsAPI.deleteCorrection(correctionToRemove.id);
        console.log('Delete result:', success);
        
        if (success) {
          setBotCorrections(prev => prev.filter((_, i) => i !== index));
          showNotificationMessage('Корректировка удалена');
        } else {
          showNotificationMessage('Ошибка при удалении корректировки');
        }
      } else {
        console.log('No ID found, removing from local state only');
        // Если нет ID (локальная корректировка), просто удаляем из состояния
        setBotCorrections(prev => prev.filter((_, i) => i !== index));
        showNotificationMessage('Корректировка удалена');
      }
    } catch (error) {
      console.error('Error removing correction:', error);
      showNotificationMessage('Ошибка при удалении корректировки');
    }
  };

  const toggleCorrectionVisibility = (index) => {
    setHiddenCorrections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleAddCorrection = () => {
    if (newCorrectionText.trim()) {
      const newCorrection = {
        id: Date.now(), // временный ID
        correction: newCorrectionText.trim(),
        hidden: false
      };
      setBotCorrections(prev => [...prev, newCorrection]);
      setNewCorrectionText('');
      setShowAddCorrectionForm(false);
      showNotificationMessage('Корректировка добавлена');
    }
  };

  // Knowledge base functions
  const handleAddKnowledgeItem = async (itemToAdd = null) => {
    console.log('handleAddKnowledgeItem called with:', itemToAdd);
    const item = itemToAdd || newKnowledgeItem;
    
    if (!item.content.trim()) {
      console.log('Item content is empty, returning');
      return;
    }

    try {
      console.log('Getting or creating user...');
      // Убеждаемся, что пользователь существует
      const user = await getOrCreateUser();
      if (!user) {
        showNotificationMessage('Ошибка: не удалось создать пользователя');
        return;
      }
      
      const knowledgeItem = {
        ...item,
        status: 'Обработка',
        created_at: new Date().toISOString()
      };

      // Добавляем элемент в базу данных
      const createdItem = await knowledgeBase.addKnowledgeItem(currentUser.id, knowledgeItem);
      if (!createdItem) {
        showNotificationMessage('Ошибка при добавлении элемента');
        return;
      }

      // Добавляем в локальное состояние с правильным ID
      const newItem = {
        ...createdItem,
        id: createdItem.id
      };
      setKnowledgeItems(prev => [...prev, newItem]);
      
      // Сбрасываем состояние только если это не из попапа
      if (!itemToAdd) {
        setNewKnowledgeItem({ type: 'text', content: '' });
      }
      
      showNotificationMessage('Элемент добавлен в базу знаний! Статус: Обработка');

      // Запускаем обработку через GigaChat
      processContentWithGigaChat(createdItem.id, item.content, item.type, currentUser.id);
    } catch (error) {
      console.error('Error adding knowledge item:', error);
      showNotificationMessage('Ошибка при добавлении элемента');
    }
  };

  // Функция для обработки контента через GigaChat
  const processContentWithGigaChat = async (itemId, content, contentType, userId) => {
    try {
      console.log('Starting GigaChat processing for item:', itemId);
      
      // Показываем уведомление о начале обработки
      showNotificationMessage('Начинаем обработку контента через ИИ...');
      
      // Отправляем в GigaChat
      const result = await processContent(content, contentType, userId);
      
      if (result.success) {
        // Обновляем статус в базе данных
        const updatedItem = await knowledgeBase.updateKnowledgeItemStatus(itemId, result.status);
        
        if (updatedItem) {
          // Обновляем в локальном состоянии
          setKnowledgeItems(prev => prev.map(item => 
            item.id === itemId 
              ? { ...item, status: result.status }
              : item
          ));
          
          showNotificationMessage('Контент успешно обработан ИИ! Статус: Загружено');
        } else {
          showNotificationMessage('Ошибка при обновлении статуса');
        }
      } else {
        // Обновляем статус на "Ошибка"
        await knowledgeBase.updateKnowledgeItemStatus(itemId, 'Ошибка');
        setKnowledgeItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, status: 'Ошибка' }
            : item
        ));
        
        showNotificationMessage('Ошибка обработки контента ИИ');
      }
    } catch (error) {
      console.error('Error processing content with GigaChat:', error);
      
      // Обновляем статус на "Ошибка"
      await knowledgeBase.updateKnowledgeItemStatus(itemId, 'Ошибка');
      setKnowledgeItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, status: 'Ошибка' }
          : item
      ));
      
      showNotificationMessage('Ошибка обработки контента ИИ');
    }
  };

  const handleDeleteKnowledgeItem = async (id) => {
    try {
      const success = await knowledgeBase.deleteKnowledgeItem(id);
      if (success) {
        setKnowledgeItems(prev => prev.filter(item => item.id !== id));
        showNotificationMessage('Элемент удален из базы знаний');
      } else {
        showNotificationMessage('Ошибка при удалении элемента');
      }
    } catch (error) {
      console.error('Error deleting knowledge item:', error);
      showNotificationMessage('Ошибка при удалении элемента');
    }
  };

  const validateUrl = (url) => {
    if (!url.trim()) return 'Поле обязательно для заполнения';
    try {
      new URL(url);
      return '';
    } catch {
      return 'Введите корректный URL (например: https://example.com)';
    }
  };

  const handleSitePopupOpen = () => {
    setShowSitePopup(true);
    setSiteUrl('');
    setSelectedPages(['']);
    setSiteUrlError('');
    setSelectedPagesErrors(['']);
    setSitePopupTab('full');
  };

  const handleSitePopupClose = () => {
    setShowSitePopup(false);
    setSiteUrl('');
    setSelectedPages(['']);
    setSiteUrlError('');
    setSelectedPagesErrors(['']);
  };

  const handleAddPage = () => {
    setSelectedPages(prev => [...prev, '']);
    setSelectedPagesErrors(prev => [...prev, '']);
  };

  const handleRemovePage = (index) => {
    setSelectedPages(prev => prev.filter((_, i) => i !== index));
    setSelectedPagesErrors(prev => prev.filter((_, i) => i !== index));
  };

  const handlePageChange = (index, value) => {
    setSelectedPages(prev => prev.map((page, i) => i === index ? value : page));
    const error = validateUrl(value);
    setSelectedPagesErrors(prev => prev.map((err, i) => i === index ? error : err));
  };

  const handleSiteUrlChange = (value) => {
    setSiteUrl(value);
    const error = validateUrl(value);
    setSiteUrlError(error);
  };

  const handleSiteImport = async () => {
    console.log('handleSiteImport called');
    console.log('sitePopupTab:', sitePopupTab);
    console.log('siteUrl:', siteUrl);
    console.log('selectedPages:', selectedPages);
    
    if (sitePopupTab === 'full') {
      const error = validateUrl(siteUrl);
      if (error) {
        setSiteUrlError(error);
        return;
      }
      // Добавляем весь сайт
      const newItem = {
        type: 'site',
        content: siteUrl,
        status: 'Обработка'
      };
      console.log('Adding full site item:', newItem);
      await handleAddKnowledgeItem(newItem);
    } else {
      // Проверяем все страницы
      const errors = selectedPages.map(page => validateUrl(page));
      setSelectedPagesErrors(errors);
      
      if (errors.some(error => error)) return;
      
      const validPages = selectedPages.filter(page => page.trim());
      if (validPages.length === 0) return;
      
      for (const page of validPages) {
        const newItem = {
          type: 'site',
          content: page,
          status: 'Обработка'
        };
        console.log('Adding page item:', newItem);
        await handleAddKnowledgeItem(newItem);
      }
    }
    handleSitePopupClose();
  };

  // Feed popup functions
  const handleFeedPopupOpen = () => {
    setShowFeedPopup(true);
    setFeedUrl('');
    setFeedUrlError('');
  };

  const handleFeedPopupClose = () => {
    setShowFeedPopup(false);
    setFeedUrl('');
    setFeedUrlError('');
  };

  const handleFeedUrlChange = (value) => {
    setFeedUrl(value);
    const error = validateUrl(value);
    setFeedUrlError(error);
  };

  const handleFeedImport = async () => {
    const error = validateUrl(feedUrl);
    if (error) {
      setFeedUrlError(error);
      return;
    }
    
    const newItem = {
      type: 'feed',
      content: feedUrl,
      status: 'Обработка'
    };
    await handleAddKnowledgeItem(newItem);
    handleFeedPopupClose();
  };

  // File popup functions
  const handleFilePopupOpen = () => {
    setShowFilePopup(true);
    setSelectedFiles([]);
    setUploadedFiles([]);
  };

  const handleFilePopupClose = () => {
    setShowFilePopup(false);
    setSelectedFiles([]);
    setUploadedFiles([]);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Text popup functions
  const handleTextPopupOpen = () => {
    setShowTextPopup(true);
    setTextContent('');
    setTextContentError('');
  };

  const handleTextPopupClose = () => {
    setShowTextPopup(false);
    setTextContent('');
    setTextContentError('');
  };

  const handleTextContentChange = (value) => {
    setTextContent(value);
    if (!value.trim()) {
      setTextContentError('Поле обязательно для заполнения');
    } else {
      setTextContentError('');
    }
  };

  const handleTextImport = async () => {
    if (!textContent.trim()) {
      setTextContentError('Поле обязательно для заполнения');
      return;
    }
    
    const newItem = {
      type: 'text',
      content: textContent,
      status: 'Обработка'
    };
    await handleAddKnowledgeItem(newItem);
    handleTextPopupClose();
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

  // Функции для интеграций
  const handleInstallIntegration = (integration) => {
    if (integration.id === 'widget') {
      setShowWidgetConstructor(true);
    } else {
      setSelectedIntegration(integration);
      setShowIntegrationModal(true);
    }
  };

  const handleUninstallIntegration = (integration) => {
    setIntegrationToUninstall(integration);
    setShowUninstallModal(true);
  };

  const confirmUninstall = () => {
    if (integrationToUninstall) {
      setIntegrations(prev => prev.map(item => 
        item.id === integrationToUninstall.id 
          ? { ...item, installed: false }
          : item
      ));
      setShowUninstallModal(false);
      setIntegrationToUninstall(null);
      showNotificationMessage('Интеграция удалена');
    }
  };

  const handleIntegrationSuccess = (integrationId) => {
    setIntegrations(prev => prev.map(item => 
      item.id === integrationId 
        ? { ...item, installed: true }
        : item
    ));
    setShowIntegrationModal(false);
    setSelectedIntegration(null);
    showNotificationMessage('Интеграция успешно установлена!');
  };

  // Render functions
  const renderContent = () => {
    switch (activeSection) {
              case 'main':
  return (
            <div className="bg-white rounded-[20px] p-8" style={{ paddingTop: '180px', paddingBottom: '200px' }}>
              {/* Приветствие */}
              <div className="text-center mb-[30px]">
                <img src="/main-icon.svg" alt="Adapto" className="w-[53px] h-[53px] mx-auto mb-[30px]" />
                <h2 className="text-[30px] font-semibold text-[#070F1A] mb-4">
                  Добрый день, {currentUser?.name || 'Илья'}! С чего начнем?
                </h2>
                <p className="text-[#647491] text-[14px]">
                  Выберите действие для продолжения работы с платформой
                </p>
            </div>

                                    {/* Кнопки действий */}
            <div className="flex flex-col items-center space-y-[10px] justify-center">
              {/* Первый ряд: 3 кнопки */}
              <div className="flex space-x-[10px]">
                <div className="w-[168px] h-[40px] bg-[#096EFD]/3 border border-[#096EFD]/15 rounded-[90px] flex items-center cursor-pointer hover:bg-[#096EFD]/5 transition-colors" onClick={() => setActiveSection('statistics')} style={{ paddingLeft: '8px' }}>
                  <img src="/group-30.svg" alt="Сводка" className="w-6 h-6" style={{ marginRight: '8px' }} />
                  <span className="text-[14px] font-[400] text-[#070F1A]" style={{ letterSpacing: '-0.02em' }}>Смотреть сводку</span>
                </div>
                
                <div className="w-[203px] h-[40px] bg-[#FF900D]/3 border border-[#FF900D]/15 rounded-[90px] flex items-center cursor-pointer hover:bg-[#FF900D]/5 transition-colors" onClick={() => setActiveSection('knowledge')} style={{ paddingLeft: '8px' }}>
                  <img src="/group-31.svg" alt="База знаний" className="w-6 h-6" style={{ marginRight: '8px' }} />
                  <span className="text-[14px] font-[400] text-[#070F1A]" style={{ letterSpacing: '-0.02em' }}>Перейти в базу знаний</span>
                      </div>
                
                <div className="w-[157px] h-[40px] bg-[#169B46]/3 border border-[#169B46]/15 rounded-[90px] flex items-center cursor-pointer hover:bg-[#169B46]/5 transition-colors" onClick={() => setActiveSection('dialogs')} style={{ paddingLeft: '8px' }}>
                  <img src="/group-34.svg" alt="Диалоги" className="w-6 h-6" style={{ marginRight: '8px' }} />
                  <span className="text-[14px] font-[400] text-[#070F1A]" style={{ letterSpacing: '-0.02em' }}>Читать диалоги</span>
                    </div>
                  </div>
              
              {/* Второй ряд: 2 кнопки */}
              <div className="flex space-x-[10px]">
                <div className="w-[178px] h-[40px] bg-[#8B09FD]/3 border border-[#8B09FD]/15 rounded-[90px] flex items-center cursor-pointer hover:bg-[#8B09FD]/5 transition-colors" onClick={() => setActiveSection('model-settings')} style={{ paddingLeft: '8px' }}>
                  <img src="/group-33.svg" alt="Настройки модели" className="w-6 h-6" style={{ marginRight: '8px' }} />
                  <span className="text-[14px] font-[400] text-[#070F1A]" style={{ letterSpacing: '-0.02em' }}>Настройки модели</span>
                </div>
                
                <div className="w-[246px] h-[40px] bg-[#E53E3E]/3 border border-[#E53E3E]/15 rounded-[90px] flex items-center cursor-pointer hover:bg-[#E53E3E]/5 transition-colors" style={{ paddingLeft: '8px' }}>
                  <img src="/group-32.svg" alt="Поддержка" className="w-6 h-6" style={{ marginRight: '8px' }} />
                  <span className="text-[14px] font-[400] text-[#070F1A]" style={{ letterSpacing: '-0.02em' }}>Обратиться в тех.поддержку</span>
              </div>
              </div>
            </div>
                </div>
        );

      case 'my-solo':
        return (
          <div className="space-y-6">
            {/* Заголовок и описание */}
            <h1 className="text-[24px] font-[500] text-[#070F1A]">Мой Adapto</h1>
            <p className="text-[#647491] text-[14px]" style={{ marginTop: '12px' }}>
              Проверьте своего бота на знание скрипта и информации о вашей компании
            </p>

            {/* Два контейнера */}
            <div className="flex gap-[10px]">
              {/* Левый контейнер - поле для правок */}
              <div className="flex-1 bg-white rounded-[20px] flex flex-col" style={{ marginLeft: '-15px', marginRight: '10px', padding: '16px 16px 0px 16px' }}>
                {/* Предупреждение - показывается только если база знаний пуста */}
                {!hasKnowledgeBase && (
                  <div className="bg-[#FFF8F8] border border-[#FF0D0D]/15 rounded-[15px] p-[15px] mb-6">
                    <div className="flex items-start gap-[11px]">
                      <img src="/alarm.svg" alt="Предупреждение" className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-[#D12020] font-[500] text-base mb-[11px]">Предупреждение</h3>
                        <div className="flex justify-between items-center">
                          <p className="text-[#916464] text-sm flex-1" style={{ opacity: '100%' }}>
                            Вы не загрузили ничего в вашу базу знаний, ИИ-бот не готов к полноценной работе и будет отвечать некорректно!
                          </p>
                          <button className="text-[#FF0D0D] font-[500] text-sm px-4 h-[40px] bg-[#FFDBDB] rounded-[12px] hover:bg-[#FFE0E0] transition-colors flex items-center ml-4">
                            Перейти в базу знаний
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Секция с корректировками */}
                <div className="flex-1 space-y-3 mb-6">
                  {botCorrections.map((correction, index) => (
                    <div key={index} className="flex items-center">
                      {/* Левая часть - номер */}
                      <div className="w-[40px] h-[40px] border border-[#070F1A]/10 rounded-[10px] flex items-center justify-center">
                        <span className="text-[#0084FF] font-semibold text-[14px]">{index + 1}</span>
                      </div>
                      {/* Отступ */}
                      <div className="w-[10px]"></div>
                      {/* Центральная часть - описание */}
                      <div className="flex-1 h-[40px] bg-[#F3F5F7] rounded-[10px] flex items-center px-[10px]">
                        <span className="text-[#070F1A] font-medium text-[14px] opacity-90">{correction.correction || correction}</span>
                      </div>
                      {/* Отступ */}
                      <div className="w-[10px]"></div>
                      {/* Правая часть - кнопка удаления */}
                      <div className="w-[40px] h-[40px] border border-[#070F1A]/10 rounded-[10px] flex items-center justify-center">
                        <button 
                          onClick={() => removeCorrection(index)}
                          className="w-[16px] h-[16px] flex items-center justify-center"
                        >
                          <img src="/trash-icon.svg" alt="Удалить" className="w-[16px] h-[16px] text-red-500" style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' }} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

                {/* Поле для корректировок - внизу */}
                <div className="relative">
                  <textarea
                    value={botCorrection}
                    onChange={(e) => setBotCorrection(e.target.value)}
                    placeholder="Если вы увидели ошибку в ответах – напишите правильный вариант здесь"
                    className="w-full h-[48px] border border-gray-300 rounded-[90px] px-[15px] py-[12px] text-[#647491] text-[14px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 pr-[60px]"
                  />

                  <img 
                    src="/send-button.svg" 
                    alt="Отправить" 
                    className="absolute top-[5px] right-[5px] w-[38px] h-[38px] cursor-pointer" 
                    onClick={handleBotCorrection}
                  />
  </div>
              </div>

              {/* Правый контейнер - диалоговое окно */}
              <div className="w-[400px] bg-[#070F1A] rounded-[20px] p-4 flex flex-col" style={{ marginLeft: '15px', marginRight: '0px', height: '583px', flexShrink: 0 }}>
                {/* Заголовок "Тестирование Адапто" */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <img src="/logo-testing.svg" alt="Тест" className="w-5 h-5" />
                    <h2 className="text-[18px] font-[500] text-white">Тестирование Адапто</h2>
  </div>
                  <button 
                    onClick={async () => {
                      if (currentUser?.id) {
                        try {
                          await supabaseClient.chatHistory.clearChatHistory(currentUser.id);
                          setChatHistory([
                            { type: 'assistant', text: 'Привет! Я ваш ИИ-ассистент Adapto. Как дела?' }
                          ]);
                          showNotificationMessage('История чата очищена');
                        } catch (error) {
                          console.error('Error clearing chat history:', error);
                          showNotificationMessage('Ошибка при очистке истории');
                        }
                      }
                    }}
                    className="text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
                    title="Очистить историю"
                  >
                    Очистить
                  </button>
                </div>

                {/* Диалог */}
                <div className="flex-1 flex flex-col">
                  {/* История диалога */}
                  <div className="flex-1 space-y-4 overflow-y-auto mb-4">
                    {/* Плашка "Сегодня" */}
                    <div className="text-center">
                      <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">Сегодня</span>
                    </div>
                    
                        {chatHistory.map((message, index) => (
                      <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}>
                        {message.type === 'assistant' && (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #52AEFF 0%, #096EFD 100%)' }}>
                            <span className="text-white text-xs font-medium">AI</span>
  </div>
                        )}
                        <div className={`max-w-[70%] p-3 text-[14px] ${
                              message.type === 'user' 
                            ? 'bg-blue-600 text-white rounded-[20px] rounded-br-[4px]' 
                            : 'bg-[#DBE9FF] text-[#070F1A] rounded-[20px] rounded-bl-[4px]'
                            }`}>
                              {message.text}
                            </div>
                        {message.type === 'user' && (
                          <div className="w-8 h-8 bg-[#5BE5F7] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-medium">Я</span>
                          </div>
                        )}
                          </div>
                        ))}
                      </div>
                  
                  {/* Поле ввода */}
                  <div className="relative">
  <input 
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Нажмите, чтобы печатать"
                      className="w-full h-[48px] px-4 py-2 rounded-[90px] focus:outline-none focus:ring-2 focus:ring-blue-500 pr-[50px]"
                      style={{ 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        backgroundColor: '#070F1A',
                        color: '#647491',
                        fontSize: '14px'
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <img 
                      src="/send-button2.svg" 
                      alt="Отправить" 
                      className="absolute top-[5px] right-[5px] w-[38px] h-[38px] cursor-pointer" 
                      onClick={handleSendMessage}
                    />
                    </div>
                  </div>
            </div>
          </div>
          </div>
        );

      case 'knowledge':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-[24px] font-[500]">База знаний</h1>
            </div>

            {/* Таблица с данными или пустое состояние */}
            {knowledgeItems.length > 0 ? (
              <div className="bg-white rounded-[20px] border border-[#070F1A]/10 overflow-hidden">
                {/* Заголовки таблицы */}
                <div className="grid grid-cols-4 gap-4 p-4 border-b border-[#070F1A]/10 bg-gray-50">
                  <div className="font-[400] text-[14px] text-[#647491]">Название</div>
                  <div className="font-[400] text-[14px] text-[#647491] text-center">Ресурс</div>
                  <div className="font-[400] text-[14px] text-[#647491]">Статус</div>
                  <div className="font-[400] text-[14px] text-[#647491]"></div>
                </div>

                {/* Строки таблицы */}
                <div className="divide-y divide-[#070F1A]/10">
                  {knowledgeItems.map((item, index) => (
                    <div key={item.id || index} className="grid grid-cols-4 gap-4 p-4 hover:bg-gray-50 transition-colors">
                      {/* Название */}
                      <div className="text-[#070F1A] text-sm truncate font-[500]">
                        {item.content.length > 50 ? `${item.content.substring(0, 50)}...` : item.content}
                      </div>
                      
                      {/* Ресурс */}
                      <div className="flex items-center justify-center">
                        <div className="h-[24px] px-2 rounded-[7px] bg-gray-100 flex items-center gap-[2px]">
                          <img 
                            src={
                              item.type === 'site' ? '/global2.svg' :
                              item.type === 'feed' ? '/document-code.svg' :
                              item.type === 'text' ? '/edit-2.svg' :
                              '/document-copy.svg'
                            }
                            alt={item.type}
                            className="w-[10px] h-[10px]"
                          />
                          <span className="text-[12px] font-[400] text-[#070F1A]">
                            {item.type === 'site' && 'Сайт'}
                            {item.type === 'feed' && 'Товарный фид'}
                            {item.type === 'text' && 'Текст'}
                            {item.type === 'file' && 'Файл'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Статус */}
                      <div className="flex items-center">
                        <div className={`h-[24px] px-3 rounded-[50px] flex items-center ${
                          item.status === 'Загружено' ? 'bg-[#36C76A]/15 text-[#36C76A]' :
                          item.status === 'Обработка' ? 'bg-[#096EFD]/15 text-[#096EFD]' :
                          'bg-[#D12020]/15 text-[#D12020]'
                        }`}>
                          <span className="text-[12px] font-[400]">
                            {item.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Кнопка действий */}
                      <div className="flex justify-end">
                        <div className="relative dropdown-menu">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedKnowledgeItem(selectedKnowledgeItem?.id === item.id ? null : item);
                            }}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                          
                          {selectedKnowledgeItem?.id === item.id && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-[10px] shadow-lg z-10 min-w-[120px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteKnowledgeItem(item.id || index);
                                  setSelectedKnowledgeItem(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-[10px] transition-colors flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Удалить
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Пустое состояние */
              <div className="bg-white rounded-[20px] border border-[#070F1A]/10 p-8 text-center">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-medium text-[#070F1A] mb-2">База знаний пока пуста</h3>
                  <p className="text-sm text-gray-500 mb-6">Добавьте первый ресурс, чтобы начать работу с Adapto</p>
                </div>
              </div>
            )}

            {/* Ресурсы для добавления */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginLeft: '1px', marginRight: '1px' }}>
              {/* Веб-сайт */}
              <div 
                className={`border border-[#070F1A]/10 rounded-[15px] group hover:border-[#096EFD]/50 hover:-translate-y-[10px] transition-all duration-300 cursor-pointer overflow-hidden ${sidebarCollapsed ? 'h-[280px]' : 'h-[255px]'}`}
                onClick={handleSitePopupOpen}
              >
                <div className="w-full h-full flex flex-col">
                                    <div className="w-full flex-shrink-0" style={{ borderRadius: '15px 15px 0 0' }}>
                    <img src="/Frame-18.svg" alt="Веб-сайт" className="w-[101%] h-auto" />
  </div>
                  <div className="flex-1 p-[20px]">
                    <h3 className="text-[16px] font-medium text-[#070F1A] mb-1">Веб-сайт</h3>
                    <p className="text-[12px] text-[#647491]">Предоставьте ссылку на сайт, чтобы обеспечить ИИ знаниями</p>
                  </div>
                </div>
              </div>

              {/* Товарный фид */}
              <div 
                className={`border border-[#070F1A]/10 rounded-[15px] group hover:border-[#096EFD]/50 hover:-translate-y-[10px] transition-all duration-300 cursor-pointer overflow-hidden ${sidebarCollapsed ? 'h-[280px]' : 'h-[255px]'}`}
                onClick={handleFeedPopupOpen}
              >
                <div className="w-full h-full flex flex-col">
                  <div className="w-full flex-shrink-0" style={{ borderRadius: '15px 15px 0 0' }}>
                    <img src="/Frame-18-1.svg" alt="Товарный фид" className="w-[101%] h-auto" />
                  </div>
                  <div className="flex-1 p-[20px]">
                    <h3 className="text-[16px] font-medium text-[#070F1A] mb-1">Товарный фид</h3>
                    <p className="text-[12px] text-[#647491]">Вставьте ссылку на товарный фид, чтобы ИИ изучил ваш каталог</p>
                  </div>
                </div>
              </div>

              {/* Файл */}
              <div 
                className={`border border-[#070F1A]/10 rounded-[15px] group hover:border-[#096EFD]/50 hover:-translate-y-[10px] transition-all duration-300 cursor-pointer overflow-hidden ${sidebarCollapsed ? 'h-[280px]' : 'h-[255px]'}`}
                onClick={handleFilePopupOpen}
              >
                <div className="w-full h-full flex flex-col">
                  <div className="w-full flex-shrink-0" style={{ borderRadius: '15px 15px 0 0' }}>
                    <img src="/Frame-18-2.svg" alt="Файл" className="w-[101%] h-auto" />
                  </div>
                  <div className="flex-1 p-[20px]">
                    <h3 className="text-[16px] font-medium text-[#070F1A] mb-1">Файл</h3>
                    <p className="text-[12px] text-[#647491]">Импортируйте знания из документов или файлов для обучения ИИ</p>
                  </div>
                </div>
              </div>

              {/* Текст */}
              <div 
                className={`border border-[#070F1A]/10 rounded-[15px] group hover:border-[#096EFD]/50 hover:-translate-y-[10px] transition-all duration-300 cursor-pointer overflow-hidden ${sidebarCollapsed ? 'h-[280px]' : 'h-[255px]'}`}
                onClick={handleTextPopupOpen}
              >
                <div className="w-full h-full flex flex-col">
                  <div className="w-full flex-shrink-0" style={{ borderRadius: '15px 15px 0 0' }}>
                    <img src="/Frame-18-3.svg" alt="Текст" className="w-[101%] h-auto" />
                  </div>
                  <div className="flex-1 p-[20px]">
                    <h3 className="text-[16px] font-medium text-[#070F1A] mb-1">Текст</h3>
                    <p className="text-[12px] text-[#647491]">Напишите текстом информацию, которую важно знать ИИ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'statistics':
        return (
          <div className="space-y-6">
            {/* Заголовок с календарем и экспортом */}
            <div className="flex justify-between items-center">
            <h1 className="text-[24px] font-[500]">Статистика</h1>
              <div className="flex gap-3">
                {/* Простой календарь */}
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      console.log('Calendar button clicked');
                      setShowCalendar(!showCalendar);
                    }}
                    className="h-[34px] bg-[#F3F5F7] border border-[#F3F5F7] text-[#647491] hover:bg-[#E5E7EB] rounded-[7px] text-[13px] font-normal"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {dateRange.start && dateRange.end 
                      ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
                      : 'Выберите период'
                    }
                  </Button>
                  
                  {showCalendar && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-[15px] shadow-lg z-50 w-[400px]">
                      <div className="p-4">
                        <h4 className="font-medium text-sm mb-4">Выберите период</h4>
                        
                        {/* Быстрые опции */}
                        <div className="mb-4">
                          <div className="grid grid-cols-2 gap-2">
                            <button 
                              className={`px-3 py-2 text-xs rounded-[90px] text-left transition-colors ${
                                activeQuickSelect === 'today' ? 'bg-[#0084FF] text-white' : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                              onClick={() => {
                                const today = new Date();
                                setDateRange({ start: today, end: today });
                                setActiveQuickSelect('today');
                              }}
                            >
                              Сегодня
                            </button>
                            <button 
                              className={`px-3 py-2 text-xs rounded-[90px] text-left transition-colors ${
                                activeQuickSelect === 'yesterday' ? 'bg-[#0084FF] text-white' : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                              onClick={() => {
                                const yesterday = new Date();
                                yesterday.setDate(yesterday.getDate() - 1);
                                setDateRange({ start: yesterday, end: yesterday });
                                setActiveQuickSelect('yesterday');
                              }}
                            >
                              Вчера
                            </button>
                            <button 
                              className={`px-3 py-2 text-xs rounded-[90px] text-left transition-colors ${
                                activeQuickSelect === 'last7days' ? 'bg-[#0084FF] text-white' : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                              onClick={() => {
                                const today = new Date();
                                const weekAgo = new Date();
                                weekAgo.setDate(today.getDate() - 6);
                                setDateRange({ start: weekAgo, end: today });
                                setActiveQuickSelect('last7days');
                              }}
                            >
                              7 дней
                            </button>
                            <button 
                              className={`px-3 py-2 text-xs rounded-[90px] text-left transition-colors ${
                                activeQuickSelect === 'thisMonth' ? 'bg-[#0084FF] text-white' : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                              onClick={() => {
                                const today = new Date();
                                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                                setDateRange({ start: firstDay, end: lastDay });
                                setActiveQuickSelect('thisMonth');
                              }}
                            >
                              Этот месяц
                            </button>
                            <button 
                              className={`px-3 py-2 text-xs rounded-[90px] text-left transition-colors ${
                                activeQuickSelect === 'last30days' ? 'bg-[#0084FF] text-white' : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                              onClick={() => {
                                const today = new Date();
                                const monthAgo = new Date();
                                monthAgo.setDate(today.getDate() - 29);
                                setDateRange({ start: monthAgo, end: today });
                                setActiveQuickSelect('last30days');
                              }}
                            >
                              30 дней
                            </button>
                            <button 
                              className={`px-3 py-2 text-xs rounded-[90px] text-left transition-colors ${
                                activeQuickSelect === 'last90days' ? 'bg-[#0084FF] text-white' : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                              onClick={() => {
                                const today = new Date();
                                const threeMonthsAgo = new Date();
                                threeMonthsAgo.setDate(today.getDate() - 89);
                                setDateRange({ start: threeMonthsAgo, end: today });
                                setActiveQuickSelect('last90days');
                              }}
                            >
                              90 дней
                            </button>
                          </div>
                        </div>
                        
                        {/* Простой календарь */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <button 
                              onClick={() => {
                                setCurrentMonth(prev => {
                                  const newMonth = new Date(prev);
                                  newMonth.setMonth(newMonth.getMonth() - 1);
                                  return newMonth;
                                });
                              }}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              ←
                            </button>
                            <span className="text-sm font-medium">
                              {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                            </span>
                            <button 
                              onClick={() => {
                                setCurrentMonth(prev => {
                                  const newMonth = new Date(prev);
                                  newMonth.setMonth(newMonth.getMonth() + 1);
                                  return newMonth;
                                });
                              }}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              →
                            </button>
                          </div>
                          
                          {/* Дни недели */}
                          <div className="grid grid-cols-7 gap-1 mb-1">
                            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                              <div key={day} className="text-xs text-gray-500 text-center p-1">
                                {day}
                              </div>
                            ))}
                          </div>
                          
                          {/* Сетка календаря */}
                          <div className="grid grid-cols-7 gap-1">
                            {(() => {
                              const days = [];
                              const year = currentMonth.getFullYear();
                              const month = currentMonth.getMonth();
                              const firstDay = new Date(year, month, 1);
                              const lastDay = new Date(year, month + 1, 0);
                              const firstDayOfWeek = firstDay.getDay();
                              const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
                              
                              // Добавляем пустые ячейки в начале
                              for (let i = 0; i < startOffset; i++) {
                                days.push(null);
                              }
                              
                              // Добавляем дни месяца
                              for (let day = 1; day <= lastDay.getDate(); day++) {
                                days.push(new Date(year, month, day));
                              }
                              
                              // Добавляем пустые ячейки в конце до 42 ячеек
                              while (days.length < 42) {
                                days.push(null);
                              }
                              
                              return days.map((date, index) => {
                                if (!date) {
                                  return <div key={index} className="w-8 h-8"></div>;
                                }
                                
                                const today = new Date();
                                const isToday = date.toDateString() === today.toDateString();
                                const isSelected = dateRange.start && date.toDateString() === dateRange.start.toDateString();
                                const isInRange = dateRange.start && dateRange.end && 
                                  date >= dateRange.start && date <= dateRange.end;
                                
                                let className = "w-8 h-8 rounded hover:bg-gray-100 text-center text-xs cursor-pointer";
                                
                                if (isSelected) {
                                  className += " bg-[#0084FF] text-white";
                                } else if (isInRange) {
                                  className += " bg-[#0084FF]/20 text-[#0084FF]";
                                } else if (isToday) {
                                  className += " bg-gray-200 text-gray-800";
                                }
                                
                                return (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      if (dateRange.start && !dateRange.end) {
                                        setDateRange(prev => ({ ...prev, end: date }));
                                      } else {
                                        setDateRange({ start: date, end: null });
                                      }
                                      setActiveQuickSelect(null);
                                    }}
                                    className={className}
                                  >
                                    {date.getDate()}
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        </div>
                        
                        {/* Ручной ввод дат */}
                        <div className="mb-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <input
                                type="date"
                                value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  const newDate = new Date(e.target.value);
                                  setDateRange(prev => ({ ...prev, start: newDate }));
                                  setActiveQuickSelect(null);
                                }}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                placeholder="От"
                              />
                            </div>
                            <div>
                              <input
                                type="date"
                                value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  const newDate = new Date(e.target.value);
                                  setDateRange(prev => ({ ...prev, end: newDate }));
                                  setActiveQuickSelect(null);
                                }}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                placeholder="До"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => setShowCalendar(false)}
                            className="h-[40px] bg-[#0084FF] text-white hover:bg-[#0073E6] rounded-[10px] text-[14px] font-[500]"
                          >
                            Применить
                          </Button>
                                                      <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setDateRange({ start: null, end: null });
                                setActiveQuickSelect(null);
                                setShowCalendar(false);
                              }}
                              className="h-[40px] bg-[#F3F5F7] border-[#F3F5F7] text-gray-700 hover:bg-[#E5E7EB] rounded-[10px] text-[14px] font-[500]"
                            >
                              Сбросить
                            </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Экспорт */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV()}
                    className="h-[34px] bg-[#F3F5F7] border border-[#F3F5F7] text-[#647491] hover:bg-[#E5E7EB] rounded-[10px] text-[13px] font-normal"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToXLS()}
                    className="h-[34px] bg-[#F3F5F7] border border-[#F3F5F7] text-[#647491] hover:bg-[#E5E7EB] rounded-[10px] text-[13px] font-normal"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    XLS
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Табы статистики */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <div className="flex-1">
                  <button
                    onClick={() => setActiveStatisticsTab('general')}
                    className={`w-full py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                      activeStatisticsTab === 'general'
                        ? 'border-[#0084FF] text-[#0084FF]'
                        : 'border-transparent text-[#647491] hover:text-[#070F1A]'
                    }`}
                  >
                    Общие метрики
                  </button>
                    </div>
                <div className="flex-1">
                  <button
                    onClick={() => setActiveStatisticsTab('conversion')}
                    className={`w-full py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                      activeStatisticsTab === 'conversion'
                        ? 'border-[#0084FF] text-[#0084FF]'
                        : 'border-transparent text-[#647491] hover:text-[#070F1A]'
                    }`}
                  >
                    Метрики конверсий
                  </button>
                  </div>
                <div className="flex-1">
                  <button
                    onClick={() => setActiveStatisticsTab('technical')}
                    className={`w-full py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                      activeStatisticsTab === 'technical'
                        ? 'border-[#0084FF] text-[#0084FF]'
                        : 'border-transparent text-[#647491] hover:text-[#070F1A]'
                    }`}
                  >
                    Технические метрики
                  </button>
                  </div>
                </div>
              </div>

            {/* Контент табов */}
            {activeStatisticsTab === 'general' && (
              <div className="space-y-6">
                {/* Общие метрики */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style={{ paddingTop: '12px' }}>
                  <Card className="shadow-none hover:border-[#096EFD] hover:border-opacity-50 hover:-translate-y-[10px] transition-all duration-200">
                    <CardContent className="p-[15px] h-[130px] flex flex-col justify-between" style={{ paddingTop: '13px' }}>
                      <div className="flex items-center gap-2" style={{ marginTop: '13px !important', height: '21px !important' }}>
                        <button 
                          onClick={() => openMetricInfo({
                            title: 'Количество открытий виджета',
                            description: 'Общее количество раз, когда пользователи открывали виджет на вашем сайте.',
                            formula: 'Сумма всех открытий виджета за период',
                            explanation: 'Что отслеживается: Эта метрика показывает, сколько раз пользователи взаимодействовали с виджетом, открывая его для начала разговора.\n\nКак рассчитывается: Мы подсчитываем каждое открытие виджета, когда пользователь кликает на кнопку виджета или иным образом активирует его.\n\nПочему это важно: Высокое количество открытий указывает на интерес пользователей к вашему сервису и эффективность размещения виджета на сайте.'
                          })}
                          className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                          </svg>
                        </button>
                        <p className="text-[14px] font-[500] text-[#647491]">Кол-во открытий виджета</p>
                    </div>
                                              <div className="flex items-end">
                          <p className="text-[1.8rem] font-[500] text-[#070F1A]" style={{ height: '33px' }}>1.9291</p>
                          {generateTrendIndicator('up', '+12%')}
                  </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none hover:border-[#096EFD] hover:border-opacity-50 hover:-translate-y-[10px] transition-all duration-200">
                    <CardContent className="p-[15px] h-[130px] flex flex-col justify-between" style={{ paddingTop: '13px' }}>
                      <div className="flex items-center gap-2" style={{ marginTop: '13px !important', height: '21px !important' }}>
                        <button 
                          onClick={() => openMetricInfo({
                            title: 'Количество диалогов',
                            description: 'Общее количество уникальных разговоров между пользователями и ИИ-агентом.',
                            formula: 'Количество уникальных разговоров за период',
                            explanation: 'Что отслеживается: Эта метрика показывает общее количество уникальных разговоров, которые были начаты пользователями с ИИ-агентом.\n\nКак рассчитывается: Мы подсчитываем каждый уникальный разговор, независимо от количества сообщений в нем. Один пользователь может иметь несколько диалогов в разные дни.\n\nПочему это важно: Это базовый показатель активности вашего ИИ-агента и интереса пользователей к вашему сервису.'
                          })}
                          className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                          </svg>
                        </button>
                        <p className="text-[14px] font-[500] text-[#647491]">Кол-во диалогов</p>
                  </div>
                                              <div className="flex items-end">
                          <p className="text-[1.8rem] font-[500] text-[#070F1A]" style={{ height: '33px' }}>567</p>
                          {generateTrendIndicator('up', '+8%')}
                </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none hover:border-[#096EFD] hover:border-opacity-50 hover:-translate-y-[6px] transition-all duration-200">
                    <CardContent className="p-[15px] h-[130px] flex flex-col justify-between" style={{ paddingTop: '13px' }}>
                      <div className="flex items-center gap-2" style={{ marginTop: '13px !important', height: '21px !important' }}>
                        <button 
                          onClick={() => openMetricInfo({
                            title: 'Количество сообщений',
                            description: 'Общее количество всех сообщений, отправленных в разговорах между пользователями и ИИ-агентом.',
                            formula: 'Сумма всех сообщений пользователей и ИИ-агента за период',
                            explanation: 'Что отслеживается: Эта метрика показывает общее количество сообщений, включая как сообщения от пользователей, так и ответы ИИ-агента во всех разговорах.\n\nКак рассчитывается: Мы суммируем все сообщения, отправленные в системе за выбранный период времени, независимо от того, кто их отправил.\n\nПочему это важно: Это показатель активности и вовлеченности в разговорах. Больше сообщений может указывать на более глубокие и детальные обсуждения.'
                          })}
                          className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                          </svg>
                        </button>
                        <p className="text-[14px] font-[500] text-[#647491]">Кол-во сообщений</p>
              </div>
                                              <div className="flex items-end">
                          <p className="text-[1.8rem] font-[500] text-[#070F1A]" style={{ height: '33px' }}>2.890</p>
                          {generateTrendIndicator('up', '+15%')}
                        </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none hover:border-[#096EFD] hover:border-opacity-50 hover:-translate-y-[6px] transition-all duration-200">
                    <CardContent className="p-[15px] h-[130px] flex flex-col justify-between" style={{ paddingTop: '13px' }}>
                      <div className="flex items-center gap-2" style={{ marginTop: '13px !important', height: '21px !important' }}>
                        <button 
                          onClick={() => openMetricInfo({
                            title: 'Среднее количество сообщений на диалог',
                            description: 'Среднее количество сообщений в одном разговоре между пользователем и ИИ-агентом.',
                            formula: 'Общее количество сообщений / Количество диалогов',
                            explanation: 'Что отслеживается: Эта метрика показывает, сколько сообщений в среднем содержится в одном разговоре, что является показателем глубины взаимодействия.\n\nКак рассчитывается: Мы делим общее количество сообщений на количество диалогов за выбранный период.\n\nПочему это важно: Высокое среднее количество сообщений может указывать на более сложные вопросы, требующие детального обсуждения, или на высокую вовлеченность пользователей.'
                          })}
                          className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                          </svg>
                        </button>
                        <p className="text-[14px] font-[500] text-[#647491]">Ср. кол-во смс на диалог</p>
                    </div>
                                              <div className="flex items-end">
                          <p className="text-[1.8rem] font-[500] text-[#070F1A]" style={{ height: '33px' }}>5.1</p>
                          {generateTrendIndicator('up', '+0.3')}
                  </div>
                    </CardContent>
                  </Card>
                  </div>

                {/* График активности */}
                <Card className="shadow-none hover:border-[#096EFD] hover:border-opacity-50 hover:-translate-y-[6px] transition-all duration-200">
                  <CardHeader>
                    <h3 style={{fontWeight: 500}} className="text-lg font-semibold leading-none tracking-tight text-[18px] font-[500] text-[#070F1A]">Активность по часам</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      График активности
                </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeStatisticsTab === 'conversion' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ paddingTop: '12px' }}>
                <Card className="shadow-none hover:border-[#096EFD] hover:border-opacity-50 hover:-translate-y-[6px] transition-all duration-200">
                  <CardContent className="p-[15px] h-[170px] flex flex-col justify-between" style={{ paddingTop: '13px' }}>
                    <div className="flex items-center gap-2" style={{ marginTop: '13px !important', height: '21px !important' }}>
                      <button 
                        onClick={() => openMetricInfo({
                          title: 'Конверсия в основную цель',
                          description: 'Эта метрика измеряет процент проанализированных разговоров, которые успешно достигли вашей основной бизнес-цели.',
                          formula: '0 (converted chats) / 0 (total analyzed chats) × 100% = 0%',
                          explanation: 'Что отслеживается: Эта метрика показывает, насколько эффективен ваш ИИ в достижении поставленной вами основной цели (например, запись на встречу, совершение покупки или генерация квалифицированных лидов).\n\nКак рассчитывается: Мы берем все разговоры, которые были проанализированы нашей системой, и подсчитываем, сколько из них привели к успешной конверсии. В расчет включаются только разговоры с данными аналитики.\n\nПочему это важно: Более высокий процент конверсии указывает на то, что ваш ИИ успешно направляет клиентов через ваш процесс продаж и достигает ваших бизнес-целей.'
                        })}
                        className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                      </button>
                      <p className="text-[14px] font-[500] text-[#647491]">Конверсия в основную цель</p>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-end">
                        <p className="text-[1.8rem] font-[500] text-[#070F1A]" style={{ height: '33px' }}>23.4%</p>
                        {generateTrendIndicator('up', '+5.2%')}
                  </div>
                                              <div style={{ marginTop: '8px' }}>
                          {generateProgressBar(23.4, 100, false, 'blue')}
                  </div>
                </div>
                  </CardContent>
                </Card>

                <Card className="shadow-none hover:border-[#096EFD] hover:border-opacity-50 hover:-translate-y-[6px] transition-all duration-200">
                  <CardContent className="p-[15px] h-[170px] flex flex-col justify-between" style={{ paddingTop: '13px' }}>
                    <div className="flex items-center gap-2" style={{ marginTop: '13px !important', height: '21px !important' }}>
                      <button 
                        onClick={() => openMetricInfo({
                          title: 'Процент отказов',
                          description: 'Эта метрика отслеживает процент лидов, которые были закрыты без достижения определенного результата из-за отсутствия ответа клиента.',
                          formula: '0 (inconclusive leads) / 0 (total analyzed chats) × 100% = 0%',
                          explanation: 'Что отслеживается: Это измеряет разговоры, где ИИ пытался достичь основной цели, но клиент перестал отвечать до завершения.\n\nКак рассчитывается: Мы определяем разговоры, где ИИ добился прогресса к цели, но клиент стал неотзывчивым, затем вычисляем процент таких случаев.\n\nПочему это важно: Высокие проценты могут указывать на проблемы с таймингом, коммуникацией или необходимость корректировки стратегий повторного привлечения клиентов.'
                        })}
                        className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                      </button>
                      <p className="text-[14px] font-[500] text-[#647491]">Процент отказов</p>
              </div>
                    <div className="flex flex-col">
                                              <div className="flex items-end">
                          <p className="text-[1.8rem] font-[500] text-[#070F1A]" style={{ height: '33px' }}>12.8%</p>
                          {generateTrendIndicator('down', '-2.1%', true)}
                        </div>
                                              <div style={{ marginTop: '8px' }}>
                          {generateProgressBar(12.8, 100, false, 'purple')}
                        </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-none hover:border-[#096EFD] hover:border-opacity-50 hover:-translate-y-[6px] transition-all duration-200">
                  <CardContent className="p-[15px] h-[170px] flex flex-col justify-between" style={{ paddingTop: '13px' }}>
                    <div className="flex items-center gap-2" style={{ marginTop: '13px !important', height: '21px !important' }}>
                      <button 
                        onClick={() => openMetricInfo({
                          title: 'Вовлечение клиента',
                          description: 'Эта метрика показывает среднее количество сообщений, отправляемых клиентами в каждом разговоре.',
                          formula: '0 (total messages) / 0 (total chats) = 0',
                          explanation: 'Что отслеживается: Эта метрика отслеживает, сколько сообщений клиенты обычно отправляют во время разговора, исключая ответы ИИ.\n\nКак рассчитывается: Мы делим общее количество сообщений клиентов во всех разговорах на общее количество разговоров в выбранном периоде времени.\n\nПочему это важно: Это помогает понять уровень вовлеченности клиентов и сложность разговора с точки зрения клиента. Больше сообщений от клиентов может указывать на более высокую вовлеченность или более сложные потребности.'
                        })}
                        className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                      </button>
                      <p className="text-[14px] font-[500] text-[#647491]">Вовлечение клиента</p>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-end">
                        <p className="text-[1.8rem] font-[500] text-[#070F1A]" style={{ height: '33px' }}>78.5%</p>
                        {generateTrendIndicator('up', '+8.7%')}
                  </div>
                                              <div style={{ marginTop: '8px' }}>
                          {generateProgressBar(78.5, 100, false, 'green')}
                  </div>
                </div>
                  </CardContent>
                </Card>

                <Card className="shadow-none hover:border-[#096EFD] hover:border-opacity-50 hover:-translate-y-[6px] transition-all duration-200">
                  <CardContent className="p-[15px] h-[170px] flex flex-col justify-between" style={{ paddingTop: '13px' }}>
                    <div className="flex items-center gap-2" style={{ marginTop: '13px !important', height: '21px !important' }}>
                      <button 
                        onClick={() => openMetricInfo({
                          title: 'Количество решенных вопросов',
                          description: 'Количество разговоров, в которых ответил агент Fin AI, а клиент дал положительный отзыв или не запросил разговор с коллегой.',
                          formula: 'Количество успешно завершенных разговоров',
                          explanation: 'Что отслеживается: Эта метрика показывает количество разговоров, где ИИ-агент успешно предоставил ответ, и клиент либо дал положительный отзыв, либо не запросил помощь человека.\n\nКак рассчитывается: Мы подсчитываем все разговоры, где последний ответ был от ИИ-агента, и клиент не запросил передачу разговора человеку.\n\nПочему это важно: Высокое количество решенных вопросов указывает на эффективность ИИ-агента и снижает нагрузку на человеческую поддержку.'
                        })}
                        className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                      </button>
                      <p className="text-[14px] font-[500] text-[#647491]">Кол-во решенных вопросов</p>
              </div>
                                          <div className="flex items-end">
                        <p className="text-[1.8rem] font-[500] text-[#070F1A]" style={{ height: '33px' }}>456</p>
                        {generateTrendIndicator('up', '+23')}
                      </div>
                  </CardContent>
                </Card>

                                 <Card className="shadow-none hover:border-[#096EFD] hover:border-opacity-50 hover:-translate-y-[6px] transition-all duration-200">
                   <CardContent className="p-[15px] h-[170px] flex flex-col justify-between" style={{ paddingTop: '13px' }}>
                     <div className="flex items-center gap-2" style={{ marginTop: '13px !important', height: '21px !important' }}>
                       <button 
                         onClick={() => openMetricInfo({
                           title: 'Коэффициент отклонений',
                           description: 'Эта метрика показывает процент разговоров, где клиенты никогда не отвечали на первоначальные сообщения ИИ.',
                           formula: '0 (no response chats) / 0 (total chats) × 100% = 0%',
                           explanation: 'Что отслеживается: Это отслеживает разговоры, где ИИ отправил сообщения, но не получил ответа от клиента вообще.\n\nКак рассчитывается: Мы подсчитываем разговоры, где ИИ отправил хотя бы одно сообщение, но клиент никогда не ответил, затем вычисляем процент от общих разговоров.\n\nПочему это важно: Высокие проценты могут указывать на проблемы с первоначальными сообщениями, таргетингом или стратегиями привлечения клиентов, которые требуют внимания.'
                         })}
                         className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                       >
                         <svg fill="currentColor" viewBox="0 0 24 24">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                         </svg>
                       </button>
                       <p className="text-[14px] font-[500] text-[#647491]">Коэффициент отклонений</p>
                    </div>
                                           <div className="flex flex-col">
                                                  <div className="flex items-end">
                            <p className="text-[1.8rem] font-[500] text-[#070F1A]" style={{ height: '33px' }}>8.2%</p>
                            {generateTrendIndicator('down', '-1.5%', true)}
                  </div>
                                                  <div style={{ marginTop: '8px' }}>
                            {generateProgressBar(8.2, 100, false, 'orange')}
                  </div>
                </div>
                   </CardContent>
                 </Card>
              </div>
            )}

            {activeStatisticsTab === 'technical' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ paddingTop: '12px' }}>
                                 <Card className="shadow-none hover:border-[#096EFD] hover:border-opacity-50 hover:-translate-y-[6px] transition-all duration-200">
                   <CardContent className="p-[15px] h-[170px] flex flex-col justify-between" style={{ paddingTop: '13px' }}>
                     <div className="flex items-center gap-2" style={{ marginTop: '13px !important', height: '21px !important' }}>
                       <button 
                         onClick={() => openMetricInfo({
                           title: 'Средняя скорость ответа ИИ-агента',
                           description: 'Эта метрика измеряет, как быстро ваш ИИ-агент отвечает на сообщения клиентов, также известное как время первого ответа (FRT).',
                           formula: '0.0 sec (sum of response times) / 0 (total AI responses) = 0 сек',
                           explanation: 'Что отслеживается: Эта метрика отслеживает среднее время, которое требуется вашему ИИ для ответа на сообщения клиентов, измеряемое в секундах.\n\nКак рассчитывается: Мы рассчитываем разность времени между отправкой сообщения клиентом и ответом ИИ, затем усредняем это по всем ответам ИИ.\n\nПочему это важно: Более быстрое время ответа приводит к лучшему клиентскому опыту и более высокому удовлетворению. Быстрые ответы ИИ удерживают клиентов в разговоре и не дают им покинуть беседу.'
                         })}
                         className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                       >
                         <svg fill="currentColor" viewBox="0 0 24 24">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                         </svg>
                       </button>
                       <p className="text-[14px] font-[500] text-[#647491]">Ср. скорость ответа ИИ-агента</p>
            </div>
                                                                                        <div className="flex items-end" style={{ marginBottom: '0px !important' }}>
                          <p className="text-[1.8rem] font-[500] text-[#070F1A]" style={{ height: '33px' }}>1.2с.</p>
                          {generateTrendIndicator('down', '-0.3с', true)}
                      </div>
                   </CardContent>
                 </Card>

                                 <Card className="shadow-none hover:border-[#096EFD] hover:border-opacity-50 hover:-translate-y-[6px] transition-all duration-200">
                   <CardContent className="p-[15px] h-[170px] flex flex-col justify-between" style={{ paddingTop: '13px' }}>
                     <div className="flex items-center gap-2" style={{ marginTop: '13px !important', height: '21px !important' }}>
                       <button 
                         onClick={() => openMetricInfo({
                           title: 'Средняя скорость разрешения вопроса',
                           description: 'Процент разговоров, в которых агент Fin AI предоставил ответ, при этом клиент либо дал положительный отзыв, либо не запросил разговор с коллегой.',
                           formula: 'Время от первого сообщения до завершения разговора',
                           explanation: 'Что отслеживается: Эта метрика измеряет среднее время, необходимое для полного разрешения вопроса клиента от начала до конца разговора.\n\nКак рассчитывается: Мы вычисляем время между первым сообщением клиента и моментом, когда разговор был успешно завершен (клиент получил ответ и не запросил помощь человека).\n\nПочему это важно: Более быстрое разрешение вопросов повышает удовлетворенность клиентов и эффективность работы ИИ-агента.'
                         })}
                         className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                       >
                         <svg fill="currentColor" viewBox="0 0 24 24">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                         </svg>
                       </button>
                       <p className="text-[14px] font-[500] text-[#647491]">Ср. скорость разрешения вопроса</p>
                  </div>
                                                                                        <div className="flex items-end" style={{ marginBottom: '0px !important' }}>
                          <p className="text-[1.8rem] font-[500] text-[#070F1A]" style={{ height: '33px' }}>45с.</p>
                          {generateTrendIndicator('down', '-8с', true)}
                  </div>
                </CardContent>
              </Card>

                                 <Card className="shadow-none hover:border-[#096EFD] hover:border-opacity-50 hover:-translate-y-[6px] transition-all duration-200">
                   <CardContent className="p-[15px] h-[170px] flex flex-col justify-between" style={{ paddingTop: '13px' }}>
                     <div className="flex items-center gap-2" style={{ marginTop: '12px !important', height: '21px !important' }}>
                       <button 
                         onClick={() => openMetricInfo({
                           title: 'Оценка эффективности ИИ-агента',
                           description: 'Общая оценка эффективности работы ИИ-агента на основе различных показателей качества.',
                           formula: 'Средняя оценка по шкале 1-5',
                           explanation: 'Что отслеживается: Эта метрика показывает общую эффективность ИИ-агента на основе множества факторов, включая точность ответов, скорость работы, удовлетворенность клиентов и процент успешных разрешений.\n\nКак рассчитывается: Мы анализируем различные показатели качества работы ИИ-агента и вычисляем общую оценку по шкале от 1 до 5.\n\nПочему это важно: Высокая оценка эффективности указывает на качественную работу ИИ-агента и его способность решать задачи клиентов без вмешательства человека.'
                         })}
                         className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                       >
                         <svg fill="currentColor" viewBox="0 0 24 24">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                         </svg>
                       </button>
                       <p className="text-[14px] font-[500] text-[#647491]">Оценка эффективности ИИ-агента</p>
                            </div>
                                           <div className="flex flex-col">
                                                  <div className="flex items-end">
                            <p className="text-[1.8rem] font-[500] text-[#070F1A]" style={{ height: '33px' }}>9.2/10</p>
                            {generateTrendIndicator('up', '+0.3')}
                  </div>
                                                  <div style={{ marginTop: '8px' }}>
                            {generateProgressBar(9.2, 10, true, 'indigo')}
                        </div>
                    </div>
                   </CardContent>
                 </Card>

                                 <Card className="shadow-none hover:border-[#096EFD] hover:border-opacity-50 hover:-translate-y-[6px] transition-all duration-200">
                   <CardContent className="p-[15px] h-[170px] flex flex-col justify-between" style={{ paddingTop: '13px' }}>
                     <div className="flex items-center gap-2" style={{ marginTop: '12px !important', height: '21px !important' }}>
                       <button 
                         onClick={() => openMetricInfo({
                           title: 'Процент чатов с запросом о помощи',
                           description: 'Процент разговоров, где клиенты запросили передачу разговора человеку из общего количества разговоров.',
                           formula: 'Количество чатов с запросом помощи / Общее количество чатов × 100%',
                           explanation: 'Что отслеживается: Эта метрика показывает, в каком проценте случаев клиенты просят передать разговор человеку, что может указывать на сложность вопроса или недовольство ответами ИИ.\n\nКак рассчитывается: Мы делим количество разговоров, где клиент запросил помощь человека, на общее количество разговоров и умножаем на 100%.\n\nПочему это важно: Низкий процент указывает на эффективность ИИ-агента, а высокий может сигнализировать о необходимости улучшения базы знаний или настройки ИИ.'
                         })}
                         className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                       >
                         <svg fill="currentColor" viewBox="0 0 24 24">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                         </svg>
                       </button>
                       <p className="text-[14px] font-[500] text-[#647491]">Процент чатов с запросом о помощи</p>
                     </div>
                                           <div className="flex flex-col">
                                                  <div className="flex items-end">
                            <p className="text-[1.8rem] font-[500] text-[#070F1A]" style={{ height: '33px' }}>3.4%</p>
                            {generateTrendIndicator('down', '-0.8%', true)}
                          </div>
                                                  <div style={{ marginTop: '8px' }}>
                            {generateProgressBar(3.4, 100, false, 'red')}
                          </div>
                </div>
              </CardContent>
            </Card>
          </div>
            )}
          </div>
        );
      case 'integrations':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-[24px] font-[500] text-[#070F1A]">Интеграции</h1>
            </div>

            <div className="grid grid-cols-3 gap-[20px]">
              {integrations.map((integration) => (
                <div 
                  key={integration.id}
                  className="border border-transparent rounded-[15px] p-[15px] group hover:border-[#070F1A]/10 transition-all duration-300"
                >
                  {/* Контент: иконка и текст в одной строке */}
                  <div className="flex items-start gap-[15px] mb-[25px]">
                    {/* Иконка */}
                    <div className="flex-shrink-0">
                      <img src={`/${integration.icon}`} alt={integration.name} className="w-[50px] h-[50px]" />
  </div>

                    {/* Заголовок и описание */}
                    <div className="flex-1">
                      <h3 className="text-[16px] font-medium text-[#070F1A] mb-1">{integration.name}</h3>
                      <p className="text-[12px] text-[#647491]">{integration.description}</p>
                    </div>
                  </div>

                  {/* Кнопка подключения */}
                  <div className="w-full">
                    {integration.installed ? (
                      <button className="w-full h-[40px] border border-[#0084FF]/20 text-[#0084FF]/60 rounded-[12px] transition-colors hover:border-[#0084FF]/30 hover:text-[#0084FF]/80 text-[14px]">
                        Подключено
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInstallIntegration(integration)}
                        className="w-full h-[40px] bg-[#0084FF] text-white rounded-[12px] hover:bg-[#0084FF]/90 transition-colors text-[14px]"
                      >
                        Подключить
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Примечание об Instagram */}
            <div className="mt-8 text-center">
              <p className="text-[12px] text-[#647491]">
                *Instagram является продуктом Meta – признанной в РФ экстремисткой организацией
              </p>
          </div>
          </div>
        );

      case 'model-settings':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-[24px] font-[500] text-[#070F1A]">Настройки модели</h1>
            </div>



            {/* Шаг 1: Уточните цели Adapto */}
            <div className="mb-[50px]">
              <div className="flex items-center gap-[15px] mb-6">
                  <div className="w-[17px] h-[17px] bg-[#096EFD] rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-medium">1</span>
                  </div>
                  <div>
                  <h3 className="text-[18px] font-[500] text-[#070F1A] tracking-[-3%]">Уточните цели Adapto</h3>
                  <p className="text-[14px] text-[#647491] tracking-[-2%]">
                      Настройте основные цели и задачи вашего ИИ-агента
                    </p>
                  </div>
                </div>
              <div className="px-0 py-6">
                <div className="flex gap-6">
                  {/* Левая колонка: Какую роль должен выполнять бот? */}
                  <div className="flex-1">
                    <h4 className="text-[16px] font-[500] text-[#070F1A] tracking-[-3%] mb-[20px]">Какую роль должен выполнять бот?</h4>
                    <div className="flex gap-[10px]">
                    <button
                      onClick={() => setSetupData({...setupData, task: 'Продавать'})}
                        className={`w-[220px] h-[190px] rounded-[15px] transition-all overflow-hidden flex flex-col border ${
                        setupData.task === 'Продавать' 
                            ? 'bg-[#DBE9FF] border-[#096EFD]/50' 
                            : 'bg-[#F3F5F7] border-[#070F1A]/10'
                      }`}
                    >
                        <div className="w-full h-[144px] rounded-t-[15px] overflow-hidden">
                          <img src="/Продавец.png" alt="Продавец" className="w-full h-full object-cover object-top" />
                      </div>
                        <div className="flex-1 flex items-center gap-[7px] px-[15px]">
                        {setupData.task === 'Продавать' ? (
                            <div className="w-[17px] h-[17px] bg-[#0084FF] rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                          </div>
                        ) : (
                            <div className="w-[17px] h-[17px] bg-white rounded-full border border-[#070F1A]/10"></div>
                        )}
                        <span className="text-[14px] font-[500] text-[#070F1A]">Продавца</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setSetupData({...setupData, task: 'Консультировать'})}
                        className={`w-[220px] h-[190px] rounded-[15px] transition-all overflow-hidden flex flex-col border ${
                        setupData.task === 'Консультировать' 
                            ? 'bg-[#DBE9FF] border-[#096EFD]/50' 
                            : 'bg-[#F3F5F7] border-[#070F1A]/10'
                      }`}
                    >
                        <div className="w-full h-[144px] rounded-t-[15px] overflow-hidden">
                          <img src="/Консул.png" alt="Консультант" className="w-full h-full object-cover object-top" />
                      </div>
                        <div className="flex-1 flex items-center gap-[7px] px-[15px]">
                        {setupData.task === 'Консультировать' ? (
                            <div className="w-[17px] h-[17px] bg-[#0084FF] rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                          </div>
                        ) : (
                            <div className="w-[17px] h-[17px] bg-white rounded-full border border-[#070F1A]/10"></div>
                        )}
                        <span className="text-[14px] font-[500] text-[#070F1A]">Консультанта</span>
                      </div>
                    </button>
                  </div>
                </div>
                
                  {/* Правая колонка: Какая главная цель ИИ-агента? */}
                  <div className="flex-1">
                    <h4 className="text-[16px] font-[500] text-[#070F1A] tracking-[-3%] mb-[20px]">Какая главная цель ИИ-агента?</h4>
                    <div className="grid grid-cols-2 gap-[10px]">
                    <button
                      onClick={() => setSetupData({...setupData, mainGoal: 'Записать на консультацию'})}
                      className={`h-[40px] rounded-[10px] transition-all ${
                        setupData.mainGoal === 'Записать на консультацию' 
                            ? 'bg-[#0084FF] text-white' 
                            : 'bg-white border border-[#070F1A]/10 text-[#070F1A]/70'
                      }`}
                    >
                        <span className="text-[14px] font-[500]">Записать на консультацию</span>
                    </button>
                    <button
                      onClick={() => setSetupData({...setupData, mainGoal: 'Продать продукт'})}
                      className={`h-[40px] rounded-[10px] transition-all ${
                        setupData.mainGoal === 'Продать продукт' 
                            ? 'bg-[#0084FF] text-white' 
                            : 'bg-white border border-[#070F1A]/10 text-[#070F1A]/70'
                      }`}
                    >
                        <span className="text-[14px] font-[500]">Продать продукт</span>
                    </button>
                    <button
                      onClick={() => setSetupData({...setupData, mainGoal: 'Помочь решить проблему'})}
                      className={`h-[40px] rounded-[10px] transition-all ${
                        setupData.mainGoal === 'Помочь решить проблему' 
                            ? 'bg-[#0084FF] text-white' 
                            : 'bg-white border border-[#070F1A]/10 text-[#070F1A]/70'
                      }`}
                    >
                        <span className="text-[14px] font-[500]">Помочь решить проблему</span>
                    </button>
                    <button
                      onClick={() => setSetupData({...setupData, mainGoal: 'custom'})}
                      className={`h-[40px] rounded-[10px] transition-all ${
                        setupData.mainGoal === 'custom' 
                            ? 'bg-[#0084FF] text-white' 
                            : 'bg-white border border-[#070F1A]/10 text-[#070F1A]/70'
                      }`}
                    >
                        <span className="text-[14px] font-[500]">Другое</span>
                    </button>
                  </div>
                  {setupData.mainGoal === 'custom' && (
                      <div className="mt-[10px]">
                      <Input
                        placeholder="Введите вариант"
                          className="w-full h-[40px] rounded-[10px] border border-[#070F1A]/10 text-[14px] text-[#070F1A]/70"
                      />
                    </div>
                  )}
                  </div>
                </div>

                {/* Отступ между вопросами */}
                <div className="h-[20px]"></div>

                {/* 3. Какой цикл сделки в вашей компании? и 4. Целевая аудитория */}
                <div className="flex gap-6">
                  {/* Левая колонка: Какой цикл сделки */}
                  <div className="flex-1">
                    <h4 className="text-[16px] font-[500] text-[#070F1A] tracking-[-3%] mb-[20px]">Какой цикл сделки в вашей компании?</h4>
                  <Textarea 
                    value={setupData.dealCycle || ''}
                    onChange={(e) => setSetupData({...setupData, dealCycle: e.target.value})}
                    placeholder="Обычно наши клиенты сначала оставляют заявку, далее наш менеджер связывается с ними по телефону, подтверждают заявку и ведут дальше по воронке: Тут 2 пути, зависит от того на что оставили заявку, но если 1 путь, то отправляет декларацию на отправку груза, обычный срок у нас 7 дней..."
                      className="min-h-[124px] rounded-[10px] border border-[#070F1A]/10 text-[14px] text-[#070F1A]/70"
                  />
                </div>

                  {/* Правая колонка: Целевая аудитория */}
                  <div className="flex-1">
                    <h4 className="text-[16px] font-[500] text-[#070F1A] tracking-[-3%] mb-[20px]">Целевая аудитория</h4>
                  <Textarea 
                    value={setupData.targetAudience || ''}
                    onChange={(e) => setSetupData({...setupData, targetAudience: e.target.value})}
                    placeholder="Пол: Женщины Возраст: 18-45 Боль клиента: сложно найти подходящий размер"
                      className="min-h-[124px] rounded-[10px] border border-[#070F1A]/10 text-[14px] text-[#070F1A]/70"
                  />
                </div>
                </div>
              </div>
            </div>

            {/* Шаг 2: Правила общения */}
            <div className="mb-[50px]">
              <div className="flex items-center gap-[15px] mb-6">
                  <div className="w-[17px] h-[17px] bg-[#096EFD] rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-medium">2</span>
                  </div>
                  <div>
                  <h3 className="text-[18px] font-[500] text-[#070F1A] tracking-[-3%]">Правила общения</h3>
                  <p className="text-[14px] text-[#647491] tracking-[-2%]">
                      Настройте стиль общения и ограничения для вашего ИИ-агента
                    </p>
                  </div>
                </div>
              <div className="px-0 py-6">
                <div className="flex gap-6">
                  {/* Левая колонка: Обращение к пользователю */}
                  <div className="flex-1">
                    <h4 className="text-[16px] font-[500] text-[#070F1A] tracking-[-3%] mb-[20px]">Обращение к пользователю</h4>
                    <div className="grid grid-cols-2 gap-[10px]">
                    <button 
                      onClick={() => setSetupData({...setupData, addressing: 'Вы'})}
                      className={`h-[40px] rounded-[10px] transition-all ${
                        setupData.addressing === 'Вы' 
                            ? 'bg-[#0084FF] text-white' 
                            : 'bg-white border border-[#070F1A]/10 text-[#070F1A]/70'
                      }`}
                    >
                        <span className="text-[14px] font-[500]">На "Вы"</span>
                    </button>
                    <button 
                      onClick={() => setSetupData({...setupData, addressing: 'Ты'})}
                      className={`h-[40px] rounded-[10px] transition-all ${
                        setupData.addressing === 'Ты' 
                            ? 'bg-[#0084FF] text-white' 
                            : 'bg-white border border-[#070F1A]/10 text-[#070F1A]/70'
                      }`}
                    >
                        <span className="text-[14px] font-[500]">На "Ты"</span>
                    </button>
                  </div>
                </div>

                  {/* Правая колонка: Стиль общения */}
                  <div className="flex-1">
                    <h4 className="text-[16px] font-[500] text-[#070F1A] tracking-[-3%] mb-[20px]">Стиль общения</h4>
                    <div className="grid grid-cols-2 gap-[10px]">
                    <button 
                      onClick={() => setSetupData({...setupData, communicationStyle: 'Дружелюбный'})} 
                      className={`h-[40px] rounded-[10px] transition-all ${
                        setupData.communicationStyle === 'Дружелюбный' 
                            ? 'bg-[#0084FF] text-white' 
                            : 'bg-white border border-[#070F1A]/10 text-[#070F1A]/70'
                      }`}
                    >
                        <span className="text-[14px] font-[500]">😊 Дружелюбный</span>
                    </button>
                    <button 
                      onClick={() => setSetupData({...setupData, communicationStyle: 'Нейтральный'})} 
                      className={`h-[40px] rounded-[10px] transition-all ${
                        setupData.communicationStyle === 'Нейтральный' 
                            ? 'bg-[#0084FF] text-white' 
                            : 'bg-white border border-[#070F1A]/10 text-[#070F1A]/70'
                      }`}
                    >
                        <span className="text-[14px] font-[500]">😐 Нейтральный</span>
                    </button>
                    <button 
                      onClick={() => setSetupData({...setupData, communicationStyle: 'Профессиональный'})} 
                      className={`h-[40px] rounded-[10px] transition-all ${
                        setupData.communicationStyle === 'Профессиональный' 
                            ? 'bg-[#0084FF] text-white' 
                            : 'bg-white border border-[#070F1A]/10 text-[#070F1A]/70'
                      }`}
                    >
                        <span className="text-[14px] font-[500]">💼 Профессиональный</span>
                    </button>
                    <button 
                      onClick={() => setSetupData({...setupData, communicationStyle: 'Человечный'})} 
                      className={`h-[40px] rounded-[10px] transition-all ${
                        setupData.communicationStyle === 'Человечный' 
                            ? 'bg-[#0084FF] text-white' 
                            : 'bg-white border border-[#070F1A]/10 text-[#070F1A]/70'
                      }`}
                    >
                        <span className="text-[14px] font-[500]">😄 Человечный</span>
                    </button>
                    </div>
                  </div>
                </div>

                {/* Отступ между вопросами */}
                <div className="h-[50px]"></div>

                {/* 3. Ограничения Адапто */}
                <div>
                  <h4 className="text-[16px] font-[500] text-[#070F1A] tracking-[-3%] mb-[20px]">Ограничения Адапто</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Не обсуждай цены',
                      'Не давай финансовых советов',
                      'Не обсуждай политику',
                      'Не обсуждай религиозные темы',
                      'Не превышай полномочия и не создавай новые обязательства компании',
                      'Не давай юридические консультации',
                      'Не подтверждай наличие товара или услуги',
                      'Не гарантируй результат',
                      'Не давай длинных ответов',
                      'Поясняй ссылки при их отправке',
                      'Используй молодежный сленг',
                      'Не осуждай предпочтения клиента',
                      'Не оказывай давление на клиента',
                      'Избегай споров',
                      'Отвечай от первого лица',
                      'Используй бытовой язык',
                      'Не давай технические советы'
                    ].map(restriction => (
                      <button
                        key={restriction}
                        onClick={() => {
                          const current = setupData.restrictions || [];
                          const newRestrictions = current.includes(restriction)
                            ? current.filter(r => r !== restriction)
                            : [...current, restriction];
                          setSetupData({...setupData, restrictions: newRestrictions});
                        }}
                        className={`px-4 h-[34px] rounded-[50px] border border-[1px] transition-all text-[13px] ${
                          (setupData.restrictions || []).includes(restriction)
                            ? 'border-[#0084FF] bg-[#0084FF] text-white' 
                            : 'border-[#070F1A]/10 bg-white text-[#070F1A]/70'
                        }`}
                      >
                        {restriction}
                      </button>
                    ))}

                    <button
                      onClick={() => setSetupData({...setupData, showCustomRestriction: !setupData.showCustomRestriction})}
                      className={`px-4 h-[34px] rounded-[50px] border border-[1px] transition-all text-[13px] ${
                        setupData.showCustomRestriction
                          ? 'border-[#0084FF] bg-[#0084FF] text-white' 
                          : 'border-[#070F1A]/10 bg-white text-[#070F1A]/70'
                      }`}
                    >
                      Другое
                    </button>
                  </div>
                  {setupData.showCustomRestriction && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        value={setupData.customRestriction || ''}
                        onChange={(e) => setSetupData({...setupData, customRestriction: e.target.value})}
                        placeholder="Введите вариант"
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => {
                          if (setupData.customRestriction) {
                            const current = setupData.restrictions || [];
                            setSetupData({
                              ...setupData, 
                              restrictions: [...current, setupData.customRestriction],
                              customRestriction: '',
                              showCustomRestriction: false
                            });
                          }
                        }}
                        disabled={!setupData.customRestriction}
                        className="bg-[#0084FF] text-white font-[500] text-[14px] rounded-[10px] hover:bg-[#0084FF]/90"
                      >
                        Добавить
                      </Button>
                </div>
                  )}
              </div>

              {/* Отступ между вопросами */}
              <div className="h-[50px]"></div>

                {/* 5. Дополнительные настройки общения */}
                <div>
                  <h4 className="text-[16px] font-[500] text-[#070F1A] tracking-[-3%] mb-[20px]">Дополнительные настройки общения</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Не гарантировать результат',
                      'Пояснять ссылки перед отправкой',
                      'Проверять понимание ответа',
                      'Избегать длинных сообщений',
                      'Уточнять задачу в начале общения',
                      'Не оказывать давление на клиента',
                      'Предупреждать об ожидании ответа',
                      'Избегать споров',
                      'Отвечать от первого лица'
                    ].map(setting => (
                      <button
                        key={setting}
                        onClick={() => {
                          const current = setupData.communicationSettings || [];
                          const newSettings = current.includes(setting)
                            ? current.filter(s => s !== setting)
                            : [...current, setting];
                          setSetupData({...setupData, communicationSettings: newSettings});
                        }}
                        className={`px-4 h-[34px] rounded-[50px] border border-[1px] transition-all text-[13px] ${
                          (setupData.communicationSettings || []).includes(setting)
                            ? 'border-[#0084FF] bg-[#0084FF] text-white' 
                            : 'border-[#070F1A]/10 bg-white text-[#070F1A]/70'
                        }`}
                      >
                        {setting}
                      </button>
                    ))}
                    {/* Пользовательские табы для дополнительных настроек */}
                    {(setupData.communicationSettings || []).filter(setting => 
                      !['Не гарантировать результат', 'Пояснять ссылки перед отправкой', 'Проверять понимание ответа', 'Избегать длинных сообщений', 'Уточнять задачу в начале общения', 'Не оказывать давление на клиента', 'Предупреждать об ожидании ответа', 'Избегать споров', 'Отвечать от первого лица'].includes(setting)
                    ).map(setting => (
                      <button
                        key={setting}
                        onClick={() => {
                          const current = setupData.communicationSettings || [];
                          const newSettings = current.filter(s => s !== setting);
                          setSetupData({...setupData, communicationSettings: newSettings});
                        }}
                        className="px-4 h-[34px] rounded-[50px] border border-[1px] transition-all text-[13px] border-[#0084FF] bg-[#0084FF] text-white"
                      >
                        {setting}
                      </button>
                    ))}
                    <button
                      onClick={() => setSetupData({...setupData, showCustomCommunicationSetting: !setupData.showCustomCommunicationSetting})}
                      className={`px-4 h-[34px] rounded-[50px] border border-[1px] transition-all text-[13px] ${
                        setupData.showCustomCommunicationSetting
                          ? 'border-[#0084FF] bg-[#0084FF] text-white' 
                          : 'border-[#070F1A]/10 bg-white text-[#070F1A]/70'
                      }`}
                    >
                      Другое
                    </button>
                  </div>
                  {setupData.showCustomCommunicationSetting && (
                    <div className="mt-3 flex gap-2">
                    <Input
                      value={setupData.customCommunicationSetting || ''}
                      onChange={(e) => setSetupData({...setupData, customCommunicationSetting: e.target.value})}
                        placeholder="Введите вариант"
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => {
                          if (setupData.customCommunicationSetting) {
                            const current = setupData.communicationSettings || [];
                            setSetupData({
                              ...setupData, 
                              communicationSettings: [...current, setupData.customCommunicationSetting],
                              customCommunicationSetting: '',
                              showCustomCommunicationSetting: false
                            });
                          }
                        }}
                        disabled={!setupData.customCommunicationSetting}
                        className="bg-[#0084FF] text-white font-[500] text-[14px] rounded-[10px] hover:bg-[#0084FF]/90"
                      >
                        Добавить
                      </Button>
                  </div>
                  )}
                </div>



                {/* Отступ между вопросами */}
                <div className="h-[50px]"></div>

                {/* 6. Уточнять или задавать вопрос клиенту, если: */}
                <div>
                  <h4 className="text-[16px] font-[500] text-[#070F1A] tracking-[-3%] mb-[20px]">Уточнять или задавать вопрос клиенту</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Если запрос неполный',
                      'Если клиент сомневается',
                      'Если есть риск ошибки',
                      'При выборе продукта или услуги',
                      'Если ответ зависит от тонкостей',
                      'Если клиент проявляет интерес к нескольким вариантам',
                      'Если клиент не понимает предложенное',
                      'Если требуется индивидуальный подбор',
                      'Если клиент задаёт вопросы вне своей компетенции',
                      'Если клиент спрашивает о вещах, которые требует специальных знаний',
                      'При оформлении заявки или заказа',
                      'Перед тем как оформить что-то важное',
                      'Если клиент долго молчит'
                    ].map(question => (
                      <button
                        key={question}
                        onClick={() => {
                          const current = setupData.clarificationQuestions || [];
                          const newQuestions = current.includes(question)
                            ? current.filter(q => q !== question)
                            : [...current, question];
                          setSetupData({...setupData, clarificationQuestions: newQuestions});
                        }}
                        className={`px-4 h-[34px] rounded-[50px] border border-[1px] transition-all text-[13px] ${
                          (setupData.clarificationQuestions || []).includes(question)
                            ? 'border-[#0084FF] bg-[#0084FF] text-white' 
                            : 'border-[#070F1A]/10 bg-white text-[#070F1A]/70'
                        }`}
                      >
                        {question}
                      </button>
                    ))}
                    {/* Пользовательские табы для уточняющих вопросов */}
                    {(setupData.clarificationQuestions || []).filter(question => 
                      !['Если запрос неполный', 'Если клиент сомневается', 'Если есть риск ошибки', 'При выборе продукта или услуги', 'Если ответ зависит от тонкостей', 'Если клиент проявляет интерес к нескольким вариантам', 'Если клиент не понимает предложенное', 'Если требуется индивидуальный подбор', 'Если клиент задаёт вопросы вне своей компетенции', 'Если клиент спрашивает о вещах, которые требует специальных знаний', 'При оформлении заявки или заказа', 'Перед тем как оформить что-то важное', 'Если клиент долго молчит'].includes(question)
                    ).map(question => (
                      <button
                        key={question}
                        onClick={() => {
                          const current = setupData.clarificationQuestions || [];
                          const newQuestions = current.filter(q => q !== question);
                          setSetupData({...setupData, clarificationQuestions: newQuestions});
                        }}
                        className="px-4 h-[34px] rounded-[50px] border border-[1px] transition-all text-[13px] border-[#0084FF] bg-[#0084FF] text-white"
                      >
                        {question}
                      </button>
                    ))}
                    <button
                      onClick={() => setSetupData({...setupData, showCustomClarificationQuestion: !setupData.showCustomClarificationQuestion})}
                      className={`px-4 h-[34px] rounded-[50px] border border-[1px] transition-all text-[13px] ${
                        setupData.showCustomClarificationQuestion
                          ? 'border-[#0084FF] bg-[#0084FF] text-white' 
                          : 'border-[#070F1A]/10 bg-white text-[#070F1A]/70'
                      }`}
                    >
                      Другое
                    </button>
                  </div>
                  {setupData.showCustomClarificationQuestion && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        value={setupData.customClarificationQuestion || ''}
                        onChange={(e) => setSetupData({...setupData, customClarificationQuestion: e.target.value})}
                        placeholder="Введите вариант"
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => {
                          if (setupData.customClarificationQuestion) {
                            const current = setupData.clarificationQuestions || [];
                            setSetupData({
                              ...setupData, 
                              clarificationQuestions: [...current, setupData.customClarificationQuestion],
                              customClarificationQuestion: '',
                              showCustomClarificationQuestion: false
                            });
                          }
                        }}
                        disabled={!setupData.customClarificationQuestion}
                        className="bg-[#0084FF] text-white font-[500] text-[14px] rounded-[10px] hover:bg-[#0084FF]/90"
                      >
                        Добавить
                      </Button>
                    </div>
                  )}
                </div>

                {/* Отступ между вопросами */}
                <div className="h-[50px]"></div>

                {/* 7. Сбор данных и Количество эмодзи в общении */}
                <div className="flex gap-6">
                  {/* Левая колонка: Сбор данных */}
                  <div className="flex-1">
                    <h4 className="text-[16px] font-[500] text-[#070F1A] tracking-[-3%] mb-[20px]">Сбор данных</h4>
                    <div className="flex flex-wrap gap-2">
                    {[
                      'Имя',
                      'Номер телефона',
                      'Почта',
                      'Адрес доставки',
                      'Город',
                      'Возраст'
                    ].map(dataType => (
                      <button
                        key={dataType}
                        onClick={() => {
                          const current = setupData.dataCollection || [];
                          const newData = current.includes(dataType)
                            ? current.filter(d => d !== dataType)
                            : [...current, dataType];
                          // Если добавляем новый таб, то "Не собирать данные" должен быть деактивирован
                          setSetupData({...setupData, dataCollection: newData});
                        }}
                          className={`px-4 h-[34px] rounded-[50px] border border-[1px] transition-all text-[13px] ${
                          (setupData.dataCollection || []).includes(dataType)
                              ? 'border-[#0084FF] bg-[#0084FF] text-white' 
                              : 'border-[#070F1A]/10 bg-white text-[#070F1A]/70'
                        }`}
                      >
                        {dataType}
                      </button>
                    ))}
                    {/* Пользовательские табы */}
                    {(setupData.dataCollection || []).filter(dataType => 
                      !['Имя', 'Номер телефона', 'Почта', 'Адрес доставки', 'Город', 'Возраст'].includes(dataType)
                    ).map(dataType => (
                      <button
                        key={dataType}
                        onClick={() => {
                          const current = setupData.dataCollection || [];
                          const newData = current.filter(d => d !== dataType);
                          setSetupData({...setupData, dataCollection: newData});
                        }}
                        className="px-4 h-[34px] rounded-[50px] border border-[1px] transition-all text-[13px] border-[#0084FF] bg-[#0084FF] text-white"
                      >
                        {dataType}
                      </button>
                    ))}
                    <button
                      onClick={() => setSetupData({...setupData, dataCollection: []})}
                        className={`px-4 h-[34px] rounded-[50px] border border-[1px] transition-all text-[13px] ${
                        (setupData.dataCollection || []).length === 0
                            ? 'border-[#0084FF] bg-[#0084FF] text-white' 
                            : 'border-[#070F1A]/10 bg-white text-[#070F1A]/70'
                      }`}
                    >
                      Не собирать данные
                    </button>
                    <button
                      onClick={() => {
                        // При активации "Добавить данные" деактивируем "Не собирать данные"
                        setSetupData({...setupData, showCustomData: !setupData.showCustomData});
                      }}
                      className={`px-4 h-[34px] rounded-[50px] border border-[1px] transition-all text-[13px] ${
                        setupData.showCustomData
                          ? 'border-[#0084FF] bg-[#0084FF] text-white' 
                          : 'border-[#070F1A]/10 bg-white text-[#070F1A]/70'
                      }`}
                    >
                      Добавить данные
                    </button>
                  </div>
                  {setupData.showCustomData && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        value={setupData.customData || ''}
                        onChange={(e) => setSetupData({...setupData, customData: e.target.value})}
                        placeholder="Ввести параметр"
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => {
                          if (setupData.customData) {
                            const current = setupData.dataCollection || [];
                            setSetupData({
                              ...setupData, 
                              dataCollection: [...current, setupData.customData],
                              customData: '',
                              showCustomData: false
                            });
                          }
                        }}
                        disabled={!setupData.customData}
                        className="bg-[#0084FF] text-white font-[500] text-[14px] rounded-[10px] hover:bg-[#0084FF]/90"
                      >
                        Добавить
                      </Button>
                    </div>
                  )}
                  </div>

                  {/* Правая колонка: Количество эмодзи в общении */}
                  <div className="flex-1">
                    <h4 className="text-[16px] font-[500] text-[#070F1A] tracking-[-3%] mb-[20px]">Количество эмодзи в общении</h4>
                    <div className="flex gap-[10px]">
                      <button
                        onClick={() => setSetupData({...setupData, emojiUsage: 'Никогда'})}
                        className={`relative w-[178px] h-[190px] rounded-[15px] transition-all overflow-hidden flex flex-col border ${
                          setupData.emojiUsage === 'Никогда' 
                            ? 'bg-[#DBE9FF] border-[#0084FF]/50' 
                            : 'bg-[#F3F5F7] border-[#070F1A]/10'
                        }`}
                      >
                        <div className="w-full h-[144px] rounded-t-[15px] overflow-hidden">
                          <div className="w-full h-full bg-[#F3F5F7] flex items-center justify-center">
                            <img src="/Frame 121.png" alt="Никогда" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="flex-1 flex items-center gap-[7px] px-[15px]">
                          {setupData.emojiUsage === 'Никогда' ? (
                            <div className="w-[17px] h-[17px] bg-[#0084FF] rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            </div>
                          ) : (
                            <div className="w-[17px] h-[17px] bg-white rounded-full border border-[#070F1A]/10"></div>
                          )}
                          <span className="text-[14px] font-[500] text-[#070F1A]">Никогда</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setSetupData({...setupData, emojiUsage: 'Редко'})}
                        className={`relative w-[178px] h-[190px] rounded-[15px] transition-all overflow-hidden flex flex-col border ${
                          setupData.emojiUsage === 'Редко' 
                            ? 'bg-[#DBE9FF] border-[#0084FF]/50' 
                            : 'bg-[#F3F5F7] border-[#070F1A]/10'
                        }`}
                      >
                                                <div className="w-full h-[144px] rounded-t-[15px] overflow-hidden">
                          <div className="w-full h-full bg-[#F3F5F7] flex items-center justify-center">
                            <img src="/Frame 119.png" alt="Редко" className="w-full h-full object-cover" />
                </div>
              </div>
                        <div className="flex-1 flex items-center gap-[7px] px-[15px]">
                          {setupData.emojiUsage === 'Редко' ? (
                            <div className="w-[17px] h-[17px] bg-[#0084FF] rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            </div>
                          ) : (
                            <div className="w-[17px] h-[17px] bg-white rounded-full border border-[#070F1A]/10"></div>
                          )}
                          <span className="text-[14px] font-[500] text-[#070F1A]">Редко</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setSetupData({...setupData, emojiUsage: 'Часто'})}
                        className={`relative w-[178px] h-[190px] rounded-[15px] transition-all overflow-hidden flex flex-col border ${
                          setupData.emojiUsage === 'Часто' 
                            ? 'bg-[#DBE9FF] border-[#0084FF]/50' 
                            : 'bg-[#F3F5F7] border-[#070F1A]/10'
                        }`}
                      >
                        <div className="w-full h-[144px] rounded-t-[15px] overflow-hidden">
                          <div className="w-full h-full bg-[#F3F5F7] flex items-center justify-center">
                            <img src="/Frame 120.png" alt="Часто" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="flex-1 flex items-center gap-[7px] px-[15px]">
                          {setupData.emojiUsage === 'Часто' ? (
                            <div className="w-[17px] h-[17px] bg-[#0084FF] rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            </div>
                          ) : (
                            <div className="w-[17px] h-[17px] bg-white rounded-full border border-[#070F1A]/10"></div>
                          )}
                          <span className="text-[14px] font-[500] text-[#070F1A]">Часто</span>
                        </div>
                      </button>
                  </div>
                </div>
                </div>


              </div>
            </div>

            {/* Шаг 3: Этапы диалога */}
            <div className="mb-[50px]">
              <div className="flex items-center gap-[15px] mb-0">
                <div className="w-[17px] h-[17px] bg-[#096EFD] rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-medium">3</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-[500] text-[#070F1A] tracking-[-3%]">Воронка продаж</h3>
                  <p className="text-[14px] text-[#647491] tracking-[-2%]">
                  Опишите детально этапы диалога для вашего ИИ-агента
                  </p>
                            </div>
              </div>
                <div className="px-0 py-6" style={{paddingTop: '0px !important'}}>
                <div className="h-[20px]"></div>
                <div className="bg-[#096EFD]/5 border border-[#096EFD]/30 rounded-[15px] p-4 mb-4">
                  <div className="flex items-start gap-[7px]">
                    <svg className="w-5 h-5 text-[#096EFD] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                    <div>
                      <div className="font-medium text-[#0084FF] text-[16px] mb-[11px]">Уделите время детальному заполнению этапов вашей воронки</div>
                      <div className="text-[14px] text-[#647491]">
                        Подробное описание сильно улучшит качество ответов ИИ-агента, так как он будет понимать ваш скрипт и какие этапы проходит ваш клиент. У вас всегда будет возможность изменить воронку продаж и скрипт. Не запускайте тест ИИ-агента без изменений шаблона.
                          </div>
                      </div>
                    </div>
                </div>



                <div className="space-y-[10px]">
                  {(setupData.dialogStages || [
                    'Поздоровайся и спроси имя клиента. Уточни его проблему и пойми текущую ситуацию пользователя',
                    'Опиши коротко как решишь его задачу/назови наши преимущества, предложи товары по запросу',
                    'Веди клиента к оформлению заказа/заявки',
                    'Когда клиент готов оформить заказ, сделай итог заказа и пришли ссылку на оплату из базы знаний.',
                    'Переведи клиента на менеджера для проверки оплаты и дальнейшей работы'
                  ]).map((stage, index) => {
                    const isEditing = setupData.editingStage === index;
                    return (
                    <div key={index} className="flex items-center gap-[10px]">
                      {/* Квадрат с цифрой */}
                      <div className="w-[40px] h-[40px] bg-[#F3F8FF] border border-[#070F1A]/10 rounded-[10px] flex items-center justify-center">
                        <span className="text-[14px] text-[#0084FF] font-medium">{index + 1}</span>
                  </div>
                      
                      {/* Поле ввода */}
                      <div className="flex-1">
                        <div className="flex-1">
                          <Textarea
                            value={stage}
                            onChange={(e) => {
                              const newStages = [...(setupData.dialogStages || [])];
                              newStages[index] = e.target.value;
                              setSetupData({...setupData, dialogStages: newStages});
                            }}
                            className={`w-full resize-none border rounded-[10px] p-3 min-h-[40px] ${isEditing ? 'border-[#070F1A]/10 bg-white' : 'border-[#070F1A]/10 bg-gray-50 cursor-not-allowed'}`}
                            rows={1}
                            placeholder="Опишите этап диалога"
                            readOnly={!isEditing}
                            style={{ minHeight: '40px', height: 'auto' }}
                            onInput={(e) => {
                              e.target.style.height = 'auto';
                              e.target.style.height = Math.max(40, e.target.scrollHeight) + 'px';
                            }}
                            data-stage-index={index}
                          />
                    </div>
                      </div>
                      
                      {/* Кнопка редактирования */}
                      <button 
                        onClick={() => {
                          if (isEditing) {
                            setSetupData({...setupData, editingStage: null});
                          } else {
                            setSetupData({...setupData, editingStage: index});
                            // Автоматически фокусируемся на поле через небольшую задержку
                            setTimeout(() => {
                              const textarea = document.querySelector(`textarea[data-stage-index="${index}"]`);
                              if (textarea) {
                                textarea.focus();
                                textarea.setSelectionRange(textarea.value.length, textarea.value.length);
                              }
                            }, 100);
                          }
                        }}
                        className="w-[40px] h-[40px] bg-white border border-[#070F1A]/10 rounded-[10px] flex items-center justify-center hover:bg-gray-50"
                      >
                        <svg className="w-5 h-5 text-[#070F1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      {/* Кнопка удаления */}
                      <button 
                          onClick={() => {
                            const newStages = [...(setupData.dialogStages || [])];
                            newStages.splice(index, 1);
                            setSetupData({...setupData, dialogStages: newStages});
                          }}
                        className="w-[40px] h-[40px] bg-white border border-[#070F1A]/10 rounded-[10px] flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 text-[#D12020]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                  })}
                  
                  <Button 
                    onClick={() => {
                      const newStages = [...(setupData.dialogStages || []), 'Новый этап диалога'];
                      setSetupData({...setupData, dialogStages: newStages});
                    }}
                    className="w-full h-[40px] bg-white border border-[#096EFD]/50 text-[#070F1A] hover:bg-[#096EFD] hover:text-white text-[14px] transition-all"
                  >
                    Добавить этап
                  </Button>
                    </div>

                <div className="h-[20px]"></div>

                {/* Предупреждение если не изменены этапы */}
                {!setupData.dialogStagesModified && (
                  <div className="bg-[#FFF8F8] border border-[#FF0D0D]/15 rounded-[15px] px-[15px] py-4">
                    <div className="flex items-start gap-[7px]">
                      <svg className="w-6 h-6 text-[#D12020] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                      <div>
                        <div className="font-medium text-[#D12020] text-[16px] mb-[11px]">Вы не внесли никаких изменений в этапы диалога</div>
                        <div className="text-[14px] text-[#916464]">
                          Он не адаптирован под ваш бизнес, это может сказаться на эффективности ответов ИИ-агента. Рекомендуем, изменить информацию в полях!
                </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="h-[30px]"></div>

                </div>
            </div>

            {/* Закрепленные кнопки внизу контейнера */}
            <div className="sticky bottom-[30px] z-10 mt-6">
              <div className="flex gap-[20px] w-full">
                          <Button 
                            onClick={() => setSetupData({...setupData, dialogStagesModified: true})}
                  className="flex-1 bg-[#070F1A] text-white hover:bg-[#070F1A]/90 font-[500] text-[14px]"
                          >
                  Сохранить изменения
                          </Button>
                          <Button 
                            onClick={() => setSetupData({...setupData, dialogStagesModified: true})}
                  className="flex-1 bg-[#0084FF] text-white hover:bg-[#0084FF]/90 font-[500] text-[14px]"
                          >
                  Сохранить и протестировать
                          </Button>
                        </div>
            </div>
          </div>
        );

      case 'dialogs':
        return (
          <div className="flex flex-col">
            {/* Заголовок */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-[24px] font-[500]">Диалоги</h1>
            </div>

                         {/* Трехконтейнерная структура */}
             <div className="grid grid-cols-12 gap-5 overflow-hidden" style={{ height: 'calc(100vh - 140px)', maxHeight: 'calc(100vh - 140px)' }}>
                             {/* Левая панель - список диалогов */}
               <div className="col-span-4 bg-white rounded-[15px] border border-[#E5E7EB] flex flex-col h-full overflow-hidden">
                <div className="p-4">
                  <h2 className="text-[18px] font-[500] text-[#070F1A] mb-4">Все чаты</h2>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#647491]" />
                    <Input
                      placeholder="Найти чат"
                      className="w-full pl-10 bg-[#F3F5F7] border-[#F3F5F7] text-[#647491] placeholder-[#647491]"
                    />
                </div>
                </div>
                
                                 <div className="overflow-y-auto p-4 space-y-3 flex-1">
                  {dialogsData.map((dialog) => (
                                         <div 
                       key={dialog.id} 
                       className={`p-3 rounded-[15px] cursor-pointer transition-all ${
                         selectedDialog?.id === dialog.id 
                           ? 'bg-[#F3F5F7] border border-transparent' 
                           : 'hover:bg-[#F9FAFB] border border-transparent'
                       }`}
                       onClick={() => setSelectedDialog(dialog)}
                     >
                      <div className="flex items-center gap-3">
                                                 <div className="w-[40px] h-[40px] bg-[#F3F4F6] rounded-full flex items-center justify-center">
                           {dialog.source === 'widget' && <img src="/Group 102.svg" alt="Widget" className="w-full h-full" />}
                           {dialog.source === 'telegram' && <img src="/Group 38.svg" alt="Telegram" className="w-full h-full" />}
                           {dialog.source === 'whatsapp' && <img src="/Group 37.svg" alt="WhatsApp" className="w-full h-full" />}
                           {dialog.source === 'vk' && <img src="/Group 39.svg" alt="VK" className="w-full h-full" />}
                         </div>
                        <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                            <h3 className="font-[500] text-[14px] text-[#070F1A] truncate">{dialog.user}</h3>
                            <span className="text-[12px] text-[#9CA3AF]">{dialog.time}</span>
                          </div>
                          <p className="text-[12px] text-[#647491] truncate mt-1">{dialog.lastMessage}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className={`inline-block px-2 py-1 rounded-full text-[10px] ${
                              dialog.status === 'active' ? 'bg-[#ECFDF5] text-[#10B981]' :
                              dialog.status === 'waiting' ? 'bg-[#FFFBEB] text-[#F59E0B]' :
                              'bg-[#F3F4F6] text-[#6B7280]'
                            }`}>
                              {dialog.status === 'active' ? 'Активный' :
                               dialog.status === 'waiting' ? 'Ожидает' : 'Закрыт'}
                            </div>
                                                         <span className="text-[10px] text-[#9CA3AF]">{dialog.messageCount} сообщений</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                             {/* Центральная панель - детальный вид диалога */}
               <div className="col-span-5 bg-white rounded-[15px] border border-[#E5E7EB] flex flex-col h-full overflow-hidden">
                {selectedDialog ? (
                  <>
                    <div className="p-4 border-b border-[#E5E7EB]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                                                     <div className="w-[40px] h-[40px] bg-[#F3F4F6] rounded-full flex items-center justify-center">
                             {selectedDialog.source === 'widget' && <img src="/Group 102.svg" alt="Widget" className="w-full h-full" />}
                             {selectedDialog.source === 'telegram' && <img src="/Group 38.svg" alt="Telegram" className="w-full h-full" />}
                             {selectedDialog.source === 'whatsapp' && <img src="/Group 37.svg" alt="WhatsApp" className="w-full h-full" />}
                             {selectedDialog.source === 'vk' && <img src="/Group 39.svg" alt="VK" className="w-full h-full" />}
          </div>
                        <div>
                            <h3 className="font-[500] text-[16px] text-[#070F1A]">{selectedDialog.user}</h3>
                            <p className="text-[12px] text-[#647491]">{selectedDialog.email}</p>
                        </div>
                      </div>
                        <div className={`inline-block px-3 py-1 rounded-full text-[12px] ${
                          selectedDialog.status === 'active' ? 'bg-[#ECFDF5] text-[#10B981]' :
                          selectedDialog.status === 'waiting' ? 'bg-[#FFFBEB] text-[#F59E0B]' :
                          'bg-[#F3F4F6] text-[#6B7280]'
                        }`}>
                          {selectedDialog.status === 'active' ? 'Активный' :
                           selectedDialog.status === 'waiting' ? 'Ожидает' : 'Закрыт'}
                        </div>
                      </div>
                    </div>
                    
                                         <div className="overflow-y-auto p-4 space-y-4 flex-1">
                      {selectedDialog.messages.map((message, index) => (
                        <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-[12px] ${
                            message.isUser 
                              ? 'bg-[#F3F5F7] text-[#070F1A]' 
                              : 'bg-[#DBE9FF] text-[#070F1A]'
                          }`}>
                            <p className="text-[14px]">{message.text}</p>
                            <p className={`text-[10px] mt-1 ${
                              message.isUser ? 'text-[#070F1A] opacity-50' : 'text-[#070F1A] opacity-50'
                            }`}>
                              {message.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-4 pb-4 border-t border-[#E5E7EB]">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Введите сообщение..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          className="w-full h-[40px] px-4 py-2 pr-[100px] rounded-[20px] border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px] text-[#070F1A]"
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                          <button 
                            onClick={handleFileUpload}
                            className="w-[32px] h-[32px] flex items-center justify-center transition-colors"
                          >
                            <img src="/paperclip.svg" alt="Вложения" className="w-[18px] h-[18px] text-[#647491] hover:text-[#070F1A] transition-colors" />
                          </button>
                          <button 
                            onClick={handleSendMessage}
                            className="w-[32px] h-[32px] bg-[#0084FF] rounded-full flex items-center justify-center cursor-pointer disabled:bg-[#070F1A] disabled:bg-opacity-10 disabled:cursor-not-allowed transition-colors"
                            disabled={!messageText.trim()}
                          >
                            <img 
                              src="/Frame 118.svg" 
                          alt="Отправить" 
                              className={`w-3 h-3 ${!messageText.trim() ? 'opacity-60' : ''}`}
                        />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3" />
                      <p className="text-[16px] text-[#6B7280]">Выберите диалог для просмотра</p>
                    </div>
                  </div>
                )}
              </div>

                             {/* Правая панель - информация о диалоге */}
                               <div className="col-span-3 bg-white rounded-[15px] border border-[#E5E7EB] flex flex-col h-full overflow-hidden">
                {selectedDialog ? (
                    <div className="p-4 overflow-y-auto flex-1 space-y-6">
                    <div>
                      <h3 className="font-[500] text-[16px] text-[#070F1A] mb-3">Информация о диалоге</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[12px] text-[#647491] mb-1">Источник</p>
                                                     <div className="flex items-center gap-2">
                              <div className="w-[20px] h-[20px] bg-[#F3F4F6] rounded-full flex items-center justify-center">
                                {selectedDialog.source === 'widget' && <img src="/Group 102.svg" alt="Widget" className="w-[12px] h-[12px]" />}
                                {selectedDialog.source === 'telegram' && <img src="/Group 38.svg" alt="Telegram" className="w-[12px] h-[12px]" />}
                                {selectedDialog.source === 'whatsapp' && <img src="/Group 37.svg" alt="WhatsApp" className="w-[20px] h-[20px]" />}
                                {selectedDialog.source === 'vk' && <img src="/Group 39.svg" alt="VK" className="w-[12px] h-[12px]" />}
                             </div>
                                                             <span className="text-[14px] text-[#070F1A] capitalize">
                                 {selectedDialog.source === 'vk' ? 'Вконтакте' : selectedDialog.source}
                               </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-[12px] text-[#647491] mb-1">Имя</p>
                            <div className="flex items-center gap-2">
                              <img src="/user.svg" alt="Имя" className="w-4 h-4" />
                              <p className="text-[14px] text-[#070F1A]">{selectedDialog.name || '—'}</p>
                           </div>
                        </div>
                        <div>
                          <p className="text-[12px] text-[#647491] mb-1">Email</p>
                            <div className="flex items-center gap-2">
                              <img src="/sms.svg" alt="Email" className="w-4 h-4" />
                              <p className="text-[14px] text-[#070F1A]">{selectedDialog.email || '—'}</p>
                            </div>
                        </div>
                          <div>
                            <p className="text-[12px] text-[#647491] mb-1">Телефон</p>
                            <div className="flex items-center gap-2">
                              <img src="/call-calling.svg" alt="Телефон" className="w-4 h-4" />
                              <p className="text-[14px] text-[#070F1A]">{selectedDialog.phone || '—'}</p>
                            </div>
                          </div>
                          {selectedDialog.source === 'widget' && selectedDialog.browser && (
                            <div>
                              <p className="text-[12px] text-[#647491] mb-1">Браузер</p>
                              <p className="text-[14px] text-[#070F1A]">{selectedDialog.browser}</p>
                            </div>
                          )}
                        <div>
                          <p className="text-[12px] text-[#647491] mb-1">Статус</p>
                          <div className={`inline-block px-2 py-1 rounded-full text-[12px] ${
                              selectedDialog.status === 'active' ? 'bg-[#FFFBEB] text-[#F59E0B]' :
                              selectedDialog.status === 'resolved' ? 'bg-[#ECFDF5] text-[#10B981]' :
                              selectedDialog.status === 'rejected' ? 'bg-[#FEF2F2] text-[#EF4444]' :
                            'bg-[#F3F4F6] text-[#6B7280]'
                          }`}>
                            {selectedDialog.status === 'active' ? 'Активный' :
                               selectedDialog.status === 'resolved' ? 'Решенный' :
                               selectedDialog.status === 'rejected' ? 'Отказ' : 'Закрыт'}
                          </div>
                        </div>
                        <div>
                          <p className="text-[12px] text-[#647491] mb-1">Сообщений</p>
                          <p className="text-[14px] text-[#070F1A]">{selectedDialog.messages.length}</p>
                        </div>
                        <div>
                          <p className="text-[12px] text-[#647491] mb-1">Начало диалога</p>
                          <p className="text-[14px] text-[#070F1A]">{selectedDialog.startTime}</p>
                        </div>
                        <div>
                          <p className="text-[12px] text-[#647491] mb-1">Последняя активность</p>
                          <p className="text-[14px] text-[#070F1A]">{selectedDialog.lastActivity}</p>
                        </div>
                      </div>
                     </div>
                  </div>
                ) : (
                    <div className="p-4 text-center">
                    <Info className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
                    <p className="text-[14px] text-[#6B7280]">Выберите диалог для просмотра информации</p>
                  </div>
                )}
            
                  {/* Кнопки внизу */}
                  {selectedDialog && (
                    <div className="p-4 border-t border-[#E5E7EB] space-y-3">
              <Button 
                variant="outline" 
                size="sm" 
                        className="w-full h-[40px] bg-white border border-[#E5E7EB] text-[#647491] hover:text-[#096EFD] hover:bg-[#F0F7FF] hover:border-[#096EFD] rounded-[10px] font-[500] text-[14px] transition-colors"
              >
                        <Upload className="w-4 h-4 mr-2 transition-colors" />
                        Импорт диалога
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                        className="w-full h-[40px] bg-white border border-[#E5E7EB] text-[#647491] hover:text-[#EF4444] hover:bg-[#FEF2F2] hover:border-[#FCA5A5] rounded-[10px] font-[500] text-[14px] transition-colors"
              >
                        <Trash2 className="w-4 h-4 mr-2 transition-colors" />
                        Удалить диалог
              </Button>
                    </div>
                  )}

              </div>
            </div>


          </div>
        );

      case 'my-adapto':
        return (
          <div>
            {/* Заголовок и описание */}
            <h1 className="text-[24px] font-[500] text-[#070F1A]">Тестирование</h1>
            <p className="text-[14px] text-[#647491]" style={{ marginTop: '12px', marginBottom: '50px' }}>
              Проверьте своего бота на знание скрипта и информации о вашей компании
            </p>

            {/* Основная площадь для контента */}
            <div className="flex gap-[10px] h-full">
              {/* Левый контейнер - поле для правок */}
              <div className="flex-1 bg-white rounded-[20px] flex flex-col" style={{ paddingTop: '0px', paddingRight: '16px', paddingBottom: '0px', paddingLeft: '0px' }}>
                {/* Предупреждение - показывается только если база знаний пуста */}
                {!hasKnowledgeBase && (
                  <div className="bg-[#FFF8F8] border border-[#FF0D0D]/15 rounded-[15px] p-[15px] mb-6">
                    <div className="flex items-start gap-[11px]">
                      <img src="/alarm.svg" alt="Предупреждение" className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-[#D12020] font-[500] text-base mb-[11px]">Предупреждение</h3>
                        <div className="flex justify-between items-center">
                          <p className="text-[#916464] text-sm flex-1" style={{ opacity: '100%' }}>
                            Вы не загрузили ничего в вашу базу знаний, ИИ-бот не готов к полноценной работе и будет отвечать некорректно!
                          </p>
                          <button className="text-[#FF0D0D] font-[500] text-sm px-4 h-[40px] bg-[#FFDBDB] rounded-[12px] hover:bg-[#FFE0E0] transition-colors flex items-center ml-4">
                            Перейти в базу знаний
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Заголовок "Корректировки" и кнопка */}
                <div className="flex items-center justify-between mb-[30px]">
                  <h3 className="text-[18px] font-[500] text-[#070F1A]">Корректировки</h3>
                  <button 
                    onClick={() => setShowAddCorrectionForm(!showAddCorrectionForm)}
                    className="h-[32px] px-4 bg-[#0084FF] border border-[#0084FF] rounded-[90px] text-white font-medium text-[14px] hover:bg-[#0073E6] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Добавить
                  </button>
                </div>

                {/* Секция с корректировками */}
                <div className="space-y-3 mb-6">
                  {/* Пример корректировки */}
                  <div className="flex items-center">
                    {/* Левая часть - кнопка выделения */}
                    <div className="w-4 mr-4">
                      <input type="checkbox" className="w-4 h-4 text-[#0084FF] border border-[#070F1A]/10 rounded" />
                    </div>
                    {/* Центральная часть - описание */}
                    <div className="flex-1">
                      <span className="text-[#070F1A] font-medium text-[14px]">Пример корректировки для демонстрации</span>
                    </div>
                    {/* Правая часть - кнопки скрыть и удалить */}
                    <div className="flex items-center gap-2 ml-4">
                      <button className="w-4 h-4 text-[#647491] hover:text-[#070F1A] transition-colors">
                        <img src="/12312.svg" alt="Скрыть" className="w-4 h-4" />
                      </button>
                      <button className="w-4 h-4 text-[#647491] hover:text-[#EF4444] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Форма добавления корректировки - показывается сразу под первой корректировкой */}
                  {showAddCorrectionForm && (
                    <div className="mt-4 p-4 bg-white border border-[#E5E7EB] rounded-[10px]">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={newCorrectionText}
                          onChange={(e) => setNewCorrectionText(e.target.value)}
                          placeholder="Введите корректировку..."
                          className="flex-1 h-[40px] px-3 border border-[#E5E7EB] rounded-[10px] text-[#070F1A] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0084FF] focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddCorrection()}
                        />
                        <button
                          onClick={handleAddCorrection}
                          className="h-[40px] px-4 bg-[#0084FF] border border-[#0084FF] rounded-[90px] text-white font-medium text-[14px] hover:bg-[#0073E6] transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                          Отправить
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Динамические корректировки */}
                  {botCorrections.map((correction, index) => (
                    <div key={index} className="flex items-center">
                      {/* Левая часть - кнопка выделения */}
                      <div className="w-4 mr-4">
                        <input type="checkbox" className="w-4 h-4 text-[#0084FF] border border-[#070F1A]/10 rounded" />
                      </div>
                      {/* Центральная часть - описание */}
                      <div className="flex-1">
                        <span className="text-[#070F1A] font-medium text-[14px]">{correction.correction || correction}</span>
                      </div>
                      {/* Правая часть - кнопки скрыть и удалить */}
                      <div className="flex items-center gap-2 ml-4">
                        <button 
                          onClick={() => toggleCorrectionVisibility(index)}
                          className="w-4 h-4 text-[#647491] hover:text-[#070F1A] transition-colors"
                        >
                          <img 
                            src={hiddenCorrections.has(index) ? "/eye-closed.svg" : "/12312.svg"} 
                            alt={hiddenCorrections.has(index) ? "Показать" : "Скрыть"} 
                            className="w-4 h-4" 
                          />
                        </button>
                        <button 
                          onClick={() => removeCorrection(index)}
                          className="w-4 h-4 text-[#647491] hover:text-[#EF4444] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}


                </div>


              </div>

              {/* Правый контейнер - диалоговое окно */}
              <div className="w-[400px] bg-white rounded-[20px] p-4 flex flex-col border border-[#E5E7EB]" style={{ height: 'calc(-200px + 100vh)', flexShrink: 0, paddingLeft: '0px !important', paddingRight: '0px !important' }}>
                {/* Заголовок "Тестирование" */}
                <div className="flex items-center justify-between mb-4" style={{ paddingLeft: '16px !important', paddingRight: '16px !important' }}>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[18px] font-[500] text-[#070F1A]">Тестирование</h2>
                  </div>
                  <button 
                    onClick={async () => {
                      if (currentUser?.id) {
                        try {
                          await supabaseClient.chatHistory.clearChatHistory(currentUser.id);
                          setChatHistory([
                            { type: 'assistant', text: 'Привет! Я ваш ИИ-ассистент Adapto. Как дела?' }
                          ]);
                          showNotificationMessage('История чата очищена');
                        } catch (error) {
                          console.error('Error clearing chat history:', error);
                          showNotificationMessage('Ошибка при очистке истории');
                        }
                      }
                    }}
                    className="w-[32px] h-[32px] bg-[#F3F5F7] rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                    title="Обновить диалог"
                  >
                    <img src="/arrow-refresh-02.svg" alt="Обновить" className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Разделительная линия */}
                <div className="border-b border-[#E5E7EB] mb-4"></div>

                {/* Диалог */}
                <div className="flex-1 flex flex-col" style={{ paddingLeft: '16px !important', paddingRight: '16px !important' }}>
                  {/* История диалога */}
                  <div className="flex-1 space-y-4 overflow-y-auto mb-4" style={{ paddingLeft: '16px !important', paddingRight: '16px !important' }}>
                    {/* Плашка "Сегодня" */}
                    <div className="text-center">
                      <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">Сегодня</span>
                    </div>
                    
                    {chatHistory.map((message, index) => (
                      <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`} style={{ paddingLeft: message.type === 'assistant' ? '0' : '0', paddingRight: message.type === 'user' ? '0' : '0' }}>
                        <div className={`max-w-[70%] p-3 text-[14px] ${
                          message.type === 'user' 
                            ? 'bg-[#F3F5F7] text-[#070F1A] rounded-[15px]' 
                            : 'bg-[#F3F5F7] text-[#070F1A] rounded-[15px] border border-[#070F1A] border-opacity-[0.06]'
                        }`}>
                          {message.type === 'assistant' && (
                            <div className="flex items-center gap-2 mb-2">
                              <img src="/лого на плашку диалога ии.svg" alt="AI" className="w-[13px] h-[13px]" />
                              <span className="text-[14px] font-[500] text-[#070F1A]">Adapto ИИ агент</span>
                        </div>
                          )}
                          <div>{message.text}</div>
                        </div>
                        {message.type === 'assistant' && (
                          <div className="flex gap-1 mt-2" style={{ marginTop: '5px', marginLeft: '0' }}>
                            <button 
                              onClick={() => handleLikeMessage(index)}
                              className="w-[14px] h-[14px] flex items-center justify-center"
                              title="Понравился ответ"
                            >
                              <img src="/thumb-up.svg" alt="Лайк" className="w-[14px] h-[14px]" />
                            </button>
                            <button 
                              onClick={() => handleDislikeMessage(index)}
                              className="w-[14px] h-[14px] flex items-center justify-center"
                              title="Не понравился ответ"
                            >
                              <img src="/thumb-down.svg" alt="Дизлайк" className="w-[14px] h-[14px]" />
                            </button>
                          </div>
                        )}
                        {message.type === 'user' && (
                          <div className="w-8 h-8 bg-[#5BE5F7] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-medium">Я</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Поле ввода */}
                  <div className="relative" style={{ paddingLeft: '16px !important', paddingRight: '16px !important' }}>
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                      placeholder="Введите сообщение..."
                      className="w-full h-[48px] border border-gray-300 rounded-[90px] px-[15px] py-[12px] text-[#647491] text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 pr-[80px]"
                    />

                    <div className="absolute top-[8px] right-[10px] flex items-center gap-1">
                      <button 
                        onClick={handleFileUpload}
                        className="w-[16px] h-[16px] text-[#647491] hover:text-[#070F1A] transition-colors bg-transparent border-none p-0"
                        title="Добавить вложение"
                      >
                        <img src="/paperclip.svg" alt="Вложение" className="w-full h-full" />
                      </button>
                      <button 
                        onClick={handleSendMessage}
                        disabled={!currentMessage.trim()}
                        className={`w-[32px] h-[32px] rounded-full flex items-center justify-center transition-colors ${
                          currentMessage.trim() 
                            ? 'bg-[#0084FF] hover:bg-[#0073E6]' 
                            : 'bg-[#070F1A] bg-opacity-10 cursor-not-allowed'
                        }`}
                        title="Отправить сообщение"
                      >
                        <img 
                          src="/Frame 118.svg" 
                      alt="Отправить" 
                          className={`w-3 h-3 ${!currentMessage.trim() ? 'opacity-60' : ''}`}
                    />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'model-extensions':
        return (
          <div className="space-y-6">
            <h1 className="text-[24px] font-[500] text-[#070F1A]">Расширения модели</h1>
            <p className="text-[#647491] text-[14px]">
              Настройте дополнительные возможности для вашего ИИ-агента
            </p>
            <div className="text-center py-8 text-gray-500">
              Раздел в разработке
            </div>
          </div>
        );

      case 'widget-settings':
        return (
          <div className="space-y-6">
            <h1 className="text-[24px] font-[500] text-[#070F1A]">Виджет на сайт</h1>
            <p className="text-[#647491] text-[14px]">
              Настройте виджет для встраивания на ваш сайт
            </p>
            
            <div className="bg-white rounded-[20px] p-6 border border-gray-200">
              <div className="space-y-8">
                {/* Accent Color */}
                <div>
                  <label className="block text-sm font-medium mb-3">Акцентный цвет</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="text" 
                      value={widgetSettings.accentColor}
                      onChange={(e) => setWidgetSettings({...widgetSettings, accentColor: e.target.value})}
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="HEX"
                    />
                    <input 
                      type="color" 
                      value={widgetSettings.accentColor}
                      onChange={(e) => setWidgetSettings({...widgetSettings, accentColor: e.target.value})}
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    <button 
                      onClick={() => setWidgetSettings({...widgetSettings, accentColor: '#1354FC'})}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Button Color */}
                <div>
                  <label className="block text-sm font-medium mb-3">Цвет кнопки</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', label: 'Светлый фон', bg: 'bg-white', border: 'border-blue-500', text: 'text-blue-500' },
                      { id: 'dark', label: 'Темный фон', bg: 'bg-gray-900', border: 'border-white', text: 'text-white' },
                      { id: 'custom', label: 'Задать свой цвет', bg: 'bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500', border: 'border-blue-500', text: 'text-white' }
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setWidgetSettings({...widgetSettings, buttonColor: style.id})}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          widgetSettings.buttonColor === style.id 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className={`w-[140px] h-[42px] rounded-xl flex items-center justify-center gap-2 mb-2 mx-auto ${
                            style.id === 'light' ? 'bg-white border-2 border-gray-300' :
                            style.id === 'dark' ? 'bg-gray-900' :
                            'bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500'
                          }`}
                          style={{
                            borderColor: style.id === 'light' ? widgetSettings.accentColor : 'transparent',
                            color: style.id === 'light' ? widgetSettings.accentColor : 'white'
                          }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full opacity-80"
                            style={{ backgroundColor: style.id === 'light' ? widgetSettings.accentColor : 'currentColor' }}
                          ></div>
                          <span className="text-sm font-medium" style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            Спросить ИИ
                          </span>
                        </div>
                        <span className={`text-xs ${widgetSettings.buttonColor === style.id ? 'text-blue-600' : 'text-gray-600'}`}>
                          {style.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Picker */}
                {widgetSettings.buttonColor === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium mb-3">Введите цвет для фона</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        value={widgetSettings.customButtonColor}
                        onChange={(e) => setWidgetSettings({...widgetSettings, customButtonColor: e.target.value})}
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="HEX"
                      />
                      <input 
                        type="color" 
                        value={widgetSettings.customButtonColor}
                        onChange={(e) => setWidgetSettings({...widgetSettings, customButtonColor: e.target.value})}
                        className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Button Text */}
                <div>
                  <label className="block text-sm font-medium mb-3">Название кнопки</label>
                  <input 
                    type="text" 
                    value={widgetSettings.buttonText}
                    onChange={(e) => setWidgetSettings({...widgetSettings, buttonText: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Спросить ИИ"
                  />
                </div>

                {/* Button Style */}
                <div>
                  <label className="block text-sm font-medium mb-3">Стиль кнопки</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setWidgetSettings({...widgetSettings, buttonStyle: 'rectangle'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        widgetSettings.buttonStyle === 'rectangle' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="w-[120px] h-[40px] bg-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">Спросить ИИ</span>
                        </div>
                        <div className="text-sm font-medium">Прямоугольная</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setWidgetSettings({...widgetSettings, buttonStyle: 'ellipse'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        widgetSettings.buttonStyle === 'ellipse' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="w-[120px] h-[40px] bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">💬</span>
                        </div>
                        <div className="text-sm font-medium">Круглая</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Logo Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6 border p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Название рядом с логотипом</label>
                      <input 
                        type="text"
                        value={widgetSettings.logoName || ''}
                        onChange={(e) => setWidgetSettings({...widgetSettings, logoName: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Введите название"
                      />
                      <p className="mt-2 text-sm text-gray-500">Текст, отображаемый рядом с логотипом в виджете.</p>
                    </div>
                  </div>
                  <div className="space-y-6 border p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ссылка на логотип</label>
                      <input 
                        type="url"
                        value={widgetSettings.logoUrl || ''}
                        onChange={(e) => setWidgetSettings({...widgetSettings, logoUrl: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Введите ссылку на логотип"
                      />
                      <p className="mt-2 text-sm text-gray-500">Вставьте URL логотипа вашей компании, который будет отображаться в виджете.</p>
                    </div>
                  </div>
                </div>

                {/* Предложения (быстрые сообщения) */}
                <div>
                  <label className="block text-sm font-medium mb-3">Предложения</label>
                  <p className="text-sm text-gray-600 mb-4">Укажите сообщения, которые будут автоматически видны в виджете и предложены пользователю для отправки</p>
                  <div className="space-y-4">
                    {widgetSettings.suggestions?.map((suggestion, index) => (
                      <div key={index} className="flex items-center border rounded-md p-2">
                        <input 
                          type="text" 
                          value={suggestion}
                          onChange={(e) => {
                            const newSuggestions = [...(widgetSettings.suggestions || [])];
                            newSuggestions[index] = e.target.value;
                            setWidgetSettings({...widgetSettings, suggestions: newSuggestions});
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                          placeholder={`Сообщение ${index + 1}`}
                        />
                        <button 
                          onClick={() => {
                            const newSuggestions = (widgetSettings.suggestions || []).filter((_, i) => i !== index);
                            setWidgetSettings({...widgetSettings, suggestions: newSuggestions});
                          }}
                          className="ml-2 text-red-400 hover:text-red-600 flex-none whitespace-nowrap"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newSuggestions = [...(widgetSettings.suggestions || []), ''];
                        setWidgetSettings({...widgetSettings, suggestions: newSuggestions});
                      }}
                      className="text-blue-400 hover:text-blue-600 font-medium"
                    >
                      + Добавить сообщение
                    </button>
                  </div>
                </div>

                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium mb-3">Аватар Adapto</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setWidgetSettings({...widgetSettings, avatar: 'default'})}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        widgetSettings.avatar === 'default' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <div className="flex items-center justify-center w-6 h-6">
                          <div className="w-3 h-3 bg-white rounded-full mr-1"></div>
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <span className="text-xs text-center block">По умолчанию</span>
                    </button>
                    <button
                      onClick={() => document.getElementById('avatar-input')?.click()}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        widgetSettings.avatar === 'custom' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-gray-500">+</span>
                      </div>
                      <span className="text-xs text-center block">Загрузить</span>
                      <input 
                        id="avatar-input"
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setWidgetSettings({...widgetSettings, avatar: 'custom'});
                            showNotificationMessage('Аватар загружен!');
                          }
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Расположение виджета */}
                <div>
                  <label className="block text-sm font-medium mb-3">Расположение виджета</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setWidgetSettings({...widgetSettings, widgetLocation: 'default'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        widgetSettings.widgetLocation === 'default' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium mb-1">По умолчанию</div>
                        <div className="text-sm text-gray-600">Правый нижний угол</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setWidgetSettings({...widgetSettings, widgetLocation: 'custom'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        widgetSettings.widgetLocation === 'custom' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium mb-1">Настроить</div>
                        <div className="text-sm text-gray-600">Выбрать позицию</div>
                      </div>
                    </button>
                  </div>
                  
                  {/* Настройки расположения виджета */}
                  {widgetSettings.widgetLocation === 'custom' && (
                    <div className="mt-4 space-y-6 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Для компьютеров</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Отступ снизу</label>
                            <input 
                              type="number" 
                              value={widgetSettings.desktopBottomOffset}
                              onChange={(e) => setWidgetSettings({...widgetSettings, desktopBottomOffset: parseInt(e.target.value)})}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Отступ справа</label>
                            <input 
                              type="number" 
                              value={widgetSettings.desktopRightOffset}
                              onChange={(e) => setWidgetSettings({...widgetSettings, desktopRightOffset: parseInt(e.target.value)})}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Для телефонов</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Отступ снизу</label>
                            <input 
                              type="number" 
                              value={widgetSettings.mobileBottomOffset}
                              onChange={(e) => setWidgetSettings({...widgetSettings, mobileBottomOffset: parseInt(e.target.value)})}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Отступ справа</label>
                            <input 
                              type="number" 
                              value={widgetSettings.mobileRightOffset}
                              onChange={(e) => setWidgetSettings({...widgetSettings, mobileRightOffset: parseInt(e.target.value)})}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Z-index</label>
                        <input 
                          type="number" 
                          value={widgetSettings.zIndex}
                          onChange={(e) => setWidgetSettings({...widgetSettings, zIndex: parseInt(e.target.value)})}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          min="1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Приветственное сообщение */}
                <div>
                  <label className="block text-sm font-medium mb-3">Приветственное сообщение</label>
                  <div className="space-y-3">
                    {widgetSettings.welcomeMessages.map((message, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          type="text" 
                          value={message}
                          onChange={(e) => {
                            const newMessages = [...widgetSettings.welcomeMessages];
                            newMessages[index] = e.target.value;
                            setWidgetSettings({...widgetSettings, welcomeMessages: newMessages});
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Приветственное сообщение"
                        />
                        <button 
                          onClick={() => {
                            const newMessages = widgetSettings.welcomeMessages.filter((_, i) => i !== index);
                            setWidgetSettings({...widgetSettings, welcomeMessages: newMessages});
                          }}
                          className="px-3 py-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newMessages = [...widgetSettings.welcomeMessages, ''];
                        setWidgetSettings({...widgetSettings, welcomeMessages: newMessages});
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Добавить сообщение
                    </button>
                  </div>
                </div>

                {/* Триггерный вопрос */}
                <div>
                  <label className="block text-sm font-medium mb-3">Триггерный вопрос</label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => setWidgetSettings({...widgetSettings, triggerQuestionEnabled: 'no'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        widgetSettings.triggerQuestionEnabled === 'no' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium">Нет</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setWidgetSettings({...widgetSettings, triggerQuestionEnabled: 'yes'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        widgetSettings.triggerQuestionEnabled === 'yes' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium">Есть</div>
                      </div>
                    </button>
                  </div>
                  
                  {widgetSettings.triggerQuestionEnabled === 'yes' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium mb-2">Через какое время показать:</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            value={widgetSettings.triggerQuestionDelay}
                            onChange={(e) => setWidgetSettings({...widgetSettings, triggerQuestionDelay: parseInt(e.target.value)})}
                            className="w-20 p-2 border border-gray-300 rounded-lg text-sm"
                            min="1"
                          />
                          <span className="text-sm text-gray-600">сек</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Вопрос:</label>
                        <textarea 
                          value={widgetSettings.triggerQuestionText}
                          onChange={(e) => setWidgetSettings({...widgetSettings, triggerQuestionText: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          rows="3"
                          placeholder="Введите вопрос"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Быстрые ответы:</label>
                        <div className="space-y-2">
                          {widgetSettings.quickReplies.map((reply, index) => (
                            <div key={index} className="flex gap-2">
                              <input 
                                type="text" 
                                value={reply}
                                onChange={(e) => {
                                  const newReplies = [...widgetSettings.quickReplies];
                                  newReplies[index] = e.target.value;
                                  setWidgetSettings({...widgetSettings, quickReplies: newReplies});
                                }}
                                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Быстрый ответ"
                              />
                              <button 
                                onClick={() => {
                                  const newReplies = widgetSettings.quickReplies.filter((_, i) => i !== index);
                                  setWidgetSettings({...widgetSettings, quickReplies: newReplies});
                                }}
                                className="px-3 py-2 text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={() => {
                              const newReplies = [...widgetSettings.quickReplies, ''];
                              setWidgetSettings({...widgetSettings, quickReplies: newReplies});
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            + Добавить быстрый ответ
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Follow up сообщение */}
                <div>
                  <label className="block text-sm font-medium mb-3">Follow up сообщение</label>
                  <p className="text-sm text-gray-600 mb-4">Сообщение, которое увидит пользователь, если выйдет из диалога</p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => setWidgetSettings({...widgetSettings, followUpMessage: 'no'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        widgetSettings.followUpMessage === 'no' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium">Нет</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setWidgetSettings({...widgetSettings, followUpMessage: 'yes'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        widgetSettings.followUpMessage === 'yes' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium">Есть</div>
                      </div>
                    </button>
                  </div>
                  
                  {widgetSettings.followUpMessage === 'yes' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium mb-2">Через какое время показать:</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            value={widgetSettings.followUpDelay}
                            onChange={(e) => setWidgetSettings({...widgetSettings, followUpDelay: parseInt(e.target.value)})}
                            className="w-20 p-2 border border-gray-300 rounded-lg text-sm"
                            min="1"
                          />
                          <span className="text-sm text-gray-600">сек</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Вопрос:</label>
                        <textarea 
                          value={widgetSettings.followUpQuestion}
                          onChange={(e) => setWidgetSettings({...widgetSettings, followUpQuestion: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          rows="3"
                          placeholder="Введите вопрос"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Быстрые ответы:</label>
                        <div className="space-y-2">
                          {widgetSettings.followUpQuickReply && (
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={widgetSettings.followUpQuickReply}
                                onChange={(e) => setWidgetSettings({...widgetSettings, followUpQuickReply: e.target.value})}
                                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Быстрый ответ"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ссылка на политику обработки персональных данных */}
                <div>
                  <label className="block text-sm font-medium mb-2">Ссылка на политику обработки персональных данных</label>
                  <input 
                    type="url" 
                    value={widgetSettings.privacyPolicyUrl}
                    onChange={(e) => setWidgetSettings({...widgetSettings, privacyPolicyUrl: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="https://example.com/privacy"
                  />
                </div>

                {/* Какие метки собирать */}
                <div>
                  <label className="block text-sm font-medium mb-3">Какие метки собирать</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'utm_source',
                      'utm_medium', 
                      'utm_campaign',
                      'utm_term',
                      'utm_content',
                      'roistat_visit',
                      'gclid',
                      'fbclid'
                    ].map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          const current = widgetSettings.dataTags || [];
                          const newTags = current.includes(tag)
                            ? current.filter(t => t !== tag)
                            : [...current, tag];
                          setWidgetSettings({...widgetSettings, dataTags: newTags});
                        }}
                        className={`p-2 rounded-lg border-2 transition-all text-sm ${
                          (widgetSettings.dataTags || []).includes(tag)
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <button 
                      onClick={() => {
                        const newTag = prompt('Введите название метки:');
                        if (newTag && !widgetSettings.dataTags.includes(newTag)) {
                          const newTags = [...widgetSettings.dataTags, newTag];
                          setWidgetSettings({...widgetSettings, dataTags: newTags});
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Добавить метку
                    </button>
                  </div>
                </div>

                {/* Превью виджета */}
                <div>
                  <label className="block text-sm font-medium mb-3">Превью виджета</label>
                  <div className="border rounded-lg shadow-inner h-[400px] overflow-hidden relative bg-gray-50">
                    <div className="absolute bottom-4 right-4">
                      {widgetSettings.buttonStyle === 'ellipse' ? (
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
                          style={{ 
                            backgroundColor: widgetSettings.buttonColor === 'custom' ? widgetSettings.customButtonColor : 
                                         widgetSettings.buttonColor === 'dark' ? '#1f2937' : '#3b82f6'
                          }}
                        >
                          <span className="text-white text-lg">💬</span>
                        </div>
                      ) : (
                        <div 
                          className="px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer shadow-lg"
                          style={{ 
                            backgroundColor: widgetSettings.buttonColor === 'custom' ? widgetSettings.customButtonColor : 
                                         widgetSettings.buttonColor === 'dark' ? '#1f2937' : '#3b82f6'
                          }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full opacity-80"
                            style={{ backgroundColor: widgetSettings.accentColor }}
                          ></div>
                          <span className="text-white text-sm font-medium">
                            {widgetSettings.buttonText || 'Спросить ИИ'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Имитация чата */}
                    <div className="absolute bottom-20 right-4 w-80 h-64 bg-white rounded-lg shadow-lg border">
                      <div className="p-3 border-b bg-gray-50 rounded-t-lg">
                        <div className="flex items-center gap-2">
                          {widgetSettings.logoUrl ? (
                            <img src={widgetSettings.logoUrl} alt="Logo" className="w-6 h-6 rounded" />
                          ) : (
                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs">A</span>
                            </div>
                          )}
                          <span className="text-sm font-medium">
                            {widgetSettings.logoName || 'Adapto'}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        {widgetSettings.welcomeMessages?.slice(0, 2).map((message, index) => (
                          <div key={index} className="text-sm text-gray-700">
                            {message || `Приветственное сообщение ${index + 1}`}
                          </div>
                        ))}
                        {widgetSettings.suggestions?.slice(0, 2).map((suggestion, index) => (
                          <div key={index} className="mt-2">
                            <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                              {suggestion || `Предложение ${index + 1}`}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Код для вставки */}
                <div>
                  <label className="block text-sm font-medium mb-3">Код для вставки на сайт</label>
                  <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{generateWidgetCode()}</pre>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generateWidgetCode());
                      showNotificationMessage('Код скопирован!');
                    }}
                    className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Скопировать код
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'messengers':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-[24px] font-[500] text-[#070F1A]">Мессенджеры</h1>
            </div>

            <div className="grid grid-cols-3 gap-[20px]">
              {/* Telegram */}
              <div className="border border-transparent rounded-[15px] p-[15px] group hover:border-[#070F1A]/10 transition-all duration-300">
                <div className="flex items-start gap-[15px] mb-[25px]">
                  <div className="flex-shrink-0">
                    <img src="/group-38.svg" alt="Telegram" className="w-[50px] h-[50px]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-medium text-[#070F1A] mb-1">Telegram</h3>
                    <p className="text-[12px] text-[#647491]">Подключите ИИ-бота к Telegram</p>
                  </div>
                </div>
                <div className="w-full">
                  <button className="w-full h-[40px] bg-[#0084FF] text-white rounded-[12px] hover:bg-[#0084FF]/90 transition-colors text-[14px]">
                    Подключить
                  </button>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="border border-transparent rounded-[15px] p-[15px] group hover:border-[#070F1A]/10 transition-all duration-300">
                <div className="flex items-start gap-[15px] mb-[25px]">
                  <div className="flex-shrink-0">
                    <img src="/group-37.svg" alt="WhatsApp" className="w-[50px] h-[50px]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-medium text-[#070F1A] mb-1">WhatsApp</h3>
                    <p className="text-[12px] text-[#647491]">Подключите ИИ-бота к WhatsApp</p>
                  </div>
                </div>
                <div className="w-full">
                  <button className="w-full h-[40px] bg-[#0084FF] text-white rounded-[12px] hover:bg-[#0084FF]/90 transition-colors text-[14px]">
                    Подключить
                  </button>
                </div>
              </div>

              {/* VK */}
              <div className="border border-transparent rounded-[15px] p-[15px] group hover:border-[#070F1A]/10 transition-all duration-300">
                <div className="flex items-start gap-[15px] mb-[25px]">
                  <div className="flex-shrink-0">
                    <img src="/group-39.svg" alt="VK" className="w-[50px] h-[50px]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-medium text-[#070F1A] mb-1">VK</h3>
                    <p className="text-[12px] text-[#647491]">Подключите ИИ-бота к ВКонтакте</p>
                  </div>
                </div>
                <div className="w-full">
                  <button className="w-full h-[40px] bg-[#0084FF] text-white rounded-[12px] hover:bg-[#0084FF]/90 transition-colors text-[14px]">
                    Подключить
                  </button>
                </div>
              </div>

              {/* Instagram */}
              <div className="border border-transparent rounded-[15px] p-[15px] group hover:border-[#070F1A]/10 transition-all duration-300">
                <div className="flex items-start gap-[15px] mb-[25px]">
                  <div className="flex-shrink-0">
                    <img src="/group-43.svg" alt="Instagram" className="w-[50px] h-[50px]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-medium text-[#070F1A] mb-1">Instagram</h3>
                    <p className="text-[12px] text-[#647491]">Подключите ИИ-бота к Instagram</p>
                  </div>
                </div>
                <div className="w-full">
                  <button className="w-full h-[40px] bg-[#0084FF] text-white rounded-[12px] hover:bg-[#0084FF]/90 transition-colors text-[14px]">
                    Подключить
                  </button>
                </div>
              </div>
            </div>
            
            {/* Примечание об Instagram */}
            <div className="mt-8 text-center">
              <p className="text-[12px] text-[#647491]">
                *Instagram является продуктом Meta – признанной в РФ экстремисткой организацией
              </p>
            </div>
          </div>
        );

      case 'crm-systems':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-[24px] font-[500] text-[#070F1A]">CRM-системы</h1>
            </div>

            <div className="grid grid-cols-3 gap-[20px]">
              {/* Битрикс24 */}
              <div className="border border-transparent rounded-[15px] p-[15px] group hover:border-[#070F1A]/10 transition-all duration-300">
                <div className="flex items-start gap-[15px] mb-[25px]">
                  <div className="flex-shrink-0">
                    <img src="/group-41.svg" alt="Битрикс24" className="w-[50px] h-[50px]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-medium text-[#070F1A] mb-1">Битрикс24</h3>
                    <p className="text-[12px] text-[#647491]">Интеграция с Битрикс24</p>
                  </div>
                </div>
                <div className="w-full">
                  <button className="w-full h-[40px] bg-[#0084FF] text-white rounded-[12px] hover:bg-[#0084FF]/90 transition-colors text-[14px]">
                    Подключить
                  </button>
                </div>
              </div>

              {/* AmoCRM */}
              <div className="border border-transparent rounded-[15px] p-[15px] group hover:border-[#070F1A]/10 transition-all duration-300">
                <div className="flex items-start gap-[15px] mb-[25px]">
                  <div className="flex-shrink-0">
                    <img src="/group-42.svg" alt="AmoCRM" className="w-[50px] h-[50px]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-medium text-[#070F1A] mb-1">AmoCRM</h3>
                    <p className="text-[12px] text-[#647491]">Интеграция с AmoCRM</p>
                  </div>
                </div>
                <div className="w-full">
                  <button className="w-full h-[40px] bg-[#0084FF] text-white rounded-[12px] hover:bg-[#0084FF]/90 transition-colors text-[14px]">
                    Подключить
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'other-integrations':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-[24px] font-[500] text-[#070F1A]">Другое</h1>
            </div>

            <div className="grid grid-cols-3 gap-[20px]">
              {/* Uclients */}
              <div className="border border-transparent rounded-[15px] p-[15px] group hover:border-[#070F1A]/10 transition-all duration-300">
                <div className="flex items-start gap-[15px] mb-[25px]">
                  <div className="flex-shrink-0">
                    <img src="/group-40.svg" alt="Uclients" className="w-[50px] h-[50px]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-medium text-[#070F1A] mb-1">Uclients</h3>
                    <p className="text-[12px] text-[#647491]">Интеграция с Uclients</p>
                  </div>
                </div>
                <div className="w-full">
                  <button className="w-full h-[40px] bg-[#0084FF] text-white rounded-[12px] hover:bg-[#0084FF]/90 transition-colors text-[14px]">
                    Подключить
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-6">
            <h1 className="text-[24px] font-[500] text-[#070F1A]">Помощь</h1>
            <p className="text-[#647491] text-[14px]">
              Получите помощь по использованию платформы
            </p>
            <div className="text-center py-8 text-gray-500">
              Раздел в разработке
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <h1 className="text-[24px] font-[500] text-[#070F1A]">Профиль</h1>
            <div className="bg-white rounded-[20px] p-6">
              <div className="flex gap-6">
                {/* Левая панель с кнопками */}
                <div className="w-64 space-y-2">
                  <button
                    onClick={() => setProfileTab('personal')}
                    className={`w-full h-10 flex items-center gap-3 px-3 rounded-[10px] text-left transition-colors ${
                      profileTab === 'personal' 
                        ? 'bg-[#1E2538] text-white' 
                        : 'text-[#647491] hover:text-[#070F1A] hover:bg-gray-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-[14px] font-[500]">Личная информация</span>
                  </button>
                  
                  <button
                    onClick={() => setProfileTab('subscription')}
                    className={`w-full h-10 flex items-center gap-3 px-3 rounded-[10px] text-left transition-colors ${
                      profileTab === 'subscription' 
                        ? 'bg-[#1E2538] text-white' 
                        : 'text-[#647491] hover:text-[#070F1A] hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[14px] font-[500]">Тарифы</span>
                  </button>
                  
                  <button
                    onClick={() => setProfileTab('notifications')}
                    className={`w-full h-10 flex items-center gap-3 px-3 rounded-[10px] text-left transition-colors ${
                      profileTab === 'notifications' 
                        ? 'bg-[#1E2538] text-white' 
                        : 'text-[#647491] hover:text-[#070F1A] hover:bg-gray-50'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    <span className="text-[14px] font-[500]">Уведомления</span>
                  </button>
                  
                  <button
                    onClick={() => setProfileTab('theme')}
                    className={`w-full h-10 flex items-center gap-3 px-3 rounded-[10px] text-left transition-colors ${
                      profileTab === 'theme' 
                        ? 'bg-[#1E2538] text-white' 
                        : 'text-[#647491] hover:text-[#070F1A] hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                    <span className="text-[14px] font-[500]">Тема</span>
                  </button>
                </div>

                {/* Правая панель с контентом */}
                <div className="flex-1">
                  {profileTab === 'personal' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: generateAvatar(currentUser?.name).color }}>
                          <span className="text-white font-semibold text-xl">{generateAvatar(currentUser?.name).letter}</span>
                        </div>
                        <div>
                          <h2 className="text-[18px] font-medium text-[#070F1A]">{currentUser?.name || 'Пользователь'}</h2>
                          <p className="text-[14px] text-[#647491]">{currentUser?.company || 'Компания не указана'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[14px] font-medium text-[#647491] mb-2">Имя</label>
                          <input
                            type="text"
                            value={currentUser?.name || ''}
                            onChange={(e) => setCurrentUser(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full h-10 px-4 border border-[#E5E7EB] rounded-[10px] text-[14px] font-[500] focus:outline-none focus:border-[#0084FF]"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[14px] font-medium text-[#647491] mb-2">Название компании</label>
                          <input
                            type="text"
                            value={currentUser?.company || ''}
                            onChange={(e) => setCurrentUser(prev => ({ ...prev, company: e.target.value }))}
                            className="w-full h-10 px-4 border border-[#E5E7EB] rounded-[10px] text-[14px] font-[500] focus:outline-none focus:border-[#0084FF]"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[14px] font-medium text-[#647491] mb-2">Email</label>
                          <input
                            type="email"
                            value={currentUser?.email || ''}
                            onChange={(e) => setCurrentUser(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full h-10 px-4 border border-[#E5E7EB] rounded-[10px] text-[14px] font-[500] focus:outline-none focus:border-[#0084FF]"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[14px] font-medium text-[#647491] mb-2">Телефон</label>
                          <input
                            type="tel"
                            value={currentUser?.phone || ''}
                            onChange={(e) => setCurrentUser(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full h-10 px-4 border border-[#E5E7EB] rounded-[10px] text-[14px] font-[500] focus:outline-none focus:border-[#0084FF]"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
                        <button
                          onClick={handleLogout}
                          className="w-full h-10 bg-red-600 text-white rounded-[10px] text-[14px] font-[500] hover:bg-red-700 transition-colors"
                        >
                          Выйти из аккаунта
                        </button>
                      </div>
                    </div>
                  )}

                  {profileTab === 'subscription' && (
                    <div className="space-y-6">
                      <h2 className="text-[18px] font-medium text-[#070F1A]">Тарифы</h2>
                      <div className="bg-gray-50 rounded-[10px] p-6">
                        <h3 className="text-[16px] font-medium text-[#070F1A] mb-4">Текущий тариф</h3>
                        <div className="bg-white rounded-[10px] p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[14px] font-medium text-[#070F1A]">Бесплатный</span>
                            <span className="text-[12px] text-[#647491]">3 дня осталось</span>
                          </div>
                          <p className="text-[12px] text-[#647491] mb-4">Ограниченный функционал</p>
                          <button className="w-full h-10 bg-[#0084FF] text-white rounded-[10px] text-[14px] font-[500] hover:bg-[#0066CC] transition-colors">
                            Перейти на Pro
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {profileTab === 'notifications' && (
                    <div className="space-y-6">
                      <h2 className="text-[18px] font-medium text-[#070F1A]">Уведомления</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-[10px]">
                          <div>
                            <h3 className="text-[14px] font-medium text-[#070F1A]">Email уведомления</h3>
                            <p className="text-[12px] text-[#647491]">Получать уведомления на email</p>
                          </div>
                          <input type="checkbox" className="w-4 h-4" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-[10px]">
                          <div>
                            <h3 className="text-[14px] font-medium text-[#070F1A]">Push уведомления</h3>
                            <p className="text-[12px] text-[#647491]">Получать push уведомления</p>
                          </div>
                          <input type="checkbox" className="w-4 h-4" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-[10px]">
                          <div>
                            <h3 className="text-[14px] font-medium text-[#070F1A]">Новые сообщения</h3>
                            <p className="text-[12px] text-[#647491]">Уведомления о новых сообщениях</p>
                          </div>
                          <input type="checkbox" className="w-4 h-4" defaultChecked />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {profileTab === 'theme' && (
                    <div className="space-y-6">
                      <h2 className="text-[18px] font-medium text-[#070F1A]">Настройки темы</h2>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-[10px]">
                          <div>
                            <h3 className="text-[14px] font-medium text-[#070F1A]">Темная тема</h3>
                            <p className="text-[12px] text-[#647491]">Классическое оформление платформы</p>
                          </div>
                          <button
                            onClick={() => setTheme('dark')}
                            className={`w-6 h-6 rounded-full border-2 transition-colors ${
                              theme === 'dark' 
                                ? 'bg-[#0084FF] border-[#0084FF]' 
                                : 'bg-white border-[#E5E7EB]'
                            }`}
                          >
                            {theme === 'dark' && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-[10px]">
                          <div>
                            <h3 className="text-[14px] font-medium text-[#070F1A]">Светлая тема</h3>
                            <p className="text-[12px] text-[#647491]">Светлое оформление платформы</p>
                          </div>
                          <button
                            onClick={() => setTheme('light')}
                            className={`w-6 h-6 rounded-full border-2 transition-colors ${
                              theme === 'light' 
                                ? 'bg-[#0084FF] border-[#0084FF]' 
                                : 'bg-white border-[#E5E7EB]'
                            }`}
                          >
                            {theme === 'light' && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
    // Для страницы входа используем новый дизайн
    if (currentStep === 'login') {
        return (
        <div className="min-h-screen flex bg-[#070F1A]">
          {/* Левая часть - форма входа */}
          <div className="w-1/2 bg-[#070F1A] flex flex-col">
            {/* Логотип сверху */}
            <div className="pt-10 flex justify-center">
              <img src="/logo.svg" alt="Adapto" className="h-8" />
            </div>
            
            {/* Форма входа */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white">Вход в Adapto</h2>
                </div>
                
          <div className="space-y-6">
                  <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                        className="h-12 rounded-[10px] border border-white border-opacity-20 bg-transparent text-white placeholder-gray-400 focus:border-white focus:border-opacity-40"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Пароль</label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Введите пароль"
                        required
                        className="h-12 rounded-[10px] border border-white border-opacity-20 bg-transparent text-white placeholder-gray-400 focus:border-white focus:border-opacity-40"
                      />
                    </div>
                    
                    {formErrors.general && (
                      <div className="text-red-400 text-sm">{formErrors.general}</div>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-[10px] text-white"
                      style={{ background: 'linear-gradient(40deg, #096EFD 0%, #52AEFF 100%)' }}
                    >
                      Войти в аккаунт
                    </Button>
                    
                    <div className="text-center">
                      <button
                        type="button"
                        className="text-gray-300 hover:text-white text-sm"
                      >
                        Забыл пароль?
                      </button>
            </div>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setCurrentStep('register')}
                        className="text-gray-300 hover:text-white text-sm"
                      >
                        Нет аккаунта? Зарегистрироваться
                      </button>
                  </div>
                  </form>
                    </div>
                    </div>
                    </div>
                    </div>
          
          {/* Правая часть - изображение с цитатой */}
          <div className="w-1/2 relative p-[15px]">
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat rounded-[20px] bg-[#070F1A]"
              style={{
                backgroundImage: 'url(/login-background.png)'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center rounded-[20px]">
                <div className="text-center text-white max-w-[500px] px-8">
                  <div className="mb-8">
                    <h3 className="text-3xl font-semibold mb-4 leading-tight">
                      В быстроменяющемся мире самое главное – это способность к адаптации.
                    </h3>
                    <p className="text-lg opacity-80">
                      Илон Маск, основатель xAI
                    </p>
                  </div>
                </div>
          </div>
            </div>
          </div>
        </div>
      );
    }
    
        // Для страницы регистрации используем новый дизайн
        return (
      <div className="min-h-screen flex bg-[#070F1A]">
        {/* Левая часть - форма регистрации */}
        <div className="w-1/2 bg-[#070F1A] flex flex-col">
          {/* Логотип сверху */}
          <div className="pt-10 flex justify-center">
            <img src="/logo.svg" alt="Adapto" className="h-8" />
          </div>
          
          {/* Форма регистрации */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white">Регистрация</h2>
              </div>
              
          <div className="space-y-6">
                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                  {/* Имя и Компания на одной линии */}
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Имя</label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ваше имя"
                        required
                        className="h-12 rounded-[10px] border border-white border-opacity-20 bg-transparent text-white placeholder-gray-400 focus:border-white focus:border-opacity-40"
                      />
                    </div>
                    
                <div>
                      <label className="block text-sm font-medium mb-2 text-white">Компания</label>
                      <Input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Название компании"
                        required
                        className="h-12 rounded-[10px] border border-white border-opacity-20 bg-transparent text-white placeholder-gray-400 focus:border-white focus:border-opacity-40"
                      />
                    </div>
                </div>
                
                  {/* Email и Телефон на одной линии */}
                  <div className="grid grid-cols-2 gap-5">
                <div>
                      <label className="block text-sm font-medium mb-2 text-white">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                        className="h-12 rounded-[10px] border border-white border-opacity-20 bg-transparent text-white placeholder-gray-400 focus:border-white focus:border-opacity-40"
                  />
                </div>

                <div>
                      <label className="block text-sm font-medium mb-2 text-white">Номер телефона</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          setFormData({ ...formData, phone: formatted });
                          const error = validatePhone(formatted);
                          setValidationErrors({ ...validationErrors, phone: error });
                        }}
                        placeholder="+7 (999) 123-45-67"
                        required
                        className="h-12 rounded-[10px] border border-white border-opacity-20 bg-transparent text-white placeholder-gray-400 focus:border-white focus:border-opacity-40"
                      />
                    </div>
                </div>

                  {/* Ошибка валидации телефона */}
                  {validationErrors.phone && (
                    <div className="text-red-400 text-sm mt-1">{validationErrors.phone}</div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Пароль</label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Создайте пароль"
                      required
                      className="h-12 rounded-[10px] border border-white border-opacity-20 bg-transparent text-white placeholder-gray-400 focus:border-white focus:border-opacity-40"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-[10px] text-white"
                    style={{ background: 'linear-gradient(40deg, #096EFD 0%, #52AEFF 100%)' }}
                  >
                    Создать аккаунт
                </Button>
                  
                  <div className="text-center space-y-4">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Нажимая "Создать аккаунт", вы соглашаетесь с условиями Оферты и даете согласие на обработку персональных данных в соответствии с Политикой Конфиденциальности
                    </p>
                    <button
                      type="button"
                      onClick={() => setCurrentStep('login')}
                      className="text-gray-300 hover:text-white text-sm"
                    >
                      Уже есть аккаунт? Войти
                    </button>
          </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {/* Правая часть - изображение с цитатой */}
        <div className="w-1/2 relative p-[15px]">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat rounded-[20px] bg-[#070F1A]"
            style={{
              backgroundImage: 'url(/registration-background.png)'
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center rounded-[20px]">
              <div className="text-center text-white max-w-[500px] px-8">
                <div className="mb-8">
                  <h3 className="text-3xl font-semibold mb-4 leading-tight">
                    Сегодня мы находимся на заре новой эпохи, где главное — не сила, не размер, а скорость и адаптивность.
                  </h3>
                  <p className="text-lg opacity-80">
                    Джек Ма, основатель Alibaba
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className={`h-screen flex ${theme === 'light' ? 'bg-[#F3F5F7]' : 'bg-[#070F1A]'}`}>
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300">
          <div className="text-sm font-medium mb-[11px]">Уведомление</div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{notificationMessage}</span>
            <button 
              onClick={() => setShowNotification(false)}
              className="ml-4 text-red-600 hover:text-red-800 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Metric Info Modal */}
      {showMetricInfoModal && currentMetricInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-[20px] p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#070F1A]">{currentMetricInfo.title}</h2>
              <button 
                onClick={() => setShowMetricInfoModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-[#070F1A] mb-2">Описание</h3>
                <p className="text-[#647491] text-sm leading-relaxed">{currentMetricInfo.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-[#070F1A] mb-2">Формула расчета</h3>
                <div className="bg-[#F3F5F7] rounded-[10px] p-4">
                  <p className="text-[#070F1A] font-mono text-sm">{currentMetricInfo.formula}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-[#070F1A] mb-2">Подробное объяснение</h3>
                <div className="space-y-3">
                  {currentMetricInfo.explanation.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-[#647491] text-sm leading-relaxed">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowMetricInfoModal(false)}
                className="px-6 py-2 bg-[#0084FF] text-white rounded-[10px] hover:bg-[#0073E6] transition-colors"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed md:relative z-50 md:z-auto transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 ${sidebarCollapsed ? 'w-12' : 'w-56'} h-full ${theme === 'light' ? 'bg-[#F3F5F7]' : 'bg-[#070F1A]'} flex flex-col`}>
        
        {/* Header with Logo and Language Icon */}
                        <div className="px-[10px] pt-5 pb-0" style={{ width: 'calc(100% + 10px)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center pl-[10px]">
              {!sidebarCollapsed && (
                <button
                  onClick={() => {
                    setActiveSection('main');
                    localStorage.setItem('currentSection', 'main');
                    setSidebarOpen(false);
                  }}
                  className="hover:opacity-80 transition-opacity"
                >
                                      <img src={theme === 'light' ? '/Логотип-блэк.svg' : '/logo.svg'} alt="Adapto" className="w-[110px] h-6" />
                </button>
              )}
            </div>
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'gap-2'}`}>
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`text-gray-400 hover:text-white transition-colors ${sidebarCollapsed ? '-ml-[6px]' : ''}`}
              >
                <img 
                  src={theme === 'light' ? "/светлая тема.svg" : "/темная тема.svg"} 
                  alt="Toggle sidebar" 
                  className="w-4 h-4"
                />
              </button>

            </div>
          </div>
        </div>
        
        {/* Navigation */}
                        <div className="flex-1 px-[10px] pt-5" style={{ width: 'calc(100% + 10px)' }}>
          <nav className="space-y-2">


            {menuItems.map((item) => (
              <div key={item.id}>
              <button
                onClick={() => {
                    if (item.hasSubmenu) {
                      if (sidebarCollapsed) {
                        // В сокращенном меню - открываем полное меню
                        setSidebarCollapsed(false);
                        setExpandedMenus(prev => 
                          prev.includes(item.id) 
                            ? prev.filter(id => id !== item.id)
                            : [...prev, item.id]
                        );
                      } else {
                        setExpandedMenus(prev => 
                          prev.includes(item.id) 
                            ? prev.filter(id => id !== item.id)
                            : [...prev, item.id]
                        );
                      }
                    } else {
                  setActiveSection(item.id);
                  localStorage.setItem('currentSection', item.id);
                  setSidebarOpen(false);
                    }
                }}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center w-[34px] h-[34px]' : 'gap-3'} px-3 h-[34px] rounded-[10px] text-left transition-colors ${
                  activeSection === item.id 
                          ? theme === 'light' ? 'bg-[#FFFFFF] text-[#070F1A]' : 'bg-[#1E2538] text-white'
                          : theme === 'light' ? 'text-[#070F1A]/60 hover:text-[#070F1A] hover:bg-gray-50' : 'text-[#B3B7B9] hover:text-white hover:bg-[#1E2538]'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                {typeof item.icon === 'function' ? (
                  <div className={`${sidebarCollapsed ? 'w-4 h-4' : 'w-4 h-4'}`}>
                    {React.cloneElement(item.icon(), {
                      className: `${sidebarCollapsed ? 'w-4 h-4' : 'w-4 h-4'} ${activeSection === item.id ? 'filter brightness-0 invert' : ''}`,
                      style: {
                        filter: activeSection === item.id 
                          ? theme === 'light' ? 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0) contrast(1)' 
                          : 'brightness(0) invert(1)'
                          : theme === 'light' ? 'brightness(0) saturate(100%) invert(40%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.7) contrast(1)' 
                          : 'brightness(0) saturate(100%) invert(70%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.7) contrast(1)'
                      }
                    })}
                  </div>
                ) : (
                  <img 
                      src={`/${item.id === 'statistics' ? 'dashboard' : 
                         item.id === 'dialogs' ? 'chat' : 
                         item.id === 'knowledge' ? 'knowledge-base' : 
                           item.id === 'integrations' ? 'integration-2' : 
                           item.id === 'help' ? 'help' : 
                           'default'}.svg?v=${Date.now()}`} 
                    alt={item.label}
                    className={`${sidebarCollapsed ? 'w-4 h-4' : 'w-4 h-4'} ${activeSection === item.id ? 'filter brightness-0 invert' : ''}`}
                    style={{
                        filter: activeSection === item.id 
                          ? theme === 'light' ? 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0) contrast(1)' 
                          : 'brightness(0) invert(1)'
                          : theme === 'light' ? 'brightness(0) saturate(100%) invert(40%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.7) contrast(1)' 
                          : 'brightness(0) saturate(100%) invert(70%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.7) contrast(1)'
                    }}
                  />
                )}
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span className="text-[14px] font-medium tracking-[-0.1px]">{item.label}</span>
                      {item.hasSubmenu && (
                        <img 
                          src="/chevron-right.svg" 
                          alt="Expand" 
                          className={`w-4 h-4 transition-transform ${
                            expandedMenus.includes(item.id) 
                              ? 'rotate-90' 
                              : ''
                          }`}
                          style={{
                            filter: activeSection === item.id
                              ? theme === 'light' ? 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0) contrast(1)'
                              : 'brightness(0) invert(1)'
                              : theme === 'light' ? 'brightness(0) saturate(100%) invert(40%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.7) contrast(1)'
                              : 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.7) contrast(1)'
                          }}
                        />
                      )}
                    </div>
                  )}
                </button>

                {/* Submenu */}
                {item.hasSubmenu && expandedMenus.includes(item.id) && !sidebarCollapsed && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          setActiveSection(subItem.id);
                          localStorage.setItem('currentSection', subItem.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 h-[34px] rounded-[8px] text-left transition-colors ${
                                            activeSection === subItem.id
                    ? theme === 'light' ? 'bg-[#FFFFFF] text-[#070F1A]' : 'bg-[#1E2538] text-white'
                    : theme === 'light' ? 'text-[#070F1A]/60 hover:text-[#070F1A] hover:bg-gray-50' : 'text-[#B3B7B9] hover:text-white hover:bg-[#1E2538]'
                        }`}
                      >
                        {typeof subItem.icon === 'function' ? (
                          <div className={`${sidebarCollapsed ? 'w-4 h-4' : 'w-4 h-4'}`}>
                            {React.cloneElement(subItem.icon(), {
                              className: `${sidebarCollapsed ? 'w-4 h-4' : 'w-4 h-4'} ${activeSection === subItem.id ? 'filter brightness-0 invert' : ''}`,
                              style: {
                                filter: activeSection === subItem.id 
                                  ? theme === 'light' ? 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0) contrast(1)' 
                                  : 'brightness(0) invert(1)'
                                  : theme === 'light' ? 'brightness(0) saturate(100%) invert(40%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.7) contrast(1)' 
                                  : 'brightness(0) saturate(100%) invert(70%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.7) contrast(1)'
                              }
                            })}
                          </div>
                        ) : (
                          <img 
                            src={`/${subItem.id === 'my-adapto' ? 'mouse-square-menu' : 
                                 subItem.id === 'model-settings' ? 'model-settings' : 
                                 subItem.id === 'model-extensions' ? 'extensions' : 
                                 subItem.id === 'widget-settings' ? 'widget' : 
                                 subItem.id === 'messengers' ? 'chat' : 
                                 subItem.id === 'crm-systems' ? 'crm' : 
                                 subItem.id === 'other-integrations' ? 'other' : 
                                 'default'}.svg?v=${Date.now()}`} 
                            alt={subItem.label}
                            className={`${sidebarCollapsed ? 'w-4 h-4' : 'w-4 h-4'} ${activeSection === subItem.id ? 'filter brightness-0 invert' : ''}`}
                            style={{
                              filter: activeSection === subItem.id 
                                ? theme === 'light' ? 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0) contrast(1)' 
                                : 'brightness(0) invert(1)'
                                : theme === 'light' ? 'brightness(0) saturate(100%) invert(40%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.7) contrast(1)' 
                                : 'brightness(0) saturate(100%) invert(70%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.7) contrast(1)'
                            }}
                          />
                        )}
                        <span className="text-[12px] font-medium tracking-[-0.1px]">{subItem.label}</span>
              </button>
            ))}
                  </div>
                )}
              </div>
            ))}

          </nav>
        </div>

        {/* User Profile */}
                        <div className="px-[10px] pb-[15px]" style={{ width: 'calc(100% + 10px)' }}>
          {!sidebarCollapsed ? (
            <>
              {/* Плашка с тарифом */}
              <div className="w-full h-[100px] rounded-[12px] mb-[10px] relative overflow-hidden" style={{ 
                backgroundImage: 'url(/Frame-17-new.webp)', backgroundSize: 'cover', backgroundPosition: 'center top'
              }}>
                
                {/* Контент */}
                <div className="relative z-10 p-[10px] h-full flex flex-col justify-between">
                  <div>
                    <div className="text-white font-medium text-[14px] mb-2">У вас осталось 3 дня<br />до конца пробного периода</div>
          </div>
          
                  <div className="flex items-center justify-between">
                    <button className="bg-white text-[#070F1A] font-semibold text-[11px] px-6 py-2 rounded-[10px] hover:bg-gray-100 transition-colors">
                      Купить подписку
            </button>
                    <img src="/892189398213.svg" alt="" className="w-[34px] h-[34px] opacity-20" />
          </div>
                </div>
              </div>
              
              {/* Кнопка Помощь */}
              <button
                onClick={() => {
                  setActiveSection('help');
                  localStorage.setItem('currentSection', 'help');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 h-[34px] rounded-[10px] text-left transition-colors mb-[10px] ${
                  activeSection === 'help' 
                    ? theme === 'light' ? 'bg-[#FFFFFF] text-[#070F1A]' : 'bg-[#1E2538] text-white'
                    : theme === 'light' ? 'text-[#070F1A]/60 hover:text-[#070F1A] hover:bg-gray-50' : 'text-[#B3B7B9] hover:text-white hover:bg-[#1E2538]'
                }`}
              >
                <img 
                  src="/666.svg" 
                  alt="Помощь" 
                  className="w-4 h-4" 
                  style={{
                    filter: activeSection === 'help' 
                      ? theme === 'light' ? 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0) contrast(1)'
                      : 'brightness(0) invert(1)' 
                      : theme === 'light' ? 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0) contrast(1)'
                      : 'brightness(0) saturate(100%) invert(70%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.7) contrast(1)',
                    opacity: activeSection === 'help' ? 1 : theme === 'light' ? 0.6 : 1
                  }}
                />
                <span className="text-[14px] font-medium tracking-[-0.1px]">Помощь</span>
              </button>
              
              {/* Профиль пользователя */}
              <div className={`rounded-[12px] p-3 mb-[10px] mt-[5px] cursor-pointer transition-colors h-[34px] flex items-center ${
                theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-[#1E2538]'
              }`} onClick={() => {
                setActiveSection('profile');
                localStorage.setItem('currentSection', 'profile');
                setSidebarOpen(false);
              }}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: generateAvatar(currentUser?.name).color }}>
                    <span className="text-white font-semibold text-xs">{generateAvatar(currentUser?.name).letter}</span>
                    </div>
                    <div className={`text-[14px] font-medium ${theme === 'light' ? 'text-[#070F1A]' : 'text-white'}`}>{currentUser?.name || 'Пользователь'}</div>
                </div>
              </div>
            </>
          ) : (
            /* Укороченная версия профиля при скрытом меню */
            <div className="flex flex-col items-center gap-2">
              {/* Кнопка помощи */}
              <button
                onClick={() => {
                  setActiveSection('help');
                  localStorage.setItem('currentSection', 'help');
                  setSidebarOpen(false);
                }}
                        className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center transition-colors ${
          activeSection === 'help'
            ? theme === 'light' ? 'bg-[#FFFFFF] text-[#070F1A]' : 'bg-[#1E2538] text-white'
            : theme === 'light' ? 'text-[#070F1A]/60 hover:text-[#070F1A] hover:bg-gray-50' : 'text-[#B3B7B9] hover:text-white hover:bg-[#1E2538]'
        }`}
                title="Помощь"
              >
                <img 
                  src="/666.svg" 
                  alt="Помощь" 
                  className="w-4 h-4" 
                  style={{
                    filter: activeSection === 'help' 
                      ? theme === 'light' ? 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0) contrast(1)'
                      : 'brightness(0) invert(1)' 
                      : theme === 'light' ? 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0) contrast(1)'
                      : 'brightness(0) saturate(100%) invert(70%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.7) contrast(1)',
                    opacity: activeSection === 'help' ? 1 : theme === 'light' ? 0.6 : 1
                  }}
                />
              </button>
              
              {/* Профиль пользователя */}
              <div className={`cursor-pointer ${theme === 'light' ? 'hover:bg-gray-50 rounded-[10px] p-1' : ''}`} onClick={() => {
                setActiveSection('profile');
                localStorage.setItem('currentSection', 'profile');
                setSidebarOpen(false);
              }}>
                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: generateAvatar(currentUser?.name).color }}>
                  <span className="text-white font-semibold text-[10px]">{generateAvatar(currentUser?.name).letter}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
                  <div className={`md:hidden flex items-center gap-4 p-4 border-b ${theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-700 bg-[#070F1A]'}`}>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="text-white"
          >
            <Menu className="w-4 h-4" />
          </Button>
          <h1 className="font-medium text-white">Adapto AI Platform</h1>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-white rounded-[20px] m-[15px] ml-[10px]">
          <div className="p-6">
          {renderContent()}
          </div>
        </main>
      </div>

      {/* Widget Constructor Modal */}
      {showWidgetConstructor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowWidgetConstructor(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowWidgetConstructor(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ←
                </button>
                <h3 className="text-xl font-semibold">Интеграции / Виджет</h3>
    </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText('<script src="https://adapto.ai/widget.js"></script>');
                  showNotificationMessage('Скрипт скопирован!');
                  // Устанавливаем виджет как установленный
                  setIntegrations(prev => prev.map(item => 
                    item.id === 'widget' 
                      ? { ...item, installed: true }
                      : item
                  ));
                  setShowWidgetConstructor(false);
                }}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Скопировать скрипт
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-8">
                {/* Settings */}
                <div className="space-y-6">
                  {/* Accent Color */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Акцентный цвет</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        value={widgetSettings.accentColor}
                        onChange={(e) => setWidgetSettings({...widgetSettings, accentColor: e.target.value})}
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="HEX"
                      />
                      <input 
                        type="color" 
                        value={widgetSettings.accentColor}
                        onChange={(e) => setWidgetSettings({...widgetSettings, accentColor: e.target.value})}
                        className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                      />
                      <button 
                        onClick={() => setWidgetSettings({...widgetSettings, accentColor: '#1354FC'})}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {/* Button Color */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Цвет кнопки</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'light', label: 'Светлый фон', bg: 'bg-white', border: 'border-blue-500', text: 'text-blue-500' },
                        { id: 'dark', label: 'Темный фон', bg: 'bg-gray-900', border: 'border-white', text: 'text-white' },
                        { id: 'custom', label: 'Задать свой цвет', bg: 'bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500', border: 'border-blue-500', text: 'text-white' }
                      ].map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setWidgetSettings({...widgetSettings, buttonColor: style.id})}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            widgetSettings.buttonColor === style.id 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div 
                            className={`w-[140px] h-[42px] rounded-xl flex items-center justify-center gap-2 mb-2 mx-auto ${
                              style.id === 'light' ? 'bg-white border-2 border-gray-300' :
                              style.id === 'dark' ? 'bg-gray-900' :
                              'bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500'
                            }`}
                            style={{
                              borderColor: style.id === 'light' ? widgetSettings.accentColor : 'transparent',
                              color: style.id === 'light' ? widgetSettings.accentColor : 'white'
                            }}
                          >
                            <div 
                              className="w-4 h-4 rounded-full opacity-80"
                              style={{ backgroundColor: style.id === 'light' ? widgetSettings.accentColor : 'currentColor' }}
                            ></div>
                            <span className="text-sm font-medium" style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              Спросить ИИ
                            </span>
                          </div>
                          <span className={`text-xs ${widgetSettings.buttonColor === style.id ? 'text-blue-600' : 'text-gray-600'}`}>
                            {style.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Button Text */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Название кнопки</label>
                    <input 
                      type="text" 
                      value={widgetSettings.buttonText}
                      onChange={(e) => setWidgetSettings({...widgetSettings, buttonText: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Спросить ИИ"
                    />
                  </div>

                  {/* Avatar */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Аватар Adapto</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setWidgetSettings({...widgetSettings, avatar: 'default'})}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          widgetSettings.avatar === 'default' 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <div className="flex items-center justify-center w-6 h-6">
                            <div className="w-3 h-3 bg-white rounded-full mr-1"></div>
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <span className="text-xs text-center block">По умолчанию</span>
                      </button>
                      <button
                        onClick={() => document.getElementById('avatar-input')?.click()}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          widgetSettings.avatar === 'custom' 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-gray-500">+</span>
                        </div>
                        <span className="text-xs text-center block">Загрузить</span>
                        <input 
                          id="avatar-input"
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setWidgetSettings({...widgetSettings, avatar: 'custom'});
                              showNotificationMessage('Аватар загружен!');
                            }
                          }}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Custom Color Picker */}
                {widgetSettings.buttonColor === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium mb-3">Введите цвет для фона</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        value={widgetSettings.customButtonColor}
                        onChange={(e) => setWidgetSettings({...widgetSettings, customButtonColor: e.target.value})}
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="HEX"
                      />
                      <input 
                        type="color" 
                        value={widgetSettings.customButtonColor}
                        onChange={(e) => setWidgetSettings({...widgetSettings, customButtonColor: e.target.value})}
                        className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Расположение виджета */}
                <div>
                  <label className="block text-sm font-medium mb-3">Расположение виджета</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setWidgetSettings({...widgetSettings, widgetLocation: 'default'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        widgetSettings.widgetLocation === 'default' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium mb-1">По умолчанию</div>
                        <div className="text-sm text-gray-600">Правый нижний угол</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setWidgetSettings({...widgetSettings, widgetLocation: 'custom'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        widgetSettings.widgetLocation === 'custom' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium mb-1">Настроить</div>
                        <div className="text-sm text-gray-600">Выбрать позицию</div>
                      </div>
                    </button>
                  </div>
                  
                  {/* Настройки расположения виджета */}
                  {widgetSettings.widgetLocation === 'custom' && (
                    <div className="mt-4 space-y-6 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Для компьютеров</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Отступ снизу</label>
                            <input 
                              type="number" 
                              value={widgetSettings.desktopBottomOffset}
                              onChange={(e) => setWidgetSettings({...widgetSettings, desktopBottomOffset: parseInt(e.target.value)})}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Отступ справа</label>
                            <input 
                              type="number" 
                              value={widgetSettings.desktopRightOffset}
                              onChange={(e) => setWidgetSettings({...widgetSettings, desktopRightOffset: parseInt(e.target.value)})}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Для телефонов</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Отступ снизу</label>
                            <input 
                              type="number" 
                              value={widgetSettings.mobileBottomOffset}
                              onChange={(e) => setWidgetSettings({...widgetSettings, mobileBottomOffset: parseInt(e.target.value)})}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Отступ справа</label>
                            <input 
                              type="number" 
                              value={widgetSettings.mobileRightOffset}
                              onChange={(e) => setWidgetSettings({...widgetSettings, mobileRightOffset: parseInt(e.target.value)})}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Z-index</label>
                        <input 
                          type="number" 
                          value={widgetSettings.zIndex}
                          onChange={(e) => setWidgetSettings({...widgetSettings, zIndex: parseInt(e.target.value)})}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          min="1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Приветственное сообщение */}
                <div>
                  <label className="block text-sm font-medium mb-3">Приветственное сообщение</label>
                  <div className="space-y-3">
                    {widgetSettings.welcomeMessages.map((message, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          type="text" 
                          value={message}
                          onChange={(e) => {
                            const newMessages = [...widgetSettings.welcomeMessages];
                            newMessages[index] = e.target.value;
                            setWidgetSettings({...widgetSettings, welcomeMessages: newMessages});
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Приветственное сообщение"
                        />
                        <button 
                          onClick={() => {
                            const newMessages = widgetSettings.welcomeMessages.filter((_, i) => i !== index);
                            setWidgetSettings({...widgetSettings, welcomeMessages: newMessages});
                          }}
                          className="px-3 py-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newMessages = [...widgetSettings.welcomeMessages, ''];
                        setWidgetSettings({...widgetSettings, welcomeMessages: newMessages});
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Добавить сообщение
                    </button>
                  </div>
                </div>

                {/* Триггерный вопрос */}
                <div>
                  <label className="block text-sm font-medium mb-3">Триггерный вопрос</label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => setWidgetSettings({...widgetSettings, triggerQuestionEnabled: 'no'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        widgetSettings.triggerQuestionEnabled === 'no' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium">Нет</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setWidgetSettings({...widgetSettings, triggerQuestionEnabled: 'yes'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        widgetSettings.triggerQuestionEnabled === 'yes' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium">Есть</div>
                      </div>
                    </button>
                  </div>
                  
                  {widgetSettings.triggerQuestionEnabled === 'yes' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium mb-2">Через какое время показать:</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            value={widgetSettings.triggerQuestionDelay}
                            onChange={(e) => setWidgetSettings({...widgetSettings, triggerQuestionDelay: parseInt(e.target.value)})}
                            className="w-20 p-2 border border-gray-300 rounded-lg text-sm"
                            min="1"
                          />
                          <span className="text-sm text-gray-600">сек</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Вопрос:</label>
                        <textarea 
                          value={widgetSettings.triggerQuestionText}
                          onChange={(e) => setWidgetSettings({...widgetSettings, triggerQuestionText: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          rows="3"
                          placeholder="Введите вопрос"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Быстрые ответы:</label>
                        <div className="space-y-2">
                          {widgetSettings.quickReplies.map((reply, index) => (
                            <div key={index} className="flex gap-2">
                              <input 
                                type="text" 
                                value={reply}
                                onChange={(e) => {
                                  const newReplies = [...widgetSettings.quickReplies];
                                  newReplies[index] = e.target.value;
                                  setWidgetSettings({...widgetSettings, quickReplies: newReplies});
                                }}
                                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Быстрый ответ"
                              />
                              <button 
                                onClick={() => {
                                  const newReplies = widgetSettings.quickReplies.filter((_, i) => i !== index);
                                  setWidgetSettings({...widgetSettings, quickReplies: newReplies});
                                }}
                                className="px-3 py-2 text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={() => {
                              const newReplies = [...widgetSettings.quickReplies, ''];
                              setWidgetSettings({...widgetSettings, quickReplies: newReplies});
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            + Добавить быстрый ответ
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Follow up сообщение */}
                <div>
                  <label className="block text-sm font-medium mb-3">Follow up сообщение</label>
                  <p className="text-sm text-gray-600 mb-4">Сообщение, которое увидит пользователь, если выйдет из диалога</p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => setWidgetSettings({...widgetSettings, followUpMessage: 'no'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        widgetSettings.followUpMessage === 'no' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium">Нет</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setWidgetSettings({...widgetSettings, followUpMessage: 'yes'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        widgetSettings.followUpMessage === 'yes' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium">Есть</div>
                      </div>
                    </button>
                  </div>
                  
                  {widgetSettings.followUpMessage === 'yes' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium mb-2">Через какое время показать:</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            value={widgetSettings.followUpDelay}
                            onChange={(e) => setWidgetSettings({...widgetSettings, followUpDelay: parseInt(e.target.value)})}
                            className="w-20 p-2 border border-gray-300 rounded-lg text-sm"
                            min="1"
                          />
                          <span className="text-sm text-gray-600">сек</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Вопрос:</label>
                        <textarea 
                          value={widgetSettings.followUpQuestion}
                          onChange={(e) => setWidgetSettings({...widgetSettings, followUpQuestion: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          rows="3"
                          placeholder="Введите вопрос"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Быстрые ответы:</label>
                        <div className="space-y-2">
                          {widgetSettings.followUpQuickReply && (
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={widgetSettings.followUpQuickReply}
                                onChange={(e) => setWidgetSettings({...widgetSettings, followUpQuickReply: e.target.value})}
                                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Быстрый ответ"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ссылка на политику обработки персональных данных */}
                <div>
                  <label className="block text-sm font-medium mb-2">Ссылка на политику обработки персональных данных</label>
                  <input 
                    type="url" 
                    value={widgetSettings.privacyPolicyUrl}
                    onChange={(e) => setWidgetSettings({...widgetSettings, privacyPolicyUrl: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="https://example.com/privacy"
                  />
                </div>

                {/* Какие метки собирать */}
                <div>
                  <label className="block text-sm font-medium mb-3">Какие метки собирать</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'utm_source',
                      'utm_medium', 
                      'utm_campaign',
                      'utm_term',
                      'utm_content',
                      'roistat_visit',
                      'gclid',
                      'fbclid'
                    ].map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          const current = widgetSettings.dataTags || [];
                          const newTags = current.includes(tag)
                            ? current.filter(t => t !== tag)
                            : [...current, tag];
                          setWidgetSettings({...widgetSettings, dataTags: newTags});
                        }}
                        className={`p-2 rounded-lg border-2 transition-all text-sm ${
                          (widgetSettings.dataTags || []).includes(tag)
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <button 
                      onClick={() => {
                        const newTag = prompt('Введите название метки:');
                        if (newTag && !widgetSettings.dataTags.includes(newTag)) {
                          const newTags = [...widgetSettings.dataTags, newTag];
                          setWidgetSettings({...widgetSettings, dataTags: newTags});
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Добавить метку
                    </button>
                  </div>
                </div>

                {/* Режим работы виджета */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4">Режим работы виджета</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setWidgetSettings({...widgetSettings, widgetMode: 'chat'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        widgetSettings.widgetMode === 'chat' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Чат</span>
                      </div>
                      <p className="text-sm text-gray-600">Обычный режим чата с ИИ-ассистентом</p>
                    </button>
                    <button
                      onClick={() => setWidgetSettings({...widgetSettings, widgetMode: 'questions'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        widgetSettings.widgetMode === 'questions' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <HelpCircle className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Быстрые вопросы</span>
                      </div>
                      <p className="text-sm text-gray-600">Предустановленные вопросы с готовыми ответами</p>
                    </button>
                  </div>
                </div>

                {/* Быстрые вопросы */}
                {widgetSettings.widgetMode === 'questions' && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold mb-4">Быстрые вопросы</h4>
                    <div className="space-y-4">
                      {widgetSettings.quickQuestions.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h5 className="font-medium">Вопрос {index + 1}</h5>
                            <button
                              onClick={() => {
                                const newQuestions = widgetSettings.quickQuestions.filter((_, i) => i !== index);
                                setWidgetSettings({...widgetSettings, quickQuestions: newQuestions});
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">Вопрос</label>
                              <input
                                type="text"
                                value={item.question}
                                onChange={(e) => {
                                  const newQuestions = [...widgetSettings.quickQuestions];
                                  newQuestions[index].question = e.target.value;
                                  setWidgetSettings({...widgetSettings, quickQuestions: newQuestions});
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Введите вопрос"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Ответ</label>
                              <textarea
                                value={item.answer}
                                onChange={(e) => {
                                  const newQuestions = [...widgetSettings.quickQuestions];
                                  newQuestions[index].answer = e.target.value;
                                  setWidgetSettings({...widgetSettings, quickQuestions: newQuestions});
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm h-20 resize-none"
                                placeholder="Введите ответ"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newQuestions = [...widgetSettings.quickQuestions, { question: '', answer: '' }];
                          setWidgetSettings({...widgetSettings, quickQuestions: newQuestions});
                        }}
                        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                      >
                        + Добавить вопрос
                      </button>
                    </div>
                  </div>
                )}

                {/* Форма заявки */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4">Форма заявки</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setWidgetSettings({...widgetSettings, leadFormEnabled: 'yes'})}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          widgetSettings.leadFormEnabled === 'yes' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Включить
                      </button>
                      <button
                        onClick={() => setWidgetSettings({...widgetSettings, leadFormEnabled: 'no'})}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          widgetSettings.leadFormEnabled === 'no' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Отключить
                      </button>
                    </div>
                    
                    {widgetSettings.leadFormEnabled === 'yes' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Заголовок формы</label>
                          <input
                            type="text"
                            value={widgetSettings.leadFormTitle}
                            onChange={(e) => setWidgetSettings({...widgetSettings, leadFormTitle: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Оставьте заявку"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Описание формы</label>
                          <input
                            type="text"
                            value={widgetSettings.leadFormDescription}
                            onChange={(e) => setWidgetSettings({...widgetSettings, leadFormDescription: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Мы свяжемся с вами в ближайшее время"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Поля формы</label>
                          <div className="space-y-3">
                            {widgetSettings.leadFormFields.map((field, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => {
                                      const newFields = [...widgetSettings.leadFormFields];
                                      newFields[index].label = e.target.value;
                                      setWidgetSettings({...widgetSettings, leadFormFields: newFields});
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Название поля"
                                  />
                                </div>
                                <select
                                  value={field.type}
                                  onChange={(e) => {
                                    const newFields = [...widgetSettings.leadFormFields];
                                    newFields[index].type = e.target.value;
                                    setWidgetSettings({...widgetSettings, leadFormFields: newFields});
                                  }}
                                  className="p-2 border border-gray-300 rounded-lg text-sm"
                                >
                                  <option value="text">Текст</option>
                                  <option value="email">Email</option>
                                  <option value="tel">Телефон</option>
                                </select>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => {
                                      const newFields = [...widgetSettings.leadFormFields];
                                      newFields[index].required = e.target.checked;
                                      setWidgetSettings({...widgetSettings, leadFormFields: newFields});
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-sm">Обязательное</span>
                                </label>
                                <button
                                  onClick={() => {
                                    const newFields = widgetSettings.leadFormFields.filter((_, i) => i !== index);
                                    setWidgetSettings({...widgetSettings, leadFormFields: newFields});
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newFields = [...widgetSettings.leadFormFields, { name: '', label: '', type: 'text', required: false }];
                                setWidgetSettings({...widgetSettings, leadFormFields: newFields});
                              }}
                              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                            >
                              + Добавить поле
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Предложения */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4">Предложения</h4>
                  <div className="space-y-4">
                    {widgetSettings.quickReplies.map((reply, index) => (
                      <div key={index} className="flex items-center border rounded-md p-2">
                        <input
                          type="text"
                          value={reply}
                          onChange={(e) => {
                            const newReplies = [...widgetSettings.quickReplies];
                            newReplies[index] = e.target.value;
                            setWidgetSettings({...widgetSettings, quickReplies: newReplies});
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                          placeholder={`Сообщение ${index + 1}`}
                        />
                        <button
                          onClick={() => {
                            const newReplies = widgetSettings.quickReplies.filter((_, i) => i !== index);
                            setWidgetSettings({...widgetSettings, quickReplies: newReplies});
                          }}
                          className="ml-2 text-red-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newReplies = [...widgetSettings.quickReplies, ''];
                        setWidgetSettings({...widgetSettings, quickReplies: newReplies});
                      }}
                      className="text-blue-400 hover:text-blue-600 font-medium"
                    >
                      + Добавить сообщение
                    </button>
                    <p className="text-sm text-gray-500">Укажите сообщения, которые будут автоматически видны в виджете и предложены пользователю для отправки</p>
                  </div>
                </div>

                {/* Приветственные сообщения */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4">Приветственные сообщения</h4>
                  <div className="space-y-4">
                    {widgetSettings.welcomeMessages.map((message, index) => (
                      <div key={index} className="flex items-center border rounded-md p-2">
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => {
                            const newMessages = [...widgetSettings.welcomeMessages];
                            newMessages[index] = e.target.value;
                            setWidgetSettings({...widgetSettings, welcomeMessages: newMessages});
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                          placeholder={`Сообщение ${index + 1}`}
                        />
                        <button
                          onClick={() => {
                            const newMessages = widgetSettings.welcomeMessages.filter((_, i) => i !== index);
                            setWidgetSettings({...widgetSettings, welcomeMessages: newMessages});
                          }}
                          className="ml-2 text-red-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newMessages = [...widgetSettings.welcomeMessages, ''];
                        setWidgetSettings({...widgetSettings, welcomeMessages: newMessages});
                      }}
                      className="text-blue-400 hover:text-blue-600 font-medium"
                    >
                      + Добавить сообщение
                    </button>
                    <p className="text-sm text-gray-500">Укажите приветственные сообщения от ассистента, которые будут автоматически видны в начале каждого диалога</p>
                  </div>
                </div>

                {/* Логотип и брендинг */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4">Логотип и брендинг</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Название рядом с логотипом</label>
                        <input
                          type="text"
                          value={widgetSettings.buttonText}
                          onChange={(e) => setWidgetSettings({...widgetSettings, buttonText: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Введите название"
                        />
                        <p className="mt-2 text-sm text-gray-500">Текст, отображаемый рядом с логотипом в виджете.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ссылка на логотип</label>
                        <input
                          type="url"
                          value={widgetSettings.logoUrl || ''}
                          onChange={(e) => setWidgetSettings({...widgetSettings, logoUrl: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Введите ссылку на логотип"
                        />
                        <p className="mt-2 text-sm text-gray-500">Вставьте URL логотипа вашей компании, который будет отображаться в виджете.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Код для вставки */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4">Код для вставки</h4>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-700 mb-2">Вставьте этот фрагмент кода внутри тега <span className="font-semibold text-blue-700">&lt;body&gt;</span> на каждой странице, где вы хотите, чтобы отображался виджет.</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                      <span className="text-gray-200 font-mono text-sm">HTML</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generateWidgetCode());
                          showNotificationMessage('Код скопирован!');
                        }}
                        className="text-gray-200 hover:text-white transition-colors text-sm"
                      >
                        Копировать
                      </button>
                    </div>
                    <pre className="p-4 text-gray-200 text-sm overflow-x-auto">
                      <code>{generateWidgetCode()}</code>
                    </pre>
                  </div>
                </div>

                {/* Превью виджета */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4">Превью виджета</h4>
                  <div className="border rounded-lg shadow-inner h-96 overflow-hidden relative">
                    <iframe 
                      src="/widget-test.html" 
                      title="Widget Preview" 
                      className="w-full h-full"
                      style={{ border: 'none' }}
                    />
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Открываем предосмотр в новой вкладке
                      const previewUrl = `http://localhost:3002/preview.html?settings=${encodeURIComponent(JSON.stringify(widgetSettings))}`;
                      window.open(previewUrl, '_blank');
                    }}
                  >
                    Предосмотр
                  </Button>
                  <Button 
                    onClick={() => {
                      // Сохраняем настройки
                      localStorage.setItem('widgetSettings', JSON.stringify(widgetSettings));
                      showNotificationMessage('Настройки виджета сохранены!');
                      setShowWidgetModal(false);
                    }}
                  >
                    Сохранить
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integration Modal */}
      {showIntegrationModal && selectedIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowIntegrationModal(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowIntegrationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ←
                </button>
                <h3 className="text-xl font-semibold">Установка {selectedIntegration.name}</h3>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <img src={`/${selectedIntegration.icon}`} alt={selectedIntegration.name} className="w-12 h-12" />
                  <div>
                    <h4 className="text-lg font-medium">{selectedIntegration.name}</h4>
                    <p className="text-gray-600">{selectedIntegration.description}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium mb-3">Инструкция по установке:</h5>
                  <div className="space-y-3 text-sm">
                    <p>1. Перейдите в настройки вашего {selectedIntegration.name}</p>
                    <p>2. Найдите раздел "Интеграции" или "API"</p>
                    <p>3. Скопируйте ваш API ключ</p>
                    <p>4. Вставьте ключ в поле ниже</p>
                    <p>5. Нажмите "Подключить"</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">API Ключ</label>
                  <Input
                    placeholder="Введите ваш API ключ"
                    className="w-full"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleIntegrationSuccess(selectedIntegration.id)}
                    className="flex-1"
                  >
                    Подключить
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowIntegrationModal(false)}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uninstall Modal */}
      {showUninstallModal && integrationToUninstall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowUninstallModal(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-md mx-4 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Удалить интеграцию?</h3>
              <p className="text-gray-600 mb-6">
                Вы действительно хотите удалить интеграцию с {integrationToUninstall.name}? 
                Это действие нельзя отменить.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={confirmUninstall}
                  variant="destructive"
                  className="flex-1"
                >
                  Да, удалить
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUninstallModal(false)}
                  className="flex-1"
                >
                  Нет, отмена
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Setup Wizard Modal для первого входа */}
      {showSetupWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                              <h2 className="text-[24px] font-[500]">Настройка вашего ИИ-агента</h2>
              <Button variant="ghost" onClick={() => setShowSetupWizard(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Прогресс-бар */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Шаг {setupStep} из 4</span>
                <span className="text-sm text-gray-500">{Math.round((setupStep / 4) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(setupStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Содержимое шагов */}
            {setupStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Шаг 1: Уточните цели Adapto</h3>
                
                {/* 1. Какую задачу должен выполнять Адапто? */}
                <div>
                  <label className="block mb-3 font-medium">1. Какую задачу должен выполнять Адапто?</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => setSetupData({...setupData, task: 'Продавать'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        setupData.task === 'Продавать' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium mb-1">Продавать</div>
                        <div className="text-sm text-gray-600">Помогать в продажах</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setSetupData({...setupData, task: 'Консультировать'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        setupData.task === 'Консультировать' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium mb-1">Консультировать</div>
                        <div className="text-sm text-gray-600">Давать консультации</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Какая главная цель ии-агента? */}
                <div>
                  <label className="block mb-3 font-medium">2. Какая главная цель ии-агента?</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Записать на консультацию',
                      'Продать продукт',
                      'Решить проблему клиента'
                    ].map(goal => (
                      <button
                        key={goal}
                        onClick={() => setSetupData({...setupData, mainGoal: goal})}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          setupData.mainGoal === goal 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-medium">{goal}</div>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => setSetupData({...setupData, mainGoal: 'custom'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        setupData.mainGoal === 'custom' 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium">Другое</div>
                        <div className="text-sm text-gray-600">Указать свою цель</div>
                      </div>
                    </button>
                  </div>
                  {setupData.mainGoal === 'custom' && (
                    <div className="mt-3">
                      <Input
                        value={setupData.customGoal || ''}
                        onChange={(e) => setSetupData({...setupData, customGoal: e.target.value})}
                        placeholder="Укажите вашу главную цель"
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {/* 3. Какой цикл сделки у вас в компании? */}
                <div>
                  <label className="block mb-2 font-medium">3. Какой цикл сделки у вас в компании?</label>
                  <Textarea
                    value={setupData.dealCycle || ''}
                    onChange={(e) => setSetupData({...setupData, dealCycle: e.target.value})}
                    placeholder="Опишите цикл сделки в вашей компании..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* 4. Целевая аудитория */}
                <div>
                  <label className="block mb-2 font-medium">4. Целевая аудитория</label>
                  <Textarea
                    value={setupData.targetAudience || ''}
                    onChange={(e) => setSetupData({...setupData, targetAudience: e.target.value})}
                    placeholder="Опишите вашу целевую аудиторию..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            )}

            {setupStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Шаг 2: Правила общения</h3>
                
                {/* 1. Обращение к пользователю */}
                <div>
                  <label className="block mb-3 font-medium">Обращение к пользователю</label>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSetupData({...setupData, addressing: 'Ты'})}
                      className={`flex-1 border rounded-full h-12 transition-colors ${
                        setupData.addressing === 'Ты' ? 'bg-[#096EFD] text-white border-[#096EFD]' : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      На "Ты"
                    </button>
                    <button 
                      onClick={() => setSetupData({...setupData, addressing: 'Вы'})}
                      className={`flex-1 border rounded-full h-12 transition-colors ${
                        setupData.addressing === 'Вы' ? 'bg-[#096EFD] text-white border-[#096EFD]' : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      На "Вы"
                    </button>
                  </div>
                </div>

                {/* 2. Стиль общения */}
                <div>
                  <label className="block mb-3 font-medium">2. Стиль общения</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { text: 'Дружелюбный', emoji: '😊' },
                      { text: 'Нейтральный', emoji: '😐' },
                      { text: 'Профессиональный', emoji: '💼' },
                      { text: 'Юмористический', emoji: '😄' }
                    ].map(t => (
                      <button 
                        key={t.text} 
                        onClick={() => setSetupData({...setupData, communicationStyle: t.text})} 
                        className={`px-6 py-3 rounded-full border flex items-center gap-2 ${
                          setupData.communicationStyle === t.text ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <span>{t.emoji}</span>
                        <span>{t.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Ограничения Адапто */}
                <div>
                  <label className="block mb-3 font-medium">3. Ограничения Адапто</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Не обсуждай цены',
                      'Не давай финансовых советов',
                      'Не консультируй по юридическим вопросам',
                      'Не разъясняй условия договоров',
                      'Не создавай обязательств от лица компании',
                      'Не подтверждай наличие товара или услуги'
                    ].map(restriction => (
                      <button
                        key={restriction}
                        onClick={() => {
                          const current = setupData.restrictions || [];
                          const newRestrictions = current.includes(restriction)
                            ? current.filter(r => r !== restriction)
                            : [...current, restriction];
                          setSetupData({...setupData, restrictions: newRestrictions});
                        }}
                        className={`px-4 py-2 rounded-full border-2 transition-all text-sm ${
                          (setupData.restrictions || []).includes(restriction)
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {restriction}
                      </button>
                    ))}
                    <button
                      onClick={() => setSetupData({...setupData, showCustomRestriction: true})}
                      className="px-4 py-2 rounded-full border-2 border-gray-200 bg-white text-gray-700 hover:border-gray-300 text-sm"
                    >
                      Другое
                    </button>
                  </div>
                  {setupData.showCustomRestriction && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        value={setupData.customRestriction || ''}
                        onChange={(e) => setSetupData({...setupData, customRestriction: e.target.value})}
                        placeholder="Введите ваше ограничение"
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => {
                          if (setupData.customRestriction) {
                            const current = setupData.restrictions || [];
                            setSetupData({
                              ...setupData, 
                              restrictions: [...current, setupData.customRestriction],
                              customRestriction: '',
                              showCustomRestriction: false
                            });
                          }
                        }}
                        disabled={!setupData.customRestriction}
                      >
                        Добавить
                      </Button>
                    </div>
                  )}
                </div>

                {/* 4. Дополнительные настройки стиля общения */}
                <div>
                  <label className="block mb-3 font-medium">4. Дополнительные настройки стиля общения под вашу компанию</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Не гарантировать результат',
                      'Пояснять ссылки перед отправкой',
                      'Проверять понимание ответа',
                      'Избегать длинных сообщений',
                      'Уточнять задачу в начале общения',
                      'Не оказывать давление на клиента',
                      'Предупреждать об ожидании ответа',
                      'Избегать споров',
                      'Отвечать от первого лица'
                    ].map(setting => (
                      <button
                        key={setting}
                        onClick={() => {
                          const current = setupData.communicationSettings || [];
                          const newSettings = current.includes(setting)
                            ? current.filter(s => s !== setting)
                            : [...current, setting];
                          setSetupData({...setupData, communicationSettings: newSettings});
                        }}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          (setupData.communicationSettings || []).includes(setting)
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {setting}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Input
                      value={setupData.customCommunicationSetting || ''}
                      onChange={(e) => setSetupData({...setupData, customCommunicationSetting: e.target.value})}
                      placeholder="Добавить свое правило общения"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* 5. Сбор данных */}
                <div>
                  <label className="block mb-3 font-medium">5. Сбор данных</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {[
                      'Имя',
                      'Номер телефона',
                      'Почта',
                      'Адрес доставки',
                      'Город',
                      'Возраст'
                    ].map(dataType => (
                      <button
                        key={dataType}
                        onClick={() => {
                          const current = setupData.dataCollection || [];
                          const newData = current.includes(dataType)
                            ? current.filter(d => d !== dataType)
                            : [...current, dataType];
                          setSetupData({...setupData, dataCollection: newData});
                        }}
                        className={`p-2 rounded-lg border-2 transition-all text-sm ${
                          (setupData.dataCollection || []).includes(dataType)
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {dataType}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSetupData({...setupData, dataCollection: []})}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        (setupData.dataCollection || []).length === 0
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Не собирать данные
                    </button>
                    <button
                      onClick={() => setSetupData({...setupData, showCustomData: true})}
                      className="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    >
                      Добавить данные
                    </button>
                  </div>
                  {setupData.showCustomData && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        value={setupData.customData || ''}
                        onChange={(e) => setSetupData({...setupData, customData: e.target.value})}
                        placeholder="Введите тип данных для сбора"
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => {
                          if (setupData.customData) {
                            const current = setupData.dataCollection || [];
                            setSetupData({
                              ...setupData, 
                              dataCollection: [...current, setupData.customData],
                              customData: '',
                              showCustomData: false
                            });
                          }
                        }}
                        disabled={!setupData.customData}
                      >
                        Добавить
                      </Button>
                    </div>
                  )}
                </div>

                {/* 6. Уточнение и вопросы */}
                <div>
                  <label className="block mb-3 font-medium">6. Уточнение и вопросы</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      'Если запрос неполный',
                      'Если клиент сомневается',
                      'Если есть риск ошибки',
                      'При выборе продукта или услуги',
                      'Если ответ зависит от тонкостей',
                      'Если клиент проявляет интерес к нескольким вариантам',
                      'Если клиент не понимает предложенное',
                      'Если требуется индивидуальный подбор',
                      'Если клиент задаёт вопросы вне своей компетенции',
                      'Если клиент спрашивает о вещах, которые требует специальных знаний',
                      'При оформлении заявки или заказа',
                      'Перед тем как оформить что-то важное',
                      'Если клиент долго молчит'
                    ].map(question => (
                      <button
                        key={question}
                        onClick={() => {
                          const current = setupData.clarificationQuestions || [];
                          const newQuestions = current.includes(question)
                            ? current.filter(q => q !== question)
                            : [...current, question];
                          setSetupData({...setupData, clarificationQuestions: newQuestions});
                        }}
                        className={`p-3 rounded-lg border-2 transition-all text-left text-sm ${
                          (setupData.clarificationQuestions || []).includes(question)
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7. Отправка смайликов */}
                <div>
                  <label className="block mb-3 font-medium">7. Отправка смайликов</label>
                  <div className="flex gap-3">
                    {[
                      { text: 'Никогда', emoji: '😐' },
                      { text: 'Редко', emoji: '😊' },
                      { text: 'Часто', emoji: '😄' }
                    ].map(option => (
                      <button
                        key={option.text}
                        onClick={() => setSetupData({...setupData, emojiUsage: option.text})}
                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                          setupData.emojiUsage === option.text
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">{option.emoji}</div>
                          <div className="font-medium">{option.text}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {setupStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Шаг 3: Этапы диалога</h3>
                <p className="text-gray-600">Опишите идеальный скрипт</p>
                <p className="text-gray-600">Чем лучше вы опишите ваш скрипт, тем лучше ии-агент сможет выполнять задачи.</p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm">!</span>
                    </div>
                    <div>
                      <div className="font-medium text-blue-800 mb-1">Уделите время детальному описанию идеального скрипта</div>
                      <div className="text-sm text-blue-700">
                        Это очень важно для хорошей работы вашего ИИ-продажника. Вы сможете скорректировать поведение позже, но правильная настройка сейчас даст лучшие результаты сразу. Ниже представлен шаблон, который вам нужно адаптировать.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {(setupData.dialogStages || [
                    'Поздоровайся и спроси имя клиента. Уточни его проблему и пойми текущую ситуацию пользователя',
                    'Опиши коротко как решишь его задачу/назови наши преимущества, предложи товары по запросу',
                    'Веди клиента к оформлению заказа/заявки',
                    'Когда клиент готов оформить заказ, сделай итог заказа и пришли ссылку на оплату из базы знаний.',
                    'Переведи клиента на менеджера для проверки оплаты и дальнейшей работы'
                  ]).map((stage, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <Textarea
                            value={stage}
                            onChange={(e) => {
                              const newStages = [...(setupData.dialogStages || [])];
                              newStages[index] = e.target.value;
                              setSetupData({...setupData, dialogStages: newStages, dialogStagesModified: true});
                            }}
                            className="w-full resize-none"
                            rows={2}
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newStages = [...(setupData.dialogStages || [])];
                            newStages.splice(index, 1);
                            setSetupData({...setupData, dialogStages: newStages, dialogStagesModified: true});
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const newStages = [...(setupData.dialogStages || []), 'Новый этап диалога'];
                      setSetupData({...setupData, dialogStages: newStages, dialogStagesModified: true});
                    }}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить этап
                  </Button>
                </div>

                {/* Предупреждение если не изменены этапы */}
                {setupData.dialogStagesModified === false && (
                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm">⚠</span>
                      </div>
                      <div>
                        <div className="font-medium text-yellow-800 mb-1">Вы не внесли никаких изменений</div>
                        <div className="text-sm text-yellow-700 mb-3">
                          Он не адаптирован под ваш бизнес это может сказаться на эффективности ии-агента.
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            variant="outline"
                            onClick={() => setSetupData({...setupData, dialogStagesModified: true})}
                          >
                            Внести изменения
                          </Button>
                          <Button 
                            onClick={() => setSetupData({...setupData, dialogStagesModified: true})}
                          >
                            Продолжить без изменений
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {setupStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Шаг 4: Обучение Адапто</h3>
                <p className="text-gray-600">Загрузите минимум 1 ресурс с информацией о компании, чтобы Адапто смог обучиться на ней</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'site', name: 'Сайт', description: 'Добавить URL вашего сайта', icon: Globe },
                    { id: 'feed', name: 'Товарный фид', description: 'Загрузить CSV/XML файл', icon: FileIcon },
                    { id: 'text', name: 'Написать самому', description: 'Ввести информацию вручную', icon: EditIcon },
                    { id: 'file', name: 'Файл', description: 'Загрузить документ', icon: Upload }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSetupData({...setupData, selectedKnowledgeType: option.id})}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <option.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{option.name}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Поле для ввода в зависимости от выбранного типа */}
                {setupData.selectedKnowledgeType && (
                  <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <h4 className="font-medium mb-3">
                      {setupData.selectedKnowledgeType === 'site' && 'Добавить URL сайта'}
                      {setupData.selectedKnowledgeType === 'feed' && 'Загрузить товарный фид'}
                      {setupData.selectedKnowledgeType === 'text' && 'Ввести информацию вручную'}
                      {setupData.selectedKnowledgeType === 'file' && 'Загрузить файл'}
                    </h4>
                    
                    {setupData.selectedKnowledgeType === 'site' && (
                      <div className="space-y-3">
                        <Input
                          value={setupData.knowledgeInput || ''}
                          onChange={(e) => setSetupData({...setupData, knowledgeInput: e.target.value})}
                          placeholder="https://example.com"
                          className="w-full"
                        />
                        <Button 
                          onClick={() => {
                            if (setupData.knowledgeInput) {
                              const newItems = [...(setupData.knowledgeItems || []), {
                                id: Date.now(),
                                type: 'site',
                                content: setupData.knowledgeInput,
                                status: 'processing'
                              }];
                              setSetupData({
                                ...setupData, 
                                knowledgeItems: newItems,
                                knowledgeInput: '',
                                selectedKnowledgeType: null
                              });
                            }
                          }}
                          disabled={!setupData.knowledgeInput}
                        >
                          Добавить сайт
                        </Button>
                      </div>
                    )}
                    
                    {setupData.selectedKnowledgeType === 'text' && (
                      <div className="space-y-3">
                        <Textarea
                          value={setupData.knowledgeInput || ''}
                          onChange={(e) => setSetupData({...setupData, knowledgeInput: e.target.value})}
                          placeholder="Введите информацию о вашей компании, продуктах, услугах..."
                          className="w-full min-h-[120px]"
                        />
                        <Button 
                          onClick={() => {
                            if (setupData.knowledgeInput) {
                              const newItems = [...(setupData.knowledgeItems || []), {
                                id: Date.now(),
                                type: 'text',
                                content: setupData.knowledgeInput,
                                status: 'processing'
                              }];
                              setSetupData({
                                ...setupData, 
                                knowledgeItems: newItems,
                                knowledgeInput: '',
                                selectedKnowledgeType: null
                              });
                            }
                          }}
                          disabled={!setupData.knowledgeInput}
                        >
                          Добавить текст
                        </Button>
                      </div>
                    )}
                    
                    {setupData.selectedKnowledgeType === 'file' && (
                      <div className="space-y-3">
                        <Input
                          type="file"
                          onChange={(e) => setSetupData({...setupData, knowledgeInput: e.target.files?.[0]?.name || ''})}
                          className="w-full"
                        />
                        <Button 
                          onClick={() => {
                            if (setupData.knowledgeInput) {
                              const newItems = [...(setupData.knowledgeItems || []), {
                                id: Date.now(),
                                type: 'file',
                                content: setupData.knowledgeInput,
                                status: 'processing'
                              }];
                              setSetupData({
                                ...setupData, 
                                knowledgeItems: newItems,
                                knowledgeInput: '',
                                selectedKnowledgeType: null
                              });
                            }
                          }}
                          disabled={!setupData.knowledgeInput}
                        >
                          Загрузить файл
                        </Button>
                      </div>
                    )}
                    
                    {setupData.selectedKnowledgeType === 'feed' && (
                      <div className="space-y-3">
                        <Input
                          type="file"
                          accept=".csv,.xml"
                          onChange={(e) => setSetupData({...setupData, knowledgeInput: e.target.files?.[0]?.name || ''})}
                          className="w-full"
                        />
                        <Button 
                          onClick={() => {
                            if (setupData.knowledgeInput) {
                              const newItems = [...(setupData.knowledgeItems || []), {
                                id: Date.now(),
                                type: 'feed',
                                content: setupData.knowledgeInput,
                                status: 'processing'
                              }];
                              setSetupData({
                                ...setupData, 
                                knowledgeItems: newItems,
                                knowledgeInput: '',
                                selectedKnowledgeType: null
                              });
                            }
                          }}
                          disabled={!setupData.knowledgeInput}
                        >
                          Загрузить фид
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {setupData.knowledgeItems && setupData.knowledgeItems.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Добавленные ресурсы:</h4>
                    <div className="space-y-2">
                      {setupData.knowledgeItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              {item.type === 'site' && <Globe className="w-4 h-4 text-blue-600" />}
                              {item.type === 'text' && <EditIcon className="w-4 h-4 text-blue-600" />}
                              {item.type === 'file' && <FileIcon className="w-4 h-4 text-blue-600" />}
                              {item.type === 'feed' && <FileIcon className="w-4 h-4 text-blue-600" />}
                            </div>
                            <span className="text-sm">{item.content}</span>
                          </div>
                          <div className="text-xs text-green-600">✓ Добавлено</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Кнопки навигации */}
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={() => setSetupStep(Math.max(1, setupStep - 1))}
                disabled={setupStep === 1}
              >
                Назад
              </Button>
              
              {setupStep < 4 ? (
                <Button 
                  onClick={() => {
                    if (setupStep === 3) {
                      // Проверяем, были ли изменения в этапах диалога
                      const originalStages = [
                        'Поздоровайся и спроси имя клиента. Уточни его проблему и пойми текущую ситуацию пользователя',
                        'Опиши коротко как решишь его задачу/назови наши преимущества, предложи товары по запросу',
                        'Веди клиента к оформлению заказа/заявки',
                        'Когда клиент готов оформить заказ, сделай итог заказа и пришли ссылку на оплату из базы знаний.',
                        'Переведи клиента на менеджера для проверки оплаты и дальнейшей работы'
                      ];
                      
                      const currentStages = setupData.dialogStages || [];
                      const hasChanges = currentStages.length !== originalStages.length || 
                        currentStages.some((stage, index) => stage !== originalStages[index]);
                      
                      if (!hasChanges) {
                        setSetupData({...setupData, dialogStagesModified: false});
                      } else {
                        setSetupData({...setupData, dialogStagesModified: true});
                        setSetupStep(setupStep + 1);
                      }
                    } else {
                      setSetupStep(setupStep + 1);
                    }
                  }}
                  disabled={
                    (setupStep === 1 && !setupData.task) ||
                    (setupStep === 2 && (!setupData.addressing || !setupData.communicationStyle)) ||
                    (setupStep === 3 && (!setupData.dialogStages || setupData.dialogStages.length === 0))
                  }
                >
                  Далее
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    localStorage.setItem('hasShownSetupWizard', 'true');
                    setShowSetupWizard(false);
                    setShowModelSetupProgress(true);
                  }}
                  disabled={!setupData.knowledgeItems || setupData.knowledgeItems.length === 0}
                >
                  Завершить настройку
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Model Setup Progress Modal */}
      {showModelSetupProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="text-center max-w-md mx-4">
            <div className="mb-8">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                              <h2 className="text-[24px] font-[500] text-gray-800 mb-2">Настраиваем модель</h2>
              <p className="text-gray-600 mb-4">Пожалуйста, подождите. Мы настраиваем вашу модель под ваши требования.</p>
              <div className="text-3xl font-bold text-blue-600 mb-4">
                {Math.floor(modelSetupTimer / 60)}:{(modelSetupTimer % 60).toString().padStart(2, '0')}
              </div>
              
              {/* Прогресс-бар с шагами */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Анализ целей и задач</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Настройка стиля общения</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Создание диалоговых сценариев</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Обучение на базе знаний</span>
                  <span className="text-blue-600">⏳</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Финальная настройка модели</span>
                  <span className="text-gray-400">○</span>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((300 - modelSetupTimer) / 300) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Site Import Popup */}
      {showSitePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(7, 15, 26, 0.6)' }}>
          <div className="bg-white rounded-[20px] w-[700px] max-h-[90vh] overflow-y-auto relative">
            <div className="p-[25px]">
              {/* Header */}
              <div className="flex items-center justify-between mb-[12px]">
                <h2 className="text-[24px] font-[600] text-[#070F1A]">Как импортировать знания?</h2>
                <button 
                  onClick={handleSitePopupClose}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-[7px] transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Description */}
              <p className="text-[#647491] text-[14px] mb-[30px]">
                Выберите, как вы хотите поделиться знаниями. Это научит ИИ, как отвечать на вопросы, связанные с вашим бизнесом
              </p>

              {/* Tabs */}
              <div className="flex gap-[20px] mb-[30px]">
                {/* Tab 1: Сканировать весь сайт */}
                                  <div 
                    className={`w-[315px] h-[84px] border rounded-[15px] cursor-pointer transition-all ${
                      sitePopupTab === 'full' 
                        ? 'border-[#096EFD]/60 bg-[#FFFFFF]' 
                        : 'border-[#070F1A]/10 bg-white'
                    }`}
                    onClick={() => setSitePopupTab('full')}
                  >
                    <div className="h-full flex flex-col items-center justify-center">
                      <h3 className={`text-[16px] font-[500] mb-2 ${
                        sitePopupTab === 'full' ? 'text-[#070F1A]' : 'text-[#647491]/70'
                      }`}>
                        Сканировать весь сайт
                      </h3>
                      <p className={`text-[12px] font-[400] text-center px-4 ${
                        sitePopupTab === 'full' ? 'text-[#647491]' : 'text-[#647491]/70'
                      }`}>
                        ИИ будет брать знания со всех страниц сайта
                      </p>
                    </div>
                  </div>

                {/* Tab 2: Сканировать страницы */}
                                  <div 
                    className={`w-[315px] h-[84px] border rounded-[15px] cursor-pointer transition-all ${
                      sitePopupTab === 'selective' 
                        ? 'border-[#096EFD]/60 bg-[#FFFFFF]' 
                        : 'border-[#070F1A]/10 bg-white'
                    }`}
                    onClick={() => setSitePopupTab('selective')}
                  >
                    <div className="h-full flex flex-col items-center justify-center">
                      <h3 className={`text-[16px] font-[500] mb-2 ${
                        sitePopupTab === 'selective' ? 'text-[#070F1A]' : 'text-[#647491]/70'
                      }`}>
                        Сканировать страницы
                      </h3>
                      <p className={`text-[12px] font-[400] text-center px-4 ${
                        sitePopupTab === 'selective' ? 'text-[#647491]' : 'text-[#647491]/70'
                      }`}>
                        Выберите определенные страницы сайта
                      </p>
                    </div>
                  </div>
              </div>

              {/* Tab Content */}
              {sitePopupTab === 'full' ? (
                <div className="space-y-[30px]">
                  <div>
                    <h3 className="text-[18px] font-[600] text-[#070F1A] mb-[20px]">Предоставить URL-адрес</h3>
                    <div className={`w-[650px] h-[40px] bg-white border rounded-[10px] flex items-center px-3 ${
                      siteUrlError ? 'border-red-500' : 'border-[#070F1A]/10'
                    }`}>
                      <input
                        type="url"
                        value={siteUrl}
                        onChange={(e) => handleSiteUrlChange(e.target.value)}
                        placeholder="https://mypage.com"
                        className="flex-1 bg-transparent text-[14px] font-[500] text-[#070F1A] placeholder-[#070F1A]/30 outline-none"
                      />
                    </div>
                    {siteUrlError && (
                      <p className="text-red-500 text-[12px] mt-1">{siteUrlError}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-[30px]">
                  <div>
                    <h3 className="text-[18px] font-[600] text-[#070F1A] mb-[20px]">Предоставить URL-адреса страниц</h3>
                    
                                          {selectedPages.map((page, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <div className={`w-[650px] h-[40px] bg-white border rounded-[10px] flex items-center px-3 ${
                            selectedPagesErrors[index] ? 'border-red-500' : 'border-[#070F1A]/10'
                          }`}>
                            <input
                              type="url"
                              value={page}
                              onChange={(e) => handlePageChange(index, e.target.value)}
                              placeholder="https://mypage.com"
                              className="flex-1 bg-transparent text-[14px] font-[500] text-[#070F1A] placeholder-[#070F1A]/30 outline-none"
                            />
                          </div>
                          {selectedPages.length > 1 && (
                            <button
                              onClick={() => handleRemovePage(index)}
                              className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-[8px] transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {selectedPagesErrors[index] && (
                            <p className="text-red-500 text-[12px] mt-1">{selectedPagesErrors[index]}</p>
                          )}
                        </div>
                      ))}
                    
                    <button
                      onClick={handleAddPage}
                      className="h-[34px] px-4 bg-[#096EFD] text-white rounded-[50px] hover:bg-[#096EFD]/80 transition-colors text-[12px] font-[500]"
                    >
                      Добавить страницу
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-[10px]">
                <p className="text-[10px] text-[#647491] mb-[30px]">
                  Этот процесс может занять несколько минут и будет продолжаться в фоновом режиме.
                </p>
                <div className="flex justify-center">
                                      <button
                      onClick={handleSiteImport}
                      disabled={
                        (sitePopupTab === 'full' && (siteUrlError || !siteUrl.trim())) ||
                        (sitePopupTab === 'selective' && (selectedPagesErrors.some(err => err) || selectedPages.filter(p => p.trim()).length === 0))
                      }
                      className="w-[650px] h-[40px] bg-[#0084FF] text-white font-[500] text-[14px] rounded-[10px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Начать импорт
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feed Import Popup */}
      {showFeedPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] w-[700px] p-[25px]">
            {/* Header */}
            <div className="flex justify-between items-start mb-[12px]">
              <h2 className="text-[20px] font-[600] text-[#070F1A]">Укажите URL-адрес на товарный фид</h2>
              <button
                onClick={handleFeedPopupClose}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-[7px] transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Description */}
            <p className="text-[#647491] text-[14px] mb-[30px]">
              Вставьте ссылку на товарный фид, чтобы ИИ изучил ваш каталог товаров
            </p>

            {/* Content */}
            <div className="space-y-[30px]">
              <div>
                <div className={`w-[650px] h-[40px] bg-white border rounded-[10px] flex items-center px-3 ${
                  feedUrlError ? 'border-red-500' : 'border-[#070F1A]/10'
                }`}>
                  <input
                    type="url"
                    value={feedUrl}
                    onChange={(e) => handleFeedUrlChange(e.target.value)}
                    placeholder="https://mypage.xsl"
                    className="flex-1 bg-transparent text-[14px] font-[500] text-[#070F1A] placeholder-[#070F1A]/30 outline-none"
                  />
                </div>
                {feedUrlError && (
                  <p className="text-red-500 text-[12px] mt-1">{feedUrlError}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-[10px]">
              <p className="text-[10px] text-[#647491] mb-[30px]">
                Этот процесс может занять несколько минут и будет продолжаться в фоновом режиме.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={handleFeedImport}
                  disabled={feedUrlError || !feedUrl.trim()}
                  className="w-[650px] h-[40px] bg-[#0084FF] text-white font-[500] text-[14px] rounded-[10px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Начать импорт
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Import Popup */}
      {showFilePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] w-[700px] p-[25px]">
            {/* Header */}
            <div className="flex justify-between items-start mb-[12px]">
              <h2 className="text-[20px] font-[600] text-[#070F1A]">Прикрепите файлы для импорта</h2>
              <button
                onClick={handleFilePopupClose}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-[7px] transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Description */}
            <p className="text-[#647491] text-[14px] mb-[30px]">
              Поддерживается загрузка файлов формата: .docx, .doc, .pdf, .txt, .xls, .xlsx
            </p>

            {/* File Upload Area */}
            <div className="space-y-[30px]">
              <div className="border-2 border-dashed border-[#070F1A]/10 rounded-[10px] p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept=".docx,.doc,.pdf,.txt,.xls,.xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[16px] font-[500] text-[#070F1A]">Прикрепить файл</p>
                      <p className="text-[12px] text-[#647491] mt-1">Максимум: 3 файла, 100 мегабайт за одну отправку.</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-[10px]">
                      <div className="flex items-center gap-3">
                        <File className="w-5 h-5 text-blue-500" />
                        <span className="text-[14px] text-[#070F1A]">{file.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-[30px]">
              <div className="flex justify-center">
                <button
                  onClick={handleFileUpload}
                  disabled={selectedFiles.length === 0}
                  className="w-[650px] h-[40px] bg-[#0084FF] text-white font-[500] text-[14px] rounded-[10px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Загрузить в базу знаний
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Text Import Popup */}
      {showTextPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] w-[700px] p-[25px]">
            {/* Header */}
            <div className="flex justify-between items-start mb-[12px]">
              <h2 className="text-[20px] font-[600] text-[#070F1A]">Введите информацию текстом</h2>
              <button
                onClick={handleTextPopupClose}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-[7px] transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Description */}
            <p className="text-[#647491] text-[14px] mb-[30px]">
              Опишите текстом то, что нужно знать ИИ для работы
            </p>

            {/* Text Area */}
            <div className="space-y-[30px]">
              <div>
                <textarea
                  value={textContent}
                  onChange={(e) => handleTextContentChange(e.target.value)}
                  placeholder="Название: EcoHarmony&#10;Сфера: Продажа экологичных товаров для дома (биоразлагаемые, без пластика).&#10;Миссия: Сделать заботу о планете простой и доступной через повседневные товары.&#10;Ценности: Экологичность, качество, прозрачность.&#10;&#10;Основные категории товаров:&#10;&#10;Ванная: Бамбуковые зубные щетки, деревянные расчески, ватные палочки.&#10;Кухня: Многоразовые салфетки, сетчатые сумки, губки из люфы.&#10;Уборка: Концентрированные средства в стекле, щетки с деревянными ручками.&#10;Подарки: Готовые эко-наборы.&#10;&#10;Услуги и политика:&#10;&#10;Доставка: По РФ, бесплатно от 3000 руб.&#10;Оплата: Карты (Visa/MC/МИР), Apple/Google Pay, наличные/карта курьеру.&#10;Программа лояльности: Накопительные баллы за покупки.&#10;&#10;Частые вопросы и короткие ответы:&#10;&#10;В: Как утилизировать бамбуковую щетку?&#10;О: Ручку — в компост или органические отходы. Щетину (нейлон-4) — отрезать и сдать в пункт приема пластика.&#10;&#10;В: Где посмотреть товары?&#10;О: Наш шоу-рум: Москва, ул. Зеленая, 15. Работаем с 10:00 до 20:00.&#10;&#10;В: Есть подарочные карты?&#10;О: Да, электронные и физические, номиналом от 1000 руб. Действуют 1 год.&#10;&#10;В: Как отследить заказ?&#10;О: Трек-номер приходит на email после отправки.&#10;&#10;В: Работаете с юрлицами?&#10;О: Да! Для корпоративных заказов пишите на corporate@ecoharmony.ru."
                  maxLength={10000}
                  className={`w-[650px] h-[200px] bg-white border rounded-[10px] p-3 resize-none ${
                    textContentError ? 'border-red-500' : 'border-[#070F1A]/10'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '1.5' }}
                />
                {textContentError && (
                  <p className="text-red-500 text-[12px] mt-1">{textContentError}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-[30px]">
              <div className="flex justify-center">
                <button
                  onClick={handleTextImport}
                  disabled={textContentError || !textContent.trim()}
                  className="w-[650px] h-[40px] bg-[#0084FF] text-white font-[500] text-[14px] rounded-[10px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Загрузить в базу знаний
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}

    </div>
  );
}

