/**
 * Transaction History Component
 *
 * Displays transaction history with real-time status updates.
 * Shows PENDING, COMPLETED, FAILED states from backend.
 */

import { useEffect } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from '@/shared/components/animated-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Transaction Status (from backend entity)
 */
export type TransactionStatus =
  'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REJECTED' | 'CANCELLED';

/**
 * Transaction Entity (aligned with backend)
 */
export interface Transaction {
  id: string;
  uid: string;
  rateRequestId?: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  failureReason?: string;
  // Custody provider fields
  custodyTransactionId?: string;
  custodyStatus?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const statusConfigBase: Record<
  TransactionStatus,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    labelKey: TransactionStatus;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  PENDING: {
    icon: Clock,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    labelKey: 'PENDING',
    variant: 'secondary',
  },
  PROCESSING: {
    icon: TrendingUp,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    labelKey: 'PROCESSING',
    variant: 'secondary',
  },
  COMPLETED: {
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/10',
    labelKey: 'COMPLETED',
    variant: 'default',
  },
  FAILED: {
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    labelKey: 'FAILED',
    variant: 'destructive',
  },
  REJECTED: {
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    labelKey: 'REJECTED',
    variant: 'destructive',
  },
  CANCELLED: {
    icon: AlertTriangle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    labelKey: 'CANCELLED',
    variant: 'outline',
  },
};

function useStatusLabels() {
  const { t } = useLingui();
  const labels: Record<TransactionStatus, string> = {
    PENDING: t`Pendiente`,
    PROCESSING: t`En proceso`,
    COMPLETED: t`Completada`,
    FAILED: t`Fallida`,
    REJECTED: t`Rechazada`,
    CANCELLED: t`Cancelada`,
  };
  return labels;
}

export function TransactionHistory({
  transactions,
  isLoading = false,
  onRefresh,
}: TransactionHistoryProps) {
  const { t } = useLingui();
  const statusLabels = useStatusLabels();
  // Auto-refresh every 30 seconds if there are pending transactions
  useEffect(() => {
    const hasPending = transactions.some(
      (tx) => tx.status === 'PENDING' || tx.status === 'PROCESSING'
    );

    if (hasPending && onRefresh) {
      const interval = setInterval(onRefresh, 30000);
      return () => clearInterval(interval);
    }
  }, [transactions, onRefresh]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Trans>Historial de transacciones</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Trans>Historial de transacciones</Trans>
          </CardTitle>
          <CardDescription>
            <Trans>Tus operaciones aparecerán aquí.</Trans>
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          <Trans>Historial de transacciones</Trans>
        </CardTitle>
        <CardDescription>
          {transactions.length} {transactions.length !== 1 ? t`transacciones` : t`transacción`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx, index) => {
            const config = statusConfigBase[tx.status];
            const Icon = config.icon;

            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className={`rounded-lg border p-4 ${config.bgColor} border-border/50`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-full p-1.5 ${config.bgColor}`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {tx.fromCurrency} → {tx.toCurrency}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.createdAt), "d 'de' MMM, HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={config.variant}>{statusLabels[tx.status]}</Badge>
                  </div>

                  <Separator className="my-3" />

                  {/* Transaction Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">
                        <Trans>Monto enviado</Trans>
                      </p>
                      <p className="font-semibold font-mono tabular-nums mt-0.5">
                        {tx.fromAmount.toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 8,
                        })}{' '}
                        {tx.fromCurrency}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        <Trans>Monto recibido</Trans>
                      </p>
                      <p className="font-semibold font-mono tabular-nums mt-0.5">
                        {tx.toAmount.toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        {tx.toCurrency}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          <Trans>Tasa de cambio</Trans>
                        </span>
                        <span className="font-medium font-mono tabular-nums">
                          1 {tx.fromCurrency} = {tx.exchangeRate.toFixed(2)} {tx.toCurrency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Failure Reason */}
                  {tx.status === 'FAILED' && tx.failureReason && (
                    <div className="mt-3 text-xs text-destructive">
                      <span className="font-medium">
                        <Trans>Razón:</Trans>
                      </span>{' '}
                      {tx.failureReason}
                    </div>
                  )}

                  {/* Completion Time */}
                  {tx.completedAt && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      {t`Completada`}:{' '}
                      {format(new Date(tx.completedAt), "d 'de' MMM, HH:mm", { locale: es })}
                    </div>
                  )}

                  {/* Transaction ID */}
                  <div className="mt-3 text-xs text-muted-foreground font-mono">ID: {tx.uid}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
