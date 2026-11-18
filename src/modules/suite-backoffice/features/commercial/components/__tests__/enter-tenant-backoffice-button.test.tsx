/* @vitest-environment jsdom */

/**
 * "Enter tenant backoffice" (epic 2026-11 S5, T5.2): LOOPAY_ADMIN and
 * OPS_COMMERCIAL act as a tenant admin of the client; the backend asks for a
 * second factor, and the button says how to get one.
 */

import { act } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ startActAs: vi.fn(), clear: vi.fn() }));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));
vi.mock('@/shared/lib/query-client', () => ({ queryClient: { clear: mocks.clear } }));
vi.mock('@/shared/hooks/useKYC', () => ({ clearKycLink: vi.fn() }));
vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: vi.fn() },
  setAuthToken: vi.fn(),
  setActAsHeader: vi.fn(),
  setViewAsHeader: vi.fn(),
  clearHeaders: vi.fn(),
}));

import type { AuthUser } from '@/shared/types/auth.types';
import { useActAsStore } from '@/shared/stores/act-as-store';
import { useAuthStore } from '@/shared/stores/auth-store';
import { mountPage, type MountedPage } from '@/test/dom-render';
import { memoryStorage } from '@/test/memory-storage';
import { EnterTenantBackofficeButton } from '../enter-tenant-backoffice-button';

const CLIENT_ID = '3f2b8a52-6c1d-4c2e-9a41-0d6f7c3b9e10';

let page: MountedPage | null = null;

function LocationProbe() {
  return <span data-testid="loc">{useLocation().pathname}</span>;
}

function signInWithRoles(staffRoles: string[]) {
  useAuthStore.setState({
    user: { id: 'staff-1', roles: [], staff_roles: staffRoles } as unknown as AuthUser,
    token: 'token',
    isAuthenticated: true,
  });
}

function mount(clientActive?: boolean) {
  page = mountPage(
    <MemoryRouter initialEntries={[`/backoffice/commercial/clients/${CLIENT_ID}`]}>
      <LocationProbe />
      <Routes>
        <Route
          path="/backoffice/commercial/clients/:clientId"
          element={<EnterTenantBackofficeButton clientId={CLIENT_ID} clientActive={clientActive} />}
        />
        <Route path="*" element={<div>other-route</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function button(): HTMLButtonElement | null {
  return (
    page?.container.querySelector<HTMLButtonElement>('[data-testid="enter-tenant-backoffice"]') ??
    null
  );
}

async function clickEnter() {
  await act(async () => {
    button()?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function mfaError() {
  return Object.assign(new Error('Forbidden'), {
    response: {
      errors: [
        { message: 'Forbidden', extensions: { code: 'FORBIDDEN', error_code: 'MFA_REQUIRED' } },
      ],
    },
  });
}

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  mocks.startActAs.mockReset();
  mocks.clear.mockReset();
  useActAsStore.setState({ clientId: null, staffUser: null, startActAs: mocks.startActAs });
});

afterEach(() => {
  page?.unmount();
  page = null;
  vi.unstubAllGlobals();
});

describe('EnterTenantBackofficeButton', () => {
  it.each([['LOOPAY_OPERATIONS'], ['OPS_KYC']])('is not offered to %s', (role) => {
    signInWithRoles([role]);
    mount(true);

    expect(button()).toBeNull();
  });

  it.each([['LOOPAY_ADMIN'], ['OPS_COMMERCIAL']])(
    'lets %s act as the tenant admin and opens /tenant',
    async (role) => {
      signInWithRoles([role]);
      mocks.startActAs.mockResolvedValue(undefined);
      mount(true);

      await clickEnter();

      expect(mocks.startActAs).toHaveBeenCalledWith(CLIENT_ID);
      expect(mocks.clear).toHaveBeenCalled();
      expect(page?.container.querySelector('[data-testid="loc"]')?.textContent).toBe('/tenant');
    }
  );

  it('explains MFA_REQUIRED and links to the second-factor setup', async () => {
    signInWithRoles(['OPS_COMMERCIAL']);
    mocks.startActAs.mockRejectedValue(mfaError());
    mount(true);

    await clickEnter();

    const alert = page?.container.querySelector('[data-testid="act-as-error"]');
    expect(alert?.textContent).toContain('needs a second factor');
    expect(alert?.querySelector('a')?.getAttribute('href')).toBe('/suite/settings');
    expect(page?.container.querySelector('[data-testid="loc"]')?.textContent).toBe(
      `/backoffice/commercial/clients/${CLIENT_ID}`
    );
  });

  it('is disabled for a client that is not active', () => {
    signInWithRoles(['OPS_COMMERCIAL']);
    mount(false);

    expect(button()?.disabled).toBe(true);
    expect(page?.text()).toContain('Only an active client has a tenant backoffice.');
  });
});
