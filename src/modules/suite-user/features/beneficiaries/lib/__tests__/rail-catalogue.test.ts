import { describe, expect, it } from 'vitest';

import {
  payoutCountries,
  payoutRails,
  railFamily,
  toIso3,
  type RailCatalogue,
} from '../rail-catalogue';
import { CATALOGUE_FIXTURE } from './catalogue-fixture';

const catalogue: RailCatalogue = CATALOGUE_FIXTURE;

describe('rail catalogue — payout selection (country -> rail)', () => {
  it('lists only countries with at least one usable OUTBOUND rail that supports beneficiaries', () => {
    const countries = payoutCountries(catalogue).map((c) => c.country);
    expect(countries).toEqual(expect.arrayContaining(['US', 'CO', 'DE']));
    // BR only has an inbound-only rail and EC has no usable provider
    expect(countries).not.toContain('BR');
    expect(countries).not.toContain('EC');
  });

  it('returns the payout rails of a country in catalogue order', () => {
    expect(payoutRails(catalogue, 'US').map((r) => r.code)).toEqual(['ach', 'wire', 'swift']);
    expect(payoutRails(catalogue, 'CO').map((r) => r.code)).toEqual(['co_ach']);
  });

  it('drops a rail whose OUTBOUND providers are all unavailable', () => {
    expect(payoutRails(catalogue, 'MX')).toEqual([]);
    expect(payoutCountries(catalogue).map((c) => c.country)).not.toContain('MX');
  });

  it('drops rails that cannot hold a beneficiary', () => {
    expect(payoutRails(catalogue, 'US').map((r) => r.code)).not.toContain('usdt_tron');
  });

  it('matches the country case-insensitively and returns [] for an unknown country', () => {
    expect(payoutRails(catalogue, 'us')).toHaveLength(3);
    expect(payoutRails(catalogue, 'ZZ')).toEqual([]);
    expect(payoutRails(undefined, 'US')).toEqual([]);
  });

  it('puts the owner-priority countries first, then the rest alphabetically by name', () => {
    const order = payoutCountries(catalogue).map((c) => c.country);
    expect(order[0]).toBe('CO');
  });
});

describe('rail catalogue — rail families', () => {
  it.each([
    ['ach', 'us-bank'],
    ['wire', 'us-bank'],
    ['WIRE', 'us-bank'],
    ['swift', 'swift'],
    ['co_ach', 'co-ach'],
    ['spei', 'spei'],
    ['pix', 'pix'],
    ['sepa', 'sepa'],
    ['faster_payments', 'uk'],
  ])('maps %s to %s', (code, family) => {
    expect(railFamily(code)).toBe(family);
  });

  it('returns null for a rail the form cannot capture yet', () => {
    expect(railFamily('co_breb')).toBeNull();
    expect(railFamily('usdt_tron')).toBeNull();
    expect(railFamily(undefined)).toBeNull();
  });
});

describe('rail catalogue — country codes', () => {
  it('converts the catalogue ISO2 to the ISO3 the beneficiary API accepts', () => {
    expect(toIso3('US')).toBe('USA');
    expect(toIso3('co')).toBe('COL');
    expect(toIso3('DE')).toBe('DEU');
    expect(toIso3('GB')).toBe('GBR');
  });

  it('returns undefined for an unknown code', () => {
    expect(toIso3('ZZ')).toBeUndefined();
  });
});
