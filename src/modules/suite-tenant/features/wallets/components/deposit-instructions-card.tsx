import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantDepositInstructions, TenantVirtualAccount } from '@/graphql/types/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { StatusBadge } from '@/modules/suite-tenant/components/atoms/status-badge';
import {
  KeyValueList,
  type KeyValueItem,
} from '@/modules/suite-tenant/components/molecules/key-value-list';

interface DepositInstructionsCardProps {
  instructions: TenantDepositInstructions | undefined;
  isLoading: boolean;
}

function accountItems(
  account: TenantVirtualAccount,
  labels: Record<string, string>
): KeyValueItem[] {
  const fields: Array<[string, string | null | undefined]> = [
    [labels.bank, account.bank_name],
    [labels.holder, account.account_holder_name ?? account.beneficiary_name],
    [labels.account, account.account_number],
    [labels.routing, account.routing_number],
    ['IBAN', account.iban],
    ['CLABE', account.clabe],
    ['SWIFT / BIC', account.swift_code ?? account.bic],
    [labels.reference, account.reference],
  ];

  return fields
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => ({ label, value, mono: true }));
}

/** Where the customer pays in: virtual bank accounts of the wallet. */
export function DepositInstructionsCard({ instructions, isLoading }: DepositInstructionsCardProps) {
  const { t } = useLingui();
  const labels = {
    bank: t`Bank`,
    holder: t`Account holder`,
    account: t`Account number`,
    routing: t`Routing number`,
    reference: t`Reference`,
  };

  return (
    <Card className="rounded-xl shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">
          <Trans>Deposit instructions</Trans>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            <Trans>Loading instructions…</Trans>
          </p>
        ) : !instructions || instructions.virtual_accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            <Trans>No bank accounts yet. They appear once a virtual account is active.</Trans>
          </p>
        ) : (
          <ul className="space-y-4" data-testid="deposit-instructions">
            {instructions.virtual_accounts.map((account) => (
              <li key={account.id} className="space-y-3 rounded-xl bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-sm text-foreground">
                    {account.payment_rail} · {account.currency}
                  </p>
                  <StatusBadge status={account.status} />
                </div>
                <KeyValueList items={accountItems(account, labels)} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
