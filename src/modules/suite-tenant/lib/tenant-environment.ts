/**
 * Deployment environment of the tenant backoffice (S6).
 *
 * One running back is one environment: the QA deployment is the clients'
 * sandbox, the production deployment is production. `tenant_me.environment`
 * says which one answered; the front offers a link to the same route on the
 * other deployment, whose base URL comes from the build-time variables
 * `VITE_TENANT_PRODUCTION_URL` / `VITE_TENANT_SANDBOX_URL` (no link when unset).
 */

export type TenantEnvironment = 'production' | 'sandbox';

export interface DeploymentUrls {
  production?: string;
  sandbox?: string;
}

export interface CrossEnvironmentLink {
  target: TenantEnvironment;
  href: string;
}

/** `production` only for the production deployment; every other value is the sandbox. */
export function normalizeEnvironment(value: string | null | undefined): TenantEnvironment {
  return value === 'production' ? 'production' : 'sandbox';
}

function clean(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

/** Base URLs of both deployments from the build-time environment. */
export function readDeploymentUrls(env: Record<string, unknown> = import.meta.env): DeploymentUrls {
  return {
    production: clean(env.VITE_TENANT_PRODUCTION_URL),
    sandbox: clean(env.VITE_TENANT_SANDBOX_URL),
  };
}

/**
 * Link to `path` (pathname + search + hash) on the other deployment, or null
 * when that deployment's base URL is not configured.
 */
export function getCrossEnvironmentLink(
  current: TenantEnvironment,
  path: string,
  urls: DeploymentUrls
): CrossEnvironmentLink | null {
  const target: TenantEnvironment = current === 'production' ? 'sandbox' : 'production';
  const base = urls[target];
  if (!base) return null;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return { target, href: `${base.replace(/\/+$/, '')}${normalizedPath}` };
}
