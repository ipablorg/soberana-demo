import { describe, expect, it } from 'vitest';

import {
  documentCategoryLabel,
  parseAddressDetails,
  parseKycData,
  parseProviderProfile,
} from '../kyc-dossier-fields';

describe('parseAddressDetails', () => {
  it('maps known address keys to Spanish labels', () => {
    const result = parseAddressDetails({
      street: 'Av. Paulista 1000',
      city: 'São Paulo',
      subdivision: 'SP',
      postal_code: '01310-100',
      country: 'BR',
    });

    const labels = result.fields.map((f) => f.label);
    expect(labels).toContain('Calle');
    expect(labels).toContain('Ciudad');
    expect(labels).toContain('Estado / Provincia');
    expect(labels).toContain('Código postal');
    expect(labels).toContain('País');
    expect(result.leftover).toBeNull();
  });

  it('keeps unknown keys as a leftover JSON block', () => {
    const result = parseAddressDetails({
      street: 'Cra 1',
      extra_field: 'something',
    });

    expect(result.fields.map((f) => f.label)).toContain('Calle');
    expect(result.leftover).toContain('extra_field');
  });

  it('returns empty fields for a non-object payload', () => {
    expect(parseAddressDetails(null)).toEqual({ fields: [], leftover: null });
    expect(parseAddressDetails('not-an-object')).toEqual({
      fields: [],
      leftover: null,
    });
  });
});

describe('parseKycData', () => {
  it('maps individual KYC fields to Spanish labels', () => {
    const result = parseKycData(
      {
        first_name: 'María',
        last_name: 'González',
        dob: '1990-01-01',
        occupation: 'Engineer',
      },
      'individual',
    );

    const byLabel = Object.fromEntries(
      result.fields.map((f) => [f.label, f.value]),
    );

    expect(byLabel['Nombre']).toBe('María');
    expect(byLabel['Apellido']).toBe('González');
    expect(byLabel['Fecha de nacimiento']).toBe('1990-01-01');
    expect(byLabel['Ocupación']).toBe('Engineer');
  });

  it('maps business-specific fields for a business customer', () => {
    const result = parseKycData(
      {
        legal_name: 'Acme LTDA',
        entity_type: 'LLC',
        incorporation_date: '2020-03-15',
      },
      'business',
    );

    const byLabel = Object.fromEntries(
      result.fields.map((f) => [f.label, f.value]),
    );

    expect(byLabel['Razón social']).toBe('Acme LTDA');
    expect(byLabel['Tipo de entidad']).toBe('LLC');
    expect(byLabel['Fecha de constitución']).toBe('2020-03-15');
  });

  it('counts array-valued keys like UBOs instead of dumping JSON', () => {
    const result = parseKycData(
      {
        associated_persons: [{ a: 1 }, { b: 2 }],
        identifying_documents: [{ id: 'x' }],
      },
      'business',
    );

    const byLabel = Object.fromEntries(
      result.fields.map((f) => [f.label, f.value]),
    );

    expect(byLabel['UBOs / personas asociadas']).toBe('2');
    expect(byLabel['Documentos identificatorios']).toBe('1');
  });

  it('surfaces unknown scalar values under a readable key and sends nested objects to leftover', () => {
    const result = parseKycData(
      {
        custom_field: 'hello',
        nested: { x: 1 },
      },
      'individual',
    );

    const byLabel = Object.fromEntries(
      result.fields.map((f) => [f.label, f.value]),
    );

    expect(byLabel['Custom field']).toBe('hello');
    expect(result.leftover).toContain('nested');
  });

  it('returns empty fields for a non-object payload', () => {
    expect(parseKycData(null, 'individual')).toEqual({
      fields: [],
      leftover: null,
    });
  });
});

describe('parseKycData — business KYB fields (N-10, N-6)', () => {
  it('labels registration number, employees, financial institution and website or absence reason', () => {
    const { fields } = parseKycData(
      {
        registration_number: '900123456',
        number_of_employees: '11-50',
        is_financial_institution: 'no',
        website_absence_reason: 'Vendemos por redes sociales',
      },
      'business',
    );

    expect(fields).toEqual([
      { label: 'Número de registro', value: '900123456' },
      { label: 'Número de empleados', value: '11-50' },
      { label: '¿Es una institución financiera?', value: 'No' },
      { label: 'Motivo por el que no tiene sitio web', value: 'Vendemos por redes sociales' },
    ]);
  });

  it('labels the camelCase keys of the persisted KYB form instead of printing them', () => {
    const { fields } = parseKycData(
      {
        businessLegalName: 'Acme SAS',
        registrationNumber: '900123456',
        numberOfEmployees: '11-50',
        isFinancialInstitution: true,
        primaryWebsite: 'https://acme.test',
        estimatedAnnualRevenueUsd: '0_99999',
      },
      'business',
    );

    expect(fields.map((field) => field.label)).toEqual([
      'Razón social',
      'Número de registro',
      'Número de empleados',
      '¿Es una institución financiera?',
      'Sitio web',
      'Ingresos anuales estimados (USD)',
    ]);
  });

  it('still shows an unknown scalar, as readable words instead of the raw camelCase key', () => {
    const { fields } = parseKycData({ someNewField: 'x' }, 'business');

    expect(fields).toEqual([{ label: 'Some new field', value: 'x' }]);
  });
});

describe('documentCategoryLabel', () => {
  it('names the document purposes in Spanish and keeps unknown ones raw', () => {
    expect(documentCategoryLabel('PROOF_OF_ADDRESS')).toBe('Comprobante de domicilio');
    expect(documentCategoryLabel('SUPPORTING')).toBe('Documento de soporte');
    expect(documentCategoryLabel('NEW_KIND')).toBe('NEW_KIND');
  });
});

describe('parseKycData — labels and values ops reads (N-6)', () => {
  const KYB = {
    customerId: 'bb1d5478-3034-497d-bb66-6624dc9bf7c5',
    businessType: 'llc',
    sourceOfFunds: 'owners_capital',
    accountPurpose: 'receive_payments_for_goods_and_services',
    expectedMonthlyPayments: '0_4999',
    estimatedAnnualRevenueUsd: '0_99999',
    operatesInProhibitedCountries: false,
    conductsMoneyServices: false,
    incorporationDate: '2020-05-10T00:00:00.000Z',
    createdAt: '2026-10-20T14:36:09.633Z',
    updatedAt: '2026-10-20T14:36:09.633Z',
  };

  function valueOf(label: string): string | undefined {
    return parseKycData(KYB, 'business').fields.find((field) => field.label === label)?.value;
  }

  it('gives the English keys a Spanish label', () => {
    const labels = parseKycData(KYB, 'business').fields.map((field) => field.label);

    for (const english of [
      'Customer id',
      'Expected monthly payments',
      'Operates in prohibited countries',
      'Conducts money services',
      'Created at',
      'Updated at',
    ]) {
      expect(labels).not.toContain(english);
    }
    expect(labels).toContain('ID del cliente');
    expect(labels).toContain('Pagos mensuales esperados (USD)');
    expect(labels).toContain('Opera en países prohibidos');
    expect(labels).toContain('Presta servicios monetarios');
    expect(labels).toContain('Creado');
    expect(labels).toContain('Actualizado');
  });

  it('names the enum values and the amount ranges', () => {
    expect(valueOf('Tipo de empresa')).toBe('Sociedad de responsabilidad limitada (LLC)');
    expect(valueOf('Origen de los fondos')).toBe('Capital de los propietarios');
    expect(valueOf('Propósito de la cuenta')).toBe('Recibir pagos por bienes y servicios');
    expect(valueOf('Pagos mensuales esperados (USD)')).toBe('0 – 4.999 USD');
    expect(valueOf('Ingresos anuales estimados (USD)')).toBe('0 – 99.999 USD');
  });

  it('shows ISO timestamps as a localized date', () => {
    expect(valueOf('Fecha de constitución')).toBe('10/05/2020');
    expect(valueOf('Creado')).not.toContain('T14:36');
    expect(valueOf('Creado')).toMatch(/^20\/10\/2026/);
  });
});

describe('parseProviderProfile (N-10)', () => {
  it('shows the business data kept for the providers in Spanish', () => {
    const result = parseProviderProfile({
      registrationNumber: 'RM-2019-0042',
      numberOfEmployees: '11-50',
      isFinancialInstitution: false,
      websiteAbsenceReason: 'Opera solo por canales directos',
    });

    expect(result.fields).toEqual([
      { label: 'Número de registro', value: 'RM-2019-0042' },
      { label: 'Número de empleados', value: '11-50' },
      { label: '¿Es una institución financiera?', value: 'No' },
      { label: 'Motivo por el que no tiene sitio web', value: 'Opera solo por canales directos' },
    ]);
  });

  it('is empty without a profile', () => {
    expect(parseProviderProfile(null).fields).toEqual([]);
  });
});
