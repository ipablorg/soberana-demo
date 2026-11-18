import { describe, expect, it } from 'vitest';

import {
  GRANTABLE_ROLES,
  buildCreateStaffInput,
  isRoleChangeConfirmationRequired,
} from '../staff-role-change';

describe('GRANTABLE_ROLES', () => {
  it('lets a LOOPAY_ADMIN grant LOOPAY_ADMIN (contract C2)', () => {
    expect(GRANTABLE_ROLES).toContain('LOOPAY_ADMIN');
  });

  it('offers exactly super admin, operations and commercial', () => {
    expect([...GRANTABLE_ROLES]).toEqual(['LOOPAY_ADMIN', 'LOOPAY_OPERATIONS', 'OPS_COMMERCIAL']);
  });
});

describe('buildCreateStaffInput', () => {
  it('sends only email, first name, last name and role (no Firebase UID)', () => {
    const input = buildCreateStaffInput({
      email: ' ana@loopay.com ',
      firstName: ' Ana ',
      lastName: ' Pérez ',
      staffRole: 'OPS_COMMERCIAL',
    });

    expect(input).toEqual({
      email: 'ana@loopay.com',
      firstName: 'Ana',
      lastName: 'Pérez',
      staffRole: 'OPS_COMMERCIAL',
    });
    expect('authUid' in input).toBe(false);
  });

  it('omits empty names instead of sending blanks', () => {
    const input = buildCreateStaffInput({
      email: 'a@b.co',
      firstName: ' ',
      lastName: '',
      staffRole: 'LOOPAY_OPERATIONS',
    });

    expect(input).toEqual({ email: 'a@b.co', staffRole: 'LOOPAY_OPERATIONS' });
  });
});

describe('isRoleChangeConfirmationRequired', () => {
  it('requires confirmation when granting LOOPAY_ADMIN', () => {
    expect(isRoleChangeConfirmationRequired('OPS_KYC', 'LOOPAY_ADMIN')).toBe(true);
    expect(isRoleChangeConfirmationRequired(null, 'LOOPAY_ADMIN')).toBe(true);
  });

  it('requires confirmation for any role change', () => {
    expect(isRoleChangeConfirmationRequired('OPS_KYC', 'OPS_VA')).toBe(true);
  });

  it('does not require confirmation when the role is unchanged', () => {
    expect(isRoleChangeConfirmationRequired('OPS_KYC', 'OPS_KYC')).toBe(false);
  });
});
