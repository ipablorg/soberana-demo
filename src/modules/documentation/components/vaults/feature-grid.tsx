import type React from 'react';
import { motion } from 'framer-motion';
import { Zap, Scale, ShieldCheck } from '@/shared/components/animated-icons';
import { Card } from '@/shared/components/ui/card';
import type { VaultPillar } from '../../content/vaults-content';

const iconMap: Record<VaultPillar['icon'], React.ComponentType<{ className?: string }>> = {
  automation: Zap,
  neutral: Scale,
  safeguard: ShieldCheck,
};

export interface FeatureGridProps {
  pillars: VaultPillar[];
}

export function FeatureGrid({ pillars }: FeatureGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {pillars.map((pillar, index) => {
        const Icon = iconMap[pillar.icon];
        return (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{pillar.title}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
