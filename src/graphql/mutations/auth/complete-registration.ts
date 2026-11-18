/**
 * Auth Module - Complete Registration Mutation
 * 
 * Mutation for completing registration of a Firebase-only user.
 */



/**
 * Complete Registration mutation
 * 
 * Creates a user in the backend DB using the Firebase access token
 * from the RegistrationRequired response.
 * 
 * @example
 * ```tsx
 * import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
 * import { CompleteRegistrationDocument } from '@/graphql/mutations/auth';
 * 
 * function CompleteRegistrationForm() {
 *   const completeRegistration = useGraphQLMutation(CompleteRegistrationDocument, {
 *     onSuccess: (data) => {
 *        // Handle success
 *     }
 *   });
 * }
 * ```
 */
export const CompleteRegistrationDocument = gql(`
  mutation CompleteRegistration($input: CompleteRegistrationInput!) {
    auth_completeRegistration(completeRegistrationInput: $input) {
      id
      auth_uid
      email
      name
    }
  }
`);
import { gql } from '@/graphql/generated';
