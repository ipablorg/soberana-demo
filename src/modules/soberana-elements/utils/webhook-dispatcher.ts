import type { WebhookConfig, WebhookEventName } from '../types';

export interface WebhookPayload {
  event_type: WebhookEventName;
  timestamp: string;
  widget_id: string;
  partner_id: string;
  data: Record<string, unknown>;
  iso20022_ref?: string;
  integrity_hash?: string;
}

export interface WebhookDeliveryResult {
  success: boolean;
  statusCode: number;
  deliveredAt: string;
  attempt: number;
}

export function createWebhookPayload(
  eventType: WebhookEventName,
  data: Record<string, unknown>,
  config: WebhookConfig,
  widgetId: string,
  partnerId = 'partner_demo',
): WebhookPayload {
  const timestamp = new Date().toISOString();

  const payload: WebhookPayload = {
    event_type: eventType,
    timestamp,
    widget_id: widgetId,
    partner_id: partnerId,
    data,
  };

  if (config.format === 'iso20022') {
    payload.iso20022_ref = `ISO20022-${widgetId.slice(-8)}-${timestamp.slice(0, 10).replace(/-/g, '')}`;
  }

  if (config.signingSecret) {
    // Preview integrity hash — production uses real HMAC-SHA256
    payload.integrity_hash = `sha256=prev-${widgetId.slice(-6)}-${timestamp.slice(0, 10)}`;
  }

  return payload;
}

export async function simulateWebhookDispatch(
  payload: WebhookPayload,
): Promise<WebhookDeliveryResult> {
  await new Promise<void>(resolve => setTimeout(resolve, 200));
  return {
    success: true,
    statusCode: 200,
    deliveredAt: payload.timestamp,
    attempt: 1,
  };
}
