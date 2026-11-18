import type { TenantTeamMember } from '@/graphql/types/tenant';

interface SignedInUser {
  id?: string | null;
  email?: string | null;
}

/** The signed-in admin's own row (same user id, or same email as a fallback). */
export function isSelf(
  member: Pick<TenantTeamMember, 'id' | 'email'>,
  user: SignedInUser | null | undefined
): boolean {
  if (!user) return false;
  if (user.id && user.id === member.id) return true;

  return Boolean(user.email) && user.email?.toLowerCase() === member.email.toLowerCase();
}

/** "First Last", or the email when the member has no name yet (fresh invites). */
export function memberName(
  member: Pick<TenantTeamMember, 'first_name' | 'last_name' | 'email'>
): string {
  const name = [member.first_name, member.last_name].filter(Boolean).join(' ').trim();

  return name || member.email;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL.test(value.trim());
}
