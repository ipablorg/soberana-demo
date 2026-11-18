/* @vitest-environment jsdom */

/**
 * Customer 360 detail dialog: the "Agregar billetera" action.
 *
 * Runs the real page, hooks and `AddWalletDialog` against a mocked GraphQL
 * client, so it also proves that the wallet list is refetched after a create.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ListWalletsByCustomerDocument } from '@/graphql/queries/admin-loopay';
import { ListCustomersManagementDocument } from '@/graphql/queries/admin-loopay';
import { ListProvidersDocument } from '@/graphql/queries/admin-loopay';
import {
  CreateWalletDocument,
  RequestVirtualAccountDocument,
} from '@/graphql/mutations/admin-loopay';
import { useAuthStore } from '@/shared/stores/auth-store';
import { CustomerReceiveOptionsDocument } from '../../lib/virtual-account-request';
import type {
  AdminClientKycStatus,
  AdminCustomerManagementEntity,
  AdminWalletResponse,
} from '@/graphql/types/admin-loopay';
import { mountPage, type MountedPage } from '@/test/dom-render';
import Customer360 from '../customer-360';

interface SelectRegistration {
  value: string | undefined;
  onValueChange: (value: string) => void;
}

const CLIENT_ID = '5a0c1e93-2b7d-4f6a-8c3d-222222222222';
const CUSTOMER_ID = '0b6d2f6e-7f1c-4c1e-9d4e-111111111111';

const request = vi.fn();
const toastSuccess = vi.fn();
const toastInfo = vi.fn();
const toastError = vi.fn();
const selects: Record<string, SelectRegistration> = {};
let isAdmin = true;
let kycStatus: AdminClientKycStatus = 'APPROVED';
let wallets: AdminWalletResponse[] = [];

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

// The requirements link (S21) is a router Link with its own query; stubbed here.
vi.mock('../../../provider-requirements/components/customer-requirements-link', () => ({
  CustomerRequirementsLink: ({ customerId }: { customerId: string }) => (
    <span>requirements-link:{customerId}</span>
  ),
}));

// The view-as button (#415) navigates to the client app; stubbed here.
vi.mock('../../components/view-as-customer-button', () => ({
  ViewAsCustomerButton: ({ customerId }: { customerId: string }) => (
    <span>view-as:{customerId}</span>
  ),
}));

vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: (...args: unknown[]) => request(...args) },
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    info: (...args: unknown[]) => toastInfo(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

vi.mock('@/shared/hooks/use-staff-role', () => ({
  useHasStaffRole: () => isAdmin,
}));

vi.mock('@/shared/components/common/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock('@/shared/components/common/DataTable', () => ({
  DataTable: ({
    data,
    onRowClick,
    toolbar,
  }: {
    data: AdminCustomerManagementEntity[];
    onRowClick: (row: AdminCustomerManagementEntity) => void;
    toolbar?: React.ReactNode;
  }) => (
    <div>
      {toolbar}
      {data.map((customer) => (
        <button
          key={customer.id}
          type="button"
          data-row={customer.id}
          onClick={() => onRowClick(customer)}
        >
          {customer.email}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../../../ops-review/components/client-filter-select', () => ({
  ClientFilterSelect: () => null,
}));

vi.mock('@/shared/components/backoffice/StatePillChip', () => ({
  StatePillChip: ({ status }: { status: string }) => <span>{status}</span>,
  StatePillChipStatusLabel: (status: string) => status,
}));

vi.mock('@/shared/components/backoffice/StateChangeConfirmationModal', () => ({
  StateChangeConfirmationModal: () => null,
}));

vi.mock('@/shared/components/backoffice/toggle-confirmation-dialog', () => ({
  ToggleConfirmationDialog: () => null,
}));

vi.mock('@/shared/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: ReactNode; open: boolean }) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('@/shared/components/ui/select', async () => {
  const React = await import('react');
  const SelectContext = React.createContext<SelectRegistration | null>(null);

  return {
    Select: (props: SelectRegistration & { children: ReactNode }) => (
      <SelectContext.Provider value={props}>{props.children}</SelectContext.Provider>
    ),
    SelectTrigger: ({ id, children }: { id: string; children: ReactNode }) => {
      const context = React.useContext(SelectContext);
      if (context && id) selects[id] = context;
      return <div id={id}>{children}</div>;
    },
    SelectValue: () => null,
    SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
      <div data-option={value}>{children}</div>
    ),
  };
});

function customer(): AdminCustomerManagementEntity {
  return {
    id: CUSTOMER_ID,
    clientId: CLIENT_ID,
    externalId: 'ext-1',
    email: 'ana@example.com',
    firstName: 'Ana',
    middleName: null,
    lastName: 'Pérez',
    taxId: 'TAX-1',
    taxIdTypeId: 'tax-type-1',
    country: 'CO',
    kycStatus,
    customerStatus: 'ACTIVE',
    capabilities: null,
    rejectionReasons: null,
    addressDetails: null,
    metadata: null,
    bridgeCustomerId: null,
    bridgeKycLevel: null,
    bridgeKycUrl: null,
    createdAt: '2026-07-09T12:30:00.000Z',
    updatedAt: '2026-07-09T12:30:00.000Z',
  };
}

function wallet(overrides: Partial<AdminWalletResponse> = {}): AdminWalletResponse {
  return {
    id: 'wallet-1',
    customerId: CUSTOMER_ID,
    clientId: CLIENT_ID,
    providerId: 'provider-1',
    providerCode: 'openfort',
    currency: 'USDC',
    walletType: 'CUSTODIAL',
    chain: 'tron',
    address: 'TronAddress',
    alias: null,
    balance: 0,
    status: 'ACTIVE',
    alreadyExisted: false,
    virtualAccountIds: [],
    createdAt: '2026-07-09T12:30:00.000Z',
    createdBy: 'admin-1',
    ...overrides,
  };
}

let page: MountedPage;
let queryClient: QueryClient;

function walletsRequests(): number {
  return request.mock.calls.filter(([document]) => document === ListWalletsByCustomerDocument)
    .length;
}

function createRequests(): unknown[][] {
  return request.mock.calls.filter(([document]) => document === CreateWalletDocument);
}

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

/**
 * TanStack notifies observers on a macrotask, so let React flush between
 * attempts (polling inside a single `act` would never render).
 */
async function waitFor(assertion: () => unknown, attempts = 100) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      assertion();
      return;
    } catch (error) {
      if (attempt >= attempts) throw error;
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
    }
  }
}

async function openCustomer() {
  page = mountPage(
    <QueryClientProvider client={queryClient}>
      <Customer360 />
    </QueryClientProvider>
  );
  await waitFor(() => page.findByText('button', 'ana@example.com'));
  page.click(page.findByText('button', 'ana@example.com'));
  await waitFor(() => expect(walletsRequests()).toBeGreaterThan(0));
  await settle();
}

function addWalletButton(): HTMLButtonElement | null {
  return (
    (Array.from(page.container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Agregar billetera'
    ) as HTMLButtonElement | undefined) ?? null
  );
}

function confirmButton(): HTMLButtonElement {
  // Scoped to the form: other <Button>s in the panel have no explicit type.
  return page.container.querySelector('form button[type="submit"]') as HTMLButtonElement;
}

beforeEach(() => {
  isAdmin = true;
  kycStatus = 'APPROVED';
  wallets = [wallet()];
  for (const key of Object.keys(selects)) delete selects[key];
  request.mockReset();
  toastSuccess.mockClear();
  toastInfo.mockClear();
  toastError.mockClear();
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  request.mockImplementation(async (document: unknown) => {
    if (document === ListCustomersManagementDocument) {
      return { adminLoopay_listCustomers: [customer()] };
    }
    if (document === ListWalletsByCustomerDocument) {
      return { adminLoopay_listWalletsByCustomer: wallets };
    }
    if (document === ListProvidersDocument) {
      // No wallet-capable providers configured for this test: the dialog
      // falls back to "Automático", matching today's behavior.
      return { adminLoopay_listProviders: [] };
    }
    if (document === CreateWalletDocument) {
      const created = wallet({ id: 'wallet-2', chain: 'solana', address: 'SolAddress' });
      wallets = [...wallets, created];
      return { adminLoopay_createWallet: created };
    }
    if (document === CustomerReceiveOptionsDocument) {
      return {
        adminLoopay_customerReceiveOptions: [
          {
            country: 'US',
            currency: 'USD',
            railCode: 'ach',
            railName: 'ACH',
            provider: 'kirafin',
            providers: ['kirafin'],
            status: 'available',
            requestId: null,
            virtualAccountId: null,
            vaRequestState: null,
            blockers: [],
            reason: null,
            eligible: true,
            ineligibleReason: null,
          },
        ],
      };
    }
    if (document === RequestVirtualAccountDocument) {
      return { adminLoopay_requestVirtualAccount: { created: true, request: {} } };
    }
    throw new Error('Unexpected operation');
  });
});

afterEach(() => {
  page?.unmount();
  useAuthStore.setState({ user: null });
});

function signInWithRoles(staffRoles: string[]) {
  useAuthStore.setState({ user: { staff_roles: staffRoles } as never });
}

function requestVaButton(): HTMLButtonElement | null {
  return (
    (Array.from(page.container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Solicitar cuenta virtual'
    ) as HTMLButtonElement | undefined) ?? null
  );
}

describe('Customer360 — Solicitar cuenta virtual', () => {
  it.each([['LOOPAY_ADMIN'], ['LOOPAY_OPERATIONS']])(
    'is offered to %s and requests the picked rail',
    async (role) => {
      signInWithRoles([role]);

      await openCustomer();
      expect(requestVaButton()?.disabled).toBe(false);
      page.click(requestVaButton() as Element);
      await waitFor(() => page.findByText('button', 'Solicitar'));
      page.click(page.findByText('button', 'Solicitar'));

      await waitFor(() =>
        expect(
          request.mock.calls.filter(([document]) => document === RequestVirtualAccountDocument)
        ).toHaveLength(1)
      );
      const call = request.mock.calls.find(
        ([document]) => document === RequestVirtualAccountDocument
      );
      expect(call?.[1]).toEqual({
        input: { customerId: CUSTOMER_ID, country: 'US', currency: 'USD', railCode: 'ach' },
      });
    }
  );

  it.each([['OPS_KYC'], ['OPS_COMMERCIAL']])(
    'is not offered to %s (#411: commercial reads only)',
    async (role) => {
      signInWithRoles([role]);

      await openCustomer();

      expect(requestVaButton()).toBeNull();
    }
  );

  it('is disabled with a visible reason while the KYC is not approved', async () => {
    signInWithRoles(['LOOPAY_OPERATIONS']);
    kycStatus = 'PENDING_REVIEW';

    await openCustomer();

    expect(requestVaButton()?.disabled).toBe(true);
    expect(page.container.querySelector('#request-va-blocked-reason')?.textContent).toBe(
      'Requiere KYC aprobado'
    );
  });
});

describe('Customer360 — Agregar billetera', () => {
  beforeEach(() => {
    signInWithRoles(['LOOPAY_ADMIN']);
  });

  it.each([['OPS_KYC'], ['OPS_COMMERCIAL']])(
    'is not offered to %s (#411: commercial reads wallets only)',
    async (role) => {
      signInWithRoles([role]);

      await openCustomer();

      expect(page.text()).toContain('Billeteras');
      expect(addWalletButton()).toBeNull();
    }
  );

  it('is enabled for an admin when the customer KYC is approved', async () => {
    await openCustomer();

    const button = addWalletButton();
    expect(button).not.toBeNull();
    expect(button?.disabled).toBe(false);
    expect(page.text()).not.toContain('Requiere KYC aprobado');
  });

  it('is disabled with a visible reason when KYC is not approved', async () => {
    kycStatus = 'PENDING_REVIEW';

    await openCustomer();

    const button = addWalletButton();
    expect(button?.disabled).toBe(true);
    const hintId = button?.getAttribute('aria-describedby');
    expect(hintId).toBeTruthy();
    expect(page.container.querySelector(`#${hintId}`)?.textContent).toBe('Requiere KYC aprobado');

    page.click(button as Element);
    expect(page.container.querySelector('form')).toBeNull();
  });

  it('opens the dialog offering the chains the customer already uses', async () => {
    await openCustomer();

    page.click(addWalletButton() as Element);

    expect(page.container.querySelector('form')).not.toBeNull();
    expect(page.text()).toContain('Ana Pérez');
    expect(
      Array.from(page.container.querySelectorAll('[data-option]')).map((node) =>
        node.getAttribute('data-option')
      )
    ).toContain('tron');
  });

  it('creates the wallet for the customer and client, refetches the list and closes', async () => {
    await openCustomer();
    expect(walletsRequests()).toBe(1);
    expect(page.text()).not.toContain('SolAddress');

    page.click(addWalletButton() as Element);
    page.flush(() => selects['add-wallet-chain']?.onValueChange('solana'));
    page.click(confirmButton());
    await waitFor(() => expect(createRequests()).toHaveLength(1));
    await waitFor(() => expect(walletsRequests()).toBe(2));

    const [document, variables] = createRequests()[0] ?? [];
    expect(document).toBe(CreateWalletDocument);
    expect(variables).toEqual({
      input: { clientId: CLIENT_ID, customerId: CUSTOMER_ID, chain: 'solana' },
    });
    expect(toastSuccess).toHaveBeenCalledWith('Billetera USDC creada en solana.');
    expect(walletsRequests()).toBe(2);
    expect(page.text()).toContain('SolAddress');
    expect(page.container.querySelector('form')).toBeNull();
  });

  it('keeps the dialog open with a friendly message when the backend rejects the chain', async () => {
    const message =
      "Chain 'bitcoin' is not supported by provider openfort. Available chains: base, solana";
    request.mockImplementation(async (document: unknown) => {
      if (document === ListCustomersManagementDocument) {
        return { adminLoopay_listCustomers: [customer()] };
      }
      if (document === ListWalletsByCustomerDocument) {
        return { adminLoopay_listWalletsByCustomer: wallets };
      }
      if (document === ListProvidersDocument) {
        return { adminLoopay_listProviders: [] };
      }
      throw { message, response: { status: 200, errors: [{ message }] } };
    });
    await openCustomer();

    page.click(addWalletButton() as Element);
    page.flush(() => selects['add-wallet-chain']?.onValueChange('__custom__'));
    const chainInput = page.container.querySelector('#add-wallet-custom-chain') as HTMLInputElement;
    const { changeValue } = await import('@/test/dom-input');
    changeValue(chainInput, 'bitcoin');
    page.click(confirmButton());
    await waitFor(() => expect(page.container.querySelector('[role="alert"]')).not.toBeNull());

    expect(page.container.querySelector('form')).not.toBeNull();
    expect(page.container.querySelector('[role="alert"]')?.textContent).toContain(
      'Cadenas disponibles: base, solana'
    );
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(walletsRequests()).toBe(1);
  });
});

function buttonLabels(): string[] {
  return Array.from(page.container.querySelectorAll('button')).map(
    (button) => button.textContent?.trim() ?? ''
  );
}

describe('Customer360 — customer status actions', () => {
  it.each([['OPS_COMMERCIAL'], ['OPS_VA']])(
    'are not offered to %s (the backend gate is LOOPAY_ADMIN only)',
    async (role) => {
      signInWithRoles([role]);

      await openCustomer();
      await waitFor(() => expect(page.text()).toContain('TronAddress'));

      const labels = buttonLabels();
      expect(labels).not.toContain('Suspender');
      expect(labels).not.toContain('Congelar');
      expect(labels).not.toContain('Penalizar');
      expect(labels).not.toContain('Cerrar');
    }
  );

  it('are offered to the super admin', async () => {
    signInWithRoles(['LOOPAY_ADMIN']);

    await openCustomer();

    await waitFor(() => expect(buttonLabels()).toContain('Cerrar'));
    const labels = buttonLabels();
    expect(labels).toContain('Suspender');
    expect(labels).toContain('Congelar');
    expect(labels).toContain('Penalizar');
  });

  it('offers to reopen a CLOSED wallet to the super admin', async () => {
    signInWithRoles(['LOOPAY_ADMIN']);
    wallets = [wallet({ status: 'CLOSED' })];

    await openCustomer();

    await waitFor(() => expect(buttonLabels()).toContain('Reabrir'));
    // 'Cerrar' is the wallet-only action; 'Suspender' also exists as a customer action.
    expect(buttonLabels()).not.toContain('Cerrar');
  });

  it('does not offer to reopen a CLOSED wallet to OPS_COMMERCIAL', async () => {
    signInWithRoles(['OPS_COMMERCIAL']);
    wallets = [wallet({ status: 'CLOSED' })];

    await openCustomer();
    await waitFor(() => expect(page.text()).toContain('TronAddress'));

    expect(buttonLabels()).not.toContain('Reabrir');
  });
});

function typeInto(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  page.flush(() => {
    setter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('Customer360 — provider requirements (S21)', () => {
  it('links the selected customer to its provider requirements', async () => {
    signInWithRoles(['OPS_COMMERCIAL']);

    await openCustomer();

    expect(page.text()).toContain(`requirements-link:${CUSTOMER_ID}`);
  });
});

describe('Customer360 search (N-5)', () => {
  it('searches by name, business legal name or email through `search`, not `email`', async () => {
    page = mountPage(
      <QueryClientProvider client={queryClient}>
        <Customer360 />
      </QueryClientProvider>
    );
    await settle();

    typeInto(page.container.querySelector('#customer-search') as HTMLInputElement, 'Acme');

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ where: expect.objectContaining({ search: 'Acme' }) })
      )
    );
    const withEmail = request.mock.calls.some(
      (call) => (call[1] as { where?: { email?: string } } | undefined)?.where?.email === 'Acme'
    );
    expect(withEmail).toBe(false);
  });
});

describe('Customer360 — view as customer (#415)', () => {
  it('offers the read-only client view to the super admin', async () => {
    signInWithRoles(['LOOPAY_ADMIN']);
    isAdmin = true;

    await openCustomer();

    expect(page.text()).toContain('view-as:');
  });

  // OPS_COMMERCIAL is offered it since epic 2026-11 S5 (see the S5 block below).
  it.each([['LOOPAY_OPERATIONS'], ['OPS_VA']])('does not offer it to %s', async (role) => {
    signInWithRoles([role]);
    isAdmin = false;

    await openCustomer();

    expect(page.text()).not.toContain('view-as:');
  });
});

describe('Customer360 — Ver como cliente (#415, S5)', () => {
  const viewAs = () => page.container.textContent?.includes(`view-as:${CUSTOMER_ID}`) ?? false;

  it.each([['LOOPAY_ADMIN'], ['OPS_COMMERCIAL']])(
    'is offered to %s (epic 2026-11 S5: commercials view as a customer too)',
    async (role) => {
      signInWithRoles([role]);

      await openCustomer();

      expect(viewAs()).toBe(true);
    }
  );

  it.each([['LOOPAY_OPERATIONS'], ['OPS_KYC']])('is not offered to %s', async (role) => {
    signInWithRoles([role]);

    await openCustomer();

    expect(viewAs()).toBe(false);
  });
});
