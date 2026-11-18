import { describe, expect, it } from 'vitest';

import {
  canManageClients,
  canReadClients,
  taxIdTypeLabel,
  taxIdTypeOptions,
} from '../clients-logic';

const types = [
  { id: '2886ee28-aaaa', name: 'NIT', countries: ['COL'] },
  { id: '9999ee28-bbbb', name: 'EIN', countries: null },
];

describe('taxIdTypeLabel', () => {
  it('shows the code, never the UUID', () => {
    expect(taxIdTypeLabel('2886ee28-aaaa', types)).toBe('NIT');
  });

  it('does not leak the UUID when the type is unknown', () => {
    expect(taxIdTypeLabel('0000-unknown', types)).toBe('—');
  });
});

describe('taxIdTypeOptions', () => {
  it('builds select options with the code and countries', () => {
    expect(taxIdTypeOptions(types)).toEqual([
      { value: '2886ee28-aaaa', label: 'NIT (COL)' },
      { value: '9999ee28-bbbb', label: 'EIN' },
    ]);
  });
});

describe('canManageClients', () => {
  it('allows the superuser and PLATFORM_ADMIN', () => {
    expect(canManageClients(['LOOPAY_ADMIN'])).toBe(true);
    expect(canManageClients(['PLATFORM_ADMIN'])).toBe(true);
  });

  it('denies OPS_COMMERCIAL and LOOPAY_OPERATIONS (updateClient is PLATFORM_ADMIN)', () => {
    expect(canManageClients(['OPS_COMMERCIAL'])).toBe(false);
    expect(canManageClients(['LOOPAY_OPERATIONS'])).toBe(false);
    expect(canManageClients(undefined)).toBe(false);
  });
});

describe('canReadClients (#411: listClients is PLATFORM_ADMIN or OPS_COMMERCIAL, exact)', () => {
  it.each([[['LOOPAY_ADMIN']], [['OPS_COMMERCIAL']], [['PLATFORM_ADMIN']]])(
    'allows %j',
    (roles) => {
      expect(canReadClients(roles)).toBe(true);
    }
  );

  it.each([[['LOOPAY_OPERATIONS']], [['OPS_KYC']], [[]], [undefined]])('denies %j', (roles) => {
    expect(canReadClients(roles)).toBe(false);
  });
});
