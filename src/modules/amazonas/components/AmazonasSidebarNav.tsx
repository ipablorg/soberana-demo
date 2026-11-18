/**
 * AmazonasSidebarNav — Left sidebar navigation (4 sections).
 */

import { NavLink } from 'react-router-dom';
import { MessageCircleQuestion, ArrowLeftRight, GitBranch } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';

const NAV_ITEMS = [
  { id: 'qa', path: '/amazonas/qa', label: 'Q & A', icon: MessageCircleQuestion },
  { id: 'transacciones', path: '/amazonas/transacciones', label: 'Transacciones', icon: ArrowLeftRight },
  { id: 'flujos', path: '/amazonas/flujos', label: 'Flujos', icon: GitBranch },
] as const;

export interface AmazonasSidebarNavProps {
  currentSection?: string;
}

export function AmazonasSidebarNav(_props: AmazonasSidebarNavProps) {
  return (
    <nav className="p-4 space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
        Secciones
      </p>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
              isActive
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
            )
          }
        >
          {() => (
            <>
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
