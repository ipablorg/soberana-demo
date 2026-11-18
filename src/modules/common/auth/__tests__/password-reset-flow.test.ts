import { describe, expect, it, vi } from 'vitest';
import {
  buildResetPasswordActionCodeSettings,
  requestPasswordResetEmail,
  resolveResetPasswordAction,
} from '../pages/firebase-public-auth-flow';

describe('Public auth password reset flow', () => {
  describe('buildResetPasswordActionCodeSettings', () => {
    it('binds Firebase reset emails to the app reset-password route', () => {
      expect(buildResetPasswordActionCodeSettings('https://app.loopay.com')).toEqual({
        url: 'https://app.loopay.com/reset-password',
        handleCodeInApp: true,
      });
    });
  });

  describe('requestPasswordResetEmail', () => {
    it('returns success when Firebase sends the reset email', async () => {
      const auth = { kind: 'firebase-auth' };
      const getAuth = vi.fn().mockResolvedValue(auth);
      const sendPasswordResetEmail = vi.fn().mockResolvedValue(undefined);
      const loadFirebaseAuth = vi.fn().mockResolvedValue({ sendPasswordResetEmail });
      const actionCodeSettings = {
        url: 'https://app.loopay.com/reset-password',
        handleCodeInApp: true,
      };

      const result = await requestPasswordResetEmail({
        email: '  user@example.com  ',
        getAuth,
        loadFirebaseAuth,
        actionCodeSettings,
      });

      expect(result).toEqual({ status: 'success', email: 'user@example.com' });
      expect(getAuth).toHaveBeenCalledOnce();
      expect(loadFirebaseAuth).toHaveBeenCalledOnce();
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        auth,
        'user@example.com',
        actionCodeSettings,
      );
    });

    it('still returns success when Firebase reports user-not-found', async () => {
      const auth = { kind: 'firebase-auth' };
      const getAuth = vi.fn().mockResolvedValue(auth);
      const sendPasswordResetEmail = vi.fn().mockRejectedValue({ code: 'auth/user-not-found' });
      const loadFirebaseAuth = vi.fn().mockResolvedValue({ sendPasswordResetEmail });
      const actionCodeSettings = {
        url: 'https://app.loopay.com/reset-password',
        handleCodeInApp: true,
      };

      const result = await requestPasswordResetEmail({
        email: 'missing@example.com',
        getAuth,
        loadFirebaseAuth,
        actionCodeSettings,
      });

      expect(result).toEqual({ status: 'success', email: 'missing@example.com' });
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        auth,
        'missing@example.com',
        actionCodeSettings,
      );
    });
  });

  describe('resolveResetPasswordAction', () => {
    it('applies verify-email action links', async () => {
      const auth = { kind: 'firebase-auth' };
      const getAuth = vi.fn().mockResolvedValue(auth);
      const onVerifyEmailProcessing = vi.fn();
      const parseLink = vi.fn().mockReturnValue({ operation: 'VERIFY_EMAIL', code: 'verify-code' });
      const applyActionCode = vi.fn().mockResolvedValue(undefined);
      const verifyPasswordResetCode = vi.fn();
      const loadFirebaseAuth = vi.fn().mockResolvedValue({
        ActionCodeOperation: {
          VERIFY_EMAIL: 'VERIFY_EMAIL',
          PASSWORD_RESET: 'PASSWORD_RESET',
        },
        ActionCodeURL: { parseLink },
        applyActionCode,
        verifyPasswordResetCode,
      });

      const result = await resolveResetPasswordAction({
        href: 'https://app.loopay.com/reset-password?mode=verifyEmail&oobCode=verify-code',
        search: '?mode=verifyEmail&oobCode=verify-code',
        getAuth,
        loadFirebaseAuth,
        onVerifyEmailProcessing,
      });

      expect(result).toEqual({ status: 'verify-email-success' });
      expect(parseLink).toHaveBeenCalledWith(
        'https://app.loopay.com/reset-password?mode=verifyEmail&oobCode=verify-code'
      );
      expect(onVerifyEmailProcessing).toHaveBeenCalledOnce();
      expect(applyActionCode).toHaveBeenCalledWith(auth, 'verify-code');
      expect(verifyPasswordResetCode).not.toHaveBeenCalled();
    });

    it('resolves password reset links with the action code and email', async () => {
      const auth = { kind: 'firebase-auth' };
      const getAuth = vi.fn().mockResolvedValue(auth);
      const parseLink = vi.fn().mockReturnValue({ operation: 'PASSWORD_RESET', code: 'reset-code' });
      const applyActionCode = vi.fn();
      const verifyPasswordResetCode = vi.fn().mockResolvedValue('user@example.com');
      const loadFirebaseAuth = vi.fn().mockResolvedValue({
        ActionCodeOperation: {
          VERIFY_EMAIL: 'VERIFY_EMAIL',
          PASSWORD_RESET: 'PASSWORD_RESET',
        },
        ActionCodeURL: { parseLink },
        applyActionCode,
        verifyPasswordResetCode,
      });

      const result = await resolveResetPasswordAction({
        href: 'https://app.loopay.com/reset-password?mode=resetPassword&oobCode=reset-code',
        search: '?mode=resetPassword&oobCode=reset-code',
        getAuth,
        loadFirebaseAuth,
      });

      expect(result).toEqual({
        status: 'reset-password-ready',
        actionCode: 'reset-code',
        resolvedEmail: 'user@example.com',
      });
      expect(verifyPasswordResetCode).toHaveBeenCalledWith(auth, 'reset-code');
      expect(applyActionCode).not.toHaveBeenCalled();
    });

    it('returns a safe unsupported-action fallback for other Firebase modes', async () => {
      const auth = { kind: 'firebase-auth' };
      const getAuth = vi.fn().mockResolvedValue(auth);
      const parseLink = vi.fn().mockReturnValue({ operation: 'RECOVER_EMAIL', code: 'recover-code' });
      const applyActionCode = vi.fn();
      const verifyPasswordResetCode = vi.fn();
      const loadFirebaseAuth = vi.fn().mockResolvedValue({
        ActionCodeOperation: {
          VERIFY_EMAIL: 'VERIFY_EMAIL',
          PASSWORD_RESET: 'PASSWORD_RESET',
        },
        ActionCodeURL: { parseLink },
        applyActionCode,
        verifyPasswordResetCode,
      });

      const result = await resolveResetPasswordAction({
        href: 'https://app.loopay.com/reset-password?mode=recoverEmail&oobCode=recover-code',
        search: '?mode=recoverEmail&oobCode=recover-code',
        getAuth,
        loadFirebaseAuth,
      });

      expect(result).toEqual({ status: 'unsupported-action', mode: 'recoverEmail' });
      expect(applyActionCode).not.toHaveBeenCalled();
      expect(verifyPasswordResetCode).not.toHaveBeenCalled();
    });
  });
});
