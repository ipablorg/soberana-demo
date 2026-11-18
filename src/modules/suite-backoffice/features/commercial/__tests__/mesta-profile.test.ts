import { describe, expect, it } from 'vitest';

import {
  EMPTY_MESTA_PROFILE_FORM,
  MESTA_PROFILE_FIELD_ORDER,
  buildMestaProfileInput,
  isMestaProfileComplete,
  mestaFormFromMetadata,
  missingMestaFields,
  defaultTaxIdTypeId,
  taxIdTypeOptions,
  type MestaProfileForm,
} from '../lib/mesta-profile';
import { describeMissingMestaFields } from '../lib/mesta-labels';

const COMPLETE: MestaProfileForm = {
  dialCode: '+57',
  phoneNational: '3001234567',
  addressStreet: 'Calle 1 # 2-3',
  addressCity: 'Bogotá',
  addressState: '',
  addressPostalCode: '110111',
  registrationDate: '2020-05-17',
  businessType: 'limited_liability_company',
  websiteUrl: '',
  websiteAbsenceReason: 'Aún no tiene sitio web',
  isFinancialInstitution: 'no',
  numberOfEmployees: '2-10',
  expectedMonthlyVolumeEstimate: '50000',
  averageTransactionSize: '2500.5',
  primaryCounterpartyJurisdictions: ['US', 'CO'],
  natureOfPayments: ['vendor_payment'],
  sourceOfFunds: 'business_income',
};

describe('missingMestaFields', () => {
  it('lists every field of an empty form in display order', () => {
    expect(missingMestaFields(EMPTY_MESTA_PROFILE_FORM)).toEqual([...MESTA_PROFILE_FIELD_ORDER]);
    expect(MESTA_PROFILE_FIELD_ORDER).toHaveLength(14);
  });

  it('is empty for a complete form', () => {
    expect(missingMestaFields(COMPLETE)).toEqual([]);
    expect(isMestaProfileComplete(COMPLETE)).toBe(true);
  });

  it('asks for the website reason only when there is no website', () => {
    const withSite = { ...COMPLETE, websiteUrl: 'https://acme.co', websiteAbsenceReason: '' };
    const noSite = { ...COMPLETE, websiteAbsenceReason: '' };

    expect(missingMestaFields(withSite)).toEqual([]);
    expect(missingMestaFields(noSite)).toEqual(['websiteAbsenceReason']);
  });

  it('treats "no" as an answer for isFinancialInstitution but empty as missing', () => {
    expect(missingMestaFields({ ...COMPLETE, isFinancialInstitution: '' })).toEqual([
      'isFinancialInstitution',
    ]);
  });
});

describe('buildMestaProfileInput', () => {
  it('maps the form to the backend input with typed values', () => {
    expect(buildMestaProfileInput(COMPLETE)).toEqual({
      phone: '+573001234567',
      addressStreet: 'Calle 1 # 2-3',
      addressCity: 'Bogotá',
      addressPostalCode: '110111',
      registrationDate: '2020-05-17',
      businessType: 'limited_liability_company',
      websiteAbsenceReason: 'Aún no tiene sitio web',
      isFinancialInstitution: false,
      numberOfEmployees: '2-10',
      expectedMonthlyVolumeEstimate: 50000,
      averageTransactionSize: 2500.5,
      primaryCounterpartyJurisdictions: ['US', 'CO'],
      natureOfPayments: ['vendor_payment'],
      sourceOfFunds: 'business_income',
    });
  });

  it('sends only what was filled so stored values are not overwritten', () => {
    expect(buildMestaProfileInput(EMPTY_MESTA_PROFILE_FORM)).toEqual({});
  });

  it('drops the absence reason when a website is given', () => {
    const input = buildMestaProfileInput({
      ...COMPLETE,
      websiteUrl: 'https://acme.co',
    });

    expect(input.websiteUrl).toBe('https://acme.co');
    expect(input).not.toHaveProperty('websiteAbsenceReason');
  });
});

describe('mestaFormFromMetadata', () => {
  it('prefills the form from the stored profile, splitting the dial code', () => {
    const form = mestaFormFromMetadata({
      note: 'x',
      onboardingProfile: {
        phone: '+573001234567',
        addressCity: 'Bogotá',
        isFinancialInstitution: true,
        expectedMonthlyVolumeEstimate: 1000,
        natureOfPayments: ['vendor_payment'],
      },
    });

    expect(form).toMatchObject({
      dialCode: '+57',
      phoneNational: '3001234567',
      addressCity: 'Bogotá',
      isFinancialInstitution: 'yes',
      expectedMonthlyVolumeEstimate: '1000',
      natureOfPayments: ['vendor_payment'],
      addressStreet: '',
    });
  });

  it('returns the empty form when there is no stored profile', () => {
    expect(mestaFormFromMetadata(null)).toEqual(EMPTY_MESTA_PROFILE_FORM);
    expect(mestaFormFromMetadata({})).toEqual(EMPTY_MESTA_PROFILE_FORM);
  });
});

describe('describeMissingMestaFields', () => {
  const t = (descriptor: { message?: string; id?: string }) =>
    descriptor.message ?? descriptor.id ?? '';

  it('humanizes the full list instead of showing raw field names', () => {
    const text = describeMissingMestaFields(['phone', 'addressStreet', 'sourceOfFunds'], t);

    expect(text).toBe(
      'Mesta necesita estos datos de la empresa: Teléfono, Calle, Origen de los fondos'
    );
  });

  it('keeps an unknown field name instead of hiding it', () => {
    expect(describeMissingMestaFields(['somethingNew'], t)).toContain('somethingNew');
  });

  it('explains the client tax id gap separately', () => {
    expect(describeMissingMestaFields(['taxId'], t)).toContain('ID fiscal del cliente');
  });
});

describe('defaultTaxIdTypeId', () => {
  const types = [
    { id: 'uuid-nit', name: 'NIT', countries: ['COL'] },
    { id: 'uuid-cc', name: 'CC', countries: ['COL'] },
    { id: 'uuid-ein', name: 'EIN', countries: ['USA'] },
  ];

  it('suggests the type when the country has exactly one', () => {
    expect(defaultTaxIdTypeId(types, 'USA')).toBe('uuid-ein');
  });

  it('suggests nothing when the country has several or none', () => {
    expect(defaultTaxIdTypeId(types, 'COL')).toBeNull();
    expect(defaultTaxIdTypeId(types, 'MEX')).toBeNull();
  });
});

describe('taxIdTypeOptions', () => {
  const types = [
    { id: 'uuid-nit', name: 'NIT', countries: ['COL'] },
    { id: 'uuid-ein', name: 'EIN', countries: ['USA'] },
    { id: 'uuid-any', name: 'OTHER', countries: null },
  ];

  it('stores the id and shows the code', () => {
    expect(taxIdTypeOptions(types, '')).toEqual([
      { value: 'uuid-nit', label: 'NIT' },
      { value: 'uuid-ein', label: 'EIN' },
      { value: 'uuid-any', label: 'OTHER' },
    ]);
  });

  it('puts the types of the selected country first', () => {
    expect(taxIdTypeOptions(types, 'USA').map((o) => o.label)).toEqual(['EIN', 'OTHER', 'NIT']);
  });
});
