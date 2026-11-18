// @vitest-environment jsdom

import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ request: vi.fn(), toastError: vi.fn() }));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('sonner', () => ({ toast: { error: mocks.toastError, success: vi.fn() } }));
vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: mocks.request },
  setAuthToken: vi.fn(),
  clearHeaders: vi.fn(),
}));

import type {
  TenantWebhook,
  TenantWebhookLog,
  TenantWebhookLogDetail,
} from '@/graphql/types/tenant';
import { changeValue, submitForm } from '@/test/dom-input';
import type { MountedPage } from '@/test/dom-render';
import { installCommandPolyfills } from '@/test/dom-polyfills';
import TenantWebhooks from '@/modules/suite-tenant/features/webhooks/pages/tenant-webhooks';
import WebhookLogs from '@/modules/suite-tenant/features/webhooks/pages/webhook-logs';
import WebhookLogDetail from '@/modules/suite-tenant/features/webhooks/pages/webhook-log-detail';
import {
  renderTenant,
  respond,
  settle,
  type Handler,
} from '@/modules/suite-tenant/__tests__/tenant-harness';

const HOOK: TenantWebhook = {
  id: 'wh-1',
  url: 'https://api.acme.test/hooks',
  events: [],
  isActive: true,
  description: 'Production',
  secretLastChars: '...a1b2',
  createdAt: '2026-11-01T10:00:00.000Z',
  updatedAt: '2026-11-01T10:00:00.000Z',
};

const EVENT_TYPES = [
  {
    event: 'transaction.updated',
    description: 'A transaction changed status',
    category: 'transactions',
  },
  { event: 'customer.created', description: 'A customer was created', category: 'customers' },
];

const LOG: TenantWebhookLog = {
  id: 'log-1',
  event_type: 'transaction.updated',
  idempotency_key: 'evt_tx_1',
  url: HOOK.url,
  http_status: 500,
  duration_ms: 120,
  success: false,
  attempt: 2,
  created_at: '2026-11-04T10:00:00.000Z',
};

const LOG_DETAIL: TenantWebhookLogDetail = {
  ...LOG,
  request_payload: { id: 'evt-1', event: 'transaction.updated', data: { status: 'COMPLETED' } },
  response_body: '{"error":"boom"}',
  error_message: 'HTTP 500',
  next_retry_at: '2026-11-04T10:05:00.000Z',
};

// Radix checkboxes and switches measure themselves with ResizeObserver.
installCommandPolyfills();

let page: MountedPage | null = null;

function el<T extends Element>(selector: string, root: ParentNode = document.body): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`missing ${selector}`);
  return element;
}

function click(element: Element) {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

function select(selector: string, value: string) {
  const element = el<HTMLSelectElement>(selector);
  act(() => {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function callsOf(field: string) {
  return mocks.request.mock.calls.filter(([document]) => {
    const operation = (
      document as {
        definitions: Array<{ selectionSet: { selections: Array<{ name: { value: string } }> } }>;
      }
    ).definitions[0];
    return operation?.selectionSet.selections[0]?.name.value === field;
  });
}

beforeEach(() => {
  mocks.request.mockReset();
  mocks.toastError.mockReset();
});

afterEach(() => {
  page?.unmount();
  page = null;
  document.body.innerHTML = '';
});

describe('TenantWebhooks (container)', () => {
  async function mountWebhooks(extra: Record<string, Handler> = {}) {
    mocks.request.mockImplementation(
      respond({
        tenant_listWebhooks: () => [HOOK],
        tenant_webhookEventTypes: () => EVENT_TYPES,
        tenant_createWebhook: () => ({
          ...HOOK,
          id: 'wh-2',
          secret: 'whsec_PLAINTEXT_ONCE',
          secretLastChars: '...ONCE',
        }),
        tenant_updateWebhook: () => ({ ...HOOK, isActive: false }),
        tenant_deleteWebhook: () => true,
        tenant_testWebhook: () => ({
          success: true,
          http_status: 200,
          duration_ms: 87,
          response_body: '{"received":true}',
          error_message: null,
        }),
        ...extra,
      })
    );
    page = renderTenant(<TenantWebhooks />);
    await settle(() => page?.container.querySelector('[data-testid="webhooks-list"]') !== null);
    await settle(
      () => page?.container.querySelector('[data-event="transaction.updated"]') !== null
    );
  }

  it('lists the webhooks with masked secrets and their events', async () => {
    await mountWebhooks();

    const list = el('[data-testid="webhooks-list"]').textContent ?? '';
    expect(list).toContain(HOOK.url);
    expect(list).toContain('...a1b2');
    expect(list).toContain('All events');
    expect(list).toContain('Active');
  });

  it('refuses a URL without http(s)', async () => {
    await mountWebhooks();

    changeValue(el<HTMLInputElement>('#wh-url'), 'ftp://acme.test');
    submitForm(el<HTMLFormElement>('[data-testid="webhook-form"]'));
    await settle();

    expect(callsOf('tenant_createWebhook')).toHaveLength(0);
    expect(el('[data-testid="wh-url-error"]').textContent).toBe('Use an https:// URL.');
  });

  it('creates a webhook with the chosen events and reveals the secret only once', async () => {
    await mountWebhooks();

    changeValue(el<HTMLInputElement>('#wh-url'), ' https://api.acme.test/new ');
    changeValue(el<HTMLInputElement>('#wh-description'), 'Staging');
    click(el('[data-event="transaction.updated"]'));
    submitForm(el<HTMLFormElement>('[data-testid="webhook-form"]'));
    await settle(() => page?.container.querySelector('[data-testid="webhook-secret"]') !== null);

    expect(callsOf('tenant_createWebhook')[0]?.[1]).toEqual({
      input: {
        url: 'https://api.acme.test/new',
        events: ['transaction.updated'],
        description: 'Staging',
      },
    });
    expect(el('[data-testid="webhook-secret-value"]').textContent).toBe('whsec_PLAINTEXT_ONCE');

    click(el('[data-testid="webhook-secret-done"]'));
    await settle();

    expect(page?.container.querySelector('[data-testid="webhook-secret"]')).toBeNull();
    expect(document.body.textContent).not.toContain('whsec_PLAINTEXT_ONCE');
  });

  it('updates a webhook, including pausing it', async () => {
    await mountWebhooks();

    click(el(`[data-testid="edit-webhook-${HOOK.id}"]`));
    await settle(() => (el<HTMLInputElement>('#wh-url').value ?? '') === HOOK.url);
    click(el<HTMLInputElement>('#wh-active'));
    submitForm(el<HTMLFormElement>('[data-testid="webhook-form"]'));
    await settle(() => callsOf('tenant_updateWebhook').length > 0);

    expect(callsOf('tenant_updateWebhook')[0]?.[1]).toEqual({
      id: HOOK.id,
      input: { url: HOOK.url, events: [], description: 'Production', isActive: false },
    });
    expect(callsOf('tenant_createWebhook')).toHaveLength(0);
  });

  it('deletes a webhook only after confirming', async () => {
    await mountWebhooks();

    click(el(`[data-testid="delete-webhook-${HOOK.id}"]`));
    await settle(
      () =>
        document.body.querySelector(`[data-testid="confirm-delete-webhook-${HOOK.id}"]`) !== null
    );
    expect(callsOf('tenant_deleteWebhook')).toHaveLength(0);

    click(el(`[data-testid="confirm-delete-webhook-${HOOK.id}"]`));
    await settle(() => callsOf('tenant_deleteWebhook').length > 0);
    expect(callsOf('tenant_deleteWebhook')[0]?.[1]).toEqual({ id: HOOK.id });
  });

  it('sends a test event and shows the endpoint answer', async () => {
    await mountWebhooks();

    click(el('[data-testid="test-webhook"]'));
    await settle(
      () => page?.container.querySelector('[data-testid="webhook-test-result"]') !== null
    );

    const result = el('[data-testid="webhook-test-result"]').textContent ?? '';
    expect(result).toContain('200');
    expect(result).toContain('Delivered');
  });
});

describe('WebhookLogs (container)', () => {
  async function mountLogs() {
    mocks.request.mockImplementation(
      respond({
        tenant_webhookEventTypes: () => EVENT_TYPES,
        tenant_webhookLogs: () => ({
          data: [LOG],
          has_more: false,
          page: 1,
          page_size: 20,
          total: 1,
          total_pages: 1,
        }),
      })
    );
    page = renderTenant(<WebhookLogs />);
    await settle(() => page?.container.querySelector('[data-testid="webhook-logs"]') !== null);
  }

  it('lists the deliveries from page 1', async () => {
    await mountLogs();

    expect(callsOf('tenant_webhookLogs')[0]?.[1]).toEqual({ filters: { page: 1, page_size: 20 } });
    const text = el('[data-testid="webhook-logs"]').textContent ?? '';
    expect(text).toContain('transaction.updated');
    expect(text).toContain('500');
    expect(text).toContain('Failed');
    expect(page?.container.querySelector('a[href="/tenant/webhooks/logs/log-1"]')).not.toBeNull();
  });

  it('filters by result with a real boolean and by event type', async () => {
    await mountLogs();

    select('#logs-success', 'false');
    await settle(() => callsOf('tenant_webhookLogs').length > 1);
    const failed = callsOf('tenant_webhookLogs').at(-1)?.[1] as {
      filters: Record<string, unknown>;
    };
    expect(failed.filters).toEqual({ page: 1, page_size: 20, success: false });
    expect(typeof failed.filters.success).toBe('boolean');

    select('#logs-success', 'true');
    await settle(() => callsOf('tenant_webhookLogs').length > 2);
    expect(
      (callsOf('tenant_webhookLogs').at(-1)?.[1] as { filters: Record<string, unknown> }).filters
        .success
    ).toBe(true);

    select('#logs-event', 'customer.created');
    await settle(() => callsOf('tenant_webhookLogs').length > 3);
    expect(callsOf('tenant_webhookLogs').at(-1)?.[1]).toEqual({
      filters: { page: 1, page_size: 20, success: true, eventType: 'customer.created' },
    });

    select('#logs-success', '');
    await settle(() => callsOf('tenant_webhookLogs').length > 4);
    expect(callsOf('tenant_webhookLogs').at(-1)?.[1]).toEqual({
      filters: { page: 1, page_size: 20, eventType: 'customer.created' },
    });
  });
});

describe('WebhookLogDetail (container)', () => {
  it('shows the payload sent, the endpoint answer and the next retry', async () => {
    mocks.request.mockImplementation(respond({ tenant_webhookLog: () => LOG_DETAIL }));
    page = renderTenant(<WebhookLogDetail />, {
      path: '/tenant/webhooks/logs/log-1',
      routePath: '/tenant/webhooks/logs/:logId',
    });
    await settle(() => page?.text().includes('evt_tx_1') ?? false);

    expect(callsOf('tenant_webhookLog')[0]?.[1]).toEqual({ id: 'log-1' });
    expect(el('[data-testid="webhook-log-payload"]').textContent).toContain(
      '"status": "COMPLETED"'
    );
    expect(page?.text()).toContain('{"error":"boom"}');
    expect(page?.text()).toContain('HTTP 500');
  });
});
