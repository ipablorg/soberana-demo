import { useDocsLanguageStore } from '@/shared/stores/useDocsLanguageStore';
import { getSovyContent, type SovyContent } from '../content/sovy-content';
import type { Language } from '../content/sidebar-content';

export function useSovyContent(): SovyContent {
  const language = useDocsLanguageStore((state) => state.language);
  const docsLanguage: Language = language === 'en' ? 'en' : 'es';
  return getSovyContent(docsLanguage);
}
