import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

interface NetworkPunchlineProps {
  text: string;
  dark?: boolean;
  delay?: number;
}

/** Línea de cierre destacada de un slide (borde con acento primario). */
export function NetworkPunchline({ text, dark, delay = 0.6 }: NetworkPunchlineProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "mt-8 rounded-lg border-l-2 border-primary px-5 py-4 font-heading text-base font-medium leading-relaxed md:text-lg",
        dark ? "bg-background/5 text-background" : "bg-card text-foreground",
      )}
    >
      {text}
    </motion.p>
  );
}
