/**
 * Readiness matrix view model (`adminLoopay_platformReadiness`).
 *
 * Rows are never filtered out: BLOCKED clients sort first so they are always
 * on the first page, then INCOMPLETE, then READY, alphabetically within each.
 */

import type {
  AdminPlatformClientReadiness,
  AdminPlatformReadinessStatus,
} from '@/graphql/types/admin-loopay';

const STATUS_ORDER: Record<AdminPlatformReadinessStatus, number> = {
  BLOCKED: 0,
  INCOMPLETE: 1,
  READY: 2,
};

export function sortReadinessRows(
  rows: readonly AdminPlatformClientReadiness[],
): AdminPlatformClientReadiness[] {
  return [...rows].sort((left, right) => {
    const byStatus =
      (STATUS_ORDER[left.status] ?? 0) - (STATUS_ORDER[right.status] ?? 0);
    if (byStatus !== 0) return byStatus;
    return left.client_name.localeCompare(right.client_name, 'es');
  });
}

export function countReadinessByStatus(
  rows: readonly AdminPlatformClientReadiness[],
): Record<AdminPlatformReadinessStatus, number> {
  const counts: Record<AdminPlatformReadinessStatus, number> = {
    READY: 0,
    INCOMPLETE: 0,
    BLOCKED: 0,
  };

  for (const row of rows) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }

  return counts;
}
