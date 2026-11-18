import {
  Zap,
  Clock,
  ArrowRight,
  Plus,
  LogOut,
  Languages,
  Check,
} from 'lucide-react';
import { Sun, Moon, Monitor, Workflow, User, Settings } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';
import { useLanguageStore } from '@/shared/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { UserAvatarChip } from '@/shared/components/common/UserAvatarChip';
import { Badge } from '@/shared/components/ui/badge';
import { useTheme } from '@/app/providers/theme-provider';
import { useAuth } from '@/shared/hooks/use-auth';
import { useEffect, useState } from 'react';
import { useAgenticChat } from '@/shared/stores/useAgenticChat';
import { useModeStore } from '@/shared/stores/useModeStore';
import {
  TooltipProvider,
} from '@/shared/components/ui/tooltip';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import soberanaLogo from '@/shared/assets/soberana_logos/SOBERANA By Loopay negro 1.png';
import soberanaLogoWhite from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import LoopayElementsLogoWhite from '@/shared/assets/loopay_logos/LoopayElements-LogoWhite.svg';
import { useElementsIntegrationStore } from '@/shared/stores/use-elements-integration-store';
import { useWorkflowComposerStore } from '@/shared/stores/use-workflow-composer-store';
import { isInternalProductSettingsEnabled } from '@/shared/lib/dev-config';
import { BrandingStudioSheet } from './BrandingStudioSheet';

type LanguageOption = {
  code: 'en' | 'es' | 'pt' | 'fr' | 'de' | 'it' | 'ja';
  label: string;
  flag: string;
};

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

interface AppTopbarProps {
  /**
   * Slot rendered at the start of the actions cluster (left of the
   * theme switcher). Used by the suite layout to mount module-level
   * actions from outside `shared/` without breaking the
   * unidirectional import rule (shared → modules is forbidden).
   * Pass `null` / undefined to render nothing.
   */
  rightSlot?: React.ReactNode;
}

export function AppTopbar({ rightSlot }: AppTopbarProps = {}) {
  const { t } = useLingui();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [, setIsMac] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [brandingSheetOpen, setBrandingSheetOpen] = useState(false);
  const { operations, setCurrentOperation, createOperation, open } = useAgenticChat();
  const { currentUserMode } = useModeStore();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  // Internal product shortcuts ship only under the dev server; in a prod
  // build they stay hidden even if the persisted store says `enabled`.
  const internalProductsEnabled = isInternalProductSettingsEnabled();
  const elementsEnabled = useElementsIntegrationStore((s) => s.enabled) && internalProductsEnabled;
  const workflowEnabled = useWorkflowComposerStore((s) => s.enabled) && internalProductsEnabled;

  // Check if we're in User Suite routes
  const isUserSuite =
    location.pathname.startsWith('/suite') && !location.pathname.startsWith('/suite-backoffice');

  const hasSuiteAccount = Boolean(user?.customer_profile_id);

  const handleLogout = async () => {
    try {
      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <header className="h-12 bg-header-background text-header-foreground flex items-center justify-between px-4 sticky top-0 z-50 backdrop-blur-sm shadow-sm shrink-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={() => navigate('/suite/dashboard')}
          className="shrink-0 focus:outline-none hover:opacity-80 transition-opacity cursor-pointer"
          aria-label="Ir al inicio"
        >
          <img src={soberanaLogo} alt="Soberana" className="w-auto dark:hidden" style={{height: '3.2vw', minHeight: '20px', maxHeight: '48px'}} />
          <img src={soberanaLogoWhite} alt="Soberana" className="w-auto hidden dark:block" style={{height: '3.2vw', minHeight: '20px', maxHeight: '48px'}} />
        </button>

        {currentUserMode === 'builder' && (
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative flex-1 max-w-md cursor-pointer">
                <Zap
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary icon-gradient pointer-events-none"
                  fill="currentColor"
                />
                <input
                  type="text"
                  placeholder="Routes Optimizer - Ver historial o iniciar nueva ruta..."
                  className="w-full h-8 pl-9 pr-3 bg-white/5 border border-primary/30 rounded-2xl text-sm text-header-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                  aria-label="Abrir Routes Optimizer"
                  readOnly
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-0 bg-popover border" align="start">
              <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-loopay-gradient flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Routes Optimizer</h3>
                    <p className="text-xs text-muted-foreground">
                      Encuentra las mejores rutas y ahorra en cada operación
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-loopay-gradient text-white hover:opacity-90"
                  onClick={() => {
                    createOperation('Nueva Optimización');
                    open();
                    setSearchOpen(false);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Optimización
                </Button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {operations.length > 0 ? (
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground font-semibold px-2 py-2">
                      HISTORIAL DE RUTAS ({operations.length})
                    </p>
                    <div className="space-y-1">
                      {operations.slice(0, 10).map((operation) => (
                        <button
                          key={operation.id}
                          onClick={() => {
                            setCurrentOperation(operation.id);
                            open();
                            setSearchOpen(false);
                          }}
                          className="w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <p className="text-sm font-medium truncate">{operation.title}</p>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                  {format(new Date(operation.timestamp), "d 'de' MMM, HH:mm", {
                                    locale: es,
                                  })}
                                </span>
                                {operation.messages.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{operation.messages.length} mensajes</span>
                                  </>
                                )}
                                {operation.steps.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      {
                                        operation.steps.filter((s) => s.status === 'completed')
                                          .length
                                      }
                                      /{operation.steps.length} pasos
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium mb-1">No hay rutas optimizadas aún</p>
                    <p className="text-xs text-muted-foreground">
                      Inicia tu primera optimización para comenzar
                    </p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Layout-supplied slot — used by `UserLayout` to mount the
            Loopay X RacingSwitch (a `suite-user` concern) without
            having `shared/` reach into `modules/`. The slot is
            wrapped in a margin-only flex item so the `gap-2` of
            the parent provides consistent breathing room with the
            rest of the actions cluster. */}
        {rightSlot && (
          <div className="mr-2 flex items-center">{rightSlot}</div>
        )}

        {/* Elements shortcut — visible when the integration is enabled */}
        {elementsEnabled && isUserSuite && (
          <div className="gradient-border gradient-border-animated-pulse rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-header-foreground hover:bg-white/10 rounded-lg"
              onClick={() => navigate('/elements')}
              aria-label="Loopay Elements"
            >
              <img
                src={LoopayElementsLogoWhite}
                alt="Elements"
                className="h-4 w-auto"
              />
            </Button>
          </div>
        )}

        {/* Workflow Composer shortcut — visible when enabled */}
        {workflowEnabled && isUserSuite && (
          <div className="gradient-border gradient-border-animated-pulse rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-header-foreground hover:bg-white/10 rounded-lg gap-1.5"
              onClick={() => navigate('/workflow')}
              aria-label="Workflow Composer"
            >
              <Workflow className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Workflow</span>
            </Button>
          </div>
        )}

        {/* Mode Switch: Operador / Builder */}
        {/* <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-white/5 transition-colors">
                <Label
                  htmlFor="mode-switch"
                  className="text-xs text-header-foreground/70 cursor-pointer select-none"
                >
                  Operador
                </Label>
                <Switch
                  id="mode-switch"
                  checked={currentUserMode === 'builder'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setUserMode('builder');
                      navigate('/suite/automations');
                    } else {
                      setUserMode('operator');
                      navigate('/suite/dashboard');
                    }
                  }}
                  className="scale-75"
                />
                <Label
                  htmlFor="mode-switch"
                  className="text-xs text-header-foreground/70 cursor-pointer select-none"
                >
                  Builder
                </Label>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-popover text-popover-foreground border">
              <p className="text-xs">
                {currentUserMode === 'builder'
                  ? 'Cambiar a Modo Operador'
                  : 'Cambiar a Modo Builder'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> */}

        <TooltipProvider delayDuration={300}><>
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-header-foreground hover:bg-white/10 h-8 px-2"
                onClick={() => {
                  const event = new KeyboardEvent('keydown', {
                    key: 'k',
                    metaKey: isMac,
                    ctrlKey: !isMac,
                    bubbles: true,
                  });
                  document.dispatchEvent(event);
                }}
                aria-label="Abrir paleta de comandos"
              >
                <Command className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">{isMac ? '⌘K' : 'Ctrl+K'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-popover text-popover-foreground border">
              <p className="text-xs">Paleta de comandos</p>
            </TooltipContent>
          </Tooltip> */}

          {/* Branding Studio Button - Only in User Suite */}
          {/* {isUserSuite && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setBrandingSheetOpen(true)}
                  className="text-header-foreground hover:bg-white/10 h-8 w-8"
                  aria-label="Customize Look & Feel"
                >
                  <Palette className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-popover text-popover-foreground border">
                <p className="text-xs">Customize Look & Feel</p>
              </TooltipContent>
            </Tooltip>
          )} */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-header-foreground hover:bg-white/10 h-8 w-8"
                aria-label={t`Tema`}
              >
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4" />
                ) : theme === 'light' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Monitor className="w-4 h-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" />
                <Trans>Sistema</Trans>
                {theme === 'system' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                <Trans>Claro</Trans>
                {theme === 'light' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                <Trans>Oscuro</Trans>
                {theme === 'dark' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-header-foreground hover:bg-white/10 h-8 w-8"
                aria-label="Ver notificaciones"
              >
                <Bell className="w-4 h-4 icon-gradient" />
                <span
                  className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"
                  aria-hidden="true"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-popover text-popover-foreground border">
              <p className="text-xs">Notificaciones (3)</p>
            </TooltipContent>
          </Tooltip> */}
        </></TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-header-foreground hover:bg-white/10 h-8 ml-1 px-2"
              aria-label="Menú de usuario"
            >
              <UserAvatarChip showName="auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-popover text-popover-foreground border z-50"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">{user?.company_name || user?.name || 'Usuario'}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email || ''}
                </span>
                <Badge variant="secondary" className="mt-1 w-fit text-[10px] h-4 px-1.5 capitalize">
                  {user?.staff_roles?.[0] || user?.roles?.[0] || 'Usuario'}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Staff who also own a suite account (same detection as useKYC /
                use-beneficiaries) get a way back to it. Staff-only users get no entry. */}
            {hasSuiteAccount && !isUserSuite && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate('/suite/dashboard')}
              >
                <User className="w-4 h-4 mr-2" />
                <Trans>Go to my account</Trans>
              </DropdownMenuItem>
            )}
            {isUserSuite && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate('/suite/settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                <Trans>Settings</Trans>
              </DropdownMenuItem>
            )}
            {(isUserSuite || hasSuiteAccount) && <DropdownMenuSeparator />}

            {/* Language Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <Languages className="w-4 h-4 mr-2" />
                <span>Idioma</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {LANGUAGES.find((l) => l.code === language)?.flag}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <span className="text-sm">{lang.label}</span>
                    </div>
                    {language === lang.code && <Check className="w-4 h-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              <Trans>Logout</Trans>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Branding Studio Sheet */}
      {isUserSuite && (
        <BrandingStudioSheet open={brandingSheetOpen} onOpenChange={setBrandingSheetOpen} />
      )}
    </header>
  );
}
