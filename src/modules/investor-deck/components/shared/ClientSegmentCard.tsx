import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface ClientSegmentCardProps {
  icon: LucideIcon;
  name: string;
  headline: string;
  description: string;
  delay?: number;
  className?: string;
}

export function ClientSegmentCard({
  icon: Icon,
  name,
  headline,
  description,
  delay = 0,
  className,
}: ClientSegmentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-6",
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {name}
        </span>
        <h3 className="font-heading text-lg font-semibold">{headline}</h3>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );
}
