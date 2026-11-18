/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminReceiveOption } from '@/graphql/types/admin-loopay';
import { mountPage, type MountedPage } from '@/test/dom-render';
import { RequestVirtualAccountDialog } from '../request-virtual-account-dialog';

const CUSTOMER_ID = '0b6d2f6e-7f1c-4c1e-9d4e-111111111111';

const mutateMock = vi.fn();
let optionsState: {
  data?: { adminLoopay_customerReceiveOptions: AdminReceiveOption[] };
  isLoading: boolean;
};

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));

vi.mock('../../hooks/use-customers', () => ({
  useCustomerReceiveOptions: () => optionsState,
  useRequestVirtualAccount: () => ({ mutate: mutateMock, isPending: false }),
}));

vi.mock('@/shared/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: ReactNode; open: boolean }) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

function option(overrides: Partial<AdminReceiveOption> = {}): AdminReceiveOption {
  return {
    country: 'US',
    currency: 'USD',
    railCode: 'ach',
    railName: 'ACH',
    provider: 'kirafin',
    providers: ['kirafin'],
    status: 'available',
    requestId: null,
    virtualAccountId: null,
    vaRequestState: null,
    blockers: [],
    reason: null,
    eligible: true,
    ineligibleReason: null,
    ...overrides,
  };
}

function setOptions(options: AdminReceiveOption[]) {
  optionsState = {
    data: { adminLoopay_customerReceiveOptions: options },
    isLoading: false,
  };
}

let mounted: MountedPage | null = null;

function mount(): MountedPage {
  mounted = mountPage(
    <RequestVirtualAccountDialog
      open
      onOpenChange={() => undefined}
      customerId={CUSTOMER_ID}
      customerLabel="Acme SAS"
    />
  );
  return mounted;
}

const requestButtons = () =>
  Array.from(document.body.querySelectorAll('button')).filter(
    (node) => (node.textContent ?? '').trim() === 'Solicitar'
  ) as HTMLButtonElement[];

describe('RequestVirtualAccountDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    optionsState = { data: undefined, isLoading: true };
  });

  afterEach(() => {
    mounted?.unmount();
    mounted = null;
  });

  it('requests the picked rail for the customer', () => {
    setOptions([option({ country: 'MX', currency: 'MXN', railCode: 'spei', railName: 'SPEI' })]);
    const page = mount();

    page.click(requestButtons()[0]);

    expect(mutateMock).toHaveBeenCalledWith({
      input: { customerId: CUSTOMER_ID, country: 'MX', currency: 'MXN', railCode: 'spei' },
    });
  });

  it('shows individuals "solo empresas" and no request action', () => {
    setOptions([option({ eligible: false, ineligibleReason: 'VA_BUSINESS_ONLY' })]);
    mount();

    expect(document.body.textContent).toContain('Solo empresas');
    expect(requestButtons()).toHaveLength(0);
  });

  it('shows maintenance rails without an action and keeps requested ones as status', () => {
    setOptions([
      option({
        railCode: 'wire',
        railName: 'Wire',
        eligible: false,
        ineligibleReason: 'RAIL_UNDER_MAINTENANCE',
      }),
      option({ railCode: 'sepa', railName: 'SEPA', status: 'requested' }),
    ]);
    mount();

    expect(document.body.textContent).toContain('Riel en mantenimiento');
    expect(document.body.textContent).toContain('Solicitada');
    expect(requestButtons()).toHaveLength(0);
  });

  it('shows a loading state while the options load', () => {
    mount();

    expect(document.body.textContent).toContain('Cargando');
  });
});
