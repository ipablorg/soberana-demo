export type WidgetEventType =
  | 'widget:ready'
  | 'widget:error'
  | 'payment:initiated'
  | 'payment:success'
  | 'payment:failed'
  | 'kyc:started'
  | 'kyc:step-completed'
  | 'kyc:completed'
  | 'kyc:failed'
  | 'wallet:loaded'
  | 'invoice:loaded'
  | 'invoice:paid'
  | 'deeplink:decoded'
  | 'compliance:blocked'
  | 'retention:calculated'
  | 'compliance:rule_triggered'
  | 'compliance:escalation_required'
  | 'treasury:threshold_alert';

export interface WidgetEventPayloadMap {
  'widget:ready': { widgetId: string };
  'widget:error': { code: string; message: string };
  'payment:initiated': { amount: number; currency: string; railId: string };
  'payment:success': { txHash: string; amount: number; currency: string; railId: string };
  'payment:failed': { code: string; message: string };
  'kyc:started': Record<string, never>;
  'kyc:step-completed': { step: number; stepName: string };
  'kyc:completed': { kycId: string; status: 'approved' | 'pending_review' };
  'kyc:failed': { code: string; reason: string };
  'wallet:loaded': { balance: number; currency: string };
  'invoice:loaded': { invoiceId: string; amount: number; currency: string };
  'invoice:paid': { invoiceId: string; txHash: string; netAmount: number };
  'deeplink:decoded': { invoiceId: string; amount: number; currency: string };
  'compliance:blocked': { reason: string; requiredAction: string };
  'retention:calculated': { gross: number; retention: number; net: number; rate: number };
  'compliance:rule_triggered': { ruleId: string; condition: string; action: string; context: Record<string, unknown> };
  'compliance:escalation_required': { ruleId: string; reason: string; requiredAction: string };
  'treasury:threshold_alert': { amount: number; currency: string; threshold: number; widgetId: string };
}

export interface WidgetEvent<T extends WidgetEventType = WidgetEventType> {
  type: T;
  widgetId: string;
  timestamp: string;
  payload: WidgetEventPayloadMap[T];
}
