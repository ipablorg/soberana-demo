import { Trans, useLingui } from '@lingui/react/macro';

import { AlertTriangle } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { mapError } from '@/shared/lib/error-mapper';

/** Card-shaped loading placeholder that mirrors a header + table/detail layout. */
export function TenantPageSkeleton() {
  return (
    <div className="space-y-6" data-testid="tenant-page-skeleton">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}

interface QueryErrorProps {
  error: unknown;
  onRetry?: () => void;
}

/** Failure state of a query: mapped message and a retry. */
export function QueryError({ error, onRetry }: QueryErrorProps) {
  const { t } = useLingui();

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card px-6 py-12 text-center"
    >
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">{t`We couldn't load this.`}</p>
        <p className="text-sm text-muted-foreground">{mapError(error).message}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <Trans>Try again</Trans>
        </Button>
      ) : null}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
}

/** Empty list state with personality copy. */
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-muted/30 px-6 py-12 text-center">
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
