import type { ActionCodeSettings, Auth } from 'firebase/auth';

export function readFirebaseErrorCode(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return null;
  }

  const { code } = error as { code?: unknown };
  return typeof code === 'string' ? code : null;
}

export function isFirebaseConfigError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes('Loopay X Firebase config missing');
}

export function isInvalidActionCodeError(error: unknown): boolean {
  const errorCode = readFirebaseErrorCode(error);

  return errorCode === 'auth/expired-action-code' || errorCode === 'auth/invalid-action-code';
}

type ForgotPasswordErrorReason = 'invalid-email' | 'too-many-requests' | 'unavailable' | 'generic';

type ForgotPasswordRequestResult =
  | { status: 'success'; email: string }
  | { status: 'error'; email: string; reason: ForgotPasswordErrorReason };

interface ForgotPasswordActionCodeSettings {
  url: string;
  handleCodeInApp?: boolean;
}

export type PublicAuthActionCodeSettings = ForgotPasswordActionCodeSettings;

interface ForgotPasswordFirebaseModule {
  sendPasswordResetEmail: (
    auth: Auth,
    email: string,
    actionCodeSettings?: ActionCodeSettings,
  ) => Promise<void>;
}

interface ForgotPasswordRequestOptions {
  email: string;
  getAuth: () => Promise<Auth>;
  loadFirebaseAuth: () => Promise<ForgotPasswordFirebaseModule>;
  actionCodeSettings?: ForgotPasswordActionCodeSettings;
}

export function buildResetPasswordActionCodeSettings(
  currentOrigin: string,
): ForgotPasswordActionCodeSettings {
  return {
    url: new URL('/reset-password', currentOrigin).toString(),
    handleCodeInApp: true,
  };
}

export async function requestPasswordResetEmail({
  email,
  getAuth,
  loadFirebaseAuth,
  actionCodeSettings,
}: ForgotPasswordRequestOptions): Promise<ForgotPasswordRequestResult> {
  const normalizedEmail = email.trim();

  try {
    const auth = await getAuth();
    const { sendPasswordResetEmail } = await loadFirebaseAuth();

    await sendPasswordResetEmail(auth, normalizedEmail, actionCodeSettings);

    return { status: 'success', email: normalizedEmail };
  } catch (error) {
    const errorCode = readFirebaseErrorCode(error);

    if (errorCode === 'auth/user-not-found') {
      return { status: 'success', email: normalizedEmail };
    }

    if (isFirebaseConfigError(error)) {
      return { status: 'error', email: normalizedEmail, reason: 'unavailable' };
    }

    if (errorCode === 'auth/invalid-email') {
      return { status: 'error', email: normalizedEmail, reason: 'invalid-email' };
    }

    if (errorCode === 'auth/too-many-requests') {
      return { status: 'error', email: normalizedEmail, reason: 'too-many-requests' };
    }

    return { status: 'error', email: normalizedEmail, reason: 'generic' };
  }
}

export type ResolveResetPasswordActionErrorReason = 'invalid-link' | 'unavailable' | 'validation-failed';

type ResolveResetPasswordActionResult =
  | { status: 'verify-email-success' }
  | { status: 'reset-password-ready'; actionCode: string; resolvedEmail: string }
  | { status: 'unsupported-action'; mode: string | null }
  | { status: 'error'; reason: ResolveResetPasswordActionErrorReason };

interface ParsedActionLink {
  operation: string;
  code: string;
}

interface ResetPasswordFirebaseModule {
  ActionCodeOperation: {
    VERIFY_EMAIL: string;
    PASSWORD_RESET: string;
  };
  ActionCodeURL: {
    parseLink: (href: string) => ParsedActionLink | null;
  };
  applyActionCode: (auth: Auth, code: string) => Promise<void>;
  verifyPasswordResetCode: (auth: Auth, code: string) => Promise<string>;
}

interface ResolveResetPasswordActionOptions {
  href: string;
  search: string;
  getAuth: () => Promise<Auth>;
  loadFirebaseAuth: () => Promise<ResetPasswordFirebaseModule>;
  onVerifyEmailProcessing?: () => void;
}

export async function resolveResetPasswordAction({
  href,
  search,
  getAuth,
  loadFirebaseAuth,
  onVerifyEmailProcessing,
}: ResolveResetPasswordActionOptions): Promise<ResolveResetPasswordActionResult> {
  try {
    const auth = await getAuth();
    const {
      ActionCodeOperation,
      ActionCodeURL,
      applyActionCode,
      verifyPasswordResetCode,
    } = await loadFirebaseAuth();

    const parsedLink = ActionCodeURL.parseLink(href);

    if (!parsedLink) {
      return { status: 'error', reason: 'invalid-link' };
    }

    if (parsedLink.operation === ActionCodeOperation.VERIFY_EMAIL) {
      onVerifyEmailProcessing?.();
      await applyActionCode(auth, parsedLink.code);

      return { status: 'verify-email-success' };
    }

    if (parsedLink.operation === ActionCodeOperation.PASSWORD_RESET) {
      const resolvedEmail = await verifyPasswordResetCode(auth, parsedLink.code);

      return {
        status: 'reset-password-ready',
        actionCode: parsedLink.code,
        resolvedEmail,
      };
    }

    return {
      status: 'unsupported-action',
      mode: new URLSearchParams(search).get('mode'),
    };
  } catch (error) {
    if (isFirebaseConfigError(error)) {
      return { status: 'error', reason: 'unavailable' };
    }

    if (isInvalidActionCodeError(error)) {
      return { status: 'error', reason: 'invalid-link' };
    }

    return { status: 'error', reason: 'validation-failed' };
  }
}
