/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminProvider } from '@/graphql/types/admin-loopay';
import { changeValue, submitForm } from '@/test/dom-input';
import { mountPage, type MountedPage } from '@/test/dom-render';
import { ProvidersTab } from '../providers-tab';

const createMutate = vi.fn();
const updateMutate = vi.fn();
const toggleMutate = vi.fn();

let updateIsPending = false;
let toggleIsPending = false;
let updateOnCompleted: (() => void) | undefined;
let providersFixture: AdminProvider[] = [];

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('@/shared/components/ui/select', () => ({
  Select: ({ children, disabled }: { children: ReactNode; disabled?: boolean }) => (
    <fieldset disabled={disabled}>{children}</fieldset>
  ),
  SelectTrigger: ({ children, id }: { children: ReactNode; id?: string }) => (
    <button type="button" id={id}>
      {children}
    </button>
  ),
  SelectValue: () => null,
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/shared/components/ui/switch', () => ({
  Switch: ({
    id,
    checked,
    disabled,
    onCheckedChange,
  }: {
    id: string;
    checked: boolean;
    disabled?: boolean;
    onCheckedChange: (checked: boolean) => void;
  }) => (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onCheckedChange(event.target.checked)}
    />
  ),
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
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
}));

vi.mock('../../hooks/use-platform-catalog', () => ({
  useProviders: () => ({
    data: { adminLoopay_listProviders: providersFixture },
    isLoading: false,
  }),
  useCreateProvider: () => ({ mutate: createMutate, isPending: false }),
  useUpdateProvider: (onCompleted?: () => void) => {
    if (onCompleted) {
      updateOnCompleted = onCompleted;
      return { mutate: updateMutate, isPending: updateIsPending };
    }
    return { mutate: toggleMutate, isPending: toggleIsPending };
  },
}));

let page: MountedPage;

function field<T extends HTMLElement>(id: string): T {
  const element = page.container.querySelector<T>(`#${id}`);
  if (!element) throw new Error(`Missing #${id}`);
  return element;
}

function dialog(): Element | null {
  return page.container.querySelector('[role="dialog"]');
}

function editButton(): HTMLButtonElement {
  return page.findByText('button', 'Editar');
}

function cancelButton(): HTMLButtonElement {
  return page.findByText('button', 'Cancelar');
}

function existingProvider(): AdminProvider {
  return {
    id: 'provider-1',
    code: 'openfort',
    name: 'Openfort',
    type: 'WALLET',
    is_active: true,
    config: { wallet: { defaultChain: 'TRON' } },
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };
}

beforeEach(() => {
  createMutate.mockClear();
  updateMutate.mockClear();
  toggleMutate.mockClear();
  updateIsPending = false;
  toggleIsPending = false;
  updateOnCompleted = undefined;
  providersFixture = [];
});

afterEach(() => {
  page?.unmount();
});

describe('ProvidersTab', () => {
  it('does not render the form until the dialog is opened', () => {
    // Arrange / Act
    page = mountPage(<ProvidersTab />);

    // Assert
    expect(dialog()).toBeNull();
    expect(page.container.querySelector('#provider-code')).toBeNull();
  });

  it('opens the dialog pre-filled in edit mode when "Editar" is clicked', () => {
    // Arrange
    providersFixture = [existingProvider()];
    page = mountPage(<ProvidersTab />);

    // Act
    page.click(editButton());

    // Assert
    expect(dialog()).not.toBeNull();
    expect(page.text()).toContain('Editar proveedor openfort');
    expect(field<HTMLInputElement>('provider-code').value).toBe('openfort');
    expect(field<HTMLInputElement>('provider-code').disabled).toBe(true);
    expect(field<HTMLInputElement>('provider-name').value).toBe('Openfort');
    expect(field<HTMLTextAreaElement>('provider-config').value).toContain('defaultChain');
  });

  it('submits an edit through updateProvider.mutate and never calls create', () => {
    // Arrange
    providersFixture = [existingProvider()];
    page = mountPage(<ProvidersTab />);
    page.click(editButton());
    changeValue(field<HTMLInputElement>('provider-name'), 'Openfort Updated');

    // Act
    submitForm(page.container.querySelector('form') as HTMLFormElement);

    // Assert
    expect(updateMutate).toHaveBeenCalledWith({
      id: 'provider-1',
      input: {
        name: 'Openfort Updated',
        config: { wallet: { defaultChain: 'TRON' } },
      },
    });
    expect(createMutate).not.toHaveBeenCalled();
  });

  it('blocks the submit when the config is not valid JSON', () => {
    // Arrange
    providersFixture = [existingProvider()];
    page = mountPage(<ProvidersTab />);
    page.click(editButton());
    changeValue(field<HTMLTextAreaElement>('provider-config'), '{"wallet": ');

    // Act
    submitForm(page.container.querySelector('form') as HTMLFormElement);

    // Assert
    expect(updateMutate).not.toHaveBeenCalled();
    expect(page.text()).toContain('La configuración debe ser un objeto JSON válido.');
  });

  it('sends the parsed config object once the JSON is valid', () => {
    // Arrange
    providersFixture = [existingProvider()];
    page = mountPage(<ProvidersTab />);
    page.click(editButton());
    changeValue(
      field<HTMLTextAreaElement>('provider-config'),
      '{"wallet": {"defaultChain": "ETH"}}'
    );

    // Act
    submitForm(page.container.querySelector('form') as HTMLFormElement);

    // Assert
    expect(updateMutate).toHaveBeenCalledWith({
      id: 'provider-1',
      input: {
        name: 'Openfort',
        config: { wallet: { defaultChain: 'ETH' } },
      },
    });
  });

  it('closes without mutating when "Cancelar" is clicked', () => {
    // Arrange
    providersFixture = [existingProvider()];
    page = mountPage(<ProvidersTab />);
    page.click(editButton());
    changeValue(field<HTMLInputElement>('provider-name'), 'Openfort');

    // Act
    page.click(cancelButton());

    // Assert
    expect(dialog()).toBeNull();
    expect(createMutate).not.toHaveBeenCalled();
    expect(updateMutate).not.toHaveBeenCalled();
  });

  it('does not close on dismiss attempts while a mutation is pending', () => {
    // Arrange
    providersFixture = [existingProvider()];
    page = mountPage(<ProvidersTab />);
    page.click(editButton());
    updateIsPending = true;
    changeValue(field<HTMLInputElement>('provider-name'), 'Openfort 2');

    // Act
    page.click(page.container.querySelector('[data-testid="dialog-dismiss"]') as Element);

    // Assert
    expect(dialog()).not.toBeNull();
  });

  it('closes the dialog once the update mutation succeeds', () => {
    // Arrange
    providersFixture = [existingProvider()];
    page = mountPage(<ProvidersTab />);
    page.click(editButton());
    submitForm(page.container.querySelector('form') as HTMLFormElement);

    // Act — simulate the mutation hook's success callback
    page.flush(() => updateOnCompleted?.());

    // Assert
    expect(dialog()).toBeNull();
  });
});

describe('ProvidersTab read-only catalogue (#411)', () => {
  it('offers no new provider and no activate/deactivate: only the config edit stays', () => {
    providersFixture = [
      existingProvider(),
      { ...existingProvider(), id: 'p-2', code: 'bridge', is_active: false },
    ];
    page = mountPage(<ProvidersTab />);

    const labels = Array.from(page.container.querySelectorAll('button')).map((b) =>
      b.textContent?.trim()
    );
    expect(labels).not.toContain('Nuevo proveedor');
    expect(labels).not.toContain('Desactivar');
    expect(labels).not.toContain('Activar');
    expect(labels).toContain('Editar');
  });

  it('never (de)activates a provider or changes its type from the edit dialog', () => {
    providersFixture = [{ ...existingProvider(), is_active: false }];
    page = mountPage(<ProvidersTab />);
    page.click(editButton());

    const active = page.container.querySelector('#provider-active');
    const type = page.container.querySelector('#provider-type');
    expect(active?.matches(':disabled')).toBe(true);
    expect(type?.matches(':disabled')).toBe(true);

    submitForm(page.container.querySelector('form') as HTMLFormElement);
    const [[{ input }]] = updateMutate.mock.calls as [[{ input: Record<string, unknown> }]];
    expect(Object.keys(input).sort()).toEqual(['config', 'name']);
  });
});
