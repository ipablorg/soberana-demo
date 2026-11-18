import { beforeEach, describe, expect, it, vi } from 'vitest';

const request = vi.fn();

vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: (...args: unknown[]) => request(...args) },
}));

import { requestIndicativeRate } from '../use-local-equivalents';
import { requestIndicativeRate as requestSharedIndicativeRate } from '@/shared/hooks/use-indicative-rate';
import { resetIndicativeRateCache } from '@/shared/lib/indicative-rate';

const badUserInput = {
  message: 'Pricing for USDT/COP is not available yet',
  response: {
    errors: [
      {
        message: 'Pricing for USDT/COP is not available yet',
        extensions: { code: 'BAD_USER_INPUT' },
      },
    ],
  },
};

beforeEach(() => {
  request.mockReset();
  resetIndicativeRateCache();
});

describe('requestIndicativeRate', () => {
  it('returns the rate payload for a priced pair', async () => {
    request.mockResolvedValue({
      quotes_getIndicativeRate: { from: 'USDT', to: 'USD', rate: '1' },
    });

    await expect(requestIndicativeRate('USDT', 'USD')).resolves.toEqual({
      quotes_getIndicativeRate: { from: 'USDT', to: 'USD', rate: '1' },
    });
    expect(request.mock.calls[0]?.[1]).toEqual({
      input: { from_currency: 'USDT', to_currency: 'USD' },
    });
  });

  it('treats a pair without pricing as "no equivalence" instead of an error', async () => {
    request.mockRejectedValue(badUserInput);

    await expect(requestIndicativeRate('USDT', 'COP')).resolves.toEqual({
      quotes_getIndicativeRate: null,
    });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('still fails on transient errors so the query can retry', async () => {
    request.mockRejectedValue(new Error('network'));

    await expect(requestIndicativeRate('USDT', 'COP')).rejects.toThrow('network');
  });
});

describe('indicative rate deduplication', () => {
  it('asks an unpriced pair once per session, whichever hook asks', async () => {
    request.mockRejectedValue(badUserInput);

    const results = await Promise.all([
      requestIndicativeRate('USDT', 'COP'),
      requestIndicativeRate('USDT', 'COP'),
      requestSharedIndicativeRate('USDT', 'COP'),
    ]);
    const later = await requestIndicativeRate('USDT', 'COP');

    expect(results.concat(later)).toEqual(Array(4).fill({ quotes_getIndicativeRate: null }));
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('shares one in-flight request per priced pair but asks again afterwards', async () => {
    request.mockResolvedValue({ quotes_getIndicativeRate: { from: 'USDT', to: 'USD', rate: '1' } });

    await Promise.all([requestIndicativeRate('USDT', 'USD'), requestIndicativeRate('USDT', 'USD')]);
    expect(request).toHaveBeenCalledTimes(1);

    await requestIndicativeRate('USDT', 'USD');
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('does not cache a transient failure', async () => {
    request.mockRejectedValueOnce(new Error('network'));
    request.mockResolvedValueOnce({
      quotes_getIndicativeRate: { from: 'USDT', to: 'MXN', rate: '17' },
    });

    await expect(requestIndicativeRate('USDT', 'MXN')).rejects.toThrow('network');
    await expect(requestIndicativeRate('USDT', 'MXN')).resolves.toMatchObject({
      quotes_getIndicativeRate: { rate: '17' },
    });
  });
});
