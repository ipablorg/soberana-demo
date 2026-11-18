type AuthBypassEnv = {
  DEV?: boolean;
  PROD?: boolean;
  VITE_DISABLE_MFA_ENFORCEMENT?: string;
  VITE_STAFF_MFA_OPTIONAL?: string;
  VITE_DISABLE_EMAIL_VERIFICATION_ENFORCEMENT?: string;
};

export type SignInEnforcementDecision =
  | 'allow-login'
  | 'require-email-verification'
  | 'require-mfa-enrollment';

const readEnv = (env?: AuthBypassEnv): AuthBypassEnv => env ?? (import.meta.env as AuthBypassEnv);

const isLocalDevBypassEnabled = (value: string | undefined, env?: AuthBypassEnv): boolean => {
  const resolvedEnv = readEnv(env);
  if (resolvedEnv.PROD || !resolvedEnv.DEV) return false;
  return value === 'true';
};

/**
 * Staff may use the backoffice without an enrolled second factor, with a
 * standing alert instead of a blocking screen. Unlike the local-dev bypass this
 * is a build-time deployment choice and works in production builds; the backend
 * (STAFF_MFA_ENFORCEMENT) must be set to the same value or its guard answers
 * 403 MFA_REQUIRED.
 */
export const isStaffMfaOptional = (env?: AuthBypassEnv): boolean =>
  readEnv(env).VITE_STAFF_MFA_OPTIONAL === 'true';

export const isLocalMfaEnforcementDisabled = (env?: AuthBypassEnv): boolean => {
  const resolvedEnv = readEnv(env);
  return isLocalDevBypassEnabled(resolvedEnv.VITE_DISABLE_MFA_ENFORCEMENT, resolvedEnv);
};

export const isLocalEmailVerificationEnforcementDisabled = (env?: AuthBypassEnv): boolean => {
  const resolvedEnv = readEnv(env);
  return isLocalDevBypassEnabled(resolvedEnv.VITE_DISABLE_EMAIL_VERIFICATION_ENFORCEMENT, resolvedEnv);
};

export const resolveSignInEnforcementDecision = ({
  hasEnrolledFactors,
  isEmailVerified,
  isStaff = false,
  env,
}: {
  hasEnrolledFactors: boolean;
  isEmailVerified: boolean;
  isStaff?: boolean;
  env?: AuthBypassEnv;
}): SignInEnforcementDecision => {
  if (hasEnrolledFactors) {
    return 'allow-login';
  }

  if (!isEmailVerified && !isLocalEmailVerificationEnforcementDisabled(env)) {
    return 'require-email-verification';
  }

  if (isLocalMfaEnforcementDisabled(env)) {
    return 'allow-login';
  }

  // Staff without a second factor must enroll TOTP at login. The backoffice
  // hard-gates on MFA (MfaEnrollmentGuard), so letting staff through without
  // enrollment just bounces them off /backoffice/* after login.
  if (isStaff) {
    return isStaffMfaOptional(env) ? 'allow-login' : 'require-mfa-enrollment';
  }

  // TOTP enrollment is optional for non-staff users — never block login to
  // force it. They can enroll later from Settings or via a post-login prompt.
  return 'allow-login';
};
