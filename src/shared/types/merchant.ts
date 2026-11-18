import { Currency } from './index';

export interface Terminal {
  id: string;
  merchantId: string;
  status: 'online' | 'offline';
  supportsCrypto: boolean;
  settlementCurrency: Currency;
  location?: string;
  lastSeen?: string;
}

export interface Merchant {
  id: string;
  name: string;
  terminalIds: string[];
  settlementCurrency: Currency;
  gateway: 'loopay_core';
}

export interface FlowNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface FlowTemplate {
  id: string;
  name: string;
  category: 'collect' | 'payout' | 'conversion' | 'pos' | 'custom' | 'account' | 'sweep';
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  version?: string;
  status?: 'draft' | 'active';
}

export interface RunHistory {
  id: string;
  flowId: string;
  startedAt: string;
  durationMs: number;
  status: 'success' | 'failed' | 'running';
  nodeStats: Record<string, {
    durationMs: number;
    status: 'success' | 'failed' | 'skipped';
    error?: string;
  }>;
}
