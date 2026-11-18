/**
 * GenericSidebar - Base Sidebar Component
 * 
 * A generalized sidebar that can be configured for different contexts.
 * Displays sections based on the current mode.
 * 
 * @example
 * <GenericSidebar<BackofficeMode>
 *   currentMode={currentBackofficeMode}
 *   getSections={(mode) => getBackofficeSections(mode)}
 *   renderPlaceholder={(mode) => (
 *     <div className="p-4">
 *       <h2 className="text-lg font-semibold">
 *         Secciones de {mode.charAt(0).toUpperCase() + mode.slice(1)}
 *       </h2>
 *     </div>
 *   )}
 * />
 */

import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/shared/components/ui/sidebar';
import { Badge } from '@/shared/components/ui/badge';
import { SectionGroup, SectionItem } from '@/shared/types/navigation';
import { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface GenericSidebarProps<T extends string> {
  /**
   * Current active mode
   */
  currentMode: T;
  
  /**
   * Function to get sections for a given mode
   */
  getSections: (mode: T) => SectionGroup[];
  
  /**
   * Optional top content (e.g., country selector, filters)
   */
  topContent?: ReactNode;
  
  /**
   * Optional featured items to show at the top
   */
  featuredItems?: SectionItem[];
  
  /**
   * Optional bottom content (e.g., logout button, user info)
   */
  bottomContent?: ReactNode;
  
  /**
   * Render placeholder when no sections are defined
   */
  renderPlaceholder?: (mode: T) => ReactNode;
  
  /**
   * Optional class name for the sidebar container
   */
  className?: string;
}

export function GenericSidebar<T extends string>({
  currentMode,
  getSections,
  topContent,
  featuredItems,
  bottomContent,
  renderPlaceholder,
  className,
}: GenericSidebarProps<T>) {
  const location = useLocation();
  const sections = getSections(currentMode);

  // Check if sections are empty (only has placeholder groups)
  const hasRealSections = sections.some(group => group.items.length > 0);

  return (
    <Sidebar 
      className={cn(
        "border-r border-sidebar-border bg-sidebar-background",
        className
      )} 
      collapsible="icon"
    >
      <SidebarContent className="pt-3">
        {/* Top Content */}
        {topContent && (
          <SidebarGroup className="px-2 pb-4 border-b border-sidebar-border">
            {topContent}
          </SidebarGroup>
        )}

        {/* Featured Items */}
        {featuredItems && featuredItems.length > 0 && (
          <SidebarGroup className="px-2 pb-4 border-b border-sidebar-border">
            <SidebarMenu className="space-y-1.5">
              {featuredItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.url;
                
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="h-10"
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                        {item.badge && (
                          <Badge variant={item.badgeVariant || 'default'} className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Placeholder or Sections */}
        {!hasRealSections && renderPlaceholder ? (
          renderPlaceholder(currentMode)
        ) : (
          sections.map((group, groupIndex) => (
            <SidebarGroup key={groupIndex} className="px-2 py-4">
              <SidebarGroupLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.url;
                    
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className="h-9"
                        >
                          <Link to={item.url} className="flex items-center gap-3">
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{item.title}</span>
                            {item.badge && (
                              <Badge variant={item.badgeVariant || 'secondary'} className="ml-auto text-xs font-semibold tabular-nums">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}

        {/* Bottom Content */}
        {bottomContent && (
          <SidebarGroup className="mt-auto px-2 py-4 border-t border-sidebar-border">
            {bottomContent}
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

