import { describe, expect, it } from 'vitest';

import { staffRowActions, staffStatusLabel } from '../staff-status';

describe('staffStatusLabel', () => {
  it('uses Spanish labels', () => {
    expect(staffStatusLabel(true)).toBe('Activo');
    expect(staffStatusLabel(false)).toBe('Inactivo');
  });
});

describe('staffRowActions', () => {
  it('offers Desactivar on active rows', () => {
    expect(staffRowActions({ isActive: true, isSelf: false })).toEqual({
      canEdit: true,
      toggle: 'deactivate',
    });
  });

  it('offers Reactivar (not Desactivar) on inactive rows', () => {
    expect(staffRowActions({ isActive: false, isSelf: false })).toEqual({
      canEdit: false,
      toggle: 'reactivate',
    });
  });

  it('locks the caller own row', () => {
    expect(staffRowActions({ isActive: true, isSelf: true })).toEqual({
      canEdit: false,
      toggle: null,
    });
  });
});
