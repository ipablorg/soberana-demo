/**
 * BackofficeBalanceCard Component
 *
 * Card de balance/resumen reutilizable para el backoffice.
 * Estructura flexible para diferentes métricas.
 */

import type { IconComponent } from '@/shared/components/animated-icons';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

interface BackofficeBalanceCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: IconComponent;
  iconColor?: string;
  valueColor?: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

export function BackofficeBalanceCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  valueColor = 'text-foreground',
  subtitle,
  className,
  children,
}: BackofficeBalanceCardProps) {
  return (
    <Card className={cn(
      'relative overflow-hidden rounded-xl border border-border',
      className
    )}>
      <CardContent className="relative p-0 z-10">
        <div className="relative p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="w-10 h-10 rounded-xl bg-background/40 backdrop-blur-sm flex items-center justify-center">
                  <Icon className={cn('w-5 h-5', iconColor)} />
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Main Value */}
          <div className="space-y-2">
            <div className={cn(
              'text-4xl md:text-6xl font-bold tracking-tight font-mono tabular-nums',
              valueColor
            )}>
              {value}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          {/* Custom Content */}
          {children && (
            <div className="pt-2">
              {children}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

