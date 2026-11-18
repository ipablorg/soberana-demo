/**
 * useKycNextSteps
 *
 * Fetches the customer's KYC snapshot FRESH from Bridge (via the
 * refreshKycSnapshot mutation — which reconciles + persists live state),
 * exposed as a TanStack Query so we get caching + dedup.
 *
 * Returns `next_step` (the single most important action to complete) and
 * `missingFields` (flat list of all pending requirement codes).
 *
 * Used by the "Próximos pasos" card in the receive flow.
 */
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/shared/lib/graphql-client';
import { useAuth } from '@/shared/hooks/use-auth';
import type { CustomerKycSnapshot } from '@/graphql/queries/customers/get-kyc-snapshot';

// Raw mutation string — typed by hand (avoids codegen dependency).
const REFRESH_DOCUMENT = `
  mutation NextStepsRefresh($input: RefreshKycSnapshotInput!) {
    customers_refreshKycSnapshot(input: $input) {
      lifecycle
      next_step { code route rail country }
      prefill
      requirements {
        missing { fields }
        pending { kind key status }
      }
      freshness { reconciliation_state }
    }
  }
`;

interface NextStepsResponse {
  customers_refreshKycSnapshot: CustomerKycSnapshot;
}

export function useKycNextSteps() {
  const { user } = useAuth();
  const customerId = user?.customer_profile_id;

  const query = useQuery({
    queryKey: ['kyc-next-steps', customerId],
    queryFn: async () => {
      return graphqlClient.request<NextStepsResponse>(REFRESH_DOCUMENT, {
        input: { customer_id: customerId },
      });
    },
    enabled: !!customerId,
    staleTime: 60_000,
    retry: 1,
  });

  const snapshot = query.data?.customers_refreshKycSnapshot;
  const nextStep = snapshot?.next_step ?? null;
  const missingFields = snapshot?.requirements?.missing?.fields ?? [];
  const hasPending =
    Boolean(nextStep) || missingFields.length > 0;

  return {
    nextStep,
    missingFields,
    snapshot,
    hasPending,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
