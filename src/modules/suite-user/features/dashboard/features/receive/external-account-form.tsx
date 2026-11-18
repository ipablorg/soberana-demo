/**
 * ExternalAccountForm
 *
 * Inline, rail-specific form rendered inside the receive "Próximos pasos"
 * card when the KYC snapshot's `next_step.code === 'external_account'`.
 *
 * It shows ONLY the fields the rail actually needs (per Bridge's external
 * account contract) plus the two fields our own system always requires
 * (`relationship`, `alias`). Identity/address data the customer already
 * gave us is prefilled from the snapshot's `prefill` blob — but stays
 * visible so the user can review it.
 *
 * Silent (auto-derived, never shown): `holder_type` (from customer_type),
 * `beneficiary_name` (from first/last), `tax_id` (from prefill), and the
 * rail's fixed `country`/`payment_rail`/`type`.
 *
 * On submit it builds a `CreateBeneficiaryPayload` and posts through the
 * existing `useCreateBeneficiary` hook — the SAME mutation the send flow
 * uses. No backend contract is changed. After a successful create the
 * parent is expected to refetch the KYC snapshot so `next_step` clears.
 *
 * NOTE on boundaries: `receive` is a child of the `dashboard` feature and
 * ESLint forbids it from importing the sibling `beneficiaries` feature, so
 * the field matrix + payload builder are duplicated here (not imported).
 * The shared data layer (`useCreateBeneficiary`, `CreateBeneficiaryPayload`)
 * lives in `@/shared/` and IS reachable.
 */
import { useMemo, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  Controller,
  useForm,
  useWatch,
} from 'react-hook-form';
import { AlertCircle, CheckCircle2, Loader2 } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useAuth } from '@/shared/hooks/use-auth';
import { useCreateBeneficiary } from '@/shared/hooks/use-beneficiaries';
import type { CreateBeneficiaryPayload } from '@/shared/lib/beneficiaries-api';
import { mapError } from '@/shared/lib/error-mapper';
import { cn } from '@/shared/lib/utils';

export type ExternalAccountRail =
  | 'ach_wire'
  | 'sepa'
  | 'spei'
  | 'pix'
  | 'faster_payments';

type Register = UseFormRegister<FormValues>;
type FormErrors = FieldErrors<FormValues>;

const RAIL_COUNTRY: Record<ExternalAccountRail, string> = {
  ach_wire: 'USA',
  sepa: 'ESP',
  spei: 'MEX',
  pix: 'BRA',
  faster_payments: 'GBR',
};

const RAIL_LABELS: Record<ExternalAccountRail, string> = {
  ach_wire: 'ACH / Wire (USD)',
  sepa: 'SEPA',
  spei: 'SPEI (MXN)',
  pix: 'PIX',
  faster_payments: 'Faster Payments (GBP)',
};

/** SEPA countries supported by the existing send-flow contract. */
const SEPA_COUNTRY_OPTIONS: ReadonlyArray<{ code: string; label: string }> = [
  { code: 'ESP', label: 'España' },
  { code: 'DEU', label: 'Alemania' },
  { code: 'FRA', label: 'Francia' },
  { code: 'NLD', label: 'Países Bajos' },
];

/* ------------------------------------------------------------------ */
/* Prefill extraction                                                  */
/* ------------------------------------------------------------------ */

export interface PrefillData {
  first_name: string;
  last_name: string;
  customer_type: string;
  email: string;
  tax_id: string;
  /** Single-string customer name (used by pix, which has no first/last). */
  ownerName: string;
  address: {
    street_line_1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

function toStr(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * The backend serializes the snapshot `prefill` as an opaque JSON scalar,
 * so its exact shape isn't typed. This coerces defensively — reading both
 * flat keys (`prefill.first_name`) and a nested `address` object, and
 * falling back to '' everywhere. Never throws.
 */
export function extractPrefill(
  raw: Record<string, unknown> | null | undefined,
): PrefillData {
  const empty: PrefillData = {
    first_name: '',
    last_name: '',
    customer_type: '',
    email: '',
    tax_id: '',
    ownerName: '',
    address: { street_line_1: '', city: '', state: '', postal_code: '', country: '' },
  };
  if (!raw || typeof raw !== 'object') return empty;

  const r = raw as Record<string, unknown>;
  const addrRaw =
    r.address && typeof r.address === 'object' ? (r.address as Record<string, unknown>) : {};

  const firstName = toStr(r.first_name);
  const lastName = toStr(r.last_name);

  return {
    first_name: firstName,
    last_name: lastName,
    customer_type: toStr(r.customer_type),
    email: toStr(r.email),
    tax_id: toStr(r.tax_id),
    ownerName:
      toStr(r.owner_name) ||
      // A business account holder is the legal entity, never its contact person.
      (toStr(r.customer_type).toLowerCase() === 'business' ? toStr(r.business_name) : '') ||
      `${firstName} ${lastName}`.trim() ||
      toStr(r.business_name) ||
      toStr(r.name),
    address: {
      street_line_1:
        toStr(r.street_line_1) ||
        toStr(r.address_line_1) ||
        toStr(addrRaw.street_line_1) ||
        toStr(addrRaw.street) ||
        toStr(addrRaw.address_line_1) ||
        toStr(addrRaw.line1),
      city: toStr(r.city) || toStr(addrRaw.city) || toStr(addrRaw.locality),
      state: toStr(r.state) || toStr(addrRaw.state) || toStr(addrRaw.region),
      postal_code:
        toStr(r.postal_code) ||
        toStr(r.zip) ||
        toStr(addrRaw.postal_code) ||
        toStr(addrRaw.zip),
      country: toStr(r.country) || toStr(addrRaw.country),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Form values + payload                                               */
/* ------------------------------------------------------------------ */

interface FormValues {
  first_name: string;
  last_name: string;
  owner_name: string;
  bank_name: string;
  routing_number: string;
  account_number: string;
  account_type: 'checking' | 'savings';
  iban: string;
  bic: string;
  sepa_country: string;
  clabe: string;
  sort_code: string;
  pix_mode: 'pix_key' | 'br_code';
  pix_value: string;
  document_number: string;
  street_line_1: string;
  city: string;
  state: string;
  postal_code: string;
  relationship: 'self' | 'spouse' | 'other';
  alias: string;
}

function defaultAlias(rail: ExternalAccountRail): string {
  switch (rail) {
    case 'ach_wire':
      return 'Cuenta USD';
    case 'sepa':
      return 'Cuenta SEPA';
    case 'spei':
      return 'Cuenta MXN';
    case 'pix':
      return 'Cuenta PIX';
    case 'faster_payments':
      return 'Cuenta GBP';
  }
}

function buildDefaults(rail: ExternalAccountRail, prefill: PrefillData): FormValues {
  return {
    first_name: prefill.first_name,
    last_name: prefill.last_name,
    owner_name: prefill.ownerName,
    bank_name: '',
    routing_number: '',
    account_number: '',
    account_type: 'checking',
    iban: '',
    bic: '',
    sepa_country:
      prefill.address.country && prefill.address.country.length === 3
        ? prefill.address.country.toUpperCase()
        : 'ESP',
    clabe: '',
    sort_code: '',
    pix_mode: 'pix_key',
    pix_value: '',
    document_number: prefill.tax_id,
    street_line_1: prefill.address.street_line_1,
    city: prefill.address.city,
    state: prefill.address.state,
    postal_code: prefill.address.postal_code,
    relationship: 'self',
    alias: defaultAlias(rail),
  };
}

function holderTypeFromPrefill(prefill: PrefillData): 'INDIVIDUAL' | 'BUSINESS' {
  return prefill.customer_type.toLowerCase() === 'business' ? 'BUSINESS' : 'INDIVIDUAL';
}

/**
 * Maps the rail-specific form values onto the existing
 * `CreateBeneficiaryPayload` contract (the same shape the send flow uses).
 * Silent fields (`holder_type`, `tax_id`, fixed `country`/`payment_rail`)
 * are derived here and never surface in the UI.
 */
function buildPayload(
  rail: ExternalAccountRail,
  values: FormValues,
  customerId: string,
  prefill: PrefillData,
): CreateBeneficiaryPayload {
  const safeTrim = (value: unknown): string =>
    typeof value === 'string' ? value.trim() : '';

  const relationshipMap: Record<FormValues['relationship'], string> = {
    self: 'SELF',
    spouse: 'FAMILY',
    other: 'OTHER',
  };
  const relationship = relationshipMap[values.relationship ?? 'self'];
  const alias = safeTrim(values.alias) || undefined;
  const holderType = holderTypeFromPrefill(prefill);
  const silentTaxId = safeTrim(prefill.tax_id) || safeTrim(prefill.email);
  const firstName = safeTrim(values.first_name);
  const lastName = safeTrim(values.last_name);
  const ownerName = `${firstName} ${lastName}`.trim();

  const base = {
    customer_id: customerId,
    tax_id: silentTaxId,
    holder_type: holderType,
    relationship,
    alias,
  } satisfies Partial<CreateBeneficiaryPayload>;

  switch (rail) {
    case 'ach_wire':
      return {
        ...base,
        type: 'BANK_ACCOUNT',
        country: RAIL_COUNTRY.ach_wire,
        payment_rail: 'ach_wire',
        beneficiary_name: ownerName,
        bank_name: safeTrim(values.bank_name),
        routing_number: safeTrim(values.routing_number),
        account_number_us: safeTrim(values.account_number),
        account_type: values.account_type,
        address_line_1: safeTrim(values.street_line_1),
        city: safeTrim(values.city),
        state: safeTrim(values.state).toUpperCase(),
        postal_code: safeTrim(values.postal_code),
      };

    case 'sepa': {
      const payload: CreateBeneficiaryPayload = {
        ...base,
        type: 'BANK_ACCOUNT',
        country: values.sepa_country || RAIL_COUNTRY.sepa,
        payment_rail: 'sepa',
        beneficiary_name: ownerName,
        bank_name: safeTrim(values.bank_name),
        iban: safeTrim(values.iban).replace(/\s+/g, ''),
        address_line_1: safeTrim(values.street_line_1),
        city: safeTrim(values.city),
        postal_code: safeTrim(values.postal_code),
      };
      const bic = safeTrim(values.bic).toUpperCase();
      if (bic) payload.bic = bic;
      return payload;
    }

    case 'spei':
      return {
        ...base,
        type: 'BANK_ACCOUNT',
        country: RAIL_COUNTRY.spei,
        payment_rail: 'spei',
        beneficiary_name: ownerName,
        bank_name: safeTrim(values.bank_name),
        clabe: safeTrim(values.clabe),
        address_line_1: safeTrim(values.street_line_1),
        city: safeTrim(values.city),
        state: safeTrim(values.state),
        postal_code: safeTrim(values.postal_code),
      };

    case 'pix':
      return {
        ...base,
        type: 'PIX',
        country: RAIL_COUNTRY.pix,
        payment_rail: 'pix',
        // tax_id takes the optional CPF/CNPJ the user typed, else the silent one.
        tax_id: safeTrim(values.document_number) || silentTaxId,
        beneficiary_name: safeTrim(values.owner_name),
        bank_name: safeTrim(values.bank_name),
        pix_key: safeTrim(values.pix_value),
      };

    case 'faster_payments':
      return {
        ...base,
        type: 'BANK_ACCOUNT',
        country: RAIL_COUNTRY.faster_payments,
        payment_rail: 'faster_payments',
        beneficiary_name: ownerName,
        bank_name: safeTrim(values.bank_name),
        sort_code: safeTrim(values.sort_code),
        account_number: safeTrim(values.account_number),
      };
  }
}

/* ------------------------------------------------------------------ */
/* Tiny presentational helpers (kept local to avoid a new file)        */
/* ------------------------------------------------------------------ */

function RequiredMark() {
  return <span className="text-destructive">*</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

function FieldHelp({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-muted-foreground">{children}</p>;
}

function TextField(props: {
  id: string;
  label: React.ReactNode;
  required?: boolean;
  placeholder?: string;
  inputMode?: 'numeric' | 'text';
  maxLength?: number;
  mono?: boolean;
  uppercase?: boolean;
  error?: string;
  registration: ReturnType<Register>;
}) {
  const {
    id,
    label,
    required,
    placeholder,
    inputMode,
    maxLength,
    mono,
    uppercase,
    error,
    registration,
  } = props;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label} {required ? <RequiredMark /> : null}
      </Label>
      <Input
        id={id}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        className={cn(
          'h-11 rounded-lg',
          mono && 'font-mono tabular-nums',
          uppercase && 'uppercase',
          error && 'border-destructive focus-visible:ring-destructive',
        )}
        {...registration}
      />
      {error ? <FieldError message={error} /> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export interface ExternalAccountFormProps {
  rail: ExternalAccountRail;
  /** Raw snapshot.prefill blob — coerced defensively inside. */
  prefill?: Record<string, unknown> | null;
  /**
   * Called after a successful create. The parent should refetch the KYC
   * snapshot so `next_step` re-evaluates (and this card unmounts when the
   * external-account requirement is satisfied).
   */
  onSuccess?: () => void;
  className?: string;
}

export function ExternalAccountForm({
  rail,
  prefill,
  onSuccess,
  className,
}: ExternalAccountFormProps) {
  const { t } = useLingui();
  const { user } = useAuth();
  const createMutation = useCreateBeneficiary();
  const [succeeded, setSucceeded] = useState(false);

  const prefillData = useMemo(() => extractPrefill(prefill), [prefill]);
  const defaults = useMemo(() => buildDefaults(rail, prefillData), [rail, prefillData]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: defaults,
    mode: 'onChange',
    shouldUnregister: true,
  });

  const onSubmit = (values: FormValues) => {
    const customerId = user?.customer_profile_id;
    if (!customerId) return;

    const payload = buildPayload(rail, values, customerId, prefillData);
    createMutation.mutate(payload, {
      onSuccess: () => {
        setSucceeded(true);
        onSuccess?.();
      },
    });
  };

  const mutationError = createMutation.error ? mapError(createMutation.error).message : null;
  const isPending = createMutation.isPending;

  /* ---- Success state ------------------------------------------------ */
  if (succeeded && !mutationError) {
    return (
      <div
        role="status"
        className={cn(
          'flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4',
          className,
        )}
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            <Trans>Cuenta agregada</Trans>
          </p>
          <p className="text-xs text-muted-foreground">
            <Trans>Estamos actualizando tus rails. Vuelve en un momento.</Trans>
          </p>
        </div>
      </div>
    );
  }

  /* ---- Form --------------------------------------------------------- */
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label={t`Datos de la cuenta`}
      className={cn('space-y-3', className)}
    >
      <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
        <p className="text-xs text-muted-foreground">
          <Trans>
            Agrega una cuenta para {RAIL_LABELS[rail]} y completa tu recepción.
          </Trans>
        </p>
      </div>

      {rail === 'pix' ? (
        <PixRailFields register={register} control={control} errors={errors} t={t} />
      ) : (
        <BankRailFields
          rail={rail}
          register={register}
          control={control}
          errors={errors}
          t={t}
        />
      )}

      {/* Address block — only for rails that require it. */}
      {(rail === 'ach_wire' || rail === 'sepa' || rail === 'spei') && (
        <AddressFields rail={rail} register={register} errors={errors} t={t} />
      )}

      {/* Always-visible system fields. */}
      <div>
        <Label htmlFor="ext-alias">
          <Trans>Alias</Trans>
        </Label>
        <Input
          id="ext-alias"
          className={cn('mt-1.5 h-11 rounded-lg')}
          {...register('alias')}
        />
        <FieldHelp>
          <Trans>Nombre corto para identificar esta cuenta.</Trans>
        </FieldHelp>
      </div>

      <Controller
        control={control}
        name="relationship"
        render={({ field }) => (
          <div className="space-y-1.5">
            <Label htmlFor="ext-relationship">
              <Trans>Relación</Trans>
            </Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="h-11 rounded-lg" id="ext-relationship">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="self">
                  <Trans>Propia</Trans>
                </SelectItem>
                <SelectItem value="spouse">
                  <Trans>Cónyuge</Trans>
                </SelectItem>
                <SelectItem value="other">
                  <Trans>Otro</Trans>
                </SelectItem>
              </SelectContent>
            </Select>
            <FieldHelp>
              <Trans>¿De quién es esta cuenta? Por defecto, propia.</Trans>
            </FieldHelp>
          </div>
        )}
      />

      {mutationError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{mutationError}</span>
        </div>
      )}

      <Button
        type="submit"
        variant="gradient"
        className="h-11 w-full rounded-lg"
        disabled={isPending || !isValid}
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        <Trans>Guardar cuenta</Trans>
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Per-rail field blocks                                               */
/* ------------------------------------------------------------------ */

interface RailProps {
  register: Register;
  control: Control<FormValues>;
  errors: FormErrors;
  t: ReturnType<typeof useLingui>['t'];
}

/** Name + bank + bank-specific fields for the four bank-account rails. */
function BankRailFields({ rail, register, control, errors, t }: RailProps & { rail: ExternalAccountRail }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="ext-first-name"
          label={<Trans>Nombre</Trans>}
          required
          placeholder={t`Nombre`}
          error={errors.first_name?.message}
          registration={register('first_name', { required: t`El nombre es obligatorio` })}
        />
        <TextField
          id="ext-last-name"
          label={<Trans>Apellido</Trans>}
          required
          placeholder={t`Apellido`}
          error={errors.last_name?.message}
          registration={register('last_name', { required: t`El apellido es obligatorio` })}
        />
      </div>

      <TextField
        id="ext-bank-name"
        label={<Trans>Banco</Trans>}
        required
        placeholder={t`Nombre del banco`}
        error={errors.bank_name?.message}
        registration={register('bank_name', { required: t`El banco es obligatorio` })}
      />

      {rail === 'ach_wire' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              id="ext-routing"
              label={<Trans>Routing Number</Trans>}
              required
              placeholder={t`9 dígitos`}
              inputMode="numeric"
              maxLength={9}
              mono
              error={errors.routing_number?.message}
              registration={register('routing_number', {
                required: t`El Routing Number es obligatorio`,
                pattern: { value: /^\d{9}$/, message: t`Debe tener exactamente 9 dígitos` },
              })}
            />
            <TextField
              id="ext-account-us"
              label={<Trans>Número de cuenta</Trans>}
              required
              placeholder={t`Número de cuenta`}
              inputMode="numeric"
              mono
              error={errors.account_number?.message}
              registration={register('account_number', {
                required: t`El número de cuenta es obligatorio`,
              })}
            />
          </div>
          <Controller
            control={control}
            name="account_type"
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>
                  <Trans>Tipo de cuenta</Trans> <RequiredMark />
                </Label>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex gap-4 pt-1"
                >
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                    <RadioGroupItem value="checking" id="ext-checking" />
                    <Trans>Checking</Trans>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                    <RadioGroupItem value="savings" id="ext-savings" />
                    <Trans>Savings</Trans>
                  </label>
                </RadioGroup>
                <FieldHelp>
                  <Trans>Indica si la cuenta es corriente (checking) o de ahorros (savings).</Trans>
                </FieldHelp>
              </div>
            )}
          />
        </>
      )}

      {rail === 'sepa' && (
        <>
          <Controller
            control={control}
            name="sepa_country"
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label htmlFor="ext-sepa-country">
                  <Trans>País del IBAN</Trans> <RequiredMark />
                </Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11 rounded-lg" id="ext-sepa-country">
                    <SelectValue placeholder={t`Selecciona un país`} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {SEPA_COUNTRY_OPTIONS.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldHelp>
                  <Trans>El país de la cuenta bancaria (SEPA).</Trans>
                </FieldHelp>
              </div>
            )}
          />
          <TextField
            id="ext-iban"
            label={<Trans>IBAN</Trans>}
            required
            placeholder={t`Ej: ES91 2100 0418 4502 0005 1332`}
            mono
            error={errors.iban?.message}
            registration={register('iban', {
              required: t`El IBAN es obligatorio`,
              pattern: {
                value: /^[A-Z]{2}\d{2}[A-Z0-9 ]{10,34}$/i,
                message: t`Formato de IBAN inválido`,
              },
            })}
          />
          <TextField
            id="ext-bic"
            label={
              <span>
                <Trans>BIC / SWIFT</Trans>{' '}
                <span className="text-xs text-muted-foreground">
                  (<Trans>opcional</Trans>)
                </span>
              </span>
            }
            placeholder={t`Ej: CAIXESBBXXX`}
            mono
            uppercase
            error={errors.bic?.message}
            registration={register('bic')}
          />
        </>
      )}

      {rail === 'spei' && (
        <TextField
          id="ext-clabe"
          label={<Trans>CLABE</Trans>}
          required
          placeholder={t`18 dígitos`}
          inputMode="numeric"
          maxLength={18}
          mono
          error={errors.clabe?.message}
          registration={register('clabe', {
            required: t`La CLABE es obligatoria`,
            pattern: { value: /^\d{18}$/, message: t`La CLABE debe tener exactamente 18 dígitos` },
          })}
        />
      )}

      {rail === 'faster_payments' && (
        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="ext-sort-code"
            label={<Trans>Sort Code</Trans>}
            required
            placeholder={t`Ej: 12-34-56`}
            inputMode="numeric"
            maxLength={8}
            mono
            error={errors.sort_code?.message}
            registration={register('sort_code', {
              required: t`El Sort Code es obligatorio`,
              pattern: {
                value: /^\d{2}-?\d{2}-?\d{2}$/,
                message: t`Debe tener 6 dígitos (ej: 12-34-56)`,
              },
            })}
          />
          <TextField
            id="ext-account-uk"
            label={<Trans>Número de cuenta</Trans>}
            required
            placeholder={t`8 dígitos`}
            inputMode="numeric"
            maxLength={8}
            mono
            error={errors.account_number?.message}
            registration={register('account_number', {
              required: t`El número de cuenta es obligatorio`,
              pattern: { value: /^\d{8}$/, message: t`Debe tener exactamente 8 dígitos` },
            })}
          />
        </div>
      )}
    </>
  );
}

/** Pix fields: owner name, bank, key type radio, key, optional document. */
function PixRailFields({ register, control, errors, t }: RailProps) {
  const pixMode = useWatch({ control, name: 'pix_mode' });
  const isBrCode = pixMode === 'br_code';
  return (
    <>
      <TextField
        id="ext-owner-name"
        label={<Trans>Titular</Trans>}
        required
        placeholder={t`Nombre del titular`}
        error={errors.owner_name?.message}
        registration={register('owner_name', { required: t`El titular es obligatorio` })}
      />
      <TextField
        id="ext-pix-bank"
        label={<Trans>Banco</Trans>}
        required
        placeholder={t`Nombre del banco`}
        error={errors.bank_name?.message}
        registration={register('bank_name', { required: t`El banco es obligatorio` })}
      />

      <Controller
        control={control}
        name="pix_mode"
        render={({ field }) => (
          <div className="space-y-1.5">
            <Label>
              <Trans>Tipo de clave</Trans>
            </Label>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="flex gap-4 pt-1"
            >
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <RadioGroupItem value="pix_key" id="ext-pix-key" />
                <Trans>Pix Key</Trans>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <RadioGroupItem value="br_code" id="ext-br-code" />
                <Trans>BR Code</Trans>
              </label>
            </RadioGroup>
          </div>
        )}
      />

      <TextField
        id="ext-pix-value"
        label={isBrCode ? <Trans>BR Code</Trans> : <Trans>Pix Key</Trans>}
        required
        placeholder={
          isBrCode ? t`Código BR Code` : t`Email, teléfono, CPF o llave aleatoria`
        }
        error={errors.pix_value?.message}
        registration={register('pix_value', { required: t`Este campo es obligatorio` })}
      />

      <TextField
        id="ext-document"
        label={
          <span>
            <Trans>CPF / CNPJ</Trans>{' '}
            <span className="text-xs text-muted-foreground">
              (<Trans>opcional</Trans>)
            </span>
          </span>
        }
        placeholder={t`Ej: 123.456.789-00`}
        mono
        error={errors.document_number?.message}
        registration={register('document_number')}
      />
    </>
  );
}

/** Address block for ach_wire / sepa / spei (prefilled, user confirms). */
function AddressFields({
  rail,
  register,
  errors,
  t,
}: {
  rail: ExternalAccountRail;
  register: Register;
  errors: FormErrors;
  t: ReturnType<typeof useLingui>['t'];
}) {
  const needsState = rail === 'ach_wire' || rail === 'spei';
  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <p className="text-xs font-medium text-muted-foreground">
        <Trans>Dirección del titular</Trans>
      </p>
      <TextField
        id="ext-street"
        label={<Trans>Calle y número</Trans>}
        required
        placeholder={t`Calle y número`}
        error={errors.street_line_1?.message}
        registration={register('street_line_1', { required: t`La dirección es obligatoria` })}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="ext-city"
          label={<Trans>Ciudad</Trans>}
          required
          placeholder={t`Ciudad`}
          error={errors.city?.message}
          registration={register('city', { required: t`La ciudad es obligatoria` })}
        />
        {needsState ? (
          <TextField
            id="ext-state"
            label={<Trans>Estado</Trans>}
            required
            placeholder={rail === 'ach_wire' ? t`Ej: FL` : t`Estado`}
            maxLength={rail === 'ach_wire' ? 2 : undefined}
            uppercase={rail === 'ach_wire'}
            error={errors.state?.message}
            registration={
              rail === 'ach_wire'
                ? register('state', {
                    required: t`El estado es obligatorio`,
                    pattern: { value: /^[A-Za-z]{2}$/, message: t`Usa 2 letras` },
                  })
                : register('state', { required: t`El estado es obligatorio` })
            }
          />
        ) : null}
      </div>
      <TextField
        id="ext-postal"
        label={<Trans>Código postal</Trans>}
        required
        placeholder={t`Código postal`}
        inputMode="numeric"
        mono
        maxLength={rail === 'ach_wire' ? 10 : undefined}
        error={errors.postal_code?.message}
        registration={
          rail === 'ach_wire'
            ? register('postal_code', {
                required: t`El código postal es obligatorio`,
                pattern: { value: /^\d{5}(-\d{4})?$/, message: t`Formato ZIP: 12345` },
              })
            : register('postal_code', { required: t`El código postal es obligatorio` })
        }
      />
    </div>
  );
}
