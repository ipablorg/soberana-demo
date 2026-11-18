/**
 * CoinIcon — logo for the coins ops filters and lists by (USDC, USDT, BTC).
 *
 * Colors come from the `coin-*` tokens in `styles/index.css`, never from hex in
 * TSX. Any currency without a logo (fiat, other assets, empty input) falls back
 * to a neutral coins glyph so callers can pass free-typed text safely. The icon
 * is decorative (`aria-hidden`); render the currency code next to it.
 */

import { Coins } from '@/shared/components/animated-icons';
import { resolveCoinCode, type CoinCode } from '@/shared/lib/coin-code';
import { cn } from '@/shared/lib/utils';

interface CoinIconProps {
  /** Currency code as typed or stored; unknown values render the fallback. */
  code: string | null | undefined;
  className?: string;
}

function UsdcLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" className="fill-coin-usdc" />
      <path
        d="M7.6 5.6a8 8 0 0 0 0 12.8M16.4 5.6a8 8 0 0 1 0 12.8"
        className="fill-none stroke-coin-glyph"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M12 7v10M14.4 9.6c-.4-.8-1.3-1.3-2.4-1.3-1.4 0-2.4.7-2.4 1.8 0 2.4 4.8 1.2 4.8 3.6 0 1.1-1 1.8-2.4 1.8-1.2 0-2.1-.5-2.5-1.4"
        className="fill-none stroke-coin-glyph"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsdtLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" className="fill-coin-usdt" />
      <path
        d="M6.4 6.6h11.2v2.3h-4.5v1.2c2.7.1 4.6.6 4.6 1.2s-1.9 1.1-4.6 1.2V18h-2.2v-5.5c-2.7-.1-4.6-.6-4.6-1.2s1.9-1.1 4.6-1.2V8.9H6.4z"
        className="fill-coin-glyph"
      />
    </svg>
  );
}

function BtcLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" className="fill-coin-btc" />
      <g transform="translate(4.8 4.8) scale(0.6)">
        <path
          d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727"
          className="fill-none stroke-coin-glyph"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

const COIN_LOGOS: Record<
  CoinCode,
  (props: { className?: string }) => React.JSX.Element
> = {
  USDC: UsdcLogo,
  USDT: UsdtLogo,
  BTC: BtcLogo,
};

export function CoinIcon({ code, className }: CoinIconProps) {
  const coin = resolveCoinCode(code);

  if (!coin) {
    return (
      <Coins
        className={cn('size-4 shrink-0 text-muted-foreground', className)}
        aria-hidden="true"
      />
    );
  }

  const Logo = COIN_LOGOS[coin];

  return <Logo className={cn('size-4 shrink-0', className)} />;
}
