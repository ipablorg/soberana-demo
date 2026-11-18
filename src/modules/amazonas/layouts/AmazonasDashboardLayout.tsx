/**
 * AmazonasDashboardLayout — Header + left sidebar + center + right sidebar.
 * Due Diligence Loopay — responsive, right sidebar collapsible on lg.
 * Desktop-only: shows a gate banner for <768px viewports.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { PanelRightOpen, PanelRightClose, Monitor, ShieldAlert } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import SoberanaLogoLight from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import SoberanaLogoDark from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png';
import LogoAmazonas from '@/shared/assets/Logos-clientes/amazonas.png';
import { AmazonasSidebarNav } from '@/modules/amazonas/components/AmazonasSidebarNav';
import { AmazonasSidebarInfo } from '@/modules/amazonas/components/AmazonasSidebarInfo';

function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}

function MobileGate() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-background p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-6 max-w-sm"
      >
        <div className="flex items-center gap-3 mb-2">
          <img src={LogoAmazonas} alt="Banco Amazonas" className="h-10 w-auto object-contain" />
          <span className="text-muted-foreground/60 text-lg">+</span>
          <img src={SoberanaLogoLight} alt="Soberana" className="h-8 w-auto object-contain dark:hidden" />
          <img src={SoberanaLogoDark} alt="Soberana" className="h-8 w-auto object-contain hidden dark:block" />
        </div>
        <div className="flex items-center justify-center rounded-xl bg-muted/50 p-5">
          <Monitor className="h-16 w-16 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Experiencia optimizada para escritorio
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Este dashboard de Due Diligence contiene tablas, gráficos y datos financieros
          detallados que requieren una pantalla amplia para su correcta visualización.
        </p>
        <p className="text-sm text-muted-foreground/70">
          Por favor, accede desde un computador de escritorio o laptop.
        </p>
      </motion.div>
    </div>
  );
}

export function AmazonasDashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [rightOpen, setRightOpen] = useState(true);
  const section = location.pathname.split('/').filter(Boolean)[1] ?? 'qa';
  const isMobile = useIsMobile(768);

  // Prevent search engine indexing and browser caching of confidential content
  useEffect(() => {
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);

    const metaNoCache = document.createElement('meta');
    metaNoCache.httpEquiv = 'Cache-Control';
    metaNoCache.content = 'no-cache, no-store, must-revalidate';
    document.head.appendChild(metaNoCache);

    return () => {
      document.head.removeChild(metaRobots);
      document.head.removeChild(metaNoCache);
    };
  }, []);

  // Prevent embedding in iframes (clickjacking protection)
  useEffect(() => {
    if (window.self !== window.top) {
      window.top?.location.replace(window.location.href);
    }
  }, []);

  if (isMobile) {
    return <MobileGate />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Confidentiality disclaimer — sticky, always visible */}
      <div className="shrink-0 bg-warning/5 border-b border-warning/20 px-4 py-1.5 text-center flex items-center justify-center gap-1.5">
        <ShieldAlert className="h-3.5 w-3.5 text-warning shrink-0" />
        <span className="text-xs text-warning font-medium">
          CONFIDENCIAL — Este documento contiene información privilegiada de Loopay LLC. Prohibida su distribución sin autorización expresa.
        </span>
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur px-4 py-3 sm:px-6"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src={LogoAmazonas}
            alt="Banco Amazonas"
            className="h-8 w-auto object-contain"
          />
          <span className="text-muted-foreground/60 text-lg hidden sm:inline">+</span>
          <img src={SoberanaLogoLight} alt="Soberana" className="w-auto object-contain hidden sm:block dark:hidden" style={{height: '3.2vw', minHeight: '20px', maxHeight: '56px'}} />
          <img src={SoberanaLogoDark} alt="Soberana" className="w-auto object-contain hidden sm:dark:block" style={{height: '3.2vw', minHeight: '20px', maxHeight: '56px'}} />
          <span className="font-heading font-semibold text-foreground text-lg sm:text-xl ml-2">
            Due Diligence Loopay
          </span>
        </div>
        <button
          type="button"
          onClick={() => setRightOpen((o) => !o)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150 lg:hidden"
          aria-label={rightOpen ? 'Cerrar panel derecho' : 'Abrir panel derecho'}
        >
          {rightOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
        </button>
      </motion.header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-56 shrink-0 border-r border-border bg-card/30 hidden md:block overflow-hidden">
          <AmazonasSidebarNav currentSection={section} />
        </aside>

        {/* Center — única zona con scroll, con watermark de confidencialidad */}
        <main className="relative flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {/* Watermark confidential */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden z-10 select-none flex items-center justify-center"
          >
            <span
              className="text-[120px] font-bold tracking-widest text-muted-foreground/3 whitespace-nowrap"
              style={{ transform: 'rotate(-30deg)' }}
            >
              CONFIDENTIAL
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="relative z-20"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Right sidebar */}
        <aside
          className={cn(
            'shrink-0 border-l border-border bg-card/30 transition-[colors,opacity] duration-150 hidden lg:block overflow-hidden',
            rightOpen ? 'w-72' : 'w-0 border-0'
          )}
        >
          {rightOpen && (
            <div className="p-4 overflow-hidden">
              <AmazonasSidebarInfo section={section} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
