import { beforeEach, describe, expect, it, vi } from 'vitest';

const useOpsMutation = vi.fn((_doc: unknown, options: unknown) => options);
const useGraphQLQuery = vi.fn((...args: unknown[]) => args);

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));
vi.mock('../../../ops-review/hooks/use-ops-mutation', () => ({
  useOpsMutation: (doc: unknown, options: unknown) => useOpsMutation(doc, options),
}));
vi.mock('@/shared/hooks/use-graphql-query', () => ({
  useGraphQLQuery: (key: unknown, doc: unknown, vars: unknown, opts: unknown) =>
    useGraphQLQuery(key, doc, vars, opts),
}));

import {
  CreateFeeScheduleDocument,
  LinkClientProviderManuallyDocument,
} from '@/graphql/mutations/admin-commercial';
import { ListFeeLedgerDocument } from '@/graphql/queries/admin-commercial';

import {
  useCreateFeeSchedule,
  useFeeLedger,
  useLinkProviderManually,
  useRetryProviderOnboarding,
} from '../use-commercial';
import { commercialQueryKeys } from '../../lib/commercial-logic';

describe('commercial hooks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('scopes the ledger query key to the client and passes the filters', () => {
    const variables = { clientId: 'c1', from: null, to: null, operation: 'P2P' as const };
    useFeeLedger(variables);
    expect(useGraphQLQuery).toHaveBeenCalledWith(
      [...commercialQueryKeys.ledger('c1')],
      ListFeeLedgerDocument,
      variables,
      { enabled: true }
    );
  });

  it('does not fire queries without a client id', () => {
    useFeeLedger({ clientId: '' });
    expect(useGraphQLQuery.mock.calls[0]?.[3]).toEqual({ enabled: false });
  });

  it('refreshes the onboarding list after a manual link and explains a conflict', () => {
    useLinkProviderManually('c1');
    const [doc, options] = useOpsMutation.mock.calls[0] as [
      unknown,
      { invalidate: unknown[]; conflictMessage?: string },
    ];
    expect(doc).toBe(LinkClientProviderManuallyDocument);
    expect(options.invalidate).toEqual([
      commercialQueryKeys.onboarding('c1'),
      commercialQueryKeys.setup('c1'),
    ]);
    expect(options.conflictMessage).toBeTruthy();
  });

  it('refreshes the onboarding list after a retry', () => {
    useRetryProviderOnboarding('c1');
    const options = useOpsMutation.mock.calls[0]?.[1] as { invalidate: unknown[] };
    expect(options.invalidate).toEqual([
      commercialQueryKeys.onboarding('c1'),
      commercialQueryKeys.setup('c1'),
    ]);
  });

  it('refreshes the schedules after creating one and forwards onCompleted', () => {
    const onCompleted = vi.fn();
    useCreateFeeSchedule('c1', onCompleted);
    const [doc, options] = useOpsMutation.mock.calls[0] as [
      unknown,
      { invalidate: unknown[]; onCompleted: unknown },
    ];
    expect(doc).toBe(CreateFeeScheduleDocument);
    expect(options.invalidate).toEqual([
      commercialQueryKeys.schedules('c1'),
      commercialQueryKeys.setup('c1'),
    ]);
    expect(options.onCompleted).toBe(onCompleted);
  });

  it('reports a FAILED retry result as a failure instead of "finished"', () => {
    useRetryProviderOnboarding('c1');
    const options = useOpsMutation.mock.calls[0]?.[1] as {
      failureOf: (r: unknown) => string | undefined;
    };
    const failed = {
      adminLoopay_retryClientProviderOnboarding: {
        provider: 'mesta',
        status: 'FAILED',
        errorCode: 'PROVIDER_TIMEOUT',
        errorMessage: 'timeout',
      },
    };
    expect(options.failureOf(failed)).toContain('timeout');
    expect(
      options.failureOf({
        adminLoopay_retryClientProviderOnboarding: {
          ...failed.adminLoopay_retryClientProviderOnboarding,
          status: 'LINKED',
        },
      })
    ).toBeUndefined();
  });
});
