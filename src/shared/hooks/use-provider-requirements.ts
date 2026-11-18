/**
 * Customer provider requirements (S21): what a VA provider still needs from
 * the signed-in customer (`customers_providerRequirements`) and the answer to
 * one of them (`customers_submitProviderRequirement`, status → UPLOADED).
 * A submit refreshes the list, so the dashboard banner and the upload dialog
 * reflect the new status.
 */

import { useQueryClient } from '@tanstack/react-query';

import {
  CustomersProviderRequirementsDocument,
  type CustomersProviderRequirementsQuery,
  type CustomersProviderRequirementsQueryVariables,
} from '@/graphql/queries/soberana/customers-provider-requirements.query';
import {
  CustomersSubmitProviderRequirementDocument,
  type CustomersSubmitProviderRequirementMutation,
  type CustomersSubmitProviderRequirementMutationVariables,
} from '@/graphql/mutations/soberana/customers-submit-provider-requirement.mutation';
import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

export const PROVIDER_REQUIREMENTS_QUERY_KEY = ['customers', 'providerRequirements'] as const;

export function useCustomerProviderRequirements(customerId: string | null | undefined) {
  return useGraphQLQuery<
    CustomersProviderRequirementsQuery,
    CustomersProviderRequirementsQueryVariables
  >(
    [...PROVIDER_REQUIREMENTS_QUERY_KEY],
    CustomersProviderRequirementsDocument,
    {
      customerId: customerId ?? '',
    },
    {
      enabled: Boolean(customerId),
      staleTime: 60_000,
      // A customer without requirements (or an older backend) simply sees no banner.
      retry: false,
    }
  );
}

export function useSubmitProviderRequirement(
  options: {
    onSuccess?: (result: CustomersSubmitProviderRequirementMutation) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const queryClient = useQueryClient();

  return useGraphQLMutation<
    CustomersSubmitProviderRequirementMutation,
    CustomersSubmitProviderRequirementMutationVariables
  >(CustomersSubmitProviderRequirementDocument, {
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: [...PROVIDER_REQUIREMENTS_QUERY_KEY] });
      options.onSuccess?.(result);
    },
    onError: (error) => options.onError?.(error),
  });
}
