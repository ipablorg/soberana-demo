/**
 * TanStack Query keys for the admin-loopay manual operations queues.
 *
 * Every queue hook reads its key from here and every mutation hook invalidates
 * through the same constant, so a queue can never be refreshed under one key
 * and invalidated under another.
 */

export const OPS_QUERY_ROOT = 'admin-loopay' as const;

export const opsQueryKeys = {
  kycQueue: [OPS_QUERY_ROOT, 'kyc-queue'] as const,
  kycDetail: (customerId: string) =>
    [OPS_QUERY_ROOT, 'kyc-detail', customerId] as const,
  recaudosQueue: [OPS_QUERY_ROOT, 'recaudos-queue'] as const,
  dispersionesQueue: [OPS_QUERY_ROOT, 'dispersiones-queue'] as const,
  endorsementsQueue: [OPS_QUERY_ROOT, 'endorsements-queue'] as const,
  beneficiariesQueue: [OPS_QUERY_ROOT, 'beneficiaries-queue'] as const,
  virtualAccounts: [OPS_QUERY_ROOT, 'virtual-accounts'] as const,
  virtualAccountRequests: [OPS_QUERY_ROOT, 'virtual-account-requests'] as const,
  providerLinkedAccounts: [OPS_QUERY_ROOT, 'provider-linked-accounts'] as const,
  clientOptions: [OPS_QUERY_ROOT, 'client-options'] as const,
  customerSearch: (term: string) =>
    [OPS_QUERY_ROOT, 'customer-search', term] as const,
  allBeneficiaries: [OPS_QUERY_ROOT, 'all-beneficiaries'] as const,
  clients: [OPS_QUERY_ROOT, 'clients'] as const,
  staffUsers: [OPS_QUERY_ROOT, 'staff-users'] as const,
  customers: [OPS_QUERY_ROOT, 'customers'] as const,
  customerWallets: (customerId: string) =>
    [OPS_QUERY_ROOT, 'customer-wallets', customerId] as const,
  customerWalletsAll: [OPS_QUERY_ROOT, 'customer-wallets'] as const,
  customerReceiveOptions: (customerId: string) =>
    [OPS_QUERY_ROOT, 'customer-receive-options', customerId] as const,
  customerReceiveOptionsAll: [OPS_QUERY_ROOT, 'customer-receive-options'] as const,
  transactions: [OPS_QUERY_ROOT, 'transactions'] as const,
  walletCapableProviders: [OPS_QUERY_ROOT, 'wallet-capable-providers'] as const,
  providerRequirements: [OPS_QUERY_ROOT, 'provider-requirements'] as const,
  providerRequirementCounts: [OPS_QUERY_ROOT, 'provider-requirement-counts'] as const,
};
