import { describe, expect, it } from 'vitest';

import {
  COMMERCIAL_ROUTE,
  PROVIDER_REQUIREMENTS_ROUTE,
  canAccessBackofficeRoute,
  getBackofficeAccess,
  getBackofficeSections,
} from '../backoffice-modes.config';

function commercialItems(roles: string[], badges?: Record<string, string>) {
  const access = { ...getBackofficeAccess(roles), ...(badges ? { badges } : {}) };
  return getBackofficeSections('companies', access).find((group) => group.label === 'Comercial')
    ?.items;
}

/** #411: the queue moved to the manual review group (operations reviews, commercial reads). */
function reviewItems(roles: string[], badges?: Record<string, string>) {
  const access = { ...getBackofficeAccess(roles), ...(badges ? { badges } : {}) };
  return getBackofficeSections('compliance', access).find(
    (group) => group.label === 'Revisión manual'
  )?.items;
}

describe('provider requirements queue in the backoffice navigation (S21)', () => {
  it('lists "Requerimientos de proveedores" in the manual review group for the three roles', () => {
    for (const roles of [['OPS_COMMERCIAL'], ['LOOPAY_ADMIN'], ['LOOPAY_OPERATIONS']]) {
      const items = reviewItems(roles);
      expect(items?.map((item) => item.url)).toContain(PROVIDER_REQUIREMENTS_ROUTE);
      expect(items?.find((item) => item.url === PROVIDER_REQUIREMENTS_ROUTE)?.title).toBe(
        'Requerimientos de proveedores'
      );
    }
  });

  it('gates the route by OPS_COMMERCIAL (LOOPAY_ADMIN passes, KYC staff does not)', () => {
    expect(canAccessBackofficeRoute(PROVIDER_REQUIREMENTS_ROUTE, ['OPS_COMMERCIAL'])).toBe(true);
    expect(canAccessBackofficeRoute(PROVIDER_REQUIREMENTS_ROUTE, ['LOOPAY_ADMIN'])).toBe(true);
    expect(canAccessBackofficeRoute(PROVIDER_REQUIREMENTS_ROUTE, ['OPS_KYC'])).toBe(false);
  });

  it('#411: opens it to Operaciones, who now reviews the requirements (back gate LOOPAY_OPERATIONS)', () => {
    expect(canAccessBackofficeRoute(PROVIDER_REQUIREMENTS_ROUTE, ['LOOPAY_OPERATIONS'])).toBe(true);
    expect(commercialItems(['LOOPAY_OPERATIONS'])).toBeUndefined();
  });

  it('shows the badge given for the queue item, and none for other items', () => {
    const badges = { [PROVIDER_REQUIREMENTS_ROUTE]: '3' };

    expect(
      reviewItems(['OPS_COMMERCIAL'], badges)?.find(
        (item) => item.url === PROVIDER_REQUIREMENTS_ROUTE
      )?.badge
    ).toBe('3');
    expect(
      commercialItems(['OPS_COMMERCIAL'], badges)?.find((item) => item.url === COMMERCIAL_ROUTE)
        ?.badge
    ).toBeUndefined();
  });

  it('keeps the previous Comercial entry and no badge when none is given', () => {
    const items = commercialItems(['OPS_COMMERCIAL']);

    expect(items?.[0]?.url).toBe(COMMERCIAL_ROUTE);
    expect(items?.every((item) => item.badge === undefined)).toBe(true);
  });
});
