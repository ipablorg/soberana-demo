import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { toast } from '@/shared/components/ui/sonner';
import { Copy, Check } from '@/shared/components/animated-icons';
import { getRailFlag, getCurrencyFlag } from '@/shared/lib/currency-flags';
import { fadeInUp } from '@/shared/lib/motion';
import { BankTransferGuide } from '@/shared/components/bank-transfer-guide';
import type { VirtualAccount } from '@/shared/hooks/use-deposit-instructions';

interface DepositInstructionsDialogProps {
  account: VirtualAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositInstructionsDialog({
  account,
  open,
  onOpenChange,
}: DepositInstructionsDialogProps) {
  if (!account) return null;

  return <DepositInstructionsContent account={account} open={open} onOpenChange={onOpenChange} />;
}

function DepositInstructionsContent({
  account,
  open,
  onOpenChange,
}: {
  account: VirtualAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useLingui();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [guideOpen, setGuideOpen] = useState(false);

  const currencyNames: Record<string, string> = {
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

  const currencyName = currencyNames[account.currency] || account.currency;
  const isReady = account.status === 'ACTIVE' || account.status === 'active';
  const flag =
    getRailFlag(account.payment_rail) !== '🌐'
      ? getRailFlag(account.payment_rail)
      : getCurrencyFlag(account.currency);

  function buildDisplayDetails(): Record<string, string> {
    const details: Record<string, string> = {};
    if (account.bank_name) details[t`Banco`] = account.bank_name;
    if (account.account_number) details[t`Número de cuenta`] = account.account_number;
    if (account.account_type) details[t`Tipo de cuenta`] = account.account_type;
    if (account.routing_number) details[t`Número de ruta (routing)`] = account.routing_number;
    if (account.clabe) details['CLABE'] = account.clabe;
    if (account.iban) details['IBAN'] = account.iban;
    if (account.swift_code) details['SWIFT/BIC'] = account.swift_code;
    if (account.nit) details['NIT'] = account.nit;
    if (account.beneficiary_name) details[t`Beneficiario`] = account.beneficiary_name;
    if (account.beneficiary_address) details[t`Dirección`] = account.beneficiary_address;
    if (account.reference) details[t`Referencia`] = account.reference;
    return details;
  }

  const details = buildDisplayDetails();

  async function handleCopy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(key);
      toast.success(t`Copiado al portapapeles`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error(t`No se pudo copiar`);
    }
  }

  async function handleCopyAll() {
    const text = Object.entries(details)
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t`Todos los datos copiados`);
    } catch {
      toast.error(t`No se pudo copiar`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-xl border border-border bg-card overflow-hidden flex flex-col p-0">
        {/* Sticky header */}
        <div className="bg-card border-b border-border px-6 pt-6 pb-4">
          <DialogHeader className="gap-0">
            <div className="flex items-center gap-4">
              <span className="text-[2.5rem] leading-none" role="img" aria-label={account.currency}>
                {flag}
              </span>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg">{t`Tu cuenta en ${currencyName}`}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-mono tabular-nums text-muted-foreground">
                    {account.payment_rail.toUpperCase()} · {account.currency}
                  </span>
                  {!isReady && (
                    <Badge variant="warning" className="text-[10px]">
                      {t`Preparando tu cuenta`}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          {Object.keys(details).length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 flex-1"
                onClick={() => setGuideOpen(true)}
              >
                <Trans>¿Cómo recargar?</Trans>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 flex-1"
                onClick={handleCopyAll}
              >
                <Copy className="h-3.5 w-3.5" />
                <Trans>Copiar todo</Trans>
              </Button>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <motion.div
          {...fadeInUp}
          className="overflow-y-auto px-6 pb-6 pt-4 flex-1"
        >
          <p className="text-sm text-muted-foreground mb-4">
            <Trans>Comparte estos datos. El dinero llegará convertido a tu wallet.</Trans>
          </p>

          {account.linked_manually && (
            <p className="text-xs text-muted-foreground mb-4">
              <Trans>Cuenta registrada por el equipo de Loopay</Trans>
            </p>
          )}

          <Separator className="mb-4" />

          {Object.keys(details).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              <Trans>Estamos preparando los datos de tu cuenta.</Trans>
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(details).map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="truncate text-sm font-mono tabular-nums text-foreground">
                      {value}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleCopy(label, value)}
                    aria-label={t`Copiar ${label}`}
                  >
                    {copiedField === label ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </DialogContent>

      <BankTransferGuide 
        open={guideOpen} 
        onOpenChange={setGuideOpen} 
        account={account} 
      />
    </Dialog>
  );
}
