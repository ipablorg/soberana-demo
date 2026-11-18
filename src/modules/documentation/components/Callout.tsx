/**
 * Callout - Attention-Grabbing Info Boxes
 * 
 * Used for tips, warnings, notes, and important information
 * in documentation.
 */

import * as React from "react";
import { AlertTriangle, Info, Lightbulb, AlertCircle, CheckCircle2 } from "@/shared/components/animated-icons";
import { cn } from "@/shared/lib/utils";

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Callout variant (determines icon and styling)
   */
  variant?: "info" | "warning" | "danger" | "success" | "tip";
  
  /**
   * Optional title
   */
  title?: string;
  
  /**
   * Custom icon (overrides variant icon)
   */
  icon?: React.ReactNode;
}

const variantConfig = {
  info: {
    icon: Info,
    className: "bg-primary/5 border-primary/20 text-primary",
    iconClassName: "text-primary",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-warning/5 border-warning/20 text-warning",
    iconClassName: "text-warning",
  },
  danger: {
    icon: AlertCircle,
    className: "bg-destructive/5 border-destructive/20 text-destructive",
    iconClassName: "text-destructive",
  },
  success: {
    icon: CheckCircle2,
    className: "bg-success/5 border-success/20 text-success",
    iconClassName: "text-success",
  },
  tip: {
    icon: Lightbulb,
    className: "bg-accent/5 border-accent/20 text-accent-foreground",
    iconClassName: "text-accent-foreground",
  },
};

export const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
  ({ 
    variant = "info", 
    title, 
    icon, 
    className, 
    children,
    ...props 
  }, ref) => {
    const config = variantConfig[variant];
    const IconComponent = config.icon;

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-xl border p-6 backdrop-blur-sm",
          config.className,
          className
        )}
        {...props}
      >
        <div className="flex gap-4">
          {/* Icon */}
          <div className={cn("shrink-0 mt-1", config.iconClassName)}>
            {icon || <IconComponent className="h-5 w-5" />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="font-semibold mb-2 text-foreground">{title}</h4>
            )}
            <div className="text-sm text-foreground/90 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Callout.displayName = "Callout";

