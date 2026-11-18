/**
 * Streaming chat hook for the Zentinel assistant embedded in the
 * dashboard phone frame.
 *
 * Responsibilities:
 * - Push the user message into the store as a `sent` bubble.
 * - Open a POST /api/chat/stream SSE to the backend and append
 *   `token` chunks into a placeholder assistant bubble.
 * - When the `done` frame arrives, finalize the bubble (set status,
 *   persist `session_id`, surface `pending_action`).
 * - If the health probe reports `features.streaming === false`, fall
 *   back silently to POST /api/chat/message and emit a synthetic
 *   single `done` chunk — the UI layer stays identical.
 * - Translate `ZentinelApiError` into i18n-ready toasts (§7 table).
 *   401 triggers exactly one silent re-login retry; anything else
 *   surfaces immediately.
 * - Provide `abort()` to cancel an in-flight turn (§5.3: closing the
 *   stream aborts the server-side agent).
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { toast } from 'sonner';
import {
  getZentinelClient,
  ZentinelApiError,
  type ChatMessageResponse,
  type PendingAction,
  type SecurityBlock,
} from '@/shared/lib/zentinel-client';
import { useZentinelAuth } from '@/shared/hooks/use-zentinel-auth';
import { useZentinelHealth } from '@/shared/hooks/use-zentinel-health';
import {
  useZentinelChatStore,
  type ZentinelChatMessage,
} from '../stores/use-zentinel-chat-store';

export interface UseZentinelChatResult {
  messages: ZentinelChatMessage[];
  send_message: (content: string) => Promise<void>;
  abort: () => void;
  is_streaming: boolean;
  error: string | null;
}

/**
 * Human-readable mapping for a `ZentinelApiError`.
 * Kept in this hook because it needs the Lingui `t` macro; if another
 * surface needs the same map we can factor it out with a `t` argument.
 */
function useZentinelErrorMessage() {
  const { t } = useLingui();
  return useCallback(
    (err: ZentinelApiError): string => {
      const d = err.detail;
      switch (d.kind) {
        case 'rate-limit':
          return t`Demasiadas peticiones. Espera ${d.retry_after}s.`;
        case 'auth':
          if (d.code === 'SOBERANA_TOKEN_MISSING') {
            return t`Inicia sesión en Soberana para usar esta acción.`;
          }
          if (d.code === 'SOBERANA_TOKEN_EXPIRED') {
            return t`Tu sesión de Soberana expiró. Inicia sesión de nuevo.`;
          }
          return t`Tu sesión con Zentinel expiró. Reconectando…`;
        case 'kyc-required':
          return t`Completa la verificación KYC para continuar.`;
        case 'validation':
          return d.message || t`Revisa los datos e intenta de nuevo.`;
        case 'action':
          if (d.code === 'ACTION_NOT_FOUND') {
            return t`El plan ya no existe. Pídelo nuevamente.`;
          }
          if (d.code === 'ACTION_ALREADY_CONSUMED') {
            return t`Este plan ya se ejecutó.`;
          }
          return t`El plan expiró. Solicítalo de nuevo.`;
        case 'upstream':
          return t`Problema temporal con Soberana. Intenta en un momento.`;
        case 'network':
          return t`No hay conexión con Zentinel.`;
        case 'aborted':
          return '';
        case 'unknown':
          return t`Algo salió mal. Intenta de nuevo.`;
      }
    },
    [t],
  );
}

export function useZentinelChat(): UseZentinelChatResult {
  const { t } = useLingui();
  const { is_authenticated, refresh, logout } = useZentinelAuth();
  const {
    features: { streaming: streaming_enabled },
  } = useZentinelHealth();

  const messages = useZentinelChatStore((s) => s.messages);
  const session_id = useZentinelChatStore((s) => s.session_id);
  const add_message = useZentinelChatStore((s) => s.add_message);
  const replace_message = useZentinelChatStore((s) => s.replace_message);
  const remove_message = useZentinelChatStore((s) => s.remove_message);
  const set_session_id = useZentinelChatStore((s) => s.set_session_id);
  const set_pending_action = useZentinelChatStore(
    (s) => s.set_pending_action,
  );
  const set_rate_limit = useZentinelChatStore((s) => s.set_rate_limit);

  const [is_streaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort_ref = useRef<AbortController | null>(null);
  const map_error = useZentinelErrorMessage();

  const abort = useCallback(() => {
    abort_ref.current?.abort();
    abort_ref.current = null;
  }, []);

  const run_stream = useCallback(
    async (
      content: string,
      placeholder_id: string,
      signal: AbortSignal,
    ): Promise<{
      pending?: PendingAction;
      empty?: boolean;
      security_block?: SecurityBlock;
    }> => {
      const client = getZentinelClient();
      let buffer = '';
      let tools_used: string[] = [];
      let pending: PendingAction | undefined;
      let security_block: SecurityBlock | undefined;
      let received_done = false;
      let final_text = '';

      for await (const chunk of client.chat_stream(
        { message: content, session_id: session_id ?? undefined },
        signal,
      )) {
        if (signal.aborted) break;
        if (chunk.type === 'token') {
          // A late `security_block` frame can still arrive after some
          // tokens streamed in (Charlie sometimes intercepts mid-turn).
          // We keep buffering text but the final replace_message at the
          // bottom will overwrite with the security card if present.
          buffer += chunk.content;
          if (!security_block) {
            replace_message(placeholder_id, {
              content: buffer,
              status: 'streaming',
            });
          }
        } else if (chunk.type === 'tool') {
          tools_used = [...tools_used, chunk.name];
        } else if (chunk.type === 'security_block') {
          security_block = chunk;
          // FRONTEND_PRODUCTION_CONNECTION.md §4: discard any tokens
          // streamed before the block and render the Charlie card. The
          // `done` frame that follows is ignored for plan/text purposes.
          replace_message(placeholder_id, {
            content: '',
            status: 'security_blocked',
            tools_used: [],
            pending_action: undefined,
            security_block,
          });
        } else if (chunk.type === 'done') {
          received_done = true;
          final_text = chunk.response || buffer;
          tools_used = chunk.tools_used.length
            ? chunk.tools_used
            : tools_used;
          if (chunk.session_id) {
            set_session_id(chunk.session_id);
          }
          // Don't propagate pending_action when Charlie blocked — the
          // agent should not have produced one, but defend in depth.
          pending = security_block ? undefined : chunk.pending_action;
          if (final_text && !security_block) {
            replace_message(placeholder_id, {
              content: final_text,
              status: 'sent',
              tools_used,
              pending_action: pending,
            });
          }
        } else if (chunk.type === 'error') {
          throw new ZentinelApiError({
            kind: 'unknown',
            status: 500,
            body: chunk,
          });
        }
      }

      // Some backends close the stream with only `: ready` + a `done`
      // frame that carries neither `response` nor any preceding tokens
      // (the agent produced the answer non-incrementally). Signal
      // upward so the caller can retry via /chat/message instead of
      // leaving an empty bubble on screen. A `security_block` short-
      // circuits this — there is nothing to retry; render the card.
      const is_empty =
        received_done && !final_text && !buffer && !security_block;
      if (!received_done && buffer && !security_block) {
        // Stream closed without a `done` frame — treat the buffered
        // text as the final response so the user sees something.
        replace_message(placeholder_id, {
          content: buffer,
          status: 'sent',
          tools_used,
        });
      }
      return { pending, empty: is_empty, security_block };
    },
    [replace_message, session_id, set_session_id],
  );

  const run_non_stream = useCallback(
    async (
      content: string,
      placeholder_id: string,
    ): Promise<{ pending?: PendingAction; security_block?: SecurityBlock }> => {
      const client = getZentinelClient();
      const res: ChatMessageResponse = await client.chat_message({
        message: content,
        session_id: session_id ?? undefined,
      });
      const new_session = res.session_id ?? res.sessionId;
      if (new_session) set_session_id(new_session);

      // FRONTEND_PRODUCTION_CONNECTION.md §4.1: when `securityBlock` is
      // present, ignore `response` as a normal answer and render the
      // Charlie incident card instead. Snake/camel both accepted to
      // mirror the rest of this controller's lax serialization.
      const security_block = res.security_block ?? res.securityBlock;
      if (security_block) {
        replace_message(placeholder_id, {
          content: '',
          status: 'security_blocked',
          tools_used: [],
          pending_action: undefined,
          security_block,
        });
        return { security_block };
      }

      const pending = res.pending_action ?? res.pendingAction;
      const tools_used = res.tools_used ?? res.toolsUsed ?? [];
      replace_message(placeholder_id, {
        content: res.response,
        status: 'sent',
        tools_used,
        pending_action: pending,
      });
      return { pending };
    },
    [replace_message, session_id, set_session_id],
  );

  const send_message = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      if (!is_authenticated) {
        toast.error(
          t`Inicia sesión en Zentinel para usar el chat.` as string,
        );
        return;
      }

      setError(null);

      const user_msg: ZentinelChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
        status: 'sent',
      };
      const placeholder: ZentinelChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        status: 'streaming',
      };
      add_message(user_msg);
      add_message(placeholder);

      const controller = new AbortController();
      abort_ref.current = controller;
      setIsStreaming(true);

      const attempt = async (retry: boolean): Promise<void> => {
        try {
          let pending: PendingAction | undefined;
          let blocked = false;
          if (streaming_enabled) {
            const res = await run_stream(
              trimmed,
              placeholder.id,
              controller.signal,
            );
            pending = res.pending;
            blocked = !!res.security_block;
            if (res.empty && !blocked) {
              // Stream produced no text — the backend's /chat/stream
              // emitted only `done` with no `response`. Retry once via
              // /chat/message so the user sees the assistant's answer
              // instead of an empty bubble. We skip this fallback when
              // Charlie blocked: there's nothing to retry, the card is
              // already on screen.
              const fallback = await run_non_stream(trimmed, placeholder.id);
              pending = fallback.pending ?? pending;
              blocked = blocked || !!fallback.security_block;
            }
          } else {
            const res = await run_non_stream(trimmed, placeholder.id);
            pending = res.pending;
            blocked = !!res.security_block;
          }

          if (pending && !blocked) {
            set_pending_action(pending, placeholder.id);
          }
        } catch (err) {
          if (err instanceof ZentinelApiError) {
            if (err.detail.kind === 'aborted') {
              // User abort — quietly remove placeholder, no toast.
              remove_message(placeholder.id);
              return;
            }
            if (err.detail.kind === 'rate-limit') {
              // Persist so the composer banner + countdown pick it up
              // even if the parent `on_rate_limit` callback didn't fire
              // (e.g. the 429 body took over before the generic path).
              set_rate_limit(err.detail.rate.retry_after
                ? err.detail.rate
                : { ...err.detail.rate, retry_after: err.detail.retry_after });
            }
            if (
              err.detail.kind === 'auth' &&
              (err.detail.code === 'JWT_EXPIRED' ||
                err.detail.code === 'JWT_INVALID') &&
              !retry
            ) {
              const ok = await refresh();
              if (ok) {
                await attempt(true);
                return;
              }
              // Refresh failed: drop the stale JWT so the UI reflects
              // the unauthenticated state instead of silently retrying.
              logout();
              const msg = t`Tu sesión con Zentinel expiró. Inicia sesión de nuevo.` as string;
              toast.error(msg);
              setError(msg);
              replace_message(placeholder.id, {
                content: msg,
                status: 'error',
                error_message: msg,
              });
              return;
            }
            const msg = map_error(err);
            if (msg) {
              if (err.detail.kind === 'kyc-required') {
                // Deep-link to the Bridge KYC page. We avoid react-router
                // here because this hook runs outside a <Router> context
                // in tests; the navigation is a hard assign.
                toast.error(msg, {
                  action: {
                    label: t`Completar KYC` as string,
                    onClick: () => {
                      window.location.assign('/suite/verify-identity');
                    },
                  },
                });
              } else {
                toast.error(msg);
              }
              setError(msg);
            }
            replace_message(placeholder.id, {
              content: msg || 'Error',
              status: 'error',
              error_message: msg,
            });
          } else {
            const fallback = t`Algo salió mal. Intenta de nuevo.` as string;
            toast.error(fallback);
            setError(fallback);
            replace_message(placeholder.id, {
              content: fallback,
              status: 'error',
              error_message: fallback,
            });
          }
        }
      };

      try {
        await attempt(false);
      } finally {
        setIsStreaming(false);
        abort_ref.current = null;
      }
    },
    [
      add_message,
      is_authenticated,
      logout,
      map_error,
      refresh,
      remove_message,
      replace_message,
      run_non_stream,
      run_stream,
      set_pending_action,
      set_rate_limit,
      streaming_enabled,
      t,
    ],
  );

  return useMemo(
    () => ({
      messages,
      send_message,
      abort,
      is_streaming,
      error,
    }),
    [messages, send_message, abort, is_streaming, error],
  );
}
