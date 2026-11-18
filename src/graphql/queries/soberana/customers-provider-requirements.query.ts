/**
 * Customer provider requirements (S21): what a VA provider still needs from the
 * customer (documents, values, UBO steps), with its review status.
 *
 * Tenant/customer auth, like `virtualAccounts_receiveOptions`.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';

import type { ProviderRequirement } from '@/graphql/types/provider-requirements';

/** Selection of `ProviderRequirementEntity`, shared with the submit mutation. */
export const PROVIDER_REQUIREMENT_FIELDS = `
  id
  endorsementId
  customerId
  provider
  railCode
  source
  blockerCode
  key
  group
  kind
  status
  documents {
    id
    fileName
    mimeType
    uploadedAt
  }
  value
  rejectReason
  requestedAt
  updatedAt
  dueAt
  options
  handling
`;

export interface CustomersProviderRequirementsQuery {
  customers_providerRequirements: ProviderRequirement[];
}

export interface CustomersProviderRequirementsQueryVariables {
  customerId: string;
}

export const CustomersProviderRequirementsDocument = parse(/* GraphQL */ `
  query customers_providerRequirements($customerId: String!) {
    customers_providerRequirements(customerId: $customerId) {
      ${PROVIDER_REQUIREMENT_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  CustomersProviderRequirementsQuery,
  CustomersProviderRequirementsQueryVariables
>;
