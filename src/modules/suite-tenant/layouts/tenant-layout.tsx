/**
 * TenantLayout — chrome of the tenant backoffice (`/tenant/*`).
 *
 * Reuses the shared sidebar and top bar: [GenericSidebar] | [top bar + content].
 * The top bar carries the environment badge and the cross-link to the same
 * route on the other deployment (S6); the sidebar lists every tenant section.
 * When a Loopay staff member acts as a tenant admin (S5), the act-as banner
 * sits on top of the content column.
 */

import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useLingui as useLinguiRuntime } from '@lingui/react';
import { Trans, useLingui } from '@lingui/react/macro';

import { Menu } from '@/shared/components/animated-icons';
import { AppTopbar } from '@/shared/components/common/AppTopbar';
import { GenericSidebar } from '@/shared/components/common/GenericSidebar';
import { SidebarProvider, useSidebar } from '@/shared/components/ui/sidebar';
import { getTenantSections } from '@/shared/config/tenant-modes.config';
import { TenantActAsBanner } from '@/modules/suite-tenant/components/organisms/tenant-act-as-banner';
import { TenantEnvironmentBar } from '@/modules/suite-tenant/components/organisms/tenant-environment-bar';
import { useTenantMe } from '@/modules/suite-tenant/hooks/use-tenant-me';
import { readDeploymentUrls } from '@/modules/suite-tenant/lib/tenant-environment';

/** Below this width the sidebar starts collapsed. */
const COMPACT_BREAKPOINT = 1024;

type TenantMode = 'tenant';

function SidebarToggle() {
  const { t } = useLingui();
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex shrink-0 items-center border-b border-border bg-background px-2 py-1 lg:hidden">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={t`Show or hide the menu`}
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
}

/** Client name + environment, at the top of the sidebar. */
function TenantIdentity({ name }: { name: string | undefined }) {
  return (
    <div className="space-y-0.5 px-2">
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        <Trans>Tenant backoffice</Trans>
      </p>
      <p className="truncate text-sm font-semibold text-foreground">{name ?? '—'}</p>
    </div>
  );
}

export function TenantLayout() {
  const { i18n } = useLinguiRuntime();
  const me = useTenantMe();
  const urls = useMemo(() => readDeploymentUrls(), []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= COMPACT_BREAKPOINT
  );
  const sections = useMemo(() => getTenantSections((descriptor) => i18n._(descriptor)), [i18n]);
  const tenant = me.data?.tenant_me;

  return (
    <div className="flex min-h-screen w-full bg-background" data-surface="tenant">
      <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen} className="min-w-0">
        <div className="relative flex h-screen min-w-0 flex-1 overflow-hidden">
          <GenericSidebar<TenantMode>
            currentMode="tenant"
            getSections={() => sections}
            topContent={<TenantIdentity name={tenant?.name} />}
          />

          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
            <TenantActAsBanner />
            <SidebarToggle />
            <AppTopbar
              rightSlot={
                tenant ? (
                  <TenantEnvironmentBar environment={tenant.environment} urls={urls} />
                ) : null
              }
            />
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
