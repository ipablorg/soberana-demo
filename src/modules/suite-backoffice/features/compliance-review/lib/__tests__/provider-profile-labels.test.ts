import { describe, expect, it } from 'vitest';

import {
  groupProviderFields,
  providerBlockerLabel,
  providerFieldLabel,
  sourceText,
} from '../provider-profile-labels';

describe('providerFieldLabel', () => {
  it('labels the profile fields, including the business industry', () => {
    expect(providerFieldLabel('businessIndustry', sourceText)).toBe('Industria de la empresa');
    expect(providerFieldLabel('phone', sourceText)).toBe('Teléfono de la empresa');
  });

  it('labels grouped provider tokens as "group: field"', () => {
    expect(providerFieldLabel('associated_persons:nationality', sourceText)).toBe(
      'Personas asociadas: Nacionalidad'
    );
    expect(
      providerFieldLabel('identifying_information:file_shareholder_registry', sourceText)
    ).toBe('Documentos de la empresa: Registro de accionistas');
  });

  it('keeps an unknown key raw', () => {
    expect(providerFieldLabel('something_new', sourceText)).toBe('something_new');
    expect(providerFieldLabel('associated_persons:odd_token', sourceText)).toBe(
      'Personas asociadas: odd_token'
    );
  });
});

describe('providerFieldLabel — KiraFin RFI keys (N-6)', () => {
  it('names the KiraFin questionnaire and document keys in Spanish', () => {
    expect(providerFieldLabel('high_risk_industries', sourceText)).toBe(
      '¿Opera en industrias de alto riesgo?'
    );
    expect(providerFieldLabel('company_registration_number', sourceText)).toBe(
      'Número de registro de la empresa'
    );
    expect(providerFieldLabel('identifying_information:file_business_formation', sourceText)).toBe(
      'Documentos de la empresa: Documento de constitución de la empresa'
    );
    expect(providerFieldLabel('associated_persons:identifying_information:front', sourceText)).toBe(
      'Personas asociadas: Documento de identidad (frente)'
    );
  });

  it('names a blocker code reported as a missing item', () => {
    expect(providerFieldLabel('WALLET_NOT_PROVISIONED', sourceText)).toBe(
      'El cliente todavía no tiene billetera: créela antes de reintentar el alta.'
    );
  });
});

describe('providerBlockerLabel', () => {
  it('turns the provider status codes into sentences', () => {
    expect(providerBlockerLabel('WALLET_NOT_PROVISIONED', null, sourceText)).toBe(
      'El cliente todavía no tiene billetera: créela antes de reintentar el alta.'
    );
    expect(providerBlockerLabel('MESTA_UNSUPPORTED_STATE', null, sourceText)).toBe(
      'Mesta no atiende empresas registradas en este estado de EE. UU.'
    );
    expect(providerBlockerLabel('MESTA_UNSUPPORTED_COUNTRY', null, sourceText)).toBe(
      'Mesta no atiende empresas de este país.'
    );
  });

  it('keeps the provider detail of an unknown Mesta rejection', () => {
    expect(
      providerBlockerLabel(
        'MESTA_UNKNOWN',
        'UNKNOWN 400 This address does not meet the eligibility requirements',
        sourceText
      )
    ).toBe(
      'Mesta rechazó el alta sin un motivo reconocido: UNKNOWN 400 This address does not meet the eligibility requirements'
    );
  });

  it('labels a missing-data code by its structured key, never by a redacted message', () => {
    expect(
      providerBlockerLabel(
        'KIRAFIN_RFI_PEP_STATUS',
        "kirafin requests field '<redacted>' before activation",
        sourceText
      )
    ).toBe('¿Es una persona expuesta políticamente (PEP)?');
  });

  it('keeps the message of an unknown code', () => {
    expect(providerBlockerLabel('SOMETHING_ELSE', 'Provider said no', sourceText)).toBe(
      'Provider said no'
    );
    expect(providerBlockerLabel('SOMETHING_ELSE', null, sourceText)).toBe('SOMETHING_ELSE');
  });
});

describe('groupProviderFields', () => {
  it('groups the items into documents, ownership, questionnaire and the rest', () => {
    const groups = groupProviderFields(
      [
        'identifying_information:file_bylaws',
        'associated_persons:ssn',
        'associated_persons:identifying_information:front',
        'pep_status',
        'account_purpose',
        'WALLET_NOT_PROVISIONED',
      ],
      sourceText
    );

    expect(groups.map((group) => [group.title, group.items.map((item) => item.label)])).toEqual([
      ['Documentos', ['Estatutos de la empresa', 'Documento de identidad (frente)']],
      ['Propietarios y representantes', ['SSN (número de seguro social de EE. UU.)']],
      [
        'Cuestionario de cumplimiento',
        ['¿Es una persona expuesta políticamente (PEP)?', 'Propósito de la cuenta'],
      ],
      ['Otros', ['El cliente todavía no tiene billetera: créela antes de reintentar el alta.']],
    ]);
    expect(groups[0].items[0].key).toBe('identifying_information:file_bylaws');
  });
});
