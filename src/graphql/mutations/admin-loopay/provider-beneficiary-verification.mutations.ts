/**
 * admin-loopay: start the provider-side verification of a provider-managed
 * beneficiary (Mesta keeps it `unverified` until this is called). Needs a
 * recent sign-in; the result arrives later through the provider webhook.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';

export interface StartProviderBeneficiaryVerificationMutation {
  adminLoopay_startProviderBeneficiaryVerification: {
    id: string;
    provider_code: string;
    provider_beneficiary_id: string;
    verification_started: boolean;
    started_at: string;
  };
}

export interface StartProviderBeneficiaryVerificationMutationVariables {
  beneficiaryId: string;
}

export const StartProviderBeneficiaryVerificationDocument = parse(/* GraphQL */ `
  mutation AdminLoopayStartProviderBeneficiaryVerification($beneficiaryId: ID!) {
    adminLoopay_startProviderBeneficiaryVerification(beneficiaryId: $beneficiaryId) {
      id
      provider_code
      provider_beneficiary_id
      verification_started
      started_at
    }
  }
`) as unknown as TypedDocumentNode<
  StartProviderBeneficiaryVerificationMutation,
  StartProviderBeneficiaryVerificationMutationVariables
>;
