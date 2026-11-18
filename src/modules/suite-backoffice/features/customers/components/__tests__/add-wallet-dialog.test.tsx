/* @vitest-environment jsdom */

import { useState, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminListedProvider as AdminProvider } from '@/graphql/queries/admin-loopay/platform-config.queries';
import type { AdminWalletResponse } from '@/graphql/types/admin-loopay';
import { changeValue, submitForm } from '@/test/dom-input';
import { mountPage, type MountedPage } from '@/test/dom-render';
import {
  AUTO_PROVIDER_CHOICE,
  CUSTOM_CHAIN_CHOICE,
  DEFAULT_CHAIN_CHOICE,
} from '../../lib/add-wallet';
import { AddWalletDialog } from '../add-wallet-dialog';

interface SelectRegistration {
  value: string | undefined;
  onValueChange: (value: string) => void;
}

interface MutateOptions {
  onError?: (error: unknown) => void;
  onSettled?: () => void;
}

const CLIENT_ID = '5a0c1e93-2b7d-4f6a-8c3d-222222222222';
const CUSTOMER_ID = '0b6d2f6e-7f1c-4c1e-9d4e-111111111111';

const selects: Record<string, SelectRegistration> = {};
const mutateMock = vi.fn<(variables: unknown, options?: MutateOptions) => void>();
let hookState: { isPending: boolean; error: unknown };
let hookOnCompleted: ((wallet: AdminWalletResponse) => void) | undefined;
let walletProviders: AdminProvider[];

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('../../hooks/use-customers', () => ({
  useCreateCustomerWallet: (onCompleted?: (wallet: AdminWalletResponse) => void) => {
    hookOnCompleted = onCompleted;
    return {
      mutate: mutateMock,
      isPending: hookState.isPending,
      error: hookState.error,
    };
  },
  useWalletCapableProviders: () => ({
    data: { adminLoopay_listProviders: walletProviders },
  }),
}));

vi.mock('@/shared/components/ui/dialog', () => ({
  Dialog: ({
    children,
    open,
    onOpenChange,
  }: {
    children: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) =>
    open ? (
      <div role="dialog">
        <button type="button" data-testid="dialog-dismiss" onClick={() => onOpenChange(false)} />
        {children}
      </div>
    ) : null,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('@/shared/components/ui/select', async () => {
  const React = await import('react');
  const SelectContext = React.createContext<SelectRegistration | null>(null);

  return {
    Select: (props: SelectRegistration & { children: ReactNode }) => (
      <SelectContext.Provider value={props}>{props.children}</SelectContext.Provider>
    ),
    SelectTrigger: ({ id, children }: { id: string; children: ReactNode }) => {
      const context = React.useContext(SelectContext);
      if (context && id) selects[id] = context;
      return (
        <div id={id} data-select-value={context?.value ?? ''}>
          {children}
        </div>
      );
    },
    SelectValue: () => null,
    SelectContent: ({ children }: { children: ReactNode }) => (
      <div data-select-content>{children}</div>
    ),
    SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
      <div data-option={value}>{children}</div>
    ),
  };
});

function provider(overrides: Partial<AdminProvider> = {}): AdminProvider {
  return {
    id: 'provider-uuid-1',
    code: 'openfort',
    name: 'Openfort',
    type: 'WALLET',
    is_active: true,
    config: {
      wallet: { chains: ['base', 'polygon'], defaultChain: 'base', currency: 'USDC' },
    },
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function walletResponse(): AdminWalletResponse {
  return {
    id: 'wallet-1',
    customerId: CUSTOMER_ID,
    clientId: CLIENT_ID,
    providerId: 'provider-1',
    providerCode: 'openfort',
    currency: 'USDC',
    walletType: 'CUSTODIAL',
    chain: 'solana',
    address: null,
    alias: null,
    balance: 0,
    status: 'ACTIVE',
    alreadyExisted: false,
    virtualAccountIds: [],
    createdAt: '2026-07-09T12:30:00.000Z',
    createdBy: 'admin-1',
  };
}

function backendError(message: string) {
  return {
    message: `${message}: {"request":{"query":"mutation"}}`,
    response: { status: 200, errors: [{ message }] },
  };
}

const onOpenChange = vi.fn();
let page: MountedPage;
let setHostOpen: (open: boolean) => void;

/** Owns `open` so a test can close and reopen the dialog. */
function Host({ initialOpen, existingChains }: { initialOpen: boolean; existingChains: string[] }) {
  const [open, setOpen] = useState(initialOpen);
  setHostOpen = setOpen;

  return (
    <AddWalletDialog
      open={open}
      onOpenChange={onOpenChange}
      clientId={CLIENT_ID}
      customerId={CUSTOMER_ID}
      customerLabel="Ana Pérez"
      existingChains={existingChains}
    />
  );
}

function renderDialog(props: { open?: boolean; existingChains?: string[] } = {}) {
  page = mountPage(
    <Host initialOpen={props.open ?? true} existingChains={props.existingChains ?? ['tron']} />
  );
}

function form(): HTMLFormElement {
  const element = page.container.querySelector('form');
  if (!element) throw new Error('No <form> rendered');
  return element;
}

function chainSelect(): SelectRegistration {
  const registration = selects['add-wallet-chain'];
  if (!registration) throw new Error('Chain select was not rendered');
  return registration;
}

function chooseChain(value: string) {
  page.flush(() => chainSelect().onValueChange(value));
}

function providerSelect(): SelectRegistration {
  const registration = selects['add-wallet-provider'];
  if (!registration) throw new Error('Provider select was not rendered');
  return registration;
}

function chooseProvider(value: string) {
  page.flush(() => providerSelect().onValueChange(value));
}

/** Scoped to the chain field: the provider select has its own `[data-option]`s. */
function optionValues(): string[] {
  const field = page.container.querySelector('[data-testid="add-wallet-chain-field"]');
  if (!field) throw new Error('Chain field was not rendered');
  return Array.from(field.querySelectorAll('[data-option]')).map(
    (node) => node.getAttribute('data-option') ?? ''
  );
}

function providerOptionValues(): string[] {
  const field = page.container.querySelector('[data-testid="add-wallet-provider-field"]');
  if (!field) throw new Error('Provider field was not rendered');
  return Array.from(field.querySelectorAll('[data-option]')).map(
    (node) => node.getAttribute('data-option') ?? ''
  );
}

function input(id: string): HTMLInputElement {
  const element = page.container.querySelector<HTMLInputElement>(`#${id}`);
  if (!element) throw new Error(`No #${id}`);
  return element;
}

function confirmButton(): HTMLButtonElement {
  return Array.from(page.container.querySelectorAll('button')).find(
    (button) => button.type === 'submit'
  ) as HTMLButtonElement;
}

beforeEach(() => {
  mutateMock.mockReset();
  onOpenChange.mockReset();
  hookState = { isPending: false, error: null };
  hookOnCompleted = undefined;
  walletProviders = [];
  for (const key of Object.keys(selects)) delete selects[key];
});

afterEach(() => {
  page?.unmount();
});

describe('AddWalletDialog', () => {
  it('renders nothing while closed', () => {
    renderDialog({ open: false });

    expect(page.text()).toBe('');
  });

  it('is labelled, names the customer and explains that the provider decides the currency', () => {
    renderDialog();

    const rendered = page.text();
    expect(rendered).toContain('Agregar billetera');
    expect(rendered).toContain('Ana Pérez');
    expect(rendered).toContain(
      'La moneda la define la configuración del proveedor para la cadena elegida.'
    );
    expect(page.container.querySelector('label[for="add-wallet-chain"]')).not.toBeNull();
    expect(page.container.querySelector('label[for="add-wallet-alias"]')).not.toBeNull();
    expect(confirmButton().textContent).toBe('Crear billetera');
  });

  it('creates with the provider default chain and omits empty optionals', () => {
    renderDialog();

    page.click(confirmButton());

    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock.mock.calls[0]?.[0]).toEqual({
      input: { clientId: CLIENT_ID, customerId: CUSTOMER_ID },
    });
    expect(chainSelect().value).toBe(DEFAULT_CHAIN_CHOICE);
  });

  it('sends the chosen chain and the trimmed alias', () => {
    renderDialog();

    chooseChain('solana');
    changeValue(input('add-wallet-alias'), '  Caja principal ');
    page.click(confirmButton());

    expect(mutateMock.mock.calls[0]?.[0]).toEqual({
      input: {
        clientId: CLIENT_ID,
        customerId: CUSTOMER_ID,
        chain: 'solana',
        alias: 'Caja principal',
      },
    });
  });

  it('offers the customer chains before the labelled suggestions', () => {
    renderDialog({ existingChains: ['tron'] });

    const values = optionValues();
    expect(values[0]).toBe(DEFAULT_CHAIN_CHOICE);
    expect(values[1]).toBe('tron');
    expect(values).toEqual(expect.arrayContaining(['base', 'solana', 'ethereum', 'polygon']));
    expect(values.at(-1)).toBe(CUSTOM_CHAIN_CHOICE);
    expect(page.text()).toContain('base (sugerida)');
    expect(page.text()).not.toContain('tron (sugerida)');
  });

  it('accepts another chain typed by hand and blocks confirming it empty', () => {
    renderDialog();

    chooseChain(CUSTOM_CHAIN_CHOICE);
    expect(confirmButton().disabled).toBe(true);

    changeValue(input('add-wallet-custom-chain'), ' BTC ');
    expect(confirmButton().disabled).toBe(false);
    page.click(confirmButton());

    expect(mutateMock.mock.calls[0]?.[0]).toEqual({
      input: { clientId: CLIENT_ID, customerId: CUSTOMER_ID, chain: 'btc' },
    });
  });

  it('closes when the wallet is created', () => {
    renderDialog();

    page.click(confirmButton());
    page.flush(() => hookOnCompleted?.(walletResponse()));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('stays open and shows a friendly message when KYC is not approved', () => {
    hookState.error = backendError(
      `Customer ${CUSTOMER_ID} KYC status is PENDING_REVIEW. KYC must be APPROVED to create a wallet.`
    );
    renderDialog();

    const alert = page.container.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain(
      'El cliente necesita KYC aprobado para crear una billetera.'
    );
    expect(page.text()).not.toContain(CUSTOMER_ID);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(confirmButton().disabled).toBe(false);
  });

  it('lists the chains the provider supports and adds them to the selector', () => {
    const error = backendError(
      "Chain 'bitcoin' is not supported by provider openfort. Available chains: base, arbitrum"
    );
    mutateMock.mockImplementation((_variables, options) => {
      hookState.error = error;
      options?.onError?.(error);
    });
    renderDialog();

    chooseChain(CUSTOM_CHAIN_CHOICE);
    changeValue(input('add-wallet-custom-chain'), 'bitcoin');
    page.click(confirmButton());

    const alert = page.container.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('La cadena "bitcoin" no está disponible');
    expect(alert?.textContent).toContain('Cadenas disponibles: base, arbitrum');
    expect(optionValues()).toContain('arbitrum');
    expect(page.text()).not.toContain('arbitrum (sugerida)');
    expect(page.text()).not.toContain('openfort');
  });

  it.each([
    [
      'Provider openfort is not configured for wallet creation. Missing wallet.chains configuration.',
      'No hay un proveedor configurado para crear billeteras en esta cadena.',
    ],
    [
      `Customer ${CUSTOMER_ID} does not belong to Client ${CLIENT_ID}`,
      'El cliente no pertenece a la organización seleccionada.',
    ],
    ['Forbidden resource', 'No tienes permisos para crear billeteras.'],
    ['Something odd happened', 'No se pudo crear la billetera.'],
  ])('maps "%s" to a friendly message', (backendMessage, friendly) => {
    hookState.error = backendError(backendMessage);
    renderDialog();

    const text = page.container.querySelector('[role="alert"]')?.textContent;
    expect(text).toContain(friendly);
    expect(text).not.toContain(CUSTOMER_ID);
    expect(text).not.toContain('Something odd happened');
  });

  it('does not submit twice when the form is submitted repeatedly', () => {
    renderDialog();

    submitForm(form());
    submitForm(form());

    expect(mutateMock).toHaveBeenCalledTimes(1);
  });

  it('allows submitting again once the previous attempt settled', () => {
    renderDialog();

    submitForm(form());
    const options = mutateMock.mock.calls[0]?.[1];
    page.flush(() => options?.onSettled?.());
    submitForm(form());

    expect(mutateMock).toHaveBeenCalledTimes(2);
  });

  it('shows progress, disables every action and ignores dismissal while pending', () => {
    hookState.isPending = true;
    renderDialog();

    expect(confirmButton().disabled).toBe(true);
    expect(confirmButton().textContent).toContain('Creando billetera');
    const cancel = Array.from(page.container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Cancelar'
    ) as HTMLButtonElement;
    expect(cancel.disabled).toBe(true);

    submitForm(form());
    page.click(page.container.querySelector('[data-testid="dialog-dismiss"]') as Element);

    expect(mutateMock).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('closes on cancel when idle', () => {
    renderDialog();

    page.click(page.findByText('button', 'Cancelar'));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('resets the form when it is reopened', () => {
    renderDialog();
    changeValue(input('add-wallet-alias'), 'Temporal');

    page.flush(() => setHostOpen(false));
    page.flush(() => setHostOpen(true));

    expect(input('add-wallet-alias').value).toBe('');
  });

  describe('custody provider selection', () => {
    it('offers only "Automático" when no wallet-capable provider exists', () => {
      walletProviders = [];
      renderDialog();

      expect(providerOptionValues()).toEqual([AUTO_PROVIDER_CHOICE]);
      expect(providerSelect().value).toBe(AUTO_PROVIDER_CHOICE);
    });

    it('lists only active WALLET-type providers, after "Automático"', () => {
      walletProviders = [
        provider({ id: 'p-wallet', code: 'openfort', name: 'Openfort' }),
        provider({ id: 'p-inactive', code: 'sbx', is_active: false }),
        provider({ id: 'p-fiat', code: 'wire', type: 'FIAT_RAILS' }),
      ];
      renderDialog();

      expect(providerOptionValues()).toEqual([AUTO_PROVIDER_CHOICE, 'p-wallet']);
      expect(page.text()).toContain('Openfort (openfort)');
      expect(providerSelect().value).toBe(AUTO_PROVIDER_CHOICE);
    });

    it('omits providerId while "Automático" stays selected', () => {
      walletProviders = [provider({ id: 'p-wallet' })];
      renderDialog();

      page.click(confirmButton());

      expect(mutateMock.mock.calls[0]?.[0]).toEqual({
        input: { clientId: CLIENT_ID, customerId: CUSTOMER_ID },
      });
    });

    it('sends the chosen providerId and narrows the chain options to it', () => {
      walletProviders = [
        provider({
          id: 'p-wallet',
          config: {
            wallet: { chains: ['tron', 'bitcoin'], defaultChain: 'tron', currency: 'USDT' },
          },
        }),
      ];
      renderDialog({ existingChains: ['solana'] });

      chooseProvider('p-wallet');

      expect(optionValues()).toEqual([
        DEFAULT_CHAIN_CHOICE,
        'tron',
        'bitcoin',
        CUSTOM_CHAIN_CHOICE,
      ]);
      expect(optionValues()).not.toContain('solana');

      chooseChain('bitcoin');
      page.click(confirmButton());

      expect(mutateMock.mock.calls[0]?.[0]).toEqual({
        input: {
          clientId: CLIENT_ID,
          customerId: CUSTOMER_ID,
          chain: 'bitcoin',
          providerId: 'p-wallet',
        },
      });
    });

    it('shows the resulting currency for the chosen provider and chain', () => {
      walletProviders = [
        provider({
          id: 'p-wallet',
          config: {
            wallet: {
              chains: ['tron', 'bitcoin'],
              defaultChain: 'tron',
              currency: 'USDT',
              assets: { bitcoin: 'BTC' },
            },
          },
        }),
      ];
      renderDialog();

      chooseProvider('p-wallet');
      expect(page.text()).toContain('Se creará una billetera');
      expect(page.text()).toContain('USDT');

      chooseChain('bitcoin');
      expect(page.text()).toContain('BTC');
    });

    it('keeps an explicit provider submittable when config is masked but walletCapability is present', () => {
      walletProviders = [
        provider({
          id: 'p-masked',
          config: null,
          walletCapability: {
            enabled: true,
            chains: ['tron', 'bitcoin'],
            defaultChain: 'tron',
            currency: 'USDT',
          },
        }),
      ];
      renderDialog();

      chooseProvider('p-masked');

      expect(page.container.querySelector('[role="alert"]')).toBeNull();
      expect(optionValues()).toEqual([
        DEFAULT_CHAIN_CHOICE,
        'tron',
        'bitcoin',
        CUSTOM_CHAIN_CHOICE,
      ]);
      expect(confirmButton().disabled).toBe(false);
      page.click(confirmButton());
      expect(mutateMock.mock.calls[0]?.[0]).toEqual({
        input: {
          clientId: CLIENT_ID,
          customerId: CUSTOMER_ID,
          providerId: 'p-masked',
        },
      });
    });

    it('disables submit and warns when the chosen provider has no usable wallet config', () => {
      walletProviders = [provider({ id: 'p-broken', config: { wallet: {} } })];
      renderDialog();

      chooseProvider('p-broken');

      const alert = page.container.querySelector('[role="alert"]');
      expect(alert?.textContent).toContain('Este proveedor no tiene configuración de billeteras');
      expect(confirmButton().disabled).toBe(true);
    });

    it('returns to the automatic behavior when switching back to "Automático"', () => {
      walletProviders = [provider({ id: 'p-wallet' })];
      renderDialog({ existingChains: ['tron'] });

      chooseProvider('p-wallet');
      chooseProvider(AUTO_PROVIDER_CHOICE);

      expect(optionValues()).toContain('tron');
      page.click(confirmButton());

      expect(mutateMock.mock.calls[0]?.[0]).toEqual({
        input: { clientId: CLIENT_ID, customerId: CUSTOMER_ID },
      });
    });
  });
});
