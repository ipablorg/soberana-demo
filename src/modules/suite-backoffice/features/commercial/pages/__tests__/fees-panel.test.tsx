/* @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage } from '@/test/dom-render';
import { FeesPanel } from '../../components/fees-panel';

let allowed = true;

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));
vi.mock('@/shared/hooks/use-staff-role', () => ({
  useHasStaffRole: (role: string) => allowed && role === 'OPS_COMMERCIAL',
}));
vi.mock('../../hooks/use-commercial', () => ({
  useFeeSchedules: () => ({
    data: {
      adminLoopay_listFeeSchedules: [
        {
          id: 's1',
          clientId: 'c1',
          railCode: null,
          operation: 'VA_CREATION',
          mode: 'FIXED',
          value: '5',
          minAmount: null,
          maxAmount: null,
          currency: 'USD',
          version: 1,
          active: true,
        },
      ],
    },
    isLoading: false,
  }),
  useCreateFeeSchedule: () => ({ mutate: vi.fn(), isPending: false }),
  useDeactivateFeeSchedule: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../../components/fee-schedule-dialog', () => ({ FeeScheduleDialog: () => null }));

describe('FeesPanel', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lets OPS_COMMERCIAL create schedules and shows human enum labels', () => {
    allowed = true;
    const page = mountPage(<FeesPanel clientId="c1" />);
    expect(page.text()).toContain('Crear tarifa');
    expect(page.text()).toContain('Creación de cuenta virtual');
    expect(page.text()).toContain('Fijo');
    expect(page.text()).not.toContain('VA_CREATION');
    expect(page.container.querySelector('[data-testid="fees-readonly-notice"]')).toBeNull();
    page.unmount();
  });

  it('shows a read-only notice to other roles instead of the create button', () => {
    allowed = false;
    const page = mountPage(<FeesPanel clientId="c1" />);
    expect(page.text()).not.toContain('Crear tarifa');
    expect(page.container.querySelector('[data-testid="fees-readonly-notice"]')).not.toBeNull();
    page.unmount();
  });
});
