import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Tests for the re-registration flow.
 *
 * Validates:
 * 1. sign-in.ts uses inline fragments for union type
 * 2. use-sign-in.ts checks requires_registration
 * 3. LoginForm passes onRegistrationRequired
 * 4. complete-registration route exists
 */

const SIGN_IN_MUTATION_PATH = resolve(__dirname, '../../../../graphql/mutations/auth/sign-in.ts');
const USE_SIGN_IN_PATH = resolve(__dirname, '../api/use-sign-in.ts');
const LOGIN_FORM_PATH = resolve(__dirname, '../components/login-form.tsx');
const ROUTES_PATH = resolve(__dirname, '../../../../app/routes/common-routes.tsx');

const signInMutationSource = readFileSync(SIGN_IN_MUTATION_PATH, 'utf-8');
const useSignInSource = readFileSync(USE_SIGN_IN_PATH, 'utf-8');
const loginFormSource = readFileSync(LOGIN_FORM_PATH, 'utf-8');
const routesSource = readFileSync(ROUTES_PATH, 'utf-8');

describe('Re-registration flow', () => {
  describe('GraphQL Mutation updates', () => {
    it('sign-in mutation uses inline fragment for AuthResponse', () => {
      expect(signInMutationSource).toContain('... on AuthResponse');
    });

    it('sign-in mutation uses inline fragment for RegistrationRequired', () => {
      expect(signInMutationSource).toContain('... on RegistrationRequired');
      expect(signInMutationSource).toContain('requires_registration');
      expect(signInMutationSource).toContain('firebase_user');
    });
  });

  describe('use-sign-in hook logic', () => {
    it('hook checks if registration is required', () => {
      expect(useSignInSource).toContain('isRegistrationRequired');
      expect(useSignInSource).toContain('onRegistrationRequired');
    });
  });

  describe('LoginForm integration', () => {
    it('passes onRegistrationRequired to useSignIn', () => {
      expect(loginFormSource).toContain('onRegistrationRequired');
      expect(loginFormSource).toContain("navigate('/complete-registration'");
    });
  });

  describe('Routing', () => {
    it('defines a route for complete-registration', () => {
      expect(routesSource).toMatch(/path="complete-registration"/);
    });
  });
});
