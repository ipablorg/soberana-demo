/* @vitest-environment jsdom */

import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import { ProviderRequirementsBanner } from '../provider-requirements-banner';

let staffRoles: string[] = [];
const countsMock = vi.fn();

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('@/shared/stores/auth-store', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: { staff_roles: staffRoles } }),
}));

vi.mock('../../hooks/use-provider-requirements', () => ({
  useProviderRequirementCounts: (enabled: boolean) => countsMock(enabled),
}));

function counts(pendingReview: number, readyToSubmit: number) {
  return {
    data: {
      adminLoopay_providerRequirementCounts: { awaitingCustomer: 9, pendingReview, readyToSubmit },
    },
  };
}

let page: MountedPage;

function render() {
  page = mountPage(
    <MemoryRouter>
      <ProviderRequirementsBanner />
    </MemoryRouter>
  );
  return page;
}

beforeEach(() => {
  countsMock.mockReset();
  countsMock.mockReturnValue(counts(2, 1));
});

afterEach(() => {
  page?.unmount();
  staffRoles = [];
});

describe('ProviderRequirementsBanner (S21: both must notice)', () => {
  it.each([[['OPS_COMMERCIAL']], [['LOOPAY_ADMIN']], [['LOOPAY_OPERATIONS']]])(
    'tells %j how many requirements wait, with a link to the queue',
    (roles) => {
      staffRoles = roles;

      render();

      expect(page.text()).toContain('Hay 3 requerimientos de proveedores por revisar o enviar');
      expect(page.container.querySelector('a')?.getAttribute('href')).toBe(
        '/backoffice/provider-requirements'
      );
    }
  );

  it('uses the singular for one requirement', () => {
    staffRoles = ['OPS_COMMERCIAL'];
    countsMock.mockReturnValue(counts(1, 0));

    render();

    expect(page.text()).toContain('Hay 1 requerimiento de proveedor por revisar o enviar');
  });

  it('stays hidden when nothing waits for Comercial', () => {
    staffRoles = ['OPS_COMMERCIAL'];
    countsMock.mockReturnValue(counts(0, 0));

    render();

    expect(page.text()).toBe('');
  });

  it('stays hidden and asks nothing for roles without the queue', () => {
    staffRoles = ['OPS_KYC'];

    render();

    expect(page.text()).toBe('');
    expect(countsMock).not.toHaveBeenCalledWith(true);
  });
});
