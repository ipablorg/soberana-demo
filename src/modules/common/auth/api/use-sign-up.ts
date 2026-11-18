/**
 * useSignUp Hook
 * 
 * API hook for the minimal auth sign-up mutation.
 * Handles account creation plus verification email dispatch after successful registration.
 */

import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { SignUpDocument } from '@/graphql/mutations/auth';
import { useState } from 'react';
import { buildResetPasswordActionCodeSettings } from '../pages/firebase-public-auth-flow';

export interface SignUpCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  policy?: boolean;
}

export interface RegistrationData {
  id: string;
  email: string;
  auth_uid?: string | null;
  name: string;
}

export function useSignUp(options?: {
  onSuccess?: (data: RegistrationData) => void;
  onError?: (error: Error) => void;
}) {
  const [storedCredentials, setStoredCredentials] = useState<SignUpCredentials | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [verificationEmailStatus, setVerificationEmailStatus] = useState<'idle' | 'sent' | 'failed'>('idle');
  const [isSendingVerificationEmail, setIsSendingVerificationEmail] = useState(false);

  const sendVerificationEmail = async (credentials: Pick<SignUpCredentials, 'email' | 'password'>) => {
    const { signInWithEmailAndPassword, sendEmailVerification, signOut } = await import('firebase/auth');
    const { getAuth } = await import('@/shared/lib/loopayx/firebase-client');

    const auth = await getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);

    try {
      if (!userCredential.user.emailVerified) {
        const actionCodeSettings = typeof window === 'undefined'
          ? undefined
          : buildResetPasswordActionCodeSettings(window.location.origin);

        await sendEmailVerification(userCredential.user, actionCodeSettings);
      }

      return userCredential.user.email ?? credentials.email;
    } finally {
      try {
        await signOut(auth);
      } catch {
        // Best-effort sign-out.
      }
    }
  };

  const dispatchVerificationEmail = async (credentials: Pick<SignUpCredentials, 'email' | 'password'>) => {
    setIsSendingVerificationEmail(true);
    setPendingVerificationEmail(credentials.email);

    try {
      const email = await sendVerificationEmail(credentials);
      setPendingVerificationEmail(email);
      setVerificationEmailStatus('sent');
    } catch {
      setVerificationEmailStatus('failed');
    } finally {
      setIsSendingVerificationEmail(false);
    }
  };

  const signUpMutation = useGraphQLMutation(SignUpDocument, {
    // Default 'online' mode PAUSES the mutation while the browser reports no
    // network, leaving the form on "Creando cuenta…" with no feedback. Always
    // attempt the request so a connectivity failure surfaces as a toast.
    networkMode: 'always',
    onSuccess: async (data) => {
      const result = data.auth_signUp;

      if (storedCredentials?.password) {
        await dispatchVerificationEmail({
          email: result.email,
          password: storedCredentials.password,
        });
      } else {
        setPendingVerificationEmail(result.email);
        setVerificationEmailStatus('failed');
      }

      options?.onSuccess?.(result);
    },
    onError: (error) => {
      setStoredCredentials(null);
      options?.onError?.(error);
    },
  });

  const signUp = (credentials: SignUpCredentials) => {
    setPendingVerificationEmail(credentials.email);
    setVerificationEmailStatus('idle');
    setStoredCredentials(credentials);
    signUpMutation.mutate({
      signUpInput: {
        email: credentials.email,
        password: credentials.password,
        name: `${credentials.firstName} ${credentials.lastName}`.trim(),
        policy: credentials.policy,
      },
    });
  };

  const resendVerificationEmail = async () => {
    if (!storedCredentials) {
      return;
    }

    await dispatchVerificationEmail({
      email: storedCredentials.email,
      password: storedCredentials.password,
    });
  };

  return {
    signUp,
    resendVerificationEmail,
    pendingVerificationEmail,
    verificationEmailStatus,
    isLoading: signUpMutation.isPending || isSendingVerificationEmail,
    error: signUpMutation.error,
    isSuccess: signUpMutation.isSuccess,
  };
}
