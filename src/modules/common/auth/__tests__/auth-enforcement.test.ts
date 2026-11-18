import { describe, expect, it } from 'vitest';
import {
  isLocalEmailVerificationEnforcementDisabled,
  isLocalMfaEnforcementDisabled,
  isStaffMfaOptional,
  resolveSignInEnforcementDecision,
} from '../api/auth-enforcement';

describe('auth-enforcement', () => {
  it('ignores bypass flags outside local dev', () => {
    expect(
      isLocalMfaEnforcementDisabled({
        DEV: false,
        PROD: true,
        VITE_DISABLE_MFA_ENFORCEMENT: 'true',
      }),
    ).toBe(false);

    expect(
      isLocalEmailVerificationEnforcementDisabled({
        DEV: false,
        PROD: true,
        VITE_DISABLE_EMAIL_VERIFICATION_ENFORCEMENT: 'true',
      }),
    ).toBe(false);
  });

  it('requires email verification for unverified users with no bypass', () => {
    expect(
      resolveSignInEnforcementDecision({
        hasEnrolledFactors: false,
        isEmailVerified: false,
        env: { DEV: true, PROD: false },
      }),
    ).toBe('require-email-verification');
  });

  it('allows login for verified users without factors (MFA enrollment is optional)', () => {
    expect(
      resolveSignInEnforcementDecision({
        hasEnrolledFactors: false,
        isEmailVerified: true,
        env: { DEV: true, PROD: false },
      }),
    ).toBe('allow-login');
  });

  it('requires MFA enrollment at login for staff without factors', () => {
    expect(
      resolveSignInEnforcementDecision({
        hasEnrolledFactors: false,
        isEmailVerified: true,
        isStaff: true,
        env: { DEV: true, PROD: false },
      }),
    ).toBe('require-mfa-enrollment');
  });

  it('allows staff login without factors when the local MFA bypass is enabled', () => {
    expect(
      resolveSignInEnforcementDecision({
        hasEnrolledFactors: false,
        isEmailVerified: true,
        isStaff: true,
        env: {
          DEV: true,
          PROD: false,
          VITE_DISABLE_MFA_ENFORCEMENT: 'true',
        },
      }),
    ).toBe('allow-login');
  });

  it('allows staff login when a factor is already enrolled', () => {
    expect(
      resolveSignInEnforcementDecision({
        hasEnrolledFactors: true,
        isEmailVerified: true,
        isStaff: true,
        env: { DEV: true, PROD: false },
      }),
    ).toBe('allow-login');
  });

  it('allows login when local MFA bypass is enabled', () => {
    expect(
      resolveSignInEnforcementDecision({
        hasEnrolledFactors: false,
        isEmailVerified: true,
        env: {
          DEV: true,
          PROD: false,
          VITE_DISABLE_MFA_ENFORCEMENT: 'true',
        },
      }),
    ).toBe('allow-login');
  });

  it('allows login for unverified users when local email verification bypass is enabled', () => {
    expect(
      resolveSignInEnforcementDecision({
        hasEnrolledFactors: false,
        isEmailVerified: false,
        env: {
          DEV: true,
          PROD: false,
          VITE_DISABLE_EMAIL_VERIFICATION_ENFORCEMENT: 'true',
        },
      }),
    ).toBe('allow-login');
  });

  describe('staff MFA optional mode', () => {
    const prod = { DEV: false, PROD: true } as const;

    it('is off unless the build variable is exactly "true"', () => {
      expect(isStaffMfaOptional({ ...prod })).toBe(false);
      expect(isStaffMfaOptional({ ...prod, VITE_STAFF_MFA_OPTIONAL: 'false' })).toBe(false);
      expect(isStaffMfaOptional({ ...prod, VITE_STAFF_MFA_OPTIONAL: 'TRUE' })).toBe(false);
      expect(isStaffMfaOptional({ ...prod, VITE_STAFF_MFA_OPTIONAL: 'true' })).toBe(true);
    });

    it('still forces staff without a factor to enrol by default', () => {
      expect(
        resolveSignInEnforcementDecision({
          hasEnrolledFactors: false,
          isEmailVerified: true,
          isStaff: true,
          env: { ...prod },
        }),
      ).toBe('require-mfa-enrollment');
    });

    it('lets staff without a factor in when the deployment makes it optional', () => {
      expect(
        resolveSignInEnforcementDecision({
          hasEnrolledFactors: false,
          isEmailVerified: true,
          isStaff: true,
          env: { ...prod, VITE_STAFF_MFA_OPTIONAL: 'true' },
        }),
      ).toBe('allow-login');
    });

    it('does not relax email verification', () => {
      expect(
        resolveSignInEnforcementDecision({
          hasEnrolledFactors: false,
          isEmailVerified: false,
          isStaff: true,
          env: { ...prod, VITE_STAFF_MFA_OPTIONAL: 'true' },
        }),
      ).toBe('require-email-verification');
    });
  });
});
