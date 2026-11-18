import { describe, expect, it } from 'vitest';

import { CustomersAddEndorsement } from '@/graphql/mutations/soberana/customers-add-endorsement.mutation';
import { getAddEndorsementActionLink } from '../use-endorsements';

describe('getAddEndorsementActionLink', () => {
  it('prefers the top-level kyc_link when present', () => {
    expect(
      getAddEndorsementActionLink({
        customers_addEndorsement: {
          kyc_link: 'https://bridge.test/kyc',
          tos_link: 'https://bridge.test/tos',
        },
      }),
    ).toEqual({
      type: 'kyc',
      url: 'https://bridge.test/kyc',
    });
  });

  it('falls back to the top-level tos_link when kyc_link is absent', () => {
    expect(
      getAddEndorsementActionLink({
        customers_addEndorsement: {
          kyc_link: null,
          tos_link: 'https://bridge.test/tos',
        },
      }),
    ).toEqual({
      type: 'tos',
      url: 'https://bridge.test/tos',
    });
  });

  it('returns null when the mutation returns no action links', () => {
    expect(
      getAddEndorsementActionLink({
        customers_addEndorsement: {
          kyc_link: null,
          tos_link: null,
        },
      }),
    ).toBeNull();
  });
});

describe('CustomersAddEndorsement mutation', () => {
  it('requests top-level kyc_link and tos_link from GraphQL', () => {
    const document = String(CustomersAddEndorsement);

    expect(document).toContain('customers_addEndorsement');
    expect(document).toContain('kyc_link');
    expect(document).toContain('tos_link');
  });
});
