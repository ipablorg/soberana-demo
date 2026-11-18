interface KnownUser {
  name?: string | null;
  email?: string | null;
}

export interface SelfUboPrefill {
  first_name: string;
  last_name: string;
  email: string;
}

/**
 * The signed-in user is usually one of the beneficial owners, and we already
 * know their name and email: offer them as a one-click prefill instead of
 * asking again.
 */
export function buildSelfUboPrefill(user: KnownUser | null | undefined): SelfUboPrefill | null {
  const email = user?.email?.trim() ?? '';
  const parts = (user?.name ?? '').trim().split(/\s+/).filter(Boolean);

  if (!email && parts.length === 0) {
    return null;
  }

  return {
    first_name: parts[0] ?? '',
    last_name: parts.slice(1).join(' '),
    email,
  };
}

type SelfUboFields = Partial<Record<keyof SelfUboPrefill, string | null | undefined>>;

/**
 * What "Soy yo" may write: only fields the user left empty, and only with a
 * non-empty known value, so a name already typed is never blanked or replaced.
 */
export function selfUboPrefillPatch(
  current: SelfUboFields,
  prefill: SelfUboPrefill
): Partial<SelfUboPrefill> {
  const patch: Partial<SelfUboPrefill> = {};
  (Object.keys(prefill) as (keyof SelfUboPrefill)[]).forEach((key) => {
    const known = prefill[key].trim();
    if (known && !(current[key] ?? '').trim()) patch[key] = known;
  });
  return patch;
}
