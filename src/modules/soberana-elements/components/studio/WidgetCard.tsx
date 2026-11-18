import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Edit,
  FileText,
  Trash2,
  Wallet,
  UserCheck,
  PiggyBank,
  Receipt,
  Eye,
  Layers,
  FileCode,
} from '@/shared/components/animated-icons';
import type { WidgetConfig, WidgetMetrics } from '../../types';
import { CodeSnippetPanel } from './CodeSnippetPanel';
import { cn } from '@/shared/lib/utils';

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'payment-button': Wallet,
  'kyc-module': UserCheck,
  'wallet-dashboard': PiggyBank,
  'invoice-payment': Receipt,
};

const TYPE_LABELS: Record<string, string> = {
  'payment-button': 'Botón de Pago',
  'kyc-module': 'KYC',
  'wallet-dashboard': 'Wallet',
  'invoice-payment': 'Invoice',
};

const STATUS_VARIANT = {
  published: 'success',
  draft: 'secondary',
  archived: 'outline',
} as const;

const STATUS_LABELS: Record<string, string> = {
  published: 'Publicado',
  draft: 'Borrador',
  archived: 'Archivado',
};

interface WidgetCardProps {
  widget: WidgetConfig;
  metrics?: WidgetMetrics;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
}

export function WidgetCard({ widget, metrics, onEdit, onDelete, onPreview }: WidgetCardProps) {
  const [showCode, setShowCode] = useState(false);
  const Icon = TYPE_ICONS[widget.type] ?? Wallet;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1.5 min-w-0">
                <p className="font-semibold text-foreground truncate">{widget.name}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {TYPE_LABELS[widget.type] ?? widget.type}
                  </Badge>
                  <Badge variant={STATUS_VARIANT[widget.status] ?? 'outline'} className="text-xs">
                    {STATUS_LABELS[widget.status] ?? widget.status}
                  </Badge>
                  {widget.deliveryMode === 'headless' ? (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <FileCode className="h-2.5 w-2.5" />
                      Headless
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Layers className="h-2.5 w-2.5" />
                      Widget
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 pb-3">
            <div className="flex h-20 items-center justify-center rounded-lg bg-muted/50 mb-3">
              <Icon className="h-8 w-8 text-muted-foreground/50" />
            </div>

            {metrics && (
              <div className="flex items-center divide-x divide-border/50">
                <div className="flex-1 text-center pr-2">
                  <p className="font-mono tabular-nums text-right text-sm font-semibold text-foreground">
                    {metrics.clicks.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground"><Trans>Clics</Trans></p>
                </div>
                <div className="flex-1 text-center px-2">
                  <p className="font-mono tabular-nums text-right text-sm font-semibold text-foreground">
                    {(metrics.conversionRate * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground"><Trans>Conv.</Trans></p>
                </div>
                <div className="flex-1 text-center pl-2">
                  <p className={cn(
                    'font-mono tabular-nums text-right text-sm font-semibold',
                    metrics.revenue > 0 ? 'text-success' : 'text-muted-foreground',
                  )}>
                    ${metrics.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Rev.</p>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-3 border-t border-border/50">
            <div className="flex items-center gap-1 w-full">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-1"
                onClick={onEdit}
                title={t`Editar`}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-1"
                onClick={onPreview}
                title={t`Vista previa`}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-1"
                onClick={() => setShowCode(true)}
                title={t`Ver código`}
              >
                <FileText className="h-3.5 w-3.5" />
              </Button>
              <Separator orientation="vertical" className="h-4 mx-1" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={onDelete}
                title={t`Eliminar`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      <Dialog open={showCode} onOpenChange={setShowCode}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <Trans>Código de integración</Trans> — {widget.name}
            </DialogTitle>
          </DialogHeader>
          <CodeSnippetPanel config={widget} />
        </DialogContent>
      </Dialog>
    </>
  );
}
