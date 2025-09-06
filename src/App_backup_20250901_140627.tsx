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
                  <Card className="shadow-none hover:border-[#096EFD] hover:border-opacity-50 hover:scale-[1.02] transition-all duration-200">
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

                  <Card className="shadow-none hover:border-[#096EFD] hover:border-opacity-50 hover:scale-[1.02] transition-all duration-200">
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
              </div>
            )}

            {activeStatisticsTab === 'technical' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ paddingTop: '12px' }}>
                <Card className="shadow-none hover:border-[#096EFD] hover:border-opacity-50 hover:-translate-y-[6px] transition-all duration-200">
                  <CardContent className="p-[15px] h-[170px] flex flex-col justify-between" style={{ paddingTop: '13px' }}>
                    <div className="flex items-center gap-2" style={{ marginTop: '12px !important', height: '21px !important' }}>
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
                      <p className="text-[14px] font-[500] text-[#070F1A]">Ср. скорость ответа ИИ-агента</p>
                    </div>
                    <div className="flex items-end" style={{ marginBottom: '0px !important' }}>
                      <p className="text-[1.8rem] font-[500] text-[#070F1A]" style={{ height: '33px' }}>1.2с.</p>
                      {generateTrendIndicator('down', '-0.3с', true)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}