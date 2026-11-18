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

import type {
  TenantBeneficiary,
  TenantCustomer,
  TenantTransaction,
  TenantWallet,
} from '@/graphql/types/tenant';
import { changeValue, submitForm } from '@/test/dom-input';
import type { MountedPage } from '@/test/dom-render';
import TransactionsList from '@/modules/suite-tenant/features/transactions/pages/transactions-list';
import TransactionDetail from '@/modules/suite-tenant/features/transactions/pages/transaction-detail';
import TransactionNew from '@/modules/suite-tenant/features/transactions/pages/transaction-new';
import {
  EMPTY_TRANSACTION_FORM,
  toTransactionInput,
  validateTransactionForm,
} from '@/modules/suite-tenant/features/transactions/lib/transaction-forms';
import {
  graphQLError,
  renderTenant,
  respond,
  settle,
} from '@/modules/suite-tenant/__tests__/tenant-harness';

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
  id: 'a0a8b1e2-3333-4333-8333-333333333333',
  customer_id: CUSTOMER.id,
  currency: 'USDT',
  chain: 'polygon',
  status: 'ACTIVE',
  alias: 'Main',
  created_at: '2026-11-02T10:00:00.000Z',
};

const BENEFICIARY: TenantBeneficiary = {
  id: 'ben-1',
  customer_id: CUSTOMER.id,
  country: 'COL',
  beneficiary_name: 'Luis Pérez',
  currency: 'COP',
  verification_status: 'VERIFIED',
  rail_code: 'co_ach',
  review_status: 'APPROVED',
  is_favorite: false,
  created_at: '2026-11-02T10:00:00.000Z',
};

const TX: TenantTransaction = {
  id: 'b0a8b1e2-4444-4444-8444-444444444444',
  wallet_id: WALLET.id,
  type: 'WITHDRAWAL',
  status: 'PENDING',
  amount: '250.00',
  currency: 'USDT',
  reference_code: 'REF-77',
  beneficiary_id: 'ben-1',
  created_at: '2026-11-03T09:00:00.000Z',
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

function el<T extends Element>(selector: string): T {
  const element = page?.container.querySelector<T>(selector);
  if (!element) throw new Error(`missing ${selector}`);
  return element;
}

function select(selector: string, value: string) {
  const element = el<HTMLSelectElement>(selector);
  page?.flush(() => {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function inputCalls() {
  return mocks.request.mock.calls.filter(([, variables]) => 'input' in (variables ?? {}));
}

beforeEach(() => {
  mocks.request.mockReset();
  mocks.toastError.mockReset();
});

afterEach(() => {
  page?.unmount();
  page = null;
});

describe('TransactionsList (container)', () => {
  it('lists transactions and filters by status from page 1', async () => {
    mocks.request.mockImplementation(respond({ tenant_listTransactions: () => page1([TX]) }));
    page = renderTenant(<TransactionsList />);
    await settle(() => page?.text().includes('REF-77') ?? false);

    expect(page.text()).toContain('Withdrawal');
    expect(mocks.request.mock.calls[0]?.[1]).toEqual({ filters: { page: 1, page_size: 20 } });

    select('#transactions-status', 'PENDING');
    await settle(() => mocks.request.mock.calls.length > 1);
    expect(mocks.request.mock.calls.at(-1)?.[1]).toEqual({
      filters: { page: 1, page_size: 20, status: 'PENDING' },
    });
  });
});

describe('TransactionDetail (container)', () => {
  it('renders the transaction fields', async () => {
    mocks.request.mockImplementation(respond({ tenant_getTransaction: () => TX }));
    page = renderTenant(<TransactionDetail />, {
      path: `/tenant/transactions/${TX.id}`,
      routePath: '/tenant/transactions/:transactionId',
    });
    await settle(() => page?.text().includes('REF-77') ?? false);

    expect(page.text()).toContain('Withdrawal.');
    expect(page.text()).toContain('Pending');
    expect(page.text()).toContain('ben-1');
    expect(mocks.request.mock.calls[0]?.[1]).toEqual({ id: TX.id });
  });
});

describe('TransactionNew (container)', () => {
  const handlers = (environment = 'sandbox') => ({
    tenant_me: () => ({
      client_id: 'cl-1',
      name: 'Acme',
      status: 'ACTIVE',
      api_key_prefix: 'lpk',
      environment,
      enabled_rails: [],
    }),
    tenant_listCustomers: () => page1([CUSTOMER]),
    tenant_listWallets: () => page1([WALLET]),
    // The REST body: a bare array.
    tenant_listBeneficiaries: () => [
      { ...BENEFICIARY, id: 'ben-1', alias: 'Luis MX' },
      { ...BENEFICIARY, id: 'ben-off', alias: 'Old account', verification_status: 'UNVERIFIED' },
    ],
    tenant_paymentLinkCapabilities: () => ({
      supported_currencies: ['USD'],
      payment_link_rails: ['ec_bank_transfer', 'pix'],
    }),
    tenant_createOffRamp: () => ({ id: TX.id, status: 'PENDING' }),
    tenant_createPaymentLink: () => ({
      id: 'pl-1',
      status: 'ACTIVE',
      payment_url: 'https://pay.example/pl-1',
      amount: 50,
      currency: 'USD',
    }),
  });

  async function mountNew(environment = 'sandbox') {
    mocks.request.mockImplementation(respond(handlers(environment)));
    page = renderTenant(<TransactionNew />);
    await settle(() => page?.container.querySelector('[data-testid="transaction-form"]') !== null);
    await settle(
      () => (page?.container.querySelectorAll('#tx-customer_id option').length ?? 0) > 1
    );
  }

  async function chooseWallet() {
    select('#tx-customer_id', CUSTOMER.id);
    await settle(() => (page?.container.querySelectorAll('#tx-wallet_id option').length ?? 0) > 1);
    select('#tx-wallet_id', WALLET.id);
  }

  it('validates the off-ramp before calling the back', async () => {
    await mountNew();
    changeValue(el<HTMLInputElement>('#tx-amount'), '0');
    submitForm(el<HTMLFormElement>('[data-testid="transaction-form"]'));
    await settle();

    expect(el('[data-testid="tx-wallet_id-error"]').textContent).toBe('Required.');
    expect(el('[data-testid="tx-amount-error"]').textContent).toBe(
      'Enter an amount of at least 0.01.'
    );
    expect(inputCalls()).toHaveLength(0);
  });

  it('offers the chosen customer’s active beneficiaries instead of a free-text id', async () => {
    await mountNew();
    expect(el<HTMLSelectElement>('#tx-beneficiary_id').disabled).toBe(true);

    await chooseWallet();
    await settle(
      () => (page?.container.querySelectorAll('#tx-beneficiary_id option').length ?? 0) > 1
    );

    const options = Array.from(el<HTMLSelectElement>('#tx-beneficiary_id').options).map(
      (option) => option.value
    );
    expect(options).toEqual(['', 'ben-1']);
    expect(el<HTMLSelectElement>('#tx-beneficiary_id').textContent).toContain('Luis MX');
    const call = mocks.request.mock.calls.find(
      ([, variables]) =>
        'filters' in (variables ?? {}) &&
        (variables as { filters: Record<string, unknown> }).filters.customer_id !== undefined
    );
    expect(call?.[1]).toEqual({ filters: { customer_id: CUSTOMER.id } });
  });

  it('sends the off-ramp REST body with one reference reused on retry', async () => {
    await mountNew();
    await chooseWallet();
    await settle(
      () => (page?.container.querySelectorAll('#tx-beneficiary_id option').length ?? 0) > 1
    );
    select('#tx-beneficiary_id', 'ben-1');
    changeValue(el<HTMLInputElement>('#tx-amount'), '250');

    mocks.request.mockImplementation(
      respond({
        ...handlers(),
        tenant_createOffRamp: () => {
          throw graphQLError('PROVIDER_OUTCOME_UNKNOWN', 'Provider timeout', 'SERVICE_UNAVAILABLE');
        },
      })
    );
    submitForm(el<HTMLFormElement>('[data-testid="transaction-form"]'));
    await settle(() => inputCalls().length === 1 && mocks.toastError.mock.calls.length === 1);

    mocks.request.mockImplementation(respond(handlers()));
    submitForm(el<HTMLFormElement>('[data-testid="transaction-form"]'));
    await settle(
      () => page?.container.querySelector('[data-testid="transaction-result"]') !== null
    );

    const [first, second] = inputCalls().map(
      ([, variables]) => variables as { input: Record<string, unknown> }
    );
    expect(first?.input).toEqual({
      wallet_id: WALLET.id,
      beneficiary_id: 'ben-1',
      amount: 250,
      currency: 'USDT',
      client_reference_id: expect.any(String),
    });
    expect(second?.input.client_reference_id).toBe(first?.input.client_reference_id);
    expect(page?.container.querySelector(`a[href="/tenant/transactions/${TX.id}"]`)).not.toBeNull();
  });

  it('books the off-ramp in the wallet currency: prefilled and locked once the wallet is chosen', async () => {
    await mountNew();
    const currency = () => el<HTMLInputElement>('#tx-currency');
    expect(currency().readOnly).toBe(true);
    expect(currency().value).toBe('');
    expect(page?.text()).toContain('Always the source wallet currency.');
    expect(page?.text()).not.toContain('Beneficiary payout currency');

    await chooseWallet();

    expect(currency().value).toBe('USDT');
    expect(currency().readOnly).toBe(true);
  });

  it('keeps the currency free on payment links', async () => {
    await mountNew();
    page?.click(el('button[data-kind="payment_link"]'));
    await chooseWallet();

    expect(el<HTMLInputElement>('#tx-currency').readOnly).toBe(false);
    expect(el<HTMLInputElement>('#tx-currency').value).toBe('');
  });

  it('asks for the payer block on Ecuador payment links and shows the link to share', async () => {
    await mountNew();
    page?.click(el('button[data-kind="payment_link"]'));
    await settle(() => (page?.container.querySelectorAll('#tx-rail_code option').length ?? 0) > 1);
    await chooseWallet();
    changeValue(el<HTMLInputElement>('#tx-amount'), '50');
    changeValue(el<HTMLInputElement>('#tx-currency'), 'USD');
    select('#tx-rail_code', 'ec_bank_transfer');

    submitForm(el<HTMLFormElement>('[data-testid="transaction-form"]'));
    await settle();
    expect(el('[data-testid="tx-return_url-error"]').textContent).toBe('Required.');
    expect(inputCalls()).toHaveLength(0);

    changeValue(el<HTMLInputElement>('#tx-return_url'), 'https://acme.test/paid');
    changeValue(el<HTMLInputElement>('#tx-payer_full_name'), 'Luis Pérez');
    changeValue(el<HTMLInputElement>('#tx-payer_document_type'), 'CI');
    changeValue(el<HTMLInputElement>('#tx-payer_document_number'), '0102030405');
    changeValue(el<HTMLInputElement>('#tx-payer_email'), 'luis@payer.test');
    changeValue(el<HTMLInputElement>('#tx-payer_phone'), '+593991234567');
    submitForm(el<HTMLFormElement>('[data-testid="transaction-form"]'));
    await settle(
      () => page?.container.querySelector('[data-testid="transaction-result"]') !== null
    );

    expect((inputCalls()[0]?.[1] as { input: unknown }).input).toEqual({
      customer_id: CUSTOMER.id,
      wallet_id: WALLET.id,
      amount: 50,
      currency: 'USD',
      rail_code: 'ec_bank_transfer',
      return_url: 'https://acme.test/paid',
      payer_details: {
        full_name: 'Luis Pérez',
        document_type: 'CI',
        document_number: '0102030405',
        email: 'luis@payer.test',
        phone: '+593991234567',
      },
    });
    expect(page?.text()).toContain('https://pay.example/pl-1');
  });

  it('disables crypto transfers in production', async () => {
    await mountNew('production');
    await settle(() => el<HTMLButtonElement>('button[data-kind="transfer"]').disabled);

    expect(el<HTMLButtonElement>('button[data-kind="transfer"]').disabled).toBe(true);
    expect(el<HTMLButtonElement>('button[data-kind="off_ramp"]').disabled).toBe(false);
  });
});

describe('transaction form rules', () => {
  it('never sends payer details for a non-Ecuador payment link', () => {
    const command = toTransactionInput(
      'payment_link',
      {
        ...EMPTY_TRANSACTION_FORM,
        customer_id: CUSTOMER.id,
        wallet_id: WALLET.id,
        amount: '10',
        currency: 'brl',
        rail_code: 'pix',
        return_url: 'https://ignored.test',
        payer_full_name: 'ignored',
      },
      'unused'
    );
    expect(command.input).toEqual({
      customer_id: CUSTOMER.id,
      wallet_id: WALLET.id,
      amount: 10,
      currency: 'BRL',
      rail_code: 'pix',
    });
  });

  it('requires address, chain and amount for a transfer', () => {
    expect(
      validateTransactionForm('transfer', { ...EMPTY_TRANSACTION_FORM, wallet_id: WALLET.id })
    ).toEqual({
      to_address: 'required',
      amount: 'required',
      currency: 'required',
      chain: 'required',
    });
  });
});
