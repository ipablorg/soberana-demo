/**
 * CurrencySelector
 *
 * Horizontal list of the user's accounts — one chip per currency +
 * rail. Each chip is a rounded pill; its silhouette encodes the
 * account state at a glance, so the user doesn't need to read a
 * label to tell active from inactive.
 *
 * Visual system:
 *   active / pending:
 *     - Solid `bg-card` pill with full-contrast text.
 *     - Hover / selected → Loopay gradient ring via `gradient-border`
 *       utility family. Selected = always on; idle = on hover only.
 *     - Status dot (success / warning) gives the quiet state cue.
 *   not_requested:
 *     - Dashed muted border, no fill, reduced opacity.
 *     - Reads as an "empty slot waiting to be filled" vs. a real,
 *       provisioned account. Hover swaps the status label to
 *       "Activar" so the affordance is unambiguous.
 *
 * Label: shows the ISO-4217 code (USD, COP, EUR, USDC…) next to
 * the flag. Keeps chips compact and consistent; the flag is what
 * makes them scannable.
 *
 * Interaction:
 * - Every chip is selectable, regardless of status. The DI store
 *   narrates the right next step (ready / review / activate) for
 *   whichever currency the user taps.
 *
 * Layout:
 * - Mobile: horizontal scroll (`scrollbar-hide`).
 * - Desktop (md+): wraps; chips size to their content.
 */

import * as React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { cn } from '@/shared/lib/utils';
import {
  getRailFlag,
  getCurrencyFlag,
} from '@/shared/lib/currency-flags';
import { getReceiveRailLabel } from '@/shared/lib/receive-presentation';
import { isRailUnderMaintenance } from '@/modules/suite-user/features/beneficiaries/lib/rail-maintenance';
import type {
  UserAccount,
  UserAccountStatus,
} from './hooks/use-user-accounts';

export interface CurrencySelectorProps {
  accounts: UserAccount[];
  selectedCurrency: string | null;
  selectedAccountId?: string | null;
  onSelect: (account: UserAccount) => void;
  className?: string;
}

/**
 * Currency label. We deliberately show the ISO-4217 code (USD, COP,
 * EUR, USDC…) instead of a localized descriptor:
 *   1. It's the global, unambiguous way to name currencies.
 *   2. Avoids redundancy with the flag emoji right next to it.
 *   3. Keeps every chip the same visual width class, so the picker
 *      reads as a clean grid instead of a ragged list.
 * The `_locale` parameter is kept so consumers don't have to change
 * their call sites, and so we have a seam if we ever need to show
 * localized names in a different surface (e.g. a details pane).
 */
export const getCurrencyLabel = (code: string, _locale: string): string => {
  return code.toUpperCase();
};

const statusBadgeLabel = (
  status: UserAccountStatus,
  t: (strings: TemplateStringsArray, ...values: unknown[]) => string,
): string => {
  switch (status) {
    case 'active':
      return t`Activa`;
    case 'pending':
      return t`Esperando`;
    case 'not_requested':
      return t`Inactiva`;
    default:
      return String(status);
  }
};

/**
 * Resolve the flag: prefer the rail flag (captures country specificity
 * like spei = MX, pix = BR); fall back to the currency flag for
 * rail-less or multi-country currencies (EUR). `🌐` means no match.
 */
export const resolveFlag = (account: UserAccount): string => {
  const railFlag = getRailFlag(account.paymentRail.toLowerCase());
  if (railFlag !== '🌐') return railFlag;
  return getCurrencyFlag(account.currency);
};

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  accounts,
  selectedCurrency,
  selectedAccountId,
  onSelect,
  className,
}) => {
  const { t, i18n } = useLingui();
  const locale = i18n.locale || 'es';

  if (accounts.length === 0) {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>
        <Trans>Aún no tienes monedas disponibles.</Trans>
      </p>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label={t`Selecciona una moneda`}
      className={cn(
        'flex gap-2 overflow-x-auto scrollbar-hide',
        'md:flex-wrap md:overflow-visible',
        className,
      )}
    >
      {accounts.map((account) => {
        const isSelected =
          selectedAccountId != null
            ? selectedAccountId === account.id
            : selectedCurrency === account.currency;
        const label = getReceiveRailLabel({
          railCode: account.paymentRail,
          railName: account.railName,
        });
        const badge = statusBadgeLabel(account.status, t);
        const flag = resolveFlag(account);
        const isInactive = account.status === 'not_requested';
        // Colombia / Ecuador / Peru rails: visible but parked.
        const inMaintenance = isRailUnderMaintenance(account.paymentRail);

        // State language:
        //   - Active / pending → pill filled with the Loopay
        //     gradient and white text. No hover state on the body;
        //     the cursor pointer is the only interaction cue.
        //     Selected ≠ a separate visual: the breadcrumb pill in
        //     the ReceiveFlow header already carries that cue.
        //   - Not requested → dashed border, no fill, muted text,
        //     reduced opacity. On hover the pill fills with success
        //     green and the entire content (flag + code + badge) is
        //     replaced by an "Activar" label — the affordance is the
        //     only thing the user needs to see in that moment.
        const chipVisual = inMaintenance
          ? cn(
              'border border-dashed border-border',
              'bg-transparent text-muted-foreground',
              'opacity-60 cursor-not-allowed',
            )
          : isInactive
          ? cn(
              'border border-dashed border-border',
              'bg-transparent text-muted-foreground',
              'opacity-70 cursor-pointer',
              'hover:opacity-100 hover:border-transparent hover:bg-success hover:text-white',
              'focus-visible:border-transparent focus-visible:bg-success focus-visible:text-white',
            )
          : cn(
              // Gradient-filled pill with white text, always.
              // `bg-brand-gradient` paints via the background
              // shorthand (image, not color), which is the
              // single source of truth — chasing a hover-inverts
              // state ran into background-clip / shorthand
              // conflicts that weren't worth the visual gain.
              // Hover: just a pointer cursor.
              'bg-brand-gradient text-white cursor-pointer',
              '[&_[data-chip-badge]]:text-white/80',
            );

        return (
          <button
            key={account.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={inMaintenance}
            onClick={() => {
              if (!inMaintenance) onSelect(account);
            }}
            className={cn(
              // `group` so the hover overlay on inactive chips can
              // respond to pointer + focus.
              'group',
              'relative inline-flex shrink-0 items-center gap-2',
              'rounded-full px-4 py-2',
              'text-sm font-medium',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              chipVisual,
            )}
          >
            {/* Default content. Both active and inactive chips fade
                this out on hover so the action overlay ("Ver" or
                "Activar") can take over the full pill. Keeping a
                single behavior across states means the user always
                gets a single, decisive label on hover.

                Status cue: only `active` earns the dot — the success
                green confirms "this account is live". Inactive chips
                already telegraph their state through the dashed
                border + muted palette, so adding another affordance
                (orange dot, "Inactiva" text) would just be visual
                noise. `pending` is not currently emitted by the
                backend for this surface; if it comes back we can
                reintroduce the warning dot here. */}
            <span
              className={cn(
                'inline-flex items-center gap-2',
                'transition-opacity duration-150',
                !inMaintenance && 'group-hover:opacity-0 group-focus-visible:opacity-0',
              )}
            >
              <span
                aria-hidden
                className="text-base leading-none"
                role="img"
              >
                {flag}
              </span>
               <span className="font-semibold tracking-wide">{label}</span>
               {inMaintenance && (
                 <span className="text-xs font-normal">
                   <Trans>En mantenimiento</Trans>
                 </span>
               )}
               {!inMaintenance && account.status !== 'not_requested' && (
                  <span
                    aria-hidden
                   className={cn(
                     'h-1.5 w-1.5 rounded-full',
                     account.usePaymentLink ? 'bg-primary/80' : account.status === 'pending' ? 'bg-warning' : 'bg-success',
                   )}
                 />
               )}
              {/* Screen-reader-only status badge so assistive tech
                  still announces the state even though we dropped
                  the visible chip. */}
              <span data-chip-badge className="sr-only">
                {badge}
              </span>
            </span>

            {/* Hover overlay. Same shape for both states; only the
                verb changes. Active/pending → "Ver" (open the
                deposit panel for this currency). Inactive → "Activar"
                (kick off the endorsement). The flag stays so the
                user keeps context on which currency they're acting
                on. */}
            {!inMaintenance && (
            <span
              aria-hidden
              className={cn(
                'absolute inset-0 flex items-center justify-center gap-2',
                'text-sm font-semibold text-white',
                'opacity-0 transition-opacity duration-150',
                'group-hover:opacity-100 group-focus-visible:opacity-100',
              )}
            >
              <span className="text-base leading-none" role="img">
                {flag}
              </span>
              {isInactive ? <Trans>Activar</Trans> : <Trans>Ver</Trans>}
            </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
