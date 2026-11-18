import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trans } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Layers, Plus, Zap, TrendingUp, DollarSign } from '@/shared/components/animated-icons';
import { StatsCard } from '@/shared/components/ui/stats-card';
import { WidgetCard } from '../components/studio/WidgetCard';
import { IntegrationMetrics } from '../components/studio/IntegrationMetrics';
import { useElementsStore } from '../stores/use-elements-store';
import type { MetricsPeriod } from '../types';

export function ElementsDashboard() {
  const navigate = useNavigate();
  const widgets = useElementsStore(s => s.widgets);
  const getMetrics = useElementsStore(s => s.getMetrics);
  const getChartData = useElementsStore(s => s.getChartData);
  const deleteWidget = useElementsStore(s => s.deleteWidget);
  const [period, setPeriod] = useState<MetricsPeriod>('30d');
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  const periodMetrics = widgets.map(w => getMetrics(w.id, period)).filter(Boolean);
  const activeWidgets = widgets.filter(w => w.status === 'published').length;
  const totalClicks = periodMetrics.reduce((s, m) => s + (m?.clicks ?? 0), 0);
  const totalRevenue = periodMetrics.reduce((s, m) => s + (m?.revenue ?? 0), 0);
  const avgConvRate = periodMetrics.length > 0
    ? periodMetrics.reduce((s, m) => s + (m?.conversionRate ?? 0), 0) / periodMetrics.length
    : 0;

  const selectedWidget = selectedWidgetId ? widgets.find(w => w.id === selectedWidgetId) : null;
  const selectedMetrics = selectedWidgetId ? getMetrics(selectedWidgetId, period) : undefined;
  const selectedChartData = selectedWidgetId ? getChartData(selectedWidgetId, period) : [];

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            <Trans>Elements Studio</Trans>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            <Trans>Configura y distribuye widgets de pago embebibles para tus partners.</Trans>
          </p>
        </div>
        <Button variant="gradient" onClick={() => navigate('/elements/builder/payment-button')}>
          <Plus className="mr-2 h-4 w-4" />
          <Trans>Nuevo Widget</Trans>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          title="Widgets activos"
          value={activeWidgets}
          icon={Layers}
          description={`${widgets.length} totales`}
        />
        <StatsCard
          title="Total clics"
          value={totalClicks.toLocaleString()}
          icon={Zap}
          trend={{ value: 12.4, isPositive: true, label: 'vs. mes ant.' }}
        />
        <StatsCard
          title="Conv. Rate"
          value={`${(avgConvRate * 100).toFixed(1)}%`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 8.1, isPositive: true, label: 'vs. mes ant.' }}
        />
      </div>

      {/* Widgets grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-foreground">
            <Trans>Tus Widgets</Trans>
          </h2>
          <Select value={period} onValueChange={v => setPeriod(v as MetricsPeriod)}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d"><Trans>7 días</Trans></SelectItem>
              <SelectItem value="30d"><Trans>30 días</Trans></SelectItem>
              <SelectItem value="90d"><Trans>90 días</Trans></SelectItem>
            </SelectContent>
          </Select>
        </div>

        {widgets.length === 0 ? (
          <EmptyState onCreateWidget={() => navigate('/elements/builder/payment-button')} />
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.07 } },
              hidden: {},
            }}
          >
            {widgets.map(widget => (
              <WidgetCard
                key={widget.id}
                widget={widget}
                metrics={getMetrics(widget.id, period)}
                onEdit={() => navigate(`/elements/builder/${widget.type}?edit=${widget.id}`)}
                onDelete={() => {
                  deleteWidget(widget.id);
                  if (selectedWidgetId === widget.id) setSelectedWidgetId(null);
                }}
                onPreview={() => navigate(`/elements/preview/${widget.id}`)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Widget detail metrics */}
      {widgets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-foreground">
              <Trans>Métricas detalladas</Trans>
            </h2>
            <Select
              value={selectedWidgetId ?? '__none__'}
              onValueChange={v => setSelectedWidgetId(v === '__none__' ? null : v)}
            >
              <SelectTrigger className="h-8 w-52 text-xs">
                <SelectValue placeholder="Seleccionar widget..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Seleccionar widget</SelectItem>
                {widgets.map(w => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedWidget && selectedMetrics ? (
            <IntegrationMetrics
              metrics={selectedMetrics}
              chartData={selectedChartData}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              <Trans>Selecciona un widget para ver sus métricas detalladas.</Trans>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ onCreateWidget }: { onCreateWidget: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 px-6 gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Layers className="h-7 w-7 text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold text-foreground"><Trans>Sin widgets todavía</Trans></p>
        <p className="text-sm text-muted-foreground mt-1">
          <Trans>Crea tu primer widget embebible en menos de 5 minutos.</Trans>
        </p>
      </div>
      <Button variant="gradient" onClick={onCreateWidget}>
        <Plus className="mr-2 h-4 w-4" />
        <Trans>Crear primer widget</Trans>
      </Button>
      <div className="flex items-center gap-4 mt-2">
        {['React', 'Vue', 'Vanilla JS', 'Web Component'].map(fw => (
          <Badge key={fw} variant="outline" className="text-xs">{fw}</Badge>
        ))}
      </div>
    </div>
  );
}
