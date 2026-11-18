import type { FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantCustomer, TenantRail } from '@/graphql/types/tenant';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { NativeSelect } from '@/modules/suite-tenant/components/atoms/native-select';
import { CustomerPicker } from '@/modules/suite-tenant/components/molecules/customer-picker';
import { FormField } from '@/modules/suite-tenant/components/molecules/form-field';
import {
  ACCOUNT_TYPES,
  HOLDER_TYPES,
  RELATIONSHIPS,
  accountFieldsOf,
  addressFieldsOf,
  isRequiredField,
  railCountries,
  type BeneficiaryFormErrors,
  type BeneficiaryFormField,
  type BeneficiaryFormValues,
} from '@/modules/suite-tenant/features/beneficiaries/lib/beneficiary-form';
import { humanizeCode } from '@/modules/suite-tenant/lib/tenant-format';

interface BeneficiaryFormProps {
  values: BeneficiaryFormValues;
  errors: BeneficiaryFormErrors;
  customers: readonly TenantCustomer[];
  /** Payout rails of the client. */
  rails: readonly TenantRail[];
  pending: boolean;
  onChange: (field: BeneficiaryFormField, value: string) => void;
  onFavoriteChange: (value: boolean) => void;
  onSubmit: () => void;
}

/** Presentational create-beneficiary form; the account fields follow the chosen rail. */
export function BeneficiaryForm({
  values,
  errors,
  customers,
  rails,
  pending,
  onChange,
  onFavoriteChange,
  onSubmit,
}: BeneficiaryFormProps) {
  const { t } = useLingui();
  const rail = rails.find((item) => item.code === values.payment_rail);
  const countries = railCountries(rail);

  const labels: Record<BeneficiaryFormField, string> = {
    customer_id: t`Customer`,
    payment_rail: t`Rail`,
    country: t`Country`,
    holder_type: t`Holder`,
    beneficiary_name: t`Account holder name`,
    relationship: t`Relationship`,
    routing_number: t`Routing number`,
    account_number_us: t`Account number`,
    account_type: t`Account type`,
    iban: t`IBAN`,
    bic: t`BIC / SWIFT`,
    account_number: t`Account number`,
    clabe: t`CLABE`,
    pix_key: t`PIX key`,
    sort_code: t`Sort code`,
    bank_code: t`Bank code`,
    breb_key: t`Bre-B key`,
    tax_id_type: t`Tax ID type`,
    tax_id: t`Tax ID`,
    bank_name: t`Bank name`,
    bank_address: t`Bank address`,
    address_line_1: t`Address`,
    city: t`City`,
    state: t`State or province`,
    postal_code: t`Postal code`,
    alias: t`Alias`,
  };

  const hints: Partial<Record<BeneficiaryFormField, string>> = {
    clabe: t`18 digits.`,
    state: t`An ISO code such as NY. Required for US accounts.`,
    tax_id_type: t`For example CC or NIT.`,
    bank_name: t`Required when the account is registered at KiraFin.`,
    bank_address: t`Required when the account is registered at KiraFin.`,
    iban: rail?.code === 'swift' ? t`IBAN or account number.` : undefined,
  };

  const messageOf = (field: BeneficiaryFormField): string | undefined => {
    switch (errors[field]) {
      case 'required':
        return t`Required.`;
      case 'clabe':
        return t`A CLABE has exactly 18 digits.`;
      case 'country':
        return t`Use a three-letter ISO code, e.g. MEX.`;
      case 'iban_or_account':
        return t`Enter an IBAN or an account number.`;
      default:
        return undefined;
    }
  };

  const labelOf = (field: BeneficiaryFormField) =>
    isRequiredField(field, values) ? labels[field] : t`${labels[field]} (optional)`;

  const text = (field: BeneficiaryFormField) => (
    <FormField
      key={field}
      id={`bf-${field}`}
      label={labelOf(field)}
      error={messageOf(field)}
      hint={hints[field]}
    >
      <Input
        id={`bf-${field}`}
        name={field}
        value={values[field]}
        aria-invalid={errors[field] ? true : undefined}
        onChange={(event) => onChange(field, event.target.value)}
      />
    </FormField>
  );

  const choice = (
    field: BeneficiaryFormField,
    options: readonly string[],
    placeholder?: string
  ) => (
    <FormField
      key={field}
      id={`bf-${field}`}
      label={labelOf(field)}
      error={messageOf(field)}
      hint={hints[field]}
    >
      <NativeSelect
        id={`bf-${field}`}
        name={field}
        value={values[field]}
        placeholder={placeholder}
        aria-invalid={errors[field] ? true : undefined}
        options={options.map((option) => ({ value: option, label: humanizeCode(option) }))}
        onChange={(event) => onChange(field, event.target.value)}
      />
    </FormField>
  );

  const control = (field: BeneficiaryFormField) =>
    field === 'account_type' ? choice(field, ACCOUNT_TYPES, t`Choose one`) : text(field);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate data-testid="beneficiary-form">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CustomerPicker
          id="bf-customer_id"
          customers={customers}
          value={values.customer_id}
          error={messageOf('customer_id')}
          onChange={(value) => onChange('customer_id', value)}
        />
        <FormField
          id="bf-payment_rail"
          label={labels.payment_rail}
          error={messageOf('payment_rail')}
        >
          <NativeSelect
            id="bf-payment_rail"
            value={values.payment_rail}
            placeholder={t`Choose a rail`}
            options={rails.map((item) => ({
              value: item.code,
              label: `${item.name ?? item.code} · ${item.currency}${item.country ? ` · ${item.country}` : ''}`,
            }))}
            onChange={(event) => onChange('payment_rail', event.target.value)}
          />
        </FormField>
        {countries.length > 1 ? (
          choice('country', countries, t`Choose a country`)
        ) : (
          <FormField id="bf-country" label={labels.country} error={messageOf('country')}>
            <Input id="bf-country" value={values.country} readOnly disabled={!rail} />
          </FormField>
        )}
        {choice('holder_type', HOLDER_TYPES)}
        {text('beneficiary_name')}
        {choice('relationship', RELATIONSHIPS, t`Not specified`)}
      </div>

      {values.payment_rail ? (
        <>
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-foreground">
              <Trans>Account</Trans>
            </legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {accountFieldsOf(values.payment_rail).map(control)}
            </div>
          </fieldset>
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-foreground">
              <Trans>Holder address</Trans>
            </legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {addressFieldsOf(values.payment_rail).map(control)}
            </div>
          </fieldset>
        </>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {text('alias')}
        <label
          className="flex items-center gap-2 self-end pb-2 text-sm text-foreground"
          htmlFor="bf-is_favorite"
        >
          <Checkbox
            id="bf-is_favorite"
            checked={values.is_favorite}
            onCheckedChange={(checked) => onFavoriteChange(checked === true)}
          />
          <Trans>Mark as favorite</Trans>
        </label>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? <Trans>Creating…</Trans> : <Trans>Create beneficiary</Trans>}
        </Button>
      </div>
    </form>
  );
}
