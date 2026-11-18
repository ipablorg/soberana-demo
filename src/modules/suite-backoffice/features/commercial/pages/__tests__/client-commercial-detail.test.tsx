/* @vitest-environment jsdom */

import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ClientProviderOnboarding } from '@/graphql/queries/admin-commercial';
import { mountPage, type MountedPage } from '@/test/dom-render';
import ClientCommercialDetail from '../client-commercial-detail';

const onboardingMock = vi.fn();
const retryMutate = vi.fn();
const onboardAllMutate = vi.fn();
const linkMutate = vi.fn();
let clientInfo: { adminLoopay_getClient: Record<string, unknown> } | undefined;

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));

vi.mock('../../../clients/hooks/use-clients', () => ({
  useClientApiKeyInfo: () => ({ data: clientInfo }),
  useRegenerateClientApiKey: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../../../ops-review/hooks/use-client-options', () => ({
  useClientOptions: () => ({
    options: [
      {
        client_id: '3f2b8a52-6c1d-4c2e-9a41-0d6f7c3b9e10',
        client_name: 'Acme SAS',
        is_active: true,
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

vi.mock('../../components/enter-tenant-backoffice-button', () => ({
  EnterTenantBackofficeButton: (props: { clientId: string; clientActive?: boolean }) => (
    <div data-testid="enter-tenant-backoffice">{`${props.clientId}:${String(props.clientActive)}`}</div>
  ),
}));
vi.mock('../../components/invite-tenant-admin-card', () => ({
  InviteTenantAdminCard: (props: { clientId: string }) => (
    <div data-testid="invite-tenant-admin">{props.clientId}</div>
  ),
}));

vi.mock('../../components/fees-panel', () => ({
  FeesPanel: () => <div data-testid="fees-panel" />,
}));

vi.mock('../../components/client-setup-panel', () => ({
  ClientSetupPanel: ({ onGoTo }: { onGoTo: (tab: string) => void }) => (
    <div data-testid="setup-panel">
      <button type="button" onClick={() => onGoTo('fees')}>
        go-fees
      </button>
    </div>
  ),
}));

vi.mock('../../hooks/use-commercial', () => ({
  useClientProviderOnboarding: () => onboardingMock(),
  useOnboardClientToProviders: () => ({ mutate: onboardAllMutate, isPending: false }),
  useRetryProviderOnboarding: () => ({ mutate: retryMutate, isPending: false }),
  useLinkProviderManually: () => ({ mutate: linkMutate, isPending: false }),
  useFeeSchedules: () => ({ data: { adminLoopay_listFeeSchedules: [] }, isLoading: false }),
  useCreateFeeSchedule: () => ({ mutate: vi.fn(), isPending: false }),
  useDeactivateFeeSchedule: () => ({ mutate: vi.fn(), isPending: false }),
  useFeeLedger: () => ({ data: { adminLoopay_listFeeLedger: [] }, isLoading: false }),
  useFeeLedgerSummary: () => ({ data: { adminLoopay_feeLedgerSummary: [] }, isLoading: false }),
}));

const CLIENT_ID = '3f2b8a52-6c1d-4c2e-9a41-0d6f7c3b9e10';

const provider = (
  code: string,
  status: ClientProviderOnboarding['status'],
  extra: Partial<ClientProviderOnboarding> = {}
): ClientProviderOnboarding => ({
  id: code,
  clientId: CLIENT_ID,
  providerCode: code,
  status,
  providerCustomerId: null,
  lastErrorCode: null,
  linkedAt: null,
  linkedByUserId: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  attempts: [],
  ...extra,
});

// The onboarding tests open the onboarding tab by URL (#411: Setup is the default tab).
function render(tab: string | null = 'onboarding'): MountedPage {
  const query = tab ? `?tab=${tab}` : '';
  return mountPage(
    <MemoryRouter initialEntries={[`/backoffice/commercial/clients/${CLIENT_ID}${query}`]}>
      <Routes>
        <Route
          path="/backoffice/commercial/clients/:clientId"
          element={<ClientCommercialDetail />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ClientCommercialDetail page', () => {
  let page: MountedPage;

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('shows a skeleton while the onboarding loads', () => {
    onboardingMock.mockReturnValue({ data: undefined, isLoading: true, error: null });
    page = render();
    expect(page.container.querySelector('[data-testid="onboarding-skeleton"]')).not.toBeNull();
    page.unmount();
  });

  it('shows a mapped error state when the query fails', () => {
    onboardingMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('boom'),
      refetch: vi.fn(),
    });
    page = render();
    expect(page.container.querySelector('[role="alert"]')).not.toBeNull();
    page.unmount();
  });

  it('renders per-provider status, customer id, last error and attempts', () => {
    onboardingMock.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        adminLoopay_clientProviderOnboarding: [
          provider('mesta', 'LINKED', { providerCustomerId: 'sender-77' }),
          provider('kirafin', 'FAILED', {
            lastErrorCode: 'KIRAFIN_TIMEOUT',
            attempts: [
              {
                id: 'a1',
                attemptNo: 2,
                actorUserId: 'staff-1',
                requestSummary: { clientId: CLIENT_ID },
                responseSummary: null,
                errorCode: 'KIRAFIN_TIMEOUT',
                createdAt: '2026-01-02T00:00:00Z',
              },
            ],
          }),
        ],
      },
    });
    page = render();

    const text = page.text();
    expect(text).toContain('Acme SAS');
    expect(page.container.querySelector('h1')?.textContent).not.toContain(CLIENT_ID);
    expect(text).toContain('Vinculado');
    expect(text).toContain('Fallido');
    expect(text).toContain('sender-77');
    expect(text).toContain('KIRAFIN_TIMEOUT');
    expect(text).toContain('Staff · staff-1');
    expect(text).not.toContain('Solicitar');
    page.unmount();
  });

  it('offers Retry and Link only where allowed and fires the actions', () => {
    onboardingMock.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        adminLoopay_clientProviderOnboarding: [
          provider('mesta', 'LINKED', { providerCustomerId: 'sender-77' }),
          provider('kirafin', 'FAILED'),
        ],
      },
    });
    page = render();

    const mesta = page.container.querySelector('[data-testid="provider-mesta"]')!;
    const kirafin = page.container.querySelector('[data-testid="provider-kirafin"]')!;
    expect(mesta.textContent).not.toContain('Reintentar');
    expect(mesta.textContent).not.toContain('Vincular manualmente');

    page.click(page.findByText('button', 'Reintentar'));
    expect(retryMutate).toHaveBeenCalledWith({ clientId: CLIENT_ID, provider: 'kirafin' });

    page.click(page.findByText('button', 'Iniciar onboarding de pendientes'));
    expect(onboardAllMutate).toHaveBeenCalledWith({ clientId: CLIENT_ID, providers: null });

    expect(kirafin.textContent).toContain('Vincular manualmente');
    page.unmount();
  });
});

describe('ClientCommercialDetail Setup tab (#411)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    onboardingMock.mockReturnValue({
      isLoading: false,
      error: null,
      data: { adminLoopay_clientProviderOnboarding: [] },
    });
  });

  it('opens on the Setup checklist', () => {
    const page = render(null);

    expect(page.container.querySelector('[data-testid="setup-panel"]')).not.toBeNull();
    expect(page.container.querySelector('[data-testid="onboarding-skeleton"]')).toBeNull();
    page.unmount();
  });

  it('switches to the tab a missing step points at', () => {
    const page = render(null);

    page.click(page.findByText('button', 'go-fees'));

    expect(page.container.querySelector('[data-testid="setup-panel"]')).toBeNull();
    expect(page.container.querySelector('[data-testid="fees-panel"]')).not.toBeNull();
    page.unmount();
  });
});

describe('ClientCommercialDetail tenant access (epic 2026-11 S4/S5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    clientInfo = undefined;
    onboardingMock.mockReturnValue({
      isLoading: false,
      error: null,
      data: { adminLoopay_clientProviderOnboarding: [] },
    });
  });

  const enter = (page: MountedPage) =>
    page.container.querySelector('[data-testid="enter-tenant-backoffice"]')?.textContent;

  it('offers "Enter tenant backoffice" in the header, on every tab', () => {
    const page = render('fees');

    expect(enter(page)).toBe(`${CLIENT_ID}:undefined`);
    page.unmount();
  });

  it('tells the button whether the client is active', () => {
    clientInfo = {
      adminLoopay_getClient: { id: CLIENT_ID, name: 'Acme SAS', status: 'SUSPENDED' },
    };
    const suspended = render(null);
    expect(enter(suspended)).toBe(`${CLIENT_ID}:false`);
    suspended.unmount();

    clientInfo = { adminLoopay_getClient: { id: CLIENT_ID, name: 'Acme SAS', status: 'ACTIVE' } };
    const active = render(null);
    expect(enter(active)).toBe(`${CLIENT_ID}:true`);
    active.unmount();
  });

  it('shows the tenant admin invite on the Setup tab only', () => {
    const setup = render(null);
    expect(setup.container.querySelector('[data-testid="invite-tenant-admin"]')?.textContent).toBe(
      CLIENT_ID
    );
    setup.unmount();

    const fees = render('fees');
    expect(fees.container.querySelector('[data-testid="invite-tenant-admin"]')).toBeNull();
    fees.unmount();
  });
});
