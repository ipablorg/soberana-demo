import { cn } from '@/shared/lib/utils';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

type Action = {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
};

interface ActionCardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  actions?: Action[];
  onAction?: (actionId: string) => void;
  className?: string;
}

export function ActionCard({ title, subtitle, children, actions, onAction, className }: ActionCardProps) {
  return (
    <Card
      className={cn(
        'bg-card/70 backdrop-blur border border-border/50 shadow-md',
        'rounded-xl p-5',
        className,
      )}
    >
      <div className="space-y-3">
        {title && (
          <div>
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        )}
        {children}
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {actions.map((a) => (
              <Button
                key={a.id}
                size="sm"
                onClick={() => onAction?.(a.id)}
                className={cn(
                  'rounded-lg',
                  a.variant === 'secondary' && 'bg-secondary text-secondary-foreground',
                  a.variant === 'ghost' && 'bg-transparent hover:bg-foreground/5',
                )}
              >
                {a.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default ActionCard;


