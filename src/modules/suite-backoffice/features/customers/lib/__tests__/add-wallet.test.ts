import { describe, expect, it } from 'vitest';

import type { AdminProvider } from '@/graphql/types/admin-loopay';
import {
  AUTO_PROVIDER_CHOICE,
  CUSTOM_CHAIN_CHOICE,
  DEFAULT_CHAIN_CHOICE,
  MAX_ALIAS_LENGTH,
  MAX_CHAIN_LENGTH,
  SUGGESTED_CHAINS,
  buildChainOptions,
  buildCreateWalletInput,
  classifyCreateWalletError,
  getAddWalletAvailability,
  isWalletCapableProvider,
  normalizeChain,
  parseProviderWalletConfig,
  resolveProviderWalletConfig,
  providerDisplayLabel,
  resolveChain,
  resolveProviderCurrency,
  selectWalletCapableProviders,
} from '../add-wallet';

const CUSTOMER_ID = '0b6d2f6e-7f1c-4c1e-9d4e-111111111111';
const CLIENT_ID = '5a0c1e93-2b7d-4f6a-8c3d-222222222222';

/** Mimics a graphql-request ClientError: the real message is in response.errors. */
function backendError(message: string, extensions?: Record<string, unknown>) {
  return {
    message: `${message}: {"response":{"errors":[{"message":"${message}"}]},"request":{"query":"mutation AdminLoopayCreateWallet"}}`,
    response: {
      status: 200,
      errors: [{ message, ...(extensions && { extensions }) }],
    },
  };
}

describe('getAddWalletAvailability', () => {
  it('hides the action from staff without the admin role', () => {
    const result = getAddWalletAvailability({
      isAdmin: false,
      kycStatus: 'APPROVED',
    });

    expect(result).toEqual({
      visible: false,
      enabled: false,
      blockedReason: null,
    });
  });

  it('enables the action for an admin with approved KYC', () => {
    const result = getAddWalletAvailability({
      isAdmin: true,
      kycStatus: 'APPROVED',
    });

    expect(result).toEqual({
      visible: true,
      enabled: true,
      blockedReason: null,
    });
  });

  it.each([
    'NOT_INITIATED',
    'INITIATED',
    'PENDING_REVIEW',
    'ADDITIONAL_INFO_REQUIRED',
    'REJECTED',
    'EXPIRED',
  ] as const)('shows but blocks the action when KYC is %s', (kycStatus) => {
    const result = getAddWalletAvailability({ isAdmin: true, kycStatus });

    expect(result).toEqual({
      visible: true,
      enabled: false,
      blockedReason: 'kyc_not_approved',
    });
  });
});

describe('normalizeChain', () => {
  it('trims and lowercases, and maps empty values to an empty string', () => {
    expect(normalizeChain('  Solana ')).toBe('solana');
    expect(normalizeChain('   ')).toBe('');
    expect(normalizeChain(null)).toBe('');
    expect(normalizeChain(undefined)).toBe('');
  });
});

describe('resolveChain', () => {
  it('maps the provider-default choice to no chain, whatever was typed', () => {
    expect(resolveChain(DEFAULT_CHAIN_CHOICE, 'btc')).toBe('');
  });

  it('uses the normalised typed chain for the custom choice', () => {
    expect(resolveChain(CUSTOM_CHAIN_CHOICE, ' BTC ')).toBe('btc');
    expect(resolveChain(CUSTOM_CHAIN_CHOICE, '   ')).toBe('');
  });

  it('uses the selected chain otherwise and ignores the typed text', () => {
    expect(resolveChain('Solana', 'btc')).toBe('solana');
  });
});

describe('buildChainOptions', () => {
  it('offers the labelled suggestions when nothing else is known', () => {
    const options = buildChainOptions({});

    expect(options.map((option) => option.value)).toEqual([...SUGGESTED_CHAINS]);
    expect(options.every((option) => option.source === 'suggested')).toBe(true);
  });

  it('suggests bitcoin like any other suggested chain', () => {
    const options = buildChainOptions({});

    expect(SUGGESTED_CHAINS).toContain('bitcoin');
    expect(options).toContainEqual({ value: 'bitcoin', source: 'suggested' });
  });

  it('lets a backend-reported bitcoin win over the suggestion', () => {
    const options = buildChainOptions({ reportedChains: ['tron', 'Bitcoin'] });

    expect(options.filter((option) => option.value === 'bitcoin')).toEqual([
      { value: 'bitcoin', source: 'reported' },
    ]);
  });

  it('puts backend-reported chains first, then existing wallet chains, then suggestions', () => {
    const options = buildChainOptions({
      reportedChains: ['base', 'arbitrum'],
      existingChains: ['tron'],
      suggestedChains: ['solana', 'ethereum'],
    });

    expect(options).toEqual([
      { value: 'base', source: 'reported' },
      { value: 'arbitrum', source: 'reported' },
      { value: 'tron', source: 'existing' },
      { value: 'solana', source: 'suggested' },
      { value: 'ethereum', source: 'suggested' },
    ]);
  });

  it('dedupes across sources keeping the most authoritative one and ignores blanks/case', () => {
    const options = buildChainOptions({
      reportedChains: ['Base'],
      existingChains: [' base ', 'TRON', '', null],
      suggestedChains: ['tron', 'solana'],
    });

    expect(options).toEqual([
      { value: 'base', source: 'reported' },
      { value: 'tron', source: 'existing' },
      { value: 'solana', source: 'suggested' },
    ]);
  });
});

describe('buildCreateWalletInput', () => {
  it('omits chain and alias when they are empty', () => {
    const input = buildCreateWalletInput({
      clientId: CLIENT_ID,
      customerId: CUSTOMER_ID,
      chain: '  ',
      alias: '',
    });

    expect(input).toEqual({ clientId: CLIENT_ID, customerId: CUSTOMER_ID });
    expect(Object.keys(input)).not.toContain('chain');
    expect(Object.keys(input)).not.toContain('alias');
  });

  it('trims and lowercases the chain and trims the alias', () => {
    const input = buildCreateWalletInput({
      clientId: CLIENT_ID,
      customerId: CUSTOMER_ID,
      chain: ' Solana ',
      alias: '  Caja principal ',
    });

    expect(input).toEqual({
      clientId: CLIENT_ID,
      customerId: CUSTOMER_ID,
      chain: 'solana',
      alias: 'Caja principal',
    });
  });

  it('exposes the backend length limits', () => {
    expect(MAX_CHAIN_LENGTH).toBe(20);
    expect(MAX_ALIAS_LENGTH).toBe(100);
  });

  it('omits providerId when it is the automatic sentinel or empty', () => {
    expect(
      buildCreateWalletInput({
        clientId: CLIENT_ID,
        customerId: CUSTOMER_ID,
        providerId: AUTO_PROVIDER_CHOICE,
      })
    ).toEqual({ clientId: CLIENT_ID, customerId: CUSTOMER_ID });

    expect(
      buildCreateWalletInput({
        clientId: CLIENT_ID,
        customerId: CUSTOMER_ID,
        providerId: '',
      })
    ).toEqual({ clientId: CLIENT_ID, customerId: CUSTOMER_ID });
  });

  it('includes providerId when an explicit provider is chosen', () => {
    const input = buildCreateWalletInput({
      clientId: CLIENT_ID,
      customerId: CUSTOMER_ID,
      providerId: 'provider-uuid-1',
    });

    expect(input).toEqual({
      clientId: CLIENT_ID,
      customerId: CUSTOMER_ID,
      providerId: 'provider-uuid-1',
    });
  });
});

describe('wallet-capable providers', () => {
  function provider(overrides: Partial<AdminProvider> = {}): AdminProvider {
    return {
      id: 'provider-uuid-1',
      code: 'openfort',
      name: 'Openfort',
      type: 'WALLET',
      is_active: true,
      config: null,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      ...overrides,
    };
  }

  describe('isWalletCapableProvider', () => {
    it('accepts an active WALLET provider', () => {
      expect(isWalletCapableProvider(provider())).toBe(true);
    });

    it('rejects an inactive provider', () => {
      expect(isWalletCapableProvider(provider({ is_active: false }))).toBe(false);
    });

    it('rejects a non-WALLET provider', () => {
      expect(isWalletCapableProvider(provider({ type: 'FIAT_RAILS' }))).toBe(false);
    });
  });

  describe('selectWalletCapableProviders', () => {
    it('keeps only active WALLET providers', () => {
      const providers = [
        provider({ id: 'p1', type: 'WALLET', is_active: true }),
        provider({ id: 'p2', type: 'FIAT_RAILS', is_active: true }),
        provider({ id: 'p3', type: 'WALLET', is_active: false }),
        provider({ id: 'p4', type: 'WALLET', is_active: true }),
      ];

      expect(selectWalletCapableProviders(providers).map((p) => p.id)).toEqual(['p1', 'p4']);
    });
  });

  describe('providerDisplayLabel', () => {
    it('renders "Name (code)"', () => {
      expect(providerDisplayLabel(provider({ name: 'Sandbox', code: 'sbx' }))).toBe(
        'Sandbox (sbx)'
      );
    });
  });

  describe('parseProviderWalletConfig', () => {
    it('parses a valid wallet config, normalising chains', () => {
      const config = {
        wallet: {
          chains: ['Base', 'POLYGON'],
          defaultChain: 'Base',
          currency: 'usdc',
          assets: { Polygon: 'usdt' },
        },
      };

      expect(parseProviderWalletConfig(config)).toEqual({
        chains: ['base', 'polygon'],
        defaultChain: 'base',
        currency: 'USDC',
        assets: { polygon: 'USDT' },
      });
    });

    it('returns null when there is no usable wallet config', () => {
      expect(parseProviderWalletConfig(null)).toBeNull();
      expect(parseProviderWalletConfig({})).toBeNull();
      expect(parseProviderWalletConfig({ wallet: {} })).toBeNull();
      expect(
        parseProviderWalletConfig({ wallet: { chains: [], defaultChain: 'base' } })
      ).toBeNull();
      expect(parseProviderWalletConfig({ wallet: { chains: ['base'] } })).toBeNull();
    });

    it('defaults the currency to USDC when missing', () => {
      expect(
        parseProviderWalletConfig({
          wallet: { chains: ['base'], defaultChain: 'base' },
        })
      ).toEqual({ chains: ['base'], defaultChain: 'base', currency: 'USDC' });
    });
  });

  describe('resolveProviderCurrency', () => {
    const walletConfig = {
      chains: ['base', 'bitcoin'],
      defaultChain: 'base',
      currency: 'USDC',
      assets: { bitcoin: 'BTC' },
    };

    it('uses the per-chain currency when listed', () => {
      expect(resolveProviderCurrency(walletConfig, 'bitcoin')).toBe('BTC');
    });

    it('falls back to the single wallet currency otherwise', () => {
      expect(resolveProviderCurrency(walletConfig, 'base')).toBe('USDC');
    });

    it('resolves an empty chain against the default chain', () => {
      expect(resolveProviderCurrency(walletConfig, '')).toBe('USDC');
    });
  });
});

describe('buildChainOptions with a selected provider', () => {
  it('uses only the provider chains, labelled as "provider", ignoring existing/suggested', () => {
    const options = buildChainOptions({
      existingChains: ['tron'],
      suggestedChains: ['solana'],
      providerChains: ['base', 'polygon'],
    });

    expect(options).toEqual([
      { value: 'base', source: 'provider' },
      { value: 'polygon', source: 'provider' },
    ]);
  });

  it('still lets a backend-reported chain win over the provider list', () => {
    const options = buildChainOptions({
      reportedChains: ['arbitrum'],
      providerChains: ['base'],
    });

    expect(options).toEqual([
      { value: 'arbitrum', source: 'reported' },
      { value: 'base', source: 'provider' },
    ]);
  });

  it('renders no chain options when the provider list is empty', () => {
    expect(buildChainOptions({ providerChains: [] })).toEqual([]);
  });
});

describe('classifyCreateWalletError', () => {
  it('detects a customer whose KYC is not approved', () => {
    const failure = classifyCreateWalletError(
      backendError(
        `Customer ${CUSTOMER_ID} KYC status is PENDING_REVIEW. KYC must be APPROVED to create a wallet.`
      )
    );

    expect(failure.kind).toBe('kyc_not_approved');
  });

  it('extracts the rejected chain and the chains the provider supports', () => {
    const failure = classifyCreateWalletError(
      backendError(
        "Chain 'bitcoin' is not supported by provider openfort. Available chains: base, solana, tron"
      )
    );

    expect(failure).toEqual({
      kind: 'chain_not_supported',
      chain: 'bitcoin',
      availableChains: ['base', 'solana', 'tron'],
    });
  });

  it('still classifies an unsupported chain when the list is missing', () => {
    const failure = classifyCreateWalletError(
      backendError("Chain 'bitcoin' is not supported by provider openfort.")
    );

    expect(failure.kind).toBe('chain_not_supported');
    expect(failure.chain).toBe('bitcoin');
    expect(failure.availableChains).toEqual([]);
  });

  it.each([
    'Provider openfort is not configured for wallet creation. Missing wallet.chains configuration.',
    `Client ${CLIENT_ID} has no provider configured for rail btc and the openfort provider is not seeded`,
  ])('detects a missing provider configuration: %s', (message) => {
    expect(classifyCreateWalletError(backendError(message)).kind).toBe('provider_not_configured');
  });

  it('detects a customer that does not belong to the client', () => {
    const failure = classifyCreateWalletError(
      backendError(`Customer ${CUSTOMER_ID} does not belong to Client ${CLIENT_ID}`)
    );

    expect(failure.kind).toBe('customer_client_mismatch');
  });

  it('detects a customer that no longer exists', () => {
    const failure = classifyCreateWalletError(
      backendError(`Customer with id=${CUSTOMER_ID} not found`)
    );

    expect(failure.kind).toBe('customer_not_found');
  });

  it('maps an insufficient-role rejection to a permission error', () => {
    const failure = classifyCreateWalletError(
      backendError('Forbidden resource', { code: 'FORBIDDEN' })
    );

    expect(failure.kind).toBe('permission_denied');
  });

  it('maps a transport failure to a network error', () => {
    const failure = classifyCreateWalletError(new TypeError('Failed to fetch'));

    expect(failure.kind).toBe('network');
  });

  it('falls back to a generic kind for anything else', () => {
    const failure = classifyCreateWalletError(backendError('Openfort API exploded'));

    expect(failure).toEqual({ kind: 'unknown', availableChains: [] });
  });

  it('handles non-error values without throwing', () => {
    expect(classifyCreateWalletError(undefined).kind).toBe('unknown');
    expect(classifyCreateWalletError('boom').kind).toBe('unknown');
  });

  it('never carries identifiers from the backend message in its result', () => {
    const failures = [
      backendError(`Customer ${CUSTOMER_ID} KYC status is REJECTED. KYC must be APPROVED`),
      backendError(`Customer ${CUSTOMER_ID} does not belong to Client ${CLIENT_ID}`),
      backendError(`Customer with id=${CUSTOMER_ID} not found`),
    ].map(classifyCreateWalletError);

    const serialised = JSON.stringify(failures);
    expect(serialised).not.toContain(CUSTOMER_ID);
    expect(serialised).not.toContain(CLIENT_ID);
  });
});

describe('resolveProviderWalletConfig', () => {
  it('uses walletCapability when config is masked', () => {
    expect(
      resolveProviderWalletConfig({
        config: null,
        walletCapability: {
          enabled: true,
          chains: [' Tron '],
          defaultChain: 'TRON',
          currency: 'usdt',
        },
      })
    ).toEqual({ chains: ['tron'], defaultChain: 'tron', currency: 'USDT' });
  });

  it('falls back to config.wallet when walletCapability is absent', () => {
    expect(
      resolveProviderWalletConfig({
        config: { wallet: { chains: ['base'], defaultChain: 'base' } },
      })
    ).toEqual({ chains: ['base'], defaultChain: 'base', currency: 'USDC' });
  });

  it('returns null when neither source is usable', () => {
    expect(resolveProviderWalletConfig({ config: null, walletCapability: null })).toBeNull();
  });
});
