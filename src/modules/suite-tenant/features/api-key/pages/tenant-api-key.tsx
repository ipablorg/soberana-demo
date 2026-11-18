import { useRef, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ApiKeySecretReveal } from '@/modules/suite-tenant/features/api-key/components/api-key-secret-reveal';
import { RotateApiKeyForm } from '@/modules/suite-tenant/features/api-key/components/rotate-api-key-form';
import { useRotateApiKey } from '@/modules/suite-tenant/features/api-key/hooks/use-rotate-api-key';
import { toRotationVariables } from '@/modules/suite-tenant/features/api-key/lib/rotation-form';
import { KeyValueList } from '@/modules/suite-tenant/components/molecules/key-value-list';
import {
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';
import { useTenantMe } from '@/modules/suite-tenant/hooks/use-tenant-me';
import { formatDateTime } from '@/modules/suite-tenant/lib/tenant-format';

interface Revealed {
  secret: string;
  graceMinutes: number;
}

/**
 * Container: current key metadata (never the secret) and the rotation. The new
 * secret lives only in memory (this component's state and the mutation result)
 * until "I saved it" clears both; it is never persisted, and no query can
 * fetch it again.
 */
export default function TenantApiKey() {
  const { t } = useLingui();
  const me = useTenantMe();
  const [revealed, setRevealed] = useState<Revealed | null>(null);
  const graceRef = useRef(0);
  const rotate = useRotateApiKey((result) =>
    setRevealed({ secret: result.tenant_regenerateApiKey.api_key, graceMinutes: graceRef.current })
  );

  if (me.isLoading) return <TenantPageSkeleton />;
  if (me.error || !me.data)
    return <QueryError error={me.error} onRetry={() => void me.refetch()} />;

  const tenant = me.data.tenant_me;

  return (
    <div className="space-y-6">
      <SectionHeader title={t`API key.`} subtitle={t`Your integration's way in.`} />

      <Card className="rounded-xl shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">
            <Trans>Current key</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <KeyValueList
            items={[
              { label: t`Prefix`, value: tenant.api_key_prefix, mono: true },
              { label: t`Rotated at`, value: formatDateTime(tenant.api_key_rotated_at) },
              {
                label: t`Expires at`,
                value: tenant.api_key_expires_at
                  ? formatDateTime(tenant.api_key_expires_at)
                  : t`Never`,
              },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">
            <Trans>Rotate</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {revealed ? (
            <ApiKeySecretReveal
              secret={revealed.secret}
              graceMinutes={revealed.graceMinutes}
              onDone={() => {
                setRevealed(null);
                // Drop the mutation result too, so the secret is gone from memory.
                rotate.reset();
              }}
            />
          ) : (
            <RotateApiKeyForm
              pending={rotate.isPending}
              onRotate={(values) => {
                const variables = toRotationVariables(values);
                graceRef.current = variables.graceMinutes ?? 0;
                rotate.mutate(variables);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
