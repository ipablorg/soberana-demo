// @vitest-environment jsdom

/**
 * SessionRecoveryScreen — the non-destructive screen shown when the server could
 * not confirm a restored session (connection problem, or the session expired).
 * It must explain both possibilities and give the user two explicit, accessible
 * choices; it never decides to sign anyone out itself.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

import { mountPage, type MountedPage } from '@/test/dom-render';
import { SessionRecoveryScreen } from '../session-recovery-screen';

let page: MountedPage | null = null;

function mount(props: Partial<React.ComponentProps<typeof SessionRecoveryScreen>> = {}) {
  const onRetry = vi.fn();
  const onLogin = vi.fn();
  page = mountPage(
    <SessionRecoveryScreen retrying={false} onRetry={onRetry} onLogin={onLogin} {...props} />,
  );
  return { onRetry, onLogin };
}

function button(label: string): HTMLButtonElement {
  return page!.findByText<HTMLButtonElement>('button', label);
}

afterEach(() => {
  page?.unmount();
  page = null;
});

describe('SessionRecoveryScreen', () => {
  it('explains that the session could not be confirmed and what the user can do', () => {
    mount();

    expect(page?.text()).toContain('No pudimos confirmar tu sesión');
    expect(page?.text()).toContain(
      'Puede ser un problema de conexión o que tu sesión haya vencido. Intenta nuevamente o vuelve a ingresar.',
    );
  });

  it('no longer claims the session is being recovered or that it is merely slow', () => {
    mount();

    expect(page?.text()).not.toContain('Estamos recuperando tu sesión');
    expect(page?.text()).not.toContain('Está tardando más de lo normal');
  });

  it('exposes two accessible buttons: retry and go back to login', () => {
    mount();

    const retry = button('Intentar nuevamente');
    const login = button('Volver a ingresar');

    expect(retry.type).toBe('button');
    expect(login.type).toBe('button');
    expect(retry.disabled).toBe(false);
    expect(login.disabled).toBe(false);
  });

  it('announces itself politely to assistive technology without stealing focus', () => {
    mount();

    const region = page?.container.querySelector('[role="status"]');

    expect(region).not.toBeNull();
    expect(region?.getAttribute('aria-live')).toBe('polite');
    expect(region?.textContent).toContain('No pudimos confirmar tu sesión');
  });

  it('calls onRetry when the user clicks Intentar nuevamente, and nothing else', () => {
    const { onRetry, onLogin } = mount();

    page?.click(button('Intentar nuevamente'));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('calls onLogin only when the user explicitly chooses to go back to login', () => {
    const { onRetry, onLogin } = mount();

    page?.click(button('Volver a ingresar'));

    expect(onLogin).toHaveBeenCalledTimes(1);
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('disables and marks Intentar nuevamente busy while retrying, but keeps the login choice available', () => {
    const { onRetry } = mount({ retrying: true });

    const retry = button('Intentar nuevamente');
    page?.click(retry);

    expect(retry.disabled).toBe(true);
    expect(retry.getAttribute('aria-busy')).toBe('true');
    expect(onRetry).not.toHaveBeenCalled();
    expect(button('Volver a ingresar').disabled).toBe(false);
  });

  it('is not marked busy when idle', () => {
    mount();

    expect(button('Intentar nuevamente').getAttribute('aria-busy')).not.toBe('true');
  });
});
