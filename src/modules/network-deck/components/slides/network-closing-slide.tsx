import { motion, useReducedMotion } from "framer-motion";
import { useDeckContent } from "../../data/deck-lang-context";
import { NetworkSlideShell } from "../shared/network-slide-shell";

/* Slide 14 — Closing (Fix 10). The winning sentence, the support line,
   two founder contact cards (photo or initials fallback — never another
   image), the general contact, the disclaimer. Centred both axes.
   Build: 1 sentence line by line · 2 cards + footer. */

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function NetworkClosingSlide() {
  const { content } = useDeckContent();
  const c = content.closing;
  const reduced = useReducedMotion();

  // Use the first two founders from the founders array (Diego and Carlos)
  // so the closing slide stays in sync with the content file.
  const closingFounders = content.founders.founders.slice(0, 2).map((f) => ({
    name: f.name,
    role: f.role,
    email: f.name.toLowerCase().includes("diego") ? "dm@loopay.com" : "co@loopay.com",
    photo: `/${f.photo}`,
  }));

  const line1 = "Every network pays you fees.";
  const line2 = "Soberana pays you in the network.";

  return (
    <NetworkSlideShell steps={2}>
      {/* wordmark */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex shrink-0 flex-col items-center"
      >
        <span className="text-2xl font-semibold tracking-[0.08em]">SOBERANA</span>
        <span className="mt-0.5 text-xs text-muted-foreground">by Loopay</span>
      </motion.div>

      {/* the sentence, line by line */}
      <div className="flex shrink-0 flex-col items-center pt-8">
        {[line1, line2].map((line, i) => (
          <motion.h2
            key={line}
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: i * 0.02 }}
            className="max-w-5xl text-center text-4xl leading-tight font-semibold tracking-tight text-balance md:text-5xl"
          >
            {line}
          </motion.h2>
        ))}
      </div>

      {/* support line */}
      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="shrink-0 pt-6 text-center text-base text-muted-foreground md:text-lg"
      >
        One licensed operator per country, per rail. Colombia, Ecuador and Peru are taken.
      </motion.p>

      {/* contact cards */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.15 }}
        className="flex shrink-0 flex-wrap justify-center gap-10 pt-10"
      >
        {closingFounders.map((f) => (
          <div key={f.email} className="flex items-center gap-4 rounded-2xl border border-border bg-card px-6 py-5" style={{ width: 340 }}>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
              <img
                src={f.photo}
                alt={`${f.name}, ${f.role}`}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = "none";
                  const sib = img.nextElementSibling as HTMLElement | null;
                  if (sib) sib.style.display = "flex";
                }}
              />
              <span className="hidden font-mono text-sm font-semibold text-muted-foreground">{initialsOf(f.name)}</span>
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold">{f.name}</div>
              <div className="text-xs text-muted-foreground">{f.role}</div>
              <a href={`mailto:${f.email}`} className="mt-0.5 block truncate font-mono text-sm text-foreground underline-offset-4 hover:underline">
                {f.email}
              </a>
            </div>
          </div>
        ))}
      </motion.div>

      {/* general contact */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="shrink-0 pt-6 text-center text-sm text-muted-foreground"
      >
        contact@soberana.network · soberana.network
      </motion.div>

      {/* disclaimer */}
      <p className="shrink-0 pt-6 text-center text-xs text-muted-foreground">
        Nothing in this deck is an offer of securities.
      </p>
      <span className="sr-only">{c.contactEmail}</span>
    </NetworkSlideShell>
  );
}
