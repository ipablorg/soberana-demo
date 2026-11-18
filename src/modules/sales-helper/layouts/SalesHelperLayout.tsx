import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SalesHelperSidebar, SALES_NAV_ITEMS } from '../components/SalesHelperSidebar';
import { cn } from '@/shared/lib/utils';
import { useRef, useEffect } from 'react';

function MobileTabBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (!scrollRef.current) return;
    const active = scrollRef.current.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [location.pathname]);

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm md:hidden">
      <div ref={scrollRef} className="flex gap-1 overflow-x-auto px-3 py-2 scrollbar-hide">
        {SALES_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            data-active={location.pathname === item.path ? 'true' : undefined}
            className={({ isActive }) =>
              cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              )
            }
          >
            <item.icon className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

interface SalesHelperLayoutProps {
  children: React.ReactNode;
}

export function SalesHelperLayout({ children }: SalesHelperLayoutProps) {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SalesHelperSidebar />

      <main className="flex-1 overflow-y-auto">
        <MobileTabBar />
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
