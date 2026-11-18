/**
 * Domain error codes of the `tenant_*` operations.
 *
 * The back's `AllExceptionsFilter` puts the REST domain code in
 * `extensions.error_code` (Apollo's class stays in `extensions.code`), so the
 * screens can show a precise message instead of the generic mapper's one.
 */

interface GraphQLErrorLike {
  message?: unknown;
  extensions?: { code?: unknown; error_code?: unknown; originalError?: { code?: unknown } };
}

function graphQLErrors(error: unknown): GraphQLErrorLike[] {
  if (!error || typeof error !== 'object') return [];
  const response = (error as { response?: { errors?: unknown } }).response;

  return Array.isArray(response?.errors) ? (response.errors as GraphQLErrorLike[]) : [];
}

/** First domain `error_code` of a GraphQL failure (or the original exception code), if any. */
export function tenantErrorCode(error: unknown): string | undefined {
  for (const entry of graphQLErrors(error)) {
    const code = entry.extensions?.error_code ?? entry.extensions?.originalError?.code;
    if (typeof code === 'string' && code.length > 0) return code;
  }

  return undefined;
}

/**
 * Validation messages the back answers with a 400 (class-validator output),
 * e.g. `amount must not be less than 0.01`; empty when the failure is not a
 * validation one.
 */
export function tenantValidationMessage(error: unknown): string | undefined {
  for (const entry of graphQLErrors(error)) {
    if (entry.extensions?.code === 'BAD_REQUEST' && typeof entry.message === 'string') {
      return entry.message;
    }
  }

  return undefined;
}
