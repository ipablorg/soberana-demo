/**
 * Orchestrates the Plan → Confirm lifecycle for Zentinel write actions.
 *
 * Flow (guide §7):
 *   1. Agent returns a `pending_action` in the last `done` chunk of a
 *      chat turn. `use-zentinel-chat` stores it on the corresponding
 *      assistant message and in the store's `pending_action` slot.
 *   2. This hook exposes `confirm()` / `cancel()` plus a live
 *      `time_left_ms` countdown driven by `expires_at`.
 *   3. On success, the hook invalidates every TanStack Query key the
 *      backend says we should (via `zentinel-cache-map`), appends a
 *      "Plan ejecutado" bubble, and tags the original message as
 *      `plan_resolution: 'executed'` so history reads cleanly.
 *   4. On cancel, same pattern with `plan_resolution: 'cancelled'`.
 *   5. If `expires_at` elapses without a decision, the hook auto-tags
 *      the message as `expired` and clears the pending slot.
 *
 * Error semantics match §7 — 409 / 410 responses clear the pending
 * slot (there's nothing left to confirm), everything else keeps it
 * so the user can retry.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getZentinelClient,
  ZentinelApiError,
  type PendingAction,
} from '@/shared/lib/zentinel-client';
import {
  resolveCacheKeys,
  collectUnmappedKeys,
} from '@/shared/lib/zentinel-cache-map';
import { useZentinelChatStore } from '../stores/use-zentinel-chat-store';

export interface UseZentinelPendingActionResult {
  pending_action: PendingAction | null;
  confirm: () => Promise<void>;
  cancel: () => Promise<void>;
  is_executing: boolean;
  error: string | null;
  /** Milliseconds until `expires_at`; clamped to 0 when expired. */
  time_left_ms: number;
}

export function useZentinelPendingAction(): UseZentinelPendingActionResult {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const pending_action = useZentinelChatStore((s) => s.pending_action);
  const pending_message_id = useZentinelChatStore(
    (s) => s.pending_message_id,
  );
  const add_message = useZentinelChatStore((s) => s.add_message);
  const replace_message = useZentinelChatStore((s) => s.replace_message);
  const clear_pending = useZentinelChatStore((s) => s.clear_pending_action);

  const [is_executing, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [time_left_ms, setTimeLeftMs] = useState(0);

  // Countdown + auto-expire. Runs while there's a pending action. The
  // tick is 1s — the card only shows whole seconds, and a heavier
  // cadence would waste battery. If the server clock drifts, we rely
  // on the backend's 410 response to correct us on confirm.
  useEffect(() => {
    if (!pending_action) {
      setTimeLeftMs(0);
      return;
    }
    const expires_at = new Date(pending_action.expires_at).getTime();
    const tick = () => {
      const left = Math.max(0, expires_at - Date.now());
      setTimeLeftMs(left);
      if (left <= 0) {
        if (pending_message_id) {
          replace_message(pending_message_id, {
            plan_resolution: 'expired',
          });
        }
        clear_pending();
        toast.warning(t`El plan expiró. Solicítalo de nuevo.` as string);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [pending_action, pending_message_id, replace_message, clear_pending, t]);

  const invalidate_keys = useCallback(
    (backend_keys: string[] | undefined) => {
      if (!backend_keys || backend_keys.length === 0) return;
      for (const key of backend_keys) {
        for (const qk of resolveCacheKeys(key)) {
          void queryClient.invalidateQueries({ queryKey: qk });
        }
      }
      const unmapped = collectUnmappedKeys(backend_keys);
      if (unmapped.length > 0) {
        console.warn(
          '[zentinel] Unmapped invalidate_cache keys:',
          unmapped,
          '→ fell back to defensive invalidation',
        );
      }
    },
    [queryClient],
  );

  const confirm = useCallback(async () => {
    if (!pending_action || is_executing) return;
    setIsExecuting(true);
    setError(null);
    try {
      const client = getZentinelClient();
      const res = await client.confirm_action(pending_action.action_id);
      invalidate_keys(res.invalidate_cache);
      if (pending_message_id) {
        replace_message(pending_message_id, {
          plan_resolution: 'executed',
        });
      }
      add_message({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: t`Ejecutado ✓ ${pending_action.preview.summary}`,
        timestamp: new Date(),
        status: 'sent',
      });
      clear_pending();
    } catch (err) {
      if (err instanceof ZentinelApiError) {
        const d = err.detail;
        let message = '';
        let consumed = false;
        if (d.kind === 'action') {
          consumed = true;
          if (d.code === 'ACTION_NOT_FOUND') {
            message = t`El plan ya no existe. Pídelo nuevamente.`;
          } else if (d.code === 'ACTION_ALREADY_CONSUMED') {
            message = t`Este plan ya se ejecutó.`;
          } else {
            message = t`El plan expiró. Solicítalo de nuevo.`;
          }
        } else if (d.kind === 'kyc-required') {
          message = t`Completa la verificación KYC para continuar.`;
        } else if (d.kind === 'auth') {
          if (d.code === 'SOBERANA_TOKEN_MISSING') {
            message = t`Inicia sesión en Soberana para usar esta acción.`;
          } else if (d.code === 'SOBERANA_TOKEN_EXPIRED') {
            message = t`Tu sesión de Soberana expiró. Inicia sesión de nuevo.`;
          } else {
            message = t`Tu sesión con Zentinel expiró. Reconectando…`;
          }
        } else if (d.kind === 'validation') {
          message = d.message || t`Revisa los datos e intenta de nuevo.`;
        } else if (d.kind === 'upstream') {
          message = t`Problema temporal con Soberana. Intenta en un momento.`;
        } else if (d.kind === 'rate-limit') {
          message = t`Demasiadas peticiones. Espera ${d.retry_after}s.`;
        } else if (d.kind === 'network') {
          message = t`No hay conexión con Zentinel.`;
        } else {
          message = t`Algo salió mal. Intenta de nuevo.`;
        }
        if (d.kind === 'kyc-required') {
          toast.error(message, {
            action: {
              label: t`Completar KYC` as string,
              onClick: () => {
                window.location.assign('/suite/verify-identity');
              },
            },
          });
        } else {
          toast.error(message);
        }
        setError(message);
        if (consumed) {
          if (pending_message_id) {
            replace_message(pending_message_id, {
              plan_resolution:
                d.kind === 'action' && d.code === 'ACTION_EXPIRED'
                  ? 'expired'
                  : 'cancelled',
            });
          }
          clear_pending();
        }
      } else {
        const fallback = t`Algo salió mal. Intenta de nuevo.` as string;
        toast.error(fallback);
        setError(fallback);
      }
    } finally {
      setIsExecuting(false);
    }
  }, [
    add_message,
    clear_pending,
    invalidate_keys,
    is_executing,
    pending_action,
    pending_message_id,
    replace_message,
    t,
  ]);

  const cancel = useCallback(async () => {
    if (!pending_action || is_executing) return;
    setIsExecuting(true);
    setError(null);
    try {
      const client = getZentinelClient();
      await client.cancel_action(pending_action.action_id);
      if (pending_message_id) {
        replace_message(pending_message_id, {
          plan_resolution: 'cancelled',
        });
      }
      add_message({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: t`Plan cancelado.`,
        timestamp: new Date(),
        status: 'sent',
      });
      clear_pending();
    } catch (err) {
      // Canceling a plan that already expired / was consumed is a
      // no-op from the user's perspective: we still clear it.
      if (
        err instanceof ZentinelApiError &&
        (err.detail.kind === 'action' || err.detail.kind === 'unknown')
      ) {
        if (pending_message_id) {
          replace_message(pending_message_id, {
            plan_resolution: 'cancelled',
          });
        }
        clear_pending();
      } else {
        const fallback = t`No pudimos cancelar el plan. Intenta de nuevo.` as string;
        toast.error(fallback);
        setError(fallback);
      }
    } finally {
      setIsExecuting(false);
    }
  }, [
    add_message,
    clear_pending,
    is_executing,
    pending_action,
    pending_message_id,
    replace_message,
    t,
  ]);

  return useMemo(
    () => ({
      pending_action,
      confirm,
      cancel,
      is_executing,
      error,
      time_left_ms,
    }),
    [pending_action, confirm, cancel, is_executing, error, time_left_ms],
  );
}
