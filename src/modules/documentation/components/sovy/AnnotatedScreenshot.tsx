import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

export interface Annotation {
  x: string;
  y: string;
  label: string;
}

export interface AnnotatedScreenshotProps {
  src: string;
  alt: string;
  annotations: Annotation[];
  className?: string;
}

export function AnnotatedScreenshot({
  src,
  alt,
  annotations,
  className,
}: AnnotatedScreenshotProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden border border-border/50 shadow-sm',
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-cover"
        loading="lazy"
      />

      {annotations.map((ann, i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: ann.x, top: ann.y, transform: 'translate(-50%, -50%)' }}
        >
          {/* Ping ring */}
          <motion.span
            className="absolute inset-0 w-3 h-3 rounded-full bg-primary/60"
            animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
          {/* Solid dot */}
          <span className="relative block w-3 h-3 rounded-full bg-primary ring-2 ring-background" />

          {/* Label */}
          <motion.span
            className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-xs font-medium text-foreground shadow-sm border border-border/40"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
          >
            {ann.label}
          </motion.span>
        </div>
      ))}
    </div>
  );
}
