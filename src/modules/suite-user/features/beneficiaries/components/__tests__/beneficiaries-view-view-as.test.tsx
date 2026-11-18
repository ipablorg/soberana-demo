/* @vitest-environment jsdom */

/**
 * View-as-customer mode (Loopay2/SOBERANA#415): the beneficiaries page is
 * read-only, so "Agregar beneficiario" is disabled and says why.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import { BeneficiariesView } from '../BeneficiariesView';

const { viewAs, list } = vi.hoisted(() => ({
  viewAs: { customerId: null as string | null },
  list: { beneficiaries: [] as unknown[] },
}));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@/shared/stores/view-as-store', () => ({
  selectIsViewingAs: (state: { customerId: string | null }) => state.customerId !== null,
  useViewAsStore: <T,>(selector: (state: { customerId: string | null }) => T) => selector(viewAs),
}));
vi.mock('@/shared/hooks/use-beneficiaries', () => ({
  useBeneficiaries: () => ({ beneficiaries: list.beneficiaries, isLoading: false, error: null }),
  useDeleteBeneficiary: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../BeneficiaryDetailDialog', () => ({ BeneficiaryDetailDialog: () => null }));
vi.mock('../CreateBeneficiaryDialog', () => ({
  CreateBeneficiaryDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="create-dialog" /> : null,
}));
vi.mock('../DeleteBeneficiaryDialog', () => ({ DeleteBeneficiaryDialog: () => null }));

const BENEFICIARY_READ_ONLY =
  'Solo lectura: estás viendo la app como este cliente, no puedes agregar beneficiarios.';

let page: MountedPage | null = null;

function addButtons(container: HTMLElement): HTMLButtonElement[] {
  return [...container.querySelectorAll('button')].filter(
    (button) => (button.textContent ?? '').trim() === 'Agregar beneficiario'
  );
}

afterEach(() => {
  page?.unmount();
  page = null;
  viewAs.customerId = null;
});

describe('BeneficiariesView in view-as mode', () => {
  it('disables every "Agregar beneficiario" entry and explains why while viewing as a customer', () => {
    viewAs.customerId = 'cust-1';
    page = mountPage(<BeneficiariesView />);

    const buttons = addButtons(page.container);
    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      expect(button.disabled).toBe(true);
      const describedBy = button.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(page.container.querySelector(`#${describedBy}`)?.textContent).toBe(
        BENEFICIARY_READ_ONLY
      );
    }
    page.click(buttons[0]);
    expect(page.container.querySelector('[data-testid="create-dialog"]')).toBeNull();
  });

  it('keeps "Agregar beneficiario" enabled and shows no read-only note outside view-as', () => {
    page = mountPage(<BeneficiariesView />);

    const [button] = addButtons(page.container);
    expect(button.disabled).toBe(false);
    expect(page.text()).not.toContain(BENEFICIARY_READ_ONLY);
    page.click(button);
    expect(page.container.querySelector('[data-testid="create-dialog"]')).not.toBeNull();
  });
});
