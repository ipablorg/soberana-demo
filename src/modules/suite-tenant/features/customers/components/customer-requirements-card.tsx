import { Trans } from '@lingui/react/macro';

import type { TenantRequirement, TenantRequirementAnswer } from '@/graphql/types/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { StatusBadge } from '@/modules/suite-tenant/components/atoms/status-badge';
import { RequirementAnswerForm } from '@/modules/suite-tenant/features/customers/components/requirement-answer-form';
import { isRequirementOpen } from '@/modules/suite-tenant/features/customers/lib/requirement-answer';
import { formatDateTime, humanizeCode } from '@/modules/suite-tenant/lib/tenant-format';

interface CustomerRequirementsCardProps {
  requirements: readonly TenantRequirement[] | undefined;
  isLoading: boolean;
  pendingId: string | null;
  onSubmit: (requirement: TenantRequirement, answer: TenantRequirementAnswer) => void;
}

/** What the providers ask of the customer; open ones take an answer inline. */
export function CustomerRequirementsCard({
  requirements,
  isLoading,
  pendingId,
  onSubmit,
}: CustomerRequirementsCardProps) {
  return (
    <Card className="rounded-xl shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">
          <Trans>Requirements</Trans>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            <Trans>Loading requirements…</Trans>
          </p>
        ) : !requirements || requirements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            <Trans>Nothing pending. Providers have everything they need.</Trans>
          </p>
        ) : (
          <ul className="space-y-4" data-testid="customer-requirements">
            {requirements.map((requirement) => (
              <li key={requirement.id} className="space-y-3 rounded-xl bg-muted/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="break-all font-mono text-sm text-foreground">{requirement.key}</p>
                    <p className="text-xs text-muted-foreground">
                      {[requirement.provider, requirement.rail_code, humanizeCode(requirement.kind)]
                        .filter(Boolean)
                        .join(' · ')}
                      {requirement.due_at ? (
                        <>
                          {' · '}
                          <Trans>Due {formatDateTime(requirement.due_at)}</Trans>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <StatusBadge status={requirement.status} />
                </div>
                {requirement.reject_reason ? (
                  <p className="text-xs text-destructive">
                    <Trans>Rejected: {requirement.reject_reason}</Trans>
                  </p>
                ) : null}
                {isRequirementOpen(requirement) ? (
                  <RequirementAnswerForm
                    requirement={requirement}
                    pending={pendingId === requirement.id}
                    onSubmit={(answer) => onSubmit(requirement, answer)}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
