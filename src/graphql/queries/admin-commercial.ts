/**
 * admin-commercial queries (ADR 0002, decision 10).
 *
 * Hand-written like the rest of the admin-loopay documents: the generated
 * registry does not index them. Onboarding and fee entities are camelCase on
 * the backend (unlike the snake_case queue entities) and are mirrored verbatim.
 * Scope: OPS_COMMERCIAL (LOOPAY_ADMIN always passes).
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';

export type CommercialOnboardingStatus =
  | 'PENDING'
  | 'LINKED'
  | 'FAILED'
  | 'MANUAL';

export type FeeOperation =
  | 'VA_CREATION'
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'PAYOUT'
  | 'P2P'
  | 'CRYPTO_TRANSFER';

export type FeeMode = 'FIXED' | 'PERCENT';

export interface OnboardingAttempt {
  id: string;
  attemptNo: number;
  actorUserId: string | null;
  requestSummary: unknown;
  responseSummary: unknown;
  errorCode: string | null;
  /** Complete list of data the provider needs (VALIDATION_MISSING_FIELDS). */
  missingFields?: string[];
  createdAt: string;
}

export interface ClientProviderOnboarding {
  id: string;
  clientId: string;
  providerCode: string;
  status: CommercialOnboardingStatus;
  providerCustomerId: string | null;
  lastErrorCode: string | null;
  linkedAt: string | null;
  linkedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  attempts: OnboardingAttempt[];
}

export interface FeeSchedule {
  id: string;
  clientId: string | null;
  railCode: string | null;
  operation: FeeOperation;
  mode: FeeMode;
  value: string;
  minAmount: string | null;
  maxAmount: string | null;
  currency: string | null;
  active: boolean;
  version: number;
  createdByUserId: string | null;
  createdAt: string;
}

export interface FeeLedgerEntry {
  id: string;
  transactionId: string;
  clientId: string;
  operation: FeeOperation;
  railCode: string | null;
  baseAmount: string;
  feeAmount: string;
  currency: string;
  feeScheduleId: string | null;
  createdAt: string;
}

export interface FeeLedgerTotal {
  operation: FeeOperation;
  currency: string;
  total: string;
}

export interface ClientProviderOnboardingQuery {
  adminLoopay_clientProviderOnboarding: ClientProviderOnboarding[];
}
export interface ClientProviderOnboardingQueryVariables {
  clientId: string;
}

export const ClientProviderOnboardingDocument = parse(/* GraphQL */ `
  query AdminCommercialClientProviderOnboarding($clientId: String!) {
    adminLoopay_clientProviderOnboarding(clientId: $clientId) {
      id
      clientId
      providerCode
      status
      providerCustomerId
      lastErrorCode
      linkedAt
      linkedByUserId
      createdAt
      updatedAt
      attempts {
        id
        attemptNo
        actorUserId
        requestSummary
        responseSummary
        errorCode
        missingFields
        createdAt
      }
    }
  }
`) as unknown as TypedDocumentNode<
  ClientProviderOnboardingQuery,
  ClientProviderOnboardingQueryVariables
>;

export interface ClientOnboardingProfileQuery {
  adminLoopay_getClient: { id: string; metadata: unknown };
}
export interface ClientOnboardingProfileQueryVariables {
  id: string;
}

/** Stored client metadata (holds `onboardingProfile`) to prefill the Mesta form. */
export const ClientOnboardingProfileDocument = parse(/* GraphQL */ `
  query AdminCommercialClientOnboardingProfile($id: String!) {
    adminLoopay_getClient(id: $id) {
      id
      metadata
    }
  }
`) as unknown as TypedDocumentNode<
  ClientOnboardingProfileQuery,
  ClientOnboardingProfileQueryVariables
>;

export interface ListFeeSchedulesQuery {
  adminLoopay_listFeeSchedules: FeeSchedule[];
}
export interface ListFeeSchedulesQueryVariables {
  clientId: string;
  includeInactive: boolean;
}

export const ListFeeSchedulesDocument = parse(/* GraphQL */ `
  query AdminCommercialListFeeSchedules(
    $clientId: ID
    $includeInactive: Boolean
  ) {
    adminLoopay_listFeeSchedules(
      clientId: $clientId
      includeInactive: $includeInactive
    ) {
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
    }
  }
`) as unknown as TypedDocumentNode<
  ListFeeSchedulesQuery,
  ListFeeSchedulesQueryVariables
>;

export interface ListFeeLedgerQuery {
  adminLoopay_listFeeLedger: FeeLedgerEntry[];
}
export interface ListFeeLedgerQueryVariables {
  clientId: string;
  from?: string | null;
  to?: string | null;
  operation?: FeeOperation | null;
}

export const ListFeeLedgerDocument = parse(/* GraphQL */ `
  query AdminCommercialListFeeLedger(
    $clientId: ID!
    $from: DateTime
    $to: DateTime
    $operation: FeeOperation
  ) {
    adminLoopay_listFeeLedger(
      clientId: $clientId
      from: $from
      to: $to
      operation: $operation
    ) {
      id
      transactionId
      clientId
      operation
      railCode
      baseAmount
      feeAmount
      currency
      feeScheduleId
      createdAt
    }
  }
`) as unknown as TypedDocumentNode<
  ListFeeLedgerQuery,
  ListFeeLedgerQueryVariables
>;

export interface FeeLedgerSummaryQuery {
  adminLoopay_feeLedgerSummary: FeeLedgerTotal[];
}
export interface FeeLedgerSummaryQueryVariables {
  clientId: string;
  from?: string | null;
  to?: string | null;
}

export const FeeLedgerSummaryDocument = parse(/* GraphQL */ `
  query AdminCommercialFeeLedgerSummary(
    $clientId: ID!
    $from: DateTime
    $to: DateTime
  ) {
    adminLoopay_feeLedgerSummary(clientId: $clientId, from: $from, to: $to) {
      operation
      currency
      total
    }
  }
`) as unknown as TypedDocumentNode<
  FeeLedgerSummaryQuery,
  FeeLedgerSummaryQueryVariables
>;

/** Rail offered by a provider (catalog rows are readable by any staff role). */
export interface CommercialProviderRail {
  id: string;
  is_active: boolean;
  provider: { id: string; code: string; name: string };
  rail: { id: string; code: string; name: string };
}

export interface CommercialProviderRailsQuery {
  adminLoopay_listProviderPaymentRails: CommercialProviderRail[];
}
export type CommercialProviderRailsQueryVariables = Record<string, never>;

export const CommercialProviderRailsDocument = parse(/* GraphQL */ `
  query AdminCommercialProviderPaymentRails {
    adminLoopay_listProviderPaymentRails {
      id
      is_active
      provider {
        id
        code
        name
      }
      rail {
        id
        code
        name
      }
    }
  }
`) as unknown as TypedDocumentNode<
  CommercialProviderRailsQuery,
  CommercialProviderRailsQueryVariables
>;

export interface CommercialClientRailsQuery {
  adminLoopay_listClientProviderRails: {
    id: string;
    provider_id: string;
    rail_id: string;
    priority: number;
    is_active: boolean;
  }[];
}
export interface CommercialClientRailsQueryVariables {
  clientId: string;
}

export const CommercialClientRailsDocument = parse(/* GraphQL */ `
  query AdminCommercialClientProviderRails($clientId: String!) {
    adminLoopay_listClientProviderRails(
      where: { clientId: $clientId }
      take: 100
    ) {
      id
      provider_id
      rail_id
      priority
      is_active
    }
  }
`) as unknown as TypedDocumentNode<
  CommercialClientRailsQuery,
  CommercialClientRailsQueryVariables
>;
