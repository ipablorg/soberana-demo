/**
 * The backend generates the staff password-setup link with Firebase's default
 * action settings, which render the action page in English (`lang=en`). The
 * backoffice is operated in Spanish, so the link handed to the new staff
 * member asks for the Spanish page. Anything that is not a URL is returned
 * unchanged.
 */
export function withSetupLinkLanguage(link: string, language: string): string {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return link;
  }

  url.searchParams.set('lang', language);
  return url.toString();
}
