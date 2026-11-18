/* @vitest-environment jsdom */

import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { mountPage } from '@/test/dom-render';
import { buildSetupChecklist, type SetupInput } from '../../lib/client-setup';
import { SetupChecklist } from '../setup-checklist';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));

const READY: SetupInput = {
  client: { name: 'Acme SAS', taxId: '900123', country: 'COL' },
  onboarding: [{ providerCode: 'kirafin', status: 'LINKED' }],
  readiness: { missingPairings: [], issueKeys: [], deadProviderJunctionsActive: 0 },
  activeRailCount: 1,
  activeFeeOperations: ['DEPOSIT', 'WITHDRAWAL'],
  apiKeyPrefix: 'lp_live_ab12',
  apiKeyRotatedAt: '2026-10-01T12:00:00Z',
  clientStatus: 'ACTIVE',
  firstCustomerApproved: false,
  firstVirtualAccountOpen: false,
};

function render(input: SetupInput, extra: Partial<Parameters<typeof SetupChecklist>[0]> = {}) {
  return mountPage(
    <MemoryRouter>
      <SetupChecklist steps={buildSetupChecklist(input)} onGoTo={vi.fn()} {...extra} />
    </MemoryRouter>
  );
}

const step = (container: HTMLElement, id: string) =>
  container.querySelector(`[data-testid="setup-step-${id}"]`) as HTMLElement;

describe('SetupChecklist (#411 Setup screen)', () => {
  it('says why providers and rails are missing when the client is not active', () => {
    const page = render({ ...READY, readiness: null });

    for (const id of ['providers', 'rails']) {
      expect(step(page.container, id).dataset.status).toBe('missing');
      expect(step(page.container, id).textContent).toContain('Cliente no activo');
    }
    page.unmount();
  });

  it('says the rails still point to a retired provider', () => {
    const page = render({
      ...READY,
      readiness: { missingPairings: [], issueKeys: [], deadProviderJunctionsActive: 1 },
    });

    expect(step(page.container, 'rails').dataset.status).toBe('missing');
    expect(step(page.container, 'rails').textContent).toContain('proveedores retirados');
    page.unmount();
  });

  it('lists the readiness issues no step reports under the checklist', () => {
    const page = render(READY, {
      issues: [{ key: 'readiness.no_wallet_provider', params: {} }],
    });

    const issues = page.container.querySelector('[data-testid="setup-readiness-issues"]');
    expect(issues?.textContent).toContain('No hay proveedor de billetera');
    page.unmount();
  });

  it('renders no issue list when there is nothing left to report', () => {
    const page = render(READY, { issues: [] });

    expect(page.container.querySelector('[data-testid="setup-readiness-issues"]')).toBeNull();
    page.unmount();
  });

  it('links a missing client step to where the tax id and country are edited', () => {
    const missingClient = { ...READY, client: { name: 'Acme', taxId: '', country: 'COL' } };
    const page = render(missingClient, { clientEditHref: '/backoffice/clients' });

    const link = step(page.container, 'client').querySelector('a');
    expect(link?.getAttribute('href')).toBe('/backoffice/clients');
    expect(link?.textContent).toBe('Editar en Clientes');
    page.unmount();

    const readOnly = render(missingClient, { clientEditHref: null });
    expect(step(readOnly.container, 'client').querySelector('a')).toBeNull();
    readOnly.unmount();
  });
});
