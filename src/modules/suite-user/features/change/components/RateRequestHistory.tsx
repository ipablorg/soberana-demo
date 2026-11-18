/**
 * RateRequestHistory Component
 * 
 * Displays paginated history of rate requests with:
 * - Status badges (Active, Completed, Cancelled, Expired)
 * - Time/date display
 * - Amount and rate info
 * - Load more pagination
 * - "View full history" button
 */

import { useState } from 'react';
import { History, ChevronDown } from '@/shared/components/animated-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { cn } from '@/shared/lib/utils';
import { useRateRequestStore } from '../stores/useRateRequestStore';
import { RateRequest, RequestState } from '../types/bridge';
import { Badge } from '@/shared/components/ui/badge';

const STATUS_CONFIG: Record<RequestState, { label: string; className: string }> = {
  initial: {
    label: 'Activa',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  completed: {
    label: 'Completada',
    className: 'bg-success/10 text-success border-success/20',
  },
  cancelled: {
    label: 'Cancelada',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  expired: {
    label: 'Expirada',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

function formatTimestamp(seconds: number): string {
  const date = new Date(seconds * 1000);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ' • ' + date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface RateRequestHistoryProps {
  /** Show full pagination and all items by default */
  showPagination?: boolean;
}

export function RateRequestHistory({ showPagination = false }: RateRequestHistoryProps = {}) {
  const {
    history,
    historyPage,
    historyLimit,
    hasMoreHistory,
    isLoadingHistory,
    loadHistory,
  } = useRateRequestStore();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllHistory, setShowAllHistory] = useState(showPagination);
  
  const handleLoadMore = async () => {
    await loadHistory(historyPage + 1, historyLimit);
  };
  
  const displayedHistory = (showAllHistory || showPagination) ? history : history.slice(0, 5);
  
  if (history.length === 0) {
    return null;
  }
  
  return (
    <div className="rounded-xl border border-border bg-card">
      <Card className="rounded-xl border-none bg-card shadow-none">
        <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-foreground" />
            <CardTitle>Historial de Solicitudes</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0"
          >
            <ChevronDown className={cn(
              'w-4 h-4 transition-transform',
              isExpanded && 'rotate-180'
            )} />
          </Button>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <CardContent className="space-y-4">
              {/* History Table */}
              <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Par</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedHistory.map((request) => {
                      const status = STATUS_CONFIG[request.requestState];
                      const [currencyFrom, currencyTo] = request.currencyPair.split('-');
                      return (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium text-foreground">
                            {request.productName}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono tabular-nums">
                            {request.initialAmount > 0 
                              ? `${request.initialAmount.toLocaleString()} ${currencyFrom}`
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={status.className}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {request.currencyPair}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatTimestamp(request.createdAt._seconds)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {/* Action buttons */}
              {!showPagination && (
                <div className="flex gap-2 pt-2">
                  {/* Load more button */}
                  {!showAllHistory && hasMoreHistory && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadMore}
                      disabled={isLoadingHistory}
                      className="flex-1 rounded-lg"
                    >
                      {isLoadingHistory ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />
                          Un momento...
                        </>
                      ) : (
                        'Cargar más'
                      )}
                    </Button>
                  )}
                  
                  {/* View full history button */}
                  {!showAllHistory && history.length > 5 && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowAllHistory(true)}
                      className="flex-1 rounded-lg"
                    >
                      Ver historial completo ({history.length})
                    </Button>
                  )}
                  
                  {/* Collapse button */}
                  {showAllHistory && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllHistory(false)}
                      className="w-full rounded-lg"
                    >
                      Mostrar menos
                    </Button>
                  )}
                </div>
              )}
              
              {/* Pagination for dedicated page */}
              {showPagination && hasMoreHistory && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={handleLoadMore}
                    disabled={isLoadingHistory}
                    className="rounded-lg min-w-[200px]"
                  >
                    {isLoadingHistory ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Un momento...
                      </>
                    ) : (
                      `Cargar más (${history.length} de muchas)`
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
      </Card>
    </div>
  );
}

