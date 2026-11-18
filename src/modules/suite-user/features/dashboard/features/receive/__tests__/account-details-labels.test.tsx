/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { mountPage, type MountedPage } from '@/test/dom-render';

import { AccountDetails } from '../account-details';
import type { UserAccount } from '../hooks/use-user-accounts';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('@/shared/components/bank-transfer-guide', () => ({
  BankTransferGuide: () => null,
  getRailLabel: () => 'ACH',
  hasBankTransferGuide: () => false,
}));

let page: MountedPage;

afterEach(() => {
  page?.unmount();
});

const ACH_ACCOUNT = {
  id: 'va-1',
  currency: 'USD',
  paymentRail: 'ach',
  status: 'active',
  deposit: {
    bank_name: 'QA Test Bank',
    account_number: '9876543210',
    routing_number: '021000021',
    payment_rails: ['ach', 'wire'],
  },
} as unknown as UserAccount;

describe('AccountDetails labels (N-6)', () => {
  it('names the routing number and the payment rails in Spanish', () => {
    page = mountPage(
      <TooltipProvider>
        <AccountDetails account={ACH_ACCOUNT} />
      </TooltipProvider>
    );

    const text = page.text();
    expect(text).toContain('Número de ruta (routing)');
    expect(text).not.toContain('Routing Number');
    expect(text).toContain('Número de cuenta');
    expect(text).toContain('ACH, Wire');
  });

  it('M1: says the account was registered by Loopay only when it was linked manually', () => {
    const manual = {
      ...ACH_ACCOUNT,
      deposit: { ...ACH_ACCOUNT.deposit, linked_manually: true },
    } as UserAccount;
    page = mountPage(
      <TooltipProvider>
        <AccountDetails account={manual} />
      </TooltipProvider>
    );
    expect(page.text()).toContain('Cuenta registrada por el equipo de Loopay');
    page.unmount();

    page = mountPage(
      <TooltipProvider>
        <AccountDetails account={ACH_ACCOUNT} />
      </TooltipProvider>
    );
    expect(page.text()).not.toContain('Cuenta registrada por el equipo de Loopay');
  });
});
