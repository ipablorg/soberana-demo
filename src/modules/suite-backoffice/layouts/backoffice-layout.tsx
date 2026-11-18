/**
 * BackofficeLayout
 *
 * Main layout for Suite Backoffice with mode-based navigation.
 * Replicates the architecture from Suite User with:
 * - ModeSidebar (mini-sidebar with 4 modes: Move, Change, Account, Treasury)
 * - GenericSidebar (main sidebar with sections based on active mode)
 * - Right Sidebar (contextual actions, toggleable)
 * - Top bar
 *
 * Architecture:
 * [ModeSidebar] | [GenericSidebar] | [Content Area] | [Right Sidebar]
 *    64px       |     ~256px       |   Remaining    |    380px (optional)
 */

import { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Menu } from '@/shared/components/animated-icons';
import { SidebarProvider, useSidebar } from '@/shared/components/ui/sidebar';
import { ModeSidebar } from '@/shared/components/common/ModeSidebar';
import { GenericSidebar } from '@/shared/components/common/GenericSidebar';
import { AppTopbar } from '@/shared/components/common/AppTopbar';
import { useModeStore, BackofficeMode } from '@/shared/stores/useModeStore';
import {
  PROVIDER_REQUIREMENTS_ROUTE,
  canAccessBackofficeRoute,
  getBackofficeAccess,
  getBackofficeModeForPath,
  getBackofficeSections,
  getVisibleBackofficeModes,
} from '@/shared/config/backoffice-modes.config';
import { useProviderRequirementCounts } from '@/modules/suite-backoffice/features/provider-requirements/hooks/use-provider-requirements';
import { pendingRequirementTotal } from '@/modules/suite-backoffice/features/provider-requirements/lib/provider-requirement-rows';
import {
  BackofficeRightSidebar,
  BackofficeAction,
} from '@/modules/suite-backoffice/components/BackofficeRightSidebar';
import { CountrySelector } from '@/modules/suite-backoffice/components/CountrySelector';
import { useMobile } from '@/shared/hooks/use-mobile';
import { cn } from '@/shared/lib/utils';
import { DynamicIsland } from '@/shared/components/DynamicIsland';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useLingui } from '@lingui/react/macro';

const NO_STAFF_ROLES: readonly string[] = [];

/** Below this width the main sidebar starts collapsed; the rail always stays. */
const COMPACT_BREAKPOINT = 1024;

/** Rail (4rem) + expanded sidebar (16rem) / icon sidebar (3rem) in px. */
const RAIL_WIDTH_PX = 64;
const SIDEBAR_WIDTH_PX = 256;
const SIDEBAR_ICON_WIDTH_PX = 48;

/** CSS variable other staff chrome (e.g. the MFA banner) uses to clear the fixed sidebars. */
export const CONTENT_OFFSET_VAR = '--backoffice-content-offset';

/** Toggle for the main sidebar, shown below the compact breakpoint. */
function SidebarToggle() {
  const { t } = useLingui();
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex shrink-0 items-center border-b border-border bg-background px-2 py-1 lg:hidden">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={t`Mostrar u ocultar el menú`}
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
}

export function BackofficeLayout() {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const { pathname } = useLocation();
  const { currentBackofficeMode, setBackofficeMode } = useModeStore();
  const staffRoles = useAuthStore((state) => state.user?.staff_roles ?? NO_STAFF_ROLES);
  const roleAccess = useMemo(() => getBackofficeAccess(staffRoles), [staffRoles]);
  // Whoever opens the provider requirements queue sees what waits there (S21;
  // #411: operations reviews it, commercial reads it).
  const seesRequirements = canAccessBackofficeRoute(PROVIDER_REQUIREMENTS_ROUTE, staffRoles);
  const requirementCounts = useProviderRequirementCounts(seesRequirements);
  const pendingRequirements = seesRequirements
    ? pendingRequirementTotal(requirementCounts.data?.adminLoopay_providerRequirementCounts)
    : 0;
  const sectionAccess = useMemo(
    () =>
      pendingRequirements > 0
        ? { ...roleAccess, badges: { [PROVIDER_REQUIREMENTS_ROUTE]: String(pendingRequirements) } }
        : roleAccess,
    [roleAccess, pendingRequirements]
  );
  const visibleModes = getVisibleBackofficeModes(sectionAccess);
  // The rail and sidebar follow the current route; the stored mode only decides
  // for routes no mode owns, and a mode the role cannot see falls back to its first.
  const routeMode = getBackofficeModeForPath(pathname);
  const preferredMode = routeMode ?? currentBackofficeMode;
  const activeMode: BackofficeMode = visibleModes.some((mode) => mode.id === preferredMode)
    ? preferredMode
    : (visibleModes[0]?.id ?? preferredMode);

  useEffect(() => {
    if (activeMode !== currentBackofficeMode) setBackofficeMode(activeMode);
  }, [activeMode, currentBackofficeMode, setBackofficeMode]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= COMPACT_BREAKPOINT
  );
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [rightSidebarActions, setRightSidebarActions] = useState<BackofficeAction[]>([]);
  const [rightSidebarContent, setRightSidebarContent] = useState<React.ReactNode>(null);

  // Standard layout strategy:
  // < 1440px (Laptop): Right Sidebar is overlay (absolute) to prevent table squashing
  // >= 1440px (Desktop): Right Sidebar is in-flow (relative) for full visibility
  const [isLaptop, setIsLaptop] = useState(false);

  useEffect(() => {
    let wasCompact = window.innerWidth < COMPACT_BREAKPOINT;
    const checkLayout = () => {
      setIsLaptop(window.innerWidth < 1440);
      const isCompact = window.innerWidth < COMPACT_BREAKPOINT;
      // Collapse when entering the compact range, reopen when leaving it.
      if (isCompact !== wasCompact) {
        wasCompact = isCompact;
        setIsSidebarOpen(!isCompact);
      }
    };
    // Initial check
    checkLayout();

    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, []);

  // Publish how much width the fixed rail + sidebar cover so the staff MFA
  // banner (rendered above the layout) can start at the content column.
  useEffect(() => {
    const offset = isMobile
      ? RAIL_WIDTH_PX
      : RAIL_WIDTH_PX + (isSidebarOpen ? SIDEBAR_WIDTH_PX : SIDEBAR_ICON_WIDTH_PX);
    document.documentElement.style.setProperty(CONTENT_OFFSET_VAR, `${offset}px`);
    // Lets globally mounted chrome (e.g. the WhatsApp FAB) step aside inside the backoffice.
    document.documentElement.dataset.surface = 'backoffice';

    return () => {
      document.documentElement.style.removeProperty(CONTENT_OFFSET_VAR);
      delete document.documentElement.dataset.surface;
    };
  }, [isMobile, isSidebarOpen]);

  // Context for pages to update sidebar actions and content
  const contextValue = {
    setRightSidebarActions,
    setRightSidebarContent,
    setIsRightSidebarOpen,
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mode Sidebar - Always visible on the far left (fixed) */}
      <ModeSidebar<BackofficeMode>
        modes={visibleModes}
        currentMode={activeMode}
        onModeChange={(mode, defaultRoute) => {
          setBackofficeMode(mode);
          // The mode's default entry may be hidden for this role: open its first visible one.
          const urls = getBackofficeSections(mode, sectionAccess).flatMap((group) =>
            group.items.map((item) => item.url)
          );
          navigate(urls.includes(defaultRoute) ? defaultRoute : (urls[0] ?? defaultRoute));
        }}
        showProBadge={false}
      />

      {/* Spacer for fixed ModeSidebar */}
      <div className="w-16 shrink-0" />

      {/* Main App Layout with Sidebar */}
      {/* min-w-0: the provider wrapper is `w-full`; beside the w-16 spacer it must be
          allowed to shrink, otherwise the whole layout overflows the viewport by 64px */}
      <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen} className="min-w-0">
        <div className="flex flex-1 min-w-0 h-screen relative overflow-hidden">
          {/* Main Sidebar - Collapsible with mode-based sections */}
          <GenericSidebar<BackofficeMode>
            currentMode={activeMode}
            getSections={(mode) => getBackofficeSections(mode, sectionAccess)}
            topContent={<CountrySelector />}
            className="left-16" // Offset for ModeSidebar
            renderPlaceholder={(mode) => (
              <div className="p-4">
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <h2 className="text-lg font-semibold mb-2">
                    Secciones de {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Las secciones para este modo se definirán próximamente.
                  </p>
                </div>
              </div>
            )}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full min-h-0 min-w-0">
            {/* Sidebar toggle (below lg) + top bar */}
            <SidebarToggle />
            <AppTopbar />

            {/* Action feedback: the shared dynamic island (renders only while it has something to say) */}
            <div className="pointer-events-none fixed left-1/2 top-3 z-[70] w-[min(92vw,480px)] -translate-x-1/2">
              <DynamicIsland showBalance={false} />
            </div>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              <Outlet context={contextValue} />
            </main>
          </div>

          {/* Desktop: Right Sidebar Container with Toggle Button.
              Only mounted when a page registered content/actions: otherwise it is an
              empty 380px column that wastes space on every page. */}
          {!isMobile && (rightSidebarContent || rightSidebarActions.length > 0) && (
            <div
              className={cn(
                'transition-[width,opacity] duration-200',
                isLaptop ? 'absolute right-0 h-full shadow-2xl z-60' : 'relative shrink-0 z-40'
              )}
            >
              {rightSidebarContent && (
                <button
                  onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 z-50 -left-3',
                    'w-6 h-12 rounded-l-lg',
                    'bg-card border border-r-0 border-border',
                    'flex items-center justify-center',
                    'transition-colors duration-150',
                    'hover:bg-muted'
                  )}
                >
                  {isRightSidebarOpen ? (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              )}

              {/* Right Sidebar - In document flow, fixed height with independent scroll */}
              <AnimatePresence initial={false}>
                {isRightSidebarOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 380, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="h-full border-l border-border bg-background overflow-hidden"
                  >
                    <div className="w-[380px] h-full">
                      <BackofficeRightSidebar actions={rightSidebarActions}>
                        {rightSidebarContent}
                      </BackofficeRightSidebar>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </SidebarProvider>
    </div>
  );
}
