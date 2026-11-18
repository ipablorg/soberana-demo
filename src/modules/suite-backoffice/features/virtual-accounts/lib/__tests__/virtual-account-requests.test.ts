import { i18n, type MessageDescriptor } from '@lingui/core';
import { describe, expect, it } from 'vitest';

import type { AdminVirtualAccountRequest } from '@/graphql/types/admin-loopay';
import { formatOpsDateTime } from '../../../ops-review/lib/ops-formatting';
import { describeVirtualAccountRequest } from '../virtual-account-requests';

function request(overrides: Partial<AdminVirtualAccountRequest> = {}): AdminVirtualAccountRequest {
  return {
    id: 'e-1',
    customerId: 'c-1',
    customerEmail: 'ana@acme.test',
    clientId: 'cl-1',
    clientName: 'Acme Tenant',
    railCode: 'ach',
    railName: 'ACH',
    currency: 'USD',
    endorsementStatus: 'PENDING',
    state: 'REQUESTED',
    provider: null,
    blockers: [],
    missingFields: [],
    missingFieldDetails: [],
    reason: null,
    requestedAt: '2026-10-19T12:00:00.000Z',
    ...overrides,
  };
}

describe('describeVirtualAccountRequest', () => {
  it.each([
    ['REQUESTED', 'Por revisar (Operaciones)'],
    ['OPS_APPROVED', 'Aprobada, falta el proveedor'],
    ['PROVIDER_ONBOARDING', 'En alta con el proveedor'],
  ])('labels state %s as "%s"', (state, label) => {
    expect(describeVirtualAccountRequest(request({ state })).stateLabel).toBe(label);
  });

  it('lists the missing data by its stable keys when the backend sends them', () => {
    const row = describeVirtualAccountRequest(
      request({
        state: 'PROVIDER_ONBOARDING',
        blockers: [
          { code: 'KIRAFIN_RFI_X', category: 'RFI', message: "kirafin requests field 'x'" },
        ],
        missingFields: ['businessIndustry', 'associated_persons:nationality'],
        missingFieldDetails: [
          { key: 'businessIndustry', group: 'business_profile', kind: 'PROFILE_FIELD' },
          {
            key: 'associated_persons:nationality',
            group: 'associated_persons',
            kind: 'OPS_CHECKLIST',
          },
        ],
      })
    );

    expect(row.blockerLines).toEqual([
      'Industria de la empresa',
      'Personas asociadas: Nacionalidad',
    ]);
    expect(row.missingFields).toEqual(['businessIndustry', 'associated_persons:nationality']);
    expect(row.missingFieldDetails).toHaveLength(2);
  });

  it('lists the blockers as readable lines', () => {
    const row = describeVirtualAccountRequest(
      request({
        state: 'PROVIDER_ONBOARDING',
        blockers: [{ code: 'KYB_DOC', category: 'documents', message: 'Falta RUT' }],
      })
    );

    expect(row.blockerLines).toEqual(['Falta RUT']);
  });

  it('labels the provider missing-field blockers, keeping the raw key when unknown', () => {
    const row = describeVirtualAccountRequest(
      request({
        state: 'PROVIDER_ONBOARDING',
        blockers: [
          {
            code: 'KIRAFIN_RFI_PHONE',
            category: 'RFI',
            message: "kirafin requests field 'phone' before activation",
          },
          {
            code: 'KIRAFIN_RFI_INCORPORATION_DATE',
            category: 'RFI',
            message: "kirafin requests field 'incorporation_date'",
          },
          { code: 'KIRAFIN_RFI_EIN', category: 'RFI', message: "kirafin requests field 'ein'" },
          {
            code: 'MESTA_MISSING_FORMATIONDATE',
            category: 'DOCUMENT',
            message: 'formationDate is required',
          },
          { code: 'KIRAFIN_MISSING_ADDRESS', category: 'DOCUMENT', message: 'address is required' },
          {
            code: 'KIRAFIN_RFI_SOME_NEW_TOKEN',
            category: 'RFI',
            message: "kirafin requests field 'some_new_token'",
          },
        ],
      })
    );

    expect(row.blockerLines).toEqual([
      'Teléfono de la empresa',
      'Fecha de constitución',
      'EIN (número de identificación fiscal de EE. UU.)',
      'Fecha de constitución',
      'Dirección de registro',
      'some_new_token',
    ]);
  });

  it('shows the tenant name and rail, never a UUID, and a dash without provider', () => {
    const row = describeVirtualAccountRequest(request());

    expect(row).toMatchObject({
      tenant: 'Acme Tenant',
      railLabel: 'ACH · USD',
      providerLabel: '—',
    });
  });

  it('offers the provider retry only for an approved request parked at the provider', () => {
    expect(
      describeVirtualAccountRequest(
        request({ endorsementStatus: 'APPROVED', state: 'PROVIDER_ONBOARDING' })
      ).canRetryProvider
    ).toBe(true);
    expect(
      describeVirtualAccountRequest(request({ endorsementStatus: 'PENDING', state: 'REQUESTED' }))
        .canRetryProvider
    ).toBe(false);
    expect(describeVirtualAccountRequest(request()).customerId).toBe('c-1');
  });

  it('names the provider and explains the status blockers in a sentence (N-6)', () => {
    const row = describeVirtualAccountRequest(
      request({
        state: 'PROVIDER_ONBOARDING',
        provider: 'kirafin',
        blockers: [
          { code: 'WALLET_NOT_PROVISIONED', category: 'STATUS', message: 'WALLET_NOT_PROVISIONED' },
          {
            code: 'KIRAFIN_RFI_PEP_STATUS',
            category: 'RFI',
            message: "kirafin requests field '<redacted>' before activation",
          },
        ],
      })
    );

    expect(row.providerLabel).toBe('KiraFin');
    expect(row.blockerLines).toEqual([
      'El cliente todavía no tiene billetera: créela antes de reintentar el alta.',
      '¿Es una persona expuesta políticamente (PEP)?',
    ]);
  });

  it('S22: shows who repaired the request, why and with which bank details', () => {
    i18n.load('es', {});
    i18n.activate('es');
    const t = (descriptor: MessageDescriptor) => i18n._(descriptor);

    const row = describeVirtualAccountRequest(
      request({
        state: 'PROVIDER_ONBOARDING',
        repair: {
          reason: 'provider opened it by hand',
          repairedBy: 'ops-uid',
          repairedAt: '2026-10-20T10:00:00.000Z',
          bankDetailsSource: 'MANUAL',
        },
      }),
      t
    );

    expect(row.repairLine).toBe(
      `Reparada por ops-uid el ${formatOpsDateTime('2026-10-20T10:00:00.000Z')} (datos bancarios manuales): provider opened it by hand`
    );
    expect(describeVirtualAccountRequest(request(), t).repairLine).toBeNull();
  });
});
