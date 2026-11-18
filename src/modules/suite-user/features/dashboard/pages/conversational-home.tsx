import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup, type Transition } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  // ZENTINEL DISABLED 2026-10-06 — Bot icon only used by the commented Zentinel button below.
  // Local demo re-enable (2026-11-12): restored for the demo.
  Bot,
} from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import { useMobile } from '@/shared/hooks/use-mobile';
import { useLingui } from '@lingui/react/macro';
import { useActiveWallet } from '@/shared/hooks/use-active-wallet';
import { useWalletBalance } from '@/shared/hooks/use-wallet-balance';
import { getWalletPairLabel, resolveWalletSelection } from '@/shared/lib/receive-wallet';
import { useDisplayName } from '@/shared/hooks/use-display-name';
import { useBridgeKYC } from '@/modules/suite-user/features/account';
import { KYCBanner } from '../components/KYCBanner';
import { CustomerProviderRequirementsBanner } from '../components/provider-requirements/customer-provider-requirements-banner';
import { MfaSuggestionBanner } from '../components/mfa-suggestion-banner';
import { DynamicIsland } from '../components/dynamic-island';
import { useDynamicIslandStore } from '../stores/useDynamicIslandStore';
import { GradientCircleButton } from '../components/GradientCircleButton';
import { ReceiveFlow } from '../features/receive';
import { SendFlow } from '../features/send';
// ZENTINEL DISABLED 2026-10-06: service is being decommissioned. The action-row
// button below was already commented out; this stops the import chain from
// pulling the sovy/zentinel modules (and their module-level side effects) into
// the dashboard bundle.
// Local demo re-enable (2026-11-12): restored for the demo; the view falls
// back to its mock shell in dev mock mode, so no backend is needed.
import { ZentinelChatView } from '../components/zentinel-chat-view';
import { VirtualCard } from '../components/virtual-card';
import { DashboardTutorial } from '../components/tutorial';
import { useTutorialStore } from '../stores/useTutorialStore';

/**
 * Unified view of "which flow is open right now". The DI store owns
 * both `receive` and `send` state (both inline flows are narrated
 * by the island), while `zentinel` is the lightweight local flow
 * that replaces the whole dashboard stack with a phone-shaped chat
 * surface — no VirtualCard, no action row, just the DI as a header
 * and the chat as body.
 */
type ActiveFlow = 'idle' | 'receive' | 'send' | 'zentinel';

/**
 * Entrance choreography for the three hero surfaces (VirtualCard,
 * Dynamic Island, action row). The goal is a single unified
 * "brighten into place" — all three fade up in parallel, without
 * any vertical translation. Earlier revisions animated `layout`
 * from unmounted to mounted, which Framer resolves as a slide-from-
 * above; dropping `layout` on these three surfaces removes that
 * artefact. They don't change size or position between idle and
 * flow-open, so `layout` wasn't buying us anything anyway.
 *
 * The glow is kept deliberately faint (0.12 alpha, 10px blur) and
 * short (~600ms hold, 900ms total): it should read as a breath,
 * not as a spotlight. The previous value (0.28 alpha, 18px, 1.1s)
 * was reported as too showy; this is the quieter pass.
 */
const getEntrance = (isMobile: boolean) => ({
  initial: { opacity: 0 },
  animate: isMobile
    ? { opacity: 1 }
    : {
        opacity: 1,
        filter: [
          'drop-shadow(0 0 0px rgba(255,255,255,0))',
          'drop-shadow(0 0 10px rgba(255,255,255,0.12))',
          'drop-shadow(0 0 0px rgba(255,255,255,0))',
        ],
      },
  transition: { duration: 0.9, ease: 'easeOut' } as Transition,
});

const formatBalance = (amount: string | undefined): string => {
  if (!amount) return '0.00';
  const num = parseFloat(amount);
  if (Number.isNaN(num)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/** Bottom clearance of an open Receive/Send flow under the mobile dock. */
const FLOW_DOCK_CLEARANCE = 'max-md:pb-[calc(6rem+env(safe-area-inset-bottom))]';

export default function ConversationalHome() {
  const { t } = useLingui();
  const isMobile = useMobile();

  const { full: userName } = useDisplayName();
  const {
    wallets,
    defaultWallet,
    activeWallet,
    selectedWalletId,
    setSelectedWalletId,
    isLoading: walletsLoading,
  } = useActiveWallet();
  const { isKYCApproved } = useBridgeKYC();

  const walletSelection = useMemo(
    () => resolveWalletSelection(wallets, defaultWallet),
    [wallets, defaultWallet]
  );
  const primaryWallet = activeWallet ?? walletSelection.mainWallet ?? null;
  const secondaryWallet = walletSelection.secondaryWallets[0] ?? null;

  const { balance, isLoading: balanceLoading } = useWalletBalance(primaryWallet?.id);

  const isBalanceLoading = walletsLoading || balanceLoading;

  const setIslandState = useDynamicIslandStore((s) => s.setIslandState);
  const mode = useDynamicIslandStore((s) => s.mode);
  const setMode = useDynamicIslandStore((s) => s.setMode);
  const openSendWithFilter = useDynamicIslandStore((s) => s.openSendWithFilter);
  const [localFlow, setLocalFlow] = useState<'idle' | 'zentinel'>('idle');

  const activeFlow: ActiveFlow =
    mode === 'receive' ? 'receive' : mode === 'send' ? 'send' : localFlow;
  const isFlowOpen = activeFlow !== 'idle';
  const isZentinelOpen = localFlow === 'zentinel';

  // Idle copy rotation for the shared dashboard composition.
  const [idleIndex, setIdleIndex] = useState(0);
  useEffect(() => {
    if (activeFlow !== 'idle') {
      setIdleIndex(0);
      return;
    }
    const id = window.setInterval(() => {
      setIdleIndex((i) => (i + 1) % 2);
    }, 6000);
    return () => window.clearInterval(id);
  }, [activeFlow]);

  const idleMessage =
    activeFlow === 'idle'
      ? idleIndex === 0
        ? { bold: t`Bienvenido a Soberana.`, muted: undefined }
        : { bold: t`Selecciona.`, muted: t`Qué quieres hacer` }
      : isZentinelOpen
        ? { bold: t`Chatea con Zentinel`, muted: undefined }
        : undefined;

  const handleReceiveClick = useCallback(() => {
    setLocalFlow('idle');
    setMode('receive');
    setIslandState('idle');
  }, [setIslandState, setMode]);

  const handleSendClick = useCallback(() => {
    setLocalFlow('idle');
    setMode('send');
    setIslandState('idle');
  }, [setIslandState, setMode]);

  // ZENTINEL DISABLED 2026-10-06 — only referenced by the commented button.
  // Local demo re-enable (2026-11-12): restored for the demo.
  const handleZentinelClick = useCallback(() => {
    // Zentinel commandeers the whole dashboard stack. If a receive
    // or send flow was open, kill it so the layout can pivot to the
    // phone shell cleanly.
    if (mode !== 'idle') setMode('idle');
    setLocalFlow('zentinel');
    setIslandState('idle');
  }, [mode, setIslandState, setMode]);

  const handleDone = useCallback(() => {
    // Used by the Zentinel shell X / Escape: also resets any
    // transactional sub-view state ReceiveFlow/SendFlow may have
    // seeded on the DI store while running inside the phone.
    setMode('idle');
    setLocalFlow('idle');
    setIslandState('idle');
  }, [setIslandState, setMode]);

  const handleCloseFlow = useCallback(() => {
    setLocalFlow('idle');
    setMode('idle');
    setIslandState('idle');
  }, [setIslandState, setMode]);

  const handleCashout = useCallback(
    (currency: string) => {
      setLocalFlow('idle');
      openSendWithFilter(currency);
      setIslandState('idle');
    },
    [setIslandState, openSendWithFilter]
  );

  // ── Tutorial: execute pending flow actions ─────────────────────────
  // DashboardTutorial sets `pendingAction` in the tutorial store to open or
  // close real flows during the tour. This component owns the handlers, so it
  // processes the action and immediately clears it.
  const tutorialPendingAction = useTutorialStore((s) => s.pendingAction);
  const tutorialSetPendingAction = useTutorialStore((s) => s.setPendingAction);
  useEffect(() => {
    if (!tutorialPendingAction) return;
    if (tutorialPendingAction === 'open-receive' && primaryWallet) {
      handleReceiveClick();
    } else if (tutorialPendingAction === 'open-send' && primaryWallet) {
      handleSendClick();
    } else if (tutorialPendingAction === 'close-flow') {
      handleCloseFlow();
    }
    tutorialSetPendingAction(null);
  }, [
    tutorialPendingAction,
    handleReceiveClick,
    handleSendClick,
    handleCloseFlow,
    tutorialSetPendingAction,
  ]);

  const balanceCurrency = balance?.currency ?? primaryWallet?.currency ?? '—';
  const balanceAmount = formatBalance(balance?.available_balance);

  const walletAddress = primaryWallet?.address ?? null;

  // ── Auto-scroll to flow when opened ───────────────────────────────
  const flowRef = useRef<HTMLDivElement | null>(null);
  const actionRowRef = useRef<HTMLDivElement | null>(null);
  const localRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const diRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeFlow === 'idle') return;
    const target = activeFlow === 'zentinel' ? localRef.current : flowRef.current;
    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }, [activeFlow]);

  // ── Layout order ──────────────────────────────────────────────────
  // KYCBanner stays at `order-0`.
  const order = {
    card: 'order-1',
    di: 'order-3',
    flow: 'order-4',
    buttons: 'order-5',
    local: 'order-6',
  } as const;

  // Tell global overlays (WhatsApp FAB) that a Receive/Send flow owns the
  // screen, so on phones the FAB steps aside instead of covering the panel.
  useEffect(() => {
    if (!isFlowOpen) return;
    document.documentElement.setAttribute('data-suite-flow-open', '');
    return () => document.documentElement.removeAttribute('data-suite-flow-open');
  }, [isFlowOpen]);

  // ── Dismiss on Escape ─────────────────────────────────────────────
  // Flows only close on explicit actions: the X button (in the flow
  // itself) or Escape. Outside-click dismissal was removed because
  // it caused accidental closes — especially on mobile where tapping
  // the card or Dynamic Island would close the flow.
  useEffect(() => {
    if (!isFlowOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isZentinelOpen) {
        handleDone();
      } else {
        handleCloseFlow();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isFlowOpen, isZentinelOpen, handleCloseFlow, handleDone]);

  // ZENTINEL DISABLED 2026-10-06: the only trigger (action-row button) is
  // commented out and ZentinelChatView is no longer imported, so this branch
  // is unreachable. Preserved verbatim below for a potential re-enable.
  // Local demo re-enable (2026-11-12): block restored as live code.

  // ── Zentinel layout ───────────────────────────────────────────────
  // When the assistant is open the dashboard becomes a phone-shaped
  // chat: DI as a floating header + phone frame below. Every other
  // surface (card, action row, ad-hoc flow slot) is unmounted so the
  // composition reads as "you entered the assistant", not "you opened
  // another widget stacked below the card".
  if (isZentinelOpen) {
    return (
      <div
        className={cn(
          'flex flex-col items-center',
          // Fixed height on mobile is what lets the phone body claim
          // `flex-1 min-h-0` reliably; with `min-h-*` alone the
          // descendant flex chain collapses to content height.
          'h-[calc(100dvh-3.5rem)]',
          isMobile ? 'px-4 pt-4 pb-0' : 'px-6 pt-6 pb-0',
        )}
      >
        <div className="w-full max-w-md flex flex-col gap-4 shrink-0">
          <motion.div
            initial={getEntrance(isMobile).initial}
            animate={getEntrance(isMobile).animate}
            transition={getEntrance(isMobile).transition}
            className="relative z-20"
          >
            <DynamicIsland idleMessage={idleMessage} walletId={primaryWallet?.id} />
          </motion.div>
        </div>

        <div
          ref={localRef}
          className="relative z-10 mt-4 flex w-full justify-center flex-1 min-h-0"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key="zentinel-phone"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(
                // Desktop: portrait 390×820 with a 2px brand-gradient
                // rim, matching the GradientCircleButton treatment.
                // Mobile: frame collapses — the device already IS the
                // phone. Full-bleed card, no gradient rim.
                isMobile
                  ? 'w-full h-full p-0 bg-transparent rounded-none'
                  : 'w-[390px] max-h-full h-[min(820px,100%)] p-0.5 bg-brand-gradient rounded-[40px] shadow-sm',
              )}
            >
              <div
                className={cn(
                  'flex flex-col bg-card overflow-hidden h-full w-full',
                  isMobile ? 'rounded-none' : 'rounded-[38px]',
                )}
              >
                <ZentinelChatView
                  onClose={handleDone}
                  walletId={primaryWallet?.id}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }
  // ZENTINEL DISABLED 2026-10-06 — end of preserved block (live again for the demo).

  return (
    <div
      className={cn(
        // `relative` anchors the absolutely-positioned Loopay X
        // share panel on desktop. On mobile the panel is in
        // normal flow, but a `relative` ancestor is harmless
        // there and removes a special case from the layout
        // logic below.
        'relative flex flex-col items-center',
        isFlowOpen ? 'justify-start min-h-[calc(100dvh-3.5rem)]' : 'justify-start overflow-hidden',
        !isFlowOpen && (isMobile ? 'h-[calc(100dvh-3.5rem)]' : 'h-[calc(100dvh-3rem)]'),
        /* Top-anchored with explicit `pt-*`: `justify-start` pins the
           hero block to the top of the available viewport (height =
           100dvh minus topbar), and the top padding sets how far
           below the topbar the block begins.

           Tightened in April 2026 (`pt-6` desktop / `pt-3` mobile)
           after the RacingSwitch moved to the topbar — without that
           ~80px slot in the hero, the card-to-form stack must hug
           the topbar to fit on a 720p laptop without scroll. The
           bottom of the stack still has ~24px of breathing room
           thanks to the dock's own `pb-28` reserve below. */
        isMobile ? 'px-2 pt-2' : 'px-6 pt-6'
      )}
    >
      {/* The dark-mode brand-curves wallpaper used to be mounted here,
          but it was promoted to `SuiteShell` so that every dock section
          (Inicio, Movimientos, Beneficiarios, Ajustes) inherits the same
          ambient backdrop without each view re-mounting it. The
          BrandCurvesBackdrop is portaled to <body> with `fixed inset-0
          -z-10`, so its position is independent of where it's mounted
          in the React tree. */}
      <LayoutGroup>
        {/* Uniform 40px rhythm between the three visible hero elements
            (Card ↔ DI = DI ↔ Buttons), pairing with the container's
            `justify-center` symmetry so the block reads as a balanced
            trio and the top↔Card distance equals the bottom↔Buttons
            distance by construction.

            Why explicit `mt-*` instead of `space-y-*`: the hero block
            uses `order-*` to decouple DOM order (DI → Card → Flow →
            Buttons) from visual order (Card → DI → Flow → Buttons).
            `space-y-*` is a DOM-sibling selector — it would land
            margins on the wrong items (e.g. give Card a 40px lead-in
            below the container edge instead of below its visual
            predecessor). Explicit `mt-*` on each visually-non-first
            item sidesteps that entirely.

            Special cases:

            1. Flow slot (`order-3`) is always mounted for `flowRef`
               + `LayoutGroup` animation continuity. When idle it's
               zero-height with `mt-0` (no lead-in needed, the next
               sibling — Buttons — takes over spacing). When a flow
               opens, `mt-10` gives the flow content its full 40px
               lead-in from DI, matching the hero rhythm.

            2. KYCBanner slot (`order-0`) only mounts when
               `!isKYCApproved`. When present, Card becomes visually-
               second and takes `mt-10`; when absent, Card is
               visually-first and takes `mt-0` so the container's
               padding alone sits above it (which is what optical
               centering needs). */}
        <div
          className={cn('w-full flex flex-col items-stretch', isMobile ? 'max-w-none' : 'max-w-md')}
        >
          {!isKYCApproved && (
            <div className="order-0">
              <KYCBanner />
            </div>
          )}

          {isKYCApproved && (
            <div className="order-0 space-y-4">
              {/* N3: a provider can still ask an approved customer for documents. */}
              <CustomerProviderRequirementsBanner />
              <MfaSuggestionBanner />
            </div>
          )}

          {/* Dynamic Island — visually sits below the VirtualCard;
              `mt-6` creates a 24px Card↔DI gap. The compact
              rhythm (vs the previous 40px) is what lets the full
              hero stack fit on a 720p laptop without scroll, after
              the RacingSwitch moved to the topbar. */}
          <motion.div
            ref={diRef}
            initial={getEntrance(isMobile).initial}
            animate={getEntrance(isMobile).animate}
            transition={getEntrance(isMobile).transition}
            className={cn('relative z-20 mt-6', order.di)}
          >
            <DynamicIsland idleMessage={idleMessage} walletId={primaryWallet?.id} />
          </motion.div>

          {/* Virtual Card — always rendered, shows skeleton data while
              loading. Wallet creation is handled by ops, so when no
              wallet exists yet the card is replaced by a pending
              placeholder instead of triggering any create call. */}
          <motion.div
            ref={cardRef}
            data-tutorial="virtual-card"
            initial={getEntrance(isMobile).initial}
            animate={getEntrance(isMobile).animate}
            transition={getEntrance(isMobile).transition}
            className={cn('relative z-10', !isKYCApproved && 'mt-6', order.card)}
          >
            {!walletsLoading && !primaryWallet ? (
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <p className="text-sm text-muted-foreground">
                  {wallets.length > 0
                    ? t`Tienes wallets visibles, pero ninguna coincide con la wallet principal configurada.`
                    : isKYCApproved
                      ? t`Tu wallet se está configurando. Aparecerá aquí cuando esté lista.`
                      : t`Tu wallet se habilitará cuando completes la verificación de identidad.`}
                </p>
              </div>
            ) : (
              <VirtualCard
                userName={isBalanceLoading ? '' : userName}
                currency={isBalanceLoading ? '' : balanceCurrency}
                amount={isBalanceLoading ? '' : balanceAmount}
                rawAmount={balance?.available_balance}
                address={isBalanceLoading ? '' : (walletAddress ?? '')}
                chain={primaryWallet?.chain}
                isLoading={isBalanceLoading}
                onCashout={primaryWallet ? handleCashout : undefined}
                wallets={wallets}
                activeWalletId={selectedWalletId}
                mainWalletId={walletSelection.mainWallet?.id ?? null}
                onSelectWallet={setSelectedWalletId}
              />
            )}
            {primaryWallet && secondaryWallet && (
              <div className="mt-3">
                <p className="min-w-0 text-[11px] leading-5 text-muted-foreground">
                  {walletSelection.secondaryWallets.length === 1
                    ? t`Principal: ${getWalletPairLabel(walletSelection.mainWallet) ?? balanceCurrency}. También tienes ${getWalletPairLabel(secondaryWallet) ?? secondaryWallet.currency}. Sweep mínimo: 5 USDC.`
                    : t`Principal: ${getWalletPairLabel(walletSelection.mainWallet) ?? balanceCurrency}. También tienes wallets secundarias. Sweep mínimo: 5 USDC.`}
                </p>
              </div>
            )}
          </motion.div>

          {/* Receive / Send inline flow slot. Always mounted so
              `flowRef` + `LayoutGroup` animations survive open/close
              transitions. When idle the wrapper is zero-height with
              no `mt-*` — Buttons' own `mt-6` below lands 24px under
              DI directly. When open, `mt-6` gives the flow content
              its 24px lead-in from DI, matching the compact hero
              rhythm. */}
          <div
            ref={flowRef}
            className={cn(
              isFlowOpen && 'mt-6',
              // Open flows end above the floating dock on phones (same
              // offset as <main>: dock height + safe-area inset).
              isFlowOpen && FLOW_DOCK_CLEARANCE,
              order.flow
            )}
          >
            <AnimatePresence mode="wait">
              {mode === 'receive' && (
                <motion.div
                  key="receive-flow"
                  data-tutorial="receive-flow"
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <ReceiveFlow onClose={handleCloseFlow} />
                </motion.div>
              )}
              {mode === 'send' && (
                <motion.div
                  key="send-flow"
                  data-tutorial="send-flow"
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <SendFlow onClose={handleCloseFlow} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action slot — shared dashboard actions. `mt-6` keeps the
              DI↔action 24px rhythm. */}
          <motion.div
            ref={actionRowRef}
            initial={getEntrance(isMobile).initial}
            animate={getEntrance(isMobile).animate}
            transition={getEntrance(isMobile).transition}
            className={cn('relative z-0 mt-6', order.buttons)}
          >
            <motion.div
              className="grid grid-cols-2 gap-4 md:gap-6 justify-items-center"
              animate={{
                y: isFlowOpen ? -32 : 0,
                opacity: isFlowOpen ? 0 : 1,
                scale: isFlowOpen ? 0.92 : 1,
              }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                pointerEvents: isFlowOpen ? 'none' : 'auto',
              }}
              aria-hidden={isFlowOpen}
            >
              <GradientCircleButton
                data-tutorial="receive"
                icon={ArrowDownLeft}
                label={t`Recibir`}
                active={mode === 'receive'}
                disabled={!primaryWallet}
                onClick={handleReceiveClick}
              />
              <GradientCircleButton
                data-tutorial="send"
                icon={ArrowUpRight}
                label={t`Enviar`}
                active={mode === 'send'}
                disabled={!primaryWallet}
                onClick={handleSendClick}
              />
              {/* ZENTINEL DISABLED 2026-10-06 — restored locally for the demo. */}
              <GradientCircleButton
                data-tutorial="zentinel"
                icon={Bot}
                label={t`Zentinel`}
                // Always false in this branch: when `localFlow` is
                // 'zentinel' the component returns the phone layout
                // above and the action row never renders.
                active={false}
                disabled={!primaryWallet}
                onClick={handleZentinelClick}
                // Ambient attention signals — only Zentinel gets them.
                // `wiggle` (intermittent icon swing every ~5s) and
                // `glow` (breathing brand-gradient halo, dark mode
                // only) invite use without constant noise. Receive
                // and Send stay neutral so Zentinel reads as the
                // differentiated action of the trio.
                wiggle
                glow
              />
            </motion.div>
          </motion.div>
        </div>
      </LayoutGroup>

      {/* Guided onboarding tutorial — auto-triggers once after KYC
          submission; also available on-demand via the header button. */}
      <DashboardTutorial />
    </div>
  );
}
