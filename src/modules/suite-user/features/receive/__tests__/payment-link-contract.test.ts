import { describe, expect, it } from 'vitest';

import {
  buildPaymentLinkInput,
  isEcuadorPaymentRail,
} from '@/modules/suite-user/features/receive/components/payment-link-contract';

async function readReceiveComponent(relativePath: string): Promise<string> {
  const fs = await import('fs');
  const path = await import('path');

  return fs.readFileSync(path.resolve(__dirname, relativePath), 'utf-8');
}

describe('payment link contract', () => {
  it('preserves the Colombia Bre-B request shape', () => {
    const input = buildPaymentLinkInput({
      amount: '125000',
      currency: 'COP',
      customerId: 'customer-1',
      receiveWalletId: 'wallet-1',
      paymentMethod: 'co_breb',
    });

    expect(input).toEqual({
      amount: '125000',
      currency: 'COP',
      customer_id: 'customer-1',
      wallet_id: 'wallet-1',
      payment_method: 'co_breb',
      country: 'COL',
      purpose: 'PERSONAL_ACCOUNT',
    });
  });

  it('guards Bre-B payment links from accidental rail substitution', () => {
    const input = buildPaymentLinkInput({
      amount: '125000',
      currency: 'COP',
      customerId: 'customer-1',
      receiveWalletId: 'wallet-1',
      paymentMethod: 'co_breb',
    });

    expect(input.payment_method).not.toBe('co_ach');
    expect(input.payment_method).not.toBe('ach');
    expect(input.payment_method).not.toBe('lambda');
  });

  it('normalizes Bre-B casing to the exact payment-link contract value', () => {
    const input = buildPaymentLinkInput({
      amount: '125000',
      currency: 'COP',
      customerId: 'customer-1',
      receiveWalletId: 'wallet-1',
      paymentMethod: 'CO_BREB',
    });

    expect(input).toMatchObject({
      payment_method: 'co_breb',
      country: 'COL',
      purpose: 'PERSONAL_ACCOUNT',
    });
  });

  it('keeps PaymentLinkForm submission delegated to the contract builder', async () => {
    const paymentLinkForm = await readReceiveComponent(
      '../components/PaymentLinkForm.tsx',
    );

    expect(paymentLinkForm).toContain('input: buildPaymentLinkInput({');
    expect(paymentLinkForm).not.toContain('payment_method: paymentMethod');
  });

  it('recognizes ec_point_of_sale as Ecuador rail', () => {
    expect(isEcuadorPaymentRail('ec_point_of_sale')).toBe(true);
    expect(isEcuadorPaymentRail(' EC_POINT_OF_SALE ')).toBe(true);
  });

  it('recognizes ec_bank_transfer as Ecuador rail', () => {
    expect(isEcuadorPaymentRail('ec_bank_transfer')).toBe(true);
    expect(isEcuadorPaymentRail(' EC_BANK_TRANSFER ')).toBe(true);
  });

  it('rejects non-Ecuador rails', () => {
    expect(isEcuadorPaymentRail('co_breb')).toBe(false);
    expect(isEcuadorPaymentRail('pix')).toBe(false);
    expect(isEcuadorPaymentRail('')).toBe(false);
    expect(isEcuadorPaymentRail(undefined)).toBe(false);
  });

  it('includes Ecuador point of sale country mapping', () => {
    const input = buildPaymentLinkInput({
      amount: '100',
      currency: 'USD',
      customerId: 'customer-1',
      receiveWalletId: 'wallet-1',
      paymentMethod: 'ec_point_of_sale',
      payerDetails: {
        full_name: 'Test User',
        document_type: 'CI',
        document_number: '1234567890',
        email: 'test@example.com',
        phone: '+593987654321',
      },
      returnUrl: 'https://example.com/callback',
    });

    expect(input).toEqual({
      amount: '100',
      currency: 'USD',
      customer_id: 'customer-1',
      wallet_id: 'wallet-1',
      payment_method: 'ec_point_of_sale',
      country: 'ECU',
      purpose: 'PERSONAL_ACCOUNT',
      payer_details: {
        full_name: 'Test User',
        document_type: 'CI',
        document_number: '1234567890',
        email: 'test@example.com',
        phone: '+593987654321',
      },
      return_url: 'https://example.com/callback',
    });
  });
});
