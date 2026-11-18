/**
 * Customer search hook for the UUID manual-operation forms.
 *
 * Debounces the typed term and only queries `adminLoopay_listCustomers` once it
 * is at least three characters, so the picker never fires on every keystroke.
 */

import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { useDebounce } from '@/shared/hooks/use-debounce';
import {
  ListCustomersSearchDocument,
  type ListCustomersSearchQuery,
  type ListCustomersSearchQueryVariables,
} from '@/graphql/queries/admin-loopay';

import { opsQueryKeys } from '../lib/ops-query-keys';

const MIN_TERM_LENGTH = 3;

export function useCustomerSearch(term: string) {
  const debouncedTerm = useDebounce(term.trim(), 300);
  const enabled = debouncedTerm.length >= MIN_TERM_LENGTH;

  return useGraphQLQuery<
    ListCustomersSearchQuery,
    ListCustomersSearchQueryVariables
  >(
    [...opsQueryKeys.customerSearch(debouncedTerm)],
    ListCustomersSearchDocument,
    { where: { email: debouncedTerm }, take: 20 },
    {
      enabled,
      staleTime: 60_000,
    },
  );
}
