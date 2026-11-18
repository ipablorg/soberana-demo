import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

interface NetworkSourcesProps {
  text: string;
  dark?: boolean;
}

/** Nota de fuentes al pie de un slide. */
export function NetworkSources({ text, dark }: NetworkSourcesProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className={cn(
        "mt-6 block font-mono text-xs uppercase tracking-wider",
        dark ? "text-background/40" : "text-muted-foreground/60",
      )}
    >
      {text}
    </motion.span>
  );
}
