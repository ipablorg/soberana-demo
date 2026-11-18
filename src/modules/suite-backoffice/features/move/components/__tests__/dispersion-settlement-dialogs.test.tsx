/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AdminDispersion } from '@/graphql/types/admin-loopay';
import { mountPage, type MountedPage } from '@/test/dom-render';
import {
  ApproveDispersionDialog,
  CompleteDispersionDialog,
} from '../dispersion-settlement-dialogs';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

let bankDetailsProps: { bankDetails: unknown; railCode: string } | null = null;

vi.mock('@/shared/components/backoffice/bank-details-display', () => ({
  BankDetailsDisplay: (props: { bankDetails: unknown; railCode: string }) => {
    bankDetailsProps = props;
    return <div data-testid="bank-details" />;
  },
}));

vi.mock('@/shared/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

const DISPERSION: AdminDispersion = {
  id: 'dispersion-1',
  reference_code: 'WD-ABC-123',
  customer_id: 'customer-1',
  customer_email: 'ana@example.com',
  client_id: 'client-1',
  client_name: 'Trokera',
  wallet_id: 'wallet-1',
  amount: '900.00',
  currency: 'USD',
  status: 'PENDING',
  held_amount: '900.00',
  beneficiary: {
    id: 'beneficiary-1',
    holder_name: 'Carlos Ruiz',
    rail_code: 'spei',
    currency: 'MXN',
    bank_details: { clabe: '123456789012345678', bank_code: '002' },
  },
  funds_location: null,
  created_at: '2026-07-09T12:30:00.000Z',
  review_reason: null,
  reviewed_at: null,
  quote_rate: null,
  quote_source_amount: null,
  quote_source_currency: null,
  quote_target_amount: null,
  quote_target_currency: null,
  fee_amount: null,
  fee_source: null,
  fee_currency: null,
  settlement_amount: null,
  settlement_currency: null,
  settlement_rate: null,
  settlement_bank_rate: null,
  settlement_fees: null,
  settlement_external_reference: null,
};

let page: MountedPage;

afterEach(() => {
  page?.unmount();
  bankDetailsProps = null;
});

describe('ApproveDispersionDialog', () => {
  it('shows the amount, reference, beneficiary and bank details before confirming', () => {
    page = mountPage(
      <ApproveDispersionDialog
        dispersion={DISPERSION}
        loading={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );

    const rendered = page.text();

    expect(rendered).toContain('ana@example.com');
    expect(rendered).toContain('WD-ABC-123');
    expect(rendered).toContain('$900.00');
    expect(rendered).toContain('Carlos Ruiz');
    expect(rendered).toContain('spei');

    expect(bankDetailsProps?.railCode).toBe('spei');
    expect(bankDetailsProps?.bankDetails).toEqual({
      clabe: '123456789012345678',
      bank_code: '002',
    });
  });

  it('states the consequence of approving (funds stay held)', () => {
    page = mountPage(
      <ApproveDispersionDialog
        dispersion={DISPERSION}
        loading={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );

    expect(page.text()).toContain('pasa a procesamiento');
  });

  it('confirms with the funds in the customer vault by default', () => {
    const onConfirm = vi.fn();
    page = mountPage(
      <ApproveDispersionDialog
        dispersion={DISPERSION}
        loading={false}
        onClose={() => {}}
        onConfirm={onConfirm}
      />,
    );

    page.click(page.findByText('button', 'Aprobar'));

    expect(onConfirm).toHaveBeenCalledWith('customer_vault', '');
  });

  it('#413: confirms with the locked funds location and states the given consequence', () => {
    const onConfirm = vi.fn();
    page = mountPage(
      <ApproveDispersionDialog
        dispersion={DISPERSION}
        loading={false}
        lockedFundsLocation="ops_vault"
        consequence="Se coloca la orden de pago en Mesta."
        onClose={() => {}}
        onConfirm={onConfirm}
      />,
    );

    page.click(page.findByText('button', 'Aprobar'));

    expect(onConfirm).toHaveBeenCalledWith('ops_vault', '');
    expect(page.text()).toContain('Se coloca la orden de pago en Mesta.');
    expect(page.text()).not.toContain('pasa a procesamiento. Los fondos quedan retenidos');
  });
});

describe('CompleteDispersionDialog', () => {
  it('states the consequence of completing (funds leave custody)', () => {
    page = mountPage(
      <CompleteDispersionDialog
        dispersion={DISPERSION}
        loading={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );

    expect(page.text()).toContain('liquida el retiro');
  });
});
