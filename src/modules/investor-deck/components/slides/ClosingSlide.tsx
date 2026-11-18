import { motion } from "framer-motion";
import SoberanaLogoLight from "@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png";
import SoberanaLogoDark from "@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png";
import { useDeckContent } from "../../data/deck-lang-context";

export function ClosingSlide() {
  const { content } = useDeckContent();
  const d = content.closing;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-background px-8">
      <motion.img
        src={SoberanaLogoLight}
        alt="Soberana"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-12 h-12 dark:hidden md:h-14"
      />
      <motion.img
        src={SoberanaLogoDark}
        alt="Soberana"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-12 hidden h-12 dark:block md:h-14"
      />

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-16 font-mono text-sm uppercase tracking-[0.25em] text-muted-foreground"
      >
        {d.tagline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-10">
          {d.contacts.map((c) => (
            <div key={c.email} className="flex flex-col items-center gap-0.5">
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {c.name} · {c.role}
              </span>
              <a
                href={`mailto:${c.email}`}
                className="font-mono text-sm text-foreground transition-colors duration-150 hover:text-muted-foreground"
              >
                {c.email}
              </a>
            </div>
          ))}
        </div>
        <span className="font-mono text-sm text-muted-foreground">
          {d.website}
        </span>
      </motion.div>
    </div>
  );
}
