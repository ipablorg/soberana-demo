import { mapError } from '@/shared/lib/error-mapper';

interface GraphQLLikeError {
  message?: unknown;
  response?: { errors?: Array<{ message?: unknown }> };
}

const DUPLICATE_TAX_ID_MESSAGE =
  'Este ID fiscal ya está registrado. Usa otro ID fiscal o inicia sesión con tu cuenta existente.';

function collectErrorText(err: unknown): string {
  const source = err as GraphQLLikeError | null | undefined;
  const parts: string[] = [];

  if (typeof source?.message === 'string') parts.push(source.message);
  for (const item of source?.response?.errors ?? []) {
    if (typeof item?.message === 'string') parts.push(item.message);
  }

  return parts.join(' ').toLowerCase();
}

/**
 * The backend rejects a second customer with the same tax id ("This tax ID is
 * already registered…"). The shared mapper only knows `tax_id`, so without
 * this check the user is told the *email* already exists.
 */
export function isDuplicateTaxIdError(err: unknown): boolean {
  const text = collectErrorText(err);
  return /tax[\s_-]?id/.test(text) && /already (registered|exists)/.test(text);
}

/** User-facing message for a failed customer creation: the real reason, never a guessed one. */
export function mapCreateCustomerError(err: unknown): string {
  if (isDuplicateTaxIdError(err)) {
    return DUPLICATE_TAX_ID_MESSAGE;
  }

  return mapError(err).message;
}
