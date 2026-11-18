import type { FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantBeneficiary, TenantCustomer, TenantWallet } from '@/graphql/types/tenant';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  NativeSelect,
  type NativeSelectOption,
} from '@/modules/suite-tenant/components/atoms/native-select';
import { CustomerPicker } from '@/modules/suite-tenant/components/molecules/customer-picker';
import { FormField } from '@/modules/suite-tenant/components/molecules/form-field';
import {
  PAYMENT_LINK_PURPOSES,
  currencyFollowsWallet,
  visibleFields,
  type TransactionFormErrors,
  type TransactionFormField,
  type TransactionFormValues,
  type TransactionKind,
} from '@/modules/suite-tenant/features/transactions/lib/transaction-forms';
import { beneficiaryOptionLabel } from '@/modules/suite-tenant/features/beneficiaries/lib/beneficiary-form';
import { humanizeCode } from '@/modules/suite-tenant/lib/tenant-format';

interface TransactionFormProps {
  kind: TransactionKind;
  values: TransactionFormValues;
  errors: TransactionFormErrors;
  customers: readonly TenantCustomer[];
  wallets: readonly TenantWallet[];
  /** Active beneficiaries of the chosen customer (off-ramps and dispersions). */
  beneficiaries: readonly TenantBeneficiary[];
  /** Rails offered for payment links (from the capabilities); free text when empty. */
  paymentLinkRails: readonly string[];
  clientReferenceId: string;
  pending: boolean;
  onChange: (field: TransactionFormField, value: string) => void;
  onSubmit: () => void;
}

/** Presentational form of one money-moving command, fields driven by its REST DTO. */
export function TransactionForm({
  kind,
  values,
  errors,
  customers,
  wallets,
  beneficiaries,
  paymentLinkRails,
  clientReferenceId,
  pending,
  onChange,
  onSubmit,
}: TransactionFormProps) {
  const { t } = useLingui();
  const fields = visibleFields(kind, values);

  const labels: Record<TransactionFormField, string> = {
    customer_id: t`Customer`,
    wallet_id: t`Source wallet`,
    beneficiary_id: t`Beneficiary`,
    amount: t`Amount`,
    currency: t`Currency`,
    quote_id: t`Quote ID (optional)`,
    to_address: t`Destination address`,
    chain: t`Chain`,
    rail_code: t`Rail`,
    purpose: t`Purpose (optional)`,
    expires_in_minutes: t`Expires in minutes (optional)`,
    return_url: t`Return URL`,
    payer_full_name: t`Payer full name`,
    payer_document_type: t`Payer document type`,
    payer_document_number: t`Payer document number`,
    payer_email: t`Payer email`,
    payer_phone: t`Payer phone`,
  };

  const hints: Partial<Record<TransactionFormField, string>> = {
    amount: kind === 'dispersion' ? t`In the wallet currency.` : t`At least 0.01.`,
    currency: currencyFollowsWallet(kind)
      ? t`Always the source wallet currency.`
      : t`For example USDT or COP.`,
    beneficiary_id: t`Only approved beneficiaries receive money.`,
    return_url: t`HTTPS. The provider sends payment updates here.`,
    payer_phone: t`International format, e.g. +593991234567.`,
    payer_document_type: t`For example CI.`,
  };

  const messageOf = (field: TransactionFormField): string | undefined => {
    switch (errors[field]) {
      case 'required':
        return t`Required.`;
      case 'amount':
        return t`Enter an amount of at least 0.01.`;
      case 'minutes':
        return t`Use a whole number of minutes, 1 or more.`;
      case 'https_url':
        return t`Use an https:// URL.`;
      case 'email':
        return t`Enter a valid email.`;
      case 'uuid':
        return t`Choose one from the list.`;
      default:
        return undefined;
    }
  };

  const walletOptions: NativeSelectOption[] = wallets.map((wallet) => ({
    value: wallet.id,
    label: `${wallet.alias || wallet.id} · ${wallet.currency} · ${wallet.chain}`,
  }));

  const control = (field: TransactionFormField) => {
    const id = `tx-${field}`;
    const common = {
      id,
      name: field,
      value: values[field],
      'aria-invalid': errors[field] ? true : undefined,
    };

    if (field === 'customer_id') {
      return (
        <CustomerPicker
          key={field}
          id={id}
          label={labels.customer_id}
          customers={customers}
          value={values.customer_id}
          error={messageOf(field)}
          onChange={(value) => onChange('customer_id', value)}
        />
      );
    }

    let input;
    if (field === 'wallet_id') {
      input = (
        <NativeSelect
          {...common}
          disabled={!values.customer_id}
          placeholder={values.customer_id ? t`Choose a wallet` : t`Choose a customer first`}
          options={walletOptions}
          onChange={(event) => onChange(field, event.target.value)}
        />
      );
    } else if (field === 'beneficiary_id') {
      input = (
        <NativeSelect
          {...common}
          disabled={!values.customer_id}
          placeholder={values.customer_id ? t`Choose a beneficiary` : t`Choose a customer first`}
          options={beneficiaries.map((beneficiary) => ({
            value: beneficiary.id,
            label: beneficiaryOptionLabel(beneficiary),
          }))}
          onChange={(event) => onChange(field, event.target.value)}
        />
      );
    } else if (field === 'rail_code' && paymentLinkRails.length > 0) {
      input = (
        <NativeSelect
          {...common}
          placeholder={t`Choose a rail`}
          options={paymentLinkRails.map((rail) => ({ value: rail, label: rail }))}
          onChange={(event) => onChange(field, event.target.value)}
        />
      );
    } else if (field === 'purpose') {
      input = (
        <NativeSelect
          {...common}
          placeholder={t`None`}
          options={PAYMENT_LINK_PURPOSES.map((purpose) => ({
            value: purpose,
            label: humanizeCode(purpose),
          }))}
          onChange={(event) => onChange(field, event.target.value)}
        />
      );
    } else if (field === 'currency' && currencyFollowsWallet(kind)) {
      input = (
        <Input
          {...common}
          readOnly
          placeholder={values.wallet_id ? undefined : t`Choose a wallet first`}
          onChange={(event) => onChange(field, event.target.value)}
        />
      );
    } else {
      input = (
        <Input
          {...common}
          inputMode={field === 'amount' || field === 'expires_in_minutes' ? 'decimal' : undefined}
          type={field === 'payer_email' ? 'email' : field === 'return_url' ? 'url' : 'text'}
          onChange={(event) => onChange(field, event.target.value)}
        />
      );
    }

    return (
      <FormField
        key={field}
        id={id}
        label={labels[field]}
        error={messageOf(field)}
        hint={hints[field]}
      >
        {input}
      </FormField>
    );
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate data-testid="transaction-form">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{fields.map(control)}</div>
      {kind !== 'payment_link' ? (
        <p className="text-xs text-muted-foreground" data-testid="tx-reference">
          <Trans>
            Reference <span className="font-mono">{clientReferenceId}</span>: retrying with the same
            data never moves money twice.
          </Trans>
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? <Trans>Sending…</Trans> : <Trans>Confirm</Trans>}
        </Button>
      </div>
    </form>
  );
}
