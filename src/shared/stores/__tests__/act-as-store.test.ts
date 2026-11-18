// @vitest-environment jsdom

/**
 * Act-as-tenant mode (epic 2026-11 S5): a commercial enters a client's tenant
 * backoffice as a synthetic tenant admin. Starting only stages the identity
 * (`auth_me` carries the header on that one request); the global header and
 * the synthetic user arrive together when the tenant tree activates it, so no
 * backoffice request ever carries `x-act-as-client`. Leaving restores the
 * staff member exactly, view-as and act-as never run at once, and logging out
 * ends it.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { request, setViewAsHeader, setActAsHeader, setAuthToken } = vi.hoisted(() => ({
  request: vi.fn(),
  setViewAsHeader: vi.fn(),
  setActAsHeader: vi.fn(),
  setAuthToken: vi.fn(),
}));

vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request },
  setViewAsHeader,
  setActAsHeader,
  setAuthToken,
  clearHeaders: vi.fn(),
}));
vi.mock('@/shared/hooks/useKYC', () => ({ clearKycLink: vi.fn() }));

import type { AuthUser } from '@/shared/types/auth.types';
import { memoryStorage } from '@/test/memory-storage';
import { selectIsActAsActive, selectIsActingAs, useActAsStore } from '../act-as-store';
import { useAuthStore } from '../auth-store';
import { selectIsViewingAs, useViewAsStore } from '../view-as-store';

const CLIENT_ID = '3f2b8a52-6c1d-4c2e-9a41-0d6f7c3b9e10';

const staff = {
  id: 'staff-1',
  email: 'ana@loopay.test',
  company_name: null,
  roles: [],
  staff_roles: ['OPS_COMMERCIAL'],
  customer_profile_id: null,
  client_id: null,
} as unknown as AuthUser;

/** What `auth_me` answers under `x-act-as-client`: same person, tenant admin, no staff role. */
const tenantAdmin = {
  id: 'staff-1',
  email: 'ana@loopay.test',
  company_name: null,
  roles: ['CLIENT_ADMIN'],
  staff_roles: [],
  customer_profile_id: null,
  client_id: CLIENT_ID,
} as unknown as AuthUser;

const customer = {
  id: 'staff-1',
  email: 'buyer@client.test',
  company_name: 'Buyer SAS',
  roles: ['CLIENT_USER'],
  staff_roles: [],
  customer_profile_id: 'customer-1',
} as unknown as AuthUser;

/** Starts act-as and activates it, as entering the tenant tree does. */
async function actAs() {
  await useActAsStore.getState().startActAs(CLIENT_ID);
  useActAsStore.getState().activateActAs();
}

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  request.mockReset();
  setViewAsHeader.mockClear();
  setActAsHeader.mockClear();
  useAuthStore.setState({ user: staff, token: 'token-1', isAuthenticated: true });
  useViewAsStore.setState({ customerId: null, customerLabel: null, adminUser: null });
  useActAsStore.setState({ clientId: null, staffUser: null, pendingUser: null, active: false });
});

describe('useActAsStore', () => {
  it('stages the tenant admin auth_me returns without touching the global header', async () => {
    // Arrange
    request.mockResolvedValue({ auth_me: tenantAdmin });

    // Act
    await useActAsStore.getState().startActAs(CLIENT_ID);

    // Assert
    expect(request).toHaveBeenCalledWith(expect.anything(), undefined, {
      'x-act-as-client': CLIENT_ID,
    });
    expect(setActAsHeader).not.toHaveBeenCalled();
    expect(useAuthStore.getState().user).toEqual(staff);
    expect(useActAsStore.getState().clientId).toBe(CLIENT_ID);
    expect(useActAsStore.getState().pendingUser).toEqual(tenantAdmin);
    expect(selectIsActingAs(useActAsStore.getState())).toBe(true);
    expect(selectIsActAsActive(useActAsStore.getState())).toBe(false);
  });

  it('sets the header and holds the tenant admin once activated', async () => {
    // Arrange
    request.mockResolvedValue({ auth_me: tenantAdmin });
    await useActAsStore.getState().startActAs(CLIENT_ID);

    // Act
    useActAsStore.getState().activateActAs();

    // Assert
    expect(setActAsHeader).toHaveBeenCalledWith(CLIENT_ID);
    expect(useAuthStore.getState().user).toEqual(tenantAdmin);
    expect(useAuthStore.getState().isStaff()).toBe(false);
    expect(useActAsStore.getState().staffUser).toEqual(staff);
    expect(useActAsStore.getState().pendingUser).toBeNull();
    expect(selectIsActAsActive(useActAsStore.getState())).toBe(true);
  });

  it('activating twice (StrictMode effects) changes nothing the second time', async () => {
    // Arrange
    request.mockResolvedValue({ auth_me: tenantAdmin });
    await actAs();

    // Act
    useActAsStore.getState().activateActAs();

    // Assert
    expect(setActAsHeader).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user).toEqual(tenantAdmin);
  });

  it('restores the staff member and drops the header on exit', async () => {
    // Arrange
    request.mockResolvedValue({ auth_me: tenantAdmin });
    await actAs();

    // Act
    useActAsStore.getState().endActAs();

    // Assert
    expect(setActAsHeader).toHaveBeenLastCalledWith(null);
    expect(useAuthStore.getState().user).toEqual(staff);
    expect(useAuthStore.getState().isStaff()).toBe(true);
    expect(selectIsActingAs(useActAsStore.getState())).toBe(false);
  });

  it('drops a staged act-as on exit without touching the staff session', async () => {
    // Arrange
    request.mockResolvedValue({ auth_me: tenantAdmin });
    await useActAsStore.getState().startActAs(CLIENT_ID);
    const setAuth = vi.spyOn(useAuthStore.getState(), 'setAuth');

    // Act
    useActAsStore.getState().endActAs();

    // Assert
    expect(setAuth).not.toHaveBeenCalled();
    expect(useAuthStore.getState().user).toEqual(staff);
    expect(useActAsStore.getState().pendingUser).toBeNull();
    expect(selectIsActingAs(useActAsStore.getState())).toBe(false);
    setAuth.mockRestore();
  });

  it('stays out of act-as when the backend refuses it (MFA_REQUIRED)', async () => {
    // Arrange
    request.mockRejectedValue(new Error('MFA_REQUIRED'));

    // Act
    const attempt = useActAsStore.getState().startActAs(CLIENT_ID);

    // Assert
    await expect(attempt).rejects.toThrow('MFA_REQUIRED');
    expect(setActAsHeader).not.toHaveBeenCalled();
    expect(useAuthStore.getState().user).toEqual(staff);
    expect(selectIsActingAs(useActAsStore.getState())).toBe(false);
  });

  it('refuses an identity that is not a tenant admin', async () => {
    // Arrange
    request.mockResolvedValue({ auth_me: staff });

    // Act
    const attempt = useActAsStore.getState().startActAs(CLIENT_ID);

    // Assert
    await expect(attempt).rejects.toThrow('ACT_AS_NOT_TENANT_ADMIN');
    expect(setActAsHeader).not.toHaveBeenCalled();
    expect(useAuthStore.getState().user).toEqual(staff);
    expect(selectIsActingAs(useActAsStore.getState())).toBe(false);
  });

  it('ends view-as before acting, so the staff member is what it restores', async () => {
    // Arrange
    request.mockResolvedValueOnce({ auth_me: customer });
    await useViewAsStore.getState().start('customer-1', 'Buyer SAS');
    request.mockResolvedValueOnce({ auth_me: tenantAdmin });

    // Act
    await actAs();

    // Assert
    expect(selectIsViewingAs(useViewAsStore.getState())).toBe(false);
    expect(setViewAsHeader).toHaveBeenLastCalledWith(null);
    expect(useActAsStore.getState().staffUser).toEqual(staff);
    useActAsStore.getState().endActAs();
    expect(useAuthStore.getState().user).toEqual(staff);
  });

  it('ends act-as before viewing as a customer, so the staff member is what it restores', async () => {
    // Arrange
    request.mockResolvedValueOnce({ auth_me: tenantAdmin });
    await actAs();
    request.mockResolvedValueOnce({ auth_me: customer });

    // Act
    await useViewAsStore.getState().start('customer-1', 'Buyer SAS');

    // Assert
    expect(selectIsActingAs(useActAsStore.getState())).toBe(false);
    expect(setActAsHeader).toHaveBeenLastCalledWith(null);
    expect(useViewAsStore.getState().adminUser).toEqual(staff);
    useViewAsStore.getState().stop();
    expect(useAuthStore.getState().user).toEqual(staff);
  });

  it('ends act-as when the session ends', async () => {
    // Arrange
    request.mockResolvedValue({ auth_me: tenantAdmin });
    await actAs();

    // Act
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });

    // Assert
    expect(selectIsActingAs(useActAsStore.getState())).toBe(false);
    expect(useActAsStore.getState().staffUser).toBeNull();
  });
});
