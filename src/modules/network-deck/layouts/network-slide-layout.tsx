import { useRef, type ReactNode } from "react";
import { Languages } from "lucide-react";
import { motion } from "framer-motion";
import SoberanaLogoLight from "@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png";
import SoberanaLogoDark from "@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png";
import { useDeckContent } from "../data/deck-lang-context";
import { useDeckChrome } from "../components/shared/deck-chrome";

interface NetworkSlideLayoutProps {
  children: ReactNode;
}

export function NetworkSlideLayout({ children }: NetworkSlideLayoutProps) {
  const { lang, toggleLang } = useDeckContent();
  const rootRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  // Fix 1: measure both chrome bars at runtime → --deck-chrome-top/bottom.
  useDeckChrome(rootRef, topBarRef, bottomBarRef);

  return (
    <div ref={rootRef} className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Brand bar — measured; publishes --deck-chrome-top */}
      <div
        ref={topBarRef}
        data-deck-chrome-top
        className="pointer-events-none absolute top-0 right-0 left-0 z-50 flex items-start justify-between px-6 pt-5 print:hidden"
      >
        <img
          src={SoberanaLogoLight}
          alt="Soberana Network"
          className="opacity-30 dark:hidden"
          style={{ height: "3.2vw", minHeight: "20px", maxHeight: "64px" }}
        />
        <img
          src={SoberanaLogoDark}
          alt="Soberana Network"
          className="hidden opacity-30 dark:block"
          style={{ height: "3.2vw", minHeight: "20px", maxHeight: "64px" }}
        />
        <div className="flex flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={toggleLang}
            className="pointer-events-auto flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2.5 py-1 font-mono text-xs tracking-widest text-muted-foreground uppercase backdrop-blur transition-colors hover:text-foreground print:hidden"
            aria-label="Toggle language"
          >
            <Languages className="h-3.5 w-3.5" />
            {lang === "en" ? "ES" : "EN"}
          </button>
          <span className="hidden font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground/60 select-none sm:block">
            Network · Member-Owned
          </span>
        </div>
      </div>

      {children}

      {/* Bottom nav bar — measured; publishes --deck-chrome-bottom.
          The renderer absolutely positions the navigation inside this
          anchor so the measured height always matches the real nav. */}
      <div
        ref={bottomBarRef}
        data-deck-chrome-bottom
        className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[57px] print:hidden"
      />
      {/* Global deck arrowhead marker (userSpaceOnUse) for diagram arrows. */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <marker
            id="deck-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            markerUnits="userSpaceOnUse"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill="#c77d45" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

/** Motion wrapper for slide content entrances. */
export function NetworkSlideMotion({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
