// @vitest-environment jsdom

/**
 * The single "your session expired" notice.
 *
 * Every path that ends a session because the credentials are definitively gone
 * (`auth_me` rejected, Firebase says the user is gone, the token ran out) calls
 * `notifySessionExpired()`. Several of them can fire for one expiry, so the
 * helper must show the message once, and only re-arm after a new sign-in.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  toastError: vi.fn(),
}));

vi.mock('sonner', () => ({ toast: { error: mocks.toastError } }));
vi.mock('@/shared/lib/graphql-client', () => ({ setAuthToken: vi.fn(), clearHeaders: vi.fn() }));
vi.mock('@/shared/hooks/useKYC', () => ({ clearKycLink: vi.fn() }));

import { i18n } from '@lingui/core';
import type { AuthUser } from '@/shared/types/auth.types';
import { useAuthStore } from '@/shared/stores/auth-store';
import { memoryStorage } from '@/test/memory-storage';
import {
  notifySessionExpired,
  resetSessionExpiredNotice,
  SESSION_EXPIRED_TOAST_ID,
} from '../session-expired-notice';

// Outside React the helper translates through the global i18n instance.
i18n.loadAndActivate({ locale: 'en', messages: {} });

const user = { id: 'u-1', company_name: null, roles: [], staff_roles: [] } as unknown as AuthUser;

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  mocks.toastError.mockReset();
  resetSessionExpiredNotice();
  useAuthStore.setState({
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    isRestoringSession: false,
    sessionRecovery: 'idle',
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('notifySessionExpired', () => {
  it('shows the expiry message as an error toast with a stable id', () => {
    notifySessionExpired();

    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(mocks.toastError).toHaveBeenCalledWith('Tu sesión venció. Vuelve a ingresar.', {
      id: SESSION_EXPIRED_TOAST_ID,
    });
  });

  it('shows it once even when several paths report the same expiry', () => {
    notifySessionExpired();
    notifySessionExpired();
    notifySessionExpired();

    expect(mocks.toastError).toHaveBeenCalledTimes(1);
  });

  it('reports whether it actually showed the message', () => {
    expect(notifySessionExpired()).toBe(true);
    expect(notifySessionExpired()).toBe(false);
  });

  it('arms again after the next successful sign-in, so a later expiry is announced', () => {
    notifySessionExpired();

    useAuthStore.getState().setAuth(user, 'fresh-login');
    useAuthStore.getState().clearAuth();
    notifySessionExpired();

    expect(mocks.toastError).toHaveBeenCalledTimes(2);
  });

  it('does not re-arm on a plain logout (clearAuth alone)', () => {
    notifySessionExpired();

    useAuthStore.getState().clearAuth();
    notifySessionExpired();

    expect(mocks.toastError).toHaveBeenCalledTimes(1);
  });
});
