import { motion } from 'framer-motion';
import { TrendingUp } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import { useClientIntakeStore } from '../../stores/client-intake-store';
import { VOLUME_RANGES, VOLUME_RANGE_LABELS, type VolumeRange } from '../../types';
import { lookupVolumeRate } from '../../data/wizard.data';

interface StepVolumeProps {
  onNext: () => void;
}

export function StepVolume({ onNext }: StepVolumeProps) {
  const { clientCountry, destinationCountry, setVolumeRange } = useClientIntakeStore();

  const handleSelect = (range: VolumeRange) => {
    setVolumeRange(range);
    onNext();
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8">
      <div className="grid w-full gap-3 sm:grid-cols-2">
        {VOLUME_RANGES.map((range) => {
          const rate = clientCountry && destinationCountry
            ? lookupVolumeRate(clientCountry, destinationCountry, range)
            : null;

          return (
            <motion.button
              key={range}
              onClick={() => handleSelect(range)}
              className={cn(
                'flex items-center justify-between gap-3 rounded-xl border-2 border-border bg-card px-5 py-4',
                'transition-colors duration-150 hover:border-primary',
              )}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {VOLUME_RANGE_LABELS[range]}
                </span>
              </div>
              {rate && (
                <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium font-mono tabular-nums text-success">
                  {rate}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
