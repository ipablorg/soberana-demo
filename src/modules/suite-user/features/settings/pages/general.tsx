import { useLingui } from '@lingui/react/macro';
import { PageHeader } from '@/shared/components/common/PageHeader';

export default function SettingsGeneral() {
  const { t } = useLingui();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t`Configuración`}
        subtitle={t`En desarrollo.`}
      />
    </div>
  );
}
