/**
 * Shared building blocks for the per-rail field sets: a labelled text input and
 * a labelled select that show the validation error, and a highlight ring for
 * fields the back reported as missing (`BENEFICIARY_PROVIDER_FIELDS_MISSING`).
 */

import { useLingui } from '@lingui/react/macro';

import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/utils';

import type { RailErrorCode, RailFieldName, RailFormValues } from '../../lib/rail-fields';

export interface RailFieldsContext {
  values: RailFormValues;
  errors: Partial<Record<RailFieldName, RailErrorCode>>;
  /** Fields the provider asked for; rendered with the error ring. */
  highlighted: ReadonlySet<RailFieldName>;
  onChange: (field: RailFieldName, value: string) => void;
  disabled?: boolean;
}

export interface RailFieldsProps {
  ctx: RailFieldsContext;
}

/** Localised sentence for a validation code. */
export function useRailErrorText(): (code: RailErrorCode | undefined) => string | undefined {
  const { t } = useLingui();
  return (code) => {
    switch (code) {
      case undefined:
        return undefined;
      case 'required':
        return t`Este dato es obligatorio.`;
      case 'routing_number':
        return t`El routing number tiene 9 dígitos.`;
      case 'account_number':
        return t`Revisa el número de cuenta.`;
      case 'state':
        return t`Usa las 2 letras del estado, por ejemplo FL.`;
      case 'postal_code':
        return t`Código postal de 5 dígitos, por ejemplo 33101.`;
      case 'bic':
        return t`El BIC/SWIFT tiene 8 u 11 caracteres.`;
      case 'iban':
        return t`El IBAN no parece válido. Revisa el formato.`;
      case 'iban_or_account':
        return t`Indica el IBAN o el número de cuenta.`;
      case 'clabe':
        return t`La CLABE tiene exactamente 18 dígitos.`;
      case 'sort_code':
        return t`El sort code tiene 6 dígitos, por ejemplo 60-83-71.`;
      case 'bank_code':
        return t`Elige un banco de la lista.`;
    }
  };
}

interface ShellProps {
  name: RailFieldName;
  label: React.ReactNode;
  optional?: boolean;
  hint?: React.ReactNode;
  ctx: RailFieldsContext;
  children: (invalid: boolean) => React.ReactNode;
}

function FieldShell({ name, label, optional, hint, ctx, children }: ShellProps) {
  const { t } = useLingui();
  const errorText = useRailErrorText()(ctx.errors[name]);
  const invalid = Boolean(errorText) || ctx.highlighted.has(name);
  const id = `rail-field-${name}`;

  return (
    <div>
      <Label htmlFor={id}>
        {label}{' '}
        {optional ? (
          <span className="text-xs text-muted-foreground">{t`(opcional)`}</span>
        ) : (
          <span className="text-destructive" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children(invalid)}
      {errorText ? (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {errorText}
        </p>
      ) : ctx.highlighted.has(name) ? (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {t`El proveedor necesita este dato.`}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

interface TextFieldProps {
  name: RailFieldName;
  label: React.ReactNode;
  ctx: RailFieldsContext;
  placeholder?: string;
  optional?: boolean;
  hint?: React.ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
}

export function RailTextField({
  name,
  label,
  ctx,
  placeholder,
  optional,
  hint,
  inputMode,
  maxLength,
}: TextFieldProps) {
  return (
    <FieldShell name={name} label={label} optional={optional} hint={hint} ctx={ctx}>
      {(invalid) => (
        <Input
          id={`rail-field-${name}`}
          value={ctx.values[name]}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          disabled={ctx.disabled}
          aria-invalid={invalid}
          className={cn('h-11 rounded-lg', invalid && 'border-destructive focus-visible:ring-destructive')}
          onChange={(event) => ctx.onChange(name, event.target.value)}
        />
      )}
    </FieldShell>
  );
}

interface SelectFieldProps {
  name: RailFieldName;
  label: React.ReactNode;
  ctx: RailFieldsContext;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder?: string;
  optional?: boolean;
  hint?: React.ReactNode;
}

export function RailSelectField({ name, label, ctx, options, placeholder, optional, hint }: SelectFieldProps) {
  return (
    <FieldShell name={name} label={label} optional={optional} hint={hint} ctx={ctx}>
      {(invalid) => (
        <Select
          value={ctx.values[name] ?? ''}
          onValueChange={(value) => ctx.onChange(name, value)}
          disabled={ctx.disabled}
        >
          <SelectTrigger
            id={`rail-field-${name}`}
            aria-invalid={invalid}
            className={cn('h-11 rounded-lg', invalid && 'border-destructive focus-visible:ring-destructive')}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FieldShell>
  );
}

/** Checking / savings select shared by the bank-account families. */
export function AccountTypeField({ ctx }: RailFieldsProps) {
  const { t } = useLingui();
  return (
    <RailSelectField
      name="account_type"
      label={t`Tipo de cuenta`}
      ctx={ctx}
      placeholder={t`Selecciona`}
      options={[
        { value: 'checking', label: t`Corriente` },
        { value: 'savings', label: t`Ahorros` },
      ]}
    />
  );
}
