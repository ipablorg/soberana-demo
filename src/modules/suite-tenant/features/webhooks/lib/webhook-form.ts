/**
 * Webhook configuration form (`POST /v1/webhooks`, `PATCH /v1/webhooks/:id`)
 * and delivery log filters (`GET /v1/webhooks/logs`). Bodies are camelCase
 * like REST; no event selected means every event.
 */

import type {
  TenantWebhook,
  TenantWebhookInput,
  TenantWebhookLogFilters,
  TenantWebhookUpdateInput,
} from '@/graphql/types/tenant';

export interface WebhookFormValues {
  url: string;
  description: string;
  events: string[];
  isActive: boolean;
}

export type WebhookFormErrors = Partial<
  Record<'url' | 'description', 'required' | 'url' | 'length'>
>;

export const EMPTY_WEBHOOK_FORM: WebhookFormValues = {
  url: '',
  description: '',
  events: [],
  isActive: true,
};

/** The back caps the label at 120 characters. */
const DESCRIPTION_MAX = 120;

export function webhookFormOf(webhook: TenantWebhook): WebhookFormValues {
  return {
    url: webhook.url,
    description: webhook.description ?? '',
    events: [...webhook.events],
    isActive: webhook.isActive,
  };
}

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateWebhookForm(values: WebhookFormValues): WebhookFormErrors {
  const errors: WebhookFormErrors = {};
  const url = values.url.trim();
  if (!url) errors.url = 'required';
  else if (!isHttpUrl(url)) errors.url = 'url';
  if (values.description.trim().length > DESCRIPTION_MAX) errors.description = 'length';

  return errors;
}

export function toggleEvent(events: readonly string[], event: string): string[] {
  return events.includes(event) ? events.filter((item) => item !== event) : [...events, event];
}

/** Create body; an empty label is left out. */
export function toCreateWebhookInput(values: WebhookFormValues): TenantWebhookInput {
  const input: TenantWebhookInput = { url: values.url.trim(), events: values.events };
  const description = values.description.trim();
  if (description) input.description = description;

  return input;
}

/** Update body: every editable field, so clearing the events (= all) or the label is sent too. */
export function toUpdateWebhookInput(values: WebhookFormValues): TenantWebhookUpdateInput {
  return {
    url: values.url.trim(),
    events: values.events,
    description: values.description.trim(),
    isActive: values.isActive,
  };
}

export type DeliveryResultFilter = '' | 'true' | 'false';

export const WEBHOOK_LOGS_PAGE_SIZE = 20;

/** Log query: `success` goes as a real boolean (the back rejects strings other than true/false). */
export function toWebhookLogFilters(
  page: number,
  result: DeliveryResultFilter,
  eventType: string
): TenantWebhookLogFilters {
  const filters: TenantWebhookLogFilters = { page, page_size: WEBHOOK_LOGS_PAGE_SIZE };
  if (result !== '') filters.success = result === 'true';
  if (eventType) filters.eventType = eventType;

  return filters;
}
