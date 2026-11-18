/**
 * ApiDocsLayout - 3-Column API Documentation Layout
 * 
 * Mintlify-inspired layout with:
 * - Left sidebar: Navigation
 * - Center: Content (parameters, descriptions)
 * - Right: Sticky code examples
 * 
 * Responsive: On mobile, code examples move below content
 */

import * as React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, X, Book } from "@/shared/components/animated-icons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useMobile } from "@/shared/hooks/use-mobile";
import SoberanaLogoLight from "@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png";
import SoberanaLogoDark from "@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png";
import { apiSidebarSections, type ApiSidebarSection } from '../content/sidebar-content';

interface ApiDocsLayoutProps {
  /**
   * Sidebar navigation structure (uses imported sidebar by default)
   */
  sidebarSections?: ApiSidebarSection[];
}

export function ApiDocsLayout({ sidebarSections }: ApiDocsLayoutProps) {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const sections = sidebarSections || apiSidebarSections;

  // Close sidebar on navigation (mobile)
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
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
          <Link to="/globalconnectors/api" className="flex items-center gap-2">
            <img src={SoberanaLogoLight} alt="Soberana" className="h-8 w-auto dark:hidden" />
            <img src={SoberanaLogoDark} alt="Soberana" className="h-8 w-auto hidden dark:block" />
            <span className="hidden sm:inline-block text-sm font-semibold text-muted-foreground">
              / API Reference
            </span>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/globalconnectors">
                <Book className="h-4 w-4 mr-2" />
                Back to Marketplace
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="container flex-1">
        <div className="flex">
          {/* Left Sidebar Navigation */}
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
                      <ApiDocsSidebar sections={sections} />
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
            <aside className="hidden lg:block w-[260px] shrink-0 border-r border-border">
              <div className="sticky top-20 h-[calc(100vh-5rem)]">
                <ScrollArea className="h-full py-6 px-4">
                  <ApiDocsSidebar sections={sections} />
                </ScrollArea>
              </div>
            </aside>
          )}

          {/* Main Content Area (Center + Right) */}
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Method badge colors (Lumx style)
 */
const methodStyles: Record<string, string> = {
  GET: 'bg-success/10 text-success border-success/20',
  POST: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  PUT: 'bg-warning/10 text-warning border-warning/20',
  PATCH: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  DELETE: 'bg-destructive/10 text-destructive border-destructive/20',
};

/**
 * ApiDocsSidebar - Navigation Component with Method Badges
 */
function ApiDocsSidebar({ sections }: { sections: ApiSidebarSection[] }) {
  const location = useLocation();

  return (
    <nav className="space-y-6">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {section.title}
          </h4>
          <ul className="space-y-1">
            {section.items.map((item, itemIndex) => {
              const isActive = location.pathname === item.href;
              const method = item.method;
              
              return (
                <li key={itemIndex} className="relative">
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors relative",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {/* HTTP Method Badge */}
                    {method && (
                      <Badge 
                        variant="outline"
                        className={cn(
                          "font-mono text-[10px] px-1.5 py-0 h-5 shrink-0",
                          methodStyles[method]
                        )}
                      >
                        {method}
                      </Badge>
                    )}
                    
                    {/* Title */}
                    <span className="flex-1">{item.title}</span>
                  </Link>
                  
                  {/* Active Indicator (Left Border) */}
                  {isActive && (
                    <motion.div
                      layoutId="active-api-doc-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r"
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
