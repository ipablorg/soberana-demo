import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/shared/hooks/use-auth';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { CustomersListEndorsements } from '@/graphql/queries/soberana/customers-list-endorsements.query';
import { CustomersAddEndorsement } from '@/graphql/mutations/soberana/customers-add-endorsement.mutation';
import type {
  ReceiveActivationActionLink,
  ReceiveEndorsement,
} from '@/shared/lib/receive-account-view-model';

interface AddEndorsementResponseResult {
  customers_addEndorsement?: {
    id?: string;
    payment_rail?: string;
    status?: string;
    created_at?: string;
    kyc_link?: string | null;
    tos_link?: string | null;
  };
}

interface ListEndorsementsResult {
  customers_listEndorsements: {
    data: ReceiveEndorsement[];
    total: number;
  };
}

export function useEndorsements() {
  const { user } = useAuth();
  const customerId = user?.customer_profile_id;

  const query = useGraphQLQuery(
    ['endorsements', 'list', customerId],
    CustomersListEndorsements as never,
    { id: customerId! },
    { enabled: !!customerId }
  );

  const result = (query.data as ListEndorsementsResult | undefined)?.customers_listEndorsements;

  return {
    endorsements: result?.data ?? [],
    total: result?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function getAddEndorsementActionLink(
  result: AddEndorsementResponseResult | null | undefined,
): ReceiveActivationActionLink | null {
  const response = result?.customers_addEndorsement;

  if (response?.kyc_link) {
    return { type: 'kyc', url: response.kyc_link };
  }

  if (response?.tos_link) {
    return { type: 'tos', url: response.tos_link };
  }

  return null;
}

export function useAddEndorsement() {
  const queryClient = useQueryClient();

  return useGraphQLMutation(CustomersAddEndorsement as never, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endorsements', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['wallets', 'depositInstructions'] });
    },
  });
}
