/**
 * Rows of the provider requirements queue (S21) and the counts shown to
 * Comercial and Super admin: Spanish labels, which endorsements have approved
 * items ready to send, and the pending total of the badge and banner.
 */

import type { MessageDescriptor } from '@lingui/core';

import type {
  AdminProviderRequirement,
  AdminProviderRequirementCounts,
} from '@/graphql/types/admin-loopay';
import type { ProviderRequirementStatus } from '@/graphql/types/provider-requirements';
import { providerFieldLabel, sourceText } from '@/shared/lib/provider-field-labels';
import {
  isProviderConsoleRequirement,
  requirementKindLabel,
  requirementStatusLabel,
} from '@/shared/lib/provider-requirements';
import { providerDisplayName, railCodeLabel } from '@/shared/lib/rail-provider-labels';

type Translate = (descriptor: MessageDescriptor) => string;

/** Default status filter of the queue: what waits for Comercial's review. */
export const DEFAULT_REQUIREMENT_STATUSES: readonly ProviderRequirementStatus[] = ['UPLOADED'];

/** Status filter options of the queue, in lifecycle order. */
export const REQUIREMENT_STATUS_FILTERS: readonly ProviderRequirementStatus[] = [
  'UPLOADED',
  'REQUESTED',
  'REJECTED',
  'APPROVED',
  'SUBMITTED',
  'RESOLVED',
];

/** Statuses still open (not yet with the provider), for the VA requests link. */
export const OPEN_REQUIREMENT_STATUSES: readonly ProviderRequirementStatus[] = [
  'REQUESTED',
  'UPLOADED',
  'REJECTED',
  'APPROVED',
];

export interface ProviderRequirementRow {
  id: string;
  endorsementId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  clientName: string;
  providerLabel: string;
  railLabel: string;
  requirementLabel: string;
  kindLabel: string;
  status: string;
  statusLabel: string;
  value: string | null;
  rejectReason: string | null;
  documents: AdminProviderRequirement['documents'];
  requestedAt: string;
  /** Comercial may approve it (the customer answered and nobody reviewed it yet). */
  canApprove: boolean;
  /** Comercial may reject it: a fresh answer, or an approved one not sent yet (N4). */
  canReject: boolean;
  /** T-S21C: Loopay completes it at the provider ("Completar en el proveedor"). */
  providerConsole: boolean;
  /** T-S21C: answered and ready to be marked as completed at the provider. */
  canMarkHandled: boolean;
  /** T-S21C: a KiraFin RFI beneficial-owner item with a provider link. */
  canGenerateLink: boolean;
}

const OPEN_FOR_COMMERCIAL: readonly string[] = ['UPLOADED', 'APPROVED'];

export function describeProviderRequirement(
  requirement: AdminProviderRequirement,
  t: Translate = sourceText
): ProviderRequirementRow {
  return {
    id: requirement.id,
    endorsementId: requirement.endorsementId,
    customerId: requirement.customerId,
    customerName: requirement.customerName,
    customerEmail: requirement.customerEmail ?? '',
    clientName: requirement.clientName ?? requirement.clientId,
    providerLabel: providerDisplayName(requirement.provider),
    railLabel: railCodeLabel(requirement.railCode),
    requirementLabel: providerFieldLabel(requirement.key, t),
    kindLabel: requirementKindLabel(requirement.kind, t),
    status: requirement.status,
    statusLabel: requirementStatusLabel(requirement.status, t),
    value: requirement.value,
    rejectReason: requirement.rejectReason,
    documents: requirement.documents,
    requestedAt: requirement.requestedAt,
    canApprove: requirement.status === 'UPLOADED',
    canReject: OPEN_FOR_COMMERCIAL.includes(requirement.status),
    providerConsole: isProviderConsoleRequirement(requirement),
    canMarkHandled:
      isProviderConsoleRequirement(requirement) &&
      (OPEN_FOR_COMMERCIAL.includes(requirement.status) ||
        (requirement.kind === 'UBO_LINK' && requirement.status === 'REQUESTED')),
    canGenerateLink:
      requirement.provider === 'kirafin' &&
      requirement.source === 'RFI_ITEM' &&
      requirement.kind === 'UBO_LINK' &&
      requirement.status !== 'RESOLVED',
  };
}

/**
 * Approved items per endorsement: "Enviar al proveedor" is enabled where there
 * are any. Provider-console items are completed at the provider, never sent.
 */
export function approvedCountByEndorsement(
  requirements: readonly Pick<AdminProviderRequirement, 'endorsementId' | 'status' | 'handling'>[]
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const requirement of requirements) {
    if (requirement.status !== 'APPROVED' || isProviderConsoleRequirement(requirement)) continue;
    counts.set(requirement.endorsementId, (counts.get(requirement.endorsementId) ?? 0) + 1);
  }
  return counts;
}

/** Open (not yet sent) items per endorsement, for the VA requests link. */
export function openCountByEndorsement(
  requirements: readonly Pick<AdminProviderRequirement, 'endorsementId' | 'status'>[]
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const requirement of requirements) {
    if (!OPEN_REQUIREMENT_STATUSES.includes(requirement.status)) continue;
    counts.set(requirement.endorsementId, (counts.get(requirement.endorsementId) ?? 0) + 1);
  }
  return counts;
}

/** What Comercial has to act on: uploads to review plus approved items to send. */
export function pendingRequirementTotal(
  counts: AdminProviderRequirementCounts | null | undefined
): number {
  if (!counts) return 0;
  return counts.pendingReview + counts.readyToSubmit;
}

/** Queue link filtered by customer (VA requests and Customer 360). */
export function providerRequirementsLink(customerId?: string): string {
  const base = '/backoffice/provider-requirements';
  return customerId ? `${base}?customerId=${encodeURIComponent(customerId)}` : base;
}
