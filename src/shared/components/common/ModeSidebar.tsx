/**
 * ModeSidebar - Generalized Mode Sidebar Component
 * 
 * Displays a mini-sidebar with mode buttons.
 * Can be used for both Suite User and Suite Backoffice.
 * 
 * @example User context
 * <ModeSidebar<UserMode>
 *   modes={USER_MODES}
 *   currentMode={currentUserMode}
 *   onModeChange={(mode, route) => {
 *     setUserMode(mode);
 *     navigate(route);
 *   }}
 * />
 * 
 * @example Backoffice context
 * <ModeSidebar<BackofficeMode>
 *   modes={BACKOFFICE_MODES}
 *   currentMode={currentBackofficeMode}
 *   onModeChange={(mode, route) => {
 *     setBackofficeMode(mode);
 *     navigate(route);
 *   }}
 * />
 */

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { motion } from 'framer-motion';
import { ModeItem } from '@/shared/types/navigation';

interface ModeSidebarProps<T extends string> {
  modes: ModeItem<T>[];
  currentMode: T;
  onModeChange: (mode: T, defaultRoute: string) => void;
  showProBadge?: boolean;
}

export function ModeSidebar<T extends string>({
  modes,
  currentMode,
  onModeChange,
  showProBadge = true,
}: ModeSidebarProps<T>) {
  const handleModeChange = (modeId: T, defaultRoute: string) => {
    onModeChange(modeId, defaultRoute);
  };

  return (
    <aside className="fixed left-0 top-0 w-16 h-screen border-r border-sidebar-border bg-sidebar flex flex-col items-center py-4 gap-3 z-100">
      {/* PRO Badge (optional) */}
      {showProBadge && (
        <div className="relative w-11 h-7 rounded-full overflow-hidden flex items-center justify-center mb-1 bg-foreground p-[1.5px]">
          <div className="w-full h-full rounded-full bg-sidebar flex items-center justify-center">
            <span className="text-[11px] font-extrabold text-primary-foreground tracking-wide">
              PRO
            </span>
          </div>
        </div>
      )}
      
      {/* Mode Buttons */}
      <div className="flex flex-col gap-3 w-full items-center">
        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          const Icon = mode.icon;
          
          return (
            <TooltipProvider key={mode.id} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleModeChange(mode.id, mode.defaultRoute)}
                    className={`
                      relative w-11 h-11 rounded-xl flex items-center justify-center
                      transition-all duration-200 overflow-hidden
                      ${isActive 
                        ? 'text-primary-foreground shadow-lg' 
                        : 'hover:bg-sidebar-accent text-sidebar-foreground bg-sidebar-accent/50'
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mode-indicator"
                        className="absolute inset-0 rounded-xl bg-primary"
                        initial={false}
                        transition={{
                          duration: 0.2,
                          ease: 'easeOut',
                        }}
                      />
                    )}
                    <Icon className="w-5 h-5 relative z-10" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-popover text-popover-foreground border">
                  <div>
                    <p className="font-semibold text-sm">{mode.label}</p>
                    <p className="text-xs text-muted-foreground">{mode.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </aside>
  );
}
