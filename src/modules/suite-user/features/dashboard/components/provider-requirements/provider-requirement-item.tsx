/**
 * One provider requirement in the upload dialog (S21): its Spanish name, the
 * reject reason when Comercial sent it back, and the answer it takes — a file
 * (PDF, PNG or JPEG, up to 10 MB), a typed value (picked from the provider's
 * documented answers when it has them), or nothing for the UBO steps we
 * handle with the customer directly.
 */

import { useLingui } from '@lingui/react/macro';

import type { ProviderRequirement } from '@/graphql/types/provider-requirements';
import { Loader2 } from '@/shared/components/animated-icons';
import { DocumentCapture } from '@/shared/components/common/document-capture';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { providerFieldLabel } from '@/shared/lib/provider-field-labels';
import {
  REQUIREMENT_FILE_MAX_BYTES,
  REQUIREMENT_FILE_TYPES,
  requirementOptionLabel,
  type RequirementDraft,
} from '@/shared/lib/provider-requirements';

interface ProviderRequirementItemProps {
  requirement: ProviderRequirement;
  draft: RequirementDraft;
  /** Receives an updater: the file and its name/type arrive in two calls. */
  onDraftChange: (update: (draft: RequirementDraft) => RequirementDraft) => void;
  /** The draft answers the requirement and it can be sent. */
  canSubmit: boolean;
  isSubmitting: boolean;
  /** Why the last send failed, shown under the item. */
  error: string | null;
  onSubmit: () => void;
}

export function ProviderRequirementItem({
  requirement,
  draft,
  onDraftChange,
  canSubmit,
  isSubmitting,
  error,
  onSubmit,
}: ProviderRequirementItemProps) {
  const { t } = useLingui();
  const label = providerFieldLabel(requirement.key, (d) => t(d));
  const valueId = `requirement-value-${requirement.id}`;

  return (
    <li className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1">
        <p className="font-medium text-foreground">{label}</p>
        {requirement.status === 'REJECTED' && requirement.rejectReason ? (
          <p className="text-sm text-destructive">
            {t`Lo revisamos y necesitamos que lo subas de nuevo: ${requirement.rejectReason}`}
          </p>
        ) : null}
      </div>

      {requirement.kind === 'UBO_LINK' ? (
        <p className="text-sm text-muted-foreground">{t`Te contactaremos para este paso.`}</p>
      ) : (
        <>
          {requirement.kind === 'DOCUMENT' ? (
            <DocumentCapture
              label={t`Archivo`}
              value={draft.file}
              fileName={draft.fileName}
              accept={REQUIREMENT_FILE_TYPES}
              maxBytes={REQUIREMENT_FILE_MAX_BYTES}
              onChange={(file) => onDraftChange((current) => ({ ...current, file }))}
              onFileMeta={(meta) =>
                onDraftChange((current) => ({
                  ...current,
                  fileName: meta?.fileName,
                  mimeType: meta?.mimeType,
                }))
              }
              disabled={isSubmitting}
            />
          ) : (
            <div className="space-y-2">
              <Label htmlFor={valueId}>{t`Respuesta`}</Label>
              {requirement.options?.length ? (
                // N4: the provider only takes one of its documented answers.
                <Select
                  value={draft.value ?? ''}
                  onValueChange={(value) => onDraftChange((current) => ({ ...current, value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id={valueId}>
                    <SelectValue placeholder={t`Elige una opción`} />
                  </SelectTrigger>
                  <SelectContent>
                    {requirement.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {requirementOptionLabel(option, (d) => t(d))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={valueId}
                  value={draft.value ?? ''}
                  onChange={(event) => {
                    const value = event.target.value;
                    onDraftChange((current) => ({ ...current, value }));
                  }}
                  disabled={isSubmitting}
                />
              )}
            </div>
          )}

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button size="sm" disabled={!canSubmit || isSubmitting} onClick={onSubmit}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t`Enviar`}
            </Button>
          </div>
        </>
      )}
    </li>
  );
}
