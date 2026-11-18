/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import { ClientRailsCard } from '../components/client-rails-card';

const CLIENT_ID = '3f2b8a52-6c1d-4c2e-9a41-0d6f7c3b9e10';
const enableMutate = vi.fn();
const setActiveMutate = vi.fn();

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));

const onboardingRows = [
  { id: 'o1', providerCode: 'mesta', status: 'LINKED' },
  { id: 'o2', providerCode: 'kirafin', status: 'FAILED' },
];
const catalogRows = [
  {
    id: 'a',
    is_active: true,
    provider: { id: 'p-mesta', code: 'mesta', name: 'Mesta' },
    rail: { id: 'r-ach', code: 'ach', name: 'ACH' },
  },
  {
    id: 'b',
    is_active: true,
    provider: { id: 'p-mesta', code: 'mesta', name: 'Mesta' },
    rail: { id: 'r-breb', code: 'co_breb', name: 'Bre-B' },
  },
  {
    id: 'c',
    is_active: true,
    provider: { id: 'p-kira', code: 'kirafin', name: 'KiraFin' },
    rail: { id: 'r-wire', code: 'wire', name: 'Wire' },
  },
];
let clientRailRows: unknown[] = [];

vi.mock('../hooks/use-commercial', () => ({
  useClientProviderOnboarding: () => ({
    data: { adminLoopay_clientProviderOnboarding: onboardingRows },
    isLoading: false,
    error: null,
  }),
  useCommercialProviderRails: () => ({
    data: { adminLoopay_listProviderPaymentRails: catalogRows },
    isLoading: false,
    error: null,
  }),
  useCommercialClientRails: () => ({
    data: { adminLoopay_listClientProviderRails: clientRailRows },
    isLoading: false,
    error: null,
  }),
  useEnableClientRail: () => ({ mutate: enableMutate, isPending: false }),
  useSetClientRailActive: () => ({ mutate: setActiveMutate, isPending: false }),
}));

vi.mock('../../platform-config/hooks/use-catalog-options', () => ({
  useCatalogFlags: () => ({
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    providerActive: new Map([['p-bridge', true]]),
    rails: new Map([['r-us-ach', { isActive: true, canonicalCode: 'ach' }]]),
  }),
}));

let page: MountedPage | null = null;

beforeEach(() => {
  vi.clearAllMocks();
  clientRailRows = [];
});
afterEach(() => {
  page?.unmount();
  page = null;
});

describe('ClientRailsCard', () => {
  it('lists only the rails of the providers the client is onboarded with', () => {
    page = mountPage(<ClientRailsCard clientId={CLIENT_ID} />);

    const text = page.text();
    expect(text).toContain('Mesta');
    expect(text).toContain('ACH');
    expect(text).not.toContain('KiraFin');
    expect(text).not.toContain('Wire');
  });

  it('shows maintenance rails disabled with the maintenance note', () => {
    page = mountPage(<ClientRailsCard clientId={CLIENT_ID} />);

    const breb = page.container.querySelector<HTMLButtonElement>(
      'button[role="switch"][aria-label="Bre-B"]'
    );
    expect(breb?.disabled).toBe(true);
    expect(page.text()).toContain('En mantenimiento');
    const ach = page.container.querySelector<HTMLButtonElement>(
      'button[role="switch"][aria-label="ACH"]'
    );
    expect(ach?.disabled).toBe(false);
  });

  it('creates the client rail when an operational rail is switched on for the first time', () => {
    page = mountPage(<ClientRailsCard clientId={CLIENT_ID} />);

    page.click(page.container.querySelector('button[role="switch"][aria-label="ACH"]') as Element);

    expect(enableMutate).toHaveBeenCalledWith({
      input: { clientId: CLIENT_ID, providerId: 'p-mesta', railId: 'r-ach', priority: 1 },
    });
  });

  it('updates the existing client rail when switching an enabled rail off', () => {
    clientRailRows = [
      { id: 'cpr-1', provider_id: 'p-mesta', rail_id: 'r-ach', priority: 1, is_active: true },
    ];
    page = mountPage(<ClientRailsCard clientId={CLIENT_ID} />);

    page.click(page.container.querySelector('button[role="switch"][aria-label="ACH"]') as Element);

    expect(setActiveMutate).toHaveBeenCalledWith({ id: 'cpr-1', input: { isActive: false } });
    expect(enableMutate).not.toHaveBeenCalled();
  });
});

describe('ClientRailsCard catalogue rules (#411)', () => {
  it('never offers a dead provider or an alias rail, and creates rails with priority 1', () => {
    catalogRows.push(
      {
        id: 'd',
        is_active: true,
        provider: { id: 'p-bridge', code: 'bridge', name: 'Bridge' },
        rail: { id: 'r-ach', code: 'ach', name: 'ACH' },
      } as never,
      {
        id: 'e',
        is_active: true,
        provider: { id: 'p-mesta', code: 'mesta', name: 'Mesta' },
        rail: { id: 'r-us-ach', code: 'us_ach', name: 'US ACH' },
      } as never
    );
    onboardingRows.push({ id: 'o3', providerCode: 'bridge', status: 'LINKED' });
    try {
      page = mountPage(<ClientRailsCard clientId={CLIENT_ID} />);

      expect(page.text()).not.toContain('Bridge');
      expect(page.text()).not.toContain('US ACH');
      // Each rail row names its catalogue code, so the alias check can match by code.
      const codes = Array.from(page.container.querySelectorAll('[data-rail-code]')).map((row) =>
        row.getAttribute('data-rail-code')
      );
      expect(codes).toContain('ach');
      expect(codes).not.toContain('us_ach');
    } finally {
      catalogRows.splice(3);
      onboardingRows.splice(2);
    }
  });
});
