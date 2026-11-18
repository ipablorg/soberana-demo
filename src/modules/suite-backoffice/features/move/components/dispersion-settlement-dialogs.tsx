/**
 * Structured payload dialogs for the dispersion queue.
 *
 * `StateChangeConfirmationModal` only collects a free-text reason, which covers
 * reject/fail. Approve needs a custody `fundsLocation` and complete needs the
 * settlement reference plus the optional fiat leg, so those two get their own
 * dialogs rather than a reason box the backend would ignore.
 */

import { useEffect, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type {
  AdminDispersion,
  AdminDispersionFundsLocation,
} from '@/graphql/types/admin-loopay';
import { BankDetailsDisplay } from '@/shared/components/backoffice/bank-details-display';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { formatFiat } from '@/shared/lib/format-money';

import type { CompleteDispersionFormValues } from '../lib/dispersion-actions';

/**
 * Read-only summary block shown in both settlement dialogs so ops verifies the
 * beneficiary, amount and consequence before confirming.
 */
function DispersionSummary({
  dispersion,
  consequence,
}: {
  dispersion: AdminDispersion;
  consequence: string;
}) {
  const { t } = useLingui();
  const beneficiary = dispersion.beneficiary;

  return (
    <div className="space-y-3 rounded-md border bg-muted/40 p-3 text-sm">
      <div className="space-y-1.5">
        <div className="flex gap-2">
          <span className="w-28 shrink-0 text-muted-foreground">
            <Trans>Usuario</Trans>
          </span>
          <span className="min-w-0 break-all font-medium">
            {dispersion.customer_email}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="w-28 shrink-0 text-muted-foreground">
            <Trans>Cliente</Trans>
          </span>
          <span className="min-w-0 break-all font-medium">
            {dispersion.client_name}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="w-28 shrink-0 text-muted-foreground">
            <Trans>Monto</Trans>
          </span>
          <span className="font-mono font-medium">
            {formatFiat(dispersion.amount, dispersion.currency)}
          </span>
        </div>
        {dispersion.quote_rate ? (
          <div className="flex gap-2">
            <span className="w-28 shrink-0 text-muted-foreground">
              <Trans>Tasa cliente</Trans>
            </span>
            <span className="font-mono font-medium">
              {dispersion.quote_rate} {dispersion.quote_target_currency}
            </span>
          </div>
        ) : null}
        {dispersion.quote_target_amount ? (
          <div className="flex gap-2">
            <span className="w-28 shrink-0 text-muted-foreground">
              <Trans>Monto esperado</Trans>
            </span>
            <span className="font-mono font-medium">
              {formatFiat(
                dispersion.quote_target_amount,
                dispersion.quote_target_currency ?? '',
              )}
            </span>
          </div>
        ) : null}
        {dispersion.fee_amount ? (
          <div className="flex gap-2">
            <span className="w-28 shrink-0 text-muted-foreground">
              <Trans>Fee plataforma</Trans>
            </span>
            <span className="font-mono font-medium">
              {formatFiat(dispersion.fee_amount, dispersion.fee_currency ?? '')}
              <span className="text-xs text-muted-foreground ml-1">
                ({dispersion.fee_source})
              </span>
            </span>
          </div>
        ) : null}
        <div className="flex gap-2">
          <span className="w-28 shrink-0 text-muted-foreground">
            <Trans>Referencia</Trans>
          </span>
          <span className="min-w-0 break-all font-medium">
            {dispersion.reference_code}
          </span>
        </div>
        {beneficiary ? (
          <div className="flex gap-2">
            <span className="w-28 shrink-0 text-muted-foreground">
              <Trans>Beneficiario</Trans>
            </span>
            <span className="min-w-0 break-all font-medium">
              {beneficiary.holder_name} ({beneficiary.rail_code})
            </span>
          </div>
        ) : null}
      </div>

      {beneficiary ? (
        <div className="space-y-1 border-t pt-2">
          <p className="text-xs text-muted-foreground">
            <Trans>Datos bancarios del beneficiario</Trans>
          </p>
          <BankDetailsDisplay
            bankDetails={beneficiary.bank_details}
            railCode={beneficiary.rail_code}
          />
        </div>
      ) : null}

      <p className="border-t pt-2 font-medium text-warning">{consequence}</p>
      <p className="text-xs text-muted-foreground">{t`Acción registrada en auditoría.`}</p>
    </div>
  );
}

interface ApproveDispersionDialogProps {
  dispersion: AdminDispersion | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (fundsLocation: AdminDispersionFundsLocation, note: string) => void;
  /**
   * #413: the withdrawal can only be approved with its funds in this location
   * (the sweep put the gross in the ops vault): shown, not editable.
   */
  lockedFundsLocation?: AdminDispersionFundsLocation;
  /** Overrides the consequence line of the summary (the #413 approval places the Mesta order). */
  consequence?: string;
}

export function ApproveDispersionDialog({
  dispersion,
  loading,
  onClose,
  onConfirm,
  lockedFundsLocation,
  consequence,
}: ApproveDispersionDialogProps) {
  const { t } = useLingui();
  const initialLocation = lockedFundsLocation ?? 'customer_vault';
  const [fundsLocation, setFundsLocation] =
    useState<AdminDispersionFundsLocation>(initialLocation);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (dispersion) {
      setFundsLocation(initialLocation);
      setNote('');
    }
  }, [dispersion, initialLocation]);

  return (
    <Dialog open={dispersion !== null} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            <Trans>Aprobar dispersión</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              La dispersión pasa a procesamiento. Indique dónde quedan los
              fondos mientras se liquida.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        {dispersion ? (
          <DispersionSummary
            dispersion={dispersion}
            consequence={
              consequence ?? t`La dispersión pasa a procesamiento. Los fondos quedan retenidos.`
            }
          />
        ) : null}

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="dispersion-funds-location">
              <Trans>Ubicación de los fondos</Trans>
            </Label>
            <Select
              value={fundsLocation}
              disabled={lockedFundsLocation !== undefined}
              onValueChange={(value) =>
                setFundsLocation(value as AdminDispersionFundsLocation)
              }
            >
              <SelectTrigger id="dispersion-funds-location">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer_vault">{t`Bóveda del cliente`}</SelectItem>
                <SelectItem value="provider">{t`Proveedor`}</SelectItem>
                <SelectItem value="ops_vault">{t`Bóveda de operaciones`}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dispersion-approve-note">
              <Trans>Nota</Trans>
            </Label>
            <Textarea
              id="dispersion-approve-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <Trans>Cancelar</Trans>
          </Button>
          <Button
            disabled={loading}
            onClick={() => onConfirm(fundsLocation, note)}
          >
            {loading ? <Trans>Un momento...</Trans> : <Trans>Aprobar</Trans>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const EMPTY_COMPLETE_FORM: CompleteDispersionFormValues = {
  externalReference: '',
  note: '',
  fiatAmount: '',
  fiatCurrency: '',
  fiatRate: '',
  fiatBankRate: '',
  fiatFees: '',
};

interface CompleteDispersionDialogProps {
  dispersion: AdminDispersion | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (values: CompleteDispersionFormValues) => void;
}

export function CompleteDispersionDialog({
  dispersion,
  loading,
  onClose,
  onConfirm,
}: CompleteDispersionDialogProps) {
  const { t } = useLingui();
  const [values, setValues] = useState(EMPTY_COMPLETE_FORM);

  useEffect(() => {
    if (dispersion) {
      setValues({
        ...EMPTY_COMPLETE_FORM,
        ...(dispersion.fee_amount
          ? { fiatFees: dispersion.fee_amount }
          : {}),
      });
    }
  }, [dispersion]);

  const update = (field: keyof CompleteDispersionFormValues, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  return (
    <Dialog open={dispersion !== null} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>
            <Trans>Completar dispersión</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Registre la referencia de liquidación y, si aplica, la pata fiat
              realmente pagada.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        {dispersion ? (
          <DispersionSummary
            dispersion={dispersion}
            consequence={t`Esto liquida el retiro. Los fondos salen de la custodia.`}
          />
        ) : null}

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="dispersion-external-reference">
              <Trans>Referencia de liquidación</Trans>
            </Label>
            <Input
              id="dispersion-external-reference"
              value={values.externalReference}
              onChange={(event) =>
                update('externalReference', event.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dispersion-fiat-amount">
                <Trans>Monto fiat</Trans>
              </Label>
              <Input
                id="dispersion-fiat-amount"
                value={values.fiatAmount}
                onChange={(event) => update('fiatAmount', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dispersion-fiat-currency">
                <Trans>Moneda fiat</Trans>
              </Label>
              <Input
                id="dispersion-fiat-currency"
                value={values.fiatCurrency}
                onChange={(event) => update('fiatCurrency', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dispersion-fiat-rate">
                <Trans>Tasa aplicada</Trans>
              </Label>
              <Input
                id="dispersion-fiat-rate"
                value={values.fiatRate}
                onChange={(event) => update('fiatRate', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dispersion-fiat-bank-rate">
                <Trans>Tasa del banco</Trans>
              </Label>
              <Input
                id="dispersion-fiat-bank-rate"
                value={values.fiatBankRate}
                onChange={(event) =>
                  update('fiatBankRate', event.target.value)
                }
                placeholder={t`Opcional`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dispersion-fiat-fees">
                <Trans>Comisiones</Trans>
              </Label>
              <Input
                id="dispersion-fiat-fees"
                value={values.fiatFees}
                onChange={(event) => update('fiatFees', event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dispersion-complete-note">
              <Trans>Nota</Trans>
            </Label>
            <Textarea
              id="dispersion-complete-note"
              value={values.note}
              onChange={(event) => update('note', event.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <Trans>Cancelar</Trans>
          </Button>
          <Button disabled={loading} onClick={() => onConfirm(values)}>
            {loading ? <Trans>Un momento...</Trans> : <Trans>Completar</Trans>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
