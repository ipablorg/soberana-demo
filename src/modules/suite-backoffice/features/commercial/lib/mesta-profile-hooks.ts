/**
 * Reads the stored client metadata (it holds `onboardingProfile`) so the Mesta
 * form is pre-filled with what the system already has.
 */

import {
  ClientOnboardingProfileDocument,
  type ClientOnboardingProfileQuery,
  type ClientOnboardingProfileQueryVariables,
} from '@/graphql/queries/admin-commercial';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { commercialQueryKeys } from './commercial-logic';

export function useClientOnboardingMetadata(clientId: string) {
  return useGraphQLQuery<ClientOnboardingProfileQuery, ClientOnboardingProfileQueryVariables>(
    [...commercialQueryKeys.onboarding(clientId), 'profile'],
    ClientOnboardingProfileDocument,
    { id: clientId },
    { enabled: clientId !== '' }
  );
}
