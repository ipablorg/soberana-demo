/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
// Statically imported so the page's module graph is transformed during
// collection instead of inside the first (timed) test.
import ComplianceReview from '../review';

const usePendingKycQueueMock = vi.fn();
const reviewKycMutate = vi.fn();
const requestAdditionalInfoMutate = vi.fn();
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

vi.mock('../../../provider-requirements/components/provider-requirements-banner', () => ({
  ProviderRequirementsBanner: () => <div>provider-requirements-banner</div>,
}));

vi.mock('../../../ops-review/components/client-filter-select', () => ({
  ClientFilterSelect: ({ onChange }: { onChange: (clientId: string | undefined) => void }) => (
    <button type="button" onClick={() => onChange('client-2')}>
      select-client-2
    </button>
  ),
}));

vi.mock('../../hooks/use-kyc-review', () => ({
  usePendingKycQueue: (filter: unknown) => usePendingKycQueueMock(filter),
  useReviewKyc: () => ({ mutate: reviewKycMutate, isPending: false }),
  useRequestKycAdditionalInfo: () => ({
    mutate: requestAdditionalInfoMutate,
    isPending: false,
  }),
}));

vi.mock('../../components/kyc-dossier-dialog', () => ({
  KycDossierDialog: () => null,
}));

vi.mock('@/shared/components/common/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock('@/shared/components/ui/select', () => ({
  Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/shared/components/backoffice/StateChangeConfirmationModal', () => ({
  StateChangeConfirmationModal: (props: {
    open: boolean;
    toState: string;
    reasonRequired: boolean;
    onConfirm: (reason: string) => void;
  }) => {
    confirmationProps = props;
    return props.open ? <div data-testid="confirmation-modal" /> : null;
  },
}));

const QUEUE_ROW = {
  id: '11111111-1111-4111-8111-111111111111',
  client_id: 'client-1',
  client_name: 'Trokera',
  email: 'ana@example.com',
  first_name: 'Ana',
  last_name: 'Gómez',
  customer_type: 'individual',
  country: 'COL',
  kyc_status: 'PENDING_REVIEW',
  customer_status: 'ACTIVE',
  submitted_at: '2026-07-09T12:30:00.000Z',
  has_documents: true,
  documents_count: 3,
};

let page: MountedPage;

function renderPage() {
  return mountPage(<ComplianceReview />);
}

beforeEach(() => {
  usePendingKycQueueMock.mockClear();
  confirmationProps = null;
  reviewKycMutate.mockClear();
  requestAdditionalInfoMutate.mockClear();
  usePendingKycQueueMock.mockReturnValue({
    data: {
      adminLoopay_listPendingKyc: {
        data: [QUEUE_ROW],
        total: 1,
        has_more: false,
      },
    },
    isLoading: false,
  });
});

afterEach(() => {
  page?.unmount();
});

describe('ComplianceReview queue', () => {
  it('shows the provider requirements banner on the super admin landing (S21)', () => {
    page = renderPage();

    expect(page.text()).toContain('provider-requirements-banner');
  });

  it('renders one row per customer awaiting a KYC decision', async () => {
    page = renderPage();

    const rendered = page.text();

    expect(rendered).toContain('Ana Gómez');
    expect(rendered).toContain('ana@example.com');
    expect(rendered).toContain('COL');
    expect(rendered).toContain('Pendiente de revisión');
    expect(rendered).not.toContain('PENDING_REVIEW');
  });

  it('shows the empty message when the queue comes back empty', async () => {
    usePendingKycQueueMock.mockReturnValue({
      data: {
        adminLoopay_listPendingKyc: { data: [], total: 0, has_more: false },
      },
      isLoading: false,
    });

    page = renderPage();

    expect(page.text()).toContain('No hay clientes pendientes de revisión');
  });
});

describe('ComplianceReview approval flow', () => {
  it('approves through the confirmation modal without requiring a reason', async () => {
    page = renderPage();

    page.click(page.findByText('button', 'Aprobar'));

    expect(confirmationProps?.open).toBe(true);
    expect(confirmationProps?.toState).toBe('APPROVED');
    expect(confirmationProps?.reasonRequired).toBe(false);

    page.flush(() => confirmationProps?.onConfirm(''));

    expect(reviewKycMutate).toHaveBeenCalledWith({
      customerId: QUEUE_ROW.id,
      input: { decision: 'APPROVED' },
    });
    expect(requestAdditionalInfoMutate).not.toHaveBeenCalled();
  });

  it('sends the rejection reason the modal collected', async () => {
    page = renderPage();

    page.click(page.findByText('button', 'Rechazar'));

    expect(confirmationProps?.toState).toBe('REJECTED');
    expect(confirmationProps?.reasonRequired).toBe(true);

    page.flush(() => confirmationProps?.onConfirm('  documento ilegible  '));

    expect(reviewKycMutate).toHaveBeenCalledWith({
      customerId: QUEUE_ROW.id,
      input: { decision: 'REJECTED', reason: 'documento ilegible' },
    });
  });

  it('routes the additional-information request to its own mutation', async () => {
    page = renderPage();

    page.click(page.findByText('button', 'Solicitar información'));

    expect(confirmationProps?.toState).toBe('ADDITIONAL_INFO_REQUIRED');

    page.flush(() => confirmationProps?.onConfirm('falta el recibo'));

    expect(requestAdditionalInfoMutate).toHaveBeenCalledWith({
      customerId: QUEUE_ROW.id,
      input: { reason: 'falta el recibo' },
    });
    expect(reviewKycMutate).not.toHaveBeenCalled();
  });
});

describe('ComplianceReview client filter', () => {
  it('renders the client name of each row', async () => {
    page = renderPage();

    expect(page.text()).toContain('Trokera');
  });

  it('queries every client until a client is selected', async () => {
    page = renderPage();

    expect(usePendingKycQueueMock.mock.calls[0]?.[0]).not.toHaveProperty('clientId');
  });

  it('passes the selected clientId to the queue hook', async () => {
    page = renderPage();

    page.click(page.findByText('button', 'select-client-2'));

    expect(usePendingKycQueueMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ clientId: 'client-2' })
    );
  });

  it('searches the queue by name, business legal name or email through `search` (N-5)', async () => {
    page = renderPage();
    const input = page.container.querySelector('#kyc-search') as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    page.flush(() => {
      setter?.call(input, 'Acme');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(usePendingKycQueueMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'Acme' })
    );
    expect(usePendingKycQueueMock.mock.lastCall?.[0]).not.toHaveProperty('email');
  });
});

describe('ComplianceReview read-only for OPS_COMMERCIAL (#411)', () => {
  afterEach(() => {
    canOperate = true;
  });

  it('lists the queue and the dossier but renders no KYC decision button', () => {
    canOperate = false;
    page = renderPage();

    const labels = Array.from(page.container.querySelectorAll('button')).map((button) =>
      button.textContent?.trim()
    );

    expect(page.text()).toContain('Ana Gómez');
    expect(labels).toContain('Ver expediente');
    expect(labels).not.toContain('Aprobar');
    expect(labels).not.toContain('Rechazar');
    expect(labels).not.toContain('Solicitar información');
  });
});
