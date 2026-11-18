import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RotatingWordProps {
  words: string[];
  interval?: number;
  className?: string;
}

export function RotatingWord({ words, interval = 3000, className }: RotatingWordProps) {
  const [index, setIndex] = useState(0);

  const advance = useCallback(() => {
    setIndex((prev) => (prev + 1) % words.length);
  }, [words.length]);

  useEffect(() => {
    const id = setInterval(advance, interval);
    return () => clearInterval(id);
  }, [advance, interval]);

  return (
    <span className="inline-block relative">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={className}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
