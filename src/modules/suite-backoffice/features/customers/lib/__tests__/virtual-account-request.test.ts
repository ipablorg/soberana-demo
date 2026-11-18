import { describe, expect, it } from 'vitest';

import type { AdminReceiveOption } from '@/graphql/types/admin-loopay';
import {
  buildRequestVirtualAccountInput,
  classifyRequestVirtualAccountError,
  describeReceiveOptions,
  getRequestVirtualAccountAvailability,
} from '../virtual-account-request';

const CUSTOMER_ID = '0b6d2f6e-7f1c-4c1e-9d4e-111111111111';

function option(overrides: Partial<AdminReceiveOption> = {}): AdminReceiveOption {
  return {
    country: 'US',
    currency: 'USD',
    railCode: 'ach',
    railName: 'ACH',
    provider: 'kirafin',
    providers: ['kirafin'],
    status: 'available',
    requestId: null,
    virtualAccountId: null,
    vaRequestState: null,
    blockers: [],
    reason: null,
    eligible: true,
    ineligibleReason: null,
    ...overrides,
  };
}

describe('getRequestVirtualAccountAvailability', () => {
  it('hides the action from roles that cannot request', () => {
    expect(
      getRequestVirtualAccountAvailability({ canRequest: false, kycStatus: 'APPROVED' })
    ).toEqual({
      visible: false,
      enabled: false,
      blockedReason: null,
    });
  });

  it('shows it disabled until the KYC is approved', () => {
    expect(
      getRequestVirtualAccountAvailability({ canRequest: true, kycStatus: 'PENDING_REVIEW' })
    ).toEqual({
      visible: true,
      enabled: false,
      blockedReason: 'kyc_not_approved',
    });
  });

  it('enables it for an approved customer', () => {
    expect(
      getRequestVirtualAccountAvailability({ canRequest: true, kycStatus: 'APPROVED' })
    ).toEqual({
      visible: true,
      enabled: true,
      blockedReason: null,
    });
  });
});

describe('describeReceiveOptions', () => {
  it('lets an eligible available option be requested', () => {
    const [row] = describeReceiveOptions([option()]);

    expect(row).toMatchObject({
      label: 'ACH · US · USD',
      action: 'request',
      statusLabel: 'Disponible',
    });
  });

  it('names the provider instead of its code (N-6)', () => {
    expect(describeReceiveOptions([option()])[0].provider).toBe('KiraFin');
  });

  it('shows individuals "solo empresas" and offers no action', () => {
    const rows = describeReceiveOptions([
      option({ eligible: false, ineligibleReason: 'VA_BUSINESS_ONLY' }),
      option({
        railCode: 'wire',
        railName: 'Wire',
        eligible: false,
        ineligibleReason: 'VA_BUSINESS_ONLY',
      }),
    ]);

    expect(rows.every((row) => row.action === 'none')).toBe(true);
    expect(rows[0].note).toBe('Solo empresas (incluye unipersonales)');
  });

  it('disables rails under maintenance with the reason', () => {
    const [row] = describeReceiveOptions([
      option({ eligible: false, ineligibleReason: 'RAIL_UNDER_MAINTENANCE' }),
    ]);

    expect(row).toMatchObject({ action: 'none', note: 'Riel en mantenimiento' });
  });

  it('shows requested, active and rejected options without an action', () => {
    const rows = describeReceiveOptions([
      option({ status: 'requested' }),
      option({ railCode: 'wire', status: 'active', virtualAccountId: 'va-1' }),
      option({ railCode: 'sepa', status: 'rejected', reason: 'Documento ilegible' }),
    ]);

    expect(rows.map((row) => [row.statusLabel, row.action])).toEqual([
      ['Solicitada', 'none'],
      ['Activa', 'none'],
      ['Rechazada', 'none'],
    ]);
    expect(rows[2].note).toBe('Documento ilegible');
  });
});

describe('buildRequestVirtualAccountInput', () => {
  it('builds the mutation input from the picked option', () => {
    expect(
      buildRequestVirtualAccountInput(
        CUSTOMER_ID,
        option({ country: 'MX', currency: 'MXN', railCode: 'spei' })
      )
    ).toEqual({
      customerId: CUSTOMER_ID,
      country: 'MX',
      currency: 'MXN',
      railCode: 'spei',
    });
  });
});

describe('classifyRequestVirtualAccountError', () => {
  const failure = (code: string) => ({
    response: { errors: [{ message: code, extensions: { error_code: code } }] },
  });

  it.each([
    ['VA_BUSINESS_ONLY', 'Las cuentas virtuales son solo para empresas (incluye unipersonales).'],
    ['RAIL_UNDER_MAINTENANCE', 'El riel está en mantenimiento. Inténtalo más tarde.'],
    ['KYC_NOT_APPROVED', 'El cliente necesita el KYC aprobado.'],
    ['RAIL_NOT_AVAILABLE', 'Ese riel no está disponible para este país y moneda.'],
    ['VA_REQUEST_EXISTS', 'Ya existe una solicitud para este riel.'],
  ])('explains %s', (code, message) => {
    expect(classifyRequestVirtualAccountError(failure(code))).toBe(message);
  });

  it('returns undefined for unknown failures so the generic mapper is used', () => {
    expect(classifyRequestVirtualAccountError(new Error('boom'))).toBeUndefined();
  });
});
