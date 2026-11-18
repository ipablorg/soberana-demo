import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

interface NetworkSectionHeadingProps {
  sectionLabel: string;
  headline: string;
  subheadline?: string;
  dark?: boolean;
  className?: string;
}

/** Encabezado estándar de slide: label mono + headline + subheadline. */
export function NetworkSectionHeading({
  sectionLabel,
  headline,
  subheadline,
  dark,
  className,
}: NetworkSectionHeadingProps) {
  return (
    <div className={cn("mb-10", className)}>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={cn(
          "mb-4 block font-mono text-sm uppercase tracking-[0.2em]",
          dark ? "text-background/50" : "text-muted-foreground",
        )}
      >
        {sectionLabel}
      </motion.span>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={cn(
          "font-heading text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl",
          dark ? "text-background" : "text-foreground",
        )}
        style={{ whiteSpace: "pre-line" }}
      >
        {headline}
      </motion.h2>

      {subheadline && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className={cn(
            "mt-4 max-w-3xl text-base",
            dark ? "text-background/60" : "text-muted-foreground",
          )}
        >
          {subheadline}
        </motion.p>
      )}
    </div>
  );
}
