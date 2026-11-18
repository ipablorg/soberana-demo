/**
 * Hook: useUserAccounts
 *
 * Single-entry adapter that composes the three GraphQL sources used by
 * `/suite/receive` into the shape the conversational dashboard's
 * receive flow needs:
 *
 *   useDepositInstructions(walletId, customerId)  →  active + pending rails
 *   useEndorsements()                             →  rails the user already subscribed to
 *   useRails()                                    →  full catalog of rails (for "por activar")
 *
 * Pointing at the exact same backend endpoints as the standalone Receive
 * page is intentional: a single source of truth for accounts means the
 * two surfaces cannot drift (e.g. a currency showing as active here and
 * inactive there). It also means any fixture/mock work done for one
 * flows automatically covers the other.
 *
 * The normalized `UserAccount` still exposes `status` as a high-level
 * enum — `active | pending | not_requested` — by:
 *  - taking rails the `depositInstructions` endpoint returns with status
 *    'active|ACTIVE' → `active`
 *  - taking rails it returns with any other status → `pending`
 *  - taking catalog rails the user has NOT subscribed to at all →
 *    `not_requested` (the row is synthesized locally; it has no id yet)
 *
 * Why synthesizing `not_requested` rows instead of querying a dedicated
 * endpoint: the backend's contract is "absence = not requested". A
 * row not returned by depositInstructions, and not present in the
 * endorsements list, means the user hasn't opened that account. The
 * Receive page follows the same convention.
 */

import { useDepositInstructions } from '@/shared/hooks/use-deposit-instructions';
import type { VirtualAccount as BackendVirtualAccount } from '@/shared/hooks/use-deposit-instructions';
import { useEndorsements } from '@/shared/hooks/use-endorsements';
import { useRails, EXCLUDED_RAILS } from '@/shared/hooks/use-rails';
import { useReceiveWallet } from '@/shared/hooks/use-receive-wallet';
import { usePaymentLinkCapabilities } from '@/shared/hooks/use-payment-link-capabilities';
import { useAuth } from '@/shared/hooks/use-auth';
import { useTutorialDemoStore } from '@/shared/stores/useTutorialDemoStore';
import { DEMO_VIRTUAL_ACCOUNTS, DEMO_RAILS } from '@/shared/lib/tutorial-demo-data';
import {
  buildReceiveAccounts,
  type ReceiveActivationActionLink,
  type ReceiveAccountStatus,
} from '@/shared/lib/receive-account-view-model';

export type UserAccountStatus = ReceiveAccountStatus;

export interface UserAccount {
  /**
   * Stable identity. For backend-returned accounts this is the
   * virtual-account id. For synthesized `not_requested` rows we
   * mint a predictable key from the rail code so React's diffing is
   * stable across re-renders.
   */
  id: string;
  /** ISO currency / crypto ticker (USD, USDC, EUR, MXN, COP, BRL, …). */
  currency: string;
  /** Rail code as returned by the backend (ach, wire, spei, pix, sepa, co_ach, co_breb, iban…). */
  paymentRail: string;
  status: UserAccountStatus;
  /**
   * Human-readable rail name, populated only for `not_requested` rows
   * (from the rails catalog). Active/pending rows usually have their
   * display label derived from `currency`.
   */
  railName?: string;
  /**
   * Deposit fields. Present for `active` accounts, null otherwise.
   * These map 1:1 onto `VirtualAccount` from `use-deposit-instructions`
   * so the account-details panel can read them directly.
   */
  deposit: BackendVirtualAccount | null;
  /**
   * True when the endorsement is active but no virtual account was
   * provisioned — the rail operates via payment links instead of
   * deposit instructions.
   */
  usePaymentLink?: boolean;
  endorsementStatus?: string;
  /** Backend-owned receive readiness (ready | waiting | unavailable). */
  readiness?: string | null;
  /** What backs the rail (virtual_account | payment_link | none). */
  artifactType?: string | null;
  actionLink?: ReceiveActivationActionLink | null;
}

export interface UseUserAccountsResult {
  accounts: UserAccount[];
  isLoading: boolean;
  error: string | null;
}

const RAIL_TO_CURRENCY: Record<string, string> = {
  ach: 'USD',
  wire: 'USD',
  us_ach: 'USD',
  us_wire: 'USD',
  pix: 'BRL',
  spei: 'MXN',
  sepa: 'EUR',
  iban: 'EUR',
  co_ach: 'COP',
  co_breb: 'COP',
};

export const useUserAccounts = (): UseUserAccountsResult => {
  const isDemoMode = useTutorialDemoStore((s) => s.isDemoMode);
  const { user } = useAuth();
  const customerId = user?.customer_profile_id ?? undefined;

  const { receiveWalletId } = useReceiveWallet();
  // In demo mode pass undefined so useDepositInstructions stays disabled
  // (enabled: !!walletId && !!customerId → false) and no real API call fires.
  const walletId = isDemoMode ? undefined : receiveWalletId;

  const {
    virtualAccounts,
    isLoading: instructionsLoading,
    error: instructionsError,
  } = useDepositInstructions(walletId, customerId);

  const {
    endorsements,
    isLoading: endorsementsLoading,
  } = useEndorsements();
  const {
    paymentLinkRails,
    isLoading: paymentLinkCapabilitiesLoading,
  } = usePaymentLinkCapabilities();
  const { rails, isLoading: railsLoading } = useRails();

  // ── Demo mode: return mock accounts without touching real API data ──
  if (isDemoMode) {
    const demoActive: UserAccount[] = DEMO_VIRTUAL_ACCOUNTS.map((va) => ({
      id: va.id,
      currency: va.currency,
      paymentRail: va.payment_rail,
      status: va.status === 'active' || va.status === 'ACTIVE' ? 'active' : 'pending',
      deposit: va as BackendVirtualAccount,
    }));

    const occupiedInDemo = new Set(demoActive.map((a) => a.paymentRail.toLowerCase()));

    const demoNotRequested: UserAccount[] = DEMO_RAILS
      .filter((r) => !occupiedInDemo.has(r.code.toLowerCase()))
      .map((r) => ({
        id: `rail-${r.code}`,
        currency: RAIL_TO_CURRENCY[r.code.toLowerCase()] ?? r.code.toUpperCase(),
        paymentRail: r.code,
        status: 'not_requested' as const,
        railName: r.name,
        deposit: null,
      }));

    return {
      accounts: [...demoActive, ...demoNotRequested],
      isLoading: false,
      error: null,
    };
  }

  const isLoading =
    instructionsLoading ||
    endorsementsLoading ||
    railsLoading ||
    paymentLinkCapabilitiesLoading;
  const error = instructionsError ?? null;

  return {
    accounts: buildReceiveAccounts({
      virtualAccounts,
      endorsements,
      paymentLinkRails,
      rails,
      excludedRails: EXCLUDED_RAILS,
    }),
    isLoading,
    error: error ? (error as Error).message ?? String(error) : null,
  };
};
