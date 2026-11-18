import { describe, expect, it } from 'vitest';

import {
  buildRailGroups,
  defaultAllowedCountries,
  isMaintenanceRail,
  CLIENT_RAIL_PRIORITY,
  readAllowedCountries,
  type CatalogRail,
  type ClientRailRow,
  type OnboardedProvider,
} from '../client-operation';

const catalog: CatalogRail[] = [
  {
    providerId: 'p-mesta',
    providerCode: 'mesta',
    providerName: 'Mesta',
    railId: 'r-ach',
    railCode: 'ach',
    railName: 'ACH',
  },
  {
    providerId: 'p-mesta',
    providerCode: 'mesta',
    providerName: 'Mesta',
    railId: 'r-breb',
    railCode: 'co_breb',
    railName: 'Bre-B',
  },
  {
    providerId: 'p-kira',
    providerCode: 'kirafin',
    providerName: 'KiraFin',
    railId: 'r-wire',
    railCode: 'wire',
    railName: 'Wire',
  },
];

const onboarded = (...codes: string[]): OnboardedProvider[] => codes.map((code) => ({ code }));

describe('allowed customer countries', () => {
  it('defaults to the client own country, upper-cased, or nothing', () => {
    expect(defaultAllowedCountries('col')).toEqual(['COL']);
    expect(defaultAllowedCountries('')).toEqual([]);
    expect(defaultAllowedCountries(null)).toEqual([]);
  });

  it('reads the stored list from the client config and ignores bad shapes', () => {
    expect(readAllowedCountries({ allowedCustomerCountries: ['USA', 'COL'] })).toEqual([
      'USA',
      'COL',
    ]);
    expect(readAllowedCountries({})).toBeNull();
    expect(readAllowedCountries(null)).toBeNull();
    expect(readAllowedCountries({ allowedCustomerCountries: 'USA' })).toBeNull();
    expect(readAllowedCountries({ allowedCustomerCountries: [] })).toBeNull();
  });
});

describe('maintenance rails', () => {
  it.each(['co_breb', 'ec_bank_transfer', 'ec_point_of_sale', 'pe_bank_transfer', 'CO_BREB'])(
    'flags %s',
    (code) => expect(isMaintenanceRail(code)).toBe(true)
  );

  it('does not flag operational rails', () => {
    expect(isMaintenanceRail('ach')).toBe(false);
    expect(isMaintenanceRail('co_ach')).toBe(false);
  });
});

describe('buildRailGroups', () => {
  it('lists only the rails of providers the client is onboarded with, grouped by provider', () => {
    const groups = buildRailGroups(catalog, onboarded('mesta'), []);

    expect(groups.map((g) => g.providerCode)).toEqual(['mesta']);
    expect(groups[0]?.rails.map((r) => r.railCode)).toEqual(['ach', 'co_breb']);
  });

  it('returns nothing while no provider is onboarded', () => {
    expect(buildRailGroups(catalog, [], [])).toEqual([]);
  });

  it('marks a rail enabled only when the client rail row is active and remembers its id', () => {
    const clientRails: ClientRailRow[] = [
      { id: 'cpr-1', providerId: 'p-mesta', railId: 'r-ach', priority: 1, isActive: true },
      { id: 'cpr-2', providerId: 'p-kira', railId: 'r-wire', priority: 1, isActive: false },
    ];

    const groups = buildRailGroups(catalog, onboarded('mesta', 'kirafin'), clientRails);
    const ach = groups.flatMap((g) => g.rails).find((r) => r.railCode === 'ach');
    const wire = groups.flatMap((g) => g.rails).find((r) => r.railCode === 'wire');

    expect(ach).toMatchObject({ enabled: true, clientRailId: 'cpr-1' });
    expect(wire).toMatchObject({ enabled: false, clientRailId: 'cpr-2' });
  });

  it('flags maintenance rails so they cannot be switched on', () => {
    const groups = buildRailGroups(catalog, onboarded('mesta'), []);
    const breb = groups[0]?.rails.find((r) => r.railCode === 'co_breb');

    expect(breb).toMatchObject({ maintenance: true, canEnable: false });
    expect(groups[0]?.rails.find((r) => r.railCode === 'ach')).toMatchObject({
      maintenance: false,
      canEnable: true,
    });
  });

  it('lets an already enabled maintenance rail be switched off', () => {
    const clientRails: ClientRailRow[] = [
      { id: 'cpr-9', providerId: 'p-mesta', railId: 'r-breb', priority: 1, isActive: true },
    ];

    const groups = buildRailGroups(catalog, onboarded('mesta'), clientRails);

    expect(groups[0]?.rails.find((r) => r.railCode === 'co_breb')).toMatchObject({
      enabled: true,
      canDisable: true,
    });
  });
});

describe('#411: the provider is fixed by the catalogue, the operator only switches rails', () => {
  const mesta = [{ code: 'mesta' }, { code: 'kirafin' }];

  it('always creates a client rail with priority 1 (priority is not an operator choice)', () => {
    expect(CLIENT_RAIL_PRIORITY).toBe(1);
  });

  it('never lists a dead or inactive provider, an inactive pairing or rail, or an alias rail', () => {
    const groups = buildRailGroups(
      [
        { ...catalog[0] },
        { ...catalog[0], providerId: 'p-bridge', providerCode: 'bridge', providerName: 'Bridge' },
        {
          ...catalog[0],
          railId: 'r-us-ach',
          railCode: 'us_ach',
          railName: 'US ACH',
          railCanonicalCode: 'ach',
        },
        { ...catalog[1], railActive: false },
        { ...catalog[2], providerActive: false },
      ],
      [...mesta, { code: 'bridge' }],
      []
    );

    expect(groups.flatMap((group) => group.rails.map((rail) => rail.railCode))).toEqual(['ach']);
  });

  it('blocks switching a rail on when another provider already serves it for the client', () => {
    const groups = buildRailGroups(
      [
        catalog[0],
        { ...catalog[0], providerId: 'p-kira', providerCode: 'kirafin', providerName: 'KiraFin' },
      ],
      mesta,
      [{ id: 'cpr-1', providerId: 'p-mesta', railId: 'r-ach', priority: 1, isActive: true }]
    );
    const kira = groups.find((group) => group.providerCode === 'kirafin')?.rails[0];
    const mestaAch = groups.find((group) => group.providerCode === 'mesta')?.rails[0];

    expect(mestaAch?.enabled).toBe(true);
    expect(kira?.canEnable).toBe(false);
    expect(kira?.servedByOtherProvider).toBe(true);
  });
});
