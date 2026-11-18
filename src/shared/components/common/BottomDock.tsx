import * as React from 'react';
import { motion } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';

import { cn } from '@/shared/lib/utils';
import {
  Home,
  History,
  Users,
  Settings,
  GitBranch,
  CreditCard,
  type IconComponent,
} from '@/shared/components/animated-icons';
import { useWorkflowComposerStore } from '@/shared/stores/use-workflow-composer-store';
import { isInternalProductSettingsEnabled } from '@/shared/lib/dev-config';

/**
 * BottomDock — floating Dynamic-Island-style navigation rail.
 *
 * Always rendered as a centered floating pill at the bottom of the
 * viewport. On mobile it's slightly smaller; on desktop it uses the
 * full Dynamic-Island aesthetic with brand-gradient rim.
 *
 * The `motion.span layoutId="dock-label"` is the Apple-grade detail:
 * the active label slides between items as the user changes section.
 *
 * Positioning is the LAYOUT's job — this component only paints itself.
 */

export type DockSection = 'home' | 'transactions' | 'beneficiaries' | 'card' | 'flows' | 'settings';

interface DockItemConfig {
  id: DockSection;
  icon: IconComponent;
  label: string;
  ariaLabel: string;
}

export interface BottomDockProps {
  active: DockSection;
  onChange: (section: DockSection) => void;
  className?: string;
}

const dockItemVariants = cva(
  'relative inline-flex items-center justify-center gap-2 rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
  {
    variants: {
      state: {
        active: 'bg-white/15 text-white px-3.5 h-11',
        inactive: 'h-11 w-11 text-white/70 hover:bg-white/10 hover:text-white',
      },
    },
    defaultVariants: {
      state: 'inactive',
    },
  },
);

import { cva } from 'class-variance-authority';

const BottomDock = React.forwardRef<HTMLDivElement, BottomDockProps>(
  ({ active, onChange, className }, ref) => {
    const { t } = useLingui();

    const workflowEnabled =
      useWorkflowComposerStore((s) => s.enabled) && isInternalProductSettingsEnabled();

    const items: DockItemConfig[] = [
      { id: 'home', icon: Home, label: t`Home`, ariaLabel: t`Home` },
      { id: 'transactions', icon: History, label: t`Movimientos`, ariaLabel: t`Movimientos` },
      { id: 'beneficiaries', icon: Users, label: t`Beneficiarios`, ariaLabel: t`Beneficiarios` },
      { id: 'card', icon: CreditCard, label: t`Soberana Card`, ariaLabel: t`Soberana Card` },
      ...(workflowEnabled
        ? [{ id: 'flows' as DockSection, icon: GitBranch, label: t`Flujos`, ariaLabel: t`Flujos` }]
        : []),
      { id: 'settings', icon: Settings, label: t`Ajustes`, ariaLabel: t`Ajustes` },
    ];

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        role="navigation"
        aria-label={t`Navegación principal`}
        className={cn(
          'rounded-full p-px bg-brand-gradient',
          // Smaller on mobile, full size on desktop
          'scale-90 sm:scale-100',
          className,
        )}
      >
        <div
          className={cn(
            'flex items-center gap-1 rounded-full bg-brand-gradient',
            'px-3 py-2',
            // Narrower on mobile
            'min-w-[240px] sm:min-w-[280px]',
          )}
        >
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                aria-label={item.ariaLabel}
                aria-current={isActive ? 'page' : undefined}
                className={cn(dockItemVariants({ state: isActive ? 'active' : 'inactive' }))}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {isActive && (
                  <motion.span
                    layoutId="dock-label"
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="text-sm font-medium text-white whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    );
  },
);
BottomDock.displayName = 'BottomDock';

export { BottomDock, dockItemVariants };
