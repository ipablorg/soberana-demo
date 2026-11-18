/* @vitest-environment jsdom */

import type * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { useDynamicIslandStore } from '@/modules/suite-user/features/dashboard/stores/useDynamicIslandStore';

import { ReceiveFlow } from '../receive-flow';
import type { UserAccount } from '../hooks/use-user-accounts';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

let customerType: 'individual' | 'business' = 'business';
vi.mock('@/shared/hooks/useKYC', () => ({
  useKYC: () => ({ customerType }),
}));

let accountsState: { accounts: UserAccount[]; isLoading: boolean; error: string | null } = {
  accounts: [],
  isLoading: false,
  error: null,
};
vi.mock('../hooks/use-user-accounts', () => ({
  useUserAccounts: () => accountsState,
}));

vi.mock('@/shared/hooks/use-receive-wallet', () => ({
  useReceiveWallet: () => ({
    hasVisibleWallets: true,
    hasResolvedMainWallet: true,
    mainWallet: { id: 'w1' },
    receiveWalletStablecoinLabel: 'USDC',
    receiveWalletPairLabel: 'USDC',
    secondaryWalletPairLabel: null,
    secondaryWallet: null,
    secondaryWalletCount: 0,
  }),
}));

// Exit animations never finish in jsdom; render motion elements as plain ones.
vi.mock('framer-motion', () => {
  const MOTION_PROPS = ['initial', 'animate', 'exit', 'transition'];
  const strip = (props: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(props).filter(([k]) => !MOTION_PROPS.includes(k)));
  const make = (Tag: string) => {
    const C = ({ children, ...props }: Record<string, unknown>) => {
      const El = Tag as unknown as React.ElementType;
      return <El {...strip(props)}>{children as React.ReactNode}</El>;
    };
    return C;
  };
  return {
    motion: { section: make('section'), div: make('div') },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('../account-details', () => ({
  AccountDetails: ({ account }: { account: UserAccount }) => (
    <div data-testid="account-details">{account.id}</div>
  ),
}));
vi.mock('../va-request-status', () => ({
  VaRequestStatus: ({ account }: { account: UserAccount }) => (
    <div data-testid="va-request-status">{account.id}</div>
  ),
}));

const account = (over: Partial<UserAccount>): UserAccount => ({
  id: 'acc',
  currency: 'USD',
  paymentRail: 'ach',
  status: 'active',
  deposit: null,
  ...over,
});

let page: MountedPage;

beforeEach(() => {
  customerType = 'business';
  accountsState = { accounts: [], isLoading: false, error: null };
  useDynamicIslandStore.getState().clearCurrencySelection();
});

afterEach(() => page.unmount());

const chips = () =>
  Array.from(page.container.querySelectorAll<HTMLButtonElement>('button[role="radio"]'));

describe('ReceiveFlow (virtual accounts only)', () => {
  it('lists only accounts that exist (active or pending), never not_requested rails', () => {
    accountsState.accounts = [
      account({ id: 'a', paymentRail: 'ach', currency: 'USD' }),
      account({ id: 'b', paymentRail: 'sepa', currency: 'EUR', status: 'pending' }),
      account({ id: 'c', paymentRail: 'pix', currency: 'BRL', status: 'not_requested' }),
    ];
    page = mountPage(<ReceiveFlow />);

    expect(chips()).toHaveLength(2);
    expect(page.text()).not.toContain('Pedir una cuenta nueva');
  });

  it('does not list payment-link rails (LoopayApp is not live)', () => {
    accountsState.accounts = [
      account({ id: 'a', paymentRail: 'ach' }),
      account({ id: 'l', paymentRail: 'co_ach', currency: 'COP', usePaymentLink: true }),
    ];
    page = mountPage(<ReceiveFlow />);

    expect(chips()).toHaveLength(1);
  });

  it('shows AccountDetails for an active account', () => {
    accountsState.accounts = [account({ id: 'a' })];
    page = mountPage(<ReceiveFlow />);
    page.click(chips()[0]);

    expect(page.container.querySelector('[data-testid="account-details"]')).not.toBeNull();
    expect(page.container.querySelector('[data-testid="va-request-status"]')).toBeNull();
  });

  it('shows only VaRequestStatus for a pending account (no forms, no CTAs)', () => {
    accountsState.accounts = [account({ id: 'p', paymentRail: 'sepa', status: 'pending' })];
    page = mountPage(<ReceiveFlow />);
    page.click(chips()[0]);

    expect(page.container.querySelector('[data-testid="va-request-status"]')).not.toBeNull();
    expect(page.container.querySelector('form')).toBeNull();
    expect(page.container.querySelector('input')).toBeNull();
    expect(page.text()).not.toContain('Activar');
  });

  it('empty state for business customers points to the commercial executive', () => {
    customerType = 'business';
    page = mountPage(<ReceiveFlow />);

    expect(page.text()).toContain(
      'Tus cuentas virtuales las habilita tu ejecutivo comercial. Cuando estén listas aparecerán aquí.'
    );
    expect(chips()).toHaveLength(0);
  });

  it('empty state for individual customers explains virtual accounts are business-only', () => {
    customerType = 'individual';
    page = mountPage(<ReceiveFlow />);

    expect(page.text()).toContain(
      'Las cuentas virtuales están disponibles solo para empresas, incluidas las empresas unipersonales.'
    );
    expect(page.text()).not.toContain('ejecutivo comercial');
  });

  it('shows an existing account on a maintenance rail with an "En mantenimiento" badge', () => {
    accountsState.accounts = [account({ id: 'co', paymentRail: 'co_breb', currency: 'COP' })];
    page = mountPage(<ReceiveFlow />);

    expect(chips()).toHaveLength(1);
    expect(page.text()).toContain('En mantenimiento');
  });
});
