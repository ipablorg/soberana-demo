import { motion } from 'framer-motion';
import { Sparkles, X } from '@/shared/components/animated-icons';
import { useClientIntakeStore } from '../stores/client-intake-store';
import { COUNTRY_FLAGS } from '../data/wizard.data';
import { VOLUME_RANGE_LABELS } from '../types';

export function IntakeBanner() {
  const store = useClientIntakeStore();

  if (!store.completed) return null;

  const parts: string[] = [];
  if (store.companyName) parts.push(store.companyName);
  if (store.clientCountry) {
    parts.push(`${COUNTRY_FLAGS[store.clientCountry] ?? ''} ${store.clientCountry}`);
  }
  if (store.corridor) parts.push(store.corridor);
  if (store.destinationCountry) {
    parts.push(`→ ${COUNTRY_FLAGS[store.destinationCountry] ?? ''} ${store.destinationCountry}`);
  }
  if (store.volumeRange) parts.push(VOLUME_RANGE_LABELS[store.volumeRange]);
  if (store.applicableRate) parts.push(store.applicableRate);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5"
    >
      <div className="flex items-center gap-2 text-xs text-foreground">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span>
          Propuesta para{' '}
          <strong>{parts.join(' · ')}</strong>
        </span>
      </div>
      <button
        onClick={() => store.reset()}
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-3 w-3" />
        Limpiar
      </button>
    </motion.div>
  );
}
