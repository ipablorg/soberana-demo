import { describe, expect, it } from 'vitest';
import {
  getVaRailCatalog,
  getVaRailCatalogEntry,
  getVaRailDisplayName,
} from '../va-rail-catalog';

describe('va-rail-catalog', () => {
  it('exposes the five money-flow v2 receive rails with name, currency and flag', () => {
    const catalog = getVaRailCatalog();

    expect(catalog.map((entry) => entry.code)).toEqual([
      'sepa',
      'ach_wire',
      'faster_payments',
      'spei',
      'pix',
    ]);

    for (const entry of catalog) {
      expect(entry.name.trim().length).toBeGreaterThan(0);
      expect(entry.currency).toMatch(/^[A-Z]{3}$/);
      expect(entry.flag.length).toBeGreaterThan(0);
      expect(entry.description.trim().length).toBeGreaterThan(0);
    }
  });

  it('resolves each catalog rail by its canonical code', () => {
    expect(getVaRailCatalogEntry('sepa')?.currency).toBe('EUR');
    expect(getVaRailCatalogEntry('ach_wire')?.currency).toBe('USD');
    expect(getVaRailCatalogEntry('faster_payments')?.currency).toBe('GBP');
    expect(getVaRailCatalogEntry('spei')?.currency).toBe('MXN');
    expect(getVaRailCatalogEntry('pix')?.currency).toBe('BRL');
  });

  it('resolves backend/legacy rail aliases onto the catalog entry', () => {
    // ach + wire (and their us_* variants) are the split halves of ach_wire
    expect(getVaRailCatalogEntry('ach')?.code).toBe('ach_wire');
    expect(getVaRailCatalogEntry('wire')?.code).toBe('ach_wire');
    expect(getVaRailCatalogEntry('US_ACH')?.code).toBe('ach_wire');
    expect(getVaRailCatalogEntry('us_wire')?.code).toBe('ach_wire');
    // iban rides SEPA, br_ted rides PIX
    expect(getVaRailCatalogEntry('iban')?.code).toBe('sepa');
    expect(getVaRailCatalogEntry('br_ted')?.code).toBe('pix');
  });

  it('returns null for unknown or empty rails instead of guessing', () => {
    expect(getVaRailCatalogEntry('co_breb')).toBeNull();
    expect(getVaRailCatalogEntry('')).toBeNull();
    expect(getVaRailCatalogEntry(null)).toBeNull();
    expect(getVaRailCatalogEntry(undefined)).toBeNull();
  });

  it('falls back to a prettified rail code for display names', () => {
    expect(getVaRailDisplayName('spei')).toBe('SPEI');
    expect(getVaRailDisplayName('co_breb')).toBe('Co Breb');
    expect(getVaRailDisplayName('')).toBeNull();
  });
});
