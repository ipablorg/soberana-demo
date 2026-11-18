import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck } from '@/shared/components/animated-icons';
import type { VaultRisk } from '../../content/vaults-content';

export interface RiskSafeguardPairProps {
  item: VaultRisk;
  index: number;
}

export function RiskSafeguardPair({ item, index }: RiskSafeguardPairProps) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
    >
      {/* Risk */}
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <h4 className="font-semibold text-foreground text-sm">{item.risk}</h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {item.riskDescription}
        </p>
      </div>

      {/* Safeguard */}
      <div className="rounded-xl border border-success/20 bg-success/5 p-5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-4 w-4 text-success" />
          <h4 className="font-semibold text-foreground text-sm">{item.safeguard}</h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {item.safeguardDescription}
        </p>
      </div>
    </motion.div>
  );
}
