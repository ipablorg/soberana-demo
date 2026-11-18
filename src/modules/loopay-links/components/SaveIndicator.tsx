import { motion, AnimatePresence } from 'framer-motion';
import { Check, Cloud } from '@/shared/components/animated-icons';

interface SaveIndicatorProps {
  isSaving: boolean;
}

/**
 * SaveIndicator - Shows autosave status in the editor
 * 
 * States:
 * - Saving: Cloud icon with animated dots
 * - Saved: Check icon with green color
 */
export function SaveIndicator({ isSaving }: SaveIndicatorProps) {
  return (
    <AnimatePresence mode="wait">
      {isSaving ? (
        <motion.div
          key="saving"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Cloud className="w-4 h-4 animate-pulse" />
          <span className="font-body">Saving...</span>
        </motion.div>
      ) : (
        <motion.div
          key="saved"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="flex items-center gap-2 text-sm text-success"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Check className="w-4 h-4" />
          </motion.div>
          <span className="font-body">Saved</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

