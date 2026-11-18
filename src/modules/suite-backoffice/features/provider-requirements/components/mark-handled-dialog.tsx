/**
 * "Marcar resuelto en el proveedor" (T-S21C): Comercial completed an item the
 * provider API cannot take (UBO link, associated-person data) in the provider
 * console. The note is mandatory: it is audited and kept in the history.
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

interface MarkHandledDialogProps {
  /** Spanish label of the requirement; null closes the dialog. */
  requirementLabel: string | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

export function MarkHandledDialog({
  requirementLabel,
  isPending,
  onClose,
  onConfirm,
}: MarkHandledDialogProps) {
  const { t } = useLingui();
  const [note, setNote] = useState('');
  const trimmed = note.trim();

  return (
    <Dialog
      open={requirementLabel !== null}
      onOpenChange={(open) => {
        if (!open) {
          setNote('');
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            <Trans>Marcar resuelto en el proveedor</Trans>
          </DialogTitle>
          <DialogDescription>
            {requirementLabel ? (
              <Trans>
                «{requirementLabel}» pasa a enviado. Se resuelve cuando el proveedor deje de
                pedirlo; si lo sigue pidiendo después de una hora, vuelve al cliente.
              </Trans>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="mark-handled-note">
            <Trans>Qué se completó en el proveedor</Trans>
          </Label>
          <Textarea
            id="mark-handled-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t`Por ejemplo: cargué el beneficiario final en la consola de KiraFin`}
            disabled={isPending}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            <Trans>Cancelar</Trans>
          </Button>
          <Button
            disabled={isPending || trimmed === ''}
            onClick={() => {
              onConfirm(trimmed);
              setNote('');
            }}
          >
            <Trans>Marcar resuelto</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
