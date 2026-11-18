/**
 * MobilePage
 * 
 * Wrapper component for making any suite page responsive.
 * Provides mobile-specific spacing and layout adjustments.
 */

import { ReactNode } from 'react';
import { useMobile } from '@/shared/hooks/use-mobile';
import { cn } from '@/shared/lib/utils';

interface MobilePageProps {
  children: ReactNode;
  className?: string;
  removeDesktopPadding?: boolean;
}

export function MobilePage({ children, className, removeDesktopPadding = false }: MobilePageProps) {
  const isMobile = useMobile();

  const baseClasses = isMobile 
    ? 'p-4 space-y-4' 
    : removeDesktopPadding 
      ? 'space-y-6' 
      : 'p-6 space-y-6';

  return (
    <div className={cn(baseClasses, className)}>
      {children}
    </div>
  );
}

interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function MobilePageHeader({ title, subtitle, action }: MobilePageHeaderProps) {
  const isMobile = useMobile();

  if (isMobile) {
    return action ? (
      <div className="space-y-3">
        {action}
      </div>
    ) : null;
  }

  return (
    <div className={action ? "flex items-center justify-between" : "mb-6"}>
      <div>
        <h1 className="text-3xl font-bold font-heading mb-2">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

