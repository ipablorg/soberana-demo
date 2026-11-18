/**
 * Filter state for the manual deposit queue.
 *
 * Thin `useReducer` wrapper over the pure model in `lib/recaudo-filters`. One
 * state feeds the toolbar, the column headers and the query: every edit applies
 * immediately, and `filter` is memoized so an unchanged state keeps its query
 * key.
 */

import { useCallback, useMemo, useReducer } from 'react';

import type { AdminRecaudoQueueFilters } from '@/graphql/types/admin-loopay';

import {
  DEFAULT_RECAUDO_FILTERS,
  hasActiveRecaudoFilters,
  recaudoFiltersReducer,
  toRecaudoQueueFilter,
  type RecaudoFilterEdits,
  type RecaudoFilterValues,
} from '../lib/recaudo-filters';

interface UseRecaudoFilters {
  values: RecaudoFilterValues;
  /** Query filter built from the values. */
  filter: AdminRecaudoQueueFilters;
  /** Anything differs from the default pending-only view. */
  hasActiveFilters: boolean;
  edit: (changes: RecaudoFilterEdits) => void;
  reset: () => void;
}

export function useRecaudoFilters(): UseRecaudoFilters {
  const [values, dispatch] = useReducer(
    recaudoFiltersReducer,
    DEFAULT_RECAUDO_FILTERS,
  );

  const filter = useMemo(() => toRecaudoQueueFilter(values), [values]);

  const edit = useCallback(
    (changes: RecaudoFilterEdits) => dispatch({ type: 'edit', changes }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  return {
    values,
    filter,
    hasActiveFilters: hasActiveRecaudoFilters(values),
    edit,
    reset,
  };
}
