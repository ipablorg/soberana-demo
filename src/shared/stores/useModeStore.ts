// Suite Mode Store
// Gestiona los modos de la aplicación para user y backoffice

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// User modes (Suite User)
export type UserMode = 'operator' | 'builder' | 'intelligent';

// Backoffice modes (Suite Backoffice)
export type BackofficeMode = 'companies' | 'move' | 'compliance';

// Context type to differentiate between user and backoffice
export type ModeContext = 'user' | 'backoffice';

interface ModeStore {
  // User mode state
  currentUserMode: UserMode;
  setUserMode: (mode: UserMode) => void;
  
  // Backoffice mode state
  currentBackofficeMode: BackofficeMode;
  setBackofficeMode: (mode: BackofficeMode) => void;
  
  // Legacy support (deprecated, maps to currentUserMode)
  /** @deprecated Use currentUserMode instead */
  currentMode: UserMode;
  /** @deprecated Use setUserMode instead */
  setMode: (mode: UserMode) => void;
}

export const useModeStore = create<ModeStore>()(
  persist(
    (set, _get) => ({
      // User mode
      currentUserMode: 'operator',
      setUserMode: (mode) => set({ currentUserMode: mode, currentMode: mode }),
      
      // Backoffice mode
      currentBackofficeMode: 'move',
      setBackofficeMode: (mode) => set({ currentBackofficeMode: mode }),
      
      // Legacy support
      currentMode: 'operator',
      setMode: (mode) => set({ currentUserMode: mode, currentMode: mode }),
    }),
    {
      name: 'loopay-mode-storage',
    }
  )
);
