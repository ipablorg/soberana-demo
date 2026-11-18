// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ request: vi.fn(), toastError: vi.fn() }));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('sonner', () => ({ toast: { error: mocks.toastError, success: vi.fn() } }));
vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: mocks.request },
  setAuthToken: vi.fn(),
  clearHeaders: vi.fn(),
}));

import type { TenantCustomer, TenantWallet } from '@/graphql/types/tenant';
import type { MountedPage } from '@/test/dom-render';
import WalletsList from '@/modules/suite-tenant/features/wallets/pages/wallets-list';
import WalletDetail from '@/modules/suite-tenant/features/wallets/pages/wallet-detail';
import { renderTenant, respond, settle } from '@/modules/suite-tenant/__tests__/tenant-harness';

const CUSTOMER: TenantCustomer = {
  id: 'c0a8b1e2-1111-4111-8111-111111111111',
  external_id: 'ext-001',
  email: 'ana@acme.test',
  customer_type: 'individual',
  first_name: 'Ana',
  last_name: 'Gómez',
  kyc_status: 'APPROVED',
  customer_status: 'ACTIVE',
  created_at: '2026-11-01T10:00:00.000Z',
};

const WALLET: TenantWallet = {
  id: 'w0a8b1e2-3333-4333-8333-333333333333',
  customer_id: CUSTOMER.id,
  currency: 'USDT',
  chain: 'polygon',
  status: 'ACTIVE',
  alias: 'Main',
  address: '0xabc',
  created_at: '2026-11-02T10:00:00.000Z',
};

const page1 = <T,>(data: T[]) => ({
  data,
  has_more: false,
  page: 1,
  page_size: 20,
  total: data.length,
  total_pages: 1,
});

let page: MountedPage | null = null;

function select(selector: string, value: string) {
  const element = page?.container.querySelector<HTMLSelectElement>(selector);
  if (!element) throw new Error(`missing ${selector}`);
  page?.flush(() => {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
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

describe('WalletsList (container)', () => {
  it('asks to pick a customer, then lists that customer’s wallets', async () => {
    mocks.request.mockImplementation(
      respond({
        tenant_listCustomers: () => page1([CUSTOMER]),
        tenant_listWallets: () => page1([WALLET]),
      })
    );
    page = renderTenant(<WalletsList />, { path: '/tenant/wallets', routePath: '/tenant/wallets' });
    await settle(() => page?.text().includes('Pick a customer.') ?? false);
    expect(page.text()).toContain('Pick a customer.');

    select('#wallets-customer', CUSTOMER.id);
    await settle(() => page?.text().includes('Main') ?? false);

    expect(page.text()).toContain('Main');
    expect(page.text()).toContain('polygon');
    const call = mocks.request.mock.calls.find(
      ([, variables]) => 'customer_id' in (variables ?? {})
    );
    expect(call?.[1]).toEqual({ customer_id: CUSTOMER.id });
  });

  it('offers no wallet creation: Loopay operations mint wallets on approval', async () => {
    mocks.request.mockImplementation(
      respond({
        tenant_listCustomers: () => page1([CUSTOMER]),
        tenant_listWallets: () => page1([]),
      })
    );
    page = renderTenant(<WalletsList />, {
      path: `/tenant/wallets?customer_id=${CUSTOMER.id}`,
      routePath: '/tenant/wallets',
    });
    await settle(() => page?.text().includes('No wallets yet.') ?? false);

    expect(page.text()).toContain(
      'Wallets are created by Loopay operations when a customer is approved.'
    );
    expect(page.text()).not.toContain('New wallet');
    expect(page.container.querySelector('a[href^="/tenant/wallets/new"]')).toBeNull();
    expect(
      mocks.request.mock.calls.map(([document]) => String(document?.loc?.source.body ?? ''))
    ).not.toContainEqual(expect.stringContaining('tenant_createWallet'));
  });
});

describe('WalletDetail (container)', () => {
  it('shows balance, deposit instructions (with the wallet customer) and transactions', async () => {
    mocks.request.mockImplementation(
      respond({
        tenant_getWallet: () => WALLET,
        tenant_walletBalance: () => ({
          wallet_id: WALLET.id,
          balance: { available: 1050.5, spendable: 1000, pending: 50.5, total: 1101 },
          currency: 'USDT',
          updated_at: '2026-11-03T10:00:00.000Z',
        }),
        tenant_walletDepositInstructions: () => ({
          customer_id: CUSTOMER.id,
          wallet_id: WALLET.id,
          virtual_accounts: [
            {
              id: 'va-1',
              status: 'active',
              currency: 'USD',
              payment_rail: 'ach',
              bank_name: 'Lead Bank',
              account_number: '123456789',
              routing_number: '021000021',
            },
          ],
        }),
        tenant_walletTransactions: () =>
          page1([
            {
              id: 't-1',
              wallet_id: WALLET.id,
              type: 'DEPOSIT',
              status: 'COMPLETED',
              amount: '100.00',
              currency: 'USDT',
              reference_code: 'REF-1',
              created_at: '2026-11-03T09:00:00.000Z',
            },
          ]),
      })
    );
    page = renderTenant(<WalletDetail />, {
      path: `/tenant/wallets/${WALLET.id}`,
      routePath: '/tenant/wallets/:walletId',
    });
    await settle(
      () => (page?.text().includes('Lead Bank') && page?.text().includes('REF-1')) ?? false
    );

    // Amounts follow the runtime locale.
    const available = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(1050.5);
    expect(page.container.querySelector('[data-testid="wallet-balance"]')?.textContent).toContain(
      available
    );
    expect(
      page.container.querySelector('[data-testid="deposit-instructions"]')?.textContent
    ).toContain('123456789');
    expect(page.text()).toContain('REF-1');
    const call = mocks.request.mock.calls.find(
      ([, variables]) =>
        (variables as { customer_id?: string })?.customer_id !== undefined &&
        'id' in (variables ?? {})
    );
    expect(call?.[1]).toEqual({ id: WALLET.id, customer_id: CUSTOMER.id });
  });
});
