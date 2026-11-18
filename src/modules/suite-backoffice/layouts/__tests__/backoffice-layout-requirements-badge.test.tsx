/* @vitest-environment jsdom */

import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import type { SectionGroup } from '@/shared/types/navigation';
import { BackofficeLayout } from '../backoffice-layout';

let staffRoles: string[] = [];
const countsMock = vi.fn();

vi.mock(
  '@/modules/suite-backoffice/features/provider-requirements/hooks/use-provider-requirements',
  () => ({
    useProviderRequirementCounts: (enabled: boolean) => countsMock(enabled),
  })
);

vi.mock('@/shared/stores/auth-store', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: { staff_roles: staffRoles } }),
}));

vi.mock('@/shared/stores/useModeStore', () => ({
  useModeStore: () => ({
    // #411: the queue lives in the manual review (compliance) mode.
    currentBackofficeMode: 'compliance',
    setBackofficeMode: vi.fn(),
  }),
}));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
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
        group.items.map((item) => (
          <a key={item.url} href={item.url} data-badge={item.badge ?? ''}>
            {item.title}
          </a>
        ))
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
    </MemoryRouter>
  );
}

function badgeOf(mounted: MountedPage, url: string): string | null | undefined {
  return mounted.container.querySelector(`nav a[href="${url}"]`)?.getAttribute('data-badge');
}

beforeEach(() => {
  countsMock.mockReset();
  countsMock.mockReturnValue({
    data: {
      adminLoopay_providerRequirementCounts: {
        awaitingCustomer: 4,
        pendingReview: 2,
        readyToSubmit: 1,
      },
    },
  });
});

afterEach(() => {
  page?.unmount();
  staffRoles = [];
});

describe('BackofficeLayout provider requirements badge (S21)', () => {
  it.each([[['OPS_COMMERCIAL']], [['LOOPAY_ADMIN']], [['LOOPAY_OPERATIONS']]])(
    'shows pending review + ready to submit on the queue entry for %j',
    (roles) => {
      staffRoles = roles;

      page = renderLayout();

      expect(countsMock).toHaveBeenCalledWith(true);
      expect(badgeOf(page, '/backoffice/provider-requirements')).toBe('3');
    }
  );

  it('shows no badge when nothing waits', () => {
    staffRoles = ['OPS_COMMERCIAL'];
    countsMock.mockReturnValue({
      data: {
        adminLoopay_providerRequirementCounts: {
          awaitingCustomer: 5,
          pendingReview: 0,
          readyToSubmit: 0,
        },
      },
    });

    page = renderLayout();

    expect(badgeOf(page, '/backoffice/provider-requirements')).toBe('');
  });

  it('does not ask for the counts for roles without the queue', () => {
    staffRoles = ['OPS_KYC'];

    page = renderLayout();

    expect(countsMock).not.toHaveBeenCalledWith(true);
  });
});
