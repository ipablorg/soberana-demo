/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import { CurrencySelector } from '../currency-selector';
import type { UserAccount } from '../hooks/use-user-accounts';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

const account = (over: Partial<UserAccount>): UserAccount => ({
  id: 'acc',
  currency: 'MXN',
  paymentRail: 'spei',
  status: 'active',
  deposit: null,
  ...over,
});

let page: MountedPage;

afterEach(() => page.unmount());

describe('CurrencySelector maintenance rails', () => {
  it('shows Colombia/Ecuador/Peru rails as "En mantenimiento", disabled', () => {
    const onSelect = vi.fn();
    page = mountPage(
      <CurrencySelector
        accounts={[
          account({ id: 'a', paymentRail: 'spei' }),
          account({ id: 'b', paymentRail: 'co_breb', currency: 'COP', status: 'not_requested' }),
          account({
            id: 'c',
            paymentRail: 'pe_bank_transfer',
            currency: 'PEN',
            status: 'not_requested',
          }),
        ]}
        selectedCurrency={null}
        onSelect={onSelect}
      />
    );

    const chips = Array.from(
      page.container.querySelectorAll<HTMLButtonElement>('button[role="radio"]')
    );
    expect(chips).toHaveLength(3);
    expect(chips[0].disabled).toBe(false);
    expect(chips[1].disabled).toBe(true);
    expect(chips[2].disabled).toBe(true);
    expect(page.text()).toContain('En mantenimiento');

    page.click(chips[1]);
    expect(onSelect).not.toHaveBeenCalled();
    page.click(chips[0]);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
