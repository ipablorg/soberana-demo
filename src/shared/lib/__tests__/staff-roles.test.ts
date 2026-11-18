import { describe, expect, it } from 'vitest';

import { canAddWallet, hasStaffRole } from '../staff-roles';

describe('hasStaffRole', () => {
  it('grants a role the user holds', () => {
    // Arrange
    const roles = ['OPS_KYC', 'PLATFORM_ADMIN'];

    // Act
    const granted = hasStaffRole(roles, 'PLATFORM_ADMIN');

    // Assert
    expect(granted).toBe(true);
  });

  it('treats LOOPAY_ADMIN as a superuser for any role', () => {
    // Arrange
    const roles = ['LOOPAY_ADMIN'];

    // Act
    const granted = hasStaffRole(roles, 'PLATFORM_ADMIN');

    // Assert
    expect(granted).toBe(true);
  });

  it('does not let LOOPAY_OPERATIONS pass the PLATFORM_ADMIN gate', () => {
    // Arrange
    const roles = ['LOOPAY_OPERATIONS', 'OPS_RECAUDOS'];

    // Act
    const granted = hasStaffRole(roles, 'PLATFORM_ADMIN');

    // Assert
    expect(granted).toBe(false);
  });

  it.each([[undefined], [null], [[]]])('denies when the roles list is %s', (roles) => {
    // Act
    const granted = hasStaffRole(roles, 'PLATFORM_ADMIN');

    // Assert
    expect(granted).toBe(false);
  });
});

describe('LOOPAY_OPERATIONS and OPS_* gates', () => {
  it('lets LOOPAY_OPERATIONS pass any OPS_* role gate', () => {
    expect(hasStaffRole(['LOOPAY_OPERATIONS'], 'OPS_VA')).toBe(true);
    expect(hasStaffRole(['LOOPAY_OPERATIONS'], 'OPS_COMMERCIAL')).toBe(true);
  });
});

describe('canAddWallet', () => {
  it.each([['LOOPAY_ADMIN'], ['LOOPAY_OPERATIONS'], ['OPS_VA']])(
    'allows %s to add a wallet',
    (role) => {
      expect(canAddWallet([role])).toBe(true);
    }
  );

  // #411: commercial reads wallets but never provisions one (back moved
  // adminLoopay_createWallet to operations).
  it.each([
    ['OPS_COMMERCIAL'],
    ['OPS_KYC'],
    ['OPS_RECAUDOS'],
    ['OPS_DISPERSIONES'],
    ['PLATFORM_ADMIN'],
  ])('denies %s', (role) => {
    expect(canAddWallet([role])).toBe(false);
  });

  it('denies an empty or missing roles list', () => {
    expect(canAddWallet([])).toBe(false);
    expect(canAddWallet(null)).toBe(false);
  });
});
