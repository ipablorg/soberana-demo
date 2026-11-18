/**
 * Provider requirement shapes (S21): what a virtual-account provider (KiraFin,
 * Mesta, ...) still needs from the customer that the platform cannot fill.
 *
 * Hand-written from the parent-owned S21 contract until codegen runs against
 * the backend schema; field names are the backend `ProviderRequirementEntity`
 * names (camelCase) verbatim.
 */

/** `ProviderRequirementStatus` */
export type ProviderRequirementStatus =
  'REQUESTED' | 'UPLOADED' | 'APPROVED' | 'REJECTED' | 'SUBMITTED' | 'RESOLVED';

/** `ProviderRequirementKind` */
export type ProviderRequirementKind = 'DOCUMENT' | 'VALUE' | 'UBO_LINK';

/** `ProviderRequirementDecision` */
export type ProviderRequirementDecision = 'APPROVE' | 'REJECT';

/** Who completes a requirement at the provider (T-S21C). */
export type ProviderRequirementHandling = 'PROVIDER_API' | 'PROVIDER_CONSOLE';

/** `ProviderRequirementDocumentEntity` */
export interface ProviderRequirementDocument {
  id: string;
  fileName: string;
  mimeType: string;
  uploadedAt: string;
}

/** `ProviderRequirementEntity` */
export interface ProviderRequirement {
  id: string;
  endorsementId: string;
  customerId: string;
  provider: string;
  railCode: string;
  source: string;
  blockerCode: string;
  /** Stable requirement key, labeled with `providerFieldLabel`. */
  key: string;
  group: string;
  kind: ProviderRequirementKind;
  status: ProviderRequirementStatus;
  documents: ProviderRequirementDocument[];
  value: string | null;
  rejectReason: string | null;
  requestedAt: string;
  updatedAt: string;
  dueAt: string | null;
  /** N4: documented answers of a VALUE requirement; null for free text. */
  options?: string[] | null;
  /** T-S21C: PROVIDER_CONSOLE items are completed by Loopay at the provider. */
  handling?: string | null;
}

/** `RequirementDocumentInput`: `file` is a base64 data URI. */
export interface RequirementDocumentInput {
  fileName: string;
  mimeType: string;
  file: string;
}

/** `SubmitProviderRequirementInput` */
export interface SubmitProviderRequirementInput {
  customerId: string;
  requirementId: string;
  documents?: RequirementDocumentInput[];
  value?: string;
}
