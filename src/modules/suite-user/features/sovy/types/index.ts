export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageStatus = 'sending' | 'sent' | 'error' | 'typing';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
}

export interface ConversationContext {
  userId?: string;
  companyId?: string;
  sessionId: string;
}

export interface SovyResponse {
  message: string;
  suggestions?: string[];
  actions?: SovyAction[];
}

export interface SovyAction {
  type: 'navigate' | 'export' | 'filter' | 'create';
  label: string;
  data?: any;
}

export interface TreasuryInsight {
  type: 'alert' | 'recommendation' | 'summary';
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
}
