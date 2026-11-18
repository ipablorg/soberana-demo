import type { FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { NativeSelect } from '@/modules/suite-tenant/components/atoms/native-select';
import { FormField } from '@/modules/suite-tenant/components/molecules/form-field';
import type {
  CustomerFormErrors,
  CustomerFormField,
  CustomerFormValues,
} from '@/modules/suite-tenant/features/customers/lib/customer-form';

interface CustomerFormProps {
  values: CustomerFormValues;
  errors: CustomerFormErrors;
  pending: boolean;
  onChange: (field: CustomerFormField, value: string) => void;
  onSubmit: () => void;
}

/** Presentational create-customer form (hosted KYC link flow). */
export function CustomerForm({ values, errors, pending, onChange, onSubmit }: CustomerFormProps) {
  const { t } = useLingui();

  const messageOf = (field: CustomerFormField): string | undefined => {
    switch (errors[field]) {
      case 'required':
        return t`Required.`;
      case 'too_long':
        return t`Too long.`;
      case 'email':
        return t`Enter a valid email.`;
      case 'country':
        return t`Use a three-letter ISO code, e.g. COL.`;
      default:
        return undefined;
    }
  };

  const text = (field: CustomerFormField, label: string, hint?: string, type = 'text') => (
    <FormField id={`customer-${field}`} label={label} error={messageOf(field)} hint={hint}>
      <Input
        id={`customer-${field}`}
        name={field}
        type={type}
        value={values[field]}
        aria-invalid={errors[field] ? true : undefined}
        onChange={(event) => onChange(field, event.target.value)}
      />
    </FormField>
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate data-testid="customer-form">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="customer-customer_type" label={t`Customer type`}>
          <NativeSelect
            id="customer-customer_type"
            name="customer_type"
            value={values.customer_type}
            onChange={(event) => onChange('customer_type', event.target.value)}
            options={[
              { value: 'individual', label: t`Individual` },
              { value: 'business', label: t`Business` },
            ]}
          />
        </FormField>
        {text('external_id', t`External ID`, t`Your own id for this customer.`)}
        {text('email', t`Email`, undefined, 'email')}
        {values.customer_type === 'business' ? (
          text('business_name', t`Business name`)
        ) : (
          <>
            {text('first_name', t`First name`)}
            {text('last_name', t`Last name`)}
          </>
        )}
        {text('tax_id', t`Tax ID`)}
        {text('tax_id_type', t`Tax ID type`, t`For example NIT, CC, RUT, SSN.`)}
        {text('country', t`Country (optional)`, t`ISO 3166-1 alpha-3, e.g. COL.`)}
        {text('phone', t`Phone (optional)`, t`International format, e.g. +573001234567.`, 'tel')}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? <Trans>Creating…</Trans> : <Trans>Create customer</Trans>}
        </Button>
      </div>
    </form>
  );
}
