import { useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, Send, Globe } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { useClientIntakeStore, type LocalService } from '../../stores/client-intake-store';
import { getAvailableNeeds, COUNTRY_FLAGS, type CountryNeed } from '../../data/wizard.data';

interface StepNeedsProps {
  onNext: () => void;
}

const NEED_ICONS: Record<string, React.ElementType> = {
  collection: Banknote,
  disbursement: Send,
  international: Globe,
};

export function StepNeeds({ onNext }: StepNeedsProps) {
  const { clientCountry, localServices, needsInternational, setNeeds } =
    useClientIntakeStore();
  const availableNeeds = getAvailableNeeds(clientCountry ?? '');

  const [selectedLocal, setSelectedLocal] = useState<LocalService[]>(localServices);
  const [selectedIntl, setSelectedIntl] = useState(needsInternational);

  const toggle = (need: CountryNeed) => {
    if (need.id === 'international') {
      setSelectedIntl((prev) => !prev);
    } else {
      const localId = need.id as LocalService;
      setSelectedLocal((prev) =>
        prev.includes(localId) ? prev.filter((s) => s !== localId) : [...prev, localId],
      );
    }
  };

  const isSelected = (need: CountryNeed): boolean => {
    if (need.id === 'international') return selectedIntl;
    return selectedLocal.includes(need.id);
  };

  const canContinue = selectedLocal.length > 0 || selectedIntl;

  const handleContinue = () => {
    if (!canContinue) return;
    setNeeds(selectedLocal, selectedIntl);
    onNext();
  };

  const flag = COUNTRY_FLAGS[clientCountry ?? ''] ?? '';

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8">
      <div className="flex w-full flex-col gap-3">
        {availableNeeds.map((need) => {
          const Icon = NEED_ICONS[need.id] ?? Globe;
          const active = isSelected(need);

          return (
            <motion.button
              key={need.id}
              onClick={() => toggle(need)}
              className={cn(
                'flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors duration-150',
                active
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/40',
              )}
            >
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors',
                  active ? 'bg-primary/10' : 'bg-muted',
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{need.label}</p>
                <p className="text-xs text-muted-foreground">{need.description}</p>
              </div>
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-150',
                  active
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30',
                )}
              >
                {active && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-3 w-3 text-primary-foreground"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <Button
        variant="gradient"
        onClick={handleContinue}
        disabled={!canContinue}
      >
        Continuar
      </Button>
    </div>
  );
}
