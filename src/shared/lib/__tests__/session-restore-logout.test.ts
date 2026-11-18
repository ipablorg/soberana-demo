// @vitest-environment jsdom

/**
 * Logout must really log out.
 *
 * With boot-time restoration in place, dropping only the in-memory state would
 * let the persisted Firebase session silently sign the user back in on the next
 * reload. Every `clearAuth()` therefore has to sign the Firebase user out too.
 *
 * This runs the real `firebase-client` bootstrap against a fake Firebase SDK so
 * the whole chain is covered: clearAuth -> logout hook -> signOutFirebase ->
 * SDK `signOut` -> a later boot finds nobody to restore.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface FakeUser {
  getIdToken: ReturnType<typeof vi.fn>;
}

const fake = vi.hoisted(() => {
  const auth: {
    currentUser: { getIdToken: ReturnType<typeof vi.fn> } | null;
    authStateReady: () => Promise<void>;
  } = {
    currentUser: null,
    authStateReady: async () => {},
  };
  return {
    auth,
    signOut: vi.fn(async (target: { currentUser: unknown }) => {
      target.currentUser = null;
    }),
  };
});

vi.mock('@/shared/lib/graphql-client', () => ({ setAuthToken: vi.fn(), clearHeaders: vi.fn() }));
vi.mock('@/shared/hooks/useKYC', () => ({ clearKycLink: vi.fn() }));
vi.mock('@/shared/lib/dev-config', () => ({ isDevMockMode: () => false }));
vi.mock('firebase/app', () => ({
  getApps: () => [{}],
  getApp: () => ({}),
  initializeApp: vi.fn(),
}));
vi.mock('firebase/auth', () => ({
  getAuth: () => fake.auth,
  initializeAuth: () => fake.auth,
  browserLocalPersistence: {},
  signOut: fake.signOut,
  onAuthStateChanged: vi.fn(),
}));

import type { AuthUser } from '@/shared/types/auth.types';
import { useAuthStore } from '@/shared/stores/auth-store';
import { memoryStorage } from '@/test/memory-storage';
import { registerFirebaseSignOutHook, startSessionRestore } from '../session-restore';

const user = { id: 'u-1', company_name: null, roles: [], staff_roles: [] } as unknown as AuthUser;

function signedInFirebaseUser(): FakeUser {
  return { getIdToken: vi.fn(async () => 'firebase-token') };
}

let unregister: (() => void) | null = null;
let stop: (() => void) | null = null;

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  vi.stubGlobal('sessionStorage', memoryStorage());
  fake.signOut.mockClear();
  fake.auth.currentUser = signedInFirebaseUser();
  useAuthStore.setState({
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    isRestoringSession: false,
  });
  unregister = registerFirebaseSignOutHook();
});

afterEach(() => {
  stop?.();
  stop = null;
  unregister?.();
  unregister = null;
  vi.unstubAllGlobals();
});

describe('registerFirebaseSignOutHook', () => {
  it('signs the Firebase user out on clearAuth, so a later boot cannot restore it', async () => {
    useAuthStore.getState().setAuth(user, 'firebase-token');

    useAuthStore.getState().clearAuth();

    await vi.waitFor(() => expect(fake.signOut).toHaveBeenCalledTimes(1));
    expect(fake.signOut).toHaveBeenCalledWith(fake.auth);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    // Next page load: the Firebase SDK has nothing persisted any more.
    const leftover = fake.auth.currentUser as FakeUser | null;
    useAuthStore.setState({ isRestoringSession: true });
    stop = startSessionRestore();
    await vi.waitFor(() => expect(useAuthStore.getState().isRestoringSession).toBe(false));

    expect(fake.auth.currentUser).toBeNull();
    expect(leftover).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('does not block or fail clearAuth when the Firebase sign-out rejects', async () => {
    fake.signOut.mockRejectedValueOnce(new Error('auth/network-request-failed'));
    useAuthStore.getState().setAuth(user, 'firebase-token');

    expect(() => useAuthStore.getState().clearAuth()).not.toThrow();

    await vi.waitFor(() => expect(fake.signOut).toHaveBeenCalledTimes(1));
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('stops signing out once unregistered', async () => {
    unregister?.();
    unregister = null;

    useAuthStore.getState().clearAuth();
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(fake.signOut).not.toHaveBeenCalled();
  });
});
