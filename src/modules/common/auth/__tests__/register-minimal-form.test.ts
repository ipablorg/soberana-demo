import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const REGISTER_FORM_PATH = resolve(__dirname, '../components/RegisterForm.tsx');
const PERSONAL_INFO_STEP_PATH = resolve(__dirname, '../components/register/PersonalInfoStep.tsx');
const CONSTANTS_PATH = resolve(__dirname, '../components/register/constants.ts');

const registerFormSource = readFileSync(REGISTER_FORM_PATH, 'utf-8');
const personalInfoStepSource = readFileSync(PERSONAL_INFO_STEP_PATH, 'utf-8');
const constantsSource = readFileSync(CONSTANTS_PATH, 'utf-8');

describe('Register form — minimal initial signup', () => {
  it('does not require phone, country, or identification fields in the initial form state', () => {
    expect(registerFormSource).not.toContain('phoneCode:');
    expect(registerFormSource).not.toContain('phone:');
    expect(registerFormSource).not.toContain('country:');
    expect(registerFormSource).not.toContain('identificationNumber:');
  });

  it('does not send phone, country, or tax identifiers through signUp', () => {
    expect(registerFormSource).not.toContain('phone: `${formData.phoneCode}${formData.phone}`');
    expect(registerFormSource).not.toContain('country: ISO2_TO_ISO3');
    expect(registerFormSource).not.toContain('taxId: formData.identificationNumber');
    expect(registerFormSource).not.toContain('taxIdType:');
  });

  it('keeps customer type and business-name branching', () => {
    expect(personalInfoStepSource).toContain('Account type');
    expect(personalInfoStepSource).toContain("formData.customerType === 'business'");
    expect(personalInfoStepSource).toContain('Business name');
  });

  it('removes phone, country, and ID controls from the personal-info step', () => {
    expect(personalInfoStepSource).not.toContain('reg-phone');
    expect(personalInfoStepSource).not.toContain('reg-country');
    expect(personalInfoStepSource).not.toContain('reg-identificationNumber');
    expect(personalInfoStepSource).not.toContain('REGISTRATION_PHONE_CODE_OPTIONS');
    expect(personalInfoStepSource).not.toContain('REGISTRATION_COUNTRY_SELECT_OPTIONS');
    expect(personalInfoStepSource).not.toContain('COUNTRY_DOC_CONFIG');
  });

  it('shrinks RegisterFormData to only minimal signup fields', () => {
    expect(constantsSource).not.toContain('phoneCode: string;');
    expect(constantsSource).not.toContain('phone: string;');
    expect(constantsSource).not.toContain('country: string;');
    expect(constantsSource).not.toContain('identificationNumber: string;');
  });
});
