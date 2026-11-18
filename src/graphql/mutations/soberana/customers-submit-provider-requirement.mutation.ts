/**
 * Submit Provider Requirement Mutation (S21)
 *
 * The customer answers one provider requirement: base64 documents and/or a
 * value. The requirement moves to UPLOADED, waiting for Comercial's review.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';

import type {
  ProviderRequirement,
  SubmitProviderRequirementInput,
} from '@/graphql/types/provider-requirements';

import { PROVIDER_REQUIREMENT_FIELDS } from '../../queries/soberana/customers-provider-requirements.query';

export interface CustomersSubmitProviderRequirementMutation {
  customers_submitProviderRequirement: ProviderRequirement;
}

export interface CustomersSubmitProviderRequirementMutationVariables {
  input: SubmitProviderRequirementInput;
}

export const CustomersSubmitProviderRequirementDocument = parse(/* GraphQL */ `
  mutation customers_submitProviderRequirement($input: SubmitProviderRequirementInput!) {
    customers_submitProviderRequirement(input: $input) {
      ${PROVIDER_REQUIREMENT_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  CustomersSubmitProviderRequirementMutation,
  CustomersSubmitProviderRequirementMutationVariables
>;
