/* @vitest-environment jsdom */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const request = vi.fn();

vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: (...args: unknown[]) => request(...args) },
}));

import { resetIndicativeRateCache } from '@/shared/lib/indicative-rate';
import { useIndicativeRate } from '../use-indicative-rate';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const pricingUnavailable = {
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

type HookState = ReturnType<typeof useIndicativeRate>;

let root: Root | null = null;
let container: HTMLDivElement | null = null;
let latest: HookState | null = null;

function Probe({ from, to }: { from: string; to: string }) {
  latest = useIndicativeRate({ fromCurrency: from, toCurrency: to });
  return null;
}

async function renderHook(from: string, to: string) {
  // Same retry default as the app's global query client.
  const client = new QueryClient({
    defaultOptions: { queries: { retry: 1, retryDelay: 0 } },
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(
      <QueryClientProvider client={client}>
        <Probe from={from} to={to} />
      </QueryClientProvider>,
    );
  });
}

async function settle() {
  for (let i = 0; i < 5; i += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

beforeEach(() => {
  resetIndicativeRateCache();
  request.mockReset();
  latest = null;
});

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
  vi.restoreAllMocks();
});

describe('useIndicativeRate', () => {
  it('returns the rate of a priced pair', async () => {
    request.mockResolvedValue({ quotes_getIndicativeRate: { rate: '4100.5' } });

    await renderHook('USDT', 'COP');
    await settle();

    expect(latest).toEqual({ rate: '4100.5', isLoading: false });
    expect(request.mock.calls[0]?.[1]).toEqual({
      input: { from_currency: 'USDT', to_currency: 'COP' },
    });
  });

  it('treats a pair without pricing as "no indicative rate", asked once and silently', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    request.mockRejectedValue(pricingUnavailable);

    await renderHook('USDT', 'COP');
    await settle();

    expect(latest).toEqual({ rate: null, isLoading: false });
    expect(request).toHaveBeenCalledTimes(1);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('still retries a transient failure once', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    request.mockRejectedValue(new Error('network'));

    await renderHook('USDT', 'COP');
    await settle();

    expect(request).toHaveBeenCalledTimes(2);
    expect(latest?.rate).toBeNull();
  });
});
