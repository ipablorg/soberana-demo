/**
 * API key rotation options (`tenant_regenerateApiKey`), same rules as the back:
 * `graceMinutes` 0–10080 (default 60; 0 invalidates the previous key at
 * once), optional `expiresAt` strictly in the future. Scopes are never sent,
 * so the new key keeps the current scopes.
 */

import type { TenantRegenerateApiKeyMutationVariables } from '@/graphql/mutations/tenant';

export const DEFAULT_GRACE_MINUTES = 60;
export const MAX_GRACE_MINUTES = 10080;

export interface RotationFormValues {
  graceMinutes: string;
  /** `datetime-local` value, empty for a non-expiring key. */
  expiresAt: string;
}

export type RotationFormErrors = Partial<Record<keyof RotationFormValues, 'grace' | 'expiry'>>;

export function validateRotation(
  values: RotationFormValues,
  now: Date = new Date()
): RotationFormErrors {
  const errors: RotationFormErrors = {};
  const grace = Number(values.graceMinutes);
  if (
    values.graceMinutes.trim() === '' ||
    !Number.isInteger(grace) ||
    grace < 0 ||
    grace > MAX_GRACE_MINUTES
  ) {
    errors.graceMinutes = 'grace';
  }
  if (values.expiresAt) {
    const expiry = new Date(values.expiresAt);
    if (Number.isNaN(expiry.getTime()) || expiry.getTime() <= now.getTime())
      errors.expiresAt = 'expiry';
  }

  return errors;
}

export function toRotationVariables(
  values: RotationFormValues
): TenantRegenerateApiKeyMutationVariables {
  const variables: TenantRegenerateApiKeyMutationVariables = {
    graceMinutes: Number(values.graceMinutes),
  };
  if (values.expiresAt) variables.expiresAt = new Date(values.expiresAt).toISOString();

  return variables;
}
