import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  Copy,
  Lock,
  RotateCcw,
} from '@/shared/components/animated-icons';
import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard';
import { useWallets } from '@/shared/hooks/use-wallets';
import { cn } from '@/shared/lib/utils';
import { Trans, useLingui } from '@lingui/react/macro';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { BrandCurvesSvg } from '@/shared/components/brand/brand-curves';
import SoberanaLogoWhite from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png';
import {
  currencyForCountry,
  pickDefaultEquivalenceFiat,
  useLocalEquivalent,
} from '@/modules/suite-user/features/dashboard/hooks/use-local-equivalents';
import { useCustomerProfile } from '@/shared/hooks/use-customer-profile';
import { getCurrencyFlag } from '@/shared/lib/currency-flags';
import { getWalletPairLabel } from '@/shared/lib/receive-wallet';

/* ────────────────────────────────────────────────────────────────
 * MOTION EXCEPTION — §3.5 brand moment
 * ────────────────────────────────────────────────────────────────
 * The 600ms 3D flip below exceeds the §3.5 default (150–200ms for
 * interactive motion, <300ms cap). It is permitted as a HERO
 * BRAND MOMENT of the dashboard, analogous to the existing 4s
 * amount-breathing filter (see `motion.span` around the balance
 * below). The flip is the single place in the VirtualCard where
 * physical cardness is expressed — a fade or slide would break
 * the metaphor. Ease uses a cubic-bezier ease-out (Apple-style) —
 * no spring per §3.5.
 *
 * Ambient loops and onboarding sequences inside this surface are
 * declared exceptions (loops/sequences, not interactive transitions):
 *   - 4s `drop-shadow` breathing on the front balance (pre-existing).
 *   - 2.4s ease-in-out `boxShadow` pulse on the external flip button
 *     (warm-red + cool-blue glow sourced from the real brand-gradient
 *     stops). Ceases after first manual flip.
 *   - Auto-flip demo: 1.2s delay → 600ms flip to back → 800ms pause
 *     → 600ms flip to front. ~3.3s total, runs once per session
 *     before the user's first flip. Skipped on `prefers-reduced-motion`.
 *     Uses a single chained-timeout effect with a ref guard to survive
 *     React StrictMode double-mount.
 *   - Cursor tutorial: ~1.2s pointer SVG enters from bottom-right,
 *     simulates a click, and fades out. Plays once after the auto-flip
 *     demo completes. Purely decorative (`pointer-events-none`).
 * All ambient loops and onboarding sequences cease after the user's
 * first manual flip (session-persistent via `sessionStorage`).
 * Attention signals, not click-to-change motion; explicitly not
 * capped by §3.5's interactive threshold.
 *
 * Fallback: when `useReducedMotion()` is active or the viewport is
 * below 768px (mobile), the rotation is replaced with an instant
 * opacity cross-fade (120ms).
 *
 * HEX EXCEPTION — §6 VirtualCard substrate
 * ────────────────────────────────────────────────────────────────
 * `#0a0a0a` and `#050505` appear on the BACK face (substrate and
 * magnetic band). The VirtualCard is a brand asset whose identity
 * is near-pure black independent of app theme (see the existing
 * `bg-black` front substrate and the `rgba(0,0,0,0.45)` vignette
 * near the `radial-gradient` layer on the front). These hex values
 * preserve that identity on the back without introducing a new
 * token; accepted under §6 exception for this surface.
 *
 * The external flip button uses the real Loopay brand-gradient
 * stops mirrored from `.bg-brand-gradient` in src/styles/index.css
 * (line 491): `#c77d45 #b23b2f #2c4a6b #4a7dc4 #6ba3e8`, applied
 * vertically (180deg) so the button reads as a warm-top /
 * cool-bottom coin. Tailwind arbitrary-value
 * utilities can't express a multi-stop linear-gradient, so the
 * value is inlined via `style={{ background: ... }}`. The glow
 * loop uses `rgba(199,125,69,...)` + `rgba(74,125,196,...)` —
 * `#c77d45` and `#4a7dc4` with per-keyframe alpha — accepted under
 * the §6 brand-moment exception.
 *
 * QR EXCEPTION — §6 VirtualCard front face
 * ────────────────────────────────────────────────────────────────
 * The QR on the front face is rendered by `BrandGradientQr`, a
 * file-local wrapper around `qrcode.react`'s `QRCodeSVG`. The
 * library only accepts solid colors in `bgColor`/`fgColor`, so the
 * brand-gradient fill is applied via a post-mount SVG walk: a
 * `<linearGradient id="loopay-qr-grad">` is injected into the
 * QR's own `<defs>`, then every module node whose `fill` matches
 * the sentinel `#000000` is rewritten to `url(#loopay-qr-grad)`.
 * The gradient stops mirror `.bg-brand-gradient` in
 * src/styles/index.css verbatim (`#c77d45 #b23b2f #2c4a6b
 * #4a7dc4 #6ba3e8`) — the same set already documented as the §6
 * brand-moment exception for this file.
 *
 * Background is `transparent` (no white patch): the QR modules
 * sit directly on the front substrate (BrandCurvesSvg + black
 * vignette), preserving the dark identity of the card while the
 * gradient gives modules enough luminance to be scanned. Camera
 * apps decode by relative contrast, not by absolute colors, so
 * gradient-on-dark scans cleanly at `level="M"` for typical
 * crypto address lengths (≤44 chars).
 *
 * The sentinel `#000000` and the brand-gradient stops are the
 * only literal hex values introduced by this path; both are
 * already covered by the §6 brand-moment exception listed above.
 *
 * CLICK-TO-FLIP — strategy
 * ────────────────────────────────────────────────────────────────
 * Click-to-flip lives ONLY on the `externalFlipButton`. The face
 * surfaces are non-clickable for flip purposes. Each face uses
 * `pointer-events: none` when not active, so interactive widgets
 * inside the back face (dropdown, vault cards, future CTAs)
 * receive clicks without any flip interception. This is robust
 * across browsers (Safari, Chrome, Firefox) and 3D-transform
 * stacking contexts where the prior `data-no-flip` + `closest()`
 * approach failed because the inactive face's z-stacked div
 * could capture clicks before the active face's descendants did.
 *
 * `data-no-flip` markers remain on the QR button, copy buttons,
 * and dropdown trigger as zero-cost defensive wiring against
 * future regressions (e.g. if a face surface ever regains a
 * click-to-flip handler).
 *
 * VAULTS PREVIEW — Phase 0 (UI-only, mocked)
 * ────────────────────────────────────────────────────────────────
 * The bottom half of the back face renders a `VaultPreviewCard`
 * grid populated by `MOCK_VAULTS` (file-local). The grid is
 * intentionally `blur-[2px] opacity-70 pointer-events-none` and
 * overlaid with a "Próximamente" lock badge. This is a
 * deliberate UI-first scaffold per project spec — the backend
 * yield endpoints are not yet built. When the real `vaults_*`
 * GraphQL operations land (see docs/GRAPHQL_INTEGRATION.md §
 * Vaults — TBD), this preview is replaced by a live grid. Do
 * NOT promote `VaultPreviewCard` to a shared component yet —
 * the real version will live under
 * src/modules/suite-user/features/marketplace/components/.
 * ──────────────────────────────────────────────────────────────── */

const SESSION_FLIP_FLAG = 'virtualCardFlipped';
const SESSION_DEMO_FLAG = 'virtualCardDemoSeen';

// Bridge "exchange rates" endpoint currently supports USD as pivot with:
// BRL, COP, EUR, GBP, MXN and USDT.
const BACKFACE_SUPPORTED_CURRENCIES = ['BRL', 'COP', 'EUR', 'GBP', 'MXN', "USD"];

// Persists the user's last-selected fiat across flips and reloads
// (within the same session). LocalStorage is fine here because the
// preference is per-device, not per-account.
const LS_BACK_FIAT_KEY = 'loopay-card-back-fiat';

// Chain metadata — keeps `Tron (TRC20)` style copy in one place so
// the front top-row stays consistent if the backend adds new
// chains. Kept file-local: the VirtualCard is the only place this
// presentation matters today.
const CHAIN_CONFIG: Record<string, { name: string; symbol: string }> = {
  TRON: { name: 'Tron', symbol: 'TRC20' },
  SOLANA: { name: 'Solana', symbol: 'SPL' },
  POLYGON: { name: 'Polygon', symbol: 'MATIC' },
  ETHEREUM: { name: 'Ethereum', symbol: 'ERC20' },
  BASE: { name: 'Base', symbol: 'BASE' },
};

const getChainLabel = (
  chain: string | undefined,
): { name: string; symbol: string } | null => {
  if (!chain) return null;
  return CHAIN_CONFIG[chain] ?? null;
};

// Phase-0 vaults preview. See VAULTS PREVIEW comment at the file
// header — these stay file-local until the backend ships
// `vaults_*` GraphQL operations.
interface MockVault {
  id: string;
  asset: 'USDT' | 'USDC' | 'MIXED';
  apy: number;
  risk: 'LOW' | 'MEDIUM';
}

const MOCK_VAULTS: MockVault[] = [
  { id: 'v1', asset: 'USDT', apy: 8.5, risk: 'LOW' },
  { id: 'v2', asset: 'USDC', apy: 7.2, risk: 'LOW' },
  { id: 'v3', asset: 'MIXED', apy: 12.4, risk: 'MEDIUM' },
];

// Sentinel used as `fgColor` for `QRCodeSVG`. After mount we walk
// the rendered SVG, find every node whose fill matches this token
// (or any DOM/browser-normalised spelling of pure black), and
// rewrite it to `url(#loopay-qr-grad-<id>)`. Two reasons for this
// indirection: (1) `qrcode.react` doesn't accept gradients in its
// API, and (2) walking only nodes with a known sentinel avoids
// accidentally re-painting the (transparent) background rect.
const QR_FG_SENTINEL = '#000000';
const QR_GRADIENT_ID_PREFIX = 'loopay-qr-grad';

/**
 * Returns true if the SVG fill string represents pure black.
 * Handles every spelling we've seen across browsers and
 * qrcode.react versions: `#000`, `#000000`, `black`,
 * `rgb(0,0,0)` with arbitrary whitespace, the React-normalised
 * `rgb(0, 0, 0)`, and the `rgba(0,0,0,1)` Safari variant.
 * Case-insensitive.
 */
const isBlackFill = (raw: string | null | undefined): boolean => {
  if (!raw) return false;
  const v = raw.trim().toLowerCase();
  if (v === '#000' || v === '#000000' || v === 'black') return true;
  if (/^rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)$/.test(v)) return true;
  if (/^rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*1(\.0+)?\s*\)$/.test(v)) return true;
  return false;
};

/* ────────────────────────────────────────────────────────────────
 * BrandGradientQr — qrcode.react + post-process gradient fill.
 *
 * Renders the QR with `bgColor="transparent"` and a sentinel
 * black `fgColor`, then injects a `<linearGradient>` into the
 * SVG's `<defs>` and rewrites every fg-fill node to point at it.
 *
 * Why a `MutationObserver` in addition to `useLayoutEffect`?
 *   `qrcode.react@4` renders the modules as a single consolidated
 *   `<path>` whose `d` attribute changes when `value` changes. In
 *   some address-length / level combinations React reconciles
 *   the subtree by mutating the `<path>`'s `d` attribute in place
 *   AFTER the parent effect has already run — the effect would
 *   then have queried a stale path. The observer catches those
 *   late mutations and re-applies the gradient fill.
 *
 * Each instance owns its own gradient `<defs>` with a unique id
 * (`React.useId()`) so multiple cards in the same view (multi-
 * wallet flows, deck slides, marketing previews) don't collide
 * on the gradient symbol. `useId` emits ":r0:"-style strings; we
 * sanitize the colons because some XML parsers reject them in
 * SVG `id` attributes.
 * ──────────────────────────────────────────────────────────────── */
const BrandGradientQr: React.FC<{
  value: string;
  size: number;
  className?: string;
}> = ({ value, size, className }) => {
  const containerRef = React.useRef<HTMLSpanElement>(null);
  const reactId = React.useId();
  const gradientId = `${QR_GRADIENT_ID_PREFIX}-${reactId.replace(/:/g, '')}`;

  const applyGradient = React.useCallback(() => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;

    // 1. Ensure <defs> with our <linearGradient> is present.
    //    Stops mirror `.bg-brand-gradient` from src/styles/index.css
    //    verbatim (warm-top → cool-bottom). §6 brand-moment
    //    exception applies.
    let defs = svg.querySelector(':scope > defs') as SVGDefsElement | null;
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }
    const escapedId =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(gradientId)
        : gradientId;
    let grad = defs.querySelector(`#${escapedId}`) as
      | SVGLinearGradientElement
      | null;
    if (!grad) {
      grad = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'linearGradient',
      ) as SVGLinearGradientElement;
      grad.setAttribute('id', gradientId);
      grad.setAttribute('x1', '0');
      grad.setAttribute('y1', '0');
      grad.setAttribute('x2', '1');
      grad.setAttribute('y2', '1');
      grad.setAttribute('gradientUnits', 'objectBoundingBox');
      const STOPS: ReadonlyArray<readonly [string, string]> = [
        ['0%', '#c77d45'],
        ['25%', '#b23b2f'],
        ['55%', '#2c4a6b'],
        ['80%', '#4a7dc4'],
        ['100%', '#6ba3e8'],
      ];
      for (const [offset, color] of STOPS) {
        const stop = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'stop',
        );
        stop.setAttribute('offset', offset);
        stop.setAttribute('stop-color', color);
        grad.appendChild(stop);
      }
      defs.appendChild(grad);
    }

    // 2. Repaint every fg-fill node to reference the gradient.
    //    Walk path | rect | polygon — covers every shape qrcode
    //    .react has emitted across versions. Use BOTH the `fill`
    //    attribute AND the inline `style.fill` because some
    //    browsers (Safari < 16) prefer the inline style over the
    //    attribute when both are present.
    const gradientUrl = `url(#${gradientId})`;
    const candidates = svg.querySelectorAll<SVGElement>(
      'path, rect, polygon',
    );
    candidates.forEach((node) => {
      const attrFill = node.getAttribute('fill');
      if (attrFill === gradientUrl) return; // already painted
      const styleFill = node.style.fill || null;
      if (isBlackFill(attrFill) || isBlackFill(styleFill)) {
        node.setAttribute('fill', gradientUrl);
        // Clear inline style so it can't override the attribute.
        if (node.style.fill) node.style.fill = '';
      }
    });
  }, [gradientId]);

  // First paint + value/size change.
  React.useLayoutEffect(() => {
    applyGradient();
  }, [applyGradient, value, size]);

  // Catch late SVG mutations (qrcode.react reconcile cycles, route
  // transitions, etc). The observer is scoped to the QR container
  // and filters to attributes that actually affect fill, so its
  // callback runs at most a handful of times per address change.
  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new MutationObserver(() => applyGradient());
    observer.observe(node, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['d', 'fill', 'style'],
    });
    return () => observer.disconnect();
  }, [applyGradient]);

  return (
    <span ref={containerRef} className={cn('inline-block', className)}>
      <QRCodeSVG
        value={value}
        size={size}
        // Transparent background so the QR sits directly on the
        // card substrate (brand curves visible through). The
        // gradient post-process recolors only the fg modules.
        bgColor="transparent"
        fgColor={QR_FG_SENTINEL}
        level="M"
        // marginSize=0 removes the quiet-zone rect that could
        // otherwise be matched by the fg-fill walk on some
        // versions of qrcode.react.
        marginSize={0}
        className="h-full w-full"
        aria-hidden
      />
    </span>
  );
};

export interface VirtualCardProps extends React.HTMLAttributes<HTMLDivElement> {
  userName: string;
  currency: string;
  /**
   * Pre-formatted balance string (e.g. "12,450.75"). Upstream components
   * already format currency; this component stays presentational.
   */
  amount: string;
  /**
   * Raw (unformatted) balance — e.g. the backend's `available_balance`
   * numeric string "12450.75". Used by the back face to compute fiat
   * equivalents without round-trip parsing of the comma-grouped
   * `amount`. Optional: when omitted the back face falls back to
   * stripping grouping characters from `amount`.
   */
  rawAmount?: string;
  /** Full wallet address — rendered complete on the front face. */
  address: string;
  /**
   * On-chain network of the active wallet (`TRON | SOLANA | POLYGON
   * | ETHEREUM | BASE`). Used by the front top-row to print
   * `SOBERANA · Tron (TRC20)`. When undefined, the separator and
   * chain label collapse gracefully.
   */
  chain?: string;
  /**
   * @deprecated The address now renders in full alongside a
   * scannable QR code. The prop is kept so existing consumers
   * compile, but the truncation it described is no longer
   * applied. Remove once all call sites are migrated.
   */
  truncate?: { head: number; tail: number };
  /** When true, shows skeleton placeholders for user data. */
  isLoading?: boolean;
  /**
   * Renderiza un halo de marca difuminado detrás del card para separarlo
   * del fondo del dashboard. Es una capa decorativa puramente visual:
   * el card conserva su identidad (casi-negro/casi-blanco) y el halo
   * aporta el único "brand moment" cromático aprobado para esta superficie.
   * Default: true.
   */
  glow?: boolean;
  /**
   * Enables the 3D flip interaction. Default `true`. When `false` the
   * card renders its current (pre-flip) markup exactly as before —
   * backward-compat for any consumer that needs the static surface.
   */
  enableFlip?: boolean;
  /** Called when user taps a cashout arrow on the back face. Receives the target fiat currency code. */
  onCashout?: (currency: string) => void;
  wallets?: Array<{ id: string; currency: string; chain: string }>;
  activeWalletId?: string | null;
  mainWalletId?: string | null;
  onSelectWallet?: (walletId: string) => void;
}

// ───────────────────────────────────────────────────────────────
// Front face — chain header, balance, full address + scannable QR.
// ───────────────────────────────────────────────────────────────

interface FrontProps {
  userName: string;
  currency: string;
  amount: string;
  address: string;
  chain?: string;
  isLoading?: boolean;
  wallets?: Array<{ id: string; currency: string; chain: string }>;
  activeWalletId?: string | null;
  mainWalletId?: string | null;
  onSelectWallet?: (walletId: string) => void;
}

const VirtualCardFront: React.FC<FrontProps> = ({
  userName,
  currency,
  amount,
  address,
  chain,
  isLoading,
  wallets = [],
  activeWalletId,
  mainWalletId,
  onSelectWallet,
}) => {
  const { t } = useLingui();
  const { copied, copy } = useCopyToClipboard();
  const chainLabel = getChainLabel(chain);
  const showQr = !isLoading && !!address;
  const activeWallet = wallets.find((wallet) => wallet.id === activeWalletId) ?? null;
  const showWalletSelect = wallets.length > 1 && !!onSelectWallet;

  return (
    <div
      className={cn(
        'relative w-full h-full',
        'rounded-2xl overflow-hidden',
        'shadow-md',
        'bg-black text-white',
      )}
    >
      {/* Brand curves — shared composition lives in
          `@/shared/components/brand/brand-curves`. The same curves power
          the dashboard wallpaper so both surfaces stay visually in sync
          (§0 REUSE, NEVER REINVENT). `preserveAspectRatio='none'`
          matches the original card behaviour: the composition stretches
          to fill the card's aspect ratio. */}
      <BrandCurvesSvg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      />

      {/* Layer 2 — subtle edge vignette. A soft radial darkening near
          the border guarantees the rim always sits on a black substrate,
          even where a curve would otherwise touch the edge. The
          rgba(0,0,0,...) literal is inline because the specific stop
          curve is not expressible via tokens (documented §6 exception). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)',
        }}
      />
      {/* Layer 3 — glass rim. Thin white inset ring that seals the edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/15"
      />

      <div className="relative z-10 flex h-full flex-col gap-3 p-4 md:gap-4 md:p-6">
        {/* Top row — chain + brand logo (Soberana) */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {chainLabel && (
                <>
                  <span aria-hidden className="text-[10px] md:text-xs text-white/40">·</span>
                  <span className="text-[10px] md:text-xs font-medium text-white/80 truncate">
                    {chainLabel.name}
                  </span>
                  {chainLabel.symbol && (
                    <span className="text-[9px] uppercase tracking-wider text-white/50 ml-0.5 shrink-0">
                      {chainLabel.symbol}
                    </span>
                  )}
                </>
              )}
            </div>

            {showWalletSelect && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    data-no-flip
                    className={cn(
                      'inline-flex h-6 max-w-[126px] md:h-7 md:max-w-[155px] items-center gap-1 rounded-full border border-white/10 bg-white/6 px-2',
                      'text-[10px] font-medium uppercase tracking-[0.14em] text-white/72',
                      'hover:bg-white/10 transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full shrink-0',
                        activeWalletId === mainWalletId ? 'bg-white/80' : 'bg-[#6ba3e8]',
                      )}
                      aria-hidden
                    />
                    <span className="truncate">
                      {getWalletPairLabel(activeWallet) ?? currency}
                    </span>
                    <ChevronDown className="h-3 w-3 shrink-0 text-white/55" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={6}
                  data-no-flip
                  className="min-w-[180px] border-white/10 bg-[#0a0a0a] text-white"
                >
                  <DropdownMenuRadioGroup
                    value={activeWalletId ?? undefined}
                    onValueChange={onSelectWallet}
                  >
                    {wallets.map((wallet) => (
                      <DropdownMenuRadioItem
                        key={wallet.id}
                        value={wallet.id}
                        className="cursor-pointer text-white focus:bg-white/10 focus:text-white data-[state=checked]:bg-white/5"
                      >
                        <div className="flex w-full items-center justify-between gap-3">
                          <span className="text-xs font-medium uppercase tracking-[0.12em]">
                            {getWalletPairLabel(wallet) ?? wallet.currency}
                          </span>
                          {wallet.id === mainWalletId && (
                            <span className="text-[9px] uppercase tracking-[0.14em] text-white/45">
                              <Trans>Principal</Trans>
                            </span>
                          )}
                        </div>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <img
            src={SoberanaLogoWhite}
            alt="Soberana"
            className="h-5 md:h-6 w-auto opacity-90 shrink-0"
          />
        </div>

        {/* Balance — slightly smaller than v1 to make room for the
            address+QR block. The 4s `drop-shadow` breathing remains
            (§3.5 brand-moment exception, see file header). */}
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-10 rounded-md bg-white/15" />
              <Skeleton className="h-7 w-28 rounded-md bg-white/15" />
            </>
          ) : (
            <>
              <span className="font-mono tabular-nums text-[11px] md:text-sm font-medium text-white/70">
                {currency}
              </span>
              <motion.span
                className="font-heading font-bold text-[1.95rem] md:text-3xl leading-none tabular-nums"
                animate={{
                  filter: [
                    'drop-shadow(0 0 0px rgba(255,255,255,0))',
                    'drop-shadow(0 0 12px rgba(255,255,255,0.35))',
                    'drop-shadow(0 0 0px rgba(255,255,255,0))',
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {amount}
              </motion.span>
            </>
          )}
        </div>

        {/* Address + QR — keep the same visual disposition on mobile
            and desktop: text on the left, QR on a fixed right column.
            Using a fixed QR column avoids the mobile collapse where the
            QR drops downward and gets clipped by the card bounds. */}
        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_80px] gap-3 md:grid-cols-[minmax(0,1fr)_96px] md:items-end">
          <div className="min-w-0">
            <span className="block text-[9px] uppercase tracking-wider text-white/50 mb-1">
              <Trans>Dirección</Trans>
            </span>
            {isLoading || !address ? (
              <Skeleton className="h-8 w-full rounded-md bg-white/15" />
            ) : (
              <div className="flex items-start gap-2">
                {/* `break-all` lets a long ETH/SOL address wrap on
                    any character so it never overflows the card. */}
                <span className="font-mono text-[10px] md:text-xs text-white leading-snug break-all min-w-0">
                  {address}
                </span>
                <button
                  type="button"
                  data-no-flip
                  onClick={(e) => {
                    e.stopPropagation();
                    copy(address);
                  }}
                  aria-label={copied ? t`Copiado` : t`Copiar dirección`}
                  className={cn(
                    'relative inline-flex h-6 w-6 items-center justify-center rounded-md shrink-0',
                    'after:absolute after:inset-0 after:-m-2.5 after:content-[""]',
                    'text-white/70 hover:bg-white/10 hover:text-white',
                    'transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                  )}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <span className="sr-only" aria-live="polite">
                  {copied ? t`Copiado` : ''}
                </span>
              </div>
            )}
            {/* User name as subordinate metadata — protagonist is the
                address. Hidden on small heights to preserve hierarchy. */}
            {!isLoading && userName && (
              <span className="hidden md:block mt-1.5 text-xs font-medium text-white/70 truncate max-w-[80%]">
                {userName}
              </span>
            )}
          </div>

          {/* QR container — transparent background; QR modules are
              re-painted with the Loopay brand gradient (see
              `BrandGradientQr` and §6 QR exception in file header).
              Container click copies the address — cheap affordance,
              no extra UI. */}
          <div className="flex items-end justify-end">
            {showQr ? (
              <button
                type="button"
                data-no-flip
                onClick={(e) => {
                  e.stopPropagation();
                  copy(address);
                }}
                aria-label={t`Copiar dirección`}
                className={cn(
                  'block h-20 w-20 md:h-24 md:w-24 rounded-lg p-1.5',
                  'transition-colors duration-150 hover:bg-white/5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                )}
              >
                <BrandGradientQr
                  value={address}
                  size={72}
                  className="h-full w-full"
                />
              </button>
            ) : (
              <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-lg bg-white/15" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────
// Back face — single fiat equivalent (top half) + vaults preview
// (bottom half, blurred, "Próximamente").
// ───────────────────────────────────────────────────────────────

interface BackProps {
  stableBalance: string | undefined;
  stableCurrency: string;
  /** Pre-formatted balance shown above the equivalence row. */
  stableAmountFormatted: string;
  /** Available fiat options for the dropdown. */
  fiatCurrencies: string[];
  isLoading?: boolean;
}

const VaultPreviewCard: React.FC<{ vault: MockVault }> = ({ vault }) => (
  <div className="rounded-lg bg-white/5 ring-1 ring-white/10 p-2.5 min-h-[68px] flex flex-col justify-between">
    <div className="flex items-center justify-between">
      <span className="text-[9px] uppercase tracking-wider text-white/50 font-mono">
        {vault.asset}
      </span>
      <span
        className={cn(
          'text-[8px] uppercase tracking-wider font-medium',
          vault.risk === 'LOW' ? 'text-white/60' : 'text-white/40',
        )}
      >
        {vault.risk === 'LOW' ? <Trans>Bajo</Trans> : <Trans>Medio</Trans>}
      </span>
    </div>
    <div>
      <span className="font-mono font-bold text-sm text-white tabular-nums">
        {vault.apy.toFixed(1)}%
      </span>
      <span className="text-[9px] text-white/50 ml-1 uppercase">APY</span>
    </div>
  </div>
);

// Real Loopay brand gradient, mirrored verbatim from
// `.bg-brand-gradient` in src/styles/index.css (line 491). Inlined
// because (a) the linear-gradient angle is vertical here (180deg)
// rather than the wallpaper's 135deg — the button reads as a
// warm-top / cool-bottom coin, and (b) gradient stops cannot
// reference CSS custom properties. Approved under the §6 brand
// moment exception documented at the top of this file.
const BRAND_GRADIENT_VERTICAL =
  'linear-gradient(180deg, #c77d45 0%, #b23b2f 25%, #2c4a6b 55%, #4a7dc4 80%, #6ba3e8 100%)';

const CursorPointerSvg: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 18 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <path
      d="M1 1L1 16L5.5 12L9.5 20L12.5 18.5L8.5 10.5L14 10L1 1Z"
      fill="white"
      stroke="rgba(0,0,0,0.4)"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

const formatUpdatedAt = (ts: number): string => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(ts));
  } catch {
    return '';
  }
};

const VirtualCardBack: React.FC<BackProps> = ({
  stableBalance,
  stableCurrency,
  stableAmountFormatted,
  fiatCurrencies,
  isLoading: externalLoading,
}) => {
  const { t } = useLingui();

  // Initial fiat: localStorage > customer's local currency > USD.
  // The lookup is lazy so the first render doesn't pay for it.
  const { profile } = useCustomerProfile();
  const localCurrency = currencyForCountry(profile?.country);
  const [selectedFiat, setSelectedFiat] = React.useState<string>(() => {
    let stored: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        stored = window.localStorage.getItem(LS_BACK_FIAT_KEY);
      } catch {
        /* localStorage unavailable — fall through to defaults */
      }
    }
    return pickDefaultEquivalenceFiat({ fiatCurrencies, stored, localCurrency });
  });

  // Keep `selectedFiat` valid as the wallets list resolves: if the
  // current selection isn't in the new list, switch to the first
  // option without erasing the user's preference for next time.
  React.useEffect(() => {
    if (fiatCurrencies.length === 0) return;
    if (!fiatCurrencies.includes(selectedFiat)) {
      setSelectedFiat(pickDefaultEquivalenceFiat({ fiatCurrencies, localCurrency }));
    }
  }, [fiatCurrencies, selectedFiat, localCurrency]);

  const handleSelectFiat = (next: string) => {
    setSelectedFiat(next);
    try {
      window.localStorage.setItem(LS_BACK_FIAT_KEY, next);
    } catch {
      /* non-critical */
    }
  };

  const {
    equivalent,
    isLoading: rateLoading,
    isError,
    updatedAt,
  } = useLocalEquivalent({
    stableBalance,
    stableCurrency,
    targetFiat: selectedFiat,
  });

  const showSkeleton = externalLoading || (rateLoading && !equivalent);

  return (
    <div
      className={cn(
        'relative w-full h-full',
        'rounded-2xl overflow-hidden',
        'shadow-md',
        // §6 exception — VirtualCard substrate hex. See file header.
        'bg-[#0a0a0a] text-white',
      )}
    >
      {/* Subtle diagonal sheen so the back doesn't read as flat. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/3 to-transparent"
      />

      {/* Edge seal — matches the front rim so flipping doesn't lose
          the vignette of physical thickness. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/15"
      />

      <div className="relative z-10 flex h-full flex-col p-4 md:p-5 pr-7 md:pr-8">
        {/* ─── Top half — Equivalencia ───────────────────────────── */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
            <Trans>EQUIVALENCIA</Trans>
          </span>
          <img
            src={SoberanaLogoWhite}
            alt="Soberana"
            className="h-4 w-auto opacity-40"
          />
        </div>

        <div className="mt-2.5">
          {/* Stable balance — protagonist of the top half */}
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-xs text-white/60 tabular-nums">
              {stableCurrency}
            </span>
            {showSkeleton ? (
              <Skeleton className="h-7 w-32 rounded-md bg-white/15" />
            ) : (
              <span className="font-heading font-bold text-2xl md:text-3xl text-white tabular-nums leading-none">
                {stableAmountFormatted}
              </span>
            )}
          </div>

          {/* Fiat equivalent + dropdown trigger */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                data-no-flip
                aria-label={t`Cambiar moneda local`}
                className={cn(
                  'mt-1 -ml-1.5 flex items-center gap-1.5 rounded-md px-1.5 py-0.5',
                  'hover:bg-white/5 transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                )}
              >
                {selectedFiat && (
                  <span
                    className="text-base leading-none"
                    role="img"
                    aria-label={selectedFiat}
                  >
                    {getCurrencyFlag(selectedFiat)}
                  </span>
                )}
                <span className="font-mono text-sm text-white/80 tabular-nums">≈</span>
                {showSkeleton || rateLoading ? (
                  <Skeleton className="h-4 w-24 rounded-md bg-white/10" />
                ) : isError || !equivalent ? (
                  <span className="inline-flex items-center gap-1 text-white/60">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span className="text-xs">
                      <Trans>Tasa no disponible</Trans>
                    </span>
                  </span>
                ) : (
                  <span className="font-mono font-medium text-base text-white tabular-nums">
                    {equivalent.formatted}
                  </span>
                )}
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
                  {selectedFiat}
                </span>
                <ChevronDown className="h-3 w-3 text-white/60 ml-0.5" />
                {updatedAt && !showSkeleton && !rateLoading && equivalent && (
                  <span className="text-[9px] text-white/30 font-mono tabular-nums ml-1">
                    · {formatUpdatedAt(updatedAt)}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="bottom"
              sideOffset={4}
              // Dark continuation of the card substrate — feels like
              // the card extending downward, not a generic app
              // popover. §6 substrate exception applies here too.
              // The Radix Portal renders this outside the card DOM
              // tree, so flip-bubbling is structurally impossible —
              // but `data-no-flip` is still set defensively for any
              // ancestor walk that might run on the trigger.
              data-no-flip
              className="bg-[#0a0a0a] text-white border-white/10 min-w-[180px]"
            >
              <DropdownMenuRadioGroup
                value={selectedFiat}
                onValueChange={handleSelectFiat}
              >
                {fiatCurrencies.map((fiat) => (
                  <DropdownMenuRadioItem
                    key={fiat}
                    value={fiat}
                    className="cursor-pointer text-white focus:bg-white/10 focus:text-white data-[state=checked]:bg-white/5"
                  >
                    <div className="flex items-center gap-2.5 flex-1">
                      <span
                        className="text-base leading-none"
                        role="img"
                        aria-label={fiat}
                      >
                        {getCurrencyFlag(fiat)}
                      </span>
                      <span className="font-mono text-xs tabular-nums">{fiat}</span>
                    </div>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ─── Divider ───────────────────────────────────────────── */}
        <div className="my-3 md:my-4 h-px bg-white/10" />

        {/* ─── Bottom half — Vaults preview ──────────────────────── */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-semibold">
              <Trans>Vaults</Trans>
            </span>
            <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono">
              <Trans>Próximamente</Trans>
            </span>
          </div>

          <div
            className="relative flex-1 min-h-0"
            aria-label={t`Vaults — disponibles próximamente`}
          >
            {/* The grid is intentionally sharp internally; the
                blur+opacity sit on the wrapper so the lock badge
                above stays crisp. `pointer-events-none` blocks any
                accidental click from triggering a flip or hover. */}
            <div className="grid grid-cols-3 gap-2 blur-[2px] opacity-70 select-none pointer-events-none">
              {MOCK_VAULTS.map((v) => (
                <VaultPreviewCard key={v.id} vault={v} />
              ))}
            </div>

            {/* Frosted-glass lock badge — speaks "blocked" louder
                than any copy. backdrop-blur-md on bg-black/60
                creates the soft pill over the diffused vault
                grid below. */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 ring-1 ring-white/15">
                <Lock className="h-3 w-3 text-white/80" />
                <span className="text-[10px] uppercase tracking-wider text-white/80 font-medium">
                  <Trans>Próximamente</Trans>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────
// Public VirtualCard — wraps both faces in a 3D flip scaffold.
// ───────────────────────────────────────────────────────────────

export const VirtualCard = React.forwardRef<HTMLDivElement, VirtualCardProps>(
  (
    {
      userName,
      currency,
      amount,
      rawAmount,
      address,
      chain,
      // `truncate` accepted but no longer applied — see prop doc.
      truncate: _truncate,
      isLoading,
      glow = true,
      enableFlip = true,
      // `onCashout` was the per-row cashout button on the v1 back.
      // The v2 back has a single fiat selector and no cashout
      // CTA — the dashboard's main action row owns that flow now.
      onCashout: _onCashout,
      wallets,
      activeWalletId,
      mainWalletId,
      onSelectWallet,
      className,
      ...props
    },
    ref,
  ) => {
    const { t } = useLingui();
    void _truncate;
    void _onCashout;

    const prefersReducedMotion = useReducedMotion();
    // Synchronous mobile check — avoids the initial-undefined flash from
    // useMobile() that would render the (broken) 3D path on first paint
    // before the effect resolves. The 768px breakpoint matches the app's
    // existing useMobile hook. Orientation crossing is accepted as a rare
    // edge case — the card path doesn't change on resize.
    const [isMobile] = React.useState(() => {
      if (typeof window === 'undefined') return false;
      return window.innerWidth < 768;
    });
    const [isFlipped, setIsFlipped] = React.useState(false);
    const [hasEverFlipped, setHasEverFlipped] = React.useState<boolean>(() => {
      if (typeof window === 'undefined') return false;
      try {
        return window.sessionStorage.getItem(SESSION_FLIP_FLAG) === 'true';
      } catch {
        return false;
      }
    });
    const [hasDemoPlayed, setHasDemoPlayed] = React.useState(false);

    const { wallets: availableWallets } = useWallets();
    const fiatCurrencies = React.useMemo(() => {
      const fromWallets = availableWallets
        .map((w) => w.currency)
        .filter((code): code is string => !!code)
        .map((code) => code.toUpperCase());

      // Show all currently supported exchange-rate targets + any
      // wallet currency that also matches that supported set.
      const supportedSet = new Set(BACKFACE_SUPPORTED_CURRENCIES);
      const merged = [...new Set([...BACKFACE_SUPPORTED_CURRENCIES, ...fromWallets])];
      return merged.filter((code) => supportedSet.has(code));
    }, [availableWallets]);

    // Raw balance for equivalence math — prefer the explicit
    // `rawAmount` prop; fall back to stripping grouping characters
    // from the pre-formatted `amount` so we don't introduce a
    // breaking change for consumers that haven't migrated yet.
    const stableBalance = React.useMemo(() => {
      if (rawAmount) return rawAmount;
      if (!amount) return undefined;
      return amount.replace(/[^0-9.-]/g, '') || undefined;
    }, [rawAmount, amount]);

    const handleFlip = React.useCallback(() => {
      setIsFlipped((prev) => {
        const next = !prev;
        if (!hasEverFlipped) {
          setHasEverFlipped(true);
          try {
            window.sessionStorage.setItem(SESSION_FLIP_FLAG, 'true');
          } catch {
            /* sessionStorage unavailable — the pulse will simply
               re-appear on next mount; non-critical. */
          }
        }
        return next;
      });
    }, [hasEverFlipped]);

    // ── Demo auto-flip ────────────────────────────────────────────
    // On first session load the card performs a 2-flip demo
    // (front→back→front) before revealing the external flip button.
    //
    // Implementation note: a single effect schedules all timeouts
    // at mount time. The cleanup cancels them if the component
    // unmounts mid-demo (e.g. route change). React StrictMode
    // double-mount is handled naturally: cleanup cancels the first
    // batch, and the second mount schedules a fresh batch.
    const skipDemo = hasDemoPlayed || !enableFlip || prefersReducedMotion === true || isMobile;
    const [demoRotation, setDemoRotation] = React.useState(0);
    const [demoDone, setDemoDone] = React.useState(skipDemo);
    const [showCursorTutorial, setShowCursorTutorial] = React.useState(false);
    const demoRanRef = React.useRef(false);

    React.useEffect(() => {
      if (skipDemo) return;

      let cancelled = false;
      const timers: ReturnType<typeof setTimeout>[] = [];

      const schedule = (fn: () => void, ms: number) => {
        timers.push(setTimeout(() => { if (!cancelled) fn(); }, ms));
      };

      // 1.2s — flip to back (180°)
      schedule(() => setDemoRotation(180), 1200);
      // 2.6s — flip back to front (360°)
      schedule(() => setDemoRotation(360), 2600);
      // 3.3s — demo complete, reveal button
      schedule(() => {
        setDemoDone(true);
        setDemoRotation(0);
        setHasDemoPlayed(true);
        demoRanRef.current = true;
        try { window.sessionStorage.setItem(SESSION_DEMO_FLAG, 'true'); }
        catch { /* non-critical */ }
      }, 3300);
      // 3.6s — show cursor tutorial
      schedule(() => setShowCursorTutorial(true), 3600);

      return () => {
        cancelled = true;
        timers.forEach(clearTimeout);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const demoInProgress = !demoDone && !skipDemo;
    const showPulse = !hasEverFlipped && !isFlipped && enableFlip && demoDone;

    const front = (
      <VirtualCardFront
        userName={userName}
        currency={currency}
        amount={amount}
        address={address}
        chain={chain}
        isLoading={isLoading}
        wallets={wallets}
        activeWalletId={activeWalletId}
        mainWalletId={mainWalletId}
        onSelectWallet={onSelectWallet}
      />
    );

    if (!enableFlip) {
      return (
        <div
          ref={ref}
          className={cn(
            'relative w-full mx-auto',
            'aspect-85/48',
            'rounded-2xl',
            className,
          )}
          {...props}
        >
          {glow && <HaloLayer />}
          {front}
        </div>
      );
    }

    const back = (
      <VirtualCardBack
        stableBalance={stableBalance}
        stableCurrency={currency}
        stableAmountFormatted={amount}
        fiatCurrencies={fiatCurrencies}
        isLoading={isLoading}
      />
    );

    const flipButtonAriaLabel = isFlipped
      ? t`Ver frente de tarjeta`
      : t`Ver equivalencias en moneda local`;

    // Shared external flip button — rendered by both reduced-motion
    // and full-3D paths as a sibling of the card scaffold.
    const externalFlipButton = (
      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleFlip();
        }}
        aria-label={flipButtonAriaLabel}
        className={cn(
          'absolute right-2 md:-right-6 top-1/2 -translate-y-1/2 z-30',
          'flex items-center justify-center',
          'h-8 w-8 md:h-12 md:w-12 rounded-full',
          'border border-white/20',
          'hover:border-white/30',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
          !demoDone && 'opacity-0 pointer-events-none',
        )}
        style={{ background: BRAND_GRADIENT_VERTICAL }}
        animate={
          showPulse
            ? {
              boxShadow: [
                '0 0 0px rgba(199,125,69,0), 0 0 0px rgba(74,125,196,0)',
                '0 0 12px rgba(199,125,69,0.35), 0 0 18px rgba(74,125,196,0.25)',
                '0 0 0px rgba(199,125,69,0), 0 0 0px rgba(74,125,196,0)',
              ],
              opacity: 1,
            }
            : {
              boxShadow:
                '0 0 6px rgba(199,125,69,0.12), 0 0 8px rgba(74,125,196,0.08)',
              opacity: demoDone ? 1 : 0,
            }
        }
        transition={
          showPulse
            ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.2, ease: 'easeOut' }
        }
      >
        <RotateCcw className="h-4 w-4 md:h-6 md:w-6 text-white/90" />
      </motion.button>
    );

    // Cursor tutorial overlay — purely decorative pointer that
    // enters from bottom-right, simulates a click on the flip
    // button, then fades out. Only shown once per session.
    const cursorTutorial = showCursorTutorial && !hasEverFlipped && demoRanRef.current && (
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-2 md:-right-6 top-1/2 -translate-y-1/2 z-40"
        initial={{ x: 40, y: 40, opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: [0, 1, 1, 1, 0] }}
        transition={{ duration: 1.2, ease: 'easeOut', times: [0, 0.33, 0.5, 0.75, 1] }}
        onAnimationComplete={() => setShowCursorTutorial(false)}
      >
        <motion.div
          animate={{ scale: [1, 1, 0.85, 1, 1] }}
          transition={{ duration: 1.2, ease: 'easeOut', times: [0, 0.4, 0.55, 0.65, 1] }}
        >
          <CursorPointerSvg className="h-6 w-6 drop-shadow-md" />
        </motion.div>
      </motion.div>
    );

    // ── Reduced-motion path: swap faces with an opacity cross-fade
    // instead of a 3D rotation. The active face is rendered alone
    // (no overlap), so no pointer-events toggling is needed.
    // Flipping happens exclusively through the external gradient
    // button — same as the 3D path, kept consistent.
    if (prefersReducedMotion || isMobile) {
      return (
        <div
          ref={ref}
          className={cn(
            'relative w-full mx-auto',
            'aspect-85/48',
            'rounded-2xl',
            'overflow-visible',
            className,
          )}
          {...props}
        >
          {glow && <HaloLayer />}
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipped ? 'back' : 'front'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              className="relative w-full h-full"
            >
              {isFlipped ? back : front}
            </motion.div>
          </AnimatePresence>
          {externalFlipButton}
        </div>
      );
    }

    // ── Compute the rotation target for the 3D scaffold.
    const scaffoldRotateY =
      demoInProgress
        ? demoRotation
        : isFlipped
          ? 180
          : 0;

    // ── Full 3D flip path (brand moment, §3.5 documented exception).
    //
    // Click-to-flip strategy:
    //   - The scaffold is click-inert.
    //   - Each face toggles `pointer-events` based on `isFlipped`,
    //     so the browser's native hit-testing only ever delivers
    //     events to the face that's actually facing the user.
    //   - This replaces the earlier `data-no-flip` zoning (which
    //     was bypassed when the inactive face's z-stacked div
    //     captured the click before the active face's descendants
    //     did, especially in Safari + 3D-transform stacking).
    //   - Flipping is owned exclusively by the external gradient
    //     button (always visible, always reachable). The face
    //     surfaces themselves do NOT trigger flips — interactive
    //     widgets inside the back (dropdown, vault cards, future
    //     CTAs) work without any "is this a flip target?" guard.
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full mx-auto',
          'aspect-85/48',
          'rounded-2xl',
          'overflow-visible',
          className,
        )}
        style={{ perspective: '1200px' }}
        {...props}
      >
        {glow && <HaloLayer />}
        <motion.div
          className={cn(
            'relative w-full h-full',
            demoInProgress && 'pointer-events-none',
          )}
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: scaffoldRotateY }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className={cn(
              'absolute inset-0',
              isFlipped ? 'pointer-events-none' : 'pointer-events-auto',
            )}
            style={{ backfaceVisibility: 'hidden' }}
            aria-hidden={isFlipped}
          >
            {front}
          </div>
          <div
            className={cn(
              'absolute inset-0',
              isFlipped ? 'pointer-events-auto' : 'pointer-events-none',
            )}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            aria-hidden={!isFlipped}
          >
            {back}
          </div>
        </motion.div>
        {externalFlipButton}
        {cursorTutorial}
      </div>
    );
  },
);
VirtualCard.displayName = 'VirtualCard';

// ───────────────────────────────────────────────────────────────
// Brand halo — decorative layer behind the card. Extracted so both
// the flippable and the non-flippable code paths share the exact
// same halo definition without drift.
// ───────────────────────────────────────────────────────────────
//
// Asymmetric placement: `translate-y-4` shifts the blurred gradient
// ~16px downward so the halo reads as light pooling under the card
// (like a lamp seated on a dark surface) rather than a symmetric
// aura surrounding it. Lower opacity in light mode keeps the card
// the focal point; reduced-but-present opacity in dark mode (`0.30`)
// — paired with the dashboard's `BrandCurvesBackdrop` wallpaper —
// avoids the previous 0.50 that competed for attention. Approved
// brand moment per CLAUDE.md §6 — VirtualCard is the hero asset card.
const HaloLayer: React.FC = () => (
  <div
    aria-hidden
    className={cn(
      'pointer-events-none absolute inset-0 -z-10 rounded-[inherit]',
      'bg-brand-gradient blur-2xl scale-[1.02] md:scale-[1.04] translate-y-0 md:translate-y-4',
      'opacity-20 dark:opacity-30',
    )}
  />
);
