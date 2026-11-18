/**
 * Get KYC Status Query
 *
 * Query to fetch KYC verification status for a customer.
 * Returns current KYC status, ability to transact, and verification link.
 *
 * NOTE: Despite docs/GRAPHQL_INTEGRATION.md Section 6.8 claiming camelCase,
 * the actual backend schema uses snake_case for KYCStatusEntity fields.
 * Verified via schema introspection on 2026-04-08.
 */

import { TypedDocumentNode } from '@graphql-typed-document-node/core';

export interface GetKycStatusQuery {
  getBridgeKycStatus: {
    __typename?: 'KYCStatusEntity';
    can_transact: boolean;
    kyc_status: string;
    kyc_link: string | null;
    kyc_url: string | null;
    tos_link: string | null;
    rejection_reasons: string[] | null;
    customer_status: string | null;
    tos_accepted: boolean | null;
    has_tax_id: boolean | null;
    has_address: boolean | null;
    has_submitted_api_onboarding: boolean | null;
    country: string | null;
  };
}

export interface GetKycStatusQueryVariables {
  customerId: string;
}

export const GetKycStatusDocument: TypedDocumentNode<
  GetKycStatusQuery,
  GetKycStatusQueryVariables
> = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetBridgeKycStatus' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'customerId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getBridgeKycStatus' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'customerId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'customerId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'can_transact' } },
                { kind: 'Field', name: { kind: 'Name', value: 'kyc_status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'kyc_link' } },
                { kind: 'Field', name: { kind: 'Name', value: 'kyc_url' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tos_link' } },
                { kind: 'Field', name: { kind: 'Name', value: 'rejection_reasons' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customer_status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tos_accepted' } },
                { kind: 'Field', name: { kind: 'Name', value: 'has_tax_id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'has_address' } },
                { kind: 'Field', name: { kind: 'Name', value: 'has_submitted_api_onboarding' } },
                { kind: 'Field', name: { kind: 'Name', value: 'country' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as TypedDocumentNode<GetKycStatusQuery, GetKycStatusQueryVariables>;
