// @vitest-environment jsdom

/**
 * Act-as transitions through the real route guards (epic 2026-11 S5):
 * entering a client's tenant backoffice from the commercial client detail and
 * leaving it with "Exit". The GraphQL client is a recorder that keeps the
 * global `x-act-as-client` header like the real one, so every request is
 * logged with the identity header it actually carried.
 *
 * - No backoffice request ever carries the header (the back answers 403
 *   `ACT_AS_TENANT_SURFACE_ONLY`), not even one the client detail sends while
 *   the act-as `auth_me` is in flight.
 * - Entering never passes through `/unauthorized`; leaving goes straight to
 *   the client detail, never through `/backoffice`.
 */

import { act, useEffect } from 'react';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const net = vi.hoisted(() => ({
  actAs: '',
  sent: [] as Array<{ op: string; actAs: string }>,
  /** While set, `auth_me` waits for it: the round trip of the act-as check. */
  authMeGate: null as Promise<void> | null,
  tenantAdmin: {
    id: 'staff-1',
    email: 'ana@loopay.test',
    name: 'Ana',
    company_name: null,
    roles: ['CLIENT_ADMIN'],
    staff_roles: [] as string[],
    company_roles: [],
    customer_profile_id: null,
    client_id: '3f2b8a52-6c1d-4c2e-9a41-0d6f7c3b9e10',
  },
}));

vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: {
    request: vi.fn(
      async (document: unknown, _variables?: unknown, headers?: Record<string, string>) => {
        const op = typeof document === 'string' ? document : 'auth_me';
        net.sent.push({ op, actAs: headers?.['x-act-as-client'] ?? net.actAs });
        if (op === 'auth_me' && net.authMeGate) await net.authMeGate;
        return op === 'auth_me' ? { auth_me: net.tenantAdmin } : { [op]: [] };
      }
    ),
  },
  setActAsHeader: (clientId: string | null) => {
    net.actAs = clientId ?? '';
  },
  setViewAsHeader: vi.fn(),
  setAuthToken: vi.fn(),
  clearHeaders: vi.fn(),
}));
vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock('@/shared/lib/session-restore', () => ({ retrySessionRestore: vi.fn() }));
vi.mock('@/app/providers/session-restore-policy', () => ({ canRestoreFirebaseUser: vi.fn() }));
vi.mock('@/shared/lib/dev-config', () => ({ isDevMockMode: () => false }));
vi.mock('@/shared/hooks/useKYC', () => ({ useKYC: vi.fn(), clearKycLink: vi.fn() }));
vi.mock('@/shared/hooks/require-mfa-enrollment', () => ({
  useRequireMfaEnrollment: () => ({ isChecking: false, isEnrolled: true, recheck: vi.fn() }),
}));
vi.mock('@/modules/common/auth/api/auth-enforcement', () => ({
  isStaffMfaOptional: () => false,
}));
vi.mock('@/shared/components/common/loading-screen', () => ({
  LoadingScreen: () => <div>loading-screen</div>,
}));
vi.mock('@/shared/components/common/post-login-transition', () => ({
  PostLoginTransition: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import type { AuthUser } from '@/shared/types/auth.types';
import { graphqlClient } from '@/shared/lib/graphql-client';
import { queryClient } from '@/shared/lib/query-client';
import { ActAsBanner } from '@/shared/components/common/act-as-banner';
import { selectIsActingAs, useActAsStore } from '@/shared/stores/act-as-store';
import { useAuthStore } from '@/shared/stores/auth-store';
import { mountPage, type MountedPage } from '@/test/dom-render';
import { memoryStorage } from '@/test/memory-storage';
import { EnterTenantBackofficeButton } from '@/modules/suite-backoffice/features/commercial/components/enter-tenant-backoffice-button';
import { StaffRoute, TenantRoute } from '../protected-route';

const CLIENT_ID = net.tenantAdmin.client_id;
const DETAIL = `/backoffice/commercial/clients/${CLIENT_ID}`;

const staff = {
  id: 'staff-1',
  email: 'ana@loopay.test',
  name: 'Ana',
  company_name: null,
  roles: [],
  staff_roles: ['OPS_COMMERCIAL'],
  company_roles: [],
  customer_profile_id: null,
  client_id: null,
} as unknown as AuthUser;

let page: MountedPage | null = null;
let visited: string[] = [];

function PathLog() {
  const { pathname } = useLocation();
  useEffect(() => {
    visited.push(pathname);
  }, [pathname]);
  return null;
}

/**
 * The client detail: one backoffice query, keyed by the signed-in user like the
 * real queries, so it refetches whenever the identity changes while mounted.
 */
function ClientDetail() {
  const userId = useAuthStore((state) => state.user?.roles?.join(','));
  useQuery({
    queryKey: ['admin', 'virtual-accounts', userId],
    queryFn: () => graphqlClient.request('adminLoopay_listVirtualAccounts' as never),
  });
  return (
    <div>
      client-detail
      <EnterTenantBackofficeButton clientId={CLIENT_ID} clientActive />
    </div>
  );
}

function TenantHome() {
  useQuery({
    queryKey: ['tenant', 'me'],
    queryFn: () => graphqlClient.request('tenant_me' as never),
  });
  return (
    <div>
      tenant-home
      <ActAsBanner clientName="Acme SAS" staffEmail="ana@loopay.test" />
    </div>
  );
}

function mount(path: string) {
  page = mountPage(
    <QueryClientProvider client={queryClient}>
      {/* Same future flags as the app's BrowserRouter: navigations are transitions. */}
      <MemoryRouter
        initialEntries={[path]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <PathLog />
        <Routes>
          <Route
            path="/backoffice/commercial/clients/:clientId"
            element={
              <StaffRoute>
                <ClientDetail />
              </StaffRoute>
            }
          />
          <Route
            path="/backoffice"
            element={
              <StaffRoute>
                <div>backoffice-home</div>
              </StaffRoute>
            }
          />
          <Route
            path="/tenant/*"
            element={
              <TenantRoute>
                <TenantHome />
              </TenantRoute>
            }
          />
          <Route path="/unauthorized" element={<div>unauthorized-page</div>} />
          <Route path="*" element={<div>other-route</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

async function settle(done: () => boolean = () => false) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    if (done()) return;
  }
}

async function click(testId: string) {
  const target = page?.container.querySelector(`[data-testid="${testId}"]`);
  if (!target) throw new Error(`missing ${testId}: ${page?.text()}`);
  await act(async () => {
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

const backofficeRequests = () => net.sent.filter(({ op }) => op.startsWith('adminLoopay_'));

/**
 * Client detail → "Enter tenant backoffice". While the act-as `auth_me` is in
 * flight the detail is still on screen and refetches its backoffice query
 * (any refetch: focus, polling, invalidation), like in the browser.
 */
async function enter() {
  mount(DETAIL);
  await settle(() => backofficeRequests().length > 0);
  let release = () => {};
  net.authMeGate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await click('enter-tenant-backoffice');
  await settle(() => net.sent.some(({ op }) => op === 'auth_me'));
  await act(async () => {
    await queryClient.refetchQueries({ queryKey: ['admin'] });
  });
  release();
  net.authMeGate = null;
  await settle(() => page?.text().includes('tenant-home') ?? false);
}

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  net.actAs = '';
  net.sent = [];
  net.authMeGate = null;
  visited = [];
  queryClient.clear();
  useActAsStore.setState({ clientId: null, staffUser: null, pendingUser: null, active: false });
  useAuthStore.setState({
    user: staff,
    token: 'token',
    isLoading: false,
    isAuthenticated: true,
    isRestoringSession: false,
    sessionRecovery: 'idle',
  });
});

afterEach(() => {
  page?.unmount();
  page = null;
  vi.unstubAllGlobals();
});

describe('entering the tenant backoffice as a tenant admin', () => {
  it('reaches /tenant without passing through /unauthorized', async () => {
    await enter();

    expect(page?.text()).toContain('tenant-home');
    expect(visited).toEqual([DETAIL, '/tenant']);
    expect(useAuthStore.getState().user?.roles).toEqual(['CLIENT_ADMIN']);
  });

  it('never sends a backoffice query with x-act-as-client', async () => {
    await enter();

    // The initial load plus the refetch while auth_me was in flight.
    expect(backofficeRequests().length).toBeGreaterThanOrEqual(2);
    expect(backofficeRequests().filter(({ actAs }) => actAs !== '')).toEqual([]);
    expect(net.sent.find(({ op }) => op === 'auth_me')?.actAs).toBe(CLIENT_ID);
    expect(net.sent.find(({ op }) => op === 'tenant_me')?.actAs).toBe(CLIENT_ID);
    expect(net.actAs).toBe(CLIENT_ID);
  });
});

describe('leaving with Exit', () => {
  it('goes straight back to the client detail as the staff member', async () => {
    await enter();
    visited = [];
    net.sent = [];

    await click('exit-act-as');
    await settle(() => page?.text().includes('client-detail') ?? false);

    expect(visited).toEqual([DETAIL]);
    expect(page?.text()).not.toContain('You are acting as an admin');
    expect(useAuthStore.getState().user).toEqual(staff);
    expect(selectIsActingAs(useActAsStore.getState())).toBe(false);
    expect(net.actAs).toBe('');
    expect(backofficeRequests().length).toBeGreaterThan(0);
    expect(backofficeRequests().filter(({ actAs }) => actAs !== '')).toEqual([]);
  });

  it('drops the tenant responses cached under the synthetic identity', async () => {
    await enter();
    expect(queryClient.getQueryData(['tenant', 'me'])).toBeDefined();

    await click('exit-act-as');
    await settle(() => page?.text().includes('client-detail') ?? false);

    expect(queryClient.getQueryData(['tenant', 'me'])).toBeUndefined();
  });
});
