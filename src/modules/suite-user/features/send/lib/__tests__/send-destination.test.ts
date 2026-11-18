import { describe, expect, it } from 'vitest';

import { CATALOGUE_FIXTURE } from '@/modules/suite-user/features/beneficiaries/lib/__tests__/catalogue-fixture';

import {
  defaultDestination,
  partitionByReview,
  beneficiariesForRail,
  type SendDestinationBeneficiary,
} from '../send-destination';

const b = (over: Partial<SendDestinationBeneficiary>): SendDestinationBeneficiary => ({
  id: 'b',
  payment_rail: 'ach',
  country: 'USA',
  review_status: 'APPROVED',
  ...over,
});

describe('beneficiariesForRail', () => {
  it('keeps only the beneficiaries registered on the chosen rail', () => {
    const list = [b({ id: '1', payment_rail: 'ach' }), b({ id: '2', payment_rail: 'wire' }), b({ id: '3', payment_rail: 'co_ach', country: 'COL' })];
    expect(beneficiariesForRail(list, 'US', 'ach').map((x) => x.id)).toEqual(['1']);
    expect(beneficiariesForRail(list, 'CO', 'co_ach').map((x) => x.id)).toEqual(['3']);
  });

  it('reads the rail from rail.code when payment_rail is absent', () => {
    const list = [b({ id: '1', payment_rail: null, rail: { code: 'WIRE' } })];
    expect(beneficiariesForRail(list, 'US', 'wire')).toHaveLength(1);
  });

  it('does not mix two countries that share a rail code', () => {
    const list = [b({ id: '1', payment_rail: 'sepa', country: 'DEU' }), b({ id: '2', payment_rail: 'sepa', country: 'FRA' })];
    expect(beneficiariesForRail(list, 'DE', 'sepa').map((x) => x.id)).toEqual(['1']);
  });

  it('keeps a beneficiary with no country on the rail (legacy rows)', () => {
    expect(beneficiariesForRail([b({ country: null })], 'US', 'ach')).toHaveLength(1);
  });

  it('maps the legacy ach_wire rail onto both ach and wire', () => {
    const list = [b({ id: '1', payment_rail: 'ach_wire' })];
    expect(beneficiariesForRail(list, 'US', 'ach')).toHaveLength(1);
    expect(beneficiariesForRail(list, 'US', 'wire')).toHaveLength(1);
    expect(beneficiariesForRail(list, 'US', 'swift')).toHaveLength(0);
  });
});

describe('partitionByReview', () => {
  it('splits usable (APPROVED) from blocked (IN_REVIEW / REJECTED), keeping order', () => {
    const list = [
      b({ id: '1', review_status: 'IN_REVIEW' }),
      b({ id: '2', review_status: 'APPROVED' }),
      b({ id: '3', review_status: 'REJECTED' }),
      b({ id: '4', review_status: 'APPROVED' }),
    ];
    const { usable, blocked } = partitionByReview(list);
    expect(usable.map((x) => x.id)).toEqual(['2', '4']);
    expect(blocked.map((x) => x.id)).toEqual(['1', '3']);
  });
});

describe('defaultDestination', () => {
  it('preselects the first country and rail where the user already has a beneficiary', () => {
    const list = [b({ payment_rail: 'co_ach', country: 'COL' })];
    expect(defaultDestination(CATALOGUE_FIXTURE, list)).toEqual({ country: 'CO', railCode: 'co_ach' });
  });

  it('preselects only the country when it has several rails with beneficiaries', () => {
    const list = [b({ id: '1', payment_rail: 'ach' }), b({ id: '2', payment_rail: 'wire' })];
    expect(defaultDestination(CATALOGUE_FIXTURE, list)).toEqual({ country: 'US', railCode: '' });
  });

  it('returns nothing to preselect when no beneficiary matches the catalogue', () => {
    expect(defaultDestination(CATALOGUE_FIXTURE, [])).toEqual({ country: '', railCode: '' });
    expect(defaultDestination(null, [b({})])).toEqual({ country: '', railCode: '' });
  });
});
