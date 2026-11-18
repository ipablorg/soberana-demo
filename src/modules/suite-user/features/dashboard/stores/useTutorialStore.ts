import { create } from 'zustand';
import { useTutorialDemoStore } from '@/shared/stores/useTutorialDemoStore';

export type TutorialPendingAction = 'open-receive' | 'open-send' | 'close-flow';

interface TutorialState {
  isOpen: boolean;
  currentStep: number;
  /**
   * Set by DashboardTutorial when a step transition requires an orchestrated
   * action (open / close a real flow). ConversationalHome watches this value
   * and calls the appropriate handler, then clears it.
   */
  pendingAction: TutorialPendingAction | null;
  // Actions
  open: () => void;
  close: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setPendingAction: (action: TutorialPendingAction | null) => void;
  reset: () => void;
}

export const useTutorialStore = create<TutorialState>((set) => ({
  isOpen: false,
  currentStep: 0,
  pendingAction: null,
  open: () => {
    // Enable demo mode synchronously so the very first render with isOpen=true
    // already has mock data — no useEffect timing gap.
    useTutorialDemoStore.getState().enable();
    set({ isOpen: true, currentStep: 0, pendingAction: null });
  },
  close: () => {
    useTutorialDemoStore.getState().disable();
    set({ isOpen: false });
  },
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  setPendingAction: (action) => set({ pendingAction: action }),
  reset: () => {
    useTutorialDemoStore.getState().disable();
    set({ isOpen: false, currentStep: 0, pendingAction: null });
  },
}));
