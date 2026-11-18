/**
 * DocsLanding - Standalone Linktree-style docs hub
 *
 * Full-screen landing for Soberana documentation. No DocsLayout, no sidebar.
 * 3D globe background on desktop, gradient on mobile.
 * Language: Spanish by default (useDocsLanguageStore), toggle to English.
 */

import { Link } from "react-router-dom";
import { ChevronRight } from "@/shared/components/animated-icons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import { useDocsLanguageStore } from "@/shared/stores/useDocsLanguageStore";
import { DocsLanguageToggle } from "@/modules/documentation/components/DocsLanguageToggle";
import SoberanaLogoLight from "@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png";
import SoberanaLogoDark from "@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png";

type DocsLang = 'en' | 'es';

const NAV_CARDS_BY_LANG: Record<DocsLang, { icon: string; title: string; description: string; href: string }[]> = {
  es: [
    { icon: "✨", title: "Soberana OS", description: "Chatea con Soberana — pregunta lo que quieras", href: "/os" },
    { icon: "🤖", title: "Soberana Zentinel", description: "Inteligencia de tesorería con IA, explicada", href: "/docs/sovy" },
    { icon: "🏦", title: "Soberana Vaults", description: "Rendimiento autónomo con precisión institucional", href: "/docs/soberana-vaults" },
    { icon: "🤝", title: "Amazonas + Soberana", description: "Alianza Banco Amazonas y Loopay para el futuro de la banca", href: "/docs/amazonas-soberana" },
    { icon: "📜", title: "Soberana Manifesto", description: "Nuestra visión, principios y filosofía de arquitectura", href: "/docs/manifesto" },
  ],
  en: [
    { icon: "✨", title: "Soberana OS", description: "Chat with Soberana — ask anything", href: "/os" },
    { icon: "🤖", title: "Soberana Zentinel", description: "AI-powered treasury intelligence, explained", href: "/docs/sovy" },
    { icon: "🏦", title: "Soberana Vaults", description: "Autonomous yield with institutional precision", href: "/docs/soberana-vaults" },
    { icon: "🤝", title: "Amazonas + Soberana", description: "Banco Amazonas and Loopay partnership for the future of banking", href: "/docs/amazonas-soberana" },
    { icon: "📜", title: "Soberana Manifesto", description: "Our vision, principles, and architecture philosophy", href: "/docs/manifesto" },
  ],
};

const LANDING_COPY = {
  es: {
    title: "SOBERANA DOCS",
    subtitle: "El futuro de las finanzas autónomas",
    builtBy: "Hecho por Loopay · 2026",
    backToSuite: "← Volver a Suite",
  },
  en: {
    title: "SOBERANA DOCS",
    subtitle: "The future of autonomous finance",
    builtBy: "Built by Loopay · 2026",
    backToSuite: "← Back to Suite",
  },
};

export default function DocsLanding() {
  const language = useDocsLanguageStore((state) => state.language);
  const copy = LANDING_COPY[language];
  const navCards = NAV_CARDS_BY_LANG[language];

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-background" />

      {/* Top bar: logo + language toggle */}
      <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6">
        <Link to="/docs" className="flex items-center gap-2">
          <img src={SoberanaLogoLight} alt="Soberana" className="h-8 w-auto dark:hidden" />
          <img src={SoberanaLogoDark} alt="Soberana" className="h-8 w-auto hidden dark:block" />
        </Link>
        <DocsLanguageToggle />
      </div>

      {/* Content — pb-36 reserves space for the fixed global podcast player */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12 pb-36 pt-24 w-full max-w-lg">
        <img src={SoberanaLogoLight} alt="Soberana" className="h-10 w-auto mx-auto mb-8 dark:hidden" />
        <img src={SoberanaLogoDark} alt="Soberana" className="h-10 w-auto mx-auto mb-8 hidden dark:block" />
        <h1 className="text-foreground font-heading text-4xl md:text-5xl font-bold text-center">
          {copy.title}
        </h1>
        <p className="text-muted-foreground text-lg text-center mb-12">
          {copy.subtitle}
        </p>

        <div className="flex flex-col items-center gap-4 w-full">
          <AnimatePresence mode="sync">
            {navCards.map((card, index) => {
              const isOs = card.href === "/os";
              return (
                <motion.div
                  key={card.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.2, duration: 0.3 }}
                  className={isOs ? "relative" : undefined}
                >
                  {isOs && (
                    <motion.div
                      className="absolute -inset-px rounded-xl bg-linear-to-r from-primary via-primary/60 to-primary opacity-60 blur-[2px]"
                      animate={{ opacity: [0.4, 0.7, 0.4] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  <Link
                    to={card.href}
                    className={cn(
                      "relative rounded-xl p-6 transition-colors duration-150 cursor-pointer flex items-center gap-4 group max-w-md w-full",
                      isOs
                        ? "bg-background/60 backdrop-blur-xl border border-primary/30 hover:border-primary/50"
                        : "bg-background/40 backdrop-blur-xl border border-border/50 hover:border-primary/30",
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-3xl shrink-0",
                      isOs ? "bg-primary/15" : "bg-primary/10",
                    )}>
                      {card.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-heading font-semibold text-lg text-foreground">
                        {card.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {card.description}
                      </p>
                    </div>
                    <ChevronRight className={cn(
                      "h-5 w-5 group-hover:translate-x-1 transition-transform duration-200 shrink-0",
                      isOs ? "text-primary" : "text-muted-foreground",
                    )} />
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <p className="text-xs text-muted-foreground/50 mt-12">
          {copy.builtBy}
        </p>
        <Link
          to="/"
          className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors mt-2"
        >
          {copy.backToSuite}
        </Link>
      </div>
    </div>
  );
}
