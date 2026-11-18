/**
 * Virtual Accounts Hook — retired provider surface.
 *
 * This used to fetch provider-issued virtual accounts through the
 * `companies_bridgeVirtualAccountsByClientId` GraphQL query. That
 * operation no longer exists on the backend: the provider was purged
 * and virtual accounts are now provisioned manually by the operations
 * team.
 *
 * The hook is kept as an empty, always-settled source so the payins
 * wizard and the liquidation route/address selectors keep compiling
 * and simply render their "no accounts available" states instead of
 * querying a dead operation.
 */

export interface BridgeDepositInstructions {
  currency: string;
  payment_rails: string[];
  // USD fields
  bank_name?: string | null;
  bank_address?: string | null;
  bank_routing_number?: string | null;
  bank_account_number?: string | null;
  bank_beneficiary_address?: string | null;
  // MXN fields
  bank_beneficiary_name?: string | null;
  clabe?: string | null;
  // EUR fields
  iban?: string | null;
  bic?: string | null;
  // BRL fields
  pix_key?: string | null;
}

export interface BridgeDestination {
  currency: string;
  payment_rail: string;
  address: string;
}

export interface BridgeVirtualAccount {
  virtualAccountId: string;
  status: string;
  customerId: string;
  depositInstructions: BridgeDepositInstructions;
  destination: BridgeDestination;
  createdAt: string;
}

/** Stable empty reference so consumers don't re-render on every call. */
const NO_VIRTUAL_ACCOUNTS: BridgeVirtualAccount[] = [];

export function useBridgeVirtualAccounts() {
  return {
    virtualAccounts: NO_VIRTUAL_ACCOUNTS,
    isLoading: false,
    error: null as string | null,
    refetch: () => Promise.resolve(),
  };
}
