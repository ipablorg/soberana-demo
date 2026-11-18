// @vitest-environment jsdom

/**
 * Session restoration state in the auth store.
 *
 * `restoreToken` is the only way to put a token in the store without a full
 * sign-in. It must never overwrite a live session and must be inert once the
 * restoration window has closed, so a late Firebase answer cannot revive a
 * session the user already ended (or replace one they just created).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { setAuthToken, clearHeaders } = vi.hoisted(() => ({
  setAuthToken: vi.fn(),
  clearHeaders: vi.fn(),
}));

vi.mock('@/shared/lib/graphql-client', () => ({ setAuthToken, clearHeaders }));
vi.mock('@/shared/hooks/useKYC', () => ({ clearKycLink: vi.fn() }));

import type { AuthUser } from '@/shared/types/auth.types';
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
  useAuthStore.setState({
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    isRestoringSession: true,
    sessionRecovery: 'idle',
  });
});

describe('useAuthStore session restoration', () => {
  it('starts in the restoring state so guards do not redirect before Firebase answers', () => {
    expect(useAuthStore.getInitialState().isRestoringSession).toBe(true);
  });

  it('restoreToken stores the token and the GraphQL header without authenticating', () => {
    const restored = useAuthStore.getState().restoreToken('firebase-token');

    expect(restored).toBe(true);
    expect(useAuthStore.getState().token).toBe('firebase-token');
    expect(setAuthToken).toHaveBeenCalledWith('firebase-token');
    // Authenticated only once auth_me has been applied through setAuth.
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isRestoringSession).toBe(true);
  });

  it('restoreToken does not overwrite a token that is already in the store', () => {
    useAuthStore.setState({ user, token: 'fresh-login', isAuthenticated: true });

    const restored = useAuthStore.getState().restoreToken('stale-firebase-token');

    expect(restored).toBe(false);
    expect(useAuthStore.getState().token).toBe('fresh-login');
    expect(setAuthToken).not.toHaveBeenCalled();
  });

  it('restoreToken may replace a restored token that auth_me has not confirmed yet', () => {
    useAuthStore.getState().restoreToken('first-token');
    setAuthToken.mockClear();

    const restored = useAuthStore.getState().restoreToken('refreshed-token');

    expect(restored).toBe(true);
    expect(useAuthStore.getState().token).toBe('refreshed-token');
    expect(setAuthToken).toHaveBeenCalledWith('refreshed-token');
  });

  it('restoreToken is inert once restoration has ended', () => {
    useAuthStore.getState().endSessionRestore();

    const restored = useAuthStore.getState().restoreToken('late-token');

    expect(restored).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
    expect(setAuthToken).not.toHaveBeenCalled();
  });

  it('endSessionRestore only flips the flag', () => {
    useAuthStore.getState().endSessionRestore();

    const state = useAuthStore.getState();
    expect(state.isRestoringSession).toBe(false);
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setAuth ends restoration (a completed sign-in or restore is authenticated)', () => {
    useAuthStore.getState().setAuth(user, 'token');

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isRestoringSession).toBe(false);
  });

  it('clearAuth ends restoration so a failed restore falls back to the login redirect', () => {
    useAuthStore.getState().restoreToken('firebase-token');

    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.isRestoringSession).toBe(false);
    expect(clearHeaders).toHaveBeenCalled();
  });

  it('setToken is still ignored while signed out (restoration must use restoreToken)', () => {
    useAuthStore.getState().setToken('late-refresh');

    expect(useAuthStore.getState().token).toBeNull();
    expect(setAuthToken).not.toHaveBeenCalled();
  });
});

describe('useAuthStore session recovery (slow restore)', () => {
  it('starts idle', () => {
    expect(useAuthStore.getInitialState().sessionRecovery).toBe('idle');
  });

  it('markSessionRecoverySlow flags a restored, unconfirmed token without dropping it', () => {
    useAuthStore.getState().restoreToken('firebase-token');

    useAuthStore.getState().markSessionRecoverySlow();

    const state = useAuthStore.getState();
    expect(state.sessionRecovery).toBe('slow');
    expect(state.token).toBe('firebase-token');
    expect(state.isRestoringSession).toBe(true);
    expect(clearHeaders).not.toHaveBeenCalled();
  });

  it('markSessionRecoverySlow is ignored when there is no restored token', () => {
    useAuthStore.getState().markSessionRecoverySlow();

    expect(useAuthStore.getState().sessionRecovery).toBe('idle');
  });

  it('markSessionRecoverySlow is ignored for an already authenticated session', () => {
    useAuthStore.setState({ user, token: 'fresh-login', isAuthenticated: true });

    useAuthStore.getState().markSessionRecoverySlow();

    expect(useAuthStore.getState().sessionRecovery).toBe('idle');
  });

  it('markSessionRecoverySlow is ignored once restoration has ended', () => {
    useAuthStore.getState().restoreToken('firebase-token');
    useAuthStore.getState().endSessionRestore();

    useAuthStore.getState().markSessionRecoverySlow();

    expect(useAuthStore.getState().sessionRecovery).toBe('idle');
  });

  it('setAuth resets the recovery flag when auth_me finally answers', () => {
    useAuthStore.getState().restoreToken('firebase-token');
    useAuthStore.getState().markSessionRecoverySlow();

    useAuthStore.getState().setAuth(user, 'firebase-token');

    expect(useAuthStore.getState().sessionRecovery).toBe('idle');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('clearAuth (explicit "go to login") resets the recovery flag', () => {
    useAuthStore.getState().restoreToken('firebase-token');
    useAuthStore.getState().markSessionRecoverySlow();

    useAuthStore.getState().clearAuth();

    expect(useAuthStore.getState().sessionRecovery).toBe('idle');
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('endSessionRestore resets the recovery flag', () => {
    useAuthStore.getState().restoreToken('firebase-token');
    useAuthStore.getState().markSessionRecoverySlow();

    useAuthStore.getState().endSessionRestore();

    expect(useAuthStore.getState().sessionRecovery).toBe('idle');
  });
});
