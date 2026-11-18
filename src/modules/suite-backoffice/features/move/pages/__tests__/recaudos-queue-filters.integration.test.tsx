/* @vitest-environment jsdom */

/**
 * Wiring test for the deposit queue filters: unlike `recaudos-queue.test.tsx`
 * (which mocks `usePendingRecaudos`), this one runs the real query hook and
 * asserts what actually reaches the GraphQL client, and how the table behaves
 * while a new filter loads.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { changeValue } from '@/test/dom-input';
import { installCommandPolyfills } from '@/test/dom-polyfills';
import { mountPage, type MountedPage } from '@/test/dom-render';
import RecaudosQueue from '../recaudos-queue';

const request = vi.fn();

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

installCommandPolyfills();

vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: (...args: unknown[]) => request(...args) },
}));

vi.mock('../../../ops-review/hooks/use-client-options', () => ({
  useClientOptions: () => ({
    options: [{ client_id: 'client-2', client_name: 'Acme', is_active: true }],
    isLoading: false,
  }),
}));

vi.mock('../../components/create-recaudo-form', () => ({
  CreateRecaudoForm: () => null,
}));

vi.mock('@/shared/components/common/PageHeader', () => ({
  PageHeader: ({
    title,
    titleAccessory,
  }: {
    title: string;
    titleAccessory?: React.ReactNode;
  }) => (
    <h1>
      {title}
      {titleAccessory}
    </h1>
  ),
}));

const PAGE_LIMIT = { offset: 0, limit: 100 };

function recaudo(id: string, email: string, status = 'PENDING') {
  return {
    id,
    reference_code: `RC-${id}`,
    customer_id: 'customer-1',
    customer_email: email,
    client_id: 'client-1',
    client_name: 'Trokera',
    wallet_id: 'wallet-1',
    amount: '10.00',
    currency: 'USDC',
    status,
    provider_code: 'kirafin',
    provider_event_id: null,
    source: 'bank_transfer',
    created_at: '2026-07-09T12:30:00.000Z',
    review_reason: null,
    reviewed_at: null,
  };
}

function queueResponse(rows: unknown[], total = rows.length) {
  return {
    adminLoopay_listPendingRecaudos: { data: rows, total, has_more: false },
  };
}

let page: MountedPage;

async function settle(ms = 50) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

function requestedVariables(): unknown[] {
  return request.mock.calls.map((call) => call[1]);
}

function lastVariables(): unknown {
  return requestedVariables().at(-1);
}

function toolbarButton(title: string): HTMLButtonElement {
  const match = Array.from(
    page.container.querySelectorAll<HTMLButtonElement>(
      '[role="search"] button',
    ),
  ).find((button) => (button.textContent ?? '').trim().startsWith(title));
  if (!match) throw new Error(`No toolbar button "${title}"`);

  return match;
}

function popoverOption(label: string): HTMLElement {
  const match = Array.from(
    document.body.querySelectorAll<HTMLElement>('[role="option"]'),
  ).find(
    (node) =>
      (node.textContent ?? '').replace('Seleccionado', '').trim() === label,
  );
  if (!match) throw new Error(`No option "${label}"`);

  return match;
}

function searchInput(): HTMLInputElement {
  const element = page.container.querySelector<HTMLInputElement>(
    '[role="search"] input[type="search"]',
  );
  if (!element) throw new Error('No global search input');

  return element;
}

function pressKey(target: HTMLElement, key: string) {
  act(() => {
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );
  });
}

function mountQueue() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  page = mountPage(
    <QueryClientProvider client={client}>
      <RecaudosQueue />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  request.mockReset();
  request.mockResolvedValue(queueResponse([]));
});

afterEach(() => {
  page?.unmount();
  document.body.innerHTML = '';
});

describe('RecaudosQueue filters (real query hook)', () => {
  it('queries the pending queue on mount, asking for the largest page', async () => {
    mountQueue();
    await settle();

    expect(requestedVariables()).toEqual([
      { filter: {}, pagination: PAGE_LIMIT },
    ]);
  });

  it('sends a picked filter to the backend at once, with no Apply step', async () => {
    mountQueue();
    await settle();

    page.click(toolbarButton('Moneda'));
    page.click(popoverOption('USDC'));
    await settle();

    expect(lastVariables()).toEqual({
      filter: { currency: 'USDC' },
      pagination: PAGE_LIMIT,
    });
  });

  it('sends the selected statuses so approved and rejected deposits can be listed', async () => {
    mountQueue();
    await settle();

    page.click(toolbarButton('Estado'));
    page.click(popoverOption('Aprobado'));
    page.click(popoverOption('Rechazado'));
    page.click(popoverOption('Pendiente'));
    await settle();

    expect(lastVariables()).toEqual({
      filter: { statuses: ['COMPLETED', 'REJECTED'] },
      pagination: PAGE_LIMIT,
    });
  });

  it('holds back a typed search until the debounce elapses', async () => {
    mountQueue();
    await settle();

    changeValue(searchInput(), 'ana@example.com');
    await settle(100);

    expect(requestedVariables()).toHaveLength(1);

    await settle(350);

    expect(lastVariables()).toEqual({
      filter: { search: 'ana@example.com' },
      pagination: PAGE_LIMIT,
    });
  });

  it('sends the search at once on Enter', async () => {
    mountQueue();
    await settle();

    changeValue(searchInput(), 'RC-ABC-123');
    pressKey(searchInput(), 'Enter');
    await settle();

    expect(requestedVariables()).toHaveLength(2);
    expect(lastVariables()).toEqual({
      filter: { search: 'RC-ABC-123' },
      pagination: PAGE_LIMIT,
    });
  });

  it('sends the search together with the selected statuses', async () => {
    mountQueue();
    await settle();

    page.click(toolbarButton('Estado'));
    page.click(popoverOption('Aprobado'));
    changeValue(searchInput(), '315');
    pressKey(searchInput(), 'Enter');
    await settle();

    expect(lastVariables()).toEqual({
      filter: { search: '315', statuses: ['PENDING', 'COMPLETED'] },
      pagination: PAGE_LIMIT,
    });
  });

  it('goes back to the unsearched query when the search is cleared with Escape', async () => {
    mountQueue();
    await settle();
    changeValue(searchInput(), 'ana');
    pressKey(searchInput(), 'Enter');
    await settle();
    expect(lastVariables()).toEqual({
      filter: { search: 'ana' },
      pagination: PAGE_LIMIT,
    });

    pressKey(searchInput(), 'Escape');
    await settle();

    expect(searchInput().value).toBe('');
    expect(lastVariables()).toEqual({ filter: {}, pagination: PAGE_LIMIT });
  });

  it('does not send a whitespace-only search', async () => {
    mountQueue();
    await settle();

    changeValue(searchInput(), '   ');
    await settle(450);

    expect(requestedVariables()).toHaveLength(1);
  });

  it('goes back to the pending-only query when the filters are reset', async () => {
    mountQueue();
    await settle();
    page.click(toolbarButton('Estado'));
    page.click(popoverOption('Aprobado'));
    changeValue(searchInput(), 'ana');
    pressKey(searchInput(), 'Enter');
    await settle();
    expect(lastVariables()).toEqual({
      filter: { search: 'ana', statuses: ['PENDING', 'COMPLETED'] },
      pagination: PAGE_LIMIT,
    });

    page.click(page.findByText('button', 'Restablecer'));
    await settle();

    expect(searchInput().value).toBe('');
    expect(lastVariables()).toEqual({ filter: {}, pagination: PAGE_LIMIT });
  });

  it('keeps the previous rows on screen, dimmed, while a new filter loads', async () => {
    request.mockResolvedValueOnce(
      queueResponse([recaudo('a', 'first@example.com')], 1),
    );
    mountQueue();
    await settle();
    expect(page.text()).toContain('first@example.com');

    let resolveNext: (value: unknown) => void = () => {};
    request.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveNext = resolve;
      }),
    );
    page.click(toolbarButton('Moneda'));
    page.click(popoverOption('USDC'));
    await settle();

    // Still loading the new filter: old rows stay, table dims, no skeleton, and
    // the count does not pretend the stale total belongs to the new filter.
    expect(page.text()).toContain('first@example.com');
    expect(page.container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(page.container.querySelector('h1')?.textContent).not.toMatch(
      /\d+ pendiente/,
    );

    resolveNext(queueResponse([recaudo('b', 'second@example.com')], 1));
    await settle();

    expect(page.text()).toContain('second@example.com');
    expect(page.text()).not.toContain('first@example.com');
    expect(page.container.querySelector('[aria-busy="true"]')).toBeNull();
    expect(page.container.querySelector('h1')?.textContent).toContain(
      '1 pendiente',
    );
  });

  it('shows the skeleton only on the very first load', async () => {
    let resolveFirst: (value: unknown) => void = () => {};
    request.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFirst = resolve;
      }),
    );
    mountQueue();
    await settle();

    expect(page.text()).not.toContain('No hay depósitos pendientes');
    expect(page.container.querySelector('table')).toBeNull();

    resolveFirst(queueResponse([recaudo('a', 'first@example.com')]));
    await settle();

    expect(page.container.querySelector('table')).not.toBeNull();
  });
});
