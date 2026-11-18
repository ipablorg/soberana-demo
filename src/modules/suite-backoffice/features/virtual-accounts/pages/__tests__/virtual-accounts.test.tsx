/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminVirtualAccountFilters } from '@/graphql/types/admin-loopay';
import { mountPage, type MountedPage } from '@/test/dom-render';
// Statically imported so the page's module graph is transformed during
// collection instead of inside the first (timed) test.
import VirtualAccounts from '../virtual-accounts';
import { MemoryRouter } from 'react-router-dom';

const useVirtualAccountsMock = vi.fn();
const useProviderLinkedAccountsMock = vi.fn();
const useVirtualAccountRequestsMock = vi.fn();

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('../../hooks/use-virtual-accounts', () => ({
  useVirtualAccounts: (where: AdminVirtualAccountFilters) => useVirtualAccountsMock(where),
  useProviderLinkedAccounts: (variables: Record<string, unknown>) =>
    useProviderLinkedAccountsMock(variables),
  useUpdateVirtualAccount: () => ({ mutate: vi.fn(), isPending: false }),
  useVirtualAccountRequests: () => useVirtualAccountRequestsMock(),
}));

const retryMutate = vi.fn();
let retryOnCompleted: ((result: unknown) => void) | undefined;

vi.mock('../../../compliance-review/hooks/use-provider-onboarding-retry', () => ({
  useRetryEndorsementOnboarding: (onCompleted: (result: unknown) => void) => {
    retryOnCompleted = onCompleted;
    return { mutate: retryMutate, isPending: false };
  },
}));

vi.mock('../../../compliance-review/components/complete-provider-profile-dialog', () => ({
  CompleteProviderProfileDialog: (props: {
    endorsementId: string;
    missingFields: string[];
    onRetried?: (onboarding: { missing_fields: string[] }) => void;
    onClose: () => void;
  }) => (
    <div data-testid="complete-dialog">
      <button
        type="button"
        onClick={() => {
          props.onClose();
          props.onRetried?.({ missing_fields: ['phone'] });
        }}
      >
        simulate-retry
      </button>
      {props.endorsementId}:{props.missingFields.join(',')}
    </div>
  ),
}));

vi.mock('../../../ops-review/components/customer-picker', () => ({
  CustomerPicker: () => null,
}));

vi.mock('../../../platform-config/hooks/use-catalog-options', () => ({
  useProviderOptions: () => [{ value: 'kirafin', label: 'KiraFin (kirafin)' }],
  useRailOptions: () => ({ rails: [], currencies: [] }),
}));

// #411: operations works this screen; commercial reads it.
let staffRoles: string[] = ['LOOPAY_OPERATIONS'];

vi.mock('@/shared/stores/auth-store', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: { staff_roles: staffRoles } }),
}));

const requirementsQueueMock = vi.fn();

vi.mock('../../../provider-requirements/hooks/use-provider-requirements', () => ({
  useProviderRequirementsQueue: (variables: unknown, options: unknown) =>
    requirementsQueueMock(variables, options),
}));

vi.mock('../../components/repair-virtual-account-dialog', () => ({
  RepairVirtualAccountDialog: (props: { request: { endorsementId: string; railCode: string } }) => (
    <div data-testid="repair-dialog">
      repair:{props.request.endorsementId}:{props.request.railCode}
    </div>
  ),
}));

vi.mock('../../components/wallet-ops-panel', () => ({
  WalletOpsPanel: () => <div>wallet-ops-panel</div>,
}));

vi.mock('@/shared/components/common/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

const VIRTUAL_ACCOUNT = {
  id: '88888888-8888-4888-8888-888888888888',
  customerId: 'customer-1',
  walletId: 'wallet-1',
  providerId: 'provider-1',
  railId: 'rail-1',
  railCode: 'us_ach',
  currency: 'USD',
  providerAccountId: 'acct-123',
  bankDetails: null,
  alias: 'Nómina',
  status: 'ACTIVE',
  createdAt: '2026-07-09T12:30:00.000Z',
  updatedAt: '2026-07-09T12:30:00.000Z',
};

const LINKED_ACCOUNT = {
  id: '99999999-9999-4999-8999-999999999999',
  customer_id: 'customer-1',
  customer_email: 'ana@example.com',
  provider_code: 'kirafin',
  rail_code: 'us_ach',
  currency: 'USD',
  status: 'ACTIVE',
  provider_account_id: 'acct-123',
  alias: 'Nómina',
  linked_at: '2026-07-09T12:30:00.000Z',
};

let page: MountedPage;

function renderPage() {
  return mountPage(
    <MemoryRouter>
      <VirtualAccounts />
    </MemoryRouter>
  );
}

beforeEach(() => {
  staffRoles = ['LOOPAY_OPERATIONS'];
  requirementsQueueMock.mockReset();
  requirementsQueueMock.mockReturnValue({ data: undefined });
  useVirtualAccountsMock.mockReset();
  useProviderLinkedAccountsMock.mockReset();
  useVirtualAccountRequestsMock.mockReset();
  useVirtualAccountRequestsMock.mockReturnValue({ data: undefined, isLoading: false });

  useVirtualAccountsMock.mockReturnValue({
    data: {
      adminLoopay_listVirtualAccounts: {
        data: [VIRTUAL_ACCOUNT],
        total: 1,
        has_more: false,
      },
    },
    isLoading: false,
  });
  useProviderLinkedAccountsMock.mockReturnValue({
    data: {
      adminLoopay_listProviderLinkedAccounts: {
        data: [LINKED_ACCOUNT],
        total: 1,
        has_more: false,
      },
    },
    isLoading: false,
  });
});

afterEach(() => {
  page?.unmount();
});

describe('VirtualAccounts', () => {
  it('lists the open requests with tenant, state and blockers', () => {
    useVirtualAccountRequestsMock.mockReturnValue({
      data: {
        adminLoopay_listVirtualAccountRequests: {
          data: [
            {
              id: 'e-1',
              customerId: 'c-1',
              customerEmail: 'ana@acme.test',
              clientId: 'cl-1',
              clientName: 'Acme Tenant',
              railCode: 'ach',
              railName: 'ACH',
              currency: 'USD',
              endorsementStatus: 'PENDING',
              state: 'PROVIDER_ONBOARDING',
              provider: 'kirafin',
              blockers: [{ code: 'KYB_DOC', category: 'documents', message: 'Falta RUT' }],
              reason: null,
              requestedAt: '2026-10-19T12:00:00.000Z',
            },
          ],
          total: 1,
          has_more: false,
        },
      },
      isLoading: false,
    });

    page = renderPage();

    const rendered = page.text();
    expect(rendered).toContain('Solicitudes en curso');
    expect(rendered).toContain('Acme Tenant');
    expect(rendered).toContain('En alta con el proveedor');
    expect(rendered).toContain('Falta RUT');
  });

  it('renders both the virtual accounts and the provider-linked accounts', async () => {
    page = renderPage();

    const rendered = page.text();

    expect(rendered).toContain('us_ach');
    expect(rendered).toContain('acct-123');
    expect(rendered).toContain('Nómina');
    expect(rendered).toContain('ana@example.com');
    expect(rendered).toContain('kirafin');
  });

  it('queries without a status constraint until one is chosen', async () => {
    page = renderPage();

    expect(useVirtualAccountsMock).toHaveBeenCalledWith({});
  });
});

describe('VirtualAccounts status filter', () => {
  it('re-queries scoped to the status the operator selects', async () => {
    page = renderPage();

    page.click(page.findByText('button', 'Suspendido'));

    expect(useVirtualAccountsMock).toHaveBeenLastCalledWith({
      status: ['SUSPENDED'],
    });
  });

  it('drops the status constraint again when returning to all', async () => {
    page = renderPage();

    page.click(page.findByText('button', 'Suspendido'));
    page.click(page.findByText('button', 'Todos'));

    expect(useVirtualAccountsMock).toHaveBeenLastCalledWith({});
  });

  it('retries the provider onboarding of an approved request and opens the missing-data form', () => {
    retryMutate.mockReset();
    useVirtualAccountRequestsMock.mockReturnValue({
      data: {
        adminLoopay_listVirtualAccountRequests: {
          data: [
            {
              id: 'e-1',
              customerId: 'c-1',
              customerEmail: 'ana@acme.test',
              clientId: 'cl-1',
              clientName: 'Acme Tenant',
              railCode: 'ach',
              railName: 'ACH',
              currency: 'USD',
              endorsementStatus: 'APPROVED',
              state: 'PROVIDER_ONBOARDING',
              provider: 'mesta',
              blockers: [],
              reason: null,
              requestedAt: '2026-10-19T12:00:00.000Z',
            },
            {
              id: 'e-2',
              customerId: 'c-2',
              customerEmail: 'bob@acme.test',
              clientId: 'cl-1',
              clientName: 'Acme Tenant',
              railCode: 'ach',
              railName: 'ACH',
              currency: 'USD',
              endorsementStatus: 'PENDING',
              state: 'REQUESTED',
              provider: null,
              blockers: [],
              reason: null,
              requestedAt: '2026-10-19T12:00:00.000Z',
            },
          ],
          total: 2,
          has_more: false,
        },
      },
      isLoading: false,
    });

    page = renderPage();
    const buttons = Array.from(page.container.querySelectorAll('button')).filter(
      (node) => (node.textContent ?? '').trim() === 'Reintentar alta en el proveedor'
    );
    expect(buttons).toHaveLength(1);

    page.click(buttons[0]);
    expect(retryMutate).toHaveBeenCalledWith({ endorsementId: 'e-1' });

    page.flush(() =>
      retryOnCompleted?.({
        adminLoopay_retryEndorsementOnboarding: {
          state: 'PROVIDER_ONBOARDING',
          provider_code: 'mesta',
          error_code: 'MESTA_MISSING_REGISTRATIONNUMBER',
          error_message: null,
          missing_fields: ['registrationNumber'],
        },
      })
    );
    expect(page.text()).toContain('e-1:registrationNumber');
  });

  it('labels the status filter in Spanish instead of the raw enum', () => {
    page = renderPage();

    const labels = Array.from(page.container.querySelectorAll('button')).map((node) =>
      (node.textContent ?? '').trim()
    );
    expect(labels).toEqual(
      expect.arrayContaining(['Pendiente', 'Activo', 'Suspendido', 'Cerrado', 'Fallido'])
    );
    expect(labels).not.toContain('PENDING');
  });

  it('reopens the missing-data form when the provider still asks for data after a retry', () => {
    useVirtualAccountRequestsMock.mockReturnValue({
      data: {
        adminLoopay_listVirtualAccountRequests: {
          data: [
            {
              id: 'e-1',
              customerId: 'c-1',
              customerEmail: 'ana@acme.test',
              clientId: 'cl-1',
              clientName: 'Acme Tenant',
              railCode: 'ach',
              railName: 'ACH',
              currency: 'USD',
              endorsementStatus: 'APPROVED',
              state: 'PROVIDER_ONBOARDING',
              provider: 'mesta',
              blockers: [],
              reason: null,
              requestedAt: '2026-10-19T12:00:00.000Z',
            },
          ],
          total: 1,
          has_more: false,
        },
      },
      isLoading: false,
    });
    page = renderPage();
    page.click(page.findByText('button', 'Reintentar alta en el proveedor'));
    page.flush(() =>
      retryOnCompleted?.({
        adminLoopay_retryEndorsementOnboarding: {
          state: 'PROVIDER_ONBOARDING',
          provider_code: 'mesta',
          error_code: null,
          error_message: null,
          missing_fields: ['registrationNumber'],
        },
      })
    );
    expect(page.text()).toContain('e-1:registrationNumber');

    page.click(page.findByText('button', 'simulate-retry'));

    expect(page.text()).toContain('e-1:phone');
  });
});

const BLOCKED_REQUEST = {
  id: 'e-1',
  customerId: 'c-1',
  customerEmail: 'ana@acme.test',
  clientId: 'cl-1',
  clientName: 'Acme Tenant',
  railCode: 'ach',
  railName: 'ACH',
  currency: 'USD',
  endorsementStatus: 'APPROVED',
  state: 'PROVIDER_ONBOARDING',
  provider: 'kirafin',
  blockers: [{ code: 'KIRAFIN_RFI_REGISTRATION_NUMBER', category: 'documents', message: '' }],
  missingFields: [],
  missingFieldDetails: [],
  reason: null,
  requestedAt: '2026-10-19T12:00:00.000Z',
};

function withRequests(requests: unknown[]) {
  useVirtualAccountRequestsMock.mockReturnValue({
    data: {
      adminLoopay_listVirtualAccountRequests: {
        data: requests,
        total: requests.length,
        has_more: false,
      },
    },
    isLoading: false,
  });
}

describe('VirtualAccounts S22 repair and S21 requirements', () => {
  it('no longer offers a free-standing provider account link form', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(path.resolve(__dirname, '../virtual-accounts.tsx'), 'utf-8');

    expect(source).not.toContain('LinkVirtualAccountForm');
  });

  it('#411: offers Operaciones the repair of a blocked request, with its rail', () => {
    withRequests([BLOCKED_REQUEST]);
    page = renderPage();

    page.click(page.findByText('button', 'Reparar con cuenta del proveedor'));

    expect(page.text()).toContain('repair:e-1:ach');
  });

  it('#411: offers the repair to Super admin too, but not to Comercial', () => {
    withRequests([BLOCKED_REQUEST]);
    staffRoles = ['LOOPAY_ADMIN'];
    page = renderPage();
    expect(page.text()).toContain('Reparar con cuenta del proveedor');
    page.unmount();

    staffRoles = ['OPS_COMMERCIAL'];
    page = renderPage();
    expect(page.text()).not.toContain('Reparar con cuenta del proveedor');
  });

  it('#411: shows Comercial the requests read-only: no retry, repair or wallet operations', () => {
    withRequests([BLOCKED_REQUEST]);
    staffRoles = ['OPS_COMMERCIAL'];
    page = renderPage();

    expect(page.text()).toContain('ana@acme.test');
    expect(page.text()).not.toContain('Reintentar alta en el proveedor');
    expect(page.text()).not.toContain('Reparar con cuenta del proveedor');
    expect(page.text()).not.toContain('wallet-ops-panel');
    for (const action of ['Suspender', 'Cerrar', 'Activar']) {
      expect(
        Array.from(page.container.querySelectorAll('button')).map((b) => b.textContent?.trim())
      ).not.toContain(action);
    }
  });

  it('keeps the wallet operations for Operaciones', () => {
    page = renderPage();

    expect(page.text()).toContain('wallet-ops-panel');
  });

  it('does not offer the repair on a request that is not blocked', () => {
    withRequests([
      { ...BLOCKED_REQUEST, endorsementStatus: 'PENDING', state: 'REQUESTED', blockers: [] },
    ]);
    page = renderPage();

    expect(page.text()).not.toContain('Reparar con cuenta del proveedor');
  });

  it('links a request with open requirements to the queue filtered by customer', () => {
    withRequests([BLOCKED_REQUEST]);
    requirementsQueueMock.mockReturnValue({
      data: {
        adminLoopay_listProviderRequirements: {
          items: [
            { id: 'r-1', endorsementId: 'e-1', status: 'REQUESTED' },
            { id: 'r-2', endorsementId: 'e-1', status: 'UPLOADED' },
            { id: 'r-3', endorsementId: 'e-1', status: 'SUBMITTED' },
          ],
          total: 3,
        },
      },
    });
    page = renderPage();

    const link = Array.from(page.container.querySelectorAll('a')).find((node) =>
      (node.textContent ?? '').includes('Requerimientos: 2 pendientes')
    );
    expect(link?.getAttribute('href')).toBe('/backoffice/provider-requirements?customerId=c-1');
    expect(requirementsQueueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { status: ['REQUESTED', 'UPLOADED', 'REJECTED', 'APPROVED'] },
      }),
      { enabled: true }
    );
  });
});
