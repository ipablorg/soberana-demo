/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import { StartProviderVerificationButton } from '../start-provider-verification-button';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

const startMutate = vi.fn();

vi.mock('../../hooks/use-provider-sandbox', () => ({
  useStartProviderBeneficiaryVerification: () => ({
    mutate: startMutate,
    isPending: false,
  }),
}));

let page: MountedPage;

const beneficiary = {
  id: 'ben-1',
  providerCode: 'mesta',
  reviewStatus: 'IN_REVIEW',
  providerMetadata: { providerStatus: 'unverified/none' },
};

const LABEL = 'Iniciar verificación en el proveedor';

function text(): string {
  return (document.body.textContent ?? '').replace(/\s+/g, ' ');
}

afterEach(() => {
  page?.unmount();
  startMutate.mockReset();
});

describe('StartProviderVerificationButton', () => {
  it('starts the verification of the beneficiary on click', () => {
    page = mountPage(<StartProviderVerificationButton beneficiary={beneficiary} />);

    const button = document.querySelector('button');
    expect(text()).toContain(LABEL);
    page.flush(() => button?.click());

    expect(startMutate).toHaveBeenCalledWith({ beneficiaryId: 'ben-1' });
  });

  it('is shown again when a previous start failed', () => {
    page = mountPage(
      <StartProviderVerificationButton
        beneficiary={{
          ...beneficiary,
          providerMetadata: { verification: { started: false, error: 'x' } },
        }}
      />
    );

    expect(text()).toContain(LABEL);
  });

  it.each([
    ['already started', { providerMetadata: { verification: { started: true } } }],
    ['already decided', { reviewStatus: 'APPROVED' }],
    ['not a Mesta beneficiary', { providerCode: 'kirafin' }],
    ['not provider managed', { providerCode: null }],
  ])('renders nothing when %s', (_name, override) => {
    page = mountPage(
      <StartProviderVerificationButton beneficiary={{ ...beneficiary, ...override }} />
    );

    expect(text()).not.toContain(LABEL);
  });
});
