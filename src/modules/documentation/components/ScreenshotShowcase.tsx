import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

export interface ScreenshotShowcaseProps {
  src: string;
  alt: string;
  badge: string;
  caption: string;
  className?: string;
}

export function ScreenshotShowcase({
  src,
  alt,
  badge,
  caption,
  className,
}: ScreenshotShowcaseProps) {
  return (
    <motion.figure
      className={cn(
        'group rounded-xl border border-border/50 shadow-sm overflow-hidden bg-card',
        className,
      )}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="relative">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto object-cover transition-transform duration-150"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
          {badge}
        </span>
      </div>
      <figcaption className="px-4 py-3 text-sm text-muted-foreground">
        {caption}
      </figcaption>
    </motion.figure>
  );
}
