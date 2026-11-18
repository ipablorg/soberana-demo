import { describe, expect, it } from 'vitest';

import {
  canRequest,
  groupReceiveOptions,
  normalizeReceiveStatus,
  optionKey,
  type ReceiveOption,
} from '../receive-options';

const option = (over: Partial<ReceiveOption>): ReceiveOption => ({
  country: 'US',
  currency: 'USD',
  railCode: 'ach',
  railName: 'ACH (US)',
  provider: 'mesta',
  providers: ['mesta'],
  status: 'available',
  blockers: [],
  ...over,
});

describe('normalizeReceiveStatus', () => {
  it.each(['available', 'requested', 'active', 'rejected'])('keeps %s', (status) => {
    expect(normalizeReceiveStatus(status)).toBe(status);
  });

  it('is case-insensitive', () => {
    expect(normalizeReceiveStatus('ACTIVE')).toBe('active');
  });

  it('treats an unknown status as requested: never offers a request button for it', () => {
    expect(normalizeReceiveStatus('weird')).toBe('requested');
  });
});

describe('canRequest', () => {
  it('only an available option can be requested', () => {
    expect(canRequest(option({ status: 'available' }))).toBe(true);
    expect(canRequest(option({ status: 'requested' }))).toBe(false);
    expect(canRequest(option({ status: 'active' }))).toBe(false);
    expect(canRequest(option({ status: 'rejected' }))).toBe(false);
  });
});

describe('groupReceiveOptions', () => {
  it('groups by country, owner-priority countries first, then alphabetical by name', () => {
    const groups = groupReceiveOptions([
      option({ country: 'DE', currency: 'EUR', railCode: 'sepa' }),
      option({ country: 'US' }),
      option({ country: 'CO', currency: 'COP', railCode: 'co_ach' }),
      option({ country: 'US', railCode: 'wire' }),
    ]);
    expect(groups.map((g) => g.country)).toEqual(['CO', 'US', 'DE']);
    expect(groups.find((g) => g.country === 'US')?.options).toHaveLength(2);
  });

  it('inside a country: active, then requested, then available, then rejected', () => {
    const groups = groupReceiveOptions([
      option({ railCode: 'a', status: 'rejected' }),
      option({ railCode: 'b', status: 'available' }),
      option({ railCode: 'c', status: 'active' }),
      option({ railCode: 'd', status: 'requested' }),
    ]);
    expect(groups[0].options.map((o) => o.railCode)).toEqual(['c', 'd', 'b', 'a']);
  });

  it('upper-cases the country so ISO2 casing never splits a group', () => {
    const groups = groupReceiveOptions([option({ country: 'us' }), option({ country: 'US', railCode: 'wire' })]);
    expect(groups).toHaveLength(1);
  });

  it('returns [] for no options', () => {
    expect(groupReceiveOptions([])).toEqual([]);
  });

  it('labels each group with the country name', () => {
    expect(groupReceiveOptions([option({ country: 'CO' })])[0].label).toMatch(/Colombia/i);
  });
});

describe('optionKey', () => {
  it('is stable per country, currency and rail', () => {
    expect(optionKey(option({}))).toBe('US:USD:ach');
    expect(optionKey(option({ country: 'us', railCode: 'ACH' }))).toBe('US:USD:ach');
  });
});
