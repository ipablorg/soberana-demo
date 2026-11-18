/**
 * CreateBeneficiaryForm
 *
 * Country -> rail -> fields. The user says where the money goes (country), how
 * (one of the rails the providers serve in that country) and then fills only
 * the fields that rail needs. Countries and rails come from `rails_catalogue`;
 * the field sets are one small component per rail family.
 *
 * The beneficiary is created at the provider and starts "En revisión"; it is
 * usable for sending only once the provider approves it.
 *
 * Pure form, no Dialog chrome. It is rendered by `CreateBeneficiaryDialog`
 * (the `/suite/beneficiaries` page) and inline by the dashboard SendFlow, so
 * the props are a stable contract: `onSuccess` receives the created row,
 * `onError` the already-mapped human message, `onCancel` closes the surface.
 */

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import { AlertCircle, Loader2 } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useAuth } from '@/shared/hooks/use-auth';
import { useCustomerProfile } from '@/shared/hooks/use-customer-profile';
import { useKycNextSteps } from '@/shared/hooks/use-kyc-next-steps';
import { useCreateBeneficiary, useCreateBeneficiaryFieldRequirements } from '@/shared/hooks/use-beneficiaries';
import type { BeneficiaryResponse } from '@/shared/lib/beneficiaries-api';
import { mapError } from '@/shared/lib/error-mapper';
import { cn } from '@/shared/lib/utils';

import { extractPrefill } from '@/modules/suite-user/features/dashboard/features/receive/external-account-form';

import { useRailCatalogue } from '../hooks/use-rail-catalogue';
import { isMaintenanceCode, isRailUnderMaintenance, readServerErrorCode } from '../lib/rail-maintenance';
import {
  buildSelfPrefill,
  clearSelfPrefill,
  fillSelfPrefill,
  mergeCustomerProfileIntoPrefill,
  type SelfPrefill,
} from '../lib/self-prefill';
import {
  countryLabel,
  payoutCountries,
  payoutRails,
  railFamily,
} from '../lib/rail-catalogue';
import {
  addressRequirements,
  buildRailPayload,
  EMPTY_RAIL_VALUES,
  hasSharedAddressBlock,
  mapMissingFields,
  validateRailForm,
  type RailErrorCode,
  type RailFieldName,
  type RailFormValues,
} from '../lib/rail-fields';

import {
  AddressFields,
  CommonFields,
  OptionalCommonFields,
  RAIL_FIELD_COMPONENTS,
  type RailFieldsContext,
} from './rail-fields';

export interface CreateBeneficiaryFormProps {
  /**
   * Called after a successful mutation with the created row so the parent can
   * auto-select / advance. The form never toasts: embedded in a flow a toast
   * would scroll off-panel.
   */
  onSuccess: (created: BeneficiaryResponse) => void;
  onError?: (message: string) => void;
  onCancel: () => void;
  submitLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Hides the title/description (a surrounding Dialog provides them). */
  hideHeader?: boolean;
  /** Hides the inline error banner (a surrounding Dialog toasts instead). */
  hideInlineError?: boolean;
  className?: string;
}

type FieldErrors = Partial<Record<RailFieldName, RailErrorCode>>;

const NO_FIELDS: ReadonlySet<RailFieldName> = new Set();

/** Name, tax id and the like survive a rail change; rail-specific data does not. */
function keepCommon(values: RailFormValues): RailFormValues {
  return {
    ...EMPTY_RAIL_VALUES,
    beneficiary_name: values.beneficiary_name,
    tax_id: values.tax_id,
    holder_type: values.holder_type,
    relationship: values.relationship,
    alias: values.alias,
  };
}

export function CreateBeneficiaryForm({
  onSuccess,
  onError,
  onCancel,
  submitLabel,
  cancelLabel,
  title,
  description,
  hideHeader = false,
  hideInlineError = false,
  className,
}: CreateBeneficiaryFormProps) {
  const { t } = useLingui();
  const { user } = useAuth();
  const catalogue = useRailCatalogue();
  const { snapshot: kycSnapshot } = useKycNextSteps();
  // What we already know about the customer. Only ever applied while the
  // beneficiary is the customer's own account (relationship = "Soy yo").
  const { profile } = useCustomerProfile();
  const selfPrefill = useMemo<SelfPrefill>(
    () =>
      buildSelfPrefill(
        extractPrefill(
          mergeCustomerProfileIntoPrefill(kycSnapshot?.prefill as Record<string, unknown> | null | undefined, profile),
        ),
      ),
    [kycSnapshot, profile],
  );
  const createMutation = useCreateBeneficiary();
  const fieldRequirements = useCreateBeneficiaryFieldRequirements();

  const [country, setCountry] = useState('');
  const [railCode, setRailCode] = useState('');
  const [values, setValues] = useState<RailFormValues>(EMPTY_RAIL_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [highlighted, setHighlighted] = useState<ReadonlySet<RailFieldName>>(NO_FIELDS);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const countries = useMemo(() => payoutCountries(catalogue.data), [catalogue.data]);
  const rails = useMemo(() => payoutRails(catalogue.data, country), [catalogue.data, country]);
  const rail = rails.find((candidate) => candidate.code === railCode);
  const family = railFamily(rail?.code);
  const RailFields = family ? RAIL_FIELD_COMPONENTS[family] : null;
  const isPending = createMutation.isPending;
  const requirementsData = fieldRequirements.data;
  const addressRequired = useMemo(
    () =>
      rail
        ? addressRequirements({
            requirements: requirementsData,
            railCode: rail.code,
            mestaServed: rail.providers.some((p) => p.code === 'mesta' && p.available),
          })
        : new Set<RailFieldName>(),
    [rail, requirementsData],
  );

  useEffect(() => {
    setValues((current) => fillSelfPrefill(current, selfPrefill));
  }, [selfPrefill]);

  const resetFeedback = () => {
    setErrors({});
    setHighlighted(NO_FIELDS);
    setSubmitError(null);
  };

  const handleCountryChange = (next: string) => {
    setCountry(next);
    const available = payoutRails(catalogue.data, next);
    const only = available.length === 1 ? available[0] : undefined;
    setRailCode(only && !isRailUnderMaintenance(only.code) ? only.code : '');
    setValues((current) => fillSelfPrefill(keepCommon(current), selfPrefill));
    resetFeedback();
  };

  const handleRailChange = (next: string) => {
    if (isRailUnderMaintenance(next)) return;
    setRailCode(next);
    setValues((current) => fillSelfPrefill(keepCommon(current), selfPrefill));
    resetFeedback();
  };

  const handleFieldChange = (field: RailFieldName, value: string) => {
    setValues((current) => {
      const next = { ...current, [field]: value };
      if (field !== 'relationship') return next;
      // My own account -> use what we know; someone else -> never from my data.
      return value === 'SELF' ? fillSelfPrefill(next, selfPrefill) : clearSelfPrefill(next, selfPrefill);
    });
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setHighlighted((current) => {
      if (!current.has(field)) return current;
      const next = new Set(current);
      next.delete(field);
      return next;
    });
  };

  const handleSave = () => {
    if (isPending || !rail || !family) return;

    const found = validateRailForm(family, values, addressRequired);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setSubmitError(t`Revisa los campos marcados antes de guardar.`);
      return;
    }

    if (!user?.customer_profile_id) {
      const message = t`No pudimos identificar tu perfil para guardar el beneficiario.`;
      setSubmitError(message);
      onError?.(message);
      return;
    }

    setSubmitError(null);
    createMutation.mutate(
      buildRailPayload({
        customerId: user.customer_profile_id,
        country,
        rail: { code: rail.code, currency: rail.currency },
        family,
        values,
      }),
      {
        onSuccess: (created) => {
          resetFeedback();
          setValues(EMPTY_RAIL_VALUES);
          onSuccess(created);
        },
        onError: (error) => {
          const mapped = mapError(error);
          if (isMaintenanceCode(readServerErrorCode(error))) {
            const message = t`Esta ruta está en mantenimiento. Pronto la habilitamos.`;
            setSubmitError(message);
            onError?.(message);
            return;
          }
          setSubmitError(mapped.message);
          setHighlighted(new Set(mapped.fields ? mapMissingFields(family, mapped.fields) : []));
          onError?.(mapped.message);
        },
      },
    );
  };

  const handleCancel = () => {
    resetFeedback();
    onCancel();
  };

  const handleFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter') return;
    const target = event.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.closest('button,[role="combobox"]')) return;
    event.preventDefault();
    handleSave();
  };

  const ctx: RailFieldsContext = {
    values,
    errors,
    highlighted,
    onChange: handleFieldChange,
    disabled: isPending,
  };

  const bannerError = hideInlineError ? null : submitError;

  return (
    <section aria-label={t`Formulario de beneficiario`} className={cn('flex flex-col gap-5', className)}>
      {!hideHeader && (
        <header className="shrink-0 space-y-1">
          <h2 className="text-base font-medium text-foreground">{title ?? <Trans>Agrega a alguien.</Trans>}</h2>
          <p className="text-sm text-muted-foreground">
            {description ?? (
              <Trans>Dinos a quién, a dónde y con qué datos. Lo guardamos para la próxima.</Trans>
            )}
          </p>
        </header>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-2 pb-1">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSave();
          }}
          onKeyDown={handleFormKeyDown}
          className="space-y-3 pl-0.5"
          noValidate
        >
          {catalogue.isLoading ? (
            <div data-testid="catalogue-loading" className="space-y-3">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          ) : catalogue.error ? (
            <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <Trans>No pudimos cargar los países y rutas disponibles. Inténtalo de nuevo en unos minutos.</Trans>
            </div>
          ) : countries.length === 0 ? (
            <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              <Trans>Todavía no hay países disponibles para enviar. Vuelve a intentarlo pronto.</Trans>
            </p>
          ) : (
            <>
              <div>
                <Label htmlFor="beneficiary-country">
                  <Trans>¿A qué país envías?</Trans> <span className="text-destructive">*</span>
                </Label>
                <Select value={country} onValueChange={handleCountryChange} disabled={isPending}>
                  <SelectTrigger id="beneficiary-country" className="h-11 rounded-lg">
                    <SelectValue placeholder={t`Selecciona un país`} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {countries.map((entry) => (
                      <SelectItem key={entry.country} value={entry.country}>
                        {countryLabel(entry.country)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {country && rails.length > 0 && (
                <div role="group" aria-label={t`Ruta`}>
                  <Label>
                    <Trans>¿Por cuál ruta?</Trans> <span className="text-destructive">*</span>
                  </Label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {rails.map((option) => {
                      const inMaintenance = isRailUnderMaintenance(option.code);
                      return (
                        <button
                          key={option.code}
                          type="button"
                          aria-pressed={option.code === railCode}
                          disabled={isPending || inMaintenance}
                          onClick={() => handleRailChange(option.code)}
                          className={cn(
                            'rounded-lg border px-3 py-2 text-sm transition-colors duration-150',
                            inMaintenance
                              ? 'cursor-not-allowed border-dashed border-border bg-transparent text-muted-foreground opacity-60'
                              : option.code === railCode
                                ? 'border-primary bg-primary/10 text-foreground'
                                : 'border-border bg-card text-muted-foreground hover:bg-muted',
                          )}
                        >
                          {option.name}
                          {inMaintenance && (
                            <>
                              {' '}
                              <span className="text-xs">
                                <Trans>En mantenimiento</Trans>
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {rail && !RailFields && (
                <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                  <Trans>Esta ruta todavía no se puede crear desde la app. Escríbenos y la activamos.</Trans>
                </p>
              )}

              {rail && RailFields && (
                <>
                  <CommonFields ctx={ctx} />
                  <RailFields ctx={ctx} />
                  {family && hasSharedAddressBlock(family) && <AddressFields ctx={ctx} required={addressRequired} />}
                  <OptionalCommonFields ctx={ctx} />
                  <p className="text-xs text-muted-foreground">
                    <Trans>
                      Al guardar, el proveedor revisa la cuenta. Aparece como En revisión y podrás enviarle dinero
                      cuando la aprueben.
                    </Trans>
                  </p>
                </>
              )}
            </>
          )}
        </form>

        {bannerError && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{bannerError}</span>
          </div>
        )}
      </div>

      <footer className="shrink-0 flex justify-end gap-2">
        <Button type="button" variant="outline" className="h-11 rounded-lg" onClick={handleCancel} disabled={isPending}>
          {cancelLabel ?? <Trans>Cancelar</Trans>}
        </Button>
        <Button
          type="button"
          variant="gradient"
          className="h-11 rounded-lg"
          onClick={handleSave}
          disabled={isPending || !RailFields}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel ?? <Trans>Guardar</Trans>}
        </Button>
      </footer>
    </section>
  );
}
