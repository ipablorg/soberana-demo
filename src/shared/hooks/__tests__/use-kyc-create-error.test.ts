import { describe, expect, it } from 'vitest';
import { isDuplicateTaxIdError, mapCreateCustomerError } from '../use-kyc-create-error';

const taxIdMessage =
  'This tax ID is already registered. Please use a different tax ID or log in to your existing account.';

function graphQlError(message: string) {
  return Object.assign(new Error(message), {
    response: { errors: [{ message }] },
  });
}

describe('mapCreateCustomerError', () => {
  it('names the tax id instead of claiming the email already exists', () => {
    const message = mapCreateCustomerError(graphQlError(taxIdMessage));

    expect(message).toContain('ID fiscal');
    expect(message).not.toContain('email');
  });

  it('keeps the existing email message for a duplicate email', () => {
    const message = mapCreateCustomerError(
      graphQlError(
        'This email is already registered. Please log in with your existing account to continue.'
      )
    );

    expect(message).toContain('email');
  });
});

describe('isDuplicateTaxIdError', () => {
  it('detects the backend tax id duplicate', () => {
    expect(isDuplicateTaxIdError(graphQlError(taxIdMessage))).toBe(true);
  });

  it('ignores the email duplicate and unrelated errors', () => {
    expect(isDuplicateTaxIdError(graphQlError('This email is already registered.'))).toBe(false);
    expect(isDuplicateTaxIdError(new Error('Network down'))).toBe(false);
    expect(isDuplicateTaxIdError(null)).toBe(false);
  });
});
