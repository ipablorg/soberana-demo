/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useNavigate, type NavigateFunction } from 'react-router-dom';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { useDynamicIslandStore } from '@/shared/stores/useDynamicIslandStore';
import type { DockSection } from '@/shared/components/common/BottomDock';

// The real AppLayout (it owns the dock section) with its heavy neighbours stubbed:
// the dock exposes one button per section, the shell prints the section it shows.
vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@/shared/components/common/AppTopbar', () => ({ AppTopbar: () => null }));
vi.mock('@/shared/components/common/BottomDock', () => ({
  BottomDock: ({ onChange }: { onChange: (s: DockSection) => void }) => (
    <nav>
      <button type="button" onClick={() => onChange('transactions')}>
        Movimientos
      </button>
    </nav>
  ),
}));
vi.mock('@/shared/components/common/CommandPalette', () => ({ CommandPalette: () => null }));
vi.mock('@/shared/components/common/RouteOptimizerFAB', () => ({ RouteOptimizerFAB: () => null }));
vi.mock('@/shared/components/common/AgenticPanel', () => ({ AgenticPanel: () => null }));
vi.mock('@/modules/suite-user/features/dashboard/components/tutorial', () => ({
  TutorialButton: () => null,
}));
vi.mock('@/modules/suite-user/components/help-menu', () => ({ HelpMenu: () => null }));
vi.mock('@/modules/suite-user/components/SuiteShell', () => ({
  SuiteShell: ({ activeSection }: { activeSection: DockSection }) => (
    <div data-testid="section">{activeSection}</div>
  ),
}));
vi.mock('@/shared/hooks/useAutoProductDetection', () => ({ useAutoProductDetection: () => {} }));
vi.mock('../protected-route', () => ({
  ProtectedRoute: ({ children }: { children: unknown }) => children,
}));
vi.mock('@/shared/components/common/TransactionGuard', () => ({
  TransactionGuard: ({ children }: { children: unknown }) => children,
}));

import { AppLayout } from '@/modules/suite-user/layouts/app-layout';
import { OpenIslandFlow } from '../suite-user-routes';

let page: MountedPage;
let navigate: NavigateFunction;

function GrabNavigate() {
  navigate = useNavigate();
  return null;
}

const section = () => page.container.querySelector('[data-testid="section"]')?.textContent;

beforeEach(() => {
  useDynamicIslandStore.getState().reset();
  page = mountPage(
    <MemoryRouter initialEntries={['/suite/dashboard']}>
      <GrabNavigate />
      <Routes>
        <Route path="/suite" element={<AppLayout />}>
          <Route path="dashboard" element={null} />
          <Route path="beneficiaries" element={<div>beneficiaries page</div>} />
          <Route path="send" element={<OpenIslandFlow mode="send" />} />
          <Route path="receive" element={<OpenIslandFlow mode="receive" />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
});

afterEach(() => page.unmount());

describe('/suite/send and /suite/receive show the dashboard home, where the island flow renders', () => {
  it.each(['send', 'receive'] as const)(
    'after the dock moved to another section, /suite/%s shows the home section with the flow active',
    (mode) => {
      page.click(page.findByText('button', 'Movimientos'));
      expect(section()).toBe('transactions');
      page.flush(() => navigate('/suite/beneficiaries'));
      page.flush(() => navigate(`/suite/${mode}`));

      expect(section()).toBe('home');
      expect(useDynamicIslandStore.getState().mode).toBe(mode);
    }
  );

  it('a dock section picked from a flow route is kept when the layout returns to the dashboard', () => {
    page.flush(() => navigate('/suite/beneficiaries'));
    page.click(page.findByText('button', 'Movimientos'));

    expect(section()).toBe('transactions');
  });
});
