import { describe, expect, it } from 'vitest';

import {
  getBeneficiaryBrebKey,
  getBeneficiaryRailCode,
  isBrebKeyBeneficiary,
  type BeneficiaryOutputRailSource,
} from '../beneficiaries-api';

describe('beneficiary output contract helpers', () => {
  it('uses rail.code before payment_rail when identifying the output rail', () => {
    expect(
      getBeneficiaryRailCode({
        rail: { code: 'co_breb' },
        payment_rail: 'ec_bank_transfer',
        bank_details: null,
      }),
    ).toBe('co_breb');
  });

  it('falls back to payment_rail when rail metadata is absent', () => {
    expect(
      getBeneficiaryRailCode({
        rail: null,
        payment_rail: 'co_breb',
        bank_details: null,
      }),
    ).toBe('co_breb');
  });

  it('reads Bre-B key from supported bank_details output fields', () => {
    expect(
      getBeneficiaryBrebKey({
        rail: null,
        payment_rail: 'co_breb',
        bank_details: { breb_key: 'ana@example.com' },
      }),
    ).toBe('ana@example.com');

    expect(
      getBeneficiaryBrebKey({
        rail: null,
        payment_rail: 'co_breb',
        bank_details: { brebKey: 'ana@banco.com' },
      }),
    ).toBe('ana@banco.com');
  });

  it('identifies co_breb from supported output data without top-level removed fields', () => {
    expect(
      isBrebKeyBeneficiary({
        rail: { code: 'co_breb' },
        payment_rail: null,
        bank_details: null,
      }),
    ).toBe(true);

    expect(
      isBrebKeyBeneficiary({
        rail: null,
        payment_rail: null,
        bank_details: { breb_key: 'ana@example.com' },
      }),
    ).toBe(true);
  });

  it('does not depend on removed top-level output fields', () => {
    const legacyOnlyFields = {
      rail: null,
      payment_rail: null,
      bank_details: {},
      type: 'BREB_KEY',
      breb_key: 'legacy@example.com',
    } as unknown as BeneficiaryOutputRailSource;

    expect(getBeneficiaryBrebKey(legacyOnlyFields)).toBeNull();
    expect(isBrebKeyBeneficiary(legacyOnlyFields)).toBe(false);
  });

  it('returns false for non-co_breb bank account output', () => {
    expect(
      isBrebKeyBeneficiary({
        rail: { code: 'ach_wire' },
        payment_rail: 'ach_wire',
        bank_details: { account_number: '1234' },
      }),
    ).toBe(false);
  });
});
