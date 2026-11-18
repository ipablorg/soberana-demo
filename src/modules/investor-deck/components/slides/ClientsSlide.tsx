import { motion } from "framer-motion";
import { Badge } from "@/shared/components/ui/badge";
import { SlideContainer } from "../shared/SlideContainer";
import { ClientSegmentCard } from "../shared/ClientSegmentCard";
import { useDeckContent } from "../../data/deck-lang-context";

export function ClientsSlide() {
  const { content, lang } = useDeckContent();
  const d = content.clients;

  return (
    <SlideContainer>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-4 block font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground"
      >
        {d.sectionLabel}
      </motion.span>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-2 font-heading text-3xl font-bold tracking-tight md:text-4xl"
      >
        {d.headline}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-10 text-base text-muted-foreground"
      >
        {d.subheadline}
      </motion.p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {d.segments.map((seg, i) => (
          <ClientSegmentCard
            key={seg.name}
            icon={seg.icon}
            name={seg.name}
            headline={seg.headline}
            description={seg.description}
            delay={0.25 + i * 0.1}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-8 flex flex-wrap items-center gap-2"
      >
        <span className="mr-2 text-sm text-muted-foreground">
          {lang === "es" ? "Regiones:" : "Regions:"}
        </span>
        {d.regions.map((r) => (
          <Badge key={r} variant="outline">{r}</Badge>
        ))}
      </motion.div>
    </SlideContainer>
  );
}
