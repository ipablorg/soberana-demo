/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import type { VirtualAccount } from '@/shared/hooks/use-deposit-instructions';

import { DepositInstructionsDialog } from '../DepositInstructionsDialog';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

const NOTE = 'Cuenta registrada por el equipo de Loopay';

function account(over: Partial<VirtualAccount> = {}): VirtualAccount {
  return {
    id: 'va-1',
    payment_rail: 'ach',
    currency: 'USD',
    status: 'ACTIVE',
    account_number: '123',
    account_type: null,
    bank_name: 'Bank',
    beneficiary_address: null,
    beneficiary_name: null,
    clabe: null,
    iban: null,
    nit: null,
    reference: null,
    routing_number: '021000021',
    swift_code: null,
    bic: null,
    sort_code: null,
    br_code: null,
    account_holder_name: null,
    bank_address: null,
    bank_beneficiary_name: null,
    bank_beneficiary_address: null,
    payment_rails: null,
    ...over,
  };
}

let page: MountedPage;

afterEach(() => {
  page.unmount();
});

describe('DepositInstructionsDialog (S22)', () => {
  it('tells the customer when Loopay staff registered the account by hand', () => {
    page = mountPage(
      <DepositInstructionsDialog
        account={account({ linked_manually: true, linked_at: '2026-10-20T10:00:00.000Z' })}
        open
        onOpenChange={() => undefined}
      />
    );

    expect(document.body.textContent).toContain(NOTE);
  });

  it.each([false, null, undefined])('says nothing when linked_manually is %s', (linked) => {
    page = mountPage(
      <DepositInstructionsDialog
        account={account({ linked_manually: linked })}
        open
        onOpenChange={() => undefined}
      />
    );

    expect(document.body.textContent).toContain('Bank');
    expect(document.body.textContent).not.toContain(NOTE);
  });
});
