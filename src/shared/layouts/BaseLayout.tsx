import { Outlet } from 'react-router-dom';
import { ReactNode } from 'react';
import { SidebarProvider } from '@/shared/components/ui/sidebar';
import { CommandPalette } from '@/shared/components/common/CommandPalette';
import type { IconComponent } from '@/shared/components/animated-icons';

/**
 * Navigation item configuration
 */
export interface NavItem {
  label: string;
  path: string;
  icon: IconComponent;
  badge?: string;
  children?: NavItem[];
}

/**
 * Sidebar configuration for BaseLayout
 */
export interface SidebarConfig {
  logo: ReactNode;
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  bottomContent?: ReactNode;
  collapsible?: boolean;
}

/**
 * BaseLayout variant types
 */
export type LayoutVariant = 'suite-user' | 'backoffice' | 'minimal';

/**
 * BaseLayout configuration props
 */
export interface BaseLayoutProps {
  /**
   * Layout variant - determines which features are enabled
   * - 'suite-user': Full suite with mode sidebar, command palette, route optimizer
   * - 'backoffice': Admin panel with simplified navigation
   * - 'minimal': Basic layout with just sidebar and content
   */
  variant?: LayoutVariant;

  /**
   * Custom sidebar component to render
   * If not provided, a default sidebar will be rendered based on sidebarConfig
   */
  customSidebar?: ReactNode;

  /**
   * Sidebar configuration (used if customSidebar is not provided)
   */
  sidebarConfig?: SidebarConfig;

  /**
   * Custom topbar component
   */
  customTopbar?: ReactNode;

  /**
   * Whether to show the command palette (Cmd+K)
   * @default false
   */
  showCommandPalette?: boolean;

  /**
   * Whether to show the mode sidebar (left fixed sidebar)
   * @default false
   */
  showModeSidebar?: boolean;

  /**
   * Whether to show the route optimizer FAB and panel
   * @default false
   */
  showRouteOptimizer?: boolean;

  /**
   * Additional content to render alongside main content
   */
  sideContent?: ReactNode;

  /**
   * CSS classes for the main content area
   */
  contentClassName?: string;

  /**
   * Children are rendered via Outlet by default, but can be overridden
   */
  children?: ReactNode;
}

/**
 * BaseLayout - Unified layout component for all app variants
 * 
 * Features:
 * - Configurable sidebar (custom or auto-generated)
 * - Optional command palette
 * - Optional mode sidebar
 * - Optional route optimizer
 * - Responsive design
 * - Type-safe navigation config
 * 
 * @example Suite User Layout
 * ```tsx
 * <BaseLayout
 *   variant="suite-user"
 *   customSidebar={<AppSidebar />}
 *   customTopbar={<AppTopbar />}
 *   showCommandPalette
 *   showModeSidebar
 *   showRouteOptimizer
 * />
 * ```
 * 
 * @example Backoffice Layout
 * ```tsx
 * <BaseLayout
 *   variant="backoffice"
 *   sidebarConfig={{
 *     logo: <Logo />,
 *     title: "Backoffice",
 *     subtitle: "Admin Panel",
 *     navItems: [...],
 *   }}
 * />
 * ```
 * 
 * @example Minimal Layout (Auth pages, etc)
 * ```tsx
 * <BaseLayout variant="minimal">
 *   <LoginForm />
 * </BaseLayout>
 * ```
 */
export function BaseLayout({
  variant = 'minimal',
  customSidebar,
  sidebarConfig,
  customTopbar,
  showCommandPalette = false,
  showModeSidebar = false,
  showRouteOptimizer = false,
  sideContent,
  contentClassName,
  children,
}: BaseLayoutProps) {
  // Minimal variant - no sidebar, just content
  if (variant === 'minimal') {
    return (
      <div className="min-h-screen w-full bg-background">
        {showCommandPalette && <CommandPalette />}
        <main className={contentClassName}>{children || <Outlet />}</main>
      </div>
    );
  }

  // Full layout with sidebar
  const hasSidebar = customSidebar || sidebarConfig;

  return (
    <>
      {showCommandPalette && <CommandPalette />}

      <div className="flex min-h-screen w-full bg-background">
        {/* Mode Sidebar - Only for suite-user variant */}
        {showModeSidebar && variant === 'suite-user' && (
          <>
            {/* Import dynamically to avoid circular dependencies */}
            <ModeSidebarLazy />
            <div className="w-16 shrink-0" /> {/* Spacer */}
          </>
        )}

        {/* Main Layout Container */}
        {hasSidebar ? (
          <SidebarProvider>
            <div className="flex flex-1 min-w-0">
              {/* Sidebar */}
              {customSidebar || <DefaultSidebar config={sidebarConfig!} />}

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Topbar */}
                {customTopbar && <div className="shrink-0">{customTopbar}</div>}

                {/* Page Content */}
                <main className={`flex-1 overflow-auto ${contentClassName || ''}`}>
                  {children || <Outlet />}
                </main>
              </div>

              {/* Side Content (Route Optimizer, etc) */}
              {sideContent}

              {/* Route Optimizer - Only for suite-user variant */}
              {showRouteOptimizer && variant === 'suite-user' && <RouteOptimizerLazy />}
            </div>
          </SidebarProvider>
        ) : (
          // No sidebar case (shouldn't happen but fallback)
          <div className="flex-1">
            {customTopbar && <div>{customTopbar}</div>}
            <main className={contentClassName}>{children || <Outlet />}</main>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Default Sidebar - Auto-generated from config
 */
function DefaultSidebar({ config }: { config: SidebarConfig }) {
  return (
    <aside className="fixed inset-y-0 left-0 w-72 border-r bg-card">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            {config.logo}
            <div>
              <h2 className="font-bold text-lg">{config.title}</h2>
              {config.subtitle && <p className="text-xs text-muted-foreground">{config.subtitle}</p>}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {config.navItems.map((item) => (
            <NavItemComponent key={item.path} item={item} />
          ))}
        </nav>

        {/* Bottom Content */}
        {config.bottomContent && <div className="p-4 border-t">{config.bottomContent}</div>}
      </div>
    </aside>
  );
}

/**
 * Navigation Item Component
 */
function NavItemComponent({ item }: { item: NavItem }) {
  const Icon = item.icon;

  return (
    <a
      href={item.path}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-sm font-medium group"
    >
      <Icon className="w-5 h-5 transition-transform" />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
          {item.badge}
        </span>
      )}
    </a>
  );
}

/**
 * Lazy-loaded Mode Sidebar to avoid circular dependencies
 */
function ModeSidebarLazy() {
  // Dynamic import to avoid circular deps
  const { ModeSidebar } = require('@/shared/components/common/ModeSidebar');
  return <ModeSidebar />;
}

/**
 * Lazy-loaded Route Optimizer components
 */
function RouteOptimizerLazy() {
  const { RouteOptimizerFAB } = require('@/shared/components/common/RouteOptimizerFAB');
  const { AgenticPanel } = require('@/shared/components/common/AgenticPanel');

  return (
    <>
      <RouteOptimizerFAB />
      <AgenticPanel />
    </>
  );
}

