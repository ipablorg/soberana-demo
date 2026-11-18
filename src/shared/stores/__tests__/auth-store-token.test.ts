// @vitest-environment jsdom

/**
 * `setToken` swaps only the token (store + GraphQL header). It must never go
 * through `setAuth`, which rewrites the persisted customer context.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { setAuthToken, clearHeaders } = vi.hoisted(() => ({
  setAuthToken: vi.fn(),
  clearHeaders: vi.fn(),
}));

vi.mock('@/shared/lib/graphql-client', () => ({ setAuthToken, clearHeaders }));
vi.mock('@/shared/hooks/useKYC', () => ({ clearKycLink: vi.fn() }));

import type { AuthUser } from '@/shared/types/auth.types';
import {
  getStoredBusinessName,
  getStoredCustomerType,
  storeCustomerContext,
} from '@/shared/lib/kyc/customer-context';
import { memoryStorage } from '@/test/memory-storage';
import { useAuthStore } from '../auth-store';

const user = { id: 'u-1', company_name: null, roles: [], staff_roles: [] } as unknown as AuthUser;

afterEach(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  setAuthToken.mockClear();
  clearHeaders.mockClear();
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
});

describe('useAuthStore.setToken', () => {
  it('replaces the token in the store and in the GraphQL header', () => {
    useAuthStore.setState({ user, token: 'old', isAuthenticated: true });

    useAuthStore.getState().setToken('new');

    expect(useAuthStore.getState().token).toBe('new');
    expect(useAuthStore.getState().user).toBe(user);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(setAuthToken).toHaveBeenCalledTimes(1);
    expect(setAuthToken).toHaveBeenCalledWith('new');
  });

  it('does not wipe the persisted customer context', () => {
    storeCustomerContext({ customerType: 'business', businessName: 'Acme SAS' });
    useAuthStore.setState({ user, token: 'old', isAuthenticated: true });

    useAuthStore.getState().setToken('new');

    expect(getStoredCustomerType()).toBe('business');
    expect(getStoredBusinessName()).toBe('Acme SAS');
  });

  it('is ignored when nobody is signed in, so a late refresh cannot revive a session', () => {
    useAuthStore.getState().setToken('late');

    expect(useAuthStore.getState().token).toBeNull();
    expect(setAuthToken).not.toHaveBeenCalled();
  });
});
