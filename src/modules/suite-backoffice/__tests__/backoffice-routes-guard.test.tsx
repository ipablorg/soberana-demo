/* @vitest-environment jsdom */

import { act } from 'react';
import { MemoryRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { SuiteBackofficeRoutes } from '@/modules/suite-backoffice/backoffice-routes';

let staffRoles: string[] = [];

vi.mock('@/shared/stores/auth-store', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: { staff_roles: staffRoles } }),
}));

vi.mock('@/app/routes/protected-route', () => ({
  StaffRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/modules/suite-backoffice/layouts/backoffice-layout', () => ({
  BackofficeLayout: () => <Outlet />,
}));

vi.mock('@/modules/suite-backoffice/features/move/pages/dispersiones-queue', () => ({
  default: () => <div>dispersiones-page</div>,
}));
vi.mock('@/modules/suite-backoffice/features/move/pages/recaudos-queue', () => ({
  default: () => <div>recaudos-page</div>,
}));
vi.mock('@/modules/suite-backoffice/features/compliance-review/pages/review', () => ({
  default: () => <div>compliance-page</div>,
}));
vi.mock('@/modules/suite-backoffice/features/customers/pages/customer-360', () => ({
  default: () => <div>customers-page</div>,
}));
vi.mock(
  '@/modules/suite-backoffice/features/provider-requirements/pages/provider-requirements-queue',
  () => ({
    default: () => <div>provider-requirements-page</div>,
  })
);
vi.mock('@/modules/common/errors/pages/not-found', () => ({
  default: () => <div>not-found-page</div>,
}));

const PAGES =
  /dispersiones-page|recaudos-page|compliance-page|customers-page|provider-requirements-page|not-found-page/;

let page: MountedPage;

function LocationProbe() {
  return <span data-testid="loc">{useLocation().pathname}</span>;
}

async function visit(path: string): Promise<MountedPage> {
  const mounted = mountPage(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <LocationProbe />
      <Routes>
        <Route path="/backoffice/*" element={<SuiteBackofficeRoutes />} />
      </Routes>
    </MemoryRouter>
  );

  for (let attempt = 0; attempt < 10; attempt += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    if (PAGES.test(mounted.text())) break;
  }

  return mounted;
}

afterEach(() => {
  page?.unmount();
  staffRoles = [];
});

describe('backoffice route role guard', () => {
  it('denies OPS_KYC on /move/dispersiones with the not-found page', async () => {
    staffRoles = ['OPS_KYC'];
    page = await visit('/backoffice/move/dispersiones');

    expect(page.text()).toContain('not-found-page');
    expect(page.text()).not.toContain('dispersiones-page');
  });

  it('denies OPS_VA on /compliance-review', async () => {
    staffRoles = ['OPS_VA'];
    page = await visit('/backoffice/compliance-review');

    expect(page.text()).toContain('not-found-page');
    expect(page.text()).not.toContain('compliance-page');
  });

  it.each([[['OPS_COMMERCIAL']], [['LOOPAY_ADMIN']]])(
    'opens the provider requirements queue for %j (S21)',
    async (roles) => {
      staffRoles = roles;
      page = await visit('/backoffice/provider-requirements');

      expect(page.text()).toContain('provider-requirements-page');
    }
  );

  it('denies OPS_KYC on /provider-requirements', async () => {
    staffRoles = ['OPS_KYC'];
    page = await visit('/backoffice/provider-requirements');

    expect(page.text()).toContain('not-found-page');
  });

  it('keeps allowing OPS_DISPERSIONES on /move/dispersiones', async () => {
    staffRoles = ['OPS_DISPERSIONES'];
    page = await visit('/backoffice/move/dispersiones');

    expect(page.text()).toContain('dispersiones-page');
  });
});

describe('/backoffice index landing', () => {
  it.each([
    [['OPS_VA'], '/backoffice/customers', 'customers-page'],
    [['OPS_KYC'], '/backoffice/compliance-review', 'compliance-page'],
    [['LOOPAY_ADMIN'], '/backoffice/compliance-review', 'compliance-page'],
    [['OPS_RECAUDOS'], '/backoffice/move/recaudos', 'recaudos-page'],
  ])('sends %j to %s', async (roles, expectedPath, marker) => {
    staffRoles = roles;
    page = await visit('/backoffice');

    expect(page.container.querySelector('[data-testid="loc"]')?.textContent).toBe(expectedPath);
    expect(page.text()).toContain(marker);
  });
});
