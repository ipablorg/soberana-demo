import * as React from "react";
import type { IconComponent } from "@/shared/components/animated-icons";
import { cn } from "@/shared/lib/utils";
import { Card } from "@/shared/components/ui/card";

export interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  icon?: IconComponent;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  highlighted?: boolean;
}

export const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    highlighted = false,
    className,
    ...props
  }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "relative p-6 transition-colors duration-150 cursor-pointer",
          highlighted && "ring-2 ring-primary/40",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
          </div>
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="mb-2">
          <p className="text-3xl font-bold font-mono tabular-nums text-foreground tracking-tight">
            {value}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}

          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span className="font-mono tabular-nums">{Math.abs(trend.value)}%</span>
              {trend.label && (
                <span className="text-muted-foreground font-normal ml-1">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
      </Card>
    );
  }
);

StatsCard.displayName = "StatsCard";

export const StatsCardCompact = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, ...props }, ref) => (
    <StatsCard
      ref={ref}
      className={cn("p-4", className)}
      {...props}
    />
  )
);

StatsCardCompact.displayName = "StatsCardCompact";
