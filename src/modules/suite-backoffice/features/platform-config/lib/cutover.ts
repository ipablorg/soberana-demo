/**
 * Pure helpers for the cutover checklist (`adminLoopay_cutover*`).
 *
 * The backend has no "all clients" shortcut, so client ids are always an
 * explicit selection. Step 3 (flag legacy transactions) only allows the real
 * run after a successful dry run with exactly the same inputs, tracked through
 * `cutoverInputSignature`.
 */

import type {
  AdminClientOption,
  AdminCutoverFlagLegacyTransactionsInput,
} from '@/graphql/types/admin-loopay';

/** Backend `@MaxLength(1000)` on every cutover reason. */
export const CUTOVER_REASON_MAX_LENGTH = 1000;

export const DEAD_PROVIDER_JUNCTIONS_REMAIN_CODE = 'DEAD_PROVIDER_JUNCTIONS_REMAIN';

export function activeClientIds(options: readonly AdminClientOption[]): string[] {
  return options.filter((option) => option.is_active).map((option) => option.client_id);
}

export function toggleClientId(selected: readonly string[], clientId: string): string[] {
  return selected.includes(clientId)
    ? selected.filter((id) => id !== clientId)
    : [...selected, clientId];
}

export function isValidCutoverReason(reason: string): boolean {
  const trimmed = reason.trim();
  return trimmed.length > 0 && trimmed.length <= CUTOVER_REASON_MAX_LENGTH;
}

/**
 * `<input type="datetime-local">` value (local time) to an ISO-8601 instant.
 * Returns `null` when empty, unparseable or in the future (the backend rejects
 * a future cutoff).
 */
export function toCutoffInstant(localValue: string, now: Date = new Date()): string | null {
  if (localValue.trim().length === 0) return null;

  const parsed = new Date(localValue);
  if (Number.isNaN(parsed.getTime()) || parsed.getTime() > now.getTime()) {
    return null;
  }

  return parsed.toISOString();
}

/** Order-insensitive identity of the step 3 inputs. */
export function cutoverInputSignature(
  clientIds: readonly string[],
  reason: string,
  createdBefore: string,
): string {
  return JSON.stringify([[...clientIds].sort(), reason.trim(), createdBefore]);
}

export function buildFlagLegacyTransactionsInput(
  clientIds: readonly string[],
  reason: string,
  createdBefore: string,
  dryRun: boolean,
): AdminCutoverFlagLegacyTransactionsInput {
  return { clientIds: [...clientIds], reason: reason.trim(), createdBefore, dryRun };
}

export interface DeadProviderJunctionsConflict {
  message: string;
  activeJunctions: number | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Detects the step 2 refusal. Nest serializes the `ConflictException` body
 * into `extensions.originalError` of each GraphQL error.
 */
export function readDeadProviderJunctionsConflict(
  error: unknown,
): DeadProviderJunctionsConflict | null {
  const err = error as any;
  const graphqlErrors: any[] = [
    ...(Array.isArray(err?.response?.errors) ? err.response.errors : []),
    ...(err?.extensions ? [err] : []),
  ];

  for (const graphqlError of graphqlErrors) {
    const extensions = graphqlError?.extensions ?? {};
    const body = extensions.originalError ?? extensions;

    if (body?.code === DEAD_PROVIDER_JUNCTIONS_REMAIN_CODE) {
      const activeJunctions = Number(body.active_junctions);
      return {
        message: String(body.message ?? graphqlError.message ?? ''),
        activeJunctions: Number.isFinite(activeJunctions) ? activeJunctions : null,
      };
    }
  }

  return null;
}

/* eslint-enable @typescript-eslint/no-explicit-any */
