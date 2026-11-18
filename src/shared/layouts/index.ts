/**
 * Shared Layouts Module
 * 
 * Provides unified, reusable layout components for the entire application.
 * 
 * @example
 * ```tsx
 * import { BaseLayout } from '@/shared/layouts';
 * 
 * // Suite User Layout
 * <BaseLayout
 *   variant="suite-user"
 *   customSidebar={<AppSidebar />}
 *   showCommandPalette
 *   showModeSidebar
 * />
 * 
 * // Backoffice Layout
 * <BaseLayout
 *   variant="backoffice"
 *   sidebarConfig={{ ... }}
 * />
 * ```
 */

export { BaseLayout } from './BaseLayout';
export type {
  BaseLayoutProps,
  LayoutVariant,
  NavItem,
  SidebarConfig,
} from './BaseLayout';
export { AuthLayout } from './AuthLayout';

