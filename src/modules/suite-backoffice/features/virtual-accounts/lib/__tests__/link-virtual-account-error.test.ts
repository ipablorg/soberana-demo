import { i18n, type MessageDescriptor } from '@lingui/core';
import { describe, expect, it } from 'vitest';

import { describeLinkVirtualAccountError } from '../link-virtual-account-error';

i18n.load('es', {});
i18n.activate('es');
const sourceText = (descriptor: MessageDescriptor) => i18n._(descriptor);

function graphQLError(message: string, extensions: Record<string, unknown>) {
  return { response: { errors: [{ message, extensions }] } };
}

describe('describeLinkVirtualAccountError (NF-5)', () => {
  it('explains in Spanish that the customer already has an account on that rail', () => {
    const error = graphQLError("Customer already has a ACTIVE virtual account on rail 'ach'", {
      code: 'CONFLICT',
      status_code: 409,
    });

    expect(describeLinkVirtualAccountError(error, sourceText)).toBe(
      'El cliente ya tiene una cuenta virtual en el riel ACH (estado: Activo). Desactívela antes de vincular otra.'
    );
  });

  it('names the missing bank details and the unsupported provider', () => {
    expect(
      describeLinkVirtualAccountError(
        graphQLError("Bank details for rail 'wire' miss: routingNumber", {
          code: 'VA_BANK_DETAILS_INCOMPLETE',
        }),
        sourceText
      )
    ).toBe('Faltan datos bancarios del riel: routingNumber.');
    expect(
      describeLinkVirtualAccountError(
        graphQLError("Provider 'bridge' does not issue virtual accounts", {
          code: 'VA_PROVIDER_NOT_SUPPORTED',
        }),
        sourceText
      )
    ).toBe('Este proveedor no emite cuentas virtuales.');
  });

  it('leaves any other failure to the default mapping', () => {
    expect(describeLinkVirtualAccountError(new Error('network'), sourceText)).toBeUndefined();
  });
});
