import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { TypewriterText } from '@/shared/components/common/TypewriterText';
import { Trans, useLingui } from '@lingui/react/macro';

interface ServiceDef {
  id: string;
  label: string;
}

const SERVICE_DEFS: ServiceDef[] = [
  { id: 'cross-border', label: 'Cross-border' },
  { id: 'ramps', label: 'On / Off Ramp' },
  { id: 'payments', label: 'Pay-in / Pay-out' },
  { id: 'cards', label: 'Cards' },
  { id: 'smart-treasury', label: 'Smart Treasury' },
  { id: 'vaults', label: 'Vaults' },
];

function useServiceDescriptions(): Record<string, string> {
  const { t } = useLingui();
  return {
    'cross-border': t`Send and receive international payments in seconds. Competitive exchange rates with full regulatory compliance.`,
    'ramps': t`Convert between fiat and crypto instantly. Integrated on-ramps and off-ramps for your operation.`,
    'payments': t`Receive and disburse funds globally — clients, vendors, partners, or payroll. Multiple methods, guaranteed settlement, one integration.`,
    'cards': t`Virtual and physical corporate cards. Full control of business expenses in real time.`,
    'smart-treasury': t`Automated treasury management. Optimize your liquidity and minimize exchange rate risk with artificial intelligence.`,
    'vaults': t`Institutional custody of digital assets. Military-grade security with flexible on-demand access.`,
  };
}

interface ServiceTabsProps {
  onTabChange?: () => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export function ServiceTabs({ onTabChange, onLoginClick, onRegisterClick }: ServiceTabsProps) {
  const [activeId, setActiveId] = useState(SERVICE_DEFS[0].id);
  const descriptions = useServiceDescriptions();
  const active = SERVICE_DEFS.find((s) => s.id === activeId) ?? SERVICE_DEFS[0];

  const handleSelect = (service: ServiceDef) => {
    if (service.id === activeId) return;
    setActiveId(service.id);
    onTabChange?.(); // kept for backward compat
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar — wraps on smaller viewports instead of scroll */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl bg-muted/50 p-1.5">
        {SERVICE_DEFS.map((service) => (
          <button
            key={service.id}
            onClick={() => handleSelect(service)}
            className="relative px-3.5 py-2 rounded-lg whitespace-nowrap focus:outline-none"
          >
            {activeId === service.id && (
              <motion.span
                layoutId="service-tab-indicator"
                className="absolute inset-0 rounded-lg bg-background shadow-sm"
                transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
              />
            )}
            <span
              className={`relative z-10 text-sm transition-colors duration-150 ${
                activeId === service.id
                  ? 'font-medium text-foreground'
                  : 'font-normal text-muted-foreground'
              }`}
            >
              {service.label}
            </span>
          </button>
        ))}
      </div>

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="min-h-[80px]"
        >
          <p className="font-body font-light text-lg lg:text-xl text-muted-foreground leading-relaxed">
            <TypewriterText text={descriptions[active.id]} speed={25} delay={100} />
          </p>
        </motion.div>
      </AnimatePresence>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Button variant="gradient" size="lg" className="w-full sm:w-auto" onClick={onRegisterClick}>
          <Trans>Get started</Trans>
        </Button>
        <Button variant="ghost" size="lg" className="w-full sm:w-auto" onClick={onLoginClick}>
          <Trans>I already have an account</Trans>
        </Button>
      </div>
    </div>
  );
}
