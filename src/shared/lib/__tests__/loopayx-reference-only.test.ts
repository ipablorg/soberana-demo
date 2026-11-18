import { describe, expect, it } from 'vitest';

import {
  getLoopayXReferenceOnlyDisplay,
  resolveOffRampSubmitPayload,
} from '../loopayx-reference-only';

describe('loopayx-reference-only', () => {
  it('uses indicative COP rate for LoopayX Colombia reference-only preview', () => {
    expect(
      getLoopayXReferenceOnlyDisplay({
        railCode: 'co_breb',
        amount: '100',
        indicativeRate: '4100.25',
      }),
    ).toEqual({
      rate: 4100.25,
      estimatedReceive: 410025,
      receiveCurrency: 'COP',
      semantics: 'indicative',
    });
  });

  it('keeps Ecuador reference-only preview coherent with 1:1 USD expectation', () => {
    expect(
      getLoopayXReferenceOnlyDisplay({
        railCode: 'ec_bank_transfer',
        amount: '42.5',
      }),
    ).toEqual({
      rate: 1,
      estimatedReceive: 42.5,
      receiveCurrency: 'USD',
      semantics: 'parity',
    });
  });

  it('returns null when rail is not in the reference-only model or amount is invalid', () => {
    expect(
      getLoopayXReferenceOnlyDisplay({
        railCode: 'pe_bank_transfer',
        amount: '100',
      }),
    ).toBeNull();

    expect(
      getLoopayXReferenceOnlyDisplay({
        railCode: 'co_breb',
        amount: '0',
        indicativeRate: '4100.25',
      }),
    ).toBeNull();
  });
});

describe('resolveOffRampSubmitPayload', () => {
  it('submits source-denominated payload for co_breb (USDT amount, not COP conversion)', () => {
    expect(
      resolveOffRampSubmitPayload({
        isNoQuoteOutbound: true,
        sourceCurrency: 'USDT',
        destinationCurrency: 'COP',
        amount: '5.12',
      }),
    ).toEqual({ currency: 'USDT', amount: '5.12' });
  });

  it('submits source-denominated payload for ec_bank_transfer (USDT, not USD)', () => {
    expect(
      resolveOffRampSubmitPayload({
        isNoQuoteOutbound: true,
        sourceCurrency: 'USDT',
        destinationCurrency: 'USD',
        amount: '42.5',
      }),
    ).toEqual({ currency: 'USDT', amount: '42.5' });
  });

  it('submits destination-denominated payload for non-LoopayX rails', () => {
    expect(
      resolveOffRampSubmitPayload({
        isNoQuoteOutbound: false,
        sourceCurrency: 'USDT',
        destinationCurrency: 'COP',
        amount: '10',
      }),
    ).toEqual({ currency: 'COP', amount: '10' });
  });
});
