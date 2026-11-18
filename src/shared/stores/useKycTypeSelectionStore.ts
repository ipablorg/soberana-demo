/**
 * KYC Customer Type Selection Store
 *
 * Holds the account-type choice (individual vs business) made in the Verify
 * Identity wizard's first step. Registration no longer captures the type —
 * the wizard is the single source of the selection while no customer exists.
 *
 * The choice is also mirrored to the localStorage customer context
 * (per-email registry) so it survives reloads on the same device. Once a
 * customer profile exists, Bridge/the backend snapshot is the authoritative
 * source and this override is ignored (see the resolver chain in useKYC).
 */

import { create } from 'zustand';
import { storeCustomerContext } from '@/shared/lib/kyc/customer-context';

export type KycSelectableCustomerType = 'individual' | 'business';

interface KycTypeSelectionStore {
  /** Type picked in the wizard, or null while the wizard step is pending. */
  selectedType: KycSelectableCustomerType | null;
  selectType: (type: KycSelectableCustomerType, email?: string | null) => void;
  clearSelectedType: () => void;
}

export const useKycTypeSelectionStore = create<KycTypeSelectionStore>((set) => ({
  selectedType: null,
  selectType: (type, email) => {
    set({ selectedType: type });
    storeCustomerContext({
      customerType: type,
      email: email ?? undefined,
    });
  },
  clearSelectedType: () => set({ selectedType: null }),
}));
