import { Plus, Users, Building2, Wallet } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { mockCounterparties } from '@/shared/lib/mock-data';
import { useLingui } from '@lingui/react/macro';

export default function Counterparties() {
  const { t } = useLingui();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'client':
        return Users;
      case 'merchant':
        return Building2;
      case 'wallet':
        return Wallet;
      default:
        return Users;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      client: t`Cliente`,
      merchant: t`Comercio`,
      beneficiary: t`Beneficiario`,
      wallet: t`Wallet`,
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'client':
        return 'bg-primary/20 text-primary';
      case 'merchant':
        return 'bg-warning/20 text-warning';
      case 'beneficiary':
        return 'bg-warning/20 text-warning';
      case 'wallet':
        return 'bg-primary/20 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={t`Contrapartes`}
        subtitle={t`Beneficiarios, comercios y wallets.`}
        actions={
          <Button variant="gradient">
            <Plus className="w-4 h-4 mr-2" />
            {t`Agregar contraparte`}
          </Button>
        }
      />

      <div className="flex gap-2">
        <Input placeholder={t`Buscar por nombre, email o cuenta...`} className="max-w-md" />
        <Button variant="outline">{t`Filtrar`}</Button>
      </div>

      <div className="grid gap-4">
        {mockCounterparties.map((cp) => {
          const Icon = getTypeIcon(cp.type);
          return (
            <Card key={cp.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{cp.name}</h3>
                        <Badge variant="outline" className={getTypeColor(cp.type)}>
                          {getTypeLabel(cp.type)}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {cp.email && (
                          <p className="text-sm text-muted-foreground">{cp.email}</p>
                        )}
                        {cp.accountRef && (
                          <p className="text-sm text-muted-foreground font-mono">
                            {cp.accountRef}
                          </p>
                        )}
                        {cp.address && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {cp.network}
                            </Badge>
                            <p className="text-sm text-muted-foreground font-mono">
                              {cp.address.slice(0, 10)}...{cp.address.slice(-8)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      {t`Editar`}
                    </Button>
                    <Button variant="outline" size="sm">
                      {t`Historial`}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
