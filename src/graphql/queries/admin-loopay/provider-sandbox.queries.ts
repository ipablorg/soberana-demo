/**
 * admin-loopay provider sandbox availability. Mirrors
 * `adminLoopay_providerSandboxAvailability` in
 * `src/modules/admin-loopay/sandbox-tools` on the backend (LOOPAY_ADMIN,
 * LOOPAY_OPERATIONS or legacy OPS_KYC).
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';

export interface ProviderSandboxAvailability {
  mesta: boolean;
  kirafin: boolean;
}

export interface ProviderSandboxAvailabilityQuery {
  adminLoopay_providerSandboxAvailability: ProviderSandboxAvailability;
}

export type ProviderSandboxAvailabilityQueryVariables = Record<string, never>;

export const ProviderSandboxAvailabilityDocument = parse(/* GraphQL */ `
  query AdminLoopayProviderSandboxAvailability {
    adminLoopay_providerSandboxAvailability {
      mesta
      kirafin
    }
  }
`) as unknown as TypedDocumentNode<
  ProviderSandboxAvailabilityQuery,
  ProviderSandboxAvailabilityQueryVariables
>;
