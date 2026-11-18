import { motion } from 'framer-motion';
import { Card } from '@/shared/components/ui/card';
import { Sparkles } from '@/shared/components/animated-icons';
import type { ConversionExplainer } from '@/data/bank-instructions';

interface ConversionExplainerCardProps {
  conversion: ConversionExplainer;
}

export function ConversionExplainerCard({ conversion }: ConversionExplainerCardProps) {
  return (
    <Card className="overflow-hidden rounded-xl border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{conversion.title}</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{conversion.subtitle}</p>
      </div>
      <ol className="divide-y divide-border">
        {conversion.steps.map((step, index) => (
          <motion.li
            key={step.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut', delay: index * 0.04 }}
            className="px-5 py-4"
          >
            <p className="text-sm font-medium text-foreground">{step.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
          </motion.li>
        ))}
      </ol>
    </Card>
  );
}
