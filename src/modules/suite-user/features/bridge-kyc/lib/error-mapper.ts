import type { VerifyIdentityValues } from './verify-identity.schema';

export interface FieldError {
  field: keyof VerifyIdentityValues | 'general';
  messageKey: string;
  params?: Record<string, string>;
}

const BRIDGE_TO_FORM_FIELD: Record<string, keyof VerifyIdentityValues> = {
  'birth_date': 'birth_date',
  'nationality': 'nationality',
  'tax_id': 'tax_id',
  'tax_id_type': 'tax_id_type',
  'residential_address.street_line_1': 'address_line_1',
  'residential_address.city': 'city',
  'residential_address.subdivision': 'state',
  'residential_address.postal_code': 'postal_code',
  'residential_address.country': 'country',
  'identifying_information.0.type': 'type',
  'identifying_information.0.issuing_country': 'issuing_country',
  'identifying_information.0.number': 'number',
  'identifying_information.0.expiration': 'expiration',
  'place_of_birth.country': 'place_of_birth_country',
  'place_of_birth.city': 'place_of_birth_city',
};

const ERROR_TRANSLATION_MAP: Record<string, string> = {
  'invalid document type': 'kyc_document_invalid_type',
  'invalid document number': 'kyc_document_invalid_number',
  'document expired': 'kyc_document_expired',
  'invalid issuing country': 'kyc_document_invalid_country',
  'image front required': 'kyc_document_image_front_required',
  'image back required': 'kyc_document_image_back_required',
  'invalid postal code': 'kyc_address_invalid_postal_code',
  'invalid city': 'kyc_address_invalid_city',
  'invalid state': 'kyc_address_invalid_state',
  'invalid country': 'kyc_address_invalid_country',
  'street address required': 'kyc_address_street_required',
  'invalid birth date': 'kyc_personal_invalid_birth_date',
  'invalid nationality': 'kyc_personal_invalid_nationality',
  'invalid tax id': 'kyc_personal_invalid_tax_id',
  'invalid tax id type': 'kyc_personal_invalid_tax_id_type',
  'invalid email': 'kyc_personal_invalid_email',
  'missing required field': 'kyc_general_missing_required',
  'invalid parameters': 'kyc_general_invalid_parameters',
};

const FIELD_GENERIC_ERROR_MAP: Partial<Record<keyof VerifyIdentityValues, string>> = {
  birth_date: 'kyc_birth_date_invalid',
  tax_id: 'kyc_tax_id_invalid',
  tax_id_type: 'kyc_tax_id_type_invalid',
  address_line_1: 'kyc_address_line_1_invalid',
  city: 'kyc_city_invalid',
  state: 'kyc_state_invalid',
  postal_code: 'kyc_postal_code_invalid',
  country: 'kyc_country_invalid',
  type: 'kyc_type_invalid',
  issuing_country: 'kyc_issuing_country_invalid',
  number: 'kyc_number_invalid',
  expiration: 'kyc_expiration_invalid',
  place_of_birth_country: 'kyc_place_of_birth_country_invalid',
  place_of_birth_city: 'kyc_place_of_birth_city_invalid',
};

function extractErrorDetails(error: unknown): Record<string, string> | null {
  const err = error as Record<string, unknown>;

  const pattern1 = (err?.response as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
  if (pattern1?.details && typeof pattern1.details === 'object') {
    return pattern1.details as Record<string, string>;
  }

  // AllExceptionsFilter puts details in extensions.* directly (extraFields)
  const extFields = ((err?.response as Record<string, unknown>)?.errors as Array<Record<string, unknown>>)?.[0]
    ?.extensions as Record<string, unknown> | undefined;
  if (extFields?.details && typeof extFields.details === 'object') {
    return extFields.details as Record<string, string>;
  }

  const pattern2 = ((err?.response as Record<string, unknown>)?.errors as Array<Record<string, unknown>>)?.[0]
    ?.extensions as Record<string, unknown> | undefined;
  if (pattern2?.originalError && typeof pattern2.originalError === 'object') {
    const originalError = pattern2.originalError as Record<string, unknown>;
    if (originalError.details && typeof originalError.details === 'object') {
      return originalError.details as Record<string, string>;
    }
  }

  const pattern3 = ((err?.response as Record<string, unknown>)?.errors as Array<Record<string, unknown>>)?.[0]
    ?.extensions as Record<string, unknown> | undefined;
  if (pattern3?.exception && typeof pattern3.exception === 'object') {
    const exception = pattern3.exception as Record<string, unknown>;
    const response = exception.response as Record<string, unknown> | undefined;
    if (response?.details && typeof response.details === 'object') {
      return response.details as Record<string, string>;
    }
  }

  if (err?.details && typeof err.details === 'object') {
    return err.details as Record<string, string>;
  }

  const pattern5 = (err?.graphQLErrors as Array<Record<string, unknown>>)?.[0]
    ?.extensions as Record<string, unknown> | undefined;
  if (pattern5?.originalError && typeof pattern5.originalError === 'object') {
    const gqlOriginalError = pattern5.originalError as Record<string, unknown>;
    if (gqlOriginalError.details && typeof gqlOriginalError.details === 'object') {
      return gqlOriginalError.details as Record<string, string>;
    }
  }

  const pattern6 = ((err?.response as Record<string, unknown>)?.data as Record<string, unknown>)
    ?.errors as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(pattern6) && pattern6.length > 0) {
    const message = pattern6[0]?.message;
    if (typeof message === 'string') {
      return { general: message };
    }
  }

  return null;
}

export function mapBridgeErrorToFieldErrors(error: unknown): FieldError[] {
  const errors: FieldError[] = [];

  try {
    const details = extractErrorDetails(error);

    if (!details || Object.keys(details).length === 0) {
      errors.push({
        field: 'general',
        messageKey: 'kyc_general_unknown',
      });
      return errors;
    }

    Object.entries(details).forEach(([bridgeField, message]) => {
      const messageLower = String(message).toLowerCase();

      let messageKey = ERROR_TRANSLATION_MAP[messageLower];

      if (!messageKey) {
        const formField = BRIDGE_TO_FORM_FIELD[bridgeField];
        if (formField) {
          messageKey = FIELD_GENERIC_ERROR_MAP[formField] || 'kyc_general_unknown';
        } else {
          messageKey = 'kyc_general_unknown';
        }
      }

      const formField = BRIDGE_TO_FORM_FIELD[bridgeField];
      if (formField) {
        errors.push({
          field: formField,
          messageKey,
          params: { message: String(message) },
        });
      } else {
        errors.push({
          field: 'general',
          messageKey,
          params: { field: bridgeField, message: String(message) },
        });
      }
    });
  } catch {
    console.error('[error-mapper] Failed to parse error');
    errors.push({
      field: 'general',
      messageKey: 'kyc_general_unknown',
    });
  }

  return errors;
}

export function getErrorsForField(
  errors: FieldError[],
  fieldName: keyof VerifyIdentityValues,
): FieldError[] {
  return errors.filter(e => e.field === fieldName);
}

export function getFirstErrorForField(
  errors: FieldError[],
  fieldName: keyof VerifyIdentityValues,
): FieldError | undefined {
  return getErrorsForField(errors, fieldName)[0];
}
