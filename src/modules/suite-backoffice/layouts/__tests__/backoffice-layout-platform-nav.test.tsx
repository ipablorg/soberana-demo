/* @vitest-environment jsdom */

import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import type { SectionGroup } from '@/shared/types/navigation';
import { BackofficeLayout } from '../backoffice-layout';

let staffRoles: string[] = [];

vi.mock('@/shared/stores/auth-store', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: { staff_roles: staffRoles } }),
}));

vi.mock('@/shared/stores/useModeStore', () => ({
  useModeStore: () => ({
    currentBackofficeMode: 'companies',
    setBackofficeMode: vi.fn(),
  }),
}));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
// The sidebar badge counts (S21) need a query client; these tests are about navigation only.
vi.mock(
  '@/modules/suite-backoffice/features/provider-requirements/hooks/use-provider-requirements',
  () => ({ useProviderRequirementCounts: () => ({ data: undefined }) }),
);
vi.mock('@/shared/components/DynamicIsland', () => ({ DynamicIsland: () => null }));

vi.mock('@/shared/hooks/use-mobile', () => ({ useMobile: () => true }));

vi.mock('@/shared/components/common/GenericSidebar', () => ({
  GenericSidebar: ({
    currentMode,
    getSections,
  }: {
    currentMode: string;
    getSections: (mode: string) => SectionGroup[];
  }) => (
    <nav>
      {getSections(currentMode).flatMap((group) =>
        group.items.map((item) => <a key={item.url} href={item.url}>{item.title}</a>),
      )}
    </nav>
  ),
}));

vi.mock('@/shared/components/common/ModeSidebar', () => ({
  ModeSidebar: () => null,
}));

vi.mock('@/shared/components/common/AppTopbar', () => ({
  AppTopbar: () => null,
}));

vi.mock('@/modules/suite-backoffice/components/CountrySelector', () => ({
  CountrySelector: () => null,
}));

vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSidebar: () => ({ toggleSidebar: vi.fn() }),
}));

let page: MountedPage;

function renderLayout(): MountedPage {
  return mountPage(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <BackofficeLayout />
    </MemoryRouter>,
  );
}

function navHrefs(mounted: MountedPage): (string | null)[] {
  return Array.from(mounted.container.querySelectorAll('nav a')).map((link) =>
    link.getAttribute('href'),
  );
}

afterEach(() => {
  page?.unmount();
  staffRoles = [];
});

describe('BackofficeLayout platform nav entry', () => {
  it.each([[['OPS_KYC']], [['LOOPAY_OPERATIONS']]])(
    'does not render the platform entry for staff roles %j',
    (roles) => {
      // Arrange
      staffRoles = roles;

      // Act
      page = renderLayout();

      // Assert
      expect(navHrefs(page)).not.toContain('/backoffice/platform');
    },
  );

  it.each([[['PLATFORM_ADMIN']], [['LOOPAY_ADMIN']]])(
    'renders the platform entry for staff roles %j',
    (roles) => {
      // Arrange
      staffRoles = roles;

      // Act
      page = renderLayout();

      // Assert
      expect(navHrefs(page)).toContain('/backoffice/platform');
    },
  );
});
