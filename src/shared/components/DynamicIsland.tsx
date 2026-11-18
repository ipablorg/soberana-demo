/**
 * Dynamic Island Component — THE one island.
 *
 * Canonical implementation (dashboard flows, wizards, payment-link flow and
 * the backoffice all render this component and drive the shared store at
 * `@/shared/stores/useDynamicIslandStore`). The dashboard module re-exports
 * it from `features/dashboard/components/dynamic-island`.
 *
 * Dynamic Island Component (original notes)
 * 
 * Inspired by Apple's Dynamic Island concept
 * Shows different states: balance, sending, receiving, converting, etc.
 * 
 * Features:
 * - Network preference: Stablecoins, Ucoin, Fiat currencies
 * - Settings gear icon for quick access
 * - Fiat activation with persistent state
 */

import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Check, X, Loader2, Settings, CheckCircle2 } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import { useDynamicIslandStore, type IslandData } from '@/shared/stores/useDynamicIslandStore';
import { useMobile } from '@/shared/hooks/use-mobile';
import { useBridgeWalletBalance } from '@/shared/hooks/useBridgeWalletBalance';
import { useLingui } from '@lingui/react/macro';
import { getRuntimeStablecoinLabel } from '@/shared/lib/runtime-stablecoin';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/shared/components/ui/dropdown-menu';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { toast } from '@/shared/components/ui/sonner';
import { useMockBalanceStore } from '@/shared/stores/useMockBalanceStore';
import { useMultiCurrencyBalanceStore } from '@/shared/stores/useMultiCurrencyBalanceStore';
import { getActiveFiatCurrencies as getActiveFiatArr, activateFiatCurrency } from '@/shared/hooks/use-fiat-activation';

type NetworkPreference = 'tether' | 'solana' | 'ucoin' | 'cop' | 'brl' | 'mxn' | 'pen' | 'usd';

type FiatCurrency = 'cop' | 'brl' | 'mxn' | 'pen' | 'usd';

const FIAT_CURRENCIES: FiatCurrency[] = ['cop', 'brl', 'mxn', 'pen', 'usd'];

const isFiatPref = (pref: NetworkPreference): pref is FiatCurrency =>
  FIAT_CURRENCIES.includes(pref as FiatCurrency);

const getNetworkPreference = (): NetworkPreference => {
  if (typeof window === 'undefined') return 'tether';
  const stored = localStorage.getItem('loopay-network-preference');
  return (stored as NetworkPreference) || 'tether';
};

const setNetworkPreference = (preference: NetworkPreference) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('loopay-network-preference', preference);
  }
};

const loadActiveFiatSet = (): Set<FiatCurrency> =>
  new Set(getActiveFiatArr() as FiatCurrency[]);

const NETWORK_CONFIG: Record<NetworkPreference, { label: string; icon: string; currency: string; subtitle: string }> = {
  tether: { label: 'Tether (USDT)', icon: '₮', currency: 'USDT', subtitle: 'USDT por defecto' },
  solana: { label: 'Solana (USDC)', icon: '◎', currency: 'USDC', subtitle: 'USDC por defecto' },
  ucoin: { label: 'Ucoin', icon: 'Ü', currency: 'Ucoin', subtitle: 'Red Ucoin' },
  cop: { label: 'Peso Colombiano (COP)', icon: '🇨🇴', currency: 'COP', subtitle: 'Recibe en pesos colombianos' },
  brl: { label: 'Real Brasileño (BRL)', icon: '🇧🇷', currency: 'BRL', subtitle: 'Recibe en reales brasileños' },
  mxn: { label: 'Peso Mexicano (MXN)', icon: '🇲🇽', currency: 'MXN', subtitle: 'Recibe en pesos mexicanos' },
  pen: { label: 'Sol Peruano (PEN)', icon: '🇵🇪', currency: 'PEN', subtitle: 'Recibe en soles peruanos' },
  usd: { label: 'Dólar USA (USD)', icon: '🇺🇸', currency: 'USD', subtitle: 'Recibe en dólares USA' },
};

const FIAT_DROPDOWN_LABELS: Record<FiatCurrency, string> = {
  cop: 'Colombia (COP)',
  brl: 'Brasil (BRL)',
  mxn: 'México (MXN)',
  pen: 'Perú (PEN)',
  usd: 'USA (USD)',
};

export interface IdleMessage {
  bold: string;
  muted?: string;
}

export interface DynamicIslandProps {
  /**
   * When provided, replaces the default balance+settings IdleContent with a
   * two-tone guidance message. Used by the Soberana home to narrate the
   * "Selecciona. Qué quieres hacer." state without duplicating the component.
   */
  idleMessage?: IdleMessage;
  /**
   * Wallet ID to fetch balance for. When omitted, falls back to the
   * hardcoded ID in `useBridgeWalletBalance`. Pass the user's primary
   * wallet ID from the parent so the DI shows the real balance.
   */
  walletId?: string;
  /**
   * Wizard surfaces pass `showBalance={false}`: the island then renders only
   * while there is something to narrate (wizard progress, a flow step or a
   * result) instead of falling back to the balance. Defaults to `true`.
   */
  showBalance?: boolean;
}

/**
 * Dynamic Island — renders over bg-brand-gradient.
 * text-white is intentional and approved (same rationale as Button variant="gradient"):
 * the Loopay gradient is dark in both light and dark modes, requiring white text for contrast.
 * See CLAUDE.md §4 (Primary Action Button Pattern).
 */
export function DynamicIsland({
  idleMessage,
  walletId,
  showBalance = true,
}: DynamicIslandProps = {}) {
  const { t } = useLingui();
  const { islandData } = useDynamicIslandStore();
  const mode = useDynamicIslandStore((s) => s.mode);
  const receiveStep = useDynamicIslandStore((s) => s.receiveStep);
  const selectedCurrency = useDynamicIslandStore((s) => s.selectedCurrency);
  const receiveAccountCount = useDynamicIslandStore((s) => s.receiveAccountCount);
  const sendStep = useDynamicIslandStore((s) => s.sendStep);
  const sendTargetCurrency = useDynamicIslandStore((s) => s.sendTargetCurrency);
  const isMobile = useMobile();
  const { balance: bridgeBalance, currency: bridgeCurrency, isLoading: isLoadingBridge } = useBridgeWalletBalance(walletId);
  const runtimeStablecoinLabel = getRuntimeStablecoinLabel(bridgeCurrency);

  // ── Ready-step rotating tail ──────────────────────────────────────
  // While the user is on the deposit-instructions screen, the DI
  // alternates between two messages:
  //   1. instructions ("Haz la transferencia…")
  //   2. reassurance ("Si ya transferiste, espera unos minutos")
  // The rotation only advances while we're actually in `ready`. The
  // index resets whenever the user re-enters the step (e.g. picks
  // another currency), so the first message is always shown first.
  const [readyIndex, setReadyIndex] = useState(0);
  useEffect(() => {
    if (mode !== 'receive' || receiveStep !== 'ready') {
      setReadyIndex(0);
      return;
    }
    // 7s per message gives enough time for the typewriter to finish
    // both segments AND for the user to actually read it before the
    // next one rotates in.
    const id = window.setInterval(() => {
      setReadyIndex((i) => (i + 1) % 2);
    }, 7000);
    return () => window.clearInterval(id);
  }, [mode, receiveStep]);

  // ── Receive-flow copy dictionary ─────────────────────────────────
  // Single source of truth for what the DI narrates while the user
  // is inside the receive flow. Two-tone: headline (bold) + tail
  // (muted) matches `IdleMessageContent`. Copy follows loopay-marcom
  // discipline (no exclamation, imperative verbs, no jargon).
  const receiveCopy =
    mode === 'receive'
      ? (() => {
          switch (receiveStep) {
            case 'select':
              return receiveAccountCount === 0
                ? { bold: t`Aún no tienes`, muted: t`cuentas virtuales` }
                : { bold: t`Tus cuentas.`, muted: t`Elige dónde recibir` };
            case 'ready': {
              const code = selectedCurrency ?? '';
              if (readyIndex === 1) {
                return {
                  bold: t`Si ya transferiste,`,
                  muted: t`espera unos minutos`,
                };
              }
              return {
                bold: code ? t`Transfiere en ${code},` : t`Transfiere,`,
                muted: runtimeStablecoinLabel
                  ? t`se cargará ${runtimeStablecoinLabel}`
                  : t`se acreditará en tu wallet`,
              };
            }
            case 'pending':
              return { bold: t`En revisión.`, muted: t`Tu cuenta estará lista pronto` };
            case 'activate':
              return { bold: t`Un paso más.`, muted: t`Activa esta cuenta para recibir` };
            default:
              return { bold: t`Recibir.`, muted: undefined } as IdleMessage;
          }
        })()
      : null;

  // ── Send-flow copy dictionary ────────────────────────────────────
  // Mirrors `receiveCopy`: a two-tone message per step. The tail for
  // `amount` is enriched with the beneficiary's settlement currency
  // when it's known, so the DI reads as "Cuánto en MXN." instead of
  // a generic "Cuánto.". `submitting / success / error` delegate to
  // the legacy `islandData.state` (sending / success / error), which
  // already owns those concrete render paths — duplicating them here
  // would create two sources of truth for the same moment.
  const sendCopy =
    mode === 'send'
      ? (() => {
          switch (sendStep) {
            case 'select-beneficiary':
              return { bold: t`Elige.`, muted: t`A quién le envías` };
            case 'create-beneficiary':
              return { bold: t`Añade.`, muted: t`Los datos del beneficiario` };
            case 'amount': {
              const code = sendTargetCurrency ?? '';
              return code
                ? { bold: t`Cuánto en ${code}.`, muted: t`Ingresa el monto a enviar` }
                : { bold: t`Cuánto.`, muted: t`Ingresa el monto a enviar` };
            }
            case 'review':
              return { bold: t`Revisa.`, muted: t`Confirma y envía` };
            case 'submitting':
            case 'success':
            case 'error':
              // Let the concrete islandData.state render path take over
              // (SendingContent / SuccessContent / ErrorContent).
              return null;
            default:
              return { bold: t`Enviar.`, muted: undefined } as IdleMessage;
          }
        })()
      : null;

  // Receive / send copy has priority over every other idle-ish DI
  // state: if the user just opened a flow we must narrate *that*, not
  // the generic "Selecciona." or a stale step-progress. Legacy
  // concrete states (sending/receiving/success/error) still win
  // because they represent real operations in progress.
  const renderKey = receiveCopy
    ? `receive-${receiveStep}`
    : sendCopy
      ? `send-${sendStep}`
      : islandData.state;

  if (
    !showBalance &&
    !idleMessage &&
    !receiveCopy &&
    !sendCopy &&
    islandData.state === 'idle'
  ) {
    return null;
  }

  const getContent = () => {
    if (receiveCopy && (islandData.state === 'idle' || islandData.state === 'step-progress')) {
      return <IdleMessageContent message={receiveCopy} />;
    }
    if (sendCopy && (islandData.state === 'idle' || islandData.state === 'step-progress')) {
      return <IdleMessageContent message={sendCopy} />;
    }
    switch (islandData.state) {
      case 'idle':
        return idleMessage
          ? <IdleMessageContent message={idleMessage} />
          : <IdleContent bridgeBalance={bridgeBalance} bridgeCurrency={bridgeCurrency} isLoading={isLoadingBridge} />;
      case 'sending':
        return <SendingContent data={islandData} />;
      case 'receiving':
        return <ReceivingContent data={islandData} />;
      case 'converting':
        return <ConvertingContent data={islandData} />;
      case 'processing':
        return <ProcessingContent data={islandData} />;
      case 'step-progress':
        return <StepProgressContent data={islandData} />;
      case 'success':
        return <SuccessContent message={islandData.message} amount={islandData.amount} currency={islandData.currency} />;
      case 'error':
        return <ErrorContent message={islandData.message} />;
      default:
        return idleMessage
          ? <IdleMessageContent message={idleMessage} />
          : <IdleContent bridgeBalance={bridgeBalance} bridgeCurrency={bridgeCurrency} isLoading={isLoadingBridge} />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full rounded-full p-px bg-brand-gradient"
    >
      <div
        className={cn(
          'flex flex-col w-full',
          'rounded-full',
          'bg-brand-gradient',
          isMobile ? 'px-4 py-2.5' : 'px-8 py-4',
        )}
      >
        {/* Card body: dynamic content. The former SOBERANA header lives
            exclusively in the VirtualCard now — keeping it here would be
            redundant brand signaling on the same screen. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={renderKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="flex items-center gap-3 w-full"
          >
            {getContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/**
 * Typewriter primitive scoped to the DI.
 *
 * We don't reuse `shared/components/common/TypewriterText` here for
 * three reasons:
 *  - The DI caret must draw in white over the brand gradient, not in
 *    `bg-foreground` (which is near-black in light mode and would be
 *    invisible on the dark gradient).
 *  - We need two sequential passes (bold then muted) with a slight
 *    pause between them, so consumers pass in the tail start delay.
 *  - Keeping it local avoids every callsite of the shared typewriter
 *    from accidentally inheriting future DI-specific caret changes.
 *
 * The component is pure-client (setState + setTimeout) and resets
 * when `text` changes — so when the DI re-renders with a new
 * receive step, the animation plays fresh for the new copy.
 */
const TypewriterSegment: React.FC<{
  text: string;
  className?: string;
  startDelay?: number;
  speed?: number;
  showCaret?: boolean;
  onComplete?: () => void;
}> = ({
  text,
  className,
  startDelay = 0,
  speed = 28,
  showCaret = false,
  onComplete,
}) => {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShown('');
    setDone(false);
  }, [text]);

  useEffect(() => {
    if (shown.length >= text.length) {
      if (!done) {
        setDone(true);
        onComplete?.();
      }
      return;
    }
    const delay = shown.length === 0 ? startDelay : speed;
    const id = setTimeout(() => {
      setShown(text.slice(0, shown.length + 1));
    }, delay);
    return () => clearTimeout(id);
  }, [shown, text, speed, startDelay, done, onComplete]);

  return (
    <span className={className}>
      {shown}
      {showCaret && !done && (
        <motion.span
          aria-hidden
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="inline-block w-[2px] h-[0.9em] bg-white ml-[2px] align-middle"
        />
      )}
    </span>
  );
};

/**
 * Idle State — Two-tone guidance message (used by Soberana home).
 *
 * Types the bold headline first, then the muted tail. The caret is
 * only attached to the segment that is currently typing so the
 * cursor doesn't "jump" between spans. When both are done the caret
 * disappears entirely, leaving a clean final frame.
 *
 * A `key` on the outer element (driven by `message.bold`) forces a
 * remount on every copy change, so transitioning from
 * "Tus cuentas. Elige dónde recibir" →
 * "Haz la transferencia a esta cuenta, se cargará el USDT a tu wallet"
 * replays the effect rather than diffing mid-animation.
 */
function IdleMessageContent({ message }: { message: IdleMessage }) {
  const isMobile = useMobile();
  const [boldDone, setBoldDone] = useState(false);

  useEffect(() => {
    setBoldDone(false);
  }, [message.bold, message.muted]);

  // Start the tail only after the headline has finished. A fixed
  // delay feels artificial at different bold lengths; tying it to
  // actual completion keeps the rhythm natural.
  const tailStartDelay = boldDone ? 120 : 10_000_000;

  return (
    <div
      className="flex items-center justify-center w-full"
      key={`${message.bold}::${message.muted ?? ''}`}
    >
      <p
        className={cn(
          'font-heading tracking-tight text-center',
          isMobile ? 'text-sm leading-tight text-balance' : 'text-lg whitespace-nowrap',
        )}
      >
        {/* Cadence: ~65ms/char on the bold headline and ~50ms/char
            on the muted tail. The tail reads a touch faster so the
            sentence feels like it's "finishing a thought", not
            labouring through every word. Earlier 32/24ms felt like
            a stutter on desktop; this pace reads as deliberate
            without being slow enough to notice between rotations. */}
        <TypewriterSegment
          text={message.bold}
          className="font-semibold text-white"
          speed={65}
          showCaret={!boldDone}
          onComplete={() => setBoldDone(true)}
        />
        {message.muted && (
          <>
            {' '}
            <TypewriterSegment
              text={message.muted}
              className="font-normal text-white/70"
              speed={50}
              startDelay={tailStartDelay}
              showCaret={boldDone}
            />
          </>
        )}
      </p>
    </div>
  );
}

// Idle State - Shows Wallet Balance with Settings
function IdleContent({ bridgeBalance, bridgeCurrency, isLoading }: { bridgeBalance: string | null; bridgeCurrency: string; isLoading: boolean }) {
  const { t } = useLingui();
  const isMobile = useMobile();
  const [networkPreference, setNetworkPreferenceState] = useState<NetworkPreference>(getNetworkPreference());
  const mockBalance = useMockBalanceStore((s) => s.balanceUsdc);
  const getMultiBalance = useMultiCurrencyBalanceStore((s) => s.getBalance);
  const [activeFiat, setActiveFiat] = useState<Set<FiatCurrency>>(loadActiveFiatSet);
  const [activatingCurrency, setActivatingCurrency] = useState<FiatCurrency | null>(null);

  const handleNetworkChange = useCallback((value: string) => {
    const pref = value as NetworkPreference;
    if (isFiatPref(pref) && !activeFiat.has(pref)) return;
    setNetworkPreferenceState(pref);
    setNetworkPreference(pref);
  }, [activeFiat]);

  const handleActivateFiat = useCallback(async (currency: FiatCurrency, checked: boolean) => {
    if (!checked) return;
    setActivatingCurrency(currency);
    await new Promise((r) => setTimeout(r, 1500));

    activateFiatCurrency(currency);
    const next = new Set(activeFiat);
    next.add(currency);
    setActiveFiat(next);
    setActivatingCurrency(null);

    const currencyLabel = NETWORK_CONFIG[currency].currency;
    toast.success(t`Cuenta ${currencyLabel} activada`, {
      description: t`Lista para operar`,
      icon: <CheckCircle2 className="h-5 w-5" />,
    });
  }, [activeFiat]);

  const getDisplayBalance = useCallback((network: NetworkPreference): string => {
    const isStable = network === 'tether' || network === 'solana';
    const isUcoin = network === 'ucoin';

    if (isStable) {
      const storeKey = network === 'tether' ? 'usdt' : 'usdc';
      const storeBal = getMultiBalance(storeKey);
      const fallback = mockBalance > 0 ? mockBalance : storeBal;
      return bridgeBalance || (fallback > 0 ? fallback.toFixed(4) : '0.0000');
    }

    if (isUcoin) {
      return getMultiBalance('ucoin').toFixed(4);
    }

    const fiatBal = getMultiBalance(network);
    return fiatBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [bridgeBalance, mockBalance, getMultiBalance]);

  const displayStablecoinLabel = getRuntimeStablecoinLabel(bridgeCurrency) ?? 'USD';

  return (
    <div className="flex items-center justify-between w-full gap-3">
      <span className={cn(
        'font-bold font-mono text-white flex-1 text-center tabular-nums',
        isMobile ? 'text-xl' : 'text-2xl'
      )}>
        {isLoading ? (
          <span className="animate-pulse">...</span>
        ) : (
          `${networkPreference === 'tether' || networkPreference === 'solana'
            ? displayStablecoinLabel
            : NETWORK_CONFIG[networkPreference].currency} ${getDisplayBalance(networkPreference)}`
        )}
      </span>

      {/* Settings Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'p-2 rounded-lg hover:bg-white/10 transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-ring'
            )}
            aria-label={t`Red`}
          >
            <Settings className={cn('text-white/80 animate-spin-slow', isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-80 bg-background border border-border"
        >
          {/* — Stablecoins Section — */}
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {t`Stablecoins`}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={networkPreference} onValueChange={handleNetworkChange}>
            {/* Tether */}
            <DropdownMenuRadioItem value="tether" className="cursor-pointer">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xl w-6 text-center">{NETWORK_CONFIG.tether.icon}</span>
                <div className="flex flex-col flex-1">
                  <span className="font-medium text-sm">Tether First</span>
                  <span className="text-xs text-muted-foreground">{NETWORK_CONFIG.tether.subtitle}</span>
                </div>
              </div>
              <span className="text-sm font-mono tabular-nums text-muted-foreground ml-auto">
                {getDisplayBalance('tether')}
              </span>
            </DropdownMenuRadioItem>

            {/* Solana */}
            <DropdownMenuRadioItem value="solana" className="cursor-pointer">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xl w-6 text-center">{NETWORK_CONFIG.solana.icon}</span>
                <div className="flex flex-col flex-1">
                  <span className="font-medium text-sm">Solana First</span>
                  <span className="text-xs text-muted-foreground">{NETWORK_CONFIG.solana.subtitle}</span>
                </div>
              </div>
              <span className="text-sm font-mono tabular-nums text-muted-foreground ml-auto">
                {getDisplayBalance('solana')}
              </span>
            </DropdownMenuRadioItem>

            {/* Ucoin */}
            <DropdownMenuRadioItem value="ucoin" className="cursor-pointer">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xl w-6 text-center font-bold">{NETWORK_CONFIG.ucoin.icon}</span>
                <div className="flex flex-col flex-1">
                  <span className="font-medium text-sm">Ucoin First</span>
                  <span className="text-xs text-muted-foreground">{NETWORK_CONFIG.ucoin.subtitle}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm font-mono tabular-nums text-muted-foreground">
                  {getDisplayBalance('ucoin')}
                </span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-muted text-muted-foreground border-border">
                  BETA
                </Badge>
              </div>
            </DropdownMenuRadioItem>

            {/* — Fiat Section — */}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t`Fiat`}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {FIAT_CURRENCIES.map((fiat) => {
              const isActive = activeFiat.has(fiat);
              const isActivating = activatingCurrency === fiat;
              return (
                <DropdownMenuRadioItem
                  key={fiat}
                  value={fiat}
                  className={cn('cursor-pointer', !isActive && 'opacity-50')}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl w-6 text-center">{NETWORK_CONFIG[fiat].icon}</span>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium text-sm">{FIAT_DROPDOWN_LABELS[fiat]}</span>
                      <span className="text-xs text-muted-foreground truncate">{NETWORK_CONFIG[fiat].subtitle}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-auto shrink-0">
                    {isActive && (
                      <span className="text-sm font-mono tabular-nums text-muted-foreground">
                        {getDisplayBalance(fiat)}
                      </span>
                    )}
                    {!isActive && (
                      <div
                        className="relative z-10"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        {isActivating ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Switch
                            checked={false}
                            onCheckedChange={(checked) => handleActivateFiat(fiat, checked)}
                            className="scale-75"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>

          {/* — Footer — */}
          <DropdownMenuSeparator />
          <div className="px-2 py-2">
            <p className="text-[10px] text-muted-foreground">
              {t`Actual`}: <span className="font-medium text-foreground">{NETWORK_CONFIG[networkPreference].label}</span>
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Sending Payment
function SendingContent({ data }: { data: IslandData }) {
  const { t } = useLingui();
  const isMobile = useMobile();
  return (
    <>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <ArrowUpRight className="w-5 h-5 text-white" />
      </motion.div>
      <div className="flex-1 flex flex-col items-start">
        <span className={cn('font-semibold text-white', isMobile ? 'text-sm' : 'text-base')}>
          {t`Enviando`} <span className="font-mono tabular-nums">{data.currency} {data.amount?.toLocaleString()}</span>
        </span>
        {data.recipient && (
          <span className="text-xs text-white/70">
            {t`a ${data.recipient}`}
          </span>
        )}
      </div>
      {data.progress !== undefined && (
        <span className="text-sm text-white font-medium">
          {data.progress}%
        </span>
      )}
    </>
  );
}

// Receiving Payment
function ReceivingContent({ data }: { data: IslandData }) {
  const { t } = useLingui();
  const isMobile = useMobile();
  return (
    <>
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ArrowDownLeft className="w-5 h-5 text-white" />
      </motion.div>
      <div className="flex-1 flex flex-col items-start">
        <span className={cn('font-semibold text-white', isMobile ? 'text-sm' : 'text-base')}>
          {t`Recibiendo`} <span className="font-mono tabular-nums">{data.currency} {data.amount?.toLocaleString()}</span>
        </span>
        {data.sender && (
          <span className="text-xs text-white/70">
            {t`de ${data.sender}`}
          </span>
        )}
      </div>
    </>
  );
}

// Converting Currency
function ConvertingContent({ data }: { data: IslandData }) {
  const isMobile = useMobile();
  return (
    <>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <RefreshCw className="w-5 h-5 text-white" />
      </motion.div>
      <div className="flex-1 flex flex-col items-center">
        <span className={cn('font-semibold text-white', isMobile ? 'text-sm' : 'text-base')}>
          {data.fromCurrency} → {data.toCurrency}
        </span>
        {data.amount && (
          <span className="text-xs text-white/70 font-mono tabular-nums">
            {data.amount.toLocaleString()}
          </span>
        )}
      </div>
    </>
  );
}

// Generic Processing
function ProcessingContent({ data }: { data: IslandData }) {
  const { t } = useLingui();
  const isMobile = useMobile();
  return (
    <>
      <Loader2 className="w-5 h-5 text-white animate-spin" />
      <span className={cn('font-semibold text-white', isMobile ? 'text-sm' : 'text-base')}>
        {data.message || t`Un momento...`}
      </span>
    </>
  );
}

// Success State
function SuccessContent({ message, amount, currency }: { message?: string; amount?: number; currency?: string }) {
  const isMobile = useMobile();
  if (amount !== undefined && currency) {
    return (
      <>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Check className="w-5 h-5 text-white" />
        </motion.div>
        <span className={cn(
          'font-mono tabular-nums font-semibold text-white',
          isMobile ? 'text-base' : 'text-lg',
        )}>
          {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {currency}
        </span>
      </>
    );
  }
  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Check className="w-5 h-5 text-white" />
      </motion.div>
      <span className={cn('font-semibold text-white', isMobile ? 'text-sm' : 'text-base')}>
        {message || `Listo`}
      </span>
    </>
  );
}

// Step Progress State
function StepProgressContent({ data }: { data: IslandData }) {
  const { t } = useLingui();
  const isMobile = useMobile();
  const stepNum = data.stepNumber || 1;
  const totalSteps = data.totalSteps || 1;
  return (
    <>
      <div className="flex items-center gap-2">
        <div className={cn(
          'flex items-center justify-center rounded-full bg-white/15',
          isMobile ? 'h-6 w-6' : 'h-7 w-7'
        )}>
          <span className="text-xs font-bold text-white">
            {stepNum}
          </span>
        </div>
        <div className="flex-1 flex flex-col items-start">
          <span className={cn('font-semibold text-white', isMobile ? 'text-xs' : 'text-sm')}>
            {data.stepName || t`Un momento...`}
          </span>
          <span className="text-[10px] text-white/70">
            {t`Paso ${stepNum} de ${totalSteps}`}
          </span>
        </div>
      </div>
      {data.progress !== undefined && (
        <div className="ml-2">
          <span className="text-xs text-white font-medium">
            {data.progress}%
          </span>
        </div>
      )}
    </>
  );
}

// Error State
function ErrorContent({ message }: { message?: string }) {
  const { t } = useLingui();
  const isMobile = useMobile();
  return (
    <>
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <X className="w-5 h-5 text-white" />
      </motion.div>
      <span className={cn('font-semibold text-white', isMobile ? 'text-sm' : 'text-base')}>
        {message || t`Algo salió mal`}
      </span>
    </>
  );
}

