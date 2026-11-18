/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SuccessPanel } from '../success-panel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/shared/components/animated-icons', () => ({
  Check: () => <svg data-icon="check" />,
  CheckCircle: () => <svg data-icon="check-circle" />,
  Clock: () => <svg data-icon="clock" />,
  Copy: () => <svg data-icon="copy" />,
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

afterEach(async () => {
  while (mountedRoots.length > 0) {
    const mounted = mountedRoots.pop();
    if (!mounted) continue;
    await act(async () => {
      mounted.root.unmount();
    });
    mounted.container.remove();
  }
});

describe('SuccessPanel dispersion honesty', () => {
  it('reports the PENDING dispersion as in process, with no fake completion', async () => {
    const { container } = await render(
      <SuccessPanel
        transactionId="tx-disp-9"
        status="PENDING"
        onSendAnother={vi.fn()}
      />,
    );

    const text = container.textContent ?? '';
    expect(text).toContain('En proceso.');
    expect(text).toContain(
      'El equipo de operaciones está procesando tu dispersión.',
    );
    expect(text).toContain('tx-disp-9');
    // No settled claim while operations has not completed the payout.
    expect(text).not.toContain('Tu envío está en camino.');
  });

  it('defaults to the in-process frame when the status is unknown', async () => {
    const { container } = await render(
      <SuccessPanel transactionId="tx-disp-10" onSendAnother={vi.fn()} />,
    );

    expect(container.textContent).toContain('En proceso.');
  });

  it('only renders the settled frame for a COMPLETED status', async () => {
    const { container } = await render(
      <SuccessPanel
        transactionId="tx-disp-11"
        status="COMPLETED"
        onSendAnother={vi.fn()}
      />,
    );

    const text = container.textContent ?? '';
    expect(text).toContain('Listo.');
    expect(text).toContain('Tu envío está en camino.');
    expect(text).not.toContain('En proceso.');
  });
});
