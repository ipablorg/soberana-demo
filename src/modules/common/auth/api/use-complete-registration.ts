/**
 * useCompleteRegistration Hook
 * 
 * API hook for completing registration for a user that already exists in Firebase.
 */

import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { CompleteRegistrationDocument } from '@/graphql/mutations/auth';
import { AuthMeDocument } from '@/graphql/queries/auth';
import { useAuth } from '@/shared/hooks/use-auth';
import { useState } from 'react';
import { setAuthToken, graphqlClient } from '@/shared/lib/graphql-client';
import type { CompleteRegistrationInput } from '@/shared/types/auth.types';
import type { CurrentUser } from '@/graphql/generated/graphql';

export function useCompleteRegistration(options?: {
  onSuccess?: (user: CurrentUser) => void;
  onError?: (error: Error) => void;
}) {
  const { setAuth } = useAuth();
  const [isFetchingUser, setIsFetchingUser] = useState(false);

  const mutation = useGraphQLMutation(CompleteRegistrationDocument, {
    onSuccess: async (_, variables) => {
      try {
        setIsFetchingUser(true);
        
        // Use the same access token that we passed to the mutation
        const access_token = variables.input.accessToken;

        // Set token in client IMMEDIATELY
        setAuthToken(access_token);

        // Small delay to ensure token is set in client headers
        await new Promise(resolve => setTimeout(resolve, 50));

        // Fetch user data with token in header
        const userData = await graphqlClient.request(AuthMeDocument);

        // Set auth in store
        setAuth(userData.auth_me, access_token);
        
        // Call success callback
        options?.onSuccess?.(userData.auth_me);
      } catch (error) {
        // Handle user fetch error
        options?.onError?.(error as Error);
      } finally {
        setIsFetchingUser(false);
      }
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  const completeRegistration = (input: CompleteRegistrationInput) => {
    mutation.mutate({
      input,
    });
  };

  return {
    completeRegistration,
    isLoading: mutation.isPending || isFetchingUser,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
