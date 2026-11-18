/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { ReadinessTab } from '../readiness-tab';

const usePlatformReadinessMock = vi.fn();

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('../../hooks/use-platform-readiness', () => ({
  usePlatformReadiness: () => usePlatformReadinessMock(),
}));

const READY_ROW = {
  client_id: 'client-ready',
  client_name: 'Alpha Pagos',
  wallet_defaults_set: true,
  active_providers: ['openfort', 'kirafin'],
  active_junction_count: 4,
  missing_pairings: [],
  dead_provider_junctions_active: 0,
  status: 'READY',
  issues: [],
};

const BLOCKED_ROW = {
  client_id: 'client-blocked',
  client_name: 'Trokera',
  wallet_defaults_set: false,
  active_providers: [],
  active_junction_count: 0,
  missing_pairings: ['kirafin'],
  dead_provider_junctions_active: 2,
  status: 'BLOCKED',
  issues: ['No active junction to a live provider'],
};

let page: MountedPage;

afterEach(() => {
  page?.unmount();
});

describe('ReadinessTab', () => {
  it('renders a BLOCKED client in red, first, with its issues', () => {
    // Arrange
    usePlatformReadinessMock.mockReturnValue({
      data: { adminLoopay_platformReadiness: [READY_ROW, BLOCKED_ROW] },
      isLoading: false,
    });

    // Act
    page = mountPage(<ReadinessTab />);

    // Assert
    const clientCells = Array.from(page.container.querySelectorAll('[data-readiness-status]'));
    expect(clientCells.map((cell) => cell.textContent)).toEqual(['Trokera', 'Alpha Pagos']);
    expect(clientCells[0].className).toContain('text-destructive');
    expect(page.text()).toContain('Bloqueado');
    expect(page.text()).toContain('No active junction to a live provider');
  });
});

describe('ReadinessTab issue keys (#411)', () => {
  it('renders each finding from its i18n key and params, not from the English text', () => {
    usePlatformReadinessMock.mockReturnValue({
      data: {
        adminLoopay_platformReadiness: [
          {
            ...BLOCKED_ROW,
            issues: ["Client is not registered (LINKED or MANUAL) at provider 'kirafin'"],
            issue_keys: [
              { key: 'readiness.provider_not_onboarded', params: { provider: 'kirafin' } },
            ],
          },
        ],
      },
      isLoading: false,
    });

    page = mountPage(<ReadinessTab />);

    expect(page.text()).toContain(
      'El cliente no está registrado en kirafin, que sus rieles habilitados necesitan'
    );
    expect(page.text()).not.toContain('Client is not registered');
  });
});
