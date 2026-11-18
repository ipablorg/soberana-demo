/* @vitest-environment jsdom */

import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import { KYCBanner } from '../KYCBanner';

const requirementsMock = vi.fn();
const kycState = vi.fn();

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('@/modules/suite-user/features/account', () => ({
  useBridgeKYC: () => kycState(),
}));

vi.mock('@/shared/hooks/use-auth', () => ({
  useAuth: () => ({ user: { has_accepted_latest_terms: true } }),
}));

vi.mock('@/shared/hooks/use-provider-requirements', () => ({
  useCustomerProviderRequirements: (customerId: string | null) => requirementsMock(customerId),
  useSubmitProviderRequirement: () => ({ mutate: vi.fn(), isPending: false }),
}));

const APPROVED_KYC = {
  customerId: 'c-1',
  kycStatus: 'APPROVED',
  reasons: [],
  supportHref: null,
  tosLink: null,
  isKYCApproved: true,
  isKYCExpired: false,
  isKYCFailed: false,
  startKYC: vi.fn(),
  startTos: vi.fn(),
  isStartingTos: false,
  isStartingKyc: false,
  isRefreshingSnapshot: false,
  isPollingSnapshot: false,
  isCustomerInitialized: true,
  isReadyForSuite: true,
  isBusinessHostedLinkOnly: false,
  needsKycRetry: false,
  needsManualRefresh: false,
  refreshSnapshot: vi.fn(),
  tosFlowMode: 'standard',
  tosAccepted: true,
  hasTaxId: true,
  hasAddress: true,
  onboardingMode: 'api',
  lastReconciliationSource: null,
  needsSupport: false,
};

function requirement(overrides: Record<string, unknown>) {
  return {
    id: 'r-1',
    endorsementId: 'e-1',
    customerId: 'c-1',
    provider: 'kirafin',
    railCode: 'ach',
    source: 'MISSING_FIELD',
    blockerCode: 'KIRAFIN_RFI_FILE_PROOF_OF_ADDRESS',
    key: 'file_proof_of_address',
    group: 'documents',
    kind: 'DOCUMENT',
    status: 'REQUESTED',
    documents: [],
    value: null,
    rejectReason: null,
    requestedAt: '2026-10-19T10:00:00.000Z',
    updatedAt: '2026-10-19T10:00:00.000Z',
    dueAt: null,
    ...overrides,
  };
}

let page: MountedPage;

function render() {
  page = mountPage(
    <MemoryRouter>
      <KYCBanner />
    </MemoryRouter>
  );
}

beforeEach(() => {
  kycState.mockReturnValue(APPROVED_KYC);
  requirementsMock.mockReset();
  requirementsMock.mockReturnValue({ data: { customers_providerRequirements: [] } });
});

afterEach(() => {
  page?.unmount();
});

describe('KYCBanner — Documentos requeridos (S21)', () => {
  it('keeps the banner hidden for a verified customer with nothing requested', () => {
    render();

    expect(requirementsMock).toHaveBeenCalledWith('c-1');
    expect(page.text()).toBe('');
  });

  it('asks for the documents the provider requested, by their Spanish name', () => {
    requirementsMock.mockReturnValue({
      data: { customers_providerRequirements: [requirement({})] },
    });

    render();

    expect(page.text()).toContain('Documentos requeridos');
    expect(page.text()).toContain('Comprobante de domicilio');
    expect(page.text()).toContain('Subir documentos');
  });

  it('shows why a document was rejected', () => {
    requirementsMock.mockReturnValue({
      data: {
        customers_providerRequirements: [
          requirement({ status: 'REJECTED', rejectReason: 'El comprobante tiene más de 3 meses' }),
        ],
      },
    });

    render();

    expect(page.text()).toContain('El comprobante tiene más de 3 meses');
  });

  it('does not ask again for what is already under review', () => {
    requirementsMock.mockReturnValue({
      data: { customers_providerRequirements: [requirement({ status: 'UPLOADED' })] },
    });

    render();

    expect(page.text()).not.toContain('Documentos requeridos');
  });
});
