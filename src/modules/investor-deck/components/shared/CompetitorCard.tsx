import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import type { ExitCase } from "../../data/deck-content";

function CompanyLogo({ company }: { company: string }) {
  const logos: Record<string, { text: string; bg: string; style: string }> = {
    Brex: { text: "brex", bg: "bg-[#000]", style: "font-sans text-sm font-bold lowercase" },
    BVNK: { text: "BVNK", bg: "bg-[#1a1a2e]", style: "font-mono text-xs font-bold uppercase tracking-tight" },
    "Alpha Group": { text: "AG", bg: "bg-[#0d47a1]", style: "font-serif text-sm font-medium" },
    Rail: { text: "rail", bg: "bg-[#6366f1]", style: "font-sans text-sm font-medium lowercase" },
    Inswitch: { text: "IN", bg: "bg-[#00c853]", style: "font-sans text-sm font-bold" },
  };
  const cfg = logos[company];
  if (!cfg) return null;
  return (
    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white", cfg.bg)}>
      <span className={cfg.style}>{cfg.text}</span>
    </div>
  );
}

function AcquirerLogo({ logo }: { logo: ExitCase["acquirerLogo"] }) {
  if (logo === "mastercard") {
    return (
      <div className="flex items-center gap-0.5">
        <div className="relative flex items-center">
          <div className="h-4 w-4 rounded-full bg-[#EB001B]" />
          <div className="-ml-[6px] h-4 w-4 rounded-full bg-[#F79E1B] opacity-90" />
        </div>
        <span className="ml-1.5 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">Mastercard</span>
      </div>
    );
  }

  const labels: Record<string, string> = {
    "capital-one": "CAPITAL ONE",
    corpay: "CORPAY",
    ripple: "RIPPLE",
    transnetwork: "TRANSNETWORK",
  };

  return (
    <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
      {labels[logo] ?? logo}
    </span>
  );
}

interface CompetitorCardProps extends ExitCase {
  delay?: number;
}

export function CompetitorCard({
  company,
  acquirer,
  value,
  year,
  description,
  acquirerLogo,
  delay = 0,
}: CompetitorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex gap-4 rounded-xl border border-border bg-card p-5"
    >
      <CompanyLogo company={company} />
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-heading text-base font-semibold">
            {company}
          </span>
          <span className="text-xs text-muted-foreground">&rarr; {acquirer}</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className={cn("font-mono text-lg font-bold", (value === "Undisclosed" || value === "No divulgado") && "text-muted-foreground")}>
            {value}
          </span>
          <span className="font-mono text-xs text-muted-foreground">{year}</span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="mt-1 flex items-center">
          <AcquirerLogo logo={acquirerLogo} />
        </div>
      </div>
    </motion.div>
  );
}
