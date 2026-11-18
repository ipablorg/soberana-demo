import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/shared/components/ui/command';
import {
  ArrowLeftRight,
  Repeat,
  Smartphone,
  CreditCard,
  Settings,
  Shield,
  History,
  Puzzle,
  Zap,
  Plus,
  Lock,
  Home,
} from '@/shared/components/animated-icons';
import { useAgenticChat } from '@/shared/stores/useAgenticChat';
import { useLingui } from '@lingui/react/macro';

export function CommandPalette() {
  const { t } = useLingui();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { createOperation, open: openOptimizer, operations } = useAgenticChat();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t`Buscar acciones o navegar...`} />
      <CommandList>
        <CommandEmpty>{t`No encontramos coincidencias`}</CommandEmpty>

        <CommandGroup heading={t`Destacados`}>
          <CommandItem onSelect={() => runCommand(() => navigate('/suite/dashboard'))}>
            <Home className="mr-2 h-4 w-4" />
            <span>{t`Resumen — Vista principal`}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/suite/marketplace'))}>
            <Lock className="mr-2 h-4 w-4" />
            <span>{t`Vaults — Inversiones`}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/suite/account/card-pro'))}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>{t`Loopay Card PRO — Tarjeta vinculada a Vaults`}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t`Productos`}>
          <CommandItem onSelect={() => runCommand(() => navigate('/suite/move/collect'))}>
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            <span>{t`Move — Pagos y transferencias`}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/suite/change/fx'))}>
            <Repeat className="mr-2 h-4 w-4" />
            <span>{t`Change — Conversión FX`}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/suite/pos'))}>
            <Smartphone className="mr-2 h-4 w-4" />
            <span>{t`POS — Punto de venta`}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Routes Optimizer">
          <CommandItem
            onSelect={() => runCommand(() => {
              createOperation(t`Nueva Optimización`);
              openOptimizer();
            })}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>{t`Nueva Optimización de Ruta`}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => openOptimizer())}>
            <Zap className="mr-2 h-4 w-4" />
            <span>{t`Abrir Routes Optimizer`}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => openOptimizer())}>
            <History className="mr-2 h-4 w-4" />
            <span>{t`Ver Historial de Rutas`} ({operations.length})</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t`Gestión`}>
          <CommandItem onSelect={() => runCommand(() => navigate('/suite/policy'))}>
            <Shield className="mr-2 h-4 w-4" />
            <span>{t`Policy Center — Políticas`}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/suite/connectors'))}>
            <Puzzle className="mr-2 h-4 w-4" />
            <span>{t`Connectors Marketplace`}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/suite/analytics/run-history'))}>
            <History className="mr-2 h-4 w-4" />
            <span>{t`Run History — Historial`}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t`Configuración`}>
          <CommandItem onSelect={() => runCommand(() => navigate('/suite/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>{t`Configuración`}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/suite/management/developers'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Developers</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
