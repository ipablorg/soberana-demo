/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act } from 'react';

import { submitForm } from '@/test/dom-input';
import { mountPage, type MountedPage } from '@/test/dom-render';
import { ClientDefaultsTab } from '../client-defaults-tab';

const updateClientMutate = vi.fn();

const CLIENT = {
  id: '9a4f7c3e-1b2d-4e5f-8a9b-0c1d2e3f4a5b',
  name: 'Trokera',
  status: 'ACTIVE',
  updated_at: '2026-09-13T10:00:00.000Z',
  config: {
    fees: { mode: 'percent', feePercent: 1.5 },
    webhookUrl: 'https://trokera.example/webhooks',
    defaults: {
      kycProviderId: 'provider-kyc',
      walletProviderId: 'provider-openfort',
      walletDefaultChain: 'base',
      walletDefaultCurrency: 'usdc',
    },
  },
};

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('@/shared/components/ui/select', () => ({
  Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../../../components/option-select', () => ({
  OptionSelect: ({
    id,
    value,
    onChange,
    options,
  }: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  }) => (
    <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="" />
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock('../client-picker', () => ({
  ClientPicker: ({ onChange }: { onChange: (clientId: string) => void }) => (
    <button type="button" onClick={() => onChange(CLIENT.id)}>
      pick-trokera
    </button>
  ),
}));

vi.mock('../../hooks/use-client-config', () => ({
  useClientConfig: (clientId: string | undefined) => ({
    data: clientId ? { adminLoopay_getClient: CLIENT } : undefined,
    isLoading: false,
  }),
  useUpdateClientConfig: () => ({ mutate: updateClientMutate, isPending: false }),
}));

let providersFixture: { id: string; code: string; name: string; is_active: boolean }[] = [];
vi.mock('../../hooks/use-platform-catalog', () => ({
  useProviders: () => ({ data: { adminLoopay_listProviders: providersFixture } }),
}));

let page: MountedPage;

function choose(element: HTMLSelectElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;

  act(() => {
    setter?.call(element, value);
    element.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function field<T extends HTMLElement>(id: string): T {
  const element = page.container.querySelector<T>(`#${id}`);
  if (!element) throw new Error(`Missing #${id}. Rendered: ${page.text()}`);
  return element;
}

beforeEach(() => {
  updateClientMutate.mockClear();
});

afterEach(() => {
  page?.unmount();
});

describe('ClientDefaultsTab', () => {
  it('saves the wallet defaults merged into the existing client config', () => {
    // Arrange
    page = mountPage(<ClientDefaultsTab />);
    page.click(page.findByText('button', 'pick-trokera'));
    choose(field<HTMLSelectElement>('client-default-chain'), 'tron');
    choose(field<HTMLSelectElement>('client-default-currency'), 'usdt');

    // Act
    submitForm(page.container.querySelector('form') as HTMLFormElement);

    // Assert
    expect(updateClientMutate).toHaveBeenCalledWith({
      id: CLIENT.id,
      input: {
        config: {
          fees: { mode: 'percent', feePercent: 1.5 },
          webhookUrl: 'https://trokera.example/webhooks',
          defaults: {
            kycProviderId: 'provider-kyc',
            walletProviderId: 'provider-openfort',
            walletDefaultChain: 'tron',
            walletDefaultCurrency: 'usdt',
          },
        },
      },
    });
  });

  it('does not save while a wallet default is blank', () => {
    // Arrange
    page = mountPage(<ClientDefaultsTab />);
    page.click(page.findByText('button', 'pick-trokera'));
    choose(field<HTMLSelectElement>('client-default-currency'), '');

    // Act
    submitForm(page.container.querySelector('form') as HTMLFormElement);

    // Assert
    expect(updateClientMutate).not.toHaveBeenCalled();
    expect(page.text()).toContain('Proveedor, cadena y moneda son obligatorios.');
  });
});

describe('ClientDefaultsTab wallet provider choices (#411)', () => {
  afterEach(() => {
    providersFixture = [];
  });

  it('never offers a dead or inactive provider', () => {
    providersFixture = [
      { id: 'provider-openfort', code: 'openfort', name: 'Openfort', is_active: true },
      { id: 'provider-lumx', code: 'lumx', name: 'Lumx', is_active: true },
      { id: 'provider-old', code: 'oldwallet', name: 'Old wallet', is_active: false },
    ];
    page = mountPage(<ClientDefaultsTab />);
    page.click(page.findByText('button', 'pick-trokera'));

    expect(page.text()).toContain('Openfort (openfort)');
    expect(page.text()).not.toContain('Lumx (lumx)');
    expect(page.text()).not.toContain('Old wallet (oldwallet)');
  });

  it('keeps a current dead provider visible (marked unavailable) without offering the other dead ones', () => {
    providersFixture = [
      { id: 'provider-openfort', code: 'bridge', name: 'Bridge', is_active: true },
      { id: 'provider-lumx', code: 'lumx', name: 'Lumx', is_active: true },
    ];
    page = mountPage(<ClientDefaultsTab />);
    page.click(page.findByText('button', 'pick-trokera'));

    // CLIENT.config.defaults.walletProviderId is 'provider-openfort' (here a dead Bridge row).
    expect(page.text()).toContain('Bridge (bridge) — no disponible');
    expect(page.text()).not.toContain('Lumx (lumx)');
  });
});
