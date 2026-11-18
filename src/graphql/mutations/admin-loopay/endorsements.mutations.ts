/**
 * admin-loopay endorsement review mutation.
 *
 * Carries `@RequiresRecentAuth` on the backend.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminEndorsementReviewResponse,
  AdminReviewEndorsementInput,
} from '@/graphql/types/admin-loopay';

export type AdminEndorsementOnboardingState =
  | 'ACTIVE'
  | 'PROVIDER_ONBOARDING'
  | 'FAILED'
  | 'SKIPPED';

/** Outcome of the virtual-account onboarding kicked by an approval with `providerCode`. */
export interface AdminEndorsementOnboarding {
  state: AdminEndorsementOnboardingState;
  provider_code: string;
  error_code: string | null;
  error_message: string | null;
  /**
   * Every blocker as the customer data to complete (provider profile field
   * names: registrationNumber, numberOfEmployees, website, registeredAddress,
   * representativeName, ...). Empty when nothing is missing.
   */
  missing_fields: string[];
  /** `missing_fields` with the group and kind of each key, same order. */
  missing_field_details: AdminOnboardingMissingField[];
}

/**
 * `AdminOnboardingMissingFieldEntity`. `PROFILE_FIELD`: completed with the
 * `providerProfile` input of the retry. `OPS_CHECKLIST`: no backoffice input;
 * operations completes it with the provider (documents, persons, SSN, ...).
 */
export interface AdminOnboardingMissingField {
  key: string;
  group: string;
  kind: 'PROFILE_FIELD' | 'OPS_CHECKLIST' | string;
}

export interface ReviewEndorsementResult extends AdminEndorsementReviewResponse {
  /** Null when the decision did not kick an onboarding (no `providerCode`, or not an approval). */
  onboarding?: AdminEndorsementOnboarding | null;
}

export interface ReviewEndorsementMutation {
  adminLoopay_reviewEndorsement: ReviewEndorsementResult;
}

export interface ReviewEndorsementMutationVariables {
  id: string;
  input: AdminReviewEndorsementInput;
}

export const ReviewEndorsementDocument = parse(/* GraphQL */ `
  mutation AdminLoopayReviewEndorsement(
    $id: ID!
    $input: ReviewEndorsementInput!
  ) {
    adminLoopay_reviewEndorsement(id: $id, input: $input) {
      id
      customer_id
      rail_code
      previous_status
      status
      review_reason
      activated_at
      reviewed_by
      reviewed_at
      onboarding {
        state
        provider_code
        error_code
        error_message
        missing_fields
        missing_field_details {
          key
          group
          kind
        }
      }
    }
  }
`) as unknown as TypedDocumentNode<
  ReviewEndorsementMutation,
  ReviewEndorsementMutationVariables
>;

/** Customer data a provider reported missing (`CustomerProviderProfileInput`). */
export interface CustomerProviderProfileInput {
  phone?: string;
  formationDate?: string;
  businessType?: string;
  websiteUrl?: string;
  websiteAbsenceReason?: string;
  registrationNumber?: string;
  isFinancialInstitution?: boolean;
  numberOfEmployees?: string;
  /** KiraFin industry slug or NAICS code. */
  businessIndustry?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  addressCountry?: string;
  representativeFirstName?: string;
  representativeLastName?: string;
}

export interface RetryEndorsementOnboardingMutation {
  adminLoopay_retryEndorsementOnboarding: AdminEndorsementOnboarding;
}

export interface RetryEndorsementOnboardingMutationVariables {
  endorsementId: string;
  providerProfile?: CustomerProviderProfileInput | null;
}

/**
 * Saves the missing customer data (optional) and re-runs the provider
 * onboarding of an APPROVED endorsement parked in PROVIDER_ONBOARDING or
 * FAILED. Carries `@RequiresRecentAuth`; any other state answers 409.
 */
export const RetryEndorsementOnboardingDocument = parse(/* GraphQL */ `
  mutation AdminLoopayRetryEndorsementOnboarding(
    $endorsementId: ID!
    $providerProfile: CustomerProviderProfileInput
  ) {
    adminLoopay_retryEndorsementOnboarding(
      endorsementId: $endorsementId
      providerProfile: $providerProfile
    ) {
      state
      provider_code
      error_code
      error_message
      missing_fields
      missing_field_details {
        key
        group
        kind
      }
    }
  }
`) as unknown as TypedDocumentNode<
  RetryEndorsementOnboardingMutation,
  RetryEndorsementOnboardingMutationVariables
>;
