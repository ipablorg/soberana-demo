/**
 * Restore policy for a persisted Firebase user.
 *
 * A restored session must clear the same bar as a fresh sign-in. The sign-in
 * flow signs out an unverified user with no second factor; if that best-effort
 * sign-out ever failed, the leftover Firebase session must not be turned into
 * an app session just because Firebase remembers it. Lives in the app layer
 * because the enforcement rules belong to the auth module (`shared` must not
 * import from `modules`).
 */

import type { User } from 'firebase/auth';
import { resolveSignInEnforcementDecision } from '@/modules/common/auth/api/auth-enforcement';

export async function canRestoreFirebaseUser(user: User): Promise<boolean> {
  const { multiFactor } = await import('firebase/auth');

  return (
    resolveSignInEnforcementDecision({
      hasEnrolledFactors: multiFactor(user).enrolledFactors.length > 0,
      isEmailVerified: user.emailVerified,
    }) === 'allow-login'
  );
}
