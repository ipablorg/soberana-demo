import { describe, expect, it } from 'vitest';
import {
  getExternalWalletDestinationCurrencies,
  normalizeDirectTransferContractFields,
  validateCryptoTransferAddress,
} from '../crypto-transfer';

describe('normalizeDirectTransferContractFields', () => {
  it('normalizes the direct transfer contract fields', () => {
    expect(
      normalizeDirectTransferContractFields({
        to_address: ' 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0 ',
        amount: '125.50',
        currency: 'usdt',
        chain: ' Base ',
        client_reference_id: ' direct-123 ',
      }),
    ).toEqual({
      to_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      amount: '125.50',
      currency: 'USDT',
      chain: 'base',
      client_reference_id: 'direct-123',
    });
  });

  it('drops blank optional client_reference_id values', () => {
    expect(
      normalizeDirectTransferContractFields({
        to_address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
        amount: '10',
        currency: 'usdt',
        chain: 'solana',
        client_reference_id: '   ',
      }),
    ).toEqual({
      to_address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
      amount: '10',
      currency: 'USDT',
      chain: 'solana',
      client_reference_id: undefined,
    });
  });
});

describe('validateCryptoTransferAddress', () => {
  it('accepts valid Solana addresses', () => {
    expect(
      validateCryptoTransferAddress(
        'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
        'solana',
      ),
    ).toBeNull();
  });
});

describe('getExternalWalletDestinationCurrencies', () => {
  it('keeps default destination assets and includes the source wallet asset', () => {
    expect(getExternalWalletDestinationCurrencies('eurc')).toEqual([
      'USDC',
      'USDT',
      'EURC',
    ]);
  });

  it('deduplicates the source wallet asset when it is already supported', () => {
    expect(getExternalWalletDestinationCurrencies('usdt')).toEqual([
      'USDC',
      'USDT',
    ]);
  });
});
