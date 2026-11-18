/**
 * Why a beneficiary cannot be used yet (send flow, lists). Null when usable.
 */

import { useLingui } from '@lingui/react/macro';

import { getReviewState, type ReviewableBeneficiary } from '../lib/beneficiary-review';

export function useReviewHint(beneficiary: ReviewableBeneficiary): string | null {
  const { t } = useLingui();
  const { kind, reason } = getReviewState(beneficiary);

  if (kind === 'approved') return null;
  if (kind === 'rejected') {
    return reason
      ? t`El proveedor lo rechazó: ${reason}`
      : t`El proveedor rechazó esta cuenta. Crea una nueva con datos corregidos.`;
  }
  return t`Lo está revisando el proveedor. Podrás usarlo cuando lo aprueben.`;
}
