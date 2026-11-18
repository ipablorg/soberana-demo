/* @vitest-environment jsdom */

import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { changeValue } from '@/test/dom-input';
import { mountPage, type MountedPage } from '@/test/dom-render';
import { CutoverTab } from '../cutover-tab';

interface MutateOptions {
  onSuccess?: (result: unknown) => void;
  onError?: (error: unknown) => void;
  onSettled?: () => void;
}

const deactivateJunctionsMutate = vi.fn();
const deactivateCatalogMutate = vi.fn();
const flagLegacyMutate = vi.fn();
let confirmationProps: { open: boolean; onConfirm: (reason: string) => void } | null =
  null;

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('../../../ops-review/hooks/use-client-options', () => ({
  useClientOptions: () => ({
    options: [
      { client_id: 'client-loopay', client_name: 'LOOPAY', is_active: true },
      { client_id: 'client-trokera', client_name: 'Trokera', is_active: true },
      { client_id: 'client-legacy', client_name: 'Legacy', is_active: false },
    ],
    isLoading: false,
  }),
}));

vi.mock('../../hooks/use-platform-cutover', () => ({
  useCutoverDeactivateDeadProviders: () => ({
    mutate: deactivateJunctionsMutate,
    isPending: false,
  }),
  useCutoverDeactivateDeadProviderCatalog: () => ({
    mutate: deactivateCatalogMutate,
    isPending: false,
  }),
  useCutoverFlagLegacyTransactions: () => ({
    mutate: flagLegacyMutate,
    isPending: false,
  }),
}));

vi.mock('@/shared/components/backoffice/StateChangeConfirmationModal', () => ({
  StateChangeConfirmationModal: (props: {
    open: boolean;
    onConfirm: (reason: string) => void;
  }) => {
    confirmationProps = props;
    return props.open ? <div data-testid="confirmation-modal" /> : null;
  },
}));

let page: MountedPage;

function button(label: string): HTMLButtonElement {
  return page.findByText<HTMLButtonElement>('button', label);
}

function clientCheckbox(clientId: string): HTMLInputElement {
  return page.container.querySelector(
    `input[data-client-id="${clientId}"]`,
  ) as HTMLInputElement;
}

function field<T extends HTMLElement>(id: string): T {
  return page.container.querySelector(`#${id}`) as T;
}

function confirmModal() {
  expect(confirmationProps?.open).toBe(true);
  act(() => {
    confirmationProps?.onConfirm('');
  });
}

beforeEach(() => {
  confirmationProps = null;
  deactivateJunctionsMutate.mockReset();
  deactivateCatalogMutate.mockReset();
  flagLegacyMutate.mockReset();
});

afterEach(() => {
  page?.unmount();
});

describe('CutoverTab', () => {
  it('sends only the selected client ids when deactivating dead-provider junctions', () => {
    // Arrange
    page = mountPage(<CutoverTab />);
    page.click(clientCheckbox('client-trokera'));
    changeValue(field<HTMLTextAreaElement>('cutover-reason'), 'Purge Bridge');
    page.click(button('Desactivar conexiones'));

    // Act
    confirmModal();

    // Assert
    expect(deactivateJunctionsMutate).toHaveBeenCalledTimes(1);
    expect(deactivateJunctionsMutate.mock.calls[0][0]).toEqual({
      input: { clientIds: ['client-trokera'], reason: 'Purge Bridge' },
    });
  });

  it('selects only the active clients through the explicit select-all action', () => {
    // Arrange
    page = mountPage(<CutoverTab />);
    changeValue(field<HTMLTextAreaElement>('cutover-reason'), 'Purge Bridge');

    // Act
    page.click(button('Seleccionar todos los activos'));
    page.click(button('Desactivar conexiones'));
    confirmModal();

    // Assert
    expect(deactivateJunctionsMutate.mock.calls[0][0]).toEqual({
      input: {
        clientIds: ['client-loopay', 'client-trokera'],
        reason: 'Purge Bridge',
      },
    });
  });

  it('keeps the deactivation disabled until a client and a reason are given', () => {
    // Arrange
    page = mountPage(<CutoverTab />);

    // Act
    page.click(clientCheckbox('client-loopay'));

    // Assert
    expect(button('Desactivar conexiones').disabled).toBe(true);
  });

  it('keeps the real legacy flag run disabled until a dry run with the same inputs succeeded', () => {
    // Arrange
    flagLegacyMutate.mockImplementation((_variables, options: MutateOptions) => {
      options.onSuccess?.({
        adminLoopay_cutoverFlagLegacyTransactions: {
          dry_run: true,
          count: 7,
          created_before: '2026-01-01T15:00:00.000Z',
        },
      });
      options.onSettled?.();
    });
    page = mountPage(<CutoverTab />);
    page.click(clientCheckbox('client-trokera'));
    changeValue(field<HTMLTextAreaElement>('cutover-reason'), 'Flag pre-purge');
    changeValue(field<HTMLInputElement>('cutover-created-before'), '2026-01-01T10:00');
    const realRunDisabledBeforeDryRun = button('Ejecutar marcado').disabled;

    // Act
    page.click(button('Simular (dry run)'));
    confirmModal();

    // Assert
    expect(realRunDisabledBeforeDryRun).toBe(true);
    expect(flagLegacyMutate.mock.calls[0][0].input).toMatchObject({
      clientIds: ['client-trokera'],
      reason: 'Flag pre-purge',
      dryRun: true,
    });
    expect(page.text()).toContain('se marcarían 7 transacciones');
    expect(button('Ejecutar marcado').disabled).toBe(false);
  });

  it('disables the real run again when the inputs change after the dry run', () => {
    // Arrange
    flagLegacyMutate.mockImplementation((_variables, options: MutateOptions) => {
      options.onSuccess?.({
        adminLoopay_cutoverFlagLegacyTransactions: {
          dry_run: true,
          count: 7,
          created_before: '2026-01-01T15:00:00.000Z',
        },
      });
      options.onSettled?.();
    });
    page = mountPage(<CutoverTab />);
    page.click(clientCheckbox('client-trokera'));
    changeValue(field<HTMLTextAreaElement>('cutover-reason'), 'Flag pre-purge');
    changeValue(field<HTMLInputElement>('cutover-created-before'), '2026-01-01T10:00');
    page.click(button('Simular (dry run)'));
    confirmModal();

    // Act
    page.click(clientCheckbox('client-loopay'));

    // Assert
    expect(button('Ejecutar marcado').disabled).toBe(true);
  });

  it('shows the active junction count when the catalog deactivation is refused', () => {
    // Arrange
    deactivateCatalogMutate.mockImplementation((_variables, options: MutateOptions) => {
      options.onError?.({
        response: {
          errors: [
            {
              message: '3 active client junction(s) still point to dead providers',
              extensions: {
                code: 'INTERNAL_SERVER_ERROR',
                status: 409,
                originalError: {
                  statusCode: 409,
                  code: 'DEAD_PROVIDER_JUNCTIONS_REMAIN',
                  message:
                    '3 active client junction(s) still point to dead providers; deactivate them per client first',
                  active_junctions: 3,
                },
              },
            },
          ],
        },
      });
      options.onSettled?.();
    });
    page = mountPage(<CutoverTab />);
    changeValue(field<HTMLTextAreaElement>('cutover-reason'), 'Purge catalog');
    page.click(button('Desactivar catálogo'));

    // Act
    confirmModal();

    // Assert
    expect(deactivateCatalogMutate.mock.calls[0][0]).toEqual({ reason: 'Purge catalog' });
    expect(page.text()).toContain('Aún quedan 3 conexiones de clientes');
    expect(page.text()).toContain('deactivate them per client first');
  });
});
