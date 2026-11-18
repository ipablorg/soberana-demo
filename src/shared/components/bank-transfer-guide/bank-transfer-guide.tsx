/**
 * BankTransferGuide
 *
 * Side sheet with transfer instructions per currency / rail.
 * USD includes a US-bank picker; MXN, COP, EUR and BRL show
 * generic step-by-step flows with live copy chips from the
 * user's virtual account.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { toast } from '@/shared/components/ui/sonner';
import { Copy, Check, ChevronRight } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import {
  useTransferGuides,
  matchCurrencyRailId,
  accountMatchesCurrencyRail,
} from '@/data/bank-instructions';
import type { GuideStep, StepFieldKey } from '@/data/bank-instructions';
import type { VirtualAccount } from '@/shared/hooks/use-deposit-instructions';
import { ConversionExplainerCard } from './conversion-explainer-card';
import { BankBrandIcon, BANK_BRANDS } from './bank-brand-icon';
import { getRuntimeStablecoinLabel } from '@/shared/lib/runtime-stablecoin';

const STORAGE_CURRENCY_KEY = 'loopay:guide:currency';
const STORAGE_BANK_KEY = 'loopay:guide:bank';

interface BankTransferGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: VirtualAccount | null;
  /** All active virtual accounts — used to populate copy chips per currency tab. */
  accounts?: VirtualAccount[];
  walletCurrency?: string | null;
}

function readStored(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // silent
  }
}

function getFieldValue(
  account: VirtualAccount | null | undefined,
  field: StepFieldKey,
): string | null {
  if (!account) return null;
  const value = account[field];
  return value && value.length > 0 ? value : null;
}

function useFieldLabel() {
  const { t } = useLingui();
  return (field: StepFieldKey): string => {
    switch (field) {
      case 'routing_number':
        return 'Routing Number';
      case 'account_number':
        return t`Número de cuenta`;
      case 'beneficiary_name':
        return t`Beneficiario`;
      case 'bank_name':
        return t`Banco`;
      case 'swift_code':
        return 'SWIFT/BIC';
      case 'beneficiary_address':
        return t`Dirección`;
      case 'clabe':
        return 'CLABE';
      case 'iban':
        return 'IBAN';
      case 'nit':
        return 'NIT';
      case 'reference':
        return t`Referencia`;
      case 'account_type':
        return t`Tipo de cuenta`;
      default:
        return field;
    }
  };
}

function StepList({
  steps,
  account,
  getFieldLabel,
}: {
  steps: GuideStep[];
  account: VirtualAccount | null | undefined;
  getFieldLabel: (field: StepFieldKey) => string;
}) {
  return (
    <ol className="space-y-3">
      {steps.map((step) => {
        const value = step.copyField ? getFieldValue(account, step.copyField) : null;
        const label = step.copyField ? getFieldLabel(step.copyField) : null;

        return (
          <li key={step.id}>
            <Card className="overflow-hidden rounded-xl border-border">
              <div className="p-4">
                <p className="text-sm font-medium text-foreground">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
                {label && value && <CopyChip label={label} value={value} />}
                {label && !value && (
                  <p className="mt-3 text-xs text-muted-foreground/70">
                    <Trans>Activa esta cuenta para ver el valor exacto aquí.</Trans>
                  </p>
                )}
              </div>
            </Card>
          </li>
        );
      })}
    </ol>
  );
}

export function BankTransferGuide({
  open,
  onOpenChange,
  account,
  accounts = [],
  walletCurrency,
}: BankTransferGuideProps) {
  const { t } = useLingui();
  const { currencyRails, usBankGuides } = useTransferGuides(walletCurrency);
  const getFieldLabel = useFieldLabel();
  const stablecoinLabel = getRuntimeStablecoinLabel(walletCurrency);
  const guideDescription = stablecoinLabel
    ? t`Elige tu moneda y sigue los pasos desde tu banco. El saldo se acredita en ${stablecoinLabel} en tu wallet.`
    : t`Elige tu moneda y sigue los pasos desde tu banco. El saldo se acredita en tu wallet.`;

  const allAccounts = useMemo(() => {
    const list = [...accounts];
    if (account && !list.some((a) => a.id === account.id)) {
      list.unshift(account);
    }
    return list;
  }, [account, accounts]);

  const initialCurrencyId = useMemo(() => {
    if (account) return matchCurrencyRailId(account);
    const stored = readStored(STORAGE_CURRENCY_KEY);
    if (stored && currencyRails.some((r) => r.id === stored)) return stored;
    if (allAccounts.length > 0) return matchCurrencyRailId(allAccounts[0]);
    return currencyRails[0]?.id ?? 'usd';
  }, [account, currencyRails, allAccounts]);

  const [currencyId, setCurrencyId] = useState(initialCurrencyId);

  const [selectedBankId, setSelectedBankId] = useState<string>(() => {
    const stored = readStored(STORAGE_BANK_KEY);
    if (stored && usBankGuides.some((g) => g.id === stored)) return stored;
    return usBankGuides[0]?.id ?? '';
  });

  useEffect(() => {
    if (open && account) {
      setCurrencyId(matchCurrencyRailId(account));
    }
  }, [open, account]);

  useEffect(() => {
    if (currencyId) writeStored(STORAGE_CURRENCY_KEY, currencyId);
  }, [currencyId]);

  useEffect(() => {
    if (selectedBankId) writeStored(STORAGE_BANK_KEY, selectedBankId);
  }, [selectedBankId]);

  const selectedCurrency = useMemo(
    () => currencyRails.find((r) => r.id === currencyId) ?? currencyRails[0],
    [currencyRails, currencyId],
  );

  const selectedBank = useMemo(
    () => usBankGuides.find((g) => g.id === selectedBankId) ?? usBankGuides[0],
    [usBankGuides, selectedBankId],
  );

  const activeAccount = useMemo(
    () =>
      allAccounts.find((a) => accountMatchesCurrencyRail(a, currencyId)) ??
      (account && accountMatchesCurrencyRail(account, currencyId) ? account : null),
    [allAccounts, account, currencyId],
  );

  const activeSteps = selectedCurrency?.hasUsBankPicker
    ? selectedBank?.steps ?? []
    : selectedCurrency?.steps ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-hidden p-0 sm:max-w-xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="space-y-1 border-b border-border px-6 pb-4 pt-6">
            <SheetTitle className="text-lg">
              <Trans>Cómo recargar tu cuenta</Trans>
            </SheetTitle>
            <SheetDescription>{guideDescription}</SheetDescription>
          </SheetHeader>

          {/* Currency tabs */}
          <div className="border-b border-border bg-muted/20 px-6 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {currencyRails.map((rail) => {
                const isActive = rail.id === selectedCurrency?.id;
                const hasAccount = allAccounts.some((a) => accountMatchesCurrencyRail(a, rail.id));
                return (
                  <button
                    key={rail.id}
                    type="button"
                    onClick={() => setCurrencyId(rail.id)}
                    aria-pressed={isActive}
                    className={cn(
                      'flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium',
                      'cursor-pointer transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isActive
                        ? 'border-primary bg-primary/15 text-foreground shadow-sm'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <span className="text-base leading-none" aria-hidden>
                      {rail.flag}
                    </span>
                    {rail.label}
                    {hasAccount && (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-success"
                        aria-label="Cuenta activa"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* US bank picker — only for USD */}
          {selectedCurrency?.hasUsBankPicker && (
            <div className="border-b border-border bg-muted/10 px-6 py-3">
              <p className="mb-2 text-xs text-muted-foreground">
                <Trans>¿Desde qué banco envías?</Trans>
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {usBankGuides.map((guide) => {
                  const isActive = guide.id === selectedBank?.id;
                  const brand = BANK_BRANDS[guide.id];
                  return (
                    <button
                      key={guide.id}
                      type="button"
                      onClick={() => setSelectedBankId(guide.id)}
                      aria-pressed={isActive}
                      className={cn(
                        'flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium',
                        'cursor-pointer transition-colors duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isActive
                          ? brand?.activeClass ??
                            'border-primary bg-primary/15 text-foreground shadow-sm'
                          : brand?.inactiveClass ??
                            'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <BankBrandIcon bankId={guide.id} />
                      {guide.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedCurrency?.id}-${selectedBank?.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="space-y-5"
              >
                <StepList
                  steps={activeSteps}
                  account={activeAccount}
                  getFieldLabel={getFieldLabel}
                />

                <Separator />

                {selectedCurrency && (
                  <ConversionExplainerCard conversion={selectedCurrency.conversion} />
                )}

                {selectedCurrency && (
                  <Card className="rounded-xl border-dashed border-border bg-muted/20 p-4">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {selectedCurrency.footerHint}
                    </p>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="border-t border-border bg-card px-6 py-4">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => onOpenChange(false)}
            >
              <Trans>Listo, ya entendí</Trans>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CopyChip({ label, value }: { label: string; value: string }) {
  const { t } = useLingui();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(t`Copiado al portapapeles`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t`No se pudo copiar`);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={t`Copiar ${label}`}
      className={cn(
        'mt-3 flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2',
        'transition-colors duration-150 hover:bg-muted',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate font-mono text-sm tabular-nums text-foreground">{value}</p>
      </div>
      {copied ? (
        <Check className="h-4 w-4 shrink-0 text-success" />
      ) : (
        <Copy className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
    </button>
  );
}
