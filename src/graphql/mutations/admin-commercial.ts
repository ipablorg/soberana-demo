/**
 * admin-commercial mutations (ADR 0002, decision 10).
 *
 * Onboarding mutations need OPS_COMMERCIAL; fee schedule mutations need
 * LOOPAY_ADMIN. Every one requires a recent sign-in (handled by the GraphQL
 * client's re-auth wrapper).
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  CommercialOnboardingStatus,
  FeeMode,
  FeeOperation,
  FeeSchedule,
} from '@/graphql/queries/admin-commercial';

export interface OnboardingResult {
  provider: string;
  status: CommercialOnboardingStatus;
  providerCustomerId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  retryable: boolean | null;
  /** Complete list of data the provider needs (VALIDATION_MISSING_FIELDS). */
  missingFields?: string[];
  skipped: boolean;
  verificationUrl: string | null;
}

/**
 * Business profile Mesta requires (backend `ClientOnboardingProfileInput`).
 * Stored in client.metadata.onboardingProfile; omitted fields keep their value.
 */
export interface OnboardingProfileInput {
  phone?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  registrationDate?: string;
  businessType?: string;
  websiteUrl?: string;
  websiteAbsenceReason?: string;
  isFinancialInstitution?: boolean;
  numberOfEmployees?: string;
  expectedMonthlyVolumeEstimate?: number;
  averageTransactionSize?: number;
  primaryCounterpartyJurisdictions?: string[];
  natureOfPayments?: string[];
  sourceOfFunds?: string;
}

const RESULT_FIELDS = `
  provider
  status
  providerCustomerId
  errorCode
  errorMessage
  retryable
  missingFields
  skipped
  verificationUrl
`;

const FEE_SCHEDULE_FIELDS = `
  id
  clientId
  railCode
  operation
  mode
  value
  minAmount
  maxAmount
  currency
  active
  version
  createdByUserId
  createdAt
`;

export interface CreateAndOnboardClientInput {
  name: string;
  email: string;
  taxId: string;
  taxIdTypeId: string;
  country: string;
  providers?: string[];
  onboardingProfile?: OnboardingProfileInput;
  /** ISO alpha-3 countries where the client operates with its customers. */
  allowedCustomerCountries?: string[];
}

export interface CreateAndOnboardClientMutation {
  adminLoopay_createAndOnboardClient: {
    client: {
      id: string;
      name: string;
      email: string;
      tax_id: string;
      country: string;
      status: string;
      kyc_status: string;
    };
    results: OnboardingResult[];
  };
}
export interface CreateAndOnboardClientMutationVariables {
  input: CreateAndOnboardClientInput;
}

export const CreateAndOnboardClientDocument = parse(/* GraphQL */ `
  mutation AdminCommercialCreateAndOnboardClient(
    $input: CreateAndOnboardClientInput!
  ) {
    adminLoopay_createAndOnboardClient(input: $input) {
      client {
        id
        name
        email
        tax_id
        country
        status
        kyc_status
      }
      results {
        ${RESULT_FIELDS}
      }
    }
  }
`) as unknown as TypedDocumentNode<
  CreateAndOnboardClientMutation,
  CreateAndOnboardClientMutationVariables
>;

export interface OnboardClientToProvidersMutation {
  adminLoopay_onboardClientToProviders: OnboardingResult[];
}
export interface OnboardClientToProvidersMutationVariables {
  clientId: string;
  providers?: string[] | null;
  onboardingProfile?: OnboardingProfileInput | null;
}

export const OnboardClientToProvidersDocument = parse(/* GraphQL */ `
  mutation AdminCommercialOnboardClientToProviders(
    $clientId: String!
    $providers: [String!]
    $onboardingProfile: ClientOnboardingProfileInput
  ) {
    adminLoopay_onboardClientToProviders(
      clientId: $clientId
      providers: $providers
      onboardingProfile: $onboardingProfile
    ) {
      ${RESULT_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  OnboardClientToProvidersMutation,
  OnboardClientToProvidersMutationVariables
>;

export interface RetryClientProviderOnboardingMutation {
  adminLoopay_retryClientProviderOnboarding: OnboardingResult;
}
export interface RetryClientProviderOnboardingMutationVariables {
  clientId: string;
  provider: string;
  onboardingProfile?: OnboardingProfileInput | null;
}

export const RetryClientProviderOnboardingDocument = parse(/* GraphQL */ `
  mutation AdminCommercialRetryClientProviderOnboarding(
    $clientId: String!
    $provider: String!
    $onboardingProfile: ClientOnboardingProfileInput
  ) {
    adminLoopay_retryClientProviderOnboarding(
      clientId: $clientId
      provider: $provider
      onboardingProfile: $onboardingProfile
    ) {
      ${RESULT_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  RetryClientProviderOnboardingMutation,
  RetryClientProviderOnboardingMutationVariables
>;

export interface LinkClientProviderManuallyMutation {
  adminLoopay_linkClientProviderManually: OnboardingResult;
}
export interface LinkClientProviderManuallyMutationVariables {
  clientId: string;
  provider: string;
  providerCustomerId: string;
  note: string;
}

export const LinkClientProviderManuallyDocument = parse(/* GraphQL */ `
  mutation AdminCommercialLinkClientProviderManually(
    $clientId: String!
    $provider: String!
    $providerCustomerId: String!
    $note: String!
  ) {
    adminLoopay_linkClientProviderManually(
      clientId: $clientId
      provider: $provider
      providerCustomerId: $providerCustomerId
      note: $note
    ) {
      ${RESULT_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  LinkClientProviderManuallyMutation,
  LinkClientProviderManuallyMutationVariables
>;

export interface CreateFeeScheduleInput {
  clientId?: string | null;
  railCode?: string | null;
  operation: FeeOperation;
  mode: FeeMode;
  /** Decimal string (up to 8 decimals); a percentage between 0 and 100 for PERCENT. */
  value: string;
  minAmount?: string | null;
  maxAmount?: string | null;
  currency?: string | null;
}

export interface CreateFeeScheduleMutation {
  adminLoopay_createFeeSchedule: FeeSchedule;
}
export interface CreateFeeScheduleMutationVariables {
  input: CreateFeeScheduleInput;
}

export const CreateFeeScheduleDocument = parse(/* GraphQL */ `
  mutation AdminCommercialCreateFeeSchedule(
    $input: CreateFeeScheduleGraphqlInput!
  ) {
    adminLoopay_createFeeSchedule(input: $input) {
      ${FEE_SCHEDULE_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  CreateFeeScheduleMutation,
  CreateFeeScheduleMutationVariables
>;

export interface DeactivateFeeScheduleMutation {
  adminLoopay_deactivateFeeSchedule: FeeSchedule;
}
export interface DeactivateFeeScheduleMutationVariables {
  id: string;
}

export const DeactivateFeeScheduleDocument = parse(/* GraphQL */ `
  mutation AdminCommercialDeactivateFeeSchedule($id: ID!) {
    adminLoopay_deactivateFeeSchedule(id: $id) {
      ${FEE_SCHEDULE_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  DeactivateFeeScheduleMutation,
  DeactivateFeeScheduleMutationVariables
>;

export interface UpdateAllowedCountriesMutation {
  adminLoopay_updateClientAllowedCountries: {
    id: string;
    country: string;
    config: unknown;
  };
}
export interface UpdateAllowedCountriesMutationVariables {
  clientId: string;
  countries: string[];
}

export const UpdateAllowedCountriesDocument = parse(/* GraphQL */ `
  mutation AdminCommercialUpdateAllowedCountries(
    $clientId: String!
    $countries: [String!]!
  ) {
    adminLoopay_updateClientAllowedCountries(
      clientId: $clientId
      countries: $countries
    ) {
      id
      country
      config
    }
  }
`) as unknown as TypedDocumentNode<
  UpdateAllowedCountriesMutation,
  UpdateAllowedCountriesMutationVariables
>;

export interface CommercialClientRail {
  id: string;
  provider_id: string;
  rail_id: string;
  is_active: boolean;
}

export interface EnableClientRailMutation {
  adminLoopay_createClientProviderRail: CommercialClientRail;
}
export interface EnableClientRailMutationVariables {
  input: {
    clientId: string;
    providerId: string;
    railId: string;
    priority: number;
  };
}

export const EnableClientRailDocument = parse(/* GraphQL */ `
  mutation AdminCommercialEnableClientRail(
    $input: CreateClientProviderRailInput!
  ) {
    adminLoopay_createClientProviderRail(input: $input) {
      id
      provider_id
      rail_id
      is_active
    }
  }
`) as unknown as TypedDocumentNode<
  EnableClientRailMutation,
  EnableClientRailMutationVariables
>;

export interface SetClientRailActiveMutation {
  adminLoopay_updateClientProviderRail: CommercialClientRail;
}
export interface SetClientRailActiveMutationVariables {
  id: string;
  input: { isActive: boolean };
}

export const SetClientRailActiveDocument = parse(/* GraphQL */ `
  mutation AdminCommercialSetClientRailActive(
    $id: String!
    $input: UpdateClientProviderRailInput!
  ) {
    adminLoopay_updateClientProviderRail(id: $id, input: $input) {
      id
      provider_id
      rail_id
      is_active
    }
  }
`) as unknown as TypedDocumentNode<
  SetClientRailActiveMutation,
  SetClientRailActiveMutationVariables
>;
