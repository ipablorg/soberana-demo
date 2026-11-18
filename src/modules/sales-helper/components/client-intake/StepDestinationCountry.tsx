import { Trans } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { useClientIntakeStore } from '../../stores/client-intake-store';
import { COUNTRY_FLAGS, getAvailableDestinations } from '../../data/wizard.data';

interface StepDestinationCountryProps {
  onNext: () => void;
}

export function StepDestinationCountry({ onNext }: StepDestinationCountryProps) {
  const { clientCountry, setDestination } = useClientIntakeStore();
  const destinations = getAvailableDestinations(clientCountry ?? '');

  const handleSelect = (country: string) => {
    setDestination(country);
    onNext();
  };

  if (destinations.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          <Trans>Sin destinos disponibles desde {clientCountry}</Trans>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8">
      <div className="grid w-full gap-3 grid-cols-2 sm:grid-cols-3">
        {destinations.map((dest) => (
          <motion.button
            key={dest}
            onClick={() => handleSelect(dest)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-card p-5',
              'transition-colors duration-150 hover:border-primary',
            )}
          >
            <span className="text-3xl">{COUNTRY_FLAGS[dest] ?? '🏳️'}</span>
            <span className="text-sm font-medium text-foreground">{dest}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
