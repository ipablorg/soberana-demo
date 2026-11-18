/**
 * Answer of a provider requirement (`POST /v1/customers/:id/requirements/:requirement_id`).
 *
 * Mirrors the back rules: only `REQUESTED` / `REJECTED` requirements take an
 * answer; `DOCUMENT` needs at least one document, `VALUE` needs a value (one of
 * `options` when the provider has a closed list), `UBO_LINK` takes either;
 * documents are PDF, PNG or JPEG, 10 MB each, 10 at most.
 */

import type {
  TenantRequirement,
  TenantRequirementAnswer,
  TenantRequirementDocument,
} from '@/graphql/types/tenant';

export const REQUIREMENT_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg'] as const;
export const REQUIREMENT_MAX_BYTES = 10 * 1024 * 1024;
export const REQUIREMENT_MAX_DOCUMENTS = 10;

export type RequirementAnswerError =
  | 'not_open'
  | 'document_required'
  | 'value_required'
  | 'answer_required'
  | 'value_not_allowed'
  | 'too_many_documents';

export function isRequirementOpen(requirement: Pick<TenantRequirement, 'status'>): boolean {
  return requirement.status === 'REQUESTED' || requirement.status === 'REJECTED';
}

export function validateRequirementAnswer(
  requirement: Pick<TenantRequirement, 'status' | 'kind' | 'options'>,
  value: string,
  documents: readonly TenantRequirementDocument[]
): RequirementAnswerError | null {
  if (!isRequirementOpen(requirement)) return 'not_open';
  const trimmed = value.trim();
  if (documents.length > REQUIREMENT_MAX_DOCUMENTS) return 'too_many_documents';

  if (requirement.kind === 'DOCUMENT' && documents.length === 0) return 'document_required';
  if (requirement.kind === 'VALUE') {
    if (!trimmed) return 'value_required';
    const options = requirement.options ?? [];
    if (
      options.length > 0 &&
      !options.some((option) => option.toLowerCase() === trimmed.toLowerCase())
    ) {
      return 'value_not_allowed';
    }
  }
  if (
    requirement.kind !== 'DOCUMENT' &&
    requirement.kind !== 'VALUE' &&
    !trimmed &&
    documents.length === 0
  ) {
    return 'answer_required';
  }

  return null;
}

export function toRequirementAnswer(
  value: string,
  documents: readonly TenantRequirementDocument[]
): TenantRequirementAnswer {
  const answer: TenantRequirementAnswer = {};
  if (documents.length > 0) answer.documents = [...documents];
  if (value.trim()) answer.value = value.trim();

  return answer;
}
