export type SDKDeliveryMode = 'widget' | 'headless';

export type ComplianceCondition =
  | 'amount_gt'
  | 'amount_lt'
  | 'country_is'
  | 'risk_level_is';

export type ComplianceAction =
  | 'require_biometric'
  | 'allow_fast_flow'
  | 'block_and_escalate'
  | 'require_document';

export interface ComplianceRule {
  id: string;
  condition: ComplianceCondition;
  value: number | string;
  action: ComplianceAction;
}

export interface ComplianceDecision {
  action: ComplianceAction;
  rule: ComplianceRule;
  matched: true;
}

export type WebhookEventName =
  | 'payment:success'
  | 'payment:failed'
  | 'kyc:completed'
  | 'kyc:failed'
  | 'invoice:paid'
  | 'compliance:rule_triggered'
  | 'compliance:escalation_required'
  | 'treasury:threshold_alert';

export type WebhookPayloadFormat = 'json' | 'iso20022';

export interface WebhookRetryPolicy {
  maxRetries: number;
  backoffMs: number;
}

export interface WebhookConfig {
  endpoint: string;
  events: WebhookEventName[];
  format: WebhookPayloadFormat;
  retryPolicy: WebhookRetryPolicy;
  signingSecret?: string;
}

export type HeadlessHookName =
  | 'usePayment'
  | 'useKyc'
  | 'useWallet'
  | 'useInvoice';

export interface HeadlessHookConfig {
  hookName: HeadlessHookName;
  widgetId: string;
}

export type HeadlessSnippetFramework =
  | 'react-headless'
  | 'vue-headless'
  | 'vanilla-headless'
  | 'node-webhook';
