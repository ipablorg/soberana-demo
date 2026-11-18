import { User } from '@/shared/components/animated-icons';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useMobile } from '@/shared/hooks/use-mobile';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { useLingui } from '@lingui/react/macro';
import { IntegrationsMarketplace } from '@/modules/suite-user/features/settings/components/integrations-marketplace';
import { MfaSettingsSection } from '@/modules/suite-user/features/settings/components/mfa-settings-section';
import { useAuthStore } from '@/shared/stores/auth-store';
import { isInternalProductSettingsEnabled } from '@/shared/lib/dev-config';

/**
 * SettingsView — embeddable settings surface for `SuiteShell`.
 *
 * Extracted body of the legacy `/suite/settings` page so the dock can
 * mount it inline without a route change. Owns the `max-w-7xl mx-auto`
 * container itself because the shell deliberately does NOT clamp
 * widths (different sections breathe at different scales:
 * Movimientos at `max-w-7xl`, Beneficiaries at `max-w-5xl`, Settings
 * at `max-w-7xl`).
 */
export function SettingsView() {
  const isMobile = useMobile();
  const { t } = useLingui();
  const user = useAuthStore((state) => state.user);

  // Internal product surfaces (Workflow Composer, Loopay Elements) ship only
  // under the dev server. In production the "Productos" tab and its
  // marketplace must not exist at all — collapse to the profile-only view.
  const showProducts = isInternalProductSettingsEnabled();

  const profileCard = (
    <Card variant="gradient-thin">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t`Información del usuario`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-semibold text-primary">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-border/60">
                      <span className="text-sm text-muted-foreground">{t`ID de usuario`}</span>
                      <span className="font-mono tabular-nums text-sm text-foreground">{user.id}</span>
                    </div>

                    {user.client_id && (
                      <div className="flex items-center justify-between py-3 border-b border-border/60">
                        <span className="text-sm text-muted-foreground">{t`ID de cliente`}</span>
                        <span className="font-mono tabular-nums text-sm text-foreground">{user.client_id}</span>
                      </div>
                    )}

                    {user.company_name && (
                      <div className="flex items-center justify-between py-3 border-b border-border/60">
                        <span className="text-sm text-muted-foreground">{t`Empresa`}</span>
                        <span className="text-sm text-foreground">{user.company_name}</span>
                      </div>
                    )}

                    {user.kyc_status && (
                      <div className="flex items-center justify-between py-3 border-b border-border/60">
                        <span className="text-sm text-muted-foreground">KYC</span>
                        <Badge
                          variant="outline"
                          className={
                            user.kyc_status === 'APPROVED'
                              ? 'bg-success/10 text-success'
                              : user.kyc_status === 'REJECTED'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-warning/10 text-warning'
                          }
                        >
                          {user.kyc_status}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-3 border-b border-border/60">
                      <span className="text-sm text-muted-foreground">{t`Roles`}</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {user.roles.map((role) => (
                          <Badge key={role} variant="outline" className="capitalize text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm text-muted-foreground">{t`Términos aceptados`}</span>
                      <Badge
                        variant="outline"
                        className={
                          user.has_accepted_latest_terms
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        }
                      >
                        {user.has_accepted_latest_terms ? t`Sí` : t`No`}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t`No se pudo cargar la información del usuario.`}</p>
              )}
            </CardContent>
          </Card>
  );

  return (
    <div className={isMobile ? 'p-4 space-y-4' : 'p-6 space-y-6 max-w-7xl mx-auto'}>
      {!isMobile && (
        <PageHeader
          title={t`Ajustes`}
          subtitle={showProducts ? t`Tu perfil, productos y seguridad.` : t`Tu perfil y seguridad.`}
        />
      )}

      {showProducts ? (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className={isMobile ? 'grid w-full grid-cols-2 gap-2 h-auto' : 'grid w-full grid-cols-2'}>
            <TabsTrigger value="profile" className={isMobile ? 'text-xs' : ''}>
              {t`Perfil`}
            </TabsTrigger>
            <TabsTrigger value="integrations" className={isMobile ? 'text-xs' : ''}>
              {t`Productos`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            {profileCard}
            <MfaSettingsSection />
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <IntegrationsMarketplace />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-6">
          {profileCard}
          <MfaSettingsSection />
        </div>
      )}
    </div>
  );
}
