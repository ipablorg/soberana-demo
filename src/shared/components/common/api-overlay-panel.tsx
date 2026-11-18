/**
 * ApiOverlayPanel — generic side panel for API integrations.
 *
 * Loopay X is the first consumer; future integrations (Bridge,
 * Persona, etc.) can reuse the same wrapper for their persistent
 * floating panel. Behaves like a non-modal `Sheet`: it does not
 * trap focus, does not dim the page, and does not block dashboard
 * interactions — it is a sidecar, not a modal.
 *
 * Position:
 *  - Desktop: docked to the right edge inside `<main>` (sticky-ish
 *    using `fixed` + topbar offset). `w-[420px]` matches typical
 *    finance side-panel widths (Bridge dashboards, Stripe Connect).
 *  - Mobile: slides up from the bottom, full width, edge-to-edge,
 *    leaving room for the BottomDock at the bottom.
 *
 * Animation: 200ms slide + fade with `ease-out`. No spring — the
 * design system rule (Section 3.5) is explicit about that.
 */

import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { X } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { useMobile } from '@/shared/hooks/use-mobile';
import { cn } from '@/shared/lib/utils';

interface ApiOverlayPanelProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Optional icon shown next to the title. */
  icon?: ReactNode;
  /** Apply gradient hairline border (used for brand integrations). */
  highlight?: boolean;
}

const DESKTOP_WIDTH = 'w-[420px]';

export function ApiOverlayPanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  icon,
  highlight = false,
}: ApiOverlayPanelProps) {
  const isMobile = useMobile();

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="api-overlay-panel"
          initial={
            isMobile ? { y: '100%', opacity: 0 } : { x: 24, opacity: 0 }
          }
          animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
          exit={isMobile ? { y: '100%', opacity: 0 } : { x: 24, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'fixed z-30 bg-card border border-border shadow-lg flex flex-col',
            isMobile
              ? 'left-0 right-0 bottom-0 rounded-t-xl max-h-[85vh]'
              : `top-16 right-4 ${DESKTOP_WIDTH} rounded-xl`,
            !isMobile && 'h-[calc(100vh-6rem)]',
            highlight && 'gradient-border-thin-always',
          )}
          aria-label={typeof title === 'string' ? title : undefined}
        >
          <header className="flex items-center justify-between gap-3 p-4 border-b border-border/60">
            <div className="flex items-center gap-3 min-w-0">
              {icon}
              <div className="min-w-0">
                <h2 className="text-base font-semibold leading-tight truncate">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs text-muted-foreground truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </header>

          <div className="flex-1 overflow-y-auto">{children}</div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
