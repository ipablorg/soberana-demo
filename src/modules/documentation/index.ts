/**
 * Documentation Module
 * 
 * Exports all documentation-related components, layouts, and pages.
 * Includes general docs and API reference (Mintlify-style).
 * 
 * @module documentation
 */

// Components
export * from './components';

// Layouts
export { DocsLayout } from './layouts/DocsLayout';
export type { DocsSidebarSection } from './layouts/DocsLayout';
export { ApiDocsLayout } from './layouts/ApiDocsLayout';

// Types
export type { ApiSidebarSection } from './content/sidebar-content';

// Pages are lazy-loaded via routing, not exported here

