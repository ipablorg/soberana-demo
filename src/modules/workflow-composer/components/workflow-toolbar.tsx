import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';
import { Save, Play, Trash2, List, Loader2, LayoutGrid } from '@/shared/components/animated-icons';
import LogoCompact from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import LogoWide    from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';

interface WorkflowToolbarProps {
  flowName: string;
  isDirty: boolean;
  isRunning: boolean;
  onNameChange(name: string): void;
  onSave(): void;
  onRun(): void;
  onClear(): void;
  onShowLogs(): void;
}

export function WorkflowToolbar({
  flowName,
  isDirty,
  isRunning,
  onNameChange,
  onSave,
  onRun,
  onClear,
  onShowLogs,
}: WorkflowToolbarProps) {
  const { t } = useLingui();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="h-12 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-3 px-4 flex-shrink-0">
      {/* Loopay logo + product name — click navigates back to Soberana */}
      <button
        className="flex items-center gap-2 shrink-0 hover:opacity-70 transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1"
        onClick={() => navigate('/suite/dashboard')}
        aria-label={t`Volver a Soberana`}
      >
        <img src={LogoCompact} alt="Soberana" className="h-4 w-auto dark:hidden" />
        <img src={LogoWide}    alt="Soberana" className="h-4 w-auto hidden dark:block" />
        <span className="text-xs font-semibold text-muted-foreground tracking-wide hidden sm:inline">
          Workflow Composer
        </span>
      </button>

      <div className="w-px h-4 bg-border/50 shrink-0" />

      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
        onClick={() => navigate('/workflow/flows')}
        aria-label={t`Mis flujos`}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </Button>

      <div className="w-px h-4 bg-border shrink-0" />

      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <Input
          ref={inputRef}
          value={flowName}
          onChange={(e) => onNameChange(e.target.value)}
          className="h-7 border-transparent bg-transparent hover:border-border focus:border-border text-sm font-medium max-w-xs transition-colors duration-150 px-2"
          aria-label={t`Nombre del flujo`}
        />
        {isDirty && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0"
            title={t`Cambios sin guardar`}
            aria-label={t`Cambios sin guardar`}
          />
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2.5 gap-1.5 text-xs"
          onClick={onSave}
          disabled={isRunning}
        >
          <Save className="h-3.5 w-3.5" />
          <Trans>Guardar</Trans>
        </Button>

        <Button
          variant={isRunning ? 'ghost' : 'gradient'}
          size="sm"
          className={cn('h-7 px-3 gap-1.5 text-xs', isRunning && 'cursor-not-allowed')}
          onClick={onRun}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <Trans>Ejecutando</Trans>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              <Trans>Ejecutar</Trans>
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={onClear}
          disabled={isRunning}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <Trans>Limpiar</Trans>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={onShowLogs}
        >
          <List className="h-3.5 w-3.5" />
          <Trans>Logs</Trans>
        </Button>
      </div>
    </div>
  );
}
