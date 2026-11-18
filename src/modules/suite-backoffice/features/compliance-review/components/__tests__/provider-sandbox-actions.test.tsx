/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import { ProviderSandboxActions } from '../provider-sandbox-actions';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

const simulateMutate = vi.fn();
let availability: { mesta: boolean; kirafin: boolean } | undefined;

vi.mock('../../hooks/use-provider-sandbox', () => ({
  useProviderSandboxAvailability: () => ({
    data: availability ? { adminLoopay_providerSandboxAvailability: availability } : undefined,
  }),
  useSimulateProviderBeneficiary: () => ({
    mutate: simulateMutate,
    isPending: false,
  }),
}));

let page: MountedPage;

const beneficiary = {
  id: 'ben-1',
  providerCode: 'mesta',
  reviewStatus: 'IN_REVIEW',
};

function bodyText(): string {
  return (document.body.textContent ?? '').replace(/\s+/g, ' ');
}

function clickButton(label: string) {
  const button = Array.from(document.querySelectorAll('button')).find((b) =>
    (b.textContent ?? '').includes(label)
  );
  if (!button) throw new Error(`button not found: ${label}`);
  page.flush(() => button.click());
}

afterEach(() => {
  page?.unmount();
  simulateMutate.mockReset();
  availability = undefined;
});

describe('ProviderSandboxActions', () => {
  it('renders nothing while the backend does not report a sandbox', () => {
    availability = { mesta: false, kirafin: false };
    page = mountPage(<ProviderSandboxActions beneficiary={beneficiary} />);

    expect(bodyText()).not.toContain('sandbox');
  });

  it('renders nothing for a beneficiary that is not in review', () => {
    availability = { mesta: true, kirafin: false };
    page = mountPage(
      <ProviderSandboxActions beneficiary={{ ...beneficiary, reviewStatus: 'APPROVED' }} />
    );

    expect(bodyText()).not.toContain('sandbox');
  });

  it('shows both buttons when the Mesta sandbox is available', () => {
    availability = { mesta: true, kirafin: false };
    page = mountPage(<ProviderSandboxActions beneficiary={beneficiary} />);

    expect(bodyText()).toContain('Simular aprobación (sandbox)');
    expect(bodyText()).toContain('Simular rechazo (sandbox)');
  });

  it('asks for confirmation and then calls the mutation with APPROVED', () => {
    availability = { mesta: true, kirafin: false };
    page = mountPage(<ProviderSandboxActions beneficiary={beneficiary} />);

    clickButton('Simular aprobación (sandbox)');
    expect(simulateMutate).not.toHaveBeenCalled();

    clickButton('Confirmar');
    expect(simulateMutate).toHaveBeenCalledWith({
      beneficiaryId: 'ben-1',
      outcome: 'APPROVED',
    });
  });

  it('calls the mutation with REJECTED for the rejection button', () => {
    availability = { mesta: true, kirafin: false };
    page = mountPage(<ProviderSandboxActions beneficiary={beneficiary} />);

    clickButton('Simular rechazo (sandbox)');
    clickButton('Confirmar');

    expect(simulateMutate).toHaveBeenCalledWith({
      beneficiaryId: 'ben-1',
      outcome: 'REJECTED',
    });
  });
});
