import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { useClientIntakeStore } from '../../stores/client-intake-store';
import { COUNTRY_FLAGS, getWizardCountries } from '../../data/wizard.data';

interface StepCountryProps {
  onNext: () => void;
}

export function StepCountry({ onNext }: StepCountryProps) {
  const { setClientCountry } = useClientIntakeStore();
  const countries = getWizardCountries();

  const handleSelect = (country: string) => {
    setClientCountry(country);
    onNext();
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8">
      <div className="grid w-full gap-3 grid-cols-2 sm:grid-cols-3">
        {countries.map((country) => (
          <motion.button
            key={country}
            onClick={() => handleSelect(country)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-card p-5',
              'transition-colors duration-150 hover:border-primary',
            )}
          >
            <span className="text-3xl">{COUNTRY_FLAGS[country] ?? '🏳️'}</span>
            <span className="text-sm font-medium text-foreground">{country}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
