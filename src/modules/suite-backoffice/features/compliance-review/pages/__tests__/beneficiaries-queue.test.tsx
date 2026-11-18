/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminBeneficiaryQueueItem } from '@/graphql/types/admin-loopay';
import { mountPage, type MountedPage } from '@/test/dom-render';
// Statically imported so the page's module graph is transformed during
// collection instead of inside the first (timed) test.
import BeneficiariesQueue from '../beneficiaries-queue';

const usePendingBeneficiariesMock = vi.fn();
let allBeneficiaryRows: unknown[] = [];
const reviewMutate = vi.fn();
const linkMutate = vi.fn();

let linkDialogProps: {
  beneficiary: AdminBeneficiaryQueueItem | null;
  onConfirm: (providerCode: string, providerBeneficiaryId: string) => void;
} | null = null;
let confirmationProps: {
  open: boolean;
  fromState?: string;
  toState: string;
  reasonRequired: boolean;
  onConfirm: (reason: string) => void;
  entitySummary?: ReadonlyArray<{ label: string; value: string }>;
} | null = null;
let lifecycleProps: {
  open: boolean;
  toState: string;
  onConfirm: () => void;
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

vi.mock('../../../ops-review/components/rail-filter-select', () => ({
  RailFilterSelect: ({ id }: { id: string }) => <div data-testid={id} />,
}));

vi.mock('../../hooks/use-review-queues', () => ({
  usePendingBeneficiaries: (filter: unknown) => usePendingBeneficiariesMock(filter),
  useReviewBeneficiary: () => ({ mutate: reviewMutate, isPending: false }),
  useLinkBeneficiaryProviderId: () => ({
    mutate: linkMutate,
    isPending: false,
  }),
  useAllBeneficiaries: () => ({
    data: {
      adminLoopay_listBeneficiaries: {
        data: allBeneficiaryRows,
        total: allBeneficiaryRows.length,
        has_more: false,
      },
    },
    isLoading: false,
  }),
  useDeactivateBeneficiary: () => ({ mutate: vi.fn(), isPending: false }),
  useReactivateBeneficiary: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../../components/start-provider-verification-button', () => ({
  StartProviderVerificationButton: () => null,
}));

vi.mock('../../components/provider-sandbox-actions', () => ({
  ProviderSandboxActions: () => null,
}));

vi.mock('../../components/link-beneficiary-provider-dialog', () => ({
  LinkBeneficiaryProviderDialog: (props: {
    beneficiary: AdminBeneficiaryQueueItem | null;
    onConfirm: (providerCode: string, providerBeneficiaryId: string) => void;
  }) => {
    linkDialogProps = props;
    return null;
  },
}));

vi.mock('@/shared/components/common/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock('@/shared/components/backoffice/StateChangeConfirmationModal', () => ({
  StateChangeConfirmationModal: (props: {
    open: boolean;
    fromState?: string;
    toState: string;
    reasonRequired: boolean;
    showReason?: boolean;
    onConfirm: (reason: string) => void;
    entitySummary?: ReadonlyArray<{ label: string; value: string }>;
  }) => {
    if (props.showReason === false) {
      lifecycleProps = props as { open: boolean; toState: string; onConfirm: () => void };
    } else {
      confirmationProps = props;
    }
    return props.open ? <div /> : null;
  },
}));

let bankDetailsProps: {
  bankDetails: unknown;
  railCode: string;
} | null = null;

vi.mock('@/shared/components/backoffice/bank-details-display', () => ({
  BankDetailsDisplay: (props: { bankDetails: unknown; railCode: string }) => {
    bankDetailsProps = props;
    return <div data-testid="bank-details" />;
  },
}));

vi.mock('@/shared/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

const BENEFICIARY = {
  id: '77777777-7777-4777-8777-777777777777',
  customer_id: 'customer-1',
  customer_email: 'ana@example.com',
  client_id: 'client-1',
  client_name: 'Trokera',
  rail_code: 'co_breb',
  currency: 'COP',
  holder_name: 'Carlos Ruiz',
  holder_type: 'individual',
  relationship: 'self',
  bank_details: null,
  created_at: '2026-07-09T12:30:00.000Z',
};

const BENEFICIARY_WITH_BANK_DETAILS = {
  ...BENEFICIARY,
  id: '88888888-8888-4888-8888-888888888888',
  bank_details: { account_number: '123456', bank_code: '007' },
};

let page: MountedPage;

function renderPage(rows = [BENEFICIARY]) {
  usePendingBeneficiariesMock.mockReturnValue({
    data: {
      adminLoopay_listPendingBeneficiaries: {
        data: rows,
        total: rows.length,
        has_more: false,
      },
    },
    isLoading: false,
  });

  return mountPage(<BeneficiariesQueue />);
}

beforeEach(() => {
  usePendingBeneficiariesMock.mockClear();
  linkDialogProps = null;
  confirmationProps = null;
  lifecycleProps = null;
  bankDetailsProps = null;
  reviewMutate.mockClear();
  linkMutate.mockClear();
  allBeneficiaryRows = [];
});

afterEach(() => {
  page?.unmount();
});

describe('BeneficiariesQueue', () => {
  it('renders the holder, its customer and the rail awaiting verification', async () => {
    page = renderPage();

    const rendered = page.text();

    expect(rendered).toContain('Carlos Ruiz');
    expect(rendered).toContain('ana@example.com');
    expect(rendered).toContain('Bre-B');
    expect(rendered).toContain('COP');
  });

  it('names the holder type, relationship and rail instead of raw codes (N-6)', () => {
    page = renderPage([
      { ...BENEFICIARY, holder_type: 'INDIVIDUAL', relationship: 'SELF', rail_code: 'us_ach' },
    ]);

    const rendered = page.text();
    expect(rendered).toContain('Persona natural · Cuenta propia');
    expect(rendered).not.toContain('INDIVIDUAL');
    expect(rendered).not.toContain('us_ach');
  });

  it('shows the empty message when nothing is pending', async () => {
    page = renderPage([]);

    expect(page.text()).toContain('No hay beneficiarios pendientes');
  });
});

describe('BeneficiariesQueue review flow', () => {
  it('approves as VERIFIED, which is the decision the backend accepts', async () => {
    page = renderPage();

    page.click(page.findByText('button', 'Aprobar'));

    expect(confirmationProps?.toState).toBe('VERIFIED');
    // A queued beneficiary is pending review: never "de — a Verificado" (N-6).
    expect(confirmationProps?.fromState).toBe('PENDING');
    expect(confirmationProps?.reasonRequired).toBe(false);

    page.flush(() => confirmationProps?.onConfirm(''));

    expect(reviewMutate).toHaveBeenCalledWith({
      id: BENEFICIARY.id,
      input: { decision: 'VERIFIED' },
    });
  });

  it('links the provider identifiers the dialog collected', async () => {
    page = renderPage();

    page.click(page.findByText('button', 'Vincular ID del proveedor'));

    expect(linkDialogProps?.beneficiary?.id).toBe(BENEFICIARY.id);

    page.flush(() => linkDialogProps?.onConfirm(' kirafin ', ' ext-99 '));

    expect(linkMutate).toHaveBeenCalledWith({
      id: BENEFICIARY.id,
      input: { providerCode: 'kirafin', providerBeneficiaryId: 'ext-99' },
    });
  });
});

describe('BeneficiariesQueue bank details', () => {
  it('opens a dialog with the rail bank details before approval', async () => {
    page = renderPage([BENEFICIARY_WITH_BANK_DETAILS]);

    page.click(page.findByText('button', 'Ver datos bancarios'));

    expect(bankDetailsProps?.railCode).toBe('co_breb');
    expect(bankDetailsProps?.bankDetails).toEqual({
      account_number: '123456',
      bank_code: '007',
    });
  });
});

describe('BeneficiariesQueue client filter', () => {
  it('renders the client name of each row', async () => {
    page = renderPage();

    expect(page.text()).toContain('Trokera');
  });

  it('queries every client until a client is selected', async () => {
    page = renderPage();

    expect(usePendingBeneficiariesMock.mock.calls[0]?.[0]).not.toHaveProperty('clientId');
  });

  it('passes the selected clientId to the queue hook', async () => {
    page = renderPage();

    page.click(page.findByText('button', 'select-client-2'));

    expect(usePendingBeneficiariesMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ clientId: 'client-2' })
    );
  });
});

const ALL_ROW = {
  id: 'row-1',
  customerId: 'customer-1',
  clientId: 'client-1',
  customerEmail: 'ana@example.com',
  railId: 'rail-1',
  railCode: 'ach',
  railName: 'ACH (US)',
  railCountry: 'USA',
  providerId: null,
  providerCode: null,
  providerName: null,
  relationship: 'self',
  holderType: 'individual',
  holderName: 'Row Holder',
  holderTaxId: null,
  currency: 'USD',
  bankDetails: {},
  alias: null,
  status: 'VERIFIED',
  isFavorite: false,
  providerBeneficiaryId: null,
  providerMetadata: null,
  country: 'US',
  reviewStatus: 'APPROVED',
  reviewReason: null,
  reviewedAt: null,
  createdAt: '2026-10-14T12:00:00.000Z',
  updatedAt: '2026-10-14T12:00:00.000Z',
};

describe('BeneficiariesQueue all-beneficiaries tab (provider, country, rail, review)', () => {
  function openAllTab(rows: unknown[]) {
    allBeneficiaryRows = rows;
    page = renderPage([]);
    page.click(page.findByText('button', 'Todos los beneficiarios'));
  }

  it('shows provider, country, rail and review status columns', () => {
    openAllTab([
      {
        ...ALL_ROW,
        id: 'a',
        holderName: 'Provider Holder',
        providerCode: 'mesta',
        reviewStatus: 'IN_REVIEW',
        status: 'PENDING',
      },
    ]);

    const text = page.text();
    for (const header of ['Proveedor', 'País', 'Riel', 'Revisión']) {
      expect(text).toContain(header);
    }
    expect(text).toContain('Mesta');
    expect(text).toContain('Estados Unidos');
    expect(text).toContain('ACH');
    expect(text).toContain('En revisión');
  });

  it('shows the provider rejection reason as a tooltip on a rejected row', () => {
    openAllTab([
      {
        ...ALL_ROW,
        providerCode: 'kirafin',
        reviewStatus: 'REJECTED',
        reviewReason: 'Routing number invalido',
        status: 'REJECTED',
      },
    ]);
    expect(
      page.container.querySelector('[data-review-kind="rejected"]')?.getAttribute('title')
    ).toBe('Routing number invalido');
  });

  it('keeps Desactivar only on provider-less rows: the provider owns the others', () => {
    openAllTab([
      { ...ALL_ROW, id: 'own', holderName: 'Manual Holder' },
      { ...ALL_ROW, id: 'prov', holderName: 'Provider Holder', providerCode: 'mesta' },
    ]);

    const deactivate = Array.from(page.container.querySelectorAll('button')).filter(
      (button) => button.textContent === 'Desactivar'
    );
    expect(deactivate).toHaveLength(1);
    expect(page.text()).toContain('Lo gestiona el proveedor');

    page.click(deactivate[0]);
    expect(lifecycleProps?.open).toBe(true);
    expect(lifecycleProps?.toState).toBe('UNVERIFIED');
  });

  it('keeps Reactivar only on provider-less rows too', () => {
    openAllTab([
      { ...ALL_ROW, id: 'own', status: 'UNVERIFIED', reviewStatus: 'REJECTED' },
      {
        ...ALL_ROW,
        id: 'prov',
        providerCode: 'kirafin',
        status: 'UNVERIFIED',
        reviewStatus: 'REJECTED',
      },
    ]);

    const reactivate = Array.from(page.container.querySelectorAll('button')).filter(
      (button) => button.textContent === 'Reactivar'
    );
    expect(reactivate).toHaveLength(1);
  });
});

describe('BeneficiariesQueue read-only for OPS_COMMERCIAL (#411)', () => {
  afterEach(() => {
    canOperate = true;
  });

  it('lists the beneficiary and its bank details but renders no review or link button', () => {
    canOperate = false;
    page = renderPage();

    const labels = Array.from(page.container.querySelectorAll('button')).map((button) =>
      button.textContent?.trim()
    );

    expect(page.text()).toContain('Carlos Ruiz');
    expect(labels).toContain('Ver datos bancarios');
    expect(labels).not.toContain('Aprobar');
    expect(labels).not.toContain('Rechazar');
    expect(labels).not.toContain('Vincular ID del proveedor');
  });
});
