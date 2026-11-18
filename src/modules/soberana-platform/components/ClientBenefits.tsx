import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { CheckCircle } from '@/shared/components/animated-icons';
import { Trans, useLingui } from '@lingui/react/macro';
import { usePlatformContent } from '../data/platform-content';
import type { ClientType } from '../types/platform.types';

export function ClientBenefits() {
  const [activeClient, setActiveClient] = useState<ClientType>('banks');
  const { CLIENT_TYPES, PRODUCTS } = usePlatformContent();
  const { t } = useLingui();

  const client = CLIENT_TYPES.find((c) => c.id === activeClient)!;

  const relevantProducts = PRODUCTS.filter(
    (p) => p.clientBenefits[activeClient] !== undefined
  );

  return (
    <section id="clients" className="px-6 py-16 max-w-5xl mx-auto scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          <Trans>For Your Business</Trans>
        </p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          <Trans>Built for every financial institution</Trans>
        </h2>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          <Trans>
            Whether you are a bank, a fintech, a wallet provider, or a corporate treasury —
            Soberana has a solution tailored to your growth stage and compliance needs.
          </Trans>
        </p>
      </motion.div>

      {/* Client type tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CLIENT_TYPES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveClient(c.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 border',
              activeClient === c.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted/50'
            )}
          >
            <c.icon className="h-4 w-4 shrink-0" />
            {c.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeClient}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Client profile card */}
          <div className="lg:col-span-1 rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted/60">
                <client.icon className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">{client.label}</h3>
            </div>

            <p className="text-sm font-medium text-foreground leading-snug">
              {client.tagline}
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  <Trans>The challenge</Trans>
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {client.painPoint}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  <Trans>Soberana's answer</Trans>
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {client.solution}
                </p>
              </div>
            </div>
          </div>

          {/* Product benefits list */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t`How each product serves ${client.label}`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relevantProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                      <product.icon className="h-4 w-4 text-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{product.label}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {product.clientBenefits[activeClient]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
