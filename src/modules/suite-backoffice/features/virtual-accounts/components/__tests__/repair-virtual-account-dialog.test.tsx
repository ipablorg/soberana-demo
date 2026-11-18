/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { changeValue } from '@/test/dom-input';
import { mountPage, type MountedPage } from '@/test/dom-render';

import { RepairVirtualAccountDialog } from '../repair-virtual-account-dialog';

const mutate = vi.fn();
let onCompleted: ((result: unknown) => void) | undefined;
let onManualBankDetailsRequired: (() => void) | undefined;

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('../../hooks/use-virtual-accounts', () => ({
  useRepairVirtualAccountRequest: (options: {
    onCompleted?: (result: unknown) => void;
    onManualBankDetailsRequired?: () => void;
  }) => {
    onCompleted = options.onCompleted;
    onManualBankDetailsRequired = options.onManualBankDetailsRequired;
    return { mutate, isPending: false };
  },
}));

const REQUEST = {
  endorsementId: 'e-1',
  railCode: 'ach',
  railLabel: 'ACH · USD',
  providerLabel: 'KiraFin',
  customerEmail: 'ops@acme.test',
};

let page: MountedPage;

function bodyText(): string {
  return (document.body.textContent ?? '').replace(/\s+/g, ' ');
}

function field<T extends HTMLElement>(selector: string): T {
  const match = document.body.querySelector<T>(selector);
  if (!match) throw new Error(`No ${selector}. Rendered: ${bodyText()}`);
  return match;
}

function button(label: string): HTMLButtonElement {
  const match = Array.from(document.body.querySelectorAll('button')).find(
    (node) => (node.textContent ?? '').trim() === label
  );
  if (!match) throw new Error(`No button "${label}". Rendered: ${bodyText()}`);
  return match;
}

function fillAccountAndReason() {
  changeValue(field<HTMLInputElement>('#repair-provider-account-id'), 'va_123');
  changeValue(
    field<HTMLTextAreaElement>('#repair-reason'),
    'El alta quedó bloqueada; la cuenta ya existe en KiraFin'
  );
}

beforeEach(() => {
  mutate.mockReset();
  page = mountPage(<RepairVirtualAccountDialog request={REQUEST} onClose={vi.fn()} />);
});

afterEach(() => {
  page?.unmount();
});

describe('RepairVirtualAccountDialog (S22)', () => {
  it('asks the provider account id and a mandatory reason before repairing', () => {
    expect(button('Reparar solicitud').disabled).toBe(true);
    expect(bodyText()).not.toContain('Número de cuenta');

    fillAccountAndReason();
    page.click(button('Reparar solicitud'));

    expect(mutate).toHaveBeenCalledWith({
      input: {
        endorsementId: 'e-1',
        providerAccountId: 'va_123',
        reason: 'El alta quedó bloqueada; la cuenta ya existe en KiraFin',
      },
    });
  });

  it('asks the rail bank details with a confirmation when the provider returned none', () => {
    fillAccountAndReason();
    page.click(button('Reparar solicitud'));
    page.flush(() => onManualBankDetailsRequired?.());

    expect(bodyText()).toContain('Número de cuenta');
    expect(bodyText()).toContain('Confirmo que verifiqué estos datos con el proveedor');

    changeValue(field<HTMLInputElement>('#bank-field-routing_number'), '021000021');
    changeValue(field<HTMLInputElement>('#bank-field-account_number'), '123456789');
    changeValue(field<HTMLInputElement>('#bank-field-bank_name'), 'Lead Bank');
    // Without the confirmation the manual data is not sent.
    expect(button('Reparar solicitud').disabled).toBe(true);

    page.click(field('#repair-confirm-manual'));
    page.click(button('Reparar solicitud'));

    expect(mutate).toHaveBeenLastCalledWith({
      input: expect.objectContaining({
        endorsementId: 'e-1',
        providerAccountId: 'va_123',
        bankDetails: expect.objectContaining({
          routing_number: '021000021',
          account_number: '123456789',
          bank_name: 'Lead Bank',
        }),
        confirmManualBankDetails: true,
      }),
    });
  });

  it('shows the result and that the bank details came from the provider', () => {
    fillAccountAndReason();
    page.click(button('Reparar solicitud'));
    page.flush(() =>
      onCompleted?.({
        adminLoopay_repairVirtualAccountRequest: {
          endorsementId: 'e-1',
          virtualAccountId: 'va-db-1',
          status: 'ACTIVE',
          bankDetailsSource: 'PROVIDER',
        },
      })
    );

    expect(bodyText()).toContain('Solicitud reparada');
    expect(bodyText()).toContain('va-db-1');
    expect(bodyText()).toContain('Obtenidos del proveedor');
  });

  it('shows when the bank details were entered by hand', () => {
    fillAccountAndReason();
    page.click(button('Reparar solicitud'));
    page.flush(() =>
      onCompleted?.({
        adminLoopay_repairVirtualAccountRequest: {
          endorsementId: 'e-1',
          virtualAccountId: 'va-db-1',
          status: 'ACTIVE',
          bankDetailsSource: 'MANUAL',
        },
      })
    );

    expect(bodyText()).toContain('Ingresados a mano');
  });
});
