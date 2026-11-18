import { OverviewPanel } from '@/modules/suite-tenant/features/overview/components/overview-panel';
import {
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { useTenantMe } from '@/modules/suite-tenant/hooks/use-tenant-me';

/** Container: loads `tenant_me` and renders the overview. */
export default function TenantOverview() {
  const { data, isLoading, error, refetch } = useTenantMe();

  if (isLoading) return <TenantPageSkeleton />;
  if (error || !data) return <QueryError error={error} onRetry={() => void refetch()} />;

  return <OverviewPanel tenant={data.tenant_me} />;
}
