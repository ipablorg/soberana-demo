import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import { useLingui } from '@lingui/react/macro';
import SoberanaLogoCompact from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import SoberanaLogoWide from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png';
import { LanguageToggle } from '@/shared/components/common/LanguageToggle';
import { PlatformSidebarNav } from '../components/PlatformSidebarNav';
import { SECTION_IDS } from '../data/platform-content';

interface PlatformShowcaseLayoutProps {
  children: React.ReactNode;
}

export function PlatformShowcaseLayout({ children }: PlatformShowcaseLayoutProps) {
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { t } = useLingui();

  const scrollToSection = useCallback((anchor: string) => {
    const id = anchor.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileNavOpen(false);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur-md px-4 py-3 sm:px-6"
      >
        <div className="flex items-center gap-3">
          <img
            src={SoberanaLogoCompact}
            alt="Soberana"
            className="w-auto object-contain dark:hidden"
            style={{height: '3.2vw', minHeight: '20px', maxHeight: '56px'}}
          />
          <img
            src={SoberanaLogoWide}
            alt="Soberana"
            className="w-auto object-contain hidden dark:block"
            style={{height: '3.2vw', minHeight: '20px', maxHeight: '56px'}}
          />
          <span className="h-4 w-px bg-border hidden sm:block" aria-hidden="true" />
          <span className="font-heading font-semibold text-foreground text-base sm:text-lg hidden sm:block">
            Soberana Platform
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden md:block font-mono">
            soberana.app
          </span>
          <LanguageToggle availableLanguages={['en', 'es', 'pt']} />
          <button
            type="button"
            onClick={() => setMobileNavOpen((o) => !o)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150 lg:hidden"
            aria-label={t`Toggle navigation`}
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="lg:hidden fixed inset-x-0 top-[57px] z-30 bg-background/98 backdrop-blur-md border-b border-border shadow-md"
        >
          <PlatformSidebarNav
            activeSection={activeSection}
            onNavigate={scrollToSection}
          />
        </motion.div>
      )}

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar — desktop only */}
        <aside className="w-52 shrink-0 border-r border-border bg-card/30 hidden lg:block sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <PlatformSidebarNav
            activeSection={activeSection}
            onNavigate={scrollToSection}
          />
        </aside>

        {/* Main content */}
        <main
          className={cn(
            'flex-1 min-w-0 overflow-x-hidden',
            mobileNavOpen && 'pointer-events-none'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
