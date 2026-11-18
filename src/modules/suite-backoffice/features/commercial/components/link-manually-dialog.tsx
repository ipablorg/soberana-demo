/**
 * Dialog to record a provider customer created outside the API (status MANUAL).
 * The provider is not called; the note explaining why is mandatory.
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import { Loader2 } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

import {
  MANUAL_LINK_NOTE_MAX,
  validateManualLink,
  type ManualLinkError,
} from '../lib/commercial-logic';

interface LinkManuallyDialogProps {
  provider: string | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (input: { providerCustomerId: string; note: string }) => void;
}

export function LinkManuallyDialog({
  provider,
  isPending,
  onClose,
  onSubmit,
}: LinkManuallyDialogProps) {
  const { t } = useLingui();
  const [providerCustomerId, setProviderCustomerId] = useState('');
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);

  const error = validateManualLink({ providerCustomerId, note });

  const messages: Record<ManualLinkError, string> = {
    ID_REQUIRED: t`El ID de cliente en el proveedor es obligatorio`,
    NOTE_REQUIRED: t`Explica por qué el vínculo es manual`,
    NOTE_TOO_LONG: t`La nota admite como máximo ${MANUAL_LINK_NOTE_MAX} caracteres`,
  };

  const handleSubmit = () => {
    setTouched(true);
    if (error) return;
    onSubmit({ providerCustomerId, note });
  };

  return (
    <Dialog
      open={provider !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            <Trans>Vincular {provider} manualmente</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Úsalo cuando el cliente se creó fuera de la API. No se llama al
              proveedor.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="manual-link-customer-id">
              <Trans>ID de cliente en el proveedor</Trans>
            </Label>
            <Input
              id="manual-link-customer-id"
              value={providerCustomerId}
              onChange={(event) => setProviderCustomerId(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manual-link-note">
              <Trans>Nota</Trans>
            </Label>
            <Textarea
              id="manual-link-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          {touched && error ? (
            <p role="alert" className="text-sm text-destructive">
              {messages[error]}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            <Trans>Cancelar</Trans>
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            <Trans>Vincular</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
