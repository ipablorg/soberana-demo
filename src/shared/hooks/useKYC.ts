/**
 * useKYC Hook
 *
 * Manages Bridge KYC verification status with real-time updates.
 *
 * Features:
 * - Real-time KYC status polling (every 40s per REQ-006)
 * - Auto-create customer profile on Bridge if missing
 * - Transactional capability check
 * - Bridge provider integration via customers_create (POST /v0/kyc_links)
 * - Fallback to customers_getTosLink when status polling returns no link
 *
 * Flow:
 * 1. If user has customer_profile_id → poll getBridgeKycStatus for kyc_link
 * 2. If user has NO customer_profile_id → call customers_create to create
 *    the customer on Bridge, which generates the kyc_link
 * 3. After customer creation, refetch auth_me to get the new customer_profile_id
 * 4. If getBridgeKycStatus returns null kyc_link → call customers_getTosLink
 *    with email + redirect_uri to obtain a fresh ToS/KYC link from Bridge
 */

import { selectIsViewingAs, useViewAsStore } from '@/shared/stores/view-as-store';
import { useQuery, useMutation, useQueryClient, useIsFetching } from '@tanstack/react-query';
import { graphqlClient } from '@/shared/lib/graphql-client';
import { isDevMockMode } from '@/shared/lib/dev-config';
import { GetKycStatusDocument } from '@/graphql/queries/customers/get-kyc-status';
import {
  GetKycSnapshotDocument,
  type CustomerKycSnapshot,
  type GetKycSnapshotQuery,
  type GetKycSnapshotQueryVariables,
  type KycSnapshotAction,
} from '@/graphql/queries/customers/get-kyc-snapshot';
import { CreateCustomerDocument } from '@/graphql/mutations/customers/create-customer';
import {
  RefreshKycSnapshotDocument,
  type RefreshKycSnapshotMutation,
} from '@/graphql/mutations/customers/refresh-kyc-snapshot';
import { RetryKycDocument, type RetryKycMutation } from '@/graphql/mutations/customers/retry-kyc';
import { FindCustomerByEmailDocument } from '@/graphql/queries/customers/find-customer-by-email';
import { GetTosLinkDocument } from '@/graphql/mutations/customers/get-tos-link';
import {
  GetCustomerProfileDocument,
  type GetCustomerProfileQuery,
  type GetCustomerProfileQueryVariables,
} from '@/graphql/queries/customers/get-customer-profile';
import { useWallets } from '@/shared/hooks/use-wallets';
import {
  buildRetryKycInput,
  buildCreateCustomerInput,
  isApiKycEnabled,
  type ApiKycPayload,
  type CreateCustomerBaseInfo,
} from '@/shared/lib/kyc/create-customer-input';
import {
  getCustomerTypeForEmail,
  getStoredBusinessName,
  getStoredCustomerType,
  storeCustomerContext,
} from '@/shared/lib/kyc/customer-context';
import { useKycTypeSelectionStore } from '@/shared/stores/useKycTypeSelectionStore';
import {
  buildKycSupportHref,
  deriveKycSnapshotState,
  hasOutstandingRequirements,
  pickPrimaryKycAction,
  shouldPollKycLifecycle,
} from '@/shared/lib/kyc/kyc-snapshot-state';
import { useAuthStore } from '@/shared/stores/auth-store';
import { mapError } from '@/shared/lib/error-mapper';
import { isDuplicateTaxIdError, mapCreateCustomerError } from '@/shared/hooks/use-kyc-create-error';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';

const POLLING_INTERVAL_MS = 20000; // 20 seconds (passive polling, cache-only — no Bridge hit)
const KYC_LINK_STORAGE_KEY = 'soberana_kyc_link';
export const MISSING_CUSTOMER_ID_ERROR_MESSAGE = 'No customer ID available';

/**
 * Module-level singleton lock for customer creation.
 *
 * WHY: Multiple components call useKYC() simultaneously (KYCBanner, TransactionGuard,
 * DisabledWrapper, etc.). Each gets its own useMutation instance. Without this lock,
 * when N components mount at the same time, each independently evaluates
 * shouldCreateCustomer = true and fires mutate(), creating N duplicate
 * customers_create requests.
 *
 * HOW: This promise ref lives OUTSIDE React — shared across all useKYC() instances
 * in the module scope. The first instance to reach the useEffect sets it before
 * calling mutate(). All subsequent instances see it's non-null and skip.
 * Cleared on settled (success or error) so future calls can proceed if needed.
 *
 * React Strict Mode safety: StrictMode double-mounts in dev. The first mount sets
 * the lock and fires mutate(). The second mount sees the lock and skips. On unmount,
 * the lock is NOT cleared (only onSettled clears it), so no race condition.
 */
let customerCreationInFlight: Promise<unknown> | null = null;

export const KYC_REDIRECT_PATH = '/suite/dashboard' as const;

export const BRIDGE_STATUSES = [
  'NOT_INITIATED',
  'INITIATED',
  'PENDING_REVIEW',
  'ADDITIONAL_INFO_REQUIRED',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
  'FAILED',
] as const;

export type KYCStatus = (typeof BRIDGE_STATUSES)[number];

const TERMINAL_STATUSES: ReadonlySet<KYCStatus> = new Set([
  'APPROVED',
  'REJECTED',
  'EXPIRED',
  'FAILED',
]);

/**
 * Returns the polling interval for KYC status queries.
 * Stops polling when status reaches a terminal state.
 */
/**
 * Suite readiness per the manual-backoffice flow: KYC approved by ops, the
 * customer operationally ACTIVE (a SUSPENDED/FROZEN customer with approved KYC
 * must not pass) and a wallet already provisioned by ops.
 */
export function computeIsReadyForSuite({
  kycStatus,
  customerStatus,
  walletExists,
}: {
  kycStatus: string | null | undefined;
  customerStatus: string | null | undefined;
  walletExists: boolean;
}): boolean {
  return kycStatus === 'APPROVED' && customerStatus === 'ACTIVE' && walletExists;
}

const MAX_POLLING_INTERVAL_MS = 120000;
const POLLS_PER_BACKOFF_STEP = 4;

/**
 * Polling cadence with exponential backoff: the base interval doubles every
 * {@link POLLS_PER_BACKOFF_STEP} polls up to {@link MAX_POLLING_INTERVAL_MS}.
 * react-query pauses interval refetches while the tab is hidden.
 */
export function getBackedOffPollingInterval(pollCount: number): number {
  const step = Math.floor(Math.max(pollCount, 0) / POLLS_PER_BACKOFF_STEP);
  return Math.min(POLLING_INTERVAL_MS * 2 ** step, MAX_POLLING_INTERVAL_MS);
}

/**
 * Poll counter for the backoff, restarted whenever the observed value (KYC
 * status / lifecycle) changes or after a successful action (`reset`), so the
 * polling goes back to the base cadence instead of staying slow forever.
 * `dataUpdateCount` is react-query's monotonic fetch counter.
 */
export function createPollBackoff() {
  let baseline = 0;
  let lastValue: unknown;
  let started = false;
  let resetRequested = false;

  return {
    pollCount(dataUpdateCount: number, value: unknown): number {
      if (!started || resetRequested || value !== lastValue) {
        baseline = dataUpdateCount;
        lastValue = value;
        started = true;
        resetRequested = false;
      }
      return Math.max(dataUpdateCount - baseline, 0);
    },
    reset() {
      resetRequested = true;
    },
  };
}

export function getPollingInterval(kycStatus: string | undefined, pollCount = 0): number | false {
  if (kycStatus && TERMINAL_STATUSES.has(kycStatus as KYCStatus)) {
    return false;
  }
  return getBackedOffPollingInterval(pollCount);
}

export interface KYCData {
  canTransact: boolean;
  kycStatus: KYCStatus;
  customerType: 'individual' | 'business';
  isReadyForSuite: boolean;
  isBusinessHostedLinkOnly: boolean;
  kycLink: string | null;
  kycUrl: string | null;
  tosLink: string | null;
  rejectionReasons: string[] | null;
  customerStatus: string | null;
  tosAccepted: boolean | null;
  hasTaxId: boolean | null;
  hasAddress: boolean | null;
  hasSubmittedApiOnboarding: boolean | null;
  country: string | null;
  snapshot: CustomerKycSnapshot | null;
  actions: string[];
  reasons: string[];
  missingFields: string[];
  missingDocumentPurposes: string[];
  missingQuestionnaireFields: string[];
  reconciliationState: string;
  lastReconciliationSource: string | null;
  onboardingMode: 'api' | 'kyc_link' | null;
  supportHref: string | null;
}

export type TOSFlowMode = 'create_customer' | 'request_tos_link' | 'wait_for_api_customer';

interface CreateCustomerResponse {
  customers_create: {
    id: string;
    customer_type?: string;
    business_name?: string | null;
    kyc_status: string;
    kyc_link?: string | null;
    tos_link?: string | null;
    next_required_action?: KycSnapshotAction | null;
    kyc_snapshot?: CustomerKycSnapshot | null;
  };
}

interface FindCustomerByEmailResponse {
  customers_list: {
    data: Array<{
      id: string;
      email: string;
      kyc_status: string;
    }>;
  };
}

interface RetryKycOptions {
  endorsement?: string;
  redirect_uri?: string;
}

function normalizeCustomerType(value: string | null | undefined): 'individual' | 'business' {
  return value === 'business' ? 'business' : 'individual';
}

function getCreateCustomerBase(
  user: { email?: string | null; name?: string | null; company_name?: string | null } | null
): CreateCustomerBaseInfo {
  if (!user?.email || !user.name) {
    throw new Error('No user data available');
  }

  const nameParts = user.name.trim().split(/\s+/);
  const firstName = nameParts[0] || user.name;
  const lastName = nameParts.slice(1).join(' ') || user.name;

  return {
    customer_type: normalizeCustomerType(
      getCustomerTypeForEmail(user.email) ?? getStoredCustomerType()
    ),
    business_name: user.company_name ?? getStoredBusinessName() ?? undefined,
    email: user.email,
    first_name: firstName,
    last_name: lastName,
  };
}

/**
 * Checks if a GraphQL error is a "customer already exists" duplicate error
 */
function isDuplicateCustomerError(err: unknown): boolean {
  const message = mapError(err).message.toLowerCase();
  return message.includes('already exists') || message.includes('ya existe');
}

export function isUnsupportedApiProviderError(err: unknown): boolean {
  const { message, technical } = mapError(err);
  const text = `${message} ${technical ?? ''}`.toLowerCase();

  return text.includes("does not support kyc_method 'api'");
}

export function getTosFlowMode({
  apiKycEnabled,
  hasCustomerId,
  hasSubmittedIdentityProgress,
}: {
  apiKycEnabled: boolean;
  hasCustomerId: boolean;
  hasSubmittedIdentityProgress: boolean;
}): TOSFlowMode {
  // If a customer already exists, we can request a ToS link directly — even
  // if no API onboarding was submitted on this device. This unblocks the case
  // where Bridge reports `tos_acceptance` as the only missing requirement but
  // the user is on a fresh device (no localStorage of prior progress).
  if (hasCustomerId) {
    return 'request_tos_link';
  }

  if (apiKycEnabled && !hasSubmittedIdentityProgress) {
    return 'wait_for_api_customer';
  }

  if (!hasCustomerId) {
    return 'create_customer';
  }

  return 'request_tos_link';
}

export function hasPersistedApiOnboardingSubmission({
  hasSubmittedApiOnboarding,
}: {
  hasSubmittedApiOnboarding: boolean | null;
}): boolean {
  return hasSubmittedApiOnboarding === true;
}

export function canRunCustomerScopedKycAction({
  customerId,
  isAuthMeFetching,
}: {
  customerId: string | null;
  isAuthMeFetching: boolean;
}): boolean {
  return Boolean(customerId) && !isAuthMeFetching;
}

/**
 * Finds the existing customer profile by email using customers_list
 */
async function findCustomerByEmail(email: string): Promise<string | null> {
  try {
    const result = await graphqlClient.request<FindCustomerByEmailResponse>(
      FindCustomerByEmailDocument
    );
    const match = result.customers_list.data.find(
      (c) => c.email.toLowerCase() === email.toLowerCase()
    );
    return match?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Store KYC link to localStorage
 * Used by registration flow to persist the link from backend response
 */
export function storeKycLink(link: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KYC_LINK_STORAGE_KEY, link);
  }
}

/**
 * Clear KYC link from localStorage
 * Used on logout to clean up sensitive data
 */
export function clearKycLink(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(KYC_LINK_STORAGE_KEY);
  }
}

/**
 * Get stored KYC link from localStorage
 * Returns null if not found
 */
export function getStoredKycLink(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(KYC_LINK_STORAGE_KEY);
  }
  return null;
}

/**
 * Builds the redirect URI for KYC completion.
 * Uses current origin to work in any environment (local, staging, prod).
 */
function getKycRedirectUri(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${KYC_REDIRECT_PATH}`;
  }
  return `http://localhost:5173${KYC_REDIRECT_PATH}`;
}

export function useKYC() {
  const user = useAuthStore((state) => state.user);
  const isViewingAs = useViewAsStore(selectIsViewingAs);
  const customerId = user?.customer_profile_id ?? null;
  const hasUser = Boolean(user);
  const queryClient = useQueryClient();
  const kycSelectedType = useKycTypeSelectionStore((state) => state.selectedType);
  const [createdCustomerId, setCreatedCustomerId] = useState<string | null>(null);
  const [unsupportedApiProviderMessage, setUnsupportedApiProviderMessage] = useState<string | null>(
    null
  );
  const statusBackoff = useRef(createPollBackoff());
  const snapshotBackoff = useRef(createPollBackoff());
  const resetPollBackoff = () => {
    statusBackoff.current.reset();
    snapshotBackoff.current.reset();
  };

  const effectiveCustomerId = customerId || createdCustomerId;

  // Track whether auth_me query is still fetching.
  // POST-REGISTRATION GUARD: After user_register, signIn() fires auth_me to get
  // the full user profile (including customer_profile_id). If auth_me hasn't
  // resolved yet, effectiveCustomerId is null — but that doesn't mean the customer
  // is missing. It means we simply don't have the data yet. Without this guard,
  // the auto-create effect below sees hasUser=true + effectiveCustomerId=null and
  // fires customers_create, duplicating the customer that user_register already created.
  const isAuthMeFetching = useIsFetching({ queryKey: ['auth', 'me'] }) > 0;

  // Backend KYCStatusEntity uses snake_case: kyc_status, kyc_link, can_transact, rejection_reasons
  const {
    data: statusData,
    isLoading: isStatusLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['kyc-status', effectiveCustomerId],
    queryFn: async () => {
      // Local demo override: no backend in mock mode — return an approved
      // KYC entity so the wallet and money flows stay unlocked for the demo.
      if (isDevMockMode()) {
        return {
          can_transact: true,
          kyc_status: 'APPROVED',
          kyc_link: null,
          kyc_url: null,
          tos_link: null,
          rejection_reasons: null,
          customer_status: 'ACTIVE',
          tos_accepted: true,
          has_tax_id: true,
          has_address: true,
          has_submitted_api_onboarding: true,
          country: 'US',
        };
      }

      if (!effectiveCustomerId) {
        throw new Error(MISSING_CUSTOMER_ID_ERROR_MESSAGE);
      }

      const result = await graphqlClient.request(GetKycStatusDocument, {
        customerId: effectiveCustomerId,
      });

      return result.getBridgeKycStatus;
    },
    enabled: isDevMockMode() || Boolean(effectiveCustomerId),
    refetchInterval: (query) =>
      getPollingInterval(
        query.state.data?.kyc_status,
        statusBackoff.current.pollCount(query.state.dataUpdateCount, query.state.data?.kyc_status)
      ),
    staleTime: POLLING_INTERVAL_MS / 2,
  });

  const {
    data: snapshotData,
    isLoading: isSnapshotLoading,
    isFetching: isSnapshotFetching,
    refetch: refetchSnapshot,
  } = useQuery({
    queryKey: ['kyc-snapshot', effectiveCustomerId],
    queryFn: async () => {
      if (!effectiveCustomerId) {
        throw new Error(MISSING_CUSTOMER_ID_ERROR_MESSAGE);
      }

      return graphqlClient.request<GetKycSnapshotQuery, GetKycSnapshotQueryVariables>(
        GetKycSnapshotDocument,
        { customerId: effectiveCustomerId }
      );
    },
    enabled: Boolean(effectiveCustomerId),
    refetchInterval: (query) =>
      shouldPollKycLifecycle(
        query.state.data?.customers_getKycSnapshot?.lifecycle as KYCStatus | undefined
      )
        ? getBackedOffPollingInterval(
            snapshotBackoff.current.pollCount(
              query.state.dataUpdateCount,
              query.state.data?.customers_getKycSnapshot?.lifecycle
            )
          )
        : false,
    staleTime: POLLING_INTERVAL_MS / 2,
  });

  // Raw operational status. getBridgeKycStatus.customer_status is a
  // compatibility projection that can report ACTIVE for a non-active customer,
  // so the readiness gate reads customers_findById instead.
  const { data: customerProfileData, isLoading: isCustomerProfileLoading } = useQuery({
    queryKey: ['kyc-customer-profile', effectiveCustomerId],
    queryFn: async () => {
      if (!effectiveCustomerId) {
        throw new Error(MISSING_CUSTOMER_ID_ERROR_MESSAGE);
      }

      return graphqlClient.request<GetCustomerProfileQuery, GetCustomerProfileQueryVariables>(
        GetCustomerProfileDocument,
        { id: effectiveCustomerId }
      );
    },
    enabled: Boolean(effectiveCustomerId),
    staleTime: POLLING_INTERVAL_MS / 2,
  });

  const { wallets, isLoading: isWalletsLoading } = useWallets();

  const refreshSnapshotMutation = useMutation({
    mutationFn: async () => {
      if (!effectiveCustomerId) {
        throw new Error(MISSING_CUSTOMER_ID_ERROR_MESSAGE);
      }

      return graphqlClient.request<RefreshKycSnapshotMutation>(RefreshKycSnapshotDocument, {
        input: {
          customer_id: effectiveCustomerId,
        },
      });
    },
    onSuccess: () => {
      resetPollBackoff();
      queryClient.invalidateQueries({ queryKey: ['kyc-snapshot', effectiveCustomerId] });
      queryClient.invalidateQueries({ queryKey: ['kyc-status', effectiveCustomerId] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (err) => {
      toast.error(mapError(err).message);
    },
  });

  const retryKycMutation = useMutation({
    mutationFn: async ({
      payload,
      options,
    }: {
      payload: ApiKycPayload;
      options?: RetryKycOptions;
    }) => {
      if (!effectiveCustomerId) {
        throw new Error(MISSING_CUSTOMER_ID_ERROR_MESSAGE);
      }

      const input = buildRetryKycInput(
        getCreateCustomerBase(user),
        effectiveCustomerId,
        payload,
        options
      );

      const result = await graphqlClient.request<RetryKycMutation>(RetryKycDocument, { input });

      return result.customers_retryKyc;
    },
    onSuccess: () => {
      resetPollBackoff();
      queryClient.invalidateQueries({ queryKey: ['kyc-snapshot', effectiveCustomerId] });
      queryClient.invalidateQueries({ queryKey: ['kyc-status', effectiveCustomerId] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (err) => {
      toast.error(mapError(err).message);
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (payload?: ApiKycPayload) => {
      setUnsupportedApiProviderMessage(null);

      // When `payload` is provided, build the in-app `api` input. Otherwise build the legacy hosted-link input. This keeps the
      // auto-create effect on the legacy path while the wizard opts in to `api`.
      const input = buildCreateCustomerInput(getCreateCustomerBase(user), payload);

      const result = await graphqlClient.request<CreateCustomerResponse>(CreateCustomerDocument, {
        input,
      });
      return result.customers_create;
    },
    onSuccess: (created) => {
      resetPollBackoff();
      storeCustomerContext({
        customerType: created.customer_type,
        businessName: created.business_name ?? null,
        email: user?.email ?? undefined,
      });
      setCreatedCustomerId(created.id);
      if (created.kyc_snapshot) {
        queryClient.setQueryData<GetKycSnapshotQuery>(['kyc-snapshot', created.id], {
          customers_getKycSnapshot: created.kyc_snapshot,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['kyc-snapshot'] });
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
    },
    onError: async (err) => {
      if (isUnsupportedApiProviderError(err)) {
        setUnsupportedApiProviderMessage(mapError(err).message);
        return;
      }

      // A duplicate *tax id* says nothing about this user's own customer: do not
      // try to adopt one by email, show the real reason.
      if (!isDuplicateTaxIdError(err) && isDuplicateCustomerError(err) && user?.email) {
        const existingId = await findCustomerByEmail(user.email);
        if (existingId) {
          setCreatedCustomerId(existingId);
          queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
          return;
        }
      }
      toast.error(mapCreateCustomerError(err));
    },
    onSettled: () => {
      // Clear the singleton lock so future attempts can proceed if needed
      // (e.g., after a logout/login cycle within the same SPA session)
      customerCreationInFlight = null;
    },
  });

  // Standalone ToS-link mutation.
  //
  // This is a fallback for flows that do not yet have a customer-bound `tos_link`
  // from getBridgeKycStatus/customers_create. When the backend already exposes a
  // customer-level ToS link, the frontend should reuse that contract instead of
  // requesting a generic standalone link.
  const getTosLinkMutation = useMutation({
    mutationFn: async () => {
      if (!user?.email) throw new Error('No user email available');
      const result = await graphqlClient.request<{
        customers_getTosLink: { tos_url: string };
      }>(GetTosLinkDocument, {
        input: {
          email: user.email,
          redirect_uri: getKycRedirectUri(),
        },
      });
      return result.customers_getTosLink?.tos_url ?? null;
    },
    onSuccess: (tosUrl) => {
      if (tosUrl) {
        storeKycLink(tosUrl);
        window.open(tosUrl, '_blank', 'noopener,noreferrer');
      }
    },
    onError: (err) => {
      toast.error(mapError(err).message);
    },
  });

  // Derive status from backend data (snake_case fields)
  const createdSnapshot = createCustomerMutation.data?.kyc_snapshot ?? null;
  const snapshot = snapshotData?.customers_getKycSnapshot ?? createdSnapshot;
  const snapshotState = deriveKycSnapshotState(
    snapshot,
    (statusData?.kyc_status as KYCStatus | undefined) ??
      (user?.kyc_status as KYCStatus | undefined) ??
      'NOT_INITIATED'
  );
  const kycStatus =
    (snapshot?.lifecycle as KYCStatus | undefined) ??
    (statusData?.kyc_status as KYCStatus) ??
    (user?.kyc_status as KYCStatus) ??
    'NOT_INITIATED';
  const backendLink = statusData?.kyc_link ?? null;
  const storedLink = getStoredKycLink();
  const kycLink = backendLink || storedLink;
  const kycUrl = statusData?.kyc_url ?? null;
  const tosLink = snapshot?.tos.url ?? statusData?.tos_link ?? null;
  const canTransact = effectiveCustomerId ? (statusData?.can_transact ?? false) : false;
  const customerType = normalizeCustomerType(
    (snapshot?.prefill as { customer_type?: string } | null | undefined)?.customer_type ??
      createCustomerMutation.data?.customer_type ??
      kycSelectedType ??
      (user?.email ? getCustomerTypeForEmail(user.email) : null) ??
      getStoredCustomerType()
  );
  const onboardingMode =
    snapshot?.onboarding_mode === 'api' || snapshot?.onboarding_mode === 'kyc_link'
      ? snapshot.onboarding_mode
      : customerType === 'business'
        ? 'kyc_link'
        : 'api';
  const lastReconciliationSource = snapshot?.freshness.last_reconciliation_source ?? null;
  const isBusinessHostedLinkOnly = customerType === 'business';

  // Onboarding progress fields (nullable — graceful when backend hasn't been updated)
  const profileCustomerStatus = customerProfileData?.customers_findById?.customer_status ?? null;
  const customerStatus = profileCustomerStatus ?? statusData?.customer_status ?? null;
  const isCustomerActive = profileCustomerStatus === 'ACTIVE';
  const hasWallet = wallets.length > 0;
  const tosAccepted = snapshot?.tos.accepted ?? statusData?.tos_accepted ?? null;
  const hasTaxId = statusData?.has_tax_id ?? null;
  const hasAddress = statusData?.has_address ?? null;
  const hasSubmittedApiOnboarding = statusData?.has_submitted_api_onboarding ?? null;
  const customerCountry = statusData?.country ?? null;
  const supportHref = snapshotState.needsSupport
    ? buildKycSupportHref({
        lifecycle: kycStatus,
        customerStatus,
        customerId: effectiveCustomerId,
      })
    : null;
  const hasSubmittedIdentityProgress = hasPersistedApiOnboardingSubmission({
    hasSubmittedApiOnboarding: snapshotState.hasSubmittedProgress || hasSubmittedApiOnboarding,
  });
  const tosFlowMode = getTosFlowMode({
    apiKycEnabled: isApiKycEnabled(),
    hasCustomerId: Boolean(effectiveCustomerId),
    hasSubmittedIdentityProgress,
  });

  // Derived: customer exists and was created but KYC hasn't progressed
  const isCustomerInitialized = Boolean(effectiveCustomerId) && !snapshotState.isTerminal;
  const isReadyForSuite = computeIsReadyForSuite({
    kycStatus,
    customerStatus: profileCustomerStatus,
    walletExists: hasWallet,
  });

  // Auto-create customer profile if user is authenticated but has no customer_profile_id.
  // Uses module-level singleton lock to prevent duplicate requests across multiple
  // useKYC() instances that mount simultaneously (see customerCreationInFlight above).
  //
  // POST-REGISTRATION GUARD (isAuthMeFetching):
  // After registration, signIn() triggers auth_me which returns customer_profile_id.
  // If auth_me is still in-flight, effectiveCustomerId=null is a TRANSIENT state,
  // not a real "missing customer" signal. We wait for auth_me to settle before
  // deciding whether to auto-create. This prevents the race condition where
  // user_register already created the customer but auth_me hasn't returned it yet.
  useEffect(() => {
    const shouldCreateCustomer =
      hasUser &&
      !effectiveCustomerId &&
      !isAuthMeFetching &&
      // When the in-app api flow is enabled, the Verify Identity wizard owns customer
      // creation. The legacy auto-create must stand down so it does not create a
      // hosted-link customer before the user submits the wizard.
      !isApiKycEnabled() &&
      // A super admin viewing a customer (#415) is read-only: never create one.
      !isViewingAs &&
      !createCustomerMutation.isPending &&
      !createCustomerMutation.isError &&
      !createCustomerMutation.isSuccess;

    if (shouldCreateCustomer && !customerCreationInFlight) {
      // Set the lock BEFORE calling mutate() — synchronous, so all other
      // useEffect executions in the same microtask batch will see it immediately.
      // No payload → legacy hosted-link flow (the in-app wizard passes an api payload).
      customerCreationInFlight = createCustomerMutation.mutateAsync(undefined).catch(() => {
        // Error already handled by mutation onError callback.
        // catch() here prevents unhandled promise rejection from mutateAsync.
      });
    }
  }, [hasUser, effectiveCustomerId, isAuthMeFetching, isViewingAs, createCustomerMutation]);

  // Store KYC link from backend to localStorage when we get it
  useEffect(() => {
    if (backendLink && backendLink !== storedLink) {
      storeKycLink(backendLink);
    }
  }, [backendLink, storedLink]);

  // Refetch ToS/KYC state whenever the tab regains focus.
  //
  // WHY: There is no backend push when the user accepts ToS or completes KYC
  // on Bridge/Persona. The polling cadence (40s) leaves a long window during
  // which the dashboard banner shows a stale "still pending" view after the
  // user comes back. Invalidating on visibility-change collapses that window
  // to one round trip without lowering the global polling interval.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
      queryClient.invalidateQueries({ queryKey: ['kyc-snapshot'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient]);

  const statusChecks = {
    isKYCPending: snapshotState.isPendingSubmission,
    isKYCInReview: snapshotState.isPendingReview,
    isKYCApproved: snapshotState.isApproved,
    isKYCRejected: snapshotState.isRejected,
    isKYCExpired: snapshotState.isExpired,
    isKYCFailed: snapshotState.isFailed,
    needsKycResume: snapshotState.needsResume,
    needsKycRetry: snapshotState.needsRetry,
    needsManualRefresh: snapshotState.needsManualRefresh,
  };
  const canRunCustomerScopedAction = canRunCustomerScopedKycAction({
    customerId: effectiveCustomerId,
    isAuthMeFetching,
  });

  /**
   * Start the KYC verification flow.
   *
   * Bridge has two separate links:
   *   - kyc_link: Full identity verification (Persona) from POST /v0/kyc_links
   *   - tos_link: Terms of Service acceptance from POST /v0/customers/tos_links
   *
   * Priority order:
   *   1. kyc_link from getBridgeKycStatus (stored during customers_create with kyc_method="kyc_link")
   *      — In production this is a real Persona URL for identity verification
   *      — In sandbox this is null (sandbox strategy returns empty string)
   *   2. customers_create (if no customer exists yet) triggers POST /v0/kyc_links
   *      which generates BOTH kyc_link and tos_link
   *   3. customers_getTosLink — generates only the ToS acceptance link
   *      — In sandbox: mock-tos page (sufficient because sandbox auto-approves)
   *      — In production: ToS-only, user still needs kyc_link for Persona verification
   */
  /**
   * Start the ToS flow (Step 1 of onboarding).
   *
   * Prefer the customer-bound `tos_link` exposed by the current backend state.
   * Fall back to customers_getTosLink only when the user does not yet have a
   * customer-specific ToS link to resume from.
   */
  const startTos = async () => {
    if (!user?.email) return;

    if (tosFlowMode === 'wait_for_api_customer') {
      return;
    }

    if (effectiveCustomerId) {
      if (tosAccepted === true) {
        return;
      }

      if (tosLink) {
        storeKycLink(tosLink);
        window.open(tosLink, '_blank', 'noopener,noreferrer');
        return;
      }

      try {
        await getTosLinkMutation.mutateAsync();
      } catch {
        // onError already toasted.
      }
      return;
    }

    if (tosFlowMode === 'create_customer' && !createCustomerMutation.isPending) {
      try {
        await createCustomerMutation.mutateAsync(undefined);
      } catch {
        // onError already toasted; abort the ToS step.
        return;
      }
    }

    try {
      await getTosLinkMutation.mutateAsync();
    } catch {
      // onError already toasted.
    }
  };

  const startKYC = async () => {
    // 1. If we have a KYC link from getBridgeKycStatus or localStorage, use it
    //    (in production this is the Persona identity verification link)
    if (kycLink) {
      window.open(kycLink, '_blank', 'noopener,noreferrer');
      return;
    }

    // 2. No customer profile → create one via customers_create which calls
    //    Bridge POST /v0/kyc_links and generates both kyc_link + tos_link
    if (!effectiveCustomerId && user?.email) {
      try {
        await createCustomerMutation.mutateAsync(undefined);
      } catch {
        // Error already handled by mutation onError
      }
      return;
    }

    // 3. Customer exists but no kyc_link — request a ToS/KYC link
    //    customers_getTosLink calls Bridge POST /v0/customers/tos_links (ToS only).
    //    In sandbox mode this is sufficient (auto-approval).
    //    In production, getBridgeKycStatus.kyc_link should already be populated
    //    from the initial customers_create call.
    if (effectiveCustomerId && user?.email) {
      try {
        const tosResult = await graphqlClient.request<{
          customers_getTosLink: { tos_url: string };
        }>(GetTosLinkDocument, {
          input: {
            email: user.email,
            redirect_uri: getKycRedirectUri(),
          },
        });
        const tosUrl = tosResult.customers_getTosLink?.tos_url;
        if (tosUrl) {
          storeKycLink(tosUrl);
          window.open(tosUrl, '_blank', 'noopener,noreferrer');
          return;
        }
      } catch {
        // getTosLink failed — fall through to refetch status
      }

      // Final fallback: refetch getBridgeKycStatus to check if kyc_link appeared
      const result = await refetch();
      const link = result.data?.kyc_link;
      if (link) {
        storeKycLink(link);
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('Your verification link is not available yet. Please try again in a moment.');
      }
    }
  };

  return {
    data: statusData
      ? {
          canTransact: statusData.can_transact,
          kycStatus,
          customerType,
          isReadyForSuite,
          isBusinessHostedLinkOnly,
          kycLink: kycLink,
          kycUrl: kycUrl,
          tosLink: tosLink,
          rejectionReasons: snapshotState.reasons,
          customerStatus,
          tosAccepted,
          hasTaxId,
          hasAddress,
          hasSubmittedApiOnboarding,
          country: customerCountry,
          snapshot,
          actions: snapshotState.actions,
          reasons: snapshotState.reasons,
          missingFields: snapshotState.missingFields,
          missingDocumentPurposes: snapshotState.missingDocumentPurposes,
          missingQuestionnaireFields: snapshotState.missingQuestionnaireFields,
          reconciliationState: snapshotState.reconciliationState,
          lastReconciliationSource,
          onboardingMode,
          supportHref,
        }
      : null,
    kycStatus,
    customerType,
    isReadyForSuite,
    isBusinessHostedLinkOnly,
    customerId: effectiveCustomerId,
    kycLink,
    kycUrl,
    tosLink,
    canTransact,
    snapshot,
    snapshotState,
    actions: snapshotState.actions,
    reasons: snapshotState.reasons,
    missingFields: snapshotState.missingFields,
    missingDocumentPurposes: snapshotState.missingDocumentPurposes,
    missingQuestionnaireFields: snapshotState.missingQuestionnaireFields,
    reconciliationState: snapshotState.reconciliationState,
    lastReconciliationSource,
    onboardingMode,
    hasOutstandingRequirements: hasOutstandingRequirements(snapshot),
    primaryAction: pickPrimaryKycAction(snapshotState),
    needsSupport: snapshotState.needsSupport,
    supportHref,

    // Onboarding progress
    customerStatus,
    isCustomerActive,
    hasWallet,
    tosAccepted,
    hasTaxId,
    hasAddress,
    hasSubmittedApiOnboarding,
    hasSubmittedIdentityProgress,
    customerCountry,
    isCustomerInitialized,
    canRunCustomerScopedAction,
    tosFlowMode,
    hasUnsupportedApiProviderFallback: unsupportedApiProviderMessage !== null,
    unsupportedApiProviderMessage,

    ...statusChecks,

    startKYC,
    startTos,
    refetch,
    refetchSnapshot,
    refreshSnapshot: () => {
      if (!canRunCustomerScopedAction) {
        return Promise.resolve(null);
      }

      return refreshSnapshotMutation.mutateAsync();
    },
    retryKyc: (payload: ApiKycPayload, options?: RetryKycOptions) =>
      retryKycMutation.mutateAsync({ payload, options }),

    // In-app api flow: the Verify Identity wizard submits the full identity payload
    // (kyc_method:"api") and receives the create result, which now
    // includes tos_link/kyc_link.
    createCustomer: (payload: ApiKycPayload) => createCustomerMutation.mutateAsync(payload),
    isCreatingCustomer: createCustomerMutation.isPending,
    isRetryingKyc: retryKycMutation.isPending,
    isRefreshingSnapshot: refreshSnapshotMutation.isPending,

    isStartingTos: getTosLinkMutation.isPending || createCustomerMutation.isPending,
    isStartingKyc: createCustomerMutation.isPending,

    // True during passive background polling (every POLLING_INTERVAL_MS).
    // False during initial load (use `isLoading` for that) and when no customer
    // is bound. Use this to render a subtle "still checking" indicator on the
    // dashboard banner WITHOUT blocking any CTAs.
    isPollingSnapshot:
      isSnapshotFetching &&
      !isSnapshotLoading &&
      Boolean(effectiveCustomerId) &&
      shouldPollKycLifecycle(kycStatus),

    isLoading:
      ((isStatusLoading || isSnapshotLoading || isCustomerProfileLoading) &&
        Boolean(effectiveCustomerId)) ||
      isWalletsLoading ||
      createCustomerMutation.isPending,
    error,
  };
}
