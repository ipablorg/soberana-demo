/* @vitest-environment jsdom */

import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { useDynamicIslandStore } from '@/shared/stores/useDynamicIslandStore';
import { DynamicIsland } from '@/shared/components/DynamicIsland';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@/shared/hooks/use-mobile', () => ({ useMobile: () => true }));
vi.mock('@/shared/hooks/useBridgeWalletBalance', () => ({
  useBridgeWalletBalance: () => ({ balance: null, currency: 'USDC', isLoading: false }),
}));

let page: MountedPage;

const island = () => page.container.querySelector('p.font-heading');

async function typeOut() {
  for (let i = 0; i < 300; i += 1) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  useDynamicIslandStore.getState().reset();
});

afterEach(() => {
  page.unmount();
  vi.useRealTimers();
});

describe('DynamicIsland receive narration', () => {
  it('invites to pick an account when the customer has virtual accounts', async () => {
    useDynamicIslandStore.setState({ mode: 'receive', receiveAccountCount: 2 });
    page = mountPage(<DynamicIsland />);
    await typeOut();

    expect(island()?.textContent).toContain('Tus cuentas');
    expect(island()?.textContent).not.toContain('En qué moneda');
  });

  it('says there are no virtual accounts yet when the customer has none', async () => {
    useDynamicIslandStore.setState({ mode: 'receive', receiveAccountCount: 0 });
    page = mountPage(<DynamicIsland />);
    await typeOut();

    expect(island()?.textContent).toContain('Aún no tienes');
    expect(island()?.textContent).not.toContain('En qué moneda');
  });

  it('keeps the island free of nowrap so the copy wraps at 390px', async () => {
    useDynamicIslandStore.setState({ mode: 'receive', receiveAccountCount: 0 });
    page = mountPage(<DynamicIsland />);
    await typeOut();

    expect(island()?.className).not.toContain('whitespace-nowrap');
    expect(island()?.className).toContain('text-balance');
  });
});
