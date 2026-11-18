import { describe, expect, it } from 'vitest';
import { resolveDocumentNumberPrefill } from '../document-number-prefill';

describe('resolveDocumentNumberPrefill', () => {
  it('reuses the SSN typed as tax id for a US SSN document', () => {
    expect(
      resolveDocumentNumberPrefill({
        documentType: 'SSN',
        currentNumber: '',
        taxId: '123-45-6789',
        taxIdType: 'SSN',
      })
    ).toBe('123-45-6789');
  });

  it('reuses the tax id when its type is not an SSN/ITIN code', () => {
    expect(
      resolveDocumentNumberPrefill({
        documentType: 'SSN',
        currentNumber: undefined,
        taxId: '123-45-6789',
        taxIdType: 'tax_id',
      })
    ).toBe('123-45-6789');
  });

  it('does not bring the prefill back after the user cleared the field', () => {
    expect(
      resolveDocumentNumberPrefill({
        documentType: 'SSN',
        currentNumber: '',
        taxId: '123-45-6789',
        taxIdType: 'SSN',
        userEdited: true,
      })
    ).toBeNull();
  });

  it('never overwrites a number the user already typed', () => {
    expect(
      resolveDocumentNumberPrefill({
        documentType: 'SSN',
        currentNumber: '999-99-9999',
        taxId: '123-45-6789',
        taxIdType: 'SSN',
      })
    ).toBeNull();
  });

  it('does not mix an ITIN tax id into an SSN document', () => {
    expect(
      resolveDocumentNumberPrefill({
        documentType: 'SSN',
        currentNumber: '',
        taxId: '900-70-0000',
        taxIdType: 'ITIN',
      })
    ).toBeNull();
  });

  it('does nothing for non-US documents or when no tax id is known', () => {
    expect(
      resolveDocumentNumberPrefill({
        documentType: 'PASSPORT',
        currentNumber: '',
        taxId: '123',
        taxIdType: 'SSN',
      })
    ).toBeNull();
    expect(
      resolveDocumentNumberPrefill({
        documentType: 'SSN',
        currentNumber: '',
        taxId: '',
        taxIdType: 'SSN',
      })
    ).toBeNull();
  });
});
