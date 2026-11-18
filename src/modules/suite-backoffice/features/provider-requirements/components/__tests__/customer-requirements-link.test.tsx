/* @vitest-environment jsdom */

import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import { CustomerRequirementsLink } from '../customer-requirements-link';

let staffRoles: string[] = [];
const queueMock = vi.fn();

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('@/shared/stores/auth-store', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: { staff_roles: staffRoles } }),
}));

vi.mock('../../hooks/use-provider-requirements', () => ({
  useProviderRequirementsQueue: (variables: unknown, options: unknown) =>
    queueMock(variables, options),
}));

let page: MountedPage;

function render() {
  page = mountPage(
    <MemoryRouter>
      <CustomerRequirementsLink customerId="c-1" />
    </MemoryRouter>
  );
}

beforeEach(() => {
  queueMock.mockReset();
  queueMock.mockReturnValue({
    data: { adminLoopay_listProviderRequirements: { items: [], total: 2 } },
  });
});

afterEach(() => {
  page?.unmount();
  staffRoles = [];
});

describe('CustomerRequirementsLink (S21, Customer 360)', () => {
  it('links Comercial to the queue filtered by the customer, with the open count', () => {
    staffRoles = ['OPS_COMMERCIAL'];

    render();

    expect(page.text()).toBe('Requerimientos: 2 pendientes');
    expect(page.container.querySelector('a')?.getAttribute('href')).toBe(
      '/backoffice/provider-requirements?customerId=c-1'
    );
    expect(queueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { customerId: 'c-1', status: ['REQUESTED', 'UPLOADED', 'REJECTED', 'APPROVED'] },
      }),
      { enabled: true }
    );
  });

  it('#411: links Operaciones too, who now reviews the requirements', () => {
    staffRoles = ['LOOPAY_OPERATIONS'];

    render();

    expect(page.text()).toBe('Requerimientos: 2 pendientes');
  });

  it('shows nothing and asks nothing for roles without the queue', () => {
    staffRoles = ['OPS_VA'];

    render();

    expect(page.text()).toBe('');
    expect(queueMock).toHaveBeenCalledWith(expect.anything(), { enabled: false });
  });
});
