import { motion } from 'framer-motion';

export function OsTypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 px-4 py-3"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm">
        ✨
      </div>
      <div className="flex items-center gap-1.5 bg-secondary/50 rounded-xl rounded-bl-md px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut' as const,
            }}
          />
        ))}
        <span className="ml-2 text-xs text-muted-foreground">Soberana is thinking...</span>
      </div>
    </motion.div>
  );
}
