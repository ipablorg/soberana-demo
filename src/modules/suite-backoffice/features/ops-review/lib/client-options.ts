/**
 * Pure helpers for the ops queue client selector.
 *
 * Kept free of React so the ordering and the "all clients" sentinel mapping
 * are unit testable without a renderer.
 */

import type { AdminClientOption } from '@/graphql/types/admin-loopay';

/** Select value that stands for "no client filter". */
export const ALL_CLIENTS_VALUE = '__all_clients__';

/** Active clients first, then alphabetical by display name. */
export function sortClientOptions(
  options: readonly AdminClientOption[],
): AdminClientOption[] {
  return [...options].sort((left, right) => {
    if (left.is_active !== right.is_active) return left.is_active ? -1 : 1;
    return left.client_name.localeCompare(right.client_name, 'es');
  });
}

/** Maps the select value back to the queue `filter.clientId`. */
export function toClientIdFilter(value: string): string | undefined {
  return value === ALL_CLIENTS_VALUE ? undefined : value;
}

/** Spreads `clientId` into a queue filter only when a client is selected. */
export function withClientFilter<TFilter extends object>(
  filter: TFilter,
  clientId: string | undefined,
): TFilter & { clientId?: string } {
  return clientId ? { ...filter, clientId } : filter;
}
