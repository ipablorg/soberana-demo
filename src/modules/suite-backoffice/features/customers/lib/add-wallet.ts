/**
 * Pure rules for the Customer 360 "Agregar billetera" action.
 *
 * `adminLoopay_createWallet` (LOOPAY_ADMIN, LOOPAY_OPERATIONS, OPS_VA, OPS_COMMERCIAL) provisions a custodial wallet through
 * the provider mapped to the client. The backend decides the currency (from the
 * provider's wallet config), validates the chain against that config and is
 * idempotent, so everything here only shapes the input, decides when the action
 * is offered and turns backend failures into a stable, id-free classification.
 */

import type { AdminListedProvider as AdminProvider } from '@/graphql/queries/admin-loopay/platform-config.queries';
import type {
  AdminClientKycStatus,
  AdminCreateWalletInput,
} from '@/graphql/types/admin-loopay';
import { mapError } from '@/shared/lib/error-mapper';

/** Backend `@MaxLength` limits of `AdminCreateWalletInput`. */
export const MAX_CHAIN_LENGTH = 20;
export const MAX_ALIAS_LENGTH = 100;

/**
 * Common chains offered as SUGGESTIONS only. They are not authoritative: the
 * backend validates the chain against the provider configuration and reports
 * the supported ones when it rejects a chain.
 */
export const SUGGESTED_CHAINS = [
  'base',
  'solana',
  'tron',
  'ethereum',
  'polygon',
  'bitcoin',
] as const;

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

export type AddWalletBlockReason = 'kyc_not_approved';

export interface AddWalletAvailability {
  /** Render the action at all (roles in `ADD_WALLET_ROLES`). */
  visible: boolean;
  /** The action can be used right now. */
  enabled: boolean;
  /** Why a visible action is disabled. */
  blockedReason: AddWalletBlockReason | null;
}

export function getAddWalletAvailability({
  isAdmin,
  kycStatus,
}: {
  isAdmin: boolean;
  kycStatus: AdminClientKycStatus;
}): AddWalletAvailability {
  if (!isAdmin) {
    return { visible: false, enabled: false, blockedReason: null };
  }

  if (kycStatus !== 'APPROVED') {
    return { visible: true, enabled: false, blockedReason: 'kyc_not_approved' };
  }

  return { visible: true, enabled: true, blockedReason: null };
}

// ---------------------------------------------------------------------------
// Chains and input
// ---------------------------------------------------------------------------

export function normalizeChain(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

/** Selector sentinels: "let the provider pick" and "type another chain". */
export const DEFAULT_CHAIN_CHOICE = '__default__';
export const CUSTOM_CHAIN_CHOICE = '__custom__';

/** Chain to send for a selector choice; `''` means "omit, use the provider default". */
export function resolveChain(choice: string, customChain: string): string {
  if (choice === DEFAULT_CHAIN_CHOICE) return '';
  if (choice === CUSTOM_CHAIN_CHOICE) return normalizeChain(customChain);
  return normalizeChain(choice);
}

export type ChainOptionSource =
  | 'reported'
  | 'existing'
  | 'suggested'
  | 'provider';

export interface ChainOption {
  value: string;
  source: ChainOptionSource;
}

/**
 * Merges the chain sources into one deduped list. Precedence (highest first):
 * chains the backend itself reported as supported, then either (a) the real
 * chains of an explicitly selected provider (`providerChains`, when given —
 * replaces the existing-wallet and suggested tiers entirely, since they are
 * no longer relevant once a specific provider's config is known) or (b) the
 * chains the customer already has wallets on, and finally the static
 * suggestions.
 */
export function buildChainOptions({
  reportedChains = [],
  existingChains = [],
  suggestedChains = SUGGESTED_CHAINS,
  providerChains,
}: {
  reportedChains?: readonly (string | null | undefined)[];
  existingChains?: readonly (string | null | undefined)[];
  suggestedChains?: readonly string[];
  /**
   * Real chains of an explicitly selected wallet-capable provider. When
   * given (even as an empty array), `existingChains` and `suggestedChains`
   * are ignored: the provider's own configuration is now the source of
   * truth for what can be offered.
   */
  providerChains?: readonly (string | null | undefined)[];
}): ChainOption[] {
  const seen = new Set<string>();
  const options: ChainOption[] = [];

  const add = (
    chains: readonly (string | null | undefined)[],
    source: ChainOptionSource,
  ) => {
    for (const raw of chains) {
      const value = normalizeChain(raw);
      if (!value || seen.has(value)) continue;
      seen.add(value);
      options.push({ value, source });
    }
  };

  add(reportedChains, 'reported');
  if (providerChains) {
    add(providerChains, 'provider');
  } else {
    add(existingChains, 'existing');
    add(suggestedChains, 'suggested');
  }

  return options;
}

/** Builds the mutation input, omitting empty optionals. */
export function buildCreateWalletInput({
  clientId,
  customerId,
  chain,
  alias,
  providerId,
}: {
  clientId: string;
  customerId: string;
  chain?: string | null;
  alias?: string | null;
  /** Omitted when it is the "Automático" sentinel or empty: the backend then resolves it. */
  providerId?: string | null;
}): AdminCreateWalletInput {
  const normalizedChain = normalizeChain(chain);
  const trimmedAlias = (alias ?? '').trim();
  const trimmedProviderId = (providerId ?? '').trim();
  const explicitProviderId =
    trimmedProviderId && trimmedProviderId !== AUTO_PROVIDER_CHOICE
      ? trimmedProviderId
      : '';

  return {
    clientId,
    customerId,
    ...(normalizedChain && { chain: normalizedChain }),
    ...(trimmedAlias && { alias: trimmedAlias }),
    ...(explicitProviderId && { providerId: explicitProviderId }),
  };
}

// ---------------------------------------------------------------------------
// Custody provider selection
// ---------------------------------------------------------------------------

/** Selector sentinel: "let the backend resolve the provider" (today's behavior). */
export const AUTO_PROVIDER_CHOICE = '__auto_provider__';

/** Only active WALLET-type providers can be offered for wallet creation. */
export function isWalletCapableProvider(
  provider: Pick<AdminProvider, 'type' | 'is_active'>,
): boolean {
  return provider.type === 'WALLET' && provider.is_active;
}

/** Filters the platform catalog down to the providers selectable here. */
export function selectWalletCapableProviders(
  providers: readonly AdminProvider[],
): AdminProvider[] {
  return providers.filter(isWalletCapableProvider);
}

/** "Name (code)" — how a provider is shown in the selector. */
export function providerDisplayLabel(
  provider: Pick<AdminProvider, 'name' | 'code'>,
): string {
  return `${provider.name} (${provider.code})`;
}

export interface ProviderWalletConfig {
  chains: string[];
  defaultChain: string;
  currency: string;
  /** Per-chain currency override (chain -> currency), when the provider sets one. */
  assets?: Record<string, string>;
}

/**
 * Defensively parses `provider.config.wallet` into the shape the backend's
 * own `getProviderWalletConfig` validates against. Returns null for anything
 * that would make the backend itself refuse the provider for wallet creation
 * (missing/malformed `chains` or `defaultChain`).
 */
export function parseProviderWalletConfig(
  config: unknown,
): ProviderWalletConfig | null {
  if (!config || typeof config !== 'object') return null;
  const wallet = (config as Record<string, unknown>).wallet;
  if (!wallet || typeof wallet !== 'object') return null;

  const raw = wallet as Record<string, unknown>;
  if (!Array.isArray(raw.chains) || typeof raw.defaultChain !== 'string') {
    return null;
  }

  const chains = raw.chains
    .filter((chain): chain is string => typeof chain === 'string')
    .map((chain) => normalizeChain(chain))
    .filter(Boolean);
  if (chains.length === 0) return null;

  const defaultChain = normalizeChain(raw.defaultChain);
  const currency =
    typeof raw.currency === 'string' && raw.currency.trim()
      ? raw.currency.trim().toUpperCase()
      : 'USDC';
  const assets = parseWalletAssets(raw.assets);

  return {
    chains,
    defaultChain,
    currency,
    ...(assets ? { assets } : {}),
  };
}

/**
 * Wallet config of a listed provider. Prefers the non-secret
 * `walletCapability` (returned to every staff role, even when `config` is
 * masked) and falls back to `config.wallet` (PLATFORM_ADMIN / LOOPAY_ADMIN or
 * older backends). Per-chain `assets` only exist in `config`, so they are
 * merged in when visible.
 */
export function resolveProviderWalletConfig(
  provider: Pick<AdminProvider, 'config' | 'walletCapability'>,
): ProviderWalletConfig | null {
  const fromConfig = parseProviderWalletConfig(provider.config);
  const capability = provider.walletCapability;

  if (capability?.enabled && capability.defaultChain) {
    const chains = capability.chains
      .map((chain) => normalizeChain(chain))
      .filter(Boolean);
    if (chains.length > 0) {
      return {
        chains,
        defaultChain: normalizeChain(capability.defaultChain),
        currency: capability.currency?.trim().toUpperCase() || 'USDC',
        ...(fromConfig?.assets ? { assets: fromConfig.assets } : {}),
      };
    }
  }

  return fromConfig;
}

function parseWalletAssets(
  rawAssets: unknown,
): Record<string, string> | undefined {
  if (
    !rawAssets ||
    typeof rawAssets !== 'object' ||
    Array.isArray(rawAssets)
  ) {
    return undefined;
  }

  const assets: Record<string, string> = {};
  for (const [chain, currency] of Object.entries(
    rawAssets as Record<string, unknown>,
  )) {
    if (typeof currency === 'string' && currency.trim()) {
      assets[normalizeChain(chain)] = currency.trim().toUpperCase();
    }
  }

  return Object.keys(assets).length > 0 ? assets : undefined;
}

/**
 * Currency for a wallet created on `chain` with this provider: the per-chain
 * entry of `assets` when present, otherwise the provider's single currency.
 * An empty chain resolves against the provider's default chain.
 */
export function resolveProviderCurrency(
  walletConfig: ProviderWalletConfig,
  chain: string,
): string {
  const key = normalizeChain(chain) || walletConfig.defaultChain;
  return walletConfig.assets?.[key] ?? walletConfig.currency;
}

// ---------------------------------------------------------------------------
// Error classification
// ---------------------------------------------------------------------------

export type CreateWalletErrorKind =
  | 'kyc_not_approved'
  | 'chain_not_supported'
  | 'provider_not_configured'
  | 'customer_client_mismatch'
  | 'customer_not_found'
  | 'permission_denied'
  | 'network'
  | 'unknown';

export interface CreateWalletFailure {
  kind: CreateWalletErrorKind;
  /** Rejected chain (`chain_not_supported` only). */
  chain?: string;
  /** Chains the provider accepts, when the backend lists them. */
  availableChains: string[];
}

/**
 * The real backend message lives in `response.errors[0].message`; the outer
 * `Error.message` of a graphql-request failure also embeds the whole request.
 * The result is only ever matched against, never displayed.
 */
function readBackendMessage(error: unknown): string {
  const gqlMessage = (
    error as { response?: { errors?: { message?: unknown }[] } } | null
  )?.response?.errors?.[0]?.message;

  if (typeof gqlMessage === 'string' && gqlMessage.length > 0) return gqlMessage;
  if (error instanceof Error) return error.message;
  if (typeof (error as { message?: unknown } | null)?.message === 'string') {
    return (error as { message: string }).message;
  }
  return typeof error === 'string' ? error : '';
}

const UNSUPPORTED_CHAIN_PATTERN =
  /Chain '([^']*)' is not supported by provider \S+?\.(?:\s*Available chains:\s*([^\n]*))?/i;

export function classifyCreateWalletError(error: unknown): CreateWalletFailure {
  const message = readBackendMessage(error);

  if (/kyc must be approved|kyc status is/i.test(message)) {
    return { kind: 'kyc_not_approved', availableChains: [] };
  }

  const unsupported = UNSUPPORTED_CHAIN_PATTERN.exec(message);
  if (unsupported) {
    const availableChains = (unsupported[2] ?? '')
      .split(',')
      .map((chain) => normalizeChain(chain.replace(/\.$/, '')))
      .filter(Boolean);

    return {
      kind: 'chain_not_supported',
      chain: normalizeChain(unsupported[1]),
      availableChains,
    };
  }

  if (
    /not configured for wallet creation|missing wallet\.chains|has no provider configured|provider is not seeded/i.test(
      message,
    )
  ) {
    return { kind: 'provider_not_configured', availableChains: [] };
  }

  if (/does not belong to client/i.test(message)) {
    return { kind: 'customer_client_mismatch', availableChains: [] };
  }

  if (/customer with id=\S+ not found/i.test(message)) {
    return { kind: 'customer_not_found', availableChains: [] };
  }

  // Everything wallet-specific was handled above; what is left is classified
  // by the shared mapper (403 / FORBIDDEN, transport failures) or is unknown.
  const { category } = mapError(error);
  if (category === 'PERMISSION') {
    return { kind: 'permission_denied', availableChains: [] };
  }
  if (category === 'NETWORK') {
    return { kind: 'network', availableChains: [] };
  }

  return { kind: 'unknown', availableChains: [] };
}
