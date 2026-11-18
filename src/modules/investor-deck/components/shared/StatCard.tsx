import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  value: string;
  label: string;
  source?: string;
  placeholder?: boolean;
  className?: string;
  delay?: number;
  dark?: boolean;
}

export function StatCard({
  value,
  label,
  source,
  placeholder,
  className,
  delay = 0,
  dark,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-6",
        dark
          ? "border-background/10 bg-background/5"
          : "border-border bg-card",
        placeholder && "opacity-60",
        className,
      )}
    >
      <span
        className={cn(
          "font-mono text-3xl font-bold tracking-tight lg:text-4xl",
          dark ? "text-background" : "text-foreground",
        )}
      >
        {value}
      </span>
      <span
        className={cn(
          "text-sm leading-relaxed",
          dark ? "text-background/70" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      {source && (
        <span
          className={cn(
            "font-mono text-xs uppercase tracking-wider",
            dark ? "text-background/40" : "text-muted-foreground/60",
          )}
        >
          Source: {source}
        </span>
      )}
    </motion.div>
  );
}
