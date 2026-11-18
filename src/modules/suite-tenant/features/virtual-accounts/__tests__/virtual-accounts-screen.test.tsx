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

import type { TenantCustomer, TenantReceiveOption } from '@/graphql/types/tenant';
import { changeValue, submitForm } from '@/test/dom-input';
import type { MountedPage } from '@/test/dom-render';
import VirtualAccounts from '@/modules/suite-tenant/features/virtual-accounts/pages/virtual-accounts';
import {
  renderTenant,
  respond,
  settle,
  type Handler,
} from '@/modules/suite-tenant/__tests__/tenant-harness';

const CUSTOMER: TenantCustomer = {
  id: 'c0a8b1e2-1111-4111-8111-111111111111',
  external_id: 'ext-001',
  email: 'ana@acme.test',
  customer_type: 'business',
  business_name: 'Acme MX',
  kyc_status: 'APPROVED',
  customer_status: 'ACTIVE',
  created_at: '2026-11-01T10:00:00.000Z',
};

const OPTION: TenantReceiveOption = {
  country: 'MEX',
  currency: 'MXN',
  rail_code: 'spei',
  rail_name: 'SPEI',
  provider: 'mesta',
  providers: ['mesta'],
  status: 'available',
  request_id: null,
  virtual_account_id: null,
  va_request_state: null,
  blockers: [],
  reason: null,
  eligible: true,
  ineligible_reason: null,
};

const ACTIVE: TenantReceiveOption = {
  ...OPTION,
  country: 'USA',
  currency: 'USD',
  rail_code: 'ach',
  rail_name: 'ACH',
  provider: 'kirafin',
  providers: ['kirafin'],
  status: 'active',
  virtual_account_id: 'va-1',
};

const BLOCKED: TenantReceiveOption = {
  ...OPTION,
  rail_code: 'pix',
  rail_name: 'PIX',
  country: 'BRA',
  currency: 'BRL',
  status: 'requested',
  request_id: 'req-2',
  blockers: [{ code: 'MESTA_DOC', category: 'DOCUMENT', message: 'Proof of address required' }],
};

const page1 = <T,>(data: T[]) => ({
  data,
  has_more: false,
  page: 1,
  page_size: 100,
  total: data.length,
  total_pages: 1,
});

let page: MountedPage | null = null;

function el<T extends Element>(selector: string): T {
  const element = page?.container.querySelector<T>(selector);
  if (!element) throw new Error(`missing ${selector}`);
  return element;
}

function click(element: Element) {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
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
});

async function mountFor(extra: Record<string, Handler> = {}) {
  mocks.request.mockImplementation(
    respond({
      tenant_listCustomers: () => page1([CUSTOMER]),
      tenant_virtualAccountReceiveOptions: () => ({ data: [OPTION, ACTIVE, BLOCKED] }),
      tenant_requestVirtualAccount: () => ({
        created: true,
        request: { ...OPTION, status: 'requested' },
      }),
      ...extra,
    })
  );
  page = renderTenant(<VirtualAccounts />, {
    path: `/tenant/virtual-accounts?customer_id=${CUSTOMER.id}`,
    routePath: '/tenant/virtual-accounts',
  });
  await settle(() => page?.container.querySelector('[data-testid="receive-options"]') !== null);
}

describe('VirtualAccounts (container)', () => {
  it('shows where the customer can receive, with state and blockers', async () => {
    await mountFor();

    expect(callsOf('tenant_virtualAccountReceiveOptions')[0]?.[1]).toEqual({
      filters: { customer_id: CUSTOMER.id },
    });
    const text = el('[data-testid="receive-options"]').textContent ?? '';
    expect(text).toContain('SPEI');
    expect(text).toContain('Active');
    expect(text).toContain('Proof of address required');
  });

  it('offers a request only on available, eligible options', async () => {
    await mountFor();

    expect(page?.container.querySelector('[data-testid="request-va-spei"]')).not.toBeNull();
    expect(page?.container.querySelector('[data-testid="request-va-ach"]')).toBeNull();
    expect(page?.container.querySelector('[data-testid="request-va-pix"]')).toBeNull();
  });

  it('requests a virtual account with the documented body', async () => {
    await mountFor();

    click(el('[data-testid="request-va-spei"]'));
    await settle(() => page?.container.querySelector('[data-testid="va-request-result"]') !== null);

    expect(callsOf('tenant_requestVirtualAccount')[0]?.[1]).toEqual({
      input: { customer_id: CUSTOMER.id, country: 'MEX', currency: 'MXN', rail_code: 'spei' },
    });
    expect(el('[data-testid="va-request-result"]').textContent).toContain('Request sent');
  });

  it('says so when the request already existed', async () => {
    await mountFor({
      tenant_requestVirtualAccount: () => ({
        created: false,
        request: { ...OPTION, status: 'requested' },
      }),
    });

    click(el('[data-testid="request-va-spei"]'));
    await settle(() => page?.container.querySelector('[data-testid="va-request-result"]') !== null);

    expect(el('[data-testid="va-request-result"]').textContent).toContain('already requested');
  });

  it('narrows the options to one country', async () => {
    await mountFor();

    changeValue(el<HTMLInputElement>('#va-country'), 'mx');
    submitForm(el<HTMLFormElement>('[data-testid="va-filter"]'));
    await settle(() => callsOf('tenant_virtualAccountReceiveOptions').length > 1);

    expect(callsOf('tenant_virtualAccountReceiveOptions').at(-1)?.[1]).toEqual({
      filters: { customer_id: CUSTOMER.id, country: 'MX' },
    });
  });
});
