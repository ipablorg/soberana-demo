// Language Store
// Gestiona el idioma de la aplicación

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'es' | 'pt' | 'fr' | 'de' | 'it' | 'ja';

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void; // Kept for backward compatibility, cycles through languages
}

const LANGUAGES: Language[] = ['en', 'es', 'pt', 'fr', 'de', 'it', 'ja'];

function detectInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const raw = window.localStorage.getItem('loopay-language-storage');
    if (raw) {
      const stored = JSON.parse(raw)?.state?.language;
      if (stored && LANGUAGES.includes(stored)) return stored;
    }
  } catch {
    // corrupted storage — fall through to browser detection
  }
  const nav = (typeof navigator !== 'undefined' && (navigator.languages?.[0] || navigator.language) || 'en').toLowerCase();
  const prefix = nav.split('-')[0];
  return (LANGUAGES as string[]).includes(prefix) ? (prefix as Language) : 'en';
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: detectInitialLanguage(),
      setLanguage: (language) => set({ language }),
      toggleLanguage: () => set((state) => {
        const currentIndex = LANGUAGES.indexOf(state.language);
        const nextIndex = (currentIndex + 1) % LANGUAGES.length;
        return { language: LANGUAGES[nextIndex] };
      }),
    }),
    {
      name: 'loopay-language-storage',
    }
  )
);
