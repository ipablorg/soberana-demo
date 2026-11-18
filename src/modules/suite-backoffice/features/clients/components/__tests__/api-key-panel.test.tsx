/* @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { ApiKeyPanel } from '../api-key-panel';

const regenerateMutate = vi.fn();
let onCompleted: ((r: unknown) => void) | undefined;

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));
vi.mock('../../hooks/use-clients', () => ({
  useRegenerateClientApiKey: (cb: (r: unknown) => void) => {
    onCompleted = cb;
    return { mutate: regenerateMutate, isPending: false };
  },
}));

const bodyText = () => (document.body.textContent ?? '').replace(/\s+/g, ' ');
const button = (label: string) =>
  Array.from(document.body.querySelectorAll('button')).find(
    (b) => (b.textContent ?? '').trim() === label
  ) as HTMLButtonElement;

describe('ApiKeyPanel', () => {
  let page: MountedPage;

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    page = mountPage(<ApiKeyPanel clientId="c1" prefix="sob_3f7a9b2c1e4d" />);
  });

  it('asks for confirmation before regenerating and explains the old key stops working', () => {
    page.click(button('Regenerar'));

    expect(regenerateMutate).not.toHaveBeenCalled();
    expect(bodyText()).toContain('dejará de funcionar');
    expect(bodyText()).toContain('60 minutos');

    page.click(button('Sí, regenerar'));
    expect(regenerateMutate).toHaveBeenCalledWith({ clientId: 'c1' });
    page.unmount();
  });

  it('does not regenerate when the confirmation is cancelled', () => {
    page.click(button('Regenerar'));
    page.click(button('Cancelar'));
    expect(regenerateMutate).not.toHaveBeenCalled();
    page.unmount();
  });

  it('shows the new key once with a copy action', () => {
    page.flush(() =>
      onCompleted?.({
        adminLoopay_regenerateClientApiKey: {
          api_key: 'soberana_abc123',
          api_key_prefix: 'sob_aaaa',
        },
      })
    );
    expect(bodyText()).toContain('soberana_abc123');
    expect(button('Copiar')).toBeTruthy();
    page.unmount();
  });

  it('explains that the identifier is not the start of the key', () => {
    expect(page.text()).toContain('sob_3f7a9b2c1e4d');
    expect(page.text()).toContain('soberana_');
    page.unmount();
  });
});

describe('ApiKeyPanel issued key (#411)', () => {
  it('offers "Generar" for a fresh client: its creation prefix was never handed out', () => {
    document.body.innerHTML = '';
    const page = mountPage(
      <ApiKeyPanel clientId="c1" prefix="sob_3f7a9b2c1e4d" rotatedAt={null} />
    );

    expect(button('Generar')).toBeDefined();
    expect(button('Regenerar')).toBeUndefined();
    page.unmount();
  });

  it('offers "Regenerar" once a key was issued', () => {
    document.body.innerHTML = '';
    const page = mountPage(
      <ApiKeyPanel clientId="c1" prefix="sob_3f7a9b2c1e4d" rotatedAt="2026-10-01T12:00:00Z" />
    );

    expect(button('Regenerar')).toBeDefined();
    page.unmount();
  });
});
