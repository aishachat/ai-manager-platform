// Типы для AI Manager Platform Dashboard

export interface User {
  id: string;
  name: string;
  email: string;
  company_name?: string;
  phone?: string;
  company?: string;
  role?: 'super_admin' | 'admin' | 'operator' | 'user' | string;
}

export interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant' | 'operator' | 'system';
  timestamp: string;
  isUser?: boolean;
  sender_role?: string;
  role?: string;
  text?: string;
  time?: string;
  isTyping?: boolean;
  operatorId?: string;
  operatorName?: string;
  sender?: string;
}

export interface KnowledgeItem {
  id: string;
  type: 'site' | 'website' | 'text' | 'file' | 'feed';
  content: string;
  title?: string;
  source_url?: string;
  original_content?: string;
  processed_content?: string;
  structured_data?: any;
  chunks?: any[];
  status?: string;
  source_type?: string;
  created_at?: string;
  updated_at?: string;
  nicheId?: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Story {
  id: string;
  title: string;
  image_url: string;
  order_index: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  website?: string;
  status?: string;
  source?: string;
  created_at?: string;
  notes?: string;
  address: string;
}

export interface SetupData {
  customGoal: string;
  dealCycle: string;
  targetAudience: string;
  restrictions: string[];
  customRestriction: string;
  communicationSettings: string[];
  customCommunicationSetting: string;
  dataCollection: string[];
  customData: string;
  clarificationQuestions: string[];
  dialogStages: any[];
  dialogStagesModified: boolean;
  selectedKnowledgeType: string | null;
  knowledgeInput: string;
  knowledgeItems?: KnowledgeItem[];
  modelProvider: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  customInstructions: string;
  enableRag: boolean;
  enableValidation: boolean;
  enableMonitoring: boolean;
  task?: string;
  mainGoal?: string;
  mainGoalCustom?: string;
  addressing?: string;
  communicationStyle?: string;
  showCustomRestriction?: boolean;
  showCustomCommunicationSetting?: boolean;
  showCustomData?: boolean;
  showCustomClarificationQuestion?: boolean;
  customClarificationQuestion?: string;
  emojiUsage?: string;
  editingStage?: any;
}

export interface MetricData {
  id: string;
  name: string;
  description: string;
  formula: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  title?: string;
  explanation?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  icon: string;
  hasSubmenu?: boolean;
  submenu?: MenuItem[];
}

export interface WidgetSettings {
  theme: 'light' | 'dark';
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color: string;
  size: 'small' | 'medium' | 'large';
  welcomeMessage: string;
  placeholder: string;
  showAvatar: boolean;
  showTyping: boolean;
  autoOpen: boolean;
  delay: number;
}

export interface Deal {
  id: string;
  title: string;
  amount: number;
  notes: string;
  dialogId: string;
  client: Client;
  stage: string;
  leadQuality: string;
  hasContacts: boolean;
  owner: string;
  ownerName: string;
  isResolved: boolean;
  createdDate: string;
  lastContact: string;
  company: string;
  days: number;
  crm_clients?: any;
  lead_quality?: string;
  owner_name?: string;
  is_resolved?: boolean;
  description?: string;
  created_at?: string;
  dialog_id?: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  assigneeName: string;
  dueDate: string;
  createdDate: string;
  description: string;
  notes: string;
  assignee_name?: string;
  due_date?: string;
  dealId?: string;
  deal_id?: string;
  result?: any;
  created_by?: string;
  created_at?: string;
}

export interface TelegramSettings {
  notification_types: string[];
}

export interface FormData {
  email: string;
  password: string;
  name: string;
  company: string;
  phone: string;
  companyField?: string;
}

export interface FormErrors {
  general: string;
  phone: string;
}

export interface ValidationErrors {
  phone: string | null;
}

export interface MetricsData {
  [key: string]: {
    title: string;
    description: string;
    formula: string;
    explanation: string;
  };
}

export interface Dialog {
  id: string;
  title: string;
  status: string;
  need_handover: boolean;
  canTakeover: boolean;
  lastMessage: string;
  createdAt: string;
  client: Client;
  assignedTo: string;
  address: string;
  company: string;
  notes: string;
  email: string;
  phone: string;
  isAddedToCRM: boolean;
  source: string;
  messages: any[];
  priority: string;
  startTime: string;
  updatedAt: string;
  endTime: string;
  name: string;
  user?: string;
  channel?: string;
  isTest?: boolean;
  owner?: string;
  messageCount?: number;
}

export interface TelegramBotStats {
  total: number;
  today: number;
}

export interface Correction {
  id: string;
  correction: string;
  active: boolean;
}

export interface WidgetDevelopmentSettings {
  accentColor: string;
  buttonColor: string;
  buttonText: string;
  buttonSubtext: string;
  avatar: string;
  customButtonColor: string;
  showCustomColorPicker: boolean;
  widgetLocation: string;
  desktopBottomOffset: number;
  desktopRightOffset: number;
  mobileBottomOffset: number;
  mobileRightOffset: number;
  zIndex: number;
  welcomeMessages: string[];
  triggerQuestion: string;
  suggestions: string[];
  quickReplies: string[];
  triggerQuestionEnabled: string;
  triggerQuestionDelay: number;
  triggerQuestionText: string;
  followUpMessage: string;
  followUpDelay: number;
  followUpQuestion: string;
  followUpQuickReply: string;
  privacyPolicyUrl: string;
  dataTags: string[];
  widgetMode: string;
  quickQuestions: Array<{ question: string; answer: string }>;
  leadFormEnabled: string;
  leadFormTitle: string;
  leadFormDescription: string;
  leadFormFields: Array<{ name: string; label: string; type: string; required: boolean }>;
  logoUrl: string;
  logoName: string;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface Niche {
  id: string;
  name: string;
}
