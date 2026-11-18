/**
 * DocsLayout - Documentation Layout with Sticky Sidebar
 * 
 * Stripe-inspired 2-column layout optimized for documentation:
 * - Sticky sidebar (Table of Contents)
 * - Scrollable main content area
 * - Mobile responsive (collapsible sidebar)
 * - Semantic structure for accessibility
 */

import * as React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Menu, X } from "@/shared/components/animated-icons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useMobile } from "@/shared/hooks/use-mobile";
import { useDocsLanguageStore } from "@/shared/stores/useDocsLanguageStore";
import { DocsLanguageToggle } from "../components/DocsLanguageToggle";
import { getSidebarContent, type Language } from "../content/sidebar-content";
import SoberanaLogoLight from "@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png";
import SoberanaLogoDark from "@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png";

export interface DocsSidebarSection {
  title: string;
  items: {
    title: string;
    href: string;
    isActive?: boolean;
  }[];
}

interface DocsLayoutProps {
  /**
   * Sidebar navigation structure
   */
  sidebarSections?: DocsSidebarSection[];
  
  /**
   * Optional logo component
   */
  logo?: React.ReactNode;
}

const getDefaultSidebarSections = (language: Language): DocsSidebarSection[] => {
  const content = getSidebarContent(language);
  return [
    {
      title: content.title,
      items: content.items,
    },
  ];
};

export function DocsLayout({ 
  sidebarSections,
  logo 
}: DocsLayoutProps) {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const language = useDocsLanguageStore((state) => state.language);

  const docsLanguage: Language = language === 'es' ? 'es' : 'en';
  const sections = sidebarSections || getDefaultSidebarSections(docsLanguage);

  // Close sidebar on navigation (mobile)
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header (Mobile & Desktop) */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          {/* Mobile Menu Toggle */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}

          {/* Logo & Title */}
          <Link to="/docs" className="flex items-center gap-2">
            {logo || (
                <>
                <img src={SoberanaLogoLight} alt="Soberana" className="w-auto dark:hidden" style={{height: '3.2vw', minHeight: '20px', maxHeight: '56px'}} />
                <img src={SoberanaLogoDark} alt="Soberana" className="w-auto hidden dark:block" style={{height: '3.2vw', minHeight: '20px', maxHeight: '56px'}} />
              </>
            )}
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <DocsLanguageToggle />
            
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">← Soberana</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="container flex-1">
        <div className="flex gap-6 lg:gap-10">
          {/* Sidebar Navigation */}
          {isMobile ? (
            // Mobile: Overlay Sidebar
            <AnimatePresence>
              {sidebarOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                  />

                  {/* Sidebar Drawer */}
                  <motion.aside
                    initial={{ x: -280 }}
                    animate={{ x: 0 }}
                    exit={{ x: -280 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="fixed top-14 left-0 bottom-0 z-50 w-[280px] border-r border-border bg-background"
                  >
                    <ScrollArea className="h-full px-4 py-6">
                      <DocsSidebar sections={sections} />
                    </ScrollArea>

                    {/* Close Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>
          ) : (
            // Desktop: Sticky Sidebar
            <aside className="hidden w-[240px] shrink-0 lg:block">
              <div className="sticky top-20 h-[calc(100vh-5rem)]">
                <ScrollArea className="h-full py-6 pr-6">
                  <DocsSidebar sections={sections} />
                </ScrollArea>
              </div>
            </aside>
          )}

          <main className="flex-1 min-w-0 py-6 lg:py-10">
            <div className="mx-auto max-w-4xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * DocsSidebar - Internal Component for Navigation Links with Active Tracking
 */
function DocsSidebar({ sections }: { sections: DocsSidebarSection[] }) {
  const [activeId, setActiveId] = React.useState<string>("");
  const navigate = useNavigate();

  React.useEffect(() => {
    const sectionIds = sections.flatMap(section => 
      section.items
        .filter(item => item.href.startsWith('#'))
        .map(item => item.href.replace('#', ''))
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -66%" }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  const handleClick = (href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith('#')) {
      e.preventDefault();
      navigate(href);
      return;
    }
    e.preventDefault();
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="space-y-6">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {section.title && (
            <h4 className="text-sm font-semibold text-foreground mb-3">
              {section.title}
            </h4>
          )}
          <ul className="space-y-1">
            {section.items.map((item, itemIndex) => {
              const isHashLink = item.href.startsWith('#');
              const isActive = isHashLink && activeId === item.href.replace('#', '');
              
              return (
                <li key={itemIndex} className="relative">
                  <a
                    href={item.href}
                    onClick={(e) => handleClick(item.href, e)}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm transition-colors relative",
                      isActive
                        ? "bg-muted text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {item.title}
                  </a>
                  
                  {isActive && (
                    <motion.div
                      layoutId="active-doc-indicator"
                      className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r"
                      initial={false}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

