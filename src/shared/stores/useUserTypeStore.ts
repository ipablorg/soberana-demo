/**
 * User Type Store
 * 
 * Manages user type selection (Pro, Payouts, OTC, Plus).
 * Controls visibility of products and modes in the UI.
 * 
 * NOTE: Not persisted - resets on page reload to 'pro'.
 */

import { create } from 'zustand';

export type UserType = 'pro' | 'payouts' | 'otc' | 'plus';

interface UserTypeStore {
  userType: UserType;
  setUserType: (type: UserType) => void;
}

/**
 * User Type Store (No Persistence)
 * 
 * @example
 * ```tsx
 * import { useUserTypeStore } from '@/shared/stores/useUserTypeStore';
 * 
 * function Component() {
 *   const { userType, setUserType } = useUserTypeStore();
 *   
 *   return (
 *     <button onClick={() => setUserType('payouts')}>
 *       Switch to Payouts
 *     </button>
 *   );
 * }
 * ```
 */
export const useUserTypeStore = create<UserTypeStore>((set) => ({
  userType: 'pro', // Default to Pro (all products visible)
  setUserType: (type: UserType) => set({ userType: type }),
}));

