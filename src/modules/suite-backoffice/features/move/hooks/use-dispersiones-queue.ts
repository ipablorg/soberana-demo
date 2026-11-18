/**
 * Dispersiones queue hooks (`adminLoopay_*`, staff scope `OPS_DISPERSIONES`).
 *
 * All four mutations carry `@RequiresRecentAuth`; the prompt-and-retry is
 * handled globally by `withRecentAuth`.
 */

import { useLingui } from '@lingui/react/macro';

import {
  ListPendingDispersionesDocument,
  type AdminDispersionQueueFilter,
  type ListPendingDispersionesQuery,
} from '@/graphql/queries/admin-loopay';
import {
  ApproveDispersionDocument,
  CancelDispersionDocument,
  CompleteDispersionDocument,
  FailDispersionDocument,
  RejectDispersionDocument,
  RetryDispersionFundingDocument,
  RetryDispersionReturnDocument,
  type ApproveDispersionMutation,
  type ApproveDispersionMutationVariables,
  type CancelDispersionMutation,
  type CancelDispersionMutationVariables,
  type CompleteDispersionMutation,
  type CompleteDispersionMutationVariables,
  type FailDispersionMutation,
  type FailDispersionMutationVariables,
  type RejectDispersionMutation,
  type RejectDispersionMutationVariables,
  type RetryDispersionFundingMutation,
  type RetryDispersionFundingMutationVariables,
  type RetryDispersionReturnMutation,
  type RetryDispersionReturnMutationVariables,
} from '@/graphql/mutations/admin-loopay';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { hasAnyExactStaffRole, OPERATIONS_ROLE } from '@/shared/lib/staff-roles';
import { useAuthStore } from '@/shared/stores/auth-store';

import { useOpsMutation } from '../../ops-review/hooks/use-ops-mutation';
import { opsQueryKeys } from '../../ops-review/lib/ops-query-keys';
import {
  withdrawalDecisionFailureOf,
  type WithdrawalDecisionFailure,
} from '../lib/dispersion-approval';

export function usePendingDispersiones(filter: AdminDispersionQueueFilter) {
  return useGraphQLQuery<
    ListPendingDispersionesQuery,
    { filter: AdminDispersionQueueFilter }
  >([...opsQueryKeys.dispersionesQueue], ListPendingDispersionesDocument, {
    filter,
  });
}

/**
 * #413: approve, reject, and retry the funding or the return of a withdrawal
 * in the approval flow are `LOOPAY_OPERATIONS` / `LOOPAY_ADMIN` decisions
 * (exact roles: `OPS_DISPERSIONES` reads the queue but cannot decide).
 */
export function useCanDecideWithdrawals(): boolean {
  return useAuthStore((state) => hasAnyExactStaffRole(state.user?.staff_roles, [OPERATIONS_ROLE]));
}

/** Receives why an approval-flow decision was refused, when the queue explains it inline. */
export type WithdrawalDecisionFailureHandler = (kind: WithdrawalDecisionFailure) => void;

/** Precise toast text of a refused approval-flow decision, also handed to `onFailure`. */
function useDecisionFailureDescriber(onFailure?: WithdrawalDecisionFailureHandler) {
  const { t } = useLingui();

  return (error: unknown): string | undefined => {
    const kind = withdrawalDecisionFailureOf(error);
    if (!kind) return undefined;
    onFailure?.(kind);

    return kind === 'mfa-required'
      ? t`Aprobar o rechazar un retiro requiere la verificación en dos pasos en tu cuenta.`
      : t`El retiro cambió de estado mientras decidías. La lista se actualizó.`;
  };
}

/**
 * The back answers 409 while a provider payout is in flight (PLACED): the
 * manual actions would double pay, so the queue explains it and refetches.
 */
export function usePayoutInFlightMessage(): string {
  const { t } = useLingui();

  return t`El proveedor tiene un pago en curso para esta dispersión. Espere su resultado antes de completarla, fallarla o cancelarla.`;
}

/** #413 approval: the Mesta order is placed from the customer's own sender. */
export function useApproveDispersion(
  onCompleted?: () => void,
  onFailure?: WithdrawalDecisionFailureHandler,
) {
  const { t } = useLingui();
  const describeError = useDecisionFailureDescriber(onFailure);

  return useOpsMutation<
    ApproveDispersionMutation,
    ApproveDispersionMutationVariables
  >(ApproveDispersionDocument, {
    invalidate: [opsQueryKeys.dispersionesQueue],
    successMessage: t`Retiro aprobado: la orden de pago se está colocando`,
    errorMessage: t`No se pudo aprobar el retiro`,
    describeError,
    onCompleted,
  });
}

/** #413 reject: the gross returns to the customer vault; the hold is released when it lands. */
export function useRejectWithdrawal(
  onCompleted?: () => void,
  onFailure?: WithdrawalDecisionFailureHandler,
) {
  const { t } = useLingui();
  const describeError = useDecisionFailureDescriber(onFailure);

  return useOpsMutation<
    RejectDispersionMutation,
    RejectDispersionMutationVariables
  >(RejectDispersionDocument, {
    invalidate: [opsQueryKeys.dispersionesQueue],
    successMessage: t`Retiro rechazado: los fondos vuelven a la bóveda del cliente`,
    errorMessage: t`No se pudo rechazar el retiro`,
    describeError,
    onCompleted,
  });
}

export function useRetryDispersionFunding(onFailure?: WithdrawalDecisionFailureHandler) {
  const { t } = useLingui();
  const describeError = useDecisionFailureDescriber(onFailure);

  return useOpsMutation<
    RetryDispersionFundingMutation,
    RetryDispersionFundingMutationVariables
  >(RetryDispersionFundingDocument, {
    invalidate: [opsQueryKeys.dispersionesQueue],
    successMessage: t`Paso bloqueado reintentado`,
    errorMessage: t`No se pudo reintentar el fondeo`,
    describeError,
  });
}

export function useRetryDispersionReturn(onFailure?: WithdrawalDecisionFailureHandler) {
  const { t } = useLingui();
  const describeError = useDecisionFailureDescriber(onFailure);

  return useOpsMutation<
    RetryDispersionReturnMutation,
    RetryDispersionReturnMutationVariables
  >(RetryDispersionReturnDocument, {
    invalidate: [opsQueryKeys.dispersionesQueue],
    successMessage: t`Devolución reintentada`,
    errorMessage: t`No se pudo reintentar la devolución`,
    describeError,
  });
}

export function useCompleteDispersion(onCompleted?: () => void) {
  const { t } = useLingui();
  const payoutInFlight = usePayoutInFlightMessage();

  return useOpsMutation<
    CompleteDispersionMutation,
    CompleteDispersionMutationVariables
  >(CompleteDispersionDocument, {
    invalidate: [opsQueryKeys.dispersionesQueue],
    successMessage: t`Dispersión completada`,
    errorMessage: t`No se pudo completar la dispersión`,
    conflictMessage: payoutInFlight,
    onCompleted,
  });
}

export function useRejectDispersion(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    RejectDispersionMutation,
    RejectDispersionMutationVariables
  >(RejectDispersionDocument, {
    invalidate: [opsQueryKeys.dispersionesQueue],
    successMessage: t`Dispersión rechazada y retención liberada`,
    errorMessage: t`No se pudo rechazar la dispersión`,
    onCompleted,
  });
}

export function useFailDispersion(onCompleted?: () => void) {
  const { t } = useLingui();
  const payoutInFlight = usePayoutInFlightMessage();

  return useOpsMutation<FailDispersionMutation, FailDispersionMutationVariables>(
    FailDispersionDocument,
    {
      invalidate: [opsQueryKeys.dispersionesQueue],
      successMessage: t`Dispersión marcada como fallida y reembolsada`,
      errorMessage: t`No se pudo marcar la dispersión como fallida`,
      conflictMessage: payoutInFlight,
      onCompleted,
    },
  );
}

export function useCancelDispersion(onCompleted?: () => void) {
  const { t } = useLingui();
  const payoutInFlight = usePayoutInFlightMessage();

  return useOpsMutation<
    CancelDispersionMutation,
    CancelDispersionMutationVariables
  >(CancelDispersionDocument, {
    invalidate: [opsQueryKeys.dispersionesQueue],
    successMessage: t`Dispersión cancelada y retención liberada`,
    errorMessage: t`No se pudo cancelar la dispersión`,
    conflictMessage: payoutInFlight,
    onCompleted,
  });
}
