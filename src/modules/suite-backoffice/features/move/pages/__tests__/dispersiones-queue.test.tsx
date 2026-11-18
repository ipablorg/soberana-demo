/* @vitest-environment jsdom */

import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminDispersionQueueRow } from '@/graphql/queries/admin-loopay';
import type { AdminDispersion } from '@/graphql/types/admin-loopay';
import { mountPage, type MountedPage } from '@/test/dom-render';
// Statically imported so the page's module graph is transformed during
// collection instead of inside the first (timed) test.
import DispersionesQueue from '../dispersiones-queue';

const usePendingDispersionesMock = vi.fn();
const approveMutate = vi.fn();
const completeMutate = vi.fn();
const rejectMutate = vi.fn();
const failMutate = vi.fn();
const cancelMutate = vi.fn();
const rejectWithdrawalMutate = vi.fn();
const retryFundingMutate = vi.fn();
const retryReturnMutate = vi.fn();
type DecisionFailureHandler = (kind: 'mfa-required' | 'conflict') => void;
let approveFailure: DecisionFailureHandler | undefined;
// #413: only LOOPAY_OPERATIONS / LOOPAY_ADMIN decide a withdrawal in the approval flow.
let canDecide = true;
let approveDialogProps: {
  dispersion: unknown;
  lockedFundsLocation?: string;
  onConfirm: (fundsLocation: string, note: string) => void;
} | null = null;

let confirmationProps: {
  open: boolean;
  toState: string;
  reasonRequired: boolean;
  onConfirm: (reason: string) => void;
  entitySummary?: ReadonlyArray<{ label: string; value: string }>;
} | null = null;

// #411: OPS_COMMERCIAL reads this screen without any action button.
let canOperate = true;
vi.mock('@/shared/hooks/use-can-operate-money', () => ({
  useCanOperateMoney: () => canOperate,
}));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('../../../ops-review/components/client-filter-select', () => ({
  ClientFilterSelect: ({ onChange }: { onChange: (clientId: string | undefined) => void }) => (
    <button type="button" onClick={() => onChange('client-2')}>
      select-client-2
    </button>
  ),
}));

vi.mock('../../hooks/use-dispersiones-queue', () => ({
  usePendingDispersiones: (filter: unknown) => usePendingDispersionesMock(filter),
  useCanDecideWithdrawals: () => canDecide,
  useApproveDispersion: (_onCompleted?: () => void, onFailure?: DecisionFailureHandler) => {
    approveFailure = onFailure;
    return { mutate: approveMutate, isPending: false };
  },
  useRejectWithdrawal: () => ({ mutate: rejectWithdrawalMutate, isPending: false }),
  useRetryDispersionFunding: () => ({ mutate: retryFundingMutate, isPending: false }),
  useRetryDispersionReturn: () => ({ mutate: retryReturnMutate, isPending: false }),
  useCompleteDispersion: () => ({ mutate: completeMutate, isPending: false }),
  useRejectDispersion: () => ({ mutate: rejectMutate, isPending: false }),
  useFailDispersion: () => ({ mutate: failMutate, isPending: false }),
  useCancelDispersion: () => ({ mutate: cancelMutate, isPending: false }),
}));

vi.mock('../../components/dispersion-settlement-dialogs', () => ({
  CompleteDispersionDialog: () => null,
  ApproveDispersionDialog: (props: NonNullable<typeof approveDialogProps>) => {
    approveDialogProps = props;
    return props.dispersion ? <div data-testid="approve-dialog" /> : null;
  },
}));

vi.mock('@/shared/components/common/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock('@/shared/components/backoffice/StateChangeConfirmationModal', () => ({
  StateChangeConfirmationModal: (props: {
    open: boolean;
    toState: string;
    reasonRequired: boolean;
    onConfirm: (reason: string) => void;
    entitySummary?: ReadonlyArray<{ label: string; value: string }>;
  }) => {
    confirmationProps = props;
    return props.open ? <div /> : null;
  },
}));

const PENDING_DISPERSION: AdminDispersion = {
  id: '44444444-4444-4444-8444-444444444444',
  reference_code: 'WD-ABC-123',
  customer_id: 'customer-1',
  customer_email: 'ana@example.com',
  client_id: 'client-1',
  client_name: 'Trokera',
  wallet_id: 'wallet-1',
  amount: '900.00',
  currency: 'USD',
  status: 'PENDING',
  held_amount: '900.00',
  beneficiary: {
    id: 'beneficiary-1',
    holder_name: 'Carlos Ruiz',
    rail_code: 'co_breb',
    currency: 'COP',
    bank_details: null,
  },
  funds_location: null,
  created_at: '2026-07-09T12:30:00.000Z',
  review_reason: null,
  reviewed_at: null,
  quote_rate: null,
  quote_source_amount: null,
  quote_source_currency: null,
  quote_target_amount: null,
  quote_target_currency: null,
  fee_amount: null,
  fee_source: null,
  fee_currency: null,
  settlement_amount: null,
  settlement_currency: null,
  settlement_rate: null,
  settlement_bank_rate: null,
  settlement_fees: null,
  settlement_external_reference: null,
};

const PROCESSING_DISPERSION: AdminDispersion = {
  ...PENDING_DISPERSION,
  id: '55555555-5555-4555-8555-555555555555',
  status: 'PROCESSING',
  funds_location: 'ops_vault',
};

let page: MountedPage;

function renderPage(rows: AdminDispersionQueueRow[] = [PENDING_DISPERSION]) {
  usePendingDispersionesMock.mockReturnValue({
    data: {
      adminLoopay_listPendingDispersiones: {
        data: rows,
        total: rows.length,
        has_more: false,
      },
    },
    isLoading: false,
  });

  return mountPage(<DispersionesQueue />);
}

beforeEach(() => {
  usePendingDispersionesMock.mockClear();
  confirmationProps = null;
  approveMutate.mockClear();
  completeMutate.mockClear();
  rejectMutate.mockClear();
  failMutate.mockClear();
  cancelMutate.mockClear();
  rejectWithdrawalMutate.mockClear();
  retryFundingMutate.mockClear();
  retryReturnMutate.mockClear();
  approveFailure = undefined;
  approveDialogProps = null;
  canDecide = true;
});

afterEach(() => {
  page?.unmount();
});

describe('DispersionesQueue', () => {
  it('renders the held amount and the beneficiary summary', async () => {
    page = renderPage();

    const rendered = page.text();

    expect(rendered).toContain('ana@example.com');
    expect(rendered).toContain('WD-ABC-123');
    expect(rendered).toContain('Carlos Ruiz');
    expect(rendered).toContain('co_breb');
    expect(rendered).toContain('$900.00');
  });

  it('offers settlement actions only while the withdrawal is processing', async () => {
    page = renderPage([PROCESSING_DISPERSION]);

    const labels = Array.from(page.container.querySelectorAll('button')).map((button) =>
      button.textContent?.trim()
    );

    expect(labels).toContain('Completar');
    expect(labels).toContain('Marcar fallida');
    expect(labels).not.toContain('Aprobar');
  });
});

describe('DispersionesQueue approval flow', () => {
  it('offers no approve or execute action on any row (Loopay2/SOBERANA#409)', async () => {
    page = renderPage([PENDING_DISPERSION, PROCESSING_DISPERSION]);

    expect(buttonLabels()).not.toContain('Aprobar');
    expect(buttonLabels()).not.toContain('Ejecutar');
    expect(approveMutate).not.toHaveBeenCalled();
  });

  it('requires a reason to reject and releases through the confirmation modal', async () => {
    page = renderPage();

    page.click(page.findByText('button', 'Rechazar'));

    expect(confirmationProps?.toState).toBe('REJECTED');
    expect(confirmationProps?.reasonRequired).toBe(true);

    page.flush(() => confirmationProps?.onConfirm('beneficiario invalido'));

    expect(rejectMutate).toHaveBeenCalledWith({
      id: PENDING_DISPERSION.id,
      input: { reason: 'beneficiario invalido' },
    });
  });

  it('passes the customer, amount, reference and beneficiary to the confirm modal', async () => {
    page = renderPage();

    page.click(page.findByText('button', 'Rechazar'));

    const summary = confirmationProps?.entitySummary ?? [];
    const labels = summary.map((row) => row.label);
    const values = summary.map((row) => row.value);

    expect(labels).toContain('Usuario');
    expect(values).toContain('ana@example.com');
    expect(labels).toContain('Referencia');
    expect(values).toContain('WD-ABC-123');
    expect(values).toContain('Carlos Ruiz (co_breb)');
  });
});

describe('DispersionesQueue client filter', () => {
  it('renders the client name of each row', async () => {
    page = renderPage();

    expect(page.text()).toContain('Trokera');
  });

  it('queries every client until a client is selected', async () => {
    page = renderPage();

    expect(usePendingDispersionesMock.mock.calls[0]?.[0]).not.toHaveProperty('clientId');
  });

  it('passes the selected clientId to the queue hook', async () => {
    page = renderPage();

    page.click(page.findByText('button', 'select-client-2'));

    expect(usePendingDispersionesMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ clientId: 'client-2' })
    );
  });
});

const V2_PENDING: AdminDispersionQueueRow = {
  ...PENDING_DISPERSION,
  id: '77777777-7777-4777-8777-777777777777',
  dispersion_state: 'PENDING',
};

function withPayout(state: string): AdminDispersionQueueRow {
  return {
    ...V2_PENDING,
    payout: {
      state,
      providerCode: 'mesta',
      terminalVendorStatus: 'order:blocked',
      placedAt: null,
      terminalAt: null,
    },
  };
}

function buttonLabels(): (string | undefined)[] {
  return Array.from(page.container.querySelectorAll('button')).map((button) =>
    button.textContent?.trim()
  );
}

describe('DispersionesQueue provider payout (v2)', () => {
  it.each([
    ['PLACED', 'Pago en curso'],
    ['BLOCKED', 'Bloqueado'],
    ['REJECTED', 'Rechazado por el proveedor'],
    ['UNKNOWN', 'Estado desconocido'],
    ['EXECUTED', 'Pagado'],
    ['FAILED', 'Falló en el proveedor'],
    ['RETURNED', 'Devuelto'],
  ])(
    'renders the %s payout badge as "%s" with the provider in its tooltip label',
    async (state, label) => {
      page = renderPage([withPayout(state)]);

      expect(page.text()).toContain(label);
      expect(page.container.querySelector('[aria-label*="mesta"]')).not.toBeNull();
    }
  );

  it('offers Completar and Cancelar for a PENDING v2 row whose payout is BLOCKED', async () => {
    page = renderPage([withPayout('BLOCKED')]);

    expect(buttonLabels()).toContain('Completar');
    expect(buttonLabels()).toContain('Cancelar');
    expect(buttonLabels()).not.toContain('Aprobar');
    expect(buttonLabels()).not.toContain('Rechazar');
  });

  it('offers Completar when a PENDING v2 row has no payout yet', async () => {
    page = renderPage([V2_PENDING]);

    expect(buttonLabels()).toContain('Completar');
  });

  it('hides every manual action while the payout is PLACED', async () => {
    page = renderPage([withPayout('PLACED')]);

    expect(buttonLabels()).not.toContain('Completar');
    expect(buttonLabels()).not.toContain('Cancelar');
    expect(buttonLabels()).not.toContain('Marcar fallida');
  });

  it('cancels a v2 row through the reason modal', async () => {
    page = renderPage([withPayout('REJECTED')]);

    page.click(page.findByText('button', 'Cancelar'));

    expect(confirmationProps?.toState).toBe('CANCELLED');
    expect(confirmationProps?.reasonRequired).toBe(true);

    page.flush(() => confirmationProps?.onConfirm('no firmado'));

    expect(cancelMutate).toHaveBeenCalledWith({
      id: V2_PENDING.id,
      input: { reason: 'no firmado' },
    });
  });

  it('keeps Rechazar on legacy rows without a payout badge', async () => {
    page = renderPage([PENDING_DISPERSION]);

    expect(buttonLabels()).not.toContain('Aprobar');
    expect(buttonLabels()).toContain('Rechazar');
    expect(buttonLabels()).not.toContain('Completar');
    expect(buttonLabels()).not.toContain('Cancelar');
  });
});

describe('DispersionesQueue read-only for OPS_COMMERCIAL (#411)', () => {
  afterEach(() => {
    canOperate = true;
  });

  it('lists pending and processing withdrawals but renders no approve, reject, complete or fail button', () => {
    canOperate = false;
    page = renderPage([PENDING_DISPERSION, PROCESSING_DISPERSION]);

    const labels = Array.from(page.container.querySelectorAll('button')).map((button) =>
      button.textContent?.trim()
    );

    expect(page.text()).toContain('WD-ABC-123');
    for (const action of ['Aprobar', 'Rechazar', 'Completar', 'Marcar fallida', 'Cancelar']) {
      expect(labels).not.toContain(action);
    }
  });
});

const AWAITING_APPROVAL: AdminDispersionQueueRow = {
  ...PENDING_DISPERSION,
  id: '88888888-8888-4888-8888-888888888888',
  reference_code: 'WD-J2-001',
  amount: '10',
  currency: 'USDT',
  funds_location: 'ops_vault',
  dispersion_state: 'AWAITING_APPROVAL',
  approval_required: true,
  awaiting_approval_at: '2026-11-08T10:00:00.000Z',
  payout_plan: {
    gross: '10.00000000',
    loopay_fee: '0.50000000',
    network_component: '0.00000000',
    funding_amount: '9.50',
    rounding_remainder: '0.00000000',
  },
  stale_review_required: false,
  stale_alerts: [],
};

describe('DispersionesQueue approval flow (#413)', () => {
  it('lists the withdrawals waiting for approval in their own view', () => {
    page = renderPage([AWAITING_APPROVAL]);

    page.click(page.findByText('button', 'Esperando aprobación'));

    expect(usePendingDispersionesMock).toHaveBeenLastCalledWith({
      status: 'PENDING',
      dispersionState: 'AWAITING_APPROVAL',
    });
  });

  it('offers Aprobar and Rechazar, never the manual complete or cancel, on a row awaiting approval', () => {
    page = renderPage([AWAITING_APPROVAL]);

    expect(buttonLabels()).toContain('Aprobar');
    expect(buttonLabels()).toContain('Rechazar');
    expect(buttonLabels()).not.toContain('Completar');
    expect(buttonLabels()).not.toContain('Cancelar');
  });

  it('shows the payout plan: gross, fee and what Mesta is funded', () => {
    page = renderPage([AWAITING_APPROVAL]);

    const plan = page.container.querySelector('[data-testid="dispersion-payout-plan"]');

    expect(plan?.textContent).toContain('Bruto');
    expect(plan?.textContent).toContain('10.00');
    expect(plan?.textContent).toContain('Fee');
    expect(plan?.textContent).toContain('0.50');
    expect(plan?.textContent).toContain('Neto');
    expect(plan?.textContent).toContain('9.50');
  });

  it('approves from the ops vault through the approval dialog', () => {
    page = renderPage([AWAITING_APPROVAL]);

    page.click(page.findByText('button', 'Aprobar'));

    expect(page.container.querySelector('[data-testid="approve-dialog"]')).not.toBeNull();
    expect(approveDialogProps?.lockedFundsLocation).toBe('ops_vault');

    page.flush(() => approveDialogProps?.onConfirm('ops_vault', ' revisado '));

    expect(approveMutate).toHaveBeenCalledWith({
      id: AWAITING_APPROVAL.id,
      input: { fundsLocation: 'ops_vault', note: 'revisado' },
    });
  });

  it('rejects a row awaiting approval with a reason through the approval-flow mutation', () => {
    page = renderPage([AWAITING_APPROVAL]);

    page.click(page.findByText('button', 'Rechazar'));

    expect(confirmationProps?.toState).toBe('REJECTED');
    expect(confirmationProps?.reasonRequired).toBe(true);

    page.flush(() => confirmationProps?.onConfirm('beneficiario no coincide'));

    expect(rejectWithdrawalMutate).toHaveBeenCalledWith({
      id: AWAITING_APPROVAL.id,
      input: { reason: 'beneficiario no coincide' },
    });
    expect(rejectMutate).not.toHaveBeenCalled();
  });

  it('renders no decision for a staff member without LOOPAY_OPERATIONS or LOOPAY_ADMIN', () => {
    canDecide = false;
    page = renderPage([AWAITING_APPROVAL]);

    expect(buttonLabels()).not.toContain('Aprobar');
    expect(buttonLabels()).not.toContain('Rechazar');
  });

  it('explains a missing second factor with a link to set it up', () => {
    usePendingDispersionesMock.mockReturnValue({
      data: {
        adminLoopay_listPendingDispersiones: {
          data: [AWAITING_APPROVAL],
          total: 1,
          has_more: false,
        },
      },
      isLoading: false,
    });
    page = mountPage(
      <MemoryRouter>
        <DispersionesQueue />
      </MemoryRouter>
    );

    page.flush(() => approveFailure?.('mfa-required'));

    const alert = page.container.querySelector('[data-testid="dispersion-decision-error"]');
    expect(alert?.textContent).toContain(
      'Aprobar o rechazar un retiro requiere la verificación en dos pasos'
    );
    expect(alert?.querySelector('a')?.getAttribute('href')).toBe('/suite/settings');
  });

  it('explains a conflict: the withdrawal moved meanwhile', () => {
    page = renderPage([AWAITING_APPROVAL]);

    page.flush(() => approveFailure?.('conflict'));

    expect(
      page.container.querySelector('[data-testid="dispersion-decision-error"]')?.textContent
    ).toContain('El retiro cambió de estado');
  });
});

describe('DispersionesQueue retries (#413)', () => {
  it('retries the blocked funding of a placed order', () => {
    page = renderPage([
      {
        ...AWAITING_APPROVAL,
        status: 'PROCESSING',
        dispersion_state: 'PROCESSING',
        funding_status: 'BLOCKED',
      },
    ]);

    page.click(page.findByText('button', 'Reintentar fondeo'));

    expect(retryFundingMutate).toHaveBeenCalledWith({ id: AWAITING_APPROVAL.id });
  });

  it('retries a failed custody return', () => {
    page = renderPage([
      { ...AWAITING_APPROVAL, dispersion_state: 'RETURNING', return_status: 'FAILED' },
    ]);

    page.click(page.findByText('button', 'Reintentar devolución'));

    expect(retryReturnMutate).toHaveBeenCalledWith({ id: AWAITING_APPROVAL.id });
  });

  it('offers no retry on a row that is not blocked', () => {
    page = renderPage([AWAITING_APPROVAL]);

    expect(buttonLabels()).not.toContain('Reintentar fondeo');
    expect(buttonLabels()).not.toContain('Reintentar devolución');
  });
});

describe('DispersionesQueue stale review (#410)', () => {
  it('flags a stale withdrawal with "Revisión requerida" and the reason', () => {
    page = renderPage([
      {
        ...AWAITING_APPROVAL,
        dispersion_state: 'PENDING',
        stale_review_required: true,
        stale_review_reason: 'The sweep is still pending at custody after 24 h',
        stale_review_flagged_at: '2026-11-08T11:00:00.000Z',
        stale_alerts: [
          { key: 'dispersion.sweep_unsettled', raised_at: '2026-11-08T09:00:00.000Z' },
        ],
      },
    ]);

    const review = page.container.querySelector('[data-testid="dispersion-stale-review"]');

    expect(review?.textContent).toContain('Revisión requerida');
    expect(review?.textContent).toContain('The sweep is still pending at custody after 24 h');
    expect(review?.textContent).toContain('Barrido sin liquidar');
  });

  it('shows the alert of a withdrawal waiting for the approval for 24 h', () => {
    page = renderPage([
      {
        ...AWAITING_APPROVAL,
        stale_alerts: [{ key: 'awaiting_approval', raised_at: '2026-11-08T09:00:00.000Z' }],
      },
    ]);

    expect(
      page.container.querySelector('[data-testid="dispersion-stale-review"]')?.textContent
    ).toContain('Sin aprobación hace más de 24 h');
  });

  it('renders no stale indicator on a fresh row', () => {
    page = renderPage([AWAITING_APPROVAL]);

    expect(page.container.querySelector('[data-testid="dispersion-stale-review"]')).toBeNull();
  });
});
