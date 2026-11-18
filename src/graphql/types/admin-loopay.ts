/**
 * admin-loopay shared GraphQL shapes
 *
 * Hand-written because `npm run codegen` needs a live backend on
 * localhost:3000 and the generated registry does not know these operations.
 * Every field name here is transcribed from the backend entities under
 * `src/modules/admin-loopay/**` and must stay in sync with them.
 *
 * The backend exposes queue entities in snake_case and the older
 * `AdminVirtualAccountEntity` / `AdminWalletResponseEntity` in camelCase.
 * That split is intentional on the backend, so it is mirrored verbatim here.
 */

import type {
  ProviderRequirement,
  ProviderRequirementDecision,
  ProviderRequirementStatus,
} from './provider-requirements';

/** `PaginationInput` — offset/limit, limit capped at 100 by the backend. */
export interface AdminPaginationInput {
  offset?: number;
  limit?: number;
}

/** Every admin-loopay queue returns this envelope. */
export interface AdminPaginated<TItem> {
  data: TItem[];
  total: number;
  has_more: boolean;
}

/** `AdminReviewDecision` */
export type AdminReviewDecision = 'APPROVED' | 'REJECTED';

/** `AdminEndorsementReviewDecision` */
export type AdminEndorsementReviewDecision = 'APPROVED' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED';

/** `AdminBeneficiaryReviewDecision` */
export type AdminBeneficiaryReviewDecision = 'VERIFIED' | 'REJECTED';

/** `AdminDispersionFundsLocation` */
export type AdminDispersionFundsLocation = 'customer_vault' | 'provider' | 'ops_vault';

/** `RECAUDO_SOURCES` on `CreateRecaudoInput.source`. */
export type AdminRecaudoSource = 'bank_transfer' | 'cash' | 'provider_manual' | 'other';

/** `DISPERSION_QUEUE_STATUSES` on `DispersionQueueFiltersInput.status`. */
export type AdminDispersionQueueStatus = 'PENDING' | 'PROCESSING';

/** `KYC_QUEUE_CUSTOMER_TYPES` on `KycQueueFiltersInput.customerType`. */
export type AdminKycCustomerType = 'individual' | 'business';

/* -------------------------------------------------------------------------- */
/* KYC review                                                                  */
/* -------------------------------------------------------------------------- */

export interface AdminKycQueueFilters {
  clientId?: string;
  email?: string;
  /** Matches email, first name, last name and business legal name. */
  search?: string;
  country?: string;
  customerType?: AdminKycCustomerType;
  includeAdditionalInfoRequired?: boolean;
}

export interface AdminKycQueueItem {
  id: string;
  client_id: string;
  client_name: string;
  email: string;
  first_name: string;
  last_name: string;
  customer_type: string;
  country: string;
  kyc_status: string;
  customer_status: string;
  submitted_at: string;
  has_documents: boolean;
  documents_count: number;
}

export interface AdminKycCustomer {
  id: string;
  client_id: string;
  email: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  tax_id: string;
  tax_id_type: string | null;
  country: string;
  kyc_status: string;
  customer_status: string;
  rejection_reasons: unknown;
  address_details: unknown;
  kyc_reviewed_by_user_id: string | null;
  kyc_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminKycDocument {
  id: string;
  category: string;
  version: number;
  mime_type: string;
  file_size_bytes: number | null;
  created_at: string;
  document_metadata: unknown;
}

export interface AdminKycEndorsementSummary {
  id: string;
  rail_code: string;
  status: string;
  review_reason: string | null;
}

export interface AdminKycWalletSummary {
  id: string;
  provider_code: string;
  chain: string | null;
  currency: string;
  address: string | null;
  status: string;
}

export interface AdminCustomerKycDetail {
  customer: AdminKycCustomer;
  kyc_data: unknown;
  documents: AdminKycDocument[];
  endorsements: AdminKycEndorsementSummary[];
  wallets: AdminKycWalletSummary[];
  /**
   * Business data kept for VA providers (`customer_profile.metadata.providerProfile`):
   * registrationNumber, numberOfEmployees, isFinancialInstitution, websiteAbsenceReason, ...
   */
  provider_profile?: unknown;
}

export interface AdminDocumentDownload {
  document_id: string;
  url: string;
  expires_in_seconds: number;
}

export interface AdminKycReviewWallet {
  id: string;
  chain: string | null;
  currency: string;
  address: string | null;
}

export interface AdminKycReviewResponse {
  customer_id: string;
  previous_kyc_status: string;
  kyc_status: string;
  customer_status: string;
  wallet: AdminKycReviewWallet | null;
  wallet_error: string | null;
  reviewed_by: string;
  reviewed_at: string;
}

export interface AdminReviewKycInput {
  decision: AdminReviewDecision;
  /** Required by the backend when `decision` is `REJECTED`. */
  reason?: string;
}

export interface AdminRequestKycAdditionalInfoInput {
  reason: string;
}

/* -------------------------------------------------------------------------- */
/* Recaudos (inbound deposits)                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Statuses the manual deposit queue can list: PENDING = pending review,
 * COMPLETED = approved, REJECTED = rejected, FAILED = reversed after credit.
 */
export type RecaudoStatusFilter = 'PENDING' | 'COMPLETED' | 'REJECTED' | 'FAILED';

export interface AdminRecaudoQueueFilters {
  clientId?: string;
  customerId?: string;
  providerCode?: string;
  currency?: string;
  /** Omitted or empty keeps the pending-only queue on the backend. */
  statuses?: RecaudoStatusFilter[];
  /**
   * Global search, ANDed with the other filters: user email, reference, client,
   * currency, provider code / event id, source, exact amount, and transaction
   * or wallet id (full or first characters). Max 100 characters.
   */
  search?: string;
}

export interface AdminRecaudo {
  id: string;
  reference_code: string;
  customer_id: string;
  customer_email: string;
  client_id: string;
  client_name: string;
  wallet_id: string;
  amount: string;
  currency: string;
  status: string;
  provider_code: string | null;
  provider_event_id: string | null;
  source: string | null;
  /** Bank-statement reference typed by the operator on manual creation. */
  reference: string | null;
  created_at: string;
  review_reason: string | null;
  reviewed_at: string | null;
}

export interface AdminCreateRecaudoInput {
  customerId: string;
  walletId: string;
  amount: string;
  currency: string;
  reference?: string;
  source: AdminRecaudoSource;
  providerCode?: string;
  providerEventId?: string;
  note?: string;
}

export interface AdminApproveRecaudoInput {
  note?: string;
}

export interface AdminRejectRecaudoInput {
  reason: string;
}

export interface AdminReverseRecaudoInput {
  reason: string;
  providerEvent?: Record<string, unknown>;
}

/* -------------------------------------------------------------------------- */
/* Dispersiones (outbound withdrawals)                                         */
/* -------------------------------------------------------------------------- */

export interface AdminDispersionQueueFilters {
  clientId?: string;
  customerId?: string;
  status?: AdminDispersionQueueStatus;
}

export interface AdminDispersionBeneficiary {
  id: string;
  holder_name: string;
  rail_code: string;
  currency: string;
  bank_details: unknown;
}

export interface AdminDispersion {
  id: string;
  reference_code: string;
  customer_id: string;
  customer_email: string;
  client_id: string;
  client_name: string;
  wallet_id: string;
  amount: string;
  currency: string;
  status: string;
  held_amount: string | null;
  beneficiary: AdminDispersionBeneficiary | null;
  funds_location: string | null;
  created_at: string;
  review_reason: string | null;
  reviewed_at: string | null;
  quote_rate: string | null;
  quote_source_amount: string | null;
  quote_source_currency: string | null;
  quote_target_amount: string | null;
  quote_target_currency: string | null;
  fee_amount: string | null;
  fee_source: string | null;
  fee_currency: string | null;
  settlement_amount: string | null;
  settlement_currency: string | null;
  settlement_rate: string | null;
  settlement_bank_rate: string | null;
  settlement_fees: string | null;
  settlement_external_reference: string | null;
}

export interface AdminApproveDispersionInput {
  fundsLocation: AdminDispersionFundsLocation;
  note?: string;
}

export interface AdminDispersionFiatSettlementInput {
  amount?: string;
  currency?: string;
  rate?: string;
  bank_rate?: string;
  fees?: string;
}

export interface AdminCompleteDispersionInput {
  note?: string;
  externalReference?: string;
  fiat?: AdminDispersionFiatSettlementInput;
}

export interface AdminRejectDispersionInput {
  reason: string;
}

export interface AdminFailDispersionInput {
  reason: string;
}

/* -------------------------------------------------------------------------- */
/* Endorsements                                                                */
/* -------------------------------------------------------------------------- */

export interface AdminEndorsementQueueFilters {
  clientId?: string;
  railCode?: string;
}

export interface AdminEndorsementQueueItem {
  id: string;
  customer_id: string;
  customer_email: string;
  client_id: string;
  client_name: string;
  rail_code: string;
  rail_name: string;
  currency: string;
  status: string;
  requested_at: string;
  review_reason: string | null;
}

export interface AdminEndorsementReviewResponse {
  id: string;
  customer_id: string;
  rail_code: string;
  previous_status: string;
  status: string;
  review_reason: string | null;
  activated_at: string | null;
  reviewed_by: string;
  reviewed_at: string;
}

export interface AdminReviewEndorsementInput {
  decision: AdminEndorsementReviewDecision;
  /** Required for `REJECTED` and `ADDITIONAL_INFO_REQUIRED`. */
  reason?: string;
  providerCode?: string;
  note?: string;
}

/* -------------------------------------------------------------------------- */
/* Beneficiaries                                                               */
/* -------------------------------------------------------------------------- */

export interface AdminBeneficiaryQueueFilters {
  clientId?: string;
  railCode?: string;
}

export interface AdminBeneficiaryQueueItem {
  id: string;
  customer_id: string;
  customer_email: string;
  client_id: string;
  client_name: string;
  rail_code: string;
  currency: string;
  holder_name: string;
  holder_type: string;
  relationship: string;
  bank_details: unknown;
  created_at: string;
}

export interface AdminBeneficiaryReviewResponse {
  id: string;
  customer_id: string;
  previous_status: string;
  status: string;
  review_reason: string | null;
  reviewed_by: string;
  reviewed_at: string;
}

export interface AdminBeneficiaryProviderLink {
  id: string;
  customer_id: string;
  provider_id: string;
  provider_code: string;
  provider_beneficiary_id: string;
  linked_at: string;
}

export interface AdminReviewBeneficiaryInput {
  decision: AdminBeneficiaryReviewDecision;
  /** Required by the backend when `decision` is `REJECTED`. */
  reason?: string;
}

export interface AdminLinkBeneficiaryProviderInput {
  providerCode: string;
  providerBeneficiaryId: string;
}

/* -------------------------------------------------------------------------- */
/* All-status beneficiaries (adminLoopay_listBeneficiaries)                    */
/* -------------------------------------------------------------------------- */

/** `AdminBeneficiaryVerificationStatus` enum on the backend. */
export type AdminBeneficiaryVerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'PENDING' | 'REJECTED';

/** `AdminBeneficiaryEntity` — camelCase, returned by `adminLoopay_listBeneficiaries`. */
export interface AdminBeneficiaryEntity {
  id: string;
  customerId: string;
  clientId: string;
  customerExternalId: string | null;
  customerEmail: string | null;
  railId: string;
  railCode: string;
  railName: string;
  railCountry: string;
  providerId: string | null;
  providerCode: string | null;
  providerName: string | null;
  relationship: string;
  holderType: string;
  holderName: string;
  holderTaxId: string | null;
  currency: string;
  bankDetails: unknown;
  alias: string | null;
  status: AdminBeneficiaryVerificationStatus;
  isFavorite: boolean;
  providerBeneficiaryId: string | null;
  providerMetadata: unknown;
  createdAt: string;
  updatedAt: string;
}

/** `AdminBeneficiaryFiltersInput` — for `adminLoopay_listBeneficiaries`. */
export interface AdminBeneficiaryFiltersInput {
  customerId?: AdminStringFilterInput;
  clientId?: AdminStringFilterInput;
  railCode?: AdminStringFilterInput;
  providerCode?: AdminStringFilterInput;
  status?: AdminBeneficiaryVerificationStatus[];
  currency?: AdminStringFilterInput;
  isFavorite?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Virtual accounts, provider links and wallet ops                             */
/* -------------------------------------------------------------------------- */

/** `StringFilterInput` — the legacy filter shape used by `where`. */
export interface AdminStringFilterInput {
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  equals?: string;
}

export interface AdminVirtualAccountFilters {
  customerId?: AdminStringFilterInput;
  walletId?: AdminStringFilterInput;
  status?: string[];
  railId?: AdminStringFilterInput;
  currency?: AdminStringFilterInput;
  providerAccountId?: AdminStringFilterInput;
}

/** `AdminVirtualAccountEntity` — camelCase, unlike the newer queue entities. */
export interface AdminVirtualAccount {
  id: string;
  customerId: string;
  walletId: string;
  providerId: string;
  railId: string;
  railCode: string;
  currency: string;
  providerAccountId: string | null;
  bankDetails: unknown;
  alias: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProviderLinkedAccount {
  id: string;
  customer_id: string;
  customer_email: string;
  provider_code: string;
  rail_code: string;
  currency: string;
  status: string;
  provider_account_id: string | null;
  alias: string | null;
  linked_at: string;
}

export interface AdminLinkVirtualAccountInput {
  customerId: string;
  walletId: string;
  railCode: string;
  currency: string;
  bankDetails: Record<string, unknown>;
  alias?: string;
  providerCode: string;
  providerAccountId: string;
  note?: string;
}

/** `UpdateVirtualAccountInput` — used by `adminLoopay_updateVirtualAccount`. */
export interface AdminUpdateVirtualAccountInput {
  status?: string;
  alias?: string;
  providerAccountId?: string;
  bankDetails?: Record<string, unknown>;
}

/** `AdminVirtualAccountStatus` enum on the backend. */
export type AdminVirtualAccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED' | 'FAILED';

export interface AdminProviderCustomerLink {
  id: string;
  customer_id: string;
  provider_code: string;
  external_customer_id: string;
  kyc_status: string;
  linked_at: string;
}

export interface AdminLinkProviderCustomerInput {
  providerCode: string;
  externalCustomerId: string;
  note?: string;
  kycStatus?: string;
}

/** `AdminWalletResponseEntity` — camelCase. */
export interface AdminWalletResponse {
  id: string;
  customerId: string;
  clientId: string;
  providerId: string;
  providerCode: string;
  currency: string;
  walletType: string;
  chain: string | null;
  address: string | null;
  alias: string | null;
  balance: number;
  status: string;
  alreadyExisted: boolean;
  virtualAccountIds: string[];
  createdAt: string;
  createdBy: string;
}

export interface AdminCreateWalletInput {
  clientId: string;
  customerId: string;
  chain?: string;
  alias?: string;
  provisionVirtualAccounts?: boolean;
  /** Custody provider to use; omitted lets the backend resolve it (default behavior). */
  providerId?: string;
}

export interface AdminLinkWalletAddressInput {
  vaultId: string;
  address: string;
  chain: string;
  currency?: string;
  alias?: string;
}

export interface AdminMoveToOpsVaultInput {
  note?: string;
}

export interface AdminOpsVaultTransfer {
  transaction_id: string;
  provider_tx_id: string;
  funds_location: string;
}

// ---------------------------------------------------------------------------
// Client options (queue client selector)
// ---------------------------------------------------------------------------

/** `AdminClientOptionEntity` — one selectable client for the ops queues. */
export interface AdminClientOption {
  client_id: string;
  client_name: string;
  is_active: boolean;
}

/* -------------------------------------------------------------------------- */
/* Clients (tenant management)                                                */
/* -------------------------------------------------------------------------- */

/** `AdminLoopayClientStatusEntity` on the backend. */
export type AdminClientStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED';

/** `AdminLoopayKycStatusEntity` on the backend. */
export type AdminClientKycStatus =
  | 'NOT_INITIATED'
  | 'INITIATED'
  | 'PENDING_REVIEW'
  | 'ADDITIONAL_INFO_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED';

/** `ClientGraphqlEntity` — snake_case, returned by the client management ops. */
export interface AdminClientEntity {
  id: string;
  name: string;
  email: string;
  tax_id: string;
  tax_id_type_id: string;
  country: string;
  status: AdminClientStatus;
  kyc_status: AdminClientKycStatus;
  api_key_prefix: string;
  config: AdminJsonObject;
  metadata: AdminJsonObject;
  created_at: string;
  updated_at: string;
}

/** `ClientFiltersInput` — for `adminLoopay_listClients`. */
export interface AdminClientFiltersInput {
  name?: AdminStringFilterInput;
  email?: AdminStringFilterInput;
  taxId?: AdminStringFilterInput;
  status?: AdminClientStatus;
  kycStatus?: AdminClientKycStatus;
}

/** `CreateClientInput`. */
export interface AdminCreateClientInput {
  name: string;
  email: string;
  taxId: string;
  taxIdTypeId: string;
  country: string;
  status?: AdminClientStatus;
  kycStatus?: AdminClientKycStatus;
  config?: AdminJsonObject;
  metadata?: AdminJsonObject;
}

/** `UpdateClientInput` — all fields optional (supersedes the config-only subset). */
export interface AdminUpdateClientInput {
  name?: string;
  email?: string;
  taxId?: string;
  taxIdTypeId?: string;
  country?: string;
  status?: AdminClientStatus;
  kycStatus?: AdminClientKycStatus;
  config?: AdminJsonObject;
  metadata?: AdminJsonObject;
}

/** `ClientApiKeyResponse` — the plaintext `api_key` is shown once only. */
export interface AdminClientApiKeyResponse {
  api_key: string;
  api_key_prefix: string;
}

/** `PaginatedClientsResponse`. */
export interface AdminClientPaginated {
  data: AdminClientEntity[];
  total: number;
  has_more: boolean;
}

// ---------------------------------------------------------------------------
// Platform config (PLATFORM_ADMIN) — catalog, client junctions, readiness,
// cutover. Mirrors `src/modules/admin-loopay/{catalog,clients,platform}/**`.
// ---------------------------------------------------------------------------

/** Prisma `ProviderType`. */
export type AdminProviderType = 'KYC' | 'WALLET' | 'FIAT_RAILS' | 'FULL_SERVICE';

/** Prisma `RailDirection`. */
export type AdminRailDirection = 'INBOUND' | 'OUTBOUND' | 'BOTH';

/** JSON scalar payloads (`GraphQLJSON`). */
export type AdminJsonObject = Record<string, unknown>;

/** `ProviderGraphqlEntity` */
export interface AdminProvider {
  id: string;
  code: string;
  name: string;
  type: string;
  is_active: boolean;
  config: unknown;
  created_at: string;
  updated_at: string;
}

/** `CreateProviderInput` */
export interface AdminCreateProviderInput {
  code: string;
  name: string;
  type: AdminProviderType;
  config?: AdminJsonObject;
  isActive?: boolean;
}

/** `UpdateProviderInput` (the provider code is immutable). */
export interface AdminUpdateProviderInput {
  name?: string;
  type?: AdminProviderType;
  config?: AdminJsonObject;
  isActive?: boolean;
}

/** `PaymentRailGraphqlEntity` */
export interface AdminPaymentRail {
  id: string;
  code: string;
  /** #411: code of the rail this one duplicates; null or equal to code when canonical. */
  canonical_code?: string | null;
  name: string;
  currency: string;
  country: string;
  direction: string;
  is_active: boolean;
  created_at: string;
}

/** `CreatePaymentRailInput` */
export interface AdminCreatePaymentRailInput {
  code: string;
  name: string;
  currency: string;
  country: string;
  direction: AdminRailDirection;
  isActive?: boolean;
}

/** `UpdatePaymentRailInput` (the rail code is immutable). */
export interface AdminUpdatePaymentRailInput {
  name?: string;
  currency?: string;
  country?: string;
  direction?: AdminRailDirection;
  isActive?: boolean;
}

/** `ProviderSummaryGraphqlEntity` / `PaymentRailSummaryGraphqlEntity` */
export interface AdminCatalogSummary {
  id: string;
  code: string;
  name: string;
}

/** `ProviderPaymentRailGraphqlEntity` */
export interface AdminProviderPaymentRail {
  id: string;
  is_active: boolean;
  config: unknown;
  created_at: string;
  provider: AdminCatalogSummary;
  rail: AdminCatalogSummary;
}

/** `CreateProviderPaymentRailInput` */
export interface AdminCreateProviderPaymentRailInput {
  providerId: string;
  railId: string;
  isActive?: boolean;
  config?: AdminJsonObject;
}

/** `UpdateProviderPaymentRailInput` */
export interface AdminUpdateProviderPaymentRailInput {
  isActive?: boolean;
  config?: AdminJsonObject;
}

/** `ClientProviderRailGraphqlEntity` */
export interface AdminClientProviderRail {
  id: string;
  client_id: string;
  provider_id: string;
  rail_id: string;
  priority: number;
  is_active: boolean;
  default_attributes: unknown;
  provider: AdminCatalogSummary | null;
  rail: AdminCatalogSummary | null;
  created_at: string;
  updated_at: string;
}

/** `ClientProviderRailFiltersInput` */
export interface AdminClientProviderRailFilters {
  clientId?: string;
  providerId?: string;
  railId?: string;
  priority?: number;
  isActive?: boolean;
}

/** `CreateClientProviderRailInput` (created junctions start active). */
export interface AdminCreateClientProviderRailInput {
  clientId: string;
  providerId: string;
  railId: string;
  priority: number;
  defaultAttributes?: AdminJsonObject;
}

/** `UpdateClientProviderRailInput` */
export interface AdminUpdateClientProviderRailInput {
  priority?: number;
  isActive?: boolean;
  defaultAttributes?: AdminJsonObject;
}

/** `ClientGraphqlEntity` (config view; the API key hash is never exposed). */
export interface AdminClient {
  id: string;
  name: string;
  status: string;
  config: unknown;
  updated_at: string;
}

/** `AdminPlatformReadinessStatus` */
export type AdminPlatformReadinessStatus = 'READY' | 'INCOMPLETE' | 'BLOCKED';

/** `AdminPlatformClientReadinessEntity` */
export interface AdminPlatformClientReadiness {
  client_id: string;
  client_name: string;
  wallet_defaults_set: boolean;
  active_providers: string[];
  active_junction_count: number;
  missing_pairings: string[];
  dead_provider_junctions_active: number;
  status: AdminPlatformReadinessStatus;
  issues: string[];
  /** #411: the same findings as `issues`, in order, as i18n keys with params. */
  issue_keys: AdminPlatformReadinessIssueKey[];
}

/** `AdminPlatformReadinessIssueEntity` (#411). */
export interface AdminPlatformReadinessIssueKey {
  key: string;
  params: Record<string, unknown>;
}

/** `AdminCutoverDeactivateDeadProvidersInput` */
export interface AdminCutoverDeactivateDeadProvidersInput {
  clientIds: string[];
  reason: string;
}

/** `AdminCutoverFlagLegacyTransactionsInput` (`createdBefore` is ISO-8601). */
export interface AdminCutoverFlagLegacyTransactionsInput {
  clientIds: string[];
  reason: string;
  createdBefore: string;
  dryRun: boolean;
}

/** `AdminCutoverDeadProvidersResultEntity` */
export interface AdminCutoverDeadProvidersResult {
  dead_provider_codes: string[];
  total_deactivated: number;
  clients: { client_id: string; deactivated_junctions: number }[];
}

/** `AdminCutoverDeadProviderCatalogResultEntity` */
export interface AdminCutoverDeadProviderCatalogResult {
  provider_codes: string[];
  deactivated_providers: number;
  deactivated_provider_payment_rails: number;
}

/** `AdminCutoverFlagLegacyTransactionsResultEntity` */
export interface AdminCutoverFlagLegacyTransactionsResult {
  dry_run: boolean;
  count: number;
  created_before: string;
}

/* -------------------------------------------------------------------------- */
/* Transactions (adminLoopay_listTransactions / getTransaction)                */
/* -------------------------------------------------------------------------- */

/** `AdminTransactionCustomerSummaryEntity` — nested in `AdminTransactionWalletEntity`. */
export interface AdminTransactionCustomerSummary {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

/** `AdminTransactionWalletEntity` — the wallet a transaction belongs to. */
export interface AdminTransactionWalletEntity {
  id: string;
  customerId: string;
  currency: string;
  chain: string | null;
  address: string | null;
  cachedBalance: string;
  customer: AdminTransactionCustomerSummary | null;
}

/** `AdminTransactionBeneficiaryEntity` — nested in `AdminTransactionEntity`. */
export interface AdminTransactionBeneficiaryEntity {
  id: string;
  status: string | null;
  railCode: string | null;
}

/** `AdminProviderOperationEntity` — provider call trace for a transaction. */
export interface AdminProviderOperationEntity {
  id: string;
  externalId: string | null;
  status: string;
  operationType: string | null;
  requestPayload: unknown;
  responsePayload: unknown;
  idempotencyKey: string | null;
  createdAt: string;
  updatedAt: string | null;
}

/** `AdminTransactionEntity` — camelCase, returned by the transaction ops. */
export interface AdminTransactionEntity {
  id: string;
  type: string;
  status: string;
  amount: string;
  currency: string;
  description: string | null;
  metadata: unknown;
  failureReason: string | null;
  referenceCode: string;
  direction: string;
  createdAt: string;
  completedAt: string | null;
  updatedAt: string;
  wallet: AdminTransactionWalletEntity | null;
  beneficiary: AdminTransactionBeneficiaryEntity | null;
  providerOperations: AdminProviderOperationEntity[];
}

/** `AdminTransactionFiltersInput` — for `adminLoopay_listTransactions`. */
export interface AdminTransactionFiltersInput {
  customerId?: string;
  walletId?: string;
  status?: string;
  type?: string;
  clientId?: string;
}

/** `PaginatedAdminTransactionsResponse`. */
export interface AdminTransactionPaginated {
  data: AdminTransactionEntity[];
  total: number;
  has_more: boolean;
}

/* -------------------------------------------------------------------------- */
/* Customer 360 (adminLoopay_listCustomers / updateCustomerStatus)             */
/* -------------------------------------------------------------------------- */

/** `AdminLoopayCustomerStatusEntity` on the backend. */
export type AdminLoopayCustomerStatus =
  'ACTIVE' | 'SUSPENDED' | 'FROZEN' | 'PENALIZED' | 'OFFBOARDED';

/** Statuses accepted by `AdminUpdateCustomerStatusInput.status` (no OFFBOARDED). */
export type AdminUpdatableCustomerStatus = Exclude<AdminLoopayCustomerStatus, 'OFFBOARDED'>;

/** `AdminCustomerGraphqlEntity` — camelCase, full entity for the Customer 360 table. */
export interface AdminCustomerManagementEntity {
  id: string;
  clientId: string;
  externalId: string;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  taxId: string;
  taxIdTypeId: string;
  country: string;
  kycStatus: AdminClientKycStatus;
  customerStatus: AdminLoopayCustomerStatus;
  capabilities: unknown;
  rejectionReasons: unknown;
  addressDetails: unknown;
  metadata: unknown;
  bridgeCustomerId: string | null;
  bridgeKycLevel: string | null;
  bridgeKycUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** `AdminCustomerFiltersInput` — for `adminLoopay_listCustomers`. */
export interface AdminCustomerManagementFilters {
  clientId?: string;
  email?: string;
  /** Matches email, first name, last name and business legal name. */
  search?: string;
  kycStatus?: AdminClientKycStatus;
  customerStatus?: AdminLoopayCustomerStatus;
  country?: string;
}

/** `AdminUpdateCustomerStatusInput`. */
export interface AdminUpdateCustomerStatusInput {
  status: AdminUpdatableCustomerStatus;
  reason?: string;
}

/** `AdminCustomerStatusResponseEntity` — snake_case, returned by the status mutation. */
export interface AdminCustomerStatusResponse {
  id: string;
  previous_status: AdminLoopayCustomerStatus;
  current_status: AdminLoopayCustomerStatus;
  reason: string | null;
  updated_at: string;
  changed_by: string;
}

/** Staff role enum of the backoffice (`StaffRole` on the backend). */
export type AdminStaffRole =
  | 'LOOPAY_ADMIN'
  | 'LOOPAY_OPERATIONS'
  | 'OPS_RECAUDOS'
  | 'OPS_DISPERSIONES'
  | 'OPS_KYC'
  | 'OPS_VA'
  | 'OPS_COMMERCIAL'
  | 'PLATFORM_ADMIN';

/** `StaffUserGraphQLEntity` � snake_case output fields. */
export interface AdminStaffUserEntity {
  id: string;
  email: string;
  role: string;
  staff_role: AdminStaffRole | null;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** `PaginatedStaffUsersResponse`. */
export interface AdminStaffUserPaginated {
  data: AdminStaffUserEntity[];
  total: number;
  has_more: boolean;
}

/** `StaffUserFiltersInput` � email filter shape mirrors the backend StringFilter. */
export interface AdminStaffUserFilters {
  email?: { contains?: string; startsWith?: string; equals?: string };
  staff_role?: AdminStaffRole;
  is_active?: boolean;
}

/** `CreateStaffUserInput` � camelCase input fields. */
export interface AdminCreateStaffUserInput {
  email: string;
  authUid: string;
  firstName?: string;
  lastName?: string;
  staffRole?: AdminStaffRole;
  isActive?: boolean;
}

/** `UpdateStaffUserInput`. */
export interface AdminUpdateStaffUserInput {
  firstName?: string;
  lastName?: string;
  staffRole?: AdminStaffRole | null;
  isActive?: boolean;
}

// ---------------------------------------------------------------------------
// Virtual-account request on behalf of a customer (Customer 360)
// ---------------------------------------------------------------------------

export type AdminReceiveOptionStatus = 'available' | 'requested' | 'active' | 'rejected';

export type AdminReceiveIneligibleReason = 'VA_BUSINESS_ONLY' | 'RAIL_UNDER_MAINTENANCE';

/** `ReceiveOptionEntity` � rails a customer can receive on, with state and eligibility. */
export interface AdminReceiveOption {
  country: string;
  currency: string;
  railCode: string;
  railName: string;
  provider: string;
  providers: string[];
  status: AdminReceiveOptionStatus;
  requestId: string | null;
  virtualAccountId: string | null;
  vaRequestState: string | null;
  blockers: { code: string; category: string; message: string }[];
  reason: string | null;
  eligible: boolean;
  ineligibleReason: AdminReceiveIneligibleReason | null;
}

/** `AdminRequestVirtualAccountInput` � used by `adminLoopay_requestVirtualAccount`. */
export interface AdminRequestVirtualAccountInput {
  customerId: string;
  country: string;
  currency: string;
  railCode: string;
}

/** `RequestVirtualAccountResponse`. */
export interface AdminRequestVirtualAccountResult {
  created: boolean;
  request: AdminReceiveOption;
}

/** `AdminVirtualAccountRequestEntity` � an open virtual-account request (`adminLoopay_listVirtualAccountRequests`). */
export interface AdminVirtualAccountRequest {
  id: string;
  customerId: string;
  customerEmail: string;
  clientId: string;
  clientName: string;
  railCode: string;
  railName: string;
  currency: string;
  endorsementStatus: string;
  state: 'REQUESTED' | 'OPS_APPROVED' | 'PROVIDER_ONBOARDING' | string;
  provider: string | null;
  blockers: { code: string; category: string; message: string }[];
  /** Data the provider still needs, as stable keys (`missing_fields` of the onboarding). */
  missingFields: string[];
  /** `missingFields` with group and kind (`PROFILE_FIELD` | `OPS_CHECKLIST`), same order. */
  missingFieldDetails: { key: string; group: string; kind: string }[];
  reason: string | null;
  requestedAt: string;
  /** S22: the staff repair of the request (`AdminVirtualAccountRepairInfoEntity`); null when none. */
  repair?: {
    reason: string;
    repairedBy: string;
    repairedAt: string;
    bankDetailsSource: 'PROVIDER' | 'MANUAL' | string;
  } | null;
}

// ── Provider requirements (S21) and VA repair (S22) ─────────────────────────

/** `AdminProviderRequirementEntity`: the requirement plus who it belongs to and its review trail. */
export interface AdminProviderRequirement extends ProviderRequirement {
  customerName: string;
  customerEmail: string | null;
  clientId: string;
  clientName: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  submittedAt: string | null;
}

/** `AdminProviderRequirementsPage` */
export interface AdminProviderRequirementsPage {
  items: AdminProviderRequirement[];
  total: number;
}

/** `AdminProviderRequirementCounts`: REQUESTED+REJECTED / UPLOADED / APPROVED. */
export interface AdminProviderRequirementCounts {
  awaitingCustomer: number;
  pendingReview: number;
  readyToSubmit: number;
}

/** `AdminProviderRequirementSubmitResult` */
export interface AdminProviderRequirementSubmitResult {
  submitted: number;
  status: string;
  errorMessage: string | null;
}

/** `ProviderRequirementFilterInput` */
export interface ProviderRequirementFilterInput {
  status?: ProviderRequirementStatus[];
  provider?: string;
  customerId?: string;
  search?: string;
}

/** `ReviewProviderRequirementInput`: `reason` is required on REJECT. */
export interface ReviewProviderRequirementInput {
  requirementId: string;
  decision: ProviderRequirementDecision;
  reason?: string;
}

/** `MarkProviderRequirementHandledInput` (T-S21C): the note is required. */
export interface MarkProviderRequirementHandledInput {
  requirementId: string;
  note: string;
}

/** `RepairVirtualAccountRequestInput` (S22). */
export interface RepairVirtualAccountRequestInput {
  endorsementId: string;
  providerAccountId: string;
  reason: string;
  bankDetails?: Record<string, unknown>;
  confirmManualBankDetails?: boolean;
}

/** `AdminVirtualAccountRepairResult`: `bankDetailsSource` is `PROVIDER` or `MANUAL`. */
export interface AdminVirtualAccountRepairResult {
  endorsementId: string;
  virtualAccountId: string;
  status: string;
  bankDetailsSource: 'PROVIDER' | 'MANUAL' | string;
}
