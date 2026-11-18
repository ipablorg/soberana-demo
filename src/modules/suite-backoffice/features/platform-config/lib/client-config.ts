/**
 * Pure helpers for the per-client config tabs.
 *
 * Wallet defaults live under `client.config.defaults` (backend
 * `ClientDefaultsConfig`): `walletProviderId` is a provider UUID,
 * `walletDefaultChain` / `walletDefaultCurrency` are free strings. The update
 * always sends the whole existing config with only those three keys replaced,
 * so no other config key is ever dropped.
 */

import type { AdminJsonObject } from '@/graphql/types/admin-loopay';

import { isPlainObject } from './catalog-forms';

export interface ClientWalletDefaults {
  walletProviderId: string;
  walletDefaultChain: string;
  walletDefaultCurrency: string;
}

export const EMPTY_WALLET_DEFAULTS: ClientWalletDefaults = {
  walletProviderId: '',
  walletDefaultChain: '',
  walletDefaultCurrency: '',
};

function readString(record: AdminJsonObject, key: string): string {
  const value = record[key];
  return typeof value === 'string' ? value : '';
}

export function readWalletDefaults(config: unknown): ClientWalletDefaults {
  const defaults =
    isPlainObject(config) && isPlainObject(config.defaults) ? config.defaults : {};

  return {
    walletProviderId: readString(defaults, 'walletProviderId'),
    walletDefaultChain: readString(defaults, 'walletDefaultChain'),
    walletDefaultCurrency: readString(defaults, 'walletDefaultCurrency'),
  };
}

export function areWalletDefaultsComplete(defaults: ClientWalletDefaults): boolean {
  return (
    defaults.walletProviderId.trim().length > 0 &&
    defaults.walletDefaultChain.trim().length > 0 &&
    defaults.walletDefaultCurrency.trim().length > 0
  );
}

/** Existing config with only the three wallet default keys replaced. */
export function mergeWalletDefaults(
  config: unknown,
  defaults: ClientWalletDefaults,
): AdminJsonObject {
  const base = isPlainObject(config) ? config : {};
  const currentDefaults = isPlainObject(base.defaults) ? base.defaults : {};

  return {
    ...base,
    defaults: {
      ...currentDefaults,
      walletProviderId: defaults.walletProviderId.trim(),
      walletDefaultChain: defaults.walletDefaultChain.trim(),
      walletDefaultCurrency: defaults.walletDefaultCurrency.trim(),
    },
  };
}

/** Client junction priority: backend `@IsInt() @Min(1)`. */
export function parsePriority(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) return null;
  const parsed = Number(value.trim());
  return Number.isSafeInteger(parsed) && parsed >= 1 ? parsed : null;
}
