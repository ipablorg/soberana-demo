/* @vitest-environment jsdom */

import { describe, expect, it, vi } from 'vitest';

import { mountPage } from '@/test/dom-render';
import { RailStatusBadge } from '../rail-status-badge';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));

describe('RailStatusBadge', () => {
  it.each(['co_breb', 'ec_bank_transfer', 'ec_point_of_sale', 'pe_bank_transfer'])(
    'flags %s as under maintenance',
    (code) => {
      const page = mountPage(<RailStatusBadge code={code} active />);
      expect(page.text()).toContain('En mantenimiento');
      page.unmount();
    }
  );

  it('shows only Activo for operational rails', () => {
    const page = mountPage(<RailStatusBadge code="spei" active />);
    expect(page.text()).toContain('Activo');
    expect(page.text()).not.toContain('En mantenimiento');
    page.unmount();
  });

  it('does not flag an inactive rail as maintenance', () => {
    const page = mountPage(<RailStatusBadge code="co_breb" active={false} />);
    expect(page.text()).toContain('Inactivo');
    expect(page.text()).not.toContain('En mantenimiento');
    page.unmount();
  });
});
