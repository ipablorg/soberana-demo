/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { changeValue, submitForm } from '@/test/dom-input';
import { mountPage, type MountedPage } from '@/test/dom-render';
import { CreateRecaudoForm } from '../create-recaudo-form';

interface SelectRegistration {
  value: string | undefined;
  onValueChange: (value: string) => void;
}

const WALLETS_BY_CUSTOMER: Record<
  string,
  Array<{ id: string; currency: string }>
> = {
  'customer-ana': [
    { id: 'wallet-usdt', currency: 'USDT' },
    { id: 'wallet-eur', currency: 'EUR' },
  ],
  'customer-bob': [{ id: 'wallet-bob-usdc', currency: 'USDC' }],
};

const mutateMock = vi.fn();
const selects: Record<string, SelectRegistration> = {};

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('../../../platform-config/hooks/use-catalog-options', () => ({
  useProviderOptions: () => [
    { value: 'kirafin', label: 'KiraFin (kirafin)' },
    { value: 'mesta', label: 'Mesta (mesta)' },
  ],
}));

vi.mock('../../hooks/use-recaudos-queue', () => ({
  useCreateRecaudo: () => ({ mutate: mutateMock, isPending: false }),
}));

vi.mock('../../../ops-review/hooks/use-customer-wallets', () => ({
  useCustomerWallets: (customerId: string | null) => ({
    wallets: customerId ? (WALLETS_BY_CUSTOMER[customerId] ?? []) : [],
    isLoading: false,
  }),
}));

vi.mock('../../../ops-review/components/customer-picker', () => ({
  CustomerPicker: (props: {
    onSelect: (customer: { id: string }) => void;
    onClear: () => void;
  }) => (
    <div>
      <button type="button" onClick={() => props.onSelect({ id: 'customer-ana' })}>
        pick-ana
      </button>
      <button type="button" onClick={() => props.onSelect({ id: 'customer-bob' })}>
        pick-bob
      </button>
      <button type="button" onClick={() => props.onClear()}>
        clear-customer
      </button>
    </div>
  ),
}));

vi.mock('../../../ops-review/components/wallet-picker', () => ({
  WalletPicker: (props: {
    customerId: string | null;
    value: string;
    onChange: (
      walletId: string,
      wallet?: { id: string; currency: string },
    ) => void;
  }) => (
    <div data-testid="wallet-picker" data-wallet-value={props.value}>
      {(WALLETS_BY_CUSTOMER[props.customerId ?? ''] ?? []).map((wallet) => (
        <button
          key={wallet.id}
          type="button"
          onClick={() => props.onChange(wallet.id, wallet)}
        >
          {`pick-${wallet.id}`}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('@/shared/components/ui/select', async () => {
  const React = await import('react');
  const SelectContext = React.createContext<SelectRegistration | null>(null);

  return {
    Select: (props: SelectRegistration & { children: ReactNode }) => (
      <SelectContext.Provider value={props}>
        {props.children}
      </SelectContext.Provider>
    ),
    SelectTrigger: ({
      id,
      children,
      ...rest
    }: {
      id: string;
      children: ReactNode;
    }) => {
      const context = React.useContext(SelectContext);
      if (context && id) selects[id] = context;
      return (
        <div id={id} data-select-value={context?.value ?? ''} {...rest}>
          {children}
        </div>
      );
    },
    SelectValue: () => null,
    SelectContent: ({ children }: { children: ReactNode }) => (
      <div data-select-content>{children}</div>
    ),
    SelectItem: ({
      children,
      value,
    }: {
      children: ReactNode;
      value: string;
    }) => <div data-option={value}>{children}</div>,
  };
});

let page: MountedPage;

beforeEach(() => {
  mutateMock.mockReset();
  for (const key of Object.keys(selects)) delete selects[key];
  page = mountPage(<CreateRecaudoForm />);
});

afterEach(() => {
  page?.unmount();
});

function pressButton(label: string) {
  page.click(page.findByText('button', label));
}

function currencyValue(): string | null {
  return (
    page.container
      .querySelector('#recaudo-currency')
      ?.getAttribute('data-select-value') ?? null
  );
}

function walletValue(): string | null {
  return (
    page.container
      .querySelector('[data-testid="wallet-picker"]')
      ?.getAttribute('data-wallet-value') ?? null
  );
}

function fillAmount(value: string) {
  const input = page.container.querySelector<HTMLInputElement>('#recaudo-amount');
  if (!input) throw new Error('amount input not rendered');
  changeValue(input, value);
}

function submit() {
  const form = page.container.querySelector('form');
  if (!form) throw new Error('form not rendered');
  submitForm(form);
}

describe('CreateRecaudoForm currency', () => {
  it('starts empty and offers the common coins as options', () => {
    expect(currencyValue()).toBe('');
    expect(selects['recaudo-currency']).toBeDefined();

    const options = Array.from(
      page.container.querySelectorAll('[data-option]'),
    ).map((node) => node.getAttribute('data-option'));

    expect(options).toEqual(
      expect.arrayContaining(['USDC', 'USDT', 'BTC']),
    );
  });

  it('defaults the currency to the currency of the chosen wallet', () => {
    pressButton('pick-ana');
    pressButton('pick-wallet-usdt');

    expect(currencyValue()).toBe('USDT');

    pressButton('pick-wallet-eur');

    expect(currencyValue()).toBe('EUR');
  });

  it('lists the wallet currencies before the common coins', () => {
    pressButton('pick-ana');

    const currencyItems = Array.from(
      page.container.querySelectorAll('[data-option]'),
    )
      .map((node) => node.getAttribute('data-option'))
      .filter((value) => ['USDT', 'EUR', 'USDC', 'BTC'].includes(value ?? ''));

    expect(currencyItems).toEqual(['USDT', 'EUR', 'USDC', 'BTC']);
  });

  it('lets the user change the currency after the default is set', () => {
    pressButton('pick-ana');
    pressButton('pick-wallet-usdt');

    page.flush(() => selects['recaudo-currency']?.onValueChange('BTC'));

    expect(currencyValue()).toBe('BTC');
  });

  it('resets wallet and currency when another customer is selected', () => {
    pressButton('pick-ana');
    pressButton('pick-wallet-usdt');
    expect(walletValue()).toBe('wallet-usdt');

    pressButton('pick-bob');

    expect(walletValue()).toBe('');
    expect(currencyValue()).toBe('');
  });

  it('resets wallet and currency when the customer is cleared', () => {
    pressButton('pick-ana');
    pressButton('pick-wallet-usdt');

    pressButton('clear-customer');

    expect(walletValue()).toBe('');
    expect(currencyValue()).toBe('');
  });

  it('keeps wallet and currency when the same customer is picked again', () => {
    pressButton('pick-ana');
    pressButton('pick-wallet-usdt');

    pressButton('pick-ana');

    expect(walletValue()).toBe('wallet-usdt');
    expect(currencyValue()).toBe('USDT');
  });
});

describe('CreateRecaudoForm mismatch guard', () => {
  it('warns and blocks submit when the currency differs from the wallet', () => {
    pressButton('pick-ana');
    pressButton('pick-wallet-usdt');
    fillAmount('100.00');

    page.flush(() => selects['recaudo-currency']?.onValueChange('USDC'));
    submit();

    const alert = page.container.querySelector('[role="alert"]');
    expect(alert?.textContent).toBe(
      'La moneda no coincide con la de la billetera (USDT).',
    );
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('describes the currency select with the mismatch message', () => {
    pressButton('pick-ana');
    pressButton('pick-wallet-usdt');
    page.flush(() => selects['recaudo-currency']?.onValueChange('USDC'));

    const trigger = page.container.querySelector('#recaudo-currency');
    const describedBy = trigger?.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(page.container.querySelector(`#${describedBy}`)?.textContent).toContain(
      'USDT',
    );
  });

  it('does not warn when the currency matches the wallet', () => {
    pressButton('pick-ana');
    pressButton('pick-wallet-usdt');

    expect(page.container.querySelector('[role="alert"]')).toBeNull();
  });

  it('clears the warning once the currency matches again', () => {
    pressButton('pick-ana');
    pressButton('pick-wallet-usdt');
    page.flush(() => selects['recaudo-currency']?.onValueChange('USDC'));
    expect(page.container.querySelector('[role="alert"]')).not.toBeNull();

    page.flush(() => selects['recaudo-currency']?.onValueChange('USDT'));

    expect(page.container.querySelector('[role="alert"]')).toBeNull();
  });
});

describe('CreateRecaudoForm submit', () => {
  it('submits the uppercased currency when it matches the wallet', () => {
    pressButton('pick-ana');
    pressButton('pick-wallet-usdt');
    fillAmount('100.00');

    submit();

    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock).toHaveBeenCalledWith({
      input: {
        customerId: 'customer-ana',
        walletId: 'wallet-usdt',
        amount: '100.00',
        currency: 'USDT',
        source: 'bank_transfer',
      },
    });
  });

  it('accepts a lowercase select value and still submits it uppercased', () => {
    pressButton('pick-ana');
    pressButton('pick-wallet-usdt');
    fillAmount('5');

    page.flush(() => selects['recaudo-currency']?.onValueChange('usdt'));
    submit();

    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock.mock.calls[0]?.[0].input.currency).toBe('USDT');
  });

  it('picks the provider from a select (optional) instead of typing a code', () => {
    expect(page.container.querySelector('input#recaudo-provider-code')).toBeNull();
    expect(selects['recaudo-provider-code']).toBeDefined();

    pressButton('pick-ana');
    pressButton('pick-wallet-usdt');
    fillAmount('5');
    page.flush(() => selects['recaudo-provider-code']?.onValueChange('kirafin'));
    submit();

    expect(mutateMock.mock.calls[0]?.[0].input.providerCode).toBe('kirafin');
  });

  it('submits without provider or event id and explains that both are optional', () => {
    pressButton('pick-ana');
    pressButton('pick-wallet-usdt');
    fillAmount('5');
    submit();

    const input = mutateMock.mock.calls[0]?.[0].input;
    expect(input.providerCode).toBeUndefined();
    expect(input.providerEventId).toBeUndefined();
    expect(page.text()).toContain('Opcional');
  });

  it('does not submit before a wallet (and its currency) is chosen', () => {
    pressButton('pick-ana');
    fillAmount('100.00');

    submit();

    expect(mutateMock).not.toHaveBeenCalled();
  });
});
