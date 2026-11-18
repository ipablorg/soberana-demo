/**
 * Tenant backoffice navigation (`/tenant/*`).
 *
 * Every section links to a live screen: the client's business (customers,
 * wallets, transactions), its money movement (beneficiaries, quotes, virtual
 * accounts, rails) and its settings (webhooks, team, API key). Titles are
 * Lingui descriptors: the layout translates them with the active locale.
 */

import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';

import {
  ArrowRightLeft,
  Banknote,
  Key,
  Landmark,
  LayoutDashboard,
  Receipt,
  Settings,
  UserCheck,
  Users,
  Wallet,
  Webhook,
  type IconComponent,
} from '@/shared/components/animated-icons';
import type { SectionGroup } from '@/shared/types/navigation';

export const TENANT_ROUTES = {
  overview: '/tenant/overview',
  customers: '/tenant/customers',
  customerNew: '/tenant/customers/new',
  wallets: '/tenant/wallets',
  transactions: '/tenant/transactions',
  transactionNew: '/tenant/transactions/new',
  team: '/tenant/team',
  apiKey: '/tenant/api-key',
  beneficiaries: '/tenant/beneficiaries',
  beneficiaryNew: '/tenant/beneficiaries/new',
  quotes: '/tenant/quotes',
  rails: '/tenant/rails',
  virtualAccounts: '/tenant/virtual-accounts',
  webhooks: '/tenant/webhooks',
  webhookLogs: '/tenant/webhooks/logs',
} as const;

export const tenantCustomerRoute = (id: string) =>
  `${TENANT_ROUTES.customers}/${encodeURIComponent(id)}`;
export const tenantWalletRoute = (id: string) =>
  `${TENANT_ROUTES.wallets}/${encodeURIComponent(id)}`;
export const tenantTransactionRoute = (id: string) =>
  `${TENANT_ROUTES.transactions}/${encodeURIComponent(id)}`;
export const tenantBeneficiaryRoute = (id: string) =>
  `${TENANT_ROUTES.beneficiaries}/${encodeURIComponent(id)}`;
export const tenantQuoteRoute = (id: string) => `${TENANT_ROUTES.quotes}/${encodeURIComponent(id)}`;
export const tenantWebhookLogRoute = (id: string) =>
  `${TENANT_ROUTES.webhookLogs}/${encodeURIComponent(id)}`;

interface TenantNavItem {
  title: MessageDescriptor;
  url: string;
  icon: IconComponent;
}

interface TenantNavGroup {
  label: MessageDescriptor;
  items: TenantNavItem[];
}

const TENANT_NAV: TenantNavGroup[] = [
  {
    label: msg`Your business`,
    items: [
      { title: msg`Overview`, url: TENANT_ROUTES.overview, icon: LayoutDashboard },
      { title: msg`Customers`, url: TENANT_ROUTES.customers, icon: UserCheck },
      { title: msg`Wallets`, url: TENANT_ROUTES.wallets, icon: Wallet },
      { title: msg`Transactions`, url: TENANT_ROUTES.transactions, icon: ArrowRightLeft },
    ],
  },
  {
    label: msg`Money movement`,
    items: [
      { title: msg`Beneficiaries`, url: TENANT_ROUTES.beneficiaries, icon: Banknote },
      { title: msg`Quotes`, url: TENANT_ROUTES.quotes, icon: Receipt },
      { title: msg`Virtual accounts`, url: TENANT_ROUTES.virtualAccounts, icon: Landmark },
      { title: msg`Rails`, url: TENANT_ROUTES.rails, icon: Settings },
    ],
  },
  {
    label: msg`Settings`,
    items: [
      { title: msg`Webhooks`, url: TENANT_ROUTES.webhooks, icon: Webhook },
      { title: msg`Team`, url: TENANT_ROUTES.team, icon: Users },
      { title: msg`API key`, url: TENANT_ROUTES.apiKey, icon: Key },
    ],
  },
];

/** Sidebar groups with titles translated by `translate` (e.g. `i18n._`). */
export function getTenantSections(
  translate: (descriptor: MessageDescriptor) => string
): SectionGroup[] {
  return TENANT_NAV.map((group) => ({
    label: translate(group.label),
    items: group.items.map((item) => ({
      title: translate(item.title),
      url: item.url,
      icon: item.icon,
    })),
  }));
}
