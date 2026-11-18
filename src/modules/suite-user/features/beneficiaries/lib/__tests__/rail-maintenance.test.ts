import { describe, expect, it } from 'vitest';

import {
  MAINTENANCE_RAILS,
  isRailUnderMaintenance,
  readServerErrorCode,
} from '../rail-maintenance';

describe('isRailUnderMaintenance', () => {
  it('flags the Colombia, Ecuador and Peru rails', () => {
    expect([...MAINTENANCE_RAILS].sort()).toEqual([
      'co_ach',
      'co_breb',
      'ec_bank_transfer',
      'ec_point_of_sale',
      'pe_bank_transfer',
    ]);
    for (const rail of MAINTENANCE_RAILS) {
      expect(isRailUnderMaintenance(rail)).toBe(true);
    }
  });

  it('is case-insensitive and tolerates empty input', () => {
    expect(isRailUnderMaintenance('CO_BREB')).toBe(true);
    expect(isRailUnderMaintenance(null)).toBe(false);
    expect(isRailUnderMaintenance(undefined)).toBe(false);
    expect(isRailUnderMaintenance('')).toBe(false);
  });

  it('leaves working rails alone', () => {
    for (const rail of ['spei', 'pix', 'ach', 'wire', 'sepa', 'faster_payments']) {
      expect(isRailUnderMaintenance(rail)).toBe(false);
    }
  });
});

describe('readServerErrorCode', () => {
  it('reads extensions.error_code from a graphql-request error', () => {
    const error = {
      response: { errors: [{ extensions: { error_code: 'RAIL_UNDER_MAINTENANCE' } }] },
    };
    expect(readServerErrorCode(error)).toBe('RAIL_UNDER_MAINTENANCE');
  });

  it('returns undefined when there is no domain code', () => {
    expect(readServerErrorCode(new Error('boom'))).toBeUndefined();
    expect(readServerErrorCode(null)).toBeUndefined();
  });
});
