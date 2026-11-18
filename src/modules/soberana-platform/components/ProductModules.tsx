import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { CheckCircle } from '@/shared/components/animated-icons';
import { Trans, useLingui } from '@lingui/react/macro';
import { usePlatformContent } from '../data/platform-content';
import type { ProductCategory } from '../types/platform.types';

export function ProductModules() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const { PRODUCTS, CATEGORY_LABELS, CATEGORY_FILTERS } = usePlatformContent();
  const { t } = useLingui();

  const filtered = activeCategory === 'all'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <section id="products" className="px-6 py-16 max-w-5xl mx-auto scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          <Trans>Modular Products</Trans>
        </p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          <Trans>11 products. One platform.</Trans>
        </h2>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          <Trans>
            Pick the modules your business needs. Deploy them together or independently.
            Each product is production-ready and white-label by default.
          </Trans>
        </p>
      </motion.div>

      {/* Category filter */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex flex-wrap gap-2 mb-8"
      >
        {CATEGORY_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActiveCategory(filter.id)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 border',
              activeCategory === filter.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted/50'
            )}
          >
            {filter.label}
          </button>
        ))}
      </motion.div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((product, i) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.2) }}
            className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 transition-colors duration-150 hover:bg-card/80"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/60">
                <product.icon className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex gap-1.5 flex-wrap justify-end">
                <Badge variant="secondary" className="text-xs capitalize">
                  {CATEGORY_LABELS[product.category]}
                </Badge>
                {product.badge && (
                  <Badge
                    variant={product.badge === 'AI' ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {product.badge}
                  </Badge>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-foreground mb-1">{product.label}</h3>
              <p className="text-xs text-muted-foreground mb-3 italic">{product.tagline}</p>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {product.description}
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-1.5 pt-3 border-t border-border/50">
              {product.features.slice(0, 3).map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
              {product.features.length > 3 && (
                <li className="text-xs text-muted-foreground/60 pl-5.5">
                  {t`+${product.features.length - 3} more`}
                </li>
              )}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
