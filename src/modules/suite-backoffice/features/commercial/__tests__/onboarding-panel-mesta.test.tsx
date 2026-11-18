/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ClientProviderOnboarding } from '@/graphql/queries/admin-commercial';
import { mountPage, type MountedPage } from '@/test/dom-render';

import { OnboardingPanel } from '../components/onboarding-panel';

const CLIENT_ID = '3f2b8a52-6c1d-4c2e-9a41-0d6f7c3b9e10';
const retryMutate = vi.fn();
let rows: ClientProviderOnboarding[] = [];

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));

vi.mock('../hooks/use-commercial', () => ({
  useClientProviderOnboarding: () => ({
    data: { adminLoopay_clientProviderOnboarding: rows },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useOnboardClientToProviders: () => ({ mutate: vi.fn(), isPending: false }),
  useRetryProviderOnboarding: () => ({ mutate: retryMutate, isPending: false }),
  useLinkProviderManually: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../lib/mesta-profile-hooks', () => ({
  useClientOnboardingMetadata: () => ({
    data: {
      adminLoopay_getClient: {
        id: CLIENT_ID,
        metadata: { onboardingProfile: { addressCity: 'Bogotá', phone: '+573001234567' } },
      },
    },
    isLoading: false,
  }),
}));

const MISSING = [
  'addressStreet',
  'addressPostalCode',
  'registrationDate',
  'businessType',
  'isFinancialInstitution',
  'numberOfEmployees',
  'expectedMonthlyVolumeEstimate',
  'averageTransactionSize',
  'primaryCounterpartyJurisdictions',
  'natureOfPayments',
  'sourceOfFunds',
  'websiteAbsenceReason',
];

const row = (
  code: string,
  status: ClientProviderOnboarding['status'],
  extra: Partial<ClientProviderOnboarding> = {}
): ClientProviderOnboarding => ({
  id: code,
  clientId: CLIENT_ID,
  providerCode: code,
  status,
  providerCustomerId: null,
  lastErrorCode: null,
  linkedAt: null,
  linkedByUserId: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  attempts: [],
  ...extra,
});

const failedMesta = row('mesta', 'FAILED', {
  lastErrorCode: 'VALIDATION_MISSING_FIELDS',
  attempts: [
    {
      id: 'a1',
      attemptNo: 1,
      actorUserId: null,
      requestSummary: null,
      responseSummary: null,
      errorCode: 'VALIDATION_MISSING_FIELDS',
      missingFields: MISSING,
      createdAt: '2026-01-01T00:00:00Z',
    },
  ],
});

let page: MountedPage | null = null;

beforeEach(() => {
  retryMutate.mockReset();
  rows = [failedMesta];
});
afterEach(() => {
  page?.unmount();
  page = null;
  document.body.innerHTML = '';
});

describe('OnboardingPanel Mesta profile', () => {
  it('explains in plain words which company data Mesta is missing', () => {
    page = mountPage(<OnboardingPanel clientId={CLIENT_ID} />);

    const text = page.text();
    expect(text).toContain('Mesta necesita estos datos de la empresa:');
    expect(text).toContain('Calle');
    expect(text).toContain('Origen de los fondos');
    expect(text).toContain('Motivo por el que no tiene sitio web');
  });

  it('offers "Completar perfil y reintentar" on a Mesta attempt that failed for missing fields', () => {
    page = mountPage(<OnboardingPanel clientId={CLIENT_ID} />);

    expect(page.text()).toContain('Completar perfil y reintentar');
  });

  it('does not offer it for a failure that is not missing data, nor for other providers', () => {
    rows = [
      row('mesta', 'FAILED', { lastErrorCode: 'PROVIDER_HTTP_503' }),
      row('kirafin', 'FAILED', { lastErrorCode: 'VALIDATION_MISSING_FIELDS' }),
    ];
    page = mountPage(<OnboardingPanel clientId={CLIENT_ID} />);

    expect(page.text()).not.toContain('Completar perfil y reintentar');
  });

  it('lets staff start a provider that was skipped at creation (no row yet)', () => {
    rows = [row('kirafin', 'LINKED', { providerCustomerId: 'k-1' })];
    page = mountPage(<OnboardingPanel clientId={CLIENT_ID} />);

    const start = page.findByText<HTMLButtonElement>('button', 'Iniciar onboarding de pendientes');
    expect(start.disabled).toBe(false);
  });

  it('disables the bulk start once every provider is linked', () => {
    rows = [row('kirafin', 'LINKED'), row('mesta', 'MANUAL')];
    page = mountPage(<OnboardingPanel clientId={CLIENT_ID} />);

    const start = page.findByText<HTMLButtonElement>('button', 'Iniciar onboarding de pendientes');
    expect(start.disabled).toBe(true);
  });

  it('opens the profile form pre-filled with what is stored and keeps the retry disabled until complete', () => {
    page = mountPage(<OnboardingPanel clientId={CLIENT_ID} />);

    page.click(page.findByText('button', 'Completar perfil y reintentar'));

    const dialog = document.body.textContent ?? '';
    expect(dialog).toContain('Perfil de empresa para Mesta');
    expect(retryMutate).not.toHaveBeenCalled();
    const city = document.body.querySelector<HTMLInputElement>('#mesta-retry-addressCity');
    // Stored values are not asked again: city and phone are not in the missing set.
    expect(city).toBeNull();
    const submit = Array.from(document.body.querySelectorAll('button')).find((b) =>
      (b.textContent ?? '').includes('Guardar y reintentar')
    );
    expect(submit?.disabled).toBe(true);
  });
});
