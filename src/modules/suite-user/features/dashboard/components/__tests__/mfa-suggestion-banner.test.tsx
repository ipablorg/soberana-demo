/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MfaSuggestionBanner } from '../mfa-suggestion-banner';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const { hasEnrolledFactorsMock } = vi.hoisted(() => ({
  hasEnrolledFactorsMock: vi.fn(async () => false),
}));

// The Babel Lingui macro rewrites `@lingui/react/macro` imports into
// real `@lingui/react` imports at transform time, so both modules
// need mocks (same pattern as the verify-identity suites).
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
    // The compiled macro puts the source string in `id`/`message`,
    // not in children — fall back through all three.
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

vi.mock('@/shared/hooks/require-mfa-enrollment', () => ({
  hasEnrolledFactors: hasEnrolledFactorsMock,
}));

vi.mock('@/modules/common/auth/components/totp-enrollment-flow', () => ({
  TotpEnrollmentFlow: () => <div data-testid="totp-enrollment-flow" />,
}));

vi.mock('@/shared/components/animated-icons', () => ({
  ShieldCheck: () => <svg data-icon="shield-check" />,
  X: () => <svg data-icon="x" />,
}));

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

function textContent(container: HTMLElement): string {
  return container.textContent ?? '';
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
  window.localStorage.clear();
  hasEnrolledFactorsMock.mockReset();
  hasEnrolledFactorsMock.mockResolvedValue(false);
  vi.clearAllMocks();
});

describe('MfaSuggestionBanner', () => {
  it('renders the invitation for an unenrolled user that has not dismissed it', async () => {
    const { container } = await render(<MfaSuggestionBanner />);

    expect(textContent(container)).toContain('Protect your account with 2FA');
    expect(hasEnrolledFactorsMock).toHaveBeenCalledTimes(1);
  });

  it('does not render when already dismissed (no nagging on every visit)', async () => {
    window.localStorage.setItem('mfa_suggestion_dismissed', '1');
    const { container } = await render(<MfaSuggestionBanner />);

    expect(hasEnrolledFactorsMock).not.toHaveBeenCalled();
    expect(container.textContent).toBe('');
  });

  it('does not render when the user already has a second factor', async () => {
    hasEnrolledFactorsMock.mockResolvedValue(true);
    const { container } = await render(<MfaSuggestionBanner />);

    expect(container.textContent).toBe('');
  });

  it('persists dismissal when skipping the invitation', async () => {
    const { container } = await render(<MfaSuggestionBanner />);

    const skipButton = [...container.querySelectorAll('button')].find((b) =>
      (b.textContent ?? '').includes('Saltar por ahora'),
    );
    expect(skipButton).toBeDefined();

    await act(async () => {
      skipButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(window.localStorage.getItem('mfa_suggestion_dismissed')).toBe('1');
    expect(container.textContent).toBe('');
  });

  it('opens the inline enrollment flow on accept', async () => {
    const { container } = await render(<MfaSuggestionBanner />);

    const acceptButton = [...container.querySelectorAll('button')].find((b) =>
      (b.textContent ?? '').includes('Set up now'),
    );
    expect(acceptButton).toBeDefined();

    await act(async () => {
      acceptButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // AnimatePresence mode="wait" mounts the new frame only after the
    // invite's exit animation settles — let the jsdom rAF clock run.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });

    expect(container.querySelector('[data-testid="totp-enrollment-flow"]')).not.toBeNull();
  });
});
