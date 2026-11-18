/**
 * RightSidebarDetailCard
 * 
 * Componente reutilizable para mostrar detalles en el sidebar derecho del backoffice.
 * Garantiza un estilo uniforme y consistente en light y dark mode.
 * 
 * Diseño:
 * - Fondo: `bg-card/50` con backdrop blur
 * - Borde delgado: `border-border/30`
 * - Separadores internos: `border-border/20`
 * - Shadow sutil: `shadow-sm`
 * - Padding: `p-4`
 * - Border radius: `rounded-xl`
 */

import { cn } from "@/shared/lib/utils";
import { ReactNode } from "react";

interface DetailCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Contenedor principal de la card de detalle
 */
export function DetailCard({ children, className }: DetailCardProps) {
  return (
    <div className={cn(
      "bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-4 space-y-3 shadow-sm",
      className
    )}>
      {children}
    </div>
  );
}

interface DetailSectionProps {
  children: ReactNode;
  className?: string;
  withTopBorder?: boolean;
}

/**
 * Sección dentro de la card (con separador opcional)
 */
export function DetailSection({ children, className, withTopBorder = false }: DetailSectionProps) {
  return (
    <div className={cn(
      "space-y-2",
      withTopBorder && "pt-2 border-t border-border/20",
      className
    )}>
      {children}
    </div>
  );
}

interface DetailItemProps {
  label: string;
  value: ReactNode;
  className?: string;
}

/**
 * Item individual (label + value)
 */
export function DetailItem({ label, value, className }: DetailItemProps) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="text-sm text-foreground font-medium">{value}</div>
    </div>
  );
}

interface DetailGridProps {
  children: ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

/**
 * Grid para mostrar múltiples items
 */
export function DetailGrid({ children, cols = 2, className }: DetailGridProps) {
  return (
    <div className={cn(
      "grid gap-3",
      cols === 2 && "grid-cols-2",
      cols === 3 && "grid-cols-3",
      cols === 4 && "grid-cols-4",
      className
    )}>
      {children}
    </div>
  );
}

interface DetailIconValueProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  iconBgColor?: string; // e.g., "bg-primary/20" (semantic)
  iconColor?: string;   // e.g., "text-primary" (semantic)
}

/**
 * Item destacado con icono circular
 */
export function DetailIconValue({ 
  icon, 
  label, 
  value, 
  iconBgColor = "bg-primary/20",
  iconColor = "text-primary"
}: DetailIconValueProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", iconBgColor)}>
        <div className={iconColor}>
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-lg font-bold text-foreground">{value}</div>
      </div>
    </div>
  );
}

interface DetailCodeProps {
  children: ReactNode;
  className?: string;
}

/**
 * Texto de código (UIDs, IDs, etc)
 */
export function DetailCode({ children, className }: DetailCodeProps) {
  return (
    <code className={cn(
      "text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded",
      className
    )}>
      {children}
    </code>
  );
}

interface DetailBadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

/**
 * Badge/Tag personalizado (using semantic colors)
 */
export function DetailBadge({ children, variant = "default", className }: DetailBadgeProps) {
  const variantStyles = {
    default: "bg-muted text-foreground border-border/50",
    success: "bg-success/10 text-success border-success/30",
    warning: "bg-warning/10 text-warning border-warning/30",
    danger: "bg-destructive/10 text-destructive border-destructive/30",
  };

  return (
    <span className={cn(
      "px-2 py-1 text-xs rounded-md border inline-block",
      variantStyles[variant],
      className
    )}>
      {children}
    </span>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

/**
 * Header de sección (títulos)
 */
export function SectionHeader({ title, subtitle, className }: SectionHeaderProps) {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

interface SubsectionHeaderProps {
  children: ReactNode;
  className?: string;
}

/**
 * Subtítulo de subsección
 */
export function SubsectionHeader({ children, className }: SubsectionHeaderProps) {
  return (
    <h4 className={cn("text-xs font-semibold uppercase tracking-wider text-muted-foreground", className)}>
      {children}
    </h4>
  );
}
