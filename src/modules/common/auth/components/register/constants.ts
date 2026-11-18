import {
  COUNTRY_SELECT_VALUES,
  ISO2_TO_ISO3,
  REGISTRATION_COUNTRY_SELECT_OPTIONS,
  REGISTRATION_COUNTRY_OPTIONS,
  REGISTRATION_PHONE_CODE_OPTIONS,
  REGISTRATION_UNSUPPORTED_COUNTRY_OPTIONS,
  getRegistrationDocumentConfig,
} from '@/shared/lib/kyc/static-catalog';

const registrationCountryOptions = REGISTRATION_COUNTRY_OPTIONS as Array<{
  iso2: string;
  registrationDocument: { docType: string; placeholder: string; label: string };
}>;

export const COUNTRY_DOC_CONFIG = Object.fromEntries(
  registrationCountryOptions.map((entry) => [entry.iso2, entry.registrationDocument]),
) as Record<string, { docType: string; placeholder: string; label: string }>;

export {
  getRegistrationDocumentConfig,
  COUNTRY_SELECT_VALUES,
  ISO2_TO_ISO3,
  REGISTRATION_COUNTRY_SELECT_OPTIONS,
  REGISTRATION_PHONE_CODE_OPTIONS,
  REGISTRATION_UNSUPPORTED_COUNTRY_OPTIONS,
};

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface PasswordValidation {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}
