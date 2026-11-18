import { describe, expect, it } from 'vitest';

import {
  providerBlockerLabel,
  providerFieldLabel,
  sourceText,
} from '@/shared/lib/provider-field-labels';
import { checkFile } from '@/shared/lib/file-data-url';
import {
  REQUIREMENT_FILE_MAX_BYTES,
  REQUIREMENT_FILE_TYPES,
  buildRequirementSubmitInput,
  isProviderConsoleRequirement,
  requirementOptionLabel,
  requirementStatusLabel,
  requirementsAwaitingCustomer,
} from '@/shared/lib/provider-requirements';

describe('provider requirements (S21)', () => {
  it('keeps for the customer only what was never sent or was rejected', () => {
    const items = [
      { id: 'a', status: 'REQUESTED' as const },
      { id: 'b', status: 'UPLOADED' as const },
      { id: 'c', status: 'REJECTED' as const },
      { id: 'd', status: 'APPROVED' as const },
    ];

    expect(requirementsAwaitingCustomer(items).map((item) => item.id)).toEqual(['a', 'c']);
  });

  it('labels statuses in Spanish', () => {
    expect(requirementStatusLabel('UPLOADED', sourceText)).toBe('Por revisar');
    expect(requirementStatusLabel('SUBMITTED', sourceText)).toBe('Enviado al proveedor');
  });

  it('builds a document answer only with a file, its name and type', () => {
    const requirement = { id: 'r-1', kind: 'DOCUMENT' as const };

    expect(buildRequirementSubmitInput('c-1', requirement, { value: 'x' })).toBeNull();
    expect(
      buildRequirementSubmitInput('c-1', requirement, {
        file: 'data:application/pdf;base64,AAA',
        fileName: 'acta.pdf',
        mimeType: 'application/pdf',
      })
    ).toEqual({
      customerId: 'c-1',
      requirementId: 'r-1',
      documents: [
        {
          fileName: 'acta.pdf',
          mimeType: 'application/pdf',
          file: 'data:application/pdf;base64,AAA',
        },
      ],
    });
  });

  it('builds a value answer trimmed, never blank, and none for UBO steps', () => {
    expect(
      buildRequirementSubmitInput('c-1', { id: 'r-2', kind: 'VALUE' }, { value: '  123  ' })
    ).toEqual({ customerId: 'c-1', requirementId: 'r-2', value: '123' });
    expect(
      buildRequirementSubmitInput('c-1', { id: 'r-2', kind: 'VALUE' }, { value: ' ' })
    ).toBeNull();
    expect(
      buildRequirementSubmitInput('c-1', { id: 'r-3', kind: 'UBO_LINK' }, { value: 'x' })
    ).toBeNull();
  });

  it('N4: labels the documented answers in Spanish, humanizing the rest', () => {
    expect(requirementOptionLabel('Yes', sourceText)).toBe('Sí');
    expect(requirementOptionLabel('No', sourceText)).toBe('No');
    expect(requirementOptionLabel('less_than_10', sourceText)).toBe('Menos de 10');
    expect(requirementOptionLabel('operating_a_company', sourceText)).toBe(
      'Operación de la empresa'
    );
    expect(requirementOptionLabel('construction_of_buildings', sourceText)).toBe(
      'Construction of buildings'
    );
  });

  it('T-S21C: tells the items Loopay completes at the provider', () => {
    expect(isProviderConsoleRequirement({ handling: 'PROVIDER_CONSOLE' })).toBe(true);
    expect(isProviderConsoleRequirement({ handling: 'PROVIDER_API' })).toBe(false);
    expect(isProviderConsoleRequirement({ handling: null })).toBe(false);
  });

  it('N7: names the Mesta business documents and codes in Spanish', () => {
    expect(providerFieldLabel('address_proof', sourceText)).toBe(
      'Comprobante de domicilio de la empresa'
    );
    expect(providerFieldLabel('business_registration_proof', sourceText)).toBe(
      'Comprobante de registro mercantil'
    );
    for (const code of ['MESTA_UBO_NOT_CREATED', 'MESTA_SENDER_BUSINESS_DOCUMENTS_NOT_ADDED']) {
      expect(providerFieldLabel(code, sourceText)).not.toBe(code);
      expect(providerBlockerLabel(code, null, sourceText)).not.toBe(code);
    }
    expect(
      providerBlockerLabel('MESTA_VERIFY_FAILED', 'At least one UBO is required.', sourceText)
    ).toBe('Mesta no pudo iniciar la verificación: At least one UBO is required.');
  });

  it('accepts PDF, PNG and JPEG up to 10 MB only', () => {
    expect(
      checkFile(
        { type: 'application/pdf', size: 1000 },
        REQUIREMENT_FILE_TYPES,
        REQUIREMENT_FILE_MAX_BYTES
      )
    ).toBeNull();
    expect(
      checkFile(
        { type: 'image/gif', size: 1000 },
        REQUIREMENT_FILE_TYPES,
        REQUIREMENT_FILE_MAX_BYTES
      )
    ).toBe('type');
    expect(
      checkFile(
        { type: 'image/png', size: REQUIREMENT_FILE_MAX_BYTES + 1 },
        REQUIREMENT_FILE_TYPES,
        REQUIREMENT_FILE_MAX_BYTES
      )
    ).toBe('size');
  });
});
