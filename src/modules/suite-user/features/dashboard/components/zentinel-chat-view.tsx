/**
 * ZentinelChatView
 *
 * Interior of the Zentinel phone-shaped shell on the dashboard. The
 * chat is now agent-first: instead of routing transactional intents
 * through hard-coded shortcut buttons, the user converses with the
 * Zentinel agent (real backend), and the agent decides which tool to
 * invoke. Pre-prompt chips above the composer surface the most common
 * intents as conversational seeds — they call `send_message(text)` and
 * go through the regular `useZentinelChat` lifecycle, so the agent can
 * train on the same phrasing real users produce.
 *
 * State machine
 * -------------
 *    'chat'         → conversation + composer + pre-prompt chips
 *                     (chips visible only on the empty welcome state).
 *    'receive'      → <ReceiveFlow />, rim-stripped. Activated by the
 *                     agent emitting a `pending_action` for a deposit.
 *    'send'         → <SendFlow />,    rim-stripped. Same trigger.
 *    'beneficiary'  → <SendFlow />, store preloaded to
 *                     `sendStep = 'create-beneficiary'`. Same trigger.
 *
 * Today the only place these sub-views are entered is via the
 * back-button on the floating overlay (when the agent has navigated
 * the user there). The legacy direct entry from `<GradientCircleButton>`
 * shortcuts was removed in favour of the conversational pre-prompts
 * (mejora 10) — the agent decides routing, not the UI.
 *
 * A view switch is a pure local state change with a 150ms fade via
 * AnimatePresence; no URL side-effects.
 *
 * Why we strip the flows' internal rim
 * ------------------------------------
 * `ReceiveFlow` and `SendFlow` paint their own `bg-brand-gradient p-px`
 * border and cap at `max-w-[560px]`. Rendering them inside the phone's
 * 390px gradient frame would produce a double rim and horizontal
 * overflow. We cancel both via className overrides (`!bg-transparent
 * !p-0 !max-w-none`); `twMerge` guarantees our later classes win
 * without touching the flow components themselves (R1 of the brief
 * forbids editing them).
 *
 * Reuse boundary
 * --------------
 * The real Zentinel engine (backend REST + SSE) lives under
 * `sovy/hooks/use-zentinel-*` — co-located with the legacy mock so
 * all chat code stays in one feature module. The ESLint-restricted
 * import disable below is scoped to those Zentinel primitives plus
 * the reused `<ChatInput>` component; we consume via absolute paths
 * because the suite-user config forbids cross-feature imports by
 * default. The legacy `useSovyMock` is only invoked here when
 * `VITE_ZENTINEL_USE_MOCK=true` (QA escape hatch); the standalone
 * `/suite/zentinel` page that previously consumed it was removed
 * in favor of opening this view inline from the dashboard.
 */

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowUpRight,
  Coins,
  List,
  Loader2,
  MoreVertical,
  Plus,
  Trash2,
  TrendingUp,
  UserPlus,
  Wallet,
  Wifi,
  WifiOff,
  X,
  type IconComponent,
} from '@/shared/components/animated-icons';
/* eslint-disable import/no-restricted-paths -- cross-feature reuse of the Zentinel chat engine; see file header for rationale */
import { ChatInput } from '@/modules/suite-user/features/sovy/components/ChatInput';
import { ZentinelChatMessage } from '@/modules/suite-user/features/sovy/components/zentinel-chat-message';
import { ZentinelConfirmationCard } from '@/modules/suite-user/features/sovy/components/zentinel-confirmation-card';
import { useZentinelChat } from '@/modules/suite-user/features/sovy/hooks/use-zentinel-chat';
import { useZentinelPendingAction } from '@/modules/suite-user/features/sovy/hooks/use-zentinel-pending-action';
import { useZentinelChatStore } from '@/modules/suite-user/features/sovy/stores/use-zentinel-chat-store';
/* eslint-enable import/no-restricted-paths */
import { useZentinelAuth } from '@/shared/hooks/use-zentinel-auth';
import {
  useZentinelHealth,
  ZENTINEL_HEALTH_QUERY_KEY,
} from '@/shared/hooks/use-zentinel-health';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';
import { isDevMockMode } from '@/shared/lib/dev-config';
import { ReceiveFlow } from '../features/receive';
import { SendFlow } from '../features/send';
import { useDynamicIslandStore } from '../stores/useDynamicIslandStore';

type View = 'chat' | 'receive' | 'send' | 'beneficiary';

export interface ZentinelChatViewProps {
  /** Called when the whole phone should close (floating X overlay). */
  onClose: () => void;
  /**
   * Wallet id forwarded from the dashboard. The real chat view no
   * longer consumes it (the legacy `useWalletTransactions` shortcut
   * was replaced by conversational pre-prompts that go through the
   * agent), but the prop is preserved on the public interface because
   * the QA-only mock variant (`zentinel-chat-view-mock.tsx`) still
   * needs it for its `<InlineHistoryList>` child. Keeping the shape
   * stable means the dashboard call-site doesn't fork.
   */
  walletId: string | undefined;
}

/**
 * QA escape hatch: when `VITE_ZENTINEL_USE_MOCK=true`, the view swaps
 * itself for the legacy `useSovyMock`-powered shell. We guard behind
 * `lazy()` so the mock code never enters the prod bundle (Vite only
 * fetches the dynamic chunk when the flag is truthy at module eval).
 */
const USE_MOCK = isDevMockMode();

const LazyMockChatView = USE_MOCK
  ? lazy(() =>
      // Intentional lazy to keep the mock out of the default chunk.
      import('./zentinel-chat-view-mock').then((m) => ({
        default: m.ZentinelChatViewMock,
      })),
    )
  : null;

export function ZentinelChatView(props: ZentinelChatViewProps) {
  if (LazyMockChatView) {
    return (
      <Suspense fallback={<div className="flex-1" />}>
        <LazyMockChatView {...props} />
      </Suspense>
    );
  }
  return <ZentinelChatViewReal {...props} />;
}

/**
 * Connection status pill — lives in the floating top-right cluster
 * alongside the kebab menu and the close (X) button. Four states:
 *
 *  - 'connected'    → success dot (subtle pulse), Wifi icon.
 *  - 'connecting'   → warning dot (pulse), spinning Loader2.
 *  - 'limited'      → warning dot (pulse), Wifi icon, "Sesión limitada"
 *                     (Soberana token missing — Zentinel can chat but
 *                     not touch live data).
 *  - 'offline'      → destructive dot (no pulse), WifiOff icon.
 *                     Interactive: tap fires `onReconnect`, the pill
 *                     becomes a real `<button>` with focus ring so
 *                     keyboard users can recover the session without
 *                     scrolling to the in-flow banner.
 *
 * The pill announces changes via `role="status"` + `aria-live="polite"`
 * (or `aria-label` on the button variant) so screen readers narrate
 * connection drops without interrupting the user's flow. Visual chrome
 * (`bg-card/80 backdrop-blur-sm border border-border/50 h-8`) is
 * shared with the other floating controls so the cluster reads as one
 * piece. Co-located here because no other view consumes it.
 */
type ZentinelConnectionState =
  | 'connected'
  | 'connecting'
  | 'limited'
  | 'offline';

interface ZentinelStatusPillProps {
  state: ZentinelConnectionState;
  reducedMotion: boolean;
  /**
   * Fired when the pill is interactive (currently only `state === 'offline'`).
   * Optional: when omitted, the pill always renders as a `<div role="status">`.
   */
  onReconnect?: () => void;
}

function ZentinelStatusPill({
  state,
  reducedMotion,
  onReconnect,
}: ZentinelStatusPillProps) {
  const { t } = useLingui();

  const meta: Record<
    ZentinelConnectionState,
    {
      label: string;
      dot: string;
      icon: 'wifi' | 'wifi-off' | 'loader';
      pulse: boolean;
      title?: string;
    }
  > = {
    connected: {
      label: t`Conectado`,
      dot: 'bg-success',
      icon: 'wifi',
      pulse: true,
    },
    connecting: {
      label: t`Conectando…`,
      dot: 'bg-warning',
      icon: 'loader',
      pulse: true,
    },
    limited: {
      label: t`Sesión limitada`,
      dot: 'bg-warning',
      icon: 'wifi',
      pulse: true,
      title: t`Conectado a Zentinel, pero faltan permisos para tu tesorería. Inicia sesión contra Soberana para habilitar beneficiarios, cotizaciones y transferencias.`,
    },
    offline: {
      label: t`Sin conexión`,
      dot: 'bg-destructive',
      icon: 'wifi-off',
      pulse: false,
      title: t`Toca para reconectar`,
    },
  };

  const { label, dot, icon, pulse, title } = meta[state];
  const interactive = state === 'offline' && !!onReconnect;

  // Shared chrome: same `bg-card/80 backdrop-blur-sm border-border/50
  // h-8` as the other floating controls so the top-right cluster
  // reads as a single piece. Padding kept tight since the pill carries
  // a dot + icon + label inline.
  const chrome =
    'inline-flex items-center gap-1.5 h-8 rounded-full border border-border/50 bg-card/80 backdrop-blur-sm px-2.5 text-[11px] text-muted-foreground';

  const inner = (
    <>
      <span
        className={cn(
          'block h-2 w-2 rounded-full',
          dot,
          pulse && !reducedMotion && 'animate-pulse',
        )}
        aria-hidden
      />
      {icon === 'wifi' && <Wifi className="h-3 w-3" aria-hidden />}
      {icon === 'wifi-off' && <WifiOff className="h-3 w-3" aria-hidden />}
      {icon === 'loader' && (
        <Loader2
          className={cn('h-3 w-3', !reducedMotion && 'animate-spin')}
          aria-hidden
        />
      )}
      <span className="font-medium">{label}</span>
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onReconnect}
        title={title}
        aria-label={t`Reconectar con Zentinel`}
        className={cn(
          chrome,
          'transition-colors duration-150 hover:bg-card hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        )}
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      title={title}
      className={chrome}
    >
      {inner}
    </div>
  );
}

/**
 * Pre-prompt chips — horizontal scroll-row of conversational seeds
 * shown above the composer on the empty welcome state. Tapping a chip
 * forwards the *literal* text to the agent via `onSelect` (which the
 * view wires to `send_message`), so the backend sees real user
 * phrasing and can train its routing on it. We deliberately avoid
 * hard-coding sub-view activation here (the agent decides — that's
 * the value of having a conversational layer).
 *
 * Layout (P9/P10 of soberana-ux): horizontal overflow with `peek` so
 * the last chip is partially visible at the right edge — implicit
 * affordance that more content exists. `whitespace-nowrap` prevents
 * line-breaking inside individual chips.
 *
 * Brand discipline: chips are NOT primary CTAs, so no
 * `bg-brand-gradient` here — the brand gradient stays reserved for
 * the send button and the assistant avatar (mejora 4).
 */
interface PrePrompt {
  id: string;
  icon: IconComponent;
  text: string;
}

interface ZentinelPrePromptChipsProps {
  disabled?: boolean;
  onSelect: (text: string) => void;
}

function ZentinelPrePromptChips({
  disabled,
  onSelect,
}: ZentinelPrePromptChipsProps) {
  const { t } = useLingui();

  const prompts: ReadonlyArray<PrePrompt> = [
    { id: 'tx', icon: List, text: t`Quiero ver mis últimos movimientos` },
    {
      id: 'beneficiary',
      icon: UserPlus,
      text: t`Quiero agregar un nuevo beneficiario`,
    },
    {
      id: 'eur-account',
      icon: Wallet,
      text: t`Quiero crear una cuenta en euros`,
    },
    {
      id: 'send',
      icon: ArrowUpRight,
      text: t`Quiero hacer un envío internacional`,
    },
    { id: 'rates', icon: TrendingUp, text: t`¿Cuál es el tipo de cambio hoy?` },
    { id: 'balance', icon: Coins, text: t`Muéstrame mi saldo total` },
  ];

  return (
    <div className="shrink-0 px-3 pb-2 pt-1 border-t border-border/30">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-2 px-1">
        {t`Sugerencias`}
      </p>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3 pb-1">
        {prompts.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.text)}
            disabled={disabled}
            className={cn(
              'shrink-0 inline-flex items-center gap-1.5',
              'rounded-full border border-border/50 bg-card',
              'px-3 py-1.5 text-[12px] text-foreground',
              'hover:bg-muted transition-colors duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            <p.icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="whitespace-nowrap">{p.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// `walletId` is preserved on the public props (the mock variant uses
// it) but the real view no longer consumes it — we destructure only
// what we need so the unused prop simply rests on the props object.
function ZentinelChatViewReal({ onClose }: ZentinelChatViewProps) {
  const { t } = useLingui();
  const [view, setView] = useState<View>('chat');
  // `useReducedMotion` → null on SSR, boolean on client. We collapse to
  // `false` so the first client render already matches the user's OS
  // setting and the logo never double-renders with a motion swap.
  const reducedMotion = useReducedMotion() ?? false;

  const {
    messages,
    send_message,
    is_streaming,
    error: chat_error,
  } = useZentinelChat();
  const {
    pending_action,
    confirm,
    cancel,
    is_executing,
    time_left_ms,
    error: action_error,
  } = useZentinelPendingAction();
  const add_message = useZentinelChatStore((s) => s.add_message);
  const pending_message_id = useZentinelChatStore(
    (s) => s.pending_message_id,
  );
  const rate_limit = useZentinelChatStore((s) => s.rate_limit);
  const set_rate_limit = useZentinelChatStore((s) => s.set_rate_limit);
  const reset_chat = useZentinelChatStore((s) => s.reset);

  const queryClient = useQueryClient();
  const { is_ready, is_loading: health_loading } = useZentinelHealth();
  const { is_authenticated, is_authenticating, refresh: refresh_zentinel_auth } =
    useZentinelAuth();
  // Zentinel can answer general questions without it, but every tool
  // that touches live data (beneficiaries, quotes, transfers) is
  // forwarded via `X-Soberana-Token` → the Soberana access_token from
  // the auth store. If it's null, the agent will refuse those tools
  // and reply "no detecto sesión activa". We surface a banner so the
  // user knows why before even typing.
  const soberana_token = useAuthStore((s) => s.token);
  const soberana_missing =
    is_authenticated && is_ready && !soberana_token;

  // Friendly connection state derived from the same auth/health hooks
  // the legacy dev strip used to dump as a `font-mono` blob. Order
  // matters: offline > connecting > limited > connected so the pill
  // surfaces the most actionable signal first.
  const connection_state: ZentinelConnectionState = (() => {
    if (!is_authenticated && !is_authenticating && !health_loading)
      return 'offline';
    if (health_loading || is_authenticating || !is_ready || !is_authenticated)
      return 'connecting';
    if (soberana_missing) return 'limited';
    return 'connected';
  })();

  const setMode = useDynamicIslandStore((s) => s.setMode);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const [is_reconnecting, setIsReconnecting] = useState(false);

  // Seed an initial assistant greeting once per session. We keep it
  // local (no backend turn required) so the panel isn't empty when the
  // user opens the phone frame. The real agent takes over on the first
  // user message.
  useEffect(() => {
    if (!isInitialized.current && messages.length === 0) {
      add_message({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: t`¡Hola! Soy Zentinel. Puedo ayudarte con tu tesorería, beneficiarios y pagos. ¿Qué necesitas?`,
        timestamp: new Date(),
        status: 'sent',
      });
      isInitialized.current = true;
    } else if (messages.length > 0) {
      isInitialized.current = true;
    }
  }, [add_message, messages.length, t]);

  // Rate-limit banner: auto-countdown so the composer re-enables once
  // the backend-provided retry_after elapses. We hold onto the visible
  // countdown locally so the banner doesn't flicker when the store
  // gets re-set by a subsequent 200 response with fresher headers.
  const [rl_seconds, setRlSeconds] = useState<number | null>(null);
  useEffect(() => {
    if (!rate_limit?.retry_after) {
      setRlSeconds(null);
      return;
    }
    setRlSeconds(rate_limit.retry_after);
    const id = window.setInterval(() => {
      setRlSeconds((s) => {
        if (s == null || s <= 1) {
          window.clearInterval(id);
          // Clear the store entry once the window elapses so a
          // stale `retry_after` doesn't linger between turns.
          set_rate_limit(null);
          return null;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [rate_limit, set_rate_limit]);

  useEffect(() => {
    if (view !== 'chat') return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, view]);

  const handleBackToChat = useCallback(() => {
    setMode('idle');
    setView('chat');
  }, [setMode]);

  const handleSendMessage = useCallback(
    (content: string) => {
      // The hook owns its own lifecycle (user bubble, placeholder,
      // stream, error toast, plan extraction). We just forward.
      void send_message(content);
    },
    [send_message],
  );

  // Recovery flow: re-trigger the health probe AND refresh the JWT.
  // We invalidate first so the health-check is in-flight before we
  // attempt to refresh; if the server is back up, the pill flips to
  // 'connecting' → 'connected' on its own. If both calls fail, we
  // stay on the offline state and the user can re-tap (no toast — the
  // banner + pill already communicate failure visually).
  const handleReconnect = useCallback(async () => {
    if (is_reconnecting) return;
    setIsReconnecting(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: ZENTINEL_HEALTH_QUERY_KEY,
      });
      await refresh_zentinel_auth();
    } finally {
      setIsReconnecting(false);
    }
  }, [is_reconnecting, queryClient, refresh_zentinel_auth]);

  // "Nueva conversación" — wipe the message log AND reset the
  // initialised flag so the seed greeting effect re-fires next render.
  // "Borrar chat" reuses the same store reset but leaves
  // `isInitialized.current = true` so the panel stays empty (intent:
  // "forget everything, start later"). The two share a verb but
  // intentionally diverge on the post-reset state.
  const handleNewConversation = useCallback(() => {
    reset_chat();
    isInitialized.current = false;
  }, [reset_chat]);

  const handleClearChat = useCallback(() => {
    reset_chat();
  }, [reset_chat]);

  // Empty-state only — pre-prompt chips appear above the composer
  // until the user has had any exchange with the agent (or one is
  // streaming). `<= 1` covers the seed greeting injected in the mount
  // effect above.
  const show_pre_prompts =
    view === 'chat' &&
    messages.length <= 1 &&
    !is_streaming &&
    !pending_action &&
    is_ready &&
    is_authenticated;
  const composer_disabled =
    is_streaming ||
    !!pending_action ||
    rl_seconds != null ||
    !is_ready ||
    !is_authenticated;
  const composer_placeholder = pending_action
    ? t`Confirma o cancela el plan pendiente…`
    : rl_seconds != null
      ? t`Límite alcanzado. Espera ${rl_seconds}s.`
      : !is_authenticated
        ? t`Conectando con Zentinel…`
        : t`Pregúntame sobre tu tesorería…`;
  // Banner is visible whenever the chat view can't reach the agent —
  // either we're still negotiating (loading / authenticating) or we
  // already failed and the user needs an actionable recovery path.
  // Mejora 8 turns this banner into a "Reconectar" affordance when in
  // the failed state.
  const show_connection_banner = view === 'chat' && !is_ready;
  const combined_error = chat_error || action_error;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {/*
          Floating controls — back (only on a sub-view) on the left,
          and a top-right cluster with [status pill] [kebab menu]
          [close]. No header, no name, no avatar: the first assistant
          bubble ("¡Hola! Soy Zentinel…") already greets the user and
          identifies the agent, so a separate identity strip is pure
          decoration (P12 of soberana-ux — "no decoration without
          purpose"). All three controls share the same translucent
          card-chip chrome (`bg-card/80 backdrop-blur-sm h-8 border
          border-border/50`) so the cluster reads as one piece. The
          pill is hidden on sub-views (Receive/Send/Beneficiary) — the
          context bar of those flows already communicates connection
          state implicitly. `rounded-full` is the iOS sheet-close
          pattern, an explicit exception to §3.3's "buttons should be
          rounded-lg" rule which targets rectangular text buttons, not
          icon affordances.
        */}
        {view !== 'chat' && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 left-2 z-10 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card border border-border/50"
            onClick={handleBackToChat}
            aria-label={t`Volver al chat`}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
          {view === 'chat' && (
            <ZentinelStatusPill
              state={connection_state}
              reducedMotion={reducedMotion}
              onReconnect={() => void handleReconnect()}
            />
          )}
          {view === 'chat' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card border border-border/50"
                  aria-label={t`Más opciones`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={handleNewConversation}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t`Nueva conversación`}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleClearChat}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t`Borrar chat`}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card border border-border/50"
            onClick={onClose}
            aria-label={t`Cerrar`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {view === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute inset-0 flex flex-col"
            >
              <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-12 pb-3 space-y-2.5">
                {/* Connection banner. Two flavours:
                    - In-flight (loading / authenticating / reconnecting):
                      passive copy + spinner, no action.
                    - Failed (probe finished, still not ready): action-
                      able banner with a "Reconectar" outline button
                      that re-fires the health probe + JWT refresh.
                    Failure stays visible until the user retries; we
                    deliberately avoid a toast (mejora 8 — banner +
                    pill already communicate the state). */}
                {show_connection_banner && (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/40 px-3 py-2">
                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      {is_authenticating || health_loading || is_reconnecting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>{t`Conectando con Zentinel…`}</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-3.5 w-3.5 text-destructive" />
                          <span>{t`Zentinel no está disponible.`}</span>
                        </>
                      )}
                    </div>
                    {!is_authenticating && !health_loading && !is_reconnecting && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-[12px]"
                        onClick={() => void handleReconnect()}
                      >
                        {t`Reconectar`}
                      </Button>
                    )}
                  </div>
                )}

                {soberana_missing && (
                  <div className="text-[11px] text-warning bg-warning/10 px-2.5 py-1.5 rounded-md border border-warning/20 leading-snug">
                    {t`Sesión Soberana ausente. Zentinel puede responder preguntas generales, pero no podrá acceder a tus beneficiarios, cotizaciones ni transferencias hasta que inicies sesión contra Soberana.`}
                  </div>
                )}

                {messages.map((message) => {
                  const is_pending_host =
                    pending_message_id === message.id &&
                    !!pending_action &&
                    !message.plan_resolution;
                  return (
                    <div key={message.id} className="space-y-2">
                      <ZentinelChatMessage message={message} />
                      {is_pending_host && pending_action && (
                        <ZentinelConfirmationCard
                          action={pending_action}
                          time_left_ms={time_left_ms}
                          is_executing={is_executing}
                          error={action_error}
                          onConfirm={() => void confirm()}
                          onCancel={() => void cancel()}
                        />
                      )}
                    </div>
                  );
                })}

                {rl_seconds != null && (
                  <div className="text-[11px] text-warning bg-warning/10 px-2.5 py-1.5 rounded-md border border-warning/20">
                    {t`Has superado el límite. Espera ${rl_seconds}s.`}
                  </div>
                )}

                {combined_error && (
                  <div className="text-[11px] text-destructive bg-destructive/10 px-2.5 py-1.5 rounded-md border border-destructive/20">
                    {combined_error}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {show_pre_prompts && (
                <ZentinelPrePromptChips
                  disabled={composer_disabled}
                  onSelect={handleSendMessage}
                />
              )}

              <div className="shrink-0">
                <ChatInput
                  onSend={handleSendMessage}
                  disabled={composer_disabled}
                  placeholder={composer_placeholder}
                />
              </div>
            </motion.div>
          )}

          {view === 'receive' && (
            <motion.div
              key="receive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute inset-0 overflow-y-auto px-3 pt-12 pb-4"
            >
              {/* No onClose: the floating back (ArrowLeft) and close
                  (X) overlays at the top of the shell already provide
                  both affordances. A second close inside the embedded
                  flow would be visually redundant. */}
              <ReceiveFlow
                className={cn(
                  // Override internal rim + max-width so the flow
                  // reads as native content inside the phone frame.
                  'bg-transparent! p-0! max-w-none!',
                )}
              />
            </motion.div>
          )}

          {view === 'send' && (
            <motion.div
              key="send"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute inset-0 overflow-y-auto px-3 pt-12 pb-4"
            >
              <SendFlow
                className={cn('bg-transparent! p-0! max-w-none!')}
              />
            </motion.div>
          )}

          {view === 'beneficiary' && (
            <motion.div
              key="beneficiary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute inset-0 overflow-y-auto px-3 pt-12 pb-4"
            >
              <SendFlow
                className={cn('bg-transparent! p-0! max-w-none!')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
