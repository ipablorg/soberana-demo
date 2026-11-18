import type { Node, Edge } from 'reactflow';

// ── Categories ──────────────────────────────────────────────
export type NodeCategory = 'soberana' | 'loopayapp' | 'fx' | 'control';

export type NodeExecutionStatus = 'idle' | 'pending' | 'running' | 'success' | 'error';

// ── Per-node config interfaces (all fields string for dot.path compat) ──
export interface PayInCreateConfig {
  amount: string;
  companyProductId: string;
  currencyId: string;
  type: 'deposit' | 'credit' | 'collection';
}

export interface PayInUpdateConfig {
  id: string;
  state: 'accepted' | 'rejected';
}

export interface PayOutCreateConfig {
  amount: string;
  bankAccount: string;
  beneficiaryName: string;
  documentNumber: string;
  transactionCountry: string;
  companyProductId: string;
}

export interface PayOutMultiSignConfig {
  payOutIds: string;
}

export interface PayOutCancelConfig {
  payOutId: string;
}

export interface FdrValidateConfig {
  amount: string;
  fdrId: string;
}

export interface CrossborderCreateConfig {
  companyProductId: string;
  currencyPairId: string;
  amountSender: string;
  contactSenderId: string;
  contactReceiverId: string;
}

export interface CrossborderUpdateConfig {
  id: string;
  state: string;
  createPayIn: boolean;
}

export interface LoopayAppPayInFdrConfig {
  fdrId: string;
  amount: string;
  currency: string;
}

export interface LoopayAppEngineConfig {
  engine: 'kushkiCard' | 'kushkiTransfer' | 'epayco' | 'payphone' | 'moviiBreB' | 'irisCollection' | 'playgreen';
  payload: string;
}

export interface LoopayAppWebhookConfig {
  companyId: string;
  url: string;
  typeTrasaction: 'PAYIN' | 'PAYOUT' | 'COLLECTION';
}

export interface LoopayAppPaidMethodsConfig {
  productId: string;
  companyProductId: string;
}

export interface FxRatesConfig {
  clientId: string;
  pollingIntervalMs: number;
}

export interface FxOrderConfig {
  clientId: string;
  exchangeRateId: string;
  numeralCode: string;
  orderType: 'BUY' | 'SELL';
  baseAmount: string;
}

export interface FxBalancesConfig {
  clientId: string;
}

export interface ComexExpedienteConfig {
  documentData: string;
}

export interface WebhookTriggerConfig {
  path: string;
  method: 'POST' | 'GET';
}

export interface CronTriggerConfig {
  expression: string;
}

export interface ConditionConfig {
  field: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
  value: string;
}

export interface TransformConfig {
  mappings: string;
}

export interface DelayConfig {
  seconds: number;
}

export interface LogConfig {
  label: string;
}

export interface NotificationConfig {
  url: string;
  method: 'POST' | 'GET';
  bodyTemplate: string;
}

export type NodeConfig =
  | PayInCreateConfig
  | PayInUpdateConfig
  | PayOutCreateConfig
  | PayOutMultiSignConfig
  | PayOutCancelConfig
  | FdrValidateConfig
  | CrossborderCreateConfig
  | CrossborderUpdateConfig
  | LoopayAppPayInFdrConfig
  | LoopayAppEngineConfig
  | LoopayAppWebhookConfig
  | LoopayAppPaidMethodsConfig
  | FxRatesConfig
  | FxOrderConfig
  | FxBalancesConfig
  | ComexExpedienteConfig
  | WebhookTriggerConfig
  | CronTriggerConfig
  | ConditionConfig
  | TransformConfig
  | DelayConfig
  | LogConfig
  | NotificationConfig;

// ── WorkflowNode data shape ──────────────────────────────────
export interface WorkflowNodeData {
  label: string;
  category: NodeCategory;
  nodeType: string;
  config: Partial<Record<string, string | number | boolean>>;
  executionStatus: NodeExecutionStatus;
  executionOutput?: unknown;
}

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

// ── Saved flow ───────────────────────────────────────────────
export interface SavedFlow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

// ── Palette catalog entry ────────────────────────────────────
export interface NodeFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number';
  options?: string[];
  placeholder?: string;
}

export interface NodeDefinition {
  type: string;
  labelKey: string;
  category: NodeCategory;
  descriptionKey: string;
  defaultConfig: Partial<Record<string, string | number | boolean>>;
  inputs: number;
  outputs: number;
  fields: NodeFieldDefinition[];
}
