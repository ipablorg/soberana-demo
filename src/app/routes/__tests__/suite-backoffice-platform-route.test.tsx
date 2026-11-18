/* @vitest-environment jsdom */

import { act } from 'react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { SuiteBackofficeRoutes } from '@/modules/suite-backoffice/backoffice-routes';

let staffRoles: string[] = [];

vi.mock('@/shared/stores/auth-store', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: { staff_roles: staffRoles } }),
}));

vi.mock('../protected-route', () => ({
  StaffRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/modules/suite-backoffice/layouts/backoffice-layout', () => ({
  BackofficeLayout: () => <Outlet />,
}));

vi.mock(
  '@/modules/suite-backoffice/features/platform-config/pages/platform-config',
  () => ({ default: () => <div>platform-config-page</div> }),
);

vi.mock('@/modules/common/errors/pages/not-found', () => ({
  default: () => <div>not-found-page</div>,
}));

let page: MountedPage;

async function visit(path: string): Promise<MountedPage> {
  const mounted = mountPage(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/backoffice/*" element={<SuiteBackofficeRoutes />} />
      </Routes>
    </MemoryRouter>,
  );

  // Lazy route elements resolve on a later tick.
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    if (/platform-config-page|not-found-page/.test(mounted.text())) break;
  }

  return mounted;
}

afterEach(() => {
  page?.unmount();
  staffRoles = [];
});

describe('/backoffice/platform route', () => {
  it.each([[['OPS_KYC']], [['LOOPAY_OPERATIONS']], [[]]])(
    'does not exist for staff roles %j',
    async (roles) => {
      // Arrange
      staffRoles = roles;

      // Act
      page = await visit('/backoffice/platform');

      // Assert
      expect(page.text()).toContain('not-found-page');
      expect(page.text()).not.toContain('platform-config-page');
    },
  );

  it.each([[['PLATFORM_ADMIN']], [['LOOPAY_ADMIN']]])(
    'renders the platform config page for staff roles %j',
    async (roles) => {
      // Arrange
      staffRoles = roles;

      // Act
      page = await visit('/backoffice/platform');

      // Assert
      expect(page.text()).toContain('platform-config-page');
      expect(page.text()).not.toContain('not-found-page');
    },
  );
});
