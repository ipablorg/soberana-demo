/**
 * "Completar datos y reintentar": asks ONLY the customer data the provider
 * reported missing, prefilled with what the platform already has, saves it and
 * retries the provider onboarding of the approved endorsement.
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type {
  AdminEndorsementOnboarding,
  AdminOnboardingMissingField,
} from '@/graphql/mutations/admin-loopay';
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
import { Skeleton } from '@/shared/components/ui/skeleton';

import { OptionSelect } from '../../../components/option-select';
import { iso3ForCountry, useCountryIso3Options } from '../../../lib/country-options';
import { withCurrentValue } from '../../platform-config/lib/catalog-options';
import { businessTypeOptions, employeeRangeOptions } from '../../commercial/lib/mesta-labels';
import {
  useProviderProfilePrefill,
  useRetryEndorsementOnboarding,
} from '../hooks/use-provider-onboarding-retry';
import {
  buildProviderProfileInput,
  editableProviderFields,
  incompleteProviderFields,
  otherMissingFields,
  providerProfileFormFrom,
  type ProviderProfileFieldKey,
  type ProviderProfileForm,
} from '../lib/provider-profile';
import { businessIndustryOptions } from '../lib/provider-industry-options';
import { groupProviderFields, providerFieldLabel } from '../lib/provider-profile-labels';

interface CompleteProviderProfileDialogProps {
  endorsementId: string;
  customerId: string;
  /** `missing_fields` of the onboarding outcome. */
  missingFields: readonly string[];
  /** Group and kind of each missing key; OPS_CHECKLIST items get no input. */
  missingFieldDetails?: readonly AdminOnboardingMissingField[];
  onClose: () => void;
  /**
   * Receives the new onboarding outcome after a retry the provider no longer
   * blocks (called after `onClose`). A retry that is still blocked keeps the
   * dialog open with what the provider still asks.
   */
  onRetried?: (onboarding: AdminEndorsementOnboarding) => void;
}

const ID_PREFIX = 'provider-profile';

/** The country select stores alpha-3 (what the backend keeps); KYB may carry alpha-2. */
function withIso3Country(form: ProviderProfileForm): ProviderProfileForm {
  const country = form.addressCountry.trim();
  if (country.length !== 2) return form;
  return { ...form, addressCountry: iso3ForCountry(country) ?? country.toUpperCase() };
}

interface FieldsProps {
  value: ProviderProfileForm;
  onChange: (next: ProviderProfileForm) => void;
  fields: readonly ProviderProfileFieldKey[];
  disabled: boolean;
}

function TextField({
  name,
  label,
  value,
  onChange,
  disabled,
  type = 'text',
  placeholder,
  hint,
}: {
  name: keyof ProviderProfileForm;
  label: string;
  value: string;
  onChange: (next: string) => void;
  disabled: boolean;
  type?: string;
  placeholder?: string;
  /** Short helper under the input. */
  hint?: string;
}) {
  const id = `${ID_PREFIX}-${name}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function ProviderProfileFields({ value, onChange, fields, disabled }: FieldsProps) {
  const { t } = useLingui();
  const set = (key: keyof ProviderProfileForm) => (next: string) =>
    onChange({ ...value, [key]: next });
  const show = (field: ProviderProfileFieldKey) => fields.includes(field);
  const label = (field: string) => providerFieldLabel(field, (d) => t(d));
  const countryOptions = useCountryIso3Options();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {show('phone') ? (
        <TextField
          name="phone"
          label={label('phone')}
          type="tel"
          placeholder="+573001112233"
          value={value.phone}
          onChange={set('phone')}
          disabled={disabled}
        />
      ) : null}
      {show('formationDate') ? (
        <TextField
          name="formationDate"
          label={label('formationDate')}
          type="date"
          value={value.formationDate}
          onChange={set('formationDate')}
          disabled={disabled}
        />
      ) : null}
      {show('businessType') ? (
        <div className="space-y-2">
          <Label htmlFor={`${ID_PREFIX}-businessType`}>{label('businessType')}</Label>
          <OptionSelect
            id={`${ID_PREFIX}-businessType`}
            value={value.businessType}
            onChange={set('businessType')}
            options={businessTypeOptions((d) => t(d))}
            placeholder={t`Selecciona un tipo`}
            disabled={disabled}
          />
        </div>
      ) : null}
      {show('registrationNumber') ? (
        <TextField
          name="registrationNumber"
          label={label('registrationNumber')}
          value={value.registrationNumber}
          onChange={set('registrationNumber')}
          disabled={disabled}
          hint={t`Número del registro mercantil, distinto del ID fiscal`}
        />
      ) : null}
      {show('numberOfEmployees') ? (
        <div className="space-y-2">
          <Label htmlFor={`${ID_PREFIX}-numberOfEmployees`}>{label('numberOfEmployees')}</Label>
          <OptionSelect
            id={`${ID_PREFIX}-numberOfEmployees`}
            value={value.numberOfEmployees}
            onChange={set('numberOfEmployees')}
            options={employeeRangeOptions()}
            placeholder={t`Selecciona un rango`}
            disabled={disabled}
          />
        </div>
      ) : null}
      {show('isFinancialInstitution') ? (
        <div className="space-y-2">
          <Label htmlFor={`${ID_PREFIX}-isFinancialInstitution`}>
            {label('isFinancialInstitution')}
          </Label>
          <OptionSelect
            id={`${ID_PREFIX}-isFinancialInstitution`}
            value={value.isFinancialInstitution}
            onChange={set('isFinancialInstitution')}
            options={[
              { value: 'no', label: t`No` },
              { value: 'yes', label: t`Sí` },
            ]}
            placeholder={t`Selecciona una opción`}
            disabled={disabled}
          />
        </div>
      ) : null}
      {show('businessIndustry') ? (
        <div className="space-y-2">
          <Label htmlFor={`${ID_PREFIX}-businessIndustry`}>{label('businessIndustry')}</Label>
          <OptionSelect
            id={`${ID_PREFIX}-businessIndustry`}
            value={value.businessIndustry}
            onChange={set('businessIndustry')}
            options={withCurrentValue(businessIndustryOptions((d) => t(d)), value.businessIndustry)}
            placeholder={t`Selecciona una industria`}
            disabled={disabled}
          />
        </div>
      ) : null}
      {show('website') ? (
        <>
          <TextField
            name="websiteUrl"
            label={t`Sitio web`}
            type="url"
            placeholder="https://"
            value={value.websiteUrl}
            onChange={set('websiteUrl')}
            disabled={disabled}
          />
          {value.websiteUrl.trim() === '' ? (
            <TextField
              name="websiteAbsenceReason"
              label={t`Motivo por el que no tiene sitio web`}
              value={value.websiteAbsenceReason}
              onChange={set('websiteAbsenceReason')}
              disabled={disabled}
            />
          ) : null}
        </>
      ) : null}
      {show('registeredAddress') ? (
        <>
          <div className="sm:col-span-2">
            <TextField
              name="addressStreet"
              label={t`Dirección de registro`}
              value={value.addressStreet}
              onChange={set('addressStreet')}
              disabled={disabled}
            />
          </div>
          <TextField
            name="addressCity"
            label={t`Ciudad`}
            value={value.addressCity}
            onChange={set('addressCity')}
            disabled={disabled}
          />
          <TextField
            name="addressState"
            label={t`Departamento o estado (opcional)`}
            value={value.addressState}
            onChange={set('addressState')}
            disabled={disabled}
          />
          <TextField
            name="addressPostalCode"
            label={t`Código postal (opcional)`}
            value={value.addressPostalCode}
            onChange={set('addressPostalCode')}
            disabled={disabled}
          />
          <div className="space-y-2">
            <Label htmlFor={`${ID_PREFIX}-addressCountry`}>
              <Trans>País (opcional)</Trans>
            </Label>
            <OptionSelect
              id={`${ID_PREFIX}-addressCountry`}
              value={value.addressCountry}
              onChange={set('addressCountry')}
              options={withCurrentValue(countryOptions, value.addressCountry)}
              placeholder={t`Selecciona un país`}
              emptyLabel={t`Sin país`}
              disabled={disabled}
            />
          </div>
        </>
      ) : null}
      {show('representativeName') ? (
        <>
          <TextField
            name="representativeFirstName"
            label={t`Nombre del representante legal`}
            value={value.representativeFirstName}
            onChange={set('representativeFirstName')}
            disabled={disabled}
          />
          <TextField
            name="representativeLastName"
            label={t`Apellido del representante legal`}
            value={value.representativeLastName}
            onChange={set('representativeLastName')}
            disabled={disabled}
          />
        </>
      ) : null}
    </div>
  );
}

function Body({
  initial,
  fields,
  others,
  checklist,
  isPending,
  failure,
  onClose,
  onSubmit,
}: {
  initial: ProviderProfileForm;
  fields: readonly ProviderProfileFieldKey[];
  others: readonly string[];
  /** `others` are OPS_CHECKLIST items (from the backend details), shown as a checklist. */
  checklist: boolean;
  isPending: boolean;
  /** Why the last retry failed; the dialog stays open to correct and retry. */
  failure: string | null;
  onClose: () => void;
  onSubmit: (form: ProviderProfileForm) => void;
}) {
  const { t } = useLingui();
  const [form, setForm] = useState(initial);
  const stillMissing = incompleteProviderFields(form, fields);

  return (
    <>
      {others.length > 0 ? (
        checklist ? (
          <div className="rounded-xl border border-border p-3 text-sm" data-testid="ops-checklist">
            <p className="font-medium">
              <Trans>Pendiente con el proveedor (lo gestiona Operaciones, sin campos aquí):</Trans>
            </p>
            <div className="mt-2 space-y-3">
              {groupProviderFields(others, (d) => t(d)).map((group) => (
                <div key={group.id}>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {group.title}
                  </p>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    {group.items.map((item) => (
                      <li key={item.key} className="flex items-center gap-2" title={item.key}>
                        <span
                          aria-hidden="true"
                          className="inline-block h-3.5 w-3.5 shrink-0 rounded-sm border border-muted-foreground/60"
                        />
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border p-3 text-sm" role="note">
            <p className="font-medium">
              <Trans>El proveedor también pide datos que se corrigen en el cliente:</Trans>
            </p>
            <ul className="mt-1 list-disc pl-5 text-muted-foreground">
              {others.map((field) => (
                <li key={field}>{providerFieldLabel(field, (d) => t(d))}</li>
              ))}
            </ul>
          </div>
        )
      ) : null}

      <ProviderProfileFields value={form} onChange={setForm} fields={fields} disabled={isPending} />

      {failure ? (
        <div
          className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm"
          role="alert"
        >
          <p className="font-medium text-destructive">
            <Trans>No se pudo reintentar el alta en el proveedor</Trans>
          </p>
          <p className="mt-1 text-muted-foreground">{failure}</p>
        </div>
      ) : null}

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          <Trans>Cancelar</Trans>
        </Button>
        <Button
          disabled={isPending || stillMissing.length > 0}
          onClick={() => onSubmit(form)}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          <Trans>Guardar y reintentar</Trans>
        </Button>
      </DialogFooter>
    </>
  );
}

export function CompleteProviderProfileDialog({
  endorsementId,
  customerId,
  missingFields,
  missingFieldDetails,
  onClose,
  onRetried,
}: CompleteProviderProfileDialogProps) {
  const { t } = useLingui();
  const { data, isLoading } = useProviderProfilePrefill(customerId);
  const [failure, setFailure] = useState<string | null>(null);
  // What is still missing: the props first, then each retry's answer.
  const [missing, setMissing] = useState({
    fields: missingFields,
    details: missingFieldDetails,
  });
  // Set when a retry ran but the provider still blocks (N-4): shown inline.
  const [stillAsked, setStillAsked] = useState<readonly string[] | null>(null);
  const retry = useRetryEndorsementOnboarding(
    (result) => {
      const onboarding = result.adminLoopay_retryEndorsementOnboarding;
      // A provider rejection keeps the dialog open with the reason (set by
      // `onFailed`) so the data can be corrected and retried.
      if (onboarding.state === 'FAILED') return;
      if (onboarding.missing_fields.length > 0) {
        setMissing({
          fields: onboarding.missing_fields,
          details: onboarding.missing_field_details ?? [],
        });
        setStillAsked(onboarding.missing_fields);
        return;
      }
      onClose();
      onRetried?.(onboarding);
    },
    (description) => setFailure(description),
  );
  const fields = editableProviderFields(missing.fields, missing.details);

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
            <Trans>Completar datos y reintentar</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Solo pedimos lo que el proveedor reportó como faltante; lo que la plataforma ya
              tiene viene precargado.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        {stillAsked ? (
          <div
            className="rounded-xl border border-border bg-muted/40 p-3 text-sm"
            role="status"
            data-testid="retry-still-blocked"
          >
            <p className="font-medium">
              <Trans>Reintento enviado. El proveedor todavía pide:</Trans>
            </p>
            <ul className="mt-1 list-disc pl-5 text-muted-foreground">
              {stillAsked.map((field) => (
                <li key={field}>{providerFieldLabel(field, (d) => t(d))}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (
          <Body
            // A still-blocked retry changes what is asked: start the form again.
            key={missing.fields.join(',')}
            initial={withIso3Country(providerProfileFormFrom(data?.adminLoopay_getCustomerKycData))}
            fields={fields}
            others={otherMissingFields(missing.fields, missing.details)}
            checklist={(missing.details?.length ?? 0) > 0}
            isPending={retry.isPending}
            failure={failure}
            onClose={onClose}
            onSubmit={(form) => {
              setFailure(null);
              retry.mutate({
                endorsementId,
                providerProfile: buildProviderProfileInput(form, fields),
              });
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
