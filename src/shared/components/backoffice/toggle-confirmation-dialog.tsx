/**
 * Confirmation dialog for platform-config activate/deactivate toggles.
 *
 * Providers, rails and junctions affect every client that uses them, so the
 * toggle cannot fire on a single click. This dialog states the blast radius
 * before the mutation lands: every client (`scope="platform"`) or one
 * customer's account (`scope="customer"`, e.g. a virtual account).
 */

import { Trans, useLingui } from '@lingui/react/macro';
import { AlertTriangle, Loader2 } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

interface ToggleConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** "proveedor" | "riel" | "conexión" — already translated by the caller. */
  entityType: string;
  entityName: string;
  action: 'activate' | 'deactivate' | 'close';
  /**
   * `platform` (default): a provider, rail or junction every client uses.
   * `customer`: one customer's own record (a virtual account), so only that
   * customer's account is affected.
   */
  scope?: 'platform' | 'customer';
  loading?: boolean;
}

export function ToggleConfirmationDialog({
  open,
  onClose,
  onConfirm,
  entityType,
  entityName,
  action,
  scope = 'platform',
  loading = false,
}: ToggleConfirmationDialogProps) {
  const { t } = useLingui();

  const verb =
    action === 'activate'
      ? t`activar`
      : action === 'close'
        ? t`cerrar`
        : t`desactivar`;

  const confirmLabel =
    action === 'activate' ? t`Activar` : action === 'close' ? t`Cerrar` : t`Desactivar`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <DialogTitle>
              <Trans>Confirmar cambio</Trans>
            </DialogTitle>
          </div>
          <DialogDescription className="pt-4">
            {scope === 'customer' ? (
              <Trans>
                Esto va a {verb} la {entityType} <strong>{entityName}</strong>. Solo afecta a la
                cuenta de este cliente. ¿Continuar?
              </Trans>
            ) : (
              <Trans>
                Esto va a {verb} el {entityType} <strong>{entityName}</strong> y afecta a TODOS los
                clients que lo usan. ¿Continuar?
              </Trans>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <Trans>Cancelar</Trans>
          </Button>
          <Button
            variant={action === 'activate' ? 'default' : 'destructive'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
