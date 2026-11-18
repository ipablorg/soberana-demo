import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { AppTopbar } from '@/shared/components/common/AppTopbar';
import { BottomDock, type DockSection } from '@/shared/components/common/BottomDock';
import { CommandPalette } from '@/shared/components/common/CommandPalette';
import { RouteOptimizerFAB } from '@/shared/components/common/RouteOptimizerFAB';
import { AgenticPanel } from '@/shared/components/common/AgenticPanel';
import { TutorialButton } from '@/modules/suite-user/features/dashboard/components/tutorial';
import { HelpMenu } from '@/modules/suite-user/components/help-menu';
import { SuiteShell } from '@/modules/suite-user/components/SuiteShell';
import { cn } from '@/shared/lib/utils';
import { useModeStore } from '@/shared/stores/useModeStore';
import { useUserTypeStore } from '@/shared/stores/useUserTypeStore';
import { USER_TYPE_CONFIG } from '@/shared/config/user-types.config';
import { useAutoProductDetection } from '@/shared/hooks/useAutoProductDetection';

/**
 * Navigation state that tells the layout which dock section to show on
 * arrival (e.g. `/suite/send` must land on the home section, where the
 * island flow renders, whatever section the dock was left on).
 */
export interface DockSectionNavigationState {
  dockSection: DockSection;
}

function requestedDockSection(state: unknown): DockSection | null {
  const section = (state as Partial<DockSectionNavigationState> | null)?.dockSection;
  return section ?? null;
}

/**
 * AppLayout — unified layout for the suite-user module.
 *
 * Replaces the previous `UserLayout` / `MobileLayout` fork with a
 * single responsive shell. The bottom navigation (`BottomDock`) is
 * always visible as a floating pill centered at the bottom.
 *
 * Architecture:
 * - `AppTopbar` (responsive top bar)
 * - Scrollable content area (`SuiteShell` on dashboard, `<Outlet>` on flows)
 * - `BottomDock` (floating pill, always visible at bottom center)
 */
export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUserMode, setUserMode } = useModeStore();
  const { userType } = useUserTypeStore();

  // Section state for the dock — lifted from SuiteShell so the layout
  // owns the navigation and the dock + content stay in sync.
  const [activeSection, setActiveSection] = useState<DockSection>('home');

  useAutoProductDetection();

  // A navigation may ask for a dock section (the section state outlives route
  // changes, so without this a deep link to the island flow would land on
  // whatever section the dock was last left on).
  const navigationSection = requestedDockSection(location.state);
  useEffect(() => {
    if (navigationSection) setActiveSection(navigationSection);
  }, [location.key, navigationSection]);

  const isMainRoute = location.pathname === '/suite/dashboard' || location.pathname === '/suite';

  const isIntelligentMode = location.pathname === '/suite/intelligent-mode';

  // Tell global overlays (WhatsApp FAB) that the floating dock owns the bottom
  // edge on this surface, so they can lift themselves above it on mobile.
  useEffect(() => {
    document.documentElement.setAttribute('data-suite-dock', '');
    return () => document.documentElement.removeAttribute('data-suite-dock');
  }, []);

  // Mode guard: if the current mode isn't allowed for this user type,
  // reset to operator and redirect to dashboard.
  useEffect(() => {
    const isModeAllowed = USER_TYPE_CONFIG[userType].modes.includes(currentUserMode);
    if (!isModeAllowed) {
      setUserMode('operator');
      navigate('/suite/dashboard');
    }
  }, [userType, currentUserMode, setUserMode, navigate]);

  // Auto-switch mode based on route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/automations') || path.includes('/build')) {
      if (currentUserMode !== 'builder') setUserMode('builder');
    } else if (path.includes('/intelligent-mode')) {
      if (currentUserMode !== 'intelligent') setUserMode('intelligent');
    } else {
      if (currentUserMode !== 'operator') setUserMode('operator');
    }
  }, [location.pathname, currentUserMode, setUserMode]);

  // When the user taps a dock item while on a flow route,
  // navigate to the dashboard first.
  const handleDockChange = (section: DockSection) => {
    setActiveSection(section);
    if (!isMainRoute) {
      navigate('/suite/dashboard');
    }
  };

  return (
    <>
      <CommandPalette />

      <div className="flex h-dvh w-full flex-col bg-background">
        <AppTopbar
          rightSlot={
            <>
              <HelpMenu />
              {isMainRoute && <TutorialButton />}
            </>
          }
        />

        <main
          className={cn(
            'flex-1 overflow-auto relative',
            // Flow routes render through <Outlet> with no padding of their own:
            // reserve the floating dock height + safe-area so nothing hides under it.
            !isMainRoute && 'pb-[calc(6rem+env(safe-area-inset-bottom))]'
          )}
        >
          {isMainRoute ? <SuiteShell activeSection={activeSection} /> : <Outlet />}
        </main>
      </div>

      {/* Floating dock — fixed at bottom center, overlays content */}
      <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40">
        <BottomDock active={activeSection} onChange={handleDockChange} />
      </div>

      {!isIntelligentMode && currentUserMode === 'builder' && (
        <>
          <RouteOptimizerFAB />
          <AgenticPanel />
        </>
      )}
    </>
  );
}
