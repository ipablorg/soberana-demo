import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useLanguageStore } from '@/shared/stores/useLanguageStore';
import type { Translations, Language } from './types';
import { es } from './locales/es';
import { en } from './locales/en';

const translations: Record<string, Translations> = {
  es,
  en,
};

// Context interface
interface I18nContextValue {
  t: Translations;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

// Create context
const I18nContext = createContext<I18nContextValue | null>(null);

// Provider props
interface I18nProviderProps {
  children: ReactNode;
}

/**
 * I18nProvider - Provides internationalization context to the entire app
 * 
 * Features:
 * - Type-safe translations
 * - Language switching
 * - Persistent language preference (via Zustand store)
 * 
 * Usage:
 * ```tsx
 * <I18nProvider>
 *   <App />
 * </I18nProvider>
 * ```
 */
export function I18nProvider({ children }: I18nProviderProps) {
  // Use Zustand selector pattern to avoid unnecessary re-renders
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);

  // Memoize the context value to prevent unnecessary re-renders
  const value: I18nContextValue = useMemo(
    () => ({
      t: translations[language] ?? translations['en'],
      language,
      setLanguage,
      toggleLanguage,
    }),
    [language, setLanguage, toggleLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * useTranslation - Hook to access translations in components
 * 
 * Returns:
 * - t: Translations object (type-safe)
 * - language: Current language
 * - setLanguage: Function to set language
 * - toggleLanguage: Function to toggle between es/en
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { t, language, toggleLanguage } = useTranslation();
 *   
 *   return (
 *     <div>
 *       <h1>{t.landing.hero.move}</h1>
 *       <button onClick={toggleLanguage}>
 *         {language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }

  return context;
}

