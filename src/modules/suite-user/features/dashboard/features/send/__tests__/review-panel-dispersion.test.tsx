/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReviewPanel } from '../review-panel';
import type { BeneficiaryResponse } from '@/shared/lib/beneficiaries-api';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const { mutateAsyncMock } = vi.hoisted(() => ({
  mutateAsyncMock: vi.fn(),
}));

vi.mock('@/shared/hooks/use-create-dispersion', () => ({
  useCreateDispersion: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
    reset: vi.fn(),
  }),
}));

vi.mock('@/shared/hooks/use-quotes', () => ({
  useQuoteRate: () => ({ quote: null }),
}));

vi.mock('@/shared/hooks/use-indicative-rate', () => ({
  useIndicativeRate: () => ({ rate: null }),
}));

vi.mock('@/shared/lib/loopayx-send-rails', () => ({
  isLoopayXNoQuoteOutboundRail: () => false,
}));

vi.mock('@/shared/lib/loopayx-reference-only', () => ({
  getLoopayXReferenceOnlyDisplay: () => null,
}));

vi.mock('@/shared/components/animated-icons', () => ({
  AlertCircle: () => <svg data-icon="alert" />,
  ArrowLeft: () => <svg data-icon="arrow-left" />,
  Loader2: () => <svg data-icon="loader" />,
  Send: () => <svg data-icon="send" />,
}));

vi.mock('@lingui/react', () => {
  const translate = (
    message: TemplateStringsArray | string | { message?: unknown; id?: unknown },
    ...values: unknown[]
  ) => {
    if (message && typeof message === 'object' && 'message' in message) {
      return String(message.message ?? message.id ?? '');
    }
    if (typeof message === 'string') {
      return message;
    }
    if (!Array.isArray(message)) {
      return String(message ?? '');
    }
    return message.reduce(
      (result, chunk, index) => result + chunk + String(values[index] ?? ''),
      '',
    );
  };

  return {
    useLingui: () => ({ t: translate, _: translate }),
    Trans: ({
      children,
      message,
      id,
    }: {
      children?: ReactNode;
      message?: string;
      id?: string;
    }) => children ?? message ?? id,
    I18nProvider: ({ children }: { children?: ReactNode }) => children,
  };
});

const beneficiary = {
  id: 'benef-1',
  customer_id: 'cust-1',
  beneficiary_name: 'María Pérez',
  currency: 'COP',
  payment_rail: 'co_ach',
  verification_status: 'VERIFIED',
} as unknown as BeneficiaryResponse;

const mountedRoots: { container: HTMLDivElement; root: Root }[] = [];

async function render(ui: ReactNode) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(ui);
  });
  mountedRoots.push({ container, root });
  return { container, root };
}

function findButtonByText(container: HTMLElement, text: string): HTMLButtonElement | undefined {
  return [...container.querySelectorAll('button')].find((b) =>
    (b.textContent ?? '').includes(text),
  );
}

afterEach(async () => {
  while (mountedRoots.length > 0) {
    const mounted = mountedRoots.pop();
    if (!mounted) continue;
    await act(async () => {
      mounted.root.unmount();
    });
    mounted.container.remove();
  }
  mutateAsyncMock.mockReset();
});

describe('ReviewPanel dispersion submission', () => {
  it('submits a source-denominated dispersion payload to transactions_createDispersion', async () => {
    mutateAsyncMock.mockResolvedValue({
      transactions_createDispersion: {
        transaction_id: 'tx-disp-1',
        status: 'PENDING',
        message: 'created',
      },
    });

    const onSuccess = vi.fn();
    const onError = vi.fn();
    const { container } = await render(
      <ReviewPanel
        beneficiary={beneficiary}
        amount="25.5"
        walletId="wallet-1"
        walletCurrency="USDT"
        stablecoinLabel="USDT"
        onBack={vi.fn()}
        onSubmitStart={vi.fn()}
        onSuccess={onSuccess}
        onError={onError}
      />,
    );

    const confirm = findButtonByText(container, 'Enviar ahora');
    expect(confirm).toBeDefined();

    await act(async () => {
      confirm?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // The dispersion v2 contract: amount + currency are the WALLET's
    // (source-denominated), never the beneficiary's destination
    // currency — the payout is decided by operations later.
    expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
    expect(mutateAsyncMock).toHaveBeenCalledWith({
      input: {
        wallet_id: 'wallet-1',
        beneficiary_id: 'benef-1',
        currency: 'USDT',
        amount: '25.5',
        client_reference_id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      },
    });

    expect(onSuccess).toHaveBeenCalledWith('tx-disp-1', 'PENDING');
    expect(onError).not.toHaveBeenCalled();
  });

  it('maps failures through mapError and reports the message', async () => {
    mutateAsyncMock.mockRejectedValue(new Error('INSUFFICIENT_FUNDS'));

    const onSuccess = vi.fn();
    const onError = vi.fn();
    const { container } = await render(
      <ReviewPanel
        beneficiary={beneficiary}
        amount="100"
        walletId="wallet-1"
        walletCurrency="USDT"
        onBack={vi.fn()}
        onSubmitStart={vi.fn()}
        onSuccess={onSuccess}
        onError={onError}
      />,
    );

    const confirm = findButtonByText(container, 'Enviar ahora');
    await act(async () => {
      confirm?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(typeof onError.mock.calls[0]?.[0]).toBe('string');
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
  });

  async function mountAndGetConfirm(amount: string) {
    const utils = await render(
      <ReviewPanel
        beneficiary={beneficiary}
        amount={amount}
        walletId="wallet-1"
        walletCurrency="USDT"
        onBack={vi.fn()}
        onSubmitStart={vi.fn()}
        onSuccess={vi.fn()}
        onError={vi.fn()}
      />,
    );
    return utils;
  }

  async function clickConfirm(container: HTMLElement) {
    const confirm = findButtonByText(container, 'Enviar ahora');
    await act(async () => {
      confirm?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  }

  const keyOf = (call: number) =>
    mutateAsyncMock.mock.calls[call]?.[0]?.input?.client_reference_id as string;

  it('reuses the same client_reference_id when the user retries after a failure', async () => {
    mutateAsyncMock
      .mockRejectedValueOnce(new Error('PROVIDER_OUTCOME_UNKNOWN'))
      .mockRejectedValueOnce(new Error('Network request failed'));
    const { container } = await mountAndGetConfirm('10');

    await clickConfirm(container);
    await clickConfirm(container);

    expect(mutateAsyncMock).toHaveBeenCalledTimes(2);
    expect(keyOf(0)).toBeTruthy();
    expect(keyOf(1)).toBe(keyOf(0));
  });

  it('regenerates the key after IDEMPOTENCY_KEY_REUSED and shows a mapped message', async () => {
    mutateAsyncMock
      .mockRejectedValueOnce({
        message: 'conflict',
        response: { errors: [{ message: 'conflict', extensions: { code: 'IDEMPOTENCY_KEY_REUSED' } }] },
      })
      .mockRejectedValueOnce(new Error('boom'));
    const { container } = await mountAndGetConfirm('10');

    await clickConfirm(container);
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    await clickConfirm(container);

    expect(keyOf(1)).not.toBe(keyOf(0));
  });

  it('uses a new key after a success', async () => {
    mutateAsyncMock.mockResolvedValue({
      transactions_createDispersion: { transaction_id: 't', status: 'PENDING', message: 'm' },
    });
    const { container } = await mountAndGetConfirm('10');
    await clickConfirm(container);
    await clickConfirm(container);
    expect(keyOf(1)).not.toBe(keyOf(0));
  });
});
