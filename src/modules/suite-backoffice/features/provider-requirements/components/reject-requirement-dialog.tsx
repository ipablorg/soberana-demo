/**
 * "Rechazar" a customer's upload: the reason is mandatory, because the
 * customer reads it next to the requirement to upload it again.
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

interface RejectRequirementDialogProps {
  /** Spanish label of the requirement being rejected; null closes the dialog. */
  requirementLabel: string | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectRequirementDialog({
  requirementLabel,
  isPending,
  onClose,
  onConfirm,
}: RejectRequirementDialogProps) {
  const { t } = useLingui();
  const [reason, setReason] = useState('');
  const trimmed = reason.trim();

  return (
    <Dialog
      open={requirementLabel !== null}
      onOpenChange={(open) => {
        if (!open) {
          setReason('');
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            <Trans>Rechazar requerimiento</Trans>
          </DialogTitle>
          <DialogDescription>
            {requirementLabel ? (
              <Trans>
                El cliente verá el motivo junto a «{requirementLabel}» y podrá subirlo de nuevo.
              </Trans>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="reject-requirement-reason">
            <Trans>Motivo del rechazo</Trans>
          </Label>
          <Textarea
            id="reject-requirement-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t`Por ejemplo: el documento está vencido o no se lee`}
            disabled={isPending}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            <Trans>Cancelar</Trans>
          </Button>
          <Button
            variant="destructive"
            disabled={isPending || trimmed === ''}
            onClick={() => {
              onConfirm(trimmed);
              setReason('');
            }}
          >
            <Trans>Rechazar requerimiento</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
