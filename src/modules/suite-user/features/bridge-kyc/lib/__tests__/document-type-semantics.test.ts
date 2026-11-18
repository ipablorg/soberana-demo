import { describe, expect, it } from 'vitest';

import {
  documentTypeRequiresExpiration,
  documentTypeShowsExpiration,
  getDocumentExpirationMode,
} from '../document-type-semantics';

describe('document-type-semantics', () => {
  it('requires expiration for passports', () => {
    expect(getDocumentExpirationMode('COL', 'PASSPORT')).toBe('required');
    expect(documentTypeRequiresExpiration('COL', 'PASSPORT')).toBe(true);
    expect(documentTypeShowsExpiration('COL', 'PASSPORT')).toBe(true);
  });

  it('hides expiration for non-expiring national IDs in Mexico and Colombia', () => {
    expect(getDocumentExpirationMode('MEX', 'DNI')).toBe('hidden');
    expect(getDocumentExpirationMode('COL', 'DNI')).toBe('hidden');
    expect(documentTypeShowsExpiration('MEX', 'DNI')).toBe(false);
    expect(documentTypeRequiresExpiration('COL', 'DNI')).toBe(false);
  });

  it('keeps expiration optional for fallback national IDs', () => {
    expect(getDocumentExpirationMode('USA', 'DNI')).toBe('optional');
    expect(documentTypeShowsExpiration('USA', 'DNI')).toBe(true);
    expect(documentTypeRequiresExpiration('USA', 'DNI')).toBe(false);
  });
});
