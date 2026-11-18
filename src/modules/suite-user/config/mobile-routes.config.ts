import type { ComponentType } from 'react';
import { lazy } from 'react';

const ConversationalHome = lazy(
  () => import('@/modules/suite-user/features/dashboard/pages/conversational-home')
);
const ReceivePage = lazy(() => import('@/modules/suite-user/features/receive/pages/receive'));
const SendPage = lazy(() => import('@/modules/suite-user/features/send/pages/send'));
const BeneficiariesPage = lazy(() => import('@/modules/suite-user/features/beneficiaries/pages/beneficiaries'));
const Settings = lazy(() => import('@/modules/suite-user/features/settings/pages/settings'));

export interface MobileRoute {
  path: string;
  component: ComponentType<Record<string, unknown>>;
  label: string;
  icon?: string;
  category: 'dashboard' | 'transact' | 'manage' | 'settings';
  requiresAuth?: boolean;
}

export const MOBILE_OPERATOR_ROUTES: Record<string, MobileRoute> = {
  dashboard: {
    path: '/suite/dashboard',
    component: ConversationalHome,
    label: 'Inicio',
    icon: 'Home',
    category: 'dashboard',
    requiresAuth: true,
  },
  receive: {
    path: '/suite/receive',
    component: ReceivePage,
    label: 'Recibir',
    icon: 'ArrowDownLeft',
    category: 'transact',
    requiresAuth: true,
  },
  send: {
    path: '/suite/send',
    component: SendPage,
    label: 'Enviar',
    icon: 'ArrowUpRight',
    category: 'transact',
    requiresAuth: true,
  },
  beneficiaries: {
    path: '/suite/beneficiaries',
    component: BeneficiariesPage,
    label: 'Beneficiarios',
    icon: 'Users',
    category: 'manage',
    requiresAuth: true,
  },
  settings: {
    path: '/suite/settings',
    component: Settings,
    label: 'Configuración',
    icon: 'Settings',
    category: 'settings',
    requiresAuth: true,
  },
} as const;

export const getRoutesByCategory = (category: MobileRoute['category']): MobileRoute[] => {
  return Object.values(MOBILE_OPERATOR_ROUTES).filter((route) => route.category === category);
};

export const isMobileRoute = (path: string): boolean => {
  return Object.values(MOBILE_OPERATOR_ROUTES).some((route) => route.path === path);
};

export type MobileRouteKey = keyof typeof MOBILE_OPERATOR_ROUTES;
