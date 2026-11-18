import { useState, useMemo, useCallback, useEffect } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { cn } from '@/shared/lib/utils';
import { mapError } from '@/shared/lib/error-mapper';
import { useWallets } from '@/shared/hooks/use-wallets';
import { useWalletTransactions } from '@/shared/hooks/use-wallet-transactions';
import {
  resolveCustomerTransactionState,
  type CustomerTransactionState,
} from '../lib/resolve-customer-transaction-state';

import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Separator } from '@/shared/components/ui/separator';
import { PageHeader } from '@/shared/components/common/PageHeader';
import {
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
  History,
  Loader2,
  Filter,
} from '@/shared/components/animated-icons';
import type { IconComponent } from '@/shared/components/animated-icons';

const ALL_FILTER = '__ALL__';

const STATUS_FILTERS: readonly { value: CustomerTransactionState; label: string }[] = [
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completada' },
  { value: 'returned', label: 'Devuelta' },
  { value: 'in_review', label: 'En revisión' },
];

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  refunded: boolean;
  description: string;
  external_reference: string;
  created_at: string;
  completed_at: string | null;
  fee: number | null;
  fee_currency: string | null;
  source: Record<string, unknown> | null;
  destination: Record<string, unknown> | null;
}

type TransactionWithState = Transaction & {
  state: CustomerTransactionState;
};

function formatEndpoint(endpoint: Record<string, unknown> | null): string | null {
  if (!endpoint) return null;

  if (typeof endpoint.wallet_alias === 'string') return endpoint.wallet_alias;
  if (typeof endpoint.display_label === 'string') return endpoint.display_label;
  if (typeof endpoint.label === 'string') return endpoint.label;
  if (typeof endpoint.holder_name === 'string') return endpoint.holder_name;
  if (typeof endpoint.account_number === 'string') return endpoint.account_number;
  if (typeof endpoint.accountNumber === 'string') return endpoint.accountNumber;
  if (typeof endpoint.bank_name === 'string') return endpoint.bank_name;
  if (typeof endpoint.bankName === 'string') return endpoint.bankName;
  if (typeof endpoint.address === 'string') return endpoint.address;

  const currency = endpoint.currency || endpoint.wallet_currency;
  if (typeof currency === 'string') return `Wallet ${currency}`;

  return null;
}

function formatEndpointSecondary(endpoint: Record<string, unknown> | null): string | null {
  if (!endpoint) return null;

  const parts: string[] = [];

  if (typeof endpoint.holder_name === 'string') parts.push(endpoint.holder_name);
  if (typeof endpoint.account_number === 'string') parts.push(endpoint.account_number);
  if (typeof endpoint.accountNumber === 'string') parts.push(endpoint.accountNumber);
  if (typeof endpoint.bank_name === 'string') parts.push(endpoint.bank_name);
  if (typeof endpoint.bankName === 'string') parts.push(endpoint.bankName);
  if (typeof endpoint.address === 'string') parts.push(endpoint.address);
  if (typeof endpoint.chain === 'string') parts.push(endpoint.chain);

  return parts.length > 0 ? parts.join(' · ') : null;
}

function EndpointDetail({ endpoint }: { endpoint: Record<string, unknown> }) {
  const primary = formatEndpoint(endpoint);
  const secondary = formatEndpointSecondary(endpoint);

  if (!primary && !secondary) return null;

  return (
    <div className="text-right">
      {primary && <span className="text-sm truncate max-w-50 block">{primary}</span>}
      {secondary && (
        <span className="text-xs text-muted-foreground truncate max-w-50 block">{secondary}</span>
      )}
    </div>
  );
}

type TypeConfig = { label: string; variant: 'success' | 'warning' | 'secondary' | 'outline'; icon: IconComponent };
type StatusConfig = { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' };

/**
 * TransactionsView — card-based transaction history.
 *
 * Each transaction renders as a card with:
 *   - Top: date (left) + status badge (right)
 *   - Middle: type badge + amount (mono) + currency
 *   - Bottom: description or counterparty (truncated)
 *
 * Tap opens a detail Sheet. Responsive: cards stack vertically on
 * all sizes, with a wider layout on desktop (md+).
 */

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.2, ease: 'easeOut' as const },
  }),
};

export function TransactionsView() {
  const { t } = useLingui();
  const { wallets, defaultWallet, isLoading: walletsLoading } = useWallets();

  const [walletId, setWalletId] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState(ALL_FILTER);
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<TransactionWithState | null>(null);

  const selectableWallet = useMemo(() => {
    if (!wallets.length) return null;
    if (defaultWallet) {
      const match = wallets.find(
        (w) => w.currency === defaultWallet.currency && w.chain === defaultWallet.chain,
      );
      if (match) return match;
    }
    return wallets[0];
  }, [wallets, defaultWallet]);

  const selectedWalletId = walletId ?? selectableWallet?.id;

  const filters = useMemo(
    () => ({
      page,
      page_size: 20,
      ...(typeFilter !== ALL_FILTER && { type: typeFilter }),
    }),
    [page, typeFilter],
  );

  const { transactions, pagination, isLoading, error, refetch } = useWalletTransactions(
    selectedWalletId,
    filters,
  );

  const txList = useMemo(
    () =>
      (transactions as Transaction[]).map((tx) => ({
        ...tx,
        state: resolveCustomerTransactionState(tx.status, tx.refunded),
      })),
    [transactions],
  );

  const visibleList = useMemo(
    () =>
      statusFilter === ALL_FILTER
        ? txList
        : txList.filter((tx) => tx.state === statusFilter),
    [txList, statusFilter],
  );
  const hasPendingTx = useMemo(
    () => txList.some((tx) => tx.state === 'in_progress'),
    [txList],
  );

  const typeConfig = useCallback(
    (type: string): TypeConfig => {
      switch (type) {
        case 'DEPOSIT':
          return { label: t`Depósito`, variant: 'success', icon: ArrowDown };
        case 'WITHDRAWAL':
          return { label: t`Retiro`, variant: 'warning', icon: ArrowUp };
        case 'TRANSFER_IN':
          return { label: t`Entrada`, variant: 'success', icon: ArrowDown };
        case 'TRANSFER_OUT':
          return { label: t`Salida`, variant: 'secondary', icon: ArrowUp };
        default:
          return { label: type, variant: 'outline', icon: ArrowLeftRight };
      }
    },
    [t],
  );

  const statusConfig = useCallback(
    (state: CustomerTransactionState): StatusConfig => {
      switch (state) {
        case 'completed':
          return { label: t`Completada`, variant: 'success' };
        case 'returned':
          return { label: t`Devuelta`, variant: 'secondary' };
        case 'in_review':
          return { label: t`En revisión`, variant: 'destructive' };
        case 'in_progress':
        default:
          return { label: t`En progreso`, variant: 'warning' };
      }
    },
    [t],
  );

  const handleCopyId = useCallback(
    (id: string) => {
      navigator.clipboard.writeText(id);
      toast.success(t`ID copiado`);
    },
    [t],
  );

  const handleResetFilters = useCallback(() => {
    setTypeFilter(ALL_FILTER);
    setStatusFilter(ALL_FILTER);
    setPage(1);
  }, []);

  useEffect(() => {
    if (!hasPendingTx) return;
    const interval = setInterval(() => refetch(), 30_000);
    return () => clearInterval(interval);
  }, [hasPendingTx, refetch]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
      <PageHeader
        title={t`Movimientos`}
        subtitle={t`Todos tus movimientos, comprobantes y estados de pago.`}
      />

      {/* Filters */}
      <Card variant="gradient-thin">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {selectableWallet && (
              <Select value={selectedWalletId} onValueChange={(v) => { setWalletId(v); setPage(1); }}>
                <SelectTrigger className="rounded-lg sm:w-48" disabled>
                  <SelectValue placeholder={t`Selecciona wallet`} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value={selectableWallet.id}>
                    {selectableWallet.alias ?? selectableWallet.currency ?? selectableWallet.id}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />

              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="rounded-lg sm:w-40">
                  <SelectValue placeholder={t`Tipo`} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value={ALL_FILTER}><Trans>Todos</Trans></SelectItem>
                  <SelectItem value="DEPOSIT"><Trans>Depósito</Trans></SelectItem>
                  <SelectItem value="WITHDRAWAL"><Trans>Retiro</Trans></SelectItem>
                  <SelectItem value="TRANSFER_IN"><Trans>Entrada</Trans></SelectItem>
                  <SelectItem value="TRANSFER_OUT"><Trans>Salida</Trans></SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); }}>
                <SelectTrigger className="rounded-lg sm:w-40">
                  <SelectValue placeholder={t`Estado`} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value={ALL_FILTER}><Trans>Todos</Trans></SelectItem>
                  {STATUS_FILTERS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(typeFilter !== ALL_FILTER || statusFilter !== ALL_FILTER) && (
                <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-xs">
                  <Trans>Limpiar</Trans>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-base font-semibold">
                  <Trans>Error al cargar movimientos</Trans>
                </p>
                <p className="text-sm text-muted-foreground mt-1">{mapError(error).message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading skeletons */}
      {(isLoading || walletsLoading) && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-brand-gradient p-px">
              <div className="rounded-[calc(0.75rem+3px)] bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                  <Skeleton className="h-6 w-28" />
                </div>
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !walletsLoading && !error && txList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <History className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-heading font-semibold mb-2">
            <Trans>Sin movimientos.</Trans>
          </h3>
          <p className="text-muted-foreground max-w-md">
            <Trans>Tus movimientos aparecerán aquí una vez que realices operaciones.</Trans>
          </p>
        </div>
      )}

      {/* Filtered-out state */}
      {!isLoading && !walletsLoading && !error && txList.length > 0 && visibleList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Filter className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            <Trans>Ningún movimiento coincide con el filtro.</Trans>
          </p>
        </div>
      )}

      {/* Transaction cards */}
      {!isLoading && !walletsLoading && txList.length > 0 && (
        <>
          <div className="space-y-3">
            {visibleList.map((tx, index) => {
              const tConfig = typeConfig(tx.type);
              const TypeIcon = tConfig.icon;
              const isOut = tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER_OUT';
              const counterparty = isOut ? tx.destination : tx.source;
              const counterpartyLabel = formatEndpoint(counterparty);
              const secondaryLabel = formatEndpointSecondary(counterparty);
              const statusCfg = statusConfig(tx.state);

              return (
                <motion.div
                  key={tx.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedTx(tx)}
                    className={cn(
                      'w-full text-left rounded-xl border border-border/50 bg-card',
                      'p-4 space-y-3 transition-colors duration-150',
                      'hover:bg-accent/50 hover:border-border',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                      'active:scale-[0.99]',
                    )}
                  >
                    {/* Top row: date + status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground font-mono tabular-nums">
                        {new Date(tx.created_at).toLocaleString('es-CO', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <Badge variant={statusCfg.variant} className="text-[10px] px-1.5 py-0">
                        {statusCfg.label}
                      </Badge>
                    </div>

                    {/* Middle row: type + amount */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                            tx.state === 'completed' && 'bg-success/10',
                            tx.state === 'in_review' && 'bg-destructive/10',
                            tx.state === 'in_progress' && 'bg-warning/10',
                          )}
                        >
                          <TypeIcon
                            className={cn(
                              'h-4 w-4',
                              tx.state === 'completed' && 'text-success',
                              tx.state === 'in_review' && 'text-destructive',
                              tx.state === 'in_progress' && 'text-warning',
                            )}
                          />
                        </div>
                        <Badge variant={tConfig.variant} className="gap-1">
                          {tConfig.label}
                        </Badge>
                      </div>
                      <span className="font-mono tabular-nums font-semibold text-base md:text-lg">
                        {isOut ? '-' : '+'}
                        {Number(tx.amount).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        <span className="text-xs font-normal text-muted-foreground ml-1 uppercase">
                          {tx.currency}
                        </span>
                      </span>
                    </div>

                    {/* Bottom row: description or counterparty */}
                    {(tx.description || counterpartyLabel) && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {tx.description && (
                          <span className="truncate">{tx.description}</span>
                        )}
                        {tx.description && counterpartyLabel && <span>·</span>}
                        {counterpartyLabel && (
                          <span className="truncate">{counterpartyLabel}</span>
                        )}
                        {secondaryLabel && (
                          <span className="truncate hidden sm:inline">· {secondaryLabel}</span>
                        )}
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                <Trans>
                  Página {pagination.page} de {pagination.totalPages}
                </Trans>
                {' · '}
                <span className="font-mono tabular-nums">{pagination.total}</span>{' '}
                <Trans>movimientos</Trans>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  disabled={!pagination.hasMore}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Auto-refresh indicator */}
          {hasPendingTx && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <Trans>Actualizando automáticamente cada 30s</Trans>
            </div>
          )}
        </>
      )}

      {/* Transaction Detail Sheet */}
      <Sheet open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <SheetContent className="sm:max-w-lg rounded-l-xl border-l border-border overflow-y-auto">
          {selectedTx && (
            <TransactionDetail
              tx={selectedTx}
              typeConfig={typeConfig}
              statusConfig={statusConfig}
              onCopyId={handleCopyId}
              t={t}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function TransactionDetail({
  tx,
  typeConfig,
  statusConfig,
  onCopyId,
  t,
}: {
  tx: TransactionWithState;
  typeConfig: (type: string) => TypeConfig;
  statusConfig: (state: CustomerTransactionState) => StatusConfig;
  onCopyId: (id: string) => void;
  t: (template: TemplateStringsArray, ...args: unknown[]) => string;
}) {
  const tConfig = typeConfig(tx.type);
  const sConfig = statusConfig(tx.state);
  const TypeIcon = tConfig.icon;
  const StatusIcon =
    tx.state === 'completed'
      ? CheckCircle
      : tx.state === 'returned'
        ? History
        : tx.state === 'in_review'
          ? AlertCircle
          : Clock;

  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              tx.state === 'completed' && 'bg-success/10',
              tx.state === 'in_review' && 'bg-destructive/10',
              tx.state === 'in_progress' && 'bg-warning/10',
            )}
          >
            <StatusIcon
              className={cn(
                'w-6 h-6',
                tx.state === 'completed' && 'text-success',
                tx.state === 'in_review' && 'text-destructive',
                tx.state === 'in_progress' && 'text-warning',
              )}
            />
          </div>
          <div>
            <SheetTitle className="text-xl">
              <span className="font-mono tabular-nums">
                {tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER_OUT' ? '-' : '+'}
                {Number(tx.amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>{' '}
              <span className="text-sm uppercase text-muted-foreground">{tx.currency}</span>
            </SheetTitle>
            <SheetDescription>
              <Badge variant={tConfig.variant} className="gap-1 mt-1">
                <TypeIcon className="h-3 w-3" />
                {tConfig.label}
              </Badge>
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <Separator className="my-4" />

      <div className="space-y-4">
        <DetailRow label={t`Estado`}>
          <Badge variant={sConfig.variant}>{sConfig.label}</Badge>
        </DetailRow>

        <DetailRow label={t`ID de transacción`}>
          <button
            className="flex items-center gap-1.5 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
            onClick={() => onCopyId(tx.id)}
          >
            <span className="truncate max-w-45">{tx.id}</span>
            <Copy className="h-3.5 w-3.5 shrink-0" />
          </button>
        </DetailRow>

        {tx.description && (
          <DetailRow label={t`Descripción`}>
            <span className="text-sm">{tx.description}</span>
          </DetailRow>
        )}

        {tx.external_reference && (
          <DetailRow label={t`Referencia`}>
            <span className="text-sm font-mono">{tx.external_reference}</span>
          </DetailRow>
        )}

        <Separator />

        <DetailRow label={t`Fecha de creación`}>
          <span className="text-sm">
            {new Date(tx.created_at).toLocaleString()}
          </span>
        </DetailRow>

        {tx.completed_at && (
          <DetailRow label={t`Fecha de completado`}>
            <span className="text-sm">
              {new Date(tx.completed_at).toLocaleString()}
            </span>
          </DetailRow>
        )}

        {(tx.fee !== null && tx.fee !== undefined) && (
          <>
            <Separator />
            <DetailRow label={t`Comisión`}>
              <span className="font-mono tabular-nums text-sm">
                {Number(tx.fee).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                {tx.fee_currency && (
                  <span className="ml-1 text-muted-foreground uppercase">{tx.fee_currency}</span>
                )}
              </span>
            </DetailRow>
          </>
        )}

        {(tx.source || tx.destination) && (
          <>
            <Separator />
            {tx.source && (
              <DetailRow label={t`Origen`}>
                <EndpointDetail endpoint={tx.source} />
              </DetailRow>
            )}
            {tx.destination && (
              <DetailRow label={t`Destino`}>
                <EndpointDetail endpoint={tx.destination} />
              </DetailRow>
            )}
          </>
        )}
      </div>
    </>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}
