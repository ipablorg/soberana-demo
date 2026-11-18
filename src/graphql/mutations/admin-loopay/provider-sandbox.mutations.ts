/**
 * admin-loopay provider sandbox simulators (super admin / operations).
 *
 * Both carry `@RequiresRecentAuth` and answer `403 SANDBOX_ONLY` unless the
 * provider base URL is a sandbox host. The final state arrives later through
 * the regular provider webhook.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';

export type SandboxProviderOutcome = 'APPROVED' | 'REJECTED';

export interface SandboxSimulationResult {
  provider: string;
  accepted: boolean;
  outcome?: string | null;
  providerRequestId?: string | null;
}

export interface SimulateProviderBeneficiaryVerificationMutation {
  adminLoopay_simulateProviderBeneficiaryVerification: SandboxSimulationResult;
}

export interface SimulateProviderBeneficiaryVerificationMutationVariables {
  beneficiaryId: string;
  outcome: SandboxProviderOutcome;
}

export const SimulateProviderBeneficiaryVerificationDocument = parse(/* GraphQL */ `
  mutation AdminLoopaySimulateProviderBeneficiaryVerification(
    $beneficiaryId: ID!
    $outcome: SandboxProviderOutcome!
  ) {
    adminLoopay_simulateProviderBeneficiaryVerification(
      beneficiaryId: $beneficiaryId
      outcome: $outcome
    ) {
      provider
      accepted
      outcome
      providerRequestId
    }
  }
`) as unknown as TypedDocumentNode<
  SimulateProviderBeneficiaryVerificationMutation,
  SimulateProviderBeneficiaryVerificationMutationVariables
>;

export interface SimulateProviderDepositMutation {
  adminLoopay_simulateProviderDeposit: SandboxSimulationResult;
}

export interface SimulateProviderDepositMutationVariables {
  virtualAccountId: string;
  amount: string;
}

export const SimulateProviderDepositDocument = parse(/* GraphQL */ `
  mutation AdminLoopaySimulateProviderDeposit($virtualAccountId: ID!, $amount: String!) {
    adminLoopay_simulateProviderDeposit(virtualAccountId: $virtualAccountId, amount: $amount) {
      provider
      accepted
      outcome
      providerRequestId
    }
  }
`) as unknown as TypedDocumentNode<
  SimulateProviderDepositMutation,
  SimulateProviderDepositMutationVariables
>;
