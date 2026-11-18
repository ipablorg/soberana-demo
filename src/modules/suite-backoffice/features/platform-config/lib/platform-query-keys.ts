/**
 * TanStack Query keys for the PLATFORM_ADMIN platform config section.
 *
 * Nested under the ops root so a global admin-loopay invalidation also covers
 * them. Every catalog or junction change invalidates `readiness` as well,
 * because the readiness matrix is derived from that configuration.
 */

import { OPS_QUERY_ROOT } from '../../ops-review/lib/ops-query-keys';

const PLATFORM_ROOT = [OPS_QUERY_ROOT, 'platform'] as const;

export const platformQueryKeys = {
  readiness: [...PLATFORM_ROOT, 'readiness'] as const,
  providers: [...PLATFORM_ROOT, 'providers'] as const,
  paymentRails: [...PLATFORM_ROOT, 'payment-rails'] as const,
  providerPaymentRails: [...PLATFORM_ROOT, 'provider-payment-rails'] as const,
  clientProviderRails: [...PLATFORM_ROOT, 'client-provider-rails'] as const,
  clientConfig: [...PLATFORM_ROOT, 'client-config'] as const,
};
