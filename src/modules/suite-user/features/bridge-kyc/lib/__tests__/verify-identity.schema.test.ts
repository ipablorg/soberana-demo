import { describe, it, expect } from 'vitest';

import {
  DOCUMENT_TYPES,
  addressSchema,
  businessAddressSchema,
  buildVerifyIdentitySchema,
  documentTypeRequiresBack,
  uboSchema,
  verifyIdentitySchema,
} from '../verify-identity.schema';
import { DEFAULT_SOF_QUESTIONNAIRE_FIELDS } from '../sof-defaults';

/**
 * Tests for the verify-identity Zod schema (KYC api method).
 *
 * Validate the composed schema enforces the fields required by
 * `kyc_method: "api"`: a past birth_date, ISO3 country codes, a non-empty
 * front document image, and a back image when the document type requires it.
 */

const validInput = {
  // personal
  birth_date: '1990-01-15',
  nationality: 'COL',
  tax_id: '900123456',
  tax_id_type: 'nit',
  // address
  address_line_1: 'Calle 100 # 11-50',
  city: 'Bogota',
  state: 'Cundinamarca',
  postal_code: '110111',
  country: 'COL',
  // document
  type: 'PASSPORT' as const,
  issuing_country: 'COL',
  number: 'AB123456',
  expiration: '2030-01-01',
  image_front: 'data:image/jpeg;base64,AAAA',
  image_back: undefined,
  source_of_funds: undefined,
  employment_status: undefined,
  account_purpose: undefined,
  expected_monthly_payments_usd: undefined,
  acting_as_intermediary: false,
  most_recent_occupation: undefined,
  selfie: undefined,
  supporting_documents: undefined,
};

describe('verifyIdentitySchema', () => {
  it('accepts a fully valid passport input (no back image required)', () => {
    const result = verifyIdentitySchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('requires expiration for passports', () => {
    const result = verifyIdentitySchema.safeParse({
      ...validInput,
      expiration: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a future birth_date', () => {
    const result = verifyIdentitySchema.safeParse({
      ...validInput,
      birth_date: '2999-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-ISO3 country code', () => {
    const result = verifyIdentitySchema.safeParse({
      ...validInput,
      country: 'CO',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing front image', () => {
    const result = verifyIdentitySchema.safeParse({
      ...validInput,
      image_front: '',
    });
    expect(result.success).toBe(false);
  });

  it('requires a back image for a DNI', () => {
    const result = verifyIdentitySchema.safeParse({
      ...validInput,
      type: 'DNI',
      image_back: undefined,
    });
    expect(result.success).toBe(false);
  });

  it('accepts a DNI when a back image is provided', () => {
    const result = verifyIdentitySchema.safeParse({
      ...validInput,
      type: 'DNI',
      image_back: 'data:image/jpeg;base64,BBBB',
    });
    expect(result.success).toBe(true);
  });

  it('accepts Colombia national IDs without expiration', () => {
    const result = verifyIdentitySchema.safeParse({
      ...validInput,
      type: 'DNI',
      issuing_country: 'COL',
      image_back: 'data:image/jpeg;base64,BBBB',
      expiration: '',
    });

    expect(result.success).toBe(true);
  });

  it('requires a description for an OTHER document type', () => {
    const result = verifyIdentitySchema.safeParse({
      ...validInput,
      type: 'OTHER',
      description: undefined,
    });
    expect(result.success).toBe(false);
  });

  it('accepts an OTHER document type with a description', () => {
    const result = verifyIdentitySchema.safeParse({
      ...validInput,
      type: 'OTHER',
      description: 'Residence permit',
    });
    expect(result.success).toBe(true);
  });

  it('accepts questionnaire fields and supporting documents when remediation requires them', () => {
    const result = verifyIdentitySchema.safeParse({
      ...validInput,
      source_of_funds: 'salary',
      employment_status: 'employed',
      account_purpose: 'receive_salary',
      expected_monthly_payments_usd: '5000_9999',
      acting_as_intermediary: true,
      most_recent_occupation: '113031',
      selfie: 'data:image/jpeg;base64,SELFIE',
      supporting_documents: [
        {
          purpose: 'proof_of_address',
          file: 'data:image/jpeg;base64,DOC',
          description: 'Utility bill',
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});

describe('buildVerifyIdentitySchema', () => {
  it('enforces the five optional questionnaire fields when the full SOF set is required', () => {
    const schema = buildVerifyIdentitySchema(DEFAULT_SOF_QUESTIONNAIRE_FIELDS);
    const result = schema.safeParse(validInput);

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error('Expected full SOF required schema to fail for missing values');
    }

    const issuePaths = result.error.issues.map((issue) => issue.path.join('.'));
    expect(issuePaths).toContain('source_of_funds');
    expect(issuePaths).toContain('employment_status');
    expect(issuePaths).toContain('account_purpose');
    expect(issuePaths).toContain('expected_monthly_payments_usd');
    expect(issuePaths).toContain('most_recent_occupation');
    expect(issuePaths).not.toContain('acting_as_intermediary');
  });

  it('defaults acting_as_intermediary to false without requiring explicit input', () => {
    const schema = buildVerifyIdentitySchema(DEFAULT_SOF_QUESTIONNAIRE_FIELDS);
    const inputWithoutIntermediary = {
      ...validInput,
      source_of_funds: 'salary',
      employment_status: 'employed',
      account_purpose: 'receive_salary',
      expected_monthly_payments_usd: '5000_9999',
      most_recent_occupation: '113031',
    };
    delete (inputWithoutIntermediary as { acting_as_intermediary?: boolean }).acting_as_intermediary;

    const result = schema.safeParse(inputWithoutIntermediary);

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error('Expected parse success when acting_as_intermediary is omitted');
    }

    expect(result.data.acting_as_intermediary).toBe(false);
  });

  it('rejects whitespace-only occupation when that field is required', () => {
    const schema = buildVerifyIdentitySchema(DEFAULT_SOF_QUESTIONNAIRE_FIELDS);
    const result = schema.safeParse({
      ...validInput,
      source_of_funds: 'salary',
      employment_status: 'employed',
      account_purpose: 'receive_salary',
      expected_monthly_payments_usd: '5000_9999',
      most_recent_occupation: '   ',
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error('Expected whitespace occupation to fail validation');
    }

    const occupationIssue = result.error.issues.find((issue) => issue.path.join('.') === 'most_recent_occupation');
    expect(occupationIssue?.message).toBe('Occupation is required');
  });

  it('preserves optional behavior when no questionnaire fields are required', () => {
    const schema = buildVerifyIdentitySchema([]);
    const result = schema.safeParse(validInput);

    expect(result.success).toBe(true);
  });

  it('rejects unsupported free-text occupation values', () => {
    const schema = buildVerifyIdentitySchema(DEFAULT_SOF_QUESTIONNAIRE_FIELDS);
    const result = schema.safeParse({
      ...validInput,
      source_of_funds: 'salary',
      employment_status: 'employed',
      account_purpose: 'receive_salary',
      expected_monthly_payments_usd: '5000_9999',
      most_recent_occupation: 'Finance manager',
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error('Expected free-text occupation to fail enum validation');
    }

    const occupationIssue = result.error.issues.find((issue) => issue.path.join('.') === 'most_recent_occupation');
    expect(occupationIssue).toBeDefined();
  });

  it('accepts backend-safe occupation code values', () => {
    const schema = buildVerifyIdentitySchema(DEFAULT_SOF_QUESTIONNAIRE_FIELDS);
    const result = schema.safeParse({
      ...validInput,
      source_of_funds: 'salary',
      employment_status: 'employed',
      account_purpose: 'receive_salary',
      expected_monthly_payments_usd: '5000_9999',
      most_recent_occupation: '113031',
    });

    expect(result.success).toBe(true);
  });
});

describe('documentTypeRequiresBack', () => {
  it('returns false for a PASSPORT', () => {
    expect(documentTypeRequiresBack('PASSPORT')).toBe(false);
  });

  it('returns true for a DNI', () => {
    expect(documentTypeRequiresBack('DNI')).toBe(true);
  });

  it('returns false for an OTHER document type', () => {
    expect(documentTypeRequiresBack('OTHER')).toBe(false);
  });
});

describe('DOCUMENT_TYPES', () => {
  it('exposes the supported document types', () => {
    expect(DOCUMENT_TYPES).toContain('DNI');
    expect(DOCUMENT_TYPES).toContain('PASSPORT');
    expect(DOCUMENT_TYPES).toContain('OTHER');
  });
});

describe('addressSchema — address fields are all required', () => {
  const validAddress = {
    address_line_1: 'Calle 100 # 11-50',
    city: 'Bogota',
    state: 'DC',
    postal_code: '110111',
    country: 'COL',
  };

  it('accepts a complete address', () => {
    expect(addressSchema.safeParse(validAddress).success).toBe(true);
  });

  it('rejects an empty state', () => {
    const result = addressSchema.safeParse({ ...validAddress, state: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing state', () => {
    const { state: _state, ...withoutState } = validAddress;
    expect(addressSchema.safeParse(withoutState).success).toBe(false);
  });

  it('rejects an empty postal_code', () => {
    const result = addressSchema.safeParse({ ...validAddress, postal_code: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing postal_code', () => {
    const { postal_code: _postal, ...withoutPostal } = validAddress;
    expect(addressSchema.safeParse(withoutPostal).success).toBe(false);
  });
});

describe('businessAddressSchema — address fields are all required', () => {
  const validBusinessAddress = {
    registered_address_line_1: '100 Reg St',
    registered_address_city: 'Bogota',
    registered_address_state: 'DC',
    registered_address_postal_code: '110111',
    registered_address_country: 'COL',
    physical_address_line_1: '200 Phys St',
    physical_address_city: 'Bogota',
    physical_address_state: 'DC',
    physical_address_postal_code: '110111',
    physical_address_country: 'COL',
  };

  it('accepts a complete business address', () => {
    expect(businessAddressSchema.safeParse(validBusinessAddress).success).toBe(true);
  });

  it('rejects an empty registered_address_state', () => {
    const result = businessAddressSchema.safeParse({ ...validBusinessAddress, registered_address_state: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty registered_address_postal_code', () => {
    const result = businessAddressSchema.safeParse({ ...validBusinessAddress, registered_address_postal_code: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty physical_address_state', () => {
    const result = businessAddressSchema.safeParse({ ...validBusinessAddress, physical_address_state: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty physical_address_postal_code', () => {
    const result = businessAddressSchema.safeParse({ ...validBusinessAddress, physical_address_postal_code: '' });
    expect(result.success).toBe(false);
  });
});

describe('uboSchema — residential address fields are all required', () => {
  const validUbo = {
    first_name: 'Owner',
    last_name: 'UBO',
    email: 'ubo@example.com',
    birth_date: '1985-03-20',
    nationality: 'COL',
    residential_address_line_1: '10 Ubo St',
    residential_address_city: 'Bogota',
    residential_address_subdivision: 'DC',
    residential_address_postal_code: '110111',
    residential_address_country: 'COL',
    identifying_document: {
      type: 'PASSPORT' as const,
      issuing_country: 'COL',
      number: 'AB123456',
      expiration: '2030-01-01',
      image_front: 'data:image/jpeg;base64,AAAA',
    },
  };

  it('accepts a complete UBO with subdivision and postal code', () => {
    expect(uboSchema.safeParse(validUbo).success).toBe(true);
  });

  it('rejects an empty residential_address_subdivision', () => {
    const result = uboSchema.safeParse({ ...validUbo, residential_address_subdivision: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty residential_address_postal_code', () => {
    const result = uboSchema.safeParse({ ...validUbo, residential_address_postal_code: '' });
    expect(result.success).toBe(false);
  });
});
