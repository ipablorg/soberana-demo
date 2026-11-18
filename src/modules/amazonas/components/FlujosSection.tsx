/**
 * FlujosSection — Análisis financiero del Business Plan de Loopay.
 * Tabs: Estado de Resultados, Balance General, Cash Flow, Gráficos.
 */

import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Table2, BarChart3, Landmark, Wallet } from '@/shared/components/animated-icons';

import { FlujosKpiCards } from '@/modules/amazonas/components/FlujosKpiCards';
import { FlujosCharts } from '@/modules/amazonas/components/FlujosCharts';
import { FlujosDataTable } from '@/modules/amazonas/components/FlujosDataTable';
import { FlujosExportDropdown } from '@/modules/amazonas/components/FlujosExportDropdown';

import {
  incomeStatementData,
  balanceSheetData,
  cashFlowData,
  flujosKpiSummary,
  grossProfitSeries,
  ebitdaSeries,
  transactionVolumeSeries,
  revenueBreakdown,
} from '@/modules/amazonas/data/flujos.data';

export function FlujosSection() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Flujos</h1>
        <p className="text-muted-foreground">
          Business Plan Loopay — Proyecciones financieras 2021–2030.
        </p>
      </motion.div>

      <Tabs defaultValue="income" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-4 h-11 rounded-xl border border-border bg-card/80 p-1 gap-1">
          <TabsTrigger
            value="income"
            className="gap-2 rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=inactive]:text-muted-foreground"
          >
            <Table2 className="h-4 w-4" />
            <span className="hidden sm:inline">Income Statement</span>
            <span className="sm:hidden">P&L</span>
          </TabsTrigger>
          <TabsTrigger
            value="balance"
            className="gap-2 rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=inactive]:text-muted-foreground"
          >
            <Landmark className="h-4 w-4" />
            <span className="hidden sm:inline">Balance Sheet</span>
            <span className="sm:hidden">Balance</span>
          </TabsTrigger>
          <TabsTrigger
            value="cashflow"
            className="gap-2 rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=inactive]:text-muted-foreground"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Cash Flow</span>
            <span className="sm:hidden">Cash</span>
          </TabsTrigger>
          <TabsTrigger
            value="charts"
            className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=inactive]:bg-primary/10 data-[state=inactive]:text-primary data-[state=inactive]:border data-[state=inactive]:border-primary/30"
          >
            <BarChart3 className="h-4 w-4" />
            Gráficos
          </TabsTrigger>
        </TabsList>

        {/* Income Statement Tab */}
        <TabsContent value="income" className="mt-6">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <section className="space-y-4">
              <h2 className="font-heading text-lg font-semibold text-foreground border-b border-border pb-2">
                KPIs proyectados
              </h2>
              <FlujosKpiCards summary={flujosKpiSummary} />
            </section>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-heading font-semibold text-foreground">
                Estado de Resultados
              </h2>
              <FlujosExportDropdown />
            </div>
            <FlujosDataTable
              title="Income Statement"
              rows={incomeStatementData.rows}
              periods={incomeStatementData.periods}
            />
          </motion.section>
        </TabsContent>

        {/* Balance Sheet Tab */}
        <TabsContent value="balance" className="mt-6">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-heading font-semibold text-foreground">
                Balance General
              </h2>
              <FlujosExportDropdown />
            </div>
            <FlujosDataTable
              title="Balance Sheet"
              rows={balanceSheetData.rows}
              periods={balanceSheetData.periods}
            />
          </motion.section>
        </TabsContent>

        {/* Cash Flow Tab */}
        <TabsContent value="cashflow" className="mt-6">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-heading font-semibold text-foreground">
                Flujo de Caja
              </h2>
              <FlujosExportDropdown />
            </div>
            <FlujosDataTable
              title="Cash Flow"
              rows={cashFlowData.rows}
              periods={cashFlowData.periods}
            />
          </motion.section>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-10"
          >
            <section className="space-y-6">
              <h2 className="font-heading text-lg font-semibold text-foreground border-b border-border pb-2">
                Proyecciones gráficas
              </h2>
              <FlujosCharts
                grossProfitSeries={grossProfitSeries}
                ebitdaSeries={ebitdaSeries}
                transactionVolumeSeries={transactionVolumeSeries}
                revenueBreakdown={revenueBreakdown}
              />
            </section>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
