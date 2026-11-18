/**
 * Navigation Types
 * 
 * Defines types for the navigation architecture:
 * - Modes (mini-sidebar)
 * - Sections (main sidebar)
 */

import type { IconComponent } from '@/shared/components/animated-icons';
import { ReactNode } from 'react';

/**
 * Mode Item - Represents a mode button in the mini-sidebar
 */
export interface ModeItem<T extends string = string> {
  id: T;
  icon: IconComponent;
  label: string;
  description: string;
  defaultRoute: string;
}

/**
 * Section Item - Represents a navigation item in the main sidebar
 */
export interface SectionItem {
  title: string;
  url: string;
  icon: IconComponent;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'warning-solid';
}

/**
 * Section Group - Represents a group of navigation items
 */
export interface SectionGroup {
  label: string;
  items: SectionItem[];
}

/**
 * Sidebar Configuration - Complete sidebar configuration
 */
export interface SidebarConfig<T extends string = string> {
  logo?: ReactNode;
  title?: string;
  subtitle?: string;
  featuredItems?: SectionItem[];
  getSections: (mode: T) => SectionGroup[];
  bottomContent?: ReactNode;
}

/**
 * Mode Sidebar Configuration
 */
export interface ModeSidebarConfig<T extends string = string> {
  modes: ModeItem<T>[];
  currentMode: T;
  onModeChange: (mode: T, defaultRoute: string) => void;
}

