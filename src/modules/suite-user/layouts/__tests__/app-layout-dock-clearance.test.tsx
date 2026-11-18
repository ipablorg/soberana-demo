/* @vitest-environment jsdom */

import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import { AppLayout } from '../app-layout';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@/shared/components/common/AppTopbar', () => ({ AppTopbar: () => null }));
vi.mock('@/shared/components/common/BottomDock', () => ({ BottomDock: () => <nav /> }));
vi.mock('@/shared/components/common/CommandPalette', () => ({ CommandPalette: () => null }));
vi.mock('@/shared/components/common/RouteOptimizerFAB', () => ({ RouteOptimizerFAB: () => null }));
vi.mock('@/shared/components/common/AgenticPanel', () => ({ AgenticPanel: () => null }));
vi.mock('@/modules/suite-user/features/dashboard/components/tutorial', () => ({
  TutorialButton: () => null,
}));
vi.mock('@/modules/suite-user/components/help-menu', () => ({ HelpMenu: () => null }));
vi.mock('@/modules/suite-user/components/SuiteShell', () => ({ SuiteShell: () => null }));
vi.mock('@/shared/hooks/useAutoProductDetection', () => ({ useAutoProductDetection: () => {} }));

let page: MountedPage;
afterEach(() => page.unmount());

const mount = (path: string) =>
  mountPage(
    <MemoryRouter initialEntries={[path]}>
      <AppLayout />
    </MemoryRouter>
  );

describe('AppLayout dock clearance', () => {
  it('marks the document with data-suite-dock while mounted so the WhatsApp FAB lifts', () => {
    page = mount('/suite/dashboard');
    expect(document.documentElement.hasAttribute('data-suite-dock')).toBe(true);
    page.unmount();
    expect(document.documentElement.hasAttribute('data-suite-dock')).toBe(false);
    page = mount('/suite/dashboard');
  });

  it('reserves bottom space for the dock plus the safe-area inset on flow routes', () => {
    page = mount('/suite/send');
    const main = page.container.querySelector('main');

    expect(main?.className).toContain('safe-area-inset-bottom');
  });

  it('positions the dock above the safe-area inset', () => {
    page = mount('/suite/dashboard');
    const dock = page.container.querySelector('nav')?.parentElement;

    expect(dock?.className).toContain('safe-area-inset-bottom');
  });
});
