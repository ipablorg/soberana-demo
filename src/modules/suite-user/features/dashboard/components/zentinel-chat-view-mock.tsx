/**
 * ZentinelChatViewMock — QA-only shell powered by `useSovyMock`.
 *
 * @deprecated
 *   Kept intentionally as a QA escape hatch: toggled on by setting
 *   `VITE_ZENTINEL_USE_MOCK=true` and lazy-imported from
 *   `zentinel-chat-view.tsx` so the prod bundle never ships it. The
 *   real integration runs through the Zentinel client + SSE stream;
 *   this file exists only to exercise downstream flows
 *   (ReceiveFlow / SendFlow / beneficiaries / transactions) without a
 *   live backend. Do NOT import from product code. Remove when the mock
 *   Sovy engine and its store are retired.
 *
 * This file is only loaded when `VITE_ZENTINEL_USE_MOCK=true`; Vite's
 * dynamic import in `zentinel-chat-view.tsx` keeps it out of the prod
 * bundle otherwise. It mirrors the real view's API (same props, same
 * four action chips, same four sub-views) so the dashboard shell can
 * treat them interchangeably — only the conversation engine differs.
 *
 * Scope (R4 — no mixing):
 * - Uses `useSovyStore` + `useSovyMock`. Does NOT touch the Zentinel
 *   store, client, auth, or health hooks. When the flag is on, the
 *   real pipeline is completely dormant.
 * - No `pending_action` / plan-confirm flow — the mock engine doesn't
 *   produce them. The phone frame still offers the four transactional
 *   chips for manual QA of ReceiveFlow / SendFlow / beneficiary /
 *   transactions views.
 */

/* eslint-disable import/no-restricted-paths -- QA shell intentionally
  consumes the legacy sovy primitives; real path uses Zentinel hooks. */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';
import {
  ArrowDownToLine,
  ArrowLeft,
  Bot,
  List,
  Send,
  UserPlus,
  X,
  type IconComponent,
} from '@/shared/components/animated-icons';
import { ChatInput } from '@/modules/suite-user/features/sovy/components/ChatInput';
import { ChatMessage } from '@/modules/suite-user/features/sovy/components/ChatMessage';
import { useSovyMock } from '@/modules/suite-user/features/sovy/hooks/useSovyMock';
import { useSovyStore } from '@/modules/suite-user/features/sovy/stores/useSovyStore';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { ReceiveFlow } from '../features/receive';
import { SendFlow } from '../features/send';
import { InlineHistoryList } from './flows/InlineHistoryList';
import { useDynamicIslandStore } from '../stores/useDynamicIslandStore';

type View = 'chat' | 'receive' | 'send' | 'beneficiary' | 'transactions';

interface ActionChipDef {
  id: 'receive' | 'send' | 'beneficiary' | 'transactions';
  icon: IconComponent;
  label: string;
  view: Exclude<View, 'chat'>;
}

export interface ZentinelChatViewMockProps {
  onClose: () => void;
  walletId: string | undefined;
}

export function ZentinelChatViewMock({
  onClose,
  walletId,
}: ZentinelChatViewMockProps) {
  const { t } = useLingui();
  const [view, setView] = useState<View>('chat');
  const { messages, addMessage } = useSovyStore();
  const { getInitialMessage, sendMockMessage, isTyping, error } = useSovyMock();

  const setMode = useDynamicIslandStore((s) => s.setMode);
  const setSendStep = useDynamicIslandStore((s) => s.setSendStep);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current && messages.length === 0) {
      addMessage(getInitialMessage());
      isInitialized.current = true;
    } else if (messages.length > 0) {
      isInitialized.current = true;
    }
  }, [addMessage, getInitialMessage, messages.length]);

  useEffect(() => {
    if (view !== 'chat') return;
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, view]);

  const activateView = useCallback(
    (next: Exclude<View, 'chat'>) => {
      switch (next) {
        case 'receive':
          setMode('receive');
          break;
        case 'send':
          setMode('send');
          break;
        case 'beneficiary':
          setMode('send');
          setSendStep('create-beneficiary');
          break;
        case 'transactions':
          setMode('idle');
          break;
      }
      setView(next);
    },
    [setMode, setSendStep],
  );

  const handleBackToChat = useCallback(() => {
    setMode('idle');
    setView('chat');
  }, [setMode]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      addMessage({
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date(),
        status: 'sent',
      });
      try {
        const response = await sendMockMessage(content);
        addMessage(response);
      } catch {
        addMessage({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: t`Lo siento, hubo un error al procesar tu mensaje.`,
          timestamp: new Date(),
          status: 'error',
        });
      }
    },
    [addMessage, sendMockMessage, t],
  );

  const chips: ActionChipDef[] = useMemo(
    () => [
      {
        id: 'receive',
        icon: ArrowDownToLine,
        label: t`Recibir en una moneda`,
        view: 'receive',
      },
      {
        id: 'send',
        icon: Send,
        label: t`Enviar a un beneficiario`,
        view: 'send',
      },
      {
        id: 'beneficiary',
        icon: UserPlus,
        label: t`Crear un beneficiario`,
        view: 'beneficiary',
      },
      {
        id: 'transactions',
        icon: List,
        label: t`Consultar transacciones`,
        view: 'transactions',
      },
    ],
    [t],
  );

  const headerTitle = useMemo<ReactNode>(() => {
    const base = (
      <>
        <Bot className="h-4 w-4 text-foreground" aria-hidden />
        <span className="font-heading font-medium text-sm text-foreground">
          Zentinel
          <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
            (mock)
          </span>
        </span>
      </>
    );
    if (view === 'chat') return base;
    const subLabel =
      view === 'receive'
        ? t`Recibir`
        : view === 'send'
          ? t`Enviar`
          : view === 'beneficiary'
            ? t`Nuevo beneficiario`
            : t`Transacciones`;
    return (
      <>
        <Bot className="h-4 w-4 text-muted-foreground" aria-hidden />
        <span className="font-heading font-medium text-sm text-foreground">
          {subLabel}
        </span>
      </>
    );
  }, [view, t]);

  const showChips = view === 'chat' && messages.length <= 1 && !isTyping;

  return (
    <div className="flex flex-col h-full min-h-0">
      <header className="shrink-0 flex items-center justify-between border-b border-border/50 px-4 py-3 bg-card">
        <div className="flex items-center gap-2.5 min-w-0">
          {view !== 'chat' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -ml-1"
              onClick={handleBackToChat}
              aria-label={t`Volver al chat`}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {headerTitle}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
          aria-label={t`Cerrar`}
        >
          <X className="h-4 w-4" />
        </Button>
      </header>

      <div className="flex-1 min-h-0 relative overflow-hidden">
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
              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-2">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {showChips && (
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-3 px-1">
                      {t`O elige una acción`}
                    </p>
                    <div className="grid grid-cols-1 gap-2.5 w-full">
                      {chips.map((chip) => {
                        const Icon = chip.icon;
                        return (
                          <button
                            key={chip.id}
                            type="button"
                            onClick={() => activateView(chip.view)}
                            disabled={isTyping}
                            className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-3 text-left transition-colors duration-150 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background border border-border/50">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            </span>
                            <span className="text-sm font-medium text-foreground">
                              {chip.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20">
                    {error}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="shrink-0">
                <ChatInput
                  onSend={handleSendMessage}
                  disabled={isTyping}
                  placeholder={t`Pregúntame sobre tu tesorería…`}
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
              className="absolute inset-0 overflow-y-auto px-3 py-4"
            >
              <ReceiveFlow
                className={cn('bg-transparent! p-0! max-w-none!')}
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
              className="absolute inset-0 overflow-y-auto px-3 py-4"
            >
              <SendFlow className={cn('bg-transparent! p-0! max-w-none!')} />
            </motion.div>
          )}

          {view === 'beneficiary' && (
            <motion.div
              key="beneficiary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute inset-0 overflow-y-auto px-3 py-4"
            >
              <SendFlow className={cn('bg-transparent! p-0! max-w-none!')} />
            </motion.div>
          )}

          {view === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute inset-0 overflow-y-auto px-4 py-4"
            >
              <InlineHistoryList walletId={walletId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
