/**
 * Backoffice Modes Configuration
 *
 * Defines the modes and sections for Suite Backoffice
 */

import {
  ArrowLeftRight,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  ArrowRightLeft,
  ShieldCheck,
  UserCheck,
  FileCheck,
  FileText,
  Users,
  Settings,
} from '@/shared/components/animated-icons';
import { ModeItem, SectionGroup } from '@/shared/types/navigation';
import { BackofficeMode } from '@/shared/stores/useModeStore';
import {
  COMMERCIAL_ROLE,
  OPERATIONS_ROLE,
  PLATFORM_ADMIN_ROLE,
  canAccessCommercialSection,
  canOperateMoney,
  hasAnyExactStaffRole,
} from '@/shared/lib/staff-roles';

/**
 * Backoffice Modes — the three live manual-ops domains.
 */
export const BACKOFFICE_MODES: ModeItem<BackofficeMode>[] = [
  {
    id: 'companies',
    icon: Building2,
    label: 'Empresas',
    description: 'Gestión de clientes',
    defaultRoute: '/backoffice/clients',
  },
  {
    id: 'move',
    icon: ArrowLeftRight,
    label: 'Movimientos',
    description: 'Pagos y transferencias',
    defaultRoute: '/backoffice/move/recaudos',
  },
  {
    id: 'compliance',
    icon: ShieldCheck,
    label: 'Cumplimiento',
    description: 'Revisión manual',
    defaultRoute: '/backoffice/compliance-review',
  },
];

/** Role-dependent sections the caller is allowed to see. */
export interface BackofficeSectionAccess {
  /** PLATFORM_ADMIN (or LOOPAY_ADMIN): shows the platform config entry. */
  canAccessPlatformConfig?: boolean;
  /** LOOPAY_ADMIN only: shows the staff user management entry. */
  canManageStaffUsers?: boolean;
  /** OPS_COMMERCIAL (or LOOPAY_ADMIN): shows the commercial onboarding/fees entry. */
  canAccessCommercial?: boolean;
  /**
   * The signed-in staff roles. When provided, items the roles cannot use
   * (per `SECTION_ROLES`) are hidden and groups left empty are dropped. When
   * omitted nothing is filtered (legacy callers).
   */
  staffRoles?: readonly string[] | null;
  /**
   * Sidebar badge text by item url (e.g. the pending provider requirements
   * count). Items without an entry show no badge.
   */
  badges?: Readonly<Record<string, string>>;
}

/**
 * #411 three-role model: the roles that may open each section, matched
 * exactly (`LOOPAY_ADMIN` passes everything; no `OPS_*` wildcard). Commercial
 * reads every client screen and changes nothing there; operations works every
 * money screen but never the clients list (it cannot create clients). Items
 * absent from the map are always shown.
 */
const CLIENT_SCREEN_ROLES: readonly string[] = [OPERATIONS_ROLE, COMMERCIAL_ROLE];

const SECTION_ROLES: Readonly<Record<string, readonly string[]>> = {
  '/backoffice/clients': [COMMERCIAL_ROLE],
  '/backoffice/customers': CLIENT_SCREEN_ROLES,
  '/backoffice/transactions': CLIENT_SCREEN_ROLES,
  '/backoffice/virtual-accounts': CLIENT_SCREEN_ROLES,
  '/backoffice/move/recaudos': CLIENT_SCREEN_ROLES,
  '/backoffice/move/dispersiones': CLIENT_SCREEN_ROLES,
  '/backoffice/compliance-review': CLIENT_SCREEN_ROLES,
  '/backoffice/compliance/endorsements': CLIENT_SCREEN_ROLES,
  '/backoffice/compliance/beneficiaries': CLIENT_SCREEN_ROLES,
  '/backoffice/provider-requirements': CLIENT_SCREEN_ROLES,
};

/**
 * Compatibility only: legacy roles (no longer assignable, still accepted by
 * the backend) keep the sections they had. No section requires them.
 */
const LEGACY_SECTION_ROLES: Readonly<Record<string, readonly string[]>> = {
  '/backoffice/clients': [PLATFORM_ADMIN_ROLE],
  '/backoffice/customers': ['OPS_VA'],
  '/backoffice/virtual-accounts': ['OPS_VA'],
  '/backoffice/move/recaudos': ['OPS_RECAUDOS'],
  '/backoffice/move/dispersiones': ['OPS_DISPERSIONES'],
  '/backoffice/compliance-review': ['OPS_KYC'],
  '/backoffice/compliance/endorsements': ['OPS_KYC'],
  '/backoffice/compliance/beneficiaries': ['OPS_KYC'],
};

function canOpenSection(url: string, staffRoles: BackofficeSectionAccess['staffRoles']): boolean {
  const allowed = SECTION_ROLES[url];
  if (!allowed) return true;

  return (
    hasAnyExactStaffRole(staffRoles, allowed) ||
    hasAnyExactStaffRole(staffRoles, LEGACY_SECTION_ROLES[url] ?? [])
  );
}

function filterSectionsByRole(
  groups: SectionGroup[],
  staffRoles: BackofficeSectionAccess['staffRoles']
): SectionGroup[] {
  if (staffRoles === undefined) return groups;

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canOpenSection(item.url, staffRoles)),
    }))
    .filter((group) => group.items.length > 0);
}

/** Whether the roles may open the backoffice route (`SECTION_ROLES`; unmapped routes are open). */
export function canAccessBackofficeRoute(
  url: string,
  staffRoles: BackofficeSectionAccess['staffRoles']
): boolean {
  return canOpenSection(url, staffRoles);
}

/**
 * Sidebar access flags for the signed-in roles (three-role model): the super
 * admin sees everything, operations sees the operational queues, commercial
 * sees the commercial section; legacy roles keep their previous visibility.
 */
export function getBackofficeAccess(
  staffRoles: readonly string[] | null | undefined
): BackofficeSectionAccess {
  return {
    // Super admin; the legacy PLATFORM_ADMIN keeps it for compatibility only.
    canAccessPlatformConfig: hasAnyExactStaffRole(staffRoles, [PLATFORM_ADMIN_ROLE]),
    canManageStaffUsers: hasAnyExactStaffRole(staffRoles, []),
    canAccessCommercial: canAccessCommercialSection(staffRoles),
    staffRoles: staffRoles ?? [],
  };
}

export const PLATFORM_CONFIG_ROUTE = '/backoffice/platform';
export const STAFF_USERS_ROUTE = '/backoffice/platform/staff-users';
export const COMMERCIAL_ROUTE = '/backoffice/commercial/clients';
/** Review queue of what customers uploaded for VA providers (S21). */
export const PROVIDER_REQUIREMENTS_ROUTE = '/backoffice/provider-requirements';

function withBadges(
  groups: SectionGroup[],
  badges: BackofficeSectionAccess['badges']
): SectionGroup[] {
  if (!badges) return groups;

  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) =>
      badges[item.url]
        ? { ...item, badge: badges[item.url], badgeVariant: 'warning-solid' as const }
        : item
    ),
  }));
}

/**
 * Get sections for a specific backoffice mode
 *
 * @param mode - The active backoffice mode
 * @param access - Role-dependent entries; omitted entries are not rendered
 * @returns Array of section groups to display
 */
export function getBackofficeSections(
  mode: BackofficeMode,
  access: BackofficeSectionAccess = {}
): SectionGroup[] {
  return withBadges(
    filterSectionsByRole(buildSections(mode, access), access.staffRoles),
    access.badges
  );
}

/** Modes with at least one visible section for the given access (role-filtered). */
export function getVisibleBackofficeModes(
  access: BackofficeSectionAccess = {}
): ModeItem<BackofficeMode>[] {
  return BACKOFFICE_MODES.filter((mode) => getBackofficeSections(mode.id, access).length > 0);
}

function buildSections(mode: BackofficeMode, access: BackofficeSectionAccess): SectionGroup[] {
  switch (mode) {
    case 'companies':
      return [
        {
          label: 'Empresas',
          items: [
            {
              title: 'Clientes',
              url: '/backoffice/clients',
              icon: Users,
            },
            {
              title: 'Usuarios finales',
              url: '/backoffice/customers',
              icon: UserCheck,
            },
            {
              title: 'Transacciones',
              url: '/backoffice/transactions',
              icon: ArrowRightLeft,
            },
            {
              title: 'Cuentas virtuales',
              url: '/backoffice/virtual-accounts',
              icon: Wallet,
            },
          ],
        },
        ...(access.canAccessCommercial
          ? [
              {
                label: 'Comercial',
                items: [
                  {
                    title: 'Configuración y tarifas',
                    url: COMMERCIAL_ROUTE,
                    icon: Building2,
                  },
                ],
              },
            ]
          : []),
        ...(access.canAccessPlatformConfig
          ? [
              {
                label: 'Plataforma',
                items: [
                  {
                    title: 'Proveedores y rieles',
                    url: PLATFORM_CONFIG_ROUTE,
                    icon: Settings,
                  },
                  ...(access.canManageStaffUsers
                    ? [
                        {
                          title: 'Usuarios internos',
                          url: STAFF_USERS_ROUTE,
                          icon: UserCheck,
                        },
                      ]
                    : []),
                ],
              },
            ]
          : []),
      ];

    case 'move':
      return [
        {
          label: 'Operación manual',
          items: [
            {
              title: 'Depósitos manuales',
              url: '/backoffice/move/recaudos',
              icon: ArrowDownLeft,
            },
            {
              title: 'Retiros manuales',
              url: '/backoffice/move/dispersiones',
              icon: ArrowUpRight,
            },
          ],
        },
      ];

    case 'compliance':
      return [
        {
          label: 'Revisión manual',
          items: [
            {
              title: 'Revisión KYC',
              url: '/backoffice/compliance-review',
              icon: ShieldCheck,
            },
            {
              title: 'Habilitaciones de riel',
              url: '/backoffice/compliance/endorsements',
              icon: FileCheck,
            },
            {
              title: 'Beneficiarios',
              url: '/backoffice/compliance/beneficiaries',
              icon: UserCheck,
            },
            {
              title: 'Requerimientos de proveedores',
              url: PROVIDER_REQUIREMENTS_ROUTE,
              icon: FileText,
            },
          ],
        },
      ];

    default:
      return [];
  }
}

const FULL_ACCESS: BackofficeSectionAccess = {
  canAccessPlatformConfig: true,
  canManageStaffUsers: true,
  canAccessCommercial: true,
};

/** Route prefixes that belong to a mode but are not sidebar items themselves. */
const MODE_PATH_PREFIXES: ReadonlyArray<readonly [string, BackofficeMode]> = [
  ['/backoffice/move', 'move'],
  ['/backoffice/compliance', 'compliance'],
];

/**
 * Mode that owns the given backoffice pathname, or null when no mode claims it.
 * The rail/sidebar derive from this so they never show Move on a Companies page.
 */
export function getBackofficeModeForPath(pathname: string): BackofficeMode | null {
  const path = pathname.replace(/\/+$/, '');
  const matches = (url: string) => path === url || path.startsWith(`${url}/`);

  let best: { mode: BackofficeMode; length: number } | null = null;
  for (const mode of BACKOFFICE_MODES) {
    for (const group of buildSections(mode.id, FULL_ACCESS)) {
      for (const item of group.items) {
        if (matches(item.url) && (!best || item.url.length > best.length)) {
          best = { mode: mode.id, length: item.url.length };
        }
      }
    }
  }
  if (best) return best.mode;

  const prefix = MODE_PATH_PREFIXES.find(([url]) => matches(url));

  return prefix ? prefix[1] : null;
}

/**
 * Preferred landing sections, in order, when the role can see them: the
 * manual-ops center for whoever works money, the commercial section for the
 * read-only commercial role.
 */
const OPERATIONS_LANDING_ROUTES = ['/backoffice/compliance-review', COMMERCIAL_ROUTE];
const COMMERCIAL_LANDING_ROUTES = [COMMERCIAL_ROUTE, '/backoffice/clients'];

/**
 * First backoffice section the roles can open: the compliance center when
 * allowed, otherwise the first visible item of the first visible mode.
 * Null when the roles can see nothing.
 */
export function getBackofficeLandingRoute(access: BackofficeSectionAccess = {}): string | null {
  const modes = getVisibleBackofficeModes(access);
  const urls = modes.flatMap((mode) =>
    getBackofficeSections(mode.id, access).flatMap((group) => group.items.map((item) => item.url))
  );

  const preferredRoutes =
    access.staffRoles && !canOperateMoney(access.staffRoles)
      ? COMMERCIAL_LANDING_ROUTES
      : OPERATIONS_LANDING_ROUTES;
  const preferred = preferredRoutes.find((route) => urls.includes(route));
  if (preferred) return preferred;

  return urls[0] ?? null;
}
