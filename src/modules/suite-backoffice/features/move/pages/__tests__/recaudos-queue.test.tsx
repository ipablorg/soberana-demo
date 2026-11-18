/* @vitest-environment jsdom */

import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { changeValue } from '@/test/dom-input';
import { installCommandPolyfills } from '@/test/dom-polyfills';
import { mountPage, type MountedPage } from '@/test/dom-render';
// Statically imported so the page's module graph is transformed during
// collection instead of inside the first (timed) test.
import RecaudosQueue from '../recaudos-queue';

const usePendingRecaudosMock = vi.fn();
const approveMutate = vi.fn();
const rejectMutate = vi.fn();
const reverseMutate = vi.fn();
let isSubmittingMock = false;
let confirmationProps: {
  open: boolean;
  toState: string;
  reasonRequired: boolean;
  entitySummary?: { label: string; value: string }[];
  onConfirm: (reason: string) => void;
} | null = null;

// #411: OPS_COMMERCIAL reads this screen without any action button.
let canOperate = true;
vi.mock('@/shared/hooks/use-can-operate-money', () => ({
  useCanOperateMoney: () => canOperate,
}));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

installCommandPolyfills();

vi.mock('../../../ops-review/hooks/use-client-options', () => ({
  useClientOptions: () => ({
    options: [
      { client_id: 'client-2', client_name: 'Acme', is_active: true },
      { client_id: 'client-3', client_name: 'Zeta', is_active: false },
    ],
    isLoading: false,
  }),
}));

vi.mock('../../hooks/use-recaudos-queue', () => ({
  usePendingRecaudos: (filter: unknown) => usePendingRecaudosMock(filter),
  useApproveRecaudo: () => ({
    mutate: approveMutate,
    isPending: isSubmittingMock,
  }),
  useRejectRecaudo: () => ({ mutate: rejectMutate, isPending: false }),
  useReverseRecaudo: () => ({ mutate: reverseMutate, isPending: false }),
}));

vi.mock('../../components/create-recaudo-form', () => ({
  CreateRecaudoForm: () => <div>create-recaudo-form</div>,
}));

vi.mock('@/shared/components/common/PageHeader', () => ({
  PageHeader: ({ title, titleAccessory }: { title: string; titleAccessory?: React.ReactNode }) => (
    <h1>
      {title}
      {titleAccessory}
    </h1>
  ),
}));

vi.mock('@/shared/components/backoffice/StateChangeConfirmationModal', () => ({
  StateChangeConfirmationModal: (props: {
    open: boolean;
    toState: string;
    reasonRequired: boolean;
    entitySummary?: { label: string; value: string }[];
    onConfirm: (reason: string) => void;
  }) => {
    confirmationProps = props;
    return props.open ? <div /> : null;
  },
}));

const FULL_WALLET_ID = 'a007e7ba-1c2d-4e5f-8a9b-0c1d2e3f4f9a';

const PENDING_RECAUDO = {
  id: '22222222-2222-4222-8222-222222222222',
  reference_code: 'RC-ABC-123',
  customer_id: 'customer-1',
  customer_email: 'ana@example.com',
  client_id: 'client-1',
  client_name: 'Trokera',
  wallet_id: 'wallet-1',
  amount: '1500.00',
  currency: 'USD',
  status: 'PENDING',
  provider_code: 'kirafin',
  provider_event_id: 'evt-1',
  source: 'bank_transfer',
  reference: null,
  created_at: '2026-07-09T12:30:00.000Z',
  review_reason: null,
  reviewed_at: null,
};

const COMPLETED_RECAUDO = {
  ...PENDING_RECAUDO,
  id: '33333333-3333-4333-8333-333333333333',
  reference_code: 'RC-DEF-456',
  status: 'COMPLETED',
};

const REJECTED_RECAUDO = {
  ...PENDING_RECAUDO,
  id: '44444444-4444-4444-8444-444444444444',
  reference_code: 'RC-GHI-789',
  status: 'REJECTED',
};

const REVERSED_RECAUDO = {
  ...PENDING_RECAUDO,
  id: '55555555-5555-4555-8555-555555555555',
  reference_code: 'RC-JKL-012',
  status: 'FAILED',
};

let page: MountedPage;

function mockQuery(
  rows: unknown[],
  total: number | undefined,
  extra: Record<string, unknown> = {},
  hasMore = false
) {
  usePendingRecaudosMock.mockReturnValue({
    data: {
      adminLoopay_listPendingRecaudos: {
        data: rows,
        ...(total !== undefined && { total }),
        has_more: hasMore,
      },
    },
    isLoading: false,
    ...extra,
  });
}

function renderPage(rows: unknown[] = [PENDING_RECAUDO], total = rows.length) {
  mockQuery(rows, total);

  return mountPage(<RecaudosQueue />);
}

function actionButton(label: string): HTMLButtonElement | null {
  return page.container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
}

function requiredActionButton(label: string): HTMLButtonElement {
  const button = actionButton(label);
  if (!button) throw new Error(`No action button labelled "${label}"`);

  return button;
}

function searchInput(): HTMLInputElement {
  const element = page.container.querySelector<HTMLInputElement>(
    '[role="search"] input[type="search"]'
  );
  if (!element) throw new Error('No global search input');

  return element;
}

function clearSearchButton(): HTMLButtonElement | null {
  return page.container.querySelector<HTMLButtonElement>(
    '[role="search"] button[aria-label="Limpiar búsqueda"]'
  );
}

function pressKey(target: HTMLElement, key: string) {
  page.flush(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  });
}

function toolbarButton(title: string): HTMLButtonElement {
  const match = Array.from(
    page.container.querySelectorAll<HTMLButtonElement>('[role="search"] button')
  ).find((button) => (button.textContent ?? '').trim().startsWith(title));
  if (!match) throw new Error(`No toolbar button "${title}"`);

  return match;
}

function columnFilterButton(title: string): HTMLButtonElement {
  const match = page.container.querySelector<HTMLButtonElement>(
    `th button[aria-label^="Filtrar por ${title}"]`
  );
  if (!match) throw new Error(`No column filter for "${title}"`);

  return match;
}

function popoverOption(label: string): HTMLElement {
  const match = Array.from(document.body.querySelectorAll<HTMLElement>('[role="option"]')).find(
    (node) => (node.textContent ?? '').replace('Seleccionado', '').trim() === label
  );
  if (!match) throw new Error(`No option "${label}"`);

  return match;
}

function pickFromToolbar(title: string, option: string) {
  page.click(toolbarButton(title));
  page.click(popoverOption(option));
}

/** Leaves only `status` selected, starting from the default (Pendiente). */
function selectOnlyStatus(status: string) {
  page.click(toolbarButton('Estado'));
  page.click(popoverOption(status));
  page.click(popoverOption('Pendiente'));
}

function resetButton(): HTMLButtonElement | null {
  return (
    Array.from(page.container.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.trim() === 'Restablecer'
    ) ?? null
  );
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

/** Text of the page heading, where the pending counter lives. */
function headingText(): string {
  return page.container.querySelector('h1')?.textContent ?? '';
}

function lastFilter(): unknown {
  return usePendingRecaudosMock.mock.calls.at(-1)?.[0];
}

beforeEach(() => {
  usePendingRecaudosMock.mockReset();
  confirmationProps = null;
  isSubmittingMock = false;
  approveMutate.mockClear();
  rejectMutate.mockClear();
  reverseMutate.mockClear();
});

afterEach(() => {
  page?.unmount();
  document.body.innerHTML = '';
});

describe('RecaudosQueue', () => {
  it('renders the deposit with its customer, reference and provider data', async () => {
    page = renderPage();

    const rendered = page.text();

    expect(rendered).toContain('ana@example.com');
    expect(rendered).toContain('RC-ABC-123');
    expect(rendered).toContain('Transferencia bancaria');
    expect(rendered).not.toContain('bank_transfer');
    expect(rendered).toContain('kirafin');
    expect(rendered).toContain('Pendiente');
  });

  it('shows the operator reference first and the RC id as secondary', async () => {
    page = renderPage([{ ...PENDING_RECAUDO, reference: 'EXT-998877' }]);

    const operatorReference = page.container.querySelector(
      '[data-testid="recaudo-operator-reference"]'
    );
    const internalReference = page.container.querySelector(
      '[data-testid="recaudo-internal-reference"]'
    );

    expect(operatorReference?.textContent).toBe('EXT-998877');
    expect(internalReference?.textContent).toBe('RC-ABC-123');
    expect(
      operatorReference!.compareDocumentPosition(internalReference!) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('falls back to the RC id alone when no operator reference was typed', async () => {
    page = renderPage();

    expect(page.container.querySelector('[data-testid="recaudo-operator-reference"]')).toBeNull();
    expect(
      page.container.querySelector('[data-testid="recaudo-internal-reference"]')?.textContent
    ).toBe('RC-ABC-123');
  });

  it('summarises both references in the confirmation dialog', async () => {
    page = renderPage([{ ...PENDING_RECAUDO, reference: 'EXT-998877' }]);

    page.click(requiredActionButton('Aprobar'));

    expect(confirmationProps?.entitySummary).toContainEqual({
      label: 'Referencia',
      value: 'EXT-998877',
    });
    expect(confirmationProps?.entitySummary).toContainEqual({
      label: 'ID de recaudo',
      value: 'RC-ABC-123',
    });
  });

  it('keeps the RC id as the reference in the confirmation when none was typed', async () => {
    page = renderPage();

    page.click(requiredActionButton('Aprobar'));

    expect(confirmationProps?.entitySummary).toContainEqual({
      label: 'Referencia',
      value: 'RC-ABC-123',
    });
    expect(confirmationProps?.entitySummary?.some((item) => item.label === 'ID de recaudo')).toBe(
      false
    );
  });

  it('shows the pending status with the solid amber warning badge', async () => {
    page = renderPage();

    const pill = Array.from(page.container.querySelectorAll('td div')).find(
      (node) => node.textContent === 'Pendiente'
    );

    expect(pill?.className).toContain('bg-warning');
    expect(pill?.className).toContain('text-warning-foreground');
  });

  it('offers approve and reject on a pending deposit but not reversal', async () => {
    page = renderPage();

    expect(actionButton('Aprobar')).not.toBeNull();
    expect(actionButton('Rechazar')).not.toBeNull();
    expect(actionButton('Reversar')).toBeNull();
  });

  it('names each resolved status with its domain label and a semantic badge', async () => {
    page = renderPage([COMPLETED_RECAUDO, REJECTED_RECAUDO, REVERSED_RECAUDO]);

    const pills = Array.from(page.container.querySelectorAll('td div'));
    const pill = (label: string) => pills.find((node) => node.textContent === label);

    expect(pill('Aprobado')?.className).toContain('bg-success');
    expect(pill('Rechazado')?.className).toContain('bg-destructive');
    expect(pill('Revertido')?.className).toContain('bg-secondary');
  });

  it('offers only reversal once the deposit has been credited', async () => {
    page = renderPage([COMPLETED_RECAUDO]);

    expect(actionButton('Reversar')).not.toBeNull();
    expect(actionButton('Aprobar')).toBeNull();
  });

  it('disables every row action while a decision is being submitted', async () => {
    isSubmittingMock = true;
    page = renderPage();

    expect(requiredActionButton('Aprobar').disabled).toBe(true);
    expect(requiredActionButton('Rechazar').disabled).toBe(true);
  });
});

describe('RecaudosQueue wallet column', () => {
  it('truncates the wallet in the middle and keeps the full value in a title', async () => {
    page = renderPage([{ ...PENDING_RECAUDO, wallet_id: FULL_WALLET_ID }]);

    expect(page.text()).toContain('a007e7ba…4f9a');
    expect(page.text()).not.toContain(FULL_WALLET_ID);
    expect(page.container.querySelector(`[title="${FULL_WALLET_ID}"]`)).not.toBeNull();
  });

  it('keeps the full wallet in the confirmation summary', async () => {
    page = renderPage([{ ...PENDING_RECAUDO, wallet_id: FULL_WALLET_ID }]);

    page.click(requiredActionButton('Aprobar'));

    expect(confirmationProps?.entitySummary).toContainEqual({
      label: 'Billetera',
      value: FULL_WALLET_ID,
    });
  });

  it('leaves short wallet ids untouched', async () => {
    page = renderPage();

    expect(page.text()).toContain('wallet-1');
  });
});

describe('RecaudosQueue approval flow', () => {
  it('approves with an optional note and no required reason', async () => {
    page = renderPage();

    page.click(requiredActionButton('Aprobar'));

    expect(confirmationProps?.toState).toBe('COMPLETED');
    expect(confirmationProps?.reasonRequired).toBe(false);

    page.flush(() => confirmationProps?.onConfirm('recibido por banco'));

    expect(approveMutate).toHaveBeenCalledWith({
      id: PENDING_RECAUDO.id,
      input: { note: 'recibido por banco' },
    });
  });

  it('requires a reason to reject and forwards it trimmed', async () => {
    page = renderPage();

    page.click(requiredActionButton('Rechazar'));

    expect(confirmationProps?.toState).toBe('REJECTED');
    expect(confirmationProps?.reasonRequired).toBe(true);

    page.flush(() => confirmationProps?.onConfirm('  monto no coincide  '));

    expect(rejectMutate).toHaveBeenCalledWith({
      id: PENDING_RECAUDO.id,
      input: { reason: 'monto no coincide' },
    });
  });

  it('reverses a credited deposit into FAILED with a required reason', async () => {
    page = renderPage([COMPLETED_RECAUDO]);

    page.click(requiredActionButton('Reversar'));

    expect(confirmationProps?.toState).toBe('FAILED');
    expect(confirmationProps?.reasonRequired).toBe(true);

    page.flush(() => confirmationProps?.onConfirm('  contracargo bancario  '));

    expect(reverseMutate).toHaveBeenCalledWith({
      id: COMPLETED_RECAUDO.id,
      input: { reason: 'contracargo bancario' },
    });
  });
});

describe('RecaudosQueue pending counter', () => {
  it('shows the server total rather than the size of the loaded page', async () => {
    page = renderPage([PENDING_RECAUDO], 137);

    expect(headingText()).toContain('137 pendientes');
  });

  it('uses the singular form for exactly one deposit', async () => {
    page = renderPage([PENDING_RECAUDO], 1);

    expect(headingText()).toContain('1 pendiente');
    expect(headingText()).not.toContain('1 pendientes');
  });

  it('falls back to the number of rows when the API sends no total', async () => {
    mockQuery([PENDING_RECAUDO, COMPLETED_RECAUDO], undefined);
    page = mountPage(<RecaudosQueue />);

    expect(headingText()).toContain('2 pendientes');
  });

  it('shows a real zero when the queue is empty', async () => {
    page = renderPage([], 0);

    expect(headingText()).toContain('0 pendientes');
  });

  it('shows a skeleton instead of a number while loading', async () => {
    usePendingRecaudosMock.mockReturnValue({ data: undefined, isLoading: true });
    page = mountPage(<RecaudosQueue />);

    expect(headingText()).not.toMatch(/\d+ pendiente/);
    expect(page.container.querySelector('h1 [aria-hidden="true"]')).not.toBeNull();
  });

  it('hides the counter when the query settled without data', async () => {
    usePendingRecaudosMock.mockReturnValue({ data: undefined, isLoading: false });
    page = mountPage(<RecaudosQueue />);

    expect(headingText()).not.toMatch(/pendiente/i);
  });
});

describe('RecaudosQueue count label follows the Estado selection', () => {
  it.each([
    ['Aprobado', '137 aprobados'],
    ['Rechazado', '137 rechazados'],
    ['Revertido', '137 revertidos'],
  ])('a lone %s selection reads "%s"', async (status, expected) => {
    page = renderPage([PENDING_RECAUDO], 137);

    selectOnlyStatus(status);

    expect(headingText()).toContain(expected);
    expect(headingText()).not.toContain('pendientes');
  });

  it('uses the singular for a single approved deposit', async () => {
    page = renderPage([COMPLETED_RECAUDO], 1);

    selectOnlyStatus('Aprobado');

    expect(headingText()).toContain('1 aprobado');
    expect(headingText()).not.toContain('1 aprobados');
  });

  it('reads "depósitos" when several statuses are selected', async () => {
    page = renderPage([PENDING_RECAUDO], 137);

    page.click(toolbarButton('Estado'));
    page.click(popoverOption('Aprobado'));

    expect(headingText()).toContain('137 depósitos');
  });

  it('keeps "pendientes" for the default view', async () => {
    page = renderPage([PENDING_RECAUDO], 137);

    expect(headingText()).toContain('137 pendientes');
  });
});

describe('RecaudosQueue filters', () => {
  it('renders the client name of each row', async () => {
    page = renderPage();

    expect(page.text()).toContain('Trokera');
  });

  it('lists the pending deposits by default', async () => {
    page = renderPage();

    expect(usePendingRecaudosMock.mock.calls[0]?.[0]).toEqual({});
    expect(toolbarButton('Estado').textContent).toContain('Pendiente');
  });

  it('has no Apply button: filters apply on change', async () => {
    page = renderPage();

    expect(page.text()).not.toContain('Aplicar filtros');
    expect(page.container.querySelector('button[type="submit"]')).toBeNull();
  });

  it('applies a client picked in the toolbar immediately', async () => {
    page = renderPage();

    pickFromToolbar('Cliente', 'Acme');

    expect(lastFilter()).toEqual({ clientId: 'client-2' });
    expect(toolbarButton('Cliente').textContent).toContain('Acme');
  });

  it('marks inactive clients in the client list', async () => {
    page = renderPage();

    page.click(toolbarButton('Cliente'));

    expect(popoverOption('Zeta (inactivo)')).toBeTruthy();
  });

  it('applies a currency quick pick immediately, uppercased', async () => {
    page = renderPage();

    pickFromToolbar('Moneda', 'USDT');

    expect(lastFilter()).toEqual({ currency: 'USDT' });
  });

  it('applies a free-typed currency', async () => {
    page = renderPage();

    page.click(toolbarButton('Moneda'));
    const search = document.body.querySelector<HTMLInputElement>('input[cmdk-input]');
    if (!search) throw new Error('No currency search');
    changeValue(search, ' eur ');
    page.click(popoverOption('Usar «EUR»'));

    expect(lastFilter()).toEqual({ currency: 'EUR' });
  });

  it('sends the selected statuses immediately', async () => {
    page = renderPage();

    page.click(toolbarButton('Estado'));
    page.click(popoverOption('Aprobado'));

    expect(lastFilter()).toEqual({ statuses: ['PENDING', 'COMPLETED'] });

    page.click(popoverOption('Pendiente'));

    expect(lastFilter()).toEqual({ statuses: ['COMPLETED'] });
  });

  it('reads an empty Estado selection as every status', async () => {
    page = renderPage();

    page.click(toolbarButton('Estado'));
    page.click(popoverOption('Pendiente'));

    expect(lastFilter()).toEqual({
      statuses: ['PENDING', 'COMPLETED', 'REJECTED', 'FAILED'],
    });
    expect(toolbarButton('Estado').textContent).toContain('Todos');
  });

  it('shows the reset button only when filters differ from the default', async () => {
    page = renderPage();

    expect(resetButton()).toBeNull();

    pickFromToolbar('Moneda', 'BTC');

    expect(resetButton()).not.toBeNull();
  });

  it('counts a non-default Estado as an active filter', async () => {
    page = renderPage();

    selectOnlyStatus('Rechazado');

    expect(resetButton()).not.toBeNull();
  });

  it('restores the defaults, Pendiente included, when reset', async () => {
    page = renderPage();
    selectOnlyStatus('Aprobado');
    pickFromToolbar('Moneda', 'BTC');
    expect(lastFilter()).toEqual({ currency: 'BTC', statuses: ['COMPLETED'] });

    const reset = resetButton();
    if (!reset) throw new Error('No reset button');
    page.click(reset);

    expect(lastFilter()).toEqual({});
    expect(toolbarButton('Estado').textContent).toContain('Pendiente');
    expect(toolbarButton('Moneda').textContent).toBe('Moneda');
    expect(resetButton()).toBeNull();
  });

  it('keeps the toolbar mounted and the rows visible while a filter loads', async () => {
    page = renderPage();
    mockQuery([PENDING_RECAUDO], 1, { isFetching: true, isPlaceholderData: true });

    pickFromToolbar('Moneda', 'USDC');

    expect(toolbarButton('Moneda').textContent).toContain('USDC');
    expect(page.text()).toContain('ana@example.com');
    expect(page.container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it("does not show the previous filter's total while its rows are stale", async () => {
    mockQuery([PENDING_RECAUDO], 137, {
      isFetching: true,
      isPlaceholderData: true,
    });
    page = mountPage(<RecaudosQueue />);

    expect(headingText()).not.toMatch(/\d+ pendiente/);
    expect(page.container.querySelector('h1 [aria-hidden="true"]')).not.toBeNull();
  });

  it('does not dim the table when nothing is refetching', async () => {
    page = renderPage();

    expect(page.container.querySelector('[aria-busy="true"]')).toBeNull();
  });

  it('explains an empty result differently once filters are active', async () => {
    page = renderPage([], 0);
    expect(page.text()).toContain('No hay depósitos pendientes');

    pickFromToolbar('Moneda', 'BTC');

    expect(page.text()).toContain('Ningún depósito coincide con los filtros');
  });

  it('warns when the list is truncated by the page limit', async () => {
    mockQuery([PENDING_RECAUDO], 250, {}, true);
    page = mountPage(<RecaudosQueue />);

    expect(page.text()).toContain('Mostrando 1 de 250 depósitos');
  });

  it('does not warn when the whole list is shown', async () => {
    page = renderPage();

    expect(page.text()).not.toContain('Mostrando');
  });

  it('shows an error state when the query fails without data', async () => {
    usePendingRecaudosMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    page = mountPage(<RecaudosQueue />);

    expect(page.container.querySelector('[role="alert"]')?.textContent).toBe(
      'No se pudieron cargar los depósitos.'
    );
  });
});

describe('RecaudosQueue global search', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('offers one labelled search field in the toolbar, and no provider combobox', async () => {
    page = renderPage();

    expect(searchInput().getAttribute('aria-label')).toBe('Buscar depósitos');
    expect(page.container.querySelector('[role="search"] input[role="combobox"]')).toBeNull();
    expect(page.container.querySelectorAll('[role="search"] input')).toHaveLength(1);
  });

  it('keeps the provider filter out of the toolbar', async () => {
    page = renderPage();

    const toolbar = page.container.querySelector('[role="search"]');

    expect(toolbar?.textContent).not.toContain('Proveedor');
    expect(toolbar?.textContent).toContain('Estado');
    expect(toolbar?.textContent).toContain('Cliente');
    expect(toolbar?.textContent).toContain('Moneda');
  });

  it('searches after the debounce, not on each keystroke', async () => {
    page = renderPage();

    changeValue(searchInput(), 'ana');
    advance(349);

    expect(lastFilter()).toEqual({});

    advance(1);

    expect(lastFilter()).toEqual({ search: 'ana' });
  });

  it('searches immediately on Enter', async () => {
    page = renderPage();

    changeValue(searchInput(), 'RC-ABC-123');
    pressKey(searchInput(), 'Enter');

    expect(lastFilter()).toEqual({ search: 'RC-ABC-123' });
  });

  it('clears the search and queries again with Escape', async () => {
    page = renderPage();
    changeValue(searchInput(), 'ana');
    advance(350);
    expect(lastFilter()).toEqual({ search: 'ana' });

    pressKey(searchInput(), 'Escape');

    expect(searchInput().value).toBe('');
    expect(lastFilter()).toEqual({});
  });

  it('clears the search and queries again with the clear button', async () => {
    page = renderPage();
    changeValue(searchInput(), 'ana');
    advance(350);

    page.click(clearSearchButton() as HTMLButtonElement);

    expect(searchInput().value).toBe('');
    expect(lastFilter()).toEqual({});
    expect(clearSearchButton()).toBeNull();
  });

  it('combines with the Estado, Cliente and Moneda filters', async () => {
    page = renderPage();
    selectOnlyStatus('Aprobado');
    pickFromToolbar('Cliente', 'Acme');
    pickFromToolbar('Moneda', 'USDT');

    changeValue(searchInput(), 'ana');
    advance(350);

    expect(lastFilter()).toEqual({
      search: 'ana',
      statuses: ['COMPLETED'],
      clientId: 'client-2',
      currency: 'USDT',
    });
  });

  it('keeps the search when another filter changes', async () => {
    page = renderPage();
    changeValue(searchInput(), 'ana');
    advance(350);

    pickFromToolbar('Moneda', 'BTC');

    expect(lastFilter()).toEqual({ search: 'ana', currency: 'BTC' });
    expect(searchInput().value).toBe('ana');
  });

  it('counts an active search as a filter and offers the reset', async () => {
    page = renderPage();
    expect(resetButton()).toBeNull();

    changeValue(searchInput(), 'ana');
    advance(350);

    expect(resetButton()).not.toBeNull();
  });

  it('clears the search when the filters are reset', async () => {
    page = renderPage();
    changeValue(searchInput(), 'ana');
    advance(350);

    const reset = resetButton();
    if (!reset) throw new Error('No reset button');
    page.click(reset);

    expect(searchInput().value).toBe('');
    expect(lastFilter()).toEqual({});
    expect(resetButton()).toBeNull();
  });

  it('names the search in the empty message, and hints at Estado in the pending-only view', async () => {
    page = renderPage([], 0);

    changeValue(searchInput(), 'ana');
    advance(350);

    expect(page.text()).toContain('Sin depósitos pendientes para «ana»');
    expect(page.text()).toContain('Amplía el filtro Estado');
  });

  it('names the search in the empty message once Estado is not pending-only', async () => {
    page = renderPage([], 0);
    selectOnlyStatus('Aprobado');

    changeValue(searchInput(), 'ana');
    advance(350);

    expect(page.text()).toContain('Ningún depósito coincide con «ana»');
    expect(page.text()).not.toContain('Amplía el filtro Estado');
  });
});

describe('RecaudosQueue column header filters', () => {
  function headerTitles(): string[] {
    return Array.from(page.container.querySelectorAll('th')).map(
      (cell) => cell.textContent?.trim() ?? ''
    );
  }

  it('puts a filter on the Cliente, Monto (Moneda), Proveedor and Estado headers', async () => {
    page = renderPage();

    expect(columnFilterButton('Cliente')).toBeTruthy();
    expect(columnFilterButton('Moneda')).toBeTruthy();
    expect(columnFilterButton('Proveedor')).toBeTruthy();
    expect(columnFilterButton('Estado')).toBeTruthy();
  });

  it('makes the header title itself the button, with no funnel icon', async () => {
    page = renderPage();

    expect(headerTitles()).toEqual([
      'Cliente',
      'Usuario',
      'Billetera',
      'Monto',
      'Origen',
      'Proveedor',
      'Estado',
      'Creado',
      'Acciones',
    ]);
    expect(
      Array.from(page.container.querySelectorAll('th button')).map((button) => button.textContent)
    ).toEqual(['Cliente', 'Monto', 'Proveedor', 'Estado']);
    expect(page.container.querySelector('th button svg')).toBeNull();
  });

  it('opens the filter by clicking the header title', async () => {
    page = renderPage();

    page.click(page.findByText('th button', 'Estado'));

    expect(popoverOption('Aprobado')).toBeTruthy();
  });

  it('opens the currency filter from the Monto title, right-aligned', async () => {
    page = renderPage();

    const title = page.findByText<HTMLButtonElement>('th button', 'Monto');

    expect(title.getAttribute('aria-label')).toBe('Filtrar por Moneda');
    expect(title.parentElement?.className).toContain('justify-end');

    page.click(title);

    expect(popoverOption('BTC')).toBeTruthy();
  });

  it('edits the same Estado state as the toolbar', async () => {
    page = renderPage();

    page.click(columnFilterButton('Estado'));
    page.click(popoverOption('Aprobado'));

    expect(lastFilter()).toEqual({ statuses: ['PENDING', 'COMPLETED'] });
    expect(toolbarButton('Estado').textContent).toContain('Aprobado');
    expect(columnFilterButton('Estado').getAttribute('data-active')).toBe('true');

    page.click(toolbarButton('Estado'));
    page.click(popoverOption('Pendiente'));

    expect(lastFilter()).toEqual({ statuses: ['COMPLETED'] });
  });

  it('shows a filter set in the toolbar as active in the header', async () => {
    page = renderPage();
    expect(columnFilterButton('Moneda').getAttribute('data-active')).toBe('false');

    pickFromToolbar('Moneda', 'USDC');

    expect(columnFilterButton('Moneda').getAttribute('data-active')).toBe('true');
    expect(columnFilterButton('Moneda').getAttribute('aria-label')).toBe(
      'Filtrar por Moneda (filtro activo)'
    );
  });

  it('filters by client from the Cliente header', async () => {
    page = renderPage();

    page.click(columnFilterButton('Cliente'));
    page.click(popoverOption('Acme'));

    expect(lastFilter()).toEqual({ clientId: 'client-2' });
    expect(toolbarButton('Cliente').textContent).toContain('Acme');
  });

  it('filters by currency from the Monto header', async () => {
    page = renderPage();

    page.click(columnFilterButton('Moneda'));
    page.click(popoverOption('BTC'));

    expect(lastFilter()).toEqual({ currency: 'BTC' });
    expect(toolbarButton('Moneda').textContent).toContain('BTC');
  });

  it('filters by provider from the Proveedor header and flags it as active', async () => {
    page = renderPage();
    expect(columnFilterButton('Proveedor').getAttribute('data-active')).toBe('false');

    page.click(columnFilterButton('Proveedor'));
    page.click(popoverOption('kirafin'));

    expect(lastFilter()).toEqual({ providerCode: 'kirafin' });
    expect(columnFilterButton('Proveedor').getAttribute('data-active')).toBe('true');
    expect(resetButton()).not.toBeNull();
  });

  it('recommends the providers seen in the rows inside the Proveedor header', async () => {
    page = renderPage([
      PENDING_RECAUDO,
      { ...PENDING_RECAUDO, id: 'x', provider_code: 'bancolombia' },
    ]);

    page.click(columnFilterButton('Proveedor'));
    const suggestions = Array.from(document.body.querySelectorAll('[role="option"]')).map((node) =>
      node.textContent?.replace('Seleccionado', '').trim()
    );

    expect(suggestions).toEqual(['bancolombia', 'kirafin']);
  });

  it('applies a provider typed in the Proveedor header', async () => {
    page = renderPage();

    page.click(columnFilterButton('Proveedor'));
    const box = document.body.querySelector<HTMLInputElement>('input[cmdk-input]');
    if (!box) throw new Error('No provider search');
    changeValue(box, ' nuevo ');
    page.click(popoverOption('Usar «nuevo»'));

    expect(lastFilter()).toEqual({ providerCode: 'nuevo' });
  });

  it('clears the provider when the filters are reset', async () => {
    page = renderPage();
    page.click(columnFilterButton('Proveedor'));
    page.click(popoverOption('kirafin'));

    const reset = resetButton();
    if (!reset) throw new Error('No reset button');
    page.click(reset);

    expect(lastFilter()).toEqual({});
    expect(columnFilterButton('Proveedor').getAttribute('data-active')).toBe('false');
  });

  it('clears a header filter from its own list', async () => {
    page = renderPage();
    pickFromToolbar('Cliente', 'Acme');

    page.click(columnFilterButton('Cliente'));
    page.click(popoverOption('Limpiar filtro'));

    expect(lastFilter()).toEqual({});
  });
});

describe('RecaudosQueue read-only for OPS_COMMERCIAL (#411)', () => {
  afterEach(() => {
    canOperate = true;
  });

  it('lists the deposit but renders no approve/reject action nor the manual recaudo form', () => {
    canOperate = false;
    page = renderPage();

    expect(page.text()).toContain('RC-ABC-123');
    expect(actionButton('Aprobar')).toBeNull();
    expect(actionButton('Rechazar')).toBeNull();
    expect(page.text()).not.toContain('create-recaudo-form');
  });
});
