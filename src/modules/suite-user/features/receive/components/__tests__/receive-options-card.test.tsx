/* @vitest-environment jsdom */

import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import type { ReceiveOption } from '../../lib/receive-options';
import { ReceiveOptionsCard } from '../receive-options-card';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: { success: (m: string) => toastSuccess(m), error: (m: string) => toastError(m) },
}));

let customerType: 'individual' | 'business' = 'business';
vi.mock('@/shared/hooks/useKYC', () => ({
  useKYC: () => ({ customerType }),
}));

const mutate = vi.fn();
let optionsState: { data: ReceiveOption[] | undefined; isLoading: boolean; error: unknown } = {
  data: [],
  isLoading: false,
  error: null,
};
let mutationState = { isPending: false, variables: undefined as unknown };

vi.mock('../../hooks/use-receive-options', () => ({
  useReceiveOptions: () => optionsState,
  useRequestVirtualAccount: () => ({ mutate, ...mutationState }),
}));

const option = (over: Partial<ReceiveOption>): ReceiveOption => ({
  country: 'US',
  currency: 'USD',
  railCode: 'ach',
  railName: 'ACH (US)',
  provider: 'mesta',
  providers: ['mesta'],
  status: 'available',
  blockers: [],
  ...over,
});

let page: MountedPage;

beforeEach(() => {
  mutate.mockReset();
  toastSuccess.mockReset();
  toastError.mockReset();
  mutationState = { isPending: false, variables: undefined };
  optionsState = { data: [], isLoading: false, error: null };
  customerType = 'business';
});

afterEach(() => {
  page.unmount();
});

describe('ReceiveOptionsCard', () => {
  it('groups options by country with a status chip each', () => {
    optionsState.data = [
      option({}),
      option({
        country: 'BR',
        currency: 'BRL',
        railCode: 'pix',
        railName: 'PIX',
        status: 'active',
      }),
      option({
        country: 'DE',
        currency: 'EUR',
        railCode: 'sepa',
        railName: 'SEPA',
        status: 'requested',
      }),
      option({
        country: 'MX',
        currency: 'MXN',
        railCode: 'spei',
        railName: 'SPEI',
        status: 'rejected',
        reason: 'Sin documentos',
      }),
    ];
    page = mountPage(<ReceiveOptionsCard />);

    const text = page.text();
    expect(text).toContain('Brasil');
    expect(text).toContain('Estados Unidos');
    expect(text).toContain('Activa');
    expect(text).toContain('En proceso');
    expect(text).toContain('Disponible');
    expect(text).toContain('No aprobada');
    expect(page.container.querySelector('[data-status="rejected"]')?.getAttribute('title')).toBe(
      'Sin documentos'
    );
  });

  it('offers "Solicitar cuenta" only on available options', () => {
    optionsState.data = [
      option({}),
      option({ railCode: 'wire', railName: 'Wire', status: 'active' }),
    ];
    page = mountPage(<ReceiveOptionsCard />);
    const buttons = Array.from(page.container.querySelectorAll('button')).filter(
      (b) => b.textContent === 'Solicitar cuenta'
    );
    expect(buttons).toHaveLength(1);
  });

  it('requests the account with country, currency and rail code', () => {
    optionsState.data = [option({})];
    page = mountPage(<ReceiveOptionsCard />);
    page.click(page.findByText('button', 'Solicitar cuenta'));
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toEqual({ country: 'US', currency: 'USD', railCode: 'ach' });
  });

  it('confirms a new request with a toast, and says so when it already existed', () => {
    optionsState.data = [option({})];
    page = mountPage(<ReceiveOptionsCard />);
    page.click(page.findByText('button', 'Solicitar cuenta'));

    act(() =>
      mutate.mock.calls[0][1].onSuccess({ created: true, request: option({ status: 'requested' }) })
    );
    expect(toastSuccess).toHaveBeenLastCalledWith(expect.stringContaining('Pedimos tu cuenta'));

    act(() =>
      mutate.mock.calls[0][1].onSuccess({
        created: false,
        request: option({ status: 'requested' }),
      })
    );
    expect(toastSuccess).toHaveBeenLastCalledWith(expect.stringContaining('Ya la habías pedido'));
  });

  it('maps a request failure to a human toast', () => {
    optionsState.data = [option({})];
    page = mountPage(<ReceiveOptionsCard />);
    page.click(page.findByText('button', 'Solicitar cuenta'));
    act(() => mutate.mock.calls[0][1].onError({ extensions: { code: 'UNAUTHENTICATED' } }));
    expect(toastError).toHaveBeenCalledWith(expect.stringContaining('sesión'));
  });

  it('shows the blockers of a requested option', () => {
    optionsState.data = [
      option({
        status: 'requested',
        blockers: [
          { code: 'KYB_PENDING', category: 'compliance', message: 'Falta verificar tu empresa' },
        ],
      }),
    ];
    page = mountPage(<ReceiveOptionsCard />);
    expect(page.text()).toContain('Falta verificar tu empresa');
  });

  it('disables the button of the option being requested', () => {
    optionsState.data = [option({})];
    mutationState = {
      isPending: true,
      variables: { country: 'US', currency: 'USD', railCode: 'ach' },
    };
    page = mountPage(<ReceiveOptionsCard />);
    const button = Array.from(page.container.querySelectorAll('button')).find((b) =>
      b.hasAttribute('data-request')
    );
    expect(button?.disabled).toBe(true);
  });

  it('shows a skeleton while loading', () => {
    optionsState = { data: undefined, isLoading: true, error: null };
    page = mountPage(<ReceiveOptionsCard />);
    expect(page.container.querySelector('[data-testid="receive-options-loading"]')).not.toBeNull();
  });

  it('shows an error state on failure', () => {
    optionsState = { data: undefined, isLoading: false, error: new Error('boom') };
    page = mountPage(<ReceiveOptionsCard />);
    expect(page.text()).toContain('No pudimos cargar');
  });

  it('shows an empty state when there are no options', () => {
    optionsState = { data: [], isLoading: false, error: null };
    page = mountPage(<ReceiveOptionsCard />);
    expect(page.text()).toContain('Todavía no hay países');
  });

  describe('S7 — virtual accounts are for businesses', () => {
    const REASON =
      'Las cuentas virtuales están disponibles solo para empresas, incluidas las empresas unipersonales.';

    it('offers the request CTA to business customers', () => {
      customerType = 'business';
      optionsState.data = [option({})];
      page = mountPage(<ReceiveOptionsCard />);
      expect(page.findByText('button', 'Solicitar cuenta')).toBeTruthy();
      expect(page.text()).not.toContain(REASON);
    });

    it('shows individuals the reason and no request CTA', () => {
      customerType = 'individual';
      optionsState.data = [option({}), option({ railCode: 'wire', railName: 'Wire' })];
      page = mountPage(<ReceiveOptionsCard />);
      expect(page.text()).toContain(REASON);
      expect(page.text()).toContain('No disponible');
      expect(page.container.querySelector('[data-request]')).toBeNull();
    });

    it('still lists the accounts an individual already has', () => {
      customerType = 'individual';
      optionsState.data = [option({ status: 'active' })];
      page = mountPage(<ReceiveOptionsCard />);
      expect(page.text()).toContain('Activa');
    });

    it('honours the backend eligibility flags over the profile guess', () => {
      customerType = 'business';
      optionsState.data = [
        option({ eligible: false, ineligibleReason: 'Falta verificar tu empresa (KYB).' }),
        option({ railCode: 'wire', railName: 'Wire', eligible: true }),
      ];
      page = mountPage(<ReceiveOptionsCard />);
      expect(page.text()).toContain('Falta verificar tu empresa (KYB).');
      expect(page.container.querySelectorAll('[data-request]')).toHaveLength(1);
    });

    it('turns a VA_BUSINESS_ONLY rejection into the friendly explanation', () => {
      optionsState.data = [option({})];
      page = mountPage(<ReceiveOptionsCard />);
      page.click(page.findByText('button', 'Solicitar cuenta'));
      act(() =>
        mutate.mock.calls[0][1].onError({
          response: { errors: [{ extensions: { error_code: 'VA_BUSINESS_ONLY' } }] },
        })
      );
      expect(toastError).toHaveBeenCalledWith(REASON);
    });
  });

  describe('S8 — Colombia, Peru and Ecuador rails are in maintenance', () => {
    it('shows them as "En mantenimiento" with no request CTA', () => {
      optionsState.data = [
        option({ country: 'CO', currency: 'COP', railCode: 'co_breb', railName: 'Bre-B' }),
        option({
          country: 'EC',
          currency: 'USD',
          railCode: 'ec_bank_transfer',
          railName: 'Transferencia',
        }),
        option({
          country: 'EC',
          currency: 'USD',
          railCode: 'ec_point_of_sale',
          railName: 'Punto de pago',
        }),
        option({
          country: 'PE',
          currency: 'PEN',
          railCode: 'pe_bank_transfer',
          railName: 'Transferencia PE',
        }),
        option({}),
      ];
      page = mountPage(<ReceiveOptionsCard />);
      expect(page.container.querySelectorAll('[data-status="maintenance"]')).toHaveLength(4);
      expect(page.container.querySelectorAll('[data-request]')).toHaveLength(1);
    });

    it('turns a RAIL_UNDER_MAINTENANCE rejection into a friendly toast', () => {
      optionsState.data = [option({})];
      page = mountPage(<ReceiveOptionsCard />);
      page.click(page.findByText('button', 'Solicitar cuenta'));
      act(() =>
        mutate.mock.calls[0][1].onError({
          response: { errors: [{ extensions: { error_code: 'RAIL_UNDER_MAINTENANCE' } }] },
        })
      );
      expect(toastError).toHaveBeenCalledWith(expect.stringContaining('mantenimiento'));
    });
  });
});
