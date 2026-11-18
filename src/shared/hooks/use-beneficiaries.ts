import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/shared/hooks/use-auth';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { graphqlClient } from '@/shared/lib/graphql-client';
import { BeneficiariesList } from '@/graphql/queries/soberana/beneficiaries-list.query';
import { BENEFICIARIES_CREATE_MUTATION } from '@/graphql/queries/soberana/beneficiaries-create.mutation';
import { BENEFICIARIES_DELETE_MUTATION } from '@/graphql/queries/soberana/beneficiaries-delete.mutation';
import {
  type BeneficiaryResponse,
  type CreateBeneficiaryPayload,
} from '@/shared/lib/beneficiaries-api';
import { isDevMockMode } from '@/shared/lib/dev-config';
import { DEMO_BENEFICIARIES } from '@/shared/lib/tutorial-demo-data';

export interface ConditionalRequirement {
  when: Record<string, string | string[]>;
  required: string[];
}

export interface RailFieldRequirement {
  rail: string;
  applies_when: Record<string, string | string[]>;
  required: string[];
  optional: string[];
  forbidden?: string[];
  conditional_required?: ConditionalRequirement[];
  notes?: string[];
}

export interface CreateBeneficiaryFieldRequirements {
  base_required: string[];
  base_optional: string[];
  rails: RailFieldRequirement[];
  conditional_required: ConditionalRequirement[];
  resolution_rules: {
    payment_rail: 'optional';
    behavior_when_missing: string;
  };
}

interface DeleteBeneficiaryResult {
  success: boolean;
  id: string;
  provider_external_deleted: boolean;
  provider_code?: string | null;
}

const CREATE_BENEFICIARY_FIELD_REQUIREMENTS_QUERY = /* GraphQL */ `
  query BeneficiariesCreateFieldRequirements {
    beneficiaries_createFieldRequirements {
      base_required
      base_optional
      rails {
        rail
        applies_when
        required
        optional
        forbidden
        notes
        conditional_required {
          when
          required
        }
      }
      conditional_required {
        when
        required
      }
      resolution_rules {
        payment_rail
        behavior_when_missing
      }
    }
  }
`;

interface BeneficiariesListResult {
  beneficiaries_list: BeneficiaryResponse[];
}

interface BeneficiariesCreateFieldRequirementsResult {
  beneficiaries_createFieldRequirements: CreateBeneficiaryFieldRequirements | null;
}

export function useBeneficiaries() {
  const { user } = useAuth();
  const customerId = user?.customer_profile_id;
  const isDemo = isDevMockMode();

  // beneficiaries_list returns JSON scalar — codegen can't produce typed
  // sub-fields, so we bypass the document generic and cast the result below.
  const query = useGraphQLQuery(
    ['beneficiaries', 'list', customerId],
    BeneficiariesList as never,
    { customerId: customerId! },
    {
      enabled: !isDemo && !!customerId,
    }
  );

  // Local demo override: saved beneficiaries so the money-out demo can run
  // without a backend.
  if (isDemo) {
    return {
      beneficiaries: DEMO_BENEFICIARIES as unknown as BeneficiaryResponse[],
      isLoading: false,
      error: null,
      refetch: query.refetch,
    };
  }

  return {
    beneficiaries: (query.data as BeneficiariesListResult | undefined)?.beneficiaries_list ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateBeneficiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBeneficiaryPayload) => {
      const result = await graphqlClient.request<{ beneficiaries_create: BeneficiaryResponse }>(
        BENEFICIARIES_CREATE_MUTATION,
        { input: payload },
      );
      return result.beneficiaries_create;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });
}

export function useCreateBeneficiaryFieldRequirements() {
  return useQuery({
    queryKey: ['beneficiaries', 'createFieldRequirements'],
    queryFn: async (): Promise<CreateBeneficiaryFieldRequirements | null> => {
      const result =
        await graphqlClient.request<BeneficiariesCreateFieldRequirementsResult>(
          CREATE_BENEFICIARY_FIELD_REQUIREMENTS_QUERY,
        );

      const raw = result.beneficiaries_createFieldRequirements;
      if (!raw) return null;
      return raw;
    },
    staleTime: 5 * 60_000,
  });
}

export function useDeleteBeneficiary() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<DeleteBeneficiaryResult> => {
      const customerId = user?.customer_profile_id;
      if (!customerId) {
        throw new Error('Missing customer context for beneficiary delete');
      }

      const result = await graphqlClient.request<{
        beneficiaries_delete: DeleteBeneficiaryResult;
      }>(BENEFICIARIES_DELETE_MUTATION, {
        id,
        customerId,
      });

      return result.beneficiaries_delete;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });
}
