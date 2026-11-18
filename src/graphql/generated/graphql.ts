/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any; }
};

export type AddEndorsementInput = {
  /** Payment rail code */
  payment_rail: Scalars['String']['input'];
  /** Target wallet ID for the endorsement. If not provided, uses the first active wallet */
  wallet_id?: InputMaybe<Scalars['String']['input']>;
};

export type AdminBeneficiaryEntity = {
  __typename?: 'AdminBeneficiaryEntity';
  alias?: Maybe<Scalars['String']['output']>;
  bankDetails: Scalars['JSON']['output'];
  clientId: Scalars['ID']['output'];
  /** ISO 3166-1 alpha-2 country of the destination account */
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  customerEmail?: Maybe<Scalars['String']['output']>;
  customerExternalId?: Maybe<Scalars['String']['output']>;
  customerId: Scalars['ID']['output'];
  holderName: Scalars['String']['output'];
  holderTaxId?: Maybe<Scalars['String']['output']>;
  holderType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isFavorite: Scalars['Boolean']['output'];
  providerBeneficiaryId?: Maybe<Scalars['String']['output']>;
  providerCode?: Maybe<Scalars['String']['output']>;
  providerId?: Maybe<Scalars['ID']['output']>;
  providerMetadata?: Maybe<Scalars['JSON']['output']>;
  providerName?: Maybe<Scalars['String']['output']>;
  railCode: Scalars['String']['output'];
  railCountry: Scalars['String']['output'];
  railId: Scalars['ID']['output'];
  railName: Scalars['String']['output'];
  relationship: Scalars['String']['output'];
  /** Provider or ops rejection reason */
  reviewReason?: Maybe<Scalars['String']['output']>;
  /** Provider review (IN_REVIEW | APPROVED | REJECTED); only APPROVED can receive payouts */
  reviewStatus: Scalars['String']['output'];
  /** When the provider or ops decided the review */
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  status: AdminBeneficiaryVerificationStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type AdminBeneficiaryFiltersInput = {
  clientId?: InputMaybe<StringFilterInput>;
  currency?: InputMaybe<StringFilterInput>;
  customerId?: InputMaybe<StringFilterInput>;
  isFavorite?: InputMaybe<Scalars['Boolean']['input']>;
  providerCode?: InputMaybe<StringFilterInput>;
  providerId?: InputMaybe<StringFilterInput>;
  railCode?: InputMaybe<StringFilterInput>;
  railId?: InputMaybe<StringFilterInput>;
  status?: InputMaybe<Array<AdminBeneficiaryVerificationStatus>>;
};

/** [admin-loopay-beneficiaries] Provider identifiers linked to a beneficiary */
export type AdminBeneficiaryProviderLinkEntity = {
  __typename?: 'AdminBeneficiaryProviderLinkEntity';
  customer_id: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  linked_at: Scalars['DateTime']['output'];
  provider_beneficiary_id: Scalars['String']['output'];
  provider_code: Scalars['String']['output'];
  provider_id: Scalars['ID']['output'];
};

/** [admin-loopay-beneficiaries] One beneficiary waiting for a manual decision */
export type AdminBeneficiaryQueueItemEntity = {
  __typename?: 'AdminBeneficiaryQueueItemEntity';
  bank_details?: Maybe<Scalars['JSON']['output']>;
  client_id: Scalars['ID']['output'];
  /** Display name of the client (tenant) the customer belongs to */
  client_name: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  customer_email: Scalars['String']['output'];
  customer_id: Scalars['ID']['output'];
  holder_name: Scalars['String']['output'];
  holder_type: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  rail_code: Scalars['String']['output'];
  relationship: Scalars['String']['output'];
};

/** Manual backoffice decision on a beneficiary */
export enum AdminBeneficiaryReviewDecision {
  Rejected = 'REJECTED',
  Verified = 'VERIFIED'
}

/** [admin-loopay-beneficiaries] Result of a manual beneficiary decision */
export type AdminBeneficiaryReviewResponseEntity = {
  __typename?: 'AdminBeneficiaryReviewResponseEntity';
  customer_id: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  previous_status: AdminBeneficiaryVerificationStatus;
  review_reason?: Maybe<Scalars['String']['output']>;
  reviewed_at: Scalars['DateTime']['output'];
  reviewed_by: Scalars['ID']['output'];
  status: AdminBeneficiaryVerificationStatus;
};

/** Beneficiary verification status values for admin reads */
export enum AdminBeneficiaryVerificationStatus {
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Unverified = 'UNVERIFIED',
  Verified = 'VERIFIED'
}

/** Minimal client option for ops queue client selectors (id, display name, active flag only) */
export type AdminClientOptionEntity = {
  __typename?: 'AdminClientOptionEntity';
  client_id: Scalars['ID']['output'];
  /** Client display name (same source as queue client_name) */
  client_name: Scalars['String']['output'];
  is_active: Scalars['Boolean']['output'];
};

/** [admin-loopay-beneficiaries] Create beneficiary input (requires LOOPAY_ADMIN) */
export type AdminCreateBeneficiaryInput = {
  accountNumber?: InputMaybe<Scalars['String']['input']>;
  accountNumberUs?: InputMaybe<Scalars['String']['input']>;
  accountType?: InputMaybe<Scalars['String']['input']>;
  addressLine1?: InputMaybe<Scalars['String']['input']>;
  alias?: InputMaybe<Scalars['String']['input']>;
  bankCode?: InputMaybe<Scalars['String']['input']>;
  bankName?: InputMaybe<Scalars['String']['input']>;
  beneficiaryName: Scalars['String']['input'];
  bic?: InputMaybe<Scalars['String']['input']>;
  brebKey?: InputMaybe<Scalars['String']['input']>;
  chain?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  clabe?: InputMaybe<Scalars['String']['input']>;
  coin?: InputMaybe<Scalars['String']['input']>;
  /** Country code in ISO 3166-1 alpha-3 format */
  country: Scalars['String']['input'];
  currency?: InputMaybe<Scalars['String']['input']>;
  /** Target customer UUID */
  customerId: Scalars['String']['input'];
  externalIdentifier?: InputMaybe<Scalars['String']['input']>;
  holderType?: InputMaybe<Scalars['String']['input']>;
  iban?: InputMaybe<Scalars['String']['input']>;
  isFavorite?: InputMaybe<Scalars['Boolean']['input']>;
  /** Payment rail UUID or code. Omit to auto-resolve from country and type. */
  paymentRail?: InputMaybe<Scalars['String']['input']>;
  pixKey?: InputMaybe<Scalars['String']['input']>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  relationship?: InputMaybe<Scalars['String']['input']>;
  routingNumber?: InputMaybe<Scalars['String']['input']>;
  sortCode?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  taxId?: InputMaybe<Scalars['String']['input']>;
  taxIdType?: InputMaybe<Scalars['String']['input']>;
  /** Beneficiary type: BANK_ACCOUNT | PIX | BREB_KEY */
  type: Scalars['String']['input'];
  walletAddress?: InputMaybe<Scalars['String']['input']>;
};

export type AdminCreateCustomerEntity = {
  __typename?: 'AdminCreateCustomerEntity';
  clientId: Scalars['String']['output'];
  email: Scalars['String']['output'];
  externalId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: AdminLoopayCustomerStatusEntity;
};

export type AdminCreateCustomerInput = {
  clientId: Scalars['String']['input'];
  countryCode: Scalars['String']['input'];
  email: Scalars['String']['input'];
  externalCustomerId?: InputMaybe<Scalars['String']['input']>;
  externalId: Scalars['String']['input'];
  mode: AdminCreateCustomerMode;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  provider: CustomerProviderEnum;
  taxId: Scalars['String']['input'];
  taxIdType: Scalars['String']['input'];
};

export enum AdminCreateCustomerMode {
  ExistingProviderCustomer = 'EXISTING_PROVIDER_CUSTOMER',
  ProviderOnboarding = 'PROVIDER_ONBOARDING'
}

export type AdminCreateCustomerResponseEntity = {
  __typename?: 'AdminCreateCustomerResponseEntity';
  createdAt: Scalars['DateTime']['output'];
  customer: AdminCreateCustomerEntity;
  kycLink?: Maybe<Scalars['String']['output']>;
  kycStatus: Scalars['String']['output'];
  mode: AdminCreateCustomerMode;
};

/** Input for admin wallet provisioning */
export type AdminCreateWalletInput = {
  /** Optional wallet alias for display purposes */
  alias?: InputMaybe<Scalars['String']['input']>;
  /** Blockchain chain (defaults to provider default, typically "base") */
  chain?: InputMaybe<Scalars['String']['input']>;
  /** Client (tenant) UUID that owns the customer */
  clientId: Scalars['String']['input'];
  /** Currency to create on the selected chain (defaults to the provider configuration) */
  currency?: InputMaybe<Scalars['String']['input']>;
  /** Customer UUID to provision wallet for */
  customerId: Scalars['String']['input'];
  /** Custody provider to use; when omitted it is resolved from the client's rail mapping / default provider */
  providerId?: InputMaybe<Scalars['String']['input']>;
  /** If true, provisions VirtualAccounts for all APPROVED endorsements */
  provisionVirtualAccounts?: InputMaybe<Scalars['Boolean']['input']>;
};

export type AdminCustomerFiltersInput = {
  /** Filter by tenant client UUID (exact match) */
  clientId?: InputMaybe<Scalars['String']['input']>;
  /** Filter by country of residence (ISO 3166-1 alpha-3) */
  country?: InputMaybe<Scalars['String']['input']>;
  /** Filter by operational status */
  customerStatus?: InputMaybe<AdminLoopayCustomerStatusEntity>;
  /** Filter by email (case-insensitive contains) */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Filter by KYC verification status */
  kycStatus?: InputMaybe<AdminLoopayKycStatusEntity>;
  /** Free-text search (case-insensitive contains) on the email, first and last name and business legal name */
  search?: InputMaybe<Scalars['String']['input']>;
};

/** Admin Loopay customer profile view (read-only) */
export type AdminCustomerGraphqlEntity = {
  __typename?: 'AdminCustomerGraphqlEntity';
  /** FATF compliance address details */
  addressDetails?: Maybe<Scalars['JSON']['output']>;
  /** WARNING - retired exception. Payouts are FIAT only and no USDT leaves custody to an external address; this flag is ignored and can no longer be enabled (422 CRYPTO_PAYOUT_NOT_AVAILABLE), only disabled. (null only on views that do not load it) */
  allow_crypto_payout?: Maybe<Scalars['Boolean']['output']>;
  /** Legacy provider customer id from CustomerProviderKyc.externalCustomerId */
  bridgeCustomerId?: Maybe<Scalars['String']['output']>;
  /** Legacy provider KYC level from CustomerProviderKyc */
  bridgeKycLevel?: Maybe<Scalars['String']['output']>;
  /** Legacy provider metadata from CustomerProviderKyc */
  bridgeKycMetadata?: Maybe<Scalars['JSON']['output']>;
  /** Legacy provider KYC status from CustomerProviderKyc */
  bridgeKycStatus?: Maybe<AdminLoopayKycStatusEntity>;
  /** Legacy provider KYC URL from CustomerProviderKyc */
  bridgeKycUrl?: Maybe<Scalars['String']['output']>;
  /** Legacy provider rejection reason from CustomerProviderKyc */
  bridgeRejectionReason?: Maybe<Scalars['String']['output']>;
  /** Endorsement capabilities (limits per rail) */
  capabilities?: Maybe<Scalars['JSON']['output']>;
  /** Parent client UUID (tenant) */
  clientId: Scalars['String']['output'];
  /** Country of residence (ISO 3166-1 alpha-3) */
  country: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  /** Operational lifecycle status */
  customerStatus: AdminLoopayCustomerStatusEntity;
  email: Scalars['String']['output'];
  /** Customer ID in the client system */
  externalId: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  /** Customer UUID */
  id: Scalars['String']['output'];
  /** KYC verification status */
  kycStatus: AdminLoopayKycStatusEntity;
  lastName: Scalars['String']['output'];
  /** Administrative metadata including statusHistory audit trail */
  metadata?: Maybe<Scalars['JSON']['output']>;
  middleName?: Maybe<Scalars['String']['output']>;
  /** KYC rejection reasons if applicable */
  rejectionReasons?: Maybe<Scalars['JSON']['output']>;
  /** Tax ID / document number */
  taxId: Scalars['String']['output'];
  /** Tax ID type UUID */
  taxIdTypeId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** [admin-loopay-kyc-review] Everything ops needs to decide one KYC case */
export type AdminCustomerKycDetailEntity = {
  __typename?: 'AdminCustomerKycDetailEntity';
  customer: AdminKycCustomerEntity;
  documents: Array<AdminKycDocumentEntity>;
  endorsements: Array<AdminKycEndorsementSummaryEntity>;
  /** Raw CustomerKycData row, passed through as JSON */
  kyc_data?: Maybe<Scalars['JSON']['output']>;
  /** Business data providers need that KYC has no column for (customer_profile.metadata.providerProfile: registrationNumber, isFinancialInstitution, numberOfEmployees, websiteAbsenceReason, representativeFirstName, representativeLastName); prefills the onboarding retry */
  provider_profile?: Maybe<Scalars['JSON']['output']>;
  wallets: Array<AdminKycWalletSummaryEntity>;
};

/** Result of an admin customer status mutation */
export type AdminCustomerStatusResponseEntity = {
  __typename?: 'AdminCustomerStatusResponseEntity';
  /** Identity of who made the change — format: "admin:{firebaseUid}" */
  changed_by: Scalars['String']['output'];
  /** Status after the mutation */
  current_status: AdminLoopayCustomerStatusEntity;
  /** Customer UUID */
  id: Scalars['String']['output'];
  /** Status before the mutation */
  previous_status: AdminLoopayCustomerStatusEntity;
  /** Reason provided for the status change */
  reason?: Maybe<Scalars['String']['output']>;
  /** Timestamp of the status change */
  updated_at: Scalars['DateTime']['output'];
};

/** [admin-loopay-platform] Dead-provider junctions deactivated for one client */
export type AdminCutoverClientJunctionsEntity = {
  __typename?: 'AdminCutoverClientJunctionsEntity';
  client_id: Scalars['ID']['output'];
  deactivated_junctions: Scalars['Int']['output'];
};

/** [admin-loopay-platform] Deactivate the dead-provider junctions of the selected clients */
export type AdminCutoverDeactivateDeadProvidersInput = {
  /** Explicit list of clients to clean up (there is no "all clients" shortcut) */
  clientIds: Array<Scalars['ID']['input']>;
  reason: Scalars['String']['input'];
};

/** [admin-loopay-platform] Result of deactivating the dead providers and their provider-rail rows */
export type AdminCutoverDeadProviderCatalogResultEntity = {
  __typename?: 'AdminCutoverDeadProviderCatalogResultEntity';
  deactivated_provider_payment_rails: Scalars['Int']['output'];
  deactivated_providers: Scalars['Int']['output'];
  /** Dead provider codes found in the catalog */
  provider_codes: Array<Scalars['String']['output']>;
};

/** [admin-loopay-platform] Result of deactivating dead-provider junctions per client */
export type AdminCutoverDeadProvidersResultEntity = {
  __typename?: 'AdminCutoverDeadProvidersResultEntity';
  clients: Array<AdminCutoverClientJunctionsEntity>;
  /** Dead provider codes found in the catalog */
  dead_provider_codes: Array<Scalars['String']['output']>;
  total_deactivated: Scalars['Int']['output'];
};

/** [admin-loopay-platform] Flag pre-purge in-flight transactions of the selected clients as legacyBridge */
export type AdminCutoverFlagLegacyTransactionsInput = {
  /** Explicit list of clients whose transactions are flagged */
  clientIds: Array<Scalars['ID']['input']>;
  /** Only transactions created strictly before this instant are flagged (must not be in the future) */
  createdBefore: Scalars['DateTime']['input'];
  /** Count the matching transactions without writing anything */
  dryRun?: InputMaybe<Scalars['Boolean']['input']>;
  reason: Scalars['String']['input'];
};

/** [admin-loopay-platform] Result of flagging pre-purge transactions as legacyBridge */
export type AdminCutoverFlagLegacyTransactionsResultEntity = {
  __typename?: 'AdminCutoverFlagLegacyTransactionsResultEntity';
  /** Dry run: transactions that would be flagged. Otherwise: transactions flagged */
  count: Scalars['Int']['output'];
  created_before: Scalars['DateTime']['output'];
  dry_run: Scalars['Boolean']['output'];
};

/** Result of an admin customer delete mutation */
export type AdminDeleteCustomerResponseEntity = {
  __typename?: 'AdminDeleteCustomerResponseEntity';
  /** Deleted customer UUID */
  deleted_customer_id: Scalars['String']['output'];
  /** Human-readable operation result */
  message: Scalars['String']['output'];
  /** True when the customer was deleted */
  success: Scalars['Boolean']['output'];
};

export type AdminDeleteResultEntity = {
  __typename?: 'AdminDeleteResultEntity';
  deleted: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
};

/** [admin-loopay-dispersiones] Beneficiary the payout is going out to */
export type AdminDispersionBeneficiaryEntity = {
  __typename?: 'AdminDispersionBeneficiaryEntity';
  bank_details?: Maybe<Scalars['JSON']['output']>;
  currency: Scalars['String']['output'];
  holder_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  rail_code: Scalars['String']['output'];
};

/** [admin-loopay-dispersiones] An outbound withdrawal handled manually by operations */
export type AdminDispersionEntity = {
  __typename?: 'AdminDispersionEntity';
  /** Decimal amount as string */
  amount: Scalars['String']['output'];
  /** #413: the withdrawal follows the backoffice approval flow (metadata.dispersion.approvalRequired) */
  approval_required: Scalars['Boolean']['output'];
  /** #413: when the withdrawal was approved in the backoffice */
  approved_at?: Maybe<Scalars['DateTime']['output']>;
  /** #413: Firebase uid of the staff member who approved the withdrawal (AWAITING_APPROVAL → APPROVED) */
  approved_by?: Maybe<Scalars['String']['output']>;
  /** #413: when the gross reached the ops vault and the withdrawal started waiting for the approval */
  awaiting_approval_at?: Maybe<Scalars['DateTime']['output']>;
  beneficiary?: Maybe<AdminDispersionBeneficiaryEntity>;
  client_id: Scalars['ID']['output'];
  /** Display name of the client (tenant) the customer belongs to */
  client_name: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  customer_email: Scalars['String']['output'];
  customer_id: Scalars['ID']['output'];
  /** Dispersion v2 state (metadata.dispersion.state): PENDING, COMPLETED, FAILED, CANCELLED; with the #413 approval flow also AWAITING_APPROVAL, APPROVED, PROCESSING, FUNDING, RETURNING, RETURN_MATCH_REQUIRED, REJECTED, RETURNED. Null on legacy v1 rows. */
  dispersion_state?: Maybe<Scalars['String']['output']>;
  /** Developer fee amount, decimal as string */
  fee_amount?: Maybe<Scalars['String']['output']>;
  fee_currency?: Maybe<Scalars['String']['output']>;
  /** Fee source: quote | customer_rail | client_rail | client | default */
  fee_source?: Maybe<Scalars['String']['output']>;
  /** #413: funding of the Mesta order from the ops account: SENT | SETTLED | REJECTED | UNKNOWN | BLOCKED */
  funding_status?: Maybe<Scalars['String']['output']>;
  /** customer_vault | provider | ops_vault */
  funds_location?: Maybe<Scalars['String']['output']>;
  /** Amount already debited as a hold, decimal as string */
  held_amount?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Vendor payout state derived from metadata.payout (slice D) */
  payout?: Maybe<DispersionPayoutStatus>;
  /** #413: gross, fee, network component and the amount funded to Mesta; null outside the approval flow */
  payout_plan?: Maybe<AdminDispersionPayoutPlanEntity>;
  /** Quote FX rate offered to the customer, decimal as string */
  quote_rate?: Maybe<Scalars['String']['output']>;
  /** Quote source amount (crypto), decimal as string */
  quote_source_amount?: Maybe<Scalars['String']['output']>;
  quote_source_currency?: Maybe<Scalars['String']['output']>;
  /** Quote target amount (fiat the customer expects), decimal as string */
  quote_target_amount?: Maybe<Scalars['String']['output']>;
  quote_target_currency?: Maybe<Scalars['String']['output']>;
  reference_code: Scalars['String']['output'];
  /** #413: return ops vault → customer vault: SENT | COMPLETED | FAILED | REJECTED | UNKNOWN */
  return_status?: Maybe<Scalars['String']['output']>;
  review_reason?: Maybe<Scalars['String']['output']>;
  reviewed_at?: Maybe<Scalars['DateTime']['output']>;
  /** When ops recorded the provider selection */
  selected_at?: Maybe<Scalars['DateTime']['output']>;
  /** Provider selected by ops from the indicative rates view (kirafin | mesta), null until selected */
  selected_provider?: Maybe<Scalars['String']['output']>;
  /** Indicative rate recorded at selection time (the real rate is the provider one at manual execution), decimal as string */
  selected_rate?: Maybe<Scalars['String']['output']>;
  /** Settlement fiat amount actually paid, decimal as string */
  settlement_amount?: Maybe<Scalars['String']['output']>;
  /** Bank-negotiated rate (optional, entered by ops), decimal as string */
  settlement_bank_rate?: Maybe<Scalars['String']['output']>;
  settlement_currency?: Maybe<Scalars['String']['output']>;
  /** Bank or provider settlement reference */
  settlement_external_reference?: Maybe<Scalars['String']['output']>;
  /** Fees charged, decimal as string */
  settlement_fees?: Maybe<Scalars['String']['output']>;
  /** OTC rate ops achieved, decimal as string */
  settlement_rate?: Maybe<Scalars['String']['output']>;
  /** #410: the stale alerts raised for the withdrawal (one per rule), oldest first */
  stale_alerts: Array<AdminDispersionStaleAlertEntity>;
  /** #410: when the stale scan flagged the withdrawal */
  stale_review_flagged_at?: Maybe<Scalars['DateTime']['output']>;
  /** #410: why the withdrawal needs a human decision */
  stale_review_reason?: Maybe<Scalars['String']['output']>;
  /** #410: the stale scan flagged the withdrawal for a human decision (metadata.staleReviewRequired); never refunded automatically */
  stale_review_required: Scalars['Boolean']['output'];
  /** TransactionStatus: PENDING, PROCESSING, COMPLETED, FAILED, REJECTED (v2 CANCELLED persists as REJECTED — read dispersion_state) */
  status: Scalars['String']['output'];
  /** Provider tx id of the synchronous customer→ops vault transfer created at request time */
  transfer_provider_tx_id?: Maybe<Scalars['String']['output']>;
  /** Normalized provider state of the ops-vault transfer at creation (pending signature until signed in the console) */
  transfer_status?: Maybe<Scalars['String']['output']>;
  wallet_id: Scalars['ID']['output'];
};

/** Custody location of the funds backing a dispersion */
export enum AdminDispersionFundsLocation {
  CustomerVault = 'customer_vault',
  OpsVault = 'ops_vault',
  Provider = 'provider'
}

/** [admin-loopay-dispersiones] #413 what one gross withdrawal pays out (metadata.payoutPlan); decimal strings */
export type AdminDispersionPayoutPlanEntity = {
  __typename?: 'AdminDispersionPayoutPlanEntity';
  /** What the ops account funds to the Mesta order (gross − fee − network component, 2 decimals) */
  funding_amount: Scalars['String']['output'];
  /** Gross the customer requested and the hold covers */
  gross: Scalars['String']['output'];
  /** Loopay WITHDRAWAL fee, kept in the ops vault */
  loopay_fee: Scalars['String']['output'];
  /** Network component, kept in the ops vault */
  network_component: Scalars['String']['output'];
  /** Rounding remainder (< 0.01) kept in the ops vault */
  rounding_remainder: Scalars['String']['output'];
};

/** [admin-loopay-dispersiones] #410 one stale alert raised for the withdrawal (metadata.staleAlerts) */
export type AdminDispersionStaleAlertEntity = {
  __typename?: 'AdminDispersionStaleAlertEntity';
  /** Alert key: dispersion.sweep_unsettled, dispersion.payout_no_provider_event or awaiting_approval */
  key: Scalars['String']['output'];
  /** When the alert was raised */
  raised_at: Scalars['DateTime']['output'];
};

/** [admin-loopay-kyc-review] Short-lived presigned URL for a KYC document */
export type AdminDocumentDownloadEntity = {
  __typename?: 'AdminDocumentDownloadEntity';
  document_id: Scalars['ID']['output'];
  expires_in_seconds: Scalars['Int']['output'];
  url: Scalars['String']['output'];
};

export type AdminEndorsementEntity = {
  __typename?: 'AdminEndorsementEntity';
  activatedAt?: Maybe<Scalars['DateTime']['output']>;
  alreadyExisted: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  customerId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  railCode: Scalars['String']['output'];
  railId: Scalars['ID']['output'];
  status: AdminEndorsementStatus;
  updatedAt: Scalars['DateTime']['output'];
};

/** [admin-loopay-endorsements] Outcome of the virtual-account onboarding kicked by an approval with a provider. The approval itself is committed whatever this says. */
export type AdminEndorsementOnboardingEntity = {
  __typename?: 'AdminEndorsementOnboardingEntity';
  /** Provider error code (e.g. validation_error), blocker code or skip reason; null when there is nothing to report. */
  error_code?: Maybe<Scalars['String']['output']>;
  /** Sanitized reason (no account numbers, e-mails or tokens); null when there is nothing to report. */
  error_message?: Maybe<Scalars['String']['output']>;
  /** missing_fields with the group and kind of each key, in the same order. Empty when nothing is missing. */
  missing_field_details: Array<AdminOnboardingMissingFieldEntity>;
  /** Every blocker of the onboarding as the customer data to complete, using the provider profile field names (phone, formationDate, businessType, registrationNumber, isFinancialInstitution, numberOfEmployees, website, registeredAddress, representativeName, ...); provider requests without a profile field keep their own token or code. Complete them with adminLoopay_retryEndorsementOnboarding. Empty when nothing is missing. */
  missing_fields: Array<Scalars['String']['output']>;
  /** Provider that executed the onboarding (sandbox outside production when the chosen provider is not configured). */
  provider_code: Scalars['String']['output'];
  state: AdminEndorsementOnboardingState;
};

/** ACTIVE: the virtual account is open. PROVIDER_ONBOARDING: the provider is still reviewing or activating it (error_code names the first blocker, if any). FAILED: the provider call failed or the provider rejected it. SKIPPED: a guard stopped the cycle before the provider (error_code is the reason, e.g. WALLET_NOT_PROVISIONED). */
export enum AdminEndorsementOnboardingState {
  Active = 'ACTIVE',
  Failed = 'FAILED',
  ProviderOnboarding = 'PROVIDER_ONBOARDING',
  Skipped = 'SKIPPED'
}

/** [admin-loopay-endorsements] One endorsement waiting for a manual decision */
export type AdminEndorsementQueueItemEntity = {
  __typename?: 'AdminEndorsementQueueItemEntity';
  client_id: Scalars['ID']['output'];
  /** Display name of the client (tenant) the customer belongs to */
  client_name: Scalars['String']['output'];
  currency: Scalars['String']['output'];
  customer_email: Scalars['String']['output'];
  customer_id: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  rail_code: Scalars['String']['output'];
  rail_name: Scalars['String']['output'];
  requested_at: Scalars['DateTime']['output'];
  review_reason?: Maybe<Scalars['String']['output']>;
  status: AdminEndorsementStatus;
};

/** Manual backoffice decision on a rail endorsement */
export enum AdminEndorsementReviewDecision {
  AdditionalInfoRequired = 'ADDITIONAL_INFO_REQUIRED',
  Approved = 'APPROVED',
  Rejected = 'REJECTED'
}

/** [admin-loopay-endorsements] Result of a manual endorsement decision */
export type AdminEndorsementReviewResponseEntity = {
  __typename?: 'AdminEndorsementReviewResponseEntity';
  activated_at?: Maybe<Scalars['DateTime']['output']>;
  customer_id: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  /** Virtual-account onboarding kicked by an APPROVED decision with providerCode; null when none was kicked. */
  onboarding?: Maybe<AdminEndorsementOnboardingEntity>;
  previous_status: AdminEndorsementStatus;
  rail_code: Scalars['String']['output'];
  review_reason?: Maybe<Scalars['String']['output']>;
  reviewed_at: Scalars['DateTime']['output'];
  reviewed_by: Scalars['ID']['output'];
  status: AdminEndorsementStatus;
};

/** Customer endorsement status values */
export enum AdminEndorsementStatus {
  AdditionalInfoRequired = 'ADDITIONAL_INFO_REQUIRED',
  Approved = 'APPROVED',
  Expired = 'EXPIRED',
  NotInitiated = 'NOT_INITIATED',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Suspended = 'SUSPENDED'
}

export type AdminFeeLedgerEntry = {
  __typename?: 'AdminFeeLedgerEntry';
  /** Amount the fee was computed on (decimal string) */
  baseAmount: Scalars['String']['output'];
  /** Client that was charged */
  clientId: Scalars['ID']['output'];
  /** Charge timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** Currency of the fee */
  currency: Scalars['String']['output'];
  /** Fee charged (decimal string) */
  feeAmount: Scalars['String']['output'];
  /** Fee schedule version that priced this entry */
  feeScheduleId?: Maybe<Scalars['ID']['output']>;
  /** Ledger entry ID */
  id: Scalars['ID']['output'];
  /** Operation that was charged */
  operation: FeeOperation;
  /** Rail code of the operation */
  railCode?: Maybe<Scalars['String']['output']>;
  /** Transaction the fee was charged on */
  transactionId: Scalars['ID']['output'];
};

export type AdminFeeLedgerTotal = {
  __typename?: 'AdminFeeLedgerTotal';
  /** Currency of the total */
  currency: Scalars['String']['output'];
  /** Operation the total belongs to */
  operation: FeeOperation;
  /** Sum of fees charged in the period (decimal string) */
  total: Scalars['String']['output'];
};

export type AdminFeeSchedule = {
  __typename?: 'AdminFeeSchedule';
  /** Whether this version is the one currently applied */
  active: Scalars['Boolean']['output'];
  /** Owning client ID. Null = platform default schedule */
  clientId?: Maybe<Scalars['ID']['output']>;
  /** Creation timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** Local user ID of the staff member that created this version */
  createdByUserId?: Maybe<Scalars['String']['output']>;
  /** Currency of a FIXED fee. Null = operation source currency */
  currency?: Maybe<Scalars['String']['output']>;
  /** Fee schedule row ID */
  id: Scalars['ID']['output'];
  /** Maximum fee amount */
  maxAmount?: Maybe<Scalars['String']['output']>;
  /** Minimum fee amount */
  minAmount?: Maybe<Scalars['String']['output']>;
  /** FIXED or PERCENT */
  mode: FeeMode;
  /** Operation the fee applies to */
  operation: FeeOperation;
  /** Rail code the schedule is limited to. Null = any rail */
  railCode?: Maybe<Scalars['String']['output']>;
  /** Fee value as a decimal string (a percentage when mode is PERCENT) */
  value: Scalars['String']['output'];
  /** Version number within (client, rail, operation) */
  version: Scalars['Int']['output'];
};

export type AdminImportEndorsementInput = {
  activatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  railCode: Scalars['String']['input'];
  status: AdminEndorsementStatus;
};

export type AdminImportVirtualAccountInput = {
  alias?: InputMaybe<Scalars['String']['input']>;
  bankDetails?: InputMaybe<Scalars['String']['input']>;
  currency: Scalars['String']['input'];
  providerAccountId: Scalars['String']['input'];
  railCode: Scalars['String']['input'];
  status?: InputMaybe<AdminVirtualAccountStatus>;
};

export type AdminImportWalletInput = {
  address: Scalars['String']['input'];
  chain: Scalars['String']['input'];
  clientId: Scalars['ID']['input'];
  currency: Scalars['String']['input'];
  customerId: Scalars['ID']['input'];
  providerWalletId: Scalars['String']['input'];
};

/** [admin-loopay-kyc-review] Customer profile under review */
export type AdminKycCustomerEntity = {
  __typename?: 'AdminKycCustomerEntity';
  address_details?: Maybe<Scalars['JSON']['output']>;
  client_id: Scalars['ID']['output'];
  country: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  customer_status: AdminLoopayCustomerStatusEntity;
  email: Scalars['String']['output'];
  first_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  kyc_reviewed_at?: Maybe<Scalars['DateTime']['output']>;
  kyc_reviewed_by_user_id?: Maybe<Scalars['ID']['output']>;
  kyc_status: AdminLoopayKycStatusEntity;
  last_name: Scalars['String']['output'];
  middle_name?: Maybe<Scalars['String']['output']>;
  rejection_reasons?: Maybe<Scalars['JSON']['output']>;
  tax_id: Scalars['String']['output'];
  tax_id_type?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['DateTime']['output'];
};

/** [admin-loopay-kyc-review] Uploaded KYC document metadata */
export type AdminKycDocumentEntity = {
  __typename?: 'AdminKycDocumentEntity';
  category: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  document_metadata?: Maybe<Scalars['JSON']['output']>;
  file_size_bytes?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  mime_type: Scalars['String']['output'];
  version: Scalars['Int']['output'];
};

/** [admin-loopay-kyc-review] Endorsement summary for the reviewer */
export type AdminKycEndorsementSummaryEntity = {
  __typename?: 'AdminKycEndorsementSummaryEntity';
  id: Scalars['ID']['output'];
  rail_code: Scalars['String']['output'];
  review_reason?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

/** [admin-loopay-kyc-review] One customer waiting for a manual KYC decision */
export type AdminKycQueueItemEntity = {
  __typename?: 'AdminKycQueueItemEntity';
  client_id: Scalars['ID']['output'];
  /** Display name of the client (tenant) the customer belongs to */
  client_name: Scalars['String']['output'];
  country: Scalars['String']['output'];
  customer_status: AdminLoopayCustomerStatusEntity;
  /** 'individual' or 'business', derived from the KYC wizard data */
  customer_type: Scalars['String']['output'];
  documents_count: Scalars['Int']['output'];
  email: Scalars['String']['output'];
  first_name: Scalars['String']['output'];
  has_documents: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  kyc_status: AdminLoopayKycStatusEntity;
  last_name: Scalars['String']['output'];
  /** Last profile update, used as the submission timestamp */
  submitted_at: Scalars['DateTime']['output'];
};

/** [admin-loopay-kyc-review] Result of a manual KYC decision */
export type AdminKycReviewResponseEntity = {
  __typename?: 'AdminKycReviewResponseEntity';
  customer_id: Scalars['ID']['output'];
  customer_status: AdminLoopayCustomerStatusEntity;
  kyc_status: AdminLoopayKycStatusEntity;
  previous_kyc_status: AdminLoopayKycStatusEntity;
  reviewed_at: Scalars['DateTime']['output'];
  reviewed_by: Scalars['ID']['output'];
  /** Null when no wallet was minted or minting failed */
  wallet?: Maybe<AdminKycReviewWalletEntity>;
  /** Why the post-approval wallet minting failed. The approval still stands. */
  wallet_error?: Maybe<Scalars['String']['output']>;
};

/** [admin-loopay-kyc-review] Wallet minted right after a KYC approval */
export type AdminKycReviewWalletEntity = {
  __typename?: 'AdminKycReviewWalletEntity';
  address?: Maybe<Scalars['String']['output']>;
  chain?: Maybe<Scalars['String']['output']>;
  currency: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

/** [admin-loopay-kyc-review] Wallet summary for the reviewer */
export type AdminKycWalletSummaryEntity = {
  __typename?: 'AdminKycWalletSummaryEntity';
  address?: Maybe<Scalars['String']['output']>;
  chain?: Maybe<Scalars['String']['output']>;
  currency: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  provider_code: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

/** Input for linking an existing CustomerProfile with an existing User via the self_ externalId convention. Use force=true to relink even if already linked to another user. */
export type AdminLinkCustomerUserInput = {
  /** Email address used to find both CustomerProfile and User */
  email: Scalars['String']['input'];
  /** Force relink even if CustomerProfile is already linked to a different user. WARNING: Use with caution. */
  force?: InputMaybe<Scalars['Boolean']['input']>;
};

export type AdminLinkCustomerUserResponseEntity = {
  __typename?: 'AdminLinkCustomerUserResponseEntity';
  customerId: Scalars['String']['output'];
  email: Scalars['String']['output'];
  externalId: Scalars['String']['output'];
  message: Scalars['String']['output'];
  previousExternalId?: Maybe<Scalars['String']['output']>;
  previousUserId?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  userId: Scalars['String']['output'];
};

/** Current onboarding state of a client at one provider (mesta or kirafin) with its attempt history. */
export type AdminLoopayClientProviderOnboarding = {
  __typename?: 'AdminLoopayClientProviderOnboarding';
  /** Attempts in chronological order. */
  attempts: Array<AdminLoopayClientProviderOnboardingAttempt>;
  clientId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** Error code of the last failed attempt; cleared once linked. */
  lastErrorCode?: Maybe<Scalars['String']['output']>;
  linkedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Local user id of the staff member who linked it. */
  linkedByUserId?: Maybe<Scalars['String']['output']>;
  /** Provider code: mesta | kirafin. */
  providerCode: Scalars['String']['output'];
  /** Customer id at the provider (Mesta sender id, KiraFin user id). */
  providerCustomerId?: Maybe<Scalars['String']['output']>;
  status: AdminLoopayClientProviderOnboardingStatus;
  updatedAt: Scalars['DateTime']['output'];
};

/** One onboarding call (or manual link) for a client at a provider. Summaries never contain PII or secrets. */
export type AdminLoopayClientProviderOnboardingAttempt = {
  __typename?: 'AdminLoopayClientProviderOnboardingAttempt';
  /** Local user id of the staff member who triggered the attempt. */
  actorUserId?: Maybe<Scalars['String']['output']>;
  /** 1-based attempt number per provider. */
  attemptNo: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  /** Stable error code when the attempt failed. */
  errorCode?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Complete list of data the provider needs and the client does not have (VALIDATION_MISSING_FIELDS); empty for any other outcome. */
  missingFields: Array<Scalars['String']['output']>;
  /** Request evidence: ids and flags only, never PII. */
  requestSummary?: Maybe<Scalars['JSON']['output']>;
  /** Response evidence: provider customer id, status, error code. */
  responseSummary?: Maybe<Scalars['JSON']['output']>;
};

/** Outcome of one provider during an onboarding run. A provider failure is reported here, never thrown. */
export type AdminLoopayClientProviderOnboardingResult = {
  __typename?: 'AdminLoopayClientProviderOnboardingResult';
  /** Stable error code when FAILED. */
  errorCode?: Maybe<Scalars['String']['output']>;
  /** Short, secret-free explanation of the failure (max 200 chars). */
  errorMessage?: Maybe<Scalars['String']['output']>;
  /** Complete (never truncated) list of data the provider requires and the client does not have, e.g. phone, addressStreet. Empty unless errorCode is VALIDATION_MISSING_FIELDS. Complete it with the onboardingProfile argument and retry. */
  missingFields: Array<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  providerCustomerId?: Maybe<Scalars['String']['output']>;
  /** Whether retrying the same onboarding may succeed without changes. */
  retryable?: Maybe<Scalars['Boolean']['output']>;
  /** True when the provider was already LINKED/MANUAL and was not called. */
  skipped: Scalars['Boolean']['output'];
  status: AdminLoopayClientProviderOnboardingStatus;
  /** Hosted verification form to send to the client (KiraFin). Returned once, never stored. */
  verificationUrl?: Maybe<Scalars['String']['output']>;
};

/** Provider onboarding state of a client: PENDING (not attempted yet), LINKED (created at the provider by the API), FAILED (last attempt failed, see lastErrorCode), MANUAL (linked by hand with a provider customer id). */
export enum AdminLoopayClientProviderOnboardingStatus {
  Failed = 'FAILED',
  Linked = 'LINKED',
  Manual = 'MANUAL',
  Pending = 'PENDING'
}

export enum AdminLoopayClientStatusEntity {
  Active = 'ACTIVE',
  Revoked = 'REVOKED',
  Suspended = 'SUSPENDED'
}

/** The created client plus the per-provider onboarding outcomes. */
export type AdminLoopayCreateAndOnboardClientResult = {
  __typename?: 'AdminLoopayCreateAndOnboardClientResult';
  client: ClientGraphqlEntity;
  results: Array<AdminLoopayClientProviderOnboardingResult>;
};

/** CLIENT applies the exception to every customer of the client; CUSTOMER to one customer only */
export enum AdminLoopayCryptoPayoutAllowanceTarget {
  Client = 'CLIENT',
  Customer = 'CUSTOMER'
}

/** Customer status values in admin mutation responses */
export enum AdminLoopayCustomerStatusEntity {
  Active = 'ACTIVE',
  Frozen = 'FROZEN',
  Offboarded = 'OFFBOARDED',
  Penalized = 'PENALIZED',
  Suspended = 'SUSPENDED'
}

export enum AdminLoopayKycStatusEntity {
  AdditionalInfoRequired = 'ADDITIONAL_INFO_REQUIRED',
  Approved = 'APPROVED',
  Expired = 'EXPIRED',
  Initiated = 'INITIATED',
  NotInitiated = 'NOT_INITIATED',
  PendingReview = 'PENDING_REVIEW',
  Rejected = 'REJECTED'
}

export enum AdminLoopayStaffRoleEntity {
  LoopayAdmin = 'LOOPAY_ADMIN',
  LoopayOperations = 'LOOPAY_OPERATIONS',
  OpsCommercial = 'OPS_COMMERCIAL',
  OpsDispersiones = 'OPS_DISPERSIONES',
  OpsKyc = 'OPS_KYC',
  OpsRecaudos = 'OPS_RECAUDOS',
  OpsVa = 'OPS_VA',
  PlatformAdmin = 'PLATFORM_ADMIN'
}

export enum AdminLoopayUserRoleEntity {
  ClientAdmin = 'CLIENT_ADMIN',
  ClientUser = 'CLIENT_USER',
  SuperAdmin = 'SUPER_ADMIN',
  Viewer = 'VIEWER'
}

export type AdminMarkStaleAsFailedResponse = {
  __typename?: 'AdminMarkStaleAsFailedResponse';
  /** Human-readable summary */
  message: Scalars['String']['output'];
  /** Number of transactions updated */
  updated: Scalars['Float']['output'];
};

export type AdminMoveCustomerToClientInput = {
  /** Destination client UUID */
  targetClientId: Scalars['String']['input'];
};

/** [admin-loopay-endorsements] One field a virtual-account provider still needs, with a stable key the backoffice can label. */
export type AdminOnboardingMissingFieldEntity = {
  __typename?: 'AdminOnboardingMissingFieldEntity';
  /** business_profile (a providerProfile field), the provider section of a token (associated_persons, identifying_information, additional_info, ...), provider_request (any other provider token) or provider_status (a blocker code that is not a field). */
  group: Scalars['String']['output'];
  /** Stable key, the same value as the missing_fields entry: a provider profile field (phone, businessIndustry, registeredAddress, ...), a provider token (associated_persons:nationality, identifying_information:file_shareholder_registry, ein, ...) or a blocker code. */
  key: Scalars['String']['output'];
  /** PROFILE_FIELD: complete it with the providerProfile input of adminLoopay_retryEndorsementOnboarding. OPS_CHECKLIST: no backoffice input; operations completes it with the provider (documents, persons, SSN, ...). */
  kind: Scalars['String']['output'];
};

/** [admin-loopay-wallets] Result of moving withdrawal funds into the ops vault */
export type AdminOpsVaultTransferEntity = {
  __typename?: 'AdminOpsVaultTransferEntity';
  /** Always "ops_vault" on success */
  funds_location: Scalars['String']['output'];
  /** Transfer id returned by the custody provider */
  provider_tx_id: Scalars['String']['output'];
  transaction_id: Scalars['ID']['output'];
};

export type AdminPaymentRailEntity = {
  __typename?: 'AdminPaymentRailEntity';
  code: Scalars['String']['output'];
  currency: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

/** [admin-loopay-platform] Provider/rail/wallet configuration readiness of one ACTIVE client */
export type AdminPlatformClientReadinessEntity = {
  __typename?: 'AdminPlatformClientReadinessEntity';
  /** Active ClientProviderRail rows of this client */
  active_junction_count: Scalars['Int']['output'];
  /** Codes of the active providers this client has at least one active junction to */
  active_providers: Array<Scalars['String']['output']>;
  client_id: Scalars['ID']['output'];
  client_name: Scalars['String']['output'];
  /** Active junctions still pointing to a dead provider (bridge/aiprise/loopayx/lumx/persona/jube) */
  dead_provider_junctions_active: Scalars['Int']['output'];
  /** The same reasons as issues, in the same order, as i18n keys with params */
  issue_keys: Array<AdminPlatformReadinessIssueEntity>;
  /** Human-readable (English) reasons behind a non-READY status; prefer issue_keys for display */
  issues: Array<Scalars['String']['output']>;
  /** Codes of the FIAT_RAILS providers behind this client's enabled rails (active junctions) where the client is not registered (LINKED or MANUAL); providers of rails the client never enabled are ignored */
  missing_pairings: Array<Scalars['String']['output']>;
  status: AdminPlatformReadinessStatus;
  /** client.config.defaults has walletProviderId, walletDefaultChain and walletDefaultCurrency */
  wallet_defaults_set: Scalars['Boolean']['output'];
};

/** [admin-loopay-platform] One readiness finding as an i18n key the front translates, with its interpolation params */
export type AdminPlatformReadinessIssueEntity = {
  __typename?: 'AdminPlatformReadinessIssueEntity';
  /** i18n key: readiness.no_live_rail, readiness.dead_provider_junctions {count}, readiness.wallet_defaults_missing {fields}, readiness.wallet_provider_id_unknown {walletProviderId}, readiness.no_wallet_provider, readiness.wallet_provider_inactive {provider}, readiness.wallet_provider_not_configured {provider}, readiness.wallet_chain_unsupported {chain, provider}, readiness.provider_not_onboarded {provider} */
  key: Scalars['String']['output'];
  /** Interpolation params of the key ({} when none) */
  params: Scalars['JSON']['output'];
};

/** READY: nothing missing; INCOMPLETE: works partially, see issues; BLOCKED: no active junction to a live provider */
export enum AdminPlatformReadinessStatus {
  Blocked = 'BLOCKED',
  Incomplete = 'INCOMPLETE',
  Ready = 'READY'
}

/** [admin-loopay-beneficiaries] Result of starting the provider-side verification of a beneficiary */
export type AdminProviderBeneficiaryVerification = {
  __typename?: 'AdminProviderBeneficiaryVerification';
  customer_id: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  provider_beneficiary_id: Scalars['String']['output'];
  provider_code: Scalars['String']['output'];
  started_at: Scalars['DateTime']['output'];
  verification_started: Scalars['Boolean']['output'];
};

/** [admin-loopay-customers] Provider customer record linked to a local customer */
export type AdminProviderCustomerLinkEntity = {
  __typename?: 'AdminProviderCustomerLinkEntity';
  customer_id: Scalars['ID']['output'];
  external_customer_id: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  kyc_status: AdminLoopayKycStatusEntity;
  linked_at: Scalars['DateTime']['output'];
  provider_code: Scalars['String']['output'];
};

/** [admin-loopay-virtual-accounts] A virtual account already linked to a provider account */
export type AdminProviderLinkedAccountEntity = {
  __typename?: 'AdminProviderLinkedAccountEntity';
  alias?: Maybe<Scalars['String']['output']>;
  currency: Scalars['String']['output'];
  customer_email: Scalars['String']['output'];
  customer_id: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  linked_at: Scalars['DateTime']['output'];
  provider_account_id?: Maybe<Scalars['String']['output']>;
  provider_code: Scalars['String']['output'];
  rail_code: Scalars['String']['output'];
  status: AdminVirtualAccountStatus;
};

/** [admin-loopay-transactions] Provider operation executed for a transaction (request/response payloads, status) */
export type AdminProviderOperationEntity = {
  __typename?: 'AdminProviderOperationEntity';
  createdAt: Scalars['DateTime']['output'];
  externalId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  idempotencyKey?: Maybe<Scalars['String']['output']>;
  /** operationType.name (TRANSFER, WITHDRAWAL, DEPOSIT, ...) */
  operationType?: Maybe<Scalars['String']['output']>;
  requestPayload?: Maybe<Scalars['JSON']['output']>;
  responsePayload?: Maybe<Scalars['JSON']['output']>;
  status: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

/** [admin-loopay-provider-requirements] Who has to act next on the provider requirements */
export type AdminProviderRequirementCounts = {
  __typename?: 'AdminProviderRequirementCounts';
  /** REQUESTED + REJECTED: the customer */
  awaitingCustomer: Scalars['Int']['output'];
  /** UPLOADED: Commercial reviews */
  pendingReview: Scalars['Int']['output'];
  /** APPROVED: Commercial submits */
  readyToSubmit: Scalars['Int']['output'];
};

/** [admin-loopay-provider-requirements] A provider requirement with its customer and review trail */
export type AdminProviderRequirementEntity = {
  __typename?: 'AdminProviderRequirementEntity';
  /** Provider blocker code it comes from */
  blockerCode: Scalars['String']['output'];
  clientId: Scalars['String']['output'];
  clientName?: Maybe<Scalars['String']['output']>;
  customerEmail?: Maybe<Scalars['String']['output']>;
  customerId: Scalars['String']['output'];
  customerName: Scalars['String']['output'];
  documents: Array<ProviderRequirementDocumentEntity>;
  dueAt?: Maybe<Scalars['DateTime']['output']>;
  endorsementId: Scalars['String']['output'];
  /** Section of the key (identifying_information, associated_persons, business_documents, rfi, ...) */
  group: Scalars['String']['output'];
  /** PROVIDER_API: the platform sends it through the provider API; PROVIDER_CONSOLE: Commercial completes it at the provider (UBO links, associated-person data, keys the API refused) */
  handling?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  /** Stable requirement key (provider token, e.g. identifying_information:file_shareholder_registry, address_proof) */
  key: Scalars['String']['output'];
  kind: ProviderRequirementKind;
  /** Documented answers of a VALUE requirement (KiraFin enum); null for free text. Array fields (business_industry, transaction_countries) take several comma-separated values */
  options?: Maybe<Array<Scalars['String']['output']>>;
  /** Provider code (kirafin, mesta, ...) */
  provider: Scalars['String']['output'];
  railCode: Scalars['String']['output'];
  /** Why the last answer was rejected (REJECTED only) */
  rejectReason?: Maybe<Scalars['String']['output']>;
  requestedAt: Scalars['DateTime']['output'];
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Staff member who approved or rejected the last answer */
  reviewedBy?: Maybe<Scalars['String']['output']>;
  /** MISSING_FIELD, RFI_ITEM or UBO */
  source: Scalars['String']['output'];
  status: ProviderRequirementStatus;
  submittedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  value?: Maybe<Scalars['String']['output']>;
};

/** [admin-loopay-provider-requirements] Outcome of submitting the approved requirements to the provider */
export type AdminProviderRequirementSubmitResult = {
  __typename?: 'AdminProviderRequirementSubmitResult';
  /** Provider or re-run error; on a provider error the requirements stay APPROVED */
  errorMessage?: Maybe<Scalars['String']['output']>;
  /** Virtual-account request state after the lifecycle re-run */
  status: Scalars['String']['output'];
  /** Requirements sent and now SUBMITTED */
  submitted: Scalars['Int']['output'];
};

/** [admin-loopay-provider-requirements] One page of requirements */
export type AdminProviderRequirementsPage = {
  __typename?: 'AdminProviderRequirementsPage';
  items: Array<AdminProviderRequirementEntity>;
  total: Scalars['Int']['output'];
};

/** [admin-loopay-recaudos] An inbound deposit handled manually by operations */
export type AdminRecaudoEntity = {
  __typename?: 'AdminRecaudoEntity';
  /** Decimal amount as string */
  amount: Scalars['String']['output'];
  client_id: Scalars['ID']['output'];
  /** Display name of the client (tenant) the customer belongs to */
  client_name: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  customer_email: Scalars['String']['output'];
  customer_id: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  provider_code?: Maybe<Scalars['String']['output']>;
  provider_event_id?: Maybe<Scalars['String']['output']>;
  /** External reference typed by the operator on manual creation (bank-statement reference) */
  reference?: Maybe<Scalars['String']['output']>;
  reference_code: Scalars['String']['output'];
  review_reason?: Maybe<Scalars['String']['output']>;
  reviewed_at?: Maybe<Scalars['DateTime']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  /** TransactionStatus: PENDING, COMPLETED, REJECTED, FAILED */
  status: Scalars['String']['output'];
  wallet_id: Scalars['ID']['output'];
};

export type AdminRequestVirtualAccountInput = {
  /** Country to receive in (ISO 3166-1 alpha-2, alpha-3 accepted), e.g. MX */
  country: Scalars['String']['input'];
  /** Currency to receive, e.g. MXN */
  currency: Scalars['String']['input'];
  /** Customer the virtual account is requested for */
  customerId: Scalars['String']['input'];
  /** Rail code from adminLoopay_customerReceiveOptions, e.g. spei, ach, sepa */
  railCode: Scalars['String']['input'];
};

/** Manual backoffice approve/reject decision */
export enum AdminReviewDecision {
  Approved = 'APPROVED',
  Rejected = 'REJECTED'
}

/** [admin-loopay-transactions] Beneficiary summary embedded in a transaction */
export type AdminTransactionBeneficiaryEntity = {
  __typename?: 'AdminTransactionBeneficiaryEntity';
  id: Scalars['ID']['output'];
  /** beneficiary.rail.code */
  railCode?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

/** [admin-loopay-transactions] Minimal customer summary embedded in a transaction wallet */
export type AdminTransactionCustomerSummaryEntity = {
  __typename?: 'AdminTransactionCustomerSummaryEntity';
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
};

/** [admin-loopay-transactions] Transaction with full metadata, failure reason, and provider operations for incident debugging (requires LOOPAY_ADMIN) */
export type AdminTransactionEntity = {
  __typename?: 'AdminTransactionEntity';
  /** Decimal amount as string */
  amount: Scalars['String']['output'];
  beneficiary?: Maybe<AdminTransactionBeneficiaryEntity>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  /** Free-form description. Not a DB column: extracted from metadata.description when present. */
  description?: Maybe<Scalars['String']['output']>;
  /** TransactionDirection */
  direction: Scalars['String']['output'];
  /** Populated only when status is FAILED */
  failureReason?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Flexible metadata: failureReason, paymentRail, intermediateWalletPreFund, error, etc. */
  metadata?: Maybe<Scalars['JSON']['output']>;
  providerOperations: Array<AdminProviderOperationEntity>;
  referenceCode: Scalars['String']['output'];
  /** TransactionStatus: CREATED, PENDING, PROCESSING, COMPLETED, FAILED */
  status: Scalars['String']['output'];
  /** TransactionType: DEPOSIT, WITHDRAWAL, TRANSFER, ... */
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  wallet?: Maybe<AdminTransactionWalletEntity>;
};

export type AdminTransactionFiltersInput = {
  clientId?: InputMaybe<Scalars['String']['input']>;
  customerId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  walletId?: InputMaybe<Scalars['String']['input']>;
};

/** [admin-loopay-transactions] Wallet summary embedded in a transaction */
export type AdminTransactionWalletEntity = {
  __typename?: 'AdminTransactionWalletEntity';
  address?: Maybe<Scalars['String']['output']>;
  cachedBalance: Scalars['String']['output'];
  chain?: Maybe<Scalars['String']['output']>;
  currency: Scalars['String']['output'];
  customer?: Maybe<AdminTransactionCustomerSummaryEntity>;
  customerId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
};

/** Allowed beneficiary holder type values for admin updates */
export enum AdminUpdateBeneficiaryHolderType {
  Business = 'BUSINESS',
  Individual = 'INDIVIDUAL'
}

export type AdminUpdateBeneficiaryInput = {
  alias?: InputMaybe<Scalars['String']['input']>;
  bankDetails?: InputMaybe<Scalars['JSON']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  holderName?: InputMaybe<Scalars['String']['input']>;
  holderTaxId?: InputMaybe<Scalars['String']['input']>;
  holderType?: InputMaybe<AdminUpdateBeneficiaryHolderType>;
  isFavorite?: InputMaybe<Scalars['Boolean']['input']>;
  providerBeneficiaryId?: InputMaybe<Scalars['String']['input']>;
  providerId?: InputMaybe<Scalars['String']['input']>;
  providerMetadata?: InputMaybe<Scalars['JSON']['input']>;
  railId?: InputMaybe<Scalars['String']['input']>;
  relationship?: InputMaybe<AdminUpdateBeneficiaryRelationship>;
  status?: InputMaybe<AdminBeneficiaryVerificationStatus>;
};

/** Allowed beneficiary relationship values for admin updates */
export enum AdminUpdateBeneficiaryRelationship {
  Business = 'BUSINESS',
  Employee = 'EMPLOYEE',
  Family = 'FAMILY',
  Friend = 'FRIEND',
  Other = 'OTHER',
  Self = 'SELF',
  ThirdParty = 'THIRD_PARTY'
}

/** Fields to update on a customer profile. All fields are optional — only provided fields are modified. */
export type AdminUpdateCustomerInput = {
  /** FATF compliance address details */
  addressDetails?: InputMaybe<Scalars['JSON']['input']>;
  /** Legacy provider customer id stored in CustomerProviderKyc.externalCustomerId. Set null to remove the legacy link. */
  bridgeCustomerId?: InputMaybe<Scalars['String']['input']>;
  /** Legacy provider KYC level */
  bridgeKycLevel?: InputMaybe<Scalars['String']['input']>;
  /** Legacy provider KYC metadata stored in CustomerProviderKyc */
  bridgeKycMetadata?: InputMaybe<Scalars['JSON']['input']>;
  /** Legacy provider KYC status stored in CustomerProviderKyc */
  bridgeKycStatus?: InputMaybe<AdminLoopayKycStatusEntity>;
  /** Legacy provider KYC URL stored in CustomerProviderKyc */
  bridgeKycUrl?: InputMaybe<Scalars['String']['input']>;
  /** Legacy provider rejection reason stored in CustomerProviderKyc */
  bridgeRejectionReason?: InputMaybe<Scalars['String']['input']>;
  /** Endorsement capabilities (limits per rail) */
  capabilities?: InputMaybe<Scalars['JSON']['input']>;
  /** Country of residence (ISO 3166-1 alpha-3) */
  country?: InputMaybe<Scalars['String']['input']>;
  /** Operational lifecycle status. For status changes with full audit trail use adminLoopay_updateCustomerStatus instead. */
  customerStatus?: InputMaybe<AdminLoopayCustomerStatusEntity>;
  /** Customer email address */
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** KYC verification status */
  kycStatus?: InputMaybe<AdminLoopayKycStatusEntity>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** Administrative metadata */
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  /** Middle name (set to null to clear) */
  middleName?: InputMaybe<Scalars['String']['input']>;
  /** KYC rejection reasons */
  rejectionReasons?: InputMaybe<Scalars['JSON']['input']>;
  /** Tax ID / document number */
  taxId?: InputMaybe<Scalars['String']['input']>;
  /** Tax ID type UUID (FK) */
  taxIdTypeId?: InputMaybe<Scalars['String']['input']>;
};

export type AdminUpdateCustomerStatusInput = {
  /** Reason for the status change (recommended for audit trail) */
  reason?: InputMaybe<Scalars['String']['input']>;
  /**
   * New operational status for the customer.
   * Allowed values: ACTIVE, SUSPENDED, FROZEN, PENALIZED.
   * OFFBOARDED cannot be set manually.
   */
  status: AdminLoopayCustomerStatusEntity;
};

/** Update editable wallet fields (providerWalletId, chain, address, currency, alias, status). Only provided fields are applied. Pass alias/address null to clear. A CLOSED wallet accepts only a reopen (status ACTIVE); any other update on it is rejected. */
export type AdminUpdateWalletInput = {
  /** On-chain address. Pass null to clear. */
  address?: InputMaybe<Scalars['String']['input']>;
  /** Display alias. Pass null to clear. */
  alias?: InputMaybe<Scalars['String']['input']>;
  /** Blockchain chain (e.g. "tron", "solana"). Pass null to clear. */
  chain?: InputMaybe<Scalars['String']['input']>;
  /** Wallet currency code (e.g. "USDT", "USDC") */
  currency?: InputMaybe<Scalars['String']['input']>;
  /** Provider-side wallet id (e.g. Openfort account id) */
  providerWalletId?: InputMaybe<Scalars['String']['input']>;
  /** Operational status. ACTIVE <-> SUSPENDED, ACTIVE/SUSPENDED -> CLOSED, CLOSED -> ACTIVE (reopen). */
  status?: InputMaybe<AdminWalletStatus>;
};

/** Update wallet provider metadata (sweep config, etc.). Pass providerMetadata null to clear. */
export type AdminUpdateWalletProviderMetadataInput = {
  /** Provider metadata to set. Pass null to clear existing metadata. */
  providerMetadata?: InputMaybe<Scalars['JSON']['input']>;
  /** Wallet UUID */
  walletId: Scalars['String']['input'];
};

export type AdminVirtualAccountEntity = {
  __typename?: 'AdminVirtualAccountEntity';
  alias?: Maybe<Scalars['String']['output']>;
  alreadyExisted: Scalars['Boolean']['output'];
  bankDetails?: Maybe<Scalars['JSON']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  customerId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  providerAccountId?: Maybe<Scalars['String']['output']>;
  providerId: Scalars['ID']['output'];
  providerMetadata?: Maybe<Scalars['JSON']['output']>;
  railCode: Scalars['String']['output'];
  railId: Scalars['ID']['output'];
  status: AdminVirtualAccountStatus;
  updatedAt: Scalars['DateTime']['output'];
  walletId: Scalars['ID']['output'];
};

/** [admin-loopay-virtual-accounts] S22: who repaired a blocked virtual-account request by hand, why and when */
export type AdminVirtualAccountRepairInfoEntity = {
  __typename?: 'AdminVirtualAccountRepairInfoEntity';
  /** PROVIDER (read from the provider API) or MANUAL (typed by staff) */
  bankDetailsSource: Scalars['String']['output'];
  /** Mandatory reason staff gave */
  reason: Scalars['String']['output'];
  repairedAt: Scalars['DateTime']['output'];
  /** Staff uid that repaired the request */
  repairedBy: Scalars['String']['output'];
};

/** [admin-loopay-virtual-accounts] Outcome of a blocked virtual-account request repair */
export type AdminVirtualAccountRepairResult = {
  __typename?: 'AdminVirtualAccountRepairResult';
  /** PROVIDER: read from the provider API; MANUAL: typed by staff and confirmed */
  bankDetailsSource: Scalars['String']['output'];
  endorsementId: Scalars['String']['output'];
  /** Virtual account status (ACTIVE) */
  status: Scalars['String']['output'];
  virtualAccountId: Scalars['String']['output'];
};

/** [admin-loopay-virtual-accounts] One open virtual-account request (not yet an account) */
export type AdminVirtualAccountRequestEntity = {
  __typename?: 'AdminVirtualAccountRequestEntity';
  blockers: Array<VaBlockerEntity>;
  clientId: Scalars['ID']['output'];
  /** Display name of the client (tenant) */
  clientName: Scalars['String']['output'];
  currency: Scalars['String']['output'];
  customerEmail: Scalars['String']['output'];
  customerId: Scalars['ID']['output'];
  /** Endorsement status (PENDING, ADDITIONAL_INFO_REQUIRED, APPROVED) */
  endorsementStatus: Scalars['String']['output'];
  /** Endorsement (request) id */
  id: Scalars['ID']['output'];
  /** missingFields with the group and kind (PROFILE_FIELD | OPS_CHECKLIST) of each key, in the same order. */
  missingFieldDetails: Array<AdminOnboardingMissingFieldEntity>;
  /** The blockers as the data still missing, with stable keys (same rules as the onboarding missing_fields). Empty when nothing is missing. */
  missingFields: Array<Scalars['String']['output']>;
  /** Provider ops chose, once approved */
  provider?: Maybe<Scalars['String']['output']>;
  railCode: Scalars['String']['output'];
  railName: Scalars['String']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  /** S22: the staff repair of this request; null when none */
  repair?: Maybe<AdminVirtualAccountRepairInfoEntity>;
  requestedAt: Scalars['DateTime']['output'];
  /** Request lifecycle: REQUESTED, OPS_APPROVED or PROVIDER_ONBOARDING */
  state: Scalars['String']['output'];
};

/** Virtual account status values */
export enum AdminVirtualAccountStatus {
  Active = 'ACTIVE',
  Closed = 'CLOSED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Suspended = 'SUSPENDED'
}

export type AdminVirtualAccountWithRelationsEntity = {
  __typename?: 'AdminVirtualAccountWithRelationsEntity';
  alias?: Maybe<Scalars['String']['output']>;
  alreadyExisted: Scalars['Boolean']['output'];
  bankDetails?: Maybe<Scalars['JSON']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  customer?: Maybe<AdminCustomerGraphqlEntity>;
  customerId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  providerAccountId?: Maybe<Scalars['String']['output']>;
  providerId: Scalars['ID']['output'];
  providerMetadata?: Maybe<Scalars['JSON']['output']>;
  rail?: Maybe<AdminPaymentRailEntity>;
  railCode: Scalars['String']['output'];
  railId: Scalars['ID']['output'];
  status: AdminVirtualAccountStatus;
  updatedAt: Scalars['DateTime']['output'];
  wallet?: Maybe<AdminWalletEntity>;
  walletId: Scalars['ID']['output'];
};

/** Currencies available for one wallet chain */
export type AdminWalletChainOptionEntity = {
  __typename?: 'AdminWalletChainOptionEntity';
  chain: Scalars['String']['output'];
  currencies: Array<Scalars['String']['output']>;
  defaultCurrency: Scalars['String']['output'];
};

export type AdminWalletEntity = {
  __typename?: 'AdminWalletEntity';
  address?: Maybe<Scalars['String']['output']>;
  alias?: Maybe<Scalars['String']['output']>;
  chain?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  customerId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  providerId: Scalars['String']['output'];
  status: AdminWalletStatus;
  updatedAt: Scalars['DateTime']['output'];
};

/** Configured wallet creation options for an admin */
export type AdminWalletOptionsEntity = {
  __typename?: 'AdminWalletOptionsEntity';
  chains: Array<AdminWalletChainOptionEntity>;
  clientId: Scalars['String']['output'];
  defaultChain: Scalars['String']['output'];
  defaultCurrency: Scalars['String']['output'];
  providerCode: Scalars['String']['output'];
  providerId: Scalars['String']['output'];
};

/** Provider selection for admin wallet options */
export type AdminWalletOptionsInput = {
  /** Client UUID used when resolving the default wallet provider */
  clientId: Scalars['String']['input'];
  /** Wallet provider UUID; overrides the client default provider */
  providerId?: InputMaybe<Scalars['String']['input']>;
};

/** Result of admin wallet provisioning mutation */
export type AdminWalletResponseEntity = {
  __typename?: 'AdminWalletResponseEntity';
  /** Blockchain address */
  address?: Maybe<Scalars['String']['output']>;
  /** Wallet alias */
  alias?: Maybe<Scalars['String']['output']>;
  /** Whether wallet already existed (idempotent return) */
  alreadyExisted: Scalars['Boolean']['output'];
  /** Cached balance */
  balance: Scalars['Float']['output'];
  /** Blockchain chain */
  chain?: Maybe<Scalars['String']['output']>;
  /** Client (tenant) UUID */
  clientId: Scalars['String']['output'];
  /** Wallet creation timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** Admin identity who created the wallet */
  createdBy: Scalars['String']['output'];
  /** Wallet currency (e.g., "USDC") */
  currency: Scalars['String']['output'];
  /** Customer UUID */
  customerId: Scalars['String']['output'];
  /** Wallet UUID */
  id: Scalars['String']['output'];
  /** Provider code (e.g., "openfort") */
  providerCode: Scalars['String']['output'];
  /** Provider UUID */
  providerId: Scalars['String']['output'];
  /** Provider-specific metadata including sweep configuration */
  providerMetadata?: Maybe<Scalars['JSON']['output']>;
  /** Wallet status */
  status: AdminWalletStatus;
  /** Virtual account IDs created (if provisionVirtualAccounts=true) */
  virtualAccountIds: Array<Scalars['String']['output']>;
  /** Wallet type (CUSTODIAL) */
  walletType: AdminWalletType;
};

/** Wallet status values */
export enum AdminWalletStatus {
  Active = 'ACTIVE',
  Closed = 'CLOSED',
  Suspended = 'SUSPENDED'
}

/** Wallet type values */
export enum AdminWalletType {
  Custodial = 'CUSTODIAL',
  NonCustodial = 'NON_CUSTODIAL',
  SmartWallet = 'SMART_WALLET'
}

/** [admin-loopay-dispersiones] Approval payload */
export type ApproveDispersionInput = {
  fundsLocation: AdminDispersionFundsLocation;
  note?: InputMaybe<Scalars['String']['input']>;
};

/** [admin-loopay-recaudos] Approval note */
export type ApproveRecaudoInput = {
  note?: InputMaybe<Scalars['String']['input']>;
};

export type AssociatedPersonInput = {
  /** Attested ownership structure timestamp */
  attested_ownership_structure_at?: InputMaybe<Scalars['String']['input']>;
  /** Birth date (YYYY-MM-DD) */
  birth_date: Scalars['String']['input'];
  /** Email */
  email: Scalars['String']['input'];
  /** First name */
  first_name: Scalars['String']['input'];
  /** Has control */
  has_control: Scalars['Boolean']['input'];
  /** Has ownership */
  has_ownership: Scalars['Boolean']['input'];
  /** Identifying documents */
  identifying_information?: InputMaybe<Array<CustomerIdentifyingInformationInput>>;
  /** Is director (defaults to false) */
  is_director?: InputMaybe<Scalars['Boolean']['input']>;
  /** Is signer (defaults to false) */
  is_signer?: InputMaybe<Scalars['Boolean']['input']>;
  /** Last name */
  last_name: Scalars['String']['input'];
  /** Middle name */
  middle_name?: InputMaybe<Scalars['String']['input']>;
  /** All nationalities (ISO3) */
  nationalities?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Nationality (ISO3) */
  nationality: Scalars['String']['input'];
  /** Ownership percentage */
  ownership_percentage?: InputMaybe<Scalars['String']['input']>;
  /** Phone */
  phone?: InputMaybe<Scalars['String']['input']>;
  /** Place of birth */
  place_of_birth?: InputMaybe<CustomerPlaceOfBirthInput>;
  /** Relationship established date */
  relationship_established_at?: InputMaybe<Scalars['String']['input']>;
  /** Residential address (REQUIRED for KYC) */
  residential_address: CustomerAddressInput;
  /** Title */
  title?: InputMaybe<Scalars['String']['input']>;
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  /** Firebase JWT token */
  access_token: Scalars['String']['output'];
  /** Basic information of the authenticated user */
  user?: Maybe<AuthUser>;
};

export type AuthSignInResult = AuthResponse | RegistrationRequired;

export type AuthUser = {
  __typename?: 'AuthUser';
  auth_uid?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type AvailabilityArrivalEntity = {
  __typename?: 'AvailabilityArrivalEntity';
  /** True when multiple candidate deposits matched — manual review */
  ambiguous?: Maybe<Scalars['Boolean']['output']>;
  /** Custody (on-chain arrival) transaction id */
  custodyTxId?: Maybe<Scalars['String']['output']>;
  /** ProviderOperation id of the deposit credit */
  depositProviderOperationId?: Maybe<Scalars['String']['output']>;
  /** Deposit transaction id at the custody provider */
  depositTransactionId?: Maybe<Scalars['String']['output']>;
  /** When reconciliation linked the arrival */
  reconciledAt?: Maybe<Scalars['DateTime']['output']>;
};

export type AvailabilityOperationEntity = {
  __typename?: 'AvailabilityOperationEntity';
  arrival?: Maybe<AvailabilityArrivalEntity>;
  createdAt: Scalars['DateTime']['output'];
  /** Typed failure code when FAILED */
  failureCode?: Maybe<Scalars['String']['output']>;
  /** Failure detail when FAILED */
  failureMessage?: Maybe<Scalars['String']['output']>;
  /** Quote ids of the last covering fetch */
  fxQuoteIds: Array<Scalars['String']['output']>;
  /** Carrier transaction id */
  id: Scalars['String']['output'];
  /** MESTA_MERCHANT | KIRA_VA */
  kind: Scalars['String']['output'];
  order?: Maybe<AvailabilityOrderEntity>;
  /** Quote id selected for placement */
  selectedFxQuoteId?: Maybe<Scalars['String']['output']>;
  source: AvailabilitySourceEntity;
  /** INITIATED | QUOTED | PLACED | EXECUTED | RECONCILED | FAILED */
  state: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AvailabilityOrderEntity = {
  __typename?: 'AvailabilityOrderEntity';
  /** Delivery chain when applicable */
  chain?: Maybe<Scalars['String']['output']>;
  /** Decimal-string developer fee when applicable */
  developerFee?: Maybe<Scalars['String']['output']>;
  /** Vendor order/payout id (externalId) */
  externalId: Scalars['String']['output'];
  /** When the order was placed */
  placedAt: Scalars['DateTime']['output'];
  /** Staff user that placed it */
  placedBy: Scalars['String']['output'];
};

export type AvailabilitySourceEntity = {
  __typename?: 'AvailabilitySourceEntity';
  /** Merchant or virtual-account reference */
  account: Scalars['String']['output'];
  /** Decimal-string source amount */
  amount: Scalars['String']['output'];
  /** Source fiat currency */
  currency: Scalars['String']['output'];
  /** Vendor provider code */
  providerCode: Scalars['String']['output'];
};

export type AvailableChainsResponse = {
  __typename?: 'AvailableChainsResponse';
  /** Available blockchain chains */
  chains: Array<Scalars['String']['output']>;
  /** Currency */
  currency: Scalars['String']['output'];
  /** Default chain */
  default_chain: Scalars['String']['output'];
};

export type BeneficiaryConditionalRequirementEntity = {
  __typename?: 'BeneficiaryConditionalRequirementEntity';
  /** Fields required when condition matches */
  required: Array<Scalars['String']['output']>;
  /** Condition matcher object */
  when: Scalars['JSON']['output'];
};

export type BeneficiaryCreateFieldRequirementsEntity = {
  __typename?: 'BeneficiaryCreateFieldRequirementsEntity';
  /** Fields always optional */
  base_optional: Array<Scalars['String']['output']>;
  /** Fields always required */
  base_required: Array<Scalars['String']['output']>;
  /** Cross-rail conditional requirements */
  conditional_required: Array<BeneficiaryConditionalRequirementEntity>;
  /** Rail-specific field requirements */
  rails: Array<BeneficiaryRailFieldRequirementEntity>;
  /** Field resolution rules */
  resolution_rules: BeneficiaryFieldResolutionRulesEntity;
};

export type BeneficiaryDeleteResultEntity = {
  __typename?: 'BeneficiaryDeleteResultEntity';
  /** Deleted beneficiary ID */
  id: Scalars['String']['output'];
  /** Provider code associated with cleanup, when applicable */
  provider_code?: Maybe<Scalars['String']['output']>;
  /** Whether external provider account cleanup was attempted/completed */
  provider_external_deleted: Scalars['Boolean']['output'];
  /** Whether delete completed successfully */
  success: Scalars['Boolean']['output'];
};

export type BeneficiaryEntity = {
  __typename?: 'BeneficiaryEntity';
  /** Account number */
  account_number?: Maybe<Scalars['String']['output']>;
  /** Alias */
  alias?: Maybe<Scalars['String']['output']>;
  /** Bank code */
  bank_code?: Maybe<Scalars['String']['output']>;
  /** Bank details */
  bank_details?: Maybe<Scalars['JSON']['output']>;
  /** Bank name */
  bank_name?: Maybe<Scalars['String']['output']>;
  /** Beneficiary name */
  beneficiary_name: Scalars['String']['output'];
  /** BIC */
  bic?: Maybe<Scalars['String']['output']>;
  /** CLABE */
  clabe?: Maybe<Scalars['String']['output']>;
  /** Beneficiary country */
  country?: Maybe<Scalars['String']['output']>;
  /** Creation timestamp */
  created_at: Scalars['DateTime']['output'];
  /** Currency */
  currency: Scalars['String']['output'];
  /** Customer ID */
  customer_id: Scalars['String']['output'];
  /** Holder type */
  holder_type: Scalars['String']['output'];
  /** IBAN */
  iban?: Maybe<Scalars['String']['output']>;
  /** Beneficiary ID */
  id: Scalars['String']['output'];
  /** Whether the beneficiary is favorite */
  is_favorite: Scalars['Boolean']['output'];
  /** Masked account number */
  masked_account_number: Scalars['String']['output'];
  /** Payment rail code */
  payment_rail?: Maybe<Scalars['String']['output']>;
  /** PIX key */
  pix_key?: Maybe<Scalars['String']['output']>;
  /** Provider that registered the beneficiary (mesta | kirafin | sandbox) */
  provider_code?: Maybe<Scalars['String']['output']>;
  /** Resolved payment rail metadata */
  rail?: Maybe<BeneficiaryRailEntity>;
  /** Payment rail code the beneficiary was registered on */
  rail_code?: Maybe<Scalars['String']['output']>;
  /** Payment rail ID */
  rail_id?: Maybe<Scalars['String']['output']>;
  /** Relationship */
  relationship: Scalars['String']['output'];
  /** Provider rejection reason, when REJECTED */
  review_reason?: Maybe<Scalars['String']['output']>;
  /** Provider review: IN_REVIEW (en revisión) | APPROVED (usable for payouts) | REJECTED. Only APPROVED beneficiaries can receive money */
  review_status?: Maybe<Scalars['String']['output']>;
  /** Routing number */
  routing_number?: Maybe<Scalars['String']['output']>;
  /** Tax ID */
  tax_id?: Maybe<Scalars['String']['output']>;
  /** Last update timestamp */
  updated_at: Scalars['DateTime']['output'];
  /** Legacy verification status (VERIFIED | PENDING | REJECTED | UNVERIFIED); mirrors review_status, UNVERIFIED = deactivated by ops */
  verification_status: Scalars['String']['output'];
};

export type BeneficiaryFieldResolutionRulesEntity = {
  __typename?: 'BeneficiaryFieldResolutionRulesEntity';
  /** Fallback behavior when payment_rail is omitted */
  behavior_when_missing: Scalars['String']['output'];
  /** payment_rail field requirement mode */
  payment_rail: Scalars['String']['output'];
};

/** [admin-loopay-beneficiaries] Filters for the pending-beneficiary queue */
export type BeneficiaryQueueFiltersInput = {
  clientId?: InputMaybe<Scalars['ID']['input']>;
  /** PaymentRail code */
  railCode?: InputMaybe<Scalars['String']['input']>;
};

export type BeneficiaryRailEntity = {
  __typename?: 'BeneficiaryRailEntity';
  /** Payment rail code */
  code: Scalars['String']['output'];
  /** Payment rail country */
  country: Scalars['String']['output'];
  /** Payment rail currency */
  currency: Scalars['String']['output'];
  /** Payment rail ID */
  id: Scalars['String']['output'];
  /** Payment rail name */
  name: Scalars['String']['output'];
};

export type BeneficiaryRailFieldRequirementEntity = {
  __typename?: 'BeneficiaryRailFieldRequirementEntity';
  /** Country/type matcher for this rail */
  applies_when: Scalars['JSON']['output'];
  /** Conditional requirements for this rail */
  conditional_required?: Maybe<Array<BeneficiaryConditionalRequirementEntity>>;
  /** Forbidden fields for this rail */
  forbidden?: Maybe<Array<Scalars['String']['output']>>;
  /** Implementation notes for this rail */
  notes?: Maybe<Array<Scalars['String']['output']>>;
  /** Optional fields for this rail */
  optional: Array<Scalars['String']['output']>;
  /** Payment rail code */
  rail: Scalars['String']['output'];
  /** Required fields for this rail */
  required: Array<Scalars['String']['output']>;
};

/** [admin-loopay-dispersiones] v2 cancellation — ops did not sign (or cancelled in the console) and manually returned the funds ops→customer */
export type CancelDispersionInput = {
  /** Why the dispersion was cancelled */
  reason: Scalars['String']['input'];
  /** Console/provider reference of the manual ops→customer funds return, when already performed */
  return_reference?: InputMaybe<Scalars['String']['input']>;
};

/** API key regeneration response (plaintext key returned once only and client API-key access restored to ACTIVE) */
export type ClientApiKeyResponse = {
  __typename?: 'ClientApiKeyResponse';
  /** Plaintext API key (return to client immediately, never logged or persisted, shown once only) */
  api_key: Scalars['String']['output'];
  /** API key prefix for identification (non-sensitive) */
  api_key_prefix: Scalars['String']['output'];
};

export type ClientEntity = {
  __typename?: 'ClientEntity';
  /** WARNING - retired exception. Payouts are FIAT only and no USDT leaves custody to an external address; this flag is ignored and can no longer be enabled (422 CRYPTO_PAYOUT_NOT_AVAILABLE), only disabled. */
  allow_crypto_payout: Scalars['Boolean']['output'];
  /** API key prefix when a key exists */
  api_key_prefix?: Maybe<Scalars['String']['output']>;
  /** Configuration */
  config?: Maybe<Scalars['JSON']['output']>;
  /** Client country code */
  country: Scalars['String']['output'];
  /** Creation timestamp */
  created_at: Scalars['DateTime']['output'];
  /** Client email */
  email: Scalars['String']['output'];
  /** Whether the client has an API key */
  has_api_key: Scalars['Boolean']['output'];
  /** Client ID */
  id: Scalars['String']['output'];
  /** Client KYC status */
  kyc_status: Scalars['String']['output'];
  /** Metadata */
  metadata?: Maybe<Scalars['JSON']['output']>;
  /** Client name */
  name: Scalars['String']['output'];
  /** Client status */
  status: Scalars['String']['output'];
  /** Client tax identifier */
  tax_id: Scalars['String']['output'];
  /** Client tax identifier type ID */
  tax_id_type_id: Scalars['String']['output'];
  /** Last update timestamp */
  updated_at: Scalars['DateTime']['output'];
};

export type ClientFiltersInput = {
  email?: InputMaybe<StringFilterInput>;
  kycStatus?: InputMaybe<AdminLoopayKycStatusEntity>;
  name?: InputMaybe<StringFilterInput>;
  status?: InputMaybe<AdminLoopayClientStatusEntity>;
  taxId?: InputMaybe<StringFilterInput>;
};

/** Admin Loopay client configuration view */
export type ClientGraphqlEntity = {
  __typename?: 'ClientGraphqlEntity';
  /** WARNING - retired exception. Payouts are FIAT only and no USDT leaves custody to an external address; this flag is ignored and can no longer be enabled (422 CRYPTO_PAYOUT_NOT_AVAILABLE), only disabled. */
  allow_crypto_payout: Scalars['Boolean']['output'];
  /** Hard expiry of the current API key (null = never expires) */
  api_key_expires_at?: Maybe<Scalars['DateTime']['output']>;
  /** Last successful API-key authentication (accurate to ~5 minutes, throttled write) */
  api_key_last_used_at?: Maybe<Scalars['DateTime']['output']>;
  api_key_prefix: Scalars['String']['output'];
  /** When the current API key was issued by a rotation */
  api_key_rotated_at?: Maybe<Scalars['DateTime']['output']>;
  /** Operation scopes of the API key (read, customers:write, transactions:write, webhooks:manage). Empty = full access */
  api_key_scopes: Array<Scalars['String']['output']>;
  config: Scalars['JSON']['output'];
  country: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  kyc_status: AdminLoopayKycStatusEntity;
  metadata: Scalars['JSON']['output'];
  name: Scalars['String']['output'];
  status: AdminLoopayClientStatusEntity;
  tax_id: Scalars['String']['output'];
  tax_id_type_id: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
};

/** Business profile required by Mesta (KYB). Stored in client.metadata.onboardingProfile; fields omitted keep their stored value. Name, email, tax id and country come from the client. */
export type ClientOnboardingProfileInput = {
  addressCity?: InputMaybe<Scalars['String']['input']>;
  addressPostalCode?: InputMaybe<Scalars['String']['input']>;
  addressState?: InputMaybe<Scalars['String']['input']>;
  addressStreet?: InputMaybe<Scalars['String']['input']>;
  /** Average transaction size in USD. */
  averageTransactionSize?: InputMaybe<Scalars['Float']['input']>;
  /** One of: sole_proprietorship, partnership, corporation, limited_liability_company, other. */
  businessType?: InputMaybe<Scalars['String']['input']>;
  /** Expected monthly volume in USD. */
  expectedMonthlyVolumeEstimate?: InputMaybe<Scalars['Float']['input']>;
  isFinancialInstitution?: InputMaybe<Scalars['Boolean']['input']>;
  /** Mesta enum entries, e.g. payment_for_goods_and_services. */
  natureOfPayments?: InputMaybe<Array<Scalars['String']['input']>>;
  /** One of: 1, 2-10, 11-50, 51-200, 201-1000, 1000+, unknown, 201-500, 501+. */
  numberOfEmployees?: InputMaybe<Scalars['String']['input']>;
  /** Business phone in international format, e.g. +12025550123. */
  phone?: InputMaybe<Scalars['String']['input']>;
  /** ISO 3166-1 alpha-2 country codes. */
  primaryCounterpartyJurisdictions?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Incorporation date, YYYY-MM-DD. */
  registrationDate?: InputMaybe<Scalars['String']['input']>;
  /** Mesta enum entry, e.g. business_income. */
  sourceOfFunds?: InputMaybe<Scalars['String']['input']>;
  /** Required by Mesta when the business has no website. */
  websiteAbsenceReason?: InputMaybe<Scalars['String']['input']>;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type ClientProviderRailEntity = {
  __typename?: 'ClientProviderRailEntity';
  /** Client ID */
  client_id: Scalars['String']['output'];
  /** Configuration */
  config?: Maybe<Scalars['JSON']['output']>;
  /** Creation timestamp */
  created_at: Scalars['String']['output'];
  /** ID */
  id: Scalars['String']['output'];
  /** Is active */
  is_active: Scalars['Boolean']['output'];
  /** Payment rail */
  payment_rail: Scalars['String']['output'];
  /** Provider code */
  provider_code: Scalars['String']['output'];
};

export type ClientProviderRailFiltersInput = {
  clientId?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  providerId?: InputMaybe<Scalars['String']['input']>;
  railId?: InputMaybe<Scalars['String']['input']>;
};

export type ClientProviderRailGraphqlEntity = {
  __typename?: 'ClientProviderRailGraphqlEntity';
  client_id: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  default_attributes?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['String']['output'];
  is_active: Scalars['Boolean']['output'];
  priority: Scalars['Int']['output'];
  provider?: Maybe<ProviderSummaryGraphqlEntity>;
  provider_id: Scalars['String']['output'];
  rail?: Maybe<PaymentRailSummaryGraphqlEntity>;
  rail_id: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type CompanyUserRole = {
  __typename?: 'CompanyUserRole';
  /** Associated company identifier */
  company_id: Scalars['String']['output'];
  /** Roles granted for the associated company */
  role: Array<Scalars['String']['output']>;
};

/** Compensation state for reversible operations */
export enum CompensationStatus {
  Compensated = 'COMPENSATED',
  Failed = 'FAILED',
  NotNeeded = 'NOT_NEEDED',
  Pending = 'PENDING'
}

/** [admin-loopay-dispersiones] Settlement payload */
export type CompleteDispersionInput = {
  /** Bank or provider settlement reference */
  externalReference?: InputMaybe<Scalars['String']['input']>;
  fiat?: InputMaybe<DispersionFiatSettlementInput>;
  /** Ops-fetched provider quote actually used (quoteId from adminLoopay_fetchDispersionQuote). Prefills omitted fiat fields and records provider provenance. */
  fxQuoteId?: InputMaybe<Scalars['ID']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
};

export type CompleteRegistrationInput = {
  /** Valid Firebase JWT token obtained from auth_signIn */
  accessToken: Scalars['String']['input'];
  /** Company name for business registration */
  company?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  policy?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Creates a client and onboards it at the providers in one step. Mesta compliance data goes in onboardingProfile (stored in metadata.onboardingProfile). */
export type CreateAndOnboardClientInput = {
  /** ISO 3166-1 alpha-3 countries where the client operates with its customers. Stored in config.allowedCustomerCountries; without it the client API rejects customer creation (fail-closed). */
  allowedCustomerCountries?: InputMaybe<Array<Scalars['String']['input']>>;
  config?: InputMaybe<Scalars['JSON']['input']>;
  country: Scalars['String']['input'];
  email: Scalars['String']['input'];
  kycStatus?: InputMaybe<AdminLoopayKycStatusEntity>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  name: Scalars['String']['input'];
  /** Business profile Mesta requires. Stored in the client metadata so a failed Mesta attempt can be completed and retried. */
  onboardingProfile?: InputMaybe<ClientOnboardingProfileInput>;
  /** Providers to onboard the client at: mesta, kirafin. Omit to onboard at both. */
  providers?: InputMaybe<Array<Scalars['String']['input']>>;
  status?: InputMaybe<AdminLoopayClientStatusEntity>;
  taxId: Scalars['String']['input'];
  taxIdTypeId: Scalars['String']['input'];
};

export type CreateBeneficiaryInput = {
  /** Account number (required for COL/ECU bank-account beneficiaries; not used for co_breb BREB_KEY) */
  account_number?: InputMaybe<Scalars['String']['input']>;
  /** Account number (required for USA) */
  account_number_us?: InputMaybe<Scalars['String']['input']>;
  /** Bank account type: savings | checking */
  account_type?: InputMaybe<Scalars['String']['input']>;
  /** Address line 1 */
  address_line_1?: InputMaybe<Scalars['String']['input']>;
  /** Alias for the beneficiary */
  alias?: InputMaybe<Scalars['String']['input']>;
  /** Postal address of the beneficiary bank as one line (required by KiraFin for US ACH recipients) */
  bank_address?: InputMaybe<Scalars['String']['input']>;
  /** Bank code (required for COL/ECU bank-account beneficiaries; not used for co_breb BREB_KEY) */
  bank_code?: InputMaybe<Scalars['String']['input']>;
  /** Bank name */
  bank_name?: InputMaybe<Scalars['String']['input']>;
  /** Beneficiary full name */
  beneficiary_name: Scalars['String']['input'];
  /** BIC/SWIFT code (for IBAN) */
  bic?: InputMaybe<Scalars['String']['input']>;
  /** Bre-B key for co_breb beneficiaries */
  breb_key?: InputMaybe<Scalars['String']['input']>;
  /** Blockchain network (e.g. ethereum, base, polygon, solana) */
  chain?: InputMaybe<Scalars['String']['input']>;
  /** City */
  city?: InputMaybe<Scalars['String']['input']>;
  /** CLABE (required for MEX, exactly 18 digits) */
  clabe?: InputMaybe<Scalars['String']['input']>;
  /** Coin/token symbol (e.g. usdc, usdt) */
  coin?: InputMaybe<Scalars['String']['input']>;
  /** Country code (ISO 3166-1 alpha-3, e.g. USA, MEX, BRA, COL, ECU, ESP) */
  country: Scalars['String']['input'];
  /** Currency (e.g. USD, EUR) */
  currency?: InputMaybe<Scalars['String']['input']>;
  /** Customer UUID that owns this beneficiary */
  customer_id: Scalars['String']['input'];
  /** External identifier for provider-side correlation */
  external_identifier?: InputMaybe<Scalars['String']['input']>;
  /** Holder type: INDIVIDUAL | BUSINESS */
  holder_type?: InputMaybe<Scalars['String']['input']>;
  /** IBAN (for SEPA) */
  iban?: InputMaybe<Scalars['String']['input']>;
  /** Mark as favorite */
  is_favorite?: InputMaybe<Scalars['Boolean']['input']>;
  /** Payment rail code (e.g. pix, ach, wire, spei, sepa, co_breb, ec_bank_transfer). Auto-resolved if omitted. */
  payment_rail?: InputMaybe<Scalars['String']['input']>;
  /** PIX key (required for BRA PIX) */
  pix_key?: InputMaybe<Scalars['String']['input']>;
  /** Postal code */
  postal_code?: InputMaybe<Scalars['String']['input']>;
  /** Relationship with the beneficiary */
  relationship?: InputMaybe<Scalars['String']['input']>;
  /** Routing number (required for USA) */
  routing_number?: InputMaybe<Scalars['String']['input']>;
  /** Sort code (required for GBR Faster Payments) */
  sort_code?: InputMaybe<Scalars['String']['input']>;
  /** State/Province */
  state?: InputMaybe<Scalars['String']['input']>;
  /** Tax identification number. Optional for co_breb BREB_KEY beneficiaries; defaults to Loopay NIT when omitted. */
  tax_id?: InputMaybe<Scalars['String']['input']>;
  /** Tax identification type. Optional for co_breb BREB_KEY beneficiaries; defaults to NIT when omitted. Required for COL/ECU bank-account beneficiaries. */
  tax_id_type?: InputMaybe<Scalars['String']['input']>;
  /** Type of beneficiary: BANK_ACCOUNT | PIX | BREB_KEY */
  type: Scalars['String']['input'];
  /** Destination wallet address (required for CRYPTO/STABLECOIN rails) */
  wallet_address?: InputMaybe<Scalars['String']['input']>;
};

export type CreateClientInput = {
  config?: InputMaybe<Scalars['JSON']['input']>;
  country: Scalars['String']['input'];
  email: Scalars['String']['input'];
  kycStatus?: InputMaybe<AdminLoopayKycStatusEntity>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  name: Scalars['String']['input'];
  status?: InputMaybe<AdminLoopayClientStatusEntity>;
  taxId: Scalars['String']['input'];
  taxIdTypeId: Scalars['String']['input'];
};

export type CreateClientProviderRailInput = {
  clientId: Scalars['String']['input'];
  defaultAttributes?: InputMaybe<Scalars['JSON']['input']>;
  priority: Scalars['Int']['input'];
  providerId: Scalars['String']['input'];
  railId: Scalars['String']['input'];
};

export type CreateCurrencyInput = {
  /** Currency code */
  code: Scalars['String']['input'];
  /** Currency decimals */
  decimals?: InputMaybe<Scalars['Int']['input']>;
  /** Whether the currency is active */
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Currency display name */
  name: Scalars['String']['input'];
  /** Currency symbol */
  symbol: Scalars['String']['input'];
  /** Currency type */
  type: Scalars['String']['input'];
};

export type CreateCustomerInput = {
  /** Account purpose */
  account_purpose?: InputMaybe<Scalars['String']['input']>;
  /** Whether the customer acts as an intermediary */
  acting_as_intermediary?: InputMaybe<Scalars['Boolean']['input']>;
  /** Customer address */
  address?: InputMaybe<CustomerAddressInput>;
  /** Address line 1 */
  address_line_1?: InputMaybe<Scalars['String']['input']>;
  /** Associated persons (UBOs) */
  associated_persons?: InputMaybe<Array<AssociatedPersonInput>>;
  /** Birth date */
  birth_date?: InputMaybe<Scalars['String']['input']>;
  /** Account purpose for the business (business-specific values) */
  business_account_purpose?: InputMaybe<Scalars['String']['input']>;
  /** Business description */
  business_description?: InputMaybe<Scalars['String']['input']>;
  /** Business industry codes (NAICS) */
  business_industry?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Official registered business legal name */
  business_legal_name?: InputMaybe<Scalars['String']['input']>;
  /** Business legal or trade name. Required when customer_type is "business". Maximum 100 characters. */
  business_name?: InputMaybe<Scalars['String']['input']>;
  /** Source of funds for the business (business-specific values) */
  business_source_of_funds?: InputMaybe<Scalars['String']['input']>;
  /** Business type (corporation, llc, partnership, etc.) */
  business_type?: InputMaybe<Scalars['String']['input']>;
  /** City */
  city?: InputMaybe<Scalars['String']['input']>;
  /** Compliance screening explanation */
  compliance_screening_explanation?: InputMaybe<Scalars['String']['input']>;
  /** Whether business conducts money services */
  conducts_money_services?: InputMaybe<Scalars['Boolean']['input']>;
  /** Description of the money services the business conducts */
  conducts_money_services_description?: InputMaybe<Scalars['String']['input']>;
  /** Whether business conducts money services using Bridge */
  conducts_money_services_using_bridge?: InputMaybe<Scalars['Boolean']['input']>;
  /** Country code */
  country?: InputMaybe<Scalars['String']['input']>;
  /** Customer type. Defaults to "individual". Business is currently supported only with kyc_method="kyc_link". */
  customer_type?: InputMaybe<Scalars['String']['input']>;
  /** Date of birth (legacy alias for birth_date) */
  date_of_birth?: InputMaybe<Scalars['String']['input']>;
  /** Supporting documents */
  documents?: InputMaybe<Array<CustomerDocumentInput>>;
  /** Customer email */
  email: Scalars['String']['input'];
  /** Employment status */
  employment_status?: InputMaybe<Scalars['String']['input']>;
  /** Requested customer endorsements */
  endorsements?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Estimated annual revenue in USD. Valid bands: 0_99999, 100000_999999, 1000000_9999999, 10000000_49999999, 50000000_249999999, 250000000_plus */
  estimated_annual_revenue_usd?: InputMaybe<Scalars['String']['input']>;
  /** Expected monthly payment volume in USD */
  expected_monthly_payments_usd?: InputMaybe<Scalars['String']['input']>;
  /** External customer ID (auto-generated if not provided) */
  external_id?: InputMaybe<Scalars['String']['input']>;
  /** First name. Required for individual customers. */
  first_name?: InputMaybe<Scalars['String']['input']>;
  /** Whether the business has at least one intermediate legal entity owner with 25% or more ownership */
  has_material_intermediary_ownership?: InputMaybe<Scalars['Boolean']['input']>;
  /** High risk activities (enum of KYC-defined options) */
  high_risk_activities?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Explanation for high risk activities selection */
  high_risk_activities_explanation?: InputMaybe<Scalars['String']['input']>;
  /** Identifying information documents */
  identifying_information?: InputMaybe<Array<CustomerIdentifyingInformationInput>>;
  /** Business incorporation date */
  incorporation_date?: InputMaybe<Scalars['String']['input']>;
  /** Whether the business is a DAO */
  is_dao?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the business is a financial institution (virtual-account providers). */
  is_financial_institution?: InputMaybe<Scalars['Boolean']['input']>;
  /** KYC method */
  kyc_method?: InputMaybe<Scalars['String']['input']>;
  /** KYC provider override */
  kyc_provider?: InputMaybe<Scalars['String']['input']>;
  /** Last name. Required for individual customers. */
  last_name?: InputMaybe<Scalars['String']['input']>;
  /** Middle name */
  middle_name?: InputMaybe<Scalars['String']['input']>;
  /** Customer most recent occupation */
  most_recent_occupation?: InputMaybe<Scalars['String']['input']>;
  /** All nationalities (ISO 3166-1 alpha-3 codes) */
  nationalities?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Nationality */
  nationality?: InputMaybe<Scalars['String']['input']>;
  /** Number of employees range for virtual-account providers. One of: 1, 2-10, 11-50, 51-200, 201-1000, 1000+, unknown (legacy 201-500 and 501+ are still accepted). */
  number_of_employees?: InputMaybe<Scalars['String']['input']>;
  /** Whether business operates in prohibited countries */
  operates_in_prohibited_countries?: InputMaybe<Scalars['Boolean']['input']>;
  /** Beneficial ownership threshold for the submitted associated persons. Integer 5-25 (provider default 25), sent as a string */
  ownership_threshold?: InputMaybe<Scalars['String']['input']>;
  /** Phone number */
  phone?: InputMaybe<Scalars['String']['input']>;
  /** Physical address (for business customers) */
  physical_address?: InputMaybe<CustomerAddressInput>;
  /** Physical address city */
  physical_address_city?: InputMaybe<Scalars['String']['input']>;
  /** Physical address country */
  physical_address_country?: InputMaybe<Scalars['String']['input']>;
  /** Physical address line 1 */
  physical_address_line_1?: InputMaybe<Scalars['String']['input']>;
  /** Physical address line 2 */
  physical_address_line_2?: InputMaybe<Scalars['String']['input']>;
  /** Physical address postal code */
  physical_address_postal_code?: InputMaybe<Scalars['String']['input']>;
  /** Physical address state */
  physical_address_state?: InputMaybe<Scalars['String']['input']>;
  /** Place of birth */
  place_of_birth?: InputMaybe<CustomerPlaceOfBirthInput>;
  /** Postal code */
  postal_code?: InputMaybe<Scalars['String']['input']>;
  /** Primary website */
  primary_website?: InputMaybe<Scalars['String']['input']>;
  /** Registered address (for business customers) */
  registered_address?: InputMaybe<CustomerAddressInput>;
  /** Registered address city */
  registered_address_city?: InputMaybe<Scalars['String']['input']>;
  /** Registered address country */
  registered_address_country?: InputMaybe<Scalars['String']['input']>;
  /** Registered address line 1 */
  registered_address_line_1?: InputMaybe<Scalars['String']['input']>;
  /** Registered address line 2 */
  registered_address_line_2?: InputMaybe<Scalars['String']['input']>;
  /** Registered address postal code */
  registered_address_postal_code?: InputMaybe<Scalars['String']['input']>;
  /** Registered address state */
  registered_address_state?: InputMaybe<Scalars['String']['input']>;
  /** Company registration number for virtual-account providers (Mesta identificationNumber). Defaults to the tax id when omitted (in Colombia the NIT is both). */
  registration_number?: InputMaybe<Scalars['String']['input']>;
  /** Top-level selfies field. Send exactly one selfie image as a base64 data URI for direct API KYC */
  selfies?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Signed agreement ID */
  signed_agreement_id?: InputMaybe<Scalars['String']['input']>;
  /** Source of funds */
  source_of_funds?: InputMaybe<Scalars['String']['input']>;
  /** Source of funds description */
  source_of_funds_description?: InputMaybe<Scalars['String']['input']>;
  /** State */
  state?: InputMaybe<Scalars['String']['input']>;
  /** Tax ID */
  tax_id?: InputMaybe<Scalars['String']['input']>;
  /** Country code (ISO 3166-1 alpha-3) where the tax ID was issued */
  tax_id_issuing_country?: InputMaybe<Scalars['String']['input']>;
  /** Tax ID type */
  tax_id_type?: InputMaybe<Scalars['String']['input']>;
  /** Why the business has no website (required by Mesta when primary_website is empty). */
  website_absence_reason?: InputMaybe<Scalars['String']['input']>;
};

export type CreateDispersionInput = {
  /** Source-denominated amount in the wallet currency (e.g. USDT). The payout estimate is decided by operations later — quotes are indicative only. */
  amount: Scalars['String']['input'];
  /** Beneficiary ID */
  beneficiary_id: Scalars['String']['input'];
  /** Required idempotency key of the dispersion / off-ramp withdrawal (1-255 characters, unique per client; off-ramp and dispersion requests share one key space). A retry with the same key and the same payload (wallet, beneficiary, amount, currency) returns the original dispersion and never holds the balance or creates the custody transfer twice; the same key with a different payload is rejected with 409 IDEMPOTENCY_KEY_REUSED. A missing key is rejected with 400 IDEMPOTENCY_KEY_REQUIRED. In sandbox, a suffix (_created, _pending, _processing, _completed, _failed) only drives the mocked custody-transfer state; the dispersion stays PENDING until operations settle it. See docs/api/IDEMPOTENCY.md. */
  client_reference_id?: InputMaybe<Scalars['String']['input']>;
  /** Wallet currency (must match the source wallet currency) */
  currency: Scalars['String']['input'];
  /** Wallet ID */
  wallet_id: Scalars['String']['input'];
};

/** Create execution data (heavy payload) */
export type CreateExecutionDataInput = {
  /** Execution ID */
  execution_id: Scalars['String']['input'];
  /** Full data for replay/debug */
  full_data?: InputMaybe<Scalars['String']['input']>;
  /** Input payload */
  input_payload?: InputMaybe<Scalars['JSON']['input']>;
  /** Output payload */
  output_payload?: InputMaybe<Scalars['JSON']['input']>;
  /** Trigger payload */
  trigger_payload?: InputMaybe<Scalars['JSON']['input']>;
  /** Workflow version ID snapshot */
  workflow_version_id?: InputMaybe<Scalars['String']['input']>;
};

export type CreateFeeScheduleGraphqlInput = {
  /** Client the schedule belongs to. Omit or null to create a platform default schedule */
  clientId?: InputMaybe<Scalars['ID']['input']>;
  /** Currency code of a FIXED fee (rejected for PERCENT). When set, the schedule applies only to operations whose source currency equals it. Omit to apply to any currency, expressed in the operation source currency */
  currency?: InputMaybe<Scalars['String']['input']>;
  /** Maximum fee amount (decimal string). Must be >= minAmount */
  maxAmount?: InputMaybe<Scalars['String']['input']>;
  /** Minimum fee amount (decimal string). Must be <= maxAmount */
  minAmount?: InputMaybe<Scalars['String']['input']>;
  /** FIXED = flat amount, PERCENT = percentage of the base amount */
  mode: FeeMode;
  /** Operation the fee is charged on */
  operation: FeeOperation;
  /** Payment rail code the schedule is limited to. Omit or null to apply to any rail */
  railCode?: InputMaybe<Scalars['String']['input']>;
  /** Non-negative decimal as a string (up to 8 decimals). For PERCENT it is a percentage between 0 and 100 (1.5 = 1.5%) */
  value: Scalars['String']['input'];
};

/** Create a node execution record */
export type CreateNodeExecutionInput = {
  /** Connector ID */
  connector_id?: InputMaybe<Scalars['String']['input']>;
  /** Execution ID */
  execution_id: Scalars['String']['input'];
  /** Execution order */
  execution_order?: InputMaybe<Scalars['Int']['input']>;
  /** Idempotency key for financial ops */
  idempotency_key?: InputMaybe<Scalars['String']['input']>;
  /** Input data */
  input_data?: InputMaybe<Scalars['JSON']['input']>;
  /** Node ID in the canvas */
  node_id: Scalars['String']['input'];
  /** Node label */
  node_label: Scalars['String']['input'];
  /** Node type (trigger|action|check|etc) */
  node_type: Scalars['String']['input'];
};

export type CreateOffRampInput = {
  /** Source-denominated amount in the wallet currency for LATAM funding rails (e.g. USDT for co_breb/ec_bank_transfer — the destination estimate is reference-only). For other fiat beneficiaries it is the beneficiary payout amount and must match the quote destination amount when present. */
  amount: Scalars['String']['input'];
  /** Beneficiary ID */
  beneficiary_id: Scalars['String']['input'];
  /** Required idempotency key of the dispersion / off-ramp withdrawal (1-255 characters, unique per client; off-ramp and dispersion requests share one key space). A retry with the same key and the same payload (wallet, beneficiary, amount, currency) returns the original dispersion and never holds the balance or creates the custody transfer twice; the same key with a different payload is rejected with 409 IDEMPOTENCY_KEY_REUSED. A missing key is rejected with 400 IDEMPOTENCY_KEY_REQUIRED. In sandbox, a suffix (_created, _pending, _processing, _completed, _failed) only drives the mocked custody-transfer state; the dispersion stays PENDING until operations settle it. See docs/api/IDEMPOTENCY.md. */
  client_reference_id?: InputMaybe<Scalars['String']['input']>;
  /** Source wallet currency for LATAM funding rails (e.g. USDT). For other fiat beneficiaries, it must match the rail and quote destination currency when present. */
  currency: Scalars['String']['input'];
  /** Optional quote ID. Quotes stay informational (never a locked settlement price; payout stays manual). When supplied it must be your own quote, ACTIVE and unexpired, with source currency = wallet currency, target currency = beneficiary payout currency and source amount = `amount`; otherwise 422 with code QUOTE_NOT_FOUND (missing/foreign), QUOTE_EXPIRED, QUOTE_INACTIVE, QUOTE_CURRENCY_MISMATCH or QUOTE_AMOUNT_MISMATCH, before any funds are held. The same quote may be attached to more than one withdrawal. */
  quote_id?: InputMaybe<Scalars['String']['input']>;
  /** Wallet ID */
  wallet_id: Scalars['String']['input'];
};

export type CreateOperationTypeInput = {
  /** Operation type name */
  name: Scalars['String']['input'];
};

export type CreateP2PInput = {
  /** Amount */
  amount: Scalars['String']['input'];
  /** Required idempotency key of the P2P transfer (1-255 characters, unique per client). The sender amount is reserved before the provider call; a retry with the same key and the same payload returns the original transfer and never sends twice; the same key with a different payload is rejected with 409 IDEMPOTENCY_KEY_REUSED. A missing key is rejected with 400 IDEMPOTENCY_KEY_REQUIRED. The receiver is credited only when the provider confirms the transfer. See docs/api/IDEMPOTENCY.md. */
  client_reference_id?: InputMaybe<Scalars['String']['input']>;
  /** Currency */
  currency: Scalars['String']['input'];
  /** Destination wallet ID */
  destination_wallet_id: Scalars['String']['input'];
  /** Source wallet ID */
  source_wallet_id: Scalars['String']['input'];
};

export type CreatePaymentLinkInput = {
  /** Amount */
  amount: Scalars['String']['input'];
  /**
   * Deprecated and ignored. Suite generates payment-link:<Transaction.id>.
   * @deprecated Suite owns payment-link client reference generation for this flow.
   */
  client_reference_id?: InputMaybe<Scalars['String']['input']>;
  /** ISO 3-letter country code (e.g., COL, MEX, BRA, ECU) */
  country?: InputMaybe<Scalars['String']['input']>;
  /** Currency */
  currency: Scalars['String']['input'];
  /** Customer ID */
  customer_id: Scalars['String']['input'];
  /** Expiration time in minutes (default: 30) */
  expires_in_minutes?: InputMaybe<Scalars['Float']['input']>;
  /** Payer identification details. Required for ec_bank_transfer payment links. All fields inside this object are mandatory when present. Ignored for non-Ecuador rails. */
  payer_details?: InputMaybe<PayerDetailsInput>;
  /** Payment method / rail code (e.g., co_breb, pix, spei) */
  payment_method?: InputMaybe<Scalars['String']['input']>;
  /** Purpose of the on-ramp transaction */
  purpose?: InputMaybe<Scalars['String']['input']>;
  /** Callback URL for Ecuador bank transfer payment links. Required when payment_method is ec_bank_transfer. Must be a valid HTTPS URL. Ignored for non-Ecuador rails. */
  return_url?: InputMaybe<Scalars['String']['input']>;
  /** Wallet ID */
  wallet_id: Scalars['String']['input'];
};

export type CreatePaymentRailInput = {
  /** Unique payment rail code */
  code: Scalars['String']['input'];
  /** ISO3 country code */
  country: Scalars['String']['input'];
  /** Currency code */
  currency: Scalars['String']['input'];
  /** Rail direction */
  direction: Scalars['String']['input'];
  /** Whether the rail is active */
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Payment rail display name */
  name: Scalars['String']['input'];
};

export type CreateProviderInput = {
  /** Unique provider code */
  code: Scalars['String']['input'];
  /** Provider configuration payload */
  config?: InputMaybe<Scalars['JSON']['input']>;
  /** Whether the provider is active */
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Provider display name */
  name: Scalars['String']['input'];
  /** Provider type */
  type: Scalars['String']['input'];
};

export type CreateProviderPaymentRailInput = {
  /** Provider payment rail configuration payload */
  config?: InputMaybe<Scalars['JSON']['input']>;
  /** Whether the mapping is active */
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Provider ID */
  providerId: Scalars['String']['input'];
  /** Payment rail ID */
  railId: Scalars['String']['input'];
};

export type CreateQuoteInput = {
  /** Amount */
  amount: Scalars['String']['input'];
  /** Source currency */
  from_currency: Scalars['String']['input'];
  /** Destination currency */
  to_currency: Scalars['String']['input'];
};

/** [admin-loopay-recaudos] Manually recorded inbound deposit */
export type CreateRecaudoInput = {
  /** Decimal amount as a string */
  amount: Scalars['String']['input'];
  currency: Scalars['String']['input'];
  customerId: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  providerCode?: InputMaybe<Scalars['String']['input']>;
  /** Provider event id. Together with providerCode it claims an idempotency row. */
  providerEventId?: InputMaybe<Scalars['String']['input']>;
  /** External reference printed on the bank statement */
  reference?: InputMaybe<Scalars['String']['input']>;
  /** 'bank_transfer' | 'cash' | 'provider_manual' | 'other' */
  source: Scalars['String']['input'];
  walletId: Scalars['ID']['input'];
};

export type CreateStaffUserInput = {
  authUid?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  staffRole?: InputMaybe<AdminLoopayStaffRoleEntity>;
};

/** Create a tag */
export type CreateTagInput = {
  /** HEX color (#FF5733) */
  color?: InputMaybe<Scalars['String']['input']>;
  /** Tag name (unique per client) */
  name: Scalars['String']['input'];
};

export type CreateTaxIdTypeInput = {
  /** Countries where this tax ID type is used (ISO 3166-1 alpha-3) */
  countries?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Tax ID type name */
  name: Scalars['String']['input'];
};

export type CreateTransferInput = {
  /** Amount */
  amount: Scalars['String']['input'];
  /** Destination blockchain network */
  chain: Scalars['String']['input'];
  /** Required idempotency key of the transfer (1-255 characters, unique per client). A retry with the same key and the same payload returns the original transaction and never sends twice; the same key with a different payload is rejected with 409 IDEMPOTENCY_KEY_REUSED. A missing key is rejected with 400 IDEMPOTENCY_KEY_REQUIRED. See docs/api/IDEMPOTENCY.md. */
  client_reference_id?: InputMaybe<Scalars['String']['input']>;
  /** Destination asset / currency */
  currency: Scalars['String']['input'];
  /** Destination address. Prefer `to_address`; `destination_address` is kept temporarily for backward compatibility. */
  destination_address?: InputMaybe<Scalars['String']['input']>;
  /** Destination address (`to_address` in the direct transfer API contract) */
  to_address?: InputMaybe<Scalars['String']['input']>;
  /** Wallet ID */
  wallet_id: Scalars['String']['input'];
};

export type CreateWalletInput = {
  /** Alias opcional para la wallet */
  alias?: InputMaybe<Scalars['String']['input']>;
  /** Blockchain para la wallet. Si no se especifica, usa el default del proveedor */
  chain?: InputMaybe<Scalars['String']['input']>;
  /** ID del customer que será dueño de la wallet */
  customer_id: Scalars['String']['input'];
};

/** Create a new workflow execution */
export type CreateWorkflowExecutionInput = {
  /** Idempotency key to prevent duplicates */
  idempotency_key?: InputMaybe<Scalars['String']['input']>;
  /** Input payload */
  input_payload?: InputMaybe<Scalars['JSON']['input']>;
  /** Execution mode */
  mode?: InputMaybe<Scalars['String']['input']>;
  /** Trigger payload (immutable snapshot) */
  trigger_payload?: InputMaybe<Scalars['JSON']['input']>;
  /** Workflow ID to execute */
  workflow_id: Scalars['String']['input'];
  /** Workflow version ID to use */
  workflow_version_id?: InputMaybe<Scalars['String']['input']>;
};

/** Create a new workflow */
export type CreateWorkflowInput = {
  /** Category */
  category?: InputMaybe<Scalars['String']['input']>;
  /** Initial connections (validated with Zod) */
  connections?: InputMaybe<Scalars['JSON']['input']>;
  /** User ID creating this workflow */
  created_by_id: Scalars['String']['input'];
  /** Description */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Is template */
  is_template?: InputMaybe<Scalars['Boolean']['input']>;
  /** Metadata */
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  /** Workflow name (unique per client) */
  name: Scalars['String']['input'];
  /** Initial nodes (validated with Zod) */
  nodes?: InputMaybe<Scalars['JSON']['input']>;
  /** Required products/connectors */
  requires?: InputMaybe<Scalars['JSON']['input']>;
  /** Workflow settings */
  settings?: InputMaybe<Scalars['JSON']['input']>;
};

/** [admin-loopay-dispersiones] #413 provider return matched by ops: exactly what the provider returned to the ops vault */
export type CreditDispersionReturnInput = {
  /** Amount the provider returned to the ops vault (decimal string, at most 8 decimals, at most the withdrawn gross) */
  amount: Scalars['String']['input'];
  /** Reference of the match: the provider refund id or the ops-vault inbound hash */
  reference: Scalars['String']['input'];
};

/** VIP crypto-payout exception after the change */
export type CryptoPayoutAllowanceEntity = {
  __typename?: 'CryptoPayoutAllowanceEntity';
  /** WARNING - retired exception. Payouts are FIAT only and no USDT leaves custody to an external address; this flag is ignored and can no longer be enabled (422 CRYPTO_PAYOUT_NOT_AVAILABLE), only disabled. */
  allow_crypto_payout: Scalars['Boolean']['output'];
  /** When the exception was enabled (null while disabled) */
  allow_crypto_payout_enabled_at?: Maybe<Scalars['DateTime']['output']>;
  /** Staff user that enabled the exception (null while disabled) */
  allow_crypto_payout_enabled_by_user_id?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  target: AdminLoopayCryptoPayoutAllowanceTarget;
  /** Warning to show next to the flag in every UI */
  warning: Scalars['String']['output'];
};

export type CurrencyFiltersInput = {
  /** Filter by currency code */
  code?: InputMaybe<Scalars['String']['input']>;
  /** Filter by active status */
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by currency name */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by currency type */
  type?: InputMaybe<Scalars['String']['input']>;
};

export type CurrencyGraphqlEntity = {
  __typename?: 'CurrencyGraphqlEntity';
  /** Currency code */
  code: Scalars['String']['output'];
  /** Creation timestamp */
  created_at: Scalars['DateTime']['output'];
  /** Currency decimals */
  decimals: Scalars['Int']['output'];
  /** Whether the currency is active */
  is_active: Scalars['Boolean']['output'];
  /** Currency name */
  name: Scalars['String']['output'];
  /** Currency symbol */
  symbol: Scalars['String']['output'];
  /** Currency type */
  type: Scalars['String']['output'];
};

export type CurrencyPaymentMethodCapabilityEntity = {
  __typename?: 'CurrencyPaymentMethodCapabilityEntity';
  /** Currency code (fiat) */
  currency: Scalars['String']['output'];
  /** Description of this payment capability */
  description: Scalars['String']['output'];
  /** Minimum amount for this currency */
  minimum_amount: Scalars['Float']['output'];
  /** Supported payment methods for this currency */
  payment_methods: Array<Scalars['String']['output']>;
};

export type CurrentUser = {
  __typename?: 'CurrentUser';
  /** Firebase authentication UID */
  auth_uid?: Maybe<Scalars['String']['output']>;
  /** Associated client ID for tenant-scoped users */
  client_id?: Maybe<Scalars['String']['output']>;
  /** Company or business name from CustomerProfile */
  company_name?: Maybe<Scalars['String']['output']>;
  /** Company-specific roles */
  company_roles: Array<Scalars['String']['output']>;
  /** Associated company user accounts */
  company_user?: Maybe<Array<CompanyUserRole>>;
  /** Associated customer profile ID */
  customer_profile_id?: Maybe<Scalars['String']['output']>;
  /** User email address */
  email: Scalars['String']['output'];
  /** Whether user has accepted the latest terms and conditions */
  has_accepted_latest_terms: Scalars['Boolean']['output'];
  /** Unique user identifier */
  id: Scalars['String']['output'];
  /** KYC verification status from CustomerProfile */
  kyc_status?: Maybe<Scalars['String']['output']>;
  /** User full name */
  name: Scalars['String']['output'];
  /** Combined user roles (staff + company) */
  roles: Array<Scalars['String']['output']>;
  /** Staff-specific roles */
  staff_roles: Array<Scalars['String']['output']>;
};

export type CustodyOpsVaultPosition = {
  __typename?: 'CustodyOpsVaultPosition';
  /** Per-asset positions */
  assets: Array<VaultAssetPosition>;
  /** Ops account id at the custody provider */
  vaultAccountId: Scalars['String']['output'];
};

export type CustomerAddressInput = {
  /** City */
  city: Scalars['String']['input'];
  /** Country code */
  country: Scalars['String']['input'];
  /** Postal code */
  postal_code?: InputMaybe<Scalars['String']['input']>;
  /** State or province */
  state?: InputMaybe<Scalars['String']['input']>;
  /** Street address */
  street?: InputMaybe<Scalars['String']['input']>;
  /** Street address line 2 */
  street_line_2?: InputMaybe<Scalars['String']['input']>;
};

export type CustomerDocumentInput = {
  /** Document description */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Base64 encoded document file */
  file: Scalars['String']['input'];
  /** Document purposes */
  purposes: Array<Scalars['String']['input']>;
};

export type CustomerEndorsementEntity = {
  __typename?: 'CustomerEndorsementEntity';
  /** Approval timestamp */
  approved_at?: Maybe<Scalars['String']['output']>;
  /** Artifact type currently backing the receive rail for the customer */
  artifact_type: Scalars['String']['output'];
  /** Countries supported by this endorsement rail */
  available_countries?: Maybe<Array<Scalars['String']['output']>>;
  /** Primary country associated with this endorsement rail */
  country?: Maybe<Scalars['String']['output']>;
  /** Limits associated with this endorsement */
  limits?: Maybe<Scalars['JSON']['output']>;
  /** Payment rail code */
  payment_rail: Scalars['String']['output'];
  /** Backend-owned receive readiness for this rail based on real artifact truth */
  readiness: Scalars['String']['output'];
  /** Status */
  status: Scalars['String']['output'];
};

export type CustomerEntity = {
  __typename?: 'CustomerEntity';
  /** Address */
  address?: Maybe<Scalars['JSON']['output']>;
  /** Business legal or trade name when customer_type is business. Null for individual customers. */
  business_name?: Maybe<Scalars['String']['output']>;
  /** Customer country */
  country?: Maybe<Scalars['String']['output']>;
  /** Creation timestamp */
  created_at: Scalars['String']['output'];
  /** Operational customer status */
  customer_status?: Maybe<Scalars['String']['output']>;
  /** Explicit customer type semantics. Business customers are supported only through kyc_method "kyc_link". */
  customer_type: Scalars['String']['output'];
  /** Email address */
  email: Scalars['String']['output'];
  /** Customer endorsements */
  endorsements?: Maybe<Array<CustomerEndorsementEntity>>;
  /** External customer ID */
  external_id?: Maybe<Scalars['String']['output']>;
  /** First name */
  first_name: Scalars['String']['output'];
  /** Customer ID */
  id: Scalars['String']['output'];
  /** URL to complete KYC verification */
  kyc_link?: Maybe<Scalars['String']['output']>;
  /** KYC method */
  kyc_method?: Maybe<Scalars['String']['output']>;
  /** Canonical KYC snapshot returned alongside create/resume flows so the frontend can continue from the exact backend-owned state. */
  kyc_snapshot?: Maybe<CustomerKycSnapshotEntity>;
  /** KYC status */
  kyc_status: Scalars['String']['output'];
  /** Last name */
  last_name: Scalars['String']['output'];
  /** Middle name */
  middle_name?: Maybe<Scalars['String']['output']>;
  /** Primary next action derived from the canonical KYC snapshot, ordered for immediate frontend continuation. */
  next_required_action?: Maybe<Scalars['String']['output']>;
  /** Phone number */
  phone?: Maybe<Scalars['String']['output']>;
  /** Tax ID */
  tax_id?: Maybe<Scalars['String']['output']>;
  /** Tax ID type */
  tax_id_type?: Maybe<Scalars['String']['output']>;
  /** Terms of Service acceptance URL */
  tos_link?: Maybe<Scalars['String']['output']>;
  /** Last update timestamp */
  updated_at: Scalars['String']['output'];
};

export type CustomerIdentifyingInformationInput = {
  /** Document description */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Expiration date */
  expiration?: InputMaybe<Scalars['String']['input']>;
  /** Back image base64 */
  image_back?: InputMaybe<Scalars['String']['input']>;
  /** Front image base64 */
  image_front?: InputMaybe<Scalars['String']['input']>;
  /** Issuing country code */
  issuing_country: Scalars['String']['input'];
  /** Document number */
  number?: InputMaybe<Scalars['String']['input']>;
  /** Identification document type. Individuals: DNI/PASSPORT/OTHER or country tax id (USA: SSN/ITIN only). Businesses: company tax id type (NIT, RUC, EIN...). */
  type: Scalars['String']['input'];
};

export type CustomerKycFreshnessEntity = {
  __typename?: 'CustomerKycFreshnessEntity';
  last_reconciliation_source: Scalars['String']['output'];
  provider_checked_at?: Maybe<Scalars['String']['output']>;
  reconciliation_state: Scalars['String']['output'];
  snapshot_generated_at: Scalars['String']['output'];
  webhook_updated_at?: Maybe<Scalars['String']['output']>;
};

export type CustomerKycNextStepEntity = {
  __typename?: 'CustomerKycNextStepEntity';
  code: Scalars['String']['output'];
  country?: Maybe<Scalars['String']['output']>;
  rail?: Maybe<Scalars['String']['output']>;
  route: Scalars['String']['output'];
};

export type CustomerKycReasonEntity = {
  __typename?: 'CustomerKycReasonEntity';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  retryable: Scalars['Boolean']['output'];
  target_key: Scalars['String']['output'];
  target_type: Scalars['String']['output'];
};

export type CustomerKycRequirementMissingEntity = {
  __typename?: 'CustomerKycRequirementMissingEntity';
  document_purposes: Array<Scalars['String']['output']>;
  fields: Array<Scalars['String']['output']>;
  questionnaire_fields: Array<Scalars['String']['output']>;
};

export type CustomerKycRequirementPendingEntity = {
  __typename?: 'CustomerKycRequirementPendingEntity';
  key: Scalars['String']['output'];
  kind: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type CustomerKycRequirementsEntity = {
  __typename?: 'CustomerKycRequirementsEntity';
  issues: Array<CustomerKycReasonEntity>;
  missing: CustomerKycRequirementMissingEntity;
  pending: Array<CustomerKycRequirementPendingEntity>;
};

export type CustomerKycSnapshotEntity = {
  __typename?: 'CustomerKycSnapshotEntity';
  actions: Array<Scalars['String']['output']>;
  freshness: CustomerKycFreshnessEntity;
  kyc_link?: Maybe<Scalars['String']['output']>;
  lifecycle: Scalars['String']['output'];
  next_step?: Maybe<CustomerKycNextStepEntity>;
  onboarding_mode?: Maybe<Scalars['String']['output']>;
  prefill?: Maybe<Scalars['JSON']['output']>;
  provider_customer_state: Scalars['String']['output'];
  reasons: Array<CustomerKycReasonEntity>;
  requirements: CustomerKycRequirementsEntity;
  tos: CustomerKycTosEntity;
};

export type CustomerKycTosEntity = {
  __typename?: 'CustomerKycTosEntity';
  accepted: Scalars['Boolean']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type CustomerPlaceOfBirthInput = {
  /** City of birth */
  city?: InputMaybe<Scalars['String']['input']>;
  /** Country of birth (ISO 3166-1 alpha-3) */
  country: Scalars['String']['input'];
};

export enum CustomerProviderEnum {
  Bridge = 'BRIDGE'
}

/** Customer data virtual-account providers need (Mesta, KiraFin). Column data (phone, formation date, business type, website, registered address) goes to the KYC data; the rest to customer metadata.providerProfile. Omitted fields keep their stored value. */
export type CustomerProviderProfileInput = {
  addressCity?: InputMaybe<Scalars['String']['input']>;
  /** ISO 3166-1 alpha-2 or alpha-3 country code. */
  addressCountry?: InputMaybe<Scalars['String']['input']>;
  addressPostalCode?: InputMaybe<Scalars['String']['input']>;
  addressState?: InputMaybe<Scalars['String']['input']>;
  addressStreet?: InputMaybe<Scalars['String']['input']>;
  /** Business industry as a KiraFin NAICS subsector slug (e.g. professional_scientific_technical, real_estate); see docs.kirafin.ai reference/users/values. Stored in the KYB industry. */
  businessIndustry?: InputMaybe<Scalars['String']['input']>;
  /** One of: sole_proprietorship, partnership, corporation, limited_liability_company, other. */
  businessType?: InputMaybe<Scalars['String']['input']>;
  /** Incorporation date, YYYY-MM-DD. */
  formationDate?: InputMaybe<Scalars['String']['input']>;
  isFinancialInstitution?: InputMaybe<Scalars['Boolean']['input']>;
  /** One of: 1, 2-10, 11-50, 51-200, 201-1000, 1000+, unknown, 201-500, 501+. */
  numberOfEmployees?: InputMaybe<Scalars['String']['input']>;
  /** Business phone in international format, e.g. +573001112233. */
  phone?: InputMaybe<Scalars['String']['input']>;
  /** Company registration number. Defaults to the tax id when never set. */
  registrationNumber?: InputMaybe<Scalars['String']['input']>;
  representativeFirstName?: InputMaybe<Scalars['String']['input']>;
  representativeLastName?: InputMaybe<Scalars['String']['input']>;
  /** Required by Mesta when the business has no website. */
  websiteAbsenceReason?: InputMaybe<Scalars['String']['input']>;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type DepositInstructionsResponse = {
  __typename?: 'DepositInstructionsResponse';
  /** Customer ID */
  customer_id: Scalars['String']['output'];
  /** Crypto deposit network of the wallet (wallet asset catalog network, e.g. tron); null when the wallet has no catalog network */
  network?: Maybe<Scalars['String']['output']>;
  /** List of virtual accounts for deposits */
  virtual_accounts: Array<VirtualAccountItem>;
  /** Wallet ID */
  wallet_id: Scalars['String']['output'];
};

/** [admin-loopay-dispersiones] Fiat leg actually settled with the bank */
export type DispersionFiatSettlementInput = {
  /** Decimal as string */
  amount?: InputMaybe<Scalars['String']['input']>;
  /** Bank-negotiated rate (optional, entered by ops), decimal as string */
  bank_rate?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  /** Fees charged, decimal as string */
  fees?: InputMaybe<Scalars['String']['input']>;
  /** Applied FX rate, decimal as string */
  rate?: InputMaybe<Scalars['String']['input']>;
};

/** [admin-loopay-dispersiones] One indicative provider rate for a dispersion (refresh-on-view, never locked) */
export type DispersionIndicativeRate = {
  __typename?: 'DispersionIndicativeRate';
  /** Single fee currency, null when feeless */
  feeCurrency?: Maybe<Scalars['String']['output']>;
  /** When the rate was fetched (live on view) */
  fetchedAt: Scalars['DateTime']['output'];
  /** Always true: the rate is indicative and non-binding */
  indicative: Scalars['Boolean']['output'];
  /** True when the rate comes from the sandbox mock (non-production environments) */
  mock: Scalars['Boolean']['output'];
  provider: DispersionRateProvider;
  /** Conversion rate target/source, decimal as string */
  rate: Scalars['String']['output'];
  /** Dispersion source amount, decimal as string */
  sourceAmount: Scalars['String']['output'];
  sourceCurrency: Scalars['String']['output'];
  /** Estimated destination amount, decimal as string */
  targetAmount: Scalars['String']['output'];
  targetCurrency: Scalars['String']['output'];
  /** Same-currency fee total, decimal as string */
  totalFee: Scalars['String']['output'];
};

/** [admin-loopay-dispersiones] Live indicative rate list for one dispersion — both covering providers when they answer */
export type DispersionIndicativeRatesPayload = {
  __typename?: 'DispersionIndicativeRatesPayload';
  /** One indicative rate per covering provider that answered */
  rates: Array<DispersionIndicativeRate>;
};

export type DispersionPayoutStatus = {
  __typename?: 'DispersionPayoutStatus';
  /** Delivery chain when applicable */
  chain?: Maybe<Scalars['String']['output']>;
  /** Vendor payout/order id */
  externalId: Scalars['String']['output'];
  /** SELECTED quote id */
  fxQuoteId: Scalars['String']['output'];
  /** When the payout was placed */
  placedAt: Scalars['DateTime']['output'];
  /** Staff user that placed the payout */
  placedBy: Scalars['String']['output'];
  /** Paying provider code */
  providerCode: Scalars['String']['output'];
  /** PLACED | EXECUTED | FAILED */
  state: Scalars['String']['output'];
  /** When the terminal decision landed */
  terminalAt?: Maybe<Scalars['DateTime']['output']>;
  /** Vendor status of the terminal decision */
  terminalVendorStatus?: Maybe<Scalars['String']['output']>;
};

/** [admin-loopay-dispersiones] One provider quote fetched for a dispersion */
export type DispersionProviderQuote = {
  __typename?: 'DispersionProviderQuote';
  /** Per-quote expiry: min(local window, provider expiry) */
  expiresAt: Scalars['DateTime']['output'];
  /** Single fee currency, null when feeless */
  feeCurrency?: Maybe<Scalars['String']['output']>;
  /** Derived pair, e.g. USD/BRL */
  pair: Scalars['String']['output'];
  provider: FetchDispersionQuoteProvider;
  /** Real provider quote id */
  providerQuoteId: Scalars['String']['output'];
  /** Persisted ExchangeQuote id (usable as fxQuoteId) */
  quoteId: Scalars['ID']['output'];
  /** Conversion rate, decimal as string */
  rate: Scalars['String']['output'];
  /** Transaction-derived source amount, decimal as string */
  sourceAmount: Scalars['String']['output'];
  sourceCurrency: Scalars['String']['output'];
  /** Quote status at fetch time (ACTIVE) */
  status: Scalars['String']['output'];
  /** Provider-quoted destination amount, decimal as string */
  targetAmount: Scalars['String']['output'];
  /** Same-currency fee total, decimal as string */
  totalFee: Scalars['String']['output'];
};

/** [admin-loopay-dispersiones] Filters for the pending-dispersion queue */
export type DispersionQueueFiltersInput = {
  clientId?: InputMaybe<Scalars['ID']['input']>;
  customerId?: InputMaybe<Scalars['ID']['input']>;
  /** Narrows the status page to one withdrawal state (metadata.dispersion.state), e.g. 'AWAITING_APPROVAL' for the #413 approval view */
  dispersionState?: InputMaybe<Scalars['String']['input']>;
  /** 'PENDING' (default), 'PROCESSING' (legacy), or a terminal status for history: 'COMPLETED', 'FAILED', 'REJECTED' (REJECTED covers v2 CANCELLED — check dispersion_state) */
  status?: InputMaybe<Scalars['String']['input']>;
};

/** [admin-loopay-dispersiones] Provider backing one indicative dispersion rate */
export type DispersionRateProvider = {
  __typename?: 'DispersionRateProvider';
  /** Provider catalog code (kirafin | mesta) */
  code: Scalars['String']['output'];
  /** Provider display name */
  name: Scalars['String']['output'];
};

export type DispersionResponse = {
  __typename?: 'DispersionResponse';
  /** Message */
  message: Scalars['String']['output'];
  /** Dispersion status (PENDING until operations settles it) */
  status: Scalars['String']['output'];
  /** Dispersion transaction ID */
  transaction_id: Scalars['String']['output'];
};

/** [transactions] Result of a dev/test-only simulated dispersion action */
export type DispersionSimulationResult = {
  __typename?: 'DispersionSimulationResult';
  /** Simulated action that was applied */
  action: Scalars['String']['output'];
  /** Dispersion transaction id */
  dispersion_id: Scalars['ID']['output'];
  /** Dispersion v2 state after the action: PENDING, COMPLETED, FAILED, CANCELLED (or null before any state exists) */
  dispersion_state: Scalars['String']['output'];
  /** Human-readable confirmation */
  message: Scalars['String']['output'];
  /** TransactionStatus after the action (v2 CANCELLED persists as REJECTED) */
  status: Scalars['String']['output'];
};

/** [admin-loopay-endorsements] Filters for the pending-endorsement queue */
export type EndorsementQueueFiltersInput = {
  clientId?: InputMaybe<Scalars['ID']['input']>;
  /** PaymentRail code */
  railCode?: InputMaybe<Scalars['String']['input']>;
};

export type EndorsementResponse = {
  __typename?: 'EndorsementResponse';
  /** Artifact type currently backing the receive rail for the customer */
  artifact_type?: Maybe<Scalars['String']['output']>;
  /** Countries supported by this endorsement rail. SEPA exposes the full allowlist; other rails default to their configured country when available. */
  available_countries?: Maybe<Array<Scalars['String']['output']>>;
  /** Primary country associated with this endorsement rail. SEPA uses DEU for ISO3 consistency; non-SEPA rails expose their configured country when available. */
  country?: Maybe<Scalars['String']['output']>;
  /** Creation timestamp */
  created_at: Scalars['String']['output'];
  /** Endorsement ID */
  id: Scalars['String']['output'];
  /** Recovery KYC link returned by the existing endorsement service response */
  kyc_link?: Maybe<Scalars['String']['output']>;
  /** Payment rail code */
  payment_rail: Scalars['String']['output'];
  /** Backend-owned receive readiness for this rail based on real artifact truth */
  readiness?: Maybe<Scalars['String']['output']>;
  /** Status */
  status: Scalars['String']['output'];
  /** Recovery Terms of Service link returned by the existing endorsement service response */
  tos_link?: Maybe<Scalars['String']['output']>;
};

/** Heavy execution data — separated for performance (n8n pattern) */
export type ExecutionDataEntity = {
  __typename?: 'ExecutionDataEntity';
  /** Execution ID */
  execution_id: Scalars['String']['output'];
  /** Full execution data for replay/debug */
  full_data?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Input payload */
  input_payload?: Maybe<Scalars['JSON']['output']>;
  /** Output payload (final result) */
  output_payload?: Maybe<Scalars['JSON']['output']>;
  /** Trigger payload (immutable snapshot) */
  trigger_payload?: Maybe<Scalars['JSON']['output']>;
  /** Workflow version ID snapshot */
  workflow_version_id?: Maybe<Scalars['String']['output']>;
};

/** Filter executions */
export type ExecutionFilterInput = {
  /** Include soft-deleted */
  include_deleted?: InputMaybe<Scalars['Boolean']['input']>;
  /** Limit (max 100) */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** Filter by mode */
  mode?: InputMaybe<Scalars['String']['input']>;
  /** Offset */
  offset?: InputMaybe<Scalars['Int']['input']>;
  /** Filter by status */
  status?: InputMaybe<Scalars['String']['input']>;
  /** Filter by workflow ID */
  workflow_id?: InputMaybe<Scalars['String']['input']>;
};

/** Key-value metadata for an execution */
export type ExecutionMetadataEntity = {
  __typename?: 'ExecutionMetadataEntity';
  execution_id: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** Metadata key */
  key: Scalars['String']['output'];
  /** Metadata value */
  value: Scalars['String']['output'];
};

/** How the execution was triggered */
export enum ExecutionMode {
  Internal = 'INTERNAL',
  Manual = 'MANUAL',
  Retry = 'RETRY',
  RetryManual = 'RETRY_MANUAL',
  SubWorkflow = 'SUB_WORKFLOW',
  Test = 'TEST',
  Trigger = 'TRIGGER',
  Webhook = 'WEBHOOK'
}

/** Execution lifecycle status */
export enum ExecutionStatus {
  Cancelled = 'CANCELLED',
  Compensated = 'COMPENSATED',
  Compensating = 'COMPENSATING',
  CompensationFailed = 'COMPENSATION_FAILED',
  Failed = 'FAILED',
  Partial = 'PARTIAL',
  Pending = 'PENDING',
  Running = 'RUNNING',
  Success = 'SUCCESS',
  TimedOut = 'TIMED_OUT',
  Waiting = 'WAITING'
}

/** Execution summary statistics */
export type ExecutionSummary = {
  __typename?: 'ExecutionSummary';
  cancelled: Scalars['Int']['output'];
  compensated: Scalars['Int']['output'];
  compensating: Scalars['Int']['output'];
  compensation_failed: Scalars['Int']['output'];
  failed: Scalars['Int']['output'];
  partial: Scalars['Int']['output'];
  pending: Scalars['Int']['output'];
  running: Scalars['Int']['output'];
  success: Scalars['Int']['output'];
  timed_out: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  waiting: Scalars['Int']['output'];
};

/** [admin-loopay-dispersiones] Failure payload */
export type FailDispersionInput = {
  reason: Scalars['String']['input'];
};

/** How a fee schedule computes its amount: FIXED (flat value) or PERCENT (value is a percentage of the base amount) */
export enum FeeMode {
  Fixed = 'FIXED',
  Percent = 'PERCENT'
}

/** Operation a platform fee can be charged on (VA_CREATION, DEPOSIT, WITHDRAWAL, PAYOUT, P2P, CRYPTO_TRANSFER) */
export enum FeeOperation {
  CryptoTransfer = 'CRYPTO_TRANSFER',
  Deposit = 'DEPOSIT',
  P2P = 'P2P',
  Payout = 'PAYOUT',
  VaCreation = 'VA_CREATION',
  Withdrawal = 'WITHDRAWAL'
}

/** [admin-loopay-dispersiones] Multi-provider quote list for one dispersion fetch */
export type FetchDispersionQuotePayload = {
  __typename?: 'FetchDispersionQuotePayload';
  /** One quote per covering provider that answered successfully */
  quotes: Array<DispersionProviderQuote>;
};

/** [admin-loopay-dispersiones] Provider backing one fetched dispersion quote */
export type FetchDispersionQuoteProvider = {
  __typename?: 'FetchDispersionQuoteProvider';
  /** Provider catalog code (kirafin | mesta) */
  code: Scalars['String']['output'];
  /** Provider display name */
  name: Scalars['String']['output'];
};

export type FirebaseUserInfo = {
  __typename?: 'FirebaseUserInfo';
  /** User email from Firebase */
  email: Scalars['String']['output'];
  /** Whether the email is verified in Firebase */
  email_verified: Scalars['String']['output'];
  /** Display name from Firebase */
  name?: Maybe<Scalars['String']['output']>;
  /** Phone number from Firebase */
  phone_number?: Maybe<Scalars['String']['output']>;
  /** Profile picture URL from Firebase */
  picture?: Maybe<Scalars['String']['output']>;
  /** Firebase UID */
  uid: Scalars['String']['output'];
};

export type GetIndicativeRateInput = {
  /** Source currency */
  from_currency: Scalars['String']['input'];
  /** Destination currency */
  to_currency: Scalars['String']['input'];
};

export type GetQuoteInput = {
  /** Amount */
  amount: Scalars['String']['input'];
  /** Source currency */
  from_currency: Scalars['String']['input'];
  /** Destination currency */
  to_currency: Scalars['String']['input'];
};

export type GetTosLinkInput = {
  /** Email address for ToS agreement */
  email: Scalars['String']['input'];
  /** KYC provider override for ToS generation */
  kyc_provider?: InputMaybe<Scalars['String']['input']>;
  /** Redirect URI after ToS acceptance */
  redirect_uri: Scalars['String']['input'];
};

export type HealthCheckResponse = {
  __typename?: 'HealthCheckResponse';
  /** Health status */
  status: Scalars['String']['output'];
  /** Current timestamp */
  timestamp: Scalars['String']['output'];
  /** API version */
  version: Scalars['String']['output'];
};

/** [admin-loopay-wallets] Vault-balance import payload (the imported amount is computed from custody, never typed by ops) */
export type ImportVaultBalanceInput = {
  note?: InputMaybe<Scalars['String']['input']>;
};

export type IndicativeRateEntity = {
  __typename?: 'IndicativeRateEntity';
  /** Source currency code */
  from: Scalars['String']['output'];
  /** Indicative exchange rate */
  rate: Scalars['String']['output'];
  /** Destination currency code */
  to: Scalars['String']['output'];
};

export type InitiateAvailabilityInput = {
  /** Funds source */
  source: VendorFundsSourceInput;
  /** Decimal-string source amount */
  sourceAmount: Scalars['String']['input'];
};

export type InviteTenantAdminInput = {
  /** Email of the person to invite as a tenant admin */
  email: Scalars['String']['input'];
};

export type KycStatusEntity = {
  __typename?: 'KYCStatusEntity';
  /** Whether the customer can perform transactions (KYC approved AND customer active) */
  can_transact: Scalars['Boolean']['output'];
  /** Customer country code */
  country?: Maybe<Scalars['String']['output']>;
  /** Current customer operational status */
  customer_status: Scalars['String']['output'];
  /** Whether the customer has an address registered */
  has_address: Scalars['Boolean']['output'];
  /** Whether the customer has real persisted evidence of API onboarding submission */
  has_submitted_api_onboarding: Scalars['Boolean']['output'];
  /** Whether the customer has a tax ID registered */
  has_tax_id: Scalars['Boolean']['output'];
  /** URL to complete KYC verification (null if already approved) */
  kyc_link?: Maybe<Scalars['String']['output']>;
  /** Current KYC verification status projected from the canonical snapshot, including FAILED for compatibility consumers. */
  kyc_status: Scalars['String']['output'];
  /** KYC verification URL from provider (stored in CustomerProviderKyc.kycUrl) */
  kyc_url?: Maybe<Scalars['String']['output']>;
  /** Operational next step derived from the canonical snapshot when payout setup is still required. */
  next_step?: Maybe<CustomerKycNextStepEntity>;
  /** Reasons for KYC rejection (empty array if not rejected) */
  rejection_reasons?: Maybe<Array<Scalars['String']['output']>>;
  /** Whether Terms of Service have been accepted at the primary provider */
  tos_accepted?: Maybe<Scalars['Boolean']['output']>;
  /** Terms of Service acceptance URL (stored in CustomerProviderKyc.kycMetadata.tosLink) */
  tos_link?: Maybe<Scalars['String']['output']>;
};

export type KiraVirtualAccountBalance = {
  __typename?: 'KiraVirtualAccountBalance';
  /** Decimal-string available balance */
  available?: Maybe<Scalars['String']['output']>;
  /** Currency code */
  currency: Scalars['String']['output'];
  /**
   * Same value as `reserved` (Kira has no pending balance)
   * @deprecated Kira reports `reserved_balance`; read `reserved`
   */
  pending?: Maybe<Scalars['String']['output']>;
  /** Recorded provider account id */
  providerAccountId: Scalars['String']['output'];
  /** Decimal-string reserved balance (Kira `reserved_balance`: committed to in-flight payouts) */
  reserved?: Maybe<Scalars['String']['output']>;
  /** Internal virtual account id */
  virtualAccountId: Scalars['String']['output'];
};

/** [admin-loopay-kyc-review] Filters for the pending-KYC queue */
export type KycQueueFiltersInput = {
  clientId?: InputMaybe<Scalars['ID']['input']>;
  /** ISO 3166-1 alpha-3 country of residence */
  country?: InputMaybe<Scalars['String']['input']>;
  /** 'individual' or 'business' */
  customerType?: InputMaybe<Scalars['String']['input']>;
  /** Case-insensitive partial match on the customer email */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Also return customers already asked for additional info */
  includeAdditionalInfoRequired?: InputMaybe<Scalars['Boolean']['input']>;
  /** Free-text search (case-insensitive contains) on the email, first and last name and business legal name */
  search?: InputMaybe<Scalars['String']['input']>;
};

/** [admin-loopay-beneficiaries] Provider identifiers ops created by hand */
export type LinkBeneficiaryProviderInput = {
  /** Beneficiary id in the provider system */
  providerBeneficiaryId: Scalars['String']['input'];
  /** Provider code (e.g. "kirafin"); must be the provider of the enabled client rail for this beneficiary, else 422 PROVIDER_NOT_RAIL_PROVIDER */
  providerCode: Scalars['String']['input'];
};

/** [admin-loopay-customers] Provider customer record ops created by hand */
export type LinkProviderCustomerInput = {
  /** Customer id in the provider system */
  externalCustomerId: Scalars['String']['input'];
  /** KYC status to record for this provider */
  kycStatus?: InputMaybe<AdminLoopayKycStatusEntity>;
  note?: InputMaybe<Scalars['String']['input']>;
  /** Provider code (e.g. "kirafin") */
  providerCode: Scalars['String']['input'];
};

/** [admin-loopay-virtual-accounts] Provider account ops opened by hand */
export type LinkVirtualAccountInput = {
  alias?: InputMaybe<Scalars['String']['input']>;
  /** Bank coordinates the customer must be shown */
  bankDetails: Scalars['JSON']['input'];
  currency: Scalars['String']['input'];
  customerId: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  /** Account id in the provider system */
  providerAccountId: Scalars['String']['input'];
  /** Provider code (e.g. "kirafin") */
  providerCode: Scalars['String']['input'];
  /** PaymentRail code (e.g. "us_ach") */
  railCode: Scalars['String']['input'];
  walletId: Scalars['ID']['input'];
};

/** [admin-loopay-wallets] Vault ops already created in the provider console */
export type LinkWalletAddressInput = {
  /** Blockchain deposit address */
  address: Scalars['String']['input'];
  alias?: InputMaybe<Scalars['String']['input']>;
  /** Chain (e.g. "tron") */
  chain: Scalars['String']['input'];
  /** Defaults to the client/provider onboarding currency */
  currency?: InputMaybe<Scalars['String']['input']>;
  /** Provider vault / wallet id */
  vaultId: Scalars['String']['input'];
};

export type ListClientProviderRailsInput = {
  /** Filter by client ID */
  clientId?: InputMaybe<Scalars['String']['input']>;
  /** Filter by payment rail */
  paymentRail?: InputMaybe<Scalars['String']['input']>;
  /** Filter by provider code */
  providerCode?: InputMaybe<Scalars['String']['input']>;
};

export type ListClientProviderRailsResponse = {
  __typename?: 'ListClientProviderRailsResponse';
  /** List of client provider rails */
  data: Array<ClientProviderRailEntity>;
};

export type ListCustomersInput = {
  from_date?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  to_date?: InputMaybe<Scalars['String']['input']>;
};

export type ListCustomersResponse = {
  __typename?: 'ListCustomersResponse';
  /** List of customers */
  data: Array<CustomerEntity>;
  /** Has more results */
  has_more: Scalars['Boolean']['output'];
  /** Total count */
  total: Scalars['Float']['output'];
};

export type ListEndorsementsResponse = {
  __typename?: 'ListEndorsementsResponse';
  /** List of endorsements */
  data: Array<EndorsementResponse>;
  /** Total count */
  total: Scalars['Float']['output'];
};

export type ListRailsResponse = {
  __typename?: 'ListRailsResponse';
  /** List of payment rails */
  data: Array<RailEntity>;
};

export type ListTransactionsInput = {
  customer_id?: InputMaybe<Scalars['String']['input']>;
  from_date?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  to_date?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  wallet_id?: InputMaybe<Scalars['String']['input']>;
};

export type ListTransactionsResponse = {
  __typename?: 'ListTransactionsResponse';
  /** List of transactions */
  data: Array<TransactionEntity>;
  /** Has more results */
  has_more: Scalars['Boolean']['output'];
  /** Total count */
  total: Scalars['Float']['output'];
};

export type ListWalletsResponse = {
  __typename?: 'ListWalletsResponse';
  /** Array of wallets */
  data: Array<WalletEntity>;
  /** Resolved backend default wallet for customer-visible flows */
  default_wallet?: Maybe<ResolvedDefaultWalletEntity>;
  /** Whether there are more wallet pages */
  has_more: Scalars['Boolean']['output'];
  /** Current page */
  page: Scalars['Float']['output'];
  /** Wallets per page */
  page_size: Scalars['Float']['output'];
  /** Total count of wallets */
  total: Scalars['Float']['output'];
  /** Total number of wallet pages */
  total_pages: Scalars['Float']['output'];
};

/** [admin-loopay-provider-requirements] A provider-console requirement completed at the provider, with what was done */
export type MarkProviderRequirementHandledInput = {
  /** What was completed at the provider (audited) */
  note: Scalars['String']['input'];
  requirementId: Scalars['String']['input'];
};

export type MarkStaleAsFailedInput = {
  /** Restrict to a specific client (tenant) */
  clientId?: InputMaybe<Scalars['String']['input']>;
  /** ISO 8601 timestamp — REQUIRED. Must be in the past. Only transactions created BEFORE this are affected */
  olderThan: Scalars['String']['input'];
  /** Transaction type to target (default: DEPOSIT) */
  type?: InputMaybe<Scalars['String']['input']>;
};

/** [admin-loopay-wallets] Ops-vault sweep payload */
export type MoveToOpsVaultInput = {
  note?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** [admin-loopay-dispersiones] #413: approve a withdrawal in AWAITING_APPROVAL (the gross is in the ops vault; fundsLocation must be ops_vault): records the approver and places the Mesta order from the customer own sender, funded from the ops account on order:awaiting_funds; this #413 decision answers 403 MFA_REQUIRED without a second factor whatever STAFF_MFA_ENFORCEMENT says. Legacy v1 rows keep their PENDING → PROCESSING approval under STAFF_MFA_ENFORCEMENT (requires LOOPAY_OPERATIONS or LOOPAY_ADMIN, recent sign-in) */
  adminLoopay_approveDispersion: AdminDispersionEntity;
  /** [admin-loopay-recaudos] Approve a pending deposit and credit the wallet (requires OPS_RECAUDOS) */
  adminLoopay_approveRecaudo: AdminRecaudoEntity;
  /** [admin-loopay-dispersiones] v2 CANCELLED: ops did not sign (or cancelled in the console) and manually returned the funds ops→customer; releases the ledger hold and persists the dispersion as CANCELLED (requires OPS_DISPERSIONES) */
  adminLoopay_cancelDispersion: AdminDispersionEntity;
  /** [admin-loopay-dispersiones] Record the settled fiat leg and close the withdrawal (requires OPS_DISPERSIONES) */
  adminLoopay_completeDispersion: AdminDispersionEntity;
  /** [admin-loopay-clients] Create a client and onboard it at the providers. A provider failure does not undo the client: it is returned per provider so it can be retried or linked manually (requires LOOPAY_ADMIN or OPS_COMMERCIAL; LOOPAY_OPERATIONS does not pass) */
  adminLoopay_createAndOnboardClient: AdminLoopayCreateAndOnboardClientResult;
  /** [admin-loopay-beneficiaries] Create a beneficiary for any customer (requires LOOPAY_ADMIN) */
  adminLoopay_createBeneficiary: AdminBeneficiaryEntity;
  /** [admin-loopay-clients] Create a client configuration (requires LOOPAY_ADMIN or OPS_COMMERCIAL; LOOPAY_OPERATIONS does not pass) */
  adminLoopay_createClient: ClientGraphqlEntity;
  /** [admin-loopay-client-provider-rails] Create (enable) a client provider rail (requires PLATFORM_ADMIN or OPS_COMMERCIAL). Every role gets the same checks: 422 PROVIDER_NOT_ONBOARDED unless the client is LINKED/MANUAL at the provider, 422 PROVIDER_INACTIVE, 422 RAIL_INACTIVE, 422 RAIL_NOT_OFFERED_BY_PROVIDER, 422 RAIL_UNDER_MAINTENANCE, 422 RAIL_PROVIDER_ALREADY_ENABLED when another provider already serves the rail for the client. defaultAttributes are kept only for PLATFORM_ADMIN/LOOPAY_ADMIN */
  adminLoopay_createClientProviderRail: ClientProviderRailGraphqlEntity;
  /** [admin-loopay-catalog] Create currency catalog entry (requires LOOPAY_ADMIN) */
  adminLoopay_createCurrency: CurrencyGraphqlEntity;
  /** [admin-loopay-customers] Create a customer for an explicit client in onboarding or existing-provider mode (requires LOOPAY_ADMIN) */
  adminLoopay_createCustomer: AdminCreateCustomerResponseEntity;
  /** [admin-loopay-fees] Create a new active fee schedule version for (client, rail, operation); the previous active version is superseded (requires LOOPAY_ADMIN or OPS_COMMERCIAL and a recent sign-in; LOOPAY_OPERATIONS does not pass) */
  adminLoopay_createFeeSchedule: AdminFeeSchedule;
  /** [admin-loopay-catalog] Create operation type catalog entry (requires LOOPAY_ADMIN) */
  adminLoopay_createOperationType: OperationTypeGraphqlEntity;
  /** [admin-loopay-catalog] Create payment rail catalog entry (requires PLATFORM_ADMIN) */
  adminLoopay_createPaymentRail: PaymentRailGraphqlEntity;
  /** [admin-loopay-catalog] Create provider catalog entry (requires PLATFORM_ADMIN) */
  adminLoopay_createProvider: ProviderGraphqlEntity;
  /** [admin-loopay-catalog] Create provider payment rail catalog entry (requires PLATFORM_ADMIN) */
  adminLoopay_createProviderPaymentRail: ProviderPaymentRailGraphqlEntity;
  /** [admin-loopay-provider-requirements] Mints the short-lived KiraFin beneficial-owner link of a KiraFin RFI ubo_link requirement and returns its URL. Errors: REQUIREMENT_LINK_NOT_AVAILABLE (400) for any other requirement, REQUIREMENT_NOT_FOUND (404) (requires LOOPAY_OPERATIONS; LOOPAY_ADMIN passes) */
  adminLoopay_createProviderRequirementLink: Scalars['String']['output'];
  /** [admin-loopay-recaudos] Record a deposit received outside the platform (requires OPS_RECAUDOS) */
  adminLoopay_createRecaudo: AdminRecaudoEntity;
  /** [admin-loopay-staff-users] Create a staff user; provisions the Firebase user by email when authUid is omitted and returns a password setup link. Granting LOOPAY_ADMIN requires a LOOPAY_ADMIN caller (requires LOOPAY_ADMIN) */
  adminLoopay_createStaffUser: StaffUserGraphQlEntity;
  /** [admin-loopay-catalog] Create tax ID type catalog entry (requires LOOPAY_ADMIN) */
  adminLoopay_createTaxIdType: TaxIdTypeGraphqlEntity;
  /** [admin-loopay-wallets] Provision one wallet for a customer cross-tenant (requires LOOPAY_ADMIN, LOOPAY_OPERATIONS or OPS_VA) */
  adminLoopay_createWallet: AdminWalletResponseEntity;
  /** [admin-loopay-dispersiones] #413 MO-10: after the funds left custody (RETURN_MATCH_REQUIRED, or a payout returned after delivery), credit exactly the amount the provider returned to the ops vault: returns it ops vault → customer vault and credits it when that return completes; the fee is kept (requires LOOPAY_OPERATIONS or LOOPAY_ADMIN, recent sign-in, second factor) */
  adminLoopay_creditDispersionReturn: AdminDispersionEntity;
  /** [admin-loopay-platform] Cutover step 2: deactivate the dead providers and their provider-rail rows; refused while any client junction to them is active (requires PLATFORM_ADMIN) */
  adminLoopay_cutoverDeactivateDeadProviderCatalog: AdminCutoverDeadProviderCatalogResultEntity;
  /** [admin-loopay-platform] Cutover step 1: deactivate the dead-provider junctions of the selected clients (requires PLATFORM_ADMIN) */
  adminLoopay_cutoverDeactivateDeadProviders: AdminCutoverDeadProvidersResultEntity;
  /** [admin-loopay-platform] Cutover step 3: flag PENDING/PROCESSING deposits and withdrawals created before a cutoff as legacyBridge for the selected clients (requires PLATFORM_ADMIN) */
  adminLoopay_cutoverFlagLegacyTransactions: AdminCutoverFlagLegacyTransactionsResultEntity;
  /** [admin-loopay-beneficiaries] Deactivate a beneficiary across tenants by ID (requires LOOPAY_ADMIN) */
  adminLoopay_deactivateBeneficiary: AdminBeneficiaryEntity;
  /** [admin-loopay-fees] Deactivate a fee schedule version so it no longer prices operations (requires LOOPAY_ADMIN or OPS_COMMERCIAL and a recent sign-in; LOOPAY_OPERATIONS does not pass) */
  adminLoopay_deactivateFeeSchedule: AdminFeeSchedule;
  /** [admin-loopay-staff-users] Deactivate a staff user record (requires LOOPAY_ADMIN) */
  adminLoopay_deactivateStaffUser: StaffUserGraphQlEntity;
  /** [admin-loopay-beneficiaries] Delete a beneficiary across tenants by ID (requires LOOPAY_ADMIN) */
  adminLoopay_deleteBeneficiary: AdminDeleteResultEntity;
  /** [admin-loopay-customers] Hard delete a customer profile and all cascade-related records (requires LOOPAY_ADMIN) */
  adminLoopay_deleteCustomer: AdminDeleteCustomerResponseEntity;
  /** [admin-loopay-endorsements] Delete an endorsement by ID so the webhook can re-create it (requires LOOPAY_ADMIN) */
  adminLoopay_deleteEndorsement: AdminDeleteResultEntity;
  /** [admin-loopay-catalog] Delete operation type catalog entry (requires LOOPAY_ADMIN) */
  adminLoopay_deleteOperationType: OperationTypeGraphqlEntity;
  /** [admin-loopay-users] Permanently delete a user record (requires LOOPAY_ADMIN) */
  adminLoopay_deleteUser: UserGraphQlEntity;
  /** [admin-loopay-virtual-accounts] Delete a virtual account by ID so the webhook can re-create it (requires LOOPAY_ADMIN) */
  adminLoopay_deleteVirtualAccount: AdminDeleteResultEntity;
  /** [admin-loopay-dispersiones] Fail a processing withdrawal and refund the customer (requires OPS_DISPERSIONES) */
  adminLoopay_failDispersion: AdminDispersionEntity;
  /** [admin-loopay-endorsements] Import existing provider endorsements for a customer (requires LOOPAY_ADMIN) */
  adminLoopay_importEndorsements: Array<AdminEndorsementEntity>;
  /** [admin-loopay-wallets] Bring a linked vault's pre-existing funds into the ledger (amount computed from custody minus in-flight holds; requires OPS_VA) */
  adminLoopay_importVaultBalance: AdminWalletResponseEntity;
  /** [admin-loopay-virtual-accounts] Import existing provider virtual accounts for a wallet (requires LOOPAY_ADMIN) */
  adminLoopay_importVirtualAccounts: Array<AdminVirtualAccountEntity>;
  /** [admin-loopay-wallets] Import an existing provider wallet for a customer (requires LOOPAY_ADMIN) */
  adminLoopay_importWallet: AdminWalletResponseEntity;
  /** [admin-loopay-availability] Quote the fiat-to-USDT conversion leg and open the carrier transaction (pair derived server-side; requires OPS_DISPERSIONES) */
  adminLoopay_initiateAvailability: AvailabilityOperationEntity;
  /** [admin-loopay-clients] Invite a CLIENT_ADMIN of a client (tenant backoffice user); returns the one-time password setup link; 404 for an unknown client, 409 TENANT_ADMIN_EMAIL_TAKEN when the email has another account (requires LOOPAY_ADMIN or OPS_COMMERCIAL and a recent sign-in) */
  adminLoopay_inviteTenantAdmin: TenantAdminInvitation;
  /** [admin-loopay-beneficiaries] Attach the provider identifiers ops created by hand. The provider is the one of the enabled client rail: 422 PROVIDER_NOT_RAIL_PROVIDER for any other, 422 RAIL_PROVIDER_NOT_CONFIGURED when the client has not enabled the rail (requires OPS_KYC) */
  adminLoopay_linkBeneficiaryProviderId: AdminBeneficiaryProviderLinkEntity;
  /** [admin-loopay-clients] Record a provider customer created outside the API (status MANUAL). The provider is not called; a note explaining why is required. Refused when the provider is already LINKED through the API or already MANUAL (replacing a manual link needs a new product decision) (requires OPS_COMMERCIAL) */
  adminLoopay_linkClientProviderManually: AdminLoopayClientProviderOnboardingResult;
  /** [admin-loopay-customers] Link an existing CustomerProfile with an existing User via the self_ externalId convention (requires LOOPAY_ADMIN) */
  adminLoopay_linkCustomerUser: AdminLinkCustomerUserResponseEntity;
  /** [admin-loopay-customers] Record the provider-side customer id ops created by hand (requires OPS_VA; LOOPAY_OPERATIONS and LOOPAY_ADMIN pass) */
  adminLoopay_linkProviderCustomer: AdminProviderCustomerLinkEntity;
  /**
   * [admin-loopay-virtual-accounts] DEPRECATED: use adminLoopay_repairVirtualAccountRequest, which closes a blocked request with provider-read bank details. Records a provider virtual account ops opened by hand, outside any request (requires LOOPAY_ADMIN)
   * @deprecated Use adminLoopay_repairVirtualAccountRequest: a manual link only repairs a blocked request
   */
  adminLoopay_linkVirtualAccount: AdminVirtualAccountEntity;
  /** [admin-loopay-wallets] Record a custody vault ops created in the provider console (requires OPS_VA) */
  adminLoopay_linkWalletAddress: AdminWalletResponseEntity;
  /** [admin-loopay-provider-requirements] Operations staff completed a PROVIDER_CONSOLE requirement at the provider: moves it from APPROVED or UPLOADED to SUBMITTED with the note (history + audit). It resolves when the provider stops reporting it; still reported after one hour, it goes back to the customer as REJECTED. Errors: REQUIREMENT_NOTE_REQUIRED (400), REQUIREMENT_NOT_PROVIDER_CONSOLE (409), REQUIREMENT_NOT_READY (409), REQUIREMENT_NOT_FOUND (404) (requires LOOPAY_OPERATIONS; LOOPAY_ADMIN passes; recent sign-in) */
  adminLoopay_markProviderRequirementHandled: AdminProviderRequirementEntity;
  /** [admin-loopay-transactions] Mark stale PENDING transactions as FAILED (requires LOOPAY_ADMIN). Withdrawals get their held balance refunded atomically. */
  adminLoopay_markStalePendingAsFailed: AdminMarkStaleAsFailedResponse;
  /** [admin-loopay-customers] Move a customer profile to another client when the profile has no operational artifacts and the move is auth-safe (requires LOOPAY_ADMIN) */
  adminLoopay_moveCustomerToClient: AdminCustomerGraphqlEntity;
  /** [admin-loopay-wallets] Sweep a processing withdrawal into the operations vault (requires OPS_VA) */
  adminLoopay_moveToOpsVault: AdminOpsVaultTransferEntity;
  /** [admin-loopay-clients] Onboard an existing client at the providers (default: mesta and kirafin). Providers already LINKED or MANUAL are skipped; failures are returned per provider, never thrown (requires OPS_COMMERCIAL) */
  adminLoopay_onboardClientToProviders: Array<AdminLoopayClientProviderOnboardingResult>;
  /** [admin-loopay-availability] Place the vendor order/payout of a QUOTED availability operation (typed pre-placement validation; requires OPS_DISPERSIONES) */
  adminLoopay_placeAvailabilityOrder: AvailabilityOperationEntity;
  /** [admin-loopay-beneficiaries] Reactivate a beneficiary across tenants by ID (requires LOOPAY_ADMIN) */
  adminLoopay_reactivateBeneficiary: AdminBeneficiaryEntity;
  /** [admin-loopay-clients] Rotate a client API key: returns the new plaintext key once and re-enables API-key access for revoked clients. The previous key keeps working for graceMinutes (default 60, 0 = invalidate immediately, max 10080) so the client can migrate without downtime. Optional expiresAt sets a hard expiry for the new key; optional scopes restricts the key to operation classes (omitted = keep current scopes; empty list = full access) (requires LOOPAY_ADMIN or OPS_COMMERCIAL and a recent sign-in) */
  adminLoopay_regenerateClientApiKey: ClientApiKeyResponse;
  /** [admin-loopay-dispersiones] Reject a pending withdrawal. #413 AWAITING_APPROVAL, or APPROVED whose Mesta placement was REJECTED or BLOCKED (no order exists): returns the gross ops vault → customer vault and releases the hold when that return completes; any other approval-flow state answers 409 WITHDRAWAL_IN_APPROVAL_FLOW; those #413 decisions answer 403 MFA_REQUIRED without a second factor whatever STAFF_MFA_ENFORCEMENT says. Rows outside the flow release the hold at once under STAFF_MFA_ENFORCEMENT (requires LOOPAY_OPERATIONS or LOOPAY_ADMIN, recent sign-in) */
  adminLoopay_rejectDispersion: AdminDispersionEntity;
  /** [admin-loopay-recaudos] Reject a pending deposit without moving funds (requires OPS_RECAUDOS) */
  adminLoopay_rejectRecaudo: AdminRecaudoEntity;
  /** [admin-loopay-virtual-accounts] Closes a blocked virtual-account request (PROVIDER_ONBOARDING, or REQUESTED with blockers) with the account the provider already opened: the bank details are read from the provider by providerAccountId; typed bankDetails are accepted only when the provider returns none and confirmManualBankDetails is true. The account goes ACTIVE, the request closes and the repair is audited (who, why, when). Errors: VA_REQUEST_NOT_REPAIRABLE (409), VA_MANUAL_BANK_DETAILS_REQUIRED (400: the provider returned no bank details; send bankDetails with confirmManualBankDetails: true), VA_BANK_DETAILS_INCOMPLETE (400), VA_REPAIR_PROVIDER_UNAVAILABLE (502), WALLET_NOT_PROVISIONED / VA_REPAIR_ACCOUNT_CONFLICT (409). Requires LOOPAY_OPERATIONS (LOOPAY_ADMIN passes) and a recent sign-in. */
  adminLoopay_repairVirtualAccountRequest: AdminVirtualAccountRepairResult;
  /** [admin-loopay-kyc-review] Send a KYC case back to the customer for more information (requires OPS_KYC) */
  adminLoopay_requestKycAdditionalInfo: AdminKycReviewResponseEntity;
  /** [admin-loopay-virtual-accounts] Request a virtual account for a customer by country, currency and rail; it goes to the operations review queue. Idempotent per customer and rail. Errors: RAIL_NOT_AVAILABLE (422), VA_BUSINESS_ONLY (422, individuals), RAIL_UNDER_MAINTENANCE (422), VA_REQUEST_EXISTS (409), KYC_NOT_APPROVED (403) (requires LOOPAY_ADMIN, LOOPAY_OPERATIONS or OPS_VA) */
  adminLoopay_requestVirtualAccount: RequestVirtualAccountResponse;
  /** [admin-loopay-clients] Retry the onboarding of a client at one provider as the next attempt. Refused when the provider is already LINKED or MANUAL (requires OPS_COMMERCIAL) */
  adminLoopay_retryClientProviderOnboarding: AdminLoopayClientProviderOnboardingResult;
  /** [admin-loopay-dispersiones] #413: after ops fixed the cause (Mesta sender, payment method, payout policy, order or deposit wallet), re-run the BLOCKED step of an approved withdrawal: the Mesta order placement, or the funding of the placed order through the custody port (PROCESSING → FUNDING, at most one funding per withdrawal). A placement whose outcome is UNKNOWN adopts the existing Mesta order with input.mestaOrderId (read at Mesta, never re-sent; audited), or is placed again only with input.confirmedNoOrderAtMesta = true (ops checked Mesta; audited). 409 when nothing is blocked (requires LOOPAY_OPERATIONS or LOOPAY_ADMIN, recent sign-in, second factor) */
  adminLoopay_retryDispersionFunding: AdminDispersionEntity;
  /** [admin-loopay-dispersiones] #413: re-attempt the custody return ops vault → customer vault of a withdrawal still RETURNING whose last return attempt failed or never started, under a new attempt key (<id>:return:<n>); refused while an attempt is sent or unknown. The hold is released when the return completes (requires LOOPAY_OPERATIONS or LOOPAY_ADMIN, recent sign-in, second factor) */
  adminLoopay_retryDispersionReturn: AdminDispersionEntity;
  /** [admin-loopay-endorsements] Completes the customer data the provider reported missing (providerProfile, optional) and re-runs the virtual-account onboarding of an APPROVED endorsement parked in PROVIDER_ONBOARDING or FAILED. Any other state answers 409. Idempotent. Requires OPS_KYC and a recent sign-in. */
  adminLoopay_retryEndorsementOnboarding: AdminEndorsementOnboardingEntity;
  /** [admin-loopay-recaudos] Reverse an already credited deposit (requires OPS_RECAUDOS) */
  adminLoopay_reverseRecaudo: AdminRecaudoEntity;
  /** [admin-loopay-beneficiaries] Verify or reject a pending beneficiary (requires OPS_KYC) */
  adminLoopay_reviewBeneficiary: AdminBeneficiaryReviewResponseEntity;
  /** [admin-loopay-endorsements] Approve, reject or request more information on an endorsement. An approval routes to the provider of the enabled client rail (422 PROVIDER_NOT_RAIL_PROVIDER, 422 RAIL_PROVIDER_NOT_CONFIGURED) (requires OPS_KYC) */
  adminLoopay_reviewEndorsement: AdminEndorsementReviewResponseEntity;
  /** [admin-loopay-kyc-review] Approve or reject a customer KYC (requires OPS_KYC) */
  adminLoopay_reviewKyc: AdminKycReviewResponseEntity;
  /** [admin-loopay-provider-requirements] Approves or rejects an UPLOADED answer, or re-reviews an APPROVED one (e.g. rejects it so the customer answers again); REJECT needs a reason the customer sees (customer.requirement.rejected). Errors: REQUIREMENT_REJECT_REASON_REQUIRED (400), REQUIREMENT_NOT_UPLOADED (409), REQUIREMENT_NOT_FOUND (404) (requires LOOPAY_OPERATIONS; LOOPAY_ADMIN passes) */
  adminLoopay_reviewProviderRequirement: AdminProviderRequirementEntity;
  /** [admin-loopay-clients] Revoke a client API key by disabling client API-key auth access; any previous key still inside a rotation grace window is revoked too (requires LOOPAY_ADMIN) */
  adminLoopay_revokeClientApiKey: ClientGraphqlEntity;
  /** [admin-loopay-dispersiones] v2: record the provider ops selected from the indicative rates view (annotation for manual execution — no quote locking) (requires OPS_DISPERSIONES) */
  adminLoopay_selectDispersionProvider: AdminDispersionEntity;
  /** [admin-loopay-clients] WARNING - retired exception: payouts are FIAT only and no USDT leaves custody to an external address. Only disabling the allow_crypto_payout flag of a client or customer is accepted; enabling answers 422 CRYPTO_PAYOUT_NOT_AVAILABLE. Requires LOOPAY_ADMIN or PLATFORM_ADMIN with a recent sign-in; every change is audited (CRYPTO_PAYOUT_ALLOWANCE_CHANGED). */
  adminLoopay_setCryptoPayoutAllowance: CryptoPayoutAllowanceEntity;
  /** [admin-loopay-sandbox] Ask the provider sandbox to approve or reject a beneficiary; the webhook updates it (403 SANDBOX_ONLY outside sandbox) */
  adminLoopay_simulateProviderBeneficiaryVerification: SandboxSimulationResultEntity;
  /** [admin-loopay-sandbox] Simulate a deposit on a KiraFin sandbox virtual account; the webhook credits it (403 SANDBOX_ONLY outside sandbox) */
  adminLoopay_simulateProviderDeposit: SandboxSimulationResultEntity;
  /** [admin-loopay-beneficiaries] Start the provider-side verification of a provider-managed beneficiary that has not started it; the result arrives by provider webhook (requires LOOPAY_ADMIN, LOOPAY_OPERATIONS or OPS_KYC) */
  adminLoopay_startProviderBeneficiaryVerification: AdminProviderBeneficiaryVerification;
  /** [admin-loopay-provider-requirements] Sends every APPROVED requirement of the endorsement to the provider (KiraFin user update or RFI answers; Mesta documents then verify), marks them SUBMITTED and re-runs the virtual-account onboarding. A provider error leaves them APPROVED and returns errorMessage. Errors: REQUIREMENTS_NOT_APPROVED (409) (requires LOOPAY_OPERATIONS; LOOPAY_ADMIN passes; recent sign-in) */
  adminLoopay_submitProviderRequirements: AdminProviderRequirementSubmitResult;
  /** [admin-loopay-beneficiaries] Update one beneficiary across tenants by ID (requires LOOPAY_ADMIN) */
  adminLoopay_updateBeneficiary: AdminBeneficiaryEntity;
  /** [admin-loopay-clients] Update a client configuration, including its wallet defaults (requires PLATFORM_ADMIN) */
  adminLoopay_updateClient: ClientGraphqlEntity;
  /** [admin-loopay-clients] Replace the countries where the client operates with its customers (ISO alpha-3). Only config.allowedCustomerCountries changes (requires OPS_COMMERCIAL) */
  adminLoopay_updateClientAllowedCountries: ClientGraphqlEntity;
  /** [admin-loopay-client-provider-rails] Update a client provider rail (requires PLATFORM_ADMIN; OPS_COMMERCIAL may only change isActive and priority of rails of onboarded providers). Activating a rail or moving it to another client, provider or rail gets the create checks for every role (422 PROVIDER_NOT_ONBOARDED, PROVIDER_INACTIVE, RAIL_INACTIVE, RAIL_NOT_OFFERED_BY_PROVIDER, RAIL_UNDER_MAINTENANCE, RAIL_PROVIDER_ALREADY_ENABLED) */
  adminLoopay_updateClientProviderRail: ClientProviderRailGraphqlEntity;
  /** [admin-loopay-catalog] Update currency catalog entry (requires LOOPAY_ADMIN) */
  adminLoopay_updateCurrency: CurrencyGraphqlEntity;
  /** [admin-loopay-customers] Update editable customer profile fields (requires LOOPAY_ADMIN). For status changes with audit trail use adminLoopay_updateCustomerStatus. */
  adminLoopay_updateCustomer: AdminCustomerGraphqlEntity;
  /** [admin-loopay-customers] Update customer operational status with audit trail (requires LOOPAY_ADMIN) */
  adminLoopay_updateCustomerStatus: AdminCustomerStatusResponseEntity;
  /** [admin-loopay] Update fee configuration for a client, client_provider_rail, or customer_endorsement entity. Pass null to clear (requires LOOPAY_ADMIN) */
  adminLoopay_updateFeeConfig: Scalars['Boolean']['output'];
  /** [admin-loopay-catalog] Update operation type catalog entry (requires LOOPAY_ADMIN) */
  adminLoopay_updateOperationType: OperationTypeGraphqlEntity;
  /** [admin-loopay-catalog] Update payment rail catalog entry (requires PLATFORM_ADMIN) */
  adminLoopay_updatePaymentRail: PaymentRailGraphqlEntity;
  /** [admin-loopay-catalog] Update provider catalog entry (requires PLATFORM_ADMIN) */
  adminLoopay_updateProvider: ProviderGraphqlEntity;
  /** [admin-loopay-catalog] Update provider payment rail catalog entry (requires PLATFORM_ADMIN) */
  adminLoopay_updateProviderPaymentRail: ProviderPaymentRailGraphqlEntity;
  /** [admin-loopay-staff-users] Update a staff user record (requires LOOPAY_ADMIN) */
  adminLoopay_updateStaffUser: StaffUserGraphQlEntity;
  /** [admin-loopay-catalog] Update or delete tax ID type catalog entry (requires LOOPAY_ADMIN) */
  adminLoopay_updateTaxIdType: TaxIdTypeGraphqlEntity;
  /** [admin-loopay-users] Update a user record (requires LOOPAY_ADMIN) */
  adminLoopay_updateUser: UserGraphQlEntity;
  /** [admin-loopay-virtual-accounts] Update a virtual account (requires LOOPAY_ADMIN) */
  adminLoopay_updateVirtualAccount: AdminVirtualAccountEntity;
  /** [admin-loopay-wallets] Update editable wallet fields (providerWalletId, chain, address, currency, alias, status). Only provided fields are applied. A CLOSED wallet can be reopened with status ACTIVE. (requires LOOPAY_ADMIN) */
  adminLoopay_updateWallet: AdminWalletResponseEntity;
  /** [admin-loopay-wallets] Update wallet provider metadata (sweep config). Pass providerMetadata null to clear. (requires LOOPAY_ADMIN) */
  adminLoopay_updateWalletProviderMetadata: AdminWalletResponseEntity;
  /** [auth] Complete registration for a user that exists in Firebase but not in the local database. Requires a valid Firebase JWT token. The account is always created as CLIENT_USER. */
  auth_completeRegistration: SignUpResponse;
  /** [auth] Authenticate with email and password. Returns AuthResponse on success or RegistrationRequired if user needs to complete registration */
  auth_signIn: AuthSignInResult;
  /** [auth] Register a new user with email and password. Public registration always persists the CLIENT_USER role; CLIENT_ADMIN is granted only through staff/admin paths. */
  auth_signUp: SignUpResponse;
  /** [beneficiaries] Create a new beneficiary for a customer (requires Firebase auth) */
  beneficiaries_create: BeneficiaryEntity;
  /** [beneficiaries] Delete a beneficiary for a customer (requires Firebase auth) */
  beneficiaries_delete: BeneficiaryDeleteResultEntity;
  /** [customers] Add endorsement (payment rail) to customer (requires Firebase auth) */
  customers_addEndorsement: EndorsementResponse;
  /** [customers] Create a new customer with KYC information (requires Firebase auth) */
  customers_create: CustomerEntity;
  /** [customers] Get ToS acceptance URL for API KYC method (requires Firebase auth) */
  customers_getTosLink: TosLinkResponse;
  /** [customers] Reconcile and persist the canonical KYC snapshot for a customer (requires Firebase auth) */
  customers_refreshKycSnapshot: CustomerKycSnapshotEntity;
  /** [customers] Retry KYC and return the canonical snapshot for a customer (requires Firebase auth) */
  customers_retryKyc: CustomerKycSnapshotEntity;
  /** [customers] Answers a REQUESTED or REJECTED provider requirement with documents (base64 data URIs: pdf, png, jpeg, 10 MB each) and/or a value; the requirement moves to UPLOADED for review. Errors: REQUIREMENT_NOT_OPEN (409), REQUIREMENT_DOCUMENT_REQUIRED / REQUIREMENT_VALUE_REQUIRED / REQUIREMENT_DOCUMENT_INVALID (400), REQUIREMENT_NOT_FOUND (404) (requires Firebase auth). */
  customers_submitProviderRequirement: ProviderRequirementEntity;
  /** [customers] Update customer information (requires Firebase auth) */
  customers_update: CustomerEntity;
  /** Cancel a running/pending execution */
  executions_cancel: WorkflowExecutionEntity;
  /** Create a new workflow execution */
  executions_create: WorkflowExecutionEntity;
  /** Create execution data (heavy payload) */
  executions_createData: ExecutionDataEntity;
  /** Create a node execution record */
  executions_createNode: NodeExecutionEntity;
  /** Soft delete an execution */
  executions_softDelete: WorkflowExecutionEntity;
  /** Update execution data (output payload, full data) */
  executions_updateData: ExecutionDataEntity;
  /** Update node execution (status, output, error) */
  executions_updateNode: NodeExecutionEntity;
  /** Update execution status (state machine validated) */
  executions_updateStatus: WorkflowExecutionEntity;
  /** [quotes] Create an optional persisted currency exchange quote record (requires Firebase auth) */
  quotes_create: QuoteEntity;
  /** [tenant] Add an endorsement (payment rail); `input` is the `POST /api/v1/customers/:id/rails` body (requires CLIENT_ADMIN) */
  tenant_addCustomerRail: Scalars['JSON']['output'];
  /** [tenant] Create a beneficiary; `input` is the `POST /api/v1/beneficiaries` body; the customer must be ACTIVE (requires CLIENT_ADMIN) */
  tenant_createBeneficiary: Scalars['JSON']['output'];
  /** [tenant] Create a customer; `input` is the `POST /api/v1/customers` body, returns its response (requires CLIENT_ADMIN) */
  tenant_createCustomer: Scalars['JSON']['output'];
  /** [tenant] Dispersion (international withdrawal); `input` is the `POST /api/v1/transactions/dispersions` body (client_reference_id required) (requires CLIENT_ADMIN, recent sign-in and second factor) */
  tenant_createDispersion: Scalars['JSON']['output'];
  /** [tenant] Off-ramp to a beneficiary; `input` is the `POST /api/v1/transactions/off-ramps` body (client_reference_id required) (requires CLIENT_ADMIN, recent sign-in and second factor) */
  tenant_createOffRamp: Scalars['JSON']['output'];
  /** [tenant] On-ramp payment link; `input` is the `POST /api/v1/transactions/on-ramps/payment-links` body (requires CLIENT_ADMIN) */
  tenant_createPaymentLink: Scalars['JSON']['output'];
  /** [tenant] Create a quote; `input` is the `POST /api/v1/quotes` body (requires CLIENT_ADMIN) */
  tenant_createQuote: Scalars['JSON']['output'];
  /** [tenant] Crypto transfer to an external address; `input` is the `POST /api/v1/transactions/transfers` body; 422 EXTERNAL_CRYPTO_TRANSFER_NOT_AVAILABLE in production (requires CLIENT_ADMIN, recent sign-in and second factor) */
  tenant_createTransfer: Scalars['JSON']['output'];
  /** [tenant] Create a wallet; `input` is the `POST /api/v1/wallets` body; the customer must be ACTIVE (requires CLIENT_ADMIN) */
  tenant_createWallet: Scalars['JSON']['output'];
  /** [tenant] Create a webhook; `input` is the `POST /api/v1/webhooks` body; the response carries the plaintext secret once (requires CLIENT_ADMIN, recent sign-in and second factor) */
  tenant_createWebhook: Scalars['JSON']['output'];
  /** [tenant] Disable a beneficiary for transactions (`POST /api/v1/beneficiaries/:id/deactivate`) (requires CLIENT_ADMIN) */
  tenant_deactivateBeneficiary: Scalars['JSON']['output'];
  /** [tenant] Soft-delete a beneficiary (`DELETE /api/v1/beneficiaries/:id`, REST answers 204); returns true (requires CLIENT_ADMIN) */
  tenant_deleteBeneficiary: Scalars['Boolean']['output'];
  /** [tenant] Remove a webhook (`DELETE /api/v1/webhooks/:id`, REST answers 204); delivery logs are kept; returns true (requires CLIENT_ADMIN, recent sign-in and second factor) */
  tenant_deleteWebhook: Scalars['Boolean']['output'];
  /** [tenant] Invite a CLIENT_ADMIN of this tenant; returns the one-time password setup link; 409 TENANT_ADMIN_EMAIL_TAKEN when the email has another account (requires CLIENT_ADMIN, recent sign-in and second factor) */
  tenant_inviteAdmin: TenantAdminInvitation;
  /** [tenant] Reactivate a deactivated beneficiary (`POST /api/v1/beneficiaries/:id/reactivate`) (requires CLIENT_ADMIN) */
  tenant_reactivateBeneficiary: Scalars['JSON']['output'];
  /** [tenant] Rotate the tenant API key: returns the new plaintext key ONCE. The previous key keeps working for graceMinutes (default 60, 0 = invalidate immediately, max 10080); optional expiresAt (future) and scopes (omitted = keep current, empty = full access) (requires CLIENT_ADMIN, recent sign-in and second factor) */
  tenant_regenerateApiKey: ClientApiKeyResponse;
  /** [tenant] Remove (deactivate) another admin of this tenant; 403 TENANT_ADMIN_SELF_REMOVAL for yourself, 409 LAST_TENANT_ADMIN for the last one, 404 for a user that is not an admin of this tenant (requires CLIENT_ADMIN, recent sign-in and second factor) */
  tenant_removeAdmin: TenantTeamMember;
  /** [tenant] Request a virtual account by country, currency and rail; `input` is the `POST /api/v1/virtual-accounts/requests` body; idempotent per customer and rail (`created: false` when it already existed) (requires CLIENT_ADMIN) */
  tenant_requestVirtualAccount: Scalars['JSON']['output'];
  /** [tenant] Retry KYC; `input` is the `POST /api/v1/customers/:id/retry-kyc` body (requires CLIENT_ADMIN) */
  tenant_retryCustomerKyc: Scalars['JSON']['output'];
  /** [tenant] Answer a provider requirement; `input` is the `POST /api/v1/customers/:id/requirements/:requirement_id` body (requires CLIENT_ADMIN) */
  tenant_submitCustomerRequirement: Scalars['JSON']['output'];
  /** [tenant] Send a `webhook.test` event to the webhook `id` (default: the first active webhook) (`POST /api/v1/webhooks/test`) (requires CLIENT_ADMIN) */
  tenant_testWebhook: Scalars['JSON']['output'];
  /** [tenant] Update a beneficiary; `input` is the `PATCH /api/v1/beneficiaries/:id` body (requires CLIENT_ADMIN) */
  tenant_updateBeneficiary: Scalars['JSON']['output'];
  /** [tenant] Update a customer; `input` is the `PATCH /api/v1/customers/:id` body (requires CLIENT_ADMIN) */
  tenant_updateCustomer: Scalars['JSON']['output'];
  /** [tenant] Change the operational status; `input` is the `PATCH /api/v1/customers/:id/status` body (requires CLIENT_ADMIN) */
  tenant_updateCustomerStatus: Scalars['JSON']['output'];
  /** [tenant] Update a webhook; `input` is the `PATCH /api/v1/webhooks/:id` body (requires CLIENT_ADMIN, recent sign-in and second factor) */
  tenant_updateWebhook: Scalars['JSON']['output'];
  /** [transactions] Create a dispersion (withdrawal to an international beneficiary): claims the required client_reference_id idempotency key and holds the wallet balance in one database transaction, then creates the customer→ops vault transfer and queues the dispersion for operations; a retry with the same key returns the original dispersion (requires Firebase auth) */
  transactions_createDispersion: DispersionResponse;
  /** [transactions] Create off-ramp transaction (withdrawal to bank); routes into dispersion creation. client_reference_id is the required idempotency key (shared with transactions_createDispersion): a retry with the same key returns the original withdrawal (requires Firebase auth) */
  transactions_createOffRamp: OffRampResponse;
  /** [transactions] Create P2P transfer (internal wallet-to-wallet) (requires Firebase auth). `client_reference_id` is a required idempotency key: the sender amount is reserved before the provider call and the receiver is credited once the provider confirms; a retry with the same key returns the original transfer (never sent twice). Error codes: IDEMPOTENCY_KEY_REQUIRED, IDEMPOTENCY_KEY_INVALID, IDEMPOTENCY_KEY_REUSED, CURRENCY_MISMATCH (currency differs from the source wallet currency, 422), INSUFFICIENT_FUNDS, PROVIDER_OUTCOME_UNKNOWN. */
  transactions_createP2P: P2PResponse;
  /** [transactions] Create payment link for on-ramp deposits (requires Firebase auth) */
  transactions_createPaymentLink: PaymentLinkResponse;
  /** [transactions] Create crypto transfer to external address (requires Firebase auth). `client_reference_id` is a required idempotency key: funds are reserved before the provider call; a retry with the same key returns the original transaction (never sent twice). Error codes: IDEMPOTENCY_KEY_REQUIRED, IDEMPOTENCY_KEY_INVALID, IDEMPOTENCY_KEY_REUSED, INSUFFICIENT_FUNDS, PROVIDER_OUTCOME_UNKNOWN. In production it answers 422 EXTERNAL_CRYPTO_TRANSFER_NOT_AVAILABLE: no USDT leaves custody to an external address. */
  transactions_createTransfer: TransferResponse;
  /** [transactions] Dev/test-only (403 in production): simulate an ops actor action on a dispersion (select_provider | complete | fail | cancel) so infrastructure clients exercise the full manual lifecycle in the sandbox (requires Firebase auth) */
  transactions_simulateDispersionAction: DispersionSimulationResult;
  /** [user-registration] Self-register a new user (public, no auth required). The account is always created as CLIENT_USER. */
  user_register: RegistrationResult;
  /** [virtualAccounts] Request a virtual account by country, currency and rail. Requires an approved KYC; the request goes to the operations review queue. Idempotent per customer and rail (requires Firebase auth). Errors: RAIL_NOT_AVAILABLE (422), VA_BUSINESS_ONLY (422, individuals), RAIL_UNDER_MAINTENANCE (422), VA_REQUEST_EXISTS (409), KYC_NOT_APPROVED (403). */
  virtualAccounts_request: RequestVirtualAccountResponse;
  /** [wallets] Create a new crypto wallet for a customer (requires Firebase auth) */
  wallets_create: WalletEntity;
  /** [workflow] Assign a tag to a workflow */
  workflowTags_assign: Scalars['Boolean']['output'];
  /** [workflow] Create a new tag */
  workflowTags_create: TagEntity;
  /** [workflow] Delete a tag */
  workflowTags_delete: TagEntity;
  /** [workflow] Remove a tag from a workflow */
  workflowTags_remove: Scalars['Boolean']['output'];
  /** [workflow] Update a tag */
  workflowTags_update: TagEntity;
  /** [workflow] Archive a workflow (soft delete) */
  workflows_archive: WorkflowEntity;
  /** [workflow] Create a new workflow */
  workflows_create: WorkflowEntity;
  /** [workflow] Duplicate a workflow with a new name */
  workflows_duplicate: WorkflowEntity;
  /** [workflow] Publish a workflow (create versioned snapshot) */
  workflows_publish: WorkflowEntity;
  /** [workflow] Restore an archived workflow */
  workflows_restore: WorkflowEntity;
  /** [workflow] Update an existing workflow (optimistic locking) */
  workflows_update: WorkflowEntity;
};


export type MutationAdminLoopay_ApproveDispersionArgs = {
  id: Scalars['ID']['input'];
  input: ApproveDispersionInput;
};


export type MutationAdminLoopay_ApproveRecaudoArgs = {
  id: Scalars['ID']['input'];
  input: ApproveRecaudoInput;
};


export type MutationAdminLoopay_CancelDispersionArgs = {
  id: Scalars['ID']['input'];
  input: CancelDispersionInput;
};


export type MutationAdminLoopay_CompleteDispersionArgs = {
  id: Scalars['ID']['input'];
  input: CompleteDispersionInput;
};


export type MutationAdminLoopay_CreateAndOnboardClientArgs = {
  input: CreateAndOnboardClientInput;
};


export type MutationAdminLoopay_CreateBeneficiaryArgs = {
  input: AdminCreateBeneficiaryInput;
};


export type MutationAdminLoopay_CreateClientArgs = {
  input: CreateClientInput;
};


export type MutationAdminLoopay_CreateClientProviderRailArgs = {
  input: CreateClientProviderRailInput;
};


export type MutationAdminLoopay_CreateCurrencyArgs = {
  input: CreateCurrencyInput;
};


export type MutationAdminLoopay_CreateCustomerArgs = {
  input: AdminCreateCustomerInput;
};


export type MutationAdminLoopay_CreateFeeScheduleArgs = {
  input: CreateFeeScheduleGraphqlInput;
};


export type MutationAdminLoopay_CreateOperationTypeArgs = {
  input: CreateOperationTypeInput;
};


export type MutationAdminLoopay_CreatePaymentRailArgs = {
  input: CreatePaymentRailInput;
};


export type MutationAdminLoopay_CreateProviderArgs = {
  input: CreateProviderInput;
};


export type MutationAdminLoopay_CreateProviderPaymentRailArgs = {
  input: CreateProviderPaymentRailInput;
};


export type MutationAdminLoopay_CreateProviderRequirementLinkArgs = {
  requirementId: Scalars['String']['input'];
};


export type MutationAdminLoopay_CreateRecaudoArgs = {
  input: CreateRecaudoInput;
};


export type MutationAdminLoopay_CreateStaffUserArgs = {
  input: CreateStaffUserInput;
};


export type MutationAdminLoopay_CreateTaxIdTypeArgs = {
  input: CreateTaxIdTypeInput;
};


export type MutationAdminLoopay_CreateWalletArgs = {
  input: AdminCreateWalletInput;
};


export type MutationAdminLoopay_CreditDispersionReturnArgs = {
  id: Scalars['ID']['input'];
  input: CreditDispersionReturnInput;
};


export type MutationAdminLoopay_CutoverDeactivateDeadProviderCatalogArgs = {
  reason: Scalars['String']['input'];
};


export type MutationAdminLoopay_CutoverDeactivateDeadProvidersArgs = {
  input: AdminCutoverDeactivateDeadProvidersInput;
};


export type MutationAdminLoopay_CutoverFlagLegacyTransactionsArgs = {
  input: AdminCutoverFlagLegacyTransactionsInput;
};


export type MutationAdminLoopay_DeactivateBeneficiaryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAdminLoopay_DeactivateFeeScheduleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAdminLoopay_DeactivateStaffUserArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminLoopay_DeleteBeneficiaryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAdminLoopay_DeleteCustomerArgs = {
  customerId: Scalars['String']['input'];
};


export type MutationAdminLoopay_DeleteEndorsementArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAdminLoopay_DeleteOperationTypeArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminLoopay_DeleteUserArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminLoopay_DeleteVirtualAccountArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminLoopay_FailDispersionArgs = {
  id: Scalars['ID']['input'];
  input: FailDispersionInput;
};


export type MutationAdminLoopay_ImportEndorsementsArgs = {
  customerId: Scalars['ID']['input'];
  endorsements: Array<AdminImportEndorsementInput>;
};


export type MutationAdminLoopay_ImportVaultBalanceArgs = {
  input: ImportVaultBalanceInput;
  walletId: Scalars['ID']['input'];
};


export type MutationAdminLoopay_ImportVirtualAccountsArgs = {
  accounts: Array<AdminImportVirtualAccountInput>;
  walletId: Scalars['String']['input'];
};


export type MutationAdminLoopay_ImportWalletArgs = {
  input: AdminImportWalletInput;
};


export type MutationAdminLoopay_InitiateAvailabilityArgs = {
  input: InitiateAvailabilityInput;
};


export type MutationAdminLoopay_InviteTenantAdminArgs = {
  clientId: Scalars['String']['input'];
  input: InviteTenantAdminInput;
};


export type MutationAdminLoopay_LinkBeneficiaryProviderIdArgs = {
  id: Scalars['ID']['input'];
  input: LinkBeneficiaryProviderInput;
};


export type MutationAdminLoopay_LinkClientProviderManuallyArgs = {
  clientId: Scalars['String']['input'];
  note: Scalars['String']['input'];
  provider: Scalars['String']['input'];
  providerCustomerId: Scalars['String']['input'];
};


export type MutationAdminLoopay_LinkCustomerUserArgs = {
  input: AdminLinkCustomerUserInput;
};


export type MutationAdminLoopay_LinkProviderCustomerArgs = {
  customerId: Scalars['ID']['input'];
  input: LinkProviderCustomerInput;
};


export type MutationAdminLoopay_LinkVirtualAccountArgs = {
  input: LinkVirtualAccountInput;
};


export type MutationAdminLoopay_LinkWalletAddressArgs = {
  customerId: Scalars['ID']['input'];
  input: LinkWalletAddressInput;
};


export type MutationAdminLoopay_MarkProviderRequirementHandledArgs = {
  input: MarkProviderRequirementHandledInput;
};


export type MutationAdminLoopay_MarkStalePendingAsFailedArgs = {
  input: MarkStaleAsFailedInput;
};


export type MutationAdminLoopay_MoveCustomerToClientArgs = {
  customerId: Scalars['String']['input'];
  input: AdminMoveCustomerToClientInput;
};


export type MutationAdminLoopay_MoveToOpsVaultArgs = {
  input: MoveToOpsVaultInput;
  transactionId: Scalars['ID']['input'];
};


export type MutationAdminLoopay_OnboardClientToProvidersArgs = {
  clientId: Scalars['String']['input'];
  onboardingProfile?: InputMaybe<ClientOnboardingProfileInput>;
  providers?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationAdminLoopay_PlaceAvailabilityOrderArgs = {
  input: PlaceAvailabilityOrderInput;
};


export type MutationAdminLoopay_ReactivateBeneficiaryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAdminLoopay_RegenerateClientApiKeyArgs = {
  clientId: Scalars['String']['input'];
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  graceMinutes?: InputMaybe<Scalars['Int']['input']>;
  scopes?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationAdminLoopay_RejectDispersionArgs = {
  id: Scalars['ID']['input'];
  input: RejectDispersionInput;
};


export type MutationAdminLoopay_RejectRecaudoArgs = {
  id: Scalars['ID']['input'];
  input: RejectRecaudoInput;
};


export type MutationAdminLoopay_RepairVirtualAccountRequestArgs = {
  input: RepairVirtualAccountRequestInput;
};


export type MutationAdminLoopay_RequestKycAdditionalInfoArgs = {
  customerId: Scalars['ID']['input'];
  input: RequestKycAdditionalInfoInput;
};


export type MutationAdminLoopay_RequestVirtualAccountArgs = {
  input: AdminRequestVirtualAccountInput;
};


export type MutationAdminLoopay_RetryClientProviderOnboardingArgs = {
  clientId: Scalars['String']['input'];
  onboardingProfile?: InputMaybe<ClientOnboardingProfileInput>;
  provider: Scalars['String']['input'];
};


export type MutationAdminLoopay_RetryDispersionFundingArgs = {
  id: Scalars['ID']['input'];
  input?: InputMaybe<RetryDispersionFundingInput>;
};


export type MutationAdminLoopay_RetryDispersionReturnArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAdminLoopay_RetryEndorsementOnboardingArgs = {
  endorsementId: Scalars['ID']['input'];
  providerProfile?: InputMaybe<CustomerProviderProfileInput>;
};


export type MutationAdminLoopay_ReverseRecaudoArgs = {
  id: Scalars['ID']['input'];
  input: ReverseRecaudoInput;
};


export type MutationAdminLoopay_ReviewBeneficiaryArgs = {
  id: Scalars['ID']['input'];
  input: ReviewBeneficiaryInput;
};


export type MutationAdminLoopay_ReviewEndorsementArgs = {
  id: Scalars['ID']['input'];
  input: ReviewEndorsementInput;
};


export type MutationAdminLoopay_ReviewKycArgs = {
  customerId: Scalars['ID']['input'];
  input: ReviewKycInput;
};


export type MutationAdminLoopay_ReviewProviderRequirementArgs = {
  input: ReviewProviderRequirementInput;
};


export type MutationAdminLoopay_RevokeClientApiKeyArgs = {
  clientId: Scalars['String']['input'];
};


export type MutationAdminLoopay_SelectDispersionProviderArgs = {
  id: Scalars['ID']['input'];
  input: SelectDispersionProviderInput;
};


export type MutationAdminLoopay_SetCryptoPayoutAllowanceArgs = {
  input: SetCryptoPayoutAllowanceInput;
};


export type MutationAdminLoopay_SimulateProviderBeneficiaryVerificationArgs = {
  beneficiaryId: Scalars['ID']['input'];
  outcome: SandboxProviderOutcome;
};


export type MutationAdminLoopay_SimulateProviderDepositArgs = {
  amount: Scalars['String']['input'];
  virtualAccountId: Scalars['ID']['input'];
};


export type MutationAdminLoopay_StartProviderBeneficiaryVerificationArgs = {
  beneficiaryId: Scalars['ID']['input'];
};


export type MutationAdminLoopay_SubmitProviderRequirementsArgs = {
  endorsementId: Scalars['String']['input'];
};


export type MutationAdminLoopay_UpdateBeneficiaryArgs = {
  id: Scalars['String']['input'];
  input: AdminUpdateBeneficiaryInput;
};


export type MutationAdminLoopay_UpdateClientArgs = {
  id: Scalars['String']['input'];
  input: UpdateClientInput;
};


export type MutationAdminLoopay_UpdateClientAllowedCountriesArgs = {
  clientId: Scalars['String']['input'];
  countries: Array<Scalars['String']['input']>;
};


export type MutationAdminLoopay_UpdateClientProviderRailArgs = {
  id: Scalars['String']['input'];
  input: UpdateClientProviderRailInput;
};


export type MutationAdminLoopay_UpdateCurrencyArgs = {
  code: Scalars['String']['input'];
  input: UpdateCurrencyInput;
};


export type MutationAdminLoopay_UpdateCustomerArgs = {
  customerId: Scalars['String']['input'];
  input: AdminUpdateCustomerInput;
};


export type MutationAdminLoopay_UpdateCustomerStatusArgs = {
  customerId: Scalars['String']['input'];
  input: AdminUpdateCustomerStatusInput;
};


export type MutationAdminLoopay_UpdateFeeConfigArgs = {
  entityId: Scalars['String']['input'];
  entityType: Scalars['String']['input'];
  fees?: InputMaybe<Scalars['JSON']['input']>;
};


export type MutationAdminLoopay_UpdateOperationTypeArgs = {
  id: Scalars['String']['input'];
  input: UpdateOperationTypeInput;
};


export type MutationAdminLoopay_UpdatePaymentRailArgs = {
  id: Scalars['String']['input'];
  input: UpdatePaymentRailInput;
};


export type MutationAdminLoopay_UpdateProviderArgs = {
  id: Scalars['String']['input'];
  input: UpdateProviderInput;
};


export type MutationAdminLoopay_UpdateProviderPaymentRailArgs = {
  id: Scalars['String']['input'];
  input: UpdateProviderPaymentRailInput;
};


export type MutationAdminLoopay_UpdateStaffUserArgs = {
  id: Scalars['String']['input'];
  input: UpdateStaffUserInput;
};


export type MutationAdminLoopay_UpdateTaxIdTypeArgs = {
  id: Scalars['String']['input'];
  input: UpdateTaxIdTypeInput;
};


export type MutationAdminLoopay_UpdateUserArgs = {
  id: Scalars['String']['input'];
  input: UpdateUserInput;
};


export type MutationAdminLoopay_UpdateVirtualAccountArgs = {
  id: Scalars['String']['input'];
  input: UpdateVirtualAccountInput;
};


export type MutationAdminLoopay_UpdateWalletArgs = {
  id: Scalars['String']['input'];
  input: AdminUpdateWalletInput;
};


export type MutationAdminLoopay_UpdateWalletProviderMetadataArgs = {
  input: AdminUpdateWalletProviderMetadataInput;
};


export type MutationAuth_CompleteRegistrationArgs = {
  completeRegistrationInput: CompleteRegistrationInput;
};


export type MutationAuth_SignInArgs = {
  signInInput: SignInInput;
};


export type MutationAuth_SignUpArgs = {
  signUpInput: SignUpInput;
};


export type MutationBeneficiaries_CreateArgs = {
  input: CreateBeneficiaryInput;
};


export type MutationBeneficiaries_DeleteArgs = {
  customerId: Scalars['String']['input'];
  id: Scalars['String']['input'];
};


export type MutationCustomers_AddEndorsementArgs = {
  id: Scalars['String']['input'];
  input: AddEndorsementInput;
};


export type MutationCustomers_CreateArgs = {
  input: CreateCustomerInput;
};


export type MutationCustomers_GetTosLinkArgs = {
  input: GetTosLinkInput;
};


export type MutationCustomers_RefreshKycSnapshotArgs = {
  input: RefreshKycSnapshotInput;
};


export type MutationCustomers_RetryKycArgs = {
  input: RetryKycInput;
};


export type MutationCustomers_SubmitProviderRequirementArgs = {
  input: SubmitProviderRequirementInput;
};


export type MutationCustomers_UpdateArgs = {
  id: Scalars['String']['input'];
  input: UpdateCustomerInput;
};


export type MutationExecutions_CancelArgs = {
  id: Scalars['String']['input'];
};


export type MutationExecutions_CreateArgs = {
  input: CreateWorkflowExecutionInput;
};


export type MutationExecutions_CreateDataArgs = {
  input: CreateExecutionDataInput;
};


export type MutationExecutions_CreateNodeArgs = {
  input: CreateNodeExecutionInput;
};


export type MutationExecutions_SoftDeleteArgs = {
  id: Scalars['String']['input'];
};


export type MutationExecutions_UpdateDataArgs = {
  execution_id: Scalars['String']['input'];
  input: UpdateExecutionDataInput;
};


export type MutationExecutions_UpdateNodeArgs = {
  id: Scalars['String']['input'];
  input: UpdateNodeExecutionInput;
};


export type MutationExecutions_UpdateStatusArgs = {
  id: Scalars['String']['input'];
  input: UpdateExecutionStatusInput;
};


export type MutationQuotes_CreateArgs = {
  input: CreateQuoteInput;
};


export type MutationTenant_AddCustomerRailArgs = {
  id: Scalars['String']['input'];
  input: Scalars['JSONObject']['input'];
};


export type MutationTenant_CreateBeneficiaryArgs = {
  input: Scalars['JSONObject']['input'];
};


export type MutationTenant_CreateCustomerArgs = {
  input: Scalars['JSONObject']['input'];
};


export type MutationTenant_CreateDispersionArgs = {
  input: Scalars['JSONObject']['input'];
};


export type MutationTenant_CreateOffRampArgs = {
  input: Scalars['JSONObject']['input'];
};


export type MutationTenant_CreatePaymentLinkArgs = {
  input: Scalars['JSONObject']['input'];
};


export type MutationTenant_CreateQuoteArgs = {
  input: Scalars['JSONObject']['input'];
};


export type MutationTenant_CreateTransferArgs = {
  input: Scalars['JSONObject']['input'];
};


export type MutationTenant_CreateWalletArgs = {
  input: Scalars['JSONObject']['input'];
};


export type MutationTenant_CreateWebhookArgs = {
  input: Scalars['JSONObject']['input'];
};


export type MutationTenant_DeactivateBeneficiaryArgs = {
  id: Scalars['String']['input'];
};


export type MutationTenant_DeleteBeneficiaryArgs = {
  id: Scalars['String']['input'];
};


export type MutationTenant_DeleteWebhookArgs = {
  id: Scalars['String']['input'];
};


export type MutationTenant_InviteAdminArgs = {
  input: InviteTenantAdminInput;
};


export type MutationTenant_ReactivateBeneficiaryArgs = {
  id: Scalars['String']['input'];
};


export type MutationTenant_RegenerateApiKeyArgs = {
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  graceMinutes?: InputMaybe<Scalars['Int']['input']>;
  scopes?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationTenant_RemoveAdminArgs = {
  user_id: Scalars['String']['input'];
};


export type MutationTenant_RequestVirtualAccountArgs = {
  input: Scalars['JSONObject']['input'];
};


export type MutationTenant_RetryCustomerKycArgs = {
  id: Scalars['String']['input'];
  input: Scalars['JSONObject']['input'];
};


export type MutationTenant_SubmitCustomerRequirementArgs = {
  id: Scalars['String']['input'];
  input: Scalars['JSONObject']['input'];
  requirement_id: Scalars['String']['input'];
};


export type MutationTenant_TestWebhookArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


export type MutationTenant_UpdateBeneficiaryArgs = {
  id: Scalars['String']['input'];
  input: Scalars['JSONObject']['input'];
};


export type MutationTenant_UpdateCustomerArgs = {
  id: Scalars['String']['input'];
  input: Scalars['JSONObject']['input'];
};


export type MutationTenant_UpdateCustomerStatusArgs = {
  id: Scalars['String']['input'];
  input: Scalars['JSONObject']['input'];
};


export type MutationTenant_UpdateWebhookArgs = {
  id: Scalars['String']['input'];
  input: Scalars['JSONObject']['input'];
};


export type MutationTransactions_CreateDispersionArgs = {
  input: CreateDispersionInput;
};


export type MutationTransactions_CreateOffRampArgs = {
  input: CreateOffRampInput;
};


export type MutationTransactions_CreateP2PArgs = {
  input: CreateP2PInput;
};


export type MutationTransactions_CreatePaymentLinkArgs = {
  input: CreatePaymentLinkInput;
};


export type MutationTransactions_CreateTransferArgs = {
  input: CreateTransferInput;
};


export type MutationTransactions_SimulateDispersionActionArgs = {
  input: SimulateDispersionActionInput;
};


export type MutationUser_RegisterArgs = {
  input: RegisterUserInput;
};


export type MutationVirtualAccounts_RequestArgs = {
  input: RequestVirtualAccountInput;
};


export type MutationWallets_CreateArgs = {
  input: CreateWalletInput;
};


export type MutationWorkflowTags_AssignArgs = {
  tag_id: Scalars['String']['input'];
  workflow_id: Scalars['String']['input'];
};


export type MutationWorkflowTags_CreateArgs = {
  input: CreateTagInput;
};


export type MutationWorkflowTags_DeleteArgs = {
  id: Scalars['String']['input'];
};


export type MutationWorkflowTags_RemoveArgs = {
  tag_id: Scalars['String']['input'];
  workflow_id: Scalars['String']['input'];
};


export type MutationWorkflowTags_UpdateArgs = {
  id: Scalars['String']['input'];
  input: UpdateTagInput;
};


export type MutationWorkflows_ArchiveArgs = {
  id: Scalars['String']['input'];
};


export type MutationWorkflows_CreateArgs = {
  input: CreateWorkflowInput;
};


export type MutationWorkflows_DuplicateArgs = {
  id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};


export type MutationWorkflows_PublishArgs = {
  id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};


export type MutationWorkflows_RestoreArgs = {
  id: Scalars['String']['input'];
};


export type MutationWorkflows_UpdateArgs = {
  id: Scalars['String']['input'];
  input: UpdateWorkflowInput;
};

/** Individual node execution result — crash-safe */
export type NodeExecutionEntity = {
  __typename?: 'NodeExecutionEntity';
  /** Client ID (denormalized) */
  client_id: Scalars['String']['output'];
  /** Compensation status */
  compensation_status: CompensationStatus;
  /** Completion timestamp */
  completed_at?: Maybe<Scalars['DateTime']['output']>;
  /** Connector ID (Stripe, etc) */
  connector_id?: Maybe<Scalars['String']['output']>;
  /** Duration in milliseconds */
  duration_ms?: Maybe<Scalars['Int']['output']>;
  /** Error message */
  error?: Maybe<Scalars['String']['output']>;
  /** Error code */
  error_code?: Maybe<Scalars['String']['output']>;
  /** Execution ID */
  execution_id: Scalars['String']['output'];
  /** Execution order (1, 2, 3...) */
  execution_order?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  /** Idempotency key for financial operations */
  idempotency_key?: Maybe<Scalars['String']['output']>;
  /** Input data */
  input_data?: Maybe<Scalars['JSON']['output']>;
  /** Node ID in canvas */
  node_id: Scalars['String']['output'];
  /** Node label */
  node_label: Scalars['String']['output'];
  /** Node type (trigger|action|check|etc) */
  node_type: Scalars['String']['output'];
  /** Output data */
  output_data?: Maybe<Scalars['JSON']['output']>;
  /** Retry count */
  retry_count: Scalars['Int']['output'];
  /** Start timestamp */
  started_at?: Maybe<Scalars['DateTime']['output']>;
  /** Node execution status */
  status: NodeExecutionStatus;
  /** Transaction ID (if financial operation) */
  transaction_id?: Maybe<Scalars['String']['output']>;
};

/** Paginated node execution list response */
export type NodeExecutionListResponse = {
  __typename?: 'NodeExecutionListResponse';
  data: Array<NodeExecutionEntity>;
  /** Total count */
  total: Scalars['Int']['output'];
};

/** Individual node execution status */
export enum NodeExecutionStatus {
  Cancelled = 'CANCELLED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Running = 'RUNNING',
  Skipped = 'SKIPPED',
  Success = 'SUCCESS',
  Waiting = 'WAITING'
}

export type OffRampResponse = {
  __typename?: 'OffRampResponse';
  /** Message */
  message: Scalars['String']['output'];
  /** Status */
  status: Scalars['String']['output'];
  /** Transaction ID */
  transaction_id: Scalars['String']['output'];
};

export type OperationTypeFiltersInput = {
  /** Filter by operation type name */
  name?: InputMaybe<Scalars['String']['input']>;
};

export type OperationTypeGraphqlEntity = {
  __typename?: 'OperationTypeGraphqlEntity';
  /** Operation type ID */
  id: Scalars['String']['output'];
  /** Operation type name */
  name: Scalars['String']['output'];
};

export type OpsVaultEquationTerms = {
  __typename?: 'OpsVaultEquationTerms';
  /** Sum of fee_ledger_entry.fee_amount (fees kept in the ops account) */
  feesCollected: Scalars['String']['output'];
  /** Ops-account arrivals matched to an expected deposit not credited yet */
  inTransitArrivals: Scalars['String']['output'];
  /** P2P fees moved into the ops account by custody, not booked in the fee ledger yet */
  inTransitP2PFees: Scalars['String']['output'];
  /** Withdrawals swept into the ops account and not paid out yet */
  inTransitWithdrawals: Scalars['String']['output'];
  /** Ops-account arrivals matched to no expected deposit */
  unmatchedDeposits: Scalars['String']['output'];
};

export type OpsVaultReconciliation = {
  __typename?: 'OpsVaultReconciliation';
  /** Decimal string: ops-account position at custody */
  actual: Scalars['String']['output'];
  /** Custody asset id of the position read */
  assetId: Scalars['String']['output'];
  /** |difference| ≤ tolerance */
  balanced: Scalars['Boolean']['output'];
  computedAt: Scalars['DateTime']['output'];
  /** Settlement currency */
  currency: Scalars['String']['output'];
  /** Decimal string: actual − expected */
  difference: Scalars['String']['output'];
  /** Decimal string: sum of the terms */
  expected: Scalars['String']['output'];
  /** Fees collected per rail (gross: provider cost not deducted) */
  feesByRail: Array<RailFeeTotal>;
  /** Ops account id at the custody provider */
  opsAccountId: Scalars['String']['output'];
  /** Wallets currently reconciling */
  reconcilingWallets: Scalars['Int']['output'];
  terms: OpsVaultEquationTerms;
  /** RECONCILIATION_OPS_VAULT_TOLERANCE (absolute) */
  tolerance: Scalars['String']['output'];
};

export type P2PResponse = {
  __typename?: 'P2PResponse';
  /** Message */
  message: Scalars['String']['output'];
  /** Status */
  status: Scalars['String']['output'];
  /** Transaction ID */
  transaction_id: Scalars['String']['output'];
};

/** Paginated admin beneficiaries response */
export type PaginatedAdminBeneficiariesResponse = {
  __typename?: 'PaginatedAdminBeneficiariesResponse';
  data: Array<AdminBeneficiaryEntity>;
  /** Has more results */
  has_more: Scalars['Boolean']['output'];
  /** Total count */
  total: Scalars['Int']['output'];
};

/** [admin-loopay-beneficiaries] Paginated pending-beneficiary queue */
export type PaginatedAdminBeneficiaryQueueResponse = {
  __typename?: 'PaginatedAdminBeneficiaryQueueResponse';
  data: Array<AdminBeneficiaryQueueItemEntity>;
  has_more: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

/** [admin-loopay-dispersiones] Paginated pending-dispersion queue */
export type PaginatedAdminDispersionesResponse = {
  __typename?: 'PaginatedAdminDispersionesResponse';
  data: Array<AdminDispersionEntity>;
  has_more: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

/** [admin-loopay-endorsements] Paginated pending-endorsement queue */
export type PaginatedAdminEndorsementQueueResponse = {
  __typename?: 'PaginatedAdminEndorsementQueueResponse';
  data: Array<AdminEndorsementQueueItemEntity>;
  has_more: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

/** [admin-loopay-kyc-review] Paginated pending-KYC queue */
export type PaginatedAdminKycQueueResponse = {
  __typename?: 'PaginatedAdminKycQueueResponse';
  data: Array<AdminKycQueueItemEntity>;
  has_more: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

/** [admin-loopay-virtual-accounts] Paginated provider-linked accounts */
export type PaginatedAdminProviderLinkedAccountsResponse = {
  __typename?: 'PaginatedAdminProviderLinkedAccountsResponse';
  data: Array<AdminProviderLinkedAccountEntity>;
  has_more: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

/** [admin-loopay-recaudos] Paginated pending-recaudo queue */
export type PaginatedAdminRecaudosResponse = {
  __typename?: 'PaginatedAdminRecaudosResponse';
  data: Array<AdminRecaudoEntity>;
  has_more: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

/** Paginated admin transactions response */
export type PaginatedAdminTransactionsResponse = {
  __typename?: 'PaginatedAdminTransactionsResponse';
  data: Array<AdminTransactionEntity>;
  /** Has more results */
  has_more: Scalars['Boolean']['output'];
  /** Total count */
  total: Scalars['Int']['output'];
};

/** [admin-loopay-virtual-accounts] Paginated open virtual-account requests */
export type PaginatedAdminVirtualAccountRequestsResponse = {
  __typename?: 'PaginatedAdminVirtualAccountRequestsResponse';
  data: Array<AdminVirtualAccountRequestEntity>;
  has_more: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type PaginatedAvailabilityOperationsResponse = {
  __typename?: 'PaginatedAvailabilityOperationsResponse';
  data: Array<AvailabilityOperationEntity>;
  has_more: Scalars['Boolean']['output'];
  total: Scalars['Float']['output'];
};

/** Paginated admin Loopay clients response */
export type PaginatedClientsResponse = {
  __typename?: 'PaginatedClientsResponse';
  data: Array<ClientGraphqlEntity>;
  /** Has more results */
  has_more: Scalars['Boolean']['output'];
  /** Total count */
  total: Scalars['Int']['output'];
};

/** Paginated admin Loopay staff users response */
export type PaginatedStaffUsersResponse = {
  __typename?: 'PaginatedStaffUsersResponse';
  data: Array<StaffUserGraphQlEntity>;
  /** Has more results */
  has_more: Scalars['Boolean']['output'];
  /** Total count */
  total: Scalars['Int']['output'];
};

/** Paginated admin Loopay users response */
export type PaginatedUsersResponse = {
  __typename?: 'PaginatedUsersResponse';
  data: Array<UserGraphQlEntity>;
  /** Has more results */
  has_more: Scalars['Boolean']['output'];
  /** Total count */
  total: Scalars['Int']['output'];
};

/** Paginated virtual accounts response */
export type PaginatedVirtualAccountsResponse = {
  __typename?: 'PaginatedVirtualAccountsResponse';
  data: Array<AdminVirtualAccountEntity>;
  /** Has more results */
  has_more: Scalars['Boolean']['output'];
  /** Total count */
  total: Scalars['Int']['output'];
};

export type PaginationInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type PayerDetailsInput = {
  /** Number of the identification document (e.g., CI number without dashes). */
  document_number: Scalars['String']['input'];
  /** Type of government-issued identification document (e.g., CI for Cédula de Identidad). */
  document_type: Scalars['String']['input'];
  /** Payer email address. Used for payment notifications and receipts. */
  email: Scalars['String']['input'];
  /** Full legal name of the payer. Must match their government-issued ID. */
  full_name: Scalars['String']['input'];
  /** Payer phone number in international format (E.164). Includes country code. */
  phone: Scalars['String']['input'];
};

export type PaymentLinkCapabilitiesEntity = {
  __typename?: 'PaymentLinkCapabilitiesEntity';
  /** Detailed capabilities per currency and payment method */
  capabilities: Array<CurrencyPaymentMethodCapabilityEntity>;
  /** Rules derived from the active currency catalog policy */
  catalog_rules: PaymentLinkCatalogRulesEntity;
  /** Minimum amounts per currency */
  minimum_amounts: Scalars['JSON']['output'];
  /** Rails that are truly available via payment links and should not be classified as virtual-account rails by the frontend */
  payment_link_rails: Array<Scalars['String']['output']>;
  /** Rules derived from the authenticated client provider configuration */
  provider_rules: PaymentLinkProviderRulesEntity;
  /** All supported currencies for payment links */
  supported_currencies: Array<Scalars['String']['output']>;
  /** All supported payment methods across all currencies */
  supported_payment_methods: Array<Scalars['String']['output']>;
};

export type PaymentLinkCatalogRulesEntity = {
  __typename?: 'PaymentLinkCatalogRulesEntity';
  /** Currencies allowed by the active currency catalog policy */
  currencies: Array<Scalars['String']['output']>;
  /** Minimum amounts derived from the catalog-side payment link policy */
  minimum_amounts: Scalars['JSON']['output'];
};

export type PaymentLinkProviderRulesEntity = {
  __typename?: 'PaymentLinkProviderRulesEntity';
  /** Detailed provider-derived capabilities before applying catalog filtering */
  capabilities: Array<CurrencyPaymentMethodCapabilityEntity>;
  /** Currencies supported by the authenticated client provider setup */
  currencies: Array<Scalars['String']['output']>;
  /** Payment methods supported by the authenticated client provider setup */
  payment_methods: Array<Scalars['String']['output']>;
};

export type PaymentLinkResponse = {
  __typename?: 'PaymentLinkResponse';
  /** Expiration timestamp */
  expires_at: Scalars['String']['output'];
  /** Payment link ID */
  payment_link_id: Scalars['String']['output'];
  /** Payment link URL */
  payment_url: Scalars['String']['output'];
};

export type PaymentRailFiltersInput = {
  /** Filter by rail code */
  code?: InputMaybe<Scalars['String']['input']>;
  /** Filter by ISO3 country code */
  country?: InputMaybe<Scalars['String']['input']>;
  /** Filter by currency code */
  currency?: InputMaybe<Scalars['String']['input']>;
  /** Filter by rail direction */
  direction?: InputMaybe<Scalars['String']['input']>;
  /** Filter by active status */
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by rail name */
  name?: InputMaybe<Scalars['String']['input']>;
};

export type PaymentRailGraphqlEntity = {
  __typename?: 'PaymentRailGraphqlEntity';
  /** Code of the rail this one duplicates; null or equal to code for a canonical rail. A rail whose canonical_code differs from its code is an alias and is not offered for selection (#411) */
  canonical_code?: Maybe<Scalars['String']['output']>;
  /** Payment rail code */
  code: Scalars['String']['output'];
  /** Payment rail ISO3 country */
  country: Scalars['String']['output'];
  /** Creation timestamp */
  created_at: Scalars['DateTime']['output'];
  /** Payment rail currency code */
  currency: Scalars['String']['output'];
  /** Payment rail direction */
  direction: Scalars['String']['output'];
  /** Payment rail ID */
  id: Scalars['String']['output'];
  /** Whether the payment rail is active */
  is_active: Scalars['Boolean']['output'];
  /** Payment rail name */
  name: Scalars['String']['output'];
};

export type PaymentRailSummaryGraphqlEntity = {
  __typename?: 'PaymentRailSummaryGraphqlEntity';
  code: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type PlaceAvailabilityOrderInput = {
  /** Carrier availability transaction id */
  availabilityId: Scalars['String']['input'];
  /** Delivery chain of the USDT leg */
  chain: Scalars['String']['input'];
  /** Selected ExchangeQuote id */
  quoteId: Scalars['String']['input'];
};

export type ProviderFiltersInput = {
  /** Filter by provider code */
  code?: InputMaybe<Scalars['String']['input']>;
  /** Filter by active status */
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by provider name */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Filter by provider type */
  type?: InputMaybe<Scalars['String']['input']>;
};

export type ProviderGraphqlEntity = {
  __typename?: 'ProviderGraphqlEntity';
  /** Provider code */
  code: Scalars['String']['output'];
  /** Provider configuration payload */
  config?: Maybe<Scalars['JSON']['output']>;
  /** Creation timestamp */
  created_at: Scalars['DateTime']['output'];
  /** Provider ID */
  id: Scalars['String']['output'];
  /** Whether the provider is active */
  is_active: Scalars['Boolean']['output'];
  /** Provider name */
  name: Scalars['String']['output'];
  /** Provider type */
  type: Scalars['String']['output'];
  /** Last update timestamp */
  updated_at: Scalars['DateTime']['output'];
  /** Non-secret wallet capability derived from config.wallet; visible to every staff role */
  walletCapability?: Maybe<ProviderWalletCapabilityEntity>;
};

export type ProviderPaymentRailFiltersInput = {
  /** Filter by active status */
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by provider ID */
  providerId?: InputMaybe<Scalars['String']['input']>;
  /** Filter by payment rail ID */
  railId?: InputMaybe<Scalars['String']['input']>;
};

export type ProviderPaymentRailGraphqlEntity = {
  __typename?: 'ProviderPaymentRailGraphqlEntity';
  /** Provider payment rail configuration payload */
  config?: Maybe<Scalars['JSON']['output']>;
  /** Creation timestamp */
  created_at: Scalars['DateTime']['output'];
  /** Provider payment rail ID */
  id: Scalars['String']['output'];
  /** Whether the provider payment rail is active */
  is_active: Scalars['Boolean']['output'];
  /** Provider summary */
  provider: ProviderSummaryGraphqlEntity;
  /** Payment rail summary */
  rail: PaymentRailSummaryGraphqlEntity;
};

export enum ProviderRequirementDecision {
  Approve = 'APPROVE',
  Reject = 'REJECT'
}

/** [customers] A document attached to a provider requirement */
export type ProviderRequirementDocumentEntity = {
  __typename?: 'ProviderRequirementDocumentEntity';
  fileName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  mimeType: Scalars['String']['output'];
  uploadedAt: Scalars['DateTime']['output'];
};

/** [customers] Something a provider asks of the customer to open a virtual account (a document, a value or a beneficial-owner link) */
export type ProviderRequirementEntity = {
  __typename?: 'ProviderRequirementEntity';
  /** Provider blocker code it comes from */
  blockerCode: Scalars['String']['output'];
  customerId: Scalars['String']['output'];
  documents: Array<ProviderRequirementDocumentEntity>;
  dueAt?: Maybe<Scalars['DateTime']['output']>;
  endorsementId: Scalars['String']['output'];
  /** Section of the key (identifying_information, associated_persons, business_documents, rfi, ...) */
  group: Scalars['String']['output'];
  /** PROVIDER_API: the platform sends it through the provider API; PROVIDER_CONSOLE: Commercial completes it at the provider (UBO links, associated-person data, keys the API refused) */
  handling?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  /** Stable requirement key (provider token, e.g. identifying_information:file_shareholder_registry, address_proof) */
  key: Scalars['String']['output'];
  kind: ProviderRequirementKind;
  /** Documented answers of a VALUE requirement (KiraFin enum); null for free text. Array fields (business_industry, transaction_countries) take several comma-separated values */
  options?: Maybe<Array<Scalars['String']['output']>>;
  /** Provider code (kirafin, mesta, ...) */
  provider: Scalars['String']['output'];
  railCode: Scalars['String']['output'];
  /** Why the last answer was rejected (REJECTED only) */
  rejectReason?: Maybe<Scalars['String']['output']>;
  requestedAt: Scalars['DateTime']['output'];
  /** MISSING_FIELD, RFI_ITEM or UBO */
  source: Scalars['String']['output'];
  status: ProviderRequirementStatus;
  updatedAt: Scalars['DateTime']['output'];
  value?: Maybe<Scalars['String']['output']>;
};

/** [admin-loopay-provider-requirements] Queue filter */
export type ProviderRequirementFilterInput = {
  customerId?: InputMaybe<Scalars['String']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  /** Customer name or email, client name or requirement key */
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<ProviderRequirementStatus>>;
};

/** DOCUMENT: answer with files; VALUE: answer with a value; UBO_LINK: beneficial-owner information (files or a value) */
export enum ProviderRequirementKind {
  Document = 'DOCUMENT',
  UboLink = 'UBO_LINK',
  Value = 'VALUE'
}

/** REQUESTED → (customer) UPLOADED → (commercial) APPROVED | REJECTED (customer answers again) → (submit) SUBMITTED → (provider stops asking) RESOLVED */
export enum ProviderRequirementStatus {
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
  Requested = 'REQUESTED',
  Resolved = 'RESOLVED',
  Submitted = 'SUBMITTED',
  Uploaded = 'UPLOADED'
}

/** [admin-loopay-sandbox] Which providers currently point to a sandbox host */
export type ProviderSandboxAvailabilityEntity = {
  __typename?: 'ProviderSandboxAvailabilityEntity';
  kirafin: Scalars['Boolean']['output'];
  mesta: Scalars['Boolean']['output'];
};

export type ProviderSummaryGraphqlEntity = {
  __typename?: 'ProviderSummaryGraphqlEntity';
  code: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type ProviderWalletCapabilityEntity = {
  __typename?: 'ProviderWalletCapabilityEntity';
  /** Supported wallet chains */
  chains: Array<Scalars['String']['output']>;
  /** Wallet currency */
  currency?: Maybe<Scalars['String']['output']>;
  /** Default chain */
  defaultChain?: Maybe<Scalars['String']['output']>;
  /** Whether the provider can create wallets */
  enabled: Scalars['Boolean']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** [admin-loopay-clients] Onboarding state of a client at each provider (mesta, kirafin) with the attempt history (requires OPS_COMMERCIAL) */
  adminLoopay_clientProviderOnboarding: Array<AdminLoopayClientProviderOnboarding>;
  /** [admin-loopay-treasury] Ops-account position per asset at the custody provider (read-through) */
  adminLoopay_custodyOpsVaultPosition: CustodyOpsVaultPosition;
  /** [admin-loopay-virtual-accounts] Where a customer can receive money: rails by country and currency with status and eligibility (eligible, ineligibleReason: VA_BUSINESS_ONLY | RAIL_UNDER_MAINTENANCE) (requires LOOPAY_ADMIN, LOOPAY_OPERATIONS, OPS_VA or OPS_COMMERCIAL) */
  adminLoopay_customerReceiveOptions: Array<ReceiveOptionEntity>;
  /** [admin-loopay-fees] Fee totals per operation and currency for a client over an optional period (requires LOOPAY_ADMIN or OPS_COMMERCIAL) */
  adminLoopay_feeLedgerSummary: Array<AdminFeeLedgerTotal>;
  /**
   * [admin-loopay-dispersiones] DEPRECATED (legacy rows only): fetch live provider quotes for a dispersion and persist them. v2 uses adminLoopay_getDispersionRates (live, indicative, never persisted) (requires OPS_DISPERSIONES)
   * @deprecated Dispersion v2 (spec v2.3): rates are indicative refresh-on-view with no locking; rejected for v2 rows.
   */
  adminLoopay_fetchDispersionQuote: FetchDispersionQuotePayload;
  /** [admin-loopay-availability] One availability operation; EXECUTED rows reconcile on read (requires OPS_DISPERSIONES) */
  adminLoopay_getAvailabilityOperation: AvailabilityOperationEntity;
  /** [admin-loopay-beneficiaries] Get one beneficiary across tenants by ID (requires LOOPAY_ADMIN, OPS_KYC or OPS_COMMERCIAL) */
  adminLoopay_getBeneficiary?: Maybe<AdminBeneficiaryEntity>;
  /** [admin-loopay-clients] Get a single client by id; config is masked (requires PLATFORM_ADMIN or OPS_COMMERCIAL) */
  adminLoopay_getClient: ClientGraphqlEntity;
  /** [admin-loopay-client-provider-rails] Get a single client provider rail (requires PLATFORM_ADMIN or OPS_COMMERCIAL, read-only; defaultAttributes only for PLATFORM_ADMIN/LOOPAY_ADMIN; LOOPAY_OPERATIONS does not pass) */
  adminLoopay_getClientProviderRail: ClientProviderRailGraphqlEntity;
  /** [admin-loopay-customers] Get a single customer profile by id (requires LOOPAY_ADMIN, LOOPAY_OPERATIONS, OPS_VA, OPS_COMMERCIAL, OPS_RECAUDOS or OPS_DISPERSIONES) */
  adminLoopay_getCustomer: AdminCustomerGraphqlEntity;
  /** [admin-loopay-kyc-review] Full KYC dossier for one customer, with the stored provider profile (requires OPS_KYC or OPS_COMMERCIAL; LOOPAY_OPERATIONS and LOOPAY_ADMIN pass) */
  adminLoopay_getCustomerKycData: AdminCustomerKycDetailEntity;
  /** [admin-loopay-dispersiones] Live INDICATIVE rates for a v2 dispersion, fetched on view for both covering providers (sandbox-mocked outside production; nothing is locked — spec v2.3) (requires OPS_DISPERSIONES) */
  adminLoopay_getDispersionRates: DispersionIndicativeRatesPayload;
  /** [admin-loopay-kyc-review] Presigned download URL for one KYC document (requires OPS_KYC or OPS_COMMERCIAL) */
  adminLoopay_getDocumentDownloadUrl: AdminDocumentDownloadEntity;
  /** [admin-loopay-catalog] Get provider payment rail by id (requires PLATFORM_ADMIN) */
  adminLoopay_getProviderPaymentRail: ProviderPaymentRailGraphqlEntity;
  /** [admin-loopay-provider-requirements] Presigned download URL (5 minutes) of a document attached to a provider requirement; any other document answers 404 (requires OPS_COMMERCIAL; LOOPAY_ADMIN passes) */
  adminLoopay_getProviderRequirementDocumentUrl: Scalars['String']['output'];
  /** [admin-loopay-staff-users] Get a single staff user by id (requires LOOPAY_ADMIN) */
  adminLoopay_getStaffUser: StaffUserGraphQlEntity;
  /** [admin-loopay-transactions] Get a transaction by ID with full details including provider operations (requires LOOPAY_ADMIN, LOOPAY_OPERATIONS or OPS_COMMERCIAL) */
  adminLoopay_getTransaction?: Maybe<AdminTransactionEntity>;
  /** [admin-loopay-users] Get a single user by id (requires LOOPAY_ADMIN) */
  adminLoopay_getUser: UserGraphQlEntity;
  /** [admin-loopay-virtual-accounts] Get a single virtual account by ID with relations (requires LOOPAY_ADMIN, OPS_VA or OPS_COMMERCIAL) */
  adminLoopay_getVirtualAccount?: Maybe<AdminVirtualAccountWithRelationsEntity>;
  /** [admin-loopay-wallets] Get wallet details by ID (requires LOOPAY_ADMIN or OPS_COMMERCIAL) */
  adminLoopay_getWallet: AdminWalletResponseEntity;
  /** [admin-loopay-wallets] Get configured chains and currencies for wallet creation (requires LOOPAY_ADMIN, LOOPAY_OPERATIONS, OPS_VA or OPS_COMMERCIAL) */
  adminLoopay_getWalletOptions: AdminWalletOptionsEntity;
  /** [admin-loopay-treasury] Kirafin virtual-account balances by recorded ids (read-through) */
  adminLoopay_kiraVirtualAccountBalances: Array<KiraVirtualAccountBalance>;
  /** [admin-loopay-availability] Paginated availability operations read from persisted records (requires OPS_DISPERSIONES) */
  adminLoopay_listAvailabilityOperations: PaginatedAvailabilityOperationsResponse;
  /** [admin-loopay-beneficiaries] List beneficiaries across tenants with filters (requires LOOPAY_ADMIN, OPS_KYC or OPS_COMMERCIAL) */
  adminLoopay_listBeneficiaries: PaginatedAdminBeneficiariesResponse;
  /** [admin-loopay-clients] List every client as a queue selector option (id, name, is_active only), active first then by name (requires an OPS_* role or PLATFORM_ADMIN) */
  adminLoopay_listClientOptions: Array<AdminClientOptionEntity>;
  /** [admin-loopay-client-provider-rails] List client provider rails (requires PLATFORM_ADMIN, or OPS_COMMERCIAL filtering by clientId) */
  adminLoopay_listClientProviderRails: Array<ClientProviderRailGraphqlEntity>;
  /** [admin-loopay-clients] List clients with optional filters; config is masked (requires PLATFORM_ADMIN or OPS_COMMERCIAL; LOOPAY_OPERATIONS does not pass) */
  adminLoopay_listClients: PaginatedClientsResponse;
  /** [admin-loopay-catalog] List currencies with optional filters (any staff role) */
  adminLoopay_listCurrencies: Array<CurrencyGraphqlEntity>;
  /** [admin-loopay-customers] List customer profiles with optional filters (requires LOOPAY_ADMIN, LOOPAY_OPERATIONS, OPS_VA, OPS_COMMERCIAL, OPS_RECAUDOS or OPS_DISPERSIONES) */
  adminLoopay_listCustomers: Array<AdminCustomerGraphqlEntity>;
  /** [admin-loopay-endorsements] List all local endorsements for a customer (requires LOOPAY_ADMIN, OPS_KYC or OPS_COMMERCIAL) */
  adminLoopay_listEndorsements: Array<AdminEndorsementEntity>;
  /** [admin-loopay-fees] List the fees charged to a client, newest first (requires LOOPAY_ADMIN or OPS_COMMERCIAL) */
  adminLoopay_listFeeLedger: Array<AdminFeeLedgerEntry>;
  /** [admin-loopay-fees] List fee schedule versions of a client, or the platform defaults when clientId is null (requires LOOPAY_ADMIN or OPS_COMMERCIAL) */
  adminLoopay_listFeeSchedules: Array<AdminFeeSchedule>;
  /**
   * [admin-loopay-dispersiones] DEPRECATED (legacy rows only): the persisted dispersion quote list with computed statuses. v2 rates are never persisted (requires OPS_DISPERSIONES)
   * @deprecated Dispersion v2 (spec v2.3): rates are indicative refresh-on-view with no locking; rejected for v2 rows.
   */
  adminLoopay_listFetchedDispersionQuotes: FetchDispersionQuotePayload;
  /** [admin-loopay-catalog] List operation types with optional filters (requires LOOPAY_ADMIN) */
  adminLoopay_listOperationTypes: Array<OperationTypeGraphqlEntity>;
  /** [admin-loopay-catalog] List payment rails with optional filters (any staff role) */
  adminLoopay_listPaymentRails: Array<PaymentRailGraphqlEntity>;
  /** [admin-loopay-beneficiaries] List beneficiaries waiting for manual verification (requires OPS_KYC; OPS_COMMERCIAL reads it) */
  adminLoopay_listPendingBeneficiaries: PaginatedAdminBeneficiaryQueueResponse;
  /** [admin-loopay-dispersiones] List outbound withdrawals waiting for operations (requires OPS_DISPERSIONES; OPS_COMMERCIAL reads it) */
  adminLoopay_listPendingDispersiones: PaginatedAdminDispersionesResponse;
  /** [admin-loopay-endorsements] List endorsements waiting for a manual decision (requires OPS_KYC; OPS_COMMERCIAL reads it) */
  adminLoopay_listPendingEndorsements: PaginatedAdminEndorsementQueueResponse;
  /** [admin-loopay-kyc-review] List customers waiting for a manual KYC decision (requires OPS_KYC; OPS_COMMERCIAL reads it) */
  adminLoopay_listPendingKyc: PaginatedAdminKycQueueResponse;
  /** [admin-loopay-recaudos] List inbound deposits: pending approval by default, or filtered by status (requires OPS_RECAUDOS; OPS_COMMERCIAL reads it) */
  adminLoopay_listPendingRecaudos: PaginatedAdminRecaudosResponse;
  /** [admin-loopay-virtual-accounts] List virtual accounts already linked to a provider account (requires OPS_VA or OPS_COMMERCIAL; LOOPAY_OPERATIONS and LOOPAY_ADMIN pass) */
  adminLoopay_listProviderLinkedAccounts: PaginatedAdminProviderLinkedAccountsResponse;
  /** [admin-loopay-catalog] List provider payment rails with optional filters (any staff role; config is only returned to PLATFORM_ADMIN and LOOPAY_ADMIN) */
  adminLoopay_listProviderPaymentRails: Array<ProviderPaymentRailGraphqlEntity>;
  /** [admin-loopay-provider-requirements] Provider requirements across customers, newest change first, filtered by status, provider, customer or search (requires OPS_COMMERCIAL; LOOPAY_ADMIN passes) */
  adminLoopay_listProviderRequirements: AdminProviderRequirementsPage;
  /** [admin-loopay-catalog] List providers with optional filters (any staff role; config is only returned to PLATFORM_ADMIN and LOOPAY_ADMIN) */
  adminLoopay_listProviders: Array<ProviderGraphqlEntity>;
  /** [admin-loopay-staff-users] List staff users with optional filters (requires LOOPAY_ADMIN) */
  adminLoopay_listStaffUsers: PaginatedStaffUsersResponse;
  /** [admin-loopay-catalog] List tax ID types with optional filters (requires LOOPAY_ADMIN or OPS_COMMERCIAL) */
  adminLoopay_listTaxIdTypes: Array<TaxIdTypeGraphqlEntity>;
  /** [admin-loopay-transactions] List transactions with filters (requires LOOPAY_ADMIN, LOOPAY_OPERATIONS or OPS_COMMERCIAL) */
  adminLoopay_listTransactions: PaginatedAdminTransactionsResponse;
  /** [admin-loopay-treasury] Operator work-queue of unmatched deposits (newest first, cursor paginated) */
  adminLoopay_listUnmatchedDeposits: UnmatchedDepositPage;
  /** [admin-loopay-users] List application users with optional filters (requires LOOPAY_ADMIN) */
  adminLoopay_listUsers: PaginatedUsersResponse;
  /** [admin-loopay-virtual-accounts] List open virtual-account requests (REQUESTED, OPS_APPROVED, PROVIDER_ONBOARDING) with provider and blockers (requires LOOPAY_ADMIN, LOOPAY_OPERATIONS, OPS_VA or OPS_COMMERCIAL) */
  adminLoopay_listVirtualAccountRequests: PaginatedAdminVirtualAccountRequestsResponse;
  /** [admin-loopay-virtual-accounts] List virtual accounts with filters (requires LOOPAY_ADMIN, OPS_VA or OPS_COMMERCIAL) */
  adminLoopay_listVirtualAccounts: PaginatedVirtualAccountsResponse;
  /** [admin-loopay-wallets] List wallets for a customer (requires LOOPAY_ADMIN, LOOPAY_OPERATIONS, OPS_VA or OPS_COMMERCIAL) */
  adminLoopay_listWalletsByCustomer: Array<AdminWalletResponseEntity>;
  /** [admin-loopay-treasury] Mesta merchant balances per currency (read-through) */
  adminLoopay_mestaMerchantBalances: Array<VendorMerchantBalance>;
  /** [admin-loopay-treasury] Ops-vault equation: expected (ledger terms) vs actual (custody position) and the difference */
  adminLoopay_opsVaultReconciliation: OpsVaultReconciliation;
  /** [admin-loopay] Verify admin-loopay module availability (requires LOOPAY_ADMIN) */
  adminLoopay_ping: Scalars['String']['output'];
  /** [admin-loopay-platform] Readiness matrix, one row per ACTIVE client, or only the given clientId (requires PLATFORM_ADMIN or OPS_COMMERCIAL, read-only; LOOPAY_OPERATIONS does not pass) */
  adminLoopay_platformReadiness: Array<AdminPlatformClientReadinessEntity>;
  /** [admin-loopay-provider-requirements] Counts for the backoffice badge: awaitingCustomer (REQUESTED + REJECTED), pendingReview (UPLOADED), readyToSubmit (APPROVED) (requires OPS_COMMERCIAL; LOOPAY_ADMIN passes) */
  adminLoopay_providerRequirementCounts: AdminProviderRequirementCounts;
  /** [admin-loopay-sandbox] Which providers point to a sandbox host (requires LOOPAY_ADMIN or LOOPAY_OPERATIONS) */
  adminLoopay_providerSandboxAvailability: ProviderSandboxAvailabilityEntity;
  /** [admin-loopay-treasury] Wallets set to reconciling by the custody check (sends blocked), oldest first */
  adminLoopay_reconcilingWallets: Array<ReconcilingWallet>;
  /** [auth] Health check endpoint */
  auth_hello: Scalars['String']['output'];
  /** [auth] Get current authenticated user profile including roles and permissions */
  auth_me: CurrentUser;
  /** [beneficiaries] Returns required/optional/conditional fields by rail for create beneficiary forms */
  beneficiaries_createFieldRequirements: BeneficiaryCreateFieldRequirementsEntity;
  /** [beneficiaries] Get beneficiary by ID (requires Firebase auth) */
  beneficiaries_findById: BeneficiaryEntity;
  /** [beneficiaries] List beneficiaries for customer (requires Firebase auth) */
  beneficiaries_list: Array<BeneficiaryEntity>;
  /** [client-provider-rails] Get all ClientProviderRail configurations (requires Firebase auth) */
  clientProviderRails_list: ListClientProviderRailsResponse;
  /** [client-webhooks] Verify client webhooks module availability (requires API key) */
  clientWebhooks_ping: Scalars['String']['output'];
  /** [clients] Get client by ID (admin only, requires Firebase auth) */
  clients_findById: ClientEntity;
  /** [clients] List all clients (admin only, requires Firebase auth) */
  clients_list: Array<ClientEntity>;
  /** [clients] Verify clients module availability (admin only, requires Firebase auth) */
  clients_ping: Scalars['String']['output'];
  /** [customers] Get customer by ID (requires Firebase auth) */
  customers_findById: CustomerEntity;
  /** [customers] Get the canonical KYC snapshot for a customer (requires Firebase auth) */
  customers_getKycSnapshot: CustomerKycSnapshotEntity;
  /** [customers] List all customers with pagination (requires Firebase auth) */
  customers_list: ListCustomersResponse;
  /** [customers] List customer endorsements/payment rails (requires Firebase auth) */
  customers_listEndorsements: ListEndorsementsResponse;
  /** [customers] What the providers ask of the customer to open its virtual accounts (documents, values, beneficial-owner links) with their status, oldest first (requires Firebase auth; customers see their own, staff any). */
  customers_providerRequirements: Array<ProviderRequirementEntity>;
  /** Get execution by ID (lightweight or with full data) */
  executions_findById: WorkflowExecutionEntity;
  /** Get heavy execution data (lazy load) */
  executions_getData: ExecutionDataEntity;
  /** Get all node executions for an execution (ordered) */
  executions_getNodes: NodeExecutionListResponse;
  /** List executions with filters and pagination */
  executions_list: WorkflowExecutionListResponse;
  /** Get execution count summary by status */
  executions_summary: ExecutionSummary;
  /** [customers] Get KYC verification status for a customer (requires Firebase auth) */
  getBridgeKycStatus: KycStatusEntity;
  /** [health] Health check endpoint */
  health_check: HealthCheckResponse;
  /** [quotes] Get quote by ID (requires Firebase auth) */
  quotes_findById: QuoteEntity;
  /** [quotes] Get indicative rate snapshot for a currency pair (execution FX determined at transaction time, no amount required, requires Firebase auth) */
  quotes_getIndicativeRate: IndicativeRateEntity;
  /** [quotes] Get exchange rate and fee quote (informational, requires Firebase auth) */
  quotes_getRate: QuoteEntity;
  /** [rails] Country → rail → direction (INBOUND receive / OUTBOUND send) → provider availability catalogue (requires Firebase auth) */
  rails_catalogue: RailCatalogue;
  /** [rails] List payment rails available for authenticated client (requires Firebase auth) */
  rails_list: ListRailsResponse;
  /** [tenant] Countries allowed for customer creation (`GET /api/v1/customers/allowed-countries`) (requires CLIENT_ADMIN) */
  tenant_allowedCustomerCountries: Scalars['JSON']['output'];
  /** [tenant] KYC rejection reasons of a customer (`GET /api/v1/customers/rejection-reasons/:id`) (requires CLIENT_ADMIN) */
  tenant_customerRejectionReasons: Scalars['JSON']['output'];
  /** [tenant] Beneficiary by id (`GET /api/v1/beneficiaries/:id`) (requires CLIENT_ADMIN) */
  tenant_getBeneficiary: Scalars['JSON']['output'];
  /** [tenant] Customer by id (`GET /api/v1/customers/:id`) (requires CLIENT_ADMIN) */
  tenant_getCustomer: Scalars['JSON']['output'];
  /** [tenant] Customer by the tenant external_id (`GET /api/v1/customers/external/:externalId`) (requires CLIENT_ADMIN) */
  tenant_getCustomerByExternalId: Scalars['JSON']['output'];
  /** [tenant] Quote by id (`GET /api/v1/quotes/:id`, UUID v4) (requires CLIENT_ADMIN) */
  tenant_getQuote: Scalars['JSON']['output'];
  /** [tenant] Transaction by id (`GET /api/v1/transactions/:id`) (requires CLIENT_ADMIN) */
  tenant_getTransaction: Scalars['JSON']['output'];
  /** [tenant] Wallet by id (`GET /api/v1/wallets/:id`) (requires CLIENT_ADMIN) */
  tenant_getWallet: Scalars['JSON']['output'];
  /** [tenant] Beneficiaries of a customer; `filters` = `GET /api/v1/beneficiaries` query (customer_id required, country, is_favorite) (requires CLIENT_ADMIN) */
  tenant_listBeneficiaries: Scalars['JSON']['output'];
  /** [tenant] Customer endorsements (`GET /api/v1/customers/:id/rails`); include_pending adds pending/additional_info ones with their kyc_link (requires CLIENT_ADMIN) */
  tenant_listCustomerRails: Scalars['JSON']['output'];
  /** [tenant] What the providers ask of the customer (`GET /api/v1/customers/:id/requirements`) (requires CLIENT_ADMIN) */
  tenant_listCustomerRequirements: Scalars['JSON']['output'];
  /** [tenant] List customers; `filters` = `GET /api/v1/customers` query (page, page_size, created_from, created_to) (requires CLIENT_ADMIN) */
  tenant_listCustomers: Scalars['JSON']['output'];
  /** [tenant] Payment rails available to the tenant client (`GET /api/v1/rails`) (requires CLIENT_ADMIN) */
  tenant_listRails: Scalars['JSON']['output'];
  /** [tenant] Active admins of the tenant (requires CLIENT_ADMIN) */
  tenant_listTeam: Array<TenantTeamMember>;
  /** [tenant] List transactions; `filters` = `GET /api/v1/transactions` query (snake_case only) (requires CLIENT_ADMIN) */
  tenant_listTransactions: Scalars['JSON']['output'];
  /** [tenant] Wallets of a customer (`GET /api/v1/wallets?customer_id=`); customer_id is required (400) (requires CLIENT_ADMIN) */
  tenant_listWallets: Scalars['JSON']['output'];
  /** [tenant] Webhook configurations of the tenant client, secrets masked (`GET /api/v1/webhooks`) (requires CLIENT_ADMIN) */
  tenant_listWebhooks: Scalars['JSON']['output'];
  /** [tenant] The tenant of the signed-in admin: id, name, status, API key prefix/rotation/expiry (never the secret), deployment environment, enabled rails and, under `x-act-as-client`, the acting staff member (requires CLIENT_ADMIN) */
  tenant_me: TenantMe;
  /** [tenant] Payment-link capabilities (`GET /api/v1/transactions/on-ramps/payment-links/capabilities`) (requires CLIENT_ADMIN) */
  tenant_paymentLinkCapabilities: Scalars['JSON']['output'];
  /** [tenant] Indicative exchange rate, not locked; `filters` = `GET /api/v1/quotes` query (from, to) (requires CLIENT_ADMIN) */
  tenant_quoteRate: Scalars['JSON']['output'];
  /** [tenant] Country → rail → direction → provider catalogue (`GET /api/v1/rails/catalogue`); country is ISO alpha-2 or alpha-3, omit for all (requires CLIENT_ADMIN) */
  tenant_railCatalogue: Scalars['JSON']['output'];
  /** [tenant] Rails of one country for the tenant client (`GET /api/v1/rails/country/:iso_code`, ISO 3166-1 alpha-3) (requires CLIENT_ADMIN) */
  tenant_railsByCountry: Scalars['JSON']['output'];
  /** [tenant] Where a customer can receive money; `filters` = `GET /api/v1/virtual-accounts/receive-options` query (customer_id, country) (requires CLIENT_ADMIN) */
  tenant_virtualAccountReceiveOptions: Scalars['JSON']['output'];
  /** [tenant] Chains a wallet can be created on (`GET /api/v1/wallets/available-chains`) (requires CLIENT_ADMIN) */
  tenant_walletAvailableChains: Scalars['JSON']['output'];
  /** [tenant] Wallet balance (`GET /api/v1/wallets/:id/balance`) (requires CLIENT_ADMIN) */
  tenant_walletBalance: Scalars['JSON']['output'];
  /** [tenant] Fiat deposit instructions of a wallet (`GET /api/v1/wallets/:id/deposit-instructions?customer_id=`); customer_id is required (400) (requires CLIENT_ADMIN) */
  tenant_walletDepositInstructions: Scalars['JSON']['output'];
  /** [tenant] Transactions of a wallet; `filters` = `GET /api/v1/wallets/:id/transactions` query (snake_case only) (requires CLIENT_ADMIN) */
  tenant_walletTransactions: Scalars['JSON']['output'];
  /** [tenant] Webhook event types that can be subscribed to (`GET /api/v1/webhooks/events`) (requires CLIENT_ADMIN) */
  tenant_webhookEventTypes: Scalars['JSON']['output'];
  /** [tenant] Delivery log detail with request payload and response body (`GET /api/v1/webhooks/logs/:id`, the `payload.id` of the delivery) (requires CLIENT_ADMIN) */
  tenant_webhookLog: Scalars['JSON']['output'];
  /** [tenant] Delivery logs; `filters` = `GET /api/v1/webhooks/logs` query (eventType, success, from, to, page, page_size) (requires CLIENT_ADMIN) */
  tenant_webhookLogs: Scalars['JSON']['output'];
  /** [transactions] Which transfers the client app may offer: P2P between wallets of the same client, and external crypto transfers (false in production). */
  transactions_capabilities: TransactionCapabilitiesEntity;
  /** [transactions] List all transactions with pagination and filters (requires Firebase auth) */
  transactions_list: ListTransactionsResponse;
  /** [transactions] Get payment link capabilities (supported currencies and payment methods) */
  transactions_paymentLinkCapabilities: PaymentLinkCapabilitiesEntity;
  /** [virtualAccounts] Where the customer can receive money: rails by country and currency with their status (available, requested, active, rejected) and eligibility (eligible, ineligibleReason: VA_BUSINESS_ONLY | RAIL_UNDER_MAINTENANCE) (requires Firebase auth). */
  virtualAccounts_receiveOptions: Array<ReceiveOptionEntity>;
  /** [wallets] Get available chains for wallet creation (requires Firebase auth) */
  wallets_availableChains: AvailableChainsResponse;
  /** [wallets] Get deposit instructions and virtual account details (requires Firebase auth) */
  wallets_depositInstructions: DepositInstructionsResponse;
  /** [wallets] Get wallet by ID (requires Firebase auth) */
  wallets_findById: WalletEntity;
  /** [wallets] Get wallet balance (requires Firebase auth) */
  wallets_getBalance: WalletBalanceEntity;
  /** [wallets] List all wallets for a specific customer (requires Firebase auth) */
  wallets_listByCustomer: ListWalletsResponse;
  /** [wallets] Get paginated list of transactions for a wallet (requires Firebase auth) */
  wallets_transactions: WalletTransactionListResponse;
  /** [workflow] List all tags for the current client */
  workflowTags_list: Array<TagEntity>;
  /** [workflow] Get a single workflow by ID */
  workflows_findById: WorkflowEntity;
  /** [workflow] List version history for a workflow of the current client */
  workflows_history: WorkflowHistoryListResponse;
  /** [workflow] List workflows with filters and pagination */
  workflows_list: WorkflowListResponse;
  /** [workflow] Compare two workflow versions of the current client's workflows; versions of other clients are reported as not found */
  workflows_versionDiff: WorkflowVersionDiff;
};


export type QueryAdminLoopay_ClientProviderOnboardingArgs = {
  clientId: Scalars['String']['input'];
};


export type QueryAdminLoopay_CustomerReceiveOptionsArgs = {
  country?: InputMaybe<Scalars['String']['input']>;
  customerId: Scalars['String']['input'];
};


export type QueryAdminLoopay_FeeLedgerSummaryArgs = {
  clientId: Scalars['ID']['input'];
  from?: InputMaybe<Scalars['DateTime']['input']>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryAdminLoopay_FetchDispersionQuoteArgs = {
  dispersionId: Scalars['ID']['input'];
};


export type QueryAdminLoopay_GetAvailabilityOperationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAdminLoopay_GetBeneficiaryArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminLoopay_GetClientArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminLoopay_GetClientProviderRailArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminLoopay_GetCustomerArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminLoopay_GetCustomerKycDataArgs = {
  customerId: Scalars['ID']['input'];
};


export type QueryAdminLoopay_GetDispersionRatesArgs = {
  dispersionId: Scalars['ID']['input'];
};


export type QueryAdminLoopay_GetDocumentDownloadUrlArgs = {
  documentId: Scalars['ID']['input'];
};


export type QueryAdminLoopay_GetProviderPaymentRailArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminLoopay_GetProviderRequirementDocumentUrlArgs = {
  documentId: Scalars['String']['input'];
};


export type QueryAdminLoopay_GetStaffUserArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminLoopay_GetTransactionArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminLoopay_GetUserArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminLoopay_GetVirtualAccountArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminLoopay_GetWalletArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminLoopay_GetWalletOptionsArgs = {
  input: AdminWalletOptionsInput;
};


export type QueryAdminLoopay_ListAvailabilityOperationsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminLoopay_ListBeneficiariesArgs = {
  pagination?: InputMaybe<PaginationInput>;
  where?: InputMaybe<AdminBeneficiaryFiltersInput>;
};


export type QueryAdminLoopay_ListClientProviderRailsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<ClientProviderRailFiltersInput>;
};


export type QueryAdminLoopay_ListClientsArgs = {
  pagination?: InputMaybe<PaginationInput>;
  where?: InputMaybe<ClientFiltersInput>;
};


export type QueryAdminLoopay_ListCurrenciesArgs = {
  filters?: InputMaybe<CurrencyFiltersInput>;
};


export type QueryAdminLoopay_ListCustomersArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<AdminCustomerFiltersInput>;
};


export type QueryAdminLoopay_ListEndorsementsArgs = {
  customerId: Scalars['ID']['input'];
};


export type QueryAdminLoopay_ListFeeLedgerArgs = {
  clientId: Scalars['ID']['input'];
  from?: InputMaybe<Scalars['DateTime']['input']>;
  operation?: InputMaybe<FeeOperation>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryAdminLoopay_ListFeeSchedulesArgs = {
  clientId?: InputMaybe<Scalars['ID']['input']>;
  includeInactive?: Scalars['Boolean']['input'];
};


export type QueryAdminLoopay_ListFetchedDispersionQuotesArgs = {
  dispersionId: Scalars['ID']['input'];
};


export type QueryAdminLoopay_ListOperationTypesArgs = {
  filters?: InputMaybe<OperationTypeFiltersInput>;
};


export type QueryAdminLoopay_ListPaymentRailsArgs = {
  filters?: InputMaybe<PaymentRailFiltersInput>;
};


export type QueryAdminLoopay_ListPendingBeneficiariesArgs = {
  filter?: InputMaybe<BeneficiaryQueueFiltersInput>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminLoopay_ListPendingDispersionesArgs = {
  filter?: InputMaybe<DispersionQueueFiltersInput>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminLoopay_ListPendingEndorsementsArgs = {
  filter?: InputMaybe<EndorsementQueueFiltersInput>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminLoopay_ListPendingKycArgs = {
  filter?: InputMaybe<KycQueueFiltersInput>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminLoopay_ListPendingRecaudosArgs = {
  filter?: InputMaybe<RecaudoQueueFiltersInput>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminLoopay_ListProviderLinkedAccountsArgs = {
  customerId?: InputMaybe<Scalars['ID']['input']>;
  pagination?: InputMaybe<PaginationInput>;
  providerCode?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminLoopay_ListProviderPaymentRailsArgs = {
  filters?: InputMaybe<ProviderPaymentRailFiltersInput>;
};


export type QueryAdminLoopay_ListProviderRequirementsArgs = {
  filter?: InputMaybe<ProviderRequirementFilterInput>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAdminLoopay_ListProvidersArgs = {
  filters?: InputMaybe<ProviderFiltersInput>;
};


export type QueryAdminLoopay_ListStaffUsersArgs = {
  pagination?: InputMaybe<PaginationInput>;
  where?: InputMaybe<StaffUserFiltersInput>;
};


export type QueryAdminLoopay_ListTaxIdTypesArgs = {
  filters?: InputMaybe<TaxIdTypeFiltersInput>;
};


export type QueryAdminLoopay_ListTransactionsArgs = {
  pagination?: InputMaybe<PaginationInput>;
  where?: InputMaybe<AdminTransactionFiltersInput>;
};


export type QueryAdminLoopay_ListUnmatchedDepositsArgs = {
  before?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryAdminLoopay_ListUsersArgs = {
  pagination?: InputMaybe<PaginationInput>;
  where?: InputMaybe<UserFiltersInput>;
};


export type QueryAdminLoopay_ListVirtualAccountRequestsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminLoopay_ListVirtualAccountsArgs = {
  pagination?: InputMaybe<PaginationInput>;
  where?: InputMaybe<VirtualAccountFiltersInput>;
};


export type QueryAdminLoopay_ListWalletsByCustomerArgs = {
  customerId: Scalars['String']['input'];
};


export type QueryAdminLoopay_PlatformReadinessArgs = {
  clientId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryBeneficiaries_FindByIdArgs = {
  customerId: Scalars['String']['input'];
  id: Scalars['String']['input'];
};


export type QueryBeneficiaries_ListArgs = {
  customerId: Scalars['String']['input'];
};


export type QueryClientProviderRails_ListArgs = {
  input?: InputMaybe<ListClientProviderRailsInput>;
};


export type QueryClients_FindByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryCustomers_FindByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryCustomers_GetKycSnapshotArgs = {
  customerId: Scalars['String']['input'];
};


export type QueryCustomers_ListArgs = {
  input?: InputMaybe<ListCustomersInput>;
};


export type QueryCustomers_ListEndorsementsArgs = {
  id: Scalars['String']['input'];
};


export type QueryCustomers_ProviderRequirementsArgs = {
  customerId: Scalars['String']['input'];
};


export type QueryExecutions_FindByIdArgs = {
  id: Scalars['String']['input'];
  include_data?: Scalars['Boolean']['input'];
};


export type QueryExecutions_GetDataArgs = {
  execution_id: Scalars['String']['input'];
};


export type QueryExecutions_GetNodesArgs = {
  execution_id: Scalars['String']['input'];
};


export type QueryExecutions_ListArgs = {
  filter?: InputMaybe<ExecutionFilterInput>;
};


export type QueryExecutions_SummaryArgs = {
  workflow_id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetBridgeKycStatusArgs = {
  customerId: Scalars['String']['input'];
};


export type QueryQuotes_FindByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryQuotes_GetIndicativeRateArgs = {
  input: GetIndicativeRateInput;
};


export type QueryQuotes_GetRateArgs = {
  input: GetQuoteInput;
};


export type QueryRails_CatalogueArgs = {
  country?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTenant_CustomerRejectionReasonsArgs = {
  id: Scalars['String']['input'];
};


export type QueryTenant_GetBeneficiaryArgs = {
  id: Scalars['String']['input'];
};


export type QueryTenant_GetCustomerArgs = {
  id: Scalars['String']['input'];
};


export type QueryTenant_GetCustomerByExternalIdArgs = {
  external_id: Scalars['String']['input'];
};


export type QueryTenant_GetQuoteArgs = {
  id: Scalars['String']['input'];
};


export type QueryTenant_GetTransactionArgs = {
  id: Scalars['String']['input'];
};


export type QueryTenant_GetWalletArgs = {
  id: Scalars['String']['input'];
};


export type QueryTenant_ListBeneficiariesArgs = {
  filters?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryTenant_ListCustomerRailsArgs = {
  id: Scalars['String']['input'];
  include_pending?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryTenant_ListCustomerRequirementsArgs = {
  id: Scalars['String']['input'];
};


export type QueryTenant_ListCustomersArgs = {
  filters?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryTenant_ListTransactionsArgs = {
  filters?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryTenant_ListWalletsArgs = {
  customer_id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTenant_QuoteRateArgs = {
  filters: Scalars['JSONObject']['input'];
};


export type QueryTenant_RailCatalogueArgs = {
  country?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTenant_RailsByCountryArgs = {
  iso_code: Scalars['String']['input'];
};


export type QueryTenant_VirtualAccountReceiveOptionsArgs = {
  filters: Scalars['JSONObject']['input'];
};


export type QueryTenant_WalletBalanceArgs = {
  id: Scalars['String']['input'];
};


export type QueryTenant_WalletDepositInstructionsArgs = {
  customer_id?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
};


export type QueryTenant_WalletTransactionsArgs = {
  filters?: InputMaybe<Scalars['JSONObject']['input']>;
  id: Scalars['String']['input'];
};


export type QueryTenant_WebhookLogArgs = {
  id: Scalars['String']['input'];
};


export type QueryTenant_WebhookLogsArgs = {
  filters?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryTransactions_ListArgs = {
  input?: InputMaybe<ListTransactionsInput>;
};


export type QueryVirtualAccounts_ReceiveOptionsArgs = {
  country?: InputMaybe<Scalars['String']['input']>;
  customerId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWallets_DepositInstructionsArgs = {
  customerId: Scalars['String']['input'];
  walletId: Scalars['String']['input'];
};


export type QueryWallets_FindByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryWallets_GetBalanceArgs = {
  id: Scalars['String']['input'];
};


export type QueryWallets_ListByCustomerArgs = {
  customerId: Scalars['String']['input'];
};


export type QueryWallets_TransactionsArgs = {
  filters?: InputMaybe<TransactionListFiltersInput>;
  id: Scalars['String']['input'];
};


export type QueryWorkflows_FindByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryWorkflows_HistoryArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  workflow_id: Scalars['String']['input'];
};


export type QueryWorkflows_ListArgs = {
  filter?: InputMaybe<WorkflowFilterInput>;
};


export type QueryWorkflows_VersionDiffArgs = {
  from_version_id: Scalars['String']['input'];
  to_version_id: Scalars['String']['input'];
};

export type QuoteEntity = {
  __typename?: 'QuoteEntity';
  /** Creation timestamp */
  created_at: Scalars['String']['output'];
  /** Expiration timestamp */
  expires_at?: Maybe<Scalars['String']['output']>;
  /** Fee amount */
  fee?: Maybe<Scalars['String']['output']>;
  /** Source amount */
  from_amount: Scalars['String']['output'];
  /** Source currency */
  from_currency: Scalars['String']['output'];
  /** Quote ID */
  id: Scalars['String']['output'];
  /** Exchange rate */
  rate: Scalars['String']['output'];
  /** Destination amount */
  to_amount: Scalars['String']['output'];
  /** Destination currency */
  to_currency: Scalars['String']['output'];
};

export type RailCatalogue = {
  __typename?: 'RailCatalogue';
  countries: Array<RailCatalogueCountry>;
};

export type RailCatalogueCountry = {
  __typename?: 'RailCatalogueCountry';
  /** ISO 3166-1 alpha-2 */
  country: Scalars['String']['output'];
  rails: Array<RailCatalogueRail>;
};

export type RailCatalogueProvider = {
  __typename?: 'RailCatalogueProvider';
  /** Usable right now (seeded and active; in production also configured) */
  available: Scalars['Boolean']['output'];
  /** Provider code (mesta | kirafin) */
  code: Scalars['String']['output'];
  /** INBOUND = receive (collections), OUTBOUND = send (payouts) */
  directions: Array<Scalars['String']['output']>;
};

export type RailCatalogueRail = {
  __typename?: 'RailCatalogueRail';
  /** A beneficiary (payout destination) can be created on it */
  beneficiary_supported: Scalars['Boolean']['output'];
  /** payment_rail.code */
  code: Scalars['String']['output'];
  currency: Scalars['String']['output'];
  /** Union of the provider directions */
  directions: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  providers: Array<RailCatalogueProvider>;
};

export type RailEntity = {
  __typename?: 'RailEntity';
  /** Countries supported by this rail. SEPA exposes the full allowlist; other rails default to their configured country when available. */
  available_countries?: Maybe<Array<Scalars['String']['output']>>;
  /** Payment rail code */
  code: Scalars['String']['output'];
  /** Country code (ISO 3166-1 alpha-3) */
  country?: Maybe<Scalars['String']['output']>;
  /** Currency code (ISO 4217) */
  currency: Scalars['String']['output'];
  /** Description */
  description?: Maybe<Scalars['String']['output']>;
  /** Capabilities enabled for this rail based on active client/provider configuration */
  enabled_capabilities: Array<Scalars['String']['output']>;
  /** Payment rail id */
  id: Scalars['String']['output'];
  /** Whether the rail is assignable for the authenticated client */
  is_assignable: Scalars['Boolean']['output'];
  /** Resolved limits/topes for this client-provider-rail from client configuration */
  limits?: Maybe<RailLimitsGraphQlEntity>;
  /** Maintenance notice shown when the rail is temporarily unavailable. Null when the rail is operational. */
  maintenance_notice?: Maybe<Scalars['String']['output']>;
  /** Payment rail name */
  name: Scalars['String']['output'];
  /** Rail asset class used by clients to group fiat and crypto rails */
  type: Scalars['String']['output'];
};

export type RailFeeTotal = {
  __typename?: 'RailFeeTotal';
  /** fee_ledger_entry rows */
  entries: Scalars['Int']['output'];
  /** Decimal-string sum of fee_amount */
  feesCollected: Scalars['String']['output'];
  /** Fee operation (DEPOSIT, P2P, ...) */
  operation: Scalars['String']['output'];
  /** payment_rail code */
  railCode?: Maybe<Scalars['String']['output']>;
};

export type RailLimitsGraphQlEntity = {
  __typename?: 'RailLimitsGraphQlEntity';
  /** Daily transaction limit for this rail */
  daily_limit?: Maybe<Scalars['Float']['output']>;
  /** Maximum transaction amount for this rail */
  max_amount?: Maybe<Scalars['Float']['output']>;
  /** Minimum transaction amount for this rail */
  min_amount?: Maybe<Scalars['Float']['output']>;
  /** Policy source used to resolve limits */
  source: Scalars['String']['output'];
};

/** [admin-loopay-recaudos] Filters for the pending-recaudo queue */
export type RecaudoQueueFiltersInput = {
  clientId?: InputMaybe<Scalars['ID']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  customerId?: InputMaybe<Scalars['ID']['input']>;
  providerCode?: InputMaybe<Scalars['String']['input']>;
  /** Global search (case-insensitive, ANDed with the other filters). Matches customer email, reference code, client name, currency, provider code, provider event id, source, an exact amount, and a transaction/wallet id (full or first characters). Blank is ignored. Max 100 characters. */
  search?: InputMaybe<Scalars['String']['input']>;
  /** Statuses to list: 'PENDING' | 'COMPLETED' | 'REJECTED' | 'FAILED'. Omitted or empty keeps the pending-only queue. */
  statuses?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ReceiveOptionEntity = {
  __typename?: 'ReceiveOptionEntity';
  blockers: Array<VaBlockerEntity>;
  /** ISO 3166-1 alpha-2 country */
  country: Scalars['String']['output'];
  /** ISO 3166-1 alpha-3 country */
  countryIso3: Scalars['String']['output'];
  currency: Scalars['String']['output'];
  /** Whether the customer can request this option. Always true once requested or active. */
  eligible: Scalars['Boolean']['output'];
  /** Why the option is not eligible: VA_BUSINESS_ONLY (virtual accounts are for business customers, including sole proprietorships) or RAIL_UNDER_MAINTENANCE. Null when eligible. */
  ineligibleReason?: Maybe<Scalars['String']['output']>;
  /** Primary provider; operations choose the final route when approving */
  provider: Scalars['String']['output'];
  providers: Array<Scalars['String']['output']>;
  railCode: Scalars['String']['output'];
  railName: Scalars['String']['output'];
  /** Review reason when the request ended rejected */
  reason?: Maybe<Scalars['String']['output']>;
  /** Request (endorsement) id once requested */
  requestId?: Maybe<Scalars['String']['output']>;
  /** available | requested | active | rejected. `available` can be requested; `requested` is in review or provider onboarding; `active` already has a virtual account; `rejected` ended without one. */
  status: Scalars['String']['output'];
  /** Lifecycle state: REQUESTED, PROVIDER_ONBOARDING, ... */
  vaRequestState?: Maybe<Scalars['String']['output']>;
  virtualAccountId?: Maybe<Scalars['String']['output']>;
};

export type ReconcilingWallet = {
  __typename?: 'ReconcilingWallet';
  currency: Scalars['String']['output'];
  /** cachedBalance now */
  currentLedgerBalance: Scalars['String']['output'];
  custodyBalance?: Maybe<Scalars['String']['output']>;
  customerId: Scalars['String']['output'];
  /** Negative: custody short; positive: custody surplus */
  drift?: Maybe<Scalars['String']['output']>;
  /** ledger + held outbound + pending P2P fee transfers */
  expectedBalance?: Maybe<Scalars['String']['output']>;
  flaggedAt?: Maybe<Scalars['String']['output']>;
  heldOutbound?: Maybe<Scalars['String']['output']>;
  inFlightCredits?: Maybe<Scalars['String']['output']>;
  /** Ledger balance at the check (last balance shown) */
  ledgerBalance?: Maybe<Scalars['String']['output']>;
  pendingFeeTransfers?: Maybe<Scalars['String']['output']>;
  triggerTransactionId?: Maybe<Scalars['String']['output']>;
  /** Custody transfer whose completion ran the check */
  triggerTransferId?: Maybe<Scalars['String']['output']>;
  walletId: Scalars['String']['output'];
};

export type RefreshKycSnapshotInput = {
  customer_id: Scalars['String']['input'];
};

export type RegisterUserInput = {
  /** Company or business name */
  company?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  policy?: InputMaybe<Scalars['Boolean']['input']>;
};

export type RegistrationRequired = {
  __typename?: 'RegistrationRequired';
  /** Valid Firebase JWT token */
  access_token: Scalars['String']['output'];
  /** User information available from Firebase */
  firebase_user: FirebaseUserInfo;
  /** Indicates the user must complete registration in this system */
  requires_registration: Scalars['Boolean']['output'];
};

export type RegistrationResult = {
  __typename?: 'RegistrationResult';
  /** Firebase authentication UID */
  auth_uid: Scalars['String']['output'];
  /** Associated customer profile ID */
  customer_profile_id?: Maybe<Scalars['String']['output']>;
  /** User email address */
  email: Scalars['String']['output'];
  /** Unique user identifier */
  id: Scalars['String']['output'];
  /** KYC verification link URL */
  kyc_link?: Maybe<Scalars['String']['output']>;
  /** Current KYC status */
  kyc_status?: Maybe<Scalars['String']['output']>;
  /** Persisted role of the new account. Public registration always persists the CLIENT_USER role; CLIENT_ADMIN is granted only through staff/admin paths. */
  role: Scalars['String']['output'];
};

/** [admin-loopay-dispersiones] Rejection payload */
export type RejectDispersionInput = {
  reason: Scalars['String']['input'];
};

/** [admin-loopay-recaudos] Rejection payload */
export type RejectRecaudoInput = {
  reason: Scalars['String']['input'];
};

/** [admin-loopay-virtual-accounts] Closes a blocked virtual-account request with the account the provider already opened (S22 repair) */
export type RepairVirtualAccountRequestInput = {
  /** Bank coordinates, only used when the provider returns none (needs confirmManualBankDetails) */
  bankDetails?: InputMaybe<Scalars['JSON']['input']>;
  /** Second confirmation that the typed bankDetails are correct (required when the provider returns none) */
  confirmManualBankDetails?: InputMaybe<Scalars['Boolean']['input']>;
  /** Endorsement of the blocked request */
  endorsementId: Scalars['String']['input'];
  /** Account id in the provider system; its bank details are read from the provider */
  providerAccountId: Scalars['String']['input'];
  /** Why the request is repaired by hand (audited) */
  reason: Scalars['String']['input'];
};

/** [admin-loopay-kyc-review] What the customer still has to provide */
export type RequestKycAdditionalInfoInput = {
  reason: Scalars['String']['input'];
};

export type RequestVirtualAccountInput = {
  /** Country to receive in (ISO 3166-1 alpha-2, alpha-3 accepted), e.g. MX */
  country: Scalars['String']['input'];
  /** Currency to receive, e.g. MXN */
  currency: Scalars['String']['input'];
  /** Customer to request for. Defaults to the signed-in customer; only staff may pass another customer. */
  customerId?: InputMaybe<Scalars['String']['input']>;
  /** Rail code from virtualAccounts_receiveOptions, e.g. spei, ach, sepa */
  railCode: Scalars['String']['input'];
};

export type RequestVirtualAccountResponse = {
  __typename?: 'RequestVirtualAccountResponse';
  /** False when an existing request or virtual account was returned (idempotent) */
  created: Scalars['Boolean']['output'];
  request: ReceiveOptionEntity;
};

/** [customers] One file of a requirement answer: a base64 data URI (application/pdf, image/png or image/jpeg, 10 MB max) */
export type RequirementDocumentInput = {
  /** Base64 data URI: data:<mimeType>;base64,<payload> */
  file: Scalars['String']['input'];
  fileName: Scalars['String']['input'];
  /** application/pdf, image/png or image/jpeg */
  mimeType: Scalars['String']['input'];
};

export type ResolvedDefaultWalletEntity = {
  __typename?: 'ResolvedDefaultWalletEntity';
  /** Default wallet blockchain chain */
  chain: Scalars['String']['output'];
  /** Default wallet currency code */
  currency: Scalars['String']['output'];
};

/** [admin-loopay-dispersiones] #413 N2: retry of a blocked or unknown placement or funding */
export type RetryDispersionFundingInput = {
  /** Required (true) to re-place a Mesta placement whose outcome is UNKNOWN: ops looked the order up at Mesta and none exists (audited) */
  confirmedNoOrderAtMesta?: InputMaybe<Scalars['Boolean']['input']>;
  /** F1: the id of the Mesta order ops found (by the customer reference) for a placement whose outcome is UNKNOWN: the order is read at Mesta, checked to belong to this withdrawal, adopted (never re-sent) and funded if it waits for funds (audited). Never together with confirmedNoOrderAtMesta */
  mestaOrderId?: InputMaybe<Scalars['String']['input']>;
};

export type RetryKycInput = {
  /** Account purpose */
  account_purpose?: InputMaybe<Scalars['String']['input']>;
  /** Whether the customer acts as an intermediary */
  acting_as_intermediary?: InputMaybe<Scalars['Boolean']['input']>;
  /** Customer address */
  address?: InputMaybe<CustomerAddressInput>;
  /** Address line 1 */
  address_line_1?: InputMaybe<Scalars['String']['input']>;
  /** Associated persons (UBOs) */
  associated_persons?: InputMaybe<Array<AssociatedPersonInput>>;
  /** Birth date */
  birth_date?: InputMaybe<Scalars['String']['input']>;
  /** Account purpose for the business (business-specific values) */
  business_account_purpose?: InputMaybe<Scalars['String']['input']>;
  /** Business description */
  business_description?: InputMaybe<Scalars['String']['input']>;
  /** Business industry codes (NAICS) */
  business_industry?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Official registered business legal name */
  business_legal_name?: InputMaybe<Scalars['String']['input']>;
  /** Business legal or trade name. Required when customer_type is "business". Maximum 100 characters. */
  business_name?: InputMaybe<Scalars['String']['input']>;
  /** Source of funds for the business (business-specific values) */
  business_source_of_funds?: InputMaybe<Scalars['String']['input']>;
  /** Business type (corporation, llc, partnership, etc.) */
  business_type?: InputMaybe<Scalars['String']['input']>;
  /** City */
  city?: InputMaybe<Scalars['String']['input']>;
  /** Compliance screening explanation */
  compliance_screening_explanation?: InputMaybe<Scalars['String']['input']>;
  /** Whether business conducts money services */
  conducts_money_services?: InputMaybe<Scalars['Boolean']['input']>;
  /** Description of the money services the business conducts */
  conducts_money_services_description?: InputMaybe<Scalars['String']['input']>;
  /** Whether business conducts money services using Bridge */
  conducts_money_services_using_bridge?: InputMaybe<Scalars['Boolean']['input']>;
  /** Country code */
  country?: InputMaybe<Scalars['String']['input']>;
  customer_id: Scalars['String']['input'];
  /** Customer type. Defaults to "individual". Business is currently supported only with kyc_method="kyc_link". */
  customer_type?: InputMaybe<Scalars['String']['input']>;
  /** Date of birth (legacy alias for birth_date) */
  date_of_birth?: InputMaybe<Scalars['String']['input']>;
  /** Supporting documents */
  documents?: InputMaybe<Array<CustomerDocumentInput>>;
  /** Customer email */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Employment status */
  employment_status?: InputMaybe<Scalars['String']['input']>;
  endorsement?: InputMaybe<Scalars['String']['input']>;
  /** Requested customer endorsements */
  endorsements?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Estimated annual revenue in USD. Valid bands: 0_99999, 100000_999999, 1000000_9999999, 10000000_49999999, 50000000_249999999, 250000000_plus */
  estimated_annual_revenue_usd?: InputMaybe<Scalars['String']['input']>;
  /** Expected monthly payment volume in USD */
  expected_monthly_payments_usd?: InputMaybe<Scalars['String']['input']>;
  /** External customer ID (auto-generated if not provided) */
  external_id?: InputMaybe<Scalars['String']['input']>;
  /** First name. Required for individual customers. */
  first_name?: InputMaybe<Scalars['String']['input']>;
  /** Whether the business has at least one intermediate legal entity owner with 25% or more ownership */
  has_material_intermediary_ownership?: InputMaybe<Scalars['Boolean']['input']>;
  /** High risk activities (enum of KYC-defined options) */
  high_risk_activities?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Explanation for high risk activities selection */
  high_risk_activities_explanation?: InputMaybe<Scalars['String']['input']>;
  /** Identifying information documents */
  identifying_information?: InputMaybe<Array<CustomerIdentifyingInformationInput>>;
  /** Business incorporation date */
  incorporation_date?: InputMaybe<Scalars['String']['input']>;
  /** Whether the business is a DAO */
  is_dao?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the business is a financial institution (virtual-account providers). */
  is_financial_institution?: InputMaybe<Scalars['Boolean']['input']>;
  /** KYC method */
  kyc_method?: InputMaybe<Scalars['String']['input']>;
  /** KYC provider override */
  kyc_provider?: InputMaybe<Scalars['String']['input']>;
  /** Last name. Required for individual customers. */
  last_name?: InputMaybe<Scalars['String']['input']>;
  /** Middle name */
  middle_name?: InputMaybe<Scalars['String']['input']>;
  /** Customer most recent occupation */
  most_recent_occupation?: InputMaybe<Scalars['String']['input']>;
  /** All nationalities (ISO 3166-1 alpha-3 codes) */
  nationalities?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Nationality */
  nationality?: InputMaybe<Scalars['String']['input']>;
  /** Number of employees range for virtual-account providers. One of: 1, 2-10, 11-50, 51-200, 201-1000, 1000+, unknown (legacy 201-500 and 501+ are still accepted). */
  number_of_employees?: InputMaybe<Scalars['String']['input']>;
  /** Whether business operates in prohibited countries */
  operates_in_prohibited_countries?: InputMaybe<Scalars['Boolean']['input']>;
  /** Beneficial ownership threshold for the submitted associated persons. Integer 5-25 (provider default 25), sent as a string */
  ownership_threshold?: InputMaybe<Scalars['String']['input']>;
  /** Phone number */
  phone?: InputMaybe<Scalars['String']['input']>;
  /** Physical address (for business customers) */
  physical_address?: InputMaybe<CustomerAddressInput>;
  /** Physical address city */
  physical_address_city?: InputMaybe<Scalars['String']['input']>;
  /** Physical address country */
  physical_address_country?: InputMaybe<Scalars['String']['input']>;
  /** Physical address line 1 */
  physical_address_line_1?: InputMaybe<Scalars['String']['input']>;
  /** Physical address line 2 */
  physical_address_line_2?: InputMaybe<Scalars['String']['input']>;
  /** Physical address postal code */
  physical_address_postal_code?: InputMaybe<Scalars['String']['input']>;
  /** Physical address state */
  physical_address_state?: InputMaybe<Scalars['String']['input']>;
  /** Place of birth */
  place_of_birth?: InputMaybe<CustomerPlaceOfBirthInput>;
  /** Postal code */
  postal_code?: InputMaybe<Scalars['String']['input']>;
  /** Primary website */
  primary_website?: InputMaybe<Scalars['String']['input']>;
  redirect_uri?: InputMaybe<Scalars['String']['input']>;
  /** Registered address (for business customers) */
  registered_address?: InputMaybe<CustomerAddressInput>;
  /** Registered address city */
  registered_address_city?: InputMaybe<Scalars['String']['input']>;
  /** Registered address country */
  registered_address_country?: InputMaybe<Scalars['String']['input']>;
  /** Registered address line 1 */
  registered_address_line_1?: InputMaybe<Scalars['String']['input']>;
  /** Registered address line 2 */
  registered_address_line_2?: InputMaybe<Scalars['String']['input']>;
  /** Registered address postal code */
  registered_address_postal_code?: InputMaybe<Scalars['String']['input']>;
  /** Registered address state */
  registered_address_state?: InputMaybe<Scalars['String']['input']>;
  /** Company registration number for virtual-account providers (Mesta identificationNumber). Defaults to the tax id when omitted (in Colombia the NIT is both). */
  registration_number?: InputMaybe<Scalars['String']['input']>;
  /** Top-level selfies field. Send exactly one selfie image as a base64 data URI for direct API KYC */
  selfies?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Signed agreement ID */
  signed_agreement_id?: InputMaybe<Scalars['String']['input']>;
  /** Source of funds */
  source_of_funds?: InputMaybe<Scalars['String']['input']>;
  /** Source of funds description */
  source_of_funds_description?: InputMaybe<Scalars['String']['input']>;
  /** State */
  state?: InputMaybe<Scalars['String']['input']>;
  /** Tax ID */
  tax_id?: InputMaybe<Scalars['String']['input']>;
  /** Country code (ISO 3166-1 alpha-3) where the tax ID was issued */
  tax_id_issuing_country?: InputMaybe<Scalars['String']['input']>;
  /** Tax ID type */
  tax_id_type?: InputMaybe<Scalars['String']['input']>;
  /** Why the business has no website (required by Mesta when primary_website is empty). */
  website_absence_reason?: InputMaybe<Scalars['String']['input']>;
};

/** [admin-loopay-recaudos] Reversal payload */
export type ReverseRecaudoInput = {
  /** Raw provider event that triggered the reversal */
  providerEvent?: InputMaybe<Scalars['JSON']['input']>;
  reason: Scalars['String']['input'];
};

/** [admin-loopay-beneficiaries] Manual beneficiary decision */
export type ReviewBeneficiaryInput = {
  decision: AdminBeneficiaryReviewDecision;
  /** Required when the decision is REJECTED */
  reason?: InputMaybe<Scalars['String']['input']>;
};

/** [admin-loopay-endorsements] Manual endorsement decision */
export type ReviewEndorsementInput = {
  decision: AdminEndorsementReviewDecision;
  /** Internal ops note */
  note?: InputMaybe<Scalars['String']['input']>;
  /** Optional. The provider comes from the enabled client rail; a different code is refused with 422 PROVIDER_NOT_RAIL_PROVIDER. Approving a virtual-account request (or sending a code) for a rail the client has not enabled is 422 RAIL_PROVIDER_NOT_CONFIGURED */
  providerCode?: InputMaybe<Scalars['String']['input']>;
  /** Required for REJECTED and ADDITIONAL_INFO_REQUIRED decisions */
  reason?: InputMaybe<Scalars['String']['input']>;
};

/** [admin-loopay-kyc-review] Manual KYC decision payload */
export type ReviewKycInput = {
  decision: AdminReviewDecision;
  /** Required when the decision is REJECTED */
  reason?: InputMaybe<Scalars['String']['input']>;
};

/** [admin-loopay-provider-requirements] Approve or reject an uploaded answer (reason required on REJECT) */
export type ReviewProviderRequirementInput = {
  decision: ProviderRequirementDecision;
  reason?: InputMaybe<Scalars['String']['input']>;
  requirementId: Scalars['String']['input'];
};

/** Outcome a provider sandbox mock is told to produce */
export enum SandboxProviderOutcome {
  Approved = 'APPROVED',
  Rejected = 'REJECTED'
}

/** [admin-loopay-sandbox] Acknowledgement of a provider sandbox simulation; the final state arrives through the normal provider webhook */
export type SandboxSimulationResultEntity = {
  __typename?: 'SandboxSimulationResultEntity';
  accepted: Scalars['Boolean']['output'];
  outcome?: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  providerRequestId?: Maybe<Scalars['String']['output']>;
};

/** [admin-loopay-dispersiones] v2 provider selection — an INDICATIVE annotation for manual execution (spec v2.3: no quote locking) */
export type SelectDispersionProviderInput = {
  note?: InputMaybe<Scalars['String']['input']>;
  /** Selected FX provider (kirafin | mesta) */
  provider: Scalars['String']['input'];
  /** Indicative rate observed on the rates view at selection time, decimal as string */
  rate: Scalars['String']['input'];
};

/** Toggles the VIP crypto-payout exception (allow_crypto_payout). Payouts are FIAT only by default. */
export type SetCryptoPayoutAllowanceInput = {
  /** true enables CRYPTO payouts (exception), false restores FIAT only */
  allowed: Scalars['Boolean']['input'];
  /** Client id or customer id (UUID) */
  id: Scalars['ID']['input'];
  /** Why the exception changes (stored in the audit log) */
  reason: Scalars['String']['input'];
  target: AdminLoopayCryptoPayoutAllowanceTarget;
};

export type SignInInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type SignUpInput = {
  /** Company name for business registration */
  company?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  policy?: InputMaybe<Scalars['Boolean']['input']>;
};

export type SignUpResponse = {
  __typename?: 'SignUpResponse';
  /** Firebase authentication UID */
  auth_uid?: Maybe<Scalars['String']['output']>;
  /** User email address */
  email: Scalars['String']['output'];
  /** Unique user identifier */
  id: Scalars['String']['output'];
  /** User full name */
  name: Scalars['String']['output'];
};

/** [transactions] Dev/test-only actor-action simulation for a dispersion (sandbox parity — never available in production) */
export type SimulateDispersionActionInput = {
  /** Simulated ops action: select_provider | complete | fail | cancel */
  action: Scalars['String']['input'];
  dispersion_id: Scalars['ID']['input'];
  /** complete: settlement reference recorded with the status */
  external_reference?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  /** select_provider: kirafin | mesta (defaults to kirafin) */
  provider?: InputMaybe<Scalars['String']['input']>;
  /** select_provider: indicative rate to record (defaults to 1 — sandbox annotation) */
  rate?: InputMaybe<Scalars['String']['input']>;
  /** fail/cancel: why (required by the manual transitions) */
  reason?: InputMaybe<Scalars['String']['input']>;
  /** cancel: console reference of the manual ops→customer return */
  return_reference?: InputMaybe<Scalars['String']['input']>;
};

export type StaffUserFiltersInput = {
  email?: InputMaybe<StringFilterInput>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  staffRole?: InputMaybe<AdminLoopayStaffRoleEntity>;
};

/** Admin Loopay internal staff user view */
export type StaffUserGraphQlEntity = {
  __typename?: 'StaffUserGraphQLEntity';
  created_at: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  first_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  is_active: Scalars['Boolean']['output'];
  last_name?: Maybe<Scalars['String']['output']>;
  /** Only set by adminLoopay_createStaffUser when Firebase was provisioned by email: one-time link for the new user to set a password. Null otherwise. */
  passwordSetupLink?: Maybe<Scalars['String']['output']>;
  role: AdminLoopayUserRoleEntity;
  staff_role?: Maybe<AdminLoopayStaffRoleEntity>;
  updated_at: Scalars['DateTime']['output'];
};

export type StringFilterInput = {
  contains?: InputMaybe<Scalars['String']['input']>;
  endsWith?: InputMaybe<Scalars['String']['input']>;
  equals?: InputMaybe<Scalars['String']['input']>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

/** [customers] The answer to a provider requirement (documents and/or a value) */
export type SubmitProviderRequirementInput = {
  customerId: Scalars['String']['input'];
  documents?: InputMaybe<Array<RequirementDocumentInput>>;
  requirementId: Scalars['String']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
};

/** Tag for organizing workflows */
export type TagEntity = {
  __typename?: 'TagEntity';
  client_id: Scalars['String']['output'];
  /** HEX color (#FF5733) */
  color?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** Tag name */
  name: Scalars['String']['output'];
  updated_at: Scalars['String']['output'];
};

/** Workflow tag mapping */
export type TagMappingEntity = {
  __typename?: 'TagMappingEntity';
  tag?: Maybe<TagEntity>;
  tag_id: Scalars['String']['output'];
  workflow_id: Scalars['String']['output'];
};

export type TaxIdTypeFiltersInput = {
  /** Filter by tax ID type name */
  name?: InputMaybe<Scalars['String']['input']>;
};

export type TaxIdTypeGraphqlEntity = {
  __typename?: 'TaxIdTypeGraphqlEntity';
  /** Countries where this tax ID type is used (ISO 3166-1 alpha-3) */
  countries?: Maybe<Array<Scalars['String']['output']>>;
  /** Tax ID type ID */
  id: Scalars['String']['output'];
  /** Tax ID type name */
  name: Scalars['String']['output'];
};

/** The Loopay staff member acting as a tenant admin through `x-act-as-client` */
export type TenantActingAs = {
  __typename?: 'TenantActingAs';
  staff_email?: Maybe<Scalars['String']['output']>;
  /** Staff roles of the acting member, e.g. `OPS_COMMERCIAL` */
  staff_roles: Array<Scalars['String']['output']>;
};

/** Result of inviting a tenant admin. The setup link is returned once and never stored. */
export type TenantAdminInvitation = {
  __typename?: 'TenantAdminInvitation';
  member: TenantTeamMember;
  /** One-time password setup link to hand to the invitee; null when the Firebase user already has a password or the link could not be generated */
  password_setup_link?: Maybe<Scalars['String']['output']>;
};

/** A payment rail enabled for the tenant (client provider rail) */
export type TenantEnabledRail = {
  __typename?: 'TenantEnabledRail';
  /** Rail code, e.g. `ach`, `pix` */
  code: Scalars['String']['output'];
  /** ISO 3166-1 alpha-3 country code */
  country?: Maybe<Scalars['String']['output']>;
  /** ISO 4217 currency code */
  currency: Scalars['String']['output'];
};

/** The tenant (client) of the signed-in tenant admin. Never carries the API key secret. */
export type TenantMe = {
  __typename?: 'TenantMe';
  /** Set when a Loopay staff member acts as a tenant admin (`x-act-as-client`); null for a real tenant admin */
  acting_as?: Maybe<TenantActingAs>;
  /** Hard expiry of the current API key (null = never expires) */
  api_key_expires_at?: Maybe<Scalars['DateTime']['output']>;
  /** Non-secret prefix of the current API key */
  api_key_prefix: Scalars['String']['output'];
  /** When the current API key was issued by a rotation */
  api_key_rotated_at?: Maybe<Scalars['DateTime']['output']>;
  client_id: Scalars['String']['output'];
  enabled_rails: Array<TenantEnabledRail>;
  /** `production` on the production deployment (ENV=production), `sandbox` on every other deployment */
  environment: Scalars['String']['output'];
  name: Scalars['String']['output'];
  /** Client status (always ACTIVE here) */
  status: Scalars['String']['output'];
};

/** An active admin (CLIENT_ADMIN) of the tenant */
export type TenantTeamMember = {
  __typename?: 'TenantTeamMember';
  created_at: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  first_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  last_name?: Maybe<Scalars['String']['output']>;
};

export type TosLinkResponse = {
  __typename?: 'TosLinkResponse';
  /** URL to Terms of Service acceptance page */
  tos_url: Scalars['String']['output'];
};

/** Which money movements the client app may offer (Loopay2/SOBERANA#409 exit policy) */
export type TransactionCapabilitiesEntity = {
  __typename?: 'TransactionCapabilitiesEntity';
  /** Crypto transfers to an external address; false in production, where no USDT leaves custody */
  external_transfer_enabled: Scalars['Boolean']['output'];
  /** Transfers between wallets of the same client (always true) */
  p2p_enabled: Scalars['Boolean']['output'];
};

export type TransactionEntity = {
  __typename?: 'TransactionEntity';
  /** Amount */
  amount: Scalars['String']['output'];
  /** Completion timestamp */
  completed_at?: Maybe<Scalars['String']['output']>;
  /** Creation timestamp */
  created_at: Scalars['String']['output'];
  /** Currency */
  currency: Scalars['String']['output'];
  /** Description */
  description?: Maybe<Scalars['String']['output']>;
  /** Transaction ID */
  id: Scalars['String']['output'];
  /** Metadata */
  metadata?: Maybe<Scalars['JSON']['output']>;
  /** Transaction status */
  status: Scalars['String']['output'];
  /** Transaction type */
  type: Scalars['String']['output'];
};

export type TransactionListFiltersInput = {
  /** Fecha desde */
  fromDate?: InputMaybe<Scalars['DateTime']['input']>;
  /** Número de página (inicia en 1) */
  page?: InputMaybe<Scalars['Float']['input']>;
  /** Número de transacciones por página */
  page_size?: InputMaybe<Scalars['Float']['input']>;
  /** Filtrar por estado */
  status?: InputMaybe<Scalars['String']['input']>;
  /** Fecha hasta */
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
  /** Filtrar por tipo de transacción */
  type?: InputMaybe<Scalars['String']['input']>;
};

export type TransferResponse = {
  __typename?: 'TransferResponse';
  /** Message */
  message: Scalars['String']['output'];
  /** Status */
  status: Scalars['String']['output'];
  /** Transaction ID */
  transaction_id: Scalars['String']['output'];
};

export type UnmatchedDeposit = {
  __typename?: 'UnmatchedDeposit';
  /** Decimal-string amount when the audit detail carries it */
  amount?: Maybe<Scalars['String']['output']>;
  /** Webhook arrival time */
  arrival: Scalars['DateTime']['output'];
  /** Chain when known */
  chain?: Maybe<Scalars['String']['output']>;
  /** Currency when the audit detail carries it */
  currency?: Maybe<Scalars['String']['output']>;
  /** OPEN | RECONCILED */
  disposition: Scalars['String']['output'];
  /** Provider event id (queue identity) */
  externalId: Scalars['String']['output'];
  /** Provider code (openfort | kirafin | mesta) */
  provider: Scalars['String']['output'];
  /** Provider deposit id when the audit detail carries it */
  providerDepositId?: Maybe<Scalars['String']['output']>;
  /** Rail when known */
  rail?: Maybe<Scalars['String']['output']>;
};

export type UnmatchedDepositPage = {
  __typename?: 'UnmatchedDepositPage';
  /** Unmatched deposits, newest first */
  items: Array<UnmatchedDeposit>;
  /** Pass as `before` to fetch the next page; null at the end */
  nextCursor?: Maybe<Scalars['DateTime']['output']>;
};

export type UpdateClientInput = {
  config?: InputMaybe<Scalars['JSON']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  kycStatus?: InputMaybe<AdminLoopayKycStatusEntity>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<AdminLoopayClientStatusEntity>;
  taxId?: InputMaybe<Scalars['String']['input']>;
  taxIdTypeId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateClientProviderRailInput = {
  clientId?: InputMaybe<Scalars['String']['input']>;
  defaultAttributes?: InputMaybe<Scalars['JSON']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  providerId?: InputMaybe<Scalars['String']['input']>;
  railId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCurrencyInput = {
  /** Currency decimals */
  decimals?: InputMaybe<Scalars['Int']['input']>;
  /** Whether the currency is active */
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Currency display name */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Currency symbol */
  symbol?: InputMaybe<Scalars['String']['input']>;
  /** Currency type */
  type?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCustomerInput = {
  /** Account purpose */
  account_purpose?: InputMaybe<Scalars['String']['input']>;
  /** Whether the customer acts as an intermediary */
  acting_as_intermediary?: InputMaybe<Scalars['Boolean']['input']>;
  /** Address line 1 */
  address_line_1?: InputMaybe<Scalars['String']['input']>;
  /** Business account purpose */
  business_account_purpose?: InputMaybe<Scalars['String']['input']>;
  /** Business description */
  business_description?: InputMaybe<Scalars['String']['input']>;
  /** Business industry codes (NAICS) */
  business_industry?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Business legal name (for business customers) */
  business_legal_name?: InputMaybe<Scalars['String']['input']>;
  /** Business source of funds */
  business_source_of_funds?: InputMaybe<Scalars['String']['input']>;
  /** Business type (corporation, llc, partnership, etc.) */
  business_type?: InputMaybe<Scalars['String']['input']>;
  /** Compliance screening explanation */
  compliance_screening_explanation?: InputMaybe<Scalars['String']['input']>;
  /** Whether business conducts money services */
  conducts_money_services?: InputMaybe<Scalars['Boolean']['input']>;
  /** Description of the money services the business conducts */
  conducts_money_services_description?: InputMaybe<Scalars['String']['input']>;
  /** Whether business conducts money services using Bridge */
  conducts_money_services_using_bridge?: InputMaybe<Scalars['Boolean']['input']>;
  /** Email */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Employment status */
  employment_status?: InputMaybe<Scalars['String']['input']>;
  /** Estimated annual revenue in USD. Valid bands: 0_99999, 100000_999999, 1000000_9999999, 10000000_49999999, 50000000_249999999, 250000000_plus */
  estimated_annual_revenue_usd?: InputMaybe<Scalars['String']['input']>;
  /** Expected monthly payment volume in USD */
  expected_monthly_payments_usd?: InputMaybe<Scalars['String']['input']>;
  /** Has material intermediary ownership (25% or more) */
  has_material_intermediary_ownership?: InputMaybe<Scalars['Boolean']['input']>;
  /** High risk activities */
  high_risk_activities?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Explanation for high risk activities selection */
  high_risk_activities_explanation?: InputMaybe<Scalars['String']['input']>;
  /** Business incorporation date */
  incorporation_date?: InputMaybe<Scalars['String']['input']>;
  /** Whether the business is a financial institution (virtual-account providers). */
  is_financial_institution?: InputMaybe<Scalars['Boolean']['input']>;
  /** Customer most recent occupation */
  most_recent_occupation?: InputMaybe<Scalars['String']['input']>;
  /** All nationalities (ISO 3166-1 alpha-3 codes) */
  nationalities?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Nationality */
  nationality?: InputMaybe<Scalars['String']['input']>;
  /** Number of employees range for virtual-account providers. One of: 1, 2-10, 11-50, 51-200, 201-1000, 1000+, unknown (legacy 201-500 and 501+ are still accepted). */
  number_of_employees?: InputMaybe<Scalars['String']['input']>;
  /** Whether business operates in prohibited countries */
  operates_in_prohibited_countries?: InputMaybe<Scalars['Boolean']['input']>;
  /** Ownership threshold percentage (5-25) */
  ownership_threshold?: InputMaybe<Scalars['Int']['input']>;
  /** Phone */
  phone?: InputMaybe<Scalars['String']['input']>;
  /** Place of birth */
  place_of_birth?: InputMaybe<CustomerPlaceOfBirthInput>;
  /** Primary website */
  primary_website?: InputMaybe<Scalars['String']['input']>;
  /** Company registration number for virtual-account providers (Mesta identificationNumber). Defaults to the tax id when omitted (in Colombia the NIT is both). */
  registration_number?: InputMaybe<Scalars['String']['input']>;
  /** Source of funds */
  source_of_funds?: InputMaybe<Scalars['String']['input']>;
  /** Source of funds description */
  source_of_funds_description?: InputMaybe<Scalars['String']['input']>;
  /** Country code (ISO 3166-1 alpha-3) where the tax ID was issued */
  tax_id_issuing_country?: InputMaybe<Scalars['String']['input']>;
  /** Why the business has no website (required by Mesta when primary_website is empty). */
  website_absence_reason?: InputMaybe<Scalars['String']['input']>;
};

/** Update execution data */
export type UpdateExecutionDataInput = {
  /** Full data for replay/debug */
  full_data?: InputMaybe<Scalars['String']['input']>;
  /** Output payload */
  output_payload?: InputMaybe<Scalars['JSON']['input']>;
};

/** Update execution status */
export type UpdateExecutionStatusInput = {
  /** Error message (if FAILED) */
  error?: InputMaybe<Scalars['String']['input']>;
  /** New status */
  status: Scalars['String']['input'];
};

/** Update node execution status */
export type UpdateNodeExecutionInput = {
  /** Compensation status */
  compensation_status?: InputMaybe<Scalars['String']['input']>;
  /** Error message */
  error?: InputMaybe<Scalars['String']['input']>;
  /** Error code */
  error_code?: InputMaybe<Scalars['String']['input']>;
  /** Output data */
  output_data?: InputMaybe<Scalars['JSON']['input']>;
  /** New status */
  status?: InputMaybe<Scalars['String']['input']>;
  /** Transaction ID (if financial op) */
  transaction_id?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOperationTypeInput = {
  /** Operation type name */
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePaymentRailInput = {
  /** Code of the rail this one duplicates (e.g. us_ach -> ach); equal to code or unset for a canonical rail. null clears it. Lower-cased */
  canonicalCode?: InputMaybe<Scalars['String']['input']>;
  /** ISO3 country code */
  country?: InputMaybe<Scalars['String']['input']>;
  /** Currency code */
  currency?: InputMaybe<Scalars['String']['input']>;
  /** Rail direction */
  direction?: InputMaybe<Scalars['String']['input']>;
  /** Whether the rail is active */
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Payment rail display name */
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProviderInput = {
  /** Provider configuration payload */
  config?: InputMaybe<Scalars['JSON']['input']>;
  /** Whether the provider is active */
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Provider display name */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Provider type */
  type?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProviderPaymentRailInput = {
  /** Provider payment rail configuration payload */
  config?: InputMaybe<Scalars['JSON']['input']>;
  /** Whether the mapping is active */
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateStaffUserInput = {
  firstName?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  staffRole?: InputMaybe<AdminLoopayStaffRoleEntity>;
};

/** Update a tag */
export type UpdateTagInput = {
  /** HEX color */
  color?: InputMaybe<Scalars['String']['input']>;
  /** Tag name */
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTaxIdTypeInput = {
  /** Delete the tax ID type after dependency validation */
  delete?: InputMaybe<Scalars['Boolean']['input']>;
  /** Tax ID type name */
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  authUid?: InputMaybe<Scalars['String']['input']>;
  clientId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateVirtualAccountInput = {
  alias?: InputMaybe<Scalars['String']['input']>;
  bankDetails?: InputMaybe<Scalars['JSON']['input']>;
  providerAccountId?: InputMaybe<Scalars['String']['input']>;
  providerMetadata?: InputMaybe<Scalars['JSON']['input']>;
  status?: InputMaybe<AdminVirtualAccountStatus>;
};

/** Update an existing workflow */
export type UpdateWorkflowInput = {
  /** Category */
  category?: InputMaybe<Scalars['String']['input']>;
  /** Connections (validated with Zod) */
  connections?: InputMaybe<Scalars['JSON']['input']>;
  /** Description */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Expected edit version for optimistic locking */
  edit_version: Scalars['Int']['input'];
  /** Metadata */
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  /** Workflow name */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Nodes (validated with Zod) */
  nodes?: InputMaybe<Scalars['JSON']['input']>;
  /** Pin data */
  pin_data?: InputMaybe<Scalars['JSON']['input']>;
  /** Required products/connectors */
  requires?: InputMaybe<Scalars['JSON']['input']>;
  /** Workflow settings */
  settings?: InputMaybe<Scalars['JSON']['input']>;
  /** Static data */
  static_data?: InputMaybe<Scalars['JSON']['input']>;
  /** User ID making this update */
  updated_by_id: Scalars['String']['input'];
};

export type UserFiltersInput = {
  clientId?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<StringFilterInput>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<AdminLoopayUserRoleEntity>;
};

/** Admin Loopay user entity */
export type UserGraphQlEntity = {
  __typename?: 'UserGraphQLEntity';
  authUid?: Maybe<Scalars['String']['output']>;
  clientId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  role: AdminLoopayUserRoleEntity;
  updatedAt: Scalars['DateTime']['output'];
};

export type VaBlockerEntity = {
  __typename?: 'VaBlockerEntity';
  /** Blocker category */
  category: Scalars['String']['output'];
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type VaultAssetPosition = {
  __typename?: 'VaultAssetPosition';
  /** Custody provider asset id */
  assetId: Scalars['String']['output'];
  /** Decimal-string available */
  available: Scalars['String']['output'];
  /** Decimal-string pending */
  pending: Scalars['String']['output'];
  /** Decimal-string total */
  total: Scalars['String']['output'];
};

export type VendorFundsSourceInput = {
  /** MESTA_MERCHANT | KIRA_VA */
  kind: Scalars['String']['input'];
  /** Virtual account id (required for KIRA_VA) */
  virtualAccountId?: InputMaybe<Scalars['String']['input']>;
};

export type VendorMerchantBalance = {
  __typename?: 'VendorMerchantBalance';
  /** Decimal-string balance */
  amount: Scalars['String']['output'];
  /** Currency code */
  currency: Scalars['String']['output'];
  /** Vendor-reported timestamp when provided */
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type VirtualAccountFiltersInput = {
  currency?: InputMaybe<StringFilterInput>;
  customerId?: InputMaybe<StringFilterInput>;
  providerAccountId?: InputMaybe<StringFilterInput>;
  railId?: InputMaybe<StringFilterInput>;
  status?: InputMaybe<Array<AdminVirtualAccountStatus>>;
  walletId?: InputMaybe<StringFilterInput>;
};

export type VirtualAccountItem = {
  __typename?: 'VirtualAccountItem';
  /** Account holder name */
  account_holder_name?: Maybe<Scalars['String']['output']>;
  /** Account number */
  account_number?: Maybe<Scalars['String']['output']>;
  /** Account type */
  account_type?: Maybe<Scalars['String']['output']>;
  /** Bank address */
  bank_address?: Maybe<Scalars['String']['output']>;
  /** Bank beneficiary address */
  bank_beneficiary_address?: Maybe<Scalars['String']['output']>;
  /** Bank beneficiary name for transfers */
  bank_beneficiary_name?: Maybe<Scalars['String']['output']>;
  /** Bank name */
  bank_name?: Maybe<Scalars['String']['output']>;
  /** Beneficiary address */
  beneficiary_address?: Maybe<Scalars['String']['output']>;
  /** Beneficiary name */
  beneficiary_name?: Maybe<Scalars['String']['output']>;
  /** BIC code (same as SWIFT code) */
  bic?: Maybe<Scalars['String']['output']>;
  /** BR Code for PIX deposits (Brazil) */
  br_code?: Maybe<Scalars['String']['output']>;
  /** CLABE */
  clabe?: Maybe<Scalars['String']['output']>;
  /** Currency code */
  currency: Scalars['String']['output'];
  /** IBAN */
  iban?: Maybe<Scalars['String']['output']>;
  /** Virtual account ID */
  id: Scalars['String']['output'];
  /** When Loopay staff linked the account by hand; null otherwise */
  linked_at?: Maybe<Scalars['DateTime']['output']>;
  /** True when Loopay staff registered the account by hand with typed bank details; false when linked with provider bank details; null when nobody linked it by hand */
  linked_manually?: Maybe<Scalars['Boolean']['output']>;
  /** NIT */
  nit?: Maybe<Scalars['String']['output']>;
  /** Payment rail code */
  payment_rail: Scalars['String']['output'];
  /** Available payment rails */
  payment_rails?: Maybe<Array<Scalars['String']['output']>>;
  /** Reference code for deposits */
  reference?: Maybe<Scalars['String']['output']>;
  /** Routing number */
  routing_number?: Maybe<Scalars['String']['output']>;
  /** Sort code (for GBP Faster Payments) */
  sort_code?: Maybe<Scalars['String']['output']>;
  /** Status of the virtual account */
  status: Scalars['String']['output'];
  /** SWIFT/BIC code */
  swift_code?: Maybe<Scalars['String']['output']>;
};

export type WalletBalanceEntity = {
  __typename?: 'WalletBalanceEntity';
  /** Available balance */
  available_balance: Scalars['String']['output'];
  /** Currency code */
  currency: Scalars['String']['output'];
  /** Pending balance (in transit) */
  pending_balance: Scalars['String']['output'];
  /** Provider-truth spendable balance for send flows */
  spendable_balance: Scalars['String']['output'];
  /** Total balance */
  total_balance: Scalars['String']['output'];
  /** Timestamp of last balance update */
  updated_at: Scalars['String']['output'];
  /** Wallet UUID */
  wallet_id: Scalars['String']['output'];
};

export type WalletEntity = {
  __typename?: 'WalletEntity';
  /** Wallet address (blockchain) */
  address?: Maybe<Scalars['String']['output']>;
  /** Wallet alias */
  alias?: Maybe<Scalars['String']['output']>;
  /** Blockchain chain where the wallet is deployed */
  chain: Scalars['String']['output'];
  /** Timestamp when wallet was created */
  created_at: Scalars['String']['output'];
  /** Currency code */
  currency: Scalars['String']['output'];
  /** Customer UUID */
  customer_id: Scalars['String']['output'];
  /** Wallet unique identifier */
  id: Scalars['String']['output'];
  /** Wallet status */
  status: Scalars['String']['output'];
  /** Timestamp when wallet was last updated */
  updated_at: Scalars['String']['output'];
};

export type WalletTransactionEntity = {
  __typename?: 'WalletTransactionEntity';
  /** Transaction amount */
  amount: Scalars['String']['output'];
  /** Completion timestamp */
  completed_at?: Maybe<Scalars['String']['output']>;
  /** Creation timestamp */
  created_at: Scalars['String']['output'];
  /** Currency */
  currency: Scalars['String']['output'];
  /** Transaction description */
  description?: Maybe<Scalars['String']['output']>;
  /** Customer-safe masked destination details as a JSON object */
  destination?: Maybe<Scalars['JSON']['output']>;
  /** External reference */
  external_reference?: Maybe<Scalars['String']['output']>;
  /** Transaction fee */
  fee?: Maybe<Scalars['String']['output']>;
  /** Fee currency */
  fee_currency?: Maybe<Scalars['String']['output']>;
  /** Transaction ID */
  id: Scalars['String']['output'];
  /** Whether a held amount was already returned to the wallet (refund credited or hold released). Drives the customer-facing "returned" state — a failed/rejected transaction without this flag is still under review. */
  refunded: Scalars['Boolean']['output'];
  /** Customer-safe masked source details as a JSON object */
  source?: Maybe<Scalars['JSON']['output']>;
  /** Transaction status */
  status: Scalars['String']['output'];
  /** Transaction type */
  type: Scalars['String']['output'];
};

export type WalletTransactionListResponse = {
  __typename?: 'WalletTransactionListResponse';
  /** Whether there are more transactions */
  has_more: Scalars['Boolean']['output'];
  /** Current page */
  page: Scalars['Float']['output'];
  /** Transactions per page */
  page_size: Scalars['Float']['output'];
  /** Total count */
  total: Scalars['Float']['output'];
  /** Total number of pages */
  total_pages: Scalars['Float']['output'];
  /** List of transactions */
  transactions: Array<WalletTransactionEntity>;
};

/** Workflow definition */
export type WorkflowEntity = {
  __typename?: 'WorkflowEntity';
  /** Active (published) version ID */
  active_version_id?: Maybe<Scalars['String']['output']>;
  /** Category: MOVE | CHANGE | ACCOUNT | TREASURY | COMPLIANCE | NOTIFICATION | CUSTOM */
  category: Scalars['String']['output'];
  /** Client ID (tenant) */
  client_id: Scalars['String']['output'];
  /** Connections between nodes (IConnection[]) */
  connections: Scalars['JSON']['output'];
  /** SHA256 hash of nodes+connections */
  content_hash?: Maybe<Scalars['String']['output']>;
  /** Creation date */
  created_at: Scalars['String']['output'];
  /** Created by user ID */
  created_by_id: Scalars['String']['output'];
  /** Description */
  description?: Maybe<Scalars['String']['output']>;
  /** Optimistic locking version */
  edit_version: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  /** Is archived (soft delete) */
  is_archived: Scalars['Boolean']['output'];
  /** Is template */
  is_template: Scalars['Boolean']['output'];
  /** Free metadata */
  metadata?: Maybe<Scalars['JSON']['output']>;
  /** Workflow name */
  name: Scalars['String']['output'];
  /** Workflow nodes (INode[]) */
  nodes: Scalars['JSON']['output'];
  /** Pinned data for testing */
  pin_data?: Maybe<Scalars['JSON']['output']>;
  /** First publish date */
  published_at?: Maybe<Scalars['String']['output']>;
  /** Required products/connectors */
  requires?: Maybe<Scalars['JSON']['output']>;
  /** Workflow settings */
  settings?: Maybe<Scalars['JSON']['output']>;
  /** Persistent state between executions */
  static_data?: Maybe<Scalars['JSON']['output']>;
  /** Status: DRAFT | ACTIVE | PAUSED | ARCHIVED | ERROR */
  status: Scalars['String']['output'];
  /** Associated tags */
  tags?: Maybe<Array<TagMappingEntity>>;
  /** Active trigger count */
  trigger_count: Scalars['Int']['output'];
  /** Last update date */
  updated_at: Scalars['String']['output'];
  /** Last updated by user ID */
  updated_by_id?: Maybe<Scalars['String']['output']>;
  /** Version counter */
  version_counter: Scalars['Int']['output'];
  /** Current version ID */
  version_id: Scalars['String']['output'];
};

/** Workflow execution — lightweight metadata only (n8n pattern) */
export type WorkflowExecutionEntity = {
  __typename?: 'WorkflowExecutionEntity';
  /** Client ID (tenant) */
  client_id: Scalars['String']['output'];
  /** Created at */
  created_at: Scalars['DateTime']['output'];
  /** Soft delete timestamp */
  deleted_at?: Maybe<Scalars['DateTime']['output']>;
  /** Duration in milliseconds */
  duration_ms?: Maybe<Scalars['Int']['output']>;
  /** Error summary */
  error?: Maybe<Scalars['String']['output']>;
  /** Heavy data (lazy loaded) */
  execution_data?: Maybe<ExecutionDataEntity>;
  /** Metadata entries */
  execution_meta?: Maybe<Array<ExecutionMetadataEntity>>;
  id: Scalars['ID']['output'];
  /** Idempotency key */
  idempotency_key?: Maybe<Scalars['String']['output']>;
  /** Execution trigger mode */
  mode: ExecutionMode;
  /** Node executions */
  node_executions?: Maybe<Array<NodeExecutionEntity>>;
  /** Retry of execution ID */
  retry_of?: Maybe<Scalars['String']['output']>;
  /** Retry success execution ID */
  retry_success_id?: Maybe<Scalars['String']['output']>;
  /** Started at */
  started_at?: Maybe<Scalars['DateTime']['output']>;
  /** Execution lifecycle status */
  status: ExecutionStatus;
  /** Stopped at */
  stopped_at?: Maybe<Scalars['DateTime']['output']>;
  /** Total cost in USD */
  total_cost_usd?: Maybe<Scalars['Float']['output']>;
  /** Updated at */
  updated_at: Scalars['DateTime']['output'];
  /** Wait until (for wait nodes) */
  wait_till?: Maybe<Scalars['DateTime']['output']>;
  /** Workflow ID */
  workflow_id: Scalars['String']['output'];
};

/** Paginated execution list response */
export type WorkflowExecutionListResponse = {
  __typename?: 'WorkflowExecutionListResponse';
  data: Array<WorkflowExecutionEntity>;
  /** Has more results */
  has_more: Scalars['Boolean']['output'];
  /** Total count */
  total: Scalars['Int']['output'];
};

/** Filter workflows */
export type WorkflowFilterInput = {
  /** Filter by category */
  category?: InputMaybe<Scalars['String']['input']>;
  /** Include archived */
  include_archived?: InputMaybe<Scalars['Boolean']['input']>;
  /** Items per page */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** Offset for pagination */
  offset?: InputMaybe<Scalars['Int']['input']>;
  /** Only templates */
  only_templates?: InputMaybe<Scalars['Boolean']['input']>;
  /** Search by name */
  search?: InputMaybe<Scalars['String']['input']>;
  /** Filter by status */
  status?: InputMaybe<Scalars['String']['input']>;
  /** Filter by tag ID */
  tag_id?: InputMaybe<Scalars['String']['input']>;
};

/** Workflow history snapshot */
export type WorkflowHistoryEntity = {
  __typename?: 'WorkflowHistoryEntity';
  /** Authors array */
  authors: Scalars['JSON']['output'];
  /** Auto-saved flag */
  autosaved: Scalars['Boolean']['output'];
  /** Client ID */
  client_id: Scalars['String']['output'];
  /** Connections snapshot */
  connections: Scalars['JSON']['output'];
  created_at: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  /** Nodes snapshot */
  nodes: Scalars['JSON']['output'];
  published_at?: Maybe<Scalars['String']['output']>;
  /** Settings snapshot */
  settings?: Maybe<Scalars['JSON']['output']>;
  updated_at: Scalars['String']['output'];
  /** Version ID */
  version_id: Scalars['String']['output'];
  /** Workflow ID */
  workflow_id: Scalars['String']['output'];
};

/** Paginated workflow history response */
export type WorkflowHistoryListResponse = {
  __typename?: 'WorkflowHistoryListResponse';
  data: Array<WorkflowHistoryEntity>;
  /** Total count */
  total: Scalars['Int']['output'];
};

/** Paginated workflow list response */
export type WorkflowListResponse = {
  __typename?: 'WorkflowListResponse';
  data: Array<WorkflowEntity>;
  /** Has more results */
  has_more: Scalars['Boolean']['output'];
  /** Total count */
  total: Scalars['Int']['output'];
};

/** Version diff between two snapshots */
export type WorkflowVersionDiff = {
  __typename?: 'WorkflowVersionDiff';
  /** Connections diff */
  connections_diff: Scalars['JSON']['output'];
  from_version_id: Scalars['String']['output'];
  /** Nodes diff */
  nodes_diff: Scalars['JSON']['output'];
  /** Settings diff */
  settings_diff?: Maybe<Scalars['JSON']['output']>;
  to_version_id: Scalars['String']['output'];
};

export type AdminLoopayReviewBeneficiaryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: ReviewBeneficiaryInput;
}>;


export type AdminLoopayReviewBeneficiaryMutation = { __typename?: 'Mutation', adminLoopay_reviewBeneficiary: { __typename?: 'AdminBeneficiaryReviewResponseEntity', id: string, customer_id: string, previous_status: AdminBeneficiaryVerificationStatus, status: AdminBeneficiaryVerificationStatus, review_reason?: string | null, reviewed_by: string, reviewed_at: string } };

export type AdminLoopayLinkBeneficiaryProviderIdMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: LinkBeneficiaryProviderInput;
}>;


export type AdminLoopayLinkBeneficiaryProviderIdMutation = { __typename?: 'Mutation', adminLoopay_linkBeneficiaryProviderId: { __typename?: 'AdminBeneficiaryProviderLinkEntity', id: string, customer_id: string, provider_id: string, provider_code: string, provider_beneficiary_id: string, linked_at: string } };

export type AdminLoopayDeactivateBeneficiaryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AdminLoopayDeactivateBeneficiaryMutation = { __typename?: 'Mutation', adminLoopay_deactivateBeneficiary: { __typename?: 'AdminBeneficiaryEntity', id: string, customerId: string, clientId: string, customerExternalId?: string | null, customerEmail?: string | null, railId: string, railCode: string, railName: string, railCountry: string, providerId?: string | null, providerCode?: string | null, providerName?: string | null, relationship: string, holderType: string, holderName: string, holderTaxId?: string | null, currency: string, bankDetails: any, alias?: string | null, status: AdminBeneficiaryVerificationStatus, isFavorite: boolean, providerBeneficiaryId?: string | null, providerMetadata?: any | null, createdAt: string, updatedAt: string } };

export type AdminLoopayReactivateBeneficiaryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AdminLoopayReactivateBeneficiaryMutation = { __typename?: 'Mutation', adminLoopay_reactivateBeneficiary: { __typename?: 'AdminBeneficiaryEntity', id: string, customerId: string, clientId: string, customerExternalId?: string | null, customerEmail?: string | null, railId: string, railCode: string, railName: string, railCountry: string, providerId?: string | null, providerCode?: string | null, providerName?: string | null, relationship: string, holderType: string, holderName: string, holderTaxId?: string | null, currency: string, bankDetails: any, alias?: string | null, status: AdminBeneficiaryVerificationStatus, isFavorite: boolean, providerBeneficiaryId?: string | null, providerMetadata?: any | null, createdAt: string, updatedAt: string } };

export type AdminLoopayUpdateCustomerStatusMutationVariables = Exact<{
  customerId: Scalars['String']['input'];
  input: AdminUpdateCustomerStatusInput;
}>;


export type AdminLoopayUpdateCustomerStatusMutation = { __typename?: 'Mutation', adminLoopay_updateCustomerStatus: { __typename?: 'AdminCustomerStatusResponseEntity', id: string, previous_status: AdminLoopayCustomerStatusEntity, current_status: AdminLoopayCustomerStatusEntity, reason?: string | null, updated_at: string, changed_by: string } };

export type AdminLoopayReviewEndorsementMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: ReviewEndorsementInput;
}>;


export type AdminLoopayReviewEndorsementMutation = { __typename?: 'Mutation', adminLoopay_reviewEndorsement: { __typename?: 'AdminEndorsementReviewResponseEntity', id: string, customer_id: string, rail_code: string, previous_status: AdminEndorsementStatus, status: AdminEndorsementStatus, review_reason?: string | null, activated_at?: string | null, reviewed_by: string, reviewed_at: string, onboarding?: { __typename?: 'AdminEndorsementOnboardingEntity', state: AdminEndorsementOnboardingState, provider_code: string, error_code?: string | null, error_message?: string | null, missing_fields: Array<string>, missing_field_details: Array<{ __typename?: 'AdminOnboardingMissingFieldEntity', key: string, group: string, kind: string }> } | null } };

export type AdminLoopayRetryEndorsementOnboardingMutationVariables = Exact<{
  endorsementId: Scalars['ID']['input'];
  providerProfile?: InputMaybe<CustomerProviderProfileInput>;
}>;


export type AdminLoopayRetryEndorsementOnboardingMutation = { __typename?: 'Mutation', adminLoopay_retryEndorsementOnboarding: { __typename?: 'AdminEndorsementOnboardingEntity', state: AdminEndorsementOnboardingState, provider_code: string, error_code?: string | null, error_message?: string | null, missing_fields: Array<string>, missing_field_details: Array<{ __typename?: 'AdminOnboardingMissingFieldEntity', key: string, group: string, kind: string }> } };

export type AdminLoopayStartProviderBeneficiaryVerificationMutationVariables = Exact<{
  beneficiaryId: Scalars['ID']['input'];
}>;


export type AdminLoopayStartProviderBeneficiaryVerificationMutation = { __typename?: 'Mutation', adminLoopay_startProviderBeneficiaryVerification: { __typename?: 'AdminProviderBeneficiaryVerification', id: string, provider_code: string, provider_beneficiary_id: string, verification_started: boolean, started_at: string } };

export type AdminLoopaySimulateProviderBeneficiaryVerificationMutationVariables = Exact<{
  beneficiaryId: Scalars['ID']['input'];
  outcome: SandboxProviderOutcome;
}>;


export type AdminLoopaySimulateProviderBeneficiaryVerificationMutation = { __typename?: 'Mutation', adminLoopay_simulateProviderBeneficiaryVerification: { __typename?: 'SandboxSimulationResultEntity', provider: string, accepted: boolean, outcome?: string | null, providerRequestId?: string | null } };

export type AdminLoopaySimulateProviderDepositMutationVariables = Exact<{
  virtualAccountId: Scalars['ID']['input'];
  amount: Scalars['String']['input'];
}>;


export type AdminLoopaySimulateProviderDepositMutation = { __typename?: 'Mutation', adminLoopay_simulateProviderDeposit: { __typename?: 'SandboxSimulationResultEntity', provider: string, accepted: boolean, outcome?: string | null, providerRequestId?: string | null } };

export type CompleteRegistrationMutationVariables = Exact<{
  input: CompleteRegistrationInput;
}>;


export type CompleteRegistrationMutation = { __typename?: 'Mutation', auth_completeRegistration: { __typename?: 'SignUpResponse', id: string, auth_uid?: string | null, email: string, name: string } };

export type SignUpMutationVariables = Exact<{
  signUpInput: SignUpInput;
}>;


export type SignUpMutation = { __typename?: 'Mutation', auth_signUp: { __typename?: 'SignUpResponse', id: string, auth_uid?: string | null, email: string, name: string } };

export type UserRegisterMutationVariables = Exact<{
  input: RegisterUserInput;
}>;


export type UserRegisterMutation = { __typename?: 'Mutation', user_register: { __typename?: 'RegistrationResult', id: string, email: string, auth_uid: string, role: string, customer_profile_id?: string | null, kyc_link?: string | null, kyc_status?: string | null } };

export type CreateCustomerMutationVariables = Exact<{
  input: CreateCustomerInput;
}>;


export type CreateCustomerMutation = { __typename?: 'Mutation', customers_create: { __typename?: 'CustomerEntity', id: string, customer_type: string, business_name?: string | null, kyc_status: string, kyc_link?: string | null, tos_link?: string | null, next_required_action?: string | null, kyc_snapshot?: { __typename?: 'CustomerKycSnapshotEntity', lifecycle: string, provider_customer_state: string, onboarding_mode?: string | null, prefill?: any | null, actions: Array<string>, tos: { __typename?: 'CustomerKycTosEntity', accepted: boolean, url?: string | null }, requirements: { __typename?: 'CustomerKycRequirementsEntity', missing: { __typename?: 'CustomerKycRequirementMissingEntity', fields: Array<string>, document_purposes: Array<string>, questionnaire_fields: Array<string> }, pending: Array<{ __typename?: 'CustomerKycRequirementPendingEntity', kind: string, key: string, status: string }>, issues: Array<{ __typename?: 'CustomerKycReasonEntity', code: string, target_type: string, target_key: string, message: string, retryable: boolean }> }, reasons: Array<{ __typename?: 'CustomerKycReasonEntity', code: string, target_type: string, target_key: string, message: string, retryable: boolean }>, freshness: { __typename?: 'CustomerKycFreshnessEntity', snapshot_generated_at: string, provider_checked_at?: string | null, webhook_updated_at?: string | null, last_reconciliation_source: string, reconciliation_state: string } } | null } };

export type GetTosLinkMutationVariables = Exact<{
  input: GetTosLinkInput;
}>;


export type GetTosLinkMutation = { __typename?: 'Mutation', customers_getTosLink: { __typename?: 'TosLinkResponse', tos_url: string } };

export type RefreshKycSnapshotMutationVariables = Exact<{
  input: RefreshKycSnapshotInput;
}>;


export type RefreshKycSnapshotMutation = { __typename?: 'Mutation', customers_refreshKycSnapshot: { __typename?: 'CustomerKycSnapshotEntity', lifecycle: string, provider_customer_state: string, onboarding_mode?: string | null, prefill?: any | null, actions: Array<string>, tos: { __typename?: 'CustomerKycTosEntity', accepted: boolean, url?: string | null }, next_step?: { __typename?: 'CustomerKycNextStepEntity', code: string, route: string, rail?: string | null, country?: string | null } | null, requirements: { __typename?: 'CustomerKycRequirementsEntity', missing: { __typename?: 'CustomerKycRequirementMissingEntity', fields: Array<string>, document_purposes: Array<string>, questionnaire_fields: Array<string> }, pending: Array<{ __typename?: 'CustomerKycRequirementPendingEntity', kind: string, key: string, status: string }>, issues: Array<{ __typename?: 'CustomerKycReasonEntity', code: string, target_type: string, target_key: string, message: string, retryable: boolean }> }, reasons: Array<{ __typename?: 'CustomerKycReasonEntity', code: string, target_type: string, target_key: string, message: string, retryable: boolean }>, freshness: { __typename?: 'CustomerKycFreshnessEntity', snapshot_generated_at: string, provider_checked_at?: string | null, webhook_updated_at?: string | null, last_reconciliation_source: string, reconciliation_state: string } } };

export type RetryKycMutationVariables = Exact<{
  input: RetryKycInput;
}>;


export type RetryKycMutation = { __typename?: 'Mutation', customers_retryKyc: { __typename?: 'CustomerKycSnapshotEntity', lifecycle: string, provider_customer_state: string, actions: Array<string>, tos: { __typename?: 'CustomerKycTosEntity', accepted: boolean, url?: string | null }, requirements: { __typename?: 'CustomerKycRequirementsEntity', missing: { __typename?: 'CustomerKycRequirementMissingEntity', fields: Array<string>, document_purposes: Array<string>, questionnaire_fields: Array<string> }, pending: Array<{ __typename?: 'CustomerKycRequirementPendingEntity', kind: string, key: string, status: string }>, issues: Array<{ __typename?: 'CustomerKycReasonEntity', code: string, target_type: string, target_key: string, message: string, retryable: boolean }> }, reasons: Array<{ __typename?: 'CustomerKycReasonEntity', code: string, target_type: string, target_key: string, message: string, retryable: boolean }>, freshness: { __typename?: 'CustomerKycFreshnessEntity', snapshot_generated_at: string, provider_checked_at?: string | null, webhook_updated_at?: string | null, last_reconciliation_source: string, reconciliation_state: string } } };

export type Transactions_CreateOffRampMutationVariables = Exact<{
  input: CreateOffRampInput;
}>;


export type Transactions_CreateOffRampMutation = { __typename?: 'Mutation', transactions_createOffRamp: { __typename?: 'OffRampResponse', transaction_id: string, status: string, message: string } };

export type Customers_AddEndorsementMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: AddEndorsementInput;
}>;


export type Customers_AddEndorsementMutation = { __typename?: 'Mutation', customers_addEndorsement: { __typename?: 'EndorsementResponse', id: string, payment_rail: string, status: string, created_at: string, country?: string | null, available_countries?: Array<string> | null, kyc_link?: string | null, tos_link?: string | null, readiness?: string | null, artifact_type?: string | null } };

export type Quotes_CreateMutationVariables = Exact<{
  input: CreateQuoteInput;
}>;


export type Quotes_CreateMutation = { __typename?: 'Mutation', quotes_create: { __typename?: 'QuoteEntity', id: string, from_currency: string, to_currency: string, from_amount: string, to_amount: string, rate: string, fee?: string | null, expires_at?: string | null, created_at: string } };

export type Transactions_CreateDispersionMutationVariables = Exact<{
  input: CreateDispersionInput;
}>;


export type Transactions_CreateDispersionMutation = { __typename?: 'Mutation', transactions_createDispersion: { __typename?: 'DispersionResponse', transaction_id: string, status: string, message: string } };

export type Transactions_CreateP2PMutationVariables = Exact<{
  input: CreateP2PInput;
}>;


export type Transactions_CreateP2PMutation = { __typename?: 'Mutation', transactions_createP2P: { __typename?: 'P2PResponse', transaction_id: string, status: string, message: string } };

export type Transactions_CreatePaymentLinkMutationVariables = Exact<{
  input: CreatePaymentLinkInput;
}>;


export type Transactions_CreatePaymentLinkMutation = { __typename?: 'Mutation', transactions_createPaymentLink: { __typename?: 'PaymentLinkResponse', payment_url: string, payment_link_id: string, expires_at: string } };

export type Transactions_CreateTransferMutationVariables = Exact<{
  input: CreateTransferInput;
}>;


export type Transactions_CreateTransferMutation = { __typename?: 'Mutation', transactions_createTransfer: { __typename?: 'TransferResponse', transaction_id: string, status: string, message: string } };

export type VirtualAccounts_RequestMutationVariables = Exact<{
  input: RequestVirtualAccountInput;
}>;


export type VirtualAccounts_RequestMutation = { __typename?: 'Mutation', virtualAccounts_request: { __typename?: 'RequestVirtualAccountResponse', created: boolean, request: { __typename?: 'ReceiveOptionEntity', country: string, currency: string, railCode: string, railName: string, provider: string, providers: Array<string>, status: string, requestId?: string | null, virtualAccountId?: string | null, vaRequestState?: string | null, reason?: string | null, blockers: Array<{ __typename?: 'VaBlockerEntity', code: string, category: string, message: string }> } } };

export type Wallets_CreateMutationVariables = Exact<{
  input: CreateWalletInput;
}>;


export type Wallets_CreateMutation = { __typename?: 'Mutation', wallets_create: { __typename?: 'WalletEntity', id: string, customer_id: string, currency: string, chain: string, status: string, alias?: string | null, address?: string | null, created_at: string, updated_at: string } };

export type TenantCreateBeneficiaryMutationVariables = Exact<{
  input: Scalars['JSONObject']['input'];
}>;


export type TenantCreateBeneficiaryMutation = { __typename?: 'Mutation', tenant_createBeneficiary: any };

export type TenantUpdateBeneficiaryMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: Scalars['JSONObject']['input'];
}>;


export type TenantUpdateBeneficiaryMutation = { __typename?: 'Mutation', tenant_updateBeneficiary: any };

export type TenantDeleteBeneficiaryMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type TenantDeleteBeneficiaryMutation = { __typename?: 'Mutation', tenant_deleteBeneficiary: boolean };

export type TenantDeactivateBeneficiaryMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type TenantDeactivateBeneficiaryMutation = { __typename?: 'Mutation', tenant_deactivateBeneficiary: any };

export type TenantReactivateBeneficiaryMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type TenantReactivateBeneficiaryMutation = { __typename?: 'Mutation', tenant_reactivateBeneficiary: any };

export type TenantCreateQuoteMutationVariables = Exact<{
  input: Scalars['JSONObject']['input'];
}>;


export type TenantCreateQuoteMutation = { __typename?: 'Mutation', tenant_createQuote: any };

export type TenantRequestVirtualAccountMutationVariables = Exact<{
  input: Scalars['JSONObject']['input'];
}>;


export type TenantRequestVirtualAccountMutation = { __typename?: 'Mutation', tenant_requestVirtualAccount: any };

export type TenantCreateWebhookMutationVariables = Exact<{
  input: Scalars['JSONObject']['input'];
}>;


export type TenantCreateWebhookMutation = { __typename?: 'Mutation', tenant_createWebhook: any };

export type TenantUpdateWebhookMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: Scalars['JSONObject']['input'];
}>;


export type TenantUpdateWebhookMutation = { __typename?: 'Mutation', tenant_updateWebhook: any };

export type TenantDeleteWebhookMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type TenantDeleteWebhookMutation = { __typename?: 'Mutation', tenant_deleteWebhook: boolean };

export type TenantTestWebhookMutationVariables = Exact<{ [key: string]: never; }>;


export type TenantTestWebhookMutation = { __typename?: 'Mutation', tenant_testWebhook: any };

export type TenantCreateCustomerMutationVariables = Exact<{
  input: Scalars['JSONObject']['input'];
}>;


export type TenantCreateCustomerMutation = { __typename?: 'Mutation', tenant_createCustomer: any };

export type TenantRetryCustomerKycMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: Scalars['JSONObject']['input'];
}>;


export type TenantRetryCustomerKycMutation = { __typename?: 'Mutation', tenant_retryCustomerKyc: any };

export type TenantSubmitCustomerRequirementMutationVariables = Exact<{
  id: Scalars['String']['input'];
  requirement_id: Scalars['String']['input'];
  input: Scalars['JSONObject']['input'];
}>;


export type TenantSubmitCustomerRequirementMutation = { __typename?: 'Mutation', tenant_submitCustomerRequirement: any };

export type TenantCreateWalletMutationVariables = Exact<{
  input: Scalars['JSONObject']['input'];
}>;


export type TenantCreateWalletMutation = { __typename?: 'Mutation', tenant_createWallet: any };

export type TenantCreateOffRampMutationVariables = Exact<{
  input: Scalars['JSONObject']['input'];
}>;


export type TenantCreateOffRampMutation = { __typename?: 'Mutation', tenant_createOffRamp: any };

export type TenantCreateDispersionMutationVariables = Exact<{
  input: Scalars['JSONObject']['input'];
}>;


export type TenantCreateDispersionMutation = { __typename?: 'Mutation', tenant_createDispersion: any };

export type TenantCreateTransferMutationVariables = Exact<{
  input: Scalars['JSONObject']['input'];
}>;


export type TenantCreateTransferMutation = { __typename?: 'Mutation', tenant_createTransfer: any };

export type TenantCreatePaymentLinkMutationVariables = Exact<{
  input: Scalars['JSONObject']['input'];
}>;


export type TenantCreatePaymentLinkMutation = { __typename?: 'Mutation', tenant_createPaymentLink: any };

export type TenantRegenerateApiKeyMutationVariables = Exact<{
  graceMinutes?: InputMaybe<Scalars['Int']['input']>;
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  scopes?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type TenantRegenerateApiKeyMutation = { __typename?: 'Mutation', tenant_regenerateApiKey: { __typename?: 'ClientApiKeyResponse', api_key: string, api_key_prefix: string } };

export type TenantInviteAdminMutationVariables = Exact<{
  input: InviteTenantAdminInput;
}>;


export type TenantInviteAdminMutation = { __typename?: 'Mutation', tenant_inviteAdmin: { __typename?: 'TenantAdminInvitation', password_setup_link?: string | null, member: { __typename?: 'TenantTeamMember', id: string, email: string, first_name?: string | null, last_name?: string | null, created_at: string } } };

export type TenantRemoveAdminMutationVariables = Exact<{
  user_id: Scalars['String']['input'];
}>;


export type TenantRemoveAdminMutation = { __typename?: 'Mutation', tenant_removeAdmin: { __typename?: 'TenantTeamMember', id: string, email: string, first_name?: string | null, last_name?: string | null, created_at: string } };

export type AdminCommercialClientProviderOnboardingQueryVariables = Exact<{
  clientId: Scalars['String']['input'];
}>;


export type AdminCommercialClientProviderOnboardingQuery = { __typename?: 'Query', adminLoopay_clientProviderOnboarding: Array<{ __typename?: 'AdminLoopayClientProviderOnboarding', id: string, clientId: string, providerCode: string, status: AdminLoopayClientProviderOnboardingStatus, providerCustomerId?: string | null, lastErrorCode?: string | null, linkedAt?: string | null, linkedByUserId?: string | null, createdAt: string, updatedAt: string, attempts: Array<{ __typename?: 'AdminLoopayClientProviderOnboardingAttempt', id: string, attemptNo: number, actorUserId?: string | null, requestSummary?: any | null, responseSummary?: any | null, errorCode?: string | null, missingFields: Array<string>, createdAt: string }> }> };

export type AdminCommercialClientOnboardingProfileQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminCommercialClientOnboardingProfileQuery = { __typename?: 'Query', adminLoopay_getClient: { __typename?: 'ClientGraphqlEntity', id: string, metadata: any } };

export type AdminCommercialListFeeSchedulesQueryVariables = Exact<{
  clientId?: InputMaybe<Scalars['ID']['input']>;
  includeInactive?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type AdminCommercialListFeeSchedulesQuery = { __typename?: 'Query', adminLoopay_listFeeSchedules: Array<{ __typename?: 'AdminFeeSchedule', id: string, clientId?: string | null, railCode?: string | null, operation: FeeOperation, mode: FeeMode, value: string, minAmount?: string | null, maxAmount?: string | null, currency?: string | null, active: boolean, version: number, createdByUserId?: string | null, createdAt: string }> };

export type AdminCommercialListFeeLedgerQueryVariables = Exact<{
  clientId: Scalars['ID']['input'];
  from?: InputMaybe<Scalars['DateTime']['input']>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
  operation?: InputMaybe<FeeOperation>;
}>;


export type AdminCommercialListFeeLedgerQuery = { __typename?: 'Query', adminLoopay_listFeeLedger: Array<{ __typename?: 'AdminFeeLedgerEntry', id: string, transactionId: string, clientId: string, operation: FeeOperation, railCode?: string | null, baseAmount: string, feeAmount: string, currency: string, feeScheduleId?: string | null, createdAt: string }> };

export type AdminCommercialFeeLedgerSummaryQueryVariables = Exact<{
  clientId: Scalars['ID']['input'];
  from?: InputMaybe<Scalars['DateTime']['input']>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type AdminCommercialFeeLedgerSummaryQuery = { __typename?: 'Query', adminLoopay_feeLedgerSummary: Array<{ __typename?: 'AdminFeeLedgerTotal', operation: FeeOperation, currency: string, total: string }> };

export type AdminCommercialProviderPaymentRailsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminCommercialProviderPaymentRailsQuery = { __typename?: 'Query', adminLoopay_listProviderPaymentRails: Array<{ __typename?: 'ProviderPaymentRailGraphqlEntity', id: string, is_active: boolean, provider: { __typename?: 'ProviderSummaryGraphqlEntity', id: string, code: string, name: string }, rail: { __typename?: 'PaymentRailSummaryGraphqlEntity', id: string, code: string, name: string } }> };

export type AdminCommercialClientProviderRailsQueryVariables = Exact<{
  clientId: Scalars['String']['input'];
}>;


export type AdminCommercialClientProviderRailsQuery = { __typename?: 'Query', adminLoopay_listClientProviderRails: Array<{ __typename?: 'ClientProviderRailGraphqlEntity', id: string, provider_id: string, rail_id: string, priority: number, is_active: boolean }> };

export type AdminLoopayListPendingBeneficiariesQueryVariables = Exact<{
  filter?: InputMaybe<BeneficiaryQueueFiltersInput>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type AdminLoopayListPendingBeneficiariesQuery = { __typename?: 'Query', adminLoopay_listPendingBeneficiaries: { __typename?: 'PaginatedAdminBeneficiaryQueueResponse', total: number, has_more: boolean, data: Array<{ __typename?: 'AdminBeneficiaryQueueItemEntity', id: string, customer_id: string, customer_email: string, client_id: string, client_name: string, rail_code: string, currency: string, holder_name: string, holder_type: string, relationship: string, bank_details?: any | null, created_at: string }> } };

export type AdminLoopayListAllBeneficiariesQueryVariables = Exact<{
  where?: InputMaybe<AdminBeneficiaryFiltersInput>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type AdminLoopayListAllBeneficiariesQuery = { __typename?: 'Query', adminLoopay_listBeneficiaries: { __typename?: 'PaginatedAdminBeneficiariesResponse', total: number, has_more: boolean, data: Array<{ __typename?: 'AdminBeneficiaryEntity', id: string, customerId: string, clientId: string, customerExternalId?: string | null, customerEmail?: string | null, railId: string, railCode: string, railName: string, railCountry: string, providerId?: string | null, providerCode?: string | null, providerName?: string | null, relationship: string, holderType: string, holderName: string, holderTaxId?: string | null, currency: string, bankDetails: any, alias?: string | null, status: AdminBeneficiaryVerificationStatus, isFavorite: boolean, providerBeneficiaryId?: string | null, providerMetadata?: any | null, country?: string | null, reviewStatus: string, reviewReason?: string | null, reviewedAt?: string | null, createdAt: string, updatedAt: string }> } };

export type AdminLoopayListClientOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminLoopayListClientOptionsQuery = { __typename?: 'Query', adminLoopay_listClientOptions: Array<{ __typename?: 'AdminClientOptionEntity', client_id: string, client_name: string, is_active: boolean }> };

export type AdminLoopayListCustomersSearchQueryVariables = Exact<{
  where?: InputMaybe<AdminCustomerFiltersInput>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AdminLoopayListCustomersSearchQuery = { __typename?: 'Query', adminLoopay_listCustomers: Array<{ __typename?: 'AdminCustomerGraphqlEntity', id: string, clientId: string, email: string, firstName: string, lastName: string }> };

export type AdminLoopayListCustomersManagementQueryVariables = Exact<{
  where?: InputMaybe<AdminCustomerFiltersInput>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AdminLoopayListCustomersManagementQuery = { __typename?: 'Query', adminLoopay_listCustomers: Array<{ __typename?: 'AdminCustomerGraphqlEntity', id: string, clientId: string, externalId: string, email: string, firstName: string, middleName?: string | null, lastName: string, taxId: string, taxIdTypeId: string, country: string, kycStatus: AdminLoopayKycStatusEntity, customerStatus: AdminLoopayCustomerStatusEntity, capabilities?: any | null, rejectionReasons?: any | null, addressDetails?: any | null, metadata?: any | null, bridgeCustomerId?: string | null, bridgeKycLevel?: string | null, bridgeKycUrl?: string | null, createdAt: string, updatedAt: string }> };

export type AdminLoopayListWalletsByCustomerQueryVariables = Exact<{
  customerId: Scalars['String']['input'];
}>;


export type AdminLoopayListWalletsByCustomerQuery = { __typename?: 'Query', adminLoopay_listWalletsByCustomer: Array<{ __typename?: 'AdminWalletResponseEntity', id: string, customerId: string, clientId: string, providerId: string, providerCode: string, currency: string, walletType: AdminWalletType, chain?: string | null, address?: string | null, alias?: string | null, balance: number, status: AdminWalletStatus, alreadyExisted: boolean, virtualAccountIds: Array<string>, createdAt: string, createdBy: string }> };

export type AdminLoopayListPendingDispersionesQueryVariables = Exact<{
  filter?: InputMaybe<DispersionQueueFiltersInput>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type AdminLoopayListPendingDispersionesQuery = { __typename?: 'Query', adminLoopay_listPendingDispersiones: { __typename?: 'PaginatedAdminDispersionesResponse', total: number, has_more: boolean, data: Array<{ __typename?: 'AdminDispersionEntity', id: string, reference_code: string, customer_id: string, customer_email: string, client_id: string, client_name: string, wallet_id: string, amount: string, currency: string, status: string, held_amount?: string | null, funds_location?: string | null, created_at: string, review_reason?: string | null, reviewed_at?: string | null, quote_rate?: string | null, quote_source_amount?: string | null, quote_source_currency?: string | null, quote_target_amount?: string | null, quote_target_currency?: string | null, fee_amount?: string | null, fee_source?: string | null, fee_currency?: string | null, settlement_amount?: string | null, settlement_currency?: string | null, settlement_rate?: string | null, settlement_bank_rate?: string | null, settlement_fees?: string | null, settlement_external_reference?: string | null, dispersion_state?: string | null, selected_provider?: string | null, funding_status?: string | null, return_status?: string | null, approved_by?: string | null, approved_at?: string | null, approval_required: boolean, awaiting_approval_at?: string | null, stale_review_required: boolean, stale_review_reason?: string | null, stale_review_flagged_at?: string | null, beneficiary?: { __typename?: 'AdminDispersionBeneficiaryEntity', id: string, holder_name: string, rail_code: string, currency: string, bank_details?: any | null } | null, payout?: { __typename?: 'DispersionPayoutStatus', state: string, providerCode: string, terminalVendorStatus?: string | null, placedAt: string, terminalAt?: string | null } | null, payout_plan?: { __typename?: 'AdminDispersionPayoutPlanEntity', gross: string, loopay_fee: string, network_component: string, funding_amount: string, rounding_remainder: string } | null, stale_alerts: Array<{ __typename?: 'AdminDispersionStaleAlertEntity', key: string, raised_at: string }> }> } };

export type AdminLoopayListPendingEndorsementsQueryVariables = Exact<{
  filter?: InputMaybe<EndorsementQueueFiltersInput>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type AdminLoopayListPendingEndorsementsQuery = { __typename?: 'Query', adminLoopay_listPendingEndorsements: { __typename?: 'PaginatedAdminEndorsementQueueResponse', total: number, has_more: boolean, data: Array<{ __typename?: 'AdminEndorsementQueueItemEntity', id: string, customer_id: string, customer_email: string, client_id: string, client_name: string, rail_code: string, rail_name: string, currency: string, status: AdminEndorsementStatus, requested_at: string, review_reason?: string | null }> } };

export type AdminLoopayListPendingKycQueryVariables = Exact<{
  filter?: InputMaybe<KycQueueFiltersInput>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type AdminLoopayListPendingKycQuery = { __typename?: 'Query', adminLoopay_listPendingKyc: { __typename?: 'PaginatedAdminKycQueueResponse', total: number, has_more: boolean, data: Array<{ __typename?: 'AdminKycQueueItemEntity', id: string, client_id: string, client_name: string, email: string, first_name: string, last_name: string, customer_type: string, country: string, kyc_status: AdminLoopayKycStatusEntity, customer_status: AdminLoopayCustomerStatusEntity, submitted_at: string, has_documents: boolean, documents_count: number }> } };

export type AdminLoopayGetCustomerKycDataQueryVariables = Exact<{
  customerId: Scalars['ID']['input'];
}>;


export type AdminLoopayGetCustomerKycDataQuery = { __typename?: 'Query', adminLoopay_getCustomerKycData: { __typename?: 'AdminCustomerKycDetailEntity', kyc_data?: any | null, provider_profile?: any | null, customer: { __typename?: 'AdminKycCustomerEntity', id: string, client_id: string, email: string, first_name: string, middle_name?: string | null, last_name: string, tax_id: string, tax_id_type?: string | null, country: string, kyc_status: AdminLoopayKycStatusEntity, customer_status: AdminLoopayCustomerStatusEntity, rejection_reasons?: any | null, address_details?: any | null, kyc_reviewed_by_user_id?: string | null, kyc_reviewed_at?: string | null, created_at: string, updated_at: string }, documents: Array<{ __typename?: 'AdminKycDocumentEntity', id: string, category: string, version: number, mime_type: string, file_size_bytes?: number | null, created_at: string, document_metadata?: any | null }>, endorsements: Array<{ __typename?: 'AdminKycEndorsementSummaryEntity', id: string, rail_code: string, status: string, review_reason?: string | null }>, wallets: Array<{ __typename?: 'AdminKycWalletSummaryEntity', id: string, provider_code: string, chain?: string | null, currency: string, address?: string | null, status: string }> } };

export type AdminLoopayGetDocumentDownloadUrlQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
}>;


export type AdminLoopayGetDocumentDownloadUrlQuery = { __typename?: 'Query', adminLoopay_getDocumentDownloadUrl: { __typename?: 'AdminDocumentDownloadEntity', document_id: string, url: string, expires_in_seconds: number } };

export type AdminLoopayProviderSandboxAvailabilityQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminLoopayProviderSandboxAvailabilityQuery = { __typename?: 'Query', adminLoopay_providerSandboxAvailability: { __typename?: 'ProviderSandboxAvailabilityEntity', mesta: boolean, kirafin: boolean } };

export type AdminLoopayListPendingRecaudosQueryVariables = Exact<{
  filter?: InputMaybe<RecaudoQueueFiltersInput>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type AdminLoopayListPendingRecaudosQuery = { __typename?: 'Query', adminLoopay_listPendingRecaudos: { __typename?: 'PaginatedAdminRecaudosResponse', total: number, has_more: boolean, data: Array<{ __typename?: 'AdminRecaudoEntity', id: string, reference_code: string, customer_id: string, customer_email: string, client_id: string, client_name: string, wallet_id: string, amount: string, currency: string, status: string, provider_code?: string | null, provider_event_id?: string | null, source?: string | null, reference?: string | null, created_at: string, review_reason?: string | null, reviewed_at?: string | null }> } };

export type AdminLoopayListVirtualAccountsQueryVariables = Exact<{
  where?: InputMaybe<VirtualAccountFiltersInput>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type AdminLoopayListVirtualAccountsQuery = { __typename?: 'Query', adminLoopay_listVirtualAccounts: { __typename?: 'PaginatedVirtualAccountsResponse', total: number, has_more: boolean, data: Array<{ __typename?: 'AdminVirtualAccountEntity', id: string, customerId: string, walletId: string, providerId: string, railId: string, railCode: string, currency: string, providerAccountId?: string | null, bankDetails?: any | null, alias?: string | null, status: AdminVirtualAccountStatus, createdAt: string, updatedAt: string }> } };

export type AdminLoopayListProviderLinkedAccountsQueryVariables = Exact<{
  customerId?: InputMaybe<Scalars['ID']['input']>;
  providerCode?: InputMaybe<Scalars['String']['input']>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type AdminLoopayListProviderLinkedAccountsQuery = { __typename?: 'Query', adminLoopay_listProviderLinkedAccounts: { __typename?: 'PaginatedAdminProviderLinkedAccountsResponse', total: number, has_more: boolean, data: Array<{ __typename?: 'AdminProviderLinkedAccountEntity', id: string, customer_id: string, customer_email: string, provider_code: string, rail_code: string, currency: string, status: AdminVirtualAccountStatus, provider_account_id?: string | null, alias?: string | null, linked_at: string }> } };

export type AuthHelloQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthHelloQuery = { __typename?: 'Query', auth_hello: string };

export type AuthMeQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthMeQuery = { __typename?: 'Query', auth_me: { __typename?: 'CurrentUser', id: string, auth_uid?: string | null, email: string, name: string, roles: Array<string>, staff_roles: Array<string>, company_roles: Array<string>, has_accepted_latest_terms: boolean, client_id?: string | null, customer_profile_id?: string | null, kyc_status?: string | null, company_name?: string | null, company_user?: Array<{ __typename?: 'CompanyUserRole', company_id: string, role: Array<string> }> | null } };

export type FindCustomerByEmailQueryVariables = Exact<{ [key: string]: never; }>;


export type FindCustomerByEmailQuery = { __typename?: 'Query', customers_list: { __typename?: 'ListCustomersResponse', data: Array<{ __typename?: 'CustomerEntity', id: string, email: string, kyc_status: string }> } };

export type GetCustomerProfileQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetCustomerProfileQuery = { __typename?: 'Query', customers_findById: { __typename?: 'CustomerEntity', id: string, email: string, customer_type: string, business_name?: string | null, first_name: string, last_name: string, kyc_status: string, customer_status?: string | null, country?: string | null, tax_id?: string | null, tax_id_type?: string | null, address?: any | null } };

export type GetKycSnapshotQueryVariables = Exact<{
  customerId: Scalars['String']['input'];
}>;


export type GetKycSnapshotQuery = { __typename?: 'Query', customers_getKycSnapshot: { __typename?: 'CustomerKycSnapshotEntity', lifecycle: string, provider_customer_state: string, onboarding_mode?: string | null, prefill?: any | null, actions: Array<string>, tos: { __typename?: 'CustomerKycTosEntity', accepted: boolean, url?: string | null }, next_step?: { __typename?: 'CustomerKycNextStepEntity', code: string, route: string, rail?: string | null, country?: string | null } | null, requirements: { __typename?: 'CustomerKycRequirementsEntity', missing: { __typename?: 'CustomerKycRequirementMissingEntity', fields: Array<string>, document_purposes: Array<string>, questionnaire_fields: Array<string> }, pending: Array<{ __typename?: 'CustomerKycRequirementPendingEntity', kind: string, key: string, status: string }>, issues: Array<{ __typename?: 'CustomerKycReasonEntity', code: string, target_type: string, target_key: string, message: string, retryable: boolean }> }, reasons: Array<{ __typename?: 'CustomerKycReasonEntity', code: string, target_type: string, target_key: string, message: string, retryable: boolean }>, freshness: { __typename?: 'CustomerKycFreshnessEntity', snapshot_generated_at: string, provider_checked_at?: string | null, webhook_updated_at?: string | null, last_reconciliation_source: string, reconciliation_state: string } } };

export type CreateBeneficiaryMutationVariables = Exact<{
  input: CreateBeneficiaryInput;
}>;


export type CreateBeneficiaryMutation = { __typename?: 'Mutation', beneficiaries_create: { __typename?: 'BeneficiaryEntity', id: string, customer_id: string, payment_rail?: string | null, country?: string | null, relationship: string, holder_type: string, beneficiary_name: string, tax_id?: string | null, currency: string, alias?: string | null, is_favorite: boolean, verification_status: string, rail_code?: string | null, provider_code?: string | null, review_status?: string | null, review_reason?: string | null, masked_account_number: string, bank_name?: string | null, bank_code?: string | null, account_number?: string | null, routing_number?: string | null, iban?: string | null, clabe?: string | null, pix_key?: string | null, bic?: string | null, bank_details?: any | null, created_at: string, updated_at: string, rail?: { __typename?: 'BeneficiaryRailEntity', id: string, code: string, name: string, currency: string, country: string } | null } };

export type DeleteBeneficiaryMutationVariables = Exact<{
  id: Scalars['String']['input'];
  customerId: Scalars['String']['input'];
}>;


export type DeleteBeneficiaryMutation = { __typename?: 'Mutation', beneficiaries_delete: { __typename?: 'BeneficiaryDeleteResultEntity', success: boolean, id: string, provider_external_deleted: boolean, provider_code?: string | null } };

export type Beneficiaries_ListQueryVariables = Exact<{
  customerId: Scalars['String']['input'];
}>;


export type Beneficiaries_ListQuery = { __typename?: 'Query', beneficiaries_list: Array<{ __typename?: 'BeneficiaryEntity', id: string, customer_id: string, payment_rail?: string | null, country?: string | null, relationship: string, holder_type: string, beneficiary_name: string, tax_id?: string | null, currency: string, alias?: string | null, is_favorite: boolean, verification_status: string, rail_code?: string | null, provider_code?: string | null, review_status?: string | null, review_reason?: string | null, masked_account_number: string, bank_name?: string | null, bank_code?: string | null, account_number?: string | null, routing_number?: string | null, iban?: string | null, clabe?: string | null, pix_key?: string | null, bic?: string | null, bank_details?: any | null, created_at: string, updated_at: string, rail?: { __typename?: 'BeneficiaryRailEntity', id: string, code: string, name: string, currency: string, country: string } | null }> };

export type Beneficiaries_FindByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
  customerId: Scalars['String']['input'];
}>;


export type Beneficiaries_FindByIdQuery = { __typename?: 'Query', beneficiaries_findById: { __typename?: 'BeneficiaryEntity', id: string, customer_id: string, payment_rail?: string | null, bank_details?: any | null, country?: string | null, relationship: string, holder_type: string, beneficiary_name: string, tax_id?: string | null, currency: string, alias?: string | null, is_favorite: boolean, verification_status: string, rail_code?: string | null, provider_code?: string | null, review_status?: string | null, review_reason?: string | null, masked_account_number: string, bank_name?: string | null, bank_code?: string | null, account_number?: string | null, routing_number?: string | null, iban?: string | null, clabe?: string | null, pix_key?: string | null, bic?: string | null, created_at: string, updated_at: string, rail?: { __typename?: 'BeneficiaryRailEntity', id: string, code: string, name: string, currency: string, country: string } | null } };

export type Customers_ListEndorsementsQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type Customers_ListEndorsementsQuery = { __typename?: 'Query', customers_listEndorsements: { __typename?: 'ListEndorsementsResponse', total: number, data: Array<{ __typename?: 'EndorsementResponse', id: string, payment_rail: string, status: string, created_at: string, readiness?: string | null, artifact_type?: string | null }> } };

export type Quotes_FindByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type Quotes_FindByIdQuery = { __typename?: 'Query', quotes_findById: { __typename?: 'QuoteEntity', id: string, from_currency: string, to_currency: string, from_amount: string, to_amount: string, rate: string, fee?: string | null, expires_at?: string | null, created_at: string } };

export type Quotes_GetIndicativeRateQueryVariables = Exact<{
  input: GetIndicativeRateInput;
}>;


export type Quotes_GetIndicativeRateQuery = { __typename?: 'Query', quotes_getIndicativeRate: { __typename?: 'IndicativeRateEntity', from: string, to: string, rate: string } };

export type Quotes_GetRateQueryVariables = Exact<{
  input: GetQuoteInput;
}>;


export type Quotes_GetRateQuery = { __typename?: 'Query', quotes_getRate: { __typename?: 'QuoteEntity', id: string, from_currency: string, to_currency: string, from_amount: string, to_amount: string, rate: string, fee?: string | null, expires_at?: string | null, created_at: string } };

export type Rails_CatalogueQueryVariables = Exact<{
  country?: InputMaybe<Scalars['String']['input']>;
}>;


export type Rails_CatalogueQuery = { __typename?: 'Query', rails_catalogue: { __typename?: 'RailCatalogue', countries: Array<{ __typename?: 'RailCatalogueCountry', country: string, rails: Array<{ __typename?: 'RailCatalogueRail', code: string, name: string, currency: string, directions: Array<string>, beneficiary_supported: boolean, providers: Array<{ __typename?: 'RailCatalogueProvider', code: string, directions: Array<string>, available: boolean }> }> }> } };

export type Rails_ListQueryVariables = Exact<{ [key: string]: never; }>;


export type Rails_ListQuery = { __typename?: 'Query', rails_list: { __typename?: 'ListRailsResponse', data: Array<{ __typename?: 'RailEntity', code: string, currency: string, country?: string | null, available_countries?: Array<string> | null, is_assignable: boolean, type: string, enabled_capabilities: Array<string>, name: string, description?: string | null, limits?: { __typename?: 'RailLimitsGraphQlEntity', min_amount?: number | null, max_amount?: number | null, daily_limit?: number | null, source: string } | null }> } };

export type VirtualAccounts_ReceiveOptionsQueryVariables = Exact<{
  country?: InputMaybe<Scalars['String']['input']>;
}>;


export type VirtualAccounts_ReceiveOptionsQuery = { __typename?: 'Query', virtualAccounts_receiveOptions: Array<{ __typename?: 'ReceiveOptionEntity', country: string, currency: string, railCode: string, railName: string, provider: string, providers: Array<string>, status: string, requestId?: string | null, virtualAccountId?: string | null, vaRequestState?: string | null, reason?: string | null, eligible: boolean, ineligibleReason?: string | null, blockers: Array<{ __typename?: 'VaBlockerEntity', code: string, category: string, message: string }> }> };

export type Transactions_ListQueryVariables = Exact<{
  input: ListTransactionsInput;
}>;


export type Transactions_ListQuery = { __typename?: 'Query', transactions_list: { __typename?: 'ListTransactionsResponse', total: number, has_more: boolean, data: Array<{ __typename?: 'TransactionEntity', id: string, type: string, status: string, amount: string, currency: string, description?: string | null, metadata?: any | null, created_at: string, completed_at?: string | null }> } };

export type Transactions_PaymentLinkCapabilitiesQueryVariables = Exact<{ [key: string]: never; }>;


export type Transactions_PaymentLinkCapabilitiesQuery = { __typename?: 'Query', transactions_paymentLinkCapabilities: { __typename?: 'PaymentLinkCapabilitiesEntity', supported_currencies: Array<string>, supported_payment_methods: Array<string>, payment_link_rails: Array<string>, minimum_amounts: any, capabilities: Array<{ __typename?: 'CurrencyPaymentMethodCapabilityEntity', currency: string, payment_methods: Array<string>, minimum_amount: number, description: string }>, catalog_rules: { __typename?: 'PaymentLinkCatalogRulesEntity', currencies: Array<string>, minimum_amounts: any }, provider_rules: { __typename?: 'PaymentLinkProviderRulesEntity', currencies: Array<string>, payment_methods: Array<string>, capabilities: Array<{ __typename?: 'CurrencyPaymentMethodCapabilityEntity', currency: string, payment_methods: Array<string>, minimum_amount: number, description: string }> } } };

export type Wallets_AvailableChainsQueryVariables = Exact<{ [key: string]: never; }>;


export type Wallets_AvailableChainsQuery = { __typename?: 'Query', wallets_availableChains: { __typename?: 'AvailableChainsResponse', chains: Array<string>, default_chain: string, currency: string } };

export type Wallets_DepositInstructionsQueryVariables = Exact<{
  walletId: Scalars['String']['input'];
  customerId: Scalars['String']['input'];
}>;


export type Wallets_DepositInstructionsQuery = { __typename?: 'Query', wallets_depositInstructions: { __typename?: 'DepositInstructionsResponse', customer_id: string, wallet_id: string, network?: string | null, virtual_accounts: Array<{ __typename?: 'VirtualAccountItem', id: string, payment_rail: string, currency: string, status: string, account_number?: string | null, account_type?: string | null, bank_name?: string | null, beneficiary_address?: string | null, beneficiary_name?: string | null, clabe?: string | null, iban?: string | null, nit?: string | null, reference?: string | null, routing_number?: string | null, swift_code?: string | null, bic?: string | null, sort_code?: string | null, br_code?: string | null, account_holder_name?: string | null, bank_address?: string | null, bank_beneficiary_name?: string | null, bank_beneficiary_address?: string | null, payment_rails?: Array<string> | null, linked_manually?: boolean | null, linked_at?: string | null }> } };

export type Wallets_GetBalanceQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type Wallets_GetBalanceQuery = { __typename?: 'Query', wallets_getBalance: { __typename?: 'WalletBalanceEntity', wallet_id: string, currency: string, available_balance: string, spendable_balance: string, pending_balance: string, total_balance: string, updated_at: string } };

export type Wallets_ListByCustomerQueryVariables = Exact<{
  customerId: Scalars['String']['input'];
}>;


export type Wallets_ListByCustomerQuery = { __typename?: 'Query', wallets_listByCustomer: { __typename?: 'ListWalletsResponse', has_more: boolean, page: number, page_size: number, total: number, total_pages: number, default_wallet?: { __typename?: 'ResolvedDefaultWalletEntity', currency: string, chain: string } | null, data: Array<{ __typename?: 'WalletEntity', id: string, customer_id: string, currency: string, chain: string, status: string, alias?: string | null, address?: string | null, created_at: string }> } };

export type Wallets_TransactionsQueryVariables = Exact<{
  id: Scalars['String']['input'];
  filters?: InputMaybe<TransactionListFiltersInput>;
}>;


export type Wallets_TransactionsQuery = { __typename?: 'Query', wallets_transactions: { __typename?: 'WalletTransactionListResponse', has_more: boolean, page: number, page_size: number, total: number, total_pages: number, transactions: Array<{ __typename?: 'WalletTransactionEntity', id: string, amount: string, currency: string, type: string, status: string, description?: string | null, external_reference?: string | null, created_at: string, completed_at?: string | null, fee?: string | null, fee_currency?: string | null, refunded: boolean, source?: any | null, destination?: any | null }> } };

export type TenantListBeneficiariesQueryVariables = Exact<{
  filters?: InputMaybe<Scalars['JSONObject']['input']>;
}>;


export type TenantListBeneficiariesQuery = { __typename?: 'Query', tenant_listBeneficiaries: any };

export type TenantGetBeneficiaryQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type TenantGetBeneficiaryQuery = { __typename?: 'Query', tenant_getBeneficiary: any };

export type TenantQuoteRateQueryVariables = Exact<{
  filters: Scalars['JSONObject']['input'];
}>;


export type TenantQuoteRateQuery = { __typename?: 'Query', tenant_quoteRate: any };

export type TenantGetQuoteQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type TenantGetQuoteQuery = { __typename?: 'Query', tenant_getQuote: any };

export type TenantListRailsQueryVariables = Exact<{ [key: string]: never; }>;


export type TenantListRailsQuery = { __typename?: 'Query', tenant_listRails: any };

export type TenantRailCatalogueQueryVariables = Exact<{
  country?: InputMaybe<Scalars['String']['input']>;
}>;


export type TenantRailCatalogueQuery = { __typename?: 'Query', tenant_railCatalogue: any };

export type TenantVirtualAccountReceiveOptionsQueryVariables = Exact<{
  filters: Scalars['JSONObject']['input'];
}>;


export type TenantVirtualAccountReceiveOptionsQuery = { __typename?: 'Query', tenant_virtualAccountReceiveOptions: any };

export type TenantListWebhooksQueryVariables = Exact<{ [key: string]: never; }>;


export type TenantListWebhooksQuery = { __typename?: 'Query', tenant_listWebhooks: any };

export type TenantWebhookEventTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type TenantWebhookEventTypesQuery = { __typename?: 'Query', tenant_webhookEventTypes: any };

export type TenantWebhookLogsQueryVariables = Exact<{
  filters?: InputMaybe<Scalars['JSONObject']['input']>;
}>;


export type TenantWebhookLogsQuery = { __typename?: 'Query', tenant_webhookLogs: any };

export type TenantWebhookLogQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type TenantWebhookLogQuery = { __typename?: 'Query', tenant_webhookLog: any };

export type TenantMeQueryVariables = Exact<{ [key: string]: never; }>;


export type TenantMeQuery = { __typename?: 'Query', tenant_me: { __typename?: 'TenantMe', client_id: string, name: string, status: string, api_key_prefix: string, api_key_rotated_at?: string | null, api_key_expires_at?: string | null, environment: string, enabled_rails: Array<{ __typename?: 'TenantEnabledRail', code: string, currency: string, country?: string | null }>, acting_as?: { __typename?: 'TenantActingAs', staff_email?: string | null, staff_roles: Array<string> } | null } };

export type TenantListCustomersQueryVariables = Exact<{
  filters?: InputMaybe<Scalars['JSONObject']['input']>;
}>;


export type TenantListCustomersQuery = { __typename?: 'Query', tenant_listCustomers: any };

export type TenantGetCustomerQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type TenantGetCustomerQuery = { __typename?: 'Query', tenant_getCustomer: any };

export type TenantListCustomerRailsQueryVariables = Exact<{
  id: Scalars['String']['input'];
  include_pending?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type TenantListCustomerRailsQuery = { __typename?: 'Query', tenant_listCustomerRails: any };

export type TenantListCustomerRequirementsQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type TenantListCustomerRequirementsQuery = { __typename?: 'Query', tenant_listCustomerRequirements: any };

export type TenantWalletAvailableChainsQueryVariables = Exact<{ [key: string]: never; }>;


export type TenantWalletAvailableChainsQuery = { __typename?: 'Query', tenant_walletAvailableChains: any };

export type TenantListWalletsQueryVariables = Exact<{
  customer_id?: InputMaybe<Scalars['String']['input']>;
}>;


export type TenantListWalletsQuery = { __typename?: 'Query', tenant_listWallets: any };

export type TenantGetWalletQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type TenantGetWalletQuery = { __typename?: 'Query', tenant_getWallet: any };

export type TenantWalletBalanceQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type TenantWalletBalanceQuery = { __typename?: 'Query', tenant_walletBalance: any };

export type TenantWalletDepositInstructionsQueryVariables = Exact<{
  id: Scalars['String']['input'];
  customer_id?: InputMaybe<Scalars['String']['input']>;
}>;


export type TenantWalletDepositInstructionsQuery = { __typename?: 'Query', tenant_walletDepositInstructions: any };

export type TenantWalletTransactionsQueryVariables = Exact<{
  id: Scalars['String']['input'];
  filters?: InputMaybe<Scalars['JSONObject']['input']>;
}>;


export type TenantWalletTransactionsQuery = { __typename?: 'Query', tenant_walletTransactions: any };

export type TenantListTransactionsQueryVariables = Exact<{
  filters?: InputMaybe<Scalars['JSONObject']['input']>;
}>;


export type TenantListTransactionsQuery = { __typename?: 'Query', tenant_listTransactions: any };

export type TenantGetTransactionQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type TenantGetTransactionQuery = { __typename?: 'Query', tenant_getTransaction: any };

export type TenantPaymentLinkCapabilitiesQueryVariables = Exact<{ [key: string]: never; }>;


export type TenantPaymentLinkCapabilitiesQuery = { __typename?: 'Query', tenant_paymentLinkCapabilities: any };

export type TenantListTeamQueryVariables = Exact<{ [key: string]: never; }>;


export type TenantListTeamQuery = { __typename?: 'Query', tenant_listTeam: Array<{ __typename?: 'TenantTeamMember', id: string, email: string, first_name?: string | null, last_name?: string | null, created_at: string }> };


export const AdminLoopayReviewBeneficiaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminLoopayReviewBeneficiary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewBeneficiaryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_reviewBeneficiary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_id"}},{"kind":"Field","name":{"kind":"Name","value":"previous_status"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"review_reason"}},{"kind":"Field","name":{"kind":"Name","value":"reviewed_by"}},{"kind":"Field","name":{"kind":"Name","value":"reviewed_at"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayReviewBeneficiaryMutation, AdminLoopayReviewBeneficiaryMutationVariables>;
export const AdminLoopayLinkBeneficiaryProviderIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminLoopayLinkBeneficiaryProviderId"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LinkBeneficiaryProviderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_linkBeneficiaryProviderId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_id"}},{"kind":"Field","name":{"kind":"Name","value":"provider_id"}},{"kind":"Field","name":{"kind":"Name","value":"provider_code"}},{"kind":"Field","name":{"kind":"Name","value":"provider_beneficiary_id"}},{"kind":"Field","name":{"kind":"Name","value":"linked_at"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayLinkBeneficiaryProviderIdMutation, AdminLoopayLinkBeneficiaryProviderIdMutationVariables>;
export const AdminLoopayDeactivateBeneficiaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminLoopayDeactivateBeneficiary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_deactivateBeneficiary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"clientId"}},{"kind":"Field","name":{"kind":"Name","value":"customerExternalId"}},{"kind":"Field","name":{"kind":"Name","value":"customerEmail"}},{"kind":"Field","name":{"kind":"Name","value":"railId"}},{"kind":"Field","name":{"kind":"Name","value":"railCode"}},{"kind":"Field","name":{"kind":"Name","value":"railName"}},{"kind":"Field","name":{"kind":"Name","value":"railCountry"}},{"kind":"Field","name":{"kind":"Name","value":"providerId"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"providerName"}},{"kind":"Field","name":{"kind":"Name","value":"relationship"}},{"kind":"Field","name":{"kind":"Name","value":"holderType"}},{"kind":"Field","name":{"kind":"Name","value":"holderName"}},{"kind":"Field","name":{"kind":"Name","value":"holderTaxId"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"bankDetails"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isFavorite"}},{"kind":"Field","name":{"kind":"Name","value":"providerBeneficiaryId"}},{"kind":"Field","name":{"kind":"Name","value":"providerMetadata"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayDeactivateBeneficiaryMutation, AdminLoopayDeactivateBeneficiaryMutationVariables>;
export const AdminLoopayReactivateBeneficiaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminLoopayReactivateBeneficiary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_reactivateBeneficiary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"clientId"}},{"kind":"Field","name":{"kind":"Name","value":"customerExternalId"}},{"kind":"Field","name":{"kind":"Name","value":"customerEmail"}},{"kind":"Field","name":{"kind":"Name","value":"railId"}},{"kind":"Field","name":{"kind":"Name","value":"railCode"}},{"kind":"Field","name":{"kind":"Name","value":"railName"}},{"kind":"Field","name":{"kind":"Name","value":"railCountry"}},{"kind":"Field","name":{"kind":"Name","value":"providerId"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"providerName"}},{"kind":"Field","name":{"kind":"Name","value":"relationship"}},{"kind":"Field","name":{"kind":"Name","value":"holderType"}},{"kind":"Field","name":{"kind":"Name","value":"holderName"}},{"kind":"Field","name":{"kind":"Name","value":"holderTaxId"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"bankDetails"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isFavorite"}},{"kind":"Field","name":{"kind":"Name","value":"providerBeneficiaryId"}},{"kind":"Field","name":{"kind":"Name","value":"providerMetadata"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayReactivateBeneficiaryMutation, AdminLoopayReactivateBeneficiaryMutationVariables>;
export const AdminLoopayUpdateCustomerStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminLoopayUpdateCustomerStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUpdateCustomerStatusInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_updateCustomerStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"previous_status"}},{"kind":"Field","name":{"kind":"Name","value":"current_status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"changed_by"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayUpdateCustomerStatusMutation, AdminLoopayUpdateCustomerStatusMutationVariables>;
export const AdminLoopayReviewEndorsementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminLoopayReviewEndorsement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewEndorsementInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_reviewEndorsement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_id"}},{"kind":"Field","name":{"kind":"Name","value":"rail_code"}},{"kind":"Field","name":{"kind":"Name","value":"previous_status"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"review_reason"}},{"kind":"Field","name":{"kind":"Name","value":"activated_at"}},{"kind":"Field","name":{"kind":"Name","value":"reviewed_by"}},{"kind":"Field","name":{"kind":"Name","value":"reviewed_at"}},{"kind":"Field","name":{"kind":"Name","value":"onboarding"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"provider_code"}},{"kind":"Field","name":{"kind":"Name","value":"error_code"}},{"kind":"Field","name":{"kind":"Name","value":"error_message"}},{"kind":"Field","name":{"kind":"Name","value":"missing_fields"}},{"kind":"Field","name":{"kind":"Name","value":"missing_field_details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"group"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AdminLoopayReviewEndorsementMutation, AdminLoopayReviewEndorsementMutationVariables>;
export const AdminLoopayRetryEndorsementOnboardingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminLoopayRetryEndorsementOnboarding"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endorsementId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"providerProfile"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerProviderProfileInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_retryEndorsementOnboarding"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"endorsementId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endorsementId"}}},{"kind":"Argument","name":{"kind":"Name","value":"providerProfile"},"value":{"kind":"Variable","name":{"kind":"Name","value":"providerProfile"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"provider_code"}},{"kind":"Field","name":{"kind":"Name","value":"error_code"}},{"kind":"Field","name":{"kind":"Name","value":"error_message"}},{"kind":"Field","name":{"kind":"Name","value":"missing_fields"}},{"kind":"Field","name":{"kind":"Name","value":"missing_field_details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"group"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}}]}}]}}]}}]} as unknown as DocumentNode<AdminLoopayRetryEndorsementOnboardingMutation, AdminLoopayRetryEndorsementOnboardingMutationVariables>;
export const AdminLoopayStartProviderBeneficiaryVerificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminLoopayStartProviderBeneficiaryVerification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"beneficiaryId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_startProviderBeneficiaryVerification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"beneficiaryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"beneficiaryId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"provider_code"}},{"kind":"Field","name":{"kind":"Name","value":"provider_beneficiary_id"}},{"kind":"Field","name":{"kind":"Name","value":"verification_started"}},{"kind":"Field","name":{"kind":"Name","value":"started_at"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayStartProviderBeneficiaryVerificationMutation, AdminLoopayStartProviderBeneficiaryVerificationMutationVariables>;
export const AdminLoopaySimulateProviderBeneficiaryVerificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminLoopaySimulateProviderBeneficiaryVerification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"beneficiaryId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"outcome"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SandboxProviderOutcome"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_simulateProviderBeneficiaryVerification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"beneficiaryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"beneficiaryId"}}},{"kind":"Argument","name":{"kind":"Name","value":"outcome"},"value":{"kind":"Variable","name":{"kind":"Name","value":"outcome"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"accepted"}},{"kind":"Field","name":{"kind":"Name","value":"outcome"}},{"kind":"Field","name":{"kind":"Name","value":"providerRequestId"}}]}}]}}]} as unknown as DocumentNode<AdminLoopaySimulateProviderBeneficiaryVerificationMutation, AdminLoopaySimulateProviderBeneficiaryVerificationMutationVariables>;
export const AdminLoopaySimulateProviderDepositDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminLoopaySimulateProviderDeposit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"virtualAccountId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_simulateProviderDeposit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"virtualAccountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"virtualAccountId"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"accepted"}},{"kind":"Field","name":{"kind":"Name","value":"outcome"}},{"kind":"Field","name":{"kind":"Name","value":"providerRequestId"}}]}}]}}]} as unknown as DocumentNode<AdminLoopaySimulateProviderDepositMutation, AdminLoopaySimulateProviderDepositMutationVariables>;
export const CompleteRegistrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteRegistration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompleteRegistrationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"auth_completeRegistration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"completeRegistrationInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"auth_uid"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CompleteRegistrationMutation, CompleteRegistrationMutationVariables>;
export const SignUpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SignUp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"signUpInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SignUpInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"auth_signUp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signUpInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"signUpInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"auth_uid"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<SignUpMutation, SignUpMutationVariables>;
export const UserRegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UserRegister"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user_register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"auth_uid"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"customer_profile_id"}},{"kind":"Field","name":{"kind":"Name","value":"kyc_link"}},{"kind":"Field","name":{"kind":"Name","value":"kyc_status"}}]}}]}}]} as unknown as DocumentNode<UserRegisterMutation, UserRegisterMutationVariables>;
export const CreateCustomerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCustomer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCustomerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customers_create"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_type"}},{"kind":"Field","name":{"kind":"Name","value":"business_name"}},{"kind":"Field","name":{"kind":"Name","value":"kyc_status"}},{"kind":"Field","name":{"kind":"Name","value":"kyc_link"}},{"kind":"Field","name":{"kind":"Name","value":"tos_link"}},{"kind":"Field","name":{"kind":"Name","value":"next_required_action"}},{"kind":"Field","name":{"kind":"Name","value":"kyc_snapshot"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lifecycle"}},{"kind":"Field","name":{"kind":"Name","value":"provider_customer_state"}},{"kind":"Field","name":{"kind":"Name","value":"onboarding_mode"}},{"kind":"Field","name":{"kind":"Name","value":"prefill"}},{"kind":"Field","name":{"kind":"Name","value":"tos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accepted"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requirements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fields"}},{"kind":"Field","name":{"kind":"Name","value":"document_purposes"}},{"kind":"Field","name":{"kind":"Name","value":"questionnaire_fields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pending"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"target_type"}},{"kind":"Field","name":{"kind":"Name","value":"target_key"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reasons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"target_type"}},{"kind":"Field","name":{"kind":"Name","value":"target_key"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"actions"}},{"kind":"Field","name":{"kind":"Name","value":"freshness"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"snapshot_generated_at"}},{"kind":"Field","name":{"kind":"Name","value":"provider_checked_at"}},{"kind":"Field","name":{"kind":"Name","value":"webhook_updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"last_reconciliation_source"}},{"kind":"Field","name":{"kind":"Name","value":"reconciliation_state"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CreateCustomerMutation, CreateCustomerMutationVariables>;
export const GetTosLinkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GetTosLink"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetTosLinkInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customers_getTosLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tos_url"}}]}}]}}]} as unknown as DocumentNode<GetTosLinkMutation, GetTosLinkMutationVariables>;
export const RefreshKycSnapshotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshKycSnapshot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RefreshKycSnapshotInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customers_refreshKycSnapshot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lifecycle"}},{"kind":"Field","name":{"kind":"Name","value":"provider_customer_state"}},{"kind":"Field","name":{"kind":"Name","value":"onboarding_mode"}},{"kind":"Field","name":{"kind":"Name","value":"prefill"}},{"kind":"Field","name":{"kind":"Name","value":"tos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accepted"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"next_step"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"route"}},{"kind":"Field","name":{"kind":"Name","value":"rail"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requirements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fields"}},{"kind":"Field","name":{"kind":"Name","value":"document_purposes"}},{"kind":"Field","name":{"kind":"Name","value":"questionnaire_fields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pending"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"target_type"}},{"kind":"Field","name":{"kind":"Name","value":"target_key"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reasons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"target_type"}},{"kind":"Field","name":{"kind":"Name","value":"target_key"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"actions"}},{"kind":"Field","name":{"kind":"Name","value":"freshness"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"snapshot_generated_at"}},{"kind":"Field","name":{"kind":"Name","value":"provider_checked_at"}},{"kind":"Field","name":{"kind":"Name","value":"webhook_updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"last_reconciliation_source"}},{"kind":"Field","name":{"kind":"Name","value":"reconciliation_state"}}]}}]}}]}}]} as unknown as DocumentNode<RefreshKycSnapshotMutation, RefreshKycSnapshotMutationVariables>;
export const RetryKycDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RetryKyc"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RetryKycInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customers_retryKyc"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lifecycle"}},{"kind":"Field","name":{"kind":"Name","value":"provider_customer_state"}},{"kind":"Field","name":{"kind":"Name","value":"tos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accepted"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requirements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fields"}},{"kind":"Field","name":{"kind":"Name","value":"document_purposes"}},{"kind":"Field","name":{"kind":"Name","value":"questionnaire_fields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pending"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"target_type"}},{"kind":"Field","name":{"kind":"Name","value":"target_key"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reasons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"target_type"}},{"kind":"Field","name":{"kind":"Name","value":"target_key"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"actions"}},{"kind":"Field","name":{"kind":"Name","value":"freshness"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"snapshot_generated_at"}},{"kind":"Field","name":{"kind":"Name","value":"provider_checked_at"}},{"kind":"Field","name":{"kind":"Name","value":"webhook_updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"last_reconciliation_source"}},{"kind":"Field","name":{"kind":"Name","value":"reconciliation_state"}}]}}]}}]}}]} as unknown as DocumentNode<RetryKycMutation, RetryKycMutationVariables>;
export const Transactions_CreateOffRampDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"transactions_createOffRamp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOffRampInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions_createOffRamp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transaction_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<Transactions_CreateOffRampMutation, Transactions_CreateOffRampMutationVariables>;
export const Customers_AddEndorsementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"customers_addEndorsement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddEndorsementInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customers_addEndorsement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"payment_rail"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"available_countries"}},{"kind":"Field","name":{"kind":"Name","value":"kyc_link"}},{"kind":"Field","name":{"kind":"Name","value":"tos_link"}},{"kind":"Field","name":{"kind":"Name","value":"readiness"}},{"kind":"Field","name":{"kind":"Name","value":"artifact_type"}}]}}]}}]} as unknown as DocumentNode<Customers_AddEndorsementMutation, Customers_AddEndorsementMutationVariables>;
export const Quotes_CreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"quotes_create"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateQuoteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quotes_create"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"from_currency"}},{"kind":"Field","name":{"kind":"Name","value":"to_currency"}},{"kind":"Field","name":{"kind":"Name","value":"from_amount"}},{"kind":"Field","name":{"kind":"Name","value":"to_amount"}},{"kind":"Field","name":{"kind":"Name","value":"rate"}},{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<Quotes_CreateMutation, Quotes_CreateMutationVariables>;
export const Transactions_CreateDispersionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"transactions_createDispersion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateDispersionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions_createDispersion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transaction_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<Transactions_CreateDispersionMutation, Transactions_CreateDispersionMutationVariables>;
export const Transactions_CreateP2PDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"transactions_createP2P"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateP2PInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions_createP2P"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transaction_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<Transactions_CreateP2PMutation, Transactions_CreateP2PMutationVariables>;
export const Transactions_CreatePaymentLinkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"transactions_createPaymentLink"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePaymentLinkInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions_createPaymentLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payment_url"}},{"kind":"Field","name":{"kind":"Name","value":"payment_link_id"}},{"kind":"Field","name":{"kind":"Name","value":"expires_at"}}]}}]}}]} as unknown as DocumentNode<Transactions_CreatePaymentLinkMutation, Transactions_CreatePaymentLinkMutationVariables>;
export const Transactions_CreateTransferDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"transactions_createTransfer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTransferInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions_createTransfer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transaction_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<Transactions_CreateTransferMutation, Transactions_CreateTransferMutationVariables>;
export const VirtualAccounts_RequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"virtualAccounts_request"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RequestVirtualAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"virtualAccounts_request"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"request"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"railCode"}},{"kind":"Field","name":{"kind":"Name","value":"railName"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"providers"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"virtualAccountId"}},{"kind":"Field","name":{"kind":"Name","value":"vaRequestState"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"blockers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]}}]} as unknown as DocumentNode<VirtualAccounts_RequestMutation, VirtualAccounts_RequestMutationVariables>;
export const Wallets_CreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"wallets_create"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateWalletInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wallets_create"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"chain"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<Wallets_CreateMutation, Wallets_CreateMutationVariables>;
export const TenantCreateBeneficiaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantCreateBeneficiary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_createBeneficiary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<TenantCreateBeneficiaryMutation, TenantCreateBeneficiaryMutationVariables>;
export const TenantUpdateBeneficiaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantUpdateBeneficiary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_updateBeneficiary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<TenantUpdateBeneficiaryMutation, TenantUpdateBeneficiaryMutationVariables>;
export const TenantDeleteBeneficiaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantDeleteBeneficiary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_deleteBeneficiary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<TenantDeleteBeneficiaryMutation, TenantDeleteBeneficiaryMutationVariables>;
export const TenantDeactivateBeneficiaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantDeactivateBeneficiary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_deactivateBeneficiary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<TenantDeactivateBeneficiaryMutation, TenantDeactivateBeneficiaryMutationVariables>;
export const TenantReactivateBeneficiaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantReactivateBeneficiary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_reactivateBeneficiary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<TenantReactivateBeneficiaryMutation, TenantReactivateBeneficiaryMutationVariables>;
export const TenantCreateQuoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantCreateQuote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_createQuote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<TenantCreateQuoteMutation, TenantCreateQuoteMutationVariables>;
export const TenantRequestVirtualAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantRequestVirtualAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_requestVirtualAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<TenantRequestVirtualAccountMutation, TenantRequestVirtualAccountMutationVariables>;
export const TenantCreateWebhookDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantCreateWebhook"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_createWebhook"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<TenantCreateWebhookMutation, TenantCreateWebhookMutationVariables>;
export const TenantUpdateWebhookDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantUpdateWebhook"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_updateWebhook"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<TenantUpdateWebhookMutation, TenantUpdateWebhookMutationVariables>;
export const TenantDeleteWebhookDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantDeleteWebhook"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_deleteWebhook"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<TenantDeleteWebhookMutation, TenantDeleteWebhookMutationVariables>;
export const TenantTestWebhookDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantTestWebhook"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_testWebhook"}}]}}]} as unknown as DocumentNode<TenantTestWebhookMutation, TenantTestWebhookMutationVariables>;
export const TenantCreateCustomerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantCreateCustomer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_createCustomer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<TenantCreateCustomerMutation, TenantCreateCustomerMutationVariables>;
export const TenantRetryCustomerKycDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantRetryCustomerKyc"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_retryCustomerKyc"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<TenantRetryCustomerKycMutation, TenantRetryCustomerKycMutationVariables>;
export const TenantSubmitCustomerRequirementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantSubmitCustomerRequirement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"requirement_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_submitCustomerRequirement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"requirement_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"requirement_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<TenantSubmitCustomerRequirementMutation, TenantSubmitCustomerRequirementMutationVariables>;
export const TenantCreateWalletDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantCreateWallet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_createWallet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<TenantCreateWalletMutation, TenantCreateWalletMutationVariables>;
export const TenantCreateOffRampDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantCreateOffRamp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_createOffRamp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<TenantCreateOffRampMutation, TenantCreateOffRampMutationVariables>;
export const TenantCreateDispersionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantCreateDispersion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_createDispersion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<TenantCreateDispersionMutation, TenantCreateDispersionMutationVariables>;
export const TenantCreateTransferDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantCreateTransfer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_createTransfer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<TenantCreateTransferMutation, TenantCreateTransferMutationVariables>;
export const TenantCreatePaymentLinkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantCreatePaymentLink"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_createPaymentLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<TenantCreatePaymentLinkMutation, TenantCreatePaymentLinkMutationVariables>;
export const TenantRegenerateApiKeyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantRegenerateApiKey"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"graceMinutes"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expiresAt"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scopes"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_regenerateApiKey"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"graceMinutes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"graceMinutes"}}},{"kind":"Argument","name":{"kind":"Name","value":"expiresAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expiresAt"}}},{"kind":"Argument","name":{"kind":"Name","value":"scopes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scopes"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"api_key"}},{"kind":"Field","name":{"kind":"Name","value":"api_key_prefix"}}]}}]}}]} as unknown as DocumentNode<TenantRegenerateApiKeyMutation, TenantRegenerateApiKeyMutationVariables>;
export const TenantInviteAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantInviteAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InviteTenantAdminInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_inviteAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"password_setup_link"}}]}}]}}]} as unknown as DocumentNode<TenantInviteAdminMutation, TenantInviteAdminMutationVariables>;
export const TenantRemoveAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TenantRemoveAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_removeAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<TenantRemoveAdminMutation, TenantRemoveAdminMutationVariables>;
export const AdminCommercialClientProviderOnboardingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminCommercialClientProviderOnboarding"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_clientProviderOnboarding"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"clientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"clientId"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"providerCustomerId"}},{"kind":"Field","name":{"kind":"Name","value":"lastErrorCode"}},{"kind":"Field","name":{"kind":"Name","value":"linkedAt"}},{"kind":"Field","name":{"kind":"Name","value":"linkedByUserId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"attempts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNo"}},{"kind":"Field","name":{"kind":"Name","value":"actorUserId"}},{"kind":"Field","name":{"kind":"Name","value":"requestSummary"}},{"kind":"Field","name":{"kind":"Name","value":"responseSummary"}},{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"missingFields"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<AdminCommercialClientProviderOnboardingQuery, AdminCommercialClientProviderOnboardingQueryVariables>;
export const AdminCommercialClientOnboardingProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminCommercialClientOnboardingProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_getClient"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}}]}}]}}]} as unknown as DocumentNode<AdminCommercialClientOnboardingProfileQuery, AdminCommercialClientOnboardingProfileQueryVariables>;
export const AdminCommercialListFeeSchedulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminCommercialListFeeSchedules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeInactive"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_listFeeSchedules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"clientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeInactive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeInactive"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"clientId"}},{"kind":"Field","name":{"kind":"Name","value":"railCode"}},{"kind":"Field","name":{"kind":"Name","value":"operation"}},{"kind":"Field","name":{"kind":"Name","value":"mode"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"minAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"createdByUserId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<AdminCommercialListFeeSchedulesQuery, AdminCommercialListFeeSchedulesQueryVariables>;
export const AdminCommercialListFeeLedgerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminCommercialListFeeLedger"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"from"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"to"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"operation"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"FeeOperation"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_listFeeLedger"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"clientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}}},{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"from"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"to"}}},{"kind":"Argument","name":{"kind":"Name","value":"operation"},"value":{"kind":"Variable","name":{"kind":"Name","value":"operation"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"transactionId"}},{"kind":"Field","name":{"kind":"Name","value":"clientId"}},{"kind":"Field","name":{"kind":"Name","value":"operation"}},{"kind":"Field","name":{"kind":"Name","value":"railCode"}},{"kind":"Field","name":{"kind":"Name","value":"baseAmount"}},{"kind":"Field","name":{"kind":"Name","value":"feeAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"feeScheduleId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<AdminCommercialListFeeLedgerQuery, AdminCommercialListFeeLedgerQueryVariables>;
export const AdminCommercialFeeLedgerSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminCommercialFeeLedgerSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"from"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"to"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_feeLedgerSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"clientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}}},{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"from"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"to"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"operation"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<AdminCommercialFeeLedgerSummaryQuery, AdminCommercialFeeLedgerSummaryQueryVariables>;
export const AdminCommercialProviderPaymentRailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminCommercialProviderPaymentRails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_listProviderPaymentRails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"provider"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<AdminCommercialProviderPaymentRailsQuery, AdminCommercialProviderPaymentRailsQueryVariables>;
export const AdminCommercialClientProviderRailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminCommercialClientProviderRails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_listClientProviderRails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"clientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"provider_id"}},{"kind":"Field","name":{"kind":"Name","value":"rail_id"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}}]}}]}}]} as unknown as DocumentNode<AdminCommercialClientProviderRailsQuery, AdminCommercialClientProviderRailsQueryVariables>;
export const AdminLoopayListPendingBeneficiariesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminLoopayListPendingBeneficiaries"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"BeneficiaryQueueFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_listPendingBeneficiaries"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_email"}},{"kind":"Field","name":{"kind":"Name","value":"client_id"}},{"kind":"Field","name":{"kind":"Name","value":"client_name"}},{"kind":"Field","name":{"kind":"Name","value":"rail_code"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"holder_name"}},{"kind":"Field","name":{"kind":"Name","value":"holder_type"}},{"kind":"Field","name":{"kind":"Name","value":"relationship"}},{"kind":"Field","name":{"kind":"Name","value":"bank_details"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayListPendingBeneficiariesQuery, AdminLoopayListPendingBeneficiariesQueryVariables>;
export const AdminLoopayListAllBeneficiariesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminLoopayListAllBeneficiaries"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"where"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminBeneficiaryFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_listBeneficiaries"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"Variable","name":{"kind":"Name","value":"where"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"clientId"}},{"kind":"Field","name":{"kind":"Name","value":"customerExternalId"}},{"kind":"Field","name":{"kind":"Name","value":"customerEmail"}},{"kind":"Field","name":{"kind":"Name","value":"railId"}},{"kind":"Field","name":{"kind":"Name","value":"railCode"}},{"kind":"Field","name":{"kind":"Name","value":"railName"}},{"kind":"Field","name":{"kind":"Name","value":"railCountry"}},{"kind":"Field","name":{"kind":"Name","value":"providerId"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"providerName"}},{"kind":"Field","name":{"kind":"Name","value":"relationship"}},{"kind":"Field","name":{"kind":"Name","value":"holderType"}},{"kind":"Field","name":{"kind":"Name","value":"holderName"}},{"kind":"Field","name":{"kind":"Name","value":"holderTaxId"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"bankDetails"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isFavorite"}},{"kind":"Field","name":{"kind":"Name","value":"providerBeneficiaryId"}},{"kind":"Field","name":{"kind":"Name","value":"providerMetadata"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"reviewStatus"}},{"kind":"Field","name":{"kind":"Name","value":"reviewReason"}},{"kind":"Field","name":{"kind":"Name","value":"reviewedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayListAllBeneficiariesQuery, AdminLoopayListAllBeneficiariesQueryVariables>;
export const AdminLoopayListClientOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminLoopayListClientOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_listClientOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"client_id"}},{"kind":"Field","name":{"kind":"Name","value":"client_name"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayListClientOptionsQuery, AdminLoopayListClientOptionsQueryVariables>;
export const AdminLoopayListCustomersSearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminLoopayListCustomersSearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"where"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCustomerFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_listCustomers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"Variable","name":{"kind":"Name","value":"where"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"clientId"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayListCustomersSearchQuery, AdminLoopayListCustomersSearchQueryVariables>;
export const AdminLoopayListCustomersManagementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminLoopayListCustomersManagement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"where"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCustomerFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_listCustomers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"Variable","name":{"kind":"Name","value":"where"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"clientId"}},{"kind":"Field","name":{"kind":"Name","value":"externalId"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"taxId"}},{"kind":"Field","name":{"kind":"Name","value":"taxIdTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"kycStatus"}},{"kind":"Field","name":{"kind":"Name","value":"customerStatus"}},{"kind":"Field","name":{"kind":"Name","value":"capabilities"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReasons"}},{"kind":"Field","name":{"kind":"Name","value":"addressDetails"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}},{"kind":"Field","name":{"kind":"Name","value":"bridgeCustomerId"}},{"kind":"Field","name":{"kind":"Name","value":"bridgeKycLevel"}},{"kind":"Field","name":{"kind":"Name","value":"bridgeKycUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayListCustomersManagementQuery, AdminLoopayListCustomersManagementQueryVariables>;
export const AdminLoopayListWalletsByCustomerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminLoopayListWalletsByCustomer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_listWalletsByCustomer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"clientId"}},{"kind":"Field","name":{"kind":"Name","value":"providerId"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"walletType"}},{"kind":"Field","name":{"kind":"Name","value":"chain"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"alreadyExisted"}},{"kind":"Field","name":{"kind":"Name","value":"virtualAccountIds"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayListWalletsByCustomerQuery, AdminLoopayListWalletsByCustomerQueryVariables>;
export const AdminLoopayListPendingDispersionesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminLoopayListPendingDispersiones"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DispersionQueueFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_listPendingDispersiones"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reference_code"}},{"kind":"Field","name":{"kind":"Name","value":"customer_id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_email"}},{"kind":"Field","name":{"kind":"Name","value":"client_id"}},{"kind":"Field","name":{"kind":"Name","value":"client_name"}},{"kind":"Field","name":{"kind":"Name","value":"wallet_id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"held_amount"}},{"kind":"Field","name":{"kind":"Name","value":"funds_location"}},{"kind":"Field","name":{"kind":"Name","value":"beneficiary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"holder_name"}},{"kind":"Field","name":{"kind":"Name","value":"rail_code"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"bank_details"}}]}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"review_reason"}},{"kind":"Field","name":{"kind":"Name","value":"reviewed_at"}},{"kind":"Field","name":{"kind":"Name","value":"quote_rate"}},{"kind":"Field","name":{"kind":"Name","value":"quote_source_amount"}},{"kind":"Field","name":{"kind":"Name","value":"quote_source_currency"}},{"kind":"Field","name":{"kind":"Name","value":"quote_target_amount"}},{"kind":"Field","name":{"kind":"Name","value":"quote_target_currency"}},{"kind":"Field","name":{"kind":"Name","value":"fee_amount"}},{"kind":"Field","name":{"kind":"Name","value":"fee_source"}},{"kind":"Field","name":{"kind":"Name","value":"fee_currency"}},{"kind":"Field","name":{"kind":"Name","value":"settlement_amount"}},{"kind":"Field","name":{"kind":"Name","value":"settlement_currency"}},{"kind":"Field","name":{"kind":"Name","value":"settlement_rate"}},{"kind":"Field","name":{"kind":"Name","value":"settlement_bank_rate"}},{"kind":"Field","name":{"kind":"Name","value":"settlement_fees"}},{"kind":"Field","name":{"kind":"Name","value":"settlement_external_reference"}},{"kind":"Field","name":{"kind":"Name","value":"dispersion_state"}},{"kind":"Field","name":{"kind":"Name","value":"selected_provider"}},{"kind":"Field","name":{"kind":"Name","value":"payout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"terminalVendorStatus"}},{"kind":"Field","name":{"kind":"Name","value":"placedAt"}},{"kind":"Field","name":{"kind":"Name","value":"terminalAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"funding_status"}},{"kind":"Field","name":{"kind":"Name","value":"return_status"}},{"kind":"Field","name":{"kind":"Name","value":"approved_by"}},{"kind":"Field","name":{"kind":"Name","value":"approved_at"}},{"kind":"Field","name":{"kind":"Name","value":"approval_required"}},{"kind":"Field","name":{"kind":"Name","value":"awaiting_approval_at"}},{"kind":"Field","name":{"kind":"Name","value":"payout_plan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"}},{"kind":"Field","name":{"kind":"Name","value":"loopay_fee"}},{"kind":"Field","name":{"kind":"Name","value":"network_component"}},{"kind":"Field","name":{"kind":"Name","value":"funding_amount"}},{"kind":"Field","name":{"kind":"Name","value":"rounding_remainder"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stale_review_required"}},{"kind":"Field","name":{"kind":"Name","value":"stale_review_reason"}},{"kind":"Field","name":{"kind":"Name","value":"stale_review_flagged_at"}},{"kind":"Field","name":{"kind":"Name","value":"stale_alerts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"raised_at"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayListPendingDispersionesQuery, AdminLoopayListPendingDispersionesQueryVariables>;
export const AdminLoopayListPendingEndorsementsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminLoopayListPendingEndorsements"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"EndorsementQueueFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_listPendingEndorsements"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_email"}},{"kind":"Field","name":{"kind":"Name","value":"client_id"}},{"kind":"Field","name":{"kind":"Name","value":"client_name"}},{"kind":"Field","name":{"kind":"Name","value":"rail_code"}},{"kind":"Field","name":{"kind":"Name","value":"rail_name"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"requested_at"}},{"kind":"Field","name":{"kind":"Name","value":"review_reason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayListPendingEndorsementsQuery, AdminLoopayListPendingEndorsementsQueryVariables>;
export const AdminLoopayListPendingKycDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminLoopayListPendingKyc"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"KycQueueFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_listPendingKyc"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"client_id"}},{"kind":"Field","name":{"kind":"Name","value":"client_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"customer_type"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"kyc_status"}},{"kind":"Field","name":{"kind":"Name","value":"customer_status"}},{"kind":"Field","name":{"kind":"Name","value":"submitted_at"}},{"kind":"Field","name":{"kind":"Name","value":"has_documents"}},{"kind":"Field","name":{"kind":"Name","value":"documents_count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayListPendingKycQuery, AdminLoopayListPendingKycQueryVariables>;
export const AdminLoopayGetCustomerKycDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminLoopayGetCustomerKycData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_getCustomerKycData"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"client_id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"middle_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"tax_id"}},{"kind":"Field","name":{"kind":"Name","value":"tax_id_type"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"kyc_status"}},{"kind":"Field","name":{"kind":"Name","value":"customer_status"}},{"kind":"Field","name":{"kind":"Name","value":"rejection_reasons"}},{"kind":"Field","name":{"kind":"Name","value":"address_details"}},{"kind":"Field","name":{"kind":"Name","value":"kyc_reviewed_by_user_id"}},{"kind":"Field","name":{"kind":"Name","value":"kyc_reviewed_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"kyc_data"}},{"kind":"Field","name":{"kind":"Name","value":"provider_profile"}},{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"mime_type"}},{"kind":"Field","name":{"kind":"Name","value":"file_size_bytes"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"document_metadata"}}]}},{"kind":"Field","name":{"kind":"Name","value":"endorsements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rail_code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"review_reason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"wallets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"provider_code"}},{"kind":"Field","name":{"kind":"Name","value":"chain"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<AdminLoopayGetCustomerKycDataQuery, AdminLoopayGetCustomerKycDataQueryVariables>;
export const AdminLoopayGetDocumentDownloadUrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminLoopayGetDocumentDownloadUrl"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_getDocumentDownloadUrl"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"document_id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"expires_in_seconds"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayGetDocumentDownloadUrlQuery, AdminLoopayGetDocumentDownloadUrlQueryVariables>;
export const AdminLoopayProviderSandboxAvailabilityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminLoopayProviderSandboxAvailability"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_providerSandboxAvailability"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mesta"}},{"kind":"Field","name":{"kind":"Name","value":"kirafin"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayProviderSandboxAvailabilityQuery, AdminLoopayProviderSandboxAvailabilityQueryVariables>;
export const AdminLoopayListPendingRecaudosDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminLoopayListPendingRecaudos"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"RecaudoQueueFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_listPendingRecaudos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reference_code"}},{"kind":"Field","name":{"kind":"Name","value":"customer_id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_email"}},{"kind":"Field","name":{"kind":"Name","value":"client_id"}},{"kind":"Field","name":{"kind":"Name","value":"client_name"}},{"kind":"Field","name":{"kind":"Name","value":"wallet_id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"provider_code"}},{"kind":"Field","name":{"kind":"Name","value":"provider_event_id"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"review_reason"}},{"kind":"Field","name":{"kind":"Name","value":"reviewed_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayListPendingRecaudosQuery, AdminLoopayListPendingRecaudosQueryVariables>;
export const AdminLoopayListVirtualAccountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminLoopayListVirtualAccounts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"where"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"VirtualAccountFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_listVirtualAccounts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"Variable","name":{"kind":"Name","value":"where"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"walletId"}},{"kind":"Field","name":{"kind":"Name","value":"providerId"}},{"kind":"Field","name":{"kind":"Name","value":"railId"}},{"kind":"Field","name":{"kind":"Name","value":"railCode"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"providerAccountId"}},{"kind":"Field","name":{"kind":"Name","value":"bankDetails"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayListVirtualAccountsQuery, AdminLoopayListVirtualAccountsQueryVariables>;
export const AdminLoopayListProviderLinkedAccountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminLoopayListProviderLinkedAccounts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"providerCode"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminLoopay_listProviderLinkedAccounts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}},{"kind":"Argument","name":{"kind":"Name","value":"providerCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"providerCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_email"}},{"kind":"Field","name":{"kind":"Name","value":"provider_code"}},{"kind":"Field","name":{"kind":"Name","value":"rail_code"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"provider_account_id"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"linked_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]}}]} as unknown as DocumentNode<AdminLoopayListProviderLinkedAccountsQuery, AdminLoopayListProviderLinkedAccountsQueryVariables>;
export const AuthHelloDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuthHello"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"auth_hello"}}]}}]} as unknown as DocumentNode<AuthHelloQuery, AuthHelloQueryVariables>;
export const AuthMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuthMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"auth_me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"auth_uid"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"staff_roles"}},{"kind":"Field","name":{"kind":"Name","value":"company_roles"}},{"kind":"Field","name":{"kind":"Name","value":"company_user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"company_id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"has_accepted_latest_terms"}},{"kind":"Field","name":{"kind":"Name","value":"client_id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_profile_id"}},{"kind":"Field","name":{"kind":"Name","value":"kyc_status"}},{"kind":"Field","name":{"kind":"Name","value":"company_name"}}]}}]}}]} as unknown as DocumentNode<AuthMeQuery, AuthMeQueryVariables>;
export const FindCustomerByEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FindCustomerByEmail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customers_list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"kyc_status"}}]}}]}}]}}]} as unknown as DocumentNode<FindCustomerByEmailQuery, FindCustomerByEmailQueryVariables>;
export const GetCustomerProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCustomerProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customers_findById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"customer_type"}},{"kind":"Field","name":{"kind":"Name","value":"business_name"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"kyc_status"}},{"kind":"Field","name":{"kind":"Name","value":"customer_status"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"tax_id"}},{"kind":"Field","name":{"kind":"Name","value":"tax_id_type"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<GetCustomerProfileQuery, GetCustomerProfileQueryVariables>;
export const GetKycSnapshotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetKycSnapshot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customers_getKycSnapshot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lifecycle"}},{"kind":"Field","name":{"kind":"Name","value":"provider_customer_state"}},{"kind":"Field","name":{"kind":"Name","value":"onboarding_mode"}},{"kind":"Field","name":{"kind":"Name","value":"prefill"}},{"kind":"Field","name":{"kind":"Name","value":"tos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accepted"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"next_step"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"route"}},{"kind":"Field","name":{"kind":"Name","value":"rail"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requirements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fields"}},{"kind":"Field","name":{"kind":"Name","value":"document_purposes"}},{"kind":"Field","name":{"kind":"Name","value":"questionnaire_fields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pending"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"target_type"}},{"kind":"Field","name":{"kind":"Name","value":"target_key"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reasons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"target_type"}},{"kind":"Field","name":{"kind":"Name","value":"target_key"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"actions"}},{"kind":"Field","name":{"kind":"Name","value":"freshness"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"snapshot_generated_at"}},{"kind":"Field","name":{"kind":"Name","value":"provider_checked_at"}},{"kind":"Field","name":{"kind":"Name","value":"webhook_updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"last_reconciliation_source"}},{"kind":"Field","name":{"kind":"Name","value":"reconciliation_state"}}]}}]}}]}}]} as unknown as DocumentNode<GetKycSnapshotQuery, GetKycSnapshotQueryVariables>;
export const CreateBeneficiaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBeneficiary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateBeneficiaryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"beneficiaries_create"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_id"}},{"kind":"Field","name":{"kind":"Name","value":"payment_rail"}},{"kind":"Field","name":{"kind":"Name","value":"rail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"relationship"}},{"kind":"Field","name":{"kind":"Name","value":"holder_type"}},{"kind":"Field","name":{"kind":"Name","value":"beneficiary_name"}},{"kind":"Field","name":{"kind":"Name","value":"tax_id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"is_favorite"}},{"kind":"Field","name":{"kind":"Name","value":"verification_status"}},{"kind":"Field","name":{"kind":"Name","value":"rail_code"}},{"kind":"Field","name":{"kind":"Name","value":"provider_code"}},{"kind":"Field","name":{"kind":"Name","value":"review_status"}},{"kind":"Field","name":{"kind":"Name","value":"review_reason"}},{"kind":"Field","name":{"kind":"Name","value":"masked_account_number"}},{"kind":"Field","name":{"kind":"Name","value":"bank_name"}},{"kind":"Field","name":{"kind":"Name","value":"bank_code"}},{"kind":"Field","name":{"kind":"Name","value":"account_number"}},{"kind":"Field","name":{"kind":"Name","value":"routing_number"}},{"kind":"Field","name":{"kind":"Name","value":"iban"}},{"kind":"Field","name":{"kind":"Name","value":"clabe"}},{"kind":"Field","name":{"kind":"Name","value":"pix_key"}},{"kind":"Field","name":{"kind":"Name","value":"bic"}},{"kind":"Field","name":{"kind":"Name","value":"bank_details"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<CreateBeneficiaryMutation, CreateBeneficiaryMutationVariables>;
export const DeleteBeneficiaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteBeneficiary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"beneficiaries_delete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"provider_external_deleted"}},{"kind":"Field","name":{"kind":"Name","value":"provider_code"}}]}}]}}]} as unknown as DocumentNode<DeleteBeneficiaryMutation, DeleteBeneficiaryMutationVariables>;
export const Beneficiaries_ListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"beneficiaries_list"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"beneficiaries_list"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_id"}},{"kind":"Field","name":{"kind":"Name","value":"payment_rail"}},{"kind":"Field","name":{"kind":"Name","value":"rail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"relationship"}},{"kind":"Field","name":{"kind":"Name","value":"holder_type"}},{"kind":"Field","name":{"kind":"Name","value":"beneficiary_name"}},{"kind":"Field","name":{"kind":"Name","value":"tax_id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"is_favorite"}},{"kind":"Field","name":{"kind":"Name","value":"verification_status"}},{"kind":"Field","name":{"kind":"Name","value":"rail_code"}},{"kind":"Field","name":{"kind":"Name","value":"provider_code"}},{"kind":"Field","name":{"kind":"Name","value":"review_status"}},{"kind":"Field","name":{"kind":"Name","value":"review_reason"}},{"kind":"Field","name":{"kind":"Name","value":"masked_account_number"}},{"kind":"Field","name":{"kind":"Name","value":"bank_name"}},{"kind":"Field","name":{"kind":"Name","value":"bank_code"}},{"kind":"Field","name":{"kind":"Name","value":"account_number"}},{"kind":"Field","name":{"kind":"Name","value":"routing_number"}},{"kind":"Field","name":{"kind":"Name","value":"iban"}},{"kind":"Field","name":{"kind":"Name","value":"clabe"}},{"kind":"Field","name":{"kind":"Name","value":"pix_key"}},{"kind":"Field","name":{"kind":"Name","value":"bic"}},{"kind":"Field","name":{"kind":"Name","value":"bank_details"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<Beneficiaries_ListQuery, Beneficiaries_ListQueryVariables>;
export const Beneficiaries_FindByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"beneficiaries_findById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"beneficiaries_findById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_id"}},{"kind":"Field","name":{"kind":"Name","value":"payment_rail"}},{"kind":"Field","name":{"kind":"Name","value":"rail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"bank_details"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"relationship"}},{"kind":"Field","name":{"kind":"Name","value":"holder_type"}},{"kind":"Field","name":{"kind":"Name","value":"beneficiary_name"}},{"kind":"Field","name":{"kind":"Name","value":"tax_id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"is_favorite"}},{"kind":"Field","name":{"kind":"Name","value":"verification_status"}},{"kind":"Field","name":{"kind":"Name","value":"rail_code"}},{"kind":"Field","name":{"kind":"Name","value":"provider_code"}},{"kind":"Field","name":{"kind":"Name","value":"review_status"}},{"kind":"Field","name":{"kind":"Name","value":"review_reason"}},{"kind":"Field","name":{"kind":"Name","value":"masked_account_number"}},{"kind":"Field","name":{"kind":"Name","value":"bank_name"}},{"kind":"Field","name":{"kind":"Name","value":"bank_code"}},{"kind":"Field","name":{"kind":"Name","value":"account_number"}},{"kind":"Field","name":{"kind":"Name","value":"routing_number"}},{"kind":"Field","name":{"kind":"Name","value":"iban"}},{"kind":"Field","name":{"kind":"Name","value":"clabe"}},{"kind":"Field","name":{"kind":"Name","value":"pix_key"}},{"kind":"Field","name":{"kind":"Name","value":"bic"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<Beneficiaries_FindByIdQuery, Beneficiaries_FindByIdQueryVariables>;
export const Customers_ListEndorsementsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"customers_listEndorsements"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customers_listEndorsements"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"payment_rail"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"readiness"}},{"kind":"Field","name":{"kind":"Name","value":"artifact_type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<Customers_ListEndorsementsQuery, Customers_ListEndorsementsQueryVariables>;
export const Quotes_FindByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"quotes_findById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quotes_findById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"from_currency"}},{"kind":"Field","name":{"kind":"Name","value":"to_currency"}},{"kind":"Field","name":{"kind":"Name","value":"from_amount"}},{"kind":"Field","name":{"kind":"Name","value":"to_amount"}},{"kind":"Field","name":{"kind":"Name","value":"rate"}},{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<Quotes_FindByIdQuery, Quotes_FindByIdQueryVariables>;
export const Quotes_GetIndicativeRateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"quotes_getIndicativeRate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetIndicativeRateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quotes_getIndicativeRate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"rate"}}]}}]}}]} as unknown as DocumentNode<Quotes_GetIndicativeRateQuery, Quotes_GetIndicativeRateQueryVariables>;
export const Quotes_GetRateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"quotes_getRate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetQuoteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quotes_getRate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"from_currency"}},{"kind":"Field","name":{"kind":"Name","value":"to_currency"}},{"kind":"Field","name":{"kind":"Name","value":"from_amount"}},{"kind":"Field","name":{"kind":"Name","value":"to_amount"}},{"kind":"Field","name":{"kind":"Name","value":"rate"}},{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<Quotes_GetRateQuery, Quotes_GetRateQueryVariables>;
export const Rails_CatalogueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"rails_catalogue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"country"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rails_catalogue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"country"},"value":{"kind":"Variable","name":{"kind":"Name","value":"country"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"rails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"directions"}},{"kind":"Field","name":{"kind":"Name","value":"beneficiary_supported"}},{"kind":"Field","name":{"kind":"Name","value":"providers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"directions"}},{"kind":"Field","name":{"kind":"Name","value":"available"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<Rails_CatalogueQuery, Rails_CatalogueQueryVariables>;
export const Rails_ListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"rails_list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rails_list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"available_countries"}},{"kind":"Field","name":{"kind":"Name","value":"is_assignable"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"enabled_capabilities"}},{"kind":"Field","name":{"kind":"Name","value":"limits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min_amount"}},{"kind":"Field","name":{"kind":"Name","value":"max_amount"}},{"kind":"Field","name":{"kind":"Name","value":"daily_limit"}},{"kind":"Field","name":{"kind":"Name","value":"source"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<Rails_ListQuery, Rails_ListQueryVariables>;
export const VirtualAccounts_ReceiveOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"virtualAccounts_receiveOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"country"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"virtualAccounts_receiveOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"country"},"value":{"kind":"Variable","name":{"kind":"Name","value":"country"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"railCode"}},{"kind":"Field","name":{"kind":"Name","value":"railName"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"providers"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"virtualAccountId"}},{"kind":"Field","name":{"kind":"Name","value":"vaRequestState"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"eligible"}},{"kind":"Field","name":{"kind":"Name","value":"ineligibleReason"}},{"kind":"Field","name":{"kind":"Name","value":"blockers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<VirtualAccounts_ReceiveOptionsQuery, VirtualAccounts_ReceiveOptionsQueryVariables>;
export const Transactions_ListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"transactions_list"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ListTransactionsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions_list"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"completed_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]}}]} as unknown as DocumentNode<Transactions_ListQuery, Transactions_ListQueryVariables>;
export const Transactions_PaymentLinkCapabilitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"transactions_paymentLinkCapabilities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions_paymentLinkCapabilities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"supported_currencies"}},{"kind":"Field","name":{"kind":"Name","value":"supported_payment_methods"}},{"kind":"Field","name":{"kind":"Name","value":"payment_link_rails"}},{"kind":"Field","name":{"kind":"Name","value":"capabilities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"payment_methods"}},{"kind":"Field","name":{"kind":"Name","value":"minimum_amount"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"minimum_amounts"}},{"kind":"Field","name":{"kind":"Name","value":"catalog_rules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencies"}},{"kind":"Field","name":{"kind":"Name","value":"minimum_amounts"}}]}},{"kind":"Field","name":{"kind":"Name","value":"provider_rules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencies"}},{"kind":"Field","name":{"kind":"Name","value":"payment_methods"}},{"kind":"Field","name":{"kind":"Name","value":"capabilities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"payment_methods"}},{"kind":"Field","name":{"kind":"Name","value":"minimum_amount"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]}}]} as unknown as DocumentNode<Transactions_PaymentLinkCapabilitiesQuery, Transactions_PaymentLinkCapabilitiesQueryVariables>;
export const Wallets_AvailableChainsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"wallets_availableChains"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wallets_availableChains"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chains"}},{"kind":"Field","name":{"kind":"Name","value":"default_chain"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]} as unknown as DocumentNode<Wallets_AvailableChainsQuery, Wallets_AvailableChainsQueryVariables>;
export const Wallets_DepositInstructionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"wallets_depositInstructions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"walletId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wallets_depositInstructions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"walletId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"walletId"}}},{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer_id"}},{"kind":"Field","name":{"kind":"Name","value":"wallet_id"}},{"kind":"Field","name":{"kind":"Name","value":"network"}},{"kind":"Field","name":{"kind":"Name","value":"virtual_accounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"payment_rail"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"account_number"}},{"kind":"Field","name":{"kind":"Name","value":"account_type"}},{"kind":"Field","name":{"kind":"Name","value":"bank_name"}},{"kind":"Field","name":{"kind":"Name","value":"beneficiary_address"}},{"kind":"Field","name":{"kind":"Name","value":"beneficiary_name"}},{"kind":"Field","name":{"kind":"Name","value":"clabe"}},{"kind":"Field","name":{"kind":"Name","value":"iban"}},{"kind":"Field","name":{"kind":"Name","value":"nit"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"routing_number"}},{"kind":"Field","name":{"kind":"Name","value":"swift_code"}},{"kind":"Field","name":{"kind":"Name","value":"bic"}},{"kind":"Field","name":{"kind":"Name","value":"sort_code"}},{"kind":"Field","name":{"kind":"Name","value":"br_code"}},{"kind":"Field","name":{"kind":"Name","value":"account_holder_name"}},{"kind":"Field","name":{"kind":"Name","value":"bank_address"}},{"kind":"Field","name":{"kind":"Name","value":"bank_beneficiary_name"}},{"kind":"Field","name":{"kind":"Name","value":"bank_beneficiary_address"}},{"kind":"Field","name":{"kind":"Name","value":"payment_rails"}},{"kind":"Field","name":{"kind":"Name","value":"linked_manually"}},{"kind":"Field","name":{"kind":"Name","value":"linked_at"}}]}}]}}]}}]} as unknown as DocumentNode<Wallets_DepositInstructionsQuery, Wallets_DepositInstructionsQueryVariables>;
export const Wallets_GetBalanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"wallets_getBalance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wallets_getBalance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wallet_id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"available_balance"}},{"kind":"Field","name":{"kind":"Name","value":"spendable_balance"}},{"kind":"Field","name":{"kind":"Name","value":"pending_balance"}},{"kind":"Field","name":{"kind":"Name","value":"total_balance"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<Wallets_GetBalanceQuery, Wallets_GetBalanceQueryVariables>;
export const Wallets_ListByCustomerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"wallets_listByCustomer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wallets_listByCustomer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"default_wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"chain"}}]}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customer_id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"chain"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"page_size"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"total_pages"}}]}}]}}]} as unknown as DocumentNode<Wallets_ListByCustomerQuery, Wallets_ListByCustomerQueryVariables>;
export const Wallets_TransactionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"wallets_transactions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionListFiltersInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wallets_transactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"external_reference"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"completed_at"}},{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"fee_currency"}},{"kind":"Field","name":{"kind":"Name","value":"refunded"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"destination"}}]}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"page_size"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"total_pages"}}]}}]}}]} as unknown as DocumentNode<Wallets_TransactionsQuery, Wallets_TransactionsQueryVariables>;
export const TenantListBeneficiariesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantListBeneficiaries"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_listBeneficiaries"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}]}]}}]} as unknown as DocumentNode<TenantListBeneficiariesQuery, TenantListBeneficiariesQueryVariables>;
export const TenantGetBeneficiaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantGetBeneficiary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_getBeneficiary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<TenantGetBeneficiaryQuery, TenantGetBeneficiaryQueryVariables>;
export const TenantQuoteRateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantQuoteRate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_quoteRate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}]}]}}]} as unknown as DocumentNode<TenantQuoteRateQuery, TenantQuoteRateQueryVariables>;
export const TenantGetQuoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantGetQuote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_getQuote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<TenantGetQuoteQuery, TenantGetQuoteQueryVariables>;
export const TenantListRailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantListRails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_listRails"}}]}}]} as unknown as DocumentNode<TenantListRailsQuery, TenantListRailsQueryVariables>;
export const TenantRailCatalogueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantRailCatalogue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"country"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_railCatalogue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"country"},"value":{"kind":"Variable","name":{"kind":"Name","value":"country"}}}]}]}}]} as unknown as DocumentNode<TenantRailCatalogueQuery, TenantRailCatalogueQueryVariables>;
export const TenantVirtualAccountReceiveOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantVirtualAccountReceiveOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_virtualAccountReceiveOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}]}]}}]} as unknown as DocumentNode<TenantVirtualAccountReceiveOptionsQuery, TenantVirtualAccountReceiveOptionsQueryVariables>;
export const TenantListWebhooksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantListWebhooks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_listWebhooks"}}]}}]} as unknown as DocumentNode<TenantListWebhooksQuery, TenantListWebhooksQueryVariables>;
export const TenantWebhookEventTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantWebhookEventTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_webhookEventTypes"}}]}}]} as unknown as DocumentNode<TenantWebhookEventTypesQuery, TenantWebhookEventTypesQueryVariables>;
export const TenantWebhookLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantWebhookLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_webhookLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}]}]}}]} as unknown as DocumentNode<TenantWebhookLogsQuery, TenantWebhookLogsQueryVariables>;
export const TenantWebhookLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantWebhookLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_webhookLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<TenantWebhookLogQuery, TenantWebhookLogQueryVariables>;
export const TenantMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"client_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"api_key_prefix"}},{"kind":"Field","name":{"kind":"Name","value":"api_key_rotated_at"}},{"kind":"Field","name":{"kind":"Name","value":"api_key_expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"environment"}},{"kind":"Field","name":{"kind":"Name","value":"enabled_rails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"acting_as"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"staff_email"}},{"kind":"Field","name":{"kind":"Name","value":"staff_roles"}}]}}]}}]}}]} as unknown as DocumentNode<TenantMeQuery, TenantMeQueryVariables>;
export const TenantListCustomersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantListCustomers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_listCustomers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}]}]}}]} as unknown as DocumentNode<TenantListCustomersQuery, TenantListCustomersQueryVariables>;
export const TenantGetCustomerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantGetCustomer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_getCustomer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<TenantGetCustomerQuery, TenantGetCustomerQueryVariables>;
export const TenantListCustomerRailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantListCustomerRails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"include_pending"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_listCustomerRails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"include_pending"},"value":{"kind":"Variable","name":{"kind":"Name","value":"include_pending"}}}]}]}}]} as unknown as DocumentNode<TenantListCustomerRailsQuery, TenantListCustomerRailsQueryVariables>;
export const TenantListCustomerRequirementsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantListCustomerRequirements"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_listCustomerRequirements"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<TenantListCustomerRequirementsQuery, TenantListCustomerRequirementsQueryVariables>;
export const TenantWalletAvailableChainsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantWalletAvailableChains"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_walletAvailableChains"}}]}}]} as unknown as DocumentNode<TenantWalletAvailableChainsQuery, TenantWalletAvailableChainsQueryVariables>;
export const TenantListWalletsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantListWallets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customer_id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_listWallets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customer_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customer_id"}}}]}]}}]} as unknown as DocumentNode<TenantListWalletsQuery, TenantListWalletsQueryVariables>;
export const TenantGetWalletDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantGetWallet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_getWallet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<TenantGetWalletQuery, TenantGetWalletQueryVariables>;
export const TenantWalletBalanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantWalletBalance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_walletBalance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<TenantWalletBalanceQuery, TenantWalletBalanceQueryVariables>;
export const TenantWalletDepositInstructionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantWalletDepositInstructions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customer_id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_walletDepositInstructions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"customer_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customer_id"}}}]}]}}]} as unknown as DocumentNode<TenantWalletDepositInstructionsQuery, TenantWalletDepositInstructionsQueryVariables>;
export const TenantWalletTransactionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantWalletTransactions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_walletTransactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}]}]}}]} as unknown as DocumentNode<TenantWalletTransactionsQuery, TenantWalletTransactionsQueryVariables>;
export const TenantListTransactionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantListTransactions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"JSONObject"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_listTransactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}]}]}}]} as unknown as DocumentNode<TenantListTransactionsQuery, TenantListTransactionsQueryVariables>;
export const TenantGetTransactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantGetTransaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_getTransaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<TenantGetTransactionQuery, TenantGetTransactionQueryVariables>;
export const TenantPaymentLinkCapabilitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantPaymentLinkCapabilities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_paymentLinkCapabilities"}}]}}]} as unknown as DocumentNode<TenantPaymentLinkCapabilitiesQuery, TenantPaymentLinkCapabilitiesQueryVariables>;
export const TenantListTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantListTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenant_listTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<TenantListTeamQuery, TenantListTeamQueryVariables>;