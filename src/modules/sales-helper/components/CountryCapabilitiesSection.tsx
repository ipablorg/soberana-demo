import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe2, CheckCircle2, XCircle, AlertTriangle, ChevronDown } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import {
  COUNTRY_CAPABILITIES,
  COLLECTION_METHODS,
  DISBURSEMENT_METHODS,
} from '../data/country-capabilities.data';
import { useClientIntakeStore } from '../stores/client-intake-store';
import { IntakeBanner } from './IntakeBanner';

const statusConfig = {
  active: { label: 'Activo', icon: CheckCircle2, className: 'text-success' },
  limited: { label: 'Limitado', icon: AlertTriangle, className: 'text-warning' },
  'no-channel': { label: 'Sin canal', icon: XCircle, className: 'text-destructive' },
} as const;

export function CountryCapabilitiesSection() {
  const intake = useClientIntakeStore();
  const [expandedCountry, setExpandedCountry] = useState<number | null>(1);

  useEffect(() => {
    if (intake.completed && intake.originCountry) {
      const match = COUNTRY_CAPABILITIES.find((c) => c.country === intake.originCountry);
      if (match) setExpandedCountry(match.id);
    }
  }, [intake.completed, intake.originCountry]);

  return (
    <div className="space-y-8">
      <IntakeBanner />
      <header>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Globe2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Consolidado Comercial
            </h1>
            <p className="text-sm text-muted-foreground">
              Capacidad de pagos internacionales por país — corredores, tarifas, ANS y medios
            </p>
          </div>
        </div>
      </header>

      {/* Country accordion */}
      <section className="space-y-3">
        {COUNTRY_CAPABILITIES.map((country) => {
          const status = statusConfig[country.status];
          const StatusIcon = status.icon;
          const isExpanded = expandedCountry === country.id;

          return (
            <div
              key={country.id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <button
                onClick={() => setExpandedCountry(isExpanded ? null : country.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground">
                  {country.id}
                </span>
                <span className="flex-1 font-heading text-sm font-semibold text-foreground">
                  {country.country}
                </span>
                <StatusIcon className={cn('h-4 w-4', status.className)} />
                <Badge variant="outline" className="text-[10px]">
                  {country.corridors.length} corredor{country.corridors.length !== 1 ? 'es' : ''}
                </Badge>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="overflow-x-auto border-t border-border">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/30">
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Corredor</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Destino</th>
                            <th className="px-3 py-2 text-right font-medium text-muted-foreground">Tarifa</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Producto</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">ANS</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Operación</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Front</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Notas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {country.corridors.map((c, idx) => {
                            const isCorridorHighlighted =
                              intake.completed &&
                              intake.corridor &&
                              c.corridor === intake.corridor &&
                              c.destination === intake.destinationCountry;

                            return (
                            <tr
                              key={idx}
                              className={cn(
                                'border-t border-border/30 transition-colors hover:bg-muted/20',
                                isCorridorHighlighted && 'ring-2 ring-inset ring-primary bg-primary/5',
                              )}
                            >
                              <td className="px-3 py-2 font-medium text-foreground">{c.corridor}</td>
                              <td className="px-3 py-2 text-muted-foreground">{c.destination || '—'}</td>
                              <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                                {c.rate ?? '—'}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{c.product ?? '—'}</td>
                              <td className="px-3 py-2 text-muted-foreground">{c.sla ?? '—'}</td>
                              <td className="px-3 py-2">
                                {c.operationProcess === 'SIN CANAL' ? (
                                  <span className="text-destructive">Sin canal</span>
                                ) : c.operationProcess === 'Automático' ? (
                                  <span className="text-success">{c.operationProcess}</span>
                                ) : (
                                  <span className="text-muted-foreground">{c.operationProcess || '—'}</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{c.frontend || '—'}</td>
                              <td className="max-w-[180px] truncate px-3 py-2 text-muted-foreground">
                                {c.notes ?? ''}
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </section>

      {/* Payment Methods Matrices */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Métodos de Recaudo por País
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">País</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Tarjeta Crédito/Débito</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Link de Pago</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Transferencia Bancaria</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">QR</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Wallet</th>
              </tr>
            </thead>
            <tbody>
              {COLLECTION_METHODS.map((row) => (
                <tr key={row.country} className="border-t border-border/30">
                  <td className="px-4 py-2 font-medium text-foreground">{row.country}</td>
                  {[row.creditDebitCard, row.paymentLink, row.bankTransfer, row.qr, row.wallet].map(
                    (val, i) => (
                      <td key={i} className="px-4 py-2 text-center">
                        {val ? (
                          <CheckCircle2 className="mx-auto h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="mx-auto h-4 w-4 text-muted-foreground/30" />
                        )}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Métodos de Dispersión por País
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">País</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Transferencia Bancaria</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Wallet</th>
              </tr>
            </thead>
            <tbody>
              {DISBURSEMENT_METHODS.map((row) => (
                <tr key={row.country} className="border-t border-border/30">
                  <td className="px-4 py-2 font-medium text-foreground">{row.country}</td>
                  <td className="px-4 py-2 text-muted-foreground">{row.bankTransfer}</td>
                  <td className="px-4 py-2 text-center">
                    {row.wallet ? (
                      <CheckCircle2 className="mx-auto h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="mx-auto h-4 w-4 text-muted-foreground/30" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
