import { cn } from '@/shared/lib/utils';
import { Trans } from '@lingui/react/macro';
import { usePlatformContent } from '../data/platform-content';

export interface PlatformSidebarNavProps {
  activeSection: string;
  onNavigate: (anchor: string) => void;
}

export function PlatformSidebarNav({ activeSection, onNavigate }: PlatformSidebarNavProps) {
  const { NAV_SECTIONS } = usePlatformContent();

  return (
    <nav className="p-4 space-y-0.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mb-1">
        <Trans>Platform</Trans>
      </p>
      {NAV_SECTIONS.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.anchor)}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 text-left',
              isActive
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
            {isActive && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
