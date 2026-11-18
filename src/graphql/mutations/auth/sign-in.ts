/**
 * Auth Module - Sign In Mutation
 * 
 * Mutation for user authentication with email and password.
 */



/**
 * Sign in mutation
 * 
 * Authenticates user with email and password, returns JWT token and user data.
 * 
 * @example
 * ```tsx
 * import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
 * import { SignInDocument } from '@/graphql/mutations/auth';
 * 
 * function LoginForm() {
 *   const signIn = useGraphQLMutation(SignInDocument, {
 *     onSuccess: (data) => {
 *       const { access_token, user } = data.auth_signIn;
 *       setAuth(user, access_token);
 *     }
 *   });
 * 
 *   const handleSubmit = (values) => {
 *     signIn.mutate({
 *       signInInput: {
 *         email: values.email,
 *         password: values.password
 *       }
 *     });
 *   };
 * }
 * ```
 */
export const SignInDocument = `
  mutation SignIn($signInInput: SignInInput!) {
    auth_signIn(signInInput: $signInInput) {
      ... on AuthResponse {
        access_token
        user {
          id
          auth_uid
          email
          name
        }
      }
      ... on RegistrationRequired {
        requires_registration
        access_token
        firebase_user {
          uid
          email
          email_verified
          name
          picture
          phone_number
        }
      }
    }
  }
` as any;
