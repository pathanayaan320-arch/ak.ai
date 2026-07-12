export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  balance: number;
  plan?: string;
  isDev?: boolean;
}

export interface Employee {
  id: string;
  uid: string;
  name: string;
  role: string;
  avatar: string;
  department: string;
  goal: string;
  skills: string[];
  systemPrompt: string;
  model: string;
  temperature: number;
  status: 'idle' | 'working' | 'review' | 'completed' | 'failed';
  performance: number; // 0 to 100
  workload: number; // active tasks count
  description: string;
  isCustom: boolean;
  createdAt: string;
  memory?: string[]; // super memory items
}

export interface Project {
  id: string;
  uid: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'review' | 'completed' | 'failed';
  progress: number; // 0 to 100
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'info' | 'task_start' | 'task_complete' | 'task_failed' | 'ceo_decision' | 'collaboration';
  employeeId?: string;
  employeeName?: string;
}

export interface Task {
  id: string;
  uid: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  assignedTo: string; // employee ID
  employeeName: string;
  employeeRole: string;
  employeeAvatar: string;
  status: 'todo' | 'inprogress' | 'review' | 'completed' | 'failed';
  output?: string; // what the employee produced (code, design, report)
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: string;
  uid: string;
  title: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  employeeId?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  uid: string;
  sender: 'user' | 'ceo' | 'employee';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  // Dynamic execution metadata for visual board updates:
  metadata?: {
    projectId?: string;
    projectName?: string;
    planningCompleted?: boolean;
    activeTasks?: {
      taskId: string;
      title: string;
      employeeId: string;
      employeeName: string;
      role: string;
      progress: number;
      status: 'todo' | 'inprogress' | 'review' | 'completed' | 'failed';
    }[];
    ceoThoughts?: string;
    deliveredResult?: string;
  };
}

export interface ActivityLog {
  id: string;
  uid: string;
  projectId?: string;
  projectName?: string;
  employeeId?: string;
  employeeName?: string;
  employeeRole?: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface FileAsset {
  id: string;
  uid: string;
  projectId: string;
  projectName: string;
  name: string;
  type: 'code' | 'design' | 'text' | 'image' | 'video' | 'report' | 'other';
  content: string;
  size: string;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  uid: string;
  title: string;
  description: string;
  type: 'project_update' | 'task_completed' | 'task_failed' | 'ceo_alert' | 'billing';
  isRead: boolean;
  createdAt: string;
  projectId?: string;
}

export interface MemoryItem {
  id: string;
  uid: string;
  title: string;
  content: string;
  category: 'knowledge' | 'instruction' | 'saved_doc';
  createdAt: string;
}

export interface PublishedEmployee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  department: string;
  goal: string;
  skills: string[];
  systemPrompt: string;
  model: string;
  temperature: number;
  description: string;
  publishedBy: string;
  publishedAt: string;
}

export interface Integration {
  id: string;
  uid: string;
  platform: 'gmail' | 'google_sheets' | 'whatsapp' | 'instagram' | 'slack' | 'discord' | 'hubspot' | 'webhook';
  status: 'connected' | 'disconnected';
  connectionName: string;
  credentials: {
    email?: string;
    apiKey?: string;
    webhookUrl?: string;
    accountName?: string;
    sheetId?: string;
    sheetName?: string;
  };
  createdAt: string;
}

export interface AutomationRun {
  id: string;
  uid: string;
  platform: string;
  prompt: string;
  recipient: string;
  topic: string;
  subject: string;
  enhancedMessage: string;
  explanation: string;
  status: 'completed' | 'failed' | 'running';
  createdAt: string;
  responsePayload?: string;
}

export interface IgAccount {
  id: string;
  uid: string;
  ig_user_id: string;
  username: string;
  page_id?: string;
  login_type: 'instagram_login' | 'facebook_login';
  access_token_encrypted: string;
  token_expires_at: string;
  status: 'active' | 'token_expired' | 'disconnected';
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  uid: string;
  ig_account_id: string;
  name: string;
  target_post_id: string | null;
  keywords: string[];
  match_type: 'contains' | 'exact';
  reply_message: string;
  is_active: boolean;
  createdAt: string;
}

export interface TriggeredEvent {
  id: string;
  uid: string;
  automation_rule_id: string;
  comment_id: string;
  commenter_ig_scoped_id: string;
  commenter_username: string;
  comment_text: string;
  status: 'sent' | 'failed' | 'skipped_duplicate' | 'skipped_self_comment' | 'expired';
  error_message?: string | null;
  created_at: string;
}

export interface WebhookRawLog {
  id: string;
  payload: any;
  received_at: string;
}


