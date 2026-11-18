import { describe, expect, it } from 'vitest';

import {
  canAccessBackofficeRoute,
  getBackofficeLandingRoute,
  getBackofficeModeForPath,
} from '@/shared/config/backoffice-modes.config';

describe('getBackofficeLandingRoute', () => {
  it.each([
    [['OPS_KYC'], '/backoffice/compliance-review'],
    [['LOOPAY_ADMIN'], '/backoffice/compliance-review'],
    [['LOOPAY_OPERATIONS'], '/backoffice/compliance-review'],
    [['OPS_VA'], '/backoffice/customers'],
    // #411: commercial reads the clients list first (the commercial section needs canAccessCommercial).
    [['OPS_COMMERCIAL'], '/backoffice/clients'],
    [['OPS_RECAUDOS'], '/backoffice/move/recaudos'],
    [['OPS_DISPERSIONES'], '/backoffice/move/dispersiones'],
    [['PLATFORM_ADMIN'], '/backoffice/clients'],
  ])('lands %j on %s', (staffRoles, expected) => {
    expect(getBackofficeLandingRoute({ staffRoles })).toBe(expected);
  });

  it('returns null when the roles can see no section', () => {
    expect(getBackofficeLandingRoute({ staffRoles: [] })).toBeNull();
  });
});

describe('getBackofficeModeForPath', () => {
  it.each([
    ['/backoffice/commercial/clients', 'companies'],
    ['/backoffice/commercial/clients/abc', 'companies'],
    ['/backoffice/platform', 'companies'],
    ['/backoffice/platform/staff-users', 'companies'],
    ['/backoffice/customers', 'companies'],
    ['/backoffice/move/recaudos', 'move'],
    ['/backoffice/move', 'move'],
    ['/backoffice/compliance-review', 'compliance'],
    ['/backoffice/compliance/endorsements', 'compliance'],
  ])('maps %s to %s', (path, mode) => {
    expect(getBackofficeModeForPath(path)).toBe(mode);
  });

  it('returns null for unknown paths', () => {
    expect(getBackofficeModeForPath('/backoffice/nope')).toBeNull();
  });
});

describe('canAccessBackofficeRoute', () => {
  it('denies OPS_KYC on the withdrawals queue', () => {
    expect(canAccessBackofficeRoute('/backoffice/move/dispersiones', ['OPS_KYC'])).toBe(false);
  });

  it('allows OPS_DISPERSIONES and the superuser there', () => {
    expect(canAccessBackofficeRoute('/backoffice/move/dispersiones', ['OPS_DISPERSIONES'])).toBe(
      true
    );
    expect(canAccessBackofficeRoute('/backoffice/move/dispersiones', ['LOOPAY_ADMIN'])).toBe(true);
  });

  it('denies OPS_VA on compliance review', () => {
    expect(canAccessBackofficeRoute('/backoffice/compliance-review', ['OPS_VA'])).toBe(false);
  });
});
