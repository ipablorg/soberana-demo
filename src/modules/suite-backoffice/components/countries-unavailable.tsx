/**
 * Sidebar empty state for a failed countries request.
 *
 * Deliberately quiet: the country context is secondary to navigation, so a
 * failure gets a dimmed icon, one line of muted copy and a retry action rather
 * than a red alert. Collapsed sidebars get a single icon button.
 */

import { Trans, useLingui } from '@lingui/react/macro';

import {
  Loader2,
  MapIcon,
  RefreshCw,
} from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';

interface CountriesUnavailableProps {
  onRetry: () => void;
  isRetrying: boolean;
  collapsed: boolean;
}

export function CountriesUnavailable({
  onRetry,
  isRetrying,
  collapsed,
}: CountriesUnavailableProps) {
  const { t } = useLingui();

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="mx-auto"
              aria-label={t`Reintentar`}
              aria-busy={isRetrying}
              disabled={isRetrying}
              onClick={onRetry}
            >
              {isRetrying ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {t`No pudimos cargar los países`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-border/40 px-3 py-3 text-center">
      <MapIcon aria-hidden="true" className="size-5 text-muted-foreground/50" />
      <p className="text-xs text-muted-foreground">
        <Trans>No pudimos cargar los países</Trans>
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full uppercase tracking-wide"
        aria-busy={isRetrying}
        disabled={isRetrying}
        onClick={onRetry}
      >
        {isRetrying && <Loader2 className="animate-spin" />}
        <Trans>Reintentar</Trans>
      </Button>
    </div>
  );
}
