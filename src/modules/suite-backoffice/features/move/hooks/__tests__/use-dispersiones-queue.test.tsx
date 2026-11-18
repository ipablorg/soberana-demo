/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import {
  useApproveDispersion,
  useCancelDispersion,
  useCompleteDispersion,
  useFailDispersion,
  useRejectWithdrawal,
  useRetryDispersionFunding,
  useRetryDispersionReturn,
} from '../use-dispersiones-queue';

const optionsSeen: Array<{
  conflictMessage?: string;
  invalidate: unknown;
  describeError?: (error: unknown) => string | undefined;
}> = [];

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('../../../ops-review/hooks/use-ops-mutation', () => ({
  useOpsMutation: (_document: unknown, options: (typeof optionsSeen)[number]) => {
    optionsSeen.push(options);
    return { mutate: vi.fn(), isPending: false };
  },
}));

let page: MountedPage;

function Probe() {
  useCompleteDispersion();
  useFailDispersion();
  useCancelDispersion();
  return null;
}

afterEach(() => {
  page?.unmount();
  optionsSeen.length = 0;
});

describe('dispersion manual actions while a provider payout is in flight', () => {
  it('map the back 409 to a clear message and refetch the queue', () => {
    page = mountPage(<Probe />);

    expect(optionsSeen).toHaveLength(3);

    for (const options of optionsSeen) {
      expect(options.conflictMessage).toContain('pago en curso');
      expect(options.conflictMessage).toContain('El proveedor');
      expect(options.invalidate).toHaveLength(1);
    }
  });
});

function graphQLError(extensions: Record<string, unknown>) {
  return Object.assign(new Error('GraphQL error'), {
    response: { errors: [{ message: 'refused', extensions }] },
  });
}

describe('approval-flow decisions (#413)', () => {
  const onFailure = vi.fn();

  function DecisionProbe() {
    useApproveDispersion(undefined, onFailure);
    useRejectWithdrawal(undefined, onFailure);
    useRetryDispersionFunding(onFailure);
    useRetryDispersionReturn(onFailure);
    return null;
  }

  afterEach(() => onFailure.mockClear());

  it('explain a missing second factor and hand it to the queue', () => {
    page = mountPage(<DecisionProbe />);

    expect(optionsSeen).toHaveLength(4);
    for (const options of optionsSeen) {
      const text = options.describeError?.(
        graphQLError({ code: 'FORBIDDEN', error_code: 'MFA_REQUIRED' })
      );
      expect(text).toContain('verificación en dos pasos');
      expect(options.invalidate).toHaveLength(1);
    }
    expect(onFailure).toHaveBeenCalledTimes(4);
    expect(onFailure).toHaveBeenCalledWith('mfa-required');
  });

  it('explain a conflict and leave any other failure to the generic message', () => {
    page = mountPage(<DecisionProbe />);

    const [approve] = optionsSeen;

    expect(approve.describeError?.(graphQLError({ code: 'CONFLICT' }))).toContain(
      'cambió de estado'
    );
    expect(onFailure).toHaveBeenLastCalledWith('conflict');
    expect(approve.describeError?.(new Error('network'))).toBeUndefined();
  });
});
