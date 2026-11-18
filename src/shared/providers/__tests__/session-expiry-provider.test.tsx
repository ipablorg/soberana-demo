// @vitest-environment jsdom

import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  setAuthToken: vi.fn(),
  clearHeaders: vi.fn(),
  getIdToken: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  firebase: { currentUser: null as { getIdToken: (force?: boolean) => Promise<string> } | null },
}));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@/shared/lib/graphql-client', () => ({
  setAuthToken: mocks.setAuthToken,
  clearHeaders: mocks.clearHeaders,
}));
vi.mock('@/shared/hooks/useKYC', () => ({ clearKycLink: vi.fn() }));
vi.mock('@/shared/lib/loopayx/firebase-client', () => ({
  getAuth: async () => ({ currentUser: mocks.firebase.currentUser }),
}));
vi.mock('sonner', () => ({
  toast: { success: mocks.toastSuccess, error: mocks.toastError },
}));

import { i18n } from '@lingui/core';
import type { AuthUser } from '@/shared/types/auth.types';
import {
  notifySessionExpired,
  resetSessionExpiredNotice,
  SESSION_EXPIRED_TOAST_ID,
} from '@/shared/lib/session-expired-notice';
import { useAuthStore } from '@/shared/stores/auth-store';
import { mountPage, type MountedPage } from '@/test/dom-render';
import { memoryStorage } from '@/test/memory-storage';
import { SessionExpiryProvider } from '../session-expiry-provider';

const NOW = new Date('2026-03-01T12:00:00Z').getTime();
const HOUR = 3600;
const LEAD = 300;
// Outside React the helper translates through the global i18n instance.
i18n.loadAndActivate({ locale: 'en', messages: {} });

const user = { id: 'u-1', company_name: null, roles: [], staff_roles: [] } as unknown as AuthUser;

function makeToken(expiresInSeconds: number): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const exp = Math.floor(NOW / 1000) + expiresInSeconds;
  return `${encode({ alg: 'RS256' })}.${encode({ exp })}.sig`;
}

let page: MountedPage | null = null;

function signIn(token: string) {
  act(() => {
    useAuthStore.setState({ user, token, isAuthenticated: true, isLoading: false });
  });
}

function mountProvider() {
  page = mountPage(
    <SessionExpiryProvider>
      <div>app content</div>
    </SessionExpiryProvider>,
  );
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

/** Lets pending promises (dynamic import, mocked Firebase) resolve under fake timers. */
async function settle() {
  for (let i = 0; i < 5; i += 1) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
  }
}

const dialog = () => document.body.querySelector('[role="dialog"]');
const timer = () => document.body.querySelector('[role="timer"]');
const button = (label: string) =>
  Array.from(document.body.querySelectorAll('button')).find(
    (node) => (node.textContent ?? '').trim() === label,
  ) as HTMLButtonElement | undefined;

function press(label: string) {
  const target = button(label);
  if (!target) throw new Error(`No button "${label}". Body: ${document.body.textContent}`);
  page?.click(target);
}

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  Object.values(mocks).forEach((mock) => {
    if (typeof mock === 'function') mock.mockReset();
  });
  mocks.firebase.currentUser = { getIdToken: mocks.getIdToken };
  resetSessionExpiredNotice();
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
});

afterEach(() => {
  page?.unmount();
  page = null;
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('SessionExpiryProvider scheduling', () => {
  it('renders children and schedules nothing when unauthenticated', () => {
    mountProvider();

    expect(page?.text()).toContain('app content');
    expect(vi.getTimerCount()).toBe(0);

    advance(3 * HOUR * 1000);
    expect(dialog()).toBeNull();
  });

  it('does not schedule when the token has no readable exp', () => {
    signIn('not-a-jwt');
    mountProvider();

    expect(vi.getTimerCount()).toBe(0);
    expect(dialog()).toBeNull();
  });

  it('shows the prompt exactly LEAD seconds before the token expires', () => {
    signIn(makeToken(HOUR));
    mountProvider();
    expect(dialog()).toBeNull();

    advance((HOUR - LEAD) * 1000 - 1);
    expect(dialog()).toBeNull();

    advance(1);
    expect(dialog()).not.toBeNull();
    expect(document.body.textContent).toContain('¿Quieres seguir con la sesión?');
    expect(document.body.textContent).toContain('Tu sesión está por vencer.');
    expect(timer()?.textContent).toBe('05:00');
  });

  it('shows the prompt immediately when already inside the lead window', () => {
    signIn(makeToken(120));
    mountProvider();

    expect(dialog()).not.toBeNull();
    expect(timer()?.textContent).toBe('02:00');
  });

  it('counts down from the wall clock, not from a counter', () => {
    signIn(makeToken(120));
    mountProvider();

    // A throttled background tab delivers one late tick: the jump must be reflected.
    act(() => {
      vi.setSystemTime(NOW + 45_000);
      vi.advanceTimersByTime(1000);
    });

    expect(timer()?.textContent).toBe('01:14');
  });

  it('puts focus on the primary action and cannot be dismissed with Escape', () => {
    signIn(makeToken(120));
    mountProvider();

    expect(document.activeElement).toBe(button('Seguir con la sesión'));

    act(() => {
      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    });

    expect(dialog()).not.toBeNull();
  });

  it('announces the remaining time only at coarse steps', () => {
    signIn(makeToken(120));
    mountProvider();

    const live = () => document.body.querySelector('[aria-live="polite"]')?.textContent;
    const first = live();
    expect(first).toContain('02:00');

    advance(5_000);
    expect(live()).toBe(first);

    advance(30_000);
    expect(live()).not.toBe(first);
  });
});

describe('SessionExpiryProvider continue', () => {
  it('refreshes the token in the store and the header, closes and reschedules', async () => {
    const fresh = makeToken(HOUR + 100);
    mocks.getIdToken.mockResolvedValue(fresh);
    signIn(makeToken(120));
    mountProvider();

    press('Seguir con la sesión');
    await settle();

    expect(mocks.getIdToken).toHaveBeenCalledTimes(1);
    expect(mocks.getIdToken).toHaveBeenCalledWith(true);
    expect(useAuthStore.getState().token).toBe(fresh);
    expect(mocks.setAuthToken).toHaveBeenCalledWith(fresh);
    expect(mocks.toastSuccess).toHaveBeenCalledTimes(1);
    expect(dialog()).toBeNull();

    // Rescheduled from the new exp.
    advance((HOUR + 100 - LEAD) * 1000 - 1);
    expect(dialog()).toBeNull();
    advance(1);
    expect(dialog()).not.toBeNull();
  });

  it('shows a loading state while refreshing', async () => {
    let resolveToken: (token: string) => void = () => {};
    mocks.getIdToken.mockReturnValue(new Promise<string>((resolve) => (resolveToken = resolve)));
    signIn(makeToken(120));
    mountProvider();

    press('Seguir con la sesión');
    await settle();

    expect(button('Seguir con la sesión')?.disabled).toBe(true);
    expect(button('Seguir con la sesión')?.getAttribute('aria-busy')).toBe('true');

    resolveToken(makeToken(HOUR));
    await settle();
    expect(dialog()).toBeNull();
  });

  it('keeps the modal open with an inline error and lets the user retry', async () => {
    mocks.getIdToken.mockRejectedValueOnce(new Error('network'));
    signIn(makeToken(120));
    mountProvider();

    press('Seguir con la sesión');
    await settle();

    expect(dialog()).not.toBeNull();
    expect(document.body.textContent).toContain('No pudimos renovar tu sesión.');
    expect(button('Cerrar sesión')).toBeDefined();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    // No silent retry loop.
    await settle();
    expect(mocks.getIdToken).toHaveBeenCalledTimes(1);

    mocks.getIdToken.mockResolvedValueOnce(makeToken(HOUR));
    press('Reintentar');
    await settle();

    expect(mocks.getIdToken).toHaveBeenCalledTimes(2);
    expect(dialog()).toBeNull();
  });

  it('reports an error when there is no Firebase user to refresh', async () => {
    mocks.firebase.currentUser = null;
    signIn(makeToken(120));
    mountProvider();

    press('Seguir con la sesión');
    await settle();

    expect(dialog()).not.toBeNull();
    expect(document.body.textContent).toContain('No pudimos renovar tu sesión.');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('does not revive the session when the user logs out while the refresh is in flight', async () => {
    let resolveToken: (token: string) => void = () => {};
    mocks.getIdToken.mockReturnValue(new Promise<string>((resolve) => (resolveToken = resolve)));
    signIn(makeToken(120));
    mountProvider();

    press('Seguir con la sesión');
    await settle();
    act(() => useAuthStore.getState().clearAuth());

    const late = makeToken(HOUR);
    resolveToken(late);
    await settle();

    expect(useAuthStore.getState().token).toBeNull();
    expect(mocks.setAuthToken).not.toHaveBeenCalledWith(late);
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
  });
});

describe('SessionExpiryProvider logout and expiry', () => {
  it('logs out through clearAuth when the user chooses to close the session', () => {
    signIn(makeToken(120));
    mountProvider();

    press('Cerrar sesión');

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
    expect(mocks.clearHeaders).toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
    expect(dialog()).toBeNull();
  });

  it('logs out and says so when the countdown reaches zero', () => {
    signIn(makeToken(10));
    mountProvider();
    expect(timer()?.textContent).toBe('00:10');

    advance(9_000);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    advance(1_000);

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    // Same single expiry message every other path uses.
    expect(mocks.toastError).toHaveBeenCalledWith('Tu sesión venció. Vuelve a ingresar.', {
      id: SESSION_EXPIRED_TOAST_ID,
    });
    expect(dialog()).toBeNull();
  });

  it('does not add a second notice when another path already announced this expiry', () => {
    signIn(makeToken(10));
    mountProvider();
    notifySessionExpired();
    mocks.toastError.mockClear();

    advance(10_000);

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it('logs out at zero even if the wall clock jumped past exp while throttled', () => {
    signIn(makeToken(60));
    mountProvider();

    act(() => {
      vi.setSystemTime(NOW + 10 * 60_000);
      vi.advanceTimersByTime(1000);
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
  });
});

describe('SessionExpiryProvider token rotation and cleanup', () => {
  it('follows a token rotated elsewhere (reauth, login)', () => {
    signIn(makeToken(HOUR));
    mountProvider();
    expect(dialog()).toBeNull();

    signIn(makeToken(90));
    expect(dialog()).not.toBeNull();
    expect(timer()?.textContent).toBe('01:30');

    signIn(makeToken(HOUR));
    expect(dialog()).toBeNull();

    advance((HOUR - LEAD) * 1000);
    expect(dialog()).not.toBeNull();
  });

  it('clears every timer when the user logs out', () => {
    signIn(makeToken(HOUR));
    mountProvider();
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    act(() => useAuthStore.getState().clearAuth());

    expect(vi.getTimerCount()).toBe(0);
  });

  it('clears the countdown interval when the token changes', () => {
    signIn(makeToken(120));
    mountProvider();
    expect(dialog()).not.toBeNull();

    signIn(makeToken(HOUR));
    advance(1);

    // Only the single "show the prompt" timeout is left.
    expect(vi.getTimerCount()).toBe(1);
  });

  it('clears every timer on unmount', () => {
    signIn(makeToken(120));
    mountProvider();
    expect(dialog()).not.toBeNull();

    page?.unmount();
    page = null;
    advance(10);

    expect(vi.getTimerCount()).toBe(0);
  });
});
