import { describe, expect, it } from 'vitest';

import { getVisibleBackofficeModes } from '@/shared/config/backoffice-modes.config';

const ids = (staffRoles: string[]) =>
  getVisibleBackofficeModes({ staffRoles }).map((mode) => mode.id);

describe('getVisibleBackofficeModes', () => {
  it('shows LOOPAY_ADMIN every mode', () => {
    expect(ids(['LOOPAY_ADMIN'])).toEqual(['companies', 'move', 'compliance']);
  });

  it('hides modes with no visible section for the role', () => {
    expect(ids(['OPS_KYC'])).toEqual(['compliance']);
    expect(ids(['OPS_RECAUDOS'])).toEqual(['move']);
  });
});
