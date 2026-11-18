import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { AlertTriangle, Loader2 } from '@/shared/components/animated-icons';
import { StatePillChipStatusLabel } from '@/shared/components/backoffice/StatePillChip';

/**
 * Entities whose state this modal can confirm a change for.
 *
 * The manual backoffice queues (`ops`) pass their own `entityLabel` /
 * `entityLabelPlural`, so adding a queue does not mean editing this union.
 */
type StateChangeEntityType = 'payin' | 'payout' | 'empresa' | 'documentación' | 'ops';

interface StateChangeConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  selectedCount: number;
  fromState: string;
  toState: string;
  entityType: StateChangeEntityType;
  loading?: boolean;
  /** Overrides the built-in singular noun. Required for `entityType="ops"`. */
  entityLabel?: string;
  /** Overrides the built-in plural noun. Required for `entityType="ops"`. */
  entityLabelPlural?: string;
  /**
   * When true the operation cannot be confirmed without a reason, because the
   * backend input declares it as `@IsNotEmpty()`.
   */
  reasonRequired?: boolean;
  /**
   * Hides the reason textarea when the caller already collected the reason
   * (e.g. one reason shared by a dry run and its real run). Confirm then
   * passes an empty string.
   */
  showReason?: boolean;
  /**
   * Key/value rows identifying the entity the decision acts on (customer,
   * amount, reference, ...). Rendered above the reason so ops can verify the
   * target before confirming. Omit for bulk actions with no single entity.
   */
  entitySummary?: ReadonlyArray<{ label: string; value: string }>;
}

export function StateChangeConfirmationModal({
  open,
  onClose,
  onConfirm,
  selectedCount,
  fromState: rawFromState,
  toState: rawToState,
  entityType,
  loading = false,
  entityLabel: entityLabelOverride,
  entityLabelPlural: entityLabelPluralOverride,
  reasonRequired = false,
  showReason = true,
  entitySummary,
}: StateChangeConfirmationModalProps) {
  const { t } = useLingui();
  const [reason, setReason] = useState('');

  const trimmedReason = reason.trim();
  const missingReason = showReason && reasonRequired && trimmedReason.length === 0;

  const handleConfirm = () => {
    if (missingReason) return;

    onConfirm(reason);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  // Callers pass either raw enum values (PENDING) or ready labels; the helper
  // maps the former to Spanish and returns the latter unchanged.
  const fromState = StatePillChipStatusLabel(rawFromState);
  const toState = StatePillChipStatusLabel(rawToState);

  const entityLabel = entityLabelOverride ?? (entityType === 'payin' ? t`Pay-in` : t`Payout`);
  const entityLabelPlural =
    entityLabelPluralOverride ?? (entityType === 'payin' ? t`Pay-ins` : t`Payouts`);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <DialogTitle>
              <Trans>Confirmar cambio de estado</Trans>
            </DialogTitle>
          </div>
          <DialogDescription className="pt-4">
            {selectedCount === 1 ? (
              <Trans>
                ¿Cambiar el estado de {selectedCount} {entityLabel} de <strong>{fromState}</strong>{' '}
                a <strong>{toState}</strong>?
              </Trans>
            ) : (
              <Trans>
                ¿Cambiar el estado de {selectedCount} {entityLabelPlural} de{' '}
                <strong>{fromState}</strong> a <strong>{toState}</strong>?
              </Trans>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {entitySummary && entitySummary.length > 0 ? (
            <dl className="space-y-1.5 rounded-md border bg-muted/40 p-3 text-sm">
              {entitySummary.map((row) => (
                <div key={row.label} className="flex gap-2">
                  <dt className="w-28 shrink-0 text-muted-foreground">{row.label}</dt>
                  <dd className="min-w-0 break-all font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <p className="text-sm text-muted-foreground">
            <Trans>Esta acción quedará registrada en el log de auditoría.</Trans>
          </p>

          {showReason ? (
            <div className="space-y-2">
              <Label htmlFor="reason">
                {reasonRequired ? (
                  <Trans>Razón del cambio (obligatoria)</Trans>
                ) : (
                  <Trans>Razón del cambio (opcional)</Trans>
                )}
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t`Ingrese el motivo del cambio de estado...`}
                rows={3}
                className="resize-none"
              />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            <Trans>Cancelar</Trans>
          </Button>
          <Button onClick={handleConfirm} disabled={loading || missingReason}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? <Trans>Un momento...</Trans> : <Trans>Confirmar</Trans>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
