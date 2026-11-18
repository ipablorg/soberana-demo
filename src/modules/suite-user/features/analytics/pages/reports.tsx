import { FileText, Download } from '@/shared/components/animated-icons';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { useLingui } from '@lingui/react/macro';

export default function Reports() {
  const { t } = useLingui();

  const reportNames = [
    t`Volumen por rail`,
    t`Costos y comisiones`,
    t`Conciliación`,
    t`Estado de cuenta`,
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={t`Reportes`}
        subtitle={t`Volúmenes, costos y conciliación.`}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {reportNames.map((report) => (
          <Card key={report}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-semibold">{report}</span>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t`Descargar CSV`}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
