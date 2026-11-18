import { motion } from 'framer-motion';
import { Wallet, FileCheck, Rocket, BarChart3, ArrowDownToLine } from '@/shared/components/animated-icons';
import { Card } from '@/shared/components/ui/card';
import { Callout } from '../Callout';
import type { VaultStep } from '../../content/vaults-content';

const iconMap: Record<VaultStep['icon'], typeof Wallet> = {
  wallet: Wallet,
  certificate: FileCheck,
  rocket: Rocket,
  chart: BarChart3,
  redeem: ArrowDownToLine,
};

export interface StepCardProps {
  step: VaultStep;
  index: number;
}

export function StepCard({ step, index }: StepCardProps) {
  const Icon = iconMap[step.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.12 }}
    >
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-full bg-foreground flex items-center justify-center text-background font-bold">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-5 w-5 text-primary" />
              <h4 className="text-lg font-bold text-foreground">{step.title}</h4>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-3">
              {step.description}
            </p>
            {step.detail && (
              <Callout variant="tip">
                <p>{step.detail}</p>
              </Callout>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
