import * as React from 'react';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { cn } from '@/shared/lib/utils';
import { useDisplayName } from '@/shared/hooks/use-display-name';

export interface UserAvatarChipProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Shows the user's display name next to the avatar.
   * - 'always': always renders the name.
   * - 'never':  renders only the avatar.
   * - 'auto':   hidden below md (matches the topbar convention `hidden md:inline`).
   * @default 'auto'
   */
  showName?: 'always' | 'never' | 'auto';
  /**
   * Avatar size. The gradient ring wrapper adapts to the avatar size.
   * @default 'default' (w-6 h-6 — matches the original AppTopbar avatar)
   */
  size?: 'sm' | 'default' | 'md' | 'lg';
}

const SIZES = {
  sm:      { avatar: 'w-5 h-5', text: 'text-[9px]'  },
  default: { avatar: 'w-6 h-6', text: 'text-[10px]' },
  md:      { avatar: 'h-8 w-8', text: 'text-xs'     },
  lg:      { avatar: 'h-9 w-9', text: 'text-xs'     },
} as const;

const getInitials = (label?: string | null): string => {
  if (!label) return 'U';
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return (parts[0][0] ?? 'U').toUpperCase();
  const first = parts[0][0] ?? '';
  const last = parts[parts.length - 1][0] ?? '';
  return (first + last).toUpperCase() || 'U';
};

/**
 * UserAvatarChip — canonical avatar for the current user in Soberana topbars
 * and identity chips. Single source of truth: any future change to the avatar
 * (ring, status indicator, size, hover) is made here and propagates everywhere.
 *
 * Brand moment (CLAUDE.md §6): uses `bg-brand-gradient` and `text-white`
 * intentionally. Same rationale as `Button variant="gradient"` — the Loopay
 * gradient is dark in both light and dark modes and requires white text for
 * contrast. See CLAUDE.md §4 (Primary Action Button Pattern).
 *
 * Scope: use ONLY for the current logged-in user in primary navigation (topbars,
 * identity chips). For avatars in tables, beneficiary lists, comments, or any
 * non-brand surface, use the base `Avatar` primitive directly — do NOT apply
 * this gradient wrapper there.
 */
export const UserAvatarChip = React.forwardRef<HTMLDivElement, UserAvatarChipProps>(
  ({ showName = 'auto', size = 'default', className, ...props }, ref) => {
    const { full, short } = useDisplayName();
    const initials = getInitials(full);
    const s = SIZES[size];

    const nameVisibility =
      showName === 'always' ? 'inline' :
      showName === 'never'  ? 'hidden' :
                              'hidden md:inline';

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2 shrink-0 min-w-0', className)}
        {...props}
      >
        <span className="rounded-full p-px bg-brand-gradient shrink-0">
          <Avatar className={cn(s.avatar, 'border-0')}>
            <AvatarFallback
              className={cn('bg-brand-gradient text-white font-semibold', s.text)}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </span>
        <span
          className={cn(
            nameVisibility,
            'text-xs font-medium truncate max-w-[140px]',
          )}
        >
          {short}
        </span>
      </div>
    );
  },
);
UserAvatarChip.displayName = 'UserAvatarChip';
