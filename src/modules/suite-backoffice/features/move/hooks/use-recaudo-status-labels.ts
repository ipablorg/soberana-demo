/**
 * Domain names of the deposit statuses: approving moves a deposit to COMPLETED
 * ("Aprobado"), rejecting to REJECTED ("Rechazado") and reversing a credited
 * deposit to FAILED ("Revertido").
 */

import { useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';

import type { RecaudoStatusFilter } from '@/graphql/types/admin-loopay';

export function useRecaudoStatusLabels(): Record<RecaudoStatusFilter, string> {
  const { t } = useLingui();

  return useMemo(
    () => ({
      PENDING: t`Pendiente`,
      COMPLETED: t`Aprobado`,
      REJECTED: t`Rechazado`,
      FAILED: t`Revertido`,
    }),
    [t],
  );
}
