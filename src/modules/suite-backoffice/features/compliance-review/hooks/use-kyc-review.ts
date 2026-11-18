/**
 * KYC review queue hooks (`adminLoopay_*`, staff scope `OPS_KYC`).
 *
 * `adminLoopay_reviewKyc` carries `@RequiresRecentAuth`; the prompt-and-retry
 * is handled globally by `withRecentAuth`, so nothing here wraps the call again.
 */

import { useCallback } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  GetCustomerKycDataDocument,
  GetDocumentDownloadUrlDocument,
  ListPendingKycDocument,
  type GetCustomerKycDataQuery,
  type GetDocumentDownloadUrlQuery,
  type ListPendingKycQuery,
} from '@/graphql/queries/admin-loopay';
import {
  RequestKycAdditionalInfoDocument,
  ReviewKycDocument,
  type RequestKycAdditionalInfoMutation,
  type RequestKycAdditionalInfoMutationVariables,
  type ReviewKycMutation,
  type ReviewKycMutationVariables,
} from '@/graphql/mutations/admin-loopay';
import type {
  AdminKycQueueFilters,
  AdminKycReviewResponse,
} from '@/graphql/types/admin-loopay';
import { graphqlClient } from '@/shared/lib/graphql-client';
import { mapError } from '@/shared/lib/error-mapper';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { useOpsMutation } from '../../ops-review/hooks/use-ops-mutation';
import { opsQueryKeys } from '../../ops-review/lib/ops-query-keys';
import { describeReviewKycWalletResult } from '../lib/kyc-review-actions';

type TranslateFn = (message: TemplateStringsArray | string) => string;

/**
 * Surface the wallet the backend provisioned (or failed to provision) after a
 * KYC approve. The generic success toast from `useOpsMutation` already fires;
 * this adds a second, wallet-specific announcement so ops does not have to
 * dig into the dossier to know whether the wallet landed.
 */
function announceReviewKycWallet(
  result: AdminKycReviewResponse,
  t: TranslateFn,
): void {
  const announcement = describeReviewKycWalletResult(result);

  if (!announcement) return;

  if (announcement.kind === 'wallet-error') {
    toast.warning(t`KYC aprobado pero la billetera falló`, {
      description: t`Usa adminLoopay_createWallet como recuperación. Detalle: ${announcement.error}`,
    });
    return;
  }

  toast.success(
    t`Billetera creada: ${announcement.chain}/${announcement.currency} (${announcement.addressPreview})`,
  );
}

export function usePendingKycQueue(filter: AdminKycQueueFilters) {
  return useGraphQLQuery<ListPendingKycQuery, { filter: AdminKycQueueFilters }>(
    [...opsQueryKeys.kycQueue],
    ListPendingKycDocument,
    { filter },
  );
}

export function useCustomerKycData(customerId: string | null) {
  return useGraphQLQuery<GetCustomerKycDataQuery, { customerId: string }>(
    [...opsQueryKeys.kycDetail(customerId ?? 'none')],
    GetCustomerKycDataDocument,
    { customerId: customerId ?? '' },
    { enabled: Boolean(customerId) },
  );
}

export function useReviewKyc(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<ReviewKycMutation, ReviewKycMutationVariables>(
    ReviewKycDocument,
    {
      invalidate: [opsQueryKeys.kycQueue],
      successMessage: t`Decisión de KYC registrada`,
      errorMessage: t`No se pudo registrar la decisión de KYC`,
      onCompleted: (result) => {
        announceReviewKycWallet(result.adminLoopay_reviewKyc, t);
        onCompleted?.();
      },
    },
  );
}

export function useRequestKycAdditionalInfo(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    RequestKycAdditionalInfoMutation,
    RequestKycAdditionalInfoMutationVariables
  >(RequestKycAdditionalInfoDocument, {
    invalidate: [opsQueryKeys.kycQueue],
    successMessage: t`Se solicitó información adicional al cliente`,
    errorMessage: t`No se pudo solicitar la información adicional`,
    onCompleted,
  });
}

/**
 * Opens a KYC document through a short-lived presigned URL.
 *
 * Fetched on demand rather than with the dossier because the backend only
 * keeps the URL valid for 15 minutes.
 */
export function useKycDocumentDownload() {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  return useCallback(
    async (documentId: string) => {
      try {
        const result = await queryClient.fetchQuery({
          queryKey: [...opsQueryKeys.kycDetail(documentId), 'download'],
          queryFn: () =>
            graphqlClient.request<GetDocumentDownloadUrlQuery>(
              GetDocumentDownloadUrlDocument,
              { documentId },
            ),
          staleTime: 0,
        });

        const url = result.adminLoopay_getDocumentDownloadUrl.url;
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (error) {
        toast.error(t`No se pudo abrir el documento`, {
          description: mapError(error).message,
        });
      }
    },
    [queryClient, t],
  );
}
