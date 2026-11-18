import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Tests for the post-registration navigation flow.
 *
 * Uses source-level verification (fs.readFileSync) to avoid Lingui macro
 * compilation issues in test context.
 *
 * Validates:
 * 1. Register success renders an email-verification state instead of entering the suite app
 * 2. use-sign-up dispatches verification emails through the existing reset-password route
 * 3. Register uses the minimal auth_signUp contract instead of the old customer-heavy user_register flow
 * 4. DisabledWrapper no longer references bridge-kyc-start
 */

const REGISTER_FORM_PATH = resolve(__dirname, '../components/RegisterForm.tsx');
const SECURITY_STEP_PATH = resolve(__dirname, '../components/register/SecurityStep.tsx');
const USE_SIGN_UP_PATH = resolve(__dirname, '../api/use-sign-up.ts');
const DISABLED_WRAPPER_PATH = resolve(
  __dirname,
  '../../../../shared/components/DisabledWrapper.tsx'
);

const registerFormSource = readFileSync(REGISTER_FORM_PATH, 'utf-8');
const securityStepSource = readFileSync(SECURITY_STEP_PATH, 'utf-8');
const useSignUpSource = readFileSync(USE_SIGN_UP_PATH, 'utf-8');
const disabledWrapperSource = readFileSync(DISABLED_WRAPPER_PATH, 'utf-8');

// ─── RegisterForm navigation ─────────────────────────────────
describe('Register flow — post-registration navigation', () => {
  describe('RegisterForm onSuccess callback', () => {
    it('does NOT navigate to /suite/dashboard on successful registration', () => {
      expect(registerFormSource).not.toContain("navigate('/suite/dashboard')");
    });

    it('shows a verify-email success state after registration', () => {
      expect(registerFormSource).toContain('Verify your email');
      expect(registerFormSource).toContain('Go to sign in');
    });
  });
});

describe('Register flow — verification email dispatch', () => {
  it('reuses the reset-password action code settings for verification emails', () => {
    expect(useSignUpSource).toContain('buildResetPasswordActionCodeSettings');
  });

  it('sends verification emails with Firebase sendEmailVerification', () => {
    expect(useSignUpSource).toContain('sendEmailVerification');
  });

  it('does NOT auto-login through useSignIn after registration', () => {
    expect(useSignUpSource).not.toContain("from './use-sign-in'");
    expect(useSignUpSource).not.toContain('signIn({ email: result.email');
  });
});

// ─── use-sign-up minimal contract integration ─────────────────
describe('Register flow — minimal auth sign-up integration', () => {
  it('uses SignUpDocument instead of UserRegisterDocument', () => {
    expect(useSignUpSource).toContain("import { SignUpDocument } from '@/graphql/mutations/auth'");
    expect(useSignUpSource).not.toContain('UserRegisterDocument');
  });

  it('does NOT import from useBridgeKYC, use-sign-in, or bridge-kyc module', () => {
    expect(useSignUpSource).not.toContain('useBridgeKYC');
    expect(useSignUpSource).not.toContain('bridge-kyc');
    expect(useSignUpSource).not.toContain("from './use-sign-in'");
  });

  it('mutates auth_signUp with signUpInput', () => {
    expect(useSignUpSource).toContain('data.auth_signUp');
    expect(useSignUpSource).toContain('signUpInput: {');
    expect(useSignUpSource).not.toContain('data.user_register');
    expect(useSignUpSource).not.toContain('input: {');
  });

  it('does NOT couple signup to KYC link persistence anymore', () => {
    expect(useSignUpSource).not.toContain('storeKycLink');
    expect(useSignUpSource).not.toContain('kyc_link');
    expect(useSignUpSource).not.toContain('kyc_status');
  });
});

// ─── RegistrationData type stays snake_case where needed ─────
describe('Register flow — RegistrationData interface', () => {
  it('defines auth_uid field (snake_case) in RegistrationData', () => {
    expect(useSignUpSource).toMatch(/auth_uid\??\s*:/);
  });

  it('no longer persists the customer type at sign-up (the KYC wizard owns the selection)', () => {
    expect(useSignUpSource).not.toContain('storeCustomerContext');
    expect(useSignUpSource).not.toContain('customerType');
    expect(useSignUpSource).not.toContain('businessName');
    expect(useSignUpSource).not.toContain('company:');
  });

  it('sends a combined name for the minimal sign-up payload', () => {
    expect(useSignUpSource).toContain("name: `${credentials.firstName} ${credentials.lastName}`.trim()");
  });
});

// ─── No CRM / tracker integration in the register flow ────────
// The GoHighLevel (DentiTool) contact-sync integration was removed. Guard
// against accidental re-introduction: registration must not talk to any CRM.
describe('Register flow — no CRM integration', () => {
  it('RegisterForm does not reference the removed GHL contact sync', () => {
    expect(registerFormSource).not.toContain('notifyGhlRegistration');
    expect(registerFormSource).not.toContain('use-notify-ghl');
    expect(registerFormSource).not.toContain('leadconnectorhq');
  });

  it('signUp payload stays free of CRM hooks', () => {
    expect(useSignUpSource).not.toContain('notifyGhlRegistration');
    expect(useSignUpSource).not.toContain('leadconnectorhq');
  });

  it('RegisterForm does not reference the removed Turnstile widget wiring', () => {
    expect(registerFormSource).not.toContain('turnstile');
    expect(securityStepSource).not.toContain('turnstile');
  });
});

// ─── DisabledWrapper cleanup ─────────────────────────────────
describe('Register flow — no bridge-kyc-start in main flow', () => {
  it('DisabledWrapper does NOT reference bridge-kyc-start', () => {
    expect(disabledWrapperSource).not.toContain('bridge-kyc-start');
  });

  it('DisabledWrapper navigates to /suite/dashboard instead', () => {
    expect(disabledWrapperSource).toContain('/suite/dashboard');
  });
});
