import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Copy, ArrowRight, RotateCcw } from '@/shared/components/animated-icons';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { useClientIntakeStore } from '../../stores/client-intake-store';
import { COUNTRY_FLAGS } from '../../data/wizard.data';
import { VOLUME_RANGE_LABELS } from '../../types';

const LOCAL_SERVICE_LABELS: Record<string, string> = {
  collection: 'Cobrar (Recaudo)',
  disbursement: 'Pagar (Dispersiones)',
};

export function StepSummary() {
  const navigate = useNavigate();
  const store = useClientIntakeStore();
  const [copied, setCopied] = useState(false);

  const handleViewProposal = () => {
    store.complete();
    navigate('/ventas/catalogo');
  };

  const handleReset = () => {
    store.reset();
  };

  const flag = (country: string) => COUNTRY_FLAGS[country] ?? '';

  const buildShareText = (): string => {
    const lines = [
      `📋 *Propuesta Loopay — ${store.companyName}*`,
      '',
      `👤 Contacto: ${store.contactName}`,
      `🏢 Empresa: ${store.companyName}`,
      `📍 País: ${flag(store.clientCountry ?? '')} ${store.clientCountry}`,
    ];

    if (store.localServices.length > 0) {
      const labels = store.localServices.map((s) => LOCAL_SERVICE_LABELS[s] ?? s);
      lines.push(`🏦 Servicios locales: ${labels.join(', ')}`);
    }

    if (store.needsInternational) {
      lines.push('🌐 Internacional:');
      if (store.destinationCountry) {
        lines.push(
          `  📥 Destino: ${flag(store.destinationCountry)} ${store.destinationCountry}`,
        );
      }
      if (store.productType) lines.push(`  📦 Producto: ${store.productType}`);
      if (store.corridor) lines.push(`  🔄 Corredor: ${store.corridor}`);
    }

    if (store.volumeRange) {
      lines.push(`💰 Volumen mensual: ${VOLUME_RANGE_LABELS[store.volumeRange]}`);
    }
    if (store.applicableRate) {
      lines.push(`📊 Tarifa aplicable: ${store.applicableRate}`);
    }

    lines.push('', '🚀 Generado con Loopay Sales Helper');
    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: no-op */
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10"
      >
        <CheckCircle2 className="h-7 w-7 text-success" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full rounded-xl border border-border bg-card p-6"
      >
        <div className="space-y-4">
          <Row label="Contacto" value={store.contactName} />
          <Row label="Empresa" value={store.companyName} />
          <Row
            label="País"
            value={`${flag(store.clientCountry ?? '')} ${store.clientCountry ?? ''}`}
          />
          <div className="border-t border-border" />

          {store.localServices.length > 0 && (
            <Row
              label="Servicios locales"
              value={store.localServices.map((s) => LOCAL_SERVICE_LABELS[s] ?? s).join(', ')}
            />
          )}

          {store.needsInternational && (
            <>
              {store.destinationCountry && (
                <Row
                  label="Destino"
                  value={`${flag(store.destinationCountry)} ${store.destinationCountry}`}
                />
              )}
              {store.productType && <Row label="Producto" value={store.productType} />}
              {store.corridor && <Row label="Corredor" value={store.corridor} />}
            </>
          )}

          {store.volumeRange && (
            <>
              <div className="border-t border-border" />
              <Row
                label="Volumen mensual"
                value={VOLUME_RANGE_LABELS[store.volumeRange]}
              />
            </>
          )}
          {store.applicableRate && (
            <Row label="Tarifa aplicable" value={store.applicableRate} highlight />
          )}
        </div>
      </motion.div>

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <Button
          variant="gradient"
          onClick={handleViewProposal}
          className="flex-1"
        >
          Ver propuesta personalizada
          <ArrowRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4" />
          {copied ? '¡Copiado!' : 'Compartir resumen'}
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="h-3 w-3" />
        Empezar de nuevo
      </Button>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-right text-sm font-medium',
          highlight
            ? 'rounded-full bg-success/10 px-2.5 py-0.5 font-mono tabular-nums text-success'
            : 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  );
}
