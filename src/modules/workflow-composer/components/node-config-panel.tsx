import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { useNodeDefinitions } from './node-palette';
import type { WorkflowNode } from '../types/workflow.types';

interface NodeConfigPanelProps {
  node: WorkflowNode | null;
  onConfigChange(id: string, key: string, value: string | number | boolean): void;
}

export function NodeConfigPanel({ node, onConfigChange }: NodeConfigPanelProps) {
  const { t } = useLingui();
  const definitions = useNodeDefinitions();

  if (!node) {
    return (
      <div className="w-72 border-l border-border bg-card/50 backdrop-blur-sm flex-shrink-0 flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-sm text-muted-foreground">
            <Trans>Selecciona un nodo para configurarlo</Trans>
          </p>
        </div>
      </div>
    );
  }

  const def = definitions.find((d) => d.type === node.data.nodeType);

  return (
    <div className="w-72 border-l border-border bg-card/50 backdrop-blur-sm flex-shrink-0 overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground leading-tight">{node.data.label}</h3>
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {node.data.category}
            </Badge>
          </div>
          {def && (
            <p className="text-xs text-muted-foreground">{def.descriptionKey}</p>
          )}
        </div>

        {def && def.fields.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Trans>Configuración</Trans>
            </p>
            {def.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">{field.label}</label>
                {field.type === 'select' && field.options ? (
                  <Select
                    value={String(node.data.config[field.key] ?? field.options[0])}
                    onValueChange={(val) => onConfigChange(node.id, field.key, val)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt} value={opt} className="text-xs">
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    className="h-8 text-xs"
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={String(node.data.config[field.key] ?? '')}
                    placeholder={field.placeholder}
                    onChange={(e) =>
                      onConfigChange(
                        node.id,
                        field.key,
                        field.type === 'number' ? Number(e.target.value) : e.target.value,
                      )
                    }
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-border/60">
          <Button variant="outline" size="sm" className="w-full text-xs" disabled>
            <Trans>Test (v2)</Trans>
          </Button>
        </div>

        {node.data.executionOutput !== undefined && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Trans>Output</Trans>
            </p>
            <pre className="text-[10px] text-muted-foreground bg-muted rounded-md p-2 overflow-auto max-h-32 font-mono">
              {JSON.stringify(node.data.executionOutput, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-[10px] text-muted-foreground font-mono">
          <span className="text-muted-foreground/60">{t`ID`}:</span> {node.id}
        </div>
      </div>
    </div>
  );
}
