import { ActAsBanner } from '@/shared/components/common/act-as-banner';
import { useTenantMe } from '@/modules/suite-tenant/hooks/use-tenant-me';

/**
 * Act-as banner of the tenant backoffice (epic 2026-11 S5). The backend is the
 * source of truth: `tenant_me.acting_as` is set only under `x-act-as-client`,
 * so a real tenant admin never sees it.
 */
export function TenantActAsBanner() {
  const me = useTenantMe();
  const tenant = me.data?.tenant_me;

  if (!tenant?.acting_as) return null;

  return <ActAsBanner clientName={tenant.name} staffEmail={tenant.acting_as.staff_email} />;
}
