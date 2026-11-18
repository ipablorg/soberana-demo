import { motion } from "framer-motion";
import { Badge } from "@/shared/components/ui/badge";
import { User } from "lucide-react";
import { SlideContainer } from "../shared/SlideContainer";
import { useDeckContent } from "../../data/deck-lang-context";

export function TeamSlide() {
  const { content } = useDeckContent();
  const d = content.team;

  return (
    <SlideContainer>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-3 block font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
      >
        {d.sectionLabel}
      </motion.span>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-2 font-heading text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
      >
        {d.headline}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-12 text-base text-muted-foreground"
      >
        {d.description}
      </motion.p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {d.members.map((member, i) => (
          <motion.div
            key={member.role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 + i * 0.1 }}
            className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <User className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-heading text-base font-semibold">{member.name}</span>
              <span className="text-xs text-muted-foreground">{member.role}</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{member.bio}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-8 flex justify-center"
      >
        <Badge variant="warning" className="text-xs">
          {d.placeholderNote}
        </Badge>
      </motion.div>
    </SlideContainer>
  );
}
