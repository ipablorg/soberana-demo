/**
 * FlowDialogs
 *
 * Three modal dialogs for Receive / Send / History flows on the
 * conversational home. Each dialog:
 *  - Fixed header with title (sticky, never scrolls)
 *  - Scrollable body for the flow content
 *  - Close via the X button only (outside-click and Escape are blocked)
 */
import { useLingui } from '@lingui/react/macro';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { ReceiveFlow } from '../features/receive';
import { SendFlow } from '../features/send';
import { InlineHistoryList } from './flows/InlineHistoryList';

interface FlowDialogsProps {
  mode: string;
  historyOpen: boolean;
  walletId: string | undefined;
  onCloseReceive: () => void;
  onCloseSend: () => void;
  onCloseHistory: () => void;
}

const preventInteraction = (e: Event) => e.preventDefault();

export function FlowDialogs({
  mode,
  historyOpen,
  walletId,
  onCloseReceive,
  onCloseSend,
  onCloseHistory,
}: FlowDialogsProps) {
  const { t } = useLingui();

  return (
    <>
      {/* ── Receive Dialog ── */}
      <Dialog
        open={mode === 'receive'}
        onOpenChange={(open) => {
          if (!open) onCloseReceive();
        }}
      >
        <DialogContent
          className="max-w-md max-h-[85dvh] flex flex-col gap-0 p-0 overflow-hidden"
          onInteractOutside={preventInteraction}
          onEscapeKeyDown={preventInteraction}
        >
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
            <DialogTitle>{t`Recibir`}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4">
            <ReceiveFlow className="bg-transparent p-0 rounded-none max-w-none" />
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Send Dialog ── */}
      <Dialog
        open={mode === 'send'}
        onOpenChange={(open) => {
          if (!open) onCloseSend();
        }}
      >
        <DialogContent
          className="max-w-md max-h-[85dvh] flex flex-col gap-0 p-0 overflow-hidden"
          onInteractOutside={preventInteraction}
          onEscapeKeyDown={preventInteraction}
        >
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
            <DialogTitle>{t`Enviar`}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 flex flex-col px-6 py-4">
            <SendFlow className="bg-transparent p-0 rounded-none max-w-none flex-1 min-h-0 flex flex-col" />
          </div>
        </DialogContent>
      </Dialog>

      {/* ── History Dialog ── */}
      <Dialog
        open={historyOpen}
        onOpenChange={(open) => {
          if (!open) onCloseHistory();
        }}
      >
        <DialogContent
          className="max-w-md max-h-[85dvh] flex flex-col gap-0 p-0 overflow-hidden"
          onInteractOutside={preventInteraction}
          onEscapeKeyDown={preventInteraction}
        >
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
            <DialogTitle>{t`Historial`}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4">
            <InlineHistoryList walletId={walletId} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
