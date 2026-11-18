import { useDocsLanguageStore } from '@/shared/stores/useDocsLanguageStore';
import { getAmazonasSoberanaContent, type AmazonasSoberanaContent } from '../content/amazonas-soberana-content';
import type { Language } from '../content/sidebar-content';

export function useAmazonasSoberanaContent(): AmazonasSoberanaContent {
  const language = useDocsLanguageStore((state) => state.language);
  const docsLanguage: Language = language === 'en' ? 'en' : 'es';
  return getAmazonasSoberanaContent(docsLanguage);
}
