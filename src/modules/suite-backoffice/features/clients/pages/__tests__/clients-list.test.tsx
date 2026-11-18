/* @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import ClientsList from '../clients-list';

let roles: string[] = [];
const useClientsMock = vi.fn();

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));
vi.mock('@/shared/stores/auth-store', () => ({
  useAuthStore: (selector: (s: unknown) => unknown) => selector({ user: { staff_roles: roles } }),
}));
vi.mock('../../hooks/use-clients', () => ({
  useClients: (...args: unknown[]) => {
    useClientsMock(...args);
    return { data: { adminLoopay_listClients: { data: [] } }, isLoading: false };
  },
  useTaxIdTypes: () => ({
    data: { adminLoopay_listTaxIdTypes: [{ id: 'u1', name: 'NIT', countries: ['COL'] }] },
  }),
  useCreateClient: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateClient: () => ({ mutate: vi.fn(), isPending: false }),
  useRegenerateClientApiKey: () => ({ mutate: vi.fn(), isPending: false }),
  useRevokeClientApiKey: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));
vi.mock('../../../../lib/country-options', () => ({ useCountryIso3Options: () => [] }));
vi.mock('@/shared/components/common/DataTable', () => ({
  DataTable: ({ emptyMessage, toolbar }: { emptyMessage: string; toolbar?: React.ReactNode }) => (
    <div>
      {toolbar}
      {emptyMessage}
    </div>
  ),
}));

describe('ClientsList role gating', () => {
  let page: MountedPage;

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('#411: lets OPS_COMMERCIAL read the list (query runs) without "Crear cliente"', () => {
    roles = ['OPS_COMMERCIAL'];
    page = mountPage(<ClientsList />);

    expect(page.text()).not.toContain('Crear cliente');
    expect(
      page.container.querySelector('[data-testid="clients-restricted-notice"]')
    ).not.toBeNull();
    expect(useClientsMock.mock.calls[0]?.[1]).toBe(true);
    expect(page.text()).toContain('No hay clientes para estos filtros');
    page.unmount();
  });

  it('offers "Crear cliente" to LOOPAY_ADMIN and runs the query', () => {
    roles = ['LOOPAY_ADMIN'];
    page = mountPage(<ClientsList />);

    expect(page.text()).toContain('Crear cliente');
    expect(useClientsMock.mock.calls[0]?.[1]).toBe(true);
    page.unmount();
  });

  it('offers "Crear cliente" to PLATFORM_ADMIN and runs the query', () => {
    roles = ['PLATFORM_ADMIN'];
    page = mountPage(<ClientsList />);

    expect(page.text()).toContain('Crear cliente');
    expect(page.container.querySelector('[data-testid="clients-restricted-notice"]')).toBeNull();
    expect(useClientsMock.mock.calls[0]?.[1]).toBe(true);
    page.unmount();
  });
});

describe('ClientsList status filter', () => {
  it('labels the status filters in Spanish', () => {
    roles = ['PLATFORM_ADMIN'];
    const page = mountPage(<ClientsList />);

    const labels = Array.from(page.container.querySelectorAll('button')).map((button) =>
      button.textContent?.trim()
    );
    expect(labels).toEqual(expect.arrayContaining(['Activo', 'Suspendido', 'Revocado']));
    expect(labels).not.toContain('ACTIVE');
    expect(labels).not.toContain('SUSPENDED');
    expect(labels).not.toContain('REVOKED');
    page.unmount();
  });
});
