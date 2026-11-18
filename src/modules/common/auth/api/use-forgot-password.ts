/**
 * useForgotPassword Hook
 *
 * Requests a password-reset email directly through the Firebase Client SDK,
 * mirroring the auth pattern used by useSignIn (the SPA drives Firebase auth
 * directly; the backend is not involved in the email/password flow).
 *
 * For privacy we never reveal whether an email is registered: an unknown
 * address resolves as success so the UI shows the same "check your email"
 * state regardless.
 */

import { useState } from 'react';
import { getAuth } from '@/shared/lib/loopayx/firebase-client';

import {
  buildResetPasswordActionCodeSettings,
  requestPasswordResetEmail,
} from '../pages/firebase-public-auth-flow';

function createForgotPasswordError(reason: 'invalid-email' | 'too-many-requests' | 'unavailable' | 'generic') {
  const codeByReason = {
    'invalid-email': 'auth/invalid-email',
    'too-many-requests': 'auth/too-many-requests',
    unavailable: 'SERVICE_UNAVAILABLE',
    generic: 'FORGOT_PASSWORD_REQUEST_FAILED',
  } as const;

  const messageByReason = {
    'invalid-email': 'Invalid email',
    'too-many-requests': 'Too many requests',
    unavailable: 'Password reset unavailable',
    generic: 'Could not send password reset email',
  } as const;

  const error = new Error(messageByReason[reason]) as Error & { code?: string };
  error.code = codeByReason[reason];
  return error;
}

export function useForgotPassword(options?: {
  onSuccess?: (email: string) => void;
  onError?: (error: Error) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendResetEmail = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestPasswordResetEmail({
        email,
        getAuth,
        loadFirebaseAuth: () => import('firebase/auth'),
        actionCodeSettings: buildResetPasswordActionCodeSettings(window.location.origin),
      });

      if (result.status === 'success') {
        options?.onSuccess?.(result.email);
        return;
      }

      const mappedError = createForgotPasswordError(result.reason);
      options?.onError?.(mappedError);
      setError(mappedError);
    } catch (err: unknown) {
      const fallbackError = err instanceof Error ? err : new Error('Unknown error');
      options?.onError?.(fallbackError);
      setError(fallbackError);
    } finally {
      setIsLoading(false);
    }
  };

  return { sendResetEmail, isLoading, error };
}
