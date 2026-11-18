import { describe, expect, it } from 'vitest';

import { getBeneficiaryRenderingModel } from '../beneficiary-rendering';
import type { BeneficiaryResponse } from '@/shared/lib/beneficiaries-api';

function makeBeneficiary(
  overrides: Partial<BeneficiaryResponse> = {},
): BeneficiaryResponse {
  return {
    id: 'beneficiary-1',
    customer_id: 'customer-1',
    beneficiary_name: 'Ana Gómez',
    tax_id: '123456789',
    country: 'COL',
    payment_rail: null,
    relationship: 'SELF',
    holder_type: 'INDIVIDUAL',
    currency: 'COP',
    verification_status: 'VERIFIED',
    masked_account_number: null,
    bank_name: null,
    bank_code: null,
    account_number: null,
    routing_number: null,
    iban: null,
    clabe: null,
    pix_key: null,
    bic: null,
    alias: null,
    is_favorite: false,
    created_at: '2026-07-09T00:00:00.000Z',
    updated_at: '2026-07-09T00:00:00.000Z',
    rail: null,
    bank_details: null,
    ...overrides,
  };
}

describe('beneficiary rendering model', () => {
  it('renders co_breb beneficiaries from supported output fields', () => {
    const rendering = getBeneficiaryRenderingModel(
      makeBeneficiary({
        payment_rail: 'co_breb',
        bank_details: { breb_key: 'ana@example.com' },
      }),
    );

    expect(rendering.isBrebKey).toBe(true);
    expect(rendering.railCode).toBe('co_breb');
    expect(rendering.brebKey).toBe('ana@example.com');
    expect(rendering.accountPreview).toBe('ana@example.com');
    expect(rendering.showAccountDetails).toBe(false);
    expect(rendering.additionalBankDetails).toEqual([]);
  });

  it('keeps co_breb rendering stable when the Bre-B key is missing', () => {
    const rendering = getBeneficiaryRenderingModel(
      makeBeneficiary({
        rail: {
          id: 'rail-1',
          code: 'co_breb',
          name: 'Bre-B',
          currency: 'COP',
          country: 'COL',
        },
        bank_details: {},
      }),
    );

    expect(rendering.isBrebKey).toBe(true);
    expect(rendering.brebKey).toBeNull();
    expect(rendering.accountPreview).toBe('—');
    expect(rendering.showAccountDetails).toBe(false);
  });

  it('does not show bank-account-only detail fields for co_breb beneficiaries', () => {
    const rendering = getBeneficiaryRenderingModel(
      makeBeneficiary({
        payment_rail: 'co_breb',
        account_number: '1234567890',
        routing_number: '001',
        bank_details: {
          breb_key: 'ana@example.com',
          provider_reference: 'ref-1',
        },
      }),
    );

    expect(rendering.showAccountDetails).toBe(false);
    expect(rendering.additionalBankDetails).toEqual([
      ['provider_reference', 'ref-1'],
    ]);
  });

  it('preserves bank account previews for existing non-Bre-B rails', () => {
    const rendering = getBeneficiaryRenderingModel(
      makeBeneficiary({
        payment_rail: 'ach_wire',
        account_number: '1234567890',
        bank_name: 'Example Bank',
      }),
    );

    expect(rendering.isBrebKey).toBe(false);
    expect(rendering.accountPreview).toBe('****7890');
    expect(rendering.showAccountDetails).toBe(true);
  });

  it('preserves PIX previews for existing rails', () => {
    const rendering = getBeneficiaryRenderingModel(
      makeBeneficiary({
        payment_rail: 'pix',
        pix_key: 'ana@example.com',
      }),
    );

    expect(rendering.isBrebKey).toBe(false);
    expect(rendering.showAccountDetails).toBe(true);
  });
});
