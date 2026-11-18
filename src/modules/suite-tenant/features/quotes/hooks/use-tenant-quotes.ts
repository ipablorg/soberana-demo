/** Indicative rates and persisted quotes of the tenant (`/v1/quotes`). */

import { useLingui } from '@lingui/react/macro';

import {
  TenantCreateQuoteDocument,
  type TenantCreateQuoteMutation,
} from '@/graphql/mutations/tenant';
import { TenantGetQuoteDocument, TenantQuoteRateDocument } from '@/graphql/queries/tenant';
import type { TenantQuoteRateFilters } from '@/graphql/types/tenant';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { useTenantMutation } from '@/modules/suite-tenant/hooks/use-tenant-mutation';
import { tenantQueryKeys } from '@/modules/suite-tenant/lib/tenant-query-keys';

/** Indicative (not locked) rate; runs only once a pair is submitted. */
export function useTenantQuoteRate(filters: TenantQuoteRateFilters | null) {
  return useGraphQLQuery(
    [...tenantQueryKeys.quoteRate],
    TenantQuoteRateDocument,
    { filters: filters ?? { from: '', to: '' } },
    { enabled: filters !== null }
  );
}

export function useTenantQuote(id: string) {
  return useGraphQLQuery([...tenantQueryKeys.quote(id)], TenantGetQuoteDocument, { id });
}

export function useCreateTenantQuote(onCompleted?: (result: TenantCreateQuoteMutation) => void) {
  const { t } = useLingui();

  return useTenantMutation(TenantCreateQuoteDocument, {
    invalidate: [],
    successMessage: t`Quote ready.`,
    errorMessage: t`We couldn't create the quote`,
    messagesByCode: {
      PAIR_UNSUPPORTED: t`That currency pair is not supported.`,
      MANUAL_RATE_REQUIRED: t`This pair needs a manual rate. Contact your account manager.`,
    },
    onCompleted,
  });
}
