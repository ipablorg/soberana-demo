/**
 * BackofficeRightSidebar Component
 * 
 * Sidebar derecho reutilizable para el backoffice con acciones contextuales.
 * Similar a BridgeRightSidebar y QuickActionsRightSidebar, pero adaptado
 * para las necesidades del backoffice.
 */

import type { IconComponent } from '@/shared/components/animated-icons';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';

export interface BackofficeAction {
  id: string;
  label: string;
  icon: IconComponent;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
}

interface BackofficeRightSidebarProps {
  actions: BackofficeAction[];
  children?: React.ReactNode;
}

export function BackofficeRightSidebar({
  children,
}: BackofficeRightSidebarProps) {
  return (
    <div className="h-full flex flex-col min-h-0">
      <ScrollArea className="flex-1 min-h-0 h-full">
        <div className="p-6 space-y-6 pb-20">
          {/* Custom Content */}
          {children && (
            <div className="space-y-4">
              {children}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

