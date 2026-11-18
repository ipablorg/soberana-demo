/**
 * Auth Module - User Register Mutation
 * 
 * Mutation for user self-registration (user_register endpoint).
 * Returns registration data including KYC link and status.
 */

import { gql } from '@/graphql/generated';

/**
 * User register mutation
 * 
 * Self-registration for new users. Backend creates user + customer profile.
 * Returns KYC link for identity verification.
 * 
 * @example
 * ```tsx
 * import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
 * import { UserRegisterDocument } from '@/graphql/mutations/auth';
 * 
 * function RegisterForm() {
 *   const register = useGraphQLMutation(UserRegisterDocument, {
 *     onSuccess: (data) => {
 *       const { id, email, kyc_link } = data.user_register;
 *       // Handle successful registration
 *     }
 *   });
 * 
 *   const handleSubmit = (values) => {
 *     register.mutate({
 *       input: {
 *         email: values.email,
 *         password: values.password,
 *         firstName: values.firstName,
 *         lastName: values.lastName,
    *         phone: values.phone,
    *         country: values.country,
    *         taxId: values.taxId,
    *         customer_type: values.customerType,
    *         company: values.businessName,
    *       }
    *     });
 *   };
 * }
 * ```
 */
export const UserRegisterDocument = gql(`
  mutation UserRegister($input: RegisterUserInput!) {
    user_register(input: $input) {
      id
      email
      auth_uid
      role
      customer_profile_id
      kyc_link
      kyc_status
    }
  }
`);
