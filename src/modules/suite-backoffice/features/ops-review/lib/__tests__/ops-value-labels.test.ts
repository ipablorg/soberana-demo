import { describe, expect, it } from 'vitest';
import type { MessageDescriptor } from '@lingui/core';

import {
  beneficiaryHolderLabel,
  customerTypeLabel,
  endorsementReasonLabel,
  railDisplayName,
  recaudoSourceLabel,
} from '../ops-value-labels';

const t = (descriptor: MessageDescriptor) => String(descriptor.message ?? descriptor.id);

describe('ops value labels', () => {
  it('names the customer type in Spanish', () => {
    expect(customerTypeLabel('business', t)).toBe('Empresa');
    expect(customerTypeLabel('INDIVIDUAL', t)).toBe('Persona natural');
    expect(customerTypeLabel('other', t)).toBe('other');
  });

  it('names the endorsement reason instead of the raw code', () => {
    expect(endorsementReasonLabel('customer_va_request', t)).toBe(
      'Solicitud de cuenta virtual del cliente'
    );
    expect(endorsementReasonLabel('Documentos vencidos', t)).toBe('Documentos vencidos');
    expect(endorsementReasonLabel(null, t)).toBe('—');
  });

  it('names the recaudo origin as the create form does', () => {
    expect(recaudoSourceLabel('bank_transfer', t)).toBe('Transferencia bancaria');
    expect(recaudoSourceLabel('provider_manual', t)).toBe('Manual del proveedor');
    expect(recaudoSourceLabel('wire_xyz', t)).toBe('wire_xyz');
    expect(recaudoSourceLabel(null, t)).toBe('—');
  });

  it('drops the internal "(legacy)" suffix from rail names', () => {
    expect(railDisplayName('ACH (legacy)')).toBe('ACH');
    expect(railDisplayName('SEPA')).toBe('SEPA');
  });

  it('names the beneficiary holder type and relationship (N-6)', () => {
    expect(beneficiaryHolderLabel('INDIVIDUAL', 'SELF', t)).toBe('Persona natural · Cuenta propia');
    expect(beneficiaryHolderLabel('BUSINESS', 'THIRD_PARTY', t)).toBe('Empresa · Tercero');
    expect(beneficiaryHolderLabel('INDIVIDUAL', 'NEW_KIND', t)).toBe('Persona natural · NEW_KIND');
  });
});
