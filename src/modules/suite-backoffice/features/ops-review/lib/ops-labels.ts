/**
 * Human labels for values the ops screens used to print raw (KYC statuses,
 * tenant UUIDs).
 */

import type { AdminClientOption } from '@/graphql/types/admin-loopay';

const KYC_STATUS_LABELS: Readonly<Record<string, string>> = {
  NOT_INITIATED: 'Sin iniciar',
  INITIATED: 'Iniciado',
  PENDING_REVIEW: 'Pendiente de revisión',
  ADDITIONAL_INFO_REQUIRED: 'Falta información',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  EXPIRED: 'Vencido',
};

export function kycStatusLabel(status: string): string {
  return KYC_STATUS_LABELS[status] ?? status;
}

const SHORT_ID_LENGTH = 8;

/** Tenant name for a client id; a shortened id until the names load. */
export function clientNameFor(options: readonly AdminClientOption[], clientId: string): string {
  const match = options.find((option) => option.client_id === clientId);

  return match?.client_name ?? `${clientId.slice(0, SHORT_ID_LENGTH)}…`;
}
