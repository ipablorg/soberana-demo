import type { ReactNode } from "react";
import SoberanaLogoLight from "@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png";
import SoberanaLogoDark from "@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png";

interface GtmLayoutProps {
  children: ReactNode;
}

export function GtmLayout({ children }: GtmLayoutProps) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <img
        src={SoberanaLogoLight}
        alt="Soberana"
        className="pointer-events-none absolute top-5 left-6 z-50 h-5 opacity-30 dark:hidden"
      />
      <img
        src={SoberanaLogoDark}
        alt="Soberana"
        className="pointer-events-none absolute top-5 left-6 z-50 hidden h-5 opacity-30 dark:block"
      />

      <span className="absolute top-[1.35rem] right-6 z-50 font-mono text-xs font-medium text-muted-foreground/60 select-none">
        GTM 2026–2027
      </span>

      {children}
    </div>
  );
}
