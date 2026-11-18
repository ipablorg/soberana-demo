/* @vitest-environment jsdom */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import { CustomerProviderRequirementsBanner } from '../provider-requirements/customer-provider-requirements-banner';

const requirementsMock = vi.fn();

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('@/modules/suite-user/features/account', () => ({
  useBridgeKYC: () => ({ customerId: 'c-1', isKYCApproved: true }),
}));

vi.mock('@/shared/hooks/use-provider-requirements', () => ({
  useCustomerProviderRequirements: (customerId: string | null) => requirementsMock(customerId),
  useSubmitProviderRequirement: () => ({ mutate: vi.fn(), isPending: false }),
}));

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

beforeEach(() => {
  requirementsMock.mockReset();
});

afterEach(() => {
  page?.unmount();
});

describe('CustomerProviderRequirementsBanner (N3)', () => {
  it('asks a KYC-approved customer for what the provider requested or rejected', () => {
    requirementsMock.mockReturnValue({
      data: {
        customers_providerRequirements: [
          requirement({}),
          requirement({ id: 'r-2', status: 'REJECTED', rejectReason: 'Ilegible' }),
          requirement({ id: 'r-3', status: 'UPLOADED' }),
        ],
      },
    });

    page = mountPage(<CustomerProviderRequirementsBanner />);

    expect(requirementsMock).toHaveBeenCalledWith('c-1');
    expect(page.text()).toContain('Documentos requeridos');
    expect(page.text()).toContain('Ilegible');
  });

  it('renders nothing when nothing waits for the customer', () => {
    requirementsMock.mockReturnValue({
      data: { customers_providerRequirements: [requirement({ status: 'APPROVED' })] },
    });

    page = mountPage(<CustomerProviderRequirementsBanner />);

    expect(page.text()).toBe('');
  });

  it('is mounted on the home of a KYC-approved customer', () => {
    const home = readFileSync(resolve(__dirname, '../../pages/conversational-home.tsx'), 'utf-8');

    expect(home).toMatch(
      /\{isKYCApproved && \(\s*<div[^>]*>[\s\S]{0,200}<CustomerProviderRequirementsBanner \/>/
    );
  });
});
