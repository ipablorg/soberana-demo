/**
 * Approval dialog for a rail endorsement. #411: the provider of a virtual
 * account is the one of the client's enabled rail (the backend resolves it),
 * so ops only confirm; there is no provider to choose.
 */

import { Trans, useLingui } from '@lingui/react/macro';

import type { AdminEndorsementQueueItem } from '@/graphql/types/admin-loopay';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

interface EndorsementApprovalDialogProps {
  endorsement: AdminEndorsementQueueItem | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function EndorsementApprovalDialog({
  endorsement,
  loading,
  onClose,
  onConfirm,
}: EndorsementApprovalDialogProps) {
  const { t } = useLingui();

  return (
    <Dialog open={endorsement !== null} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            <Trans>Aprobar habilitación</Trans>
          </DialogTitle>
          <DialogDescription>
            {endorsement
              ? t`${endorsement.customer_email} · ${endorsement.rail_name} (${endorsement.rail_code})`
              : null}
          </DialogDescription>
        </DialogHeader>

        <p className="py-2 text-sm text-muted-foreground">
          <Trans>
            El proveedor lo fija el riel habilitado del cliente: al aprobar se abre la cuenta
            virtual con ese proveedor.
          </Trans>
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <Trans>Cancelar</Trans>
          </Button>
          <Button disabled={loading} onClick={() => onConfirm()}>
            {loading ? <Trans>Un momento...</Trans> : <Trans>Aprobar</Trans>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
