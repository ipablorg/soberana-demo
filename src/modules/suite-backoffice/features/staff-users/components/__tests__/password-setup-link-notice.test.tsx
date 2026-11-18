/* @vitest-environment jsdom */

import { describe, expect, it, vi } from 'vitest';

import { mountPage } from '@/test/dom-render';

import { PasswordSetupLinkNotice } from '../password-setup-link-notice';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));

describe('PasswordSetupLinkNotice', () => {
  it('shows the one-time link, a copy button and the send-it instruction', () => {
    const page = mountPage(
      <PasswordSetupLinkNotice
        email="ana@loopay.com"
        link="https://example.test/setup?x=1"
        onClose={() => undefined}
      />
    );

    expect(document.body.textContent).toContain('https://example.test/setup?x=1');
    expect(document.body.textContent).toContain('ana@loopay.com');
    expect(document.body.textContent).toContain('Copiar enlace');
    expect(document.body.textContent).toContain('no se volverá a mostrar');
    page.unmount();
  });

  it('explains that no link was generated for an existing Firebase user', () => {
    const page = mountPage(
      <PasswordSetupLinkNotice email="ana@loopay.com" link={null} onClose={() => undefined} />
    );

    expect(document.body.textContent).toContain('ya tenía acceso');
    expect(document.body.textContent).not.toContain('Copiar enlace');
    page.unmount();
  });
});

describe('PasswordSetupLinkNotice — language', () => {
  it('shows and copies the link with the Spanish action page', () => {
    const page = mountPage(
      <PasswordSetupLinkNotice
        email="ana@loopay.com"
        link="https://example.test/__/auth/action?mode=resetPassword&oobCode=abc&lang=en"
        onClose={() => undefined}
      />
    );

    const shown = document.querySelector('[data-testid="password-setup-link"]')?.textContent ?? '';
    expect(shown).toContain('lang=es');
    expect(shown).not.toContain('lang=en');
    page.unmount();
  });
});
