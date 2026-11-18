/**
 * Presentation helpers shared by the manual operations queues.
 *
 * Kept free of React and of Lingui so the queue view models stay unit
 * testable without a renderer.
 */

/** Rendered in every cell whose backend value is null/empty. */
export const EMPTY_CELL = '—';

/**
 * Backend timestamps arrive as ISO strings (`GraphQLISODateTime`).
 * Invalid or missing values degrade to `EMPTY_CELL` instead of `Invalid Date`.
 */
export function formatOpsDateTime(value: string | null | undefined): string {
  if (!value) return EMPTY_CELL;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return EMPTY_CELL;

  return parsed.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Renders any nullable scalar cell, collapsing blanks to `EMPTY_CELL`. */
export function formatOpsText(value: string | null | undefined): string {
  if (value === null || value === undefined) return EMPTY_CELL;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : EMPTY_CELL;
}

/** `first_name` + `last_name`, falling back to the email when both are blank. */
export function formatCustomerName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  fallback: string,
): string {
  const full = [firstName, lastName]
    .map((part) => (part ?? '').trim())
    .filter((part) => part.length > 0)
    .join(' ');

  return full.length > 0 ? full : fallback;
}

/**
 * Pretty-prints a `GraphQLJSON` column for the read-only detail panels.
 * Returns `null` when there is nothing worth showing.
 */
export function formatJsonBlock(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object' && Object.keys(value as object).length === 0) {
    return null;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return null;
  }
}

/**
 * Parses the free-text JSON the ops forms accept for `bankDetails`.
 * Returns a discriminated result so the form can show a field-level error
 * instead of firing a mutation the backend would reject.
 */
export type JsonObjectParseResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false };

export function parseJsonObject(raw: string): JsonObjectParseResult {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { ok: false };

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (
      parsed === null ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      return { ok: false };
    }

    return { ok: true, value: parsed as Record<string, unknown> };
  } catch {
    return { ok: false };
  }
}

/**
 * `CreateRecaudoInput.amount` is validated backend-side against
 * `/^\d{1,12}(\.\d{1,8})?$/`. Mirroring it here keeps the form from firing a
 * mutation that can only come back as a 400.
 */
const DECIMAL_AMOUNT_PATTERN = /^\d{1,12}(\.\d{1,8})?$/;

export function isValidOpsAmount(raw: string): boolean {
  const trimmed = raw.trim();
  return DECIMAL_AMOUNT_PATTERN.test(trimmed) && Number(trimmed) > 0;
}

/** `CreateRecaudoInput.currency` is validated against `/^[A-Z]{3,10}$/`. */
const CURRENCY_PATTERN = /^[A-Z]{3,10}$/;

export function isValidOpsCurrency(raw: string): boolean {
  return CURRENCY_PATTERN.test(raw.trim().toUpperCase());
}
