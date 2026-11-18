import { i18n, type MessageDescriptor } from '@lingui/core';
import { describe, expect, it } from 'vitest';

import {
  describeRepairVirtualAccountError,
  isRepairableRequest,
  needsManualBankDetails,
} from '../repair-virtual-account';

function graphQLError(message: string, code?: string) {
  return { response: { errors: [{ message, extensions: code ? { code } : {} }] } };
}

describe('needsManualBankDetails (S22)', () => {
  it('opens the typed bank details only on VA_MANUAL_BANK_DETAILS_REQUIRED', () => {
    expect(needsManualBankDetails(graphQLError('x', 'VA_MANUAL_BANK_DETAILS_REQUIRED'))).toBe(true);
    expect(needsManualBankDetails(graphQLError('x', 'VA_PROVIDER_BANK_DETAILS_MISSING'))).toBe(
      false
    );
    expect(needsManualBankDetails(graphQLError('Provider returned no bank details for va_1'))).toBe(
      false
    );
    expect(
      needsManualBankDetails(
        graphQLError('Bank details for rail ach miss: routing_number', 'VA_BANK_DETAILS_INCOMPLETE')
      )
    ).toBe(false);
  });

  it('does not for other failures', () => {
    expect(
      needsManualBankDetails(
        graphQLError('Provider account not found', 'VA_PROVIDER_ACCOUNT_NOT_FOUND')
      )
    ).toBe(false);
    expect(needsManualBankDetails(new Error('network'))).toBe(false);
  });
});

describe('describeRepairVirtualAccountError (S22)', () => {
  i18n.load('es', {});
  i18n.activate('es');
  const t = (descriptor: MessageDescriptor) => i18n._(descriptor);

  it('explains the provider account refusals in Spanish', () => {
    expect(
      describeRepairVirtualAccountError(graphQLError('x', 'VA_PROVIDER_ACCOUNT_NOT_FOUND'), t)
    ).toBe('El proveedor no tiene una cuenta con ese ID para este cliente. Verifique el ID.');
    expect(
      describeRepairVirtualAccountError(graphQLError('x', 'VA_PROVIDER_ACCOUNT_NOT_OWNED'), t)
    ).toBe('Esa cuenta del proveedor pertenece a otro cliente. No se puede vincular aquí.');
  });

  it('leaves any other failure to the default mapping', () => {
    expect(describeRepairVirtualAccountError(graphQLError('x', 'OTHER'), t)).toBeUndefined();
  });
});

describe('isRepairableRequest (S22)', () => {
  const base = {
    state: 'REQUESTED',
    blockers: [],
  };
  const blocker = { code: 'X', category: 'c', message: 'm' };

  it('repairs PROVIDER_ONBOARDING, or REQUESTED with blockers, like the backend', () => {
    expect(isRepairableRequest({ ...base, state: 'PROVIDER_ONBOARDING' })).toBe(true);
    expect(isRepairableRequest({ ...base, blockers: [blocker] })).toBe(true);
  });

  it('refuses every other request the backend would refuse', () => {
    expect(isRepairableRequest(base)).toBe(false);
    expect(isRepairableRequest({ ...base, state: 'OPS_APPROVED', blockers: [blocker] })).toBe(
      false
    );
    expect(
      isRepairableRequest({
        ...base,
        missingFields: ['registrationNumber'],
      } as Parameters<typeof isRepairableRequest>[0])
    ).toBe(false);
  });
});
