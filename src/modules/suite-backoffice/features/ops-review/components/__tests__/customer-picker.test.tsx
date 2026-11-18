/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminCustomerSearchItem } from '@/graphql/queries/admin-loopay';
import { mountPage, type MountedPage } from '@/test/dom-render';
import { CustomerPicker } from '../customer-picker';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

const useCustomerSearchMock = vi.fn();

vi.mock('../../hooks/use-customer-search', () => ({
  useCustomerSearch: (term: string) => useCustomerSearchMock(term),
}));

const ANA: AdminCustomerSearchItem = {
  id: 'customer-ana',
  clientId: 'client-1',
  email: 'ana@example.com',
  firstName: 'Ana',
  lastName: 'Ruiz',
};

const BOB: AdminCustomerSearchItem = {
  id: 'customer-bob',
  clientId: 'client-1',
  email: 'bob@example.com',
  firstName: 'Bob',
  lastName: 'Smith',
};

let page: MountedPage;
let picked: AdminCustomerSearchItem | null = null;
let cleared = false;

beforeEach(() => {
  useCustomerSearchMock.mockReturnValue({ data: undefined, isLoading: false });
  picked = null;
  cleared = false;
});

afterEach(() => {
  page?.unmount();
});

function typeInto(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('CustomerPicker', () => {
  it('shows matching customers once the term is at least three characters', () => {
    useCustomerSearchMock.mockReturnValue({
      data: { adminLoopay_listCustomers: [ANA, BOB] },
      isLoading: false,
    });

    page = mountPage(
      <CustomerPicker
        id="test-customer"
        selected={null}
        onSelect={(c) => (picked = c)}
        onClear={() => (cleared = true)}
      />,
    );

    const input = page.container.querySelector('input');
    if (!input) throw new Error('input not rendered');

    page.flush(() => typeInto(input, 'ana'));

    const rendered = page.text();

    expect(rendered).toContain('ana@example.com');
    expect(rendered).toContain('bob@example.com');
  });

  it('shows the error instead of "Sin resultados" when the search fails', () => {
    useCustomerSearchMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('FORBIDDEN'),
    });

    page = mountPage(
      <CustomerPicker
        id="test-customer"
        selected={null}
        onSelect={(c) => (picked = c)}
        onClear={() => (cleared = true)}
      />,
    );
    const input = page.container.querySelector('input');
    if (!input) throw new Error('input not rendered');

    page.flush(() => typeInto(input, 'ana'));

    expect(page.text()).not.toContain('Sin resultados');
    expect(page.container.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('calls onSelect with the chosen customer and shows their name', () => {
    useCustomerSearchMock.mockReturnValue({
      data: { adminLoopay_listCustomers: [ANA] },
      isLoading: false,
    });

    page = mountPage(
      <CustomerPicker
        id="test-customer"
        selected={null}
        onSelect={(c) => (picked = c)}
        onClear={() => (cleared = true)}
      />,
    );

    const input = page.container.querySelector('input');
    if (!input) throw new Error('input not rendered');

    page.flush(() => typeInto(input, 'ana'));

    const resultButton = Array.from(
      page.container.querySelectorAll('button'),
    ).find((btn) => btn.textContent?.includes('ana@example.com'));

    if (!resultButton) throw new Error('result button not rendered');

    page.click(resultButton);

    expect(picked).toEqual(ANA);
  });

  it('renders the selected customer summary and allows changing it', () => {
    page = mountPage(
      <CustomerPicker
        id="test-customer"
        selected={ANA}
        onSelect={(c) => (picked = c)}
        onClear={() => (cleared = true)}
      />,
    );

    const rendered = page.text();

    expect(rendered).toContain('Ana Ruiz');
    expect(rendered).toContain('ana@example.com');
    expect(rendered).toContain('customer-ana');

    const changeButton = page.findByText('button', 'Cambiar');
    page.click(changeButton);

    expect(cleared).toBe(true);
  });
});
