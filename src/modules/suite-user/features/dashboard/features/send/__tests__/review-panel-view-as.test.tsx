/* @vitest-environment jsdom */

/**
 * View-as-customer mode (Loopay2/SOBERANA#415): the admin sees the dashboard
 * send flow read-only, so "Enviar ahora" is disabled and says why.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import type { BeneficiaryResponse } from '@/shared/lib/beneficiaries-api';

import { ReviewPanel } from '../review-panel';

const { mutateAsyncMock, viewAs } = vi.hoisted(() => ({
  mutateAsyncMock: vi.fn(),
  viewAs: { customerId: null as string | null },
}));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@/shared/stores/view-as-store', () => ({
  selectIsViewingAs: (state: { customerId: string | null }) => state.customerId !== null,
  useViewAsStore: <T,>(selector: (state: { customerId: string | null }) => T) => selector(viewAs),
}));
vi.mock('@/shared/hooks/use-create-dispersion', () => ({
  useCreateDispersion: () => ({ mutateAsync: mutateAsyncMock, isPending: false, reset: vi.fn() }),
}));
vi.mock('@/shared/hooks/use-quotes', () => ({ useQuoteRate: () => ({ quote: null }) }));
vi.mock('@/shared/hooks/use-indicative-rate', () => ({
  useIndicativeRate: () => ({ rate: null }),
}));
vi.mock('@/shared/lib/loopayx-send-rails', () => ({ isLoopayXNoQuoteOutboundRail: () => false }));
vi.mock('@/shared/lib/loopayx-reference-only', () => ({
  getLoopayXReferenceOnlyDisplay: () => null,
}));
vi.mock('@/shared/components/animated-icons', () => ({
  AlertCircle: () => <svg />,
  ArrowLeft: () => <svg />,
  Loader2: () => <svg />,
  Send: () => <svg />,
}));

const SEND_READ_ONLY =
  'Solo lectura: estás viendo la app como este cliente, no puedes enviar dinero.';

const beneficiary = {
  id: 'benef-1',
  customer_id: 'cust-1',
  beneficiary_name: 'María Pérez',
  currency: 'COP',
  payment_rail: 'co_ach',
  verification_status: 'VERIFIED',
} as unknown as BeneficiaryResponse;

let page: MountedPage | null = null;

function renderPanel(): MountedPage {
  page = mountPage(
    <ReviewPanel
      beneficiary={beneficiary}
      amount="25"
      walletId="wallet-1"
      walletCurrency="USDT"
      onBack={vi.fn()}
      onSubmitStart={vi.fn()}
      onSuccess={vi.fn()}
      onError={vi.fn()}
    />
  );
  return page;
}

afterEach(() => {
  page?.unmount();
  page = null;
  viewAs.customerId = null;
  mutateAsyncMock.mockReset();
});

describe('ReviewPanel in view-as mode', () => {
  it('disables "Enviar ahora" and explains the read-only mode while viewing as a customer', () => {
    viewAs.customerId = 'cust-1';
    const { container, findByText, click } = renderPanel();

    const confirm = findByText<HTMLButtonElement>('button', 'Enviar ahora');
    expect(confirm.disabled).toBe(true);

    const describedBy = confirm.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(container.querySelector(`#${describedBy}`)?.textContent).toBe(SEND_READ_ONLY);

    click(confirm);
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it('keeps "Enviar ahora" enabled and shows no read-only note outside view-as', () => {
    const { text, findByText } = renderPanel();

    const confirm = findByText<HTMLButtonElement>('button', 'Enviar ahora');
    expect(confirm.disabled).toBe(false);
    expect(confirm.getAttribute('aria-describedby')).toBeNull();
    expect(text()).not.toContain(SEND_READ_ONLY);
  });
});
