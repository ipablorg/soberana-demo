// @vitest-environment jsdom

/**
 * View-as-customer mode (Loopay2/SOBERANA#415): the header and the customer
 * user live together, and leaving restores the admin exactly.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { request, setViewAsHeader, setAuthToken } = vi.hoisted(() => ({
  request: vi.fn(),
  setViewAsHeader: vi.fn(),
  setAuthToken: vi.fn(),
}));

vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request },
  setViewAsHeader,
  setActAsHeader: vi.fn(),
  setAuthToken,
  clearHeaders: vi.fn(),
}));
vi.mock('@/shared/hooks/useKYC', () => ({ clearKycLink: vi.fn() }));

import type { AuthUser } from '@/shared/types/auth.types';
import { memoryStorage } from '@/test/memory-storage';
import { useAuthStore } from '../auth-store';
import { selectIsViewingAs, useViewAsStore } from '../view-as-store';

const admin = {
  id: 'admin-1',
  email: 'admin@loopay.test',
  company_name: null,
  roles: [],
  staff_roles: ['LOOPAY_ADMIN'],
  customer_profile_id: null,
} as unknown as AuthUser;

const customer = {
  id: 'admin-1',
  email: 'ana@client.test',
  company_name: 'Ana SAS',
  roles: ['CLIENT_USER'],
  staff_roles: [],
  customer_profile_id: 'customer-1',
} as unknown as AuthUser;

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  request.mockReset();
  setViewAsHeader.mockClear();
  useAuthStore.setState({ user: admin, token: 'token-1', isAuthenticated: true });
  useViewAsStore.setState({ customerId: null, customerLabel: null, adminUser: null });
});

describe('useViewAsStore', () => {
  it('sends the header and holds the customer auth_me returns', async () => {
    // Arrange
    request.mockResolvedValue({ auth_me: customer });

    // Act
    await useViewAsStore.getState().start('customer-1', 'Ana SAS');

    // Assert
    expect(setViewAsHeader).toHaveBeenCalledWith('customer-1');
    expect(useAuthStore.getState().user).toEqual(customer);
    expect(useAuthStore.getState().isStaff()).toBe(false);
    expect(selectIsViewingAs(useViewAsStore.getState())).toBe(true);
  });

  it('restores the admin and drops the header on exit', async () => {
    // Arrange
    request.mockResolvedValue({ auth_me: customer });
    await useViewAsStore.getState().start('customer-1', 'Ana SAS');

    // Act
    useViewAsStore.getState().stop();

    // Assert
    expect(setViewAsHeader).toHaveBeenLastCalledWith(null);
    expect(useAuthStore.getState().user).toEqual(admin);
    expect(useAuthStore.getState().isStaff()).toBe(true);
    expect(selectIsViewingAs(useViewAsStore.getState())).toBe(false);
  });

  it('stays out of view-as when the backend refuses it', async () => {
    // Arrange
    request.mockRejectedValue(new Error('VIEW_AS_FORBIDDEN'));

    // Act
    const attempt = useViewAsStore.getState().start('customer-1', 'Ana SAS');

    // Assert
    await expect(attempt).rejects.toThrow('VIEW_AS_FORBIDDEN');
    expect(setViewAsHeader).toHaveBeenLastCalledWith(null);
    expect(useAuthStore.getState().user).toEqual(admin);
    expect(selectIsViewingAs(useViewAsStore.getState())).toBe(false);
  });

  it('ends view-as when the session ends', async () => {
    // Arrange
    request.mockResolvedValue({ auth_me: customer });
    await useViewAsStore.getState().start('customer-1', 'Ana SAS');

    // Act
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });

    // Assert
    expect(selectIsViewingAs(useViewAsStore.getState())).toBe(false);
    expect(useViewAsStore.getState().adminUser).toBeNull();
  });
});
