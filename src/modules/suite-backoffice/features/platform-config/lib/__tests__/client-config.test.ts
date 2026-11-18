import { describe, expect, it } from 'vitest';

import {
  areWalletDefaultsComplete,
  mergeWalletDefaults,
  parsePriority,
  readWalletDefaults,
} from '../client-config';

const WALLET_DEFAULTS = {
  walletProviderId: 'provider-openfort',
  walletDefaultChain: ' tron ',
  walletDefaultCurrency: 'usdt',
};

describe('mergeWalletDefaults', () => {
  it('preserves every other config key and every other defaults key', () => {
    // Arrange
    const config = {
      fees: { mode: 'percent', feePercent: 1 },
      kycEnabled: true,
      defaults: { kycProviderId: 'provider-kyc', walletDefaultChain: 'base' },
    };

    // Act
    const merged = mergeWalletDefaults(config, WALLET_DEFAULTS);

    // Assert
    expect(merged).toEqual({
      fees: { mode: 'percent', feePercent: 1 },
      kycEnabled: true,
      defaults: {
        kycProviderId: 'provider-kyc',
        walletProviderId: 'provider-openfort',
        walletDefaultChain: 'tron',
        walletDefaultCurrency: 'usdt',
      },
    });
  });

  it('does not mutate the config it merges into', () => {
    // Arrange
    const config = { defaults: { walletDefaultChain: 'base' } };

    // Act
    mergeWalletDefaults(config, WALLET_DEFAULTS);

    // Assert
    expect(config).toEqual({ defaults: { walletDefaultChain: 'base' } });
  });

  it.each([[null], [undefined], [[]], ['text']])(
    'starts from an empty config when the stored config is %j',
    (config) => {
      // Act
      const merged = mergeWalletDefaults(config, WALLET_DEFAULTS);

      // Assert
      expect(Object.keys(merged)).toEqual(['defaults']);
    }
  );
});

describe('readWalletDefaults', () => {
  it('reads the three wallet defaults and ignores non-string values', () => {
    // Act
    const defaults = readWalletDefaults({
      defaults: { walletProviderId: 'p-1', walletDefaultChain: 7 },
    });

    // Assert
    expect(defaults).toEqual({
      walletProviderId: 'p-1',
      walletDefaultChain: '',
      walletDefaultCurrency: '',
    });
    expect(areWalletDefaultsComplete(defaults)).toBe(false);
  });
});

describe('parsePriority', () => {
  it.each([
    ['1', 1],
    [' 12 ', 12],
    ['0', null],
    ['-1', null],
    ['1.5', null],
    ['abc', null],
  ])('parses %j as %j', (value, expected) => {
    // Act
    const parsed = parsePriority(value);

    // Assert
    expect(parsed).toBe(expected);
  });
});
