/**
 * useDocsContent - Hook for multilingual documentation content
 * 
 * Automatically selects content based on the docs language setting.
 * Default is Spanish (es).
 */

import { useDocsLanguageStore } from '@/shared/stores/useDocsLanguageStore';
import { getDocsContent, type DocContent, type Language } from '../content/docs-content';

export function useDocsContent(): DocContent {
  const language = useDocsLanguageStore((state) => state.language);
  const docsLanguage: Language = language === 'en' ? 'en' : 'es';
  return getDocsContent(docsLanguage);
}

