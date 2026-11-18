/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import {
  mapBridgeErrorToFieldErrors,
  getErrorsForField,
  getFirstErrorForField,
} from '../error-mapper';

describe('error-mapper', () => {
  describe('mapBridgeErrorToFieldErrors', () => {
    it('should map pattern 1: err.response.data.details', () => {
      const error = {
        response: {
          data: {
            details: {
              birth_date: 'Invalid birth date',
              nationality: 'Invalid nationality',
            },
          },
        },
      };

      const errors = mapBridgeErrorToFieldErrors(error);

      expect(errors).toHaveLength(2);
      expect(errors[0].field).toBe('birth_date');
      expect(errors[0].messageKey).toBe('kyc_personal_invalid_birth_date');
      expect(errors[1].field).toBe('nationality');
      expect(errors[1].messageKey).toBe('kyc_personal_invalid_nationality');
    });

    it('should map pattern 2: err.response.errors[0].extensions.originalError.details', () => {
      const error = {
        response: {
          errors: [
            {
              extensions: {
                originalError: {
                  details: {
                    tax_id: 'Invalid tax ID',
                  },
                },
              },
            },
          ],
        },
      };

      const errors = mapBridgeErrorToFieldErrors(error);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('tax_id');
      expect(errors[0].messageKey).toBe('kyc_personal_invalid_tax_id');
    });

    it('should map pattern 3: err.response.errors[0].extensions.exception.response.details', () => {
      const error = {
        response: {
          errors: [
            {
              extensions: {
                exception: {
                  response: {
                    details: {
                      'residential_address.street_line_1': 'Invalid address',
                    },
                  },
                },
              },
            },
          ],
        },
      };

      const errors = mapBridgeErrorToFieldErrors(error);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('address_line_1');
      expect(errors[0].messageKey).toBe('kyc_address_line_1_invalid');
    });

    it('should map pattern 4: err.details directly', () => {
      const error = {
        details: {
          'identifying_information.0.number': 'Invalid document number',
        },
      };

      const errors = mapBridgeErrorToFieldErrors(error);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('number');
      expect(errors[0].messageKey).toBe('kyc_document_invalid_number');
    });

    it('should map pattern 5: err.graphQLErrors[0].extensions.originalError.details', () => {
      const error = {
        graphQLErrors: [
          {
            extensions: {
              originalError: {
                details: {
                  'residential_address.city': 'Invalid city',
                },
              },
            },
          },
        ],
      };

      const errors = mapBridgeErrorToFieldErrors(error);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('city');
      expect(errors[0].messageKey).toBe('kyc_address_invalid_city');
    });

    it('should map pattern 6: err.response.data.errors[0].message (string)', () => {
      const error = {
        response: {
          data: {
            errors: [
              {
                message: 'Invalid parameters',
              },
            ],
          },
        },
      };

      const errors = mapBridgeErrorToFieldErrors(error);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('general');
      expect(errors[0].messageKey).toBe('kyc_general_invalid_parameters');
    });

    it('should return generic error when no details found', () => {
      const error = {
        response: {
          data: {},
        },
      };

      const errors = mapBridgeErrorToFieldErrors(error);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('general');
      expect(errors[0].messageKey).toBe('kyc_general_unknown');
    });

    it('should handle unknown Bridge fields as general errors', () => {
      const error = {
        response: {
          data: {
            details: {
              unknown_field: 'Some error',
            },
          },
        },
      };

      const errors = mapBridgeErrorToFieldErrors(error);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('general');
      expect(errors[0].messageKey).toBe('kyc_general_unknown');
      expect(errors[0].params?.field).toBe('unknown_field');
    });

    it('should map nested Bridge fields correctly', () => {
      const error = {
        response: {
          data: {
            details: {
              'residential_address.street_line_1': 'Invalid address',
              'identifying_information.0.number': 'Invalid number',
            },
          },
        },
      };

      const errors = mapBridgeErrorToFieldErrors(error);

      expect(errors).toHaveLength(2);
      expect(errors[0].field).toBe('address_line_1');
      expect(errors[1].field).toBe('number');
    });

    it('should be resilient to malformed errors', () => {
      const errors1 = mapBridgeErrorToFieldErrors(null);
      expect(errors1).toHaveLength(1);
      expect(errors1[0].messageKey).toBe('kyc_general_unknown');

      const errors2 = mapBridgeErrorToFieldErrors(undefined);
      expect(errors2).toHaveLength(1);
      expect(errors2[0].messageKey).toBe('kyc_general_unknown');

      const errors3 = mapBridgeErrorToFieldErrors('string error');
      expect(errors3).toHaveLength(1);
      expect(errors3[0].messageKey).toBe('kyc_general_unknown');
    });

    it('should map specific error messages to translation keys', () => {
      const errorMessages = [
        { message: 'invalid document type', expectedKey: 'kyc_document_invalid_type' },
        { message: 'invalid document number', expectedKey: 'kyc_document_invalid_number' },
        { message: 'document expired', expectedKey: 'kyc_document_expired' },
        { message: 'invalid postal code', expectedKey: 'kyc_address_invalid_postal_code' },
        { message: 'invalid birth date', expectedKey: 'kyc_personal_invalid_birth_date' },
        { message: 'missing required field', expectedKey: 'kyc_general_missing_required' },
      ];

      for (const { message, expectedKey } of errorMessages) {
        const error = {
          response: {
            data: {
              details: { some_field: message },
            },
          },
        };

        const errors = mapBridgeErrorToFieldErrors(error);
        expect(errors[0].messageKey).toBe(expectedKey);
      }
    });
  });

  describe('getErrorsForField', () => {
    it('should return all errors for a field', () => {
      const errors = [
        { field: 'birth_date' as const, messageKey: 'error1' },
        { field: 'birth_date' as const, messageKey: 'error2' },
        { field: 'tax_id' as const, messageKey: 'error3' },
      ];

      const birthDateErrors = getErrorsForField(errors, 'birth_date');

      expect(birthDateErrors).toHaveLength(2);
      expect(birthDateErrors[0].messageKey).toBe('error1');
      expect(birthDateErrors[1].messageKey).toBe('error2');
    });

    it('should return empty array when field has no errors', () => {
      const errors = [
        { field: 'tax_id' as const, messageKey: 'error1' },
      ];

      const birthDateErrors = getErrorsForField(errors, 'birth_date');

      expect(birthDateErrors).toHaveLength(0);
    });
  });

  describe('getFirstErrorForField', () => {
    it('should return only first error for a field', () => {
      const errors = [
        { field: 'birth_date' as const, messageKey: 'error1' },
        { field: 'birth_date' as const, messageKey: 'error2' },
      ];

      const firstError = getFirstErrorForField(errors, 'birth_date');

      expect(firstError?.messageKey).toBe('error1');
    });

    it('should return undefined when field has no errors', () => {
      const errors = [
        { field: 'tax_id' as const, messageKey: 'error1' },
      ];

      const firstError = getFirstErrorForField(errors, 'birth_date');

      expect(firstError).toBeUndefined();
    });
  });
});
