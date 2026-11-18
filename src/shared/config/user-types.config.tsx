/**
 * User Types Configuration
 * 
 * Defines which products and modes are available for each user type:
 * - Pro: All products and modes
 * - Payouts: Only Move, only Operator mode
 * - OTC: Move + Change, only Operator mode
 * - Plus: Move + Change + Accounts + Treasury, only Operator mode
 */

import { UserType } from '@/shared/stores/useUserTypeStore';
import { UserMode } from '@/shared/stores/useModeStore';

export interface UserTypeConfig {
  label: string;
  products: string[];
  modes: UserMode[];
}

export const USER_TYPE_CONFIG: Record<UserType, UserTypeConfig> = {
  pro: {
    label: 'Pro',
    products: ['move', 'change', 'account', 'treasury', 'marketplace', 'pos'],
    modes: ['operator', 'builder', 'intelligent'],
  },
  payouts: {
    label: 'Pagos',
    products: ['move'],
    modes: ['operator'],
  },
  otc: {
    label: 'Cambios',
    products: ['move', 'change'],
    modes: ['operator'],
  },
  plus: {
    label: 'Plus',
    products: ['move', 'change', 'account', 'treasury'],
    modes: ['operator'],
  },
};

/**
 * Check if a product is allowed for a user type
 */
export function isProductAllowed(userType: UserType, product: string): boolean {
  return USER_TYPE_CONFIG[userType].products.includes(product);
}

/**
 * Check if a mode is allowed for a user type
 */
export function isModeAllowed(userType: UserType, mode: UserMode): boolean {
  return USER_TYPE_CONFIG[userType].modes.includes(mode);
}

