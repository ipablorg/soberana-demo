export type ProductKey = 'move' | 'change' | 'account' | 'marketplace' | 'pos';

export type ProductStatus = 'active' | 'inactive' | 'needs_setup';

export interface ProductMetrics {
  volume24h: number;
  successRate: number;
  latencyMs: number;
  costBps?: number;
}

export interface Product {
  key: ProductKey;
  name: string;
  nameES: string;
  description: string;
  status: ProductStatus;
  metrics: ProductMetrics;
  icon: string;
  route: string;
}

export interface SuiteConfig {
  products: Record<ProductKey, ProductStatus>;
  enabledIntegrations: string[];
}

export type ConnectorCategory = 
  | 'rail' 
  | 'custody' 
  | 'bridge' 
  | 'stablecoin_platform' 
  | 'data' 
  | 'observability'
  | 'banking'
  | 'agentic'
  | 'compliance'
  | 'optimization';

export interface ConnectorCapabilities {
  triggers: string[];
  actions: string[];
  constraints?: {
    minAmount?: number;
    maxAmount?: number;
    supportedCurrencies?: string[];
    supportedNetworks?: string[];
  };
  rateLimit?: {
    requests: number;
    period: string;
  };
}

export interface Connector {
  id: string;
  name: string;
  nameES: string;
  category: ConnectorCategory;
  description: string;
  capabilities: ConnectorCapabilities;
  status: 'enabled' | 'disabled' | 'error';
  config?: Record<string, unknown>;
  logo?: string;
  costModel?: {
    type: 'fixed' | 'percentage' | 'tiered';
    value: number;
    bps?: number;
    tiers?: Array<{ min: number; max: number; rate: number }>;
  };
  sla?: {
    uptime: number;
    responseTime: number;
  };
  docs?: string;
  etaMins?: { min: number; max: number };
  riskTags?: string[];
  paymentsKinds?: Array<'collect' | 'payout' | 'conversion' | 'bridge'>;
  networks?: string[];
  currencies?: string[];
}

export interface FlowTemplateRequirements {
  products: ProductKey[];
  connectors: string[];
}

export interface FlowNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: {
    label: string;
    product?: ProductKey;
    connector?: string;
    config?: Record<string, any>;
  };
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
  nameES: string;
  product: ProductKey | 'global';
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  requires: FlowTemplateRequirements;
  version?: string;
  status?: 'draft' | 'active';
}

export interface NodeStat {
  durationMs: number;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
}

export interface RunHistory {
  id: string;
  flowId: string;
  flowName: string;
  startedAt: string;
  durationMs: number;
  status: 'success' | 'failed' | 'partial' | 'running';
  nodeStats: Record<string, NodeStat>;
  triggeredBy?: string;
  connectors?: string[];
  totalCost?: number;
  whyLogs?: string[];
}

export interface RouteOption {
  id: string;
  connectors: string[];
  estimatedCost: number;
  estimatedEtaMins: number;
  riskScore: number;
  explanation: string;
  steps: Array<{
    connector: string;
    action: string;
    currency?: string;
  }>;
}

export interface PolicyRule {
  id: string;
  name: string;
  nameES: string;
  type: 'limit' | 'approval' | 'screening' | 'velocity' | 'geo';
  enabled: boolean;
  config: Record<string, any>;
  description: string;
}

export interface ApprovalRequest {
  id: string;
  flowId: string;
  flowName: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'denied';
  type: '2-eyes' | '4-eyes';
  amount?: number;
  currency?: string;
  reason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface TreasuryRule {
  id: string;
  name: string;
  type: 'allocation' | 'hedge' | 'rebalance';
  enabled: boolean;
  config: {
    targets?: Record<string, number>;
    threshold?: number;
    cadence?: string;
    minTradeSize?: number;
  };
}
