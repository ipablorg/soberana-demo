import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Trans } from '@lingui/react/macro';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { useMobile } from '@/shared/hooks/use-mobile';
import {
  Layers,
  FileText,
  Settings,
  Menu,
  X,
  Plus,
  ChevronLeft,
} from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import LogoLight from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import LogoDark from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png';
import { ElementsActivationSplash } from '../components/elements-activation-splash';

const NAV_ITEMS = [
  { path: '/elements', label: 'Dashboard', Icon: Layers, exact: true },
  { path: '/elements/docs', label: 'Docs', Icon: FileText, exact: false },
] as const;

function NavLink({
  path,
  label,
  Icon,
  exact,
  onClick,
}: {
  path: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  exact: boolean;
  onClick?: () => void;
}) {
  const { pathname } = useLocation();
  const isActive = exact ? pathname === path : pathname.startsWith(path);

  return (
    <Link
      to={path}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
        isActive
          ? 'bg-muted text-foreground font-medium'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

export function ElementsLayout() {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isBuilder = pathname.startsWith('/elements/builder');

  return (
    <div className="min-h-screen bg-background">
      <ElementsActivationSplash />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center px-4 gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}

          {/* Back to Soberana */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => navigate('/suite/dashboard')}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline text-xs"><Trans>Soberana</Trans></span>
          </Button>

          <Separator orientation="vertical" className="h-4 shrink-0" />

          <Link to="/elements" className="flex items-center gap-2.5">
            <img src={LogoLight} alt="Soberana" className="w-auto dark:hidden" style={{height: '3.2vw', minHeight: '18px', maxHeight: '48px'}} />
            <img src={LogoDark} alt="Soberana" className="w-auto hidden dark:block" style={{height: '3.2vw', minHeight: '18px', maxHeight: '48px'}} />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-muted-foreground text-sm">/</span>
              <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Elements
              </span>
            </div>
          </Link>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {isBuilder ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/elements')}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                <Trans>Dashboard</Trans>
              </Button>
            ) : (
              <Button
                variant="gradient"
                size="sm"
                onClick={() => navigate('/elements/builder/payment-button')}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                <Trans>Nuevo Widget</Trans>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="container flex-1">
        <div className="flex gap-6 lg:gap-10">
          {/* Sidebar */}
          {isMobile ? (
            <AnimatePresence>
              {sidebarOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                  />
                  <motion.aside
                    initial={{ x: -280 }}
                    animate={{ x: 0 }}
                    exit={{ x: -280 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="fixed top-14 left-0 bottom-0 z-50 w-64 border-r border-border bg-background"
                  >
                    <ScrollArea className="h-full px-3 py-4">
                      <nav className="flex flex-col gap-1">
                        {NAV_ITEMS.map(item => (
                          <NavLink
                            key={item.path}
                            {...item}
                            onClick={() => setSidebarOpen(false)}
                          />
                        ))}
                      </nav>
                    </ScrollArea>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>
          ) : (
            <aside className="hidden w-52 shrink-0 lg:block">
              <div className="sticky top-20 h-[calc(100vh-5rem)] py-6">
                <nav className="flex flex-col gap-1">
                  {NAV_ITEMS.map(item => (
                    <NavLink key={item.path} {...item} />
                  ))}
                  <Separator className="my-2" />
                  <NavLink
                    path="/elements/settings"
                    label="Settings"
                    Icon={Settings}
                    exact={false}
                  />
                </nav>
              </div>
            </aside>
          )}

          {/* Main content */}
          <main className="flex-1 min-w-0 py-6 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
