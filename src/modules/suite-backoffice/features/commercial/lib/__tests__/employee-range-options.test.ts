import { describe, expect, it } from 'vitest';

import { EMPLOYEE_RANGE_OPTIONS } from '@/modules/suite-user/features/bridge-kyc/lib/business-provider-profile';

import { employeeRangeOptions } from '../mesta-labels';

const RANGES = ['1', '2-10', '11-50', '51-200', '201-1000', '1000+'];

describe('employee range options', () => {
  it('offers the ranges every provider accepts (no legacy 201-500 / 501+)', () => {
    expect(employeeRangeOptions().map((option) => option.value)).toEqual(RANGES);
    expect([...EMPLOYEE_RANGE_OPTIONS]).toEqual(RANGES);
  });
});
