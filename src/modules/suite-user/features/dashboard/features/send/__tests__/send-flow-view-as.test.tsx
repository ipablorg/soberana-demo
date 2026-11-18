/* @vitest-environment jsdom */

/**
 * View-as-customer mode (Loopay2/SOBERANA#415): the dashboard send flow is
 * read-only. The flow says so up front and every "new beneficiary" entry is
 * disabled, since the back refuses the write with VIEW_AS_READ_ONLY.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import type { BeneficiaryResponse } from '@/shared/lib/beneficiaries-api';

import { useDynamicIslandStore } from '../../../stores/useDynamicIslandStore';
import { SendFlow } from '../send-flow';

const { viewAs, flow } = vi.hoisted(() => ({
  viewAs: { customerId: null as string | null },
  flow: { beneficiaries: [] as unknown[] },
}));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@/shared/stores/view-as-store', () => ({
  selectIsViewingAs: (state: { customerId: string | null }) => state.customerId !== null,
  useViewAsStore: <T,>(selector: (state: { customerId: string | null }) => T) => selector(viewAs),
}));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));
vi.mock('../hooks/use-send-flow', () => ({
  useSendFlow: () => ({
    beneficiaries: flow.beneficiaries,
    wallet: { id: 'wallet-1', currency: 'USDT', chain: 'tron' },
    secondaryWallets: [],
    availableBalance: '100',
    isLoading: false,
    error: null,
  }),
}));
vi.mock('../beneficiary-selector', () => ({ BeneficiarySelector: () => <div /> }));
vi.mock('../amount-input', () => ({ AmountInput: () => <div /> }));
vi.mock('../review-panel', () => ({ ReviewPanel: () => <div /> }));
vi.mock('../success-panel', () => ({ SuccessPanel: () => <div /> }));
vi.mock('@/modules/suite-user/features/beneficiaries/components/CreateBeneficiaryForm', () => ({
  CreateBeneficiaryForm: () => <div />,
}));

const SEND_READ_ONLY =
  'Solo lectura: estás viendo la app como este cliente, no puedes enviar dinero.';
const BENEFICIARY_READ_ONLY =
  'Solo lectura: estás viendo la app como este cliente, no puedes agregar beneficiarios.';

const saved = {
  id: 'benef-1',
  beneficiary_name: 'Ana',
  currency: 'MXN',
} as unknown as BeneficiaryResponse;

let page: MountedPage | null = null;

function renderFlow(beneficiaries: BeneficiaryResponse[]): MountedPage {
  flow.beneficiaries = beneficiaries;
  useDynamicIslandStore.setState({ sendStep: 'select-beneficiary', sendFilterCurrency: null });
  page = mountPage(<SendFlow />);
  return page;
}

afterEach(() => {
  page?.unmount();
  page = null;
  viewAs.customerId = null;
});

describe('SendFlow in view-as mode', () => {
  it('explains the read-only mode and disables "Añadir" while viewing as a customer', () => {
    viewAs.customerId = 'cust-1';
    const { text, findByText } = renderFlow([saved]);

    expect(text()).toContain(SEND_READ_ONLY);
    expect(text()).toContain(BENEFICIARY_READ_ONLY);
    expect(findByText<HTMLButtonElement>('button', 'Añadir').disabled).toBe(true);
    expect(useDynamicIslandStore.getState().sendStep).toBe('select-beneficiary');
  });

  it('disables "Crear beneficiario" in the empty state while viewing as a customer', () => {
    viewAs.customerId = 'cust-1';
    const { findByText } = renderFlow([]);

    expect(findByText<HTMLButtonElement>('button', 'Crear beneficiario').disabled).toBe(true);
  });

  it('keeps the new-beneficiary entry enabled and shows no read-only note outside view-as', () => {
    const { text, findByText, click } = renderFlow([saved]);

    expect(text()).not.toContain(SEND_READ_ONLY);
    expect(text()).not.toContain(BENEFICIARY_READ_ONLY);
    const add = findByText<HTMLButtonElement>('button', 'Añadir');
    expect(add.disabled).toBe(false);
    click(add);
    expect(useDynamicIslandStore.getState().sendStep).toBe('create-beneficiary');
  });
});
