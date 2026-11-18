/**
 * Provider requirement hooks (S21, `OPS_COMMERCIAL`; LOOPAY_ADMIN passes):
 * the review queue, its counts (sidebar badge and landing banner, refetched
 * every 60 s and after every review or submit), review, submit to the
 * provider and the signed URL of an uploaded document.
 *
 * `adminLoopay_submitProviderRequirements` carries `@RequiresRecentAuth`; the
 * prompt-and-retry is handled globally by `withRecentAuth`.
 */

import { useCallback } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  GetProviderRequirementDocumentUrlDocument,
  ListProviderRequirementsDocument,
  ProviderRequirementCountsDocument,
  type GetProviderRequirementDocumentUrlQuery,
  type ListProviderRequirementsQuery,
  type ListProviderRequirementsQueryVariables,
  type ProviderRequirementCountsQuery,
} from '@/graphql/queries/admin-loopay';
import {
  CreateProviderRequirementLinkDocument,
  MarkProviderRequirementHandledDocument,
  ReviewProviderRequirementDocument,
  SubmitProviderRequirementsDocument,
  type CreateProviderRequirementLinkMutation,
  type CreateProviderRequirementLinkMutationVariables,
  type MarkProviderRequirementHandledMutation,
  type MarkProviderRequirementHandledMutationVariables,
  type ReviewProviderRequirementMutation,
  type ReviewProviderRequirementMutationVariables,
  type SubmitProviderRequirementsMutation,
  type SubmitProviderRequirementsMutationVariables,
} from '@/graphql/mutations/admin-loopay';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { graphqlClient } from '@/shared/lib/graphql-client';
import { mapError } from '@/shared/lib/error-mapper';

import { useOpsMutation } from '../../ops-review/hooks/use-ops-mutation';
import { opsQueryKeys } from '../../ops-review/lib/ops-query-keys';
import { useSubmitErrorText } from '../lib/submit-error';

/** Counts refresh every minute so both Comercial and Super admin notice new uploads. */
export const PROVIDER_REQUIREMENT_COUNTS_REFETCH_MS = 60_000;

/** Every review or submit refreshes the queue, the counts and the VA requests. */
const REQUIREMENT_KEYS = [
  opsQueryKeys.providerRequirements,
  opsQueryKeys.providerRequirementCounts,
  opsQueryKeys.virtualAccountRequests,
] as const;

export function useProviderRequirementsQueue(
  variables: ListProviderRequirementsQueryVariables,
  options: { enabled?: boolean } = {}
) {
  return useGraphQLQuery<ListProviderRequirementsQuery, ListProviderRequirementsQueryVariables>(
    [...opsQueryKeys.providerRequirements],
    ListProviderRequirementsDocument,
    variables,
    { enabled: options.enabled ?? true }
  );
}

/** Pending counts; disabled for roles that cannot open the queue (no request is sent). */
export function useProviderRequirementCounts(enabled: boolean) {
  return useGraphQLQuery<ProviderRequirementCountsQuery, Record<string, never>>(
    [...opsQueryKeys.providerRequirementCounts],
    ProviderRequirementCountsDocument,
    undefined,
    {
      enabled,
      refetchInterval: PROVIDER_REQUIREMENT_COUNTS_REFETCH_MS,
      retry: false,
    }
  );
}

export function useReviewProviderRequirement(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    ReviewProviderRequirementMutation,
    ReviewProviderRequirementMutationVariables
  >(ReviewProviderRequirementDocument, {
    invalidate: REQUIREMENT_KEYS,
    successMessage: t`Requerimiento revisado`,
    errorMessage: t`No se pudo revisar el requerimiento`,
    conflictMessage: t`Este requerimiento ya no está esperando revisión`,
    onCompleted,
  });
}

export function useSubmitProviderRequirements(
  onCompleted?: (result: SubmitProviderRequirementsMutation) => void,
  onFailed?: (description: string) => void
) {
  const { t } = useLingui();
  const describeSubmitError = useSubmitErrorText();

  return useOpsMutation<
    SubmitProviderRequirementsMutation,
    SubmitProviderRequirementsMutationVariables
  >(SubmitProviderRequirementsDocument, {
    invalidate: REQUIREMENT_KEYS,
    successMessage: t`Requerimientos enviados al proveedor`,
    errorMessage: t`No se pudo enviar al proveedor`,
    // The provider answered but refused: the island shows the error state.
    failureOf: ({ adminLoopay_submitProviderRequirements: result }) =>
      result.errorMessage ? describeSubmitError(result.errorMessage) : undefined,
    invalidateOnError: true,
    onFailed,
    onCompleted,
  });
}

/** T-S21C: marks a PROVIDER_CONSOLE item completed at the provider (needs a recent sign-in). */
export function useMarkProviderRequirementHandled(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    MarkProviderRequirementHandledMutation,
    MarkProviderRequirementHandledMutationVariables
  >(MarkProviderRequirementHandledDocument, {
    invalidate: REQUIREMENT_KEYS,
    successMessage: t`Marcado como resuelto en el proveedor`,
    errorMessage: t`No se pudo marcar el requerimiento`,
    conflictMessage: t`Este requerimiento ya no se puede marcar como resuelto`,
    onCompleted,
  });
}

/** T-S21C: mints the KiraFin beneficial-owner link of an RFI `ubo_link` item. */
export function useCreateProviderRequirementLink(
  onCompleted?: (result: CreateProviderRequirementLinkMutation) => void
) {
  const { t } = useLingui();

  return useOpsMutation<
    CreateProviderRequirementLinkMutation,
    CreateProviderRequirementLinkMutationVariables
  >(CreateProviderRequirementLinkDocument, {
    invalidate: [],
    successMessage: t`Link del proveedor generado`,
    errorMessage: t`No se pudo generar el link del proveedor`,
    onCompleted,
  });
}

/** Opens an uploaded requirement document through its signed URL. */
export function useProviderRequirementDocument() {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  return useCallback(
    async (documentId: string) => {
      try {
        const result = await queryClient.fetchQuery({
          queryKey: [...opsQueryKeys.providerRequirements, 'document', documentId],
          queryFn: () =>
            graphqlClient.request<GetProviderRequirementDocumentUrlQuery>(
              GetProviderRequirementDocumentUrlDocument,
              { documentId }
            ),
          staleTime: 0,
        });

        window.open(
          result.adminLoopay_getProviderRequirementDocumentUrl,
          '_blank',
          'noopener,noreferrer'
        );
      } catch (error) {
        toast.error(t`No se pudo abrir el documento`, {
          description: mapError(error).message,
        });
      }
    },
    [queryClient, t]
  );
}
