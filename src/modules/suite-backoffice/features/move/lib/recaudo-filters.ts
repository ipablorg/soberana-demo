/**
 * Filter model for the manual deposit queue.
 *
 * A single state: every edit applies immediately and feeds the query, whether
 * it comes from the toolbar or from a column header. The default view lists
 * pending deposits only (the historical queue), so "active" means "differs from
 * that default". Pure so it is unit testable without a renderer.
 */

import type {
  AdminRecaudoQueueFilters,
  RecaudoStatusFilter,
} from '@/graphql/types/admin-loopay';

import { withClientFilter } from '../../ops-review/lib/client-options';

/** Longest search the backend accepts (`RecaudoQueueFiltersInput.search`). */
export const RECAUDO_SEARCH_MAX_LENGTH = 100;

/** Canonical order, also the order options are listed in. */
export const RECAUDO_STATUSES: readonly RecaudoStatusFilter[] = [
  'PENDING',
  'COMPLETED',
  'REJECTED',
  'FAILED',
];

export interface RecaudoFilterValues {
  clientId: string | undefined;
  currency: string;
  providerCode: string;
  /** Global search; matched by the backend across the row's identifiers. */
  search: string;
  statuses: RecaudoStatusFilter[];
}

export type RecaudoFilterEdits = Partial<RecaudoFilterValues>;

export type RecaudoFiltersAction =
  | { type: 'edit'; changes: RecaudoFilterEdits }
  | { type: 'reset' };

export const DEFAULT_RECAUDO_FILTERS: RecaudoFilterValues = {
  clientId: undefined,
  currency: '',
  providerCode: '',
  search: '',
  statuses: ['PENDING'],
};

/** Which label the count badge uses for a status selection. */
export type RecaudoCountKind = RecaudoStatusFilter | 'MIXED';

function normalizeStatuses(
  statuses: readonly RecaudoStatusFilter[],
): RecaudoStatusFilter[] {
  return RECAUDO_STATUSES.filter((status) => statuses.includes(status));
}

function normalizeFilters(values: RecaudoFilterValues): RecaudoFilterValues {
  return {
    clientId: values.clientId,
    currency: values.currency.trim().toUpperCase(),
    providerCode: values.providerCode.trim(),
    search: values.search.trim().slice(0, RECAUDO_SEARCH_MAX_LENGTH),
    statuses: normalizeStatuses(values.statuses),
  };
}

function isSameStatuses(
  left: readonly RecaudoStatusFilter[],
  right: readonly RecaudoStatusFilter[],
): boolean {
  return (
    left.length === right.length &&
    left.every((status, index) => status === right[index])
  );
}

function isSameFilters(
  left: RecaudoFilterValues,
  right: RecaudoFilterValues,
): boolean {
  return (
    left.clientId === right.clientId &&
    left.currency === right.currency &&
    left.providerCode === right.providerCode &&
    left.search === right.search &&
    isSameStatuses(left.statuses, right.statuses)
  );
}

export function recaudoFiltersReducer(
  state: RecaudoFilterValues,
  action: RecaudoFiltersAction,
): RecaudoFilterValues {
  switch (action.type) {
    case 'edit': {
      const next = normalizeFilters({ ...state, ...action.changes });
      return isSameFilters(next, state) ? state : next;
    }
    case 'reset':
      return DEFAULT_RECAUDO_FILTERS;
  }
}

/** Adds or removes `status`, keeping the canonical order. */
export function toggleRecaudoStatus(
  statuses: readonly RecaudoStatusFilter[],
  status: RecaudoStatusFilter,
): RecaudoStatusFilter[] {
  return normalizeStatuses(
    statuses.includes(status)
      ? statuses.filter((current) => current !== status)
      : [...statuses, status],
  );
}

/** True when the status selection differs from the pending-only default. */
export function hasCustomRecaudoStatuses(
  statuses: readonly RecaudoStatusFilter[],
): boolean {
  return !isSameStatuses(
    normalizeStatuses(statuses),
    DEFAULT_RECAUDO_FILTERS.statuses,
  );
}

/** True when anything differs from the default (pending-only, no other filter). */
export function hasActiveRecaudoFilters(values: RecaudoFilterValues): boolean {
  return !isSameFilters(normalizeFilters(values), DEFAULT_RECAUDO_FILTERS);
}

/**
 * Builds the GraphQL filter. The default pending-only view omits `statuses`
 * (the backend default), an empty selection means "every status", and blank
 * fields and the "all clients" case are left out.
 */
export function toRecaudoQueueFilter(
  values: RecaudoFilterValues,
): AdminRecaudoQueueFilters {
  const filters = normalizeFilters(values);
  const statuses = filters.statuses.length
    ? filters.statuses
    : [...RECAUDO_STATUSES];
  const isDefaultView = isSameStatuses(statuses, DEFAULT_RECAUDO_FILTERS.statuses);

  return withClientFilter(
    {
      ...(filters.currency && { currency: filters.currency }),
      ...(filters.providerCode && { providerCode: filters.providerCode }),
      ...(filters.search && { search: filters.search }),
      ...(!isDefaultView && { statuses }),
    },
    filters.clientId,
  );
}

/** One status names the badge ("N aprobados"); anything else is "N depósitos". */
export function resolveRecaudoCountKind(
  statuses: readonly RecaudoStatusFilter[],
): RecaudoCountKind {
  const [only, ...rest] = normalizeStatuses(statuses);

  return only && rest.length === 0 ? only : 'MIXED';
}
