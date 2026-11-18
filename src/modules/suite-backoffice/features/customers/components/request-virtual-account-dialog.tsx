/**
 * "Solicitar cuenta virtual" dialog of the Customer 360 panel.
 *
 * Lists where the customer can receive money (country / currency / rail) with
 * its state and eligibility, and requests the picked one through
 * `adminLoopay_requestVirtualAccount`. Individuals are told the offer is for
 * businesses only, and rails under maintenance cannot be requested. Success
 * and failure are announced by the dynamic island (see `useOpsMutation`); the
 * request still goes to the operations review queue.
 */

import { Trans, useLingui } from '@lingui/react/macro';

import { Loader2 } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

import { useCustomerReceiveOptions, useRequestVirtualAccount } from '../hooks/use-customers';
import {
  buildRequestVirtualAccountInput,
  describeReceiveOptions,
} from '../lib/virtual-account-request';

export interface RequestVirtualAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  /** Display name shown in the description. */
  customerLabel: string;
}

export function RequestVirtualAccountDialog({
  open,
  onOpenChange,
  customerId,
  customerLabel,
}: RequestVirtualAccountDialogProps) {
  const { t } = useLingui();
  const { data, isLoading } = useCustomerReceiveOptions(customerId, open);
  const { mutate, isPending } = useRequestVirtualAccount();

  const rows = describeReceiveOptions(data?.adminLoopay_customerReceiveOptions ?? []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <Trans>Solicitar cuenta virtual</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Elige el riel para {customerLabel}. La solicitud pasa a la cola de revisión de
              Operaciones.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <Trans>Cargando opciones...</Trans>
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            <Trans>No hay rieles disponibles para este cliente.</Trans>
          </p>
        ) : (
          <ul className="space-y-2" aria-label={t`Rieles disponibles`}>
            {rows.map((row) => (
              <li
                key={row.key}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{row.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.provider}
                    {row.note ? ` · ${row.note}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{row.statusLabel}</Badge>
                  {row.action === 'request' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() =>
                        mutate({
                          input: buildRequestVirtualAccountInput(customerId, row.option),
                        })
                      }
                    >
                      <Trans>Solicitar</Trans>
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
