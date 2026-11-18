/**
 * Recaudos queue hooks (`adminLoopay_*`, staff scope `OPS_RECAUDOS`).
 *
 * Approve / reject / reverse carry `@RequiresRecentAuth` on the backend; the
 * prompt-and-retry is handled globally by `withRecentAuth`.
 */

import { keepPreviousData } from '@tanstack/react-query';
import { useLingui } from '@lingui/react/macro';

import {
  ListPendingRecaudosDocument,
  type ListPendingRecaudosQuery,
  type ListPendingRecaudosQueryVariables,
} from '@/graphql/queries/admin-loopay';
import {
  ApproveRecaudoDocument,
  CreateRecaudoDocument,
  RejectRecaudoDocument,
  ReverseRecaudoDocument,
  type ApproveRecaudoMutation,
  type ApproveRecaudoMutationVariables,
  type CreateRecaudoMutation,
  type CreateRecaudoMutationVariables,
  type RejectRecaudoMutation,
  type RejectRecaudoMutationVariables,
  type ReverseRecaudoMutation,
  type ReverseRecaudoMutationVariables,
} from '@/graphql/mutations/admin-loopay';
import type { AdminRecaudoQueueFilters } from '@/graphql/types/admin-loopay';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { useOpsMutation } from '../../ops-review/hooks/use-ops-mutation';
import { opsQueryKeys } from '../../ops-review/lib/ops-query-keys';

/**
 * Backend page window: default 50, max 100. The queue is not paginated in the
 * UI, so ask for the maximum; the page shows a notice when `has_more` is true.
 */
export const RECAUDO_QUEUE_PAGE_LIMIT = 100;

/**
 * Deposit queue for a filter. `keepPreviousData` keeps the rows on screen while
 * a new filter loads, so changing a filter never flashes the table skeleton
 * (only the very first load does).
 */
export function usePendingRecaudos(filter: AdminRecaudoQueueFilters) {
  return useGraphQLQuery<
    ListPendingRecaudosQuery,
    ListPendingRecaudosQueryVariables
  >(
    [...opsQueryKeys.recaudosQueue],
    ListPendingRecaudosDocument,
    { filter, pagination: { offset: 0, limit: RECAUDO_QUEUE_PAGE_LIMIT } },
    { placeholderData: keepPreviousData },
  );
}

export function useCreateRecaudo(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<CreateRecaudoMutation, CreateRecaudoMutationVariables>(
    CreateRecaudoDocument,
    {
      invalidate: [opsQueryKeys.recaudosQueue],
      successMessage: t`Recaudo manual registrado`,
      errorMessage: t`No se pudo registrar el recaudo manual`,
      onCompleted,
    },
  );
}

export function useApproveRecaudo(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<ApproveRecaudoMutation, ApproveRecaudoMutationVariables>(
    ApproveRecaudoDocument,
    {
      invalidate: [opsQueryKeys.recaudosQueue],
      successMessage: t`Recaudo aprobado y acreditado`,
      errorMessage: t`No se pudo aprobar el recaudo`,
      onCompleted,
    },
  );
}

export function useRejectRecaudo(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<RejectRecaudoMutation, RejectRecaudoMutationVariables>(
    RejectRecaudoDocument,
    {
      invalidate: [opsQueryKeys.recaudosQueue],
      successMessage: t`Recaudo rechazado`,
      errorMessage: t`No se pudo rechazar el recaudo`,
      onCompleted,
    },
  );
}

export function useReverseRecaudo(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<ReverseRecaudoMutation, ReverseRecaudoMutationVariables>(
    ReverseRecaudoDocument,
    {
      invalidate: [opsQueryKeys.recaudosQueue],
      successMessage: t`Recaudo reversado`,
      errorMessage: t`No se pudo reversar el recaudo`,
      onCompleted,
    },
  );
}
