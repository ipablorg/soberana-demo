import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trans } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { ChevronLeft, FileText, Trash2 } from '@/shared/components/animated-icons';
import { LivePreview } from '../components/studio/LivePreview';
import { useElementsStore } from '../stores/use-elements-store';
import type { WidgetEvent, WidgetEventType } from '../types';

interface EventLogEntry {
  id: string;
  type: WidgetEventType;
  timestamp: string;
  payload: unknown;
}

export function PreviewSandbox() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const widgets = useElementsStore(s => s.widgets);
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);

  const widget = widgets.find(w => w.id === id);

  if (!widget) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground"><Trans>Widget no encontrado</Trans></p>
        <Button variant="outline" onClick={() => navigate('/elements')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          <Trans>Volver al dashboard</Trans>
        </Button>
      </div>
    );
  }

  const handleEvent = <T extends WidgetEventType>(event: WidgetEvent<T>) => {
    setEventLog(prev => [
      {
        id: `${Date.now()}`,
        type: event.type,
        timestamp: new Date().toLocaleTimeString('es', { hour12: false }),
        payload: event.payload,
      },
      ...prev.slice(0, 49),
    ]);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/elements')}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            <Trans>Dashboard</Trans>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <div>
            <span className="font-semibold text-foreground text-sm">{widget.name}</span>
            <Badge variant="secondary" className="ml-2 text-xs">{widget.type}</Badge>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/elements/builder/${widget.type}?edit=${widget.id}`)}
        >
          <FileText className="mr-1.5 h-3.5 w-3.5" />
          <Trans>Ver código</Trans>
        </Button>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Preview */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex justify-center"
          >
            <LivePreview
              config={{ ...widget, id: widget.id }}
              onEvent={handleEvent}
            />
          </motion.div>
        </div>

        {/* Event log */}
        <div className="lg:w-72 shrink-0">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Trans>Event Log</Trans>
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => setEventLog([])}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                <Trans>Limpiar</Trans>
              </Button>
            </div>
            <ScrollArea className="h-80">
              {eventLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-1">
                  <p className="text-xs text-muted-foreground">
                    <Trans>Interactúa con el widget para ver eventos</Trans>
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border/50">
                  {eventLog.map(entry => (
                    <div key={entry.id} className="px-3 py-2.5">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <code className="text-xs text-foreground font-mono">{entry.type}</code>
                        <span className="text-xs text-muted-foreground font-mono">{entry.timestamp}</span>
                      </div>
                      <pre className="text-xs text-muted-foreground overflow-hidden whitespace-pre-wrap break-all line-clamp-2">
                        {JSON.stringify(entry.payload, null, 1)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
