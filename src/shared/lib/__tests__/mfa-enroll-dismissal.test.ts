import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  dismissMfaEnrollInvite,
  isMfaEnrollInviteDismissed,
} from '../mfa-enroll-dismissal';

function installStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    },
  });
  return store;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('mfa-enroll-dismissal', () => {
  it('is not dismissed by default when storage is empty', () => {
    installStorage();
    expect(isMfaEnrollInviteDismissed()).toBe(false);
  });

  it('persists dismissal so the invitation does not nag every visit', () => {
    installStorage();
    dismissMfaEnrollInvite();
    expect(isMfaEnrollInviteDismissed()).toBe(true);
    // A fresh read (simulating a reload) still sees the dismissal.
    expect(isMfaEnrollInviteDismissed()).toBe(true);
  });

  it('treats a missing window as dismissed (SSR-safe, never nags)', () => {
    vi.stubGlobal('window', undefined);
    expect(isMfaEnrollInviteDismissed()).toBe(true);
    expect(() => dismissMfaEnrollInvite()).not.toThrow();
  });

  it('treats a broken localStorage as dismissed', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => {
          throw new Error('blocked');
        },
        setItem: () => {
          throw new Error('blocked');
        },
      },
    });
    expect(isMfaEnrollInviteDismissed()).toBe(true);
    expect(() => dismissMfaEnrollInvite()).not.toThrow();
  });
});
