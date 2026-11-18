import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Copy, Check, Shield } from '@/shared/components/animated-icons';
import { useSnippetGenerator } from '../../hooks/use-snippet-generator';
import { truncateSriHash, isSriSupported } from '../../utils/sri-utils';
import type { WidgetConfig, SnippetFramework, HeadlessSnippetFramework } from '../../types';
import { DeepLinkGenerator } from './DeepLinkGenerator';
import { cn } from '@/shared/lib/utils';

const WIDGET_TABS: { value: SnippetFramework; label: string }[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'vanilla', label: 'Vanilla JS' },
  { value: 'web-component', label: 'Web Component' },
];

const HEADLESS_TABS: { value: HeadlessSnippetFramework; label: string }[] = [
  { value: 'react-headless', label: 'React' },
  { value: 'vue-headless', label: 'Vue' },
  { value: 'vanilla-headless', label: 'Vanilla JS' },
  { value: 'node-webhook', label: 'Webhook (Node)' },
];

interface CodeSnippetPanelProps {
  config: WidgetConfig;
}

export function CodeSnippetPanel({ config }: CodeSnippetPanelProps) {
  const isHeadless = config.deliveryMode === 'headless';

  const [activeWidget, setActiveWidget] = useState<SnippetFramework>('react');
  const [activeHeadless, setActiveHeadless] = useState<HeadlessSnippetFramework>('react-headless');
  const [copied, setCopied] = useState(false);

  const { snippets, headlessSnippets } = useSnippetGenerator(config);
  const sriAvailable = isSriSupported();

  const currentCode = isHeadless
    ? headlessSnippets?.[activeHeadless]?.code ?? ''
    : snippets?.[activeWidget]?.code ?? '';

  const currentSnippet = isHeadless
    ? headlessSnippets?.[activeHeadless]
    : snippets?.[activeWidget];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {isHeadless ? (
        <Tabs
          value={activeHeadless}
          onValueChange={v => setActiveHeadless(v as HeadlessSnippetFramework)}
        >
          <TabsList className="w-full">
            {HEADLESS_TABS.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1 text-xs">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {HEADLESS_TABS.map(tab => (
            <TabsContent key={tab.value} value={tab.value} className="mt-3">
              <pre className="rounded-lg bg-muted p-4 overflow-x-auto text-xs font-mono leading-relaxed text-foreground whitespace-pre-wrap break-all">
                <code>{headlessSnippets?.[tab.value]?.code ?? ''}</code>
              </pre>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Tabs
          value={activeWidget}
          onValueChange={v => setActiveWidget(v as SnippetFramework)}
        >
          <TabsList className="w-full">
            {WIDGET_TABS.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1 text-xs">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {WIDGET_TABS.map(tab => (
            <TabsContent key={tab.value} value={tab.value} className="mt-3">
              <pre className="rounded-lg bg-muted p-4 overflow-x-auto text-xs font-mono leading-relaxed text-foreground whitespace-pre-wrap break-all">
                <code>{snippets?.[tab.value]?.code ?? ''}</code>
              </pre>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* SRI Hash — widget mode only */}
      {!isHeadless && currentSnippet?.sriHash && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground font-mono truncate">
              {truncateSriHash(currentSnippet.sriHash)}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!sriAvailable && (
              <Badge variant="warning" className="text-xs"><Trans>Requiere HTTPS</Trans></Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => navigator.clipboard.writeText(currentSnippet.sriHash ?? '')}
            >
              <Copy className="h-3 w-3 mr-1" />
              <Trans>Copiar hash</Trans>
            </Button>
          </div>
        </div>
      )}

      {/* Copy button */}
      <Button variant="gradient" onClick={handleCopy} className="w-full">
        <span className={cn('flex items-center gap-2 transition-opacity duration-150', copied ? 'opacity-0 absolute' : 'opacity-100')}>
          <Copy className="h-4 w-4" />
          <Trans>Copiar código</Trans>
        </span>
        <span className={cn('flex items-center gap-2 transition-opacity duration-150', copied ? 'opacity-100' : 'opacity-0 absolute')}>
          <Check className="h-4 w-4" />
          <Trans>¡Copiado!</Trans>
        </span>
      </Button>

      {/* Deep Link — solo para invoice-payment y payment-button con deepLinkPayload (widget mode) */}
      {!isHeadless && (config.type === 'invoice-payment' || config.features.deepLinkPayload) && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground mb-3">
            <Trans>Deep Link de transacción</Trans>
          </p>
          <DeepLinkGenerator
            widgetId={config.id}
            secret={config.deepLinkSecret}
          />
        </div>
      )}
    </div>
  );
}
