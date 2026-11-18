import { useLingui } from '@lingui/react/macro';
import { PageHeader } from '@/shared/components/common/PageHeader';

export default function MarketplaceVaults() {
  const { t } = useLingui();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t`Vaults`}
        subtitle={t`En desarrollo.`}
      />
    </div>
  );
}
