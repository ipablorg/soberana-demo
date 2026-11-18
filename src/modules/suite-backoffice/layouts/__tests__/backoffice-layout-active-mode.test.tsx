/* @vitest-environment jsdom */

import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { BackofficeLayout, CONTENT_OFFSET_VAR } from '../backoffice-layout';

let staffRoles: string[] = [];
let storedMode = 'move';
const setBackofficeMode = vi.fn();
const toggleSidebar = vi.fn();

vi.mock('@/shared/stores/auth-store', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: { staff_roles: staffRoles } }),
}));

vi.mock('@/shared/stores/useModeStore', () => ({
  useModeStore: () => ({ currentBackofficeMode: storedMode, setBackofficeMode }),
}));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
// The sidebar badge counts (S21) need a query client; these tests are about navigation only.
vi.mock(
  '@/modules/suite-backoffice/features/provider-requirements/hooks/use-provider-requirements',
  () => ({ useProviderRequirementCounts: () => ({ data: undefined }) })
);
vi.mock('@/shared/components/DynamicIsland', () => ({ DynamicIsland: () => null }));
vi.mock('@/shared/hooks/use-mobile', () => ({ useMobile: () => false }));
vi.mock('@/shared/components/common/GenericSidebar', () => ({
  GenericSidebar: ({ currentMode }: { currentMode: string }) => (
    <nav data-testid="sidebar-mode">{currentMode}</nav>
  ),
}));
vi.mock('@/shared/components/common/ModeSidebar', () => ({
  ModeSidebar: ({ currentMode }: { currentMode: string }) => (
    <aside data-testid="rail-mode">{currentMode}</aside>
  ),
}));
vi.mock('@/shared/components/common/AppTopbar', () => ({ AppTopbar: () => null }));
vi.mock('@/modules/suite-backoffice/components/CountrySelector', () => ({
  CountrySelector: () => null,
}));
vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSidebar: () => ({ toggleSidebar }),
}));

let page: MountedPage;

function renderAt(path: string): MountedPage {
  return mountPage(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <BackofficeLayout />
    </MemoryRouter>
  );
}

const text = (id: string) => page.container.querySelector(`[data-testid="${id}"]`)?.textContent;

afterEach(() => {
  page?.unmount();
  staffRoles = [];
  storedMode = 'move';
  setBackofficeMode.mockClear();
  toggleSidebar.mockClear();
});

describe('BackofficeLayout active mode', () => {
  it.each([
    ['/backoffice/commercial/clients', ['OPS_COMMERCIAL'], 'companies'],
    ['/backoffice/platform/staff-users', ['LOOPAY_ADMIN'], 'companies'],
    ['/backoffice/compliance-review', ['OPS_KYC'], 'compliance'],
    ['/backoffice/move/recaudos', ['OPS_RECAUDOS'], 'move'],
  ])('derives the mode from %s even if the stored mode is move', (path, roles, expected) => {
    staffRoles = roles;
    page = renderAt(path);

    expect(text('rail-mode')).toBe(expected);
    expect(text('sidebar-mode')).toBe(expected);
  });

  it('falls back to the first visible mode when the stored mode is hidden for the role', () => {
    staffRoles = ['OPS_VA'];
    page = renderAt('/backoffice/unknown');

    expect(text('rail-mode')).toBe('companies');
  });
});

describe('BackofficeLayout sidebar toggle and banner offset', () => {
  it('renders a toggle that collapses the sidebar', () => {
    staffRoles = ['LOOPAY_ADMIN'];
    page = renderAt('/backoffice/customers');

    const toggle = page.container.querySelector('button[aria-label]');
    act(() => {
      toggle?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(toggle).not.toBeNull();
    expect(toggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('publishes the width covered by rail + sidebar for the MFA banner', () => {
    staffRoles = ['LOOPAY_ADMIN'];
    Object.defineProperty(window, 'innerWidth', { value: 1440, configurable: true });
    page = renderAt('/backoffice/customers');

    expect(document.documentElement.style.getPropertyValue(CONTENT_OFFSET_VAR)).toBe('320px');
  });

  it('starts the sidebar collapsed on a 768px viewport', () => {
    staffRoles = ['LOOPAY_ADMIN'];
    Object.defineProperty(window, 'innerWidth', { value: 768, configurable: true });
    page = renderAt('/backoffice/customers');

    expect(document.documentElement.style.getPropertyValue(CONTENT_OFFSET_VAR)).toBe('112px');
  });
});
