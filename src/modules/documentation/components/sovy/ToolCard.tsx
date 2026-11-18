import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

export interface ToolCardProps {
  icon: string;
  name: string;
  description: string;
  example?: string;
  className?: string;
}

export function ToolCard({
  icon,
  name,
  description,
  example,
  className,
}: ToolCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className={cn(
        'rounded-xl border border-border/40 bg-card/60 backdrop-blur-md p-5',
        'cursor-pointer transition-colors duration-200',
        className,
      )}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 leading-none mt-0.5">{icon}</span>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-foreground">{name}</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {hovered && example && (
          <motion.div
            className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground italic"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            &ldquo;{example}&rdquo;
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
