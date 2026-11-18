/**
 * Tenant backoffice (`tenant_*`) types.
 *
 * Customers, wallets and transactions are a mirror of the REST API: the
 * GraphQL arguments are `JSONObject`s with the REST body/query and the results
 * are `JSON` with the REST response body (back: `docs/api/TENANT_GRAPHQL.md`,
 * response DTOs under the back's `src/modules/soberana` DTO folders). These interfaces describe
 * the fields the tenant screens read; every optional REST field stays optional.
 */

// ── Profile ────────────────────────────────────────────────────────────────

export interface TenantEnabledRail {
  code: string;
  currency: string;
  country?: string | null;
}

export interface TenantMe {
  client_id: string;
  name: string;
  status: string;
  api_key_prefix: string;
  api_key_rotated_at?: string | null;
  api_key_expires_at?: string | null;
  /** `production` on the production deployment, `sandbox` on every other one. */
  environment: string;
  enabled_rails: TenantEnabledRail[];
  /**
   * Set only when a Loopay staff member acts as a tenant admin
   * (`x-act-as-client`); null for a real tenant admin. Drives the act-as banner.
   */
  acting_as?: TenantActingAs | null;
}

/** The staff member behind an act-as session (`tenant_me.acting_as`). */
export interface TenantActingAs {
  staff_email?: string | null;
  staff_roles: string[];
}

// ── Pagination (REST list envelope) ────────────────────────────────────────

export interface TenantPage<T> {
  data: T[];
  has_more: boolean;
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// ── Customers ──────────────────────────────────────────────────────────────

export interface TenantAddress {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
}

export interface TenantEndorsement {
  payment_rail: string;
  status: string;
  country?: string | null;
  approved_at?: string | null;
  readiness?: string | null;
  kyc_link?: string | null;
  tos_link?: string | null;
}

export interface TenantCustomer {
  id: string;
  external_id: string;
  email: string;
  customer_type: 'individual' | 'business';
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  business_name?: string | null;
  tax_id?: string | null;
  tax_id_type?: string | null;
  country?: string | null;
  kyc_status: string;
  customer_status: string;
  address?: TenantAddress | null;
  kyc_link?: string | null;
  tos_link?: string | null;
  endorsements?: TenantEndorsement[];
  created_at: string;
  updated_at?: string;
}

export interface TenantCustomerRails {
  customer_id: string;
  endorsements: TenantEndorsement[];
}

export interface TenantRequirement {
  id: string;
  customer_id: string;
  provider: string;
  rail_code?: string | null;
  source?: string | null;
  key: string;
  group?: string | null;
  /** `DOCUMENT`, `VALUE` or `UBO_LINK`. */
  kind: string;
  /** `REQUESTED`, `UPLOADED`, `APPROVED`, `SUBMITTED`, `RESOLVED` or `REJECTED`. */
  status: string;
  value?: string | null;
  reject_reason?: string | null;
  options?: string[] | null;
  requested_at?: string | null;
  due_at?: string | null;
}

export interface TenantRequirementList {
  data: TenantRequirement[];
}

export interface TenantRequirementDocument {
  file_name: string;
  mime_type: string;
  /** Base64 data URI whose type matches `mime_type`. */
  file: string;
}

/** `POST /v1/customers/:id/requirements/:requirement_id` body. */
export interface TenantRequirementAnswer {
  documents?: TenantRequirementDocument[];
  value?: string;
}

/** `POST /v1/customers` body (hosted `kyc_link` flow). */
export interface TenantCreateCustomerInput {
  external_id: string;
  email: string;
  customer_type: 'individual' | 'business';
  first_name?: string;
  last_name?: string;
  business_name?: string;
  tax_id: string;
  tax_id_type: string;
  country?: string;
  phone?: string;
  kyc_method: 'kyc_link';
}

/** `POST /v1/customers/:id/retry-kyc` body (kyc_link regeneration). */
export interface TenantRetryKycInput {
  endorsement?: 'ach_wire' | 'sepa' | 'spei' | 'faster_payments' | 'pix';
  redirect_uri?: string;
}

// ── Wallets ────────────────────────────────────────────────────────────────

export interface TenantWallet {
  id: string;
  customer_id: string;
  currency: string;
  chain: string;
  status: string;
  alias?: string | null;
  address?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface TenantWalletBalance {
  wallet_id: string;
  balance: {
    available: number;
    spendable: number;
    pending: number;
    total: number;
  };
  currency: string;
  updated_at: string;
}

export interface TenantVirtualAccount {
  id: string;
  status: string;
  currency: string;
  payment_rail: string;
  bank_name?: string | null;
  account_number?: string | null;
  routing_number?: string | null;
  iban?: string | null;
  clabe?: string | null;
  swift_code?: string | null;
  bic?: string | null;
  account_holder_name?: string | null;
  beneficiary_name?: string | null;
  reference?: string | null;
}

export interface TenantDepositInstructions {
  customer_id: string;
  wallet_id: string;
  network?: string | null;
  virtual_accounts: TenantVirtualAccount[];
}

export interface TenantAvailableChains {
  chains: string[];
  default_chain?: string | null;
  currency?: string | null;
}

/** `POST /v1/wallets` body. */
export interface TenantCreateWalletInput {
  customer_id: string;
  chain?: string;
  alias?: string;
}

// ── Transactions ───────────────────────────────────────────────────────────

export interface TenantTransaction {
  id: string;
  wallet_id: string;
  type: string;
  direction?: string | null;
  status: string;
  purpose?: string | null;
  amount: string;
  currency: string;
  fee?: string | null;
  exchange_rate?: string | null;
  beneficiary_id?: string | null;
  quote_id?: string | null;
  reference_code?: string | null;
  failure_reason?: string | null;
  destination_tx_hash?: string | null;
  created_at: string;
  completed_at?: string | null;
  updated_at?: string;
}

/** `GET /v1/transactions` query (snake_case only). */
export interface TenantTransactionFilters {
  wallet_id?: string;
  type?: string;
  status?: string;
  created_from?: string;
  created_to?: string;
  page?: number;
  page_size?: number;
}

/** `POST /v1/transactions/off-ramps` body. */
export interface TenantOffRampInput {
  wallet_id: string;
  beneficiary_id: string;
  amount: number;
  currency: string;
  quote_id?: string;
  client_reference_id: string;
}

/** `POST /v1/transactions/dispersions` body. */
export interface TenantDispersionInput {
  wallet_id: string;
  beneficiary_id: string;
  amount: number;
  currency: string;
  client_reference_id: string;
}

/** `POST /v1/transactions/transfers` body. */
export interface TenantTransferInput {
  wallet_id: string;
  to_address: string;
  amount: number;
  currency: string;
  chain: string;
  client_reference_id: string;
}

export interface TenantPaymentLinkPayerDetails {
  full_name: string;
  document_type: string;
  document_number: string;
  email: string;
  phone: string;
}

/** `POST /v1/transactions/on-ramps/payment-links` body. */
export interface TenantPaymentLinkInput {
  customer_id: string;
  wallet_id: string;
  amount: number;
  currency: string;
  rail_code: string;
  purpose?: string;
  expires_in_minutes?: number;
  return_url?: string;
  payer_details?: TenantPaymentLinkPayerDetails;
}

export interface TenantPaymentLink {
  id: string;
  status: string;
  payment_url: string;
  amount: number;
  currency: string;
  expires_at?: string | null;
}

export interface TenantPaymentLinkCapabilities {
  supported_currencies: string[];
  payment_link_rails: string[];
}

/** Command result of off-ramps, dispersions and transfers (at least the id and status). */
export interface TenantTransactionCommandResult {
  id?: string;
  transaction_id?: string;
  status?: string;
}

// ── Team & API key ─────────────────────────────────────────────────────────

export interface TenantTeamMember {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  created_at: string;
}

export interface TenantAdminInvitation {
  member: TenantTeamMember;
  password_setup_link?: string | null;
}

export interface TenantApiKeyRotation {
  api_key: string;
  api_key_prefix: string;
}

// ── Beneficiaries (phase B) ────────────────────────────────────────────────

export type TenantBeneficiaryType = 'BANK_ACCOUNT' | 'PIX' | 'BREB_KEY';
export type TenantHolderType = 'INDIVIDUAL' | 'BUSINESS';
export type TenantAccountType = 'savings' | 'checking';

export interface TenantBeneficiaryRail {
  id: string;
  code: string;
  name: string;
  currency: string;
  country: string;
}

export interface TenantBeneficiary {
  id: string;
  customer_id: string;
  rail_id?: string | null;
  payment_rail?: string | null;
  /** ISO 3166-1 alpha-3. */
  country: string;
  relationship?: string | null;
  holder_type?: string | null;
  beneficiary_name: string;
  tax_id?: string | null;
  currency: string;
  /** Legacy mirror of `review_status` (`PENDING`, `VERIFIED`, `REJECTED`); `UNVERIFIED` = deactivated. */
  verification_status: string;
  rail_code?: string | null;
  provider_code?: string | null;
  /** `IN_REVIEW`, `APPROVED` (usable) or `REJECTED`. */
  review_status?: string | null;
  review_reason?: string | null;
  masked_account_number?: string | null;
  bank_name?: string | null;
  bank_code?: string | null;
  account_number?: string | null;
  routing_number?: string | null;
  iban?: string | null;
  clabe?: string | null;
  pix_key?: string | null;
  bic?: string | null;
  alias?: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at?: string;
  rail?: TenantBeneficiaryRail | null;
}

/**
 * Wrapped beneficiary list. `GET /v1/beneficiaries` (and so
 * `tenant_listBeneficiaries`) answers a bare array today; the wrapped shape is
 * only accepted defensively (`beneficiariesOf`).
 */
export interface TenantBeneficiaryList {
  data: TenantBeneficiary[];
  total: number;
}

/** `GET /v1/beneficiaries` query: `customer_id` is required. */
export interface TenantBeneficiaryFilters {
  customer_id: string;
  country?: string;
  is_favorite?: boolean;
}

/** `POST /v1/beneficiaries` body (`CreateBeneficiaryDto`); the account fields depend on the rail. */
export interface TenantCreateBeneficiaryInput {
  customer_id: string;
  payment_rail?: string;
  type: TenantBeneficiaryType;
  /** ISO 3166-1 alpha-3. */
  country: string;
  relationship?: string;
  beneficiary_name: string;
  holder_type?: TenantHolderType;
  tax_id?: string;
  tax_id_type?: string;
  breb_key?: string;
  bank_code?: string;
  account_number?: string;
  sort_code?: string;
  pix_key?: string;
  routing_number?: string;
  account_number_us?: string;
  bank_name?: string;
  bank_address?: string;
  account_type?: TenantAccountType;
  currency?: string;
  iban?: string;
  clabe?: string;
  bic?: string;
  address_line_1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  alias?: string;
  is_favorite?: boolean;
}

/** `PATCH /v1/beneficiaries/:id` body. */
export interface TenantUpdateBeneficiaryInput {
  alias?: string;
  is_favorite?: boolean;
  beneficiary_name?: string;
}

// ── Quotes (phase B) ───────────────────────────────────────────────────────

/** `GET /v1/quotes` query. */
export interface TenantQuoteRateFilters {
  from: string;
  to: string;
}

/** Indicative rate, not locked. */
export interface TenantIndicativeRate {
  from: string;
  to: string;
  rate: string;
}

/** `POST /v1/quotes` body. */
export interface TenantCreateQuoteInput {
  source_currency: string;
  destination_currency: string;
  source_amount: number;
}

export interface TenantQuoteSide {
  amount: number;
  currency: string;
}

export interface TenantQuote {
  id: string;
  pair: string;
  rate: number;
  source: TenantQuoteSide;
  destination: TenantQuoteSide;
  fee?: { total: number; currency: string } | null;
  /** `ACTIVE`, `EXPIRED` or `USED`. */
  status: string;
  expires_at: string;
  created_at: string;
}

// ── Rails (phase B) ────────────────────────────────────────────────────────

/** `GET /v1/rails` item: a rail the client can use. */
export interface TenantRail {
  id: string;
  code: string;
  name?: string | null;
  currency: string;
  /** ISO 3166-1 alpha-3; multi-country rails list them in `available_countries`. */
  country: string | null;
  available_countries?: string[];
  is_assignable?: boolean;
  type?: 'fiat_rail' | 'crypto_rail';
  /** `on_ramp`, `off_ramp`, `virtual_account`, `payment_link`. */
  enabled_capabilities: string[];
  limits?: { min_amount?: number; max_amount?: number; daily_limit?: number } | null;
  maintenance_notice?: string | null;
}

export interface TenantRailCatalogueProvider {
  code: string;
  directions: string[];
  available: boolean;
}

export interface TenantRailCatalogueRail {
  code: string;
  name: string;
  currency: string;
  /** `INBOUND` (receive) and/or `OUTBOUND` (send). */
  directions: string[];
  beneficiary_supported: boolean;
  providers: TenantRailCatalogueProvider[];
}

export interface TenantRailCatalogueCountry {
  /** ISO 3166-1 alpha-2. */
  country: string;
  rails: TenantRailCatalogueRail[];
}

export interface TenantRailCatalogue {
  countries: TenantRailCatalogueCountry[];
}

// ── Virtual accounts (phase B) ─────────────────────────────────────────────

/** `GET /v1/virtual-accounts/receive-options` query. */
export interface TenantReceiveOptionsFilters {
  customer_id: string;
  country?: string;
}

export interface TenantVaBlocker {
  code: string;
  category: string;
  message: string;
}

export interface TenantReceiveOption {
  country: string;
  currency: string;
  rail_code: string;
  rail_name: string;
  provider: string;
  providers: string[];
  /** `available`, `requested`, `active` or `rejected`. */
  status: string;
  request_id: string | null;
  virtual_account_id: string | null;
  va_request_state: string | null;
  blockers: TenantVaBlocker[];
  reason: string | null;
  eligible: boolean;
  ineligible_reason: string | null;
}

export interface TenantReceiveOptions {
  data: TenantReceiveOption[];
}

/** `POST /v1/virtual-accounts/requests` body. */
export interface TenantRequestVirtualAccountInput {
  customer_id: string;
  country: string;
  currency: string;
  rail_code: string;
}

/** `created: false` when the request (or the account) already existed. */
export interface TenantVirtualAccountRequestResult {
  created: boolean;
  request: TenantReceiveOption;
}

// ── Client webhooks (phase B; camelCase like REST) ─────────────────────────

export interface TenantWebhook {
  id: string;
  url: string;
  /** Empty = every event. */
  events: string[];
  isActive: boolean;
  description?: string | null;
  secretLastChars: string;
  /** Plaintext signing secret: only in the create response, shown once. */
  secret?: string;
  createdAt: string;
  updatedAt: string;
}

/** `POST /v1/webhooks` body. */
export interface TenantWebhookInput {
  url: string;
  events?: string[];
  description?: string;
}

/** `PATCH /v1/webhooks/:id` body. */
export interface TenantWebhookUpdateInput extends Partial<TenantWebhookInput> {
  isActive?: boolean;
}

export interface TenantWebhookEventType {
  event: string;
  description: string;
  category: string;
}

export interface TenantWebhookTestResult {
  success: boolean;
  http_status: number | null;
  duration_ms: number;
  response_body: string | null;
  error_message: string | null;
}

/** `GET /v1/webhooks/logs` query; `success` is a real boolean. */
export interface TenantWebhookLogFilters {
  eventType?: string;
  success?: boolean;
  from?: string;
  to?: string;
  page?: number;
  page_size?: number;
}

export interface TenantWebhookLog {
  id: string;
  event_type: string;
  idempotency_key: string;
  url: string;
  http_status: number | null;
  duration_ms: number | null;
  success: boolean;
  attempt: number;
  created_at: string;
}

export interface TenantWebhookLogDetail extends TenantWebhookLog {
  request_payload: Record<string, unknown>;
  response_body: string | null;
  error_message: string | null;
  next_retry_at: string | null;
}
