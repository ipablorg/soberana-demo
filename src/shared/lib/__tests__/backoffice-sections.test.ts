import { describe, expect, it } from 'vitest';

import { getBackofficeSections } from '@/shared/config/backoffice-modes.config';

const titles = (mode: Parameters<typeof getBackofficeSections>[0], staffRoles: string[]) =>
  getBackofficeSections(mode, { staffRoles }).flatMap((group) =>
    group.items.map((item) => item.title)
  );

describe('getBackofficeSections role filtering', () => {
  it('shows LOOPAY_ADMIN every section of every mode', () => {
    const roles = ['LOOPAY_ADMIN'];

    expect(titles('companies', roles)).toEqual(
      expect.arrayContaining(['Clientes', 'Usuarios finales', 'Transacciones', 'Cuentas virtuales'])
    );
    expect(titles('move', roles)).toHaveLength(2);
    expect(titles('compliance', roles)).toHaveLength(4);
  });

  it('shows LOOPAY_OPERATIONS all OPS_* sections but not the PLATFORM_ADMIN ones', () => {
    const roles = ['LOOPAY_OPERATIONS'];

    expect(titles('move', roles)).toHaveLength(2);
    expect(titles('compliance', roles)).toHaveLength(4);
    expect(titles('companies', roles)).toContain('Cuentas virtuales');
    expect(titles('companies', roles)).not.toContain('Clientes');
  });

  it('hides sections an OPS_KYC-only staff member cannot use', () => {
    const roles = ['OPS_KYC'];

    expect(titles('compliance', roles)).toHaveLength(3);
    expect(titles('move', roles)).toEqual([]);
    expect(titles('companies', roles)).toEqual([]);
  });

  it('drops groups left empty by the filter', () => {
    const groups = getBackofficeSections('move', { staffRoles: ['OPS_RECAUDOS'] });

    expect(groups).toHaveLength(1);
    expect(groups[0].items.map((item) => item.title)).toEqual(['Depósitos manuales']);
  });

  it('does not filter when no staff roles are provided (legacy callers)', () => {
    expect(getBackofficeSections('move')[0].items).toHaveLength(2);
  });
});
