import { describe, expect, it } from 'vitest';

import {
  canAccessBackofficeRoute,
  getBackofficeAccess,
  getBackofficeLandingRoute,
  getBackofficeSections,
  getVisibleBackofficeModes,
} from '@/shared/config/backoffice-modes.config';
import {
  GRANTABLE_STAFF_ROLES,
  canAccessCommercialSection,
  canOperateMoney,
  canRequestVirtualAccount,
  isLegacyStaffRole,
  staffRoleLabel,
} from '@/shared/lib/staff-roles';

const SUPER_ADMIN = ['LOOPAY_ADMIN'];
const OPERATIONS = ['LOOPAY_OPERATIONS'];
const COMMERCIAL = ['OPS_COMMERCIAL'];

const sidebar = (roles: string[]) =>
  getVisibleBackofficeModes(getBackofficeAccess(roles)).map((mode) => ({
    mode: mode.id,
    titles: getBackofficeSections(mode.id, getBackofficeAccess(roles)).flatMap((group) =>
      group.items.map((item) => item.title)
    ),
  }));

const titlesOf = (roles: string[]) => sidebar(roles).flatMap((entry) => entry.titles);

const ALL_CLIENT_SCREENS = [
  '/backoffice/clients',
  '/backoffice/customers',
  '/backoffice/transactions',
  '/backoffice/virtual-accounts',
  '/backoffice/move/recaudos',
  '/backoffice/move/dispersiones',
  '/backoffice/compliance-review',
  '/backoffice/compliance/endorsements',
  '/backoffice/compliance/beneficiaries',
  '/backoffice/provider-requirements',
];

describe('three-role sidebar', () => {
  it('shows the super admin everything, platform and staff users included', () => {
    expect(sidebar(SUPER_ADMIN).map((entry) => entry.mode)).toEqual([
      'companies',
      'move',
      'compliance',
    ]);
    expect(titlesOf(SUPER_ADMIN)).toEqual(
      expect.arrayContaining([
        'Clientes',
        'Usuarios finales',
        'Transacciones',
        'Cuentas virtuales',
        'Configuración y tarifas',
        'Proveedores y rieles',
        'Usuarios internos',
        'Depósitos manuales',
        'Retiros manuales',
        'Revisión KYC',
        'Habilitaciones de riel',
        'Beneficiarios',
        'Requerimientos de proveedores',
      ])
    );
  });

  it('shows operations every money screen but never clients, the commercial section or the platform', () => {
    const titles = titlesOf(OPERATIONS);

    expect(titles).toEqual([
      'Usuarios finales',
      'Transacciones',
      'Cuentas virtuales',
      'Depósitos manuales',
      'Retiros manuales',
      'Revisión KYC',
      'Habilitaciones de riel',
      'Beneficiarios',
      'Requerimientos de proveedores',
    ]);
  });

  it('shows commercial every client screen (read-only) plus Setup and fees, never the platform', () => {
    expect(sidebar(COMMERCIAL).map((entry) => entry.mode)).toEqual([
      'companies',
      'move',
      'compliance',
    ]);
    expect(titlesOf(COMMERCIAL)).toEqual([
      'Clientes',
      'Usuarios finales',
      'Transacciones',
      'Cuentas virtuales',
      'Configuración y tarifas',
      'Depósitos manuales',
      'Retiros manuales',
      'Revisión KYC',
      'Habilitaciones de riel',
      'Beneficiarios',
      'Requerimientos de proveedores',
    ]);
  });

  it('labels the sidebar in one language (no English section or mode names)', () => {
    const modes = getVisibleBackofficeModes(getBackofficeAccess(SUPER_ADMIN)).map(
      (mode) => mode.label
    );

    expect(modes).toEqual(['Empresas', 'Movimientos', 'Cumplimiento']);
    for (const title of titlesOf(SUPER_ADMIN)) {
      expect(['Clients', 'Customer 360', 'Usuarios staff', 'Onboarding y fees']).not.toContain(
        title
      );
    }
  });

  it('keeps each legacy role its current visibility', () => {
    expect(titlesOf(['OPS_VA'])).toEqual(['Usuarios finales', 'Cuentas virtuales']);
    expect(titlesOf(['OPS_KYC'])).toEqual([
      'Revisión KYC',
      'Habilitaciones de riel',
      'Beneficiarios',
    ]);
    expect(titlesOf(['OPS_RECAUDOS'])).toEqual(['Depósitos manuales']);
    expect(titlesOf(['PLATFORM_ADMIN'])).toEqual(
      expect.arrayContaining(['Clientes', 'Proveedores y rieles'])
    );
  });
});

describe('three-role routes and landing', () => {
  it.each(ALL_CLIENT_SCREENS)('lets commercial open %s', (url) => {
    expect(canAccessBackofficeRoute(url, COMMERCIAL)).toBe(true);
  });

  it('never lets operations open the clients list (they cannot create clients)', () => {
    expect(canAccessBackofficeRoute('/backoffice/clients', OPERATIONS)).toBe(false);
    for (const url of ALL_CLIENT_SCREENS.filter((u) => u !== '/backoffice/clients')) {
      expect(canAccessBackofficeRoute(url, OPERATIONS)).toBe(true);
    }
  });

  it('gates the clients list and the platform on the three roles, not the legacy PLATFORM_ADMIN', () => {
    expect(canAccessBackofficeRoute('/backoffice/clients', SUPER_ADMIN)).toBe(true);
    expect(getBackofficeAccess(SUPER_ADMIN).canAccessPlatformConfig).toBe(true);
    expect(getBackofficeAccess(COMMERCIAL).canAccessPlatformConfig).toBe(false);
    expect(getBackofficeAccess(OPERATIONS).canAccessPlatformConfig).toBe(false);
  });

  it('lands each of the three roles on a section it can open', () => {
    expect(getBackofficeLandingRoute(getBackofficeAccess(SUPER_ADMIN))).toBe(
      '/backoffice/compliance-review'
    );
    expect(getBackofficeLandingRoute(getBackofficeAccess(OPERATIONS))).toBe(
      '/backoffice/compliance-review'
    );
    expect(getBackofficeLandingRoute(getBackofficeAccess(COMMERCIAL))).toBe(
      '/backoffice/commercial/clients'
    );
  });
});

describe('who may approve, review or move money', () => {
  it.each([
    [SUPER_ADMIN],
    [OPERATIONS],
    [['OPS_KYC']],
    [['OPS_RECAUDOS']],
    [['OPS_DISPERSIONES']],
    [['OPS_VA']],
  ])('lets %j act on the money queues', (roles) => {
    expect(canOperateMoney(roles)).toBe(true);
  });

  it.each([[COMMERCIAL], [['PLATFORM_ADMIN']], [[]], [null]])('keeps %j read-only', (roles) => {
    expect(canOperateMoney(roles)).toBe(false);
  });
});

describe('commercial section and virtual account request access', () => {
  it('does not give LOOPAY_OPERATIONS the commercial section (exact role, no OPS_* wildcard)', () => {
    expect(canAccessCommercialSection(SUPER_ADMIN)).toBe(true);
    expect(canAccessCommercialSection(COMMERCIAL)).toBe(true);
    expect(canAccessCommercialSection(OPERATIONS)).toBe(false);
    expect(canAccessCommercialSection(undefined)).toBe(false);
  });

  it.each([[SUPER_ADMIN], [OPERATIONS], [['OPS_VA']]])(
    'lets %j request a virtual account for a customer',
    (roles) => {
      expect(canRequestVirtualAccount(roles)).toBe(true);
    }
  );

  it.each([[COMMERCIAL], [['OPS_KYC']], [['OPS_RECAUDOS']], [[]], [null]])('denies %j', (roles) => {
    expect(canRequestVirtualAccount(roles)).toBe(false);
  });
});

describe('role labels', () => {
  it('offers exactly the three roles in order', () => {
    expect([...GRANTABLE_STAFF_ROLES]).toEqual([
      'LOOPAY_ADMIN',
      'LOOPAY_OPERATIONS',
      'OPS_COMMERCIAL',
    ]);
  });

  it('labels the three roles in Spanish', () => {
    expect(staffRoleLabel('LOOPAY_ADMIN')).toBe('Super administrador');
    expect(staffRoleLabel('LOOPAY_OPERATIONS')).toBe('Operaciones');
    expect(staffRoleLabel('OPS_COMMERCIAL')).toBe('Comercial');
  });

  it.each([
    ['OPS_KYC', 'Cumplimiento KYC (legado)'],
    ['OPS_RECAUDOS', 'Recaudos (legado)'],
    ['OPS_DISPERSIONES', 'Dispersiones (legado)'],
    ['OPS_VA', 'Cuentas virtuales (legado)'],
    ['PLATFORM_ADMIN', 'Administrador de plataforma (legado)'],
  ])('labels legacy role %s as "%s"', (role, label) => {
    expect(staffRoleLabel(role)).toBe(label);
    expect(isLegacyStaffRole(role)).toBe(true);
  });

  it('falls back to a dash for no role', () => {
    expect(staffRoleLabel(null)).toBe('—');
  });
});
