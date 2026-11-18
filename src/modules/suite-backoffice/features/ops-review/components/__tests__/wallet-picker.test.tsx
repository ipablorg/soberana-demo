/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { WalletPicker } from '../wallet-picker';

const useCustomerWalletsMock = vi.fn();
let selectProps: { onValueChange: (value: string) => void; value?: string } | null = null;

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('../../hooks/use-customer-wallets', () => ({
  useCustomerWallets: (customerId: string | null) =>
    useCustomerWalletsMock(customerId),
}));

vi.mock('@/shared/components/ui/select', () => ({
  Select: (props: {
    onValueChange: (value: string) => void;
    value?: string;
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

const USDT_WALLET = {
  id: 'wallet-usdt',
  currency: 'USDT',
  chain: 'tron',
  address: 'TXyz1234567890abcd',
  status: 'active',
};

const EUR_WALLET = {
  id: 'wallet-eur',
  currency: 'EUR',
  chain: null,
  address: null,
  status: 'active',
};

let page: MountedPage;

beforeEach(() => {
  selectProps = null;
  useCustomerWalletsMock.mockReturnValue({
    wallets: [USDT_WALLET, EUR_WALLET],
    isLoading: false,
  });
});

afterEach(() => {
  page?.unmount();
});

describe('WalletPicker', () => {
  it('lists the wallets of the selected customer', () => {
    page = mountPage(
      <WalletPicker
        id="test-wallet"
        customerId="customer-1"
        value=""
        onChange={vi.fn()}
      />,
    );

    const values = Array.from(page.container.querySelectorAll('[data-value]'))
      .map((node) => node.getAttribute('data-value'));
    expect(values).toEqual(['wallet-usdt', 'wallet-eur']);
    expect(useCustomerWalletsMock).toHaveBeenCalledWith('customer-1');
  });

  it('emits the wallet id together with the whole wallet', () => {
    const onChange = vi.fn();
    page = mountPage(
      <WalletPicker
        id="test-wallet"
        customerId="customer-1"
        value=""
        onChange={onChange}
      />,
    );

    page.flush(() => selectProps?.onValueChange('wallet-usdt'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('wallet-usdt', USDT_WALLET);
  });

  it('still works for consumers that only read the wallet id', () => {
    const ids: string[] = [];
    page = mountPage(
      <WalletPicker
        id="test-wallet"
        customerId="customer-1"
        value=""
        onChange={(walletId) => ids.push(walletId)}
      />,
    );

    page.flush(() => selectProps?.onValueChange('wallet-eur'));

    expect(ids).toEqual(['wallet-eur']);
  });

  it('stays a controlled select while no wallet is chosen (NF-9)', () => {
    page = mountPage(
      <WalletPicker id="test-wallet" customerId="customer-1" value="" onChange={vi.fn()} />,
    );

    expect(selectProps?.value).toBe('');
  });
});
