import { describe, expect, it } from 'vitest';

import {
  buildVerifyIdentityHydrationValues,
  isHydratableVerifyIdentityValueDirty,
} from '../verify-identity-hydration';

describe('verify-identity-hydration', () => {
  it('hydrates the saved tax and address fields that the customer contract already exposes', () => {
    expect(buildVerifyIdentityHydrationValues({
      id: 'cust_123',
      email: 'ops@loopay.com',
      first_name: 'Jane',
      last_name: 'Doe',
      kyc_status: 'INITIATED',
      country: 'COL',
      customer_status: 'pending',
      tax_id: '900123456',
      tax_id_type: 'NIT',
      address: {
        street: 'Calle 100 #20-30',
        city: 'Bogotá',
        state: 'Cundinamarca',
        postal_code: '110111',
      },
    })).toEqual({
      tax_id: '900123456',
      tax_id_type: 'NIT',
      address_line_1: 'Calle 100 #20-30',
      city: 'Bogotá',
      state: 'Cundinamarca',
      postal_code: '110111',
      country: 'COL',
      nationality: 'COL',
    });
  });

  it('supports address payloads that already store address_line_1 explicitly', () => {
    expect(buildVerifyIdentityHydrationValues({
      id: 'cust_123',
      email: 'ops@loopay.com',
      first_name: 'Jane',
      last_name: 'Doe',
      kyc_status: 'INITIATED',
      country: null,
      customer_status: null,
      tax_id: null,
      tax_id_type: null,
      address: {
        address_line_1: '221B Baker Street',
        country: 'GBR',
      },
      })).toEqual({
        tax_id: undefined,
        tax_id_type: undefined,
        address_line_1: '221B Baker Street',
        city: undefined,
        state: undefined,
        postal_code: undefined,
        country: 'GBR',
        nationality: undefined,
      });
  });

  it('does not overwrite user-edited values with hydration data', () => {
    expect(isHydratableVerifyIdentityValueDirty('', '900123456', false)).toBe(true);
    expect(isHydratableVerifyIdentityValueDirty('900123456', '900123456', false)).toBe(false);
    expect(isHydratableVerifyIdentityValueDirty('manual', '900123456', true)).toBe(false);
    expect(isHydratableVerifyIdentityValueDirty('', undefined, false)).toBe(false);
  });
});
