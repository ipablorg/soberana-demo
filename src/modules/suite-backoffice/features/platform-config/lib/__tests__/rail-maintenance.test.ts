import { describe, expect, it } from 'vitest';

import { isRailUnderMaintenance } from '../rail-maintenance';

describe('isRailUnderMaintenance', () => {
  it.each(['co_ach', 'co_breb', 'ec_bank_transfer', 'ec_point_of_sale', 'pe_bank_transfer'])(
    '%s is in maintenance',
    (code) => {
      expect(isRailUnderMaintenance(code)).toBe(true);
    }
  );

  it('keeps operational rails untouched', () => {
    expect(isRailUnderMaintenance('ach_us')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isRailUnderMaintenance('CO_BREB')).toBe(true);
  });
});
