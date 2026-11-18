/**
 * Upload dialog for the documents and data a VA provider asked for (S21).
 * Each requirement is answered and sent on its own; the dynamic island
 * confirms each send (or says it failed) and the list refreshes, so a sent
 * item leaves the dialog while it waits for review.
 */

import { useRef, useState } from 'react';
import { useLingui } from '@lingui/react/macro';

import type { ProviderRequirement } from '@/graphql/types/provider-requirements';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useSubmitProviderRequirement } from '@/shared/hooks/use-provider-requirements';
import { mapError } from '@/shared/lib/error-mapper';
import {
  buildRequirementSubmitInput,
  type RequirementDraft,
} from '@/shared/lib/provider-requirements';
import { useDynamicIslandStore } from '@/shared/stores/useDynamicIslandStore';

import { ProviderRequirementItem } from './provider-requirement-item';

interface ProviderRequirementsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  /** What the customer still has to answer (REQUESTED or REJECTED). */
  requirements: readonly ProviderRequirement[];
}

export function ProviderRequirementsDialog({
  open,
  onOpenChange,
  customerId,
  requirements,
}: ProviderRequirementsDialogProps) {
  const { t } = useLingui();
  const [drafts, setDrafts] = useState<Record<string, RequirementDraft>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  // The requirement of the send in flight, read when the mutation settles.
  const sendingRef = useRef<string | null>(null);

  const finish = () => {
    sendingRef.current = null;
    setSendingId(null);
  };
  const submit = useSubmitProviderRequirement({
    onSuccess: () => {
      useDynamicIslandStore
        .getState()
        .showSuccess(t`Recibimos tu documento. Lo revisaremos pronto.`);
      finish();
    },
    onError: (error) => {
      useDynamicIslandStore.getState().showError(t`No pudimos enviar el documento`);
      const failedId = sendingRef.current;
      if (failedId) {
        setErrors((current) => ({ ...current, [failedId]: mapError(error).message }));
      }
      finish();
    },
  });

  const updateDraft = (id: string) => (update: (draft: RequirementDraft) => RequirementDraft) =>
    setDrafts((current) => ({ ...current, [id]: update(current[id] ?? {}) }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{t`Documentos requeridos`}</DialogTitle>
          <DialogDescription>
            {t`Nuestro proveedor bancario necesita esto para abrir tu cuenta. Puedes subir PDF, PNG o JPEG de hasta 10 MB.`}
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-3">
          {requirements.map((requirement) => {
            const draft = drafts[requirement.id] ?? {};
            const input = buildRequirementSubmitInput(customerId, requirement, draft);

            return (
              <ProviderRequirementItem
                key={requirement.id}
                requirement={requirement}
                draft={draft}
                onDraftChange={updateDraft(requirement.id)}
                canSubmit={input !== null && sendingId === null}
                isSubmitting={sendingId === requirement.id}
                error={errors[requirement.id] ?? null}
                onSubmit={() => {
                  if (!input) return;
                  setErrors((current) => ({ ...current, [requirement.id]: '' }));
                  sendingRef.current = requirement.id;
                  setSendingId(requirement.id);
                  submit.mutate({ input });
                }}
              />
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
