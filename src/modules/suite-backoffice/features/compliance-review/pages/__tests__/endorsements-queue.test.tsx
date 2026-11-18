/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
// Statically imported so the page's module graph is transformed during
// collection instead of inside the first (timed) test.
import EndorsementsQueue from '../endorsements-queue';

const usePendingEndorsementsMock = vi.fn();
const reviewMutate = vi.fn();
let reviewCompleted: ((result: unknown) => void) | undefined;
let approvalDialogProps: {
  endorsement: { id: string } | null;
  onConfirm: () => void;
} | null = null;
let resultPanelProps: { result: unknown } | null = null;
let confirmationProps: {
  open: boolean;
  toState: string;
  reasonRequired: boolean;
  onConfirm: (reason: string) => void;
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
  usePendingEndorsements: (filter: unknown) => usePendingEndorsementsMock(filter),
  useReviewEndorsement: (onCompleted?: (result: unknown) => void) => {
    reviewCompleted = onCompleted;
    return { mutate: reviewMutate, isPending: false };
  },
}));

vi.mock('../../components/endorsement-approval-dialog', () => ({
  EndorsementApprovalDialog: (props: {
    endorsement: { id: string } | null;
    onConfirm: () => void;
  }) => {
    approvalDialogProps = props;
    return null;
  },
}));

vi.mock('../../components/endorsement-onboarding-result', () => ({
  EndorsementOnboardingResult: (props: { result: unknown }) => {
    resultPanelProps = props;
    return null;
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
  }) => {
    confirmationProps = props;
    return props.open ? <div /> : null;
  },
}));

const ENDORSEMENT = {
  id: '66666666-6666-4666-8666-666666666666',
  customer_id: 'customer-1',
  customer_email: 'ana@example.com',
  client_id: 'client-1',
  client_name: 'Trokera',
  rail_code: 'co_breb',
  rail_name: 'Bre-B',
  currency: 'COP',
  status: 'PENDING',
  requested_at: '2026-07-09T12:30:00.000Z',
  review_reason: null,
};

let page: MountedPage;

function renderPage(rows = [ENDORSEMENT]) {
  usePendingEndorsementsMock.mockReturnValue({
    data: {
      adminLoopay_listPendingEndorsements: {
        data: rows,
        total: rows.length,
        has_more: false,
      },
    },
    isLoading: false,
  });

  return mountPage(<EndorsementsQueue />);
}

beforeEach(() => {
  usePendingEndorsementsMock.mockClear();
  confirmationProps = null;
  approvalDialogProps = null;
  resultPanelProps = null;
  reviewCompleted = undefined;
  reviewMutate.mockClear();
});

afterEach(() => {
  page?.unmount();
});

describe('EndorsementsQueue', () => {
  it('renders the rail and customer awaiting an endorsement decision', async () => {
    page = renderPage();

    const rendered = page.text();

    expect(rendered).toContain('ana@example.com');
    expect(rendered).toContain('Bre-B');
    expect(rendered).toContain('co_breb');
    expect(rendered).toContain('COP');
  });

  it('shows the empty message when nothing is pending', async () => {
    page = renderPage([]);

    expect(page.text()).toContain('No hay habilitaciones pendientes');
  });
});

describe('EndorsementsQueue review flow', () => {
  it('#411: approves without choosing a provider, the client rail decides it', async () => {
    page = renderPage();

    page.click(page.findByText('button', 'Aprobar'));

    expect(approvalDialogProps?.endorsement?.id).toBe(ENDORSEMENT.id);

    page.flush(() => approvalDialogProps?.onConfirm());

    expect(reviewMutate).toHaveBeenCalledWith({
      id: ENDORSEMENT.id,
      input: { decision: 'APPROVED' },
    });
  });

  it('hands the onboarding outcome to the result panel once the approval lands', async () => {
    page = renderPage();
    const result = {
      id: ENDORSEMENT.id,
      onboarding: { state: 'FAILED', provider_code: 'mesta', error_code: null, error_message: 'x' },
    };

    page.flush(() => reviewCompleted?.({ adminLoopay_reviewEndorsement: result }));

    expect(resultPanelProps?.result).toEqual(result);
  });

  it('sends the rejection reason collected by the modal', async () => {
    page = renderPage();

    page.click(page.findByText('button', 'Rechazar'));

    expect(confirmationProps?.reasonRequired).toBe(true);

    page.flush(() => confirmationProps?.onConfirm('riel no habilitado'));

    expect(reviewMutate).toHaveBeenCalledWith({
      id: ENDORSEMENT.id,
      input: { decision: 'REJECTED', reason: 'riel no habilitado' },
    });
  });
});

describe('EndorsementsQueue client filter', () => {
  it('renders the client name of each row', async () => {
    page = renderPage();

    expect(page.text()).toContain('Trokera');
  });

  it('queries every client until a client is selected', async () => {
    page = renderPage();

    expect(usePendingEndorsementsMock.mock.calls[0]?.[0]).not.toHaveProperty('clientId');
  });

  it('passes the selected clientId to the queue hook', async () => {
    page = renderPage();

    page.click(page.findByText('button', 'select-client-2'));

    expect(usePendingEndorsementsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ clientId: 'client-2' })
    );
  });
});

describe('EndorsementsQueue read-only for OPS_COMMERCIAL (#411)', () => {
  afterEach(() => {
    canOperate = true;
  });

  it('lists the pending endorsement but renders no approve or reject button', () => {
    canOperate = false;
    page = renderPage();

    const labels = Array.from(page.container.querySelectorAll('button')).map((button) =>
      button.textContent?.trim()
    );

    expect(page.text()).toContain('ana@example.com');
    expect(labels).not.toContain('Aprobar');
    expect(labels).not.toContain('Rechazar');
  });
});
