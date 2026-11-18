/**
 * "Perfil de empresa para Mesta": the business (KYB) data Mesta requires and
 * the system does not hold yet. Controlled; the owner keeps the state. Name,
 * email, tax id and country are never asked here (they come from the client).
 */

import { Trans, useLingui } from '@lingui/react/macro';

import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { OptionSelect } from '../../../components/option-select';
import {
  MESTA_DIAL_CODES,
  MESTA_PROFILE_FIELD_ORDER,
  type MestaProfileFieldKey,
  type MestaProfileForm as MestaProfileFormState,
} from '../lib/mesta-profile';
import {
  businessTypeOptions,
  employeeRangeOptions,
  jurisdictionOptions,
  mestaFieldLabel,
  natureOfPaymentsOptions,
  sourceOfFundsOptions,
} from '../lib/mesta-labels';

interface MestaProfileFormProps {
  value: MestaProfileFormState;
  onChange: (next: MestaProfileFormState) => void;
  /** Prefix of every control id (unique per form on the page). */
  idPrefix: string;
  /** Fields to show; defaults to the whole profile. */
  fields?: readonly MestaProfileFieldKey[];
  disabled?: boolean;
}

interface CheckGroupProps {
  id: string;
  label: string;
  options: readonly { value: string; label: string }[];
  selected: readonly string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

function CheckGroup({ id, label, options, selected, onChange, disabled }: CheckGroupProps) {
  const toggle = (value: string, checked: boolean) =>
    onChange(checked ? [...selected, value] : selected.filter((entry) => entry !== value));

  return (
    <fieldset className="space-y-2 sm:col-span-2" id={id}>
      <legend className="text-sm font-medium">{label}</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={selected.includes(option.value)}
              onCheckedChange={(checked) => toggle(option.value, checked === true)}
              aria-label={option.label}
              disabled={disabled}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function MestaProfileForm({
  value,
  onChange,
  idPrefix,
  fields = MESTA_PROFILE_FIELD_ORDER,
  disabled,
}: MestaProfileFormProps) {
  const { t } = useLingui();
  const show = (key: MestaProfileFieldKey) => fields.includes(key);
  const set = <K extends keyof MestaProfileFormState>(key: K, next: MestaProfileFormState[K]) =>
    onChange({ ...value, [key]: next });
  const id = (key: string) => `${idPrefix}-${key}`;
  const label = (key: MestaProfileFieldKey) => mestaFieldLabel(key, (d) => t(d));
  const showAddress = show('addressStreet') || show('addressCity') || show('addressPostalCode');

  const yesNo = [
    { value: 'yes', label: t`Sí` },
    { value: 'no', label: t`No` },
  ];

  return (
    <fieldset className="space-y-4 rounded-xl border border-border p-4" data-testid="mesta-profile">
      <legend className="px-1 text-sm font-semibold">
        <Trans>Perfil de empresa para Mesta</Trans>
      </legend>
      <p className="text-xs text-muted-foreground">
        <Trans>
          Solo pedimos lo que el sistema aún no tiene. El nombre, correo, ID fiscal y país salen del
          cliente.
        </Trans>
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {show('phone') ? (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={id('phone')}>{label('phone')}</Label>
            <div className="flex gap-2">
              <OptionSelect
                id={id('dialCode')}
                className="w-28"
                value={value.dialCode}
                onChange={(next) => set('dialCode', next)}
                options={MESTA_DIAL_CODES.map((code) => ({ value: code, label: code }))}
                placeholder={t`Código`}
                disabled={disabled}
              />
              <Input
                id={id('phone')}
                type="tel"
                inputMode="tel"
                value={value.phoneNational}
                onChange={(event) => set('phoneNational', event.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        ) : null}

        {showAddress ? (
          <>
            {show('addressStreet') ? (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={id('addressStreet')}>{label('addressStreet')}</Label>
                <Input
                  id={id('addressStreet')}
                  value={value.addressStreet}
                  onChange={(event) => set('addressStreet', event.target.value)}
                  disabled={disabled}
                />
              </div>
            ) : null}
            {show('addressCity') ? (
              <div className="space-y-2">
                <Label htmlFor={id('addressCity')}>{label('addressCity')}</Label>
                <Input
                  id={id('addressCity')}
                  value={value.addressCity}
                  onChange={(event) => set('addressCity', event.target.value)}
                  disabled={disabled}
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor={id('addressState')}>
                <Trans>Departamento o estado (opcional)</Trans>
              </Label>
              <Input
                id={id('addressState')}
                value={value.addressState}
                onChange={(event) => set('addressState', event.target.value)}
                disabled={disabled}
              />
            </div>
            {show('addressPostalCode') ? (
              <div className="space-y-2">
                <Label htmlFor={id('addressPostalCode')}>{label('addressPostalCode')}</Label>
                <Input
                  id={id('addressPostalCode')}
                  value={value.addressPostalCode}
                  onChange={(event) => set('addressPostalCode', event.target.value)}
                  disabled={disabled}
                />
              </div>
            ) : null}
          </>
        ) : null}

        {show('registrationDate') ? (
          <div className="space-y-2">
            <Label htmlFor={id('registrationDate')}>{label('registrationDate')}</Label>
            <Input
              id={id('registrationDate')}
              type="date"
              value={value.registrationDate}
              onChange={(event) => set('registrationDate', event.target.value)}
              disabled={disabled}
            />
          </div>
        ) : null}

        {show('businessType') ? (
          <div className="space-y-2">
            <Label htmlFor={id('businessType')}>{label('businessType')}</Label>
            <OptionSelect
              id={id('businessType')}
              value={value.businessType}
              onChange={(next) => set('businessType', next)}
              options={businessTypeOptions((d) => t(d))}
              placeholder={t`Selecciona un tipo`}
              disabled={disabled}
            />
          </div>
        ) : null}

        {show('websiteAbsenceReason') ? (
          <>
            <div className="space-y-2">
              <Label htmlFor={id('websiteUrl')}>
                <Trans>Sitio web</Trans>
              </Label>
              <Input
                id={id('websiteUrl')}
                type="url"
                placeholder="https://"
                value={value.websiteUrl}
                onChange={(event) => set('websiteUrl', event.target.value)}
                disabled={disabled}
              />
            </div>
            {value.websiteUrl.trim() === '' ? (
              <div className="space-y-2">
                <Label htmlFor={id('websiteAbsenceReason')}>{label('websiteAbsenceReason')}</Label>
                <Input
                  id={id('websiteAbsenceReason')}
                  value={value.websiteAbsenceReason}
                  onChange={(event) => set('websiteAbsenceReason', event.target.value)}
                  disabled={disabled}
                />
              </div>
            ) : null}
          </>
        ) : null}

        {show('isFinancialInstitution') ? (
          <div className="space-y-2">
            <Label htmlFor={id('isFinancialInstitution')}>{label('isFinancialInstitution')}</Label>
            <OptionSelect
              id={id('isFinancialInstitution')}
              value={value.isFinancialInstitution}
              onChange={(next) =>
                set('isFinancialInstitution', next === 'yes' || next === 'no' ? next : '')
              }
              options={yesNo}
              placeholder={t`Selecciona una opción`}
              disabled={disabled}
            />
          </div>
        ) : null}

        {show('numberOfEmployees') ? (
          <div className="space-y-2">
            <Label htmlFor={id('numberOfEmployees')}>{label('numberOfEmployees')}</Label>
            <OptionSelect
              id={id('numberOfEmployees')}
              value={value.numberOfEmployees}
              onChange={(next) => set('numberOfEmployees', next)}
              options={employeeRangeOptions()}
              placeholder={t`Selecciona un rango`}
              disabled={disabled}
            />
          </div>
        ) : null}

        {show('expectedMonthlyVolumeEstimate') ? (
          <div className="space-y-2">
            <Label htmlFor={id('expectedMonthlyVolumeEstimate')}>
              {label('expectedMonthlyVolumeEstimate')}
            </Label>
            <Input
              id={id('expectedMonthlyVolumeEstimate')}
              type="number"
              inputMode="decimal"
              min={1}
              className="font-mono tabular-nums text-right"
              value={value.expectedMonthlyVolumeEstimate}
              onChange={(event) => set('expectedMonthlyVolumeEstimate', event.target.value)}
              disabled={disabled}
            />
          </div>
        ) : null}

        {show('averageTransactionSize') ? (
          <div className="space-y-2">
            <Label htmlFor={id('averageTransactionSize')}>{label('averageTransactionSize')}</Label>
            <Input
              id={id('averageTransactionSize')}
              type="number"
              inputMode="decimal"
              min={1}
              className="font-mono tabular-nums text-right"
              value={value.averageTransactionSize}
              onChange={(event) => set('averageTransactionSize', event.target.value)}
              disabled={disabled}
            />
          </div>
        ) : null}

        {show('sourceOfFunds') ? (
          <div className="space-y-2">
            <Label htmlFor={id('sourceOfFunds')}>{label('sourceOfFunds')}</Label>
            <OptionSelect
              id={id('sourceOfFunds')}
              value={value.sourceOfFunds}
              onChange={(next) => set('sourceOfFunds', next)}
              options={sourceOfFundsOptions((d) => t(d))}
              placeholder={t`Selecciona el origen`}
              disabled={disabled}
            />
          </div>
        ) : null}

        {show('primaryCounterpartyJurisdictions') ? (
          <CheckGroup
            id={id('primaryCounterpartyJurisdictions')}
            label={label('primaryCounterpartyJurisdictions')}
            options={jurisdictionOptions((d) => t(d))}
            selected={value.primaryCounterpartyJurisdictions}
            onChange={(next) => set('primaryCounterpartyJurisdictions', next)}
            disabled={disabled}
          />
        ) : null}

        {show('natureOfPayments') ? (
          <CheckGroup
            id={id('natureOfPayments')}
            label={label('natureOfPayments')}
            options={natureOfPaymentsOptions((d) => t(d))}
            selected={value.natureOfPayments}
            onChange={(next) => set('natureOfPayments', next)}
            disabled={disabled}
          />
        ) : null}
      </div>
    </fieldset>
  );
}
