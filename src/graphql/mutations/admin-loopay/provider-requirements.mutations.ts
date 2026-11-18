/**
 * admin-loopay provider requirement mutations (S21) and the VA repair (S22).
 *
 * Gate: `@StaffAccess('OPS_COMMERCIAL')`; LOOPAY_ADMIN passes.
 * `adminLoopay_submitProviderRequirements`,
 * `adminLoopay_markProviderRequirementHandled` and
 * `adminLoopay_repairVirtualAccountRequest` carry `@RequiresRecentAuth`; the
 * prompt-and-retry is handled globally by `withRecentAuth`.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminProviderRequirement,
  AdminProviderRequirementSubmitResult,
  AdminVirtualAccountRepairResult,
  MarkProviderRequirementHandledInput,
  RepairVirtualAccountRequestInput,
  ReviewProviderRequirementInput,
} from '@/graphql/types/admin-loopay';

import { ADMIN_PROVIDER_REQUIREMENT_FIELDS } from '../../queries/admin-loopay/provider-requirements.queries';

export interface ReviewProviderRequirementMutation {
  adminLoopay_reviewProviderRequirement: AdminProviderRequirement;
}

export interface ReviewProviderRequirementMutationVariables {
  input: ReviewProviderRequirementInput;
}

export const ReviewProviderRequirementDocument = parse(/* GraphQL */ `
  mutation AdminLoopayReviewProviderRequirement($input: ReviewProviderRequirementInput!) {
    adminLoopay_reviewProviderRequirement(input: $input) {
      ${ADMIN_PROVIDER_REQUIREMENT_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  ReviewProviderRequirementMutation,
  ReviewProviderRequirementMutationVariables
>;

export interface SubmitProviderRequirementsMutation {
  adminLoopay_submitProviderRequirements: AdminProviderRequirementSubmitResult;
}

export interface SubmitProviderRequirementsMutationVariables {
  endorsementId: string;
}

export const SubmitProviderRequirementsDocument = parse(/* GraphQL */ `
  mutation AdminLoopaySubmitProviderRequirements($endorsementId: String!) {
    adminLoopay_submitProviderRequirements(endorsementId: $endorsementId) {
      submitted
      status
      errorMessage
    }
  }
`) as unknown as TypedDocumentNode<
  SubmitProviderRequirementsMutation,
  SubmitProviderRequirementsMutationVariables
>;

export interface MarkProviderRequirementHandledMutation {
  adminLoopay_markProviderRequirementHandled: AdminProviderRequirement;
}

export interface MarkProviderRequirementHandledMutationVariables {
  input: MarkProviderRequirementHandledInput;
}

/** T-S21C: Comercial completed a PROVIDER_CONSOLE item at the provider. */
export const MarkProviderRequirementHandledDocument = parse(/* GraphQL */ `
  mutation AdminLoopayMarkProviderRequirementHandled($input: MarkProviderRequirementHandledInput!) {
    adminLoopay_markProviderRequirementHandled(input: $input) {
      ${ADMIN_PROVIDER_REQUIREMENT_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  MarkProviderRequirementHandledMutation,
  MarkProviderRequirementHandledMutationVariables
>;

export interface CreateProviderRequirementLinkMutation {
  adminLoopay_createProviderRequirementLink: string;
}

export interface CreateProviderRequirementLinkMutationVariables {
  requirementId: string;
}

/** T-S21C: the KiraFin beneficial-owner link of an RFI `ubo_link` item. */
export const CreateProviderRequirementLinkDocument = parse(/* GraphQL */ `
  mutation AdminLoopayCreateProviderRequirementLink($requirementId: String!) {
    adminLoopay_createProviderRequirementLink(requirementId: $requirementId)
  }
`) as unknown as TypedDocumentNode<
  CreateProviderRequirementLinkMutation,
  CreateProviderRequirementLinkMutationVariables
>;

export interface RepairVirtualAccountRequestMutation {
  adminLoopay_repairVirtualAccountRequest: AdminVirtualAccountRepairResult;
}

export interface RepairVirtualAccountRequestMutationVariables {
  input: RepairVirtualAccountRequestInput;
}

export const RepairVirtualAccountRequestDocument = parse(/* GraphQL */ `
  mutation AdminLoopayRepairVirtualAccountRequest($input: RepairVirtualAccountRequestInput!) {
    adminLoopay_repairVirtualAccountRequest(input: $input) {
      endorsementId
      virtualAccountId
      status
      bankDetailsSource
    }
  }
`) as unknown as TypedDocumentNode<
  RepairVirtualAccountRequestMutation,
  RepairVirtualAccountRequestMutationVariables
>;
