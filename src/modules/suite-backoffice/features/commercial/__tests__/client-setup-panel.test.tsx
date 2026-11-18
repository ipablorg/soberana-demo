/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import { ClientSetupPanel } from '../components/client-setup-panel';

const CLIENT_ID = '3f2b8a52-6c1d-4c2e-9a41-0d6f7c3b9e10';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));

const ok = <T,>(data: T) => ({ data, isLoading: false, error: null, refetch: vi.fn() });

let client: Record<string, unknown> | null = null;
let onboarding: unknown[] = [];
let rails: unknown[] = [];
let schedules: unknown[] = [];
let readiness: unknown[] = [];
let firstCustomers: unknown[] = [];
let firstVas: unknown[] = [];
let onboardingLoading = false;

vi.mock('../../clients/hooks/use-clients', () => ({
  useClientApiKeyInfo: () => ok({ adminLoopay_getClient: client }),
}));
vi.mock('../hooks/use-commercial', () => ({
  useClientProviderOnboarding: () =>
    onboardingLoading
      ? { data: undefined, isLoading: true, error: null }
      : ok({ adminLoopay_clientProviderOnboarding: onboarding }),
  useCommercialClientRails: () => ok({ adminLoopay_listClientProviderRails: rails }),
  useFeeSchedules: () => ok({ adminLoopay_listFeeSchedules: schedules }),
}));
vi.mock('../hooks/use-client-setup', () => ({
  useClientSetupReadiness: () => ok({ adminLoopay_platformReadiness: readiness }),
  useFirstApprovedCustomer: () => ok({ adminLoopay_listCustomers: firstCustomers }),
  useFirstOpenVirtualAccount: () => ok({ adminLoopay_listVirtualAccounts: { data: firstVas } }),
}));

let page: MountedPage | null = null;
const onGoTo = vi.fn();

const stepStatus = (id: string) =>
  page?.container.querySelector(`[data-testid="setup-step-${id}"]`)?.getAttribute('data-status');

beforeEach(() => {
  vi.clearAllMocks();
  onboardingLoading = false;
  client = {
    id: CLIENT_ID,
    name: 'Acme SAS',
    tax_id: '900123',
    country: 'COL',
    status: 'ACTIVE',
    // createClient always stores a prefix; only "Generar" sets api_key_rotated_at.
    api_key_prefix: 'lp_live_0000',
    api_key_rotated_at: null,
  };
  onboarding = [];
  rails = [];
  schedules = [];
  readiness = [];
  firstCustomers = [];
  firstVas = [];
});
afterEach(() => {
  page?.unmount();
  page = null;
});

describe('ClientSetupPanel (#411)', () => {
  it('shows a skeleton while loading', () => {
    onboardingLoading = true;
    page = mountPage(<ClientSetupPanel clientId={CLIENT_ID} onGoTo={onGoTo} />);

    expect(page.container.querySelector('[data-testid="setup-skeleton"]')).not.toBeNull();
  });

  it('marks a fresh client: created, everything else missing, links each step to its tab', () => {
    page = mountPage(<ClientSetupPanel clientId={CLIENT_ID} onGoTo={onGoTo} />);

    expect(stepStatus('client')).toBe('done');
    expect(stepStatus('providers')).toBe('missing');
    expect(stepStatus('rails')).toBe('missing');
    expect(stepStatus('fees')).toBe('missing');
    expect(stepStatus('api-key')).toBe('missing');
    expect(stepStatus('first-customer')).toBe('pending');
    expect(page.text()).toContain('1 de 5 pasos listos');

    page.click(page.findByText('button', 'Ir a onboarding'));
    page.click(page.findByText('button', 'Ir a rieles'));
    page.click(page.findByText('button', 'Ir a tarifas'));
    page.click(page.findByText('button', 'Ir a API key'));
    expect(onGoTo.mock.calls.map(([tab]) => tab)).toEqual([
      'onboarding',
      'operation',
      'fees',
      'api-key',
    ]);
  });

  it('marks a configured client done and names the provider its rails still miss', () => {
    client = {
      ...client,
      api_key_prefix: 'lp_live_ab12',
      api_key_rotated_at: '2026-10-01T12:00:00Z',
    };
    onboarding = [{ providerCode: 'mesta', status: 'LINKED' }];
    rails = [{ id: 'cr1', is_active: true }];
    schedules = [
      { operation: 'DEPOSIT', active: true },
      { operation: 'WITHDRAWAL', active: true },
    ];
    readiness = [
      {
        client_id: CLIENT_ID,
        missing_pairings: ['kirafin'],
        dead_provider_junctions_active: 0,
        issue_keys: [{ key: 'readiness.provider_not_onboarded', params: { provider: 'kirafin' } }],
      },
    ];
    firstCustomers = [{ id: 'cust-1' }];
    firstVas = [{ id: 'va-1' }];

    page = mountPage(<ClientSetupPanel clientId={CLIENT_ID} onGoTo={onGoTo} />);

    expect(stepStatus('providers')).toBe('missing');
    expect(page.text()).toContain('Falta registrarlo en: kirafin.');
    expect(stepStatus('rails')).toBe('done');
    expect(stepStatus('fees')).toBe('done');
    expect(stepStatus('api-key')).toBe('done');
    expect(stepStatus('first-customer')).toBe('done');
    expect(page.text()).toContain('4 de 5 pasos listos');
  });
});
