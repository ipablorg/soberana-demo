/**
 * require-mfa-enrollment
 *
 * Single source of truth for "does the current Firebase user have a second
 * factor enrolled?". Staff surfaces (backoffice) are hard-gated on this; the
 * suite settings section and the dashboard suggestion banner use the same
 * helper so the answer never diverges between screens.
 *
 * The Firebase app/auth instance is imported from the shared auth client
 * (`@/shared/lib/loopayx/firebase-client`) and is never re-configured here.
 */

import { useCallback, useEffect, useState } from 'react';
import { isDevMockMode } from '@/shared/lib/dev-config';
import type { User } from 'firebase/auth';

export type MfaEnrollmentStatus = 'checking' | 'enrolled' | 'required';

/**
 * Resolves the Firebase user once auth state has settled. Reading
 * `auth.currentUser` synchronously right after boot can return `null` while
 * persistence is still being restored, which would spuriously lock a staff
 * member out of the backoffice on a hard refresh.
 */
async function resolveSettledUser(): Promise<User | null> {
  const { getAuth } = await import('@/shared/lib/loopayx/firebase-client');
  const { onAuthStateChanged } = await import('firebase/auth');
  const auth = await getAuth();

  if (auth.currentUser) return auth.currentUser;

  return new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/**
 * `true` when the signed-in Firebase user has at least one enrolled factor.
 * Fails closed: any error, or no Firebase session at all, reports `false`.
 */
export async function hasEnrolledFactors(): Promise<boolean> {
  try {
    const { multiFactor } = await import('firebase/auth');
    const user = await resolveSettledUser();
    if (!user) return false;
    return multiFactor(user).enrolledFactors.length > 0;
  } catch {
    return false;
  }
}

/**
 * Gate hook for MFA-protected surfaces. Returns `checking` until Firebase has
 * answered, then `enrolled` or `required`. Dev mock mode bypasses the gate the
 * same way `ProtectedRoute` does, so local work is unaffected.
 */
export function useRequireMfaEnrollment() {
  const [status, setStatus] = useState<MfaEnrollmentStatus>(() =>
    isDevMockMode() ? 'enrolled' : 'checking',
  );

  const check = useCallback(() => {
    if (isDevMockMode()) {
      setStatus('enrolled');
      return () => {};
    }

    let cancelled = false;
    setStatus('checking');

    hasEnrolledFactors().then((enrolled) => {
      if (cancelled) return;
      setStatus(enrolled ? 'enrolled' : 'required');
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => check(), [check]);

  return {
    status,
    isChecking: status === 'checking',
    isEnrolled: status === 'enrolled',
    recheck: check,
  };
}
