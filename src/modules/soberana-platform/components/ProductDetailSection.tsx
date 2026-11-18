import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { CheckCircle, ChevronDown } from '@/shared/components/animated-icons';
import { Trans } from '@lingui/react/macro';
import { usePlatformContent } from '../data/platform-content';
import type { ClientType } from '../types/platform.types';

export function ProductDetailSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { PRODUCTS, CLIENT_TYPES, CATEGORY_LABELS } = usePlatformContent();

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">
        <Trans>Product Deep Dive</Trans>
      </p>

      {PRODUCTS.map((product) => {
        const isOpen = expandedId === product.id;

        return (
          <div
            key={product.id}
            className={cn(
              'rounded-xl border transition-colors duration-150',
              isOpen ? 'border-border bg-card' : 'border-border/60 bg-card/50 hover:bg-card/80'
            )}
          >
            {/* Accordion trigger */}
            <button
              type="button"
              onClick={() => toggle(product.id)}
              className="w-full flex items-center gap-4 p-5 text-left"
              aria-expanded={isOpen}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/60">
                <product.icon className="h-5 w-5 text-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <p className="font-semibold text-foreground">{product.label}</p>
                  {product.badge && (
                    <Badge
                      variant={product.badge === 'AI' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {product.badge}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs capitalize">
                    {CATEGORY_LABELS[product.category]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{product.tagline}</p>
              </div>

              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Expanded content */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-0 border-t border-border/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-5">
                      {/* Description + features */}
                      <div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                          {product.description}
                        </p>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          <Trans>Key capabilities</Trans>
                        </p>
                        <ul className="space-y-2">
                          {product.features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Client benefits */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          <Trans>By client type</Trans>
                        </p>
                        <div className="space-y-3">
                          {(Object.keys(product.clientBenefits) as ClientType[]).map((clientId) => {
                            const clientInfo = CLIENT_TYPES.find((c) => c.id === clientId);
                            if (!clientInfo) return null;
                            return (
                              <div key={clientId} className="flex items-start gap-3">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/60 mt-0.5">
                                  <clientInfo.icon className="h-3.5 w-3.5 text-foreground" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-foreground mb-0.5">
                                    {clientInfo.label}
                                  </p>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {product.clientBenefits[clientId]}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
