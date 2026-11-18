import { describe, expect, it } from 'vitest';

import {
  LOOPAYX_NO_QUOTE_OUTBOUND_RAILS,
  isLoopayXNoQuoteOutboundRail,
  isLoopayXNoQuoteOutboundRailCode,
} from '../loopayx-send-rails';

describe('loopayx-send-rails', () => {
  it('keeps only supported no-quote outbound rails', () => {
    expect(LOOPAYX_NO_QUOTE_OUTBOUND_RAILS).toEqual([
      'co_breb',
      'ec_bank_transfer',
      'ec_point_of_sale',
    ]);
  });

  it.each([
    ['co_breb', true],
    ['ec_bank_transfer', true],
    ['CO_BREB', false],
    ['ec_point_of_sale', false],
    ['pe_bank_transfer', false],
    [null, false],
    [undefined, false],
  ])('resolves no-quote code %s as %s', (code, expected) => {
    expect(isLoopayXNoQuoteOutboundRailCode(code)).toBe(expected);
  });

  it('resolves rail code from rail.code first and falls back to payment_rail', () => {
    expect(
      isLoopayXNoQuoteOutboundRail({
        rail: { code: 'co_breb' },
        payment_rail: 'ec_bank_transfer',
      }),
    ).toBe(true);

    expect(
      isLoopayXNoQuoteOutboundRail({
        rail: null,
        payment_rail: 'ec_bank_transfer',
      }),
    ).toBe(true);

    expect(
      isLoopayXNoQuoteOutboundRail({
        rail: { code: 'ach' },
        payment_rail: 'co_breb',
      }),
    ).toBe(false);
  });
});
