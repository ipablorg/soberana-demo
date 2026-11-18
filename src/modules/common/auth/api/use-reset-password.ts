/**
 * useResetPassword Hook
 *
 * Verifies a Firebase password-reset code (oobCode) and confirms a new
 * password, directly through the Firebase Client SDK — same auth pattern as
 * useSignIn / useForgotPassword.
 */

import { useState } from 'react';
import { getAuth } from '@/shared/lib/loopayx/firebase-client';

export function useResetPassword() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<Error | null>(null);

  /**
   * Validate the reset code and recover the associated email.
   * Returns the email on success, or null if the link is invalid/expired.
   */
  const verifyCode = async (oobCode: string): Promise<string | null> => {
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const { verifyPasswordResetCode } = await import('firebase/auth');
      const auth = await getAuth();
      const email = await verifyPasswordResetCode(auth, oobCode);
      setVerifiedEmail(email);
      return email;
    } catch (err: unknown) {
      setVerifyError(err as Error);
      return null;
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Confirm the new password. Throws on failure so callers can map the error.
   */
  const resetPassword = async (oobCode: string, newPassword: string) => {
    setIsSubmitting(true);
    try {
      const { confirmPasswordReset } = await import('firebase/auth');
      const auth = await getAuth();
      await confirmPasswordReset(auth, oobCode, newPassword);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    verifyCode,
    resetPassword,
    isVerifying,
    isSubmitting,
    verifiedEmail,
    verifyError,
  };
}
