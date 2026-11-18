/**
 * COMEX Dashboard
 * 
 * Main landing page for COMEX (Foreign Trade) operations.
 */

import { Plus, TrendingUp, FileText, Clock } from '@/shared/components/animated-icons';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Trans, useLingui } from '@lingui/react/macro';
import { PageHeader } from '@/shared/components/common/PageHeader';

export default function ComexDashboard() {
    const navigate = useNavigate();
    const { t } = useLingui();

    return (
        <div className="container max-w-6xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <PageHeader 
                    title="COMEX"
                    subtitle={t`Tus operaciones de comercio exterior.`}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 border border-border cursor-pointer transition-colors duration-150">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-3">
                            <Plus className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-heading text-lg text-foreground"><Trans>Nueva Operación</Trans></h3>
                            <p className="text-sm text-muted-foreground"><Trans>Pago internacional</Trans></p>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate('/suite/treasury/comex/new')}
                        variant="gradient"
                        className="w-full mt-4"
                        size="lg"
                    >
                        <Trans>Comenzar</Trans>
                    </Button>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-success/10 p-3">
                            <TrendingUp className="w-6 h-6 text-success" />
                        </div>
                        <div>
                            <h3 className="font-heading text-lg text-foreground"><Trans>Operaciones Activas</Trans></h3>
                            <p className="text-2xl font-mono tabular-nums text-primary">12</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-warning/10 p-3">
                            <Clock className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                            <h3 className="font-heading text-lg text-foreground"><Trans>Pendientes</Trans></h3>
                            <p className="text-2xl font-mono tabular-nums text-warning">3</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Operations */}
            <div>
                <h2 className="text-2xl font-heading text-foreground mb-4"><Trans>Operaciones Recientes</Trans></h2>
                <Card className="p-6">
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground"><Trans>Aún no tienes operaciones. Aparecerán aquí cuando crees la primera.</Trans></p>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/suite/treasury/comex/new')}
                            className="mt-4"
                        >
                            <Trans>Crear Primera Operación</Trans>
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
