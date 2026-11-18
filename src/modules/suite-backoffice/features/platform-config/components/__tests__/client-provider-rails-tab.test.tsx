/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { ClientProviderRailsTab } from '../client-provider-rails-tab';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));

vi.mock('../client-picker', () => ({
  ClientPicker: ({ onChange }: { onChange: (id: string) => void }) => (
    <button type="button" onClick={() => onChange('client-1')}>
      pick-client
    </button>
  ),
}));

vi.mock('@/shared/components/common/DataTable', () => ({
  DataTable: ({
    data,
    columns,
  }: {
    data: { id: string }[];
    columns: {
      id?: string;
      header?: unknown;
      cell?: (ctx: { row: { original: unknown } }) => ReactNode;
    }[];
  }) => (
    <table>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={column.id ?? index}>{String(column.header)}</th>
          ))}
        </tr>
      </thead>
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

vi.mock('../../hooks/use-client-config', () => ({
  useClientProviderRails: () => ({
    data: {
      adminLoopay_listClientProviderRails: [
        {
          id: 'cpr-1',
          priority: 7,
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

describe('ClientProviderRailsTab read-only (#411)', () => {
  it('shows each client rail and its provider, with no priority, form or toggle', () => {
    page = mountPage(<ClientProviderRailsTab />);
    page.click(page.findByText('button', 'pick-client'));

    expect(page.text()).toContain('ACH');
    expect(page.text()).toContain('Mesta');
    expect(page.text()).not.toContain('Prioridad');
    expect(page.text()).not.toContain('7');
    expect(page.container.querySelector('form')).toBeNull();
    expect(page.container.querySelector('#client-rail-priority')).toBeNull();
    const labels = Array.from(page.container.querySelectorAll('button')).map((b) =>
      b.textContent?.trim()
    );
    expect(labels).toEqual(['pick-client']);
  });
});
