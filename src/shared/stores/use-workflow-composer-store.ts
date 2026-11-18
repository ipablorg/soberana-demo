import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isInternalProductSettingsEnabled } from '@/shared/lib/dev-config';

interface WorkflowComposerState {
  enabled: boolean;
  splashShown: boolean;
  enable(): void;
  disable(): void;
  markSplashShown(): void;
}

export const useWorkflowComposerStore = create<WorkflowComposerState>()(
  persist(
    (set) => ({
      // Demo/dev builds show the internal product surfaces out of the box;
      // persisted localStorage still wins on rehydration for returning users.
      enabled: isInternalProductSettingsEnabled(),
      splashShown: false,
      enable: () => set({ enabled: true, splashShown: false }),
      disable: () => set({ enabled: false, splashShown: false }),
      markSplashShown: () => set({ splashShown: true }),
    }),
    { name: 'workflow-composer' },
  ),
);
