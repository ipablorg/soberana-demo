import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DocsLanguage = 'en' | 'es';

interface DocsLanguageStore {
  language: DocsLanguage;
  setLanguage: (language: DocsLanguage) => void;
}

export const useDocsLanguageStore = create<DocsLanguageStore>()(
  persist(
    (set) => ({
      language: 'es',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'loopay-docs-language' }
  )
);
