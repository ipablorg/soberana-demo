import { Link } from 'react-router-dom';
import { Trans } from '@lingui/react/macro';

import type { TenantWebhookLog } from '@/graphql/types/tenant';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { tenantWebhookLogRoute } from '@/shared/config/tenant-modes.config';
import { formatDateTime } from '@/modules/suite-tenant/lib/tenant-format';

interface WebhookLogsTableProps {
  logs: readonly TenantWebhookLog[];
}

/** Presentational delivery attempts; the event opens the delivery detail. */
export function WebhookLogsTable({ logs }: WebhookLogsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table data-testid="webhook-logs">
        <TableHeader>
          <TableRow>
            <TableHead>
              <Trans>Event</Trans>
            </TableHead>
            <TableHead>
              <Trans>Result</Trans>
            </TableHead>
            <TableHead className="text-right">
              <Trans>HTTP</Trans>
            </TableHead>
            <TableHead className="text-right">
              <Trans>Attempt</Trans>
            </TableHead>
            <TableHead>
              <Trans>Sent</Trans>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <Link
                  to={tenantWebhookLogRoute(log.id)}
                  className="font-mono text-sm text-foreground transition-colors duration-150 hover:text-primary"
                >
                  {log.event_type}
                </Link>
                <p className="break-all text-xs text-muted-foreground">{log.url}</p>
              </TableCell>
              <TableCell>
                <Badge
                  variant={log.success ? 'success' : 'destructive'}
                  className="rounded-md text-xs"
                >
                  {log.success ? <Trans>Delivered</Trans> : <Trans>Failed</Trans>}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums">
                {log.http_status ?? '—'}
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums">
                {log.attempt}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDateTime(log.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
