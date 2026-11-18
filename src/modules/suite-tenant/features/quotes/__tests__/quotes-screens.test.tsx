// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ request: vi.fn(), toastError: vi.fn() }));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('sonner', () => ({ toast: { error: mocks.toastError, success: vi.fn() } }));
vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: mocks.request },
  setAuthToken: vi.fn(),
  clearHeaders: vi.fn(),
}));

import type { TenantQuote } from '@/graphql/types/tenant';
import { changeValue, submitForm } from '@/test/dom-input';
import type { MountedPage } from '@/test/dom-render';
import TenantQuotes from '@/modules/suite-tenant/features/quotes/pages/tenant-quotes';
import QuoteDetail from '@/modules/suite-tenant/features/quotes/pages/quote-detail';
import {
  currentPath,
  graphQLError,
  renderTenant,
  respond,
  settle,
  type Handler,
} from '@/modules/suite-tenant/__tests__/tenant-harness';
import { formatAmount } from '@/modules/suite-tenant/lib/tenant-format';

const QUOTE: TenantQuote = {
  id: 'q0a8b1e2-6666-4666-8666-666666666666',
  pair: 'USD/MXN',
  rate: 17.12,
  source: { amount: 100, currency: 'USD' },
  destination: { amount: 1712, currency: 'MXN' },
  fee: { total: 1.5, currency: 'USD' },
  status: 'ACTIVE',
  expires_at: '2026-11-05T12:15:00.000Z',
  created_at: '2026-11-05T12:00:00.000Z',
};

let page: MountedPage | null = null;

function el<T extends Element>(selector: string): T {
  const element = page?.container.querySelector<T>(selector);
  if (!element) throw new Error(`missing ${selector}`);
  return element;
}

function callsOf(field: string) {
  return mocks.request.mock.calls.filter(([document]) => {
    const operation = (
      document as {
        definitions: Array<{ selectionSet: { selections: Array<{ name: { value: string } }> } }>;
      }
    ).definitions[0];
    return operation?.selectionSet.selections[0]?.name.value === field;
  });
}

beforeEach(() => {
  mocks.request.mockReset();
  mocks.toastError.mockReset();
});

afterEach(() => {
  page?.unmount();
  page = null;
});

describe('TenantQuotes (container)', () => {
  function mountQuotes(extra: Record<string, Handler> = {}) {
    mocks.request.mockImplementation(
      respond({
        tenant_quoteRate: () => ({ from: 'USD', to: 'MXN', rate: '17.1200' }),
        tenant_createQuote: () => QUOTE,
        ...extra,
      })
    );
    page = renderTenant(<TenantQuotes />, { path: '/tenant/quotes', routePath: '/tenant/quotes' });
  }

  it('looks up the indicative rate only when asked, with upper-case currencies', async () => {
    mountQuotes();
    await settle();
    expect(callsOf('tenant_quoteRate')).toHaveLength(0);

    changeValue(el<HTMLInputElement>('#rate-from'), 'usd');
    changeValue(el<HTMLInputElement>('#rate-to'), 'mxn');
    submitForm(el<HTMLFormElement>('[data-testid="rate-form"]'));
    await settle(() => page?.container.querySelector('[data-testid="rate-result"]') !== null);

    expect(callsOf('tenant_quoteRate')[0]?.[1]).toEqual({ filters: { from: 'USD', to: 'MXN' } });
    expect(el('[data-testid="rate-result"]').textContent).toContain(formatAmount('17.1200'));
  });

  it('creates a quote with the documented body and opens it', async () => {
    mountQuotes();
    await settle();

    changeValue(el<HTMLInputElement>('#quote-source_currency'), 'usd');
    changeValue(el<HTMLInputElement>('#quote-destination_currency'), 'MXN');
    changeValue(el<HTMLInputElement>('#quote-source_amount'), '100,50');
    submitForm(el<HTMLFormElement>('[data-testid="quote-form"]'));
    await settle(() => callsOf('tenant_createQuote').length > 0);

    expect(callsOf('tenant_createQuote')[0]?.[1]).toEqual({
      input: { source_currency: 'USD', destination_currency: 'MXN', source_amount: 100.5 },
    });
    await settle(() => currentPath(page!) !== '/tenant/quotes');
    expect(page?.text()).toContain('other-route');
  });

  it('does not create a quote below 0.01', async () => {
    mountQuotes();
    await settle();

    changeValue(el<HTMLInputElement>('#quote-source_currency'), 'USD');
    changeValue(el<HTMLInputElement>('#quote-destination_currency'), 'MXN');
    changeValue(el<HTMLInputElement>('#quote-source_amount'), '0');
    submitForm(el<HTMLFormElement>('[data-testid="quote-form"]'));
    await settle();

    expect(callsOf('tenant_createQuote')).toHaveLength(0);
    expect(el('[data-testid="quote-source_amount-error"]').textContent).toBe(
      'Enter an amount of at least 0.01.'
    );
  });

  it('explains an unsupported pair', async () => {
    mountQuotes({
      tenant_createQuote: () => {
        throw graphQLError('PAIR_UNSUPPORTED', 'Unprocessable', 'UNPROCESSABLE_ENTITY');
      },
    });
    await settle();

    changeValue(el<HTMLInputElement>('#quote-source_currency'), 'USD');
    changeValue(el<HTMLInputElement>('#quote-destination_currency'), 'XYZ');
    changeValue(el<HTMLInputElement>('#quote-source_amount'), '10');
    submitForm(el<HTMLFormElement>('[data-testid="quote-form"]'));
    await settle(() => mocks.toastError.mock.calls.length > 0);

    expect(mocks.toastError).toHaveBeenCalledWith("We couldn't create the quote", {
      description: 'That currency pair is not supported.',
    });
  });
});

describe('QuoteDetail (container)', () => {
  it('shows the pair, both sides, fee, status and expiry', async () => {
    mocks.request.mockImplementation(respond({ tenant_getQuote: () => QUOTE }));
    page = renderTenant(<QuoteDetail />, {
      path: `/tenant/quotes/${QUOTE.id}`,
      routePath: '/tenant/quotes/:quoteId',
    });
    await settle(() => page?.text().includes('USD/MXN') ?? false);

    expect(callsOf('tenant_getQuote')[0]?.[1]).toEqual({ id: QUOTE.id });
    const text = page?.text() ?? '';
    // Amounts follow the browser locale.
    expect(text).toContain(formatAmount(17.12));
    expect(text).toContain(`${formatAmount(1712)} MXN`);
    expect(text).toContain(`${formatAmount(1.5)} USD`);
    expect(text).toContain('Active');
  });
});
