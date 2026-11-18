import { Trans } from '@lingui/react/macro';

import { Button } from '@/shared/components/ui/button';

interface PageControlsProps {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}

/** Previous / next over a REST page envelope (`page`, `total_pages`, `total`). */
export function PageControls({ page, totalPages, total, onChange }: PageControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <p className="text-xs text-muted-foreground tabular-nums">
        <Trans>
          Page {page} of {totalPages} · {total} total
        </Trans>
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <Trans>Previous</Trans>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          <Trans>Next</Trans>
        </Button>
      </div>
    </div>
  );
}
