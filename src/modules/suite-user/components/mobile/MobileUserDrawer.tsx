/**
 * MobileUserDrawer
 * 
 * Drawer with user profile, notifications, and account actions.
 * Opens from right side when avatar is tapped.
 * 
 * Following SRP: Only handles user menu drawer UI.
 */

import { useNavigate } from 'react-router-dom';
import { 
  User,
  Bell,
  Settings,
  LogOut,
  Shield,
  HelpCircle,
  X,
  ChevronRight
} from '@/shared/components/animated-icons';
import { Drawer, DrawerContent, DrawerHeader } from '@/shared/components/ui/drawer';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { useMobileStore } from '@/shared/stores/useMobileStore';
import { cn } from '@/shared/lib/utils';
import { Trans, useLingui } from '@lingui/react/macro';
import { useAuthStore } from '@/shared/stores/auth-store';

interface UserMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  variant?: 'default' | 'danger';
  badge?: number;
}

export function MobileUserDrawer() {
  const navigate = useNavigate();
  const authState = useAuthStore.getState();
  const { activeDrawer, closeDrawer } = useMobileStore();
  const { t } = useLingui();
  const isOpen = activeDrawer === 'user';

  const userInitials = authState?.user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  const handleLogout = () => {
    closeDrawer();
    // Clear session data
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  const menuItems: UserMenuItem[] = [
    //esto en el futuro debería funcionar, comentado mientras que es el sabado
    // {
    //   id: 'profile',
    //   label: 'Mi Perfil',
    //   icon: User,
    //   action: () => {
    //     closeDrawer();
    //     navigate('/suite/settings');
    //   },
    // },
    // {
    //   id: 'notifications',
    //   label: 'Notificaciones',
    //   icon: Bell,
    //   action: () => {
    //     closeDrawer();
    //     // TODO: Open notifications
    //   },
    //   badge: 3,
    // },
    // {
    //   id: 'security',
    //   label: 'Seguridad',
    //   icon: Shield,
    //   action: () => {
    //     closeDrawer();
    //     navigate('/suite/settings');
    //   },
    // },
    // {
    //   id: 'settings',
    //   label: 'Configuración',
    //   icon: Settings,
    //   action: () => {
    //     closeDrawer();
    //     navigate('/suite/settings');
    //   },
    // },
    // {
    //   id: 'help',
    //   label: 'Ayuda',
    //   icon: HelpCircle,
    //   action: () => {
    //     closeDrawer();
    //     // TODO: Open help
    //   },
    // },
    {
      id: 'logout',
      label: t`Cerrar Sesión`,
      icon: LogOut,
      action: handleLogout,
      variant: 'danger',
    },
  ];

  return (
    <Drawer open={isOpen} onOpenChange={closeDrawer} modal={false}>
      <DrawerContent side="right" className="w-[85vw] max-w-sm h-full">
        <DrawerHeader className="border-b border-border/40 shrink-0 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold"><Trans>Mi Cuenta</Trans></h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeDrawer}
              className="h-8 w-8 rounded-full shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Info Card */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/40 overflow-hidden">
            <Avatar className="h-14 w-14 border-2 border-primary/20 shrink-0">
              <AvatarFallback className="text-base font-bold bg-primary text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="font-semibold text-sm truncate block">
                {authState?.user?.name || 'Usuario'}
              </h3>
              <p className="text-xs text-muted-foreground truncate block">
                {authState?.user?.email || 'user@loopay.com'}
              </p>
              <Badge 
                variant="secondary" 
                className="text-[10px] px-2 py-0.5 h-5 capitalize inline-block"
              >
                {authState?.user?.roles[0] || 'user'}
              </Badge>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isDanger = item.variant === 'danger';
              
              return (
                <div key={item.id}>
                  {item.id === 'logout' && <Separator className="my-3" />}
                  
                  <button
                    onClick={item.action}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                      'active:scale-[0.98] transition-colors duration-150',
                      'focus:outline-none focus:ring-2 focus:ring-primary/50',
                      'group',
                      isDanger 
                        ? 'hover:bg-destructive/10' 
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <div className={cn(
                      'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                      isDanger 
                        ? 'bg-destructive/10 group-hover:bg-destructive/20' 
                        : 'bg-muted group-hover:bg-primary/10'
                    )}>
                      <Icon className={cn(
                        'w-5 h-5 transition-colors',
                        isDanger 
                          ? 'text-destructive' 
                          : 'text-muted-foreground group-hover:text-primary'
                      )} />
                    </div>

                    <span className={cn(
                      'flex-1 text-left font-medium text-sm',
                      isDanger && 'text-destructive'
                    )}>
                      {item.label}
                    </span>

                    {item.badge !== undefined && (
                      <Badge 
                        variant="default" 
                        className="rounded-full w-6 h-6 flex items-center justify-center p-0 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}

                    {!isDanger && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Organization Info */}
        {authState?.user && (
          <div className="p-4 border-t border-border/40">
            <div className="p-3 rounded-xl bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground">
                <Trans>Organization</Trans>
              </p>
              <p className="text-sm font-semibold mt-1">
                {/* TODO: Get from currentOrganization */}
                {authState.user?.company_name || authState.user?.company_user?.[0]?.company?.name || 'Loopay SAS'}
              </p>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

