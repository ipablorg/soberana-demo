/**
 * Commercial dual user (epic 2026-11 S4/S5): pure helpers of the tenant
 * access actions on the commercial client detail (invite the client's tenant
 * admin, enter its tenant backoffice). No React, no i18n.
 */

interface GraphQLErrorLike {
  extensions?: { code?: unknown; error_code?: unknown; originalError?: { code?: unknown } };
}

/**
 * Domain code of a GraphQL failure: the back's `AllExceptionsFilter` puts it in
 * `extensions.error_code` (Apollo's class stays in `extensions.code`).
 */
export function domainErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const errors = (error as { response?: { errors?: unknown } }).response?.errors;
  if (!Array.isArray(errors)) return undefined;

  for (const entry of errors as GraphQLErrorLike[]) {
    const code = entry.extensions?.error_code ?? entry.extensions?.originalError?.code;
    if (typeof code === 'string' && code.length > 0) return code;
  }

  return undefined;
}

/** Apollo class of the first GraphQL failure (`NOT_FOUND`, `CONFLICT`...). */
export function graphQLErrorClass(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const errors = (error as { response?: { errors?: unknown } }).response?.errors;
  const code = Array.isArray(errors)
    ? (errors[0] as GraphQLErrorLike)?.extensions?.code
    : undefined;

  return typeof code === 'string' ? code : undefined;
}

/** What went wrong inviting a tenant admin, when the screen has a precise message for it. */
export type InviteFailure = 'email-taken' | 'client-not-found';

export function inviteFailureOf(error: unknown): InviteFailure | undefined {
  const code = domainErrorCode(error);
  if (code === 'TENANT_ADMIN_EMAIL_TAKEN') return 'email-taken';
  if (code === 'CLIENT_NOT_FOUND' || graphQLErrorClass(error) === 'NOT_FOUND')
    return 'client-not-found';

  return undefined;
}

/** Why the backend refused `x-act-as-client`, when the screen has a precise message for it. */
export type ActAsFailure = 'mfa-required' | 'forbidden' | 'client-not-found' | 'client-not-active';

export function actAsFailureOf(error: unknown): ActAsFailure | undefined {
  switch (domainErrorCode(error)) {
    case 'MFA_REQUIRED':
      return 'mfa-required';
    case 'ACT_AS_FORBIDDEN':
      return 'forbidden';
    case 'ACT_AS_CLIENT_NOT_FOUND':
      return 'client-not-found';
    case 'TENANT_ACCESS_REQUIRED':
      return 'client-not-active';
    default:
      return undefined;
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trimmed email, or null when it is not a valid address. */
export function normalizeInviteEmail(value: string): string | null {
  const email = value.trim();

  return EMAIL.test(email) ? email : null;
}
