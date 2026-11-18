/**
 * useCustomerProfile
 *
 * The signed-in customer's profile (`customers_findById`): the source of
 * record for the tax id, legal name and registered address that the KYC
 * snapshot prefill does not carry. Shares its cache entry with `useKYC` so
 * mounting it never adds a request when the KYC hook already fetched it.
 */
import { useQuery } from '@tanstack/react-query';
import {
  GetCustomerProfileDocument,
  type CustomerProfile,
  type GetCustomerProfileQuery,
  type GetCustomerProfileQueryVariables,
} from '@/graphql/queries/customers/get-customer-profile';
import { useAuth } from '@/shared/hooks/use-auth';
import { graphqlClient } from '@/shared/lib/graphql-client';

export function useCustomerProfile(): { profile: CustomerProfile | null; isLoading: boolean } {
  const { user } = useAuth();
  const customerId = user?.customer_profile_id;

  const query = useQuery({
    queryKey: ['kyc-customer-profile', customerId],
    queryFn: () =>
      graphqlClient.request<GetCustomerProfileQuery, GetCustomerProfileQueryVariables>(
        GetCustomerProfileDocument,
        { id: customerId as string }
      ),
    enabled: Boolean(customerId),
    staleTime: 60_000,
  });

  return { profile: query.data?.customers_findById ?? null, isLoading: query.isLoading };
}
