/**
 * "Reparar con cuenta del proveedor" (S22): the only way to link a provider
 * account by hand, and only from a blocked or retryable VA request. Staff
 * enter the account id they opened at the provider and a mandatory reason
 * (audited); the backend fetches the bank details from the provider. When the
 * provider returns none, the rail's bank fields appear with a second
 * confirmation, and the repair is resent with them.
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type { AdminVirtualAccountRepairResult } from '@/graphql/types/admin-loopay';
import { Loader2 } from '@/shared/components/animated-icons';
import { BankDetailsForm } from '@/shared/components/backoffice/bank-details-form';
import { validateBankDetails } from '@/shared/components/backoffice/bank-rail-fields';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
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

import { useRepairVirtualAccountRequest } from '../hooks/use-virtual-accounts';

export interface RepairableRequest {
  endorsementId: string;
  railCode: string;
  railLabel: string;
  providerLabel: string;
  customerEmail: string;
}

interface RepairVirtualAccountDialogProps {
  request: RepairableRequest;
  onClose: () => void;
}

function RepairResult({ result }: { result: AdminVirtualAccountRepairResult }) {
  return (
    <div
      role="status"
      className="space-y-2 rounded-xl border border-success/30 bg-success/10 p-4 text-sm"
    >
      <p className="font-medium text-foreground">
        <Trans>Solicitud reparada</Trans>
      </p>
      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">
            <Trans>Cuenta virtual</Trans>
          </dt>
          <dd className="break-all font-mono">{result.virtualAccountId}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            <Trans>Estado</Trans>
          </dt>
          <dd>{result.status}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-muted-foreground">
            <Trans>Datos bancarios</Trans>
          </dt>
          <dd>
            {result.bankDetailsSource === 'MANUAL' ? (
              <Trans>Ingresados a mano (confirmados con el proveedor)</Trans>
            ) : (
              <Trans>Obtenidos del proveedor</Trans>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function RepairVirtualAccountDialog({ request, onClose }: RepairVirtualAccountDialogProps) {
  const { t } = useLingui();
  const [providerAccountId, setProviderAccountId] = useState('');
  const [reason, setReason] = useState('');
  const [manual, setManual] = useState(false);
  const [bankDetails, setBankDetails] = useState<Record<string, unknown>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [result, setResult] = useState<AdminVirtualAccountRepairResult | null>(null);

  const repair = useRepairVirtualAccountRequest({
    onCompleted: (data) => {
      setFailure(null);
      setResult(data.adminLoopay_repairVirtualAccountRequest);
    },
    onFailed: setFailure,
    onManualBankDetailsRequired: () => setManual(true),
  });

  const bankErrors = manual ? validateBankDetails(request.railCode, bankDetails) : [];
  const canSubmit =
    providerAccountId.trim() !== '' &&
    reason.trim() !== '' &&
    (!manual || (bankErrors.length === 0 && confirmed)) &&
    !repair.isPending;

  const submit = () => {
    if (!canSubmit) return;
    setFailure(null);
    repair.mutate({
      input: {
        endorsementId: request.endorsementId,
        providerAccountId: providerAccountId.trim(),
        reason: reason.trim(),
        ...(manual && { bankDetails, confirmManualBankDetails: true }),
      },
    });
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            <Trans>Reparar con cuenta del proveedor</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Cierra esta solicitud bloqueada con la cuenta que ya existe en {request.providerLabel}{' '}
              ({request.railLabel}) para {request.customerEmail}. Los datos bancarios se traen del
              proveedor.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <>
            <RepairResult result={result} />
            <DialogFooter>
              <Button onClick={onClose}>
                <Trans>Cerrar</Trans>
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repair-provider-account-id">
                  <Trans>ID de la cuenta en el proveedor</Trans>
                </Label>
                <Input
                  id="repair-provider-account-id"
                  value={providerAccountId}
                  onChange={(event) => setProviderAccountId(event.target.value)}
                  disabled={repair.isPending}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repair-reason">
                  <Trans>Motivo de la reparación</Trans>
                </Label>
                <Textarea
                  id="repair-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder={t`Queda registrado quién, cuándo y por qué`}
                  disabled={repair.isPending}
                />
              </div>

              {manual ? (
                <div className="space-y-4 rounded-xl border border-warning/30 bg-warning/10 p-4">
                  <p className="text-sm font-medium text-foreground">
                    <Trans>
                      El proveedor no devolvió datos bancarios. Ingrese los del riel tal como
                      aparecen en la consola del proveedor.
                    </Trans>
                  </p>
                  <BankDetailsForm
                    railCode={request.railCode}
                    value={bankDetails}
                    onChange={setBankDetails}
                    showErrors={confirmed}
                  />
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="repair-confirm-manual"
                      checked={confirmed}
                      onCheckedChange={(checked) => setConfirmed(checked === true)}
                      disabled={repair.isPending}
                    />
                    <Label htmlFor="repair-confirm-manual" className="text-sm leading-snug">
                      <Trans>Confirmo que verifiqué estos datos con el proveedor</Trans>
                    </Label>
                  </div>
                </div>
              ) : null}

              {failure ? (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm"
                >
                  <p className="font-medium text-destructive">
                    <Trans>No se pudo reparar la solicitud</Trans>
                  </p>
                  <p className="mt-1 text-muted-foreground">{failure}</p>
                </div>
              ) : null}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={repair.isPending}>
                <Trans>Cancelar</Trans>
              </Button>
              <Button disabled={!canSubmit} onClick={submit}>
                {repair.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                <Trans>Reparar solicitud</Trans>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
