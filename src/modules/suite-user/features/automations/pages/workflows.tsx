import { useLingui } from '@lingui/react/macro';
import { PageHeader } from '@/shared/components/common/PageHeader';

export default function AutomationsWorkflows() {
  const { t } = useLingui();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t`Workflows`}
        subtitle={t`En desarrollo.`}
      />
    </div>
  );
}
