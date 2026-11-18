import type { ReactNode } from "react";
import SoberanaLogoLight from "@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png";
import SoberanaLogoDark from "@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png";
import { useDeckContent } from "../data/deck-lang-context";

interface SlideLayoutProps {
  children: ReactNode;
}

export function SlideLayout({ children }: SlideLayoutProps) {
  const { lang, toggleLang } = useDeckContent();

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <img
        src={SoberanaLogoLight}
        alt="Soberana"
        className="pointer-events-none absolute top-5 left-6 z-50 opacity-30 dark:hidden"
        style={{height: '3.2vw', minHeight: '20px', maxHeight: '64px'}}
      />
      <img
        src={SoberanaLogoDark}
        alt="Soberana"
        className="pointer-events-none absolute top-5 left-6 z-50 hidden opacity-30 dark:block"
        style={{height: '3.2vw', minHeight: '20px', maxHeight: '64px'}}
      />

      <button
        onClick={toggleLang}
        className="absolute top-4 right-6 z-50 flex items-center gap-1.5 rounded-lg border border-border bg-background/80 px-2.5 py-1.5 font-mono text-xs font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-muted"
        title={lang === "en" ? "Cambiar a español" : "Switch to English"}
      >
        <span className="text-base leading-none">{lang === "en" ? "🇪🇸" : "🇺🇸"}</span>
        <span>{lang === "en" ? "ES" : "EN"}</span>
      </button>

      {children}
    </div>
  );
}
