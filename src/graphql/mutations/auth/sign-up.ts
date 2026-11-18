/**
 * Auth Module - Sign Up Mutation
 * 
 * Mutation for user registration with email and password.
 */

import { gql } from '@/graphql/generated';

/**
 * Sign up mutation
 * 
 * Registers a new user with email and password, returns user data.
 * 
 * @example
 * ```tsx
 * import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
 * import { SignUpDocument } from '@/graphql/mutations/auth';
 * 
 * function RegisterForm() {
 *   const signUp = useGraphQLMutation(SignUpDocument, {
 *     onSuccess: (data) => {
 *       const { id, email, name } = data.auth_signUp;
 *       // Handle successful registration
 *     }
 *   });
 * 
 *   const handleSubmit = (values) => {
 *     signUp.mutate({
 *       signUpInput: {
 *         email: values.email,
 *         password: values.password,
 *         name: values.name,
 *         phone: values.phone,
 *         policy: values.policy
 *       }
 *     });
 *   };
 * }
 * ```
 */
export const SignUpDocument = gql(`
  mutation SignUp($signUpInput: SignUpInput!) {
    auth_signUp(signUpInput: $signUpInput) {
      id
      auth_uid
      email
      name
    }
  }
`);

