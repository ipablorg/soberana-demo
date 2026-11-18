import { motion } from 'framer-motion';
import { Package, Clock, ShieldCheck, CheckCircle2, XCircle, Star } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { PRODUCTS_2026, SERVICE_LEVEL_AGREEMENTS } from '../data/products.data';
import { useClientIntakeStore } from '../stores/client-intake-store';
import { IntakeBanner } from './IntakeBanner';

const productTypeBadge: Record<string, string> = {
  'Tesorería digital': 'bg-primary/10 text-primary',
  'Off Ramp': 'bg-warning/10 text-warning',
  'On Ramp': 'bg-success/10 text-success',
  COMEX: 'bg-accent-brand/10 text-accent-brand',
};

export function ProductCatalogSection() {
  const intake = useClientIntakeStore();
  const hasFilter = intake.completed && !!intake.productType;

  return (
    <div className="space-y-10">
      <IntakeBanner />
      <header>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Catálogo de Productos 2026
            </h1>
            <p className="text-sm text-muted-foreground">
              Productos, horarios, tiempos y precios mínimos de venta
            </p>
          </div>
        </div>
      </header>

      {/* Products Table */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Productos
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Producto</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Días</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Horario</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tiempo a destino</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Plataforma</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Precio mín.</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS_2026.map((product, idx) => {
                const isRecommended =
                  hasFilter &&
                  product.productType.toLowerCase().includes((intake.productType ?? '').toLowerCase());

                return (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={cn(
                    'border-b border-border/50 transition-colors hover:bg-muted/30',
                    isRecommended && 'bg-primary/5 ring-1 ring-inset ring-primary/20',
                  )}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    <span className="flex items-center gap-2">
                      {product.name}
                      {isRecommended && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          <Star className="h-2.5 w-2.5" />
                          Recomendado
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{product.days}</td>
                  <td className="px-4 py-3 text-muted-foreground">{product.schedule}</td>
                  <td className="px-4 py-3 text-muted-foreground">{product.deliveryTime}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${productTypeBadge[product.productType] ?? 'bg-muted text-muted-foreground'}`}>
                      {product.productType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {product.hasPlatform ? (
                      <CheckCircle2 className="mx-auto h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="mx-auto h-4 w-4 text-muted-foreground/50" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">
                    {product.minPrice}
                  </td>
                </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Notes under products */}
        <div className="flex flex-wrap gap-3">
          {PRODUCTS_2026.filter((p) => p.notes).map((product, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
            >
              <strong className="text-foreground">{product.name}:</strong>{' '}
              {product.notes}
            </div>
          ))}
        </div>
      </section>

      {/* SLA Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Acuerdos de Nivel de Servicio (ANS)
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_LEVEL_AGREEMENTS.map((sla, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-heading text-sm font-semibold text-foreground">
                  {sla.name}
                </h3>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  ANS
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{sla.schedule}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  <span className="text-muted-foreground">{sla.deliveryTime}</span>
                </div>
              </div>

              <p className="mt-auto border-t border-border/50 pt-2 text-[11px] leading-relaxed text-muted-foreground">
                {sla.notes}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
