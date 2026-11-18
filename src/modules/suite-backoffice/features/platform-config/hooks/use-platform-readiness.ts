/**
 * Readiness matrix hook (`adminLoopay_platformReadiness`, PLATFORM_ADMIN).
 */

import {
  PlatformReadinessDocument,
  type PlatformReadinessQuery,
  type PlatformReadinessQueryVariables,
} from '@/graphql/queries/admin-loopay';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { platformQueryKeys } from '../lib/platform-query-keys';

export function usePlatformReadiness() {
  return useGraphQLQuery<PlatformReadinessQuery, PlatformReadinessQueryVariables>(
    [...platformQueryKeys.readiness],
    PlatformReadinessDocument,
    {}
  );
}
