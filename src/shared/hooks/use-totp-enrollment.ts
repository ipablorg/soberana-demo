/**
 * useTotpEnrollment
 *
 * Shared TOTP enrollment state machine, extracted from the settings
 * MFA section so every surface that can enroll a second factor
 * (Settings, the post-registration invitation) runs the exact same
 * Firebase flow: generate a secret under the current session, show
 * the QR + manual key, then verify one 6-digit code to finish.
 *
 * Firebase auth is imported dynamically (same as every MFA surface in
 * the app) so the firebase vendor chunk stays out of the dashboard's
 * critical path.
 *
 * Errors are exposed as raw values — consumers map them with
 * `mapError()` per house rules instead of this hook guessing at
 * copy.
 */

import { useCallback, useRef, useState } from 'react';
import type { TotpSecret } from 'firebase/auth';

export type TotpEnrollmentStep =
  | 'idle'
  | 'starting'
  | 'pending'
  | 'verifying'
  | 'enrolled';

export interface UseTotpEnrollmentResult {
  step: TotpEnrollmentStep;
  isStarting: boolean;
  /** QR + manual key are ready and waiting for a verification code. */
  isPendingCode: boolean;
  isVerifying: boolean;
  isEnrolled: boolean;
  otpauthUrl: string | null;
  /** Base32 secret for manual entry, shown alongside the QR code. */
  manualKey: string | null;
  /** Raw error from the last failed start/verify; map with `mapError()`. */
  error: unknown;
  /** Kick off enrollment: resolves the secret for the QR code. */
  start: () => Promise<void>;
  /** Submit the 6-digit code; resolves true when enrollment completed. */
  verify: (code: string) => Promise<boolean>;
  /** Drop any in-flight secret and return to idle. */
  reset: () => void;
}

export function useTotpEnrollment(options?: {
  /** Label embedded in the QR code (the user's email). */
  accountEmail?: string | null;
  onEnrolled?: () => void;
}): UseTotpEnrollmentResult {
  const [step, setStep] = useState<TotpEnrollmentStep>('idle');
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  const [manualKey, setManualKey] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const secretRef = useRef<TotpSecret | null>(null);

  const start = useCallback(async () => {
    setStep('starting');
    setError(null);
    try {
      const { getAuth } = await import('@/shared/lib/loopayx/firebase-client');
      const { multiFactor, TotpMultiFactorGenerator } = await import('firebase/auth');
      const auth = await getAuth();
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error('MFA_ENROLLMENT_NO_FIREBASE_USER');

      const session = await multiFactor(fbUser).getSession();
      const secret = await TotpMultiFactorGenerator.generateSecret(session);

      secretRef.current = secret;
      const label =
        options?.accountEmail?.trim() || fbUser.email || fbUser.uid;
      setOtpauthUrl(secret.generateQrCodeUrl(label, 'Soberana'));
      setManualKey(secret.secretKey);
      setStep('pending');
    } catch (err) {
      secretRef.current = null;
      setOtpauthUrl(null);
      setManualKey(null);
      setError(err);
      setStep('idle');
    }
  }, [options?.accountEmail]);

  const verify = useCallback(
    async (code: string): Promise<boolean> => {
      const sanitized = code.replace(/\D/g, '');
      if (sanitized.length < 6 || !secretRef.current) return false;

      setStep('verifying');
      setError(null);
      try {
        const { getAuth } = await import('@/shared/lib/loopayx/firebase-client');
        const { multiFactor, TotpMultiFactorGenerator } = await import('firebase/auth');
        const auth = await getAuth();
        const fbUser = auth.currentUser;
        if (!fbUser) throw new Error('MFA_ENROLLMENT_NO_FIREBASE_USER');

        const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
          secretRef.current,
          sanitized,
        );
        await multiFactor(fbUser).enroll(assertion, 'Soberana');

        secretRef.current = null;
        setOtpauthUrl(null);
        setManualKey(null);
        setStep('enrolled');
        options?.onEnrolled?.();
        return true;
      } catch (err) {
        setError(err);
        setStep('pending');
        return false;
      }
    },
    // `options.onEnrolled` is intentionally not a dependency: callers
    // pass inline closures and the callback identity must not restart
    // an in-flight verification.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const reset = useCallback(() => {
    secretRef.current = null;
    setOtpauthUrl(null);
    setManualKey(null);
    setError(null);
    setStep('idle');
  }, []);

  return {
    step,
    isStarting: step === 'starting',
    isPendingCode: step === 'pending',
    isVerifying: step === 'verifying',
    isEnrolled: step === 'enrolled',
    otpauthUrl,
    manualKey,
    error,
    start,
    verify,
    reset,
  };
}
