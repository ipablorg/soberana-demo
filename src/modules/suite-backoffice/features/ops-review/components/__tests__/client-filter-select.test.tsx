/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { ClientFilterSelect } from '../client-filter-select';

const useClientOptionsMock = vi.fn();
let selectProps: { value: string; onValueChange: (value: string) => void } | null =
  null;

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('../../hooks/use-client-options', () => ({
  useClientOptions: () => useClientOptionsMock(),
}));

vi.mock('@/shared/components/ui/select', () => ({
  Select: (props: {
    value: string;
    onValueChange: (value: string) => void;
    children: ReactNode;
  }) => {
    selectProps = props;
    return <div>{props.children}</div>;
  },
  SelectTrigger: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: () => null,
  SelectContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
    <div data-value={value}>{children}</div>
  ),
}));

let page: MountedPage;

beforeEach(() => {
  selectProps = null;
  useClientOptionsMock.mockReturnValue({
    options: [
      { client_id: 'client-1', client_name: 'Trokera', is_active: true },
      { client_id: 'client-2', client_name: 'Legacy SA', is_active: false },
    ],
    isLoading: false,
  });
});

afterEach(() => {
  page?.unmount();
});

describe('ClientFilterSelect', () => {
  it('defaults to all clients and lists every option', async () => {
    // Arrange / Act
    page = mountPage(
      <ClientFilterSelect id="test-client" value={undefined} onChange={vi.fn()} />,
    );

    // Assert
    const items = Array.from(
      page.container.querySelectorAll('[data-value]'),
    ).map((node) => node.textContent);
    expect(items[0]).toBe('Todos los clientes');
    expect(items).toContain('Trokera');
    expect(items).toContain('Legacy SA (inactivo)');
  });

  it('emits the chosen client id', async () => {
    // Arrange
    const onChange = vi.fn();
    page = mountPage(
      <ClientFilterSelect id="test-client" value={undefined} onChange={onChange} />,
    );

    // Act
    page.flush(() => selectProps?.onValueChange('client-1'));

    // Assert
    expect(onChange).toHaveBeenCalledWith('client-1');
  });

  it('emits no client id when all clients is chosen again', async () => {
    // Arrange
    const onChange = vi.fn();
    page = mountPage(
      <ClientFilterSelect id="test-client" value="client-1" onChange={onChange} />,
    );
    const allValue = page.container
      .querySelector('[data-value]')
      ?.getAttribute('data-value');

    // Act
    page.flush(() => selectProps?.onValueChange(allValue ?? ''));

    // Assert
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
