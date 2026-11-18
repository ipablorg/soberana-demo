import { Trans } from '@lingui/react/macro';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Zap, DollarSign } from '@/shared/components/animated-icons';
import type { RailGroup } from '../../types';

interface RailSelectorProps {
  railGroups: RailGroup[];
  enabledRails: string[];
  onChange: (ids: string[]) => void;
}

export function RailSelector({ railGroups, enabledRails, onChange }: RailSelectorProps) {
  const toggle = (id: string) => {
    const next = enabledRails.includes(id)
      ? enabledRails.filter(r => r !== id)
      : [...enabledRails, id];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-5">
      {railGroups.map((group, gi) => (
        <div key={group.category}>
          {gi > 0 && <Separator className="mb-5" />}
          <div className="flex items-center gap-2 mb-3">
            {group.category === 'crypto'
              ? <Zap className="h-4 w-4 text-muted-foreground" />
              : <DollarSign className="h-4 w-4 text-muted-foreground" />
            }
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {group.label}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {group.rails.map(rail => {
              const enabled = enabledRails.includes(rail.id);
              return (
                <div
                  key={rail.id}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-colors duration-150 ${
                    enabled ? 'border-border bg-card' : 'border-border/50 bg-muted/20 opacity-60'
                  }`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{rail.label}</span>
                      {rail.recommended && (
                        <Badge variant="success" className="text-xs">
                          <Trans>Recomendado</Trans>
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{rail.description}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="font-mono text-xs">{rail.fee}</Badge>
                      <Badge variant="outline" className="text-xs">{rail.estimatedTime}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {rail.countries.slice(0, 4).join(', ')}
                        {rail.countries.length > 4 && ` +${rail.countries.length - 4}`}
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={() => toggle(rail.id)}
                    className="ml-3 shrink-0"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {enabledRails.length === 0 && (
        <p className="text-xs text-destructive text-center py-2">
          <Trans>Debes habilitar al menos un riel de pago</Trans>
        </p>
      )}
    </div>
  );
}
