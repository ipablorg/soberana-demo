/**
 * SoberanaCardPreview — static visual of the Soberana digital card.
 *
 * No data fetching, no wallet: this is the pre-application preview
 * shown on the Soberana Card page. Silhouette mirrors the card-pro
 * inline card (`aspect-[1.586/1] rounded-xl bg-foreground`) so the
 * product family reads consistently.
 */

import { motion } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';

import { CreditCard } from '@/shared/components/animated-icons';
import { useAuthStore } from '@/shared/stores/auth-store';
import { cn } from '@/shared/lib/utils';

export interface SoberanaCardPreviewProps {
  className?: string;
}

export function SoberanaCardPreview({ className }: SoberanaCardPreviewProps) {
  const { t } = useLingui();
  const userName = useAuthStore((s) => s.user?.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'relative w-full overflow-hidden rounded-xl bg-foreground p-6 text-background shadow-sm',
        'aspect-[1.586/1]',
        className,
      )}
    >
      {/* Decorative depth circles */}
      <div
        aria-hidden
        className="absolute top-0 right-0 w-40 h-40 rounded-full bg-background/10 -mr-20 -mt-20"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-background/5 -ml-16 -mb-16"
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-8 h-8" />
            <span className="font-bold text-lg">Soberana</span>
          </div>
        </div>

        <p className="text-xl font-mono tracking-wider">
          {'•••• •••• •••• ••••'}
        </p>

        <div className="flex items-end justify-between">
          <div className="min-w-0">
            <p className="text-xs opacity-70 truncate uppercase">
              {userName || t`Soberana User`}
            </p>
            <p className="font-mono text-sm mt-1">12/29</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-xs opacity-70">CVV</p>
            <p className="font-mono text-sm">{'•••'}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
