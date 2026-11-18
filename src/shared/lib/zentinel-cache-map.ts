/**
 * Mapping from Zentinel's `invalidate_cache` strings to TanStack Query
 * keys used across the Soberana frontend.
 *
 * The Zentinel backend returns dot-path descriptors of what it just
 * mutated (e.g. `wallets.balance`, `beneficiaries`). The frontend
 * stores those same concepts under different keys — sometimes an
 * array of segments, sometimes with ids. This table is the explicit
 * bridge so that when a plan is confirmed, we invalidate the *right*
 * caches without guessing.
 *
 * When a backend key is unknown, `resolveCacheKeys` falls back to
 * `[key_string]` + `[first_segment]` so stale data is still cleared
 * defensively; unmapped keys are reported via `collectUnmappedKeys`
 * for follow-up.
 *
 * Sources for the current mapping (searched across src/shared/hooks
 * and feature modules):
 *   - `use-wallets.ts`             → ['wallets']
 *   - `use-wallet-balance.ts`      → ['wallet-balance', walletId]
 *   - `use-wallet-transactions`    → ['wallet-transactions', walletId]
 *   - `use-beneficiaries.ts`       → ['beneficiaries']
 *   - `useBankAccounts.ts`         → ['bank-accounts']
 *   - `useCreateOffRamp.ts`        → ['transactions', 'offramp']
 *   - KYC hooks                    → ['kyc', 'status']
 */

import type { QueryKey } from '@tanstack/react-query';

const CACHE_KEY_MAP: Record<string, QueryKey[]> = {
  // Wallet domain
  'wallets.balance': [['wallets'], ['wallet-balance']],
  'wallets.transactions': [['wallet-transactions'], ['transactions']],
  wallets: [['wallets'], ['wallet-balance']],

  // Beneficiary domain
  beneficiaries: [['beneficiaries']],
  'beneficiaries.create': [['beneficiaries']],

  // Transactions / rails
  transactions: [['transactions'], ['wallet-transactions']],
  'transactions.offramp': [['transactions'], ['wallet-transactions']],
  'transactions.onramp': [['transactions'], ['wallet-transactions']],

  // Bank accounts
  bank_accounts: [['bank-accounts']],
  'bank_accounts.create': [['bank-accounts']],

  // Customer / KYC
  customers: [['customer'], ['auth', 'me']],
  'customers.kyc': [['kyc'], ['kyc', 'status']],
  kyc: [['kyc'], ['kyc', 'status']],
};

/**
 * Resolve a backend invalidation key into the frontend TanStack keys
 * that should be invalidated. Unknown keys fall back to a conservative
 * pair: the raw key string, and its first dot-segment (so
 * `foo.bar.baz` invalidates `[foo.bar.baz]` and `[foo]`).
 */
export function resolveCacheKeys(backend_key: string): QueryKey[] {
  const mapped = CACHE_KEY_MAP[backend_key];
  if (mapped && mapped.length > 0) return mapped;
  const first_segment = backend_key.split('.')[0];
  const fallback: QueryKey[] = [[backend_key]];
  if (first_segment && first_segment !== backend_key) {
    fallback.push([first_segment]);
  }
  return fallback;
}

/**
 * Given a list of backend keys, return the subset that is NOT in the
 * static map. Useful for logging follow-ups without polluting the UI.
 */
export function collectUnmappedKeys(backend_keys: string[]): string[] {
  return backend_keys.filter((k) => !(k in CACHE_KEY_MAP));
}

export const __CACHE_KEY_MAP_FOR_TESTS = CACHE_KEY_MAP;
