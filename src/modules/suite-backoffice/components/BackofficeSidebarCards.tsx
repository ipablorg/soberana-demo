import React from 'react';
import { cn } from '@/shared/lib/utils';
import { ScrollArea } from '@/shared/components/ui/scroll-area';

interface RightSidebarDetailCardProps {
  children: React.ReactNode;
  className?: string;
}

export function RightSidebarDetailCard({ children, className }: RightSidebarDetailCardProps) {
  return (
    <div className={cn("bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-4 space-y-3 shadow-sm", className)}>
      {children}
    </div>
  );
}

interface DetailSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function DetailSection({ title, children, className }: DetailSectionProps) {
  return (
    <div className={cn("pt-2 first:pt-0 border-t first:border-t-0 border-border/20", className)}>
      {title && <p className="text-xs text-muted-foreground mb-2">{title}</p>}
      {children}
    </div>
  );
}

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  valueClassName?: string;
  icon?: React.ReactNode;
}

export function DetailItem({ label, value, className, valueClassName, icon }: DetailItemProps) {
  return (
    <div className={cn("mb-2 last:mb-0", className)}>
      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
        {icon && <span className="text-muted-foreground/70">{icon}</span>}
        {label}
      </p>
      <div className={cn("text-sm text-foreground font-medium", valueClassName)}>
        {value}
      </div>
    </div>
  );
}

interface DetailHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function DetailHeader({ title, subtitle, icon, badge, className }: DetailHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-4", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {badge}
    </div>
  );
}

interface DetailGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3;
}

export function DetailGrid({ children, className, cols = 2 }: DetailGridProps) {
  return (
    <div className={cn(
      "grid gap-3",
      cols === 1 && "grid-cols-1",
      cols === 2 && "grid-cols-2",
      cols === 3 && "grid-cols-3",
      className
    )}>
      {children}
    </div>
  );
}

interface SidebarListContainerProps {
  title: string;
  subtitle?: string;
  count?: number;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function SidebarListContainer({ title, subtitle, count, children, action }: SidebarListContainerProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border/20 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {(subtitle || count !== undefined) && (
            <p className="text-xs text-muted-foreground mt-1">
              {subtitle || (count !== undefined ? `${count} registros totales` : '')}
            </p>
          )}
        </div>
        {action}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}

interface SidebarListItemProps {
  title: string;
  subtitle?: string;
  status?: React.ReactNode;
  icon?: string; // URL or component
  onClick?: () => void;
  isActive?: boolean;
  children?: React.ReactNode; // Additional content like amounts, dates, etc.
}

export function SidebarListItem({ title, subtitle, status, icon, onClick, isActive, children }: SidebarListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-colors duration-150 group",
        isActive 
          ? "bg-primary/5 border-primary/30" 
          : "bg-card/40 hover:bg-card border-transparent hover:border-border/30"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {icon && (
            <img 
              src={icon} 
              alt={title} 
              className="w-8 h-8 rounded-full shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm font-medium truncate transition-colors",
              isActive ? "text-primary" : "text-foreground group-hover:text-primary"
            )}>
              {title}
            </p>
            {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>
        </div>
        {status}
      </div>
      
      {children}
    </button>
  );
}

