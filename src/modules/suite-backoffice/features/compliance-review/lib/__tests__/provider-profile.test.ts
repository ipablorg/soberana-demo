import { describe, expect, it } from 'vitest';

import {
  buildProviderProfileInput,
  editableProviderFields,
  emptyProviderProfileForm,
  incompleteProviderFields,
  otherMissingFields,
  providerProfileFormFrom,
} from '../provider-profile';

const DETAIL = {
  customer: { tax_id: '900123456', first_name: 'Acme SAS', last_name: '' },
  kyc_data: {
    businessLegalName: 'Acme SAS',
    phone: '+573001112233',
    businessType: 'llc',
    incorporationDate: '2019-03-04T00:00:00.000Z',
    primaryWebsite: null,
    registeredAddress: {
      street: 'Calle 1 # 2-3',
      city: 'Bogota',
      state: 'DC',
      postalCode: '110111',
      country: 'COL',
    },
    associatedPersonsMetadata: [
      { firstName: 'Owner', lastName: 'Only', isSigner: false },
      { firstName: 'Sara', lastName: 'Signer', isSigner: true },
    ],
  },
};

describe('provider profile fields', () => {
  it('keeps only the missing fields the backoffice can complete, in display order', () => {
    expect(
      editableProviderFields([
        'numberOfEmployees',
        'businessName',
        'registrationNumber',
        'website',
        'KIRAFIN_VA_REJECTED',
        'registeredAddress',
      ]),
    ).toEqual(['website', 'registrationNumber', 'numberOfEmployees', 'registeredAddress']);
  });

  it('lists the rest as data the backoffice cannot complete here', () => {
    expect(otherMissingFields(['businessName', 'website', 'tax_id'])).toEqual([
      'businessName',
      'tax_id',
    ]);
  });
});

describe('providerProfileFormFrom', () => {
  it('prefills from what the customer already has (KYB data, signer), never the tax id as registration number (NF-3)', () => {
    const form = providerProfileFormFrom(DETAIL);

    expect(form).toMatchObject({
      phone: '+573001112233',
      formationDate: '2019-03-04',
      businessType: 'limited_liability_company',
      websiteUrl: '',
      registrationNumber: '',
      addressStreet: 'Calle 1 # 2-3',
      addressCity: 'Bogota',
      addressState: 'DC',
      addressPostalCode: '110111',
      addressCountry: 'COL',
      representativeFirstName: 'Sara',
      representativeLastName: 'Signer',
      isFinancialInstitution: '',
      numberOfEmployees: '',
    });
  });

  it('uses the customer names as representative only when they are a person', () => {
    const form = providerProfileFormFrom({
      customer: { tax_id: null, first_name: 'Luis', last_name: 'Perez' },
      kyc_data: { businessLegalName: 'Acme SAS' },
    });

    expect(form.representativeFirstName).toBe('Luis');
    expect(form.representativeLastName).toBe('Perez');
    expect(form.registrationNumber).toBe('');
  });

  it('returns an empty form without data', () => {
    expect(providerProfileFormFrom(null)).toEqual(emptyProviderProfileForm());
  });
});

describe('incompleteProviderFields and buildProviderProfileInput', () => {
  it('reports what is still empty among the asked fields', () => {
    const form = providerProfileFormFrom(DETAIL);

    expect(
      incompleteProviderFields(form, [
        'website',
        'registrationNumber',
        'isFinancialInstitution',
        'numberOfEmployees',
      ]),
    ).toEqual(['website', 'registrationNumber', 'isFinancialInstitution', 'numberOfEmployees']);
  });

  it('builds the mutation input with only the asked fields', () => {
    const form = {
      ...providerProfileFormFrom(DETAIL),
      registrationNumber: 'MAT-77',
      websiteAbsenceReason: 'Solo vende por referidos',
      isFinancialInstitution: 'no' as const,
      numberOfEmployees: '11-50',
    };

    expect(
      buildProviderProfileInput(form, [
        'website',
        'registrationNumber',
        'isFinancialInstitution',
        'numberOfEmployees',
      ]),
    ).toEqual({
      websiteAbsenceReason: 'Solo vende por referidos',
      registrationNumber: 'MAT-77',
      isFinancialInstitution: false,
      numberOfEmployees: '11-50',
    });
  });

  it('sends the address and the representative as their parts', () => {
    const form = providerProfileFormFrom(DETAIL);

    expect(buildProviderProfileInput(form, ['registeredAddress', 'representativeName'])).toEqual({
      addressStreet: 'Calle 1 # 2-3',
      addressCity: 'Bogota',
      addressState: 'DC',
      addressPostalCode: '110111',
      addressCountry: 'COL',
      representativeFirstName: 'Sara',
      representativeLastName: 'Signer',
    });
  });

  it('prefers the website over the absence reason', () => {
    const form = {
      ...emptyProviderProfileForm(),
      websiteUrl: 'https://acme.co',
      websiteAbsenceReason: 'stale',
    };

    expect(buildProviderProfileInput(form, ['website'])).toEqual({ websiteUrl: 'https://acme.co' });
    expect(incompleteProviderFields(form, ['website'])).toEqual([]);
  });
});

describe('missing field details (PROFILE_FIELD / OPS_CHECKLIST)', () => {
  const details = [
    { key: 'businessIndustry', group: 'business_profile', kind: 'PROFILE_FIELD' },
    { key: 'phone', group: 'business_profile', kind: 'PROFILE_FIELD' },
    { key: 'associated_persons:nationality', group: 'associated_persons', kind: 'OPS_CHECKLIST' },
    { key: 'ein', group: 'provider_request', kind: 'OPS_CHECKLIST' },
  ];
  const keys = details.map((detail) => detail.key);

  it('asks only the PROFILE_FIELD keys, business industry included', () => {
    expect(editableProviderFields(keys, details)).toEqual(['phone', 'businessIndustry']);
  });

  it('leaves the OPS_CHECKLIST keys as a checklist for operations', () => {
    expect(otherMissingFields(keys, details)).toEqual(['associated_persons:nationality', 'ein']);
  });

  it('keeps the key-based split when no details come (previous behavior)', () => {
    expect(editableProviderFields(['phone', 'businessName'])).toEqual(['phone']);
    expect(otherMissingFields(['phone', 'businessName'])).toEqual(['businessName']);
  });

  it('sends the business industry and prefills it from the KYB industry', () => {
    const form = { ...emptyProviderProfileForm(), businessIndustry: '541' };
    expect(buildProviderProfileInput(form, ['businessIndustry'])).toEqual({ businessIndustry: '541' });
    expect(
      providerProfileFormFrom({ kyc_data: { businessIndustry: ['consulting'] } }).businessIndustry,
    ).toBe('541');
  });
});

describe('providerProfileFormFrom — stored provider profile (N-10)', () => {
  it('prefills the retry form from provider_profile', () => {
    const form = providerProfileFormFrom({
      ...DETAIL,
      provider_profile: {
        registrationNumber: 'RM-2019-0042',
        numberOfEmployees: '11-50',
        isFinancialInstitution: false,
        websiteAbsenceReason: 'Opera solo por canales directos',
      },
    });

    expect(form.registrationNumber).toBe('RM-2019-0042');
    expect(form.numberOfEmployees).toBe('11-50');
    expect(form.isFinancialInstitution).toBe('no');
    expect(form.websiteAbsenceReason).toBe('Opera solo por canales directos');
  });

  it('keeps the KYB prefill when there is no provider profile', () => {
    const form = providerProfileFormFrom(DETAIL);

    expect(form.phone).toBe('+573001112233');
    expect(form.isFinancialInstitution).toBe('');
    expect(form.numberOfEmployees).toBe('');
  });
});
