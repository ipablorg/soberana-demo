import type { ReactNode } from 'react';

export type AgentRole = 'user' | 'assistant' | 'system';

export interface AgentAction {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export type AgentActionKind = 'preview' | 'execute' | 'create_flow' | null;

export interface AgentMessage {
  id: string;
  role: AgentRole;
  content: string | ReactNode;
  timestamp: Date | string;
  action?: AgentActionKind;
  actionData?: any | null;
  isLoading?: boolean;

  // Back-compat fields used by early components
  title?: string;
  details?: Record<string, unknown>;
  actions?: AgentAction[];
}


