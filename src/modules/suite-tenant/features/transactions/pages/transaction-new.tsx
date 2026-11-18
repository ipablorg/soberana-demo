import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';

import { Card, CardContent } from '@/shared/components/ui/card';
import { useConfirmIntentKey } from '@/shared/lib/idempotency-key';
import { cn } from '@/shared/lib/utils';
import { TransactionForm } from '@/modules/suite-tenant/features/transactions/components/transaction-form';
import {
  TransactionResultCard,
  type TransactionResult,
} from '@/modules/suite-tenant/features/transactions/components/transaction-result-card';
import {
  useCreateTenantTransactions,
  useTenantPaymentLinkCapabilities,
} from '@/modules/suite-tenant/features/transactions/hooks/use-tenant-transactions';
import {
  EMPTY_TRANSACTION_FORM,
  TRANSACTION_KINDS,
  currencyFollowsWallet,
  intentFingerprint,
  toTransactionInput,
  validateTransactionForm,
  walletCurrencyOf,
  type TransactionFormErrors,
  type TransactionFormField,
  type TransactionFormValues,
  type TransactionKind,
} from '@/modules/suite-tenant/features/transactions/lib/transaction-forms';
import { useTenantWallets } from '@/modules/suite-tenant/features/wallets/hooks/use-tenant-wallets';
import { useTenantBeneficiaries } from '@/modules/suite-tenant/features/beneficiaries/hooks/use-tenant-beneficiaries';
import {
  beneficiariesOf,
  isDeactivated,
} from '@/modules/suite-tenant/features/beneficiaries/lib/beneficiary-form';
import {
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';
import { useTenantCustomerOptions } from '@/modules/suite-tenant/hooks/use-tenant-customer-options';
import { useTenantMe } from '@/modules/suite-tenant/hooks/use-tenant-me';
import { normalizeEnvironment } from '@/modules/suite-tenant/lib/tenant-environment';

/** Container: create an off-ramp, a dispersion, a crypto transfer or a payment link. */
export default function TransactionNew() {
  const { t } = useLingui();
  const [kind, setKind] = useState<TransactionKind>('off_ramp');
  const [values, setValues] = useState<TransactionFormValues>(EMPTY_TRANSACTION_FORM);
  const [errors, setErrors] = useState<TransactionFormErrors>({});
  const [result, setResult] = useState<TransactionResult | null>(null);
  const me = useTenantMe();
  const customers = useTenantCustomerOptions();
  const wallets = useTenantWallets(values.customer_id);
  const needsBeneficiary = kind === 'off_ramp' || kind === 'dispersion';
  const beneficiaries = useTenantBeneficiaries(needsBeneficiary ? values.customer_id : '');
  const capabilities = useTenantPaymentLinkCapabilities(kind === 'payment_link');
  const intent = useConfirmIntentKey(intentFingerprint(kind, values));

  const commands = useCreateTenantTransactions(
    (answer) => {
      // A success ends the intent: the next one gets a fresh reference.
      intent.rotate();
      setResult(answer as TransactionResult);
    },
    (code) => {
      // The same reference with other data is refused for good: start a new intent.
      if (code === 'IDEMPOTENCY_KEY_REUSED') intent.rotate();
    }
  );

  const isProduction = normalizeEnvironment(me.data?.tenant_me.environment) === 'production';
  const kindLabels: Record<TransactionKind, string> = {
    off_ramp: t`Off-ramp`,
    dispersion: t`Dispersion`,
    transfer: t`Crypto transfer`,
    payment_link: t`Payment link`,
  };
  const kindHints: Record<TransactionKind, string> = {
    off_ramp: t`Withdraw from a wallet to a local bank beneficiary.`,
    dispersion: t`Send from a wallet to an international beneficiary.`,
    transfer: t`Send crypto from a wallet to an external address. Sandbox only.`,
    payment_link: t`Collect a fiat payment into a wallet.`,
  };

  if (customers.isLoading) return <TenantPageSkeleton />;
  if (customers.error || !customers.data) {
    return <QueryError error={customers.error} onRetry={() => void customers.refetch()} />;
  }

  const walletList = wallets.data?.tenant_listWallets.data ?? [];

  const change = (field: TransactionFormField, value: string) => {
    setValues((current) => {
      const next = {
        ...current,
        [field]: value,
        // A new customer invalidates the chosen wallet and beneficiary.
        ...(field === 'customer_id' ? { wallet_id: '', beneficiary_id: '' } : {}),
      };
      // Off-ramps are booked in the source wallet currency: it follows the wallet.
      if (currencyFollowsWallet(kind) && (field === 'wallet_id' || field === 'customer_id')) {
        next.currency = walletCurrencyOf(next.wallet_id, walletList);
      }
      return next;
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const switchKind = (option: TransactionKind) => {
    setKind(option);
    setErrors({});
    setResult(null);
    if (currencyFollowsWallet(option)) {
      setValues((current) => ({
        ...current,
        currency: walletCurrencyOf(current.wallet_id, walletList),
      }));
    }
  };

  const submit = () => {
    const found = validateTransactionForm(kind, values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const command = toTransactionInput(kind, values, intent.getKey());
    switch (command.kind) {
      case 'off_ramp':
        commands.off_ramp.mutate({ input: command.input });
        break;
      case 'dispersion':
        commands.dispersion.mutate({ input: command.input });
        break;
      case 'transfer':
        commands.transfer.mutate({ input: command.input });
        break;
      case 'payment_link':
        commands.payment_link.mutate({ input: command.input });
        break;
    }
  };

  const restart = () => {
    setResult(null);
    setValues(EMPTY_TRANSACTION_FORM);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <SectionHeader title={t`New transaction.`} subtitle={t`Move money for a customer.`} />

      <div className="flex flex-wrap gap-2" role="group" aria-label={t`Transaction type`}>
        {TRANSACTION_KINDS.map((option) => {
          const disabled = option === 'transfer' && isProduction;

          return (
            <button
              key={option}
              type="button"
              data-kind={option}
              aria-pressed={kind === option}
              disabled={disabled}
              title={disabled ? t`Not available in production.` : undefined}
              onClick={() => switchKind(option)}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
                kind === option
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              )}
            >
              {kindLabels[option]}
            </button>
          );
        })}
      </div>

      <Card className="rounded-xl shadow-none">
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm text-muted-foreground">{kindHints[kind]}</p>
          {result ? (
            <TransactionResultCard result={result} onAnother={restart} />
          ) : (
            <TransactionForm
              kind={kind}
              values={values}
              errors={errors}
              customers={customers.data.tenant_listCustomers.data}
              wallets={walletList}
              beneficiaries={beneficiariesOf(beneficiaries.data?.tenant_listBeneficiaries).filter(
                (beneficiary) => !isDeactivated(beneficiary)
              )}
              paymentLinkRails={
                capabilities.data?.tenant_paymentLinkCapabilities.payment_link_rails ?? []
              }
              clientReferenceId={intent.getKey()}
              pending={commands[kind].isPending}
              onChange={change}
              onSubmit={submit}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
