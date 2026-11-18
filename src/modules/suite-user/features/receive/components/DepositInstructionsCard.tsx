import { useLingui } from '@lingui/react/macro';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ChevronRight } from '@/shared/components/animated-icons';
import { getRailFlag, getCurrencyFlag } from '@/shared/lib/currency-flags';
import type { VirtualAccount } from '@/shared/hooks/use-deposit-instructions';

interface DepositInstructionsCardProps {
  account: VirtualAccount;
  onClick: () => void;
}

export function DepositInstructionsCard({ account, onClick }: DepositInstructionsCardProps) {
  const { t } = useLingui();

  function getLocalizedCurrencyName(currency: string): string {
    const names: Record<string, string> = {
      COP: t`pesos colombianos`,
      USD: t`dólares`,
      MXN: t`pesos mexicanos`,
      BRL: t`reales brasileños`,
      EUR: t`euros`,
      ARS: t`pesos argentinos`,
      PEN: t`soles`,
      CLP: t`pesos chilenos`,
      USDC: t`dólares digitales`,
      USDT: t`dólares digitales`,
    };
    return names[currency] || currency;
  }

  const isReady = account.status === 'ACTIVE' || account.status === 'active';
  const flag = getRailFlag(account.payment_rail) !== '🌐'
    ? getRailFlag(account.payment_rail)
    : getCurrencyFlag(account.currency);
  const currencyName = getLocalizedCurrencyName(account.currency);

  return (
    <Card
      className="cursor-pointer transition-colors duration-150 hover:bg-muted/30"
      onClick={onClick}
    >
      <div className="flex items-center gap-4 p-6">
        <span className="text-[2rem] leading-none" role="img" aria-label={account.currency}>
          {flag}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-foreground">{t`Tu cuenta en ${currencyName}`}</p>
          <p className="text-sm text-muted-foreground font-mono tabular-nums">{account.currency}</p>
        </div>
        <div className="flex items-center gap-3">
          {!isReady && (
            <Badge variant="warning">{t`Preparando tu cuenta`}</Badge>
          )}
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </Card>
  );
}
