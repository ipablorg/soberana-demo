/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { ProviderRailsTab } from '../provider-rails-tab';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));

vi.mock('@/shared/components/common/DataTable', () => ({
  DataTable: ({
    data,
    columns,
  }: {
    data: { id: string }[];
    columns: { id?: string; cell?: (ctx: { row: { original: unknown } }) => ReactNode }[];
  }) => (
    <table>
      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            {columns.map((column, index) => (
              <td key={column.id ?? index}>{column.cell?.({ row: { original: row } })}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

vi.mock('../../hooks/use-platform-catalog', () => ({
  useProviderPaymentRails: () => ({
    data: {
      adminLoopay_listProviderPaymentRails: [
        {
          id: 'j1',
          is_active: true,
          provider: { id: 'p-mesta', code: 'mesta', name: 'Mesta' },
          rail: { id: 'r-ach', code: 'ach', name: 'ACH' },
        },
      ],
    },
    isLoading: false,
  }),
}));

let page: MountedPage | null = null;
afterEach(() => {
  page?.unmount();
  page = null;
});

describe('ProviderRailsTab read-only catalogue (#411)', () => {
  it('lists the provider behind each rail with no assignment form or toggle', () => {
    page = mountPage(<ProviderRailsTab />);

    expect(page.text()).toContain('Mesta');
    expect(page.text()).toContain('ACH');
    expect(page.container.querySelector('form')).toBeNull();
    const labels = Array.from(page.container.querySelectorAll('button')).map((b) =>
      b.textContent?.trim()
    );
    expect(labels).not.toContain('Desactivar');
    expect(labels).not.toContain('Activar');
  });
});
