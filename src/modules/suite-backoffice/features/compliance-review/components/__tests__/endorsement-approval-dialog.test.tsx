/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import { EndorsementApprovalDialog } from '../endorsement-approval-dialog';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));

const ENDORSEMENT = {
  id: 'e-1',
  customer_email: 'ana@example.com',
  rail_name: 'ACH',
  rail_code: 'ach',
} as never;

let page: MountedPage | null = null;
afterEach(() => {
  page?.unmount();
  page = null;
  document.body.innerHTML = '';
});

describe('EndorsementApprovalDialog (#411: the provider comes from the client rail)', () => {
  it('offers no provider choice and approves without a provider code', () => {
    const onConfirm = vi.fn();
    page = mountPage(
      <EndorsementApprovalDialog
        endorsement={ENDORSEMENT}
        loading={false}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    expect(document.body.querySelector('#endorsement-provider')).toBeNull();
    expect(document.body.textContent).not.toContain('Proveedor de la cuenta virtual');
    expect(document.body.textContent).toContain(
      'El proveedor lo fija el riel habilitado del cliente'
    );

    const approve = Array.from(document.body.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Aprobar'
    );
    page.click(approve as Element);

    expect(onConfirm).toHaveBeenCalledWith();
  });
});
