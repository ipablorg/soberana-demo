/**
 * TransaccionesSection — Pestañas: Detalle (tabla) y Resumen y gráficas.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  fetchTxData,
  computeSummary,
  computeVolumeByMonth,
  computeVolumeByAsset,
} from '@/modules/amazonas/data/txdata';
import type { TxRow } from '@/modules/amazonas/types/txdata.types';
import type { VolumeByMonth, VolumeByAsset } from '@/modules/amazonas/types/txdata.types';
import { useAmazonasDashboard } from '@/modules/amazonas/context/AmazonasDashboardContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { TxKpiCards } from '@/modules/amazonas/components/TxKpiCards';
import { TxCharts } from '@/modules/amazonas/components/TxCharts';
import { TxDataTable } from '@/modules/amazonas/components/TxDataTable';
import { TxExportDropdown } from '@/modules/amazonas/components/TxExportDropdown';
import { Table2, BarChart3 } from '@/shared/components/animated-icons';

export function TransaccionesSection() {
  const ctx = useAmazonasDashboard();
  const [rows, setRows] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchTxData()
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No pudimos cargar los datos');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = computeSummary(rows);
  const volumeByMonth = computeVolumeByMonth(rows);
  const volumeByAsset = computeVolumeByAsset(rows);

  useEffect(() => {
    if (!ctx) return;
    ctx.setTxRows(rows);
    if (!loading && !error) {
      ctx.setTxSummary({
        totalOutboundFormatted: summary.totalOutboundFormatted,
        dateMin: summary.dateMin,
        dateMax: summary.dateMax,
      });
    } else if (error) {
      ctx.setTxSummary(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ctx omitted to prevent infinite loop
  }, [rows, loading, error, summary.totalOutboundFormatted, summary.dateMin, summary.dateMax]);

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Transacciones</h1>
        <p className="text-muted-foreground">
          Loopay LLC (Americas). Transacciones y resúmenes del período.
        </p>
      </motion.div>

      <Tabs defaultValue="detalle" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 h-11 rounded-xl border border-border bg-card/80 p-1 gap-1">
          <TabsTrigger
            value="detalle"
            className="gap-2 rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=inactive]:text-muted-foreground"
          >
            <Table2 className="h-4 w-4" />
            Detalle
          </TabsTrigger>
          <TabsTrigger
            value="resumen"
            className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=inactive]:bg-primary/10 data-[state=inactive]:text-primary data-[state=inactive]:border data-[state=inactive]:border-primary/30"
          >
            <BarChart3 className="h-4 w-4" />
            Resumen y gráficas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detalle" className="mt-6">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            {/* Resumen numérico en la primera vista */}
            <section className="space-y-4">
              <h2 className="font-heading text-lg font-semibold text-foreground border-b border-border pb-2">
                Resumen numérico
              </h2>
              <TxKpiCards summary={summary} />
            </section>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-heading font-semibold text-foreground">Detalle de transacciones</h2>
              <TxExportDropdown rows={rows} disabled={loading} />
            </div>
            <TxDataTable data={rows} isLoading={loading} />
          </motion.section>
        </TabsContent>

        <TabsContent value="resumen" className="mt-6">
          <TxResumenTab
            volumeByMonth={volumeByMonth}
            volumeByAsset={volumeByAsset}
            operationCounts={Object.entries(summary.operationCounts).map(([operation, count]) => ({ operation, count }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** Pestaña Resumen y gráficas: solo gráficas (Volumen por mes, por activo, por tipo). */
interface TxResumenTabProps {
  volumeByMonth: VolumeByMonth[];
  volumeByAsset: VolumeByAsset[];
  operationCounts: { operation: string; count: number }[];
}

function TxResumenTab({ volumeByMonth, volumeByAsset, operationCounts }: TxResumenTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-10"
    >
      {/* Solo gráficas; Volumen por mes y resto aquí */}
      <section className="space-y-6">
        <h2 className="font-heading text-lg font-semibold text-foreground border-b border-border pb-2">
          Gráficas
        </h2>
        <TxCharts
          volumeByMonth={volumeByMonth}
          volumeByAsset={volumeByAsset}
          operationCounts={operationCounts}
        />
      </section>
    </motion.div>
  );
}
