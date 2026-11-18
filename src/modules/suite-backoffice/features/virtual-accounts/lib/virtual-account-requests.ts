/**
 * Open virtual-account requests on `/backoffice/virtual-accounts`
 * (`adminLoopay_listVirtualAccountRequests`): where each one stands and what
 * blocks it, for Operaciones and Comercial.
 */

import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';

import type { AdminVirtualAccountRequest } from '@/graphql/types/admin-loopay';

import { providerDisplayName } from '@/shared/lib/rail-provider-labels';

import {
  providerBlockerLabel,
  providerFieldLabel,
  sourceText,
} from '../../compliance-review/lib/provider-profile-labels';
import { formatOpsDateTime } from '../../ops-review/lib/ops-formatting';
import { railDisplayName } from '../../ops-review/lib/ops-value-labels';
import { isRepairableRequest } from './repair-virtual-account';

export interface VirtualAccountRequestsQuery {
  adminLoopay_listVirtualAccountRequests: {
    data: AdminVirtualAccountRequest[];
    total: number;
    has_more: boolean;
  };
}

export const ListVirtualAccountRequestsDocument = parse(/* GraphQL */ `
  query AdminLoopayListVirtualAccountRequests {
    adminLoopay_listVirtualAccountRequests {
      data {
        id
        customerId
        customerEmail
        clientId
        clientName
        railCode
        railName
        currency
        endorsementStatus
        state
        provider
        blockers {
          code
          category
          message
        }
        missingFields
        missingFieldDetails {
          key
          group
          kind
        }
        reason
        requestedAt
        repair {
          reason
          repairedBy
          repairedAt
          bankDetailsSource
        }
      }
      total
      has_more
    }
  }
`) as unknown as TypedDocumentNode<VirtualAccountRequestsQuery, Record<string, never>>;

const STATE_LABELS: Readonly<Record<string, string>> = {
  REQUESTED: 'Por revisar (Operaciones)',
  OPS_APPROVED: 'Aprobada, falta el proveedor',
  PROVIDER_ONBOARDING: 'En alta con el proveedor',
};

export interface VirtualAccountRequestRow {
  /** Endorsement id (the retry mutation takes it). */
  id: string;
  customerId: string;
  /** Approved and parked at the provider: "Reintentar alta en el proveedor". */
  canRetryProvider: boolean;
  /** Blocked or retryable: "Reparar con cuenta del proveedor" (S22). */
  canRepair: boolean;
  /** Rail code, for the repair's bank-detail fields. */
  railCode: string;
  customerEmail: string;
  tenant: string;
  railLabel: string;
  providerLabel: string;
  stateLabel: string;
  blockerLines: string[];
  /** Stable missing-data keys, for the "Completar datos" dialog. */
  missingFields: string[];
  missingFieldDetails: AdminVirtualAccountRequest['missingFieldDetails'];
  requestedAt: string;
  /** S22: who repaired the request, when and why; null when nobody did. */
  repairLine: string | null;
}

/**
 * A blocker as the data it asks for: missing-field codes become the field
 * label (never the provider message, which may be redacted), status codes a
 * sentence, and other blockers keep their message.
 */
function blockerLine(
  blocker: AdminVirtualAccountRequest['blockers'][number],
  t: (descriptor: MessageDescriptor) => string
): string {
  return providerBlockerLabel(blocker.code, blocker.message, t);
}

export function describeVirtualAccountRequest(
  request: AdminVirtualAccountRequest,
  t: (descriptor: MessageDescriptor) => string = sourceText
): VirtualAccountRequestRow {
  return {
    id: request.id,
    customerId: request.customerId,
    canRetryProvider:
      request.endorsementStatus === 'APPROVED' && request.state === 'PROVIDER_ONBOARDING',
    canRepair: isRepairableRequest(request),
    railCode: request.railCode,
    customerEmail: request.customerEmail,
    tenant: request.clientName,
    railLabel: `${railDisplayName(request.railName)} · ${request.currency}`,
    providerLabel: request.provider ? providerDisplayName(request.provider) : '—',
    stateLabel: STATE_LABELS[request.state] ?? request.state,
    // The stable missing-data keys win; older rows only carry provider blockers.
    blockerLines:
      (request.missingFields ?? []).length > 0
        ? request.missingFields.map((key) => providerFieldLabel(key, t))
        : request.blockers.map((blocker) => blockerLine(blocker, t)),
    missingFields: request.missingFields ?? [],
    missingFieldDetails: request.missingFieldDetails ?? [],
    requestedAt: request.requestedAt,
    repairLine: repairLine(request.repair, t),
  };
}

function repairLine(
  repair: AdminVirtualAccountRequest['repair'],
  t: (descriptor: MessageDescriptor) => string
): string | null {
  if (!repair) return null;
  const by = repair.repairedBy;
  const at = formatOpsDateTime(repair.repairedAt);
  const reason = repair.reason;
  return repair.bankDetailsSource === 'MANUAL'
    ? t(msg`Reparada por ${by} el ${at} (datos bancarios manuales): ${reason}`)
    : t(msg`Reparada por ${by} el ${at} (datos bancarios del proveedor): ${reason}`);
}
