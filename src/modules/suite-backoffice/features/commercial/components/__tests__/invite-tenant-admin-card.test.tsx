/* @vitest-environment jsdom */

/**
 * Invite tenant admin (epic 2026-11 S4, T4.3): from the commercial client
 * detail, LOOPAY_ADMIN / OPS_COMMERCIAL create the client's tenant admin and
 * get the one-time password setup link, shown once.
 */

import { act } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ request: vi.fn(), toastError: vi.fn() }));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));
vi.mock('sonner', () => ({ toast: { error: mocks.toastError, success: vi.fn() } }));
vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: mocks.request },
  setAuthToken: vi.fn(),
  setActAsHeader: vi.fn(),
  setViewAsHeader: vi.fn(),
  clearHeaders: vi.fn(),
}));
vi.mock('@/shared/hooks/useKYC', () => ({ clearKycLink: vi.fn() }));

import type { AuthUser } from '@/shared/types/auth.types';
import { useAuthStore } from '@/shared/stores/auth-store';
import { changeValue, submitForm } from '@/test/dom-input';
import { mountPage, type MountedPage } from '@/test/dom-render';
import { memoryStorage } from '@/test/memory-storage';
import { InviteTenantAdminCard } from '../invite-tenant-admin-card';

const CLIENT_ID = '3f2b8a52-6c1d-4c2e-9a41-0d6f7c3b9e10';
const LINK = 'https://auth.example/setup?oob=one-time';

let page: MountedPage | null = null;

function signInWithRoles(staffRoles: string[]) {
  useAuthStore.setState({
    user: { id: 'staff-1', roles: [], staff_roles: staffRoles } as unknown as AuthUser,
    token: 'token',
    isAuthenticated: true,
  });
}

function mount() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  page = mountPage(
    <QueryClientProvider client={queryClient}>
      <InviteTenantAdminCard clientId={CLIENT_ID} />
    </QueryClientProvider>
  );
}

async function settle(done: () => boolean) {
  for (let attempt = 0; attempt < 20 && !done(); attempt += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

function el<T extends Element>(selector: string): T {
  const element = page?.container.querySelector<T>(selector);
  if (!element) throw new Error(`missing ${selector}`);
  return element;
}

async function invite(email: string) {
  changeValue(el<HTMLInputElement>('#tenant-admin-email'), email);
  submitForm(el<HTMLFormElement>('[data-testid="invite-tenant-admin-form"]'));
  await settle(
    () =>
      page?.container.querySelector('[data-testid="tenant-admin-invitation"]') !== null ||
      mocks.toastError.mock.calls.length > 0
  );
}

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  mocks.request.mockReset();
  mocks.toastError.mockReset();
});

afterEach(() => {
  page?.unmount();
  page = null;
  vi.unstubAllGlobals();
});

describe('InviteTenantAdminCard', () => {
  it.each([['LOOPAY_OPERATIONS'], ['OPS_VA']])('is not offered to %s', (role) => {
    signInWithRoles([role]);
    mount();

    expect(page?.container.querySelector('[data-testid="invite-tenant-admin-form"]')).toBeNull();
  });

  it.each([['LOOPAY_ADMIN'], ['OPS_COMMERCIAL']])(
    'lets %s invite and shows the one-time link with its warning',
    async (role) => {
      signInWithRoles([role]);
      mocks.request.mockResolvedValue({
        adminLoopay_inviteTenantAdmin: {
          member: { id: 'u-1', email: 'admin@acme.test', created_at: '2026-11-05T10:00:00Z' },
          password_setup_link: LINK,
        },
      });
      mount();

      await invite('  admin@acme.test ');

      expect(mocks.request.mock.calls[0]?.[1]).toEqual({
        clientId: CLIENT_ID,
        input: { email: 'admin@acme.test' },
      });
      expect(el('[data-testid="tenant-admin-setup-link"]').textContent).toBe(LINK);
      expect(page?.text()).toContain('It is shown only once');
      expect(
        page?.container.querySelector('[data-testid="copy-tenant-admin-link"]')
      ).not.toBeNull();
    }
  );

  it('forgets the link once dismissed', async () => {
    signInWithRoles(['OPS_COMMERCIAL']);
    mocks.request.mockResolvedValue({
      adminLoopay_inviteTenantAdmin: {
        member: { id: 'u-1', email: 'admin@acme.test', created_at: '2026-11-05T10:00:00Z' },
        password_setup_link: LINK,
      },
    });
    mount();
    await invite('admin@acme.test');

    act(() => {
      el('[data-testid="dismiss-tenant-admin-invitation"]').dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      );
    });

    expect(page?.container.querySelector('[data-testid="tenant-admin-invitation"]')).toBeNull();
    expect(page?.text()).not.toContain(LINK);
  });

  it('says when the invitee already has a password (no link)', async () => {
    signInWithRoles(['OPS_COMMERCIAL']);
    mocks.request.mockResolvedValue({
      adminLoopay_inviteTenantAdmin: {
        member: { id: 'u-1', email: 'admin@acme.test', created_at: '2026-11-05T10:00:00Z' },
        password_setup_link: null,
      },
    });
    mount();

    await invite('admin@acme.test');

    expect(page?.text()).toContain('admin@acme.test already has a password and can sign in now.');
    expect(page?.container.querySelector('[data-testid="tenant-admin-setup-link"]')).toBeNull();
  });

  it('maps 409 TENANT_ADMIN_EMAIL_TAKEN to a precise message', async () => {
    signInWithRoles(['OPS_COMMERCIAL']);
    mocks.request.mockRejectedValue(
      Object.assign(new Error('Conflict'), {
        response: {
          errors: [
            {
              message: 'Conflict',
              extensions: { code: 'CONFLICT', error_code: 'TENANT_ADMIN_EMAIL_TAKEN' },
            },
          ],
        },
      })
    );
    mount();

    await invite('taken@acme.test');

    expect(mocks.toastError).toHaveBeenCalledWith("We couldn't invite the tenant admin", {
      description: 'This email already belongs to another account. Use a different email.',
    });
    expect(page?.container.querySelector('[data-testid="tenant-admin-invitation"]')).toBeNull();
  });

  it('does not call the backend with an invalid email', async () => {
    signInWithRoles(['OPS_COMMERCIAL']);
    mount();

    changeValue(el<HTMLInputElement>('#tenant-admin-email'), 'not-an-email');
    submitForm(el<HTMLFormElement>('[data-testid="invite-tenant-admin-form"]'));
    await settle(() => false);

    expect(mocks.request).not.toHaveBeenCalled();
    expect(page?.text()).toContain('Enter a valid email.');
  });
});
