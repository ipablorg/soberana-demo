import { motion } from "framer-motion";
import SoberanaLogoLight from "@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png";
import SoberanaLogoDark from "@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png";
import { gtmContent } from "../../data/gtm-content";

export function TitleSlide() {
  const d = gtmContent.title;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-background px-8">
      <motion.img
        src={SoberanaLogoLight}
        alt="Soberana"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-12 h-10 dark:hidden md:h-12"
      />
      <motion.img
        src={SoberanaLogoDark}
        alt="Soberana"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-12 hidden h-10 dark:block md:h-12"
      />

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground"
      >
        {d.eyebrow}
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="max-w-4xl text-center font-heading text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
        style={{ whiteSpace: "pre-line" }}
      >
        {d.headline}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 max-w-2xl text-center text-base text-muted-foreground md:text-lg"
      >
        {d.subtitle}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        className="mt-12 font-mono text-sm uppercase tracking-[0.25em] text-muted-foreground"
      >
        {d.tagline}
      </motion.p>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.85 }}
        className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/50"
      >
        {d.label}
      </motion.span>
    </div>
  );
}
