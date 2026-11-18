/**
 * Contract between the create-beneficiary form and the back's
 * `CreateBeneficiaryDto` (`apps/suite-loopay-back/src/modules/soberana/
 * beneficiaries/dto/create-beneficiary.dto.ts` and its
 * `CREATE_BENEFICIARY_FIELD_REQUIREMENTS`): every field the back requires for
 * a rail is shown by the form for that rail and marked required, so the form
 * never submits a body the back answers 400 to.
 *
 * The table mirrors the back by hand (the front cannot import it): when the
 * DTO changes, change it here too.
 */

import { describe, expect, it } from 'vitest';

import {
  EMPTY_BENEFICIARY_FORM,
  accountFieldsOf,
  addressFieldsOf,
  isRequiredField,
  railSpecOf,
  validateBeneficiaryForm,
  type BeneficiaryFormField,
} from '../lib/beneficiary-form';

/** Address the payout providers need wherever the back lists it. */
const ADDRESS: BeneficiaryFormField[] = ['address_line_1', 'city', 'postal_code'];

interface RailContract {
  rail: string;
  country: string;
  type: 'BANK_ACCOUNT' | 'PIX' | 'BREB_KEY';
  required: BeneficiaryFormField[];
}

/**
 * Back requirements per rail. `tax_id` is required on every beneficiary but a
 * Bre-B key (`@ValidateIf(o => o.type !== 'BREB_KEY')`); USA needs
 * `routing_number` + `account_number_us`, the address and the state; MEX
 * `clabe` + address; BRA PIX `pix_key`; COL/ECU bank accounts `bank_code`,
 * `account_number`, `tax_id_type`; GBR `sort_code`; SEPA `iban`.
 */
const BACK_REQUIREMENTS: RailContract[] = [
  {
    rail: 'ach_wire',
    country: 'USA',
    type: 'BANK_ACCOUNT',
    required: ['routing_number', 'account_number_us', 'tax_id', ...ADDRESS, 'state'],
  },
  {
    rail: 'us_ach',
    country: 'USA',
    type: 'BANK_ACCOUNT',
    required: ['routing_number', 'account_number_us', 'tax_id', ...ADDRESS, 'state'],
  },
  {
    rail: 'wire',
    country: 'USA',
    type: 'BANK_ACCOUNT',
    required: ['routing_number', 'account_number_us', 'tax_id', ...ADDRESS, 'state'],
  },
  { rail: 'spei', country: 'MEX', type: 'BANK_ACCOUNT', required: ['clabe', 'tax_id', ...ADDRESS] },
  { rail: 'pix', country: 'BRA', type: 'PIX', required: ['pix_key', 'tax_id'] },
  {
    rail: 'co_ach',
    country: 'COL',
    type: 'BANK_ACCOUNT',
    required: ['bank_code', 'account_number', 'tax_id', 'tax_id_type'],
  },
  { rail: 'co_breb', country: 'COL', type: 'BREB_KEY', required: ['breb_key'] },
  {
    rail: 'ec_bank_transfer',
    country: 'ECU',
    type: 'BANK_ACCOUNT',
    required: ['bank_code', 'account_number', 'tax_id', 'tax_id_type'],
  },
  { rail: 'sepa', country: 'DEU', type: 'BANK_ACCOUNT', required: ['iban', 'tax_id'] },
  {
    rail: 'faster_payments',
    country: 'GBR',
    type: 'BANK_ACCOUNT',
    required: ['sort_code', 'account_number', 'tax_id'],
  },
  { rail: 'swift', country: 'CHE', type: 'BANK_ACCOUNT', required: ['bic', 'tax_id'] },
  // A rail the form has no spec for still gets the bank-account rule.
  { rail: 'pe_bank_transfer', country: 'PER', type: 'BANK_ACCOUNT', required: ['tax_id'] },
];

const BASE_REQUIRED: BeneficiaryFormField[] = ['customer_id', 'country', 'beneficiary_name'];

describe('create-beneficiary form vs CreateBeneficiaryDto', () => {
  it.each(BACK_REQUIREMENTS)(
    '$rail ($country) shows and requires every field the back requires',
    ({ rail, country, type, required }) => {
      const values = { ...EMPTY_BENEFICIARY_FORM, payment_rail: rail, country };
      const shown = [...accountFieldsOf(rail), ...addressFieldsOf(rail)];

      expect(railSpecOf(rail).type).toBe(type);
      for (const field of [...BASE_REQUIRED, ...required]) {
        if (!BASE_REQUIRED.includes(field))
          expect(shown, `${rail} shows ${field}`).toContain(field);
        expect(isRequiredField(field, values), `${rail} requires ${field}`).toBe(true);
      }
    }
  );

  it.each(BACK_REQUIREMENTS)(
    '$rail refuses to submit without them',
    ({ rail, country, required }) => {
      const errors = validateBeneficiaryForm({
        ...EMPTY_BENEFICIARY_FORM,
        payment_rail: rail,
        country,
      });

      for (const field of required) expect(errors[field], `${rail} ${field}`).toBe('required');
    }
  );

  it('keeps the tax id optional on a Bre-B key only', () => {
    const values = { ...EMPTY_BENEFICIARY_FORM, payment_rail: 'co_breb', country: 'COL' };

    expect(accountFieldsOf('co_breb')).toContain('tax_id');
    expect(isRequiredField('tax_id', values)).toBe(false);
  });
});
