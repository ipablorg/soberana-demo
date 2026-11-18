// @vitest-environment jsdom

/**
 * A restored session must satisfy the same enforcement as a fresh sign-in
 * (`resolveSignInEnforcementDecision`): an unverified email with no second
 * factor is never let in just because Firebase still remembers it.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  multiFactor: vi.fn(),
}));

vi.mock('firebase/auth', () => ({ multiFactor: mocks.multiFactor }));

import type { User } from 'firebase/auth';
import { canRestoreFirebaseUser } from '../session-restore-policy';

function fbUser(emailVerified: boolean): User {
  return { emailVerified } as unknown as User;
}

beforeEach(() => {
  vi.stubEnv('VITE_DISABLE_EMAIL_VERIFICATION_ENFORCEMENT', 'false');
  vi.stubEnv('VITE_DISABLE_MFA_ENFORCEMENT', 'false');
  mocks.multiFactor.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('canRestoreFirebaseUser', () => {
  it('restores a verified user', async () => {
    mocks.multiFactor.mockReturnValue({ enrolledFactors: [] });

    await expect(canRestoreFirebaseUser(fbUser(true))).resolves.toBe(true);
  });

  it('restores a user with an enrolled second factor even if the email flag is off', async () => {
    mocks.multiFactor.mockReturnValue({ enrolledFactors: [{ uid: 'totp-1' }] });

    await expect(canRestoreFirebaseUser(fbUser(false))).resolves.toBe(true);
  });

  it('refuses an unverified user with no second factor', async () => {
    mocks.multiFactor.mockReturnValue({ enrolledFactors: [] });

    await expect(canRestoreFirebaseUser(fbUser(false))).resolves.toBe(false);
  });
});
