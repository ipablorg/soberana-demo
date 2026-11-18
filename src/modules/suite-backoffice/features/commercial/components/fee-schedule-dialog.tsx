/**
 * Dialog to create a fee schedule version. Decimals travel as strings.
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

import { OptionSelect } from '../../../components/option-select';
import { useRailOptions } from '../../platform-config/hooks/use-catalog-options';
import { withCurrentValue } from '../../platform-config/lib/catalog-options';

import {
  EMPTY_FEE_SCHEDULE_FORM,
  FEE_MODES,
  FEE_OPERATIONS,
  validateFeeSchedule,
  type FeeScheduleError,
  type FeeScheduleFormState,
} from '../lib/commercial-logic';
import { feeModeLabel, feeOperationLabel } from '../lib/commercial-labels';
import type { FeeMode, FeeOperation } from '@/graphql/queries/admin-commercial';

interface FeeScheduleDialogProps {
  open: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (form: FeeScheduleFormState) => void;
}

const SELECT_CLASS =
  'h-9 w-full rounded-lg border border-input bg-background px-3 text-sm';

export function FeeScheduleDialog({
  open,
  isPending,
  onClose,
  onSubmit,
}: FeeScheduleDialogProps) {
  const { t } = useLingui();
  const {
    rails: railOptions,
    currencies: currencyOptions,
    failed: railsFailed,
  } = useRailOptions();
  const [form, setForm] = useState<FeeScheduleFormState>(EMPTY_FEE_SCHEDULE_FORM);
  const [touched, setTouched] = useState(false);

  const error = validateFeeSchedule(form);
  const messages: Record<FeeScheduleError, string> = {
    VALUE_INVALID: t`El valor debe ser un decimal no negativo con hasta 8 decimales`,
    PERCENT_OUT_OF_RANGE: t`Un porcentaje debe estar entre 0 y 100`,
    MIN_INVALID: t`El mínimo debe ser un decimal no negativo`,
    MAX_INVALID: t`El máximo debe ser un decimal no negativo`,
    MIN_GREATER_THAN_MAX: t`El mínimo no puede ser mayor que el máximo`,
    CURRENCY_INVALID: t`La moneda debe ser un código de 3 a 10 letras`,
  };

  const set = <K extends keyof FeeScheduleFormState>(
    key: K,
    value: FeeScheduleFormState[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = () => {
    setTouched(true);
    if (error) return;
    onSubmit(form);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <Trans>Crear tarifa</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              La nueva versión reemplaza a la activa para el mismo riel y
              operación.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="fee-operation">
              <Trans>Operación</Trans>
            </Label>
            <select
              id="fee-operation"
              className={SELECT_CLASS}
              value={form.operation}
              onChange={(event) => set('operation', event.target.value as FeeOperation)}
            >
              {FEE_OPERATIONS.map((operation) => (
                <option key={operation} value={operation}>
                  {feeOperationLabel(operation, t)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee-mode">
              <Trans>Modo</Trans>
            </Label>
            <select
              id="fee-mode"
              className={SELECT_CLASS}
              value={form.mode}
              onChange={(event) => set('mode', event.target.value as FeeMode)}
            >
              {FEE_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {feeModeLabel(mode, t)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee-rail">
              <Trans>Riel (opcional)</Trans>
            </Label>
            <OptionSelect
              id="fee-rail"
              value={form.railCode}
              onChange={(value) => set('railCode', value)}
              options={withCurrentValue(railOptions, form.railCode)}
              placeholder={t`Todos los rieles`}
              emptyLabel={t`Todos los rieles`}
            />
            {railsFailed ? (
              <p role="alert" className="text-xs text-destructive">
                <Trans>No se pudo cargar el catálogo de rieles.</Trans>
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee-value">
              {form.mode === 'PERCENT' ? <Trans>Valor (%)</Trans> : <Trans>Valor</Trans>}
            </Label>
            <Input
              id="fee-value"
              inputMode="decimal"
              className="font-mono tabular-nums text-right"
              value={form.value}
              onChange={(event) => set('value', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee-min">
              <Trans>Mínimo (opcional)</Trans>
            </Label>
            <Input
              id="fee-min"
              inputMode="decimal"
              className="font-mono tabular-nums text-right"
              value={form.minAmount}
              onChange={(event) => set('minAmount', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee-max">
              <Trans>Máximo (opcional)</Trans>
            </Label>
            <Input
              id="fee-max"
              inputMode="decimal"
              className="font-mono tabular-nums text-right"
              value={form.maxAmount}
              onChange={(event) => set('maxAmount', event.target.value)}
            />
          </div>
          {form.mode === 'FIXED' ? (
            <div className="space-y-2 col-span-2">
              <Label htmlFor="fee-currency">
                <Trans>Moneda (opcional)</Trans>
              </Label>
              <OptionSelect
                id="fee-currency"
                value={form.currency}
                onChange={(value) => set('currency', value)}
                options={withCurrentValue(currencyOptions, form.currency)}
                placeholder={t`Sin especificar`}
                emptyLabel={t`Sin especificar`}
              />
            </div>
          ) : null}
        </div>

        {touched && error ? (
          <p role="alert" className="text-sm text-destructive">
            {messages[error]}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            <Trans>Cancelar</Trans>
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            <Trans>Crear</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
