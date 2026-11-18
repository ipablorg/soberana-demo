import { describe, expect, it } from 'vitest';

import { describeReviewKycWalletResult } from '../kyc-review-actions';

describe('describeReviewKycWalletResult', () => {
  it('announces a created wallet with a truncated address preview', () => {
    const result = describeReviewKycWalletResult({
      customer_id: 'c1',
      previous_kyc_status: 'PENDING',
      kyc_status: 'APPROVED',
      customer_status: 'ACTIVE',
      wallet: {
        id: 'w1',
        chain: 'tron',
        currency: 'USDT',
        address: 'TKSJJz1234567890abcdefky2',
      },
      wallet_error: null,
      reviewed_by: 'admin',
      reviewed_at: '2026-09-15T00:00:00.000Z',
    });

    expect(result?.kind).toBe('wallet-created');
    expect(result).toMatchObject({
      chain: 'tron',
      currency: 'USDT',
      addressPreview: 'TKSJJz...fky2',
    });
  });

  it('does not truncate a short address', () => {
    const result = describeReviewKycWalletResult({
      customer_id: 'c1',
      previous_kyc_status: 'PENDING',
      kyc_status: 'APPROVED',
      customer_status: 'ACTIVE',
      wallet: { id: 'w1', chain: 'base', currency: 'USDC', address: '0x1234' },
      wallet_error: null,
      reviewed_by: 'admin',
      reviewed_at: '2026-09-15T00:00:00.000Z',
    });

    expect(result?.kind).toBe('wallet-created');
    if (result?.kind === 'wallet-created') {
      expect(result.addressPreview).toBe('0x1234');
    }
  });

  it('announces a wallet error with the backend message', () => {
    const result = describeReviewKycWalletResult({
      customer_id: 'c1',
      previous_kyc_status: 'PENDING',
      kyc_status: 'APPROVED',
      customer_status: 'ACTIVE',
      wallet: null,
      wallet_error: 'provider timeout',
      reviewed_by: 'admin',
      reviewed_at: '2026-09-15T00:00:00.000Z',
    });

    expect(result?.kind).toBe('wallet-error');
    expect(result).toMatchObject({ error: 'provider timeout' });
  });

  it('returns null when neither a wallet nor an error came back (e.g. a reject)', () => {
    const result = describeReviewKycWalletResult({
      customer_id: 'c1',
      previous_kyc_status: 'PENDING',
      kyc_status: 'REJECTED',
      customer_status: 'ACTIVE',
      wallet: null,
      wallet_error: null,
      reviewed_by: 'admin',
      reviewed_at: '2026-09-15T00:00:00.000Z',
    });

    expect(result).toBeNull();
  });

  it('prefers the wallet_error over a present wallet address', () => {
    const result = describeReviewKycWalletResult({
      customer_id: 'c1',
      previous_kyc_status: 'PENDING',
      kyc_status: 'APPROVED',
      customer_status: 'ACTIVE',
      wallet: { id: 'w1', chain: 'tron', currency: 'USDT', address: '0xabc' },
      wallet_error: 'partial failure',
      reviewed_by: 'admin',
      reviewed_at: '2026-09-15T00:00:00.000Z',
    });

    expect(result?.kind).toBe('wallet-error');
  });
});
